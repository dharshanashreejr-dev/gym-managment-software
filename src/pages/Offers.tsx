import { useState } from 'react'
import { useAuth } from '../context/Auth'
import { useMembers } from '../context/Members'
import { coupons, couponDiscount, referralCode } from '../data/offers'
import { inr } from '../lib'
export default function Offers() {
  const { user } = useAuth()
  const { members } = useMembers()
  const me = user?.role === 'member' ? members.find(m => m.name === user.name) : undefined
  const [copied, setCopied] = useState('')
  const [code, setCode] = useState('')
  const [fee, setFee] = useState(1500)
  const res = code.trim() ? couponDiscount(code, fee) : undefined
  const copy = (t: string) => { navigator.clipboard?.writeText(t); setCopied(t); setTimeout(() => setCopied(''), 1500) }
  return (
    <div>
      <h1 className="font-display text-3xl sm:text-4xl font-semibold">Offers and referrals</h1>
      <p className="text-pine/60 mt-1 mb-6">Festival offers, coupon codes and referral rewards</p>
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {coupons.map(c => (
          <div key={c.code} className="card p-5">
            <div className="font-display text-3xl font-semibold text-brass2">{c.type === 'percent' ? c.value + '% off' : inr(c.value) + ' off'}</div>
            <div className="text-sm text-pine/70 mt-1">{c.label}</div>
            <div className="flex items-center justify-between mt-4 border border-dashed border-brass rounded px-3 py-2">
              <span className="font-semibold tracking-wider">{c.code}</span>
              <button className="text-sm text-brass2 font-semibold" onClick={() => copy(c.code)}>{copied === c.code ? 'Copied' : 'Copy'}</button>
            </div>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-6">
          <div className="font-semibold mb-1">{me ? 'Your referral code' : 'Referral codes'}</div>
          <p className="text-sm text-pine/60 mb-4">A friend who joins with this code gets ₹500 off, and the member earns a free week.</p>
          {(me ? [me] : members).map(m => {
            const rc = referralCode(m.name, m.id)
            return <div key={m.id} className="flex items-center justify-between border-t border-line py-2.5 text-sm">
              <span>{m.name}</span><span className="flex items-center gap-3"><span className="font-semibold tracking-wider">{rc}</span><button className="text-brass2 font-semibold" onClick={() => copy(rc)}>{copied === rc ? 'Copied' : 'Copy'}</button></span></div>
          })}
        </div>
        <div className="card p-6">
          <div className="font-semibold mb-4">Check a coupon</div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div><label className="text-sm font-semibold">Fee (₹)</label><input type="number" className="input mt-1" value={fee} onChange={e => setFee(+e.target.value)} /></div>
            <div><label className="text-sm font-semibold">Coupon code</label><input className="input mt-1 uppercase" value={code} onChange={e => setCode(e.target.value)} /></div>
          </div>
          {code.trim() && (res ? <p className="text-sm text-green-700 bg-green-50 rounded px-4 py-3">{res.coupon.label}. Discount {inr(res.amount)}, pay {inr(fee - res.amount)}.</p>
            : <p className="text-sm text-red-700 bg-red-50 rounded px-4 py-3">This code is not valid.</p>)}
          <p className="text-xs text-pine/50 mt-3">Staff can apply a coupon while recording a payment.</p>
        </div>
      </div>
    </div>
  )
}
