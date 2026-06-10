export default function Table({ headers, rows, emptyMessage = 'No data available' }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#2a3248]">
            {headers.map((h, i) => (
              <th
                key={i}
                className="text-left text-[#8892a4] font-semibold text-xs uppercase tracking-wider px-4 py-3 whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="text-center text-[#8892a4] py-12">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-3xl">📭</span>
                  <span>{emptyMessage}</span>
                </div>
              </td>
            </tr>
          ) : (
            rows.map((row, rIdx) => (
              <tr
                key={rIdx}
                className="border-b border-[#2a3248]/50 hover:bg-white/[0.03] transition-colors duration-150"
              >
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="px-4 py-3 text-[#e8eaf0] whitespace-nowrap">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
