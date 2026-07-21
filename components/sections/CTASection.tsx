'use client'

import { Application } from '@splinetool/runtime';
import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import Spline from '@splinetool/react-spline';

const X = 750;
const Y = -250;

export function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const targets = gsap.utils.toArray<HTMLElement>('[data-cta-reveal]');

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

  // useEffect(() => {
  //   if (!canvasRef.current) return;

  //   let app: Application;

  //   async function init() {
  //     app = new Application(canvasRef.current!);

  //     await app.load("/model/redCube.splinecode");

  //     const cube = app.findObjectByName("Group");
  //     const background = app.findObjectByName("Ellipse");
  //     background!.position.x = X;
  //     background!.position.y = Y;
  //     cube!.position.x = X;
  //     cube!.position.y = Y;
  //   }

  //   init();

  //   return () => app?.dispose();
  // }, []);

  return (
    <section ref={sectionRef} id="contact" className="relative min-h-[60vh] overflow-hidden bg-[#EEF4FE] px-[10vw] py-24">
      <div data-cta-reveal className="relative z-10">
        <h1 className="mb-14 text-start text-4xl font-normal max-w-[50%] text-slate-700 text-[clamp(30px,2.5vw,90px)]">Khởi động dự án cùng <span className="text-[#A31F1A]">General Systems</span>. Gửi yêu cầu tư vấn ngay hôm nay.</h1>
      </div>
      <div data-cta-reveal className="relative z-10 mt-12 flex justify-start">
        <a href="#" className="rounded-md bg-[#A31F1A] px-6 py-3 text-white hover:bg-[#8a1a15]">
          Kết nối ngay
        </a>
      </div>
      {/* <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
      /> */}
      <Spline
        className="absolute inset-0 z-0"
        scene="https://prod.spline.design/bp1kbK-q0qw-AHdM/scene.splinecode"
      />
    </section>
  )
}
