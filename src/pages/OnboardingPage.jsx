import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, ClipboardList, MapPin, Calendar, Heart } from 'lucide-react';

export default function OnboardingPage() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const isPatient = user?.role === 'patient';

  React.useEffect(() => {
    if (user?.onboarded) {
      navigate(isPatient ? '/patient/dashboard' : '/doctor/dashboard');
    }
  }, [user, isPatient, navigate]);

  const [formData, setFormData] = useState(isPatient ? {
    name: '',
    age: '',
    gender: 'Male',
    bloodGroup: 'O+',
    address: ''
  } : {
    name: '',
    degree: '',
    address: ''
  });

  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return value.trim().length < 2 ? 'Name is too short' : '';
      case 'age':
        return (parseInt(value) <= 0 || parseInt(value) > 120) ? 'Enter a valid age' : '';
      case 'address':
        return value.trim().length < 5 ? 'Address is too short' : '';
      case 'degree':
        return value.trim().length < 2 ? 'Degree is required' : '';
      default:
        return '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all fields on submit
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    updateProfile({ ...formData, onboarded: true });
    navigate(isPatient ? '/patient/dashboard' : '/doctor/dashboard');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] p-6 flex flex-col items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl bg-white rounded-[2.5rem] shadow-xl overflow-hidden"
      >
        <div className="bg-blue-600 p-8 text-white">
          <h2 className="text-3xl font-extrabold tracking-tight">Welcome to MedVault</h2>
          <p className="opacity-80 mt-1 font-medium">Let's set up your profile to get started.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="text-sm font-bold text-gray-500 uppercase tracking-widest px-1 block mb-2">Full Name</label>
              <div className="relative">
                <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${errors.name ? 'text-red-400' : 'text-gray-400'}`} />
                <input 
                  type="text" name="name" required
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  style={{ backgroundColor: '#fbf9fb' }}
                  className={`w-full pl-12 pr-4 py-4 border-2 focus:bg-white focus:ring-0 rounded-2xl transition-all outline-none ${errors.name ? 'border-red-100 focus:border-red-400' : 'border-transparent focus:border-blue-500'}`}
                />
              </div>
              {errors.name && <p className="text-red-500 text-xs font-bold mt-2 px-1">{errors.name}</p>}
            </div>

            {isPatient ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-widest px-1 block mb-2">Age</label>
                    <div className="relative">
                      <Calendar className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${errors.age ? 'text-red-400' : 'text-gray-400'}`} />
                      <input 
                        type="number" name="age" required
                        placeholder="25"
                        value={formData.age}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-2 focus:bg-white focus:ring-0 rounded-2xl transition-all outline-none ${errors.age ? 'border-red-100 focus:border-red-400' : 'border-transparent focus:border-blue-500'}`}
                      />
                    </div>
                    {errors.age && <p className="text-red-500 text-xs font-bold mt-2 px-1">{errors.age}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-widest px-1 block mb-2">Blood Group</label>
                    <div className="relative">
                      <Heart className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select 
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-0 rounded-2xl transition-all outline-none appearance-none"
                      >
                        <option>O+</option>
                        <option>O-</option>
                        <option>A+</option>
                        <option>A-</option>
                        <option>B+</option>
                        <option>B-</option>
                        <option>AB+</option>
                        <option>AB-</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-widest px-1 block mb-2">Gender</label>
                  <div className="flex gap-4">
                    {['Male', 'Female', 'Other'].map(g => (
                      <button 
                        key={g} type="button"
                        onClick={() => setFormData({ ...formData, gender: g })}
                        style={g === 'Male' ? { borderColor: '#fc7bdc' } : {}}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all ${formData.gender === g ? 'bg-blue-100 text-blue-600 border-2' : 'bg-gray-50 text-gray-400 border-2 border-transparent'}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className="text-sm font-bold text-gray-500 uppercase tracking-widest px-1 block mb-2">Medical Degree</label>
                <div className="relative">
                  <ClipboardList className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${errors.degree ? 'text-red-400' : 'text-gray-400'}`} />
                  <input 
                    type="text" name="degree" required
                    placeholder="MBBS, MD Cardiology"
                    value={formData.degree}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-2 focus:bg-white focus:ring-0 rounded-2xl transition-all outline-none ${errors.degree ? 'border-red-100 focus:border-red-400' : 'border-transparent focus:border-blue-500'}`}
                  />
                </div>
                {errors.degree && <p className="text-red-500 text-xs font-bold mt-2 px-1">{errors.degree}</p>}
              </div>
            )}

            <div>
              <label className="text-sm font-bold text-gray-500 uppercase tracking-widest px-1 block mb-2">Address</label>
              <div className="relative">
                <MapPin className={`absolute left-4 top-4 w-5 h-5 transition-colors ${errors.address ? 'text-red-400' : 'text-gray-400'}`} />
                <textarea 
                  name="address" required
                  placeholder="123 Street, City, Country"
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-2 focus:bg-white focus:ring-0 rounded-2xl transition-all outline-none resize-none ${errors.address ? 'border-red-100 focus:border-red-400' : 'border-transparent focus:border-blue-500'}`}
                />
              </div>
              {errors.address && <p className="text-red-500 text-xs font-bold mt-2 px-1">{errors.address}</p>}
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95"
          >
            Complete Setup
          </button>
        </form>
      </motion.div>
    </div>
  );
}
