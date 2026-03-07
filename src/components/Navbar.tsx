import { Terminal } from "lucide-react";

export function Navbar() {

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-black/80 backdrop-blur-md">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Terminal className="h-6 w-6 text-blue-600" />
          <span className="text-lg font-bold tracking-tight">
            AI Generated Dashboard
          </span>
        </div>
      </div>
    </header>
  );
}
