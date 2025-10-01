export default function ScenarioPicker({ items, value, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm opacity-80">Escenario:</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 outline-none"
      >
        {items.map((it) => (
          <option key={it.id} value={it.id}>
            {it.name}
          </option>
        ))}
      </select>
    </div>
  );
}
