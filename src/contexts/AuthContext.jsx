import React, { createContext, useContext, useState, useEffect } from 'react';
import { signup, adminLogin, loginUser as loginUserApi, getMe, updateMe, uploadPhoto } from '@/lib/apiClient';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const getBlurStatus = (user) => {
  if (!user) return false;
  if (user.is_blurred !== null && user.is_blurred !== undefined) return user.is_blurred;
  return !!user.user_blur_preference;
};

export const AuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const userToken = localStorage.getItem('token');
        if (userToken) {
          const user = await getMe().catch(() => null);
          if (user) {
            setUserProfile(user);
          } else {
            localStorage.removeItem('token');
          }
        }

        const adminData = localStorage.getItem('adminSession');
        if (adminData) {
          const session = JSON.parse(adminData);
          if (session?.expiresAt > Date.now()) {
            setAdminUser(session.user);
          } else {
            localStorage.removeItem('adminSession');
            localStorage.removeItem('adminToken');
          }
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const loginAdmin = async (email, password) => {
    try {
      const { token, admin } = await adminLogin(email, password);
      localStorage.setItem('adminToken', token);
      const session = {
        user: { ...admin, role: 'admin' },
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      };
      localStorage.setItem('adminSession', JSON.stringify(session));
      setAdminUser(session.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const signupUser = async ({ name, instagram, phone, email }) => {
    const { token, user } = await signup({ name, instagram, phone, email });
    localStorage.setItem('token', token);
    setUserProfile(user);
    return user;
  };

  const loginUser = async ({ phone, email }) => {
    try {
      const { token, user } = await loginUserApi({ phone, email });
      localStorage.setItem('token', token);
      setUserProfile(user);
      return { success: true, user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateProfileData = async (updates) => {
    try {
      // Handle photo upload separately if new photo files present
      if (updates._newPhotoFile) {
        const { photo_url } = await uploadPhoto(updates._newPhotoFile);
        updates = { ...updates, photo_url };
        delete updates._newPhotoFile;
      }
      const updated = await updateMe(updates);
      setUserProfile(updated);
      return updated;
    } catch (err) {
      console.error('Profile update error:', err);
      throw err;
    }
  };

  const logoutAdmin = () => {
    localStorage.removeItem('adminSession');
    localStorage.removeItem('adminToken');
    setAdminUser(null);
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    setUserProfile(null);
  };

  const value = {
    adminUser,
    userProfile,
    loading,
    loginAdmin,
    logoutAdmin,
    signupUser,
    loginUser,
    updateProfileData,
    logoutUser,
    isAdminAuthenticated: !!adminUser,
    isUserAuthenticated: !!userProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
