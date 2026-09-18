import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Role, AccountStatus } from '../../types';
import { workforceService } from '../../services/workforceService';
import { auth, db, isFirebaseConfigured } from '../../lib/firebase';
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult, 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

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
  logout: () => Promise<void>;
  refreshProfile: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'cwm_current_auth_uid';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUid, setCurrentUid] = useState<string | null>(() => {
    return localStorage.getItem(CURRENT_USER_KEY) || null;
  });
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const loadProfile = async (uid: string | null) => {
    if (!uid) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    // Try local reactive cache first
    let user = workforceService.getUserById(uid);

    // If online and Firebase is configured, fetch latest from Firestore
    if (isFirebaseConfigured() && navigator.onLine) {
      try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          user = userDoc.data() as UserProfile;
          workforceService.saveUserProfile(user);
        }
      } catch (err) {
        console.warn('Could not fetch user doc from Firestore:', err);
      }
    }

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

    // Listen to Firebase Auth state changes
    let authUnsubscribe = () => {};
    if (isFirebaseConfigured()) {
      authUnsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          localStorage.setItem(CURRENT_USER_KEY, fbUser.uid);
          setCurrentUid(fbUser.uid);
          await loadProfile(fbUser.uid);
        } else {
          // If no user signed in via Firebase, clear session
          localStorage.removeItem(CURRENT_USER_KEY);
          setCurrentUid(null);
          setProfile(null);
          setIsLoading(false);
        }
      });
    } else {
      // Local development or offline load
      loadProfile(currentUid);
    }

    // Subscribe to workforce service updates
    const serviceUnsubscribe = workforceService.subscribe(() => {
      if (currentUid) {
        loadProfile(currentUid);
      }
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      authUnsubscribe();
      serviceUnsubscribe();
    };
  }, [currentUid]);

  const loginWithPhone = async (phoneNumber: string): Promise<boolean> => {
    setPendingPhone(phoneNumber);

    if (isFirebaseConfigured()) {
      try {
        // Prepare invisible reCAPTCHA verifier
        if (!window.recaptchaVerifier) {
          window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
            callback: () => {
              // reCAPTCHA solved
            },
            'expired-callback': () => {
              console.warn('reCAPTCHA expired. Please try again.');
            },
          });
        }

        const confirmation = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
        setConfirmationResult(confirmation);
        window.confirmationResult = confirmation;
        return true;
      } catch (err: any) {
        console.error('Firebase Phone Auth Error:', err);
        // Reset verifier if it failed
        if (window.recaptchaVerifier) {
          try {
            window.recaptchaVerifier.clear();
            delete window.recaptchaVerifier;
          } catch {}
        }
        throw new Error(err.message || 'Failed to send verification SMS');
      }
    }

    // Fallback if Firebase keys are not yet configured in .env
    return true;
  };

  const verifyOtp = async (code: string): Promise<UserProfile> => {
    if (!pendingPhone) {
      throw new Error('No pending phone number');
    }
    if (code.length !== 6) {
      throw new Error('Please enter a valid 6-digit OTP code');
    }

    // 1. If real Firebase Phone Auth confirmation is active
    const activeConfirmation = confirmationResult || window.confirmationResult;
    if (isFirebaseConfigured() && activeConfirmation) {
      try {
        const credential = await activeConfirmation.confirm(code);
        const fbUser = credential.user;
        const uid = fbUser.uid;

        // Fetch or create user record in Firestore
        const userDocRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userDocRef);

        let user: UserProfile;
        if (userSnap.exists()) {
          user = userSnap.data() as UserProfile;
        } else {
          // New worker registering via phone
          user = {
            uid,
            role: 'boy', // Default role per specification
            fullName: '',
            mobileNumber: pendingPhone || fbUser.phoneNumber || '',
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
          await setDoc(userDocRef, user);
        }

        workforceService.saveUserProfile(user);
        localStorage.setItem(CURRENT_USER_KEY, uid);
        setCurrentUid(uid);
        setProfile(user);
        setPendingPhone(null);
        setConfirmationResult(null);
        delete window.confirmationResult;
        return user;
      } catch (err: any) {
        console.error('OTP Verification Error:', err);
        throw new Error(err.message || 'Invalid verification code. Please check and try again.');
      }
    }

    // 2. Direct local verification (when Firebase .env credentials are not yet populated)
    const users = workforceService.getUsers();
    let user = users.find(u => u.mobileNumber === pendingPhone);

    if (!user) {
      const newUid = `usr_${Date.now()}`;
      user = {
        uid: newUid,
        role: 'boy',
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

  const logout = async () => {
    try {
      if (isFirebaseConfigured()) {
        await signOut(auth);
      }
    } catch (e) {
      console.warn('SignOut error:', e);
    }
    localStorage.removeItem(CURRENT_USER_KEY);
    setCurrentUid(null);
    setProfile(null);
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
