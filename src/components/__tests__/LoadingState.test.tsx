import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingState } from '@/components/LoadingState';

describe('LoadingState', () => {
  it('renders spinner variant with default message', () => {
    render(<LoadingState variant="spinner" />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders spinner variant with custom message', () => {
    render(<LoadingState variant="spinner" message="Loading data..." />);
    
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('renders skeleton variant with correct number of rows', () => {
    const { container } = render(<LoadingState variant="skeleton" rows={3} />);
    
    const skeletons = container.querySelectorAll('.space-y-2');
    expect(skeletons).toHaveLength(3);
  });

  it('renders table variant', () => {
    const { container } = render(<LoadingState variant="table" rows={2} />);
    
    // Check for header
    const headers = container.querySelectorAll('.flex.gap-4.p-4.border-b');
    expect(headers.length).toBeGreaterThan(0);
    
    // Check for rows (2 data rows + 1 header)
    const rows = container.querySelectorAll('.border-b');
    expect(rows.length).toBe(3);
  });

  it('applies custom className', () => {
    const { container } = render(
      <LoadingState variant="spinner" className="custom-class" />
    );
    
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('custom-class');
  });
});