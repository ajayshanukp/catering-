import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Role, AccountStatus } from '../../types';
import { workforceService } from '../../services/workforceService';

interface AuthContextType {
  profile: UserProfile | null;
  role: Role | null;
  accountStatus: AccountStatus | null;
  isLoading: boolean;
  isOffline: boolean;
  unreadCount: number;
  pendingPhone: string | null;
  setPendingPhone: (phone: string | null) => void;
  loginWithPhone: (phoneNumber: string) => Promise<boolean>;
  verifyOtp: (code: string) => Promise<UserProfile>;
  logout: () => void;
  switchDevUser: (userId: string) => void;
  refreshProfile: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'cwm_current_auth_uid';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUid, setCurrentUid] = useState<string | null>(() => {
    return localStorage.getItem(CURRENT_USER_KEY) || 'owner_main';
  });
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const loadProfile = (uid: string | null) => {
    if (!uid) {
      setProfile(null);
      setIsLoading(false);
      return;
    }
    const user = workforceService.getUserById(uid);
    setProfile(user || null);
    if (user) {
      const notifs = workforceService.getNotifications(user.uid);
      setUnreadCount(notifs.filter(n => !n.isRead).length);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Subscribe to service updates
    const unsubscribe = workforceService.subscribe(() => {
      if (currentUid) {
        loadProfile(currentUid);
      }
    });

    loadProfile(currentUid);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, [currentUid]);

  const loginWithPhone = async (phoneNumber: string): Promise<boolean> => {
    setPendingPhone(phoneNumber);
    // Simulate OTP generation or trigger Firebase Phone Auth
    return true;
  };

  const verifyOtp = async (code: string): Promise<UserProfile> => {
    if (!pendingPhone) {
      throw new Error('No pending phone number');
    }
    // Any 6-digit code or '123456' accepted in development
    if (code.length !== 6) {
      throw new Error('Please enter a valid 6-digit OTP code');
    }

    const users = workforceService.getUsers();
    let user = users.find(u => u.mobileNumber === pendingPhone);

    if (!user) {
      // New user registering via phone
      const newUid = `user_${Date.now()}`;
      user = {
        uid: newUid,
        role: 'boy', // Default role per PDF
        fullName: '',
        mobileNumber: pendingPhone,
        DOB: '',
        exactPlace: '',
        postOffice: '',
        district: '',
        bloodGroup: '',
        currentCategory: null,
        currentOfficialId: '',
        accountStatus: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      workforceService.saveUserProfile(user);
    }

    localStorage.setItem(CURRENT_USER_KEY, user.uid);
    setCurrentUid(user.uid);
    setProfile(user);
    setPendingPhone(null);
    return user;
  };

  const logout = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    setCurrentUid(null);
    setProfile(null);
  };

  const switchDevUser = (userId: string) => {
    localStorage.setItem(CURRENT_USER_KEY, userId);
    setCurrentUid(userId);
    loadProfile(userId);
  };

  const refreshProfile = () => {
    if (currentUid) loadProfile(currentUid);
  };

  return (
    <AuthContext.Provider
      value={{
        profile,
        role: profile ? profile.role : null,
        accountStatus: profile ? profile.accountStatus : null,
        isLoading,
        isOffline,
        unreadCount,
        pendingPhone,
        setPendingPhone,
        loginWithPhone,
        verifyOtp,
        logout,
        switchDevUser,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
