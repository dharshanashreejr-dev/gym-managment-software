import { Measurement, GymClass, Attendance, Member, Payment, Plan, Trainer, User, WorkoutPlan } from '../types'
export const users: User[] = [
  { id: 'u1', name: 'Arjun Kumar', email: 'admin@mhgym.com', password: 'admin123', role: 'admin' },
  { id: 'u2', name: 'Divya Raj', email: 'staff@mhgym.com', password: 'staff123', role: 'staff' },
  { id: 'u3', name: 'Coach Karthik', email: 'trainer@mhgym.com', password: 'trainer123', role: 'trainer' },
  { id: 'u4', name: 'Sanjay M', email: 'member@mhgym.com', password: 'member123', role: 'member' },
]
export const members: Member[] = [
  { id: 'MH001', name: 'Sanjay M', phone: '98430 11122', email: 'sanjay@email.com', age: 28, gender: 'Male', address: '12 Anna Nagar, Chennai', emergencyContact: '98430 00011', photo: '', birthday: '1998-06-15', plan: 'Platinum Yearly', joined: '2026-03-14', expiry: '2027-03-14', status: 'Active', trainer: 'Karthik', balanceDue: 0 },
  { id: 'MH002', name: 'Priya S', phone: '99524 33445', email: 'priya@email.com', age: 24, gender: 'Female', address: '45 T Nagar, Chennai', emergencyContact: '99524 00022', photo: '', birthday: '2002-03-22', plan: 'Gold Quarterly', joined: '2026-09-01', expiry: '2026-12-01', status: 'Expiring', trainer: 'Meena', balanceDue: 1200 },
  { id: 'MH003', name: 'Vignesh R', phone: '90030 55667', email: 'vignesh@email.com', age: 31, gender: 'Male', address: '8 Adyar, Chennai', emergencyContact: '90030 00033', photo: '', birthday: '1995-11-08', plan: 'Silver Monthly', joined: '2026-10-28', expiry: '2026-11-28', status: 'Expiring', trainer: 'Karthik', balanceDue: 500 },
  { id: 'MH004', name: 'Harini K', phone: '97890 77889', email: 'harini@email.com', age: 26, gender: 'Female', address: '22 Velachery, Chennai', emergencyContact: '97890 00044', photo: '', birthday: '2000-01-30', plan: 'Platinum Yearly', joined: '2026-08-02', expiry: '2027-08-02', status: 'Active', trainer: 'Meena', balanceDue: 0 },
  { id: 'MH005', name: 'Naveen P', phone: '88700 99001', email: 'naveen@email.com', age: 29, gender: 'Male', address: '3 Porur, Chennai', emergencyContact: '88700 00055', photo: '', birthday: '1997-09-12', plan: 'Gold Quarterly', joined: '2026-07-20', expiry: '2026-10-20', status: 'Expired', trainer: 'Ravi', balanceDue: 0 },
  { id: 'MH006', name: 'Lakshmi T', phone: '94430 22110', email: 'lakshmi@email.com', age: 22, gender: 'Female', address: '19 Mylapore, Chennai', emergencyContact: '94430 00066', photo: '', birthday: '2004-05-05', plan: 'Silver Monthly', joined: '2026-11-18', expiry: '2026-12-18', status: 'Active', trainer: 'Ravi', balanceDue: 0 },
]
export const plans: Plan[] = [
  { name: 'Silver Monthly', months: 1, price: 1500 },
  { name: 'Gold Quarterly', months: 3, price: 4000 },
  { name: 'Platinum Yearly', months: 12, price: 14000 },
]
export const trainerNames = ['Karthik', 'Meena', 'Ravi']
const d = (n: number) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10)
export const payments: Payment[] = [
  { id: 'RC005', memberId: 'MH006', memberName: 'Lakshmi T', plan: 'Silver Monthly', fee: 1500, discount: 0, amountPaid: 1500, mode: 'UPI', date: d(0) },
  { id: 'RC004', memberId: 'MH004', memberName: 'Harini K', plan: 'Platinum Yearly', fee: 14000, discount: 1000, amountPaid: 13000, mode: 'Card', date: d(3) },
  { id: 'RC003', memberId: 'MH003', memberName: 'Vignesh R', plan: 'Silver Monthly', fee: 1500, discount: 0, amountPaid: 1000, mode: 'Cash', date: d(28), note: 'Partial payment' },
  { id: 'RC002', memberId: 'MH002', memberName: 'Priya S', plan: 'Gold Quarterly', fee: 4000, discount: 200, amountPaid: 2800, mode: 'UPI', date: d(85), note: 'Partial payment' },
  { id: 'RC001', memberId: 'MH001', memberName: 'Sanjay M', plan: 'Platinum Yearly', fee: 14000, discount: 0, amountPaid: 14000, mode: 'Card', date: d(256) },
]
export const trainers: Trainer[] = [
  { id: 'T1', name: 'Karthik', specialization: 'Strength and bodybuilding', timings: '6 AM - 2 PM', phone: '98430 10101', rating: 4.8 },
  { id: 'T2', name: 'Meena', specialization: 'Yoga and mobility', timings: '6 AM - 12 PM', phone: '99524 20202', rating: 4.9 },
  { id: 'T3', name: 'Ravi', specialization: 'CrossFit and fat loss', timings: '2 PM - 10 PM', phone: '90030 30303', rating: 4.7 },
]
export const attendance: Attendance[] = [
  { id: 'A1', memberId: 'MH004', memberName: 'Harini K', date: d(0), checkIn: '06:30', checkOut: '07:45' },
  { id: 'A2', memberId: 'MH006', memberName: 'Lakshmi T', date: d(0), checkIn: '07:15' },
  ...[1, 2, 3, 4].map(n => ({ id: 'H' + n, memberId: 'MH001', memberName: 'Sanjay M', date: d(n), checkIn: '18:00', checkOut: '19:10' })),
]
export const workouts: WorkoutPlan[] = [
  { id: 'W1', memberId: 'MH001', memberName: 'Sanjay M', goal: 'Muscle gain', date: d(10),
    workout: ['Mon: Chest and triceps', 'Tue: Back and biceps', 'Wed: Legs and core', 'Thu: Shoulders and abs', 'Fri: Full body strength', 'Sat: Light cardio, 20 min', 'Sun: Rest'],
    diet: ['Breakfast: Egg omelette, oats, banana', 'Lunch: Rice, chicken curry, vegetables', 'Evening: Peanut butter toast, milk', 'Dinner: Chapati, paneer or fish, salad'] },
]
export const classes: GymClass[] = [
  { id: 'C1', name: 'Yoga Flow', trainer: 'Meena', slot: 'Mon 6:30 AM', capacity: 3, booked: ['MH004', 'MH006'], waitlist: [] },
  { id: 'C2', name: 'HIIT Burn', trainer: 'Ravi', slot: 'Tue 7:00 PM', capacity: 4, booked: ['MH001'], waitlist: [] },
  { id: 'C3', name: 'CrossFit Basics', trainer: 'Ravi', slot: 'Wed 6:00 PM', capacity: 2, booked: ['MH001', 'MH004'], waitlist: ['MH006'] },
  { id: 'C4', name: 'Strength 101', trainer: 'Karthik', slot: 'Thu 6:30 AM', capacity: 5, booked: [], waitlist: [] },
  { id: 'C5', name: 'Zumba Party', trainer: 'Meena', slot: 'Sat 8:00 AM', capacity: 6, booked: [], waitlist: [] },
]
export const measurements: Measurement[] = [
  { id: 'M1', memberId: 'MH001', date: d(60), weight: 86, height: 175 },
  { id: 'M2', memberId: 'MH001', date: d(45), weight: 84.5, height: 175 },
  { id: 'M3', memberId: 'MH001', date: d(30), weight: 83, height: 175 },
  { id: 'M4', memberId: 'MH001', date: d(14), weight: 81.5, height: 175 },
  { id: 'M5', memberId: 'MH001', date: d(3), weight: 80.5, height: 175 },
  { id: 'M6', memberId: 'MH004', date: d(40), weight: 62, height: 160 },
  { id: 'M7', memberId: 'MH004', date: d(10), weight: 60.5, height: 160 },
]
export const goals: Record<string, number> = { MH001: 78, MH004: 58 }
