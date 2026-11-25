import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { users } from '../data/mock'
export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState('')
  const submit = (e: FormEvent) => {
    e.preventDefault()
    const clean = email.trim().toLowerCase()
    if (!/^\S+@\S+\.\S+$/.test(clean)) return setErr('Enter a valid email address.')
    // Demo only: no email is really sent. The same message is shown for every address.
    setErr(''); setSent(true)
    void users.some(u => u.email === clean)
  }
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-pine text-white p-14">
        <div className="w-12 h-12 border border-brass text-brass grid place-items-center font-display text-xl font-bold">M&H</div>
        <h1 className="font-display text-6xl font-semibold leading-[1.05]">Muscle &amp; Hustle<br />Gym Studio</h1>
        <div className="text-xs text-white/40">Management software demo</div>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-sm">
          <h2 className="font-display text-4xl font-semibold">Forgot password</h2>
          {sent ? (
            <div className="mt-6">
              <div className="card p-5 text-sm">
                <div className="font-semibold mb-1">Check your email</div>
                <p className="text-pine/70">If <span className="font-semibold">{email.trim()}</span> belongs to a studio account, a reset link has been sent. This is a demo, so no email is actually sent.</p>
              </div>
              <Link to="/login" className="btn block text-center mt-5">Back to sign in</Link>
            </div>
          ) : (
            <form onSubmit={submit}>
              <p className="text-sm text-pine/60 mt-1 mb-8">Enter your account email and we will send a reset link.</p>
              <label className="text-sm font-semibold">Email</label>
              <input className="input mt-1 mb-4" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              {err && <p className="text-sm text-red-700 mb-4">{err}</p>}
              <button className="btn w-full">Send reset link</button>
              <Link to="/login" className="block text-center text-sm text-brass2 font-semibold mt-5">Back to sign in</Link>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
