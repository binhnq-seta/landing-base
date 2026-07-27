'use client';

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'

const PROJECTS = [
    {
        id: '01',
        slug: 'phan-mem-phan-bay-aves',
        category: 'VIETNAM AIRLINES',
        title: 'Phần mềm phân bay (AVES)',
        img: '/image/slide-bg.jpg',
        description:
            'Năm 2018, Chúng tôi được VNA lựa chọn là đơn vị cung cấp giải pháp phần mềm phân bay phi công, tiếp viên (AVES). Cho đến nay Chúng tôi tiếp tục cung cấp dịch vụ bảo trì, nâng cấp và hỗ trợ kỹ thuật cho VNA.',
    },
    {
        id: '02',
        slug: 'he-thong-gsm-co-dong',
        category: 'CỤC KTVN - BỘ CÔNG An',
        title: 'Hệ thống GSM cơ động',
        img: '/image/slide-bg.jpg',
        description:
            'Năm 2017, Chúng tôi được lựa chọn là đơn vị triển khai Hệ thống GSM cơ động và Hệ thống phân tích tín hiệu vô tuyến cho Cục KTNV - Bộ Công an',
    },
    {
        id: '03',
        slug: 'he-thong-an-toan-thong-tin',
        category: 'TỔNG CÔNG TY TRUYỀN TẢI ĐIỆN QUỐC GIA',
        title: 'Hệ thống An toàn Thông tin',
        img: '/image/slide-bg.jpg',
        description:
            'Dự án trang bị hệ thống An ninh thông tin cho Tổng công ty Truyền tải điện Quốc gia nhằm xây dựng hạ tầng bảo mật tổng thể, bảo vệ an toàn hệ thống CNTT và điều hành lưới điện, đảm bảo vận hành liên tục, tin cậy và tuân thủ các yêu cầu an ninh quốc gia',
    },
]

