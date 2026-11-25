import { createContext, useContext, useState, ReactNode } from 'react'
import { Measurement } from '../types'
import { measurements as m0, goals as g0 } from '../data/mock'
interface Ctx { measurements: Measurement[]; goals: Record<string, number>; addMeasurement: (m: Omit<Measurement, 'id'>) => void; setGoal: (id: string, w: number) => void }
const ProgCtx = createContext<Ctx>({} as Ctx)
export const useProgress = () => useContext(ProgCtx)
export function ProgressProvider({ children }: { children: ReactNode }) {
  const [measurements, setM] = useState(m0)
  const [goals, setG] = useState(g0)
  return <ProgCtx.Provider value={{
    measurements, goals,
    addMeasurement: m => setM([...measurements, { ...m, id: 'M' + Date.now() }]),
    setGoal: (id, w) => setG({ ...goals, [id]: w }),
  }}>{children}</ProgCtx.Provider>
}
