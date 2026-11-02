import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { AdminUser, getAdminProfile, loginAdmin, logoutAdmin } from "@/lib/api";

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        const profile = await getAdminProfile();
        if (profile && profile.role === "SUPER_ADMIN") {
          // Super Admin is NOT allowed in Employee Portal
          setUser(null);
          return;
        }
        if (isMounted) setUser(profile);
      } catch {
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    checkSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await loginAdmin(email, pass);
    if (res.user.role === "SUPER_ADMIN") {
      await logoutAdmin();
      throw new Error("हे पोर्टल फक्त विभागीय कर्मचारी व अधिकाऱ्यांसाठी आहे. मुख्य प्रशासकांनी कृपया प्रशासन पोर्टल (Admin Portal) मध्ये लॉगिन करावे.");
    }
    setUser(res.user);
  };

  const logout = async () => {
    try {
      await logoutAdmin();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
