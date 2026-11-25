import { createContext, useContext, useState, ReactNode } from 'react'
import { User } from '../types'
import { users } from '../data/mock'
interface Ctx { user: User | null; login: (email: string, password: string) => boolean; logout: () => void }
const AuthCtx = createContext<Ctx>({ user: null, login: () => false, logout: () => {} })
export const useAuth = () => useContext(AuthCtx)
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const login = (email: string, password: string) => {
    const u = users.find(x => x.email === email.trim().toLowerCase() && x.password === password)
    setUser(u ?? null)
    return !!u
  }
  return <AuthCtx.Provider value={{ user, login, logout: () => setUser(null) }}>{children}</AuthCtx.Provider>
}
