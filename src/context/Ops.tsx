import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Attendance, Trainer, WorkoutPlan } from '../types'
import { trainers as t0, attendance as a0, workouts as w0 } from '../data/mock'
import { useMembers } from './Members'
import { today, loadState, saveState } from '../lib'

export function streakOf(records: Attendance[], memberId: string) {
  const days = new Set(records.filter(r => r.memberId === memberId).map(r => r.date))
  const d = new Date()
  let n = 0
  if (!days.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1)
  while (days.has(d.toISOString().slice(0, 10))) {
    n++
    d.setDate(d.getDate() - 1)
  }
  return n
}

interface Ctx {
  trainers: Trainer[]
  addTrainer: (t: Omit<Trainer, 'id' | 'rating'>) => void
  attendance: Attendance[]
  checkIn: (code: string) => { ok: boolean; msg: string }
  checkOut: (id: string) => void
  workouts: WorkoutPlan[]
  addWorkout: (w: Omit<WorkoutPlan, 'id' | 'date'>) => void
}

const OpsCtx = createContext<Ctx>({} as Ctx)
export const useOps = () => useContext(OpsCtx)

export function OpsProvider({ children }: { children: ReactNode }) {
  const { members } = useMembers()
  const [trainers, setTrainers] = useState(() => loadState('mh-trainers', t0))
  const [attendance, setAttendance] = useState(() => loadState('mh-attendance-v2', a0))
  const [workouts, setWorkouts] = useState(() => loadState('mh-workouts', w0))

  useEffect(() => { saveState('mh-trainers', trainers) }, [trainers])
  useEffect(() => { saveState('mh-attendance-v2', attendance) }, [attendance])
  useEffect(() => { saveState('mh-workouts', workouts) }, [workouts])

  const checkIn = (code: string) => {
    const c = code.trim().toLowerCase()
    const m = members.find(x => x.id.toLowerCase() === c || x.name.toLowerCase() === c)
    if (!m) return { ok: false, msg: 'No member found for this ID or name. Check the code and try again.' }
    if (m.status === 'Expired') return { ok: false, msg: m.name + "'s membership expired on " + m.expiry + '. Record a renewal payment before check-in.' }
    if (m.status === 'Frozen') return { ok: false, msg: m.name + "'s membership is frozen. Unfreeze it before check-in." }
    if (m.status === 'Inactive') return { ok: false, msg: m.name + "'s membership is inactive (cancelled or deactivated)." }
    if (attendance.some(a => a.memberId === m.id && a.date === today() && !a.checkOut)) return { ok: false, msg: m.name + ' is already checked in.' }
    setAttendance([{ id: 'A' + Date.now(), memberId: m.id, memberName: m.name, date: today(), checkIn: new Date().toTimeString().slice(0, 5) }, ...attendance])
    return { ok: true, msg: m.name + ' checked in.' + (m.status === 'Expiring' ? ' Membership expires on ' + m.expiry + '.' : '') }
  }
  const checkOut = (id: string) => setAttendance(attendance.map(a => (a.id === id ? { ...a, checkOut: new Date().toTimeString().slice(0, 5) } : a)))
  const addTrainer = (t: Omit<Trainer, 'id' | 'rating'>) => setTrainers([...trainers, { ...t, id: 'T' + (trainers.length + 1), rating: 4.5 }])
  const addWorkout = (w: Omit<WorkoutPlan, 'id' | 'date'>) => setWorkouts([{ ...w, id: 'W' + (workouts.length + 1), date: today() }, ...workouts])
  return <OpsCtx.Provider value={{ trainers, addTrainer, attendance, checkIn, checkOut, workouts, addWorkout }}>{children}</OpsCtx.Provider>
}
