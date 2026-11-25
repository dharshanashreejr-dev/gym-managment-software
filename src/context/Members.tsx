import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Member, MemberStatus } from '../types'
import { members as seed } from '../data/mock'
import { usePlans } from './Plans'
import { loadState, saveState } from '../lib'

export function statusOf(expiry: string, locked?: MemberStatus): MemberStatus {
  if (locked === 'Frozen' || locked === 'Inactive') return locked
  const days = Math.ceil((new Date(expiry).getTime() - Date.now()) / 86400000)
  return days < 0 ? 'Expired' : days <= 7 ? 'Expiring' : 'Active'
}

export function addMonths(date: string, n: number) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + n)
  return d.toISOString().slice(0, 10)
}

export interface NewMember {
  name: string
  phone: string
  email: string
  age: number
  gender: string
  address: string
  emergencyContact: string
  photo: string
  birthday: string
  plan: string
  joined: string
  trainer: string
}

export type MemberUpdate = Partial<Omit<Member, 'id' | 'status'>>

interface Ctx {
  members: Member[]
  addMember: (m: NewMember) => void
  updateMember: (id: string, patch: MemberUpdate) => void
  deactivateMember: (id: string) => void
  renewMember: (id: string, plan: string) => void
  freezeMember: (id: string) => void
  unfreezeMember: (id: string) => void
  cancelMembership: (id: string) => void
  upgradeMembership: (id: string, plan: string) => void
  setBalanceDue: (id: string, amount: number) => void
}

const MembersCtx = createContext<Ctx>({
  members: [],
  addMember: () => {},
  updateMember: () => {},
  deactivateMember: () => {},
  renewMember: () => {},
  freezeMember: () => {},
  unfreezeMember: () => {},
  cancelMembership: () => {},
  upgradeMembership: () => {},
  setBalanceDue: () => {},
})

export const useMembers = () => useContext(MembersCtx)

export function MembersProvider({ children }: { children: ReactNode }) {
  const { plans } = usePlans()
  const [raw, setRaw] = useState<Member[]>(() => loadState('mh-members-v3', seed))

  useEffect(() => { saveState('mh-members-v3', raw) }, [raw])

  const members = raw.map(m => ({
    ...m,
    balanceDue: m.balanceDue ?? 0,
    status: statusOf(m.expiry, m.status === 'Frozen' || m.status === 'Inactive' ? m.status : undefined),
  }))

  const addMember = (m: NewMember) => {
    const months = plans.find(p => p.name === m.plan)?.months ?? 1
    const id = 'MH' + String(raw.length + 1).padStart(3, '0')
    setRaw([
      {
        ...m,
        id,
        expiry: addMonths(m.joined, months),
        status: 'Active',
        age: Number(m.age) || 0,
        email: m.email || '',
        address: m.address || '',
        emergencyContact: m.emergencyContact || '',
        photo: m.photo || '',
        birthday: m.birthday || '',
        balanceDue: 0,
      },
      ...raw,
    ])
  }

  const updateMember = (id: string, patch: MemberUpdate) => {
    setRaw(raw.map(m => (m.id !== id ? m : { ...m, ...patch })))
  }

  const setBalanceDue = (id: string, amount: number) => {
    setRaw(raw.map(m => (m.id !== id ? m : { ...m, balanceDue: Math.max(0, amount) })))
  }

  const deactivateMember = (id: string) => {
    setRaw(raw.map(m => (m.id !== id ? m : { ...m, status: 'Inactive' as MemberStatus })))
  }

  const renewMember = (id: string, plan: string) => {
    const months = plans.find(x => x.name === plan)?.months ?? 1
    const today = new Date().toISOString().slice(0, 10)
    setRaw(
      raw.map(m =>
        m.id !== id
          ? m
          : {
              ...m,
              plan,
              status: 'Active',
              balanceDue: 0,
              expiry: addMonths(m.expiry > today ? m.expiry : today, months),
            },
      ),
    )
  }

  const freezeMember = (id: string) => {
    setRaw(raw.map(m => (m.id !== id ? m : { ...m, status: 'Frozen' as MemberStatus })))
  }

  const unfreezeMember = (id: string) => {
    setRaw(raw.map(m => (m.id !== id ? m : { ...m, status: statusOf(m.expiry) })))
  }

  const cancelMembership = (id: string) => {
    const today = new Date().toISOString().slice(0, 10)
    setRaw(raw.map(m => (m.id !== id ? m : { ...m, status: 'Inactive' as MemberStatus, expiry: today })))
  }

  const upgradeMembership = (id: string, plan: string) => {
    const months = plans.find(x => x.name === plan)?.months ?? 1
    const today = new Date().toISOString().slice(0, 10)
    setRaw(
      raw.map(m =>
        m.id !== id
          ? m
          : {
              ...m,
              plan,
              status: 'Active',
              expiry: addMonths(m.expiry > today ? m.expiry : today, months),
            },
      ),
    )
  }

  return (
    <MembersCtx.Provider
      value={{
        members,
        addMember,
        updateMember,
        deactivateMember,
        renewMember,
        freezeMember,
        unfreezeMember,
        cancelMembership,
        upgradeMembership,
        setBalanceDue,
      }}
    >
      {children}
    </MembersCtx.Provider>
  )
}
