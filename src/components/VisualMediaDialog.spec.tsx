import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VisualMediaDialog } from './VisualMediaDialog';

describe('VisualMediaDialog', () => {
  it('calls onClose when user clicks area that is not a button', async () => {
    const onClose = vi.fn();
    render(
      <VisualMediaDialog onClose={onClose}>
        <button type="button">Close</button>
        <div data-testid="content">Image area</div>
      </VisualMediaDialog>,
    );
    await userEvent.click(screen.getByTestId('content'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
