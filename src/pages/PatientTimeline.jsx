import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/mockFirebase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Search, 
  ExternalLink, 
  FileText, 
  ClipboardCheck,
  Calendar,
  ChevronRight,
  Eye,
  FileX
} from 'lucide-react';

export default function PatientTimeline() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) return;
    const init = async () => {
      setLoading(true);
      const data = await dbService.getPatientRecords(user.id);
      setRecords(data);
      setLoading(false);
    };
    init();
  }, [user]);

  const filteredRecords = records.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (ts) => {
    return new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(ts));
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-8 pb-10">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl shadow-sm text-gray-500 transition-all active:scale-90">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Medical Timeline</h2>
            <p className="text-sm font-medium text-gray-400">Chronological history of your health records</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text"
            placeholder="Search records by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white shadow-sm border border-gray-100 rounded-2xl transition-all font-medium outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading timeline...</div>
        ) : filteredRecords.length > 0 ? (
          <div className="relative border-l-2 border-blue-50 ml-6 space-y-8 py-4">
            {filteredRecords.map((record, index) => (
              <motion.div 
                key={record.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-10"
              >
                {/* Timeline Dot */}
                <div className={`absolute left-0 -translate-x-1/2 top-0 w-4 h-4 rounded-full border-4 border-[#f5f7fa] shadow-sm ${record.type === 'prescription' ? 'bg-blue-600' : 'bg-purple-600'}`}></div>
                
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className={`p-3 rounded-2xl ${record.type === 'prescription' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                        {record.type === 'prescription' ? <FileText size={24} /> : <ClipboardCheck size={24} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${record.type === 'prescription' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                            {record.type}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-gray-800 text-lg">{record.name}</h4>
                        <div className="flex items-center gap-2 mt-1 text-gray-400 text-xs font-bold">
                           <Calendar size={14} />
                           {formatDate(record.createdAt)}
                        </div>
                      </div>
                    </div>
                    
                    <a 
                      href={record.fileURL} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-3 bg-gray-50 text-gray-400 group-hover:bg-blue-600 group-hover:text-white rounded-2xl transition-all"
                    >
                      <Eye size={20} />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] p-12 text-center border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
              <FileX size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 font-sans">No Records Found</h3>
            <p className="text-gray-400 mt-2 font-medium max-w-xs mx-auto">Upload your first prescription or report to start building your medical timeline.</p>
            <button 
              onClick={() => navigate('/patient/upload')}
              className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:shadow-lg shadow-blue-100 transition-all active:scale-95"
            >
              Upload Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
