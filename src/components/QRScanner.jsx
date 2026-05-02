import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function QRScanner({ onScan, onClose }) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true
    });

    const onScanSuccess = (decodedText) => {
        // Try to extract ID if it's a URL
        let finalId = decodedText;
        if (decodedText.includes('/doctor/patient/')) {
            finalId = decodedText.split('/doctor/patient/').pop();
        }
        onScan(finalId);
        scanner.clear();
    };

    scanner.render(onScanSuccess, (err) => {
        // Silence errors during scanning
    });

    return () => {
      scanner.clear().catch(error => {
        // console.error("Failed to clear scanner. ", error);
      });
    };
  }, [onScan]);

  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden relative shadow-2xl">
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-[110] p-2 bg-white/80 backdrop-blur shadow-md rounded-xl hover:bg-white transition-colors"
        >
            <X size={20} />
        </button>
        <div className="p-6 text-center border-b border-gray-100 bg-white">
            <h3 className="text-xl font-bold text-gray-800">Scan Patient QR</h3>
            <p className="text-xs text-gray-500 font-medium mt-1">Point your camera at the patient's MedVault QR</p>
        </div>
        <div id="reader" className="w-full bg-black min-h-[300px]"></div>
        <div className="p-4 bg-blue-50 text-center">
            <p className="text-[10px] uppercase font-extrabold text-blue-500 tracking-widest">Secure Cloud Inspection Mode</p>
        </div>
      </div>
    </motion.div>
  );
}
