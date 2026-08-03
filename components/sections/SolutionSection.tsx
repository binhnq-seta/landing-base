'use client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useRef, useEffect, useState } from 'react'
import { gsap } from '@/lib/gsap'

// ─── Data ─────────────────────────────────────────────────────────────────────

const SOLUTION_IMAGE = [
  { title: 'Giải pháp tích hợp',   src: '/image/solution/integration.jpg', alt: 'Giải pháp tích hợp',   desc: 'GS GROUP có năng lực triển khai trọn gói Data Center, các giải pháp hội nghị truyền hình, và hệ thống thiết bị trường quay chuyên nghiệp.' },
  { title: 'An ninh - Quốc phòng', src: '/image/solution/military.jpg',     alt: 'An ninh - Quốc phòng', desc: 'GS GROUP cung cấp nền tảng quản lý mối đe dọa bên ngoài (External Threat Management) và giải pháp phù hợp cho hạ tầng trọng yếu (điện lực, dầu khí, SCADA/ICS).' },
  { title: 'Bảo mật - ATTT',        src: '/image/solution/security.jpg',     alt: 'Bảo mật - ATTT',       desc: 'GS GROUP cung cấp nền tảng quản lý mối đe dọa bên ngoài (External Threat Management) và giải pháp phù hợp cho hạ tầng trọng yếu (điện lực, dầu khí, SCADA/ICS).' },
  { title: 'Điện lực - Năng lượng', src: '/image/solution/energy.jpg',       alt: 'Điện lực - Năng lượng',desc: 'GS GROUP cung cấp giải pháp quản lý thiết bị, sửa chữa và bảo trì, thu thập và truyền tải số liệu kỹ thuật, giám sát từ xa và chuẩn đoán tình trạng kỹ thuật của thiết bị.' },
  { title: 'Viễn thông',            src: '/image/solution/tele.jpg',          alt: 'Viễn thông',           desc: 'GS GROUP cung cấp giải pháp truyền thông di động cao cấp thế hệ mới, mang lại khả năng kiểm soát toàn diện quyền riêng tư, bảo mật và trải nghiệm liên lạc cho người dùng.' },
  { title: 'Hàng không',            src: '/image/solution/air.jpg',           alt: 'Hàng không',           desc: 'GS GROUP cung cấp giải pháp quản lý và lập lịch khai thác bay, hỗ trợ phân công phi công – tiếp viên, theo dõi giờ bay/giờ nghỉ và tuân thủ quy định an toàn.' },
]

const SOLUTION_SLUGS = [
  'giai-phap-tich-hop', 'an-ninh-quoc-phong', 'bao-mat-attt',
  'dien-luc-nang-luong', 'vien-thong', 'hang-khong',
]

// ─── Layout constants ─────────────────────────────────────────────────────────

const ROW_ACTIVE = 1.4, ROW_REST = 0.6
const COL_ACTIVE = 1,   COL_REST = 0.7
const HOVER_DELAY = 150   // ms

// CSS transition values — browser handles these more efficiently than GSAP JS tweens
// because layout/paint changes are batched per compositing frame rather than per JS tick.
const DUR  = '0.50s'
const EASE = 'cubic-bezier(0.645, 0.045, 0.355, 1)'
const T    = (prop: string) => `${prop} ${DUR} ${EASE}`

// ─── Types ────────────────────────────────────────────────────────────────────

interface SolutionItem { slug: string; title: string; src: string; alt: string; desc: string }
interface SolutionSectionProps { data?: SolutionItem[]; title?: string }

// ─── Component ────────────────────────────────────────────────────────────────

