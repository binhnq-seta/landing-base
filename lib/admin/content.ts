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
  stats?: { value: string; label: string }[]
}

export interface CMSCoreValue {
  id: string
  title: string
  description: string
  icon?: string
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

export type DetailImageStyle = 'cover' | 'contain' | 'portrait' | 'wide' | 'background'
export type DetailImagePosition = 'auto' | 'left' | 'right'
export type DetailPageLayout = 'headline' | 'magazine' | 'immersive' | 'editorial'
export type DetailSectionKind = 'content' | 'heading' | 'image-points' | 'casestudies'

export interface CMSDetailPoint {
  title: string
  description: string
  href?: string
}

export interface CMSDetailSection {
  kind?: DetailSectionKind
  title: string
  titleSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
  titleAlign?: 'left' | 'center' | 'right'
  titleColor?: string
  description: string
  image: string
  imageAlt: string
  imagePosition?: DetailImagePosition
  imageStyle?: DetailImageStyle
  backgroundOpacity?: number
  buttonHref?: string
  points?: CMSDetailPoint[]
}

export interface CMSDetailPage {
  type: 'solutions' | 'projects'
  slug: string
  eyebrow: string
  eyebrowColor?: string
  title: string
  titleColor?: string
  summary: string
  summaryColor?: string
  heroImage: string
  heroImageAlt: string
  layout?: DetailPageLayout
  headlineTextMarginTop?: number
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
  icon?: string
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
  partnerDescription?: string
  sectionLabels: CMSSectionLabels
  detailPages: CMSDetailPage[]
  /** Rubik cube showcase corners — display data editable per locale */
  showcaseCorners: CMSShowcaseCorner[]
}

// ─── Vietnamese defaults ──────────────────────────────────────────────────────

const DEFAULT_VI: CMSContent = {
  hero: {
    heading: 'KẾT NỐI CÔNG NGHỆ – KIẾN TẠO HẠ TẦNG TƯƠNG LAI',
    description:
      'GS-Group cung cấp các giải pháp tích hợp công nghệ tiên tiến cho các hệ thống trọng yếu, bảo đảm kết nối an toàn, tăng cường bảo mật và tối ưu vận hành.',
    ctaLabel: 'Khám phá ngay',
    ctaHref: '#solutions',
    stats: [
      { value: '200+', label: 'Khách hàng' },
      { value: '350+', label: 'Dự án thành công' },
      { value: '25+', label: 'Năm kinh nghiệm' },
    ],
  },
  features: {
    heading: 'VÌ SAO CHỌN GS-GROUP?',
    items: [
      { id: '01', title: 'Am hiểu hệ thống trọng yếu', description: 'Hiểu sâu đặc thù vận hành và yêu cầu kỹ thuật của các hệ thống đòi hỏi tiêu chuẩn cao về an toàn, bảo mật và độ tin cậy.' },
      { id: '02', title: 'Làm chủ công nghệ', description: 'Tiếp cận, đánh giá và triển khai các giải pháp công nghệ phù hợp với yêu cầu kỹ thuật và mục tiêu của từng dự án.' },
      { id: '03', title: 'Kinh nghiệm thực chiến', description: 'Được kiểm chứng qua nhiều dự án quy mô lớn cho các cơ quan, tổ chức và doanh nghiệp trong những lĩnh vực trọng yếu.' },
      { id: '04', title: 'Giải pháp phù hợp thực tiễn', description: 'Đề xuất và triển khai các giải pháp phù hợp với nhu cầu thực tế, bảo đảm hiệu quả đầu tư và khả năng phát triển lâu dài.' },
    ],
  },
  coreValues: {
    heading: 'GIÁ TRỊ CỐT LÕI',
    items: [
      { id: '01', title: 'Niềm tin tạo nên giá trị', description: 'Lấy uy tín, trách nhiệm và sự tin cậy làm nền tảng để xây dựng những mối quan hệ hợp tác bền vững.' },
      { id: '02', title: 'Con người tạo nên sức mạnh', description: 'Tôn trọng năng lực, sự khác biệt và giá trị của mỗi cá nhân, xây dựng môi trường làm việc chuyên nghiệp, gắn kết và cùng phát triển.' },
      { id: '03', title: 'Tư duy toàn diện', description: 'Tiếp cận mọi vấn đề bằng góc nhìn tổng thể, đồng bộ và chuẩn mực, bảo đảm giải pháp phù hợp với yêu cầu thực tiễn và xu hướng công nghệ.' },
      { id: '04', title: 'Đổi mới để dẫn đầu', description: 'Không ngừng cập nhật công nghệ, nâng cao năng lực và hoàn thiện phương thức triển khai để đáp ứng những yêu cầu ngày càng cao của thị trường.' },
      { id: '05', title: 'Đồng hành và phát triển bền vững', description: 'Xây dựng quan hệ hợp tác lâu dài trên nền tảng chia sẻ giá trị, cùng phát triển và cùng thành công.' },
    ],
  },
  solutions: [
    { slug: 'an-ninh-quoc-phong', title: 'An ninh - Quốc phòng', src: '/image/solution/military.jpg', alt: 'An ninh - Quốc phòng', desc: 'Tích hợp các giải pháp công nghệ đáp ứng yêu cầu cao về bảo mật, độ tin cậy và khả năng vận hành liên tục cho các hệ thống an ninh – quốc phòng.' },
    { slug: 'bao-mat-attt', title: 'Bảo mật - ATTT', src: '/image/solution/security.jpg', alt: 'Bảo mật - ATTT', desc: 'Tích hợp các giải pháp bảo mật giúp phát hiện sớm mối đe dọa, bảo vệ hạ tầng CNTT và tăng cường năng lực phòng vệ trước các nguy cơ an ninh mạng.' },
    { slug: 'dien-luc-nang-luong', title: 'Điện lực - Năng lượng', src: '/image/solution/energy.jpg', alt: 'Điện lực - Năng lượng', desc: 'Tích hợp các giải pháp phần mềm công nghiệp hỗ trợ quản lý dữ liệu, tài sản, bảo trì và vận hành, góp phần nâng cao hiệu quả khai thác, tối ưu nguồn lực và đảm bảo hệ thống điện, năng lượng vận hành an toàn, ổn định.' },
    { slug: 'vien-thong', title: 'Viễn thông', src: '/image/solution/tele.jpg', alt: 'Viễn thông', desc: 'Cung cấp các giải pháp viễn thông thế hệ mới, hỗ trợ phát triển hệ sinh thái dịch vụ số, tăng cường bảo mật và nâng cao giá trị cho thuê bao.' },
    { slug: 'hang-khong', title: 'Hàng không', src: '/image/solution/air.jpg', alt: 'Hàng không', desc: 'Cung cấp các giải pháp số hoá hoạt động khai thác sân bay, hỗ trợ quản lý dữ liệu, điều phối nguồn lực và nâng cao hiệu quả vận hành.' },
  ],
  projects: [
    { id: '01', slug: 'he-thong-gsm-co-dong', category: 'CỤC KTNV - BỘ CÔNG AN | 2017', title: 'Hệ thống GSM cơ động và Phân tích tín hiệu vô tuyến', img: '/image/project/gms.jpg', description: 'GS-Group được lựa chọn triển khai Hệ thống GSM cơ động và Hệ thống phân tích tín hiệu vô tuyến, đáp ứng các yêu cầu khắt khe về kỹ thuật, độ ổn định và bảo mật trong lĩnh vực an ninh. Dự án đánh dấu năng lực của GS-Group trong việc triển khai các hệ thống công nghệ cho các cơ quan trọng yếu.' },
    { id: '01b', slug: 'he-thong-gsm-co-dong', category: 'CỤC KTNV - BỘ CÔNG AN | 2017', title: 'Hệ thống GSM cơ động và Phân tích tín hiệu vô tuyến', img: '/image/project/gms.jpg', description: 'GS-Group được lựa chọn triển khai Hệ thống GSM cơ động và Hệ thống phân tích tín hiệu vô tuyến phục vụ nhiệm vụ chuyên môn của Cục Kỹ thuật Nghiệp vụ – Bộ Công an. Dự án đòi hỏi yêu cầu cao về kỹ thuật, tính bảo mật và độ tin cậy, góp phần khẳng định năng lực triển khai các hệ thống công nghệ phục vụ lĩnh vực an ninh.' },
    { id: '02', slug: 'phan-mem-phan-bay-aves', category: 'VIETNAM AIRLINES | 2018', title: 'Hệ thống lập kế hoạch phân bay phi công và tiếp viên (AVES)', img: '/image/project/aves.jpg', description: 'GS-Group triển khai giải pháp AVES hỗ trợ lập kế hoạch và điều phối lịch phân bay cho đội ngũ phi công và tiếp viên của Vietnam Airlines. Sau khi hệ thống đi vào vận hành, GS-Group tiếp tục đồng hành thông qua các dịch vụ bảo trì, nâng cấp và hỗ trợ kỹ thuật, đảm bảo hệ thống hoạt động ổn định và đáp ứng yêu cầu khai thác lâu dài.' },
    { id: '03', slug: 'he-thong-an-toan-thong-tin', category: 'TỔNG CÔNG TY TRUYỀN TẢI ĐIỆN QUỐC GIA', title: 'Hệ thống An toàn thông tin', img: '/image/project/sec.jpg', description: 'Triển khai hệ thống an toàn thông tin nhằm xây dựng hạ tầng bảo mật tổng thể cho Tổng công ty Truyền tải điện Quốc gia. Giải pháp góp phần bảo vệ hệ thống công nghệ thông tin, hỗ trợ vận hành lưới điện an toàn, liên tục và đáp ứng các yêu cầu về an toàn thông tin đối với hạ tầng năng lượng trọng yếu.' },
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
  partnerDescription: 'GS GROUP tự hào đồng hành cùng các đối tác, tổ chức và doanh nghiệp hàng đầu trong nhiều lĩnh vực trọng điểm.',
  sectionLabels: {
    solutions: 'LĨNH VỰC HOẠT ĐỘNG',
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
    {
      type: 'solutions', slug: 'dien-luc-nang-luong', layout: 'immersive',
      eyebrow: 'GIẢI PHÁP ĐIỆN LỰC & NĂNG LƯỢNG',
      title: 'Số hóa dữ liệu và vận hành cho hạ tầng năng lượng hiện đại',
      summary: 'Kết nối dữ liệu, quản lý, bảo trì thiết bị kỹ thuật, phân tích và chuẩn đoán tình trạng, hoạt động hiện trường trên một hệ sinh thái giải pháp được thiết kế cho ngành điện lực và năng lượng.',
      heroImage: '/image/solution/energy.jpg', heroImageAlt: 'Giải pháp điện lực và năng lượng',
      sections: [
        { kind: 'heading', title: 'CASE STUDIES', description: '', image: '', imageAlt: '' },
        { kind: 'casestudies', title: '', description: '', image: '/image/solution/energy.jpg', imageAlt: '', points: [
          { title: 'JSC "Inter RAO – Electric Power Generation"', description: 'Triển khai SIGMA.SSPTI và SIGMA.SUPA phục vụ thu thập dữ liệu công nghệ và quản lý tài sản.', href: '/solutions/case-inter-rao' },
          { title: 'LLC "Bashkir Generation Company"', description: 'Tối ưu hóa công tác bảo trì và vận hành hiện trường với SIGMA.SUPA và SIGMA.ALKOR.', href: '/solutions/case-bashkir' },
          { title: 'JSC "Territorial Generating Company No. 11"', description: 'Tích hợp hệ sinh thái SIGMA phục vụ quản lý toàn vòng đời tài sản và vận hành.', href: '/solutions/case-tgk11' },
          { title: 'JSC "Tomsk Generation"', description: 'Triển khai SIGMA.ALKOR và SIGMA.SUS nâng cao năng lực hiện trường và trực quan hóa lưới điện.', href: '/solutions/case-tomsk' },
        ]},
        { kind: 'image-points', title: 'NHỮNG THÁCH THỨC ĐANG TỒN TẠI', description: '', image: '/image/solution/energy.jpg', imageAlt: 'Thách thức vận hành hạ tầng năng lượng', imagePosition: 'right', points: [
          { title: 'Dữ liệu thiết bị phân mảnh', description: 'SCADA, PLC, DCS, cảm biến và các hệ thống nghiệp vụ đang tồn tại trong nhiều silo dữ liệu.' },
          { title: 'Bảo trì còn bị động', description: 'Khó xác định xu hướng suy giảm và cảnh báo nguy cơ hư hỏng trước khi sự cố xảy ra.' },
          { title: 'Công tác hiện trường thiếu đồng bộ', description: 'Thông tin kiểm tra, bảo trì và sửa chữa chưa được kết nối xuyên suốt với hệ thống quản lý.' },
          { title: 'Khó có góc nhìn toàn diện về tài sản', description: 'Dữ liệu kỹ thuật, bảo trì, vật tư và chi phí chưa được hợp nhất theo vòng đời tài sản.' },
        ]},
        { kind: 'image-points', title: 'Hệ sinh thái SIGMA kết nối toàn bộ chu trình này.', description: 'Những giá trị chúng tôi mang lại cho Khách hàng', image: '/image/solution/integration.jpg', imageAlt: 'Hệ sinh thái SIGMA', imagePosition: 'right', imageStyle: 'background', points: [
          { title: 'Quan sát toàn diện', description: 'Dữ liệu vận hành thống nhất.' },
          { title: 'Chủ động bảo trì', description: 'Phát hiện rủi ro sớm.' },
          { title: 'Chuẩn hóa vận hành', description: 'Kết nối văn phòng và hiện trường.' },
          { title: 'Ra quyết định bằng dữ liệu', description: 'Biến dữ liệu thiết bị thành thông tin hành động.' },
        ]},
        { kind: 'heading', title: 'Giới thiệu các giải pháp', description: 'Hệ sinh thái SIGMA được thiết kế chuyên biệt cho ngành điện lực và năng lượng', image: '', imageAlt: '' },
        { kind: 'content', title: 'SIGMA.SSPTI', description: 'Thu thập và chuẩn hóa dữ liệu từ DCS, SCADA, cảm biến và các hệ thống chuyên ngành, hình thành nguồn dữ liệu thống nhất. Kiểm tra và xử lý dữ liệu trước khi cung cấp cho các hệ thống phân tích, giám sát. Tạo nền tảng dữ liệu dùng chung, giúp mở rộng kết nối thuận lợi hơn.', image: '/image/solution/energy.jpg', imageAlt: 'SIGMA SSPTI', imagePosition: 'right', imageStyle: 'cover' },
        { kind: 'content', title: 'SIGMA.SUPA', description: 'Theo dõi tập trung hồ sơ, tình trạng kỹ thuật và lịch sử của từng thiết bị. Lập kế hoạch công việc, nhân lực, vật tư và ngân sách dựa trên nhu cầu thực tế. Hỗ trợ ưu tiên sửa chữa, thay thế và đầu tư theo mức độ quan trọng của tài sản.', image: '/image/solution/integration.jpg', imageAlt: 'SIGMA SUPA', imagePosition: 'left', imageStyle: 'cover' },
        { kind: 'content', title: 'SIGMA.ALKOR', description: 'Hỗ trợ nhân viên tiếp nhận nhiệm vụ, kiểm tra thiết bị và ghi nhận kết quả ngay tại hiện trường. Cập nhật nhanh khiếm khuyết, thông số và tiến độ để bộ phận quản lý kịp thời điều phối. Chuẩn hóa checklist, quy trình thao tác và yêu cầu an toàn cho từng công việc.', image: '/image/solution/security.jpg', imageAlt: 'SIGMA ALKOR', imagePosition: 'right', imageStyle: 'cover' },
        { kind: 'content', title: 'SIGMA.SUS', description: 'Hiển thị đường dây, trạm biến áp, thiết bị và khách hàng trên bản đồ GIS thống nhất. Giúp xác định vị trí sự cố, thiết bị liên quan và khu vực khách hàng bị ảnh hưởng. Cung cấp dữ liệu không gian và kỹ thuật phục vụ vận hành, bảo trì và đầu tư phát triển.', image: '/image/solution/tele.jpg', imageAlt: 'SIGMA SUS', imagePosition: 'left', imageStyle: 'cover' },
      ],
    },
    { type: 'solutions', slug: 'vien-thong', eyebrow: 'Giải pháp', title: 'Viễn thông', summary: 'Hạ tầng truyền thông thế hệ mới mang lại kết nối ổn định, bảo mật và khả năng kiểm soát toàn diện.', heroImage: '/image/solution/tele.jpg', heroImageAlt: 'Viễn thông', sections: [{ title: 'Khảo sát và phân tích', description: 'Đội ngũ chuyên gia đánh giá hiện trạng, yêu cầu nghiệp vụ và các tiêu chuẩn kỹ thuật trước khi xây dựng phương án.', image: '/image/solution/integration.jpg', imageAlt: 'Khảo sát và phân tích hệ thống', imagePosition: 'auto', imageStyle: 'cover' }, { title: 'Thiết kế và triển khai', description: 'Giải pháp được thiết kế theo từng nhu cầu cụ thể, triển khai đồng bộ và kiểm thử chặt chẽ trước khi chuyển giao.', image: '/image/solution/tele.jpg', imageAlt: 'Thiết kế và triển khai giải pháp', imagePosition: 'auto', imageStyle: 'cover' }, { title: 'Vận hành và đồng hành', description: 'Dịch vụ hỗ trợ, bảo trì và nâng cấp giúp hệ thống duy trì hiệu quả, ổn định và sẵn sàng phát triển lâu dài.', image: '/image/solution/security.jpg', imageAlt: 'Giám sát và vận hành hệ thống', imagePosition: 'auto', imageStyle: 'cover' }] },
    { type: 'solutions', slug: 'hang-khong', eyebrow: 'Giải pháp', title: 'Hàng không', summary: 'Các nền tảng quản lý khai thác bay hỗ trợ lập lịch, điều phối nguồn lực và tuân thủ yêu cầu an toàn hàng không.', heroImage: '/image/solution/air.jpg', heroImageAlt: 'Hàng không', sections: [{ title: 'Khảo sát và phân tích', description: 'Đội ngũ chuyên gia đánh giá hiện trạng, yêu cầu nghiệp vụ và các tiêu chuẩn kỹ thuật trước khi xây dựng phương án.', image: '/image/solution/integration.jpg', imageAlt: 'Khảo sát và phân tích hệ thống', imagePosition: 'auto', imageStyle: 'cover' }, { title: 'Thiết kế và triển khai', description: 'Giải pháp được thiết kế theo từng nhu cầu cụ thể, triển khai đồng bộ và kiểm thử chặt chẽ trước khi chuyển giao.', image: '/image/solution/tele.jpg', imageAlt: 'Thiết kế và triển khai giải pháp', imagePosition: 'auto', imageStyle: 'cover' }, { title: 'Vận hành và đồng hành', description: 'Dịch vụ hỗ trợ, bảo trì và nâng cấp giúp hệ thống duy trì hiệu quả, ổn định và sẵn sàng phát triển lâu dài.', image: '/image/solution/security.jpg', imageAlt: 'Giám sát và vận hành hệ thống', imagePosition: 'auto', imageStyle: 'cover' }] },
    { type: 'projects', slug: 'he-thong-gsm-co-dong', eyebrow: 'Dự án tiêu biểu · Cục KTNV - Bộ Công an', title: 'Hệ thống GSM cơ động', summary: 'Hệ thống GSM cơ động và phân tích tín hiệu vô tuyến được triển khai nhằm đáp ứng yêu cầu nghiệp vụ chuyên biệt.', heroImage: '/image/solution/tele.jpg', heroImageAlt: 'Hệ thống GSM cơ động', sections: [{ title: 'Khảo sát và phân tích', description: 'Đội ngũ chuyên gia đánh giá hiện trạng, yêu cầu nghiệp vụ và các tiêu chuẩn kỹ thuật trước khi xây dựng phương án.', image: '/image/solution/integration.jpg', imageAlt: 'Khảo sát và phân tích hệ thống', imagePosition: 'auto', imageStyle: 'cover' }, { title: 'Thiết kế và triển khai', description: 'Giải pháp được thiết kế theo từng nhu cầu cụ thể, triển khai đồng bộ và kiểm thử chặt chẽ trước khi chuyển giao.', image: '/image/solution/tele.jpg', imageAlt: 'Thiết kế và triển khai giải pháp', imagePosition: 'auto', imageStyle: 'cover' }, { title: 'Vận hành và đồng hành', description: 'Dịch vụ hỗ trợ, bảo trì và nâng cấp giúp hệ thống duy trì hiệu quả, ổn định và sẵn sàng phát triển lâu dài.', image: '/image/solution/security.jpg', imageAlt: 'Giám sát và vận hành hệ thống', imagePosition: 'auto', imageStyle: 'cover' }] },
    { type: 'projects', slug: 'he-thong-an-toan-thong-tin', eyebrow: 'Dự án tiêu biểu · EVNNPT', title: 'Hệ thống An toàn Thông tin', summary: 'Hạ tầng bảo mật tổng thể bảo vệ hệ thống công nghệ thông tin và hoạt động điều hành lưới điện quốc gia.', heroImage: '/image/solution/security.jpg', heroImageAlt: 'Hệ thống An toàn Thông tin', sections: [{ title: 'Khảo sát và phân tích', description: 'Đội ngũ chuyên gia đánh giá hiện trạng, yêu cầu nghiệp vụ và các tiêu chuẩn kỹ thuật trước khi xây dựng phương án.', image: '/image/solution/integration.jpg', imageAlt: 'Khảo sát và phân tích hệ thống', imagePosition: 'auto', imageStyle: 'cover' }, { title: 'Thiết kế và triển khai', description: 'Giải pháp được thiết kế theo từng nhu cầu cụ thể, triển khai đồng bộ và kiểm thử chặt chẽ trước khi chuyển giao.', image: '/image/solution/tele.jpg', imageAlt: 'Thiết kế và triển khai giải pháp', imagePosition: 'auto', imageStyle: 'cover' }, { title: 'Vận hành và đồng hành', description: 'Dịch vụ hỗ trợ, bảo trì và nâng cấp giúp hệ thống duy trì hiệu quả, ổn định và sẵn sàng phát triển lâu dài.', image: '/image/solution/security.jpg', imageAlt: 'Giám sát và vận hành hệ thống', imagePosition: 'auto', imageStyle: 'cover' }] },
    {
      type: 'solutions', slug: 'case-inter-rao', layout: 'editorial',
      eyebrow: 'CASE STUDY | ĐIỆN LỰC & NĂNG LƯỢNG',
      title: 'JSC Inter RAO – Electric Power Generation',
      summary: 'Triển khai hệ sinh thái SIGMA phục vụ thu thập dữ liệu công nghệ và quản lý tài sản cho tập đoàn điện lực Inter RAO.',
      heroImage: '/image/solution/energy.jpg', heroImageAlt: 'Inter RAO Electric Power Generation',
      sections: [
        { title: 'Bối cảnh', description: 'JSC Inter RAO – Electric Power Generation vận hành nhiều nhà máy điện với hàng nghìn thiết bị công nghiệp. Dữ liệu từ SCADA, DCS và cảm biến tồn tại rời rạc, thiếu nền tảng thống nhất để phân tích và ra quyết định vận hành.', image: '/image/solution/energy.jpg', imageAlt: 'Nhà máy điện Inter RAO', imagePosition: 'right', imageStyle: 'cover' },
        { title: 'Giải pháp triển khai', description: 'Triển khai SIGMA.SSPTI để thu thập và chuẩn hóa luồng dữ liệu công nghệ từ toàn bộ các hệ thống hiện hữu, kết hợp SIGMA.SUPA để xây dựng hệ thống quản lý tài sản tập trung, theo dõi tình trạng kỹ thuật, lịch sử bảo trì và vòng đời thiết bị.', image: '/image/solution/integration.jpg', imageAlt: 'Hệ thống SIGMA tại Inter RAO', imagePosition: 'left', imageStyle: 'cover' },
        { title: 'Kết quả', description: 'Nguồn dữ liệu vận hành thống nhất từ DCS, SCADA và cảm biến. Công tác bảo trì chuyển từ bị động sang chủ động, giảm thiểu sự cố ngoài kế hoạch. Đội ngũ quản lý ra quyết định dựa trên dữ liệu chính xác, cập nhật liên tục.', image: '/image/solution/security.jpg', imageAlt: 'Kết quả vận hành', imagePosition: 'right', imageStyle: 'cover' },
      ],
    },
    {
      type: 'solutions', slug: 'case-bashkir', layout: 'editorial',
      eyebrow: 'CASE STUDY | ĐIỆN LỰC & NĂNG LƯỢNG',
      title: 'LLC Bashkir Generation Company',
      summary: 'Ứng dụng SIGMA.SUPA và SIGMA.ALKOR tối ưu hóa công tác bảo trì và vận hành hiện trường tại Bashkir Generation Company.',
      heroImage: '/image/solution/energy.jpg', heroImageAlt: 'Bashkir Generation Company',
      sections: [
        { title: 'Bối cảnh', description: 'LLC Bashkir Generation Company là doanh nghiệp sản xuất điện và nhiệt lớn, vận hành nhiều tổ máy và thiết bị phân bổ trên địa bàn rộng. Công tác bảo trì còn bị động, thiếu kết nối giữa đội ngũ hiện trường và bộ phận quản lý.', image: '/image/solution/energy.jpg', imageAlt: 'Nhà máy Bashkir', imagePosition: 'right', imageStyle: 'cover' },
        { title: 'Giải pháp triển khai', description: 'Triển khai SIGMA.SUPA để quản lý tập trung hồ sơ thiết bị, lên kế hoạch bảo trì theo nhu cầu thực tế. SIGMA.ALKOR hỗ trợ kỹ thuật viên hiện trường tiếp nhận lệnh công việc, kiểm tra và ghi nhận kết quả trực tiếp trên thiết bị di động.', image: '/image/solution/integration.jpg', imageAlt: 'Giải pháp SIGMA tại Bashkir', imagePosition: 'left', imageStyle: 'cover' },
        { title: 'Kết quả', description: 'Quy trình bảo trì được chuẩn hóa và chủ động hơn. Thông tin hiện trường được cập nhật tức thời vào hệ thống quản lý, rút ngắn thời gian xử lý sự cố và nâng cao an toàn vận hành.', image: '/image/solution/security.jpg', imageAlt: 'Kết quả vận hành Bashkir', imagePosition: 'right', imageStyle: 'cover' },
      ],
    },
    {
      type: 'solutions', slug: 'case-tgk11', layout: 'editorial',
      eyebrow: 'CASE STUDY | ĐIỆN LỰC & NĂNG LƯỢNG',
      title: 'JSC Territorial Generating Company No. 11',
      summary: 'Tích hợp hệ sinh thái SIGMA hỗ trợ quản lý toàn vòng đời tài sản và nâng cao hiệu quả vận hành cho TGK-11.',
      heroImage: '/image/solution/energy.jpg', heroImageAlt: 'Territorial Generating Company No. 11',
      sections: [
        { title: 'Bối cảnh', description: 'JSC Territorial Generating Company No. 11 (TGK-11) vận hành các nhà máy nhiệt điện tại Tây Siberia. Tài sản thiết bị đa dạng với dữ liệu kỹ thuật, bảo trì và vật tư chưa được quản lý thống nhất trên một nền tảng.', image: '/image/solution/energy.jpg', imageAlt: 'Nhà máy TGK-11', imagePosition: 'right', imageStyle: 'cover' },
        { title: 'Giải pháp triển khai', description: 'Tích hợp toàn diện hệ sinh thái SIGMA bao gồm SIGMA.SSPTI thu thập dữ liệu, SIGMA.SUPA quản lý tài sản và SIGMA.ALKOR hỗ trợ vận hành hiện trường. Hệ thống kết nối dữ liệu kỹ thuật, bảo trì, vật tư và chi phí vận hành theo vòng đời tài sản.', image: '/image/solution/integration.jpg', imageAlt: 'Hệ sinh thái SIGMA tại TGK-11', imagePosition: 'left', imageStyle: 'cover' },
        { title: 'Kết quả', description: 'TGK-11 có góc nhìn toàn diện về tài sản trên một nền tảng duy nhất. Hiệu quả khai thác được tối ưu, chi phí bảo trì giảm và độ tin cậy của thiết bị được nâng cao đáng kể.', image: '/image/solution/security.jpg', imageAlt: 'Kết quả vận hành TGK-11', imagePosition: 'right', imageStyle: 'cover' },
      ],
    },
    {
      type: 'solutions', slug: 'case-tomsk', layout: 'editorial',
      eyebrow: 'CASE STUDY | ĐIỆN LỰC & NĂNG LƯỢNG',
      title: 'JSC Tomsk Generation',
      summary: 'Triển khai SIGMA.ALKOR và SIGMA.SUS nâng cao năng lực hiện trường và trực quan hóa lưới điện tại Tomsk Generation.',
      heroImage: '/image/solution/energy.jpg', heroImageAlt: 'Tomsk Generation',
      sections: [
        { title: 'Bối cảnh', description: 'JSC Tomsk Generation là doanh nghiệp sản xuất và cung cấp điện, nhiệt tại khu vực Tomsk và vùng lân cận. Lưới điện phân tán, thông tin kiểm tra và sửa chữa thiếu đồng bộ giữa hiện trường và trung tâm điều hành.', image: '/image/solution/energy.jpg', imageAlt: 'Nhà máy Tomsk', imagePosition: 'right', imageStyle: 'cover' },
        { title: 'Giải pháp triển khai', description: 'SIGMA.ALKOR được triển khai để số hóa công tác hiện trường, hỗ trợ kỹ thuật viên tiếp nhận nhiệm vụ, kiểm tra thiết bị và báo cáo kết quả tức thời. SIGMA.SUS cung cấp nền tảng GIS trực quan hóa toàn bộ lưới điện, hỗ trợ xử lý sự cố và quy hoạch phát triển.', image: '/image/solution/tele.jpg', imageAlt: 'Giải pháp SIGMA tại Tomsk', imagePosition: 'left', imageStyle: 'cover' },
        { title: 'Kết quả', description: 'Công tác hiện trường được chuẩn hóa, thời gian xử lý sự cố rút ngắn đáng kể. Đội ngũ điều hành có bức tranh toàn diện về lưới điện theo thời gian thực, nâng cao chất lượng quy hoạch và vận hành.', image: '/image/solution/security.jpg', imageAlt: 'Kết quả vận hành Tomsk', imagePosition: 'right', imageStyle: 'cover' },
      ],
    },
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
    stats: [
      { value: '200+', label: 'Clients' },
      { value: '350+', label: 'Successful Projects' },
      { value: '25+', label: 'Years of Experience' },
    ],
  },
  features: {
    heading: 'WHY CHOOSE GENERAL SYSTEMS?',
    items: [
      { id: '01', title: 'Understanding Critical Systems', description: 'A deep understanding of the operational characteristics and technical requirements of systems where safety, security and reliability standards are paramount.' },
      { id: '02', title: 'Technology Mastery', description: 'Evaluating and deploying technology solutions that match the technical requirements and objectives of each individual project.' },
      { id: '03', title: 'Proven Expertise', description: 'Validated through large-scale projects for government agencies, organisations and enterprises in critical sectors.' },
      { id: '04', title: 'Practical Solutions', description: 'Proposing and implementing solutions tailored to real-world needs, ensuring return on investment and long-term scalability.' },
    ],
  },
  coreValues: {
    heading: 'CORE VALUES',
    items: [
      { id: '01', title: 'Value and Trust Above All', description: 'Building long-term partnerships on a foundation of credibility, accountability and mutual trust.' },
      { id: '02', title: 'People Create Strength', description: 'Respecting the capabilities, individuality and value of each person — fostering a professional, connected and mutually developing workplace.' },
      { id: '03', title: 'Holistic Thinking', description: 'Approaching every challenge with a comprehensive, synchronised and standards-driven perspective, ensuring solutions align with real-world requirements and technology trends.' },
      { id: '04', title: 'Innovate to Lead', description: 'Continuously updating technology, improving capabilities and refining deployment methods to meet ever-higher market demands.' },
      { id: '05', title: 'Grow Together', description: 'Building long-term partnerships on a foundation of shared values — growing and succeeding together.' },
    ],
  },
  solutions: [
    { slug: 'an-ninh-quoc-phong', title: 'Defense & Security', src: '/image/solution/military.jpg', alt: 'Defense & Security', desc: 'GS GROUP provides an External Threat Management platform and solutions tailored for critical infrastructure.' },
    { slug: 'bao-mat-attt', title: 'Cybersecurity – ISEC', src: '/image/solution/security.jpg', alt: 'Cybersecurity – ISEC', desc: 'GS GROUP provides an External Threat Management platform and solutions tailored for critical infrastructure.' },
    { slug: 'dien-luc-nang-luong', title: 'Power & Energy', src: '/image/solution/energy.jpg', alt: 'Power & Energy', desc: 'GS GROUP delivers equipment management, maintenance, technical data collection and remote monitoring solutions.' },
    { slug: 'vien-thong', title: 'Telecommunications', src: '/image/solution/tele.jpg', alt: 'Telecommunications', desc: 'GS GROUP provides next-generation advanced mobile communications solutions with comprehensive privacy control.' },
    { slug: 'hang-khong', title: 'Aviation', src: '/image/solution/air.jpg', alt: 'Aviation', desc: 'GS GROUP provides flight scheduling and operations management solutions supporting crew and cabin crew assignment.' },
  ],
  projects: [
    { id: '01', slug: 'he-thong-gsm-co-dong', category: 'DEPT OF TECHNICAL CRIMES – MPS | 2017', title: 'Mobile GSM System and Radio Signal Analysis System', img: '/image/project/gms.jpg', description: 'GS Group was selected to deploy the Mobile GSM System and Radio Signal Analysis System, meeting stringent technical, stability and security requirements in the defence sector. The project marks GS Group\'s capability in deploying technology systems for critical agencies.' },
    { id: '01b', slug: 'he-thong-gsm-co-dong', category: 'DEPT OF TECHNICAL CRIMES – MPS | 2017', title: 'Mobile GSM System and Radio Signal Analysis System', img: '/image/project/gms.jpg', description: 'GS Group was selected to deploy the Mobile GSM System and Radio Signal Analysis System in service of the specialised operations of the Department of Technical Crimes – Ministry of Public Security. The project demanded high technical standards, security and reliability, reinforcing GS Group\'s capability in deploying technology systems for the security sector.' },
    { id: '02', slug: 'phan-mem-phan-bay-aves', category: 'VIETNAM AIRLINES | 2018', title: 'AVES Pilot and Cabin Crew Scheduling System', img: '/image/project/aves.jpg', description: 'GS Group deployed the AVES solution to support flight scheduling and crew assignment for Vietnam Airlines\' pilots and cabin crew. Following go-live, GS Group continued providing maintenance, upgrade and technical support services to keep the system stable and aligned with long-term operational demands.' },
    { id: '03', slug: 'he-thong-an-toan-thong-tin', category: 'NATIONAL POWER TRANSMISSION CORPORATION', title: 'Information Security System', img: '/image/project/sec.jpg', description: 'Deployment of an information security system to build a comprehensive security infrastructure for the National Power Transmission Corporation. The solution helps protect IT systems, supports safe and continuous power grid operations, and meets information security requirements for critical energy infrastructure.' },
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
  partnerDescription: 'GS GROUP is proud to partner with leading organisations and enterprises across multiple critical sectors.',
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
  detailPages: [
    { type: 'solutions', slug: 'case-inter-rao', layout: 'editorial', eyebrow: 'CASE STUDY | POWER & ENERGY', title: 'JSC Inter RAO – Electric Power Generation', summary: 'Deploying the SIGMA ecosystem to support industrial data collection and asset management for the Inter RAO power group.', heroImage: '/image/solution/energy.jpg', heroImageAlt: 'Inter RAO Electric Power Generation', sections: [
      { title: 'Background', description: 'JSC Inter RAO – Electric Power Generation operates multiple power plants with thousands of industrial assets. Data from SCADA, DCS and sensors existed in silos, with no unified platform for analysis and operational decision-making.', image: '/image/solution/energy.jpg', imageAlt: 'Inter RAO power plant', imagePosition: 'right', imageStyle: 'cover' },
      { title: 'Solution deployed', description: 'SIGMA.SSPTI was deployed to collect and normalise technology data flows from all existing systems, combined with SIGMA.SUPA to build a centralised asset management system — tracking technical condition, maintenance history and equipment lifecycle in real time.', image: '/image/solution/integration.jpg', imageAlt: 'SIGMA.SUPA system', imagePosition: 'left', imageStyle: 'cover' },
      { title: 'Results', description: 'A unified operational data source from DCS, SCADA and sensors. Maintenance shifted from reactive to proactive, minimising unplanned incidents. Management teams make decisions based on accurate, continuously updated data.', image: '/image/solution/security.jpg', imageAlt: 'Operational results', imagePosition: 'right', imageStyle: 'cover' },
    ]},
    { type: 'solutions', slug: 'case-bashkir', layout: 'editorial', eyebrow: 'CASE STUDY | POWER & ENERGY', title: 'LLC Bashkir Generation Company', summary: 'Applying SIGMA.SUPA and SIGMA.ALKOR to optimise maintenance planning and field operations at Bashkir Generation Company.', heroImage: '/image/solution/energy.jpg', heroImageAlt: 'Bashkir Generation Company', sections: [
      { title: 'Background', description: 'LLC Bashkir Generation Company is a major electricity and heat producer operating numerous generating units across a wide area. Maintenance was largely reactive, with poor connectivity between field teams and management.', image: '/image/solution/energy.jpg', imageAlt: 'Bashkir plant', imagePosition: 'right', imageStyle: 'cover' },
      { title: 'Solution deployed', description: 'SIGMA.SUPA was deployed for centralised equipment record management and needs-based maintenance planning. SIGMA.ALKOR enabled field technicians to receive work orders, inspect equipment and record results directly on mobile devices.', image: '/image/solution/integration.jpg', imageAlt: 'SIGMA.ALKOR field operations', imagePosition: 'left', imageStyle: 'cover' },
      { title: 'Results', description: 'Maintenance processes became standardised and proactive. Field information is updated instantly into the management system, reducing incident response time and improving operational safety.', image: '/image/solution/security.jpg', imageAlt: 'Operational results', imagePosition: 'right', imageStyle: 'cover' },
    ]},
    { type: 'solutions', slug: 'case-tgk11', layout: 'editorial', eyebrow: 'CASE STUDY | POWER & ENERGY', title: 'JSC Territorial Generating Company No. 11', summary: 'Integrating the SIGMA ecosystem to support full asset lifecycle management and improve operational efficiency for TGK-11.', heroImage: '/image/solution/energy.jpg', heroImageAlt: 'Territorial Generating Company No. 11', sections: [
      { title: 'Background', description: 'JSC Territorial Generating Company No. 11 (TGK-11) operates thermal power plants in Western Siberia. Its diverse asset base lacked a unified platform for managing technical data, maintenance records and materials.', image: '/image/solution/energy.jpg', imageAlt: 'TGK-11 plant', imagePosition: 'right', imageStyle: 'cover' },
      { title: 'Solution deployed', description: 'A comprehensive SIGMA ecosystem integration — SIGMA.SSPTI for data collection, SIGMA.SUPA for asset management and SIGMA.ALKOR for field operations support — connecting technical data, maintenance, materials and costs across the full asset lifecycle.', image: '/image/solution/integration.jpg', imageAlt: 'SIGMA ecosystem at TGK-11', imagePosition: 'left', imageStyle: 'cover' },
      { title: 'Results', description: 'TGK-11 gained a comprehensive view of all assets on a single platform. Operational efficiency improved, maintenance costs decreased and equipment reliability increased significantly.', image: '/image/solution/security.jpg', imageAlt: 'Operational results', imagePosition: 'right', imageStyle: 'cover' },
    ]},
    { type: 'solutions', slug: 'case-tomsk', layout: 'editorial', eyebrow: 'CASE STUDY | POWER & ENERGY', title: 'JSC Tomsk Generation', summary: 'Deploying SIGMA.ALKOR and SIGMA.SUS to enhance field operations capability and power grid visualisation at Tomsk Generation.', heroImage: '/image/solution/energy.jpg', heroImageAlt: 'Tomsk Generation', sections: [
      { title: 'Background', description: 'JSC Tomsk Generation produces and supplies electricity and heat to the Tomsk region. A distributed grid and disconnected inspection data between field teams and the control centre created operational challenges.', image: '/image/solution/energy.jpg', imageAlt: 'Tomsk plant', imagePosition: 'right', imageStyle: 'cover' },
      { title: 'Solution deployed', description: 'SIGMA.ALKOR was deployed to digitalise field operations — enabling technicians to receive tasks, inspect equipment and report results instantly. SIGMA.SUS provided a GIS platform visualising the entire grid, supporting incident response and development planning.', image: '/image/solution/tele.jpg', imageAlt: 'SIGMA.SUS grid management', imagePosition: 'left', imageStyle: 'cover' },
      { title: 'Results', description: 'Field operations were standardised and incident response times reduced significantly. Operations teams gained a real-time, comprehensive view of the grid — improving planning quality and operational performance.', image: '/image/solution/security.jpg', imageAlt: 'Operational results', imagePosition: 'right', imageStyle: 'cover' },
    ]},
  ],
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
    const merged: CMSContent = { ...defaults, ...stored }
    // Deep-merge nested objects so new fields added to the type still get their
    // default values when an older stored file predates them.
    if (stored.hero) merged.hero = { ...defaults.hero, ...stored.hero }
    return merged
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
