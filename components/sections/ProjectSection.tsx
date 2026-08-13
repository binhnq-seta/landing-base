'use client';

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'

const PROJECTS = [
    {
        id: '01',
        slug: 'he-thong-gsm-co-dong',
        category: 'CỤC KTNV - BỘ CÔNG AN | 2017',
        title: 'Hệ thống GSM cơ động và Phân tích tín hiệu vô tuyến',
        img: '/image/project/gms.jpg',
        description:
            'GS-Group được lựa chọn triển khai Hệ thống GSM cơ động và Hệ thống phân tích tín hiệu vô tuyến, đáp ứng các yêu cầu khắt khe về kỹ thuật, độ ổn định và bảo mật trong lĩnh vực an ninh. Dự án đánh dấu năng lực của GS-Group trong việc triển khai các hệ thống công nghệ cho các cơ quan trọng yếu.',
    },
    {
        id: '01b',
        slug: 'he-thong-gsm-co-dong',
        category: 'CỤC KTNV - BỘ CÔNG AN | 2017',
        title: 'Hệ thống GSM cơ động và Phân tích tín hiệu vô tuyến',
        img: '/image/project/gms.jpg',
        description:
            'GS-Group được lựa chọn triển khai Hệ thống GSM cơ động và Hệ thống phân tích tín hiệu vô tuyến phục vụ nhiệm vụ chuyên môn của Cục Kỹ thuật Nghiệp vụ – Bộ Công an. Dự án đòi hỏi yêu cầu cao về kỹ thuật, tính bảo mật và độ tin cậy, góp phần khẳng định năng lực triển khai các hệ thống công nghệ phục vụ lĩnh vực an ninh.',
    },
    {
        id: '02',
        slug: 'phan-mem-phan-bay-aves',
        category: 'VIETNAM AIRLINES | 2018',
        title: 'Hệ thống lập kế hoạch phân bay phi công và tiếp viên (AVES)',
        img: '/image/project/aves.jpg',
        description:
            'GS-Group triển khai giải pháp AVES hỗ trợ lập kế hoạch và điều phối lịch phân bay cho đội ngũ phi công và tiếp viên của Vietnam Airlines. Sau khi hệ thống đi vào vận hành, GS-Group tiếp tục đồng hành thông qua các dịch vụ bảo trì, nâng cấp và hỗ trợ kỹ thuật, đảm bảo hệ thống hoạt động ổn định và đáp ứng yêu cầu khai thác lâu dài.',
    },
    {
        id: '03',
        slug: 'he-thong-an-toan-thong-tin',
        category: 'TỔNG CÔNG TY TRUYỀN TẢI ĐIỆN QUỐC GIA',
        title: 'Hệ thống An toàn thông tin',
        img: '/image/project/sec.jpg',
        description:
            'Triển khai hệ thống an toàn thông tin nhằm xây dựng hạ tầng bảo mật tổng thể cho Tổng công ty Truyền tải điện Quốc gia. Giải pháp góp phần bảo vệ hệ thống công nghệ thông tin, hỗ trợ vận hành lưới điện an toàn, liên tục và đáp ứng các yêu cầu về an toàn thông tin đối với hạ tầng năng lượng trọng yếu.',
    },
]

interface ProjectItem {
    id: string
    slug: string
    category: string
    title: string
    img: string
    description: string
}

interface ProjectSectionProps {
    data?: ProjectItem[]
    title?: string
    viewMoreLabel?: string
}

