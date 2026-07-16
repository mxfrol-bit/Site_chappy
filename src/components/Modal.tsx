import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  width?: number;
}

const FOCUSABLE = 'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])';

export default function Modal({ open, onClose, title, children, width = 560 }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose; // call sites pass inline arrows; hold via ref so the effect runs once per open
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';

    // move focus into the dialog (first focusable, else the dialog itself)
    const dialog = dialogRef.current;
    const first = dialog?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? dialog)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onCloseRef.current(); return; }
      if (e.key !== 'Tab' || !dialog) return;
      // trap focus within the dialog
      const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) { e.preventDefault(); lastEl.focus(); }
      else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); firstEl.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      opener?.focus?.(); // restore focus to the trigger
    };
  }, [open]);

  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200, display: 'grid', placeItems: 'center',
        background: 'rgba(3,4,10,.72)', backdropFilter: 'blur(6px)', padding: 16,
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : 'Диалог'}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="card"
        style={{ width: '100%', maxWidth: width, maxHeight: '88vh', overflow: 'auto', boxShadow: 'var(--shadow)', outline: 'none' }}
      >
        {title && (
          <div className="between" style={{ padding: '18px 22px', borderBottom: '1px solid var(--line)' }}>
            <h3 id={titleId} className="h3" style={{ margin: 0 }}>{title}</h3>
            <button className="btn btn-soft btn-sm" onClick={onClose} aria-label="Закрыть">✕</button>
          </div>
        )}
        <div style={{ padding: 22 }}>{children}</div>
      </div>
    </div>
  );
}
