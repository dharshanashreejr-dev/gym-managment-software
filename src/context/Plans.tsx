import { createContext, useContext, useState, ReactNode } from 'react'
import { Plan } from '../types'
import { plans as seed } from '../data/mock'
interface Ctx { plans: Plan[]; addPlan: (p: Plan) => void; updatePlan: (p: Plan) => void }
const PlansCtx = createContext<Ctx>({ plans: [], addPlan: () => {}, updatePlan: () => {} })
export const usePlans = () => useContext(PlansCtx)
export function PlansProvider({ children }: { children: ReactNode }) {
  const [plans, setPlans] = useState<Plan[]>(seed)
  return <PlansCtx.Provider value={{ plans, addPlan: p => setPlans([...plans, p]), updatePlan: p => setPlans(plans.map(x => x.name === p.name ? p : x)) }}>{children}</PlansCtx.Provider>
}