export default function SolutionSection({ data, title }: SolutionSectionProps) {
  const solutions = data ?? SOLUTION_IMAGE.map((item, i) => ({ ...item, slug: SOLUTION_SLUGS[i] }))
  const router = useRouter()

  // ── Refs ──────────────────────────────────────────────────────────────────
  const sectionRef      = useRef<HTMLElement>(null)
  const crystalRef      = useRef<HTMLImageElement>(null)
  const sectionTitleRef = useRef<HTMLHeadingElement>(null)
  const cardRefs        = useRef<(HTMLDivElement | null)[]>([])
  const hoverTimer      = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeIdxRef    = useRef(0)   // always in sync with activeIndex, used by debounce closure

  // ── State ─────────────────────────────────────────────────────────────────
  const [activeIndex, setActiveIndex] = useState(0)

  // ── Scroll-reveal (GSAP — appropriate here; not inside a hot hover path) ──
  useEffect(() => {
    const cards    = cardRefs.current.filter((el): el is HTMLDivElement => el !== null)
    const targets  = ([crystalRef.current, sectionTitleRef.current, ...cards] as (Element | null)[])
      .filter((el): el is Element => el !== null)
    const noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (noMotion) { gsap.set(targets, { opacity: 1, y: 0 }); return }

    const tween = gsap.fromTo(targets,
      { opacity: 0, y: 70 },
      { opacity: 1, y: 0, ease: 'circ.out', duration: 0.9, stagger: 0.08,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', end: 'top 40%', scrub: 1 } },
    )
    return () => { tween.scrollTrigger?.kill(); tween.kill() }
  }, [])

  // ── Hover debounce ────────────────────────────────────────────────────────
  const cancelHover = () => {
    if (hoverTimer.current) { clearTimeout(hoverTimer.current); hoverTimer.current = null }
  }

  const handleHoverSelect = (index: number) => {
    cancelHover()
    if (index === activeIdxRef.current) return
    hoverTimer.current = setTimeout(() => {
      hoverTimer.current = null
      if (index !== activeIdxRef.current) {
        activeIdxRef.current = index
        setActiveIndex(index)
      }
    }, HOVER_DELAY)
  }

  const handleClick = (index: number) => {
    if (index === activeIdxRef.current) {
      router.push(`/solutions/${solutions[index].slug}`)
      return
    }
    cancelHover()
    activeIdxRef.current = index
    setActiveIndex(index)
  }

  useEffect(() => () => cancelHover(), [])

  // ── Derived layout values ─────────────────────────────────────────────────
  const activeRow = Math.floor(activeIndex / 3)
  const activeCol = activeIndex % 3

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <section ref={sectionRef} id="solutions" className="relative min-h-screen overflow-hidden bg-cover bg-center bg-no-repeat">

      {/* Mobile layout */}
      <div className="block md:hidden px-5 py-14">
        <h1 className="mb-8 text-[clamp(36px,6vw,60px)] font-extrabold tracking-wider text-slate-700">
          GIẢI <br /> PHÁP
        </h1>
        <div className="grid grid-cols-2 gap-3">
          {solutions.map((solution, index) => (
            <div
              key={index}
              onClick={() => router.push(`/solutions/${solution.slug}`)}
              className="relative aspect-[3/4] overflow-hidden rounded-xl cursor-pointer"
            >
              <Image src={solution.src} alt={solution.alt} fill sizes="50vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <h3 className="absolute bottom-3 left-3 right-3 text-sm font-bold text-white leading-tight">
                {solution.title}
              </h3>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden md:grid grid-cols-[35%_65%] min-h-screen">
        <Image
          ref={crystalRef}
          src="/image/crystal.png"
          alt=""
          width={640}
          height={640}
          sizes="50vw"
          aria-hidden="true"
          className="absolute z-0 h-auto w-[50%] -top-1/5 -left-[25%] drop-shadow-[0_0_48px_rgba(120,120,120,0.28)]"
        />

        <div className="flex h-full items-end justify-center">
          <h1 ref={sectionTitleRef} className="mb-20 text-[clamp(60px,4vw,100px)] z-1 font-extrabold tracking-wider text-slate-700">
            {title ?? (<>GIẢI <br /> PHÁP</>)}
          </h1>
        </div>

        <div className="flex flex-col h-screen">
          {[0, 1].map((rowIdx) => (
            <div
              key={rowIdx}
              className="flex min-h-0"
              style={{
                flexGrow: rowIdx === activeRow ? ROW_ACTIVE : ROW_REST,
                transition: T('flex-grow'),
              }}
            >
              {solutions.slice(rowIdx * 3, rowIdx * 3 + 3).map((solution, colIdx) => {
                const index    = rowIdx * 3 + colIdx
                const isActive = index === activeIndex
                const colGrow  = rowIdx === activeRow
                  ? (colIdx === activeCol ? COL_ACTIVE : COL_REST)
                  : 1

                return (
                  <div
                    key={index}
                    data-solution-index={index}
                    ref={(el) => { cardRefs.current[index] = el }}
                    onMouseEnter={() => handleHoverSelect(index)}
                    onMouseLeave={cancelHover}
                    onClick={() => handleClick(index)}
                    onKeyDown={(e) => {
                      if (e.key !== 'Enter' && e.key !== ' ') return
                      e.preventDefault()
                      handleClick(index)
                    }}
                    role="button"
                    tabIndex={0}
                    className="relative overflow-hidden cursor-pointer basis-0 min-w-0 min-h-0"
                    style={{
                      flexGrow: colGrow,
                      transition: T('flex-grow'),
                    }}
                  >
                    {/* Background image */}
                    <Image
                      src={solution.src}
                      alt={solution.alt}
                      fill
                      sizes="(max-width: 768px) 33vw, 22vw"
                      className="object-cover"
                      style={{
                        opacity:    isActive ? 1 : 0.4,
                        filter:     isActive ? 'none' : 'grayscale(100%)',
                        transform:  isActive ? 'scale(1.03)' : 'scale(1)',
                        transition: `opacity ${DUR} ease, transform ${DUR} ease`,
                      }}
                    />

                    {/* Active gradient overlay */}
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-blue-700/80 to-blue-400/40"
                      style={{
                        opacity:    isActive ? 1 : 0,
                        transition: `opacity ${DUR} ease`,
                      }}
                    />

                    {/* Inactive gradient overlay */}
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-gray-200/80 via-black/5 to-transparent"
                      style={{
                        opacity:    isActive ? 0 : 1,
                        transition: `opacity ${DUR} ease`,
                      }}
                    />

                    {/* Card content */}
                    <div className="absolute inset-0 flex flex-col justify-end items-start p-6">
                      {/* Arrow button */}
                      <span
                        className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/80 mb-5"
                        style={{
                          opacity:    isActive ? 1 : 0,
                          transition: 'opacity 0.25s ease',
                        }}
                      >
                        <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14" /><path d="m13 6 6 6-6 6" />
                        </svg>
                      </span>

                      {/* Title */}
                      <h3
                        style={{
                          color:      isActive ? '#FFFFFF' : '#1E293B',
                          fontWeight: isActive ? '700' : '400',
                          fontSize:   isActive ? 'clamp(1.25rem,2.25vw,4rem)' : '1.25rem',
                          transition: `color ${DUR} ease, font-size ${DUR} ${EASE}`,
                        }}
                      >
                        {solution.title}
                      </h3>

                      {/* Description — max-height avoids measuring scrollHeight */}
                      <div
                        className="w-full overflow-hidden"
                        style={{
                          maxHeight:  isActive ? '200px' : '0px',
                          transition: T('max-height'),
                        }}
                      >
                        <p className="mt-2 font-light text-sm text-white">
                          {solution.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
