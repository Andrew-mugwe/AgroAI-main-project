import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { AdminLogs } from '../pages/Admin/AdminLogs';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock fetch
global.fetch = jest.fn();

// Mock Recharts components
jest.mock('recharts', () => ({
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
}));

describe('AdminLogs', () => {
  const mockLogs = [
    {
      id: 1,
      user_id: 'user-123',
      role: 'farmer',
      action: 'FARMER_CROP_ADDED',
      metadata: { crop: 'maize', quantity: 100 },
      ip_address: '192.168.1.1',
      user_agent: 'Mozilla/5.0',
      created_at: '2024-01-15T10:30:00Z',
    },
    {
      id: 2,
      user_id: 'user-456',
      role: 'trader',
      action: 'TRADER_PRODUCT_LISTED',
      metadata: { product: 'wheat', price: 50 },
      ip_address: '192.168.1.2',
      user_agent: 'Mozilla/5.0',
      created_at: '2024-01-15T11:00:00Z',
    },
    {
      id: 3,
      user_id: null,
      role: 'system',
      action: 'SYSTEM_STARTUP',
      metadata: { version: '1.0.0' },
      ip_address: '127.0.0.1',
      user_agent: 'System',
      created_at: '2024-01-15T09:00:00Z',
    },
  ];

  const mockStats = {
    total_logs: 150,
    recent_logs_24h: 25,
    logs_by_action: {
      'FARMER_CROP_ADDED': 45,
      'TRADER_PRODUCT_LISTED': 30,
      'SYSTEM_STARTUP': 5,
      'USER_LOGIN': 70,
    },
    logs_by_role: {
      farmer: 60,
      trader: 40,
      ngo: 20,
      admin: 15,
      system: 15,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('mock-token');
    
    // Mock successful API responses
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          logs: mockLogs,
          total: 150,
          page: 1,
          page_size: 50,
          total_pages: 3,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats,
      });
  });

  it('renders admin logs dashboard', async () => {
    render(<AdminLogs />);

    expect(screen.getByText('Activity Logs')).toBeInTheDocument();
    expect(screen.getByText('Monitor user and system activities')).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument(); // Total logs
      expect(screen.getByText('25')).toBeInTheDocument(); // Recent logs
    });
  });

  it('displays stats cards', async () => {
    render(<AdminLogs />);

    await waitFor(() => {
      expect(screen.getByText('Total Logs')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('Last 24h')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('Active Roles')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument(); // Number of roles
      expect(screen.getByText('Action Types')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument(); // Number of actions
    });
  });

  it('displays charts', async () => {
    render(<AdminLogs />);

    await waitFor(() => {
      expect(screen.getByText('Activity by Role')).toBeInTheDocument();
      expect(screen.getByText('Top Actions')).toBeInTheDocument();
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  it('displays logs table', async () => {
    render(<AdminLogs />);

    await waitFor(() => {
      expect(screen.getByText('Activity Logs')).toBeInTheDocument();
      expect(screen.getByText('Showing 3 of 150 logs')).toBeInTheDocument();
      
      // Check table headers
      expect(screen.getByText('Action')).toBeInTheDocument();
      expect(screen.getByText('Role')).toBeInTheDocument();
      expect(screen.getByText('User')).toBeInTheDocument();
      expect(screen.getByText('IP Address')).toBeInTheDocument();
      expect(screen.getByText('Timestamp')).toBeInTheDocument();
      expect(screen.getByText('Details')).toBeInTheDocument();
    });
  });

  it('displays log entries with correct data', async () => {
    render(<AdminLogs />);

    await waitFor(() => {
      // Check first log entry
      expect(screen.getByText('FARMER CROP ADDED')).toBeInTheDocument();
      expect(screen.getByText('farmer')).toBeInTheDocument();
      expect(screen.getByText('user-123')).toBeInTheDocument();
      expect(screen.getByText('192.168.1.1')).toBeInTheDocument();
      
      // Check second log entry
      expect(screen.getByText('TRADER PRODUCT LISTED')).toBeInTheDocument();
      expect(screen.getByText('trader')).toBeInTheDocument();
      expect(screen.getByText('user-456')).toBeInTheDocument();
      
      // Check system log entry
      expect(screen.getByText('SYSTEM STARTUP')).toBeInTheDocument();
      expect(screen.getByText('system')).toBeInTheDocument();
      expect(screen.getByText('System')).toBeInTheDocument();
    });
  });

  it('handles filter changes', async () => {
    render(<AdminLogs />);

    await waitFor(() => {
      expect(screen.getByText('Activity Logs')).toBeInTheDocument();
    });

    // Test role filter
    const roleSelect = screen.getByDisplayValue('All Roles');
    fireEvent.change(roleSelect, { target: { value: 'farmer' } });

    // Test action filter
    const actionInput = screen.getByPlaceholderText('Search actions...');
    fireEvent.change(actionInput, { target: { value: 'CROP' } });

    // Test date filters
    const startDateInput = screen.getByDisplayValue('');
    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });

    const endDateInput = screen.getAllByDisplayValue('')[1];
    fireEvent.change(endDateInput, { target: { value: '2024-01-31' } });

    // Test search filter
    const searchInput = screen.getByPlaceholderText('Search logs...');
    fireEvent.change(searchInput, { target: { value: 'maize' } });
  });

  it('handles pagination', async () => {
    render(<AdminLogs />);

    await waitFor(() => {
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    });

    // Test next page button
    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeInTheDocument();
    expect(nextButton).not.toBeDisabled();

    // Test previous page button
    const prevButton = screen.getByText('Previous');
    expect(prevButton).toBeInTheDocument();
    expect(prevButton).toBeDisabled();
  });

  it('handles refresh button', async () => {
    render(<AdminLogs />);

    await waitFor(() => {
      expect(screen.getByText('Activity Logs')).toBeInTheDocument();
    });

    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    // Should make new API calls
    expect(global.fetch).toHaveBeenCalledTimes(4); // 2 initial + 2 refresh
  });

  it('handles cleanup button', async () => {
    render(<AdminLogs />);

    await waitFor(() => {
      expect(screen.getByText('Activity Logs')).toBeInTheDocument();
    });

    // Mock cleanup API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const cleanupButton = screen.getByText('Cleanup (90 days)');
    fireEvent.click(cleanupButton);

    // Should show alert (mocked)
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/admin/logs/cleanup?days=90',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token',
          }),
        })
      );
    });
  });

  it('displays loading state', () => {
    // Mock loading state
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<AdminLogs />);

    expect(screen.getByText('Loading logs...')).toBeInTheDocument();
    expect(screen.getByTestId('refresh-icon')).toBeInTheDocument();
  });

  it('displays error state', async () => {
    // Mock error response
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    render(<AdminLogs />);

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });

  it('expands log details', async () => {
    render(<AdminLogs />);

    await waitFor(() => {
      expect(screen.getByText('View Details')).toBeInTheDocument();
    });

    const detailsButton = screen.getAllByText('View Details')[0];
    fireEvent.click(detailsButton);

    // Should show metadata
    await waitFor(() => {
      expect(screen.getByText('"crop": "maize"')).toBeInTheDocument();
      expect(screen.getByText('"quantity": 100')).toBeInTheDocument();
    });
  });

  it('formats timestamps correctly', async () => {
    render(<AdminLogs />);

    await waitFor(() => {
      // Check that timestamps are formatted (exact format may vary by locale)
      const timestamps = screen.getAllByText(/2024/);
      expect(timestamps.length).toBeGreaterThan(0);
    });
  });

  it('displays role colors correctly', async () => {
    render(<AdminLogs />);

    await waitFor(() => {
      const farmerRole = screen.getByText('farmer');
      const traderRole = screen.getByText('trader');
      const systemRole = screen.getByText('system');

      expect(farmerRole).toBeInTheDocument();
      expect(traderRole).toBeInTheDocument();
      expect(systemRole).toBeInTheDocument();
    });
  });

  it('handles empty logs', async () => {
    // Mock empty response
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          logs: [],
          total: 0,
          page: 1,
          page_size: 50,
          total_pages: 0,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats,
      });

    render(<AdminLogs />);

    await waitFor(() => {
      expect(screen.getByText('Showing 0 of 0 logs')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    // Mock API error
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<AdminLogs />);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });
});
