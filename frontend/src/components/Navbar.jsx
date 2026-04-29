import { Link, useLocation } from 'react-router-dom';
import { Building2, Users, ClipboardList, LogOut } from 'lucide-react';

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass-card sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <Building2 className="h-8 w-8 text-sky-500 animate-pulse" />
        <span className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-indigo-500 bg-clip-text text-transparent">
          Flat360
        </span>
      </div>

      <div className="flex items-center space-x-6">
        <Link
          to="/"
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
            isActive('/') 
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Building2 className="h-5 w-5" />
          <span className="font-medium">Dashboard</span>
        </Link>

        <Link
          to="/flats"
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
            isActive('/flats') 
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Users className="h-5 w-5" />
          <span className="font-medium">Flats</span>
        </Link>

        <Link
          to="/logs"
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
            isActive('/logs') 
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <ClipboardList className="h-5 w-5" />
          <span className="font-medium">Logs</span>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        <span className="text-slate-400 text-sm hidden md:inline">
          Welcome, <span className="text-slate-200 font-semibold">{user.name}</span>
        </span>
        <button
          onClick={onLogout}
          className="flex items-center space-x-2 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 px-4 py-2 rounded-xl border border-slate-700 hover:border-red-500/30 transition-all duration-300"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium hidden md:inline">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
