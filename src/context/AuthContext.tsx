import React, { createContext, useContext, useEffect, useState } from 'react';
import { AdminUser } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabase';

interface AuthContextType {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  lockoutRemaining: number;
}

const AUTH_STORAGE_KEY = 'princelys_tech_admin_session_v2';
const LOCKOUT_KEY = 'princelys_tech_auth_lockout_v2';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    try {
      const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      // Check session expiry (2 hours)
      if (Date.now() - parsed.timestamp > 2 * 60 * 60 * 1000) {
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
        return null;
      }
      return parsed.user;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0);

  // Check lockout on mount and interval
  useEffect(() => {
    const checkLockout = () => {
      try {
        const raw = sessionStorage.getItem(LOCKOUT_KEY);
        if (raw) {
          const { lockedUntil } = JSON.parse(raw);
          const remaining = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
          setLockoutRemaining(remaining);
          if (remaining === 0) {
            sessionStorage.removeItem(LOCKOUT_KEY);
          }
        } else {
          setLockoutRemaining(0);
        }
      } catch {
        setLockoutRemaining(0);
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  // Check Supabase session on mount if configured
  useEffect(() => {
    const initAuth = async () => {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data } = await supabase.auth.getSession();
          if (data?.session?.user) {
            const user = data.session.user;
            const normalizedEmail = (user.email || '').trim().toLowerCase();
            const isOwner = normalizedEmail === 'princely4u112@gmail.com' || normalizedEmail === 'admin@princelystech.ng';

            let adminRecord: any = null;
            try {
              // Try by id first
              const { data: byId } = await supabase
                .from('admin_users')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();

              if (byId) {
                adminRecord = byId;
              } else {
                // Try by email
                const { data: byEmail } = await supabase
                  .from('admin_users')
                  .select('*')
                  .ilike('email', normalizedEmail)
                  .maybeSingle();
                adminRecord = byEmail;
              }
            } catch (e) {
              console.warn('Supabase admin check error:', e);
            }

            if (adminRecord || isOwner) {
              const adminUser: AdminUser = {
                id: adminRecord?.id || user.id,
                email: adminRecord?.email || user.email || normalizedEmail,
                fullName: adminRecord?.full_name || user.user_metadata?.full_name || "Princely's Tech Admin",
                role: (adminRecord?.role as any) || 'super_admin',
              };
              setAdmin(adminUser);
              sessionStorage.setItem(
                AUTH_STORAGE_KEY,
                JSON.stringify({ user: adminUser, timestamp: Date.now() })
              );
            }
          }
        } catch (e) {
          console.warn('Supabase auth session check failed:', e);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const recordFailedAttempt = () => {
    try {
      const raw = sessionStorage.getItem('admin_failed_attempts') || '{"count": 0, "firstAttempt": 0}';
      const parsed = JSON.parse(raw);
      const now = Date.now();
      const count = parsed.count + 1;

      if (count >= MAX_ATTEMPTS) {
        const lockedUntil = now + LOCKOUT_DURATION_MS;
        sessionStorage.setItem(LOCKOUT_KEY, JSON.stringify({ lockedUntil }));
        sessionStorage.removeItem('admin_failed_attempts');
        setLockoutRemaining(LOCKOUT_DURATION_MS / 1000);
      } else {
        sessionStorage.setItem('admin_failed_attempts', JSON.stringify({ count, firstAttempt: parsed.firstAttempt || now }));
      }
    } catch {}
  };

  const clearFailedAttempts = () => {
    sessionStorage.removeItem('admin_failed_attempts');
    sessionStorage.removeItem(LOCKOUT_KEY);
    setLockoutRemaining(0);
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (lockoutRemaining > 0) {
      return {
        success: false,
        error: `Too many failed attempts. Login locked for ${lockoutRemaining} seconds.`,
      };
    }

    if (!email || !password) {
      return { success: false, error: 'Email and password are required.' };
    }

    const cleanEmail = email.trim().toLowerCase();
    const isOwnerEmail = cleanEmail === 'princely4u112@gmail.com' || cleanEmail === 'admin@princelystech.ng';

    // If Supabase is connected, authenticate via Supabase Auth
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error || !data.user) {
          recordFailedAttempt();
          return { success: false, error: error?.message || 'Invalid admin credentials.' };
        }

        // Check admin_users table (by id first, then by email)
        let adminRecord: any = null;
        try {
          const { data: byId } = await supabase
            .from('admin_users')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();

          if (byId) {
            adminRecord = byId;
          } else {
            const { data: byEmail } = await supabase
              .from('admin_users')
              .select('*')
              .ilike('email', cleanEmail)
              .maybeSingle();
            adminRecord = byEmail;
          }
        } catch (tableErr) {
          console.warn('Error checking admin_users table:', tableErr);
        }

        // If not found in admin_users table yet, attempt self-healing upsert for the owner
        if (!adminRecord && isOwnerEmail) {
          try {
            const { data: upserted } = await supabase
              .from('admin_users')
              .upsert({
                id: data.user.id,
                email: cleanEmail,
                full_name: data.user.user_metadata?.full_name || "Princely's Tech Owner",
                role: 'super_admin',
              }, { onConflict: 'id' })
              .select()
              .maybeSingle();

            if (upserted) {
              adminRecord = upserted;
            }
          } catch (upsertErr) {
            console.warn('Self-heal admin_users upsert skipped:', upsertErr);
          }
        }

        // If still not in admin_users and NOT the designated owner email, deny access
        if (!adminRecord && !isOwnerEmail) {
          recordFailedAttempt();
          return {
            success: false,
            error: `Access denied: Account (${cleanEmail}) authenticated, but is not registered in the admin_users table. Run the SQL registration script in Supabase.`,
          };
        }

        const adminUser: AdminUser = {
          id: adminRecord?.id || data.user.id,
          email: adminRecord?.email || cleanEmail,
          fullName: adminRecord?.full_name || data.user.user_metadata?.full_name || "Princely's Tech Admin",
          role: (adminRecord?.role as any) || 'super_admin',
        };

        setAdmin(adminUser);
        clearFailedAttempts();
        sessionStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify({ user: adminUser, timestamp: Date.now() })
        );
        return { success: true };
      } catch (err: any) {
        recordFailedAttempt();
        return { success: false, error: err.message || 'Authentication failed.' };
      }
    }

    // In local sandbox environment (before Supabase credentials are wired)
    // Accept the store owner's official email or standard admin credentials
    if (isOwnerEmail && password.length >= 6) {
      const adminUser: AdminUser = {
        id: 'admin-local-1',
        email: cleanEmail,
        fullName: "Princely's Tech Admin",
        role: 'super_admin',
      };
      setAdmin(adminUser);
      clearFailedAttempts();
      sessionStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ user: adminUser, timestamp: Date.now() })
      );
      return { success: true };
    } else {
      recordFailedAttempt();
      return {
        success: false,
        error: 'Invalid credentials. Enter registered administrator email and secure password.',
      };
    }
  };

  const logout = () => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut().catch(console.warn);
    }
    setAdmin(null);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        isAuthenticated: Boolean(admin),
        isLoading,
        login,
        logout,
        lockoutRemaining,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
