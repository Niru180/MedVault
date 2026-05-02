import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartPulse, Stethoscope, Mail, Lock, ArrowRight, User } from 'lucide-react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isPatient, setIsPatient] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const { login, signup, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (val) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!val) return "Email is required";
    if (!emailRegex.test(val)) return "Invalid email format";
    return "";
  };

  const validatePassword = (val) => {
    if (!val) return "Password is required";
    if (val.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    setErrors(prev => ({ ...prev, email: validateEmail(val) }));
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    setErrors(prev => ({ ...prev, password: validatePassword(val) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    
    if (emailErr || passErr) {
      setErrors({ email: emailErr, password: passErr });
      return;
    }
    
    try {
      let loggedInUser;
      if (isLogin) {
        loggedInUser = await login(isPatient ? 'patient' : 'doctor', email, password);
      } else {
        loggedInUser = await signup(isPatient ? 'patient' : 'doctor', email, password, { onboarded: false });
      }

      if (!loggedInUser.onboarded) {
        navigate('/onboarding');
      } else {
        navigate(isPatient ? '/patient/dashboard' : '/doctor/dashboard');
      }
    } catch (err) {
      console.error(err);
      setErrors(prev => ({ ...prev, auth: err.message || "Authentication failed. Please check your credentials." }));
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const gUser = await signInWithGoogle(isPatient ? 'patient' : 'doctor');
      if (!gUser.onboarded) {
        navigate('/onboarding');
      } else {
        navigate(isPatient ? '/patient/dashboard' : '/doctor/dashboard');
      }
    } catch (err) {
      setErrors(prev => ({ ...prev, auth: err.message || "Google Sign-In failed. Please try again." }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="inline-flex p-4 rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-200 mb-4">
            <HeartPulse size={40} />
          </div>
          <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight">MedVault</h1>
          <p className="text-gray-500 mt-2 font-medium">Your Health Records, Anywhere.</p>
        </div>

        <div className="bg-white p-2 rounded-[2rem] shadow-2xl shadow-blue-100 mb-6 flex overflow-hidden border border-gray-100">
          <button 
            onClick={() => setIsPatient(true)}
            className={`flex-1 py-4 px-4 rounded-[1.5rem] flex items-center justify-center gap-2 font-bold transition-all duration-300 ${isPatient ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <User size={20} />
            Patient
          </button>
          <button 
            onClick={() => setIsPatient(false)}
            className={`flex-1 py-4 px-4 rounded-[1.5rem] flex items-center justify-center gap-2 font-bold transition-all duration-300 ${!isPatient ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Stethoscope size={20} />
            Doctor
          </button>
        </div>

        <motion.div 
          layout
          className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-blue-100 border border-gray-100"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>

            {errors.auth && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold text-center"
              >
                {errors.auth}
              </motion.div>
            )}
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 px-1">Email Address</label>
              <div className="relative">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${errors.email ? 'text-red-400' : 'text-gray-400'}`} />
                <input 
                  type="email" 
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="name@example.com"
                  className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-2 focus:bg-white focus:ring-0 rounded-2xl transition-all font-medium outline-none ${errors.email ? 'border-red-100 focus:border-red-400' : 'border-transparent focus:border-blue-500'}`}
                  required
                />
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-500 text-xs font-bold mt-2 px-1"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 px-1">Password</label>
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${errors.password ? 'text-red-400' : 'text-gray-400'}`} />
                <input 
                  type="password" 
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-2 focus:bg-white focus:ring-0 rounded-2xl transition-all font-medium outline-none ${errors.password ? 'border-red-100 focus:border-red-400' : 'border-transparent focus:border-blue-500'}`}
                  required
                />
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-500 text-xs font-bold mt-2 px-1"
                  >
                    {errors.password}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <button 
              type="submit"
              disabled={!!(errors.email || errors.password || !email || !password)}
              className={`w-full py-4 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
                errors.email || errors.password || !email || !password
                  ? 'bg-gray-300 shadow-none cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
              }`}
            >
              {isLogin ? 'Sign In' : 'Sign Up'}
              <ArrowRight size={20} />
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-100"></div>
              <span className="flex-shrink mx-4 text-gray-300 text-[10px] font-bold uppercase tracking-widest">Or continue with</span>
              <div className="flex-grow border-t border-gray-100"></div>
            </div>

            <button 
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-4 bg-white border-2 border-gray-100 text-gray-700 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
              Google
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm font-medium">
              {isLogin ? "New to MedVault?" : "Already have an account?"}{' '}
              <span 
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 cursor-pointer hover:underline font-bold"
              >
                {isLogin ? "Create an account" : "Sign in instead"}
              </span>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
