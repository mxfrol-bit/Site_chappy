export default function Loading({ text = 'Создаём…' }: { text?: string }) {
  return (
    <div style={{ display: 'grid', placeItems: 'center', gap: 14, padding: 40, textAlign: 'center' }}>
      <div
        style={{
          width: 34, height: 34, borderRadius: '50%',
          border: '3px solid rgba(255,255,255,.12)', borderTopColor: 'var(--accent)',
          animation: 'spin 1s linear infinite',
        }}
      />
      <div className="sub" style={{ fontSize: 14 }}>{text}</div>
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  );
}
