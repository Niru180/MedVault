import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/mockFirebase';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  History, 
  ShieldCheck, 
  ShieldAlert,
  ArrowRight,
  User,
  Activity,
  Droplets,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [isSharing, setIsSharing] = useState(false);
  const [reminders, setReminders] = useState([
    { id: 1, text: 'Morning Vitamins', time: '08:00', completed: false },
    { id: 2, text: 'Drink 2L Water', time: '14:00', completed: true },
  ]);
  const [newReminder, setNewReminder] = useState('');
  const [reminderTime, setReminderTime] = useState('09:00');

  useEffect(() => {
    if (!user) return;
    const init = async () => {
      const status = await dbService.getSharingStatus(user.id);
      setIsSharing(status);
    };
    init();
    const saved = localStorage.getItem(`medvault_reminders_${user.id}`);
    if (saved) setReminders(JSON.parse(saved));
  }, [user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`medvault_reminders_${user.id}`, JSON.stringify(reminders));
    }
  }, [reminders, user]);

  const toggleSharing = async () => {
    if (!user) return;
    const newStatus = !isSharing;
    setIsSharing(newStatus);
    await dbService.setSharingStatus(user.id, newStatus);
  };

  const addReminder = (e) => {
    e.preventDefault();
    if (!newReminder.trim()) return;
    setReminders([...reminders, { id: Date.now(), text: newReminder, time: reminderTime, completed: false }]);
    setNewReminder('');
  };

  const toggleReminder = (id) => {
    setReminders(reminders.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
  };

  const deleteReminder = (id) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  const patientUrl = `${window.location.origin}/doctor/patient/${user.id}`;

  return (
    <div className="max-w-md mx-auto p-4 sm:p-6 space-y-6 pb-32">
      {/* Dynamic Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-8 text-white shadow-2xl shadow-blue-200"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
              <User size={32} />
            </div>
            <div>
              <p className="text-blue-100 text-xs font-bold uppercase tracking-[0.2em]">Patient Profile</p>
              <h2 className="text-2xl font-black tracking-tight">{user.name}</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
             <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
                <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">Blood Group</p>
                <p className="text-xl font-black">{user.bloodGroup || 'N/A'}</p>
             </div>
             <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
                <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">Age</p>
                <p className="text-xl font-black">{user.age || '--'} Yrs</p>
             </div>
          </div>
        </div>
        
        {/* Decorations */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
      </motion.div>

      {/* Health Reminders - The "Cool" Feature */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
           <h3 className="text-lg font-black text-gray-800 tracking-tight flex items-center gap-2">
             <Clock className="text-blue-600" size={20} />
             Daily Reminders
           </h3>
           <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-1 rounded-full uppercase tracking-tighter">
             {reminders.filter(r => !r.completed).length} Pending
           </span>
        </div>

        <div className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-gray-100 border border-gray-50 space-y-4">
          <form onSubmit={addReminder} className="flex gap-2">
            <input 
              type="text" 
              value={newReminder}
              onChange={(e) => setNewReminder(e.target.value)}
              placeholder="Add medication or task..."
              className="flex-1 bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-100 placeholder:text-gray-300"
            />
            <button type="submit" className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg shadow-blue-100 active:scale-90 transition-transform">
               <Plus size={20} />
            </button>
          </form>

          <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {reminders.map(reminder => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={reminder.id}
                  className={`group flex items-center justify-between p-4 rounded-3xl transition-all ${reminder.completed ? 'bg-gray-50 opacity-60' : 'bg-blue-50/50 border border-blue-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleReminder(reminder.id)} className={`${reminder.completed ? 'text-green-500' : 'text-gray-300 hover:text-blue-500'} transition-colors`}>
                       {reminder.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                    </button>
                    <div>
                      <p className={`text-sm font-bold ${reminder.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>{reminder.text}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{reminder.time}</p>
                    </div>
                  </div>
                  <button onClick={() => deleteReminder(reminder.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2">
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* QR Code Section */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-blue-50 border border-blue-50 text-center space-y-6 relative overflow-hidden"
      >
        <div className="space-y-1 relative z-10">
          <h3 className="text-xl font-black text-gray-800">Identity QR</h3>
          <p className="text-xs text-gray-400 font-bold px-4 uppercase tracking-widest">Secure Handshake Protocol</p>
        </div>
        
        <div className="bg-white p-6 rounded-[2.5rem] inline-block shadow-inner border border-gray-100 relative z-10">
          <QRCodeSVG value={patientUrl} size={180} level="H" includeMargin={true} />
        </div>

        <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between mx-auto max-w-[240px] cursor-pointer group active:scale-95 transition-all relative z-10">
           <span className="text-[10px] font-mono text-gray-300 truncate mr-2">{user.id}</span>
           <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] group-hover:text-blue-700">Copy ID</span>
        </div>

        {/* BG decoration */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
      </motion.div>

      {/* Privacy Control */}
      <div className={`p-6 rounded-[2.5rem] shadow-xl border flex items-center justify-between transition-all duration-500 ${isSharing ? 'bg-emerald-50 border-emerald-100 shadow-emerald-50' : 'bg-rose-50 border-rose-100 shadow-rose-50'}`}>
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-3xl ${isSharing ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-200' : 'bg-rose-500 text-white shadow-xl shadow-rose-200'}`}>
            {isSharing ? <ShieldCheck size={28} /> : <ShieldAlert size={28} />}
          </div>
          <div>
            <h4 className="font-extrabold text-gray-800 leading-tight">{isSharing ? 'Live Sharing' : 'Privacy Locked'}</h4>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Status Protocol</p>
          </div>
        </div>
        
        <button 
          onClick={toggleSharing}
          className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${isSharing ? 'bg-emerald-500' : 'bg-gray-300'}`}
        >
          <motion.div 
            animate={{ x: isSharing ? 34 : 4 }}
            className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
          />
        </button>
      </div>

      {/* Action Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Link 
          to="/patient/upload"
          className="bg-white group p-6 rounded-[2.5rem] shadow-xl shadow-gray-100 border border-gray-50 flex flex-col gap-4 hover:border-blue-300 transition-all active:scale-95 text-center"
        >
          <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-200 flex items-center justify-center mx-auto group-hover:rotate-6 transition-transform">
            <Upload size={24} />
          </div>
          <h4 className="font-black text-gray-800 text-sm tracking-tight">Upload</h4>
        </Link>

        <Link 
          to="/patient/timeline"
          className="bg-white group p-6 rounded-[2.5rem] shadow-xl shadow-gray-100 border border-gray-50 flex flex-col gap-4 hover:border-purple-300 transition-all active:scale-95 text-center"
        >
          <div className="w-14 h-14 bg-purple-600 text-white rounded-2xl shadow-xl shadow-purple-200 flex items-center justify-center mx-auto group-hover:-rotate-6 transition-transform">
            <History size={24} />
          </div>
          <h4 className="font-black text-gray-800 text-sm tracking-tight">Timeline</h4>
        </Link>
      </div>
    </div>
  );
}
