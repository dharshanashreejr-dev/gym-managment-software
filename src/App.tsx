import { Routes, Route } from 'react-router-dom'
import Layout, { nav } from './components/Layout'
import RequireRole from './components/RequireRole'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import Dues from './pages/Dues'
import Dashboard from './pages/Dashboard'
import Members from './pages/Members'
import MemberProfile from './pages/MemberProfile'
import Plans from './pages/Plans'
import Payments from './pages/Payments'
import Attendance from './pages/Attendance'
import Trainers from './pages/Trainers'
import Workouts from './pages/Workouts'
import Reports from './pages/Reports'
import Classes from './pages/Classes'
import Reminders from './pages/Reminders'
import Progress from './pages/Progress'
import Rewards from './pages/Rewards'
import Crowd from './pages/Crowd'
import Generator from './pages/Generator'
import Facilities from './pages/Facilities'
import Offers from './pages/Offers'
import Feedback from './pages/Feedback'
import { Role } from './types'

function rolesFor(path: string): Role[] | undefined {
  return nav.find(n => n.to === path)?.roles
}

function guard(path: string, el: JSX.Element) {
  return <RequireRole roles={rolesFor(path)}>{el}</RequireRole>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route element={<Layout />}>
        <Route index element={guard('/', <Dashboard />)} />
        <Route path="members" element={guard('/members', <Members />)} />
        <Route path="members/:id" element={<RequireRole>{<MemberProfile />}</RequireRole>} />
        <Route path="plans" element={guard('/plans', <Plans />)} />
        <Route path="payments" element={guard('/payments', <Payments />)} />
        <Route path="attendance" element={guard('/attendance', <Attendance />)} />
        <Route path="trainers" element={guard('/trainers', <Trainers />)} />
        <Route path="workouts" element={guard('/workouts', <Workouts />)} />
        <Route path="reports" element={guard('/reports', <Reports />)} />
        <Route path="classes" element={guard('/classes', <Classes />)} />
        <Route path="dues" element={guard('/dues', <Dues />)} />
        <Route path="reminders" element={guard('/reminders', <Reminders />)} />
        <Route path="progress" element={guard('/progress', <Progress />)} />
        <Route path="rewards" element={guard('/rewards', <Rewards />)} />
        <Route path="crowd" element={guard('/crowd', <Crowd />)} />
        <Route path="generator" element={guard('/generator', <Generator />)} />
        <Route path="facilities" element={guard('/facilities', <Facilities />)} />
        <Route path="offers" element={guard('/offers', <Offers />)} />
        <Route path="feedback" element={guard('/feedback', <Feedback />)} />
      </Route>
    </Routes>
  )
}
