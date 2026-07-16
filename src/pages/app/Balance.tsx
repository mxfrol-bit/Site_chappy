import { useState } from 'react';
import { useStore } from '../../store/useStore';
import Modal from '../../components/Modal';
import MockBadge from '../../components/MockBadge';

const PACKAGES = [
  { id: 'p1', credits: 100, price: '199 ₽' },
  { id: 'p2', credits: 550, price: '899 ₽', popular: true },
  { id: 'p3', credits: 1200, price: '1 690 ₽' },
];

const kindLabel: Record<string, string> = { spend: 'списание', topup: 'пополнение', bonus: 'бонус' };

export default function Balance() {
  const credits = useStore((s) => s.credits);
  const transactions = useStore((s) => s.transactions);
  const addCredits = useStore((s) => s.addCredits);
  const toast = useStore((s) => s.toast);
  const [pack, setPack] = useState<(typeof PACKAGES)[number] | null>(null);

  const pay = () => {
    if (!pack) return;
    addCredits(pack.credits, `Пополнение · пакет ${pack.credits} (демо)`);
    toast(`Начислено ${pack.credits} кредитов (демо-оплата)`, 'success');
    setPack(null);
  };

  return (
    <div style={{ maxWidth: 960 }}>
      <div className="between" style={{ marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div><div className="k" style={{ marginBottom: 6 }}>Кредиты</div><h1 className="h2" style={{ margin: 0 }}>Баланс и тарифы</h1></div>
        <MockBadge text="демо-оплата" />
      </div>

      <div className="grid g2" style={{ marginBottom: 16 }}>
        <div className="card pad-lg" style={{ background: 'var(--grad-soft)' }}>
          <div className="k" style={{ marginBottom: 8 }}>Текущий баланс</div>
          <div style={{ fontSize: 40, fontWeight: 700, fontFamily: 'var(--font-display)' }}>⚡ {credits}</div>
          <div className="sub" style={{ fontSize: 13, marginTop: 4 }}>кредитов</div>
        </div>
        <div className="card pad-lg">
          <div className="k" style={{ marginBottom: 12 }}>Примерный остаток</div>
          <div className="stack" style={{ gap: 8 }}>
            <div className="between"><span style={{ fontSize: 14 }}>🖼️ Изображения</span><span className="mono" style={{ fontSize: 13 }}>≈ {Math.floor(credits / 6)}</span></div>
            <div className="between"><span style={{ fontSize: 14 }}>🎬 Видео</span><span className="mono" style={{ fontSize: 13 }}>≈ {Math.floor(credits / 35)}</span></div>
            <div className="between"><span style={{ fontSize: 14 }}>🎵 Аудио</span><span className="mono" style={{ fontSize: 13 }}>≈ {Math.floor(credits / 12)}</span></div>
          </div>
        </div>
      </div>

      <div className="k" style={{ marginBottom: 12 }}>Пополнить</div>
      <div className="grid g3" style={{ marginBottom: 20 }}>
        {PACKAGES.map((p) => (
          <div key={p.id} className="card pad-lg" style={{ borderColor: p.popular ? 'var(--accent)' : 'var(--line)' }}>
            <div className="between"><div style={{ fontSize: 22, fontWeight: 700 }}>⚡ {p.credits}</div>{p.popular && <span className="badge badge-top">популярный</span>}</div>
            <div className="sub" style={{ fontSize: 13, margin: '6px 0 14px' }}>{p.price}</div>
            <button className="btn btn-primary btn-block btn-sm" onClick={() => setPack(p)}>Пополнить</button>
          </div>
        ))}
      </div>

      <div className="card pad-lg">
        <div className="k" style={{ marginBottom: 12 }}>Последние операции</div>
        {transactions.map((t) => (
          <div key={t.id} className="between" style={{ padding: '9px 0', borderBottom: '1px solid var(--line)' }}>
            <div><div style={{ fontSize: 13.5 }}>{t.label}</div><div className="sub mono" style={{ fontSize: 11 }}>{t.date} · {kindLabel[t.kind] ?? t.kind}</div></div>
            <span className="mono" style={{ fontSize: 14, color: t.amount > 0 ? 'var(--green)' : 'var(--ink-2)' }}>{t.amount > 0 ? '+' : ''}{t.amount}</span>
          </div>
        ))}
      </div>

      <Modal open={!!pack} onClose={() => setPack(null)} title="Оплата через ЮKassa" width={440}>
        <div className="card pad" style={{ background: 'var(--panel-2)', marginBottom: 14 }}>
          <div className="between"><span style={{ fontSize: 14 }}>Пакет</span><b>⚡ {pack?.credits} кредитов</b></div>
          <div className="between" style={{ marginTop: 8 }}><span style={{ fontSize: 14 }}>К оплате</span><b>{pack?.price}</b></div>
        </div>
        <div className="sub" style={{ fontSize: 13, marginBottom: 16 }}>
          💳 Оплата российской картой через ЮKassa. Это демонстрация прототипа — реальное списание не выполняется, данные карты не запрашиваются.
        </div>
        <div className="row" style={{ justifyContent: 'flex-end', gap: 10 }}>
          <button className="btn btn-soft" onClick={() => setPack(null)}>Отмена</button>
          <button className="btn btn-primary" onClick={pay}>Оплатить (демо)</button>
        </div>
      </Modal>
    </div>
  );
}
