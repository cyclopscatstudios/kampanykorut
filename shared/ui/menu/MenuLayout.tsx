export function MenuLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-full w-full flex flex-col items-center">
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
