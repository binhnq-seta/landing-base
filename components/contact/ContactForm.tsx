'use client'

import { useState, type FormEvent } from 'react'

type Locale = 'vi' | 'en'

const COPY = {
  vi: {
    name: 'Họ và tên', company: 'Công ty / Tổ chức', email: 'Email', phone: 'Số điện thoại',
    subject: 'Chủ đề quan tâm', message: 'Nội dung trao đổi', submit: 'Gửi yêu cầu',
    subjects: ['Tư vấn giải pháp', 'Hợp tác kinh doanh', 'Hỗ trợ kỹ thuật', 'Nội dung khác'],
    placeholders: { name: 'Nguyễn Văn A', company: 'Tên đơn vị của bạn', email: 'email@congty.vn', phone: '0901 234 567', message: 'Hãy chia sẻ nhu cầu hoặc câu hỏi của bạn...' },
    note: 'Biểu mẫu sẽ mở ứng dụng email mặc định để bạn kiểm tra và gửi yêu cầu tới GS Group.',
  },
  en: {
    name: 'Full name', company: 'Company / Organisation', email: 'Email', phone: 'Phone number',
    subject: 'Topic', message: 'How can we help?', submit: 'Send enquiry',
    subjects: ['Solution consultation', 'Business partnership', 'Technical support', 'Other'],
    placeholders: { name: 'Your name', company: 'Your organisation', email: 'email@company.com', phone: '+84 901 234 567', message: 'Tell us about your needs or questions...' },
    note: 'The form opens your default email app so you can review and send your enquiry to GS Group.',
  },
} as const

export function ContactForm({ locale }: { locale: Locale }) {
  const t = COPY[locale]
  const [subject, setSubject] = useState<string>(t.subjects[0])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const body = [
      `${t.name}: ${data.get('name')}`,
      `${t.company}: ${data.get('company') || '-'}`,
      `${t.email}: ${data.get('email')}`,
      `${t.phone}: ${data.get('phone') || '-'}`,
      '',
      `${t.message}:`,
      String(data.get('message')),
    ].join('\n')

    window.location.href = `mailto:contact@gs-group.vn?subject=${encodeURIComponent(`[Website] ${subject}`)}&body=${encodeURIComponent(body)}`
  }

  const inputClass = 'mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#F5383B] focus:ring-4 focus:ring-red-50'

  return (
    <form onSubmit={handleSubmit} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(23,42,77,0.10)] sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">{t.name}<span className="text-[#F5383B]"> *</span><input name="name" required autoComplete="name" placeholder={t.placeholders.name} className={inputClass} /></label>
        <label className="text-sm font-medium text-slate-700">{t.company}<input name="company" autoComplete="organization" placeholder={t.placeholders.company} className={inputClass} /></label>
        <label className="text-sm font-medium text-slate-700">{t.email}<span className="text-[#F5383B]"> *</span><input name="email" required type="email" autoComplete="email" placeholder={t.placeholders.email} className={inputClass} /></label>
        <label className="text-sm font-medium text-slate-700">{t.phone}<input name="phone" type="tel" autoComplete="tel" placeholder={t.placeholders.phone} className={inputClass} /></label>
      </div>
      <label className="mt-5 block text-sm font-medium text-slate-700">{t.subject}
        <select name="subject" value={subject} onChange={(event) => setSubject(event.target.value)} className={inputClass}>
          {t.subjects.map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label className="mt-5 block text-sm font-medium text-slate-700">{t.message}<span className="text-[#F5383B]"> *</span>
        <textarea name="message" required rows={5} placeholder={t.placeholders.message} className={`${inputClass} resize-y`} />
      </label>
      <button type="submit" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#F5383B] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-red-200 transition hover:-translate-y-0.5 hover:bg-[#d9292c] focus:outline-none focus:ring-4 focus:ring-red-200 sm:w-auto">
        {t.submit}<span aria-hidden="true">→</span>
      </button>
      <p className="mt-4 text-xs leading-5 text-slate-500">{t.note}</p>
    </form>
  )
}