export default function ProjectSection({ data, title, viewMoreLabel }: ProjectSectionProps) {
    const PROJECTS_DATA = data ?? PROJECTS
    const [activeIndex, setActiveIndex] = useState(0)
    const sectionRef = useRef<HTMLElement>(null)
    const touchStartXRef = useRef<number | null>(null)

    const showPrevious = () => {
        setActiveIndex((current) =>
            current === 0 ? PROJECTS_DATA.length - 1 : current - 1,
        )
    }

    const showNext = () => {
        setActiveIndex((current) => (current + 1) % PROJECTS_DATA.length)
    }

    const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
        touchStartXRef.current = event.touches[0].clientX
    }

    const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
        if (touchStartXRef.current === null) return

        const distance = event.changedTouches[0].clientX - touchStartXRef.current
        touchStartXRef.current = null

        if (Math.abs(distance) < 50) return
        if (distance > 0) showPrevious()
        else showNext()
    }

    const getSlidePosition = (index: number) => {
        if (index === activeIndex) return 0
        if (index === (activeIndex - 1 + PROJECTS_DATA.length) % PROJECTS_DATA.length) return -1
        return 1
    }

    useEffect(() => {
        const section = sectionRef.current

        if (
            !section ||
            window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ) {
            return
        }

        const ctx = gsap.context(() => {
            const revealTargets =
                gsap.utils.toArray<HTMLElement>('[data-project-reveal]')

            gsap.from(revealTargets, {
                opacity: 0,
                y: 50,
                duration: 0.9,
                ease: 'power3.out',
                stagger: 0.1,
                force3D: false,
                scrollTrigger: {
                    trigger: section,
                    start: 'top 75%',
                    toggleActions: 'play none none reverse',
                },
            })

        }, section)

        return () => ctx.revert()
    }, [])

    return (
        <section ref={sectionRef} id="projects" className="relative flex items-center overflow-hidden bg-[#EAF3FC] py-12 md:min-h-screen md:py-16 lg:py-0">
            <div className="relative z-10 flex w-full flex-col gap-6 md:gap-8">
                <h1 data-project-reveal className="px-[5vh] text-start text-[clamp(22px,2vw,34px)] font-extrabold leading-[1.1] tracking-[-0.01em] whitespace-nowrap uppercase text-[#263A59] md:px-[10vw] md:text-[clamp(32px,3vw,48px)]">
                    {title ?? 'Dự án tiêu biểu'}
                </h1>

                <div data-project-reveal>
                    <div
                        className="relative touch-pan-y overflow-hidden"
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                    >
                        <div className="grid">
                            {PROJECTS_DATA.map((project, index) => {
                                const position = getSlidePosition(index)
                                const isActive = position === 0
                                const slideOffset = position * 92
                                const slideScale = isActive ? 1 : 0.75

                                return (
                                    <article
                                        key={project.id}
                                        aria-current={isActive ? 'true' : undefined}
                                        aria-label={isActive ? undefined : `Chuyển tới dự án ${index + 1}`}
                                        role={isActive ? undefined : 'button'}
                                        tabIndex={isActive ? undefined : 0}
                                        onClick={() => {
                                            if (!isActive) setActiveIndex(index)
                                        }}
                                        onKeyDown={(event) => {
                                            if (!isActive && (event.key === 'Enter' || event.key === ' ')) {
                                                event.preventDefault()
                                                setActiveIndex(index)
                                            }
                                        }}
                                        className={`relative col-start-1 row-start-1 grid w-[84%] grid-cols-[minmax(0,48fr)_minmax(0,52fr)] items-center gap-3 justify-self-center rounded-[1.5rem] border px-3 py-5 transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none sm:w-[80%] sm:grid-cols-[minmax(0,52fr)_minmax(0,48fr)] sm:px-5 sm:py-7 md:w-[64%] md:gap-5 md:px-7 md:py-8 lg:w-[60%] lg:grid-cols-[minmax(0,56fr)_minmax(0,44fr)] lg:gap-14 lg:rounded-[2rem] lg:px-12 lg:py-14 ${isActive ? 'border-[#D6E4F7] bg-white shadow-[0_24px_70px_rgba(37,99,235,0.12)]' : 'cursor-pointer border-blue-200/60 bg-blue-200/20 shadow-[0_20px_60px_rgba(37,99,235,0.14)]'}`}
                                        style={{
                                            opacity: isActive ? 1 : 0.48,
                                            transform: `translateX(${slideOffset}%) scale(${slideScale})`,
                                            zIndex: isActive ? 3 : 1,
                                        }}
                                    >
                                        <div className="absolute inset-y-0 left-0 z-0 w-[48%] overflow-hidden rounded-l-[1.5rem] bg-blue-50/70 sm:w-[52%] lg:w-[56%] lg:rounded-l-[2rem]">
                                            <Image
                                                src={project.img}
                                                alt="Dự án tiêu biểu"
                                                fill
                                                sizes="40vw"
                                                quality={75}
                                                className="object-cover object-center"
                                                aria-hidden="true"
                                            />
                                            <div
                                                aria-hidden="true"
                                                className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[45%] bg-gradient-to-t from-white/80 via-white/30 to-transparent"
                                            />
                                        </div>

                                        <div aria-hidden="true" className="min-h-48 sm:min-h-52 md:min-h-64 lg:min-h-[clamp(14rem,25vw,45rem)]" />

                                        <div className="relative z-10 flex flex-col items-start">
                                            <span className="mb-1 -translate-y-1 text-[10px] font-medium uppercase text-[#30549B] md:text-xs lg:text-sm">
                                                {project.category}
                                            </span>
                                            <h3 className="max-w-2xl text-sm font-bold leading-snug text-slate-700 sm:text-base md:text-xl lg:text-3xl">
                                                {project.title}
                                            </h3>
                                            <span
                                                aria-hidden="true"
                                                className="mt-3 h-1 w-12 rounded-full bg-[#30549B] md:w-16 lg:mt-5 lg:w-20"
                                            />
                                            <p className="mt-3 max-w-2xl text-[11px] leading-4 text-slate-700 sm:text-xs sm:leading-5 md:text-sm md:leading-6 lg:mt-5 lg:text-[clamp(14px,1vw,18px)] lg:leading-8">
                                                {project.description}
                                            </p>
                                            <Link
                                                href={`/projects/${project.slug}`}
                                                className="mt-4 inline-flex items-center gap-1 rounded-full border border-blue-200 bg-white px-3 py-2 text-[11px] font-semibold text-[#30549B] shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-[#30549B] hover:bg-[#30549B] hover:text-white hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#30549B] md:gap-2 md:px-4 md:text-xs lg:mt-7 lg:px-6 lg:py-3 lg:text-sm"
                                            >
                                                {viewMoreLabel ?? 'Xem thêm'}
                                                <span aria-hidden="true">→</span>
                                            </Link>
                                        </div>
                                    </article>
                                )
                            })}
                        </div>

                        <button
                            type="button"
                            onClick={showPrevious}
                            aria-label="Dự án trước"
                            className="absolute left-[1.5%] top-1/2 z-20 inline-flex size-14 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-blue-200 bg-white text-[#30549B] shadow-lg transition duration-300 hover:-translate-y-[54%] hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:size-16 md:left-[16%]"
                        >
                            <svg
                                aria-hidden="true"
                                viewBox="0 0 24 24"
                                fill="none"
                                className="size-7 -translate-x-px"
                            >
                                <path
                                    d="m15 18-6-6 6-6"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>
                        <button
                            type="button"
                            onClick={showNext}
                            aria-label="Dự án tiếp theo"
                            className="absolute right-[1.5%] top-1/2 z-20 inline-flex size-14 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-blue-200 bg-white text-[#30549B] shadow-lg transition duration-300 hover:-translate-y-[54%] hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:size-16 md:right-[16%]"
                        >
                            <svg
                                aria-hidden="true"
                                viewBox="0 0 24 24"
                                fill="none"
                                className="size-7 translate-x-px"
                            >
                                <path
                                    d="m9 18 6-6-6-6"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>
                    </div>

                    <div className="mt-6 flex items-center justify-center md:mt-8">
                        <div
                            className="flex items-center gap-2"
                            aria-label="Chọn dự án"
                        >
                            {PROJECTS_DATA.map((project, index) => (
                                <button
                                    key={project.id}
                                    type="button"
                                    onClick={() => setActiveIndex(index)}
                                    aria-label={`Xem dự án ${index + 1}`}
                                    aria-current={index === activeIndex ? 'true' : undefined}
                                    className={`cursor-pointer h-2.5 rounded-full transition-all duration-300 ${index === activeIndex ? 'w-8 bg-[#30549B]' : 'w-2.5 bg-blue-200 hover:bg-blue-400'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
