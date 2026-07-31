type Locale = 'vi' | 'en'

const FOOTER_TEXT = {
  vi: {
    companyName: 'CÔNG TY CỔ PHẦN TẬP ĐOÀN PHÁT TRIỂN CÔNG NGHỆ VÀ ĐẦU TƯ - GS GROUP',
    address: 'Số 2 lô F1 Nguyễn Cảnh Dị, Định Công, Hà Nội · Phòng 809, Deaha Business Centre, 360 Kim Mã, Giảng Võ, Hà Nội',
    colSolutions: 'Giải pháp',
    colProjects: 'Dự án tiêu biểu',
    colContact: 'Liên hệ',
    solutions: ['Giải pháp tích hợp', 'An ninh - Quốc phòng', 'Bảo mật - ATTT', 'Điện lực - Năng lượng', 'Viễn thông', 'Hàng không'],
    projects: ['Phần mềm phân bay (AVES)', 'Hệ thống GSM Cơ động', 'Hệ thống An toàn Thông tin'],
    copyright: 'General Systems. All Rights Reserved.',
  },
  en: {
    companyName: 'GS GROUP TECHNOLOGY DEVELOPMENT AND INVESTMENT JOINT STOCK COMPANY',
    address: 'No. 2, F1 Lot, Nguyen Canh Di, Dinh Cong, Hanoi · Room 809, Deaha Business Centre, 360 Kim Ma, Giang Vo, Hanoi',
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

interface SiteFooterProps {
  locale?: Locale
  siteName?: string
}

export function SiteFooter({ locale = 'vi', siteName }: SiteFooterProps) {
  const year = new Date().getFullYear()
  const t = FOOTER_TEXT[locale]

  return (
    <footer id="footer" className="bg-[#00162F]">
      <div className="mx-auto w-full px-5 py-15">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="text-start flex flex-col max-w-full px-5 md:max-w-[45vw] md:pl-20 md:px-0">
            <span className="text-xl font-semibold text-white">{t.companyName}</span>
            <p className="mt-3 font-light text-sm leading-6 text-white">{t.address}</p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
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

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">{t.colContact}</h3>
              <ul className="mt-4 space-y-3 font-light text-sm text-white">
                <li><a href="tel:+840987359603" className="transition-colors hover:text-[#A31F1A]">0987 359 603</a></li>
                <li><a href="https://www.gs-group.vn" className="transition-colors hover:text-[#A31F1A]">www.gs-group.vn</a></li>
                <li><a href="mailto:contact@gs-group.vn" className="transition-colors hover:text-[#A31F1A]">contact@gs-group.vn</a></li>
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
