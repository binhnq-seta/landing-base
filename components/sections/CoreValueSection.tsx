'use client'
import { Application } from '@splinetool/runtime'
import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'

interface CVFeatureItem {
    id: string | number
    title: string
    description: string
}

interface CVFeaturesData {
    heading?: string
    features?: CVFeatureItem[]
}

interface FeaturesSectionProps {
    data?: CVFeaturesData
}

const X = 350;
const Y = -90;

const FALLBACK_CORE_VALUES = [
    { id: '01', title: 'Giá trị và Niềm tin là trên hết', description: 'Cung cấp giải pháp end-to-end phù hợp với mọi nhu cầu doanh nghiệp.' },
    { id: '02', title: 'Tôn trọng giá trị cá nhân', description: 'Ứng dụng công nghệ mới nhất tối ưu hiệu quả và năng cao năng lực cạnh tranh.' },
    { id: '03', title: 'Tư duy hệ thống - Tư duy toàn cầu', description: 'Đội ngũ giàu kinh nghiệm, tận tâm đồng hành cùng khách hàng trên mọi hành trình.' },
    { id: '04', title: 'Học tập liên tục - Đổi mới không ngừng', description: 'Cam kết chất lượng, bảo mật và hỗ trợ lâu dài cho mọi giải pháp.' },
    { id: '05', title: 'Một công ty - Một gia đình', description: 'Cam kết chất lượng, bảo mật và hỗ trợ lâu dài cho mọi giải pháp.' },
]

export function CoreValueSection({ data }: FeaturesSectionProps) {
    const sectionRef = useRef<HTMLElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let app: Application;
        let isDisposed = false;

        const observer = new IntersectionObserver(
            (entries) => {
                if (!entries[0].isIntersecting) return;
                observer.disconnect();

                async function init() {
                    app = new Application(canvas!);
                    try {
                        await app.load("/model/atomic.splinecode");
                        if (isDisposed) return;

                        const sphere = app.findObjectByName("Sphere 3");
                        const cylinder = app.findObjectByName("Cylinder");
                        const light = app.findObjectByName("Directional Light");
                        if (sphere) { sphere.position.x = X; sphere.position.y = Y; }
                        if (cylinder) { cylinder.position.x = X; cylinder.position.y = Y; }
                        if (light) { light.position.x = X; light.position.y = Y; }
                    } catch {
                        // ignore load errors
                    }
                }

                init();
            },
            { rootMargin: '200px' },
        );

        observer.observe(canvas);

        return () => {
            isDisposed = true;
            observer.disconnect();
            app?.dispose();
        };
    }, []);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        const ctx = gsap.context(() => {
            const targets = gsap.utils.toArray<HTMLElement>('[data-core-reveal]');

            gsap.fromTo(
                targets,
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
            );
        }, section);

        return () => ctx.revert();
    }, []);

    const features = data?.features?.length ? data.features : FALLBACK_CORE_VALUES
    return (
        <section
            ref={sectionRef}
            id="core-values"
            className="relative min-h-screen overflow-hidden"
        >
            <div className="relative z-10 grid min-h-screen grid-cols-[60%_40%]">
                <div className="flex min-h-screen flex-col justify-center py-24 pl-[10vw]">
                    <div data-core-reveal className="text-start">
                        <h1 className="mb-4 text-[clamp(60px,4vw,100px)] font-semibold text-slate-700">
                            {data?.heading ?? 'GIÁ TRỊ CỐT LÕI'}
                        </h1>
                    </div>

                    <div className="grid grid-cols-2 items-stretch gap-2">
                        {features.map((feature) => (
                            <div key={feature.id} data-core-reveal className="h-full">
                                <div className="flex h-full flex-col rounded-xl p-6">
                                    <h3 className="mb-2 text-xl font-extrabold text-[#A31F1A]">
                                        {feature.id}
                                    </h3>

                                    <h3 className="mb-2 text-xl font-bold text-slate-700">
                                        {feature.title}
                                    </h3>

                                    <p className="font-light leading-relaxed text-slate-700">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <canvas
                ref={canvasRef}
                className="absolute inset-0 z-0"
            />
        </section>
    )
}
