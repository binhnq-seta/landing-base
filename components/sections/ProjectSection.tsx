'use client';

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'

const PROJECTS = [
    {
        id: '01',
        category: 'VIETNAM AIRLINES',
        title: 'Phần mềm phân bay (AVES)',
        img: '/image/rocket.png',
        description:
            'Năm 2018, Chúng tôi được VNA lựa chọn là đơn vị cung cấp giải pháp phần mềm phân bay phi công, tiếp viên (AVES). Cho đến nay Chúng tôi tiếp tục cung cấp dịch vụ bảo trì, nâng cấp và hỗ trợ kỹ thuật cho VNA.',
    },
    {
        id: '02',
        category: 'CỤC KTVN - BỘ CÔNG An',
        title: 'Hệ thống GSM cơ động',
        img: '/image/cloud.png',
        description:
            'Năm 2017, Chúng tôi được lựa chọn là đơn vị triển khai Hệ thống GSM cơ động và Hệ thống phân tích tín hiệu vô tuyến cho Cục KTNV - Bộ Công an',
    },
    {
        id: '03',
        category: 'TỔNG CÔNG TY TRUYỀN TẢI ĐIỆN QUỐC GIA',
        title: 'Hệ thống An toàn Thông tin',
        img: '/image/shield.png',
        description:
            'Dự án trang bị hệ thống An ninh thông tin cho Tổng công ty Truyền tải điện Quốc gia nhằm xây dựng hạ tầng bảo mật tổng thể, bảo vệ an toàn hệ thống CNTT và điều hành lưới điện, đảm bảo vận hành liên tục, tin cậy và tuân thủ các yêu cầu an ninh quốc gia',
    },
]

export default function ProjectSection() {
    const sectionRef = useRef<HTMLElement>(null)

    useEffect(() => {
        const section = sectionRef.current
        if (!section || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

        const ctx = gsap.context(() => {
            const images = gsap.utils.toArray<HTMLElement>('[data-project-image]')
            const revealTargets = gsap.utils.toArray<HTMLElement>('[data-project-reveal]')

            gsap.fromTo(
                revealTargets,
                { opacity: 0, y: 70 },
                {
                    opacity: 1,
                    y: 0,
                    ease: 'circ.out',
                    stagger: 0.1,
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 75%',
                        end: 'top 40%',
                        scrub: 4,
                    },
                },
            )

            const floatTween = gsap.fromTo(
                images,
                { y: -8 },
                {
                    y: 8,
                    duration: 2.25,
                    ease: 'sine.inOut',
                    stagger: 0.35,
                    repeat: -1,
                    yoyo: true,
                    paused: true,
                },
            )

            ScrollTrigger.create({
                trigger: section,
                start: 'top 85%',
                end: 'bottom 15%',
                onToggle: (self) => {
                    if (self.isActive) {
                        gsap.set(images, { willChange: 'transform' })
                        floatTween.play()
                    } else {
                        floatTween.pause()
                        gsap.set(images, { y: 0, clearProps: 'willChange' })
                    }
                },
            })
        }, section)

        return () => ctx.revert()
    }, [])

    return (
        <section ref={sectionRef} id="projects" className="bg-[#FAFAFF] px-[10vw] py-24">
            <div className="mx-auto max-w-[clamp(500px,80%,1200px)]">
                <h2 data-project-reveal className="mb-14 text-center text-4xl font-bold uppercase text-slate-700 sm:text-5xl">
                    Dự án <span className="text-[#A31F1A]">tiêu biểu</span>
                </h2>

                <div>
                    {PROJECTS.map((project, index) => (
                        <article
                            key={project.id}
                            data-project-reveal
                            className={`grid items-center gap-2 py-12 lg:gap-2 ${index === 1 ? 'md:grid-cols-[minmax(0,55fr)_minmax(0,45fr)]' : 'md:grid-cols-[minmax(0,45fr)_minmax(0,55fr)]'}`}
                        >
                            <div
                                data-project-model={project.id}
                                className={`relative aspect-[4/3] w-[88%] max-w-[20vw] justify-self-center overflow-visible md:w-[82%] ${index === 1 ? 'md:order-2 md:justify-self-end' : 'md:justify-self-start'}`}
                            >
                                <div
                                    aria-hidden="true"
                                    className="absolute inset-0 z-0 rounded-xl border border-white/70 bg-[linear-gradient(135deg,rgba(147,197,253,0.52)_0%,rgba(219,234,254,0.30)_48%,rgba(255,255,255,0.68)_100%)]"
                                />

                                <div className="absolute -inset-[14%] z-10 -translate-y-[5%]">
                                    <div
                                        data-project-image
                                        className="relative h-full w-full"
                                    >
                                        <Image
                                            src={project.img}
                                            alt={project.title}
                                            fill
                                            sizes="(min-width: 768px) 26vw, 100vw"
                                            quality={30}
                                            className="select-none object-contain"
                                            draggable={false}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className={`flex flex-col items-start ${index === 1 ? 'md:order-1' : ''}`}>
                                <div className="mb-5 flex items-center gap-4">
                                    <span className="text-sm font-medium uppercase text-slate-500">
                                        {project.category}
                                    </span>
                                </div>
                                <h3 className="max-w-2xl text-2xl font-bold leading-snug text-slate-700 sm:text-3xl">
                                    {project.title}
                                </h3>
                                <p className="mt-5 max-w-2xl text-base leading-8 text-slate-500">
                                    {project.description}
                                </p>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}
