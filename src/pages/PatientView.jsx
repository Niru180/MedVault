import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dbService } from '../services/mockFirebase';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ShieldX, 
  User, 
  Phone, 
  MapPin, 
  History, 
  FileText, 
  ClipboardCheck, 
  Calendar,
  Eye,
  Activity,
  Heart
} from 'lucide-react';

export default function PatientView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [sharing, setSharing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientData = async () => {
      setLoading(true);
      const pData = await dbService.getUser(id);
      const isSharing = await dbService.getSharingStatus(id);
      
      if (pData) {
        setPatient(pData);
        setSharing(isSharing);
        if (isSharing) {
          const rData = await dbService.getPatientRecords(id);
          setRecords(rData);
        }
      }
      setLoading(false);
    };

    fetchPatientData();
  }, [id]);

  const formatDate = (ts) => {
    return new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(ts));
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-gray-400">Loading Patient Data...</div>;

  if (!patient) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6">
          <ShieldX size={40} />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-800">Patient Not Found</h2>
        <p className="text-gray-500 mt-2 font-medium">We couldn't find a patient with ID: {id}</p>
        <button onClick={() => navigate('/doctor/dashboard')} className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold active:scale-95 transition-all">Go Back</button>
      </div>
    );
  }

  if (!sharing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center max-w-sm mx-auto">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-red-100 text-red-600 rounded-[2rem] flex items-center justify-center mb-6 shadow-xl shadow-red-50"
        >
          <ShieldX size={48} />
        </motion.div>
        <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Access Denied</h2>
        <p className="text-gray-500 mt-4 font-medium leading-relaxed">
          The patient <span className="font-bold text-gray-700">{patient.name}</span> has disabled profile sharing. 
          Please ask the patient to enable sharing from their dashboard.
        </p>
        <button onClick={() => navigate('/doctor/dashboard')} className="mt-8 w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 active:scale-95 transition-all flex items-center justify-center gap-2">
          <ArrowLeft size={18} />
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/doctor/dashboard')} className="p-3 bg-white rounded-2xl shadow-sm text-gray-500 transition-all active:scale-90">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Patient Profile</h2>
          <p className="text-sm font-medium text-blue-500 flex items-center gap-1 uppercase tracking-widest font-bold">
            <Activity size={14} /> Shared Access Active
          </p>
        </div>
      </div>

      {/* Patient Profile Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 space-y-8"
      >
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-[2rem] bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100 shadow-inner">
             <User size={48} />
          </div>
          <div>
            <h3 className="text-3xl font-black text-gray-800 leading-tight">{patient.name}</h3>
            <div className="flex gap-4 mt-2">
               <div className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest">
                  <Calendar size={14} /> {patient.age} yrs
               </div>
               <div className="flex items-center gap-2 text-sm font-bold text-red-500 uppercase tracking-widest">
                  <Heart size={14} /> {patient.bloodGroup}
               </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 p-6 rounded-3xl border border-gray-100 font-medium">
           <div className="flex items-start gap-3">
              <MapPin className="text-gray-400 shrink-0 mt-1" size={18} />
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Address</p>
                <p className="text-sm text-gray-700">{patient.address || 'Not Provided'}</p>
              </div>
           </div>
           <div className="flex items-start gap-3">
              <Phone className="text-gray-400 shrink-0 mt-1" size={18} />
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Emergency Contact</p>
                <p className="text-sm text-gray-700">{patient.email}</p>
              </div>
           </div>
        </div>
      </motion.div>

      {/* Patient Records Timeline */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-2xl font-black text-gray-800 tracking-tight">Medical Timeline</h3>
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
             <History size={20} />
          </div>
        </div>

        {records.length > 0 ? (
          <div className="space-y-4">
            {records.map((record, index) => (
              <motion.div 
                key={record.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-blue-200 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${record.type === 'prescription' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                    {record.type === 'prescription' ? <FileText size={24} /> : <ClipboardCheck size={24} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-lg">{record.name}</h4>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{formatDate(record.createdAt)}</p>
                  </div>
                </div>
                <a 
                  href={record.fileURL} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm group-active:scale-90"
                >
                  <Eye size={20} />
                </a>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-[2.5rem] border border-gray-50 text-center">
             <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No Shared Records Found</p>
          </div>
        )}
      </div>
    </div>
  );
}
