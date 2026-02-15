import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

const mockMutate = vi.fn();
let mockIsPending = false;
let mockIsSuccess = false;

vi.mock('@/hooks/useSessionUserData', () => ({
  useSessionUserData: () => [
    {
      id: 'user1',
      username: 'testuser',
      name: 'Test User',
      email: 'test@example.com',
      phoneNumber: null,
      bio: null,
      website: null,
      address: null,
      gender: null,
      relationshipStatus: null,
      birthDate: null,
    },
  ],
}));

vi.mock('@/hooks/mutations/useSessionUserDataMutation', () => ({
  useSessionUserDataMutation: () => ({
    updateSessionUserDataMutation: {
      mutate: mockMutate,
      isPending: mockIsPending,
      isSuccess: mockIsSuccess,
    },
  }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock('nextjs-toploader/app', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock('@/components/DeleteAccountButton', () => ({
  DeleteAccountButton: () => <button>Delete Account</button>,
}));

vi.mock('@/components/EditProfileFormSkeleton', () => ({
  EditProfileFormSkeleton: () => <div>Loading form...</div>,
}));

vi.mock('@/components/ui/DatePicker', () => ({
  DatePicker: ({ label }: { label: string }) => <div>{label}</div>,
}));

vi.mock('@/components/ui/Select', () => ({
  Select: ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      {label}
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/TextInput', () => {
  const TextInput = React.forwardRef(
    ({ label, value }: { label: string; value: string }, ref: React.Ref<HTMLInputElement>) => (
      <input ref={ref} aria-label={label} value={value} readOnly />
    ),
  );
  TextInput.displayName = 'TextInput';
  return { TextInput };
});

vi.mock('@/components/ui/Textarea', () => {
  const Textarea = React.forwardRef(
    ({ label, value }: { label: string; value: string }, ref: React.Ref<HTMLTextAreaElement>) => (
      <textarea ref={ref} aria-label={label} value={value} readOnly />
    ),
  );
  Textarea.displayName = 'Textarea';
  return { Textarea };
});

vi.mock('@/components/ui/Button', () => ({
  default: ({ children, type }: { children: React.ReactNode; type?: 'button' | 'reset' | 'submit' }) => (
    <button type={type}>{children}</button>
  ),
}));

vi.mock('react-stately', () => ({
  Item: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/svg_components', () => ({
  AtSign: () => null,
  BuildingBusinessOffice: () => null,
  Bullhorn: () => null,
  Heart: () => null,
  Other: () => null,
  Phone: () => null,
  Profile: () => null,
  WorldNet: () => null,
}));

vi.mock('@/lib/logging', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

vi.mock('@internationalized/date', () => ({
  parseDate: vi.fn(),
}));

vi.mock('@/lib/utils/dateOnly', () => ({
  extractDateOnly: vi.fn(),
}));

// Mock react-hook-form to avoid internal effects that hang in jsdom
vi.mock('react-hook-form', () => {
  const Controller = ({ render }: { render: (props: unknown) => React.ReactNode }) =>
    render({
      field: { onChange: vi.fn(), ref: vi.fn(), value: '' },
      fieldState: { error: undefined },
    });
  return {
    Controller,
    useForm: () => ({
      control: {},
      handleSubmit: (onValid: () => void) => (e: React.FormEvent) => {
        e.preventDefault();
        onValid();
      },
      reset: vi.fn(),
      setError: vi.fn(),
      setFocus: vi.fn(),
    }),
  };
});

vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: () => vi.fn(),
}));

import { EditProfileForm } from './EditProfileForm';

describe('EditProfileForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsPending = false;
    mockIsSuccess = false;
  });

  it('disables fieldset when mutation is pending', () => {
    mockIsPending = true;
    const { container } = render(<EditProfileForm />);
    const fieldset = container.querySelector('fieldset');
    expect(fieldset).toBeDisabled();
  });

  it('enables fieldset when mutation is not pending', () => {
    mockIsPending = false;
    const { container } = render(<EditProfileForm />);
    const fieldset = container.querySelector('fieldset');
    expect(fieldset).not.toBeDisabled();
  });

  it('applies visual feedback classes when mutation is pending', () => {
    mockIsPending = true;
    const { container } = render(<EditProfileForm />);
    const fieldset = container.querySelector('fieldset');
    expect(fieldset).toHaveClass('pointer-events-none');
    expect(fieldset).toHaveClass('opacity-60');
  });

  it('keeps fieldset disabled after success while redirecting', () => {
    mockIsPending = false;
    mockIsSuccess = true;
    const { container } = render(<EditProfileForm />);
    const fieldset = container.querySelector('fieldset');
    expect(fieldset).toBeDisabled();
    expect(fieldset).toHaveClass('pointer-events-none');
  });
});
