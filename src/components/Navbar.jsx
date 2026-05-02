import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, HeartPulse, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-[60] bg-white/70 backdrop-blur-xl border-b border-gray-100/50 px-6 py-4 flex items-center justify-between transition-all">
      <Link to={user?.role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard'} className="flex items-center gap-2 group">
        <div className="bg-blue-600 p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-blue-200">
          <HeartPulse className="text-white w-5 h-5" />
        </div>
        <span className="font-extrabold text-xl tracking-tight text-blue-900">MedVault</span>
      </Link>
      
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end mr-1 hidden sm:flex">
          <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{user?.role}</span>
          <span className="text-sm font-bold text-gray-700">{user?.name}</span>
        </div>
        <button 
          onClick={handleLogout}
          className="p-3 rounded-2xl bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-95 border border-transparent hover:border-rose-100"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
}
