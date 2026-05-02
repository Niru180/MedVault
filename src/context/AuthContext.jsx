import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  db, 
  handleFirestoreError, 
  OperationType 
} from '../services/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      const savedUser = localStorage.getItem('medvault_user');
      if (savedUser) setUser(JSON.parse(savedUser));
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser({ id: firebaseUser.uid, ...userDoc.data() });
          } else {
            setUser({ id: firebaseUser.uid, email: firebaseUser.email, needsOnboarding: true });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser({ id: firebaseUser.uid, email: firebaseUser.email });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (role, email, password) => {
    const mockLogin = () => {
      const users = JSON.parse(localStorage.getItem('medvault_db_users') || '{}');
      const found = Object.values(users).find(u => u.email === email);
      const newUser = found || { 
        id: Math.random().toString(36).substr(2, 9), 
        role, 
        email, 
        name: email.split('@')[0], 
        onboarded: false,
        isMock: true 
      };
      setUser(newUser);
      localStorage.setItem('medvault_user', JSON.stringify(newUser));
      return newUser;
    };

    if (!auth) return mockLogin();

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      let userData;
      if (userDoc.exists()) {
        userData = { id: result.user.uid, ...userDoc.data() };
      } else {
        userData = { id: result.user.uid, email: result.user.email, onboarded: false };
      }
      setUser(userData);
      return userData;
    } catch (error) {
      if (error.code === 'auth/operation-not-allowed') {
        console.warn("Email/Password auth not enabled. Falling back to local storage bypass.");
        return mockLogin();
      }
      throw error;
    }
  };

  const signInWithGoogle = async (role = 'patient') => {
    if (!auth) throw new Error("Firebase not initialized");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists()) {
        const userData = {
          role,
          email: result.user.email,
          name: result.user.displayName,
          onboarded: false,
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', result.user.uid), userData);
        const finalUser = { id: result.user.uid, ...userData };
        setUser(finalUser);
        return finalUser;
      }
      const finalUser = { id: result.user.uid, ...userDoc.data() };
      setUser(finalUser);
      return finalUser;
    } catch (error) {
      if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        throw new Error("Sign-in was cancelled. Please try again.");
      }
      console.error("Google Auth Error:", error);
      throw error;
    }
  };

  const signup = async (role, email, password, extraData = {}) => {
    const mockSignup = () => {
      const newUser = { 
        id: Math.random().toString(36).substr(2, 9), 
        role, 
        email, 
        ...extraData, 
        onboarded: false, 
        isMock: true 
      };
      const users = JSON.parse(localStorage.getItem('medvault_db_users') || '{}');
      users[newUser.id] = newUser;
      localStorage.setItem('medvault_db_users', JSON.stringify(users));
      setUser(newUser);
      localStorage.setItem('medvault_user', JSON.stringify(newUser));
      return newUser;
    };

    if (!auth) return mockSignup();

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const userData = {
        role,
        email,
        onboarded: false,
        ...extraData,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', result.user.uid), userData);
      const finalUser = { id: result.user.uid, ...userData };
      setUser(finalUser);
      return finalUser;
    } catch (error) {
      if (error.code === 'auth/operation-not-allowed') {
        console.warn("Email/Password auth not enabled. Falling back to local storage bypass.");
        return mockSignup();
      }
      handleFirestoreError(error, OperationType.WRITE, 'users');
    }
  };

  const logout = async () => {
    if (!auth) {
      setUser(null);
      localStorage.removeItem('medvault_user');
      return;
    }
    await signOut(auth);
  };

  const updateProfile = async (data) => {
    // If we're in mock mode or Firebase isn't initialized, use local storage
    if (!auth || user?.isMock) {
      const updated = { ...user, ...data };
      setUser(updated);
      localStorage.setItem('medvault_user', JSON.stringify(updated));
      
      const users = JSON.parse(localStorage.getItem('medvault_db_users') || '{}');
      users[user.id] = { ...users[user.id], ...data };
      localStorage.setItem('medvault_db_users', JSON.stringify(users));
      return;
    }

    try {
      // Use the actual authenticated UID as the source of truth for the doc path
      const currentUid = auth.currentUser?.uid;
      const targetId = currentUid || user?.id;
      
      if (!targetId) throw new Error("No user ID found for update");
      
      await updateDoc(doc(db, 'users', targetId), data);
      setUser(prev => ({ ...prev, ...data }));
    } catch (error) {
      const currentUid = auth.currentUser?.uid;
      handleFirestoreError(error, OperationType.UPDATE, `users/${currentUid || user?.id}`);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateProfile, signInWithGoogle, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
