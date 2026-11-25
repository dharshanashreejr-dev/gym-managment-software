
import { useState, useEffect, useRef } from 'react'
import type { FormEvent, MouseEvent } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { useAuth } from '../context/Auth'
import { users } from '../data/mock'

const PLATES = [20, 20, 15, 10, 5, 2.5]
const BARCODE = [2,1,3,1,1,2,4,1,2,1,3,2,1,1,4,2,1,3,1,2,2,1,1,3,2,4,1,2,1,1,3,1,2,2,1,4,1,2,3,1,2,1]
const TICKER = ['Members', 'Payments', 'Attendance', 'Trainers', 'Classes', 'Reports']

const QUOTES = [
  'A well-run gym changes lives, one member at a time.',
  'Track every member. Retain every member.',
  'What gets measured gets improved.',
  'Every check-in is a member choosing you again.',
  'Great gyms are built on discipline, not discounts.',
  'Strong systems build strong members.',
]

const plateClass = (kg: number) =>
  kg >= 20 ? 'p20' : kg >= 15 ? 'p15' : kg >= 10 ? 'p10' : kg >= 5 ? 'p5' : 'p2'

const stage = (n: number) =>
  n === 0 ? 'Empty bar' : n <= 2 ? 'Warm-up set' : n <= 4 ? 'Working set' : n < 6 ? 'Heavy single' : 'PR attempt'

