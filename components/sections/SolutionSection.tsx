'use client'
import { useRef, useState, useEffect } from "react";
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

export default function SolutionSection() {
    const [activeIndex, setActiveIndex] = useState(0);

    const sectionRef = useRef<HTMLElement>(null);
    const crystalRef = useRef<HTMLImageElement>(null);
    const sectionTitleRef = useRef<HTMLHeadingElement>(null);
    const rowContainerRefs = useRef<(HTMLDivElement | null)[]>([]);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
    const overlayRefs = useRef<(HTMLDivElement | null)[]>([]);
    const overlayGradRefs = useRef<(HTMLDivElement | null)[]>([]);
    const descWrapRefs = useRef<(HTMLDivElement | null)[]>([]);
    const descRefs = useRef<(HTMLParagraphElement | null)[]>([]);
    const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
    const titleRefs = useRef<(HTMLHeadingElement | null)[]>([]);

    const rows = useRef({ r0: ROW_ACTIVE, r1: ROW_REST });
    const cols = useRef([
        [COL_ACTIVE, COL_REST, COL_REST],
        [1, 1, 1],
    ]);

    const applyRows = () => {
        rowContainerRefs.current.forEach((el, r) => {
            if (!el) return;
            el.style.flexGrow = String(r === 0 ? rows.current.r0 : rows.current.r1);
        });
    };

    const applyCols = () => {
        cardRefs.current.forEach((el, i) => {
            if (!el) return;
            const row = Math.floor(i / 3);
            const col = i % 3;
            el.style.flexGrow = String(cols.current[row][col]);
        });
    };

    useEffect(() => {
        applyRows();
        applyCols();

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
            gsap.set(el, { height: i === 0 ? natural : 0 });
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
                stagger: 0.1,
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 75%',
                    end: 'top 40%',
                    scrub: 4,
                },
            },
        );

        return () => {
            revealTween.scrollTrigger?.kill();
            revealTween.kill();
        };
    }, []);

    const handleSelect = (index: number) => {
        if (index === activeIndex) return;

        const row = Math.floor(index / 3);
        const col = index % 3;

        const tl = gsap.timeline({ defaults: { duration: 0.6, ease: "power3.inOut" } });

        tl.to(rows.current, {
            r0: row === 0 ? ROW_ACTIVE : ROW_REST,
            r1: row === 1 ? ROW_ACTIVE : ROW_REST,
            onUpdate: applyRows,
        }, 0);

        const nextCols = [
            row === 0 ? [0, 1, 2].map((c) => (c === col ? COL_ACTIVE : COL_REST)) : [1, 1, 1],
            row === 1 ? [0, 1, 2].map((c) => (c === col ? COL_ACTIVE : COL_REST)) : [1, 1, 1],
        ];
        const proxy = {
            r0c0: cols.current[0][0], r0c1: cols.current[0][1], r0c2: cols.current[0][2],
            r1c0: cols.current[1][0], r1c1: cols.current[1][1], r1c2: cols.current[1][2],
        };
        tl.to(proxy, {
            r0c0: nextCols[0][0], r0c1: nextCols[0][1], r0c2: nextCols[0][2],
            r1c0: nextCols[1][0], r1c1: nextCols[1][1], r1c2: nextCols[1][2],
            onUpdate: () => {
                cols.current = [
                    [proxy.r0c0, proxy.r0c1, proxy.r0c2],
                    [proxy.r1c0, proxy.r1c1, proxy.r1c2],
                ];
                applyCols();
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
            tl.to(el, { height: i === index ? 110 : 0 }, 0);
        });

        setActiveIndex(index);
    };

    return (
        <section ref={sectionRef} id="solutions" className="bg-[#E3F2FD] min-h-screen overflow-hidden relative">
            <div className="grid grid-cols-[35%_65%] min-h-screen">
                <img ref={crystalRef} src="/image/crystal.png" alt="Crystal" className="absolute z-0 w-[50%] -top-1/5 -left-[25%] drop-shadow-[0_0_80px_rgba(120,120,120,0.35)]" />
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
                            {SOLUTION_IMAGE.slice(rowIdx * 3, rowIdx * 3 + 3).map((solution, colIdx) => {
                                const index = rowIdx * 3 + colIdx;
                                return (
                                    <div
                                        key={index}
                                        data-solution-index={index}
                                        ref={(el) => { cardRefs.current[index] = el; }}
                                        onClick={() => handleSelect(index)}
                                        className="relative overflow-hidden cursor-pointer basis-0 min-w-0 min-h-0"
                                        style={{
                                            flexGrow: rowIdx === 0
                                                ? (colIdx === 0 ? COL_ACTIVE : COL_REST)
                                                : 1,
                                        }}
                                    >
                                        <img
                                            ref={(el) => { imgRefs.current[index] = el; }}
                                            src={solution.src}
                                            alt={solution.alt}
                                            className="absolute inset-0 w-full h-full object-cover"
                                            style={{ opacity: 0.4, filter: "grayscale(100%)" }}
                                        />

                                        <div
                                            ref={(el) => { overlayRefs.current[index] = el; }}
                                            className="absolute inset-0 bg-gradient-to-t from-blue-700/80 to-blue-400/40"
                                            style={{ opacity: 0 }}
                                        />

                                        <div ref={(el) => { overlayGradRefs.current[index] = el; }} className="absolute inset-0 bg-gradient-to-t from-gray-200/80 via-black/5 to-transparent" />

                                        <div className="absolute flex flex-col justify-end items-start inset-0 p-6">
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
                                                    ref={(el) => { descRefs.current[index] = el; }}
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
