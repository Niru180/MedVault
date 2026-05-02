import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, QrCode, User, ArrowRight, Activity, Stethoscope, Mail } from 'lucide-react';
import QRScanner from '../components/QRScanner';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [patientId, setPatientId] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [recentPatients, setRecentPatients] = useState([]);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!user?.id) return;
    const saved = localStorage.getItem(`medvault_recent_patients_${user.id}`);
    if (saved) setRecentPatients(JSON.parse(saved));
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (patientId.trim()) {
      handlePatientId(patientId.trim());
    }
  };

  const handlePatientId = (id) => {
    // Save to recents
    const updatedRecents = [id, ...recentPatients.filter(p => p !== id)].slice(0, 5);
    setRecentPatients(updatedRecents);
    localStorage.setItem(`medvault_recent_patients_${user?.id}`, JSON.stringify(updatedRecents));
    navigate(`/doctor/patient/${id}`);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-8 pb-20">
      {/* Doctor Info Hero */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-blue-600 rounded-[3rem] p-8 text-white shadow-2xl shadow-blue-200 relative overflow-hidden"
      >
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-blue-500 flex items-center justify-center text-white border-4 border-blue-400 shadow-xl">
              <Stethoscope size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight">Dr. {user?.name || 'Doctor'}</h2>
              <p className="text-blue-200 font-bold uppercase text-xs tracking-widest">{user?.degree || 'Medical Professional'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-500/30 backdrop-blur-md p-4 rounded-3xl border border-blue-400/20">
               <div className="text-blue-100 mb-1"><Activity size={20} /></div>
               <p className="text-xl font-extrabold">Active</p>
               <p className="text-[10px] uppercase font-bold text-blue-200 tracking-widest">Status</p>
            </div>
            <div className="bg-blue-500/30 backdrop-blur-md p-4 rounded-3xl border border-blue-400/20">
               <div className="text-blue-100 mb-1"><Mail size={20} /></div>
               <p className="text-sm font-bold truncate">{user?.email || 'No Email'}</p>
               <p className="text-[10px] uppercase font-bold text-blue-200 tracking-widest">Verified Email</p>
            </div>
          </div>
        </div>
        
        {/* Abstract background decorations */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
      </motion.div>

      {/* Patient Search Section */}
      <div className="space-y-6">
        <div className="px-2">
          <h3 className="text-2xl font-extrabold text-gray-800 tracking-tight">Patient Access</h3>
          <p className="text-sm text-gray-400 font-medium">Scan QR or enter Patient ID to access records records.</p>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-600">
              <User size={24} />
            </div>
            <input 
              type="text"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              placeholder="Enter Patient ID (e.g. jx78z...)"
              className="w-full pl-16 pr-24 py-6 bg-white shadow-sm border border-gray-100 rounded-[2rem] font-bold text-lg outline-none focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-gray-300"
              required
            />
            <button 
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-4 rounded-2xl shadow-lg shadow-blue-100 active:scale-95 transition-all"
            >
              <ArrowRight size={20} />
            </button>
          </div>
          
          <div className="flex items-center gap-4 py-2">
             <div className="h-[1px] flex-1 bg-gray-200"></div>
             <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">OR</span>
             <div className="h-[1px] flex-1 bg-gray-200"></div>
          </div>

          <button 
            type="button" 
            onClick={() => setShowScanner(true)}
            className="w-full py-5 border-2 border-dashed border-blue-200 bg-blue-50/20 rounded-[2rem] flex items-center justify-center gap-3 text-blue-600 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 transition-all group active:scale-98"
          >
            <QrCode size={24} className="group-hover:scale-110 transition-transform" />
            <span className="font-bold text-lg tracking-tight">Scan Patient QR</span>
          </button>
        </form>

        {recentPatients.length > 0 && (
          <div className="space-y-3 px-2">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recent Patients</h4>
            <div className="flex flex-wrap gap-2">
              {recentPatients.map(id => (
                <button 
                  key={id}
                  onClick={() => handlePatientId(id)}
                  className="px-4 py-2 bg-gray-100/50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-xl text-xs font-bold transition-all border border-transparent hover:border-blue-100"
                >
                  {id.length > 10 ? `${id.substring(0, 6)}...` : id}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showScanner && (
            <QRScanner 
                onScan={(id) => {
                    setShowScanner(false);
                    handlePatientId(id);
                }}
                onClose={() => setShowScanner(false)}
            />
        )}
      </AnimatePresence>

      {/* Analytics/Recent Section (Optional UI Filler) */}
      <div className="bg-gray-100/50 p-6 rounded-[2.5rem] border border-gray-200/50">
         <div className="flex items-center gap-4 text-gray-400">
            <Activity size={24} />
            <div>
               <p className="font-bold text-gray-700">Daily Insight</p>
               <p className="text-xs font-medium">Digital records reduce diagnosis time by 40%.</p>
            </div>
         </div>
      </div>
    </div>
  );
}
