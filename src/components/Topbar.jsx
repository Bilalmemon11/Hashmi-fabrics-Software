export default function Topbar({ title, action }) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-PK', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="bg-[#161b27] border-b border-[#2a3248] px-6 py-4 flex items-center justify-between">
      <div>
        <h2 className="text-[#e8eaf0] font-bold text-xl">{title}</h2>
        <p className="text-[#8892a4] text-xs mt-0.5">{dateStr}</p>
      </div>
      {action && <div>{action}</div>}
    </header>
  );
}
