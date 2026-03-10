import Image from "next/image";
import { version } from "../../package.json";
import logo from "../../public/logo.png";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-black/80 backdrop-blur-md">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Image
            src={logo}
            alt="logo"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="text-lg font-bold tracking-tight">
            AI Generated Dashboard
          </span>
          <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            v{version}
          </span>
        </div>
      </div>
    </header>
  );
}
