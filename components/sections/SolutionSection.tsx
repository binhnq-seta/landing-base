'use client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useRef, useEffect } from "react";
import { gsap } from "@/lib/gsap";

const SOLUTION_IMAGE = [
    { title: 'Giải pháp tích hợp', src: '/image/solution/integration.jpg', alt: 'Giải pháp tích hợp', desc: 'GS GROUP có năng lực triển khai trọn gói Data Center, các giải pháp hội nghị truyền hình, và hệ thống thiết bị trường quay chuyên nghiệp.' },
    { title: 'An ninh - Quốc phòng', src: '/image/solution/military.jpg', alt: 'An ninh - Quốc phòng', desc: 'GS GROUP cung cấp nền tảng quản lý mối đe dọa bên ngoài (External Threat Management) và giải pháp phù hợp cho hạ tầng trọng yếu (điện lực, dầu khí, SCADA/ICS).' },
    { title: 'Bảo mật - ATTT', src: '/image/solution/security.jpg', alt: 'Bảo mật - ATTT', desc: 'GS GROUP cung cấp nền tảng quản lý mối đe dọa bên ngoài (External Threat Management) và giải pháp phù hợp cho hạ tầng trọng yếu (điện lực, dầu khí, SCADA/ICS).' },
    { title: 'Điện lực - Năng lượng', src: '/image/solution/energy.jpg', alt: 'Điện lực - Năng lượng', desc: 'GS GROUP cung cấp giải pháp quản lý thiết bị, sửa chữa và báo trì, thu thập và truyền tải số liệu kỹ thuật, giám sát từ xa và chuẩn đoán tình trạng kỹ thuật của thiết bị.' },
    { title: 'Viễn thông', src: '/image/solution/tele.jpg', alt: 'Viễn thông - Năng lượng', desc: 'GS GROUP cung cấp  giải pháp truyền thông di động cao cấp thế hệ mới,  mang lại khả năng kiểm soát toàn diện quyền riêng tư, bảo mật và trải nghiệm liên lạc cho người dùng.' },
    { title: 'Hàng không', src: '/image/solution/air.jpg', alt: 'Hàng không', desc: 'GS GROUP cung cấp giải pháp quản lý và lập lịch khai thác bay, hỗ trợ phân công phi công – tiếp viên, theo dõi giờ bay/giờ nghỉ và tuân thủ quy định an toàn.' },
]

const ROW_ACTIVE = 1.4, ROW_REST = 0.6;   // tổng = 2
const COL_ACTIVE = 1, COL_REST = 0.7;   // tổng = 3 (chỉ áp dụng cho hàng active)
const IMG_SCALE_ACTIVE = 1;
const HOVER_DELAY = 180;

const SOLUTION_SLUGS = [
    'giai-phap-tich-hop',
    'an-ninh-quoc-phong',
    'bao-mat-attt',
    'dien-luc-nang-luong',
    'vien-thong',
    'hang-khong',
];

interface SolutionItem {
    slug: string
    title: string
    src: string
    alt: string
    desc: string
}

interface SolutionSectionProps {
    data?: SolutionItem[]
}

