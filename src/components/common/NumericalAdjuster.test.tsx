import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import NumericalAdjuster from './NumericalAdjuster'

describe('NumericalAdjuster', () => {
  const defaultProps = {
    label: 'Test Label',
    value: 100,
    onChange: vi.fn(),
  };

  it('should render label and value correctly', () => {
    render(<NumericalAdjuster {...defaultProps} />);
    
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('100px')).toBeInTheDocument();
  });

  it('should call onChange with incremented value when plus button is clicked', () => {
    render(<NumericalAdjuster {...defaultProps} />);
    
    const plusButton = screen.getByLabelText('increment');
    fireEvent.click(plusButton);
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(101);
  });

  it('should call onChange with decremented value when minus button is clicked', () => {
    render(<NumericalAdjuster {...defaultProps} />);
    
    const minusButton = screen.getByLabelText('decrement');
    fireEvent.click(minusButton);
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(99);
  });

  it('should call onChange with new value when input changes', () => {
    render(<NumericalAdjuster {...defaultProps} />);
    
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '150' } });
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(150);
  });

  it('should respect min and max bounds for buttons', () => {
    const propsWithBounds = {
      ...defaultProps,
      value: 10,
      min: 10,
      max: 12,
    };
    
    const { rerender } = render(<NumericalAdjuster {...propsWithBounds} />);
    
    // Decrement at min
    fireEvent.click(screen.getByLabelText('decrement'));
    expect(propsWithBounds.onChange).toHaveBeenCalledWith(10);
    
    // Increment to max
    rerender(<NumericalAdjuster {...propsWithBounds} value={12} />);
    fireEvent.click(screen.getByLabelText('increment'));
    expect(propsWithBounds.onChange).toHaveBeenCalledWith(12);
  });
});
