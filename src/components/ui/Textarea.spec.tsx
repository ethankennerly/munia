import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Textarea } from './Textarea';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock resizeTextAreaHeight
vi.mock('@/lib/resizeTextAreaHeight', () => ({
  resizeTextAreaHeight: vi.fn(),
}));

describe('Textarea', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates value when value prop changes', () => {
    const { rerender } = render(<Textarea label="Bio" value="initial" onChange={vi.fn()} />);
    const textarea = screen.getByRole('textbox');

    expect(textarea).toHaveValue('initial');

    // Update value prop
    rerender(<Textarea label="Bio" value="updated" onChange={vi.fn()} />);

    // Textarea should reflect new value
    expect(textarea).toHaveValue('updated');
  });

  it('calls onChange when user types', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Textarea label="Bio" value="" onChange={handleChange} />);
    const textarea = screen.getByRole('textbox');

    await user.type(textarea, 'new bio text');

    // onChange should be called for each keystroke
    expect(handleChange).toHaveBeenCalled();
  });
});
