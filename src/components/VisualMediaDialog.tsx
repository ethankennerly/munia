import React, { useRef } from 'react';
import { AriaDialogProps, useDialog } from 'react-aria';

interface VisualMediaDialogProps extends AriaDialogProps {
  children: React.ReactNode;
  onClose?: () => void;
}

export function VisualMediaDialog({ children, onClose, ...rest }: VisualMediaDialogProps) {
  const ref = useRef(null);
  const { dialogProps } = useDialog(rest, ref);

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (onClose && !target.closest('button')) onClose();
  };

  return (
    <div {...dialogProps} ref={ref} className="h-screen w-full" onClick={onClose ? handleClick : undefined}>
      {children}
    </div>
  );
}
