import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/Auth'
import { useMembers } from '../context/Members'
import { usePlans } from '../context/Plans'
import StatusBadge from '../components/StatusBadge'

export default function MemberProfile() {
  const { id } = useParams()
  const { user } = useAuth()
  const {
    members,
    freezeMember,
    unfreezeMember,
    cancelMembership,
    upgradeMembership,
    renewMember,
  } = useMembers()
  const { plans } = usePlans()
  const m = members.find(x => x.id === id)
  const [upgradePlan, setUpgradePlan] = useState('')
  const canManage = user?.role === 'admin' || user?.role === 'staff'

  if (!m) {
    return (
      <div>
        <Link to="/members" className="text-sm text-brass2">Back to members</Link>
        <div className="card mt-4 p-10 text-pine/60">This member was not found.</div>
      </div>
    )
  }

  const days = Math.ceil((new Date(m.expiry).getTime() - Date.now()) / 86400000)
  const price = plans.find(p => p.name === m.plan)?.price
  const otherPlans = plans.filter(p => p.name !== m.plan)

  const personal: [string, string][] = [
    ['Member ID', m.id],
    ['Phone', m.phone],
    ['Email', m.email || '—'],
    ['Age', m.age ? String(m.age) : '—'],
    ['Gender', m.gender],
    ['Birthday', m.birthday || '—'],
    ['Address', m.address || '—'],
    ['Emergency contact', m.emergencyContact || '—'],
    ['Joined', m.joined],
    ['Trainer', m.trainer],
  ]

  const doUpgrade = () => {
    if (!upgradePlan) return
    if (!confirm(`Upgrade ${m.name} to ${upgradePlan}?`)) return
    upgradeMembership(m.id, upgradePlan)
    setUpgradePlan('')
  }

  return (
    <div>
      <Link to="/members" className="text-sm text-brass2">Back to members</Link>
      <div className="flex items-center gap-4 mt-3 mb-6">
        {m.photo ? (
          <img src={m.photo} alt={m.name} className="w-16 h-16 rounded object-cover bg-paper" />
        ) : (
          <div className="w-16 h-16 bg-pine text-brass grid place-items-center font-display text-3xl font-semibold">
            {m.name[0]}
          </div>
        )}
        <div>
          <h1 className="font-display text-4xl font-semibold">{m.name}</h1>
          <StatusBadge status={m.status} />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Personal details</h2>
          {personal.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-2.5 border-t border-line text-sm">
              <span className="text-pine/60 shrink-0">{k}</span>
              <span className="text-right">{v}</span>
            </div>
          ))}
        </div>

        <div className="card p-6">
          <h2 className="font-semibold mb-4">Membership</h2>
          {[
            ['Plan', m.plan],
            ['Plan fee', price ? '₹' + price.toLocaleString('en-IN') : '-'],
            ['Expiry', m.expiry],
            ['Days left', days < 0 ? 'Expired ' + -days + ' days ago' : String(days)],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between py-2.5 border-t border-line text-sm">
              <span className="text-pine/60">{k}</span>
              <span>{v}</span>
            </div>
          ))}

          {canManage && m.status !== 'Inactive' && (
            <div className="mt-6 space-y-3 border-t border-line pt-4">
              <h3 className="text-sm font-semibold text-pine/70">Membership actions (FR-8)</h3>
              <div className="flex flex-wrap gap-2">
                {m.status === 'Frozen' ? (
                  <button type="button" className="btn" onClick={() => unfreezeMember(m.id)}>
                    Unfreeze membership
                  </button>
                ) : (
                  <button
                    type="button"
                    className="border border-line rounded px-4 py-2 text-sm font-semibold"
                    onClick={() => {
                      if (confirm(`Freeze membership for ${m.name}? Check-in will be blocked until unfrozen.`))
                        freezeMember(m.id)
                    }}
                  >
                    Freeze
                  </button>
                )}
                <button
                  type="button"
                  className="border border-red-200 text-red-700 rounded px-4 py-2 text-sm font-semibold"
                  onClick={() => {
                    if (confirm(`Cancel membership for ${m.name}? Status will become Inactive.`))
                      cancelMembership(m.id)
                  }}
                >
                  Cancel membership
                </button>
                <button
                  type="button"
                  className="border border-line rounded px-4 py-2 text-sm font-semibold"
                  onClick={() => {
                    if (confirm(`Renew ${m.name} on current plan (${m.plan})?`))
                      renewMember(m.id, m.plan)
                  }}
                >
                  Renew (same plan)
                </button>
              </div>

              {otherPlans.length > 0 && (
                <div className="flex flex-wrap items-end gap-2 pt-2">
                  <div className="flex-1 min-w-[10rem]">
                    <label className="text-xs font-semibold text-pine/60">Upgrade / change plan</label>
                    <select
                      className="input mt-1"
                      value={upgradePlan}
                      onChange={e => setUpgradePlan(e.target.value)}
                    >
                      <option value="">Select plan…</option>
                      {otherPlans.map(p => (
                        <option key={p.name} value={p.name}>
                          {p.name} (₹{p.price.toLocaleString('en-IN')})
                        </option>
                      ))}
                    </select>
                  </div>
                  <button type="button" className="btn" disabled={!upgradePlan} onClick={doUpgrade}>
                    Upgrade
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
