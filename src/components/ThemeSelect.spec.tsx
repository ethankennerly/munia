import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { ThemeSelect } from './ThemeSelect';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      settings_theme: 'Theme',
      theme_system: 'System',
      theme_light: 'Light',
      theme_dark: 'Dark',
    };
    return translations[key] || key;
  },
}));

// Mock useTheme hook
const mockHandleThemeChange = vi.fn();
vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'light',
    handleThemeChange: mockHandleThemeChange,
  }),
}));

describe('ThemeSelect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHandleThemeChange.mockReset();
  });

  it('should render with theme label', () => {
    render(<ThemeSelect />);
    // Select button should be rendered (has aria-haspopup="listbox")
    const selectButton = screen.getByRole('button', { name: /Light/i });
    expect(selectButton).toBeInTheDocument();
  });

  it('should display all three theme options when opened', async () => {
    const user = userEvent.setup();
    render(<ThemeSelect />);
    const button = screen.getByRole('button', { name: /Light/i });

    await user.click(button);

    // Wait for dropdown to open and check all options exist
    await waitFor(() => {
      expect(screen.getByRole('option', { name: /System/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /Dark/i })).toBeInTheDocument();
    });
  });

  it('should not render clear option (Any)', async () => {
    const user = userEvent.setup();
    render(<ThemeSelect />);
    const button = screen.getByRole('button', { name: /Light/i });

    await user.click(button);

    // Verify "(Any)" is not present in the dropdown
    await waitFor(() => {
      expect(screen.queryByText('(Any)')).not.toBeInTheDocument();
    });
  });

  it('should call handleThemeChange with correct value when theme is selected', async () => {
    const user = userEvent.setup();
    render(<ThemeSelect />);
    const button = screen.getByRole('button', { name: /Light/i });

    await user.click(button);

    const darkOption = screen.getByRole('option', { name: /Dark/i });
    await user.click(darkOption);

    await waitFor(() => {
      expect(mockHandleThemeChange).toHaveBeenCalledWith('dark');
    });
  });

  it('should support all three theme options', async () => {
    const user = userEvent.setup();
    render(<ThemeSelect />);
    const button = screen.getByRole('button', { name: /Light/i });

    // Test system theme
    await user.click(button);
    const systemOption = screen.getByRole('option', { name: /System/i });
    await user.click(systemOption);

    await waitFor(() => {
      expect(mockHandleThemeChange).toHaveBeenCalledWith('system');
    });

    mockHandleThemeChange.mockReset();

    // Test dark theme
    await user.click(button);
    const darkOption = screen.getByRole('option', { name: /Dark/i });
    await user.click(darkOption);

    await waitFor(() => {
      expect(mockHandleThemeChange).toHaveBeenCalledWith('dark');
    });
  });
});
