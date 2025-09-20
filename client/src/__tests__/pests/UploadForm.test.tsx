import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UploadForm from '../../components/pests/UploadForm';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

describe('UploadForm', () => {
  const mockOnUpload = jest.fn();

  beforeEach(() => {
    mockOnUpload.mockClear();
  });

  it('renders upload form correctly', () => {
    render(<UploadForm onUpload={mockOnUpload} />);
    
    expect(screen.getByText('Upload Pest Image')).toBeInTheDocument();
    expect(screen.getByText('Upload an image of a pest or disease for AI-powered detection and analysis.')).toBeInTheDocument();
    expect(screen.getByText('Drop your image here')).toBeInTheDocument();
    expect(screen.getByText('Choose File')).toBeInTheDocument();
  });

  it('shows file input when file is selected', async () => {
    render(<UploadForm onUpload={mockOnUpload} />);
    
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const input = screen.getByRole('button', { name: /choose file/i });
    
    // Simulate file selection
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });
    
    fireEvent.change(input);
    
    await waitFor(() => {
      expect(screen.getByText('test.png')).toBeInTheDocument();
    });
  });

  it('validates file type', async () => {
    render(<UploadForm onUpload={mockOnUpload} />);
    
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByRole('button', { name: /choose file/i });
    
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });
    
    fireEvent.change(input);
    
    await waitFor(() => {
      expect(screen.getByText('Please select a valid image file (JPG or PNG)')).toBeInTheDocument();
    });
  });

  it('validates file size', async () => {
    render(<UploadForm onUpload={mockOnUpload} />);
    
    // Create a large file (11MB)
    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.png', { type: 'image/png' });
    const input = screen.getByRole('button', { name: /choose file/i });
    
    Object.defineProperty(input, 'files', {
      value: [largeFile],
      writable: false,
    });
    
    fireEvent.change(input);
    
    await waitFor(() => {
      expect(screen.getByText('File size must be less than 10MB')).toBeInTheDocument();
    });
  });

  it('calls onUpload when form is submitted', async () => {
    render(<UploadForm onUpload={mockOnUpload} />);
    
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const input = screen.getByRole('button', { name: /choose file/i });
    
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });
    
    fireEvent.change(input);
    
    await waitFor(() => {
      expect(screen.getByText('test.png')).toBeInTheDocument();
    });
    
    const submitButton = screen.getByRole('button', { name: /analyze pest/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnUpload).toHaveBeenCalledWith(file, '');
    });
  });

  it('shows loading state when uploading', () => {
    render(<UploadForm onUpload={mockOnUpload} isUploading={true} />);
    
    expect(screen.getByText('Analyzing Image...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /analyzing image/i })).toBeDisabled();
  });

  it('allows adding notes', () => {
    render(<UploadForm onUpload={mockOnUpload} />);
    
    const notesInput = screen.getByPlaceholderText(/describe the location/i);
    fireEvent.change(notesInput, { target: { value: 'Test notes' } });
    
    expect(notesInput).toHaveValue('Test notes');
  });
});
