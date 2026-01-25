import React, { useContext } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ToastContext, ToastContextProvider } from './ToastContext';

const toastContent = { title: 'Success', message: 'Your reply has been created.', type: 'success' as const };
const toastOptions = { timeout: 6000 };

function AddToastButton() {
  const { addToast } = useContext(ToastContext);
  return (
    <button type="button" onClick={() => addToast?.(toastContent, toastOptions)}>
      Show toast
    </button>
  );
}

describe('ToastContextProvider', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('pauses toast timeout when page is hidden and removes toast after visible again and time elapses', async () => {
    render(
      <ToastContextProvider>
        <AddToastButton />
      </ToastContextProvider>,
    );
    await act(async () => {
      screen.getByRole('button', { name: 'Show toast' }).click();
    });
    await waitFor(() => {
      expect(screen.getByText('Your reply has been created.')).toBeInTheDocument();
    });

    vi.useFakeTimers();
    Object.defineProperty(document, 'hidden', { value: true, configurable: true, writable: true });
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(screen.getByText('Your reply has been created.')).toBeInTheDocument();

    Object.defineProperty(document, 'hidden', { value: false, configurable: true, writable: true });
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    act(() => {
      vi.advanceTimersByTime(6000);
    });

    expect(screen.queryByText('Your reply has been created.')).not.toBeInTheDocument();
  });

  it('removes toast when page becomes visible if toast has been visible longer than timeout', async () => {
    render(
      <ToastContextProvider>
        <AddToastButton />
      </ToastContextProvider>,
    );
    await act(async () => {
      screen.getByRole('button', { name: 'Show toast' }).click();
    });
    await waitFor(() => {
      expect(screen.getByText('Your reply has been created.')).toBeInTheDocument();
    });

    vi.useFakeTimers();
    Object.defineProperty(document, 'hidden', { value: true, configurable: true, writable: true });
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(screen.getByText('Your reply has been created.')).toBeInTheDocument();
    Object.defineProperty(document, 'hidden', { value: false, configurable: true, writable: true });
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(screen.queryByText('Your reply has been created.')).not.toBeInTheDocument();
  });
});
