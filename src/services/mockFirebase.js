import { 
  db, 
  handleFirestoreError, 
  OperationType 
} from './firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  doc, 
  getDoc, 
  updateDoc 
} from 'firebase/firestore';

/**
 * Enhanced Database Service with Firestore support and LocalStorage fallback
 */

const getCollection = (name) => JSON.parse(localStorage.getItem(`medvault_db_${name}`) || '[]');
const saveCollection = (name, data) => localStorage.setItem(`medvault_db_${name}`, JSON.stringify(data));

export const dbService = {
  // Records
  getPatientRecords: async (patientId) => {
    if (!db) {
      const records = getCollection('records');
      return records.filter(r => r.patientId === patientId).sort((a, b) => b.createdAt - a.createdAt);
    }
    
    try {
      const q = query(collection(db, 'records'), where('patientId', '==', patientId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'records');
    }
  },
  
  addRecord: async (record) => {
    if (!db) {
      const records = getCollection('records');
      const newRecord = { ...record, id: Math.random().toString(36).substr(2, 9), createdAt: Date.now() };
      records.push(newRecord);
      saveCollection('records', records);
      return newRecord;
    }

    try {
      const docRef = await addDoc(collection(db, 'records'), {
        ...record,
        createdAt: new Date().toISOString()
      });
      return { id: docRef.id, ...record };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'records');
    }
  },

  // Users
  getUser: async (userId) => {
    if (!db) {
      const users = JSON.parse(localStorage.getItem('medvault_db_users') || '{}');
      return users[userId];
    }
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${userId}`);
    }
  },

  // Privacy
  getSharingStatus: async (userId) => {
    if (!db) {
      const settings = JSON.parse(localStorage.getItem(`medvault_settings_${userId}`) || '{"sharing": false}');
      return settings.sharing;
    }
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      return userDoc.exists() ? userDoc.data().sharingActive : false;
    } catch (error) {
      return false;
    }
  },

  setSharingStatus: async (userId, status) => {
    if (!db) {
      localStorage.setItem(`medvault_settings_${userId}`, JSON.stringify({ sharing: status }));
      return;
    }
    try {
      await updateDoc(doc(db, 'users', userId), { sharingActive: status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  }
};

export const storageService = {
  uploadFile: async (file) => {
    // For now we always use base64 for simplicity in demo environments
    // Real Firebase Storage would be better, but this works serverless/local instantly
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  }
};
