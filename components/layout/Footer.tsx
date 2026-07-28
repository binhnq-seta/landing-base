interface SiteFooterProps {
  siteName?: string
  copyright?: string
}

export function SiteFooter({ siteName = 'General Systems. All Rights Reserved.', copyright }: SiteFooterProps) {
  const year = new Date().getFullYear()

  return (
    <footer id="footer" className="bg-[#00162F]">
      <div className="mx-auto w-full px-5 py-15">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="text-start flex flex-col max-w-full px-5 md:max-w-[45vw] md:pl-20 md:px-0">
            <span className="text-xl font-semibold text-white">CÔNG TY CỔ PHẦN TẬP ĐOÀN PHÁT TRIỂN CÔNG NGHỆ VÀ ĐẦU TƯ
              - GS GROUP</span>
            <p className="mt-3 font-light text-sm leading-6 text-white">
              Số 2 lô F1 Nguyễn Cảnh Dị, Định Công, Hà Nội Phòng 809, Deaha Business Centre, 360 Kim Mã, Giảng Võ, Hà Nội
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">Giải pháp</h3>
              <ul className="mt-4 space-y-3 font-light text-sm text-white">
                <li><a href="#" className="transition-colors hover:text-[#A31F1A]">Giải pháp tích hợp</a></li>
                <li><a href="#" className="transition-colors hover:text-[#A31F1A]">An ninh - Quốc phòng</a></li>
                <li><a href="#" className="transition-colors hover:text-[#A31F1A]">Bảo mật - ATTT</a></li>
                <li><a href="#" className="transition-colors hover:text-[#A31F1A]">Điện lực - Năng lượng</a></li>
                <li><a href="#" className="transition-colors hover:text-[#A31F1A]">Viễn thông</a></li>
                <li><a href="#" className="transition-colors hover:text-[#A31F1A]">Hàng không</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">Dự án tiêu biểu</h3>
              <ul className="mt-4 space-y-3 font-light text-sm text-white">
                <li><a href="#" className="transition-colors hover:text-[#A31F1A]">Phần mềm phân bay (AVES)</a></li>
                <li><a href="#" className="transition-colors hover:text-[#A31F1A]">Hệ thống GSM Cơ động</a></li>
                <li><a href="#" className="transition-colors hover:text-[#A31F1A]">Hệ thống An toàn Thông tin</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">Liên hệ</h3>
              <ul className="mt-4 space-y-3 font-light text-sm text-white">
                <li><a href="#" className="transition-colors hover:text-[#A31F1A]">0987359603</a></li>
                <li><a href="#" className="transition-colors hover:text-[#A31F1A]">www.gs-group.vn</a></li>
                <li><a href="#" className="transition-colors hover:text-[#A31F1A]">contact@gs-group.vn</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="ml-0 md:ml-20 mt-10 flex flex-col gap-3 border-t border-[#BEDBFF] font-light pt-6 px-5 md:px-0 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-white">© {year} {siteName}</p>
          {copyright && <p className="text-sm text-white">{copyright}</p>}
        </div>
      </div>
    </footer>
  )
}
