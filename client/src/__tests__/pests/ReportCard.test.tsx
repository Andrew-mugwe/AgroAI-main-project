import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReportCard, { PestReport } from '../../components/pests/ReportCard';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
}));

const mockReport: PestReport = {
  id: 1,
  user_id: '11111111-1111-1111-1111-111111111111',
  image_url: 'assets/seeds/fall_armyworm.png',
  pest_name: 'Fall Armyworm',
  confidence: 87.5,
  notes: 'Detected on maize leaves in the northern field. Heavy infestation observed.',
  created_at: '2024-01-15T10:30:00Z',
  severity: 'high',
  recommended_action: 'Apply Bacillus thuringiensis (Bt) spray immediately.'
};

describe('ReportCard', () => {
  it('renders report card correctly', () => {
    render(<ReportCard report={mockReport} />);
    
    expect(screen.getByText('Fall Armyworm')).toBeInTheDocument();
    expect(screen.getByText('87.5%')).toBeInTheDocument();
    expect(screen.getByText('Detected on maize leaves in the northern field. Heavy infestation observed.')).toBeInTheDocument();
    expect(screen.getByText('HIGH')).toBeInTheDocument();
    expect(screen.getByText('Recommended Action:')).toBeInTheDocument();
  });

  it('displays confidence score with correct color', () => {
    render(<ReportCard report={mockReport} />);
    
    const confidenceBadge = screen.getByText('87.5%');
    expect(confidenceBadge).toBeInTheDocument();
    expect(confidenceBadge.closest('div')).toHaveClass('text-yellow-600', 'bg-yellow-100');
  });

  it('displays severity badge', () => {
    render(<ReportCard report={mockReport} />);
    
    expect(screen.getByText('HIGH')).toBeInTheDocument();
  });

  it('shows recommended action when provided', () => {
    render(<ReportCard report={mockReport} />);
    
    expect(screen.getByText('Apply Bacillus thuringiensis (Bt) spray immediately.')).toBeInTheDocument();
  });

  it('calls onView when view button is clicked', () => {
    const mockOnView = jest.fn();
    render(<ReportCard report={mockReport} onView={mockOnView} />);
    
    const viewButton = screen.getByText('View Details');
    fireEvent.click(viewButton);
    
    expect(mockOnView).toHaveBeenCalledWith(mockReport);
  });

  it('calls onDelete when delete button is clicked', () => {
    const mockOnDelete = jest.fn();
    render(<ReportCard report={mockReport} onDelete={mockOnDelete} />);
    
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);
    
    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });

  it('hides actions when showActions is false', () => {
    render(<ReportCard report={mockReport} showActions={false} />);
    
    expect(screen.queryByText('View Details')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('displays correct confidence icon for high confidence', () => {
    render(<ReportCard report={mockReport} />);
    
    // High confidence should show CheckCircle icon
    const confidenceBadge = screen.getByText('87.5%').closest('div');
    expect(confidenceBadge).toHaveClass('text-yellow-600');
  });

  it('formats date correctly', () => {
    render(<ReportCard report={mockReport} />);
    
    // The date should be formatted and displayed
    expect(screen.getByText(/Jan 15, 2024/)).toBeInTheDocument();
  });

  it('handles missing image gracefully', () => {
    const reportWithoutImage = { ...mockReport, image_url: '' };
    render(<ReportCard report={reportWithoutImage} />);
    
    expect(screen.getByText('Pest Image')).toBeInTheDocument();
  });

  it('handles missing severity gracefully', () => {
    const reportWithoutSeverity = { ...mockReport, severity: undefined };
    render(<ReportCard report={reportWithoutSeverity} />);
    
    // Should not show severity badge
    expect(screen.queryByText('HIGH')).not.toBeInTheDocument();
  });
});
