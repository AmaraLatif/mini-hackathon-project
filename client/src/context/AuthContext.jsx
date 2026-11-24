/** Who is signed in. Keeps the token in localStorage and re-checks it with GET /api/auth/me on page load. */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authLogin, authMe, authSignup } from '@/services/dataService';

const KEY = 'safezone-auth-token';
const read = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
const write = (t) => { try { t ? localStorage.setItem(KEY, t) : localStorage.removeItem(KEY); } catch { /* storage blocked: session lasts until reload */ } };

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(read);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(() => !read()); // false while a saved token is being checked

  const logout = useCallback(() => {
    write(null);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    if (!token) { setReady(true); return undefined; }
    const ctrl = new AbortController();
    authMe(token, { signal: ctrl.signal })
      .then(({ user: u }) => setUser(u))
      .catch((e) => { if (e.name !== 'AbortError' && e.status === 401) logout(); }) // expired / deleted account
      .finally(() => { if (!ctrl.signal.aborted) setReady(true); });
    return () => ctrl.abort();
  }, [token, logout]);

  const accept = useCallback((session) => {
    write(session.token);
    setToken(session.token);
    setUser(session.user);
    return session.user;
  }, []);

  const value = useMemo(() => ({
    token, user, ready, logout,
    isAdmin: user?.role === 'admin',
    login: async (email, password) => accept(await authLogin(email, password)),
    signup: async (form) => accept(await authSignup(form)),
  }), [token, user, ready, logout, accept]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
