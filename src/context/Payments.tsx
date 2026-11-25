import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Payment } from '../types'
import { payments as seed } from '../data/mock'
import { loadState, saveState } from '../lib'

interface Ctx {
  payments: Payment[]
  recordPayment: (p: Omit<Payment, 'id'>) => Payment
}

const PayCtx = createContext<Ctx>({ payments: [], recordPayment: () => ({} as Payment) })
export const usePayments = () => useContext(PayCtx)

export function PaymentsProvider({ children }: { children: ReactNode }) {
  const [payments, setPayments] = useState<Payment[]>(() =>
    loadState(
      'mh-payments-v2',
      seed.map(p => ({ ...p, amountPaid: p.amountPaid ?? Math.max(0, p.fee - p.discount) })),
    ),
  )

  useEffect(() => { saveState('mh-payments-v2', payments) }, [payments])

  const recordPayment = (p: Omit<Payment, 'id'>) => {
    const full: Payment = {
      ...p,
      id: 'RC' + String(payments.length + 1).padStart(3, '0'),
      amountPaid: p.amountPaid ?? Math.max(0, p.fee - p.discount),
    }
    setPayments([full, ...payments])
    return full
  }

  return <PayCtx.Provider value={{ payments, recordPayment }}>{children}</PayCtx.Provider>
}
