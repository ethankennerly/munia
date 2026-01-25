import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DialogsContextProvider } from './DialogsContext';
import { useDialogs } from '@/hooks/useDialogs';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) =>
    ({
      contexts_dialogscontext_submit: 'Submit',
      components_confirmdialog_cancel: 'Cancel',
      components_confirmdialog: 'Confirm',
      this_cannot_be_empty: 'This cannot be empty',
      okay: 'Okay',
      input_here: 'Type here',
    })[key] ?? key,
}));

vi.mock('@/components/TextAreaWithMentionsAndHashTags', () => ({
  TextAreaWithMentionsAndHashTags: ({ content }: { content: string }) => (
    <textarea data-testid="textarea" value={content} readOnly />
  ),
}));

vi.mock('@/components/Modal', () => ({
  Modal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

function TestComponent({ initialPromptValue }: { initialPromptValue?: string }) {
  const { prompt } = useDialogs();
  React.useEffect(() => {
    prompt({
      title: 'Reply',
      message: 'You are replying to test comment.',
      promptType: 'textarea',
      onSubmit: () => {},
      initialPromptValue,
    });
  }, [prompt, initialPromptValue]);
  return null;
}

describe('DialogsContext', () => {
  it('constrains textarea container height to prevent buttons from scrolling off screen', async () => {
    const { container } = render(
      <DialogsContextProvider>
        <TestComponent />
      </DialogsContextProvider>,
    );
    await waitFor(() => {
      const area = container.querySelector('.h-\\[40vh\\].overflow-y-auto');
      expect(area).toBeTruthy();
    });
  });

  it('keeps Submit and Cancel visible: buttons not inside overflow-y-auto', async () => {
    const { container, getByRole } = render(
      <DialogsContextProvider>
        <TestComponent initialPromptValue={'a'.repeat(1000)} />
      </DialogsContextProvider>,
    );
    await waitFor(() => getByRole('button', { name: 'Submit' }));
    const scroll = container.querySelector('.overflow-y-auto');
    const submit = getByRole('button', { name: 'Submit' });
    expect(scroll).toBeTruthy();
    expect(scroll!.contains(submit)).toBe(false);
  });

  it('prompt has fixed height so input cannot overlap footer', async () => {
    const { container } = render(
      <DialogsContextProvider>
        <TestComponent initialPromptValue={'a'.repeat(1000)} />
      </DialogsContextProvider>,
    );
    await waitFor(() => container.querySelector('.overflow-y-auto'));
    const prompt = container.querySelector('.h-\\[40vh\\]');
    expect(prompt).toBeTruthy();
  });

  it('constrains dialog to visible viewport height so input stays above keyboard', async () => {
    const addListener = vi.fn();
    const removeListener = vi.fn();
    const viewportHeight = 350;
    Object.defineProperty(window, 'visualViewport', {
      value: { height: viewportHeight, addEventListener: addListener, removeEventListener: removeListener },
      configurable: true,
    });
    const { container } = render(
      <DialogsContextProvider>
        <TestComponent />
      </DialogsContextProvider>,
    );
    await waitFor(() => container.querySelector('.overflow-y-auto'));
    const constrained = container.querySelector('[style*="max-height"]');
    expect(constrained).toBeTruthy();
    expect((constrained as HTMLElement).style.maxHeight).toBe(`${viewportHeight}px`);
    Object.defineProperty(window, 'visualViewport', { value: undefined, configurable: true });
  });
});
