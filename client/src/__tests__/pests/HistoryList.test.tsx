import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import HistoryList from '../../components/pests/HistoryList';
import { PestReport } from '../../components/pests/ReportCard';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

const mockReports: PestReport[] = [
  {
    id: 1,
    user_id: '11111111-1111-1111-1111-111111111111',
    image_url: 'assets/seeds/fall_armyworm.png',
    pest_name: 'Fall Armyworm',
    confidence: 87.5,
    notes: 'Detected on maize leaves',
    created_at: '2024-01-15T10:30:00Z',
    severity: 'high',
    recommended_action: 'Apply Bt spray'
  },
  {
    id: 2,
    user_id: '11111111-1111-1111-1111-111111111111',
    image_url: 'assets/seeds/leaf_rust.png',
    pest_name: 'Leaf Rust',
    confidence: 92.3,
    notes: 'Found in wheat regions',
    created_at: '2024-01-14T10:30:00Z',
    severity: 'medium',
    recommended_action: 'Apply fungicide'
  },
  {
    id: 3,
    user_id: '11111111-1111-1111-1111-111111111111',
    image_url: 'assets/seeds/aphids.png',
    pest_name: 'Aphids',
    confidence: 75.8,
    notes: 'Common in vegetables',
    created_at: '2024-01-13T10:30:00Z',
    severity: 'low',
    recommended_action: 'Introduce beneficial insects'
  }
];

describe('HistoryList', () => {
  it('renders history list correctly', () => {
    render(<HistoryList reports={mockReports} />);
    
    expect(screen.getByText('Detection History')).toBeInTheDocument();
    expect(screen.getByText('3 of 3 reports')).toBeInTheDocument();
    expect(screen.getByText('Fall Armyworm')).toBeInTheDocument();
    expect(screen.getByText('Leaf Rust')).toBeInTheDocument();
    expect(screen.getByText('Aphids')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<HistoryList reports={[]} loading={true} />);
    
    expect(screen.getByText('Detection History')).toBeInTheDocument();
    // Should show loading skeleton
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('displays empty state when no reports', () => {
    render(<HistoryList reports={[]} />);
    
    expect(screen.getByText('No reports found')).toBeInTheDocument();
    expect(screen.getByText('Upload your first pest image to get started')).toBeInTheDocument();
  });

  it('filters reports by search query', async () => {
    render(<HistoryList reports={mockReports} />);
    
    const searchInput = screen.getByPlaceholderText('Search reports...');
    fireEvent.change(searchInput, { target: { value: 'armyworm' } });
    
    await waitFor(() => {
      expect(screen.getByText('Fall Armyworm')).toBeInTheDocument();
      expect(screen.queryByText('Leaf Rust')).not.toBeInTheDocument();
      expect(screen.queryByText('Aphids')).not.toBeInTheDocument();
    });
  });

  it('filters reports by severity', async () => {
    render(<HistoryList reports={mockReports} />);
    
    const severitySelect = screen.getByDisplayValue('All Severity');
    fireEvent.change(severitySelect, { target: { value: 'high' } });
    
    await waitFor(() => {
      expect(screen.getByText('Fall Armyworm')).toBeInTheDocument();
      expect(screen.queryByText('Leaf Rust')).not.toBeInTheDocument();
      expect(screen.queryByText('Aphids')).not.toBeInTheDocument();
    });
  });

  it('toggles between grid and list view', () => {
    render(<HistoryList reports={mockReports} />);
    
    const listButton = screen.getByRole('button', { name: /list/i });
    fireEvent.click(listButton);
    
    // Should switch to list view (implementation would change className)
    expect(listButton).toHaveClass('bg-green-600', 'text-white');
  });

  it('calls onRefresh when refresh button is clicked', () => {
    const mockOnRefresh = jest.fn();
    render(<HistoryList reports={mockReports} onRefresh={mockOnRefresh} />);
    
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);
    
    expect(mockOnRefresh).toHaveBeenCalled();
  });

  it('calls onDelete when delete is triggered', () => {
    const mockOnDelete = jest.fn();
    render(<HistoryList reports={mockReports} onDelete={mockOnDelete} />);
    
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });

  it('calls onView when view is triggered', () => {
    const mockOnView = jest.fn();
    render(<HistoryList reports={mockReports} onView={mockOnView} />);
    
    const viewButtons = screen.getAllByText('View Details');
    fireEvent.click(viewButtons[0]);
    
    expect(mockOnView).toHaveBeenCalledWith(mockReports[0]);
  });

  it('displays severity statistics', () => {
    render(<HistoryList reports={mockReports} />);
    
    // Should show severity stats
    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
    expect(screen.getByText('low')).toBeInTheDocument();
  });

  it('shows empty state when search returns no results', async () => {
    render(<HistoryList reports={mockReports} />);
    
    const searchInput = screen.getByPlaceholderText('Search reports...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
    
    await waitFor(() => {
      expect(screen.getByText('No reports found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search or filter criteria')).toBeInTheDocument();
    });
  });

  it('opens modal when report is viewed', async () => {
    render(<HistoryList reports={mockReports} />);
    
    const viewButtons = screen.getAllByText('View Details');
    fireEvent.click(viewButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText('Report Details')).toBeInTheDocument();
    });
  });

  it('closes modal when close button is clicked', async () => {
    render(<HistoryList reports={mockReports} />);
    
    const viewButtons = screen.getAllByText('View Details');
    fireEvent.click(viewButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText('Report Details')).toBeInTheDocument();
    });
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Report Details')).not.toBeInTheDocument();
    });
  });
});
