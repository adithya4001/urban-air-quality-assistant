import { RefObject, useEffect, useRef } from 'react';

const FOCUSABLE = [
  'button:not([disabled]):not([hidden])',
  'input:not([disabled]):not([hidden])',
  'select:not([disabled]):not([hidden])',
  'textarea:not([disabled]):not([hidden])',
  'a[href]:not([hidden])',
  '[tabindex]:not([tabindex="-1"]):not([hidden])',
].join(', ');

/** Keeps keyboard focus inside an open modal and returns it to its opener on close. */
export function useDialogFocus(onClose: () => void): RefObject<HTMLElement> {
  const dialogRef = useRef<HTMLElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusable = () => Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE))
      .filter((element) => !element.closest('[aria-hidden="true"], [inert]') && element.getClientRects().length > 0);
    const initialFocus = dialog.querySelector<HTMLElement>('[data-dialog-initial-focus]');
    (initialFocus ?? focusable()[0])?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab') return;

      const items = focusable();
      if (items.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const activeIndex = items.indexOf(document.activeElement as HTMLElement);
      if (event.shiftKey && (activeIndex <= 0 || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (activeIndex === -1 || activeIndex === items.length - 1 || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };

    dialog.addEventListener('keydown', handleKeyDown);
    return () => {
      dialog.removeEventListener('keydown', handleKeyDown);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);

  return dialogRef;
}
