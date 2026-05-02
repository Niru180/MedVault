import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dbService, storageService } from '../services/mockFirebase';
import { motion } from 'framer-motion';
import { Upload, FileText, ClipboardCheck, ArrowLeft, CheckCircle, X } from 'lucide-react';

export default function PatientUpload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [type, setType] = useState('prescription');
  const [name, setName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !name) return;

    setIsUploading(true);
    try {
      const fileURL = await storageService.uploadFile(file);
      await dbService.addRecord({
        patientId: user.id,
        name,
        type,
        fileURL
      });
      setIsSuccess(true);
      setTimeout(() => navigate('/patient/timeline'), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle size={48} />
        </motion.div>
        <h2 className="text-3xl font-extrabold text-gray-800">Upload Successful!</h2>
        <p className="text-gray-500 mt-2 font-medium">Redirecting to your timeline...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl shadow-sm text-gray-500 transition-all active:scale-90">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Upload Record</h2>
      </div>

      <form onSubmit={handleUpload} className="space-y-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-blue-50 border border-gray-100">
          <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest px-1 mb-3">Record Type</label>
          <div className="flex gap-4 mb-8">
            <button 
              type="button"
              onClick={() => setType('prescription')}
              className={`flex-1 p-4 rounded-2xl flex flex-col items-center gap-2 font-bold transition-all border-2 ${type === 'prescription' ? 'bg-blue-50 border-blue-600 text-blue-600' : 'bg-gray-50 border-transparent text-gray-400'}`}
            >
              <FileText size={24} />
              Prescription
            </button>
            <button 
              type="button"
              onClick={() => setType('report')}
              className={`flex-1 p-4 rounded-2xl flex flex-col items-center gap-2 font-bold transition-all border-2 ${type === 'report' ? 'bg-purple-50 border-purple-600 text-purple-600' : 'bg-gray-50 border-transparent text-gray-400'}`}
            >
              <ClipboardCheck size={24} />
              Lab Report
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest px-1 mb-2">Record Name / Title</label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Health Checkup - May 2024"
                className="w-full px-5 py-4 bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-0 rounded-2xl transition-all font-medium outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest px-1 mb-2">File Upload</label>
              <div className="relative group">
                <input 
                  type="file" 
                  onChange={handleFileChange}
                  accept="image/*,application/pdf"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  required
                />
                <div className={`p-10 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center gap-3 transition-all ${file ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200 group-hover:border-blue-300'}`}>
                  <div className={`p-4 rounded-2xl ${file ? 'bg-blue-600 text-white' : 'bg-white text-gray-400 shadow-sm'}`}>
                    <Upload size={32} />
                  </div>
                  {file ? (
                    <div className="text-center">
                      <p className="font-bold text-blue-600">{file.name}</p>
                      <p className="text-xs text-blue-400 mt-1 uppercase tracking-widest">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ) : (
                    <div className="text-center">
                       <p className="font-bold text-gray-500 text-lg">Choose File or Drag Here</p>
                       <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">PDF, JPG, PNG up to 10MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <button 
          type="submit"
          disabled={isUploading || !file}
          className={`w-full py-5 rounded-[2rem] font-bold text-xl text-white shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all ${isUploading || !file ? 'bg-gray-300 shadow-none' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'}`}
        >
          {isUploading ? 'Uploading Record...' : 'Complete Upload'}
        </button>
      </form>
    </div>
  );
}
