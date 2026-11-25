export interface Coupon { code: string; label: string; type: 'percent' | 'flat'; value: number }
export const coupons: Coupon[] = [
  { code: 'PONGAL10', label: 'Pongal festival offer, 10% off', type: 'percent', value: 10 },
  { code: 'FRIEND500', label: 'Referral reward, flat ₹500 off', type: 'flat', value: 500 },
  { code: 'NEWYEAR15', label: 'New Year offer, 15% off', type: 'percent', value: 15 },
]
export function couponDiscount(code: string, fee: number) {
  const c = coupons.find(x => x.code === code.trim().toUpperCase())
  if (!c) return null
  return { coupon: c, amount: Math.min(fee, c.type === 'percent' ? Math.round(fee * c.value / 100) : c.value) }
}
export const referralCode = (name: string, id: string) => name.split(' ')[0].toUpperCase().slice(0, 5) + id.slice(-3)
