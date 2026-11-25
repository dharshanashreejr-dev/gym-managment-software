import { createContext, useContext, useState, ReactNode } from 'react'
import { GymClass } from '../types'
import { classes as seed } from '../data/mock'
interface Ctx { classes: GymClass[]; book: (classId: string, memberId: string) => string; cancel: (classId: string, memberId: string) => void }
const ClassCtx = createContext<Ctx>({ classes: [], book: () => '', cancel: () => {} })
export const useClasses = () => useContext(ClassCtx)
export function ClassesProvider({ children }: { children: ReactNode }) {
  const [classes, setClasses] = useState<GymClass[]>(seed)
  const book = (classId: string, memberId: string) => {
    const c = classes.find(x => x.id === classId)
    if (!c) return 'Class not found.'
    if (c.booked.includes(memberId) || c.waitlist.includes(memberId)) return 'Already on this class.'
    const full = c.booked.length >= c.capacity
    setClasses(classes.map(x => x.id !== classId ? x : full ? { ...x, waitlist: [...x.waitlist, memberId] } : { ...x, booked: [...x.booked, memberId] }))
    return full ? 'Class is full. Added to the waitlist.' : 'Booked for ' + c.name + '.'
  }
  const cancel = (classId: string, memberId: string) =>
    setClasses(classes.map(x => {
      if (x.id !== classId) return x
      const booked = x.booked.filter(i => i !== memberId)
      const waitlist = x.waitlist.filter(i => i !== memberId)
      if (booked.length < x.booked.length && waitlist.length) booked.push(waitlist.shift()!)
      return { ...x, booked, waitlist }
    }))
  return <ClassCtx.Provider value={{ classes, book, cancel }}>{children}</ClassCtx.Provider>
}
