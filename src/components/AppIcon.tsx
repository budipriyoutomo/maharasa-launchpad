import { icons, LayoutGrid, type LucideProps } from "lucide-react";

interface AppIconProps extends LucideProps {
  name: string;
}

/** Resolves a Lucide icon by name from application data, with a safe fallback. */
export function AppIcon({ name, ...props }: AppIconProps) {
  const Icon = (icons as Record<string, React.ComponentType<LucideProps>>)[name] ?? LayoutGrid;
  return <Icon {...props} />;
}
