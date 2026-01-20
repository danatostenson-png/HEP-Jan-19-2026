import Link from "next/link";
import { Plus, BarChart3 } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-gray-100 bg-white py-4 px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-gray-900">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand text-white">
            <BarChart3 size={18} />
          </div>
          ExerciseRx
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/programs" className="text-gray-500 hover:text-gray-900 font-medium text-sm">Programs</Link>
          <Link href="/patients" className="text-gray-500 hover:text-gray-900 font-medium text-sm">Patients</Link>
          <Link href="/library" className="text-gray-500 hover:text-gray-900 font-medium text-sm">Library</Link>
          <Link href="/settings" className="text-gray-500 hover:text-gray-900 font-medium text-sm">Settings</Link>
        </nav>
      </div>

      <button className="flex items-center gap-2 bg-brand hover:bg-emerald-600 text-white px-4 py-2 rounded-full font-medium text-sm transition-colors">
        <Plus size={16} />
        New Program
      </button>
    </header>
  );
}
