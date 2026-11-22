export function Snowfall() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="snowfall-layer snowfall-layer-near" />
      <div className="snowfall-layer snowfall-layer-far" />
    </div>
  );
}