export default function SolutionSection({ data }: SolutionSectionProps) {
    const solutions = data ?? SOLUTION_IMAGE.map((item, i) => ({ ...item, slug: SOLUTION_SLUGS[i] }))
    const router = useRouter();
    const sectionRef = useRef<HTMLElement>(null);
    const crystalRef = useRef<HTMLImageElement>(null);
    const sectionTitleRef = useRef<HTMLHeadingElement>(null);
    const rowContainerRefs = useRef<(HTMLDivElement | null)[]>([]);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
    const overlayRefs = useRef<(HTMLDivElement | null)[]>([]);
    const overlayGradRefs = useRef<(HTMLDivElement | null)[]>([]);
    const descWrapRefs = useRef<(HTMLDivElement | null)[]>([]);
    const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
    const titleRefs = useRef<(HTMLHeadingElement | null)[]>([]);
    const arrowRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const selectionTimelineRef = useRef<gsap.core.Timeline | null>(null);
    const activeIndexRef = useRef(0);
    const descriptionHeightsRef = useRef<number[]>([]);

    useEffect(() => {
        overlayRefs.current.forEach((el, i) => {
            if (!el) return;
            gsap.set(el, { opacity: i === 0 ? 1 : 0 });
        });
        overlayGradRefs.current.forEach((el, i) => {
            if (!el) return;
            gsap.set(el, { opacity: i === 0 ? 0 : 1 });
        });
        imgRefs.current.forEach((el, i) => {
            if (!el) return;
            gsap.set(el, {
                opacity: i === 0 ? 1 : 0.4,
                scale: i === 0 ? IMG_SCALE_ACTIVE : 1,
            });
        });
        titleRefs.current.forEach((el, i) => {
            if (!el) return;
            gsap.set(el, {
                color: i === 0 ? "#FFFFFF" : "#1E293B",
                fontWeight: i === 0 ? "bold" : "normal",
                fontSize: i === 0 ? "clamp(1.25rem,2.25vw,4rem)" : "1.25rem"
            });
        });
        descWrapRefs.current.forEach((el, i) => {
            if (!el) return;
            const natural = el.scrollHeight;
            descriptionHeightsRef.current[i] = natural;
            gsap.set(el, { height: i === 0 ? natural : 0 });
        });
        arrowRefs.current.forEach((el, i) => {
            gsap.set(el, { autoAlpha: i === 0 ? 1 : 0 });
        });

        const cards = cardRefs.current.filter((el): el is HTMLDivElement => el !== null);
        const revealTargets = [crystalRef.current, sectionTitleRef.current, ...cards]
            .filter((el): el is HTMLImageElement | HTMLHeadingElement | HTMLDivElement => el !== null);
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (reduceMotion) {
            gsap.set(revealTargets, { opacity: 1, y: 0 });
            return;
        }

        const revealTween = gsap.fromTo(
            revealTargets,
            { opacity: 0, y: 70 },
            {
                opacity: 1,
                y: 0,
                ease: 'circ.out',
                duration: 0.9,
                stagger: 0.08,
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 75%',
                    end: 'top 40%',
                    scrub: 1,
                },
            },
        );

        return () => {
            revealTween.scrollTrigger?.kill();
            revealTween.kill();
        };
    }, []);

    const handleSelect = (index: number) => {
        if (index === activeIndexRef.current) return;

        const row = Math.floor(index / 3);
        const col = index % 3;
        activeIndexRef.current = index;

        selectionTimelineRef.current?.kill();
        const tl = gsap.timeline({
            defaults: { duration: 0.55, ease: "power3.inOut", overwrite: 'auto' },
        });
        selectionTimelineRef.current = tl;

        tl.to(rowContainerRefs.current, {
            flexGrow: (rowIndex) => rowIndex === row ? ROW_ACTIVE : ROW_REST,
        }, 0);

        tl.to(cardRefs.current, {
            flexGrow: (cardIndex) => {
                const cardRow = Math.floor(cardIndex / 3);
                if (cardRow !== row) return 1;
                return cardIndex % 3 === col ? COL_ACTIVE : COL_REST;
            },
        }, 0);

        overlayRefs.current.forEach((el, i) => {
            if (!el) return;
            tl.to(el, { opacity: i === index ? 1 : 0 }, 0);
        });

        overlayGradRefs.current.forEach((el, i) => {
            if (!el) return;
            tl.to(el, { opacity: i === index ? 0 : 1 }, 0);
        });

        imgRefs.current.forEach((el, i) => {
            if (!el) return;
            tl.to(el, {
                opacity: i === index ? 1 : 0.4,
                scale: i === index ? IMG_SCALE_ACTIVE : 1,
            }, 0);
        });

        titleRefs.current.forEach((el, i) => {
            if (!el) return;
            tl.to(el, {
                color: i === index ? "#FFFFFF" : "#1E293B",
                fontWeight: i === index ? "bold" : "normal",
                fontSize: i === index ? "clamp(1.25rem,2.25vw,4rem)" : "1.25rem"
            }, 0);
        });

        descWrapRefs.current.forEach((el, i) => {
            if (!el) return;
            tl.to(el, { height: i === index ? descriptionHeightsRef.current[i] : 0 }, 0);
        });

        arrowRefs.current.forEach((el, i) => {
            if (!el) return;
            tl.to(el, { autoAlpha: i === index ? 1 : 0, duration: 0.25 }, 0);
        });
    };

    const cancelHoverSelect = () => {
        if (hoverTimerRef.current === null) return;
        clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = null;
    };

    const handleHoverSelect = (index: number) => {
        cancelHoverSelect();
        if (index === activeIndexRef.current) return;

        hoverTimerRef.current = setTimeout(() => {
            hoverTimerRef.current = null;
            handleSelect(index);
        }, HOVER_DELAY);
    };

    useEffect(() => () => {
        cancelHoverSelect();
        selectionTimelineRef.current?.kill();
    }, []);

    return (
        <section ref={sectionRef} id="solutions" className="relative min-h-screen overflow-hidden bg-cover bg-center bg-no-repeat">
            {/* Mobile layout */}
        <div className="block md:hidden px-5 py-14">
            <h1 className="mb-8 text-[clamp(36px,6vw,60px)] font-semibold tracking-wider text-slate-700">
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
                        <h3 className="absolute bottom-3 left-3 right-3 text-sm font-bold text-white leading-tight">{solution.title}</h3>
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
                    <h1 ref={sectionTitleRef} className="mb-20 text-[clamp(60px,4vw,100px)] z-1 font-semibold tracking-wider text-slate-700">
                        GIẢI <br /> PHÁP
                    </h1>
                </div>

                <div className="flex flex-col h-screen">
                    {[0, 1].map((rowIdx) => (
                        <div
                            key={rowIdx}
                            ref={(el) => { rowContainerRefs.current[rowIdx] = el; }}
                            className="flex min-h-0"
                            style={{ flexGrow: rowIdx === 0 ? ROW_ACTIVE : ROW_REST }}
                        >
                            {solutions.slice(rowIdx * 3, rowIdx * 3 + 3).map((solution, colIdx) => {
                                const index = rowIdx * 3 + colIdx;
                                return (
                                    <div
                                        key={index}
                                        data-solution-index={index}
                                        ref={(el) => { cardRefs.current[index] = el; }}
                                        onMouseEnter={() => handleHoverSelect(index)}
                                        onMouseLeave={cancelHoverSelect}
                                        onClick={() => {
                                            if (index === activeIndexRef.current) {
                                                router.push(`/solutions/${solutions[index].slug}`);
                                                return;
                                            }
                                            handleSelect(index);
                                        }}
                                        onKeyDown={(event) => {
                                            if (event.key !== 'Enter' && event.key !== ' ') return;
                                            event.preventDefault();
                                            if (index === activeIndexRef.current) {
                                                router.push(`/solutions/${solutions[index].slug}`);
                                                return;
                                            }
                                            handleSelect(index);
                                        }}
                                        role="button"
                                        tabIndex={0}
                                        className="relative overflow-hidden cursor-pointer basis-0 min-w-0 min-h-0"
                                        style={{
                                            flexGrow: rowIdx === 0
                                                ? (colIdx === 0 ? COL_ACTIVE : COL_REST)
                                                : 1,
                                        }}
                                    >
                                        <Image
                                            ref={(el) => { imgRefs.current[index] = el; }}
                                            src={solution.src}
                                            alt={solution.alt}
                                            fill
                                            sizes="(max-width: 768px) 33vw, 22vw"
                                            className="object-cover"
                                            style={{ opacity: 0.4, filter: "grayscale(100%)" }}
                                        />

                                        <div
                                            ref={(el) => { overlayRefs.current[index] = el; }}
                                            className="absolute inset-0 bg-gradient-to-t from-blue-700/80 to-blue-400/40"
                                            style={{ opacity: 0 }}
                                        />

                                        <div ref={(el) => { overlayGradRefs.current[index] = el; }} className="absolute inset-0 bg-gradient-to-t from-gray-200/80 via-black/5 to-transparent" />

                                        <div className="absolute flex flex-col justify-end items-start inset-0 p-6">
                                            <span
                                                ref={(el) => { arrowRefs.current[index] = el; }}
                                                className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/80 mb-5"
                                                style={{ opacity: index === 0 ? 1 : 0 }}
                                            >
                                                <svg
                                                    aria-hidden="true"
                                                    className="h-5 w-5"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="black"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path d="M5 12h14" />
                                                    <path d="m13 6 6 6-6 6" />
                                                </svg>
                                            </span>
                                            <h3
                                                ref={(el) => { titleRefs.current[index] = el; }}
                                                className="text-slate-700 text-xl">
                                                {solution.title}
                                            </h3>

                                            <div
                                                ref={(el) => { descWrapRefs.current[index] = el; }}
                                                className="w-full overflow-hidden"
                                                style={{ height: 0 }}
                                            >
                                                <p
                                                    className="mt-2 font-light text-sm text-white"
                                                >
                                                    {solution.desc}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