export default function Login() {
  const { user, login } = useAuth()
  const go = useNavigate()

  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fail, setFail] = useState(false)
  const [now, setNow] = useState(() => new Date())
  const [kg, setKg] = useState(20)
  const [qi, setQi] = useState(0)

  const fitRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const tiltRef = useRef<HTMLDivElement>(null)
  const submitTimer = useRef<number | null>(null)
  const failTimer = useRef<number | null>(null)

  const loaded =
    !email && !pw
      ? 0
      : Math.min(
          PLATES.length,
          Math.ceil(email.length / 7) + Math.floor(pw.length / 2)
        )

  const targetKg =
    20 + 2 * PLATES.slice(0, loaded).reduce((a, b) => a + b, 0)

  // Clock
  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date())
    }, 30000)

    return () => window.clearInterval(timer)
  }, [])

  // Rotating quotes
  useEffect(() => {
    const timer = window.setInterval(() => {
      setQi(i => (i + 1) % QUOTES.length)
    }, 6000)

    return () => window.clearInterval(timer)
  }, [])

  // Responsive screen fitting
  useEffect(() => {
    const fit = () => {
      const root = rootRef.current
      if (!root) return

      const el = fitRef.current

      // Do not apply desktop scaling on mobile/tablet
      if (window.innerWidth <= 980) {
        root.style.setProperty('--bs', '1')
        if (el) el.style.transform = 'none'
        return
      }

      const h = window.innerHeight
      const w = window.innerWidth

      const bs = Math.max(
        0.42,
        Math.min(1, h / 900, w / 1400 + 0.15)
      )

      root.style.setProperty('--bs', String(bs))

      if (el) {
        el.style.transform = 'none'

        const naturalHeight = el.offsetHeight
        const scale = Math.max(
          0.55,
          Math.min(1, (h - 24) / naturalHeight)
        )

        el.style.transform = `scale(${scale})`
      }
    }

    fit()

    const timer = window.setTimeout(fit, 60)
    window.addEventListener('resize', fit)

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('resize', fit)
    }
  }, [])

  // Animated weight readout
  useEffect(() => {
    let raf = 0

    const animate = () => {
      setKg(current => {
        const difference = targetKg - current

        if (Math.abs(difference) < 0.6) {
          return targetKg
        }

        return current + difference * 0.16
      })

      raf = requestAnimationFrame(animate)
    }

    raf = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(raf)
  }, [targetKg])

  // Cleanup pending timers
  useEffect(() => {
    return () => {
      if (submitTimer.current !== null) {
        window.clearTimeout(submitTimer.current)
      }

      if (failTimer.current !== null) {
        window.clearTimeout(failTimer.current)
      }
    }
  }, [])

  if (user) {
    return <Navigate to="/" replace />
  }

  // Login submit
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (loading) return

    setErr('')
    setLoading(true)

    submitTimer.current = window.setTimeout(() => {
      const success = login(email, pw)

      if (success) {
        go('/', { replace: true })
      } else {
        setLoading(false)
        setErr('Email or password is incorrect. Use one of the demo passes below.')
        setFail(true)

        failTimer.current = window.setTimeout(() => {
          setFail(false)
        }, 800)
      }
    }, 750)
  }

  // Background parallax
  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const root = rootRef.current

    if (root) {
      const nx = e.clientX / window.innerWidth - 0.5
      const ny = e.clientY / window.innerHeight - 0.5

      root.style.setProperty('--mx', String(nx))
      root.style.setProperty('--my', String(ny))
    }
  }

  // Login card tilt
  const tilt = (e: MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth <= 980) return

    const el = tiltRef.current
    if (!el) return

    const rect = el.getBoundingClientRect()

    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5

    el.style.transform =
      `perspective(1100px) rotateY(${x * 7}deg) rotateX(${-y * 6}deg)`
  }

  const untilt = () => {
    if (tiltRef.current) {
      tiltRef.current.style.transform = ''
    }
  }

  const hour = now.getHours()

  const greet =
    hour < 12
      ? 'Good morning'
      : hour < 17
        ? 'Good afternoon'
        : 'Good evening'

  const clock = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const leftPlates = PLATES
    .slice(0, loaded)
    .map((p, i) => ({ p, i }))
    .reverse()

  const rightPlates = PLATES
    .slice(0, loaded)
    .map((p, i) => ({ p, i }))

  const barState = loading ? 'lift' : fail ? 'drop' : 'idle'

  return (
    <div className="mhx" ref={rootRef} onMouseMove={onMove}>
      <style>{CSS}</style>

      {/* LEFT - THE STAGE */}
      <section className="mhx-stage" aria-hidden="true">
        <div className="mhx-spot" />

        <header className="mhx-top">
          <div className="mhx-mark">
            M<span>&amp;</span>H
          </div>

          <div className="mhx-top-meta">
            <b>Muscle &amp; Hustle</b>
            <i>Gym Studio · Coimbatore</i>
          </div>

          <div className="mhx-clock">
            <em />
            Open · {clock}
          </div>
        </header>

        <div className="mhx-headline">
          <span className="mhx-greet">{greet}.</span>

          <h1>
            <span className="o o1">Earn</span>
            <span className="o o2">your</span>
            <span className="f">sweat.</span>
          </h1>
        </div>

        {/* BARBELL */}
        <div className="mhx-rig">
          <div className="mhx-readout">
            <div className="mhx-kg">
              <b>{Math.round(kg)}</b>
              <small>kg</small>
            </div>

            <div className="mhx-state">
              <span>On the bar</span>
              <strong>{stage(loaded)}</strong>
            </div>
          </div>

          <div className="mhx-barbox">
            <div className={`mhx-lifter ${barState}`}>
              <div className="mhx-barbell">
                <div className="mhx-rod" />
                <div className="mhx-shaft" />

                <div className="mhx-zone l">
                  <span className="mhx-collar" />

                  {leftPlates.map(({ p, i }) => (
                    <span
                      key={i}
                      className={`mhx-plate ${plateClass(p)}`}
                      style={{
                        ['--h' as string]: `${46 + p * 5.2}px`,
                      }}
                    >
                      <em>{p}</em>
                    </span>
                  ))}
                </div>

                <div className="mhx-zone r">
                  <span className="mhx-collar" />

                  {rightPlates.map(({ p, i }) => (
                    <span
                      key={i}
                      className={`mhx-plate ${plateClass(p)}`}
                      style={{
                        ['--h' as string]: `${46 + p * 5.2}px`,
                      }}
                    >
                      <em>{p}</em>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mhx-platform" />
            <div className="mhx-platform-glow" />
          </div>

          <p className="mhx-hint">
            Fill in your details — the bar loads as you go.
          </p>
        </div>

        <figure className="mhx-quote" key={qi}>
          <blockquote>“{QUOTES[qi]}”</blockquote>
        </figure>

        <div className="mhx-ticker">
          <div className="mhx-ticker-track">
            {[...TICKER, ...TICKER, ...TICKER, ...TICKER].map((t, i) => (
              <span key={i}>
                {t}
                <i />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* RIGHT - ACCESS PASS */}
      <section className="mhx-side">
        <div className="mhx-fit" ref={fitRef}>
          <div
            className="mhx-swing"
            onMouseMove={tilt}
            onMouseLeave={untilt}
          >
            <div className="mhx-strap">
              <span>
                MUSCLE &amp; HUSTLE · MUSCLE &amp; HUSTLE · MUSCLE &amp; HUSTLE
              </span>
            </div>

            <div className="mhx-clip" />

            <div className="mhx-tilt" ref={tiltRef}>
              <form
                className={`mhx-pass ${fail ? 'shake' : ''}`}
                onSubmit={submit}
              >
                <div className="mhx-hole" />

                <div className="mhx-pass-head">
                  <span>Member access pass</span>
                  <b>No. MH-0427</b>
                </div>

                <div className="mhx-pass-body">
                  <h2>Check in</h2>

                  <p className="mhx-lead">
                    Sign in with your studio account to continue.
                  </p>

                  <label htmlFor="mhx-email">Email</label>

                  <input
                    id="mhx-email"
                    type="email"
                    value={email}
                    onChange={e => {
                      setEmail(e.target.value)
                      setErr('')
                    }}
                    required
                    autoComplete="username"
                    placeholder="you@studio.com"
                  />

                  <label htmlFor="mhx-pw">Password</label>

                  <div className="mhx-pwrow">
                    <input
                      id="mhx-pw"
                      type={show ? 'text' : 'password'}
                      value={pw}
                      onChange={e => {
                        setPw(e.target.value)
                        setErr('')
                      }}
                      required
                      autoComplete="current-password"
                      placeholder="••••••••"
                    />

                    <button
                      type="button"
                      className="mhx-eye"
                      onClick={() => setShow(s => !s)}
                    >
                      {show ? 'Hide' : 'Show'}
                    </button>
                  </div>

                  <div className="mhx-row">
                    <Link to="/forgot-password">
                      Forgot password?
                    </Link>
                  </div>

                  {err && (
                    <p className="mhx-err" role="alert">
                      {err}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="mhx-submit"
                    disabled={loading}
                  >
                    <span className="mhx-submit-fill" />

                    <span className="mhx-submit-label">
                      {loading ? 'Lifting…' : 'Check in'}
                    </span>

                    <span className="mhx-submit-arrow">→</span>
                  </button>
                </div>

                <div className="mhx-perf">
                  <i />
                  <hr />
                  <i />
                </div>

                <div className="mhx-pass-foot">
                  <p>Demo passes — tap to fill</p>

                  <div className="mhx-demo">
                    {users.map(u => (
                      <button
                        type="button"
                        key={u.id}
                        onClick={() => {
                          setEmail(u.email)
                          setPw(u.password)
                          setErr('')
                        }}
                      >
                        <span>{u.role}</span>
                        <small>{u.name}</small>
                      </button>
                    ))}
                  </div>

                  <div className="mhx-barcode" aria-hidden="true">
                    {BARCODE.map((w, i) => (
                      <i
                        key={i}
                        style={{
                          width: w * 2,
                          marginRight: i % 3 === 0 ? 3 : 2,
                        }}
                      />
                    ))}
                  </div>

                  <div className="mhx-code">
                    MH · STUDIO · COIMBATORE
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}


const CSS = `
.mhx{
  --plum:#0B0614; --plum2:#130B24; --plum3:#2A1A4D;
  --orange:#F2512D; --orange2:#FF6B45; --volt:#C8F53C; --iris:#7C4DFF;
  --paper:#F5F3FA; --line:#E3DEF0; --ink:#150E26; --mute:#6A6283;
  --mx:0; --my:0; --bs:1;
  position:relative; height:100vh; height:100dvh; width:100%; overflow:hidden; color:#fff;
  display:grid; grid-template-columns:1.12fr .88fr;
  background:var(--plum);
  font-family: Inter, "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
}
.mhx *{box-sizing:border-box}
@media (max-width:980px){ .mhx{grid-template-columns:1fr} }

/* ===== stage ===== */
.mhx-stage{
  position:relative; display:flex; flex-direction:column; justify-content:space-between;
  padding:1.5rem 2.6rem 0; height:100%; min-height:0; overflow:hidden;
  background:
    radial-gradient(900px 600px at 15% 20%, rgba(242,81,45,.18), transparent 60%),
    radial-gradient(800px 700px at 90% 100%, rgba(124,77,255,.24), transparent 60%),
    linear-gradient(180deg,#130B24 0%,#0B0614 100%);
}
.mhx-spot{
  position:absolute; left:50%; top:62%; width:760px; height:760px; transform:translate(-50%,-50%);
  background:radial-gradient(circle, rgba(200,245,60,.12) 0%, rgba(242,81,45,.08) 32%, transparent 62%);
  animation:mhx-breathe 6s ease-in-out infinite; pointer-events:none;
}
@keyframes mhx-breathe{0%,100%{opacity:.7;transform:translate(-50%,-50%) scale(1)}50%{opacity:1;transform:translate(-50%,-50%) scale(1.08)}}

.mhx-top{position:relative; z-index:3; display:flex; align-items:center; gap:.9rem}
.mhx-mark{
  width:3rem; height:3rem; border-radius:12px; display:grid; place-items:center;
  font-family: Inter, "Segoe UI", system-ui, sans-serif; font-weight:800; font-size:1.05rem; color:var(--orange2);
  border:1px solid rgba(242,81,45,.8); background:rgba(0,0,0,.35); backdrop-filter:blur(8px);
  box-shadow:0 0 24px rgba(242,81,45,.25);
}
.mhx-mark span{color:var(--volt); margin:0 1px; font-weight:600}
.mhx-top-meta b{display:block; font-family: Inter, "Segoe UI", system-ui, sans-serif; font-size:1.15rem; font-weight:700; letter-spacing:.01em}
.mhx-top-meta i{display:block; font-style:normal; font-size:.62rem; text-transform:uppercase; letter-spacing:.18em; color:rgba(255,255,255,.78); margin-top:.15rem}
.mhx-clock{
  margin-left:auto; display:flex; align-items:center; gap:.5rem; font-size:.74rem; font-weight:600; letter-spacing:.04em;
  padding:.45rem .8rem; border-radius:999px; background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.14); backdrop-filter:blur(8px);
}
.mhx-clock em{width:8px; height:8px; border-radius:50%; background:var(--volt); box-shadow:0 0 0 0 rgba(200,245,60,.7); animation:mhx-ping 1.8s infinite}
@keyframes mhx-ping{70%{box-shadow:0 0 0 10px rgba(200,245,60,0)}100%{box-shadow:0 0 0 0 rgba(200,245,60,0)}}

.mhx-headline{position:relative; z-index:2; margin-top:1.2vh; transform:translate(calc(var(--mx)*-14px), calc(var(--my)*-10px)); transition:transform .25s ease-out}
.mhx-greet{
  display:inline-block; font-size:.75rem; font-weight:600; letter-spacing:.16em; text-transform:uppercase; color:var(--volt);
  padding-left:2.6rem; position:relative; margin-bottom:.9rem;
}
.mhx-greet::before{content:''; position:absolute; left:0; top:50%; width:2rem; height:2px; background:linear-gradient(90deg,var(--orange),var(--iris))}
.mhx-headline h1{
  font-family: Inter, "Segoe UI", system-ui, sans-serif; font-weight:800; line-height:.9; letter-spacing:-.03em;
  font-size:clamp(2.5rem, min(7vw, 11vh), 6.2rem); text-transform:uppercase; margin:0;
}
.mhx-headline h1 span{display:block}
.mhx-headline h1 .o{display:inline; margin-right:.22em}
.mhx-headline .o{color:transparent; -webkit-text-stroke:1.5px rgba(255,255,255,.9)}
.mhx-headline .o2{-webkit-text-stroke-color:rgba(255,255,255,.7)}
.mhx-headline .f{
  background:linear-gradient(95deg,var(--orange2) 0%, #E1306C 45%, var(--iris) 100%);
  -webkit-background-clip:text; background-clip:text; color:transparent;
  filter:drop-shadow(0 10px 40px rgba(242,81,45,.35));
}

/* readout */
.mhx-rig{position:relative; z-index:2; margin:auto 0 .4rem; display:flex; flex-direction:column; align-items:center}
.mhx-readout{display:flex; align-items:flex-end; gap:1.1rem; margin-bottom:.6rem}
.mhx-kg{display:flex; align-items:baseline; gap:.3rem}
.mhx-kg b{
  font-family: Inter, "Segoe UI", system-ui, sans-serif; font-weight:800; font-size:calc(3.8rem*var(--bs)); line-height:1; letter-spacing:-.03em;
  color:var(--volt); text-shadow:0 0 34px rgba(200,245,60,.35); font-variant-numeric:tabular-nums; min-width:3ch; text-align:right;
}
.mhx-kg small{font-size:1rem; font-weight:700; color:rgba(255,255,255,.85); letter-spacing:.1em; text-transform:uppercase}
.mhx-state{display:flex; flex-direction:column; padding-bottom:.55rem; padding-left:1.1rem; border-left:1px solid rgba(255,255,255,.2)}
.mhx-state span{font-size:.64rem; letter-spacing:.16em; text-transform:uppercase; color:rgba(255,255,255,.78)}
.mhx-state strong{font-family: Inter, "Segoe UI", system-ui, sans-serif; font-size:1.05rem; font-weight:600}

/* barbell */
.mhx-barbox{position:relative; width:calc(500px*var(--bs)); height:calc(215px*var(--bs))}
.mhx-lifter{position:absolute; left:0; top:0; width:500px; height:200px; transform-origin:top left; transform:scale(var(--bs)); --s:var(--bs)}
.mhx-lifter.idle{animation:mhx-float 4.2s ease-in-out infinite}
.mhx-lifter.lift{animation:mhx-lift .75s cubic-bezier(.3,0,.2,1) infinite}
.mhx-lifter.drop{animation:mhx-drop .8s ease-in-out}
@keyframes mhx-float{0%,100%{transform:scale(var(--bs)) translateY(0)}50%{transform:scale(var(--bs)) translateY(-12px)}}
@keyframes mhx-lift{0%,100%{transform:scale(var(--bs)) translateY(0)}50%{transform:scale(var(--bs)) translateY(-46px)}}
@keyframes mhx-drop{0%{transform:scale(var(--bs)) translateY(-40px)}30%{transform:scale(var(--bs)) translateY(14px)}50%{transform:scale(var(--bs)) translateY(-10px)}70%{transform:scale(var(--bs)) translateY(6px)}100%{transform:scale(var(--bs)) translateY(0)}}

.mhx-barbell{position:relative; width:500px; height:200px; display:flex; align-items:center; justify-content:space-between}
.mhx-rod{
  position:absolute; left:0; right:0; top:50%; height:12px; transform:translateY(-50%); border-radius:6px;
  background:linear-gradient(180deg,#F1EEF9 0%,#A9A3BF 45%,#6C6585 100%); box-shadow:0 6px 18px rgba(0,0,0,.45);
}
.mhx-shaft{ /* knurled grip */
  position:absolute; left:50%; top:50%; width:190px; height:12px; transform:translate(-50%,-50%);
  background:repeating-linear-gradient(90deg, rgba(0,0,0,.45) 0 1px, transparent 1px 4px), linear-gradient(180deg,#CFCADF,#6C6585);
  border-radius:3px;
}
.mhx-zone{position:relative; width:150px; height:100%; display:flex; align-items:center; gap:2px}
.mhx-zone.l{justify-content:flex-end}
.mhx-zone.r{justify-content:flex-start}
.mhx-zone::before{
  content:''; position:absolute; top:50%; height:20px; width:100%; transform:translateY(-50%); border-radius:4px;
  background:linear-gradient(180deg,#fff 0%,#B7B1CC 40%,#6C6585 100%); z-index:0;
}
.mhx-collar{
  width:12px; height:34px; border-radius:3px; z-index:2; order:0;
  background:linear-gradient(90deg,#2b2340,#6a5f8c 50%,#2b2340); border:1px solid rgba(255,255,255,.25);
}
.mhx-zone.l .mhx-collar{order:99}
.mhx-plate{
  position:relative; z-index:1; width:17px; height:var(--h); border-radius:5px; display:grid; place-items:center;
  box-shadow:0 10px 24px rgba(0,0,0,.45), inset 2px 0 0 rgba(255,255,255,.45), inset -3px 0 0 rgba(0,0,0,.28);
  animation:mhx-plate-in .55s cubic-bezier(.2,1.4,.4,1) both;
}
.mhx-plate em{
  font-style:normal; font-size:.5rem; font-weight:800; letter-spacing:.05em; writing-mode:vertical-rl; transform:rotate(180deg); opacity:.85;
}
@keyframes mhx-plate-in{from{opacity:0; transform:translateX(var(--from,0)) scaleY(.2)}to{opacity:1; transform:none}}
.mhx-zone.l .mhx-plate{--from:-30px}
.mhx-zone.r .mhx-plate{--from:30px}
.mhx-plate.p20{background:linear-gradient(180deg,#FF7A55,#F2512D 40%,#C23A1B); color:#fff}
.mhx-plate.p15{background:linear-gradient(180deg,#9C7BFF,#7C4DFF 40%,#5733C4); color:#fff}
.mhx-plate.p10{background:linear-gradient(180deg,#DDFF6E,#C8F53C 40%,#9AC41A); color:#1b2a00}
.mhx-plate.p5{background:linear-gradient(180deg,#fff,#E7E3F2 40%,#B9B3CF); color:#2A1A4D}
.mhx-plate.p2{background:linear-gradient(180deg,#FFB39C,#FF8A6B 40%,#D8634A); color:#fff}

/* wooden lifting platform (CSS planks) */
.mhx-platform{
  position:absolute; left:50%; bottom:6px; width:calc(580px*var(--bs)); height:calc(20px*var(--bs)); transform:translateX(-50%); border-radius:6px;
  background:
    repeating-linear-gradient(90deg, rgba(0,0,0,.35) 0 2px, transparent 2px calc(46px*var(--bs))),
    linear-gradient(180deg,#8A5A3B 0%, #5A3722 60%, #34200F 100%);
  box-shadow:0 18px 40px rgba(0,0,0,.6), inset 0 2px 0 rgba(255,255,255,.18);
}
.mhx-platform-glow{
  position:absolute; left:50%; bottom:-6px; width:calc(520px*var(--bs)); height:30px; transform:translateX(-50%);
  background:radial-gradient(ellipse, rgba(242,81,45,.45), transparent 70%); filter:blur(10px);
}
.mhx-hint{margin:.7rem 0 0; font-size:.72rem; letter-spacing:.1em; text-transform:uppercase; color:rgba(255,255,255,.75); font-weight:500}

/* gym quote */
.mhx-quote{position:relative; z-index:3; margin:.9rem 0 1.1rem; padding:.8rem 1.1rem; border-radius:14px; text-align:center;
  background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.2); backdrop-filter:blur(8px); animation:mhx-q .6s ease both}
.mhx-quote blockquote{margin:0; font-family: Inter, "Segoe UI", system-ui, sans-serif; font-weight:600; font-size:clamp(.95rem,2.3vh,1.15rem); line-height:1.4; color:#fff}
@keyframes mhx-q{from{opacity:0; transform:translateY(6px)}to{opacity:1; transform:none}}

/* ticker */
.mhx-ticker{
  position:relative; z-index:3; margin:0 -2.6rem; padding:.6rem 0; overflow:hidden;
  border-top:1px solid rgba(255,255,255,.12); background:rgba(0,0,0,.35); backdrop-filter:blur(8px);
}
.mhx-ticker-track{display:flex; width:max-content; animation:mhx-marquee 38s linear infinite}
.mhx-ticker-track span{
  display:flex; align-items:center; gap:1.5rem; padding-right:1.5rem; white-space:nowrap;
  font-family: Inter, "Segoe UI", system-ui, sans-serif; font-weight:600; font-size:.9rem; letter-spacing:.14em; text-transform:uppercase; color:rgba(255,255,255,.92);
}
.mhx-ticker-track i{width:10px; height:10px; border-radius:3px; background:var(--orange); transform:rotate(45deg); display:block}
.mhx-ticker-track span:nth-child(even) i{background:var(--volt)}
@keyframes mhx-marquee{to{transform:translateX(-50%)}}

/* ===== side / pass ===== */
.mhx-side{
  position:relative; z-index:5; display:flex; align-items:center; justify-content:center; padding:0 1.5rem; height:100%; overflow:hidden;
  background:
    radial-gradient(700px 500px at 50% 0%, rgba(124,77,255,.24), transparent 65%),
    linear-gradient(180deg,#1C1036,#0F0820);
  border-left:1px solid rgba(255,255,255,.08);
}
.mhx-fit{width:100%; max-width:26.5rem; padding-top:5.4rem; transform-origin:center center; flex:none}
.mhx-swing{
  position:relative; width:100%;
  transform-origin:50% -5rem; animation:mhx-swing 2.6s cubic-bezier(.3,.9,.3,1) both;
}
@keyframes mhx-swing{0%{transform:rotate(-7deg)}22%{transform:rotate(5deg)}42%{transform:rotate(-3deg)}62%{transform:rotate(1.6deg)}82%{transform:rotate(-.6deg)}100%{transform:rotate(0)}}

.mhx-strap{
  position:absolute; left:50%; top:-5.4rem; width:46px; height:5.6rem; transform:translateX(-50%); z-index:0;
  background:linear-gradient(90deg,#c43d1c,#F2512D 30%,#FF6B45 50%,#F2512D 70%,#c43d1c);
  box-shadow:0 0 0 1px rgba(0,0,0,.2), 0 10px 24px rgba(0,0,0,.4); overflow:hidden;
}
.mhx-strap span{
  position:absolute; left:50%; top:0; writing-mode:vertical-rl; transform:translateX(-50%) rotate(180deg);
  font-size:.58rem; font-weight:700; letter-spacing:.28em; color:rgba(255,255,255,.88); white-space:nowrap; padding-top:.5rem;
}
.mhx-clip{
  position:absolute; left:50%; top:-.9rem; width:64px; height:30px; transform:translateX(-50%); z-index:6; border-radius:8px 8px 4px 4px;
  background:linear-gradient(180deg,#F3F0FA,#9D97B6); box-shadow:0 8px 14px rgba(0,0,0,.45); border:1px solid rgba(255,255,255,.4);
}
.mhx-clip::after{content:''; position:absolute; left:50%; bottom:-8px; width:22px; height:12px; transform:translateX(-50%); border-radius:0 0 8px 8px; background:#7B7497}

.mhx-tilt{position:relative; z-index:2; transition:transform .25s ease-out; transform-style:preserve-3d}
.mhx-pass{
  position:relative; border-radius:22px; background:var(--paper); color:var(--ink); overflow:hidden;
  box-shadow:0 40px 90px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.35) inset;
}
.mhx-pass.shake{animation:mhx-shake .6s ease}
@keyframes mhx-shake{0%,100%{transform:none}15%{transform:translateX(-10px) rotate(-1deg)}35%{transform:translateX(9px) rotate(1deg)}55%{transform:translateX(-6px)}75%{transform:translateX(4px)}}
.mhx-hole{
  position:absolute; left:50%; top:.85rem; width:54px; height:14px; transform:translateX(-50%); border-radius:8px; z-index:4;
  background:#1C1036; box-shadow:inset 0 3px 6px rgba(0,0,0,.7), 0 1px 0 rgba(255,255,255,.7);
}
.mhx-pass-head{
  display:flex; justify-content:space-between; align-items:flex-end; padding:2rem 1.5rem .65rem;
  color:#fff; background:
    repeating-linear-gradient(115deg, rgba(255,255,255,.07) 0 10px, transparent 10px 20px),
    linear-gradient(120deg,#F2512D 0%,#E1306C 60%,#7C4DFF 120%);
}
.mhx-pass-head span{font-size:.64rem; font-weight:700; letter-spacing:.2em; text-transform:uppercase}
.mhx-pass-head b{font-family: Inter, "Segoe UI", system-ui, sans-serif; font-size:.85rem; letter-spacing:.06em; opacity:.92; font-weight:600}
.mhx-pass-body{padding:1.1rem 1.5rem .2rem}
.mhx-pass h2{margin:0; font-family: Inter, "Segoe UI", system-ui, sans-serif; font-size:1.9rem; font-weight:800; letter-spacing:-.025em; color:var(--ink)}
.mhx-lead{margin:.2rem 0 .9rem; font-size:.86rem; color:#4F4768; font-weight:500}
.mhx-pass label{display:block; font-size:.66rem; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:#4B2A8F; margin-bottom:.4rem}
.mhx-pass input{
  width:100%; border:1.5px solid var(--line); background:#fff; color:var(--ink); border-radius:12px; padding:.68rem 1rem; font:inherit; font-size:.95rem; font-weight:500;
  margin-bottom:.8rem; transition:border-color .15s, box-shadow .15s;
}
.mhx-pass input::placeholder{color:#7B7396; font-weight:400}
.mhx-pass input:focus{outline:none; border-color:var(--iris); box-shadow:0 0 0 4px rgba(124,77,255,.15)}
.mhx-pwrow{position:relative}
.mhx-pwrow input{padding-right:4.4rem}
.mhx-eye{
  position:absolute; right:.55rem; top:.45rem; border:0; background:var(--paper); color:#4B2A8F; font-size:.68rem; font-weight:700;
  letter-spacing:.08em; text-transform:uppercase; padding:.4rem .65rem; border-radius:8px; cursor:pointer;
}
.mhx-eye:hover{background:#ECE8F5}
.mhx-row{display:flex; justify-content:flex-end; margin:-.3rem 0 .85rem}
.mhx-row a{font-size:.82rem; font-weight:600; color:var(--orange); text-decoration:none}
.mhx-row a:hover{text-decoration:underline}
.mhx-err{margin:0 0 1rem; padding:.65rem .85rem; border-radius:10px; font-size:.82rem; font-weight:600; color:#B42318; background:#FEECEA; border:1px solid #F9C5BF}

.mhx-submit{
  position:relative; width:100%; border:0; cursor:pointer; overflow:hidden; border-radius:14px; padding:.85rem 1.2rem;
  display:flex; align-items:center; justify-content:space-between; color:var(--volt);
  background:linear-gradient(135deg,#2A1A4D,#130B24); box-shadow:0 14px 30px rgba(19,11,36,.35);
  font-family: Inter, "Segoe UI", system-ui, sans-serif; font-size:1.05rem; font-weight:700; letter-spacing:.03em; text-transform:uppercase;
  transition:transform .15s, box-shadow .2s;
}
.mhx-submit:hover{transform:translateY(-2px); box-shadow:0 20px 40px rgba(19,11,36,.45)}
.mhx-submit:active{transform:scale(.98)}
.mhx-submit:disabled{cursor:progress}
.mhx-submit-fill{position:absolute; inset:0; width:0; background:linear-gradient(90deg,var(--orange),#E1306C); transition:width .45s cubic-bezier(.2,.8,.2,1)}
.mhx-submit:hover .mhx-submit-fill, .mhx-submit:disabled .mhx-submit-fill{width:100%}
.mhx-submit:disabled .mhx-submit-fill{transition-duration:.75s}
.mhx-submit-label,.mhx-submit-arrow{position:relative; z-index:1; transition:color .2s}
.mhx-submit:hover .mhx-submit-label,.mhx-submit:hover .mhx-submit-arrow,.mhx-submit:disabled .mhx-submit-label,.mhx-submit:disabled .mhx-submit-arrow{color:#fff}
.mhx-submit-arrow{font-size:1.3rem; transition:transform .2s}
.mhx-submit:hover .mhx-submit-arrow{transform:translateX(5px)}

.mhx-perf{display:flex; align-items:center; margin:1rem 0 0; position:relative}
.mhx-perf hr{flex:1; border:0; border-top:2px dashed #CFC6E6; margin:0}
.mhx-perf i{width:26px; height:26px; border-radius:50%; background:#1A0F30; flex:none; box-shadow:inset 0 3px 6px rgba(0,0,0,.5)}
.mhx-perf i:first-child{margin-left:-13px}
.mhx-perf i:last-child{margin-right:-13px}
.mhx-pass-foot{padding:.8rem 1.5rem 1.05rem}
.mhx-pass-foot > p{margin:0 0 .65rem; font-size:.66rem; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:#4F4768}
.mhx-demo{display:grid; grid-template-columns:1fr 1fr; gap:.5rem}
.mhx-demo button{
  text-align:left; cursor:pointer; border-radius:12px; border:1.5px solid var(--line); background:#fff; padding:.4rem .7rem; transition:all .15s;
}
.mhx-demo button:hover{border-color:var(--iris); transform:translateY(-2px); box-shadow:0 10px 20px rgba(124,77,255,.15)}
.mhx-demo span{display:block; font-size:.85rem; font-weight:700; text-transform:capitalize; color:var(--ink)}
.mhx-demo small{display:block; font-size:.72rem; color:#4F4768}
.mhx-barcode{display:flex; align-items:stretch; height:28px; margin-top:.8rem; opacity:.9}
.mhx-barcode i{display:block; background:var(--ink); border-radius:1px}
.mhx-code{margin-top:.3rem; font-size:.6rem; letter-spacing:.28em; color:#4F4768; font-weight:600}

/* ===== responsive: on small screens only the pass shows, still one screen ===== */

@media (max-width:980px){
  .mhx {
    min-height: 100dvh;
    height: auto;
    grid-template-columns: 1fr;
    overflow: visible;
  }

  .mhx-stage {
    display: flex;
    min-height: 420px;
    height: auto;
    padding: 1.5rem 1.25rem;
  }

  .mhx-headline h1 {
    font-size: clamp(2.5rem, 12vw, 4.5rem);
  }

  .mhx-rig {
    margin: 2rem 0;
  }

  .mhx-side {
    min-height: 760px;
    height: auto;
    padding: 5rem 1rem 2rem;
    border-left: 0;
    overflow: visible;
  }

  .mhx-fit {
    max-width: 26.5rem;
    padding-top: 0;
    transform: none !important;
  }
}

@media (max-width:480px) {
  .mhx-stage {
    min-height: 380px;
  }

  .mhx-clock {
    font-size: .65rem;
    padding: .4rem .55rem;
  }

  .mhx-top-meta b {
    font-size: .95rem;
  }

  .mhx-side {
    padding-left: .75rem;
    padding-right: .75rem;
  }
}


@media (prefers-reduced-motion: reduce){
  .mhx *, .mhx-swing{animation:none !important; transition:none !important}
}
`