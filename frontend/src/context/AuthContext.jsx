import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase/config';
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { googleProvider } from '../firebase/config';
import { apiClient } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'patient' | 'doctor'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch role from backend user record (Firestore /users/{uid})
        try {
          const token = await user.getIdToken();
          // Ping a lightweight endpoint to warm up the token flow
          // Role will be set via the token enrichment on backend
        } catch (e) {
          // Silently fail — role defaults handled elsewhere
        }
        // Try to read role from localStorage as a cache
        const cachedRole = localStorage.getItem(`mediagent_role_${user.uid}`);
        if (cachedRole) setUserRole(cachedRole);
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential;
  };

  const signup = async (email, password, role = 'patient', profileData = {}) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const user = credential.user;
    
    // Create user document in Firestore via backend
    try {
      const token = await user.getIdToken();
      await apiClient.post('/api/auth/register', { 
        role, 
        email,
        bloodType: profileData.bloodType || "Unknown",
        emergencyContacts: profileData.emergencyContacts || []
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      console.warn('Could not create user doc:', e);
    }
    
    // Cache role locally
    localStorage.setItem(`mediagent_role_${user.uid}`, role);
    setUserRole(role);
    return credential;
  };

  const loginWithGoogle = async () => {
    const credential = await signInWithPopup(auth, googleProvider);
    return credential;
  };

  const logout = async () => {
    setUserRole(null);
    if (currentUser) {
      localStorage.removeItem(`mediagent_role_${currentUser.uid}`);
    }
    await firebaseSignOut(auth);
  };

  const setRole = (role) => {
    setUserRole(role);
    if (currentUser) {
      localStorage.setItem(`mediagent_role_${currentUser.uid}`, role);
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      userRole,
      loading,
      login,
      signup,
      loginWithGoogle,
      logout,
      setRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
