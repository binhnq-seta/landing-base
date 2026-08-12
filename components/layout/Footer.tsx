type Locale = 'vi' | 'en'

const FOOTER_TEXT = {
  vi: {
    companyName: 'CÔNG TY CỔ PHẦN TẬP ĐOÀN PHÁT TRIỂN CÔNG NGHỆ VÀ ĐẦU TƯ - GS GROUP',
    address1: 'Số 2 lô F1 Nguyễn Cảnh Dị, Định Công, Hà Nội',
    address2: 'Phòng 809, Deaha Business Centre, 360 Kim Mã, Giảng Võ, Hà Nội',
    colSolutions: 'Giải pháp',
    colProjects: 'Dự án tiêu biểu',
    colContact: 'Liên hệ',
    solutions: ['Giải pháp tích hợp', 'An ninh - Quốc phòng', 'Bảo mật - ATTT', 'Điện lực - Năng lượng', 'Viễn thông', 'Hàng không'],
    projects: ['Phần mềm phân bay (AVES)', 'Hệ thống GSM Cơ động', 'Hệ thống An toàn Thông tin'],
    copyright: 'General Systems. All Rights Reserved.',
  },
  en: {
    companyName: 'GS GROUP TECHNOLOGY DEVELOPMENT AND INVESTMENT JOINT STOCK COMPANY',
    address1: 'No. 2, F1 Lot, Nguyen Canh Di, Dinh Cong, Hanoi',
    address2: 'Room 809, Deaha Business Centre, 360 Kim Ma, Giang Vo, Hanoi',
    colSolutions: 'Solutions',
    colProjects: 'Notable Projects',
    colContact: 'Contact',
    solutions: ['Integration Solutions', 'Defense & Security', 'Cybersecurity – ISEC', 'Power & Energy', 'Telecommunications', 'Aviation'],
    projects: ['Flight Scheduling Software (AVES)', 'Mobile GSM System', 'Information Security System'],
    copyright: 'General Systems. All Rights Reserved.',
  },
} satisfies Record<Locale, object>

const SOLUTION_SLUGS = ['giai-phap-tich-hop', 'an-ninh-quoc-phong', 'bao-mat-attt', 'dien-luc-nang-luong', 'vien-thong', 'hang-khong']
const PROJECT_SLUGS = ['phan-mem-phan-bay-aves', 'he-thong-gsm-co-dong', 'he-thong-an-toan-thong-tin']

const CONTACT_ICON_CLASS = 'mt-0.5 size-4 shrink-0 text-[#BEDBFF]'

interface SiteFooterProps {
  locale?: Locale
  siteName?: string
}

export function SiteFooter({ locale = 'vi', siteName }: SiteFooterProps) {
  const year = new Date().getFullYear()
  const t = FOOTER_TEXT[locale]

  return (
    <footer id="footer" className="bg-[#172A4D]">
      <div className="mx-auto w-full px-5 py-15">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="text-start flex flex-col max-w-full px-5 md:max-w-[45vw] md:pl-20 md:px-0">
            <span className="text-xl font-semibold text-white">{t.companyName}</span>
            <ul className="mt-4 space-y-3 font-light text-sm leading-6 text-white">
              <li className="flex items-start gap-3">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={CONTACT_ICON_CLASS}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
                <span>{t.address1}</span>
              </li>
              <li className="flex items-start gap-3">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={CONTACT_ICON_CLASS}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
                <span>{t.address2}</span>
              </li>
              <li className="flex items-start gap-3">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={CONTACT_ICON_CLASS}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.2 3.8 10 7.3 8.4 9.4a16.2 16.2 0 0 0 6.2 6.2l2.1-1.6 3.5 2.8v2.4a1.8 1.8 0 0 1-1.8 1.8A15.4 15.4 0 0 1 3 5.6a1.8 1.8 0 0 1 1.8-1.8h2.4Z" />
                </svg>
                <a href="tel:+84987359603" className="transition-colors hover:text-[#A31F1A]">0987 359 603</a>
              </li>
              <li className="flex items-start gap-3">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={CONTACT_ICON_CLASS}>
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4 7 8 6 8-6" />
                </svg>
                <a href="mailto:contact@gs-group.vn" className="transition-colors hover:text-[#A31F1A]">contact@gs-group.vn</a>
              </li>
              <li className="flex items-start gap-3">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={CONTACT_ICON_CLASS}>
                  <circle cx="12" cy="12" r="9" />
                  <path strokeLinecap="round" d="M3 12h18M12 3a14.5 14.5 0 0 1 0 18M12 3a14.5 14.5 0 0 0 0 18" />
                </svg>
                <a href="https://www.gs-group.vn" className="transition-colors hover:text-[#A31F1A]">www.gs-group.vn</a>
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:gap-16 md:pl-[16vw]">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">{t.colSolutions}</h3>
              <ul className="mt-4 space-y-3 font-light text-sm text-white">
                {t.solutions.map((label, i) => (
                  <li key={SOLUTION_SLUGS[i]}>
                    <a href={`/solutions/${SOLUTION_SLUGS[i]}`} className="transition-colors hover:text-[#A31F1A]">{label}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">{t.colProjects}</h3>
              <ul className="mt-4 space-y-3 font-light text-sm text-white">
                {t.projects.map((label, i) => (
                  <li key={PROJECT_SLUGS[i]}>
                    <a href={`/projects/${PROJECT_SLUGS[i]}`} className="transition-colors hover:text-[#A31F1A]">{label}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="ml-0 md:ml-20 mt-10 flex flex-col gap-3 border-t border-[#BEDBFF] font-light pt-6 px-5 md:px-0 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-white">© {year} {siteName ?? t.copyright}</p>
        </div>
      </div>
    </footer>
  )
}
