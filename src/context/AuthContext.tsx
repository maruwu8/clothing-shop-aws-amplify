import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import {
  signIn as amplifySignIn,
  signUp as amplifySignUp,
  confirmSignUp as amplifyConfirmSignUp,
  signOut as amplifySignOut,
  getCurrentUser,
  fetchAuthSession,
  type SignInInput,
  type SignUpInput,
  type ConfirmSignUpInput,
} from 'aws-amplify/auth';

export interface AuthUser {
  userId: string;
  username: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (input: SignInInput) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  confirmSignUp: (input: ConfirmSignUpInput) => Promise<void>;
  signOut: () => Promise<void>;
  fetchSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkCurrentUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser({
        userId: currentUser.userId,
        username: currentUser.username,
      });
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkCurrentUser();
  }, [checkCurrentUser]);

  const signIn = useCallback(async (input: SignInInput) => {
    await amplifySignIn(input);
    await checkCurrentUser();
  }, [checkCurrentUser]);

  const signUp = useCallback(async (input: SignUpInput) => {
    await amplifySignUp(input);
  }, []);

  const confirmSignUp = useCallback(async (input: ConfirmSignUpInput) => {
    await amplifyConfirmSignUp(input);
  }, []);

  const signOut = useCallback(async () => {
    await amplifySignOut();
    setUser(null);
  }, []);

  const fetchSession = useCallback(async () => {
    await fetchAuthSession();
  }, []);

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        signIn,
        signUp,
        confirmSignUp,
        signOut,
        fetchSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
