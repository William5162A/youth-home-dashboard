import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';

export default function Topbar({ toggleSidebar }) {
  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <header className="flex h-16 items-center justify-between bg-surface px-4 shadow-sm lg:px-6">
      <button 
        onClick={toggleSidebar}
        className="p-2 text-slate-600 hover:bg-slate-100 rounded-md lg:hidden transition-colors"
      >
        ☰
      </button>
      
      <div className="flex-1" /> {/* Spacer */}

      <button 
        onClick={handleLogout}
        className="text-sm font-medium text-absent-text hover:bg-absent-bg px-3 py-1.5 rounded-md transition-colors"
      >
        تسجيل الخروج
      </button>
    </header>
  );
}