import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ContactForm } from '@/components/contact/ContactForm'
import { SiteFooter } from '@/components/layout/Footer'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { createPageMetadata } from '@/lib/seo'

type Locale = 'vi' | 'en'

const COPY = {
  vi: {
    eyebrow: 'KẾT NỐI VỚI CHÚNG TÔI', title: 'Cùng kiến tạo giải pháp phù hợp cho tổ chức của bạn',
    intro: 'Hãy chia sẻ bài toán của bạn. Đội ngũ GS Group sẽ phản hồi và cùng bạn xác định hướng triển khai phù hợp.',
    formTitle: 'Gửi yêu cầu tư vấn', formIntro: 'Điền thông tin bên dưới, chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.',
    office: 'Văn phòng', phone: 'Điện thoại', email: 'Email', hours: 'Thời gian làm việc',
    address1: 'Số 2 lô F1 Nguyễn Cảnh Dị, Định Công, Hà Nội',
    address2: 'Phòng 810, Deaha Business Centre, 360 Kim Mã, Giảng Võ, Hà Nội',
    hoursValue: 'Thứ Hai – Thứ Sáu, 08:30 – 17:30',
  },
  en: {
    eyebrow: 'CONNECT WITH US', title: 'Let’s build the right solution for your organisation',
    intro: 'Tell us about your challenge. The GS Group team will get back to you and help identify a practical way forward.',
    formTitle: 'Send an enquiry', formIntro: 'Complete the form below and our team will contact you as soon as possible.',
    office: 'Office', phone: 'Phone', email: 'Email', hours: 'Business hours',
    address1: 'No. 2, F1 Lot, Nguyen Canh Di, Dinh Cong, Hanoi',
    address2: 'Room 810, Deaha Business Centre, 360 Kim Ma, Giang Vo, Hanoi',
    hoursValue: 'Monday – Friday, 08:30 – 17:30',
  },
} as const

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
  const { type } = await params
  return type === 'en'
    ? createPageMetadata({
        locale: 'en',
        title: 'Contact | General Systems',
        description: 'Contact GS Group for technology solution consultation and partnership opportunities.',
        path: '/en/contact',
        alternatePaths: { vi: '/vi/contact', en: '/en/contact', 'x-default': '/vi/contact' },
      })
    : createPageMetadata({
        locale: 'vi',
        title: 'Liên hệ | General Systems',
        description: 'Liên hệ GS Group để được tư vấn giải pháp công nghệ và cơ hội hợp tác.',
        path: '/vi/contact',
        alternatePaths: { vi: '/vi/contact', en: '/en/contact', 'x-default': '/vi/contact' },
      })
}

function ContactIcon({ type }: { type: 'pin' | 'phone' | 'mail' | 'clock' }) {
  const content = {
    pin: <><path d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z" /><circle cx="12" cy="9" r="2.5" /></>,
    phone: <path d="M7.2 3.8 10 7.3 8.4 9.4a16.2 16.2 0 0 0 6.2 6.2l2.1-1.6 3.5 2.8v2.4a1.8 1.8 0 0 1-1.8 1.8A15.4 15.4 0 0 1 3 5.6a1.8 1.8 0 0 1 1.8-1.8h2.4Z" />,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  }

  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true">{content[type]}</svg>
}

export default async function ContactPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params
  if (type !== 'vi' && type !== 'en') notFound()
  const locale = type as Locale
  const t = COPY[locale]
  const contactDetails = [
    { id: 'office-1', type: 'pin' as const, label: t.office, value: t.address1 },
    { id: 'office-2', type: 'pin' as const, label: t.office, value: t.address2 },
    { id: 'phone', type: 'phone' as const, label: t.phone, value: '0987 359 603', href: 'tel:+84987359603' },
    { id: 'email', type: 'mail' as const, label: t.email, value: 'contact@gs-group.vn', href: 'mailto:contact@gs-group.vn' },
    { id: 'hours', type: 'clock' as const, label: t.hours, value: t.hoursValue },
  ]

  return <>
    <SiteHeader locale={locale} />
    <main className="overflow-hidden bg-[#f8fafc]">
      <section className="relative bg-[#172A4D] px-5 pb-28 pt-20 text-white md:px-20 md:pb-36 md:pt-28">
        <div className="absolute -right-24 -top-32 size-[30rem] rounded-full border border-white/10" />
        <div className="absolute -right-8 -top-16 size-[20rem] rounded-full border border-white/10" />
        <div className="relative mx-auto max-w-7xl">
          <p className="text-xs font-semibold tracking-[0.28em] text-[#BEDBFF]">{t.eyebrow}</p>
          <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">{t.title}</h1>
          <p className="mt-6 max-w-2xl text-base font-light leading-7 text-white/70 sm:text-lg">{t.intro}</p>
        </div>
      </section>

      <section className="relative z-10 mx-auto grid max-w-7xl gap-14 px-5 py-20 md:px-10 md:py-24 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-[#F5383B]">{locale === 'vi' ? 'THÔNG TIN LIÊN HỆ' : 'CONTACT DETAILS'}</p>
          <div className="mt-8 space-y-8">
            {contactDetails.map((item) => (
              <div key={item.id} className="flex items-start gap-4">
                <span className="mt-0.5 shrink-0 text-[#F5383B]"><ContactIcon type={item.type} /></span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{item.label}</p>
                  {item.href
                    ? <a href={item.href} className="mt-1.5 block leading-7 text-[#172A4D] transition-colors hover:text-[#F5383B]">{item.value}</a>
                    : <p className="mt-1.5 max-w-sm leading-7 text-[#172A4D]">{item.value}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-[#F5383B]">{t.eyebrow}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#172A4D]">{t.formTitle}</h2>
          <p className="mb-7 mt-3 text-sm leading-6 text-slate-600">{t.formIntro}</p>
          <ContactForm locale={locale} />
        </div>
      </section>
    </main>
    <SiteFooter locale={locale} />
  </>
}
