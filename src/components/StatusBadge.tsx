import { MemberStatus } from '../types'

const tone: Record<MemberStatus, string> = {
  Active: 'text-emerald-800 bg-emerald-50 ring-1 ring-emerald-200/80',
  Expiring: 'text-amber-800 bg-amber-50 ring-1 ring-amber-200/80',
  Expired: 'text-rose-800 bg-rose-50 ring-1 ring-rose-200/80',
  Frozen: 'text-sky-800 bg-sky-50 ring-1 ring-sky-200/80',
  Inactive: 'text-stone-600 bg-stone-100 ring-1 ring-stone-200/80',
}

export default function StatusBadge({ status }: { status: MemberStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wide ${tone[status]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  )
}
