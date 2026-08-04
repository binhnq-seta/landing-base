import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'

// ─── Locale helpers ───────────────────────────────────────────────────────────

const SUPPORTED_LOCALES = ['vi', 'en'] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

function contentPath(locale: SupportedLocale): string {
  // Vietnamese uses the original file for backward-compatibility
  const file = locale === 'vi' ? 'content.json' : `content.${locale}.json`
  return path.join(process.cwd(), 'data', file)
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CMSHero {
  heading: string
  description: string
  ctaLabel: string
  ctaHref: string
}

export interface CMSCoreValue {
  id: string
  title: string
  description: string
}

export interface CMSCoreValues {
  heading: string
  items: CMSCoreValue[]
}

export interface CMSSolution {
  slug: string
  title: string
  src: string
  alt: string
  desc: string
}

export interface CMSProject {
  id: string
  slug: string
  category: string
  title: string
  img: string
  description: string
}

export interface CMSPartner {
  src: string
  alt: string
}

export type DetailImageStyle = 'cover' | 'contain' | 'portrait' | 'wide'
export type DetailImagePosition = 'auto' | 'left' | 'right'
export type DetailPageLayout = 'headline' | 'magazine' | 'immersive' | 'editorial'
export type DetailSectionKind = 'content' | 'heading' | 'image-points'

export interface CMSDetailPoint {
  title: string
  description: string
}

export interface CMSDetailSection {
  kind?: DetailSectionKind
  title: string
  description: string
  image: string
  imageAlt: string
  imagePosition?: DetailImagePosition
  imageStyle?: DetailImageStyle
  buttonHref?: string
  points?: CMSDetailPoint[]
}

export interface CMSDetailPage {
  type: 'solutions' | 'projects'
  slug: string
  eyebrow: string
  title: string
  summary: string
  heroImage: string
  heroImageAlt: string
  layout?: DetailPageLayout
  sections: CMSDetailSection[]
}

/** A single corner in the Rubik showcase — display data only (geometry lives in config.ts) */
export interface CMSShowcaseCorner {
  /** Matches ShowcaseGeometry.id in config.ts — used to join with 3D geometry */
  id: string
  label: string
  sublabel: string
  image: string
}

export interface CMSFeatureItem {
  id: string
  title: string
  description: string
}

export interface CMSFeatures {
  heading: string
  items: CMSFeatureItem[]
}

export interface CMSSectionLabels {
  solutions: string
  projects: string
  viewMore: string
  partners: string
}

export interface CMSContent {
  hero: CMSHero
  features: CMSFeatures
  coreValues: CMSCoreValues
  solutions: CMSSolution[]
  projects: CMSProject[]
  partners: CMSPartner[]
  sectionLabels: CMSSectionLabels
  detailPages: CMSDetailPage[]
  /** Rubik cube showcase corners — display data editable per locale */
  showcaseCorners: CMSShowcaseCorner[]
}

// ─── Vietnamese defaults ──────────────────────────────────────────────────────

const DEFAULT_VI: CMSContent = {
  hero: {
    heading: 'KẾT NỐI CÔNG NGHỆ XÂY DỰNG TƯƠNG LAI',
    description:
      'General Systems cung cấp các giải pháp công nghệ toàn diện, giúp doanh nghiệp tối ưu hiệu quả và tối ưu hoá trong kỷ nguyên số.',
    ctaLabel: 'Khám Phá Giải Pháp',
    ctaHref: '#solutions',
  },
  features: {
    heading: 'VÌ SAO CHỌN GENERAL SYSTEMS?',
    items: [
      { id: '01', title: 'Giải pháp toàn diện', description: 'Cung cấp giải pháp end-to-end phù hợp với mọi nhu cầu doanh nghiệp.' },
      { id: '02', title: 'Công nghệ tiên tiến', description: 'Ứng dụng công nghệ mới nhất tối ưu hiệu quả và nâng cao năng lực cạnh tranh.' },
      { id: '03', title: 'Đội ngũ chuyên gia', description: 'Đội ngũ giàu kinh nghiệm, tận tâm đồng hành cùng khách hàng trên mọi hành trình.' },
      { id: '04', title: 'Cam kết chất lượng', description: 'Cam kết chất lượng, bảo mật và hỗ trợ lâu dài cho mọi giải pháp.' },
    ],
  },
  coreValues: {
    heading: 'GIÁ TRỊ CỐT LÕI',
    items: [
      { id: '01', title: 'Giá trị và Niềm tin là trên hết', description: 'Cung cấp giải pháp end-to-end phù hợp với mọi nhu cầu doanh nghiệp.' },
      { id: '02', title: 'Tôn trọng giá trị cá nhân', description: 'Ứng dụng công nghệ mới nhất tối ưu hiệu quả và năng cao năng lực cạnh tranh.' },
      { id: '03', title: 'Tư duy hệ thống - Tư duy toàn cầu', description: 'Đội ngũ giàu kinh nghiệm, tận tâm đồng hành cùng khách hàng trên mọi hành trình.' },
      { id: '04', title: 'Học tập liên tục - Đổi mới không ngừng', description: 'Cam kết chất lượng, bảo mật và hỗ trợ lâu dài cho mọi giải pháp.' },
      { id: '05', title: 'Một công ty - Một gia đình', description: 'Cam kết chất lượng, bảo mật và hỗ trợ lâu dài cho mọi giải pháp.' },
    ],
  },
  solutions: [
    { slug: 'giai-phap-tich-hop', title: 'Giải pháp tích hợp', src: '/image/solution/integration.jpg', alt: 'Giải pháp tích hợp', desc: 'GS GROUP có năng lực triển khai trọn gói Data Center, các giải pháp hội nghị truyền hình, và hệ thống thiết bị trường quay chuyên nghiệp.' },
    { slug: 'an-ninh-quoc-phong', title: 'An ninh - Quốc phòng', src: '/image/solution/military.jpg', alt: 'An ninh - Quốc phòng', desc: 'GS GROUP cung cấp nền tảng quản lý mối đe dọa bên ngoài (External Threat Management) và giải pháp phù hợp cho hạ tầng trọng yếu.' },
    { slug: 'bao-mat-attt', title: 'Bảo mật - ATTT', src: '/image/solution/security.jpg', alt: 'Bảo mật - ATTT', desc: 'GS GROUP cung cấp nền tảng quản lý mối đe dọa bên ngoài (External Threat Management) và giải pháp phù hợp cho hạ tầng trọng yếu.' },
    { slug: 'dien-luc-nang-luong', title: 'Điện lực - Năng lượng', src: '/image/solution/energy.jpg', alt: 'Điện lực - Năng lượng', desc: 'GS GROUP cung cấp giải pháp quản lý thiết bị, sửa chữa và báo trì, thu thập và truyền tải số liệu kỹ thuật, giám sát từ xa.' },
    { slug: 'vien-thong', title: 'Viễn thông', src: '/image/solution/tele.jpg', alt: 'Viễn thông', desc: 'GS GROUP cung cấp giải pháp truyền thông di động cao cấp thế hệ mới, mang lại khả năng kiểm soát toàn diện quyền riêng tư.' },
    { slug: 'hang-khong', title: 'Hàng không', src: '/image/solution/air.jpg', alt: 'Hàng không', desc: 'GS GROUP cung cấp giải pháp quản lý và lập lịch khai thác bay, hỗ trợ phân công phi công – tiếp viên.' },
  ],
  projects: [
    { id: '01', slug: 'phan-mem-phan-bay-aves', category: 'VIETNAM AIRLINES', title: 'Phần mềm phân bay (AVES)', img: '/image/project/aves.jpg', description: 'Năm 2018, Chúng tôi được VNA lựa chọn là đơn vị cung cấp giải pháp phần mềm phân bay phi công, tiếp viên (AVES).' },
    { id: '02', slug: 'he-thong-gsm-co-dong', category: 'CỤC KTVN - BỘ CÔNG AN', title: 'Hệ thống GSM cơ động', img: '/image/project/gms.jpg', description: 'Năm 2017, Chúng tôi được lựa chọn là đơn vị triển khai Hệ thống GSM cơ động và Hệ thống phân tích tín hiệu vô tuyến cho Cục KTNV - Bộ Công an.' },
    { id: '03', slug: 'he-thong-an-toan-thong-tin', category: 'TỔNG CÔNG TY TRUYỀN TẢI ĐIỆN QUỐC GIA', title: 'Hệ thống An toàn Thông tin', img: '/image/project/sec.jpg', description: 'Dự án trang bị hệ thống An ninh thông tin cho Tổng công ty Truyền tải điện Quốc gia nhằm xây dựng hạ tầng bảo mật tổng thể.' },
  ],
  partners: [
    { src: '/image/partner-logo/petro.png', alt: 'PetroVietnam' },
    { src: '/image/partner-logo/evn.png', alt: 'EVN' },
    { src: '/image/partner-logo/image%2033.png', alt: 'Đối tác General Systems 1' },
    { src: '/image/partner-logo/image%2032.png', alt: 'Đối tác General Systems 2' },
    { src: '/image/partner-logo/image%2032-1.png', alt: 'Đối tác General Systems 3' },
    { src: '/image/partner-logo/image%2032-2.png', alt: 'Đối tác General Systems 4' },
    { src: '/image/partner-logo/image%2032-3.png', alt: 'Đối tác General Systems 5' },
    { src: '/image/partner-logo/image%2032-4.png', alt: 'Đối tác General Systems 6' },
  ],
  sectionLabels: {
    solutions: 'GIẢI PHÁP',
    projects: 'Dự án tiêu biểu',
    viewMore: 'Xem thêm',
    partners: 'ĐỐI TÁC CỦA CHÚNG TÔI',
  },
  showcaseCorners: [
    { id: 'integration',  label: 'GIẢI PHÁP',  sublabel: 'TÍCH HỢP',    image: '/image/solution/integration.jpg' },
    { id: 'security',     label: 'BẢO MẬT',    sublabel: 'ATTT',         image: '/image/solution/security.jpg'    },
    { id: 'digital',      label: 'CÔNG NGHỆ',  sublabel: 'SỐ',           image: '/image/solution/integration.jpg' },
    { id: 'network',      label: 'HẠ TẦNG',    sublabel: 'MẠNG',         image: '/image/solution/tele.jpg'        },
    { id: 'military',     label: 'AN NINH',     sublabel: 'QUỐC PHÒNG',   image: '/image/solution/military.jpg'    },
    { id: 'telecom',      label: 'VIỄN THÔNG',  sublabel: '',             image: '/image/solution/tele.jpg'        },
    { id: 'aviation',     label: 'HÀNG KHÔNG',  sublabel: '',             image: '/image/solution/air.jpg'         },
    { id: 'energy',       label: 'ĐIỆN LỰC',    sublabel: 'NĂNG LƯỢNG',   image: '/image/solution/energy.jpg'      },
  ],
  detailPages: [
    {
      type: 'solutions', slug: 'giai-phap-tich-hop', eyebrow: 'Giải pháp',
      title: 'Giải pháp tích hợp toàn diện cho hạ tầng số',
      summary: 'GS Group kết nối công nghệ, con người và quy trình để kiến tạo những hệ thống đồng bộ, an toàn và sẵn sàng mở rộng theo nhu cầu thực tế của doanh nghiệp.',
      heroImage: '/image/solution/integration.jpg', heroImageAlt: 'Hạ tầng công nghệ tích hợp hiện đại',
      sections: [
        { title: 'Thiết kế từ nhu cầu thực tế', description: 'Mỗi giải pháp bắt đầu bằng việc khảo sát hiện trạng, xác định mục tiêu vận hành và xây dựng kiến trúc phù hợp với nguồn lực của khách hàng.', image: '/image/solution/security.jpg', imageAlt: 'Chuyên gia phân tích hệ thống bảo mật', imagePosition: 'auto', imageStyle: 'cover' },
        { title: 'Triển khai đồng bộ, kiểm soát chặt chẽ', description: 'Quy trình triển khai được chuẩn hóa từ tích hợp thiết bị, phần mềm đến kiểm thử, chuyển giao và đào tạo đội ngũ vận hành.', image: '/image/solution/tele.jpg', imageAlt: 'Hệ thống viễn thông được tích hợp đồng bộ', imagePosition: 'auto', imageStyle: 'cover' },
        { title: 'Đồng hành trong suốt vòng đời hệ thống', description: 'Dịch vụ giám sát, bảo trì và nâng cấp giúp hệ thống luôn ổn định, bảo mật và thích ứng với những yêu cầu mới.', image: '/image/solution/energy.jpg', imageAlt: 'Hệ thống năng lượng và trung tâm vận hành', imagePosition: 'auto', imageStyle: 'cover' },
      ],
    },
    {
      type: 'projects', slug: 'phan-mem-phan-bay-aves', eyebrow: 'Dự án tiêu biểu · Vietnam Airlines',
      title: 'Phần mềm phân bay AVES',
      summary: 'Nền tảng hỗ trợ lập lịch, phân công phi công và tiếp viên, góp phần tối ưu nguồn lực khai thác bay và bảo đảm các yêu cầu an toàn vận hành.',
      heroImage: '/image/slide-bg.jpg', heroImageAlt: 'Dự án phần mềm phân bay AVES',
      sections: [
        { title: 'Bài toán vận hành quy mô lớn', description: 'Hệ thống cần xử lý khối lượng lịch bay phức tạp, nhiều ràng buộc nghiệp vụ và thay đổi liên tục trong quá trình khai thác.', image: '/image/solution/air.jpg', imageAlt: 'Hoạt động khai thác hàng không', imagePosition: 'auto', imageStyle: 'cover' },
        { title: 'Tự động hóa công tác phân bay', description: 'AVES hỗ trợ lập kế hoạch và phân bổ tổ bay dựa trên năng lực, lịch làm việc và những quy định về giờ bay, giờ nghỉ.', image: '/image/solution/integration.jpg', imageAlt: 'Nền tảng phần mềm quản lý tập trung', imagePosition: 'auto', imageStyle: 'cover' },
        { title: 'Bảo trì và phát triển dài hạn', description: 'Từ năm 2018, GS Group tiếp tục cung cấp dịch vụ bảo trì, nâng cấp và hỗ trợ kỹ thuật để hệ thống đáp ứng hoạt động thực tế.', image: '/image/solution/security.jpg', imageAlt: 'Đội ngũ theo dõi và hỗ trợ hệ thống', imagePosition: 'auto', imageStyle: 'cover' },
      ],
    },
    { type: 'solutions', slug: 'an-ninh-quoc-phong', eyebrow: 'Giải pháp', title: 'An ninh - Quốc phòng', summary: 'Giải pháp công nghệ chuyên dụng, bảo đảm khả năng chỉ huy, kết nối và vận hành an toàn cho các hệ thống trọng yếu.', heroImage: '/image/solution/military.jpg', heroImageAlt: 'An ninh - Quốc phòng', sections: [{ title: 'Khảo sát và phân tích', description: 'Đội ngũ chuyên gia đánh giá hiện trạng, yêu cầu nghiệp vụ và các tiêu chuẩn kỹ thuật trước khi xây dựng phương án.', image: '/image/solution/integration.jpg', imageAlt: 'Khảo sát và phân tích hệ thống', imagePosition: 'auto', imageStyle: 'cover' }, { title: 'Thiết kế và triển khai', description: 'Giải pháp được thiết kế theo từng nhu cầu cụ thể, triển khai đồng bộ và kiểm thử chặt chẽ trước khi chuyển giao.', image: '/image/solution/tele.jpg', imageAlt: 'Thiết kế và triển khai giải pháp', imagePosition: 'auto', imageStyle: 'cover' }, { title: 'Vận hành và đồng hành', description: 'Dịch vụ hỗ trợ, bảo trì và nâng cấp giúp hệ thống duy trì hiệu quả, ổn định và sẵn sàng phát triển lâu dài.', image: '/image/solution/security.jpg', imageAlt: 'Giám sát và vận hành hệ thống', imagePosition: 'auto', imageStyle: 'cover' }] },
    { type: 'solutions', slug: 'bao-mat-attt', eyebrow: 'Giải pháp', title: 'Bảo mật - An toàn thông tin', summary: 'Nền tảng bảo vệ nhiều lớp giúp nhận diện sớm nguy cơ, giám sát liên tục và chủ động ứng phó với các mối đe dọa số.', heroImage: '/image/solution/security.jpg', heroImageAlt: 'Bảo mật - ATTT', sections: [{ title: 'Khảo sát và phân tích', description: 'Đội ngũ chuyên gia đánh giá hiện trạng, yêu cầu nghiệp vụ và các tiêu chuẩn kỹ thuật trước khi xây dựng phương án.', image: '/image/solution/integration.jpg', imageAlt: 'Khảo sát và phân tích hệ thống', imagePosition: 'auto', imageStyle: 'cover' }, { title: 'Thiết kế và triển khai', description: 'Giải pháp được thiết kế theo từng nhu cầu cụ thể, triển khai đồng bộ và kiểm thử chặt chẽ trước khi chuyển giao.', image: '/image/solution/tele.jpg', imageAlt: 'Thiết kế và triển khai giải pháp', imagePosition: 'auto', imageStyle: 'cover' }, { title: 'Vận hành và đồng hành', description: 'Dịch vụ hỗ trợ, bảo trì và nâng cấp giúp hệ thống duy trì hiệu quả, ổn định và sẵn sàng phát triển lâu dài.', image: '/image/solution/security.jpg', imageAlt: 'Giám sát và vận hành hệ thống', imagePosition: 'auto', imageStyle: 'cover' }] },
    { type: 'solutions', slug: 'dien-luc-nang-luong', eyebrow: 'Giải pháp', title: 'Điện lực - Năng lượng', summary: 'Số hóa công tác quản lý thiết bị, giám sát từ xa và bảo trì nhằm nâng cao độ tin cậy của hạ tầng năng lượng.', heroImage: '/image/solution/energy.jpg', heroImageAlt: 'Điện lực - Năng lượng', sections: [{ title: 'Khảo sát và phân tích', description: 'Đội ngũ chuyên gia đánh giá hiện trạng, yêu cầu nghiệp vụ và các tiêu chuẩn kỹ thuật trước khi xây dựng phương án.', image: '/image/solution/integration.jpg', imageAlt: 'Khảo sát và phân tích hệ thống', imagePosition: 'auto', imageStyle: 'cover' }, { title: 'Thiết kế và triển khai', description: 'Giải pháp được thiết kế theo từng nhu cầu cụ thể, triển khai đồng bộ và kiểm thử chặt chẽ trước khi chuyển giao.', image: '/image/solution/tele.jpg', imageAlt: 'Thiết kế và triển khai giải pháp', imagePosition: 'auto', imageStyle: 'cover' }, { title: 'Vận hành và đồng hành', description: 'Dịch vụ hỗ trợ, bảo trì và nâng cấp giúp hệ thống duy trì hiệu quả, ổn định và sẵn sàng phát triển lâu dài.', image: '/image/solution/security.jpg', imageAlt: 'Giám sát và vận hành hệ thống', imagePosition: 'auto', imageStyle: 'cover' }] },
    { type: 'solutions', slug: 'vien-thong', eyebrow: 'Giải pháp', title: 'Viễn thông', summary: 'Hạ tầng truyền thông thế hệ mới mang lại kết nối ổn định, bảo mật và khả năng kiểm soát toàn diện.', heroImage: '/image/solution/tele.jpg', heroImageAlt: 'Viễn thông', sections: [{ title: 'Khảo sát và phân tích', description: 'Đội ngũ chuyên gia đánh giá hiện trạng, yêu cầu nghiệp vụ và các tiêu chuẩn kỹ thuật trước khi xây dựng phương án.', image: '/image/solution/integration.jpg', imageAlt: 'Khảo sát và phân tích hệ thống', imagePosition: 'auto', imageStyle: 'cover' }, { title: 'Thiết kế và triển khai', description: 'Giải pháp được thiết kế theo từng nhu cầu cụ thể, triển khai đồng bộ và kiểm thử chặt chẽ trước khi chuyển giao.', image: '/image/solution/tele.jpg', imageAlt: 'Thiết kế và triển khai giải pháp', imagePosition: 'auto', imageStyle: 'cover' }, { title: 'Vận hành và đồng hành', description: 'Dịch vụ hỗ trợ, bảo trì và nâng cấp giúp hệ thống duy trì hiệu quả, ổn định và sẵn sàng phát triển lâu dài.', image: '/image/solution/security.jpg', imageAlt: 'Giám sát và vận hành hệ thống', imagePosition: 'auto', imageStyle: 'cover' }] },
    { type: 'solutions', slug: 'hang-khong', eyebrow: 'Giải pháp', title: 'Hàng không', summary: 'Các nền tảng quản lý khai thác bay hỗ trợ lập lịch, điều phối nguồn lực và tuân thủ yêu cầu an toàn hàng không.', heroImage: '/image/solution/air.jpg', heroImageAlt: 'Hàng không', sections: [{ title: 'Khảo sát và phân tích', description: 'Đội ngũ chuyên gia đánh giá hiện trạng, yêu cầu nghiệp vụ và các tiêu chuẩn kỹ thuật trước khi xây dựng phương án.', image: '/image/solution/integration.jpg', imageAlt: 'Khảo sát và phân tích hệ thống', imagePosition: 'auto', imageStyle: 'cover' }, { title: 'Thiết kế và triển khai', description: 'Giải pháp được thiết kế theo từng nhu cầu cụ thể, triển khai đồng bộ và kiểm thử chặt chẽ trước khi chuyển giao.', image: '/image/solution/tele.jpg', imageAlt: 'Thiết kế và triển khai giải pháp', imagePosition: 'auto', imageStyle: 'cover' }, { title: 'Vận hành và đồng hành', description: 'Dịch vụ hỗ trợ, bảo trì và nâng cấp giúp hệ thống duy trì hiệu quả, ổn định và sẵn sàng phát triển lâu dài.', image: '/image/solution/security.jpg', imageAlt: 'Giám sát và vận hành hệ thống', imagePosition: 'auto', imageStyle: 'cover' }] },
    { type: 'projects', slug: 'he-thong-gsm-co-dong', eyebrow: 'Dự án tiêu biểu · Cục KTNV - Bộ Công an', title: 'Hệ thống GSM cơ động', summary: 'Hệ thống GSM cơ động và phân tích tín hiệu vô tuyến được triển khai nhằm đáp ứng yêu cầu nghiệp vụ chuyên biệt.', heroImage: '/image/solution/tele.jpg', heroImageAlt: 'Hệ thống GSM cơ động', sections: [{ title: 'Khảo sát và phân tích', description: 'Đội ngũ chuyên gia đánh giá hiện trạng, yêu cầu nghiệp vụ và các tiêu chuẩn kỹ thuật trước khi xây dựng phương án.', image: '/image/solution/integration.jpg', imageAlt: 'Khảo sát và phân tích hệ thống', imagePosition: 'auto', imageStyle: 'cover' }, { title: 'Thiết kế và triển khai', description: 'Giải pháp được thiết kế theo từng nhu cầu cụ thể, triển khai đồng bộ và kiểm thử chặt chẽ trước khi chuyển giao.', image: '/image/solution/tele.jpg', imageAlt: 'Thiết kế và triển khai giải pháp', imagePosition: 'auto', imageStyle: 'cover' }, { title: 'Vận hành và đồng hành', description: 'Dịch vụ hỗ trợ, bảo trì và nâng cấp giúp hệ thống duy trì hiệu quả, ổn định và sẵn sàng phát triển lâu dài.', image: '/image/solution/security.jpg', imageAlt: 'Giám sát và vận hành hệ thống', imagePosition: 'auto', imageStyle: 'cover' }] },
    { type: 'projects', slug: 'he-thong-an-toan-thong-tin', eyebrow: 'Dự án tiêu biểu · EVNNPT', title: 'Hệ thống An toàn Thông tin', summary: 'Hạ tầng bảo mật tổng thể bảo vệ hệ thống công nghệ thông tin và hoạt động điều hành lưới điện quốc gia.', heroImage: '/image/solution/security.jpg', heroImageAlt: 'Hệ thống An toàn Thông tin', sections: [{ title: 'Khảo sát và phân tích', description: 'Đội ngũ chuyên gia đánh giá hiện trạng, yêu cầu nghiệp vụ và các tiêu chuẩn kỹ thuật trước khi xây dựng phương án.', image: '/image/solution/integration.jpg', imageAlt: 'Khảo sát và phân tích hệ thống', imagePosition: 'auto', imageStyle: 'cover' }, { title: 'Thiết kế và triển khai', description: 'Giải pháp được thiết kế theo từng nhu cầu cụ thể, triển khai đồng bộ và kiểm thử chặt chẽ trước khi chuyển giao.', image: '/image/solution/tele.jpg', imageAlt: 'Thiết kế và triển khai giải pháp', imagePosition: 'auto', imageStyle: 'cover' }, { title: 'Vận hành và đồng hành', description: 'Dịch vụ hỗ trợ, bảo trì và nâng cấp giúp hệ thống duy trì hiệu quả, ổn định và sẵn sàng phát triển lâu dài.', image: '/image/solution/security.jpg', imageAlt: 'Giám sát và vận hành hệ thống', imagePosition: 'auto', imageStyle: 'cover' }] },
  ],
}

// ─── English defaults ─────────────────────────────────────────────────────────

const DEFAULT_EN: CMSContent = {
  hero: {
    heading: 'CONNECTING TECHNOLOGY TO BUILD THE FUTURE',
    description:
      'General Systems provides comprehensive technology solutions that help businesses optimise performance and efficiency in the digital era.',
    ctaLabel: 'Explore Solutions',
    ctaHref: '#solutions',
  },
  features: {
    heading: 'WHY CHOOSE GENERAL SYSTEMS?',
    items: [
      { id: '01', title: 'Comprehensive Solutions', description: 'Providing end-to-end solutions tailored to every business need.' },
      { id: '02', title: 'Advanced Technology', description: 'Applying the latest technology to optimise efficiency and competitive advantage.' },
      { id: '03', title: 'Expert Team', description: 'An experienced team committed to accompanying clients on every journey.' },
      { id: '04', title: 'Quality Commitment', description: 'Committed to quality, security and long-term support for every solution.' },
    ],
  },
  coreValues: {
    heading: 'CORE VALUES',
    items: [
      { id: '01', title: 'Value and Trust Above All', description: 'Providing end-to-end solutions tailored to every business need.' },
      { id: '02', title: 'Respect for Individual Worth', description: 'Applying the latest technology to optimise performance and competitiveness.' },
      { id: '03', title: 'Systems Thinking – Global Mindset', description: 'An experienced team committed to accompanying clients on every journey.' },
      { id: '04', title: 'Continuous Learning – Constant Innovation', description: 'Committed to quality, security and long-term support for every solution.' },
      { id: '05', title: 'One Company – One Family', description: 'Committed to quality, security and long-term support for every solution.' },
    ],
  },
  solutions: [
    { slug: 'giai-phap-tich-hop', title: 'Integration Solutions', src: '/image/solution/integration.jpg', alt: 'Integration Solutions', desc: 'GS GROUP delivers full-package Data Centre, video conferencing and professional broadcast equipment solutions.' },
    { slug: 'an-ninh-quoc-phong', title: 'Security & Defence', src: '/image/solution/military.jpg', alt: 'Security & Defence', desc: 'GS GROUP provides an External Threat Management platform and solutions tailored for critical infrastructure.' },
    { slug: 'bao-mat-attt', title: 'Cybersecurity – ISEC', src: '/image/solution/security.jpg', alt: 'Cybersecurity – ISEC', desc: 'GS GROUP provides an External Threat Management platform and solutions tailored for critical infrastructure.' },
    { slug: 'dien-luc-nang-luong', title: 'Power & Energy', src: '/image/solution/energy.jpg', alt: 'Power & Energy', desc: 'GS GROUP delivers equipment management, maintenance, technical data collection and remote monitoring solutions.' },
    { slug: 'vien-thong', title: 'Telecommunications', src: '/image/solution/tele.jpg', alt: 'Telecommunications', desc: 'GS GROUP provides next-generation advanced mobile communications solutions with comprehensive privacy control.' },
    { slug: 'hang-khong', title: 'Aviation', src: '/image/solution/air.jpg', alt: 'Aviation', desc: 'GS GROUP provides flight scheduling and operations management solutions supporting crew and cabin crew assignment.' },
  ],
  projects: [
    { id: '01', slug: 'phan-mem-phan-bay-aves', category: 'VIETNAM AIRLINES', title: 'Flight Scheduling Software (AVES)', img: '/image/project/aves.jpg', description: 'In 2018, we were selected by VNA to provide the AVES pilot and cabin crew scheduling software solution.' },
    { id: '02', slug: 'he-thong-gsm-co-dong', category: 'DEPT OF TECHNICAL CRIMES – MPS', title: 'Mobile GSM System', img: '/image/project/gms.jpg', description: 'In 2017, we were selected to deploy the Mobile GSM System and Radio Signal Analysis System for the Ministry of Public Security.' },
    { id: '03', slug: 'he-thong-an-toan-thong-tin', category: 'NATIONAL POWER TRANSMISSION CORP', title: 'Information Security System', img: '/image/project/sec.jpg', description: 'A project to equip the National Power Transmission Corporation with a comprehensive information security infrastructure.' },
  ],
  partners: [
    { src: '/image/partner-logo/petro.png', alt: 'PetroVietnam' },
    { src: '/image/partner-logo/evn.png', alt: 'EVN' },
    { src: '/image/partner-logo/image%2033.png', alt: 'General Systems Partner 1' },
    { src: '/image/partner-logo/image%2032.png', alt: 'General Systems Partner 2' },
    { src: '/image/partner-logo/image%2032-1.png', alt: 'General Systems Partner 3' },
    { src: '/image/partner-logo/image%2032-2.png', alt: 'General Systems Partner 4' },
    { src: '/image/partner-logo/image%2032-3.png', alt: 'General Systems Partner 5' },
    { src: '/image/partner-logo/image%2032-4.png', alt: 'General Systems Partner 6' },
  ],
  sectionLabels: {
    solutions: 'SOLUTIONS',
    projects: 'Featured Projects',
    viewMore: 'Read more',
    partners: 'OUR PARTNERS',
  },
  showcaseCorners: [
    { id: 'integration',  label: 'SOLUTIONS',       sublabel: 'INTEGRATION',  image: '/image/solution/integration.jpg' },
    { id: 'security',     label: 'CYBERSECURITY',   sublabel: 'ISEC',          image: '/image/solution/security.jpg'    },
    { id: 'digital',      label: 'TECHNOLOGY',      sublabel: 'DIGITAL',       image: '/image/solution/integration.jpg' },
    { id: 'network',      label: 'INFRASTRUCTURE',  sublabel: 'NETWORK',       image: '/image/solution/tele.jpg'        },
    { id: 'military',     label: 'SECURITY',         sublabel: 'DEFENCE',       image: '/image/solution/military.jpg'    },
    { id: 'telecom',      label: 'TELECOM',          sublabel: '',              image: '/image/solution/tele.jpg'        },
    { id: 'aviation',     label: 'AVIATION',         sublabel: '',              image: '/image/solution/air.jpg'         },
    { id: 'energy',       label: 'POWER',            sublabel: 'ENERGY',        image: '/image/solution/energy.jpg'      },
  ],
  detailPages: [],
}

const DEFAULTS: Record<SupportedLocale, CMSContent> = {
  vi: DEFAULT_VI,
  en: DEFAULT_EN,
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getContent(locale: SupportedLocale = 'vi'): CMSContent {
  const filePath = contentPath(locale)
  const defaults = DEFAULTS[locale]
  try {
    if (!existsSync(filePath)) return defaults
    const stored = JSON.parse(readFileSync(filePath, 'utf-8')) as Partial<CMSContent>
    // Merge top-level keys; showcaseCorners uses stored array if present
    return { ...defaults, ...stored }
  } catch {
    return defaults
  }
}

export function setContent(content: CMSContent, locale: SupportedLocale = 'vi'): void {
  const filePath = contentPath(locale)
  const dir = path.dirname(filePath)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf-8')
}