export default function ProjectSection() {
    const [activeIndex, setActiveIndex] = useState(0)
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
    const [isCarouselHovered, setIsCarouselHovered] = useState(false)
    const [isSectionVisible, setIsSectionVisible] = useState(false)
    const sectionRef = useRef<HTMLElement>(null)
    const touchStartXRef = useRef<number | null>(null)
    const isCarouselHoveredRef = useRef(false)

    const showPrevious = () => {
        setActiveIndex((current) =>
            current === 0 ? PROJECTS.length - 1 : current - 1,
        )
    }

    const showNext = () => {
        setActiveIndex((current) => (current + 1) % PROJECTS.length)
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
        if (index === (activeIndex - 1 + PROJECTS.length) % PROJECTS.length) return -1
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
                force3D: true,
                scrollTrigger: {
                    trigger: section,
                    start: 'top 75%',
                    toggleActions: 'play none none reverse',
                },
            })

        }, section)

        return () => ctx.revert()
    }, [])

    useEffect(() => {
        const section = sectionRef.current
        if (!section) return

        const observer = new IntersectionObserver(
            ([entry]) => setIsSectionVisible(entry.isIntersecting),
            { threshold: 0.3 },
        )

        observer.observe(section)
        return () => observer.disconnect()
    }, [])

    useEffect(() => {
        if (isCarouselHovered || !isSectionVisible) return

        const autoplayTimer = window.setInterval(() => {
            if (isCarouselHoveredRef.current) return
            setActiveIndex((current) => (current + 1) % PROJECTS.length)
        }, 2000)

        return () => window.clearInterval(autoplayTimer)
    }, [isCarouselHovered, isSectionVisible])

    return (
        <section ref={sectionRef} id="projects" className="relative flex min-h-screen items-center overflow-hidden bg-[#FAFAFF]">
            <Image
                src="/image/project-bg.png"
                alt=""
                fill
                sizes="100vw"
                className="z-0 scale-60 object-cover blur-[80px] -rotate-[100deg] translate-x-[20%] -translate-y-[40%]"
                aria-hidden="true"
            />

            <div className="relative z-10 w-full">
                <h1 data-project-reveal className="mb-[3vw] text-start px-[10vw] text-[clamp(60px,4vw,100px)] font-bold uppercase text-slate-700">
                    Dự án tiêu biểu
                </h1>

                <div data-project-reveal>
                    <div
                        className="-my-48 touch-pan-y overflow-hidden py-48"
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                    >
                        <div className="grid">
                            {PROJECTS.map((project, index) => {
                                const position = getSlidePosition(index)
                                const isActive = position === 0
                                const isHovered = hoveredIndex === index && !isActive
                                const slideOffset = position * (isHovered ? 86 : 92)
                                const slideScale = isActive ? 0.9 : isHovered ? 0.79 : 0.75

                                return (
                                    <article
                                        key={project.id}
                                        aria-current={isActive ? 'true' : undefined}
                                        aria-label={isActive ? undefined : `Chuyển tới dự án ${index + 1}`}
                                        role={isActive ? undefined : 'button'}
                                        tabIndex={isActive ? undefined : 0}
                                        onMouseEnter={() => {
                                            isCarouselHoveredRef.current = true
                                            setIsCarouselHovered(true)
                                            setHoveredIndex(index)
                                        }}
                                        onMouseLeave={() => {
                                            isCarouselHoveredRef.current = false
                                            setIsCarouselHovered(false)
                                            setHoveredIndex(null)
                                        }}
                                        onClick={() => {
                                            if (!isActive) setActiveIndex(index)
                                        }}
                                        onKeyDown={(event) => {
                                            if (!isActive && (event.key === 'Enter' || event.key === ' ')) {
                                                event.preventDefault()
                                                setActiveIndex(index)
                                            }
                                        }}
                                        className={`relative col-start-1 row-start-1 grid w-[60%] grid-cols-[minmax(0,40fr)_minmax(0,60fr)] items-center gap-4 justify-self-center rounded-[2rem] border px-7 py-12 transition-[transform,opacity,background-color,border-color,box-shadow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none md:gap-8 md:px-12 md:py-14 lg:gap-14 ${isActive ? 'border-blue-100 bg-white shadow-[0_24px_70px_rgba(37,99,235,0.12)]' : 'cursor-pointer border-blue-200/60 bg-blue-200/20 shadow-[0_20px_60px_rgba(37,99,235,0.14)] hover:border-blue-300/80 hover:bg-blue-200/30 hover:shadow-[0_26px_80px_rgba(37,99,235,0.24)]'}`}
                                        style={{
                                            opacity: isActive ? 1 : isHovered ? 0.78 : 0.48,
                                            transform: `translateX(${slideOffset}%) scale(${slideScale})`,
                                            zIndex: isActive ? 3 : isHovered ? 2 : 1,
                                        }}
                                    >
                                        <div className="absolute inset-y-0 left-0 z-0 w-[40%] overflow-hidden rounded-l-[2rem] bg-blue-50/70">
                                            <Image
                                                src={project.img}
                                                alt="Dự án tiêu biểu"
                                                fill
                                                sizes="40vw"
                                                quality={75}
                                                className="h-full w-full object-contain"
                                                aria-hidden="true"
                                            />
                                        </div>

                                        <div aria-hidden="true" className="min-h-[clamp(14rem,25vw,45rem)]" />

                                        <div className="relative z-10 flex flex-col items-start">
                                            <span className="mb-5 text-sm font-medium uppercase text-slate-700">
                                                {project.category}
                                            </span>
                                            <h3 className="max-w-2xl text-2xl font-bold leading-snug text-slate-700 sm:text-3xl">
                                                {project.title}
                                            </h3>
                                            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-700">
                                                {project.description}
                                            </p>
                                            <Link
                                                href={`/projects/${project.slug}`}
                                                className="mt-7 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-6 py-3 text-sm font-semibold text-blue-600 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                            >
                                                Xem thêm
                                                <span aria-hidden="true">→</span>
                                            </Link>
                                        </div>
                                    </article>
                                )
                            })}
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-center">
                        <div
                            className="flex items-center gap-2"
                            aria-label="Chọn dự án"
                            onMouseEnter={() => {
                                isCarouselHoveredRef.current = true
                                setIsCarouselHovered(true)
                            }}
                            onMouseLeave={() => {
                                isCarouselHoveredRef.current = false
                                setIsCarouselHovered(false)
                            }}
                        >
                            {PROJECTS.map((project, index) => (
                                <button
                                    key={project.id}
                                    type="button"
                                    onClick={() => setActiveIndex(index)}
                                    aria-label={`Xem dự án ${index + 1}`}
                                    aria-current={index === activeIndex ? 'true' : undefined}
                                    className={`cursor-pointer h-2.5 rounded-full transition-all duration-300 ${index === activeIndex ? 'w-8 bg-blue-600' : 'w-2.5 bg-blue-200 hover:bg-blue-400'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
