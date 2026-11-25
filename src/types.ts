export type Role = 'admin' | 'staff' | 'trainer' | 'member'
export interface User { id: string; name: string; email: string; password: string; role: Role }
export type MemberStatus = 'Active' | 'Expiring' | 'Expired' | 'Frozen' | 'Inactive'
export interface Member {
  id: string
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
  expiry: string
  status: MemberStatus
  trainer: string
  /** Outstanding balance from partial payments (₹). */
  balanceDue: number
}
export interface Plan { name: string; months: number; price: number }
export interface Payment {
  id: string
  memberId: string
  memberName: string
  plan: string
  fee: number
  discount: number
  /** Amount actually collected (supports partial payments). */
  amountPaid: number
  mode: 'Cash' | 'UPI' | 'Card'
  date: string
  note?: string
}
export interface Attendance { id: string; memberId: string; memberName: string; date: string; checkIn: string; checkOut?: string }
export interface Trainer { id: string; name: string; specialization: string; timings: string; phone: string; rating: number }
export interface WorkoutPlan { id: string; memberId: string; memberName: string; goal: string; workout: string[]; diet: string[]; date: string }
export interface GymClass { id: string; name: string; trainer: string; slot: string; capacity: number; booked: string[]; waitlist: string[] }
export interface Measurement { id: string; memberId: string; date: string; weight: number; height: number }
