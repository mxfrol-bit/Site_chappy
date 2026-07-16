import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTour, TOUR_STEPS } from '../features/demo/tourStore';

// Guided demo tour: a bottom-anchored step card that walks the viewer through the
// flagship «Кира» journey, navigating to the right screen at each step.
export default function DemoTour() {
  const { open, step, next, prev, close } = useTour();
  const nav = useNavigate();
  const navRef = useRef(nav);
  navRef.current = nav; // useNavigate() changes identity on every location change; hold it in a ref
  const cardRef = useRef<HTMLDivElement>(null);

  // navigate to the current step's screen — ONLY when open/step change, never on every location change
  useEffect(() => {
    if (open) navRef.current(TOUR_STEPS[step].to);
  }, [open, step]);

  // Escape closes, focus the card for keyboard control
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    cardRef.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close, next, prev]);

  if (!open) return null;
  const s = TOUR_STEPS[step];
  const last = step === TOUR_STEPS.length - 1;

  return (
    <>
      {/* soft scrim — non-blocking: the page beneath stays visible and interactive */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 260, background: 'rgba(3,4,10,.32)', pointerEvents: 'none' }} />
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Тур по Chappy, шаг ${step + 1} из ${TOUR_STEPS.length}: ${s.title}`}
        tabIndex={-1}
        className="card pad-lg"
        style={{
          position: 'fixed', zIndex: 270, left: '50%', bottom: 28, transform: 'translateX(-50%)',
          width: 'min(560px, calc(100vw - 32px))', boxShadow: 'var(--shadow)', borderColor: 'var(--accent)', outline: 'none',
        }}
      >
        <div className="between" style={{ marginBottom: 8 }}>
          <div className="k">Тур · шаг {step + 1} / {TOUR_STEPS.length}</div>
          <button className="btn btn-soft btn-sm" onClick={close} aria-label="Закрыть тур">✕</button>
        </div>
        <h3 className="h3" style={{ margin: '0 0 6px' }}>{s.title}</h3>
        <p className="sub" style={{ fontSize: 14, marginBottom: 14 }}>{s.body}</p>

        {/* progress dots */}
        <div className="row" style={{ gap: 5, marginBottom: 16 }}>
          {TOUR_STEPS.map((_, i) => (
            <span key={i} style={{ width: i === step ? 18 : 7, height: 7, borderRadius: 'var(--r-pill)', background: i === step ? 'var(--accent)' : 'var(--line-2)', transition: 'width .2s var(--ease)' }} />
          ))}
        </div>

        <div className="between">
          <button className="btn btn-ghost btn-sm" onClick={close}>Пропустить</button>
          <div className="wrap-row">
            <button className="btn btn-soft btn-sm" onClick={prev} disabled={step === 0}>Назад</button>
            <button className="btn btn-primary btn-sm" onClick={next}>{last ? 'Готово' : 'Далее'}</button>
          </div>
        </div>
      </div>
    </>
  );
}
