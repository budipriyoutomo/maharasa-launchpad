export function PortalFooter() {
  return (
    <footer className="mt-12 border-t border-border pt-6 pb-8">
      <div className="flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
        <p className="font-medium text-foreground">Maharasa Portal</p>
        <p>Version 1.0.0</p>
        <p>© {new Date().getFullYear()} Maharasa Group</p>
      </div>
    </footer>
  );
}
