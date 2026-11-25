
import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from '../types'
import { users } from '../data/mock'

interface Ctx {
  user: User | null
  login: (email: string, password: string) => boolean
  logout: () => void
}

const AuthCtx = createContext<Ctx>({
  user: null,
  login: () => false,
  logout: () => {},
})

export const useAuth = () => useContext(AuthCtx)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = (email: string, password: string): boolean => {
    const u = users.find(
      x =>
        x.email === email.trim().toLowerCase() &&
        x.password === password
    )

    setUser(u ?? null)
    return !!u
  }

  const logout = () => setUser(null)

  return (
    <AuthCtx.Provider value={{ user, login, logout }}>
      {children}
    </AuthCtx.Provider>
  )
}
