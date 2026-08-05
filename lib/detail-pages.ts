export type DetailSection = {
  title: string
  description: string
  image: string
  imageAlt: string
}

export type DetailPage = {
  type: 'solutions' | 'projects'
  slug: string
  eyebrow: string
  title: string
  summary: string
  heroImage: string
  heroImageAlt: string
  sections: [DetailSection, DetailSection, DetailSection]
}

const featuredDetailPages: DetailPage[] = [
  {
    type: 'solutions',
    slug: 'giai-phap-tich-hop',
    eyebrow: 'Giải pháp',
    title: 'Giải pháp tích hợp toàn diện cho hạ tầng số',
    summary:
      'GS Group kết nối công nghệ, con người và quy trình để kiến tạo những hệ thống đồng bộ, an toàn và sẵn sàng mở rộng theo nhu cầu thực tế của doanh nghiệp.',
    heroImage: '/image/solution/integration.jpg',
    heroImageAlt: 'Hạ tầng công nghệ tích hợp hiện đại',
    sections: [
      {
        title: 'Thiết kế từ nhu cầu thực tế',
        description:
          'Mỗi giải pháp bắt đầu bằng việc khảo sát hiện trạng, xác định mục tiêu vận hành và xây dựng kiến trúc phù hợp với nguồn lực của khách hàng.',
        image: '/image/solution/security.jpg',
        imageAlt: 'Chuyên gia phân tích hệ thống bảo mật',
      },
      {
        title: 'Triển khai đồng bộ, kiểm soát chặt chẽ',
        description:
          'Quy trình triển khai được chuẩn hóa từ tích hợp thiết bị, phần mềm đến kiểm thử, chuyển giao và đào tạo đội ngũ vận hành.',
        image: '/image/solution/tele.jpg',
        imageAlt: 'Hệ thống viễn thông được tích hợp đồng bộ',
      },
      {
        title: 'Đồng hành trong suốt vòng đời hệ thống',
        description:
          'Dịch vụ giám sát, bảo trì và nâng cấp giúp hệ thống luôn ổn định, bảo mật và thích ứng với những yêu cầu mới.',
        image: '/image/solution/energy.jpg',
        imageAlt: 'Hệ thống năng lượng và trung tâm vận hành',
      },
    ],
  },
  {
    type: 'projects',
    slug: 'phan-mem-phan-bay-aves',
    eyebrow: 'Dự án tiêu biểu · Vietnam Airlines',
    title: 'Phần mềm phân bay AVES',
    summary:
      'Nền tảng hỗ trợ lập lịch, phân công phi công và tiếp viên, góp phần tối ưu nguồn lực khai thác bay và bảo đảm các yêu cầu an toàn vận hành.',
    heroImage: '/image/slide-bg.jpg',
    heroImageAlt: 'Dự án phần mềm phân bay AVES',
    sections: [
      {
        title: 'Bài toán vận hành quy mô lớn',
        description:
          'Hệ thống cần xử lý khối lượng lịch bay phức tạp, nhiều ràng buộc nghiệp vụ và thay đổi liên tục trong quá trình khai thác.',
        image: '/image/solution/air.jpg',
        imageAlt: 'Hoạt động khai thác hàng không',
      },
      {
        title: 'Tự động hóa công tác phân bay',
        description:
          'AVES hỗ trợ lập kế hoạch và phân bổ tổ bay dựa trên năng lực, lịch làm việc và những quy định về giờ bay, giờ nghỉ.',
        image: '/image/solution/integration.jpg',
        imageAlt: 'Nền tảng phần mềm quản lý tập trung',
      },
      {
        title: 'Bảo trì và phát triển dài hạn',
        description:
          'Từ năm 2018, GS Group tiếp tục cung cấp dịch vụ bảo trì, nâng cấp và hỗ trợ kỹ thuật để hệ thống đáp ứng hoạt động thực tế.',
        image: '/image/solution/security.jpg',
        imageAlt: 'Đội ngũ theo dõi và hỗ trợ hệ thống',
      },
    ],
  },
]

const additionalPages = [
  {
    type: 'solutions' as const,
    slug: 'an-ninh-quoc-phong',
    eyebrow: 'Giải pháp',
    title: 'An ninh - Quốc phòng',
    summary: 'Giải pháp công nghệ chuyên dụng, bảo đảm khả năng chỉ huy, kết nối và vận hành an toàn cho các hệ thống trọng yếu.',
    heroImage: '/image/solution/military.jpg',
  },
  {
    type: 'solutions' as const,
    slug: 'bao-mat-attt',
    eyebrow: 'Giải pháp',
    title: 'Bảo mật - An toàn thông tin',
    summary: 'Nền tảng bảo vệ nhiều lớp giúp nhận diện sớm nguy cơ, giám sát liên tục và chủ động ứng phó với các mối đe dọa số.',
    heroImage: '/image/solution/security.jpg',
  },
  {
    type: 'solutions' as const,
    slug: 'dien-luc-nang-luong',
    eyebrow: 'Giải pháp',
    title: 'Điện lực - Năng lượng',
    summary: 'Số hóa công tác quản lý thiết bị, giám sát từ xa và bảo trì nhằm nâng cao độ tin cậy của hạ tầng năng lượng.',
    heroImage: '/image/solution/energy.jpg',
  },
  {
    type: 'solutions' as const,
    slug: 'vien-thong',
    eyebrow: 'Giải pháp',
    title: 'Viễn thông',
    summary: 'Hạ tầng truyền thông thế hệ mới mang lại kết nối ổn định, bảo mật và khả năng kiểm soát toàn diện.',
    heroImage: '/image/solution/tele.jpg',
  },
  {
    type: 'solutions' as const,
    slug: 'hang-khong',
    eyebrow: 'Giải pháp',
    title: 'Hàng không',
    summary: 'Các nền tảng quản lý khai thác bay hỗ trợ lập lịch, điều phối nguồn lực và tuân thủ yêu cầu an toàn hàng không.',
    heroImage: '/image/solution/air.jpg',
  },
  {
    type: 'projects' as const,
    slug: 'he-thong-gsm-co-dong',
    eyebrow: 'Dự án tiêu biểu · Cục KTNV - Bộ Công an',
    title: 'Hệ thống GSM cơ động',
    summary: 'Hệ thống GSM cơ động và phân tích tín hiệu vô tuyến được triển khai nhằm đáp ứng yêu cầu nghiệp vụ chuyên biệt.',
    heroImage: '/image/solution/tele.jpg',
  },
  {
    type: 'projects' as const,
    slug: 'he-thong-an-toan-thong-tin',
    eyebrow: 'Dự án tiêu biểu · EVNNPT',
    title: 'Hệ thống An toàn Thông tin',
    summary: 'Hạ tầng bảo mật tổng thể bảo vệ hệ thống công nghệ thông tin và hoạt động điều hành lưới điện quốc gia.',
    heroImage: '/image/solution/security.jpg',
  },
  {
    type: 'solutions' as const,
    slug: 'case-inter-rao',
    eyebrow: 'Case Study | Điện lực & Năng lượng',
    title: 'JSC Inter RAO – Electric Power Generation',
    summary: 'Triển khai hệ sinh thái SIGMA phục vụ thu thập dữ liệu công nghệ và quản lý tài sản cho Inter RAO.',
    heroImage: '/image/solution/energy.jpg',
  },
  {
    type: 'solutions' as const,
    slug: 'case-bashkir',
    eyebrow: 'Case Study | Điện lực & Năng lượng',
    title: 'LLC Bashkir Generation Company',
    summary: 'Ứng dụng SIGMA.SUPA và SIGMA.ALKOR tối ưu hóa công tác bảo trì và vận hành hiện trường.',
    heroImage: '/image/solution/energy.jpg',
  },
  {
    type: 'solutions' as const,
    slug: 'case-tgk11',
    eyebrow: 'Case Study | Điện lực & Năng lượng',
    title: 'JSC Territorial Generating Company No. 11',
    summary: 'Tích hợp hệ sinh thái SIGMA hỗ trợ quản lý toàn vòng đời tài sản và nâng cao hiệu quả vận hành.',
    heroImage: '/image/solution/energy.jpg',
  },
  {
    type: 'solutions' as const,
    slug: 'case-tomsk',
    eyebrow: 'Case Study | Điện lực & Năng lượng',
    title: 'JSC Tomsk Generation',
    summary: 'Triển khai SIGMA.ALKOR và SIGMA.SUS nâng cao năng lực hiện trường và trực quan hóa lưới điện.',
    heroImage: '/image/solution/energy.jpg',
  },
]

const sharedSections: [DetailSection, DetailSection, DetailSection] = [
  {
    title: 'Khảo sát và phân tích',
    description: 'Đội ngũ chuyên gia đánh giá hiện trạng, yêu cầu nghiệp vụ và các tiêu chuẩn kỹ thuật trước khi xây dựng phương án.',
    image: '/image/solution/integration.jpg',
    imageAlt: 'Khảo sát và phân tích hệ thống',
  },
  {
    title: 'Thiết kế và triển khai',
    description: 'Giải pháp được thiết kế theo từng nhu cầu cụ thể, triển khai đồng bộ và kiểm thử chặt chẽ trước khi chuyển giao.',
    image: '/image/solution/tele.jpg',
    imageAlt: 'Thiết kế và triển khai giải pháp',
  },
  {
    title: 'Vận hành và đồng hành',
    description: 'Dịch vụ hỗ trợ, bảo trì và nâng cấp giúp hệ thống duy trì hiệu quả, ổn định và sẵn sàng phát triển lâu dài.',
    image: '/image/solution/security.jpg',
    imageAlt: 'Giám sát và vận hành hệ thống',
  },
]

export const detailPages: DetailPage[] = [
  ...featuredDetailPages,
  ...additionalPages.map((page) => ({
    ...page,
    heroImageAlt: page.title,
    sections: sharedSections,
  })),
]

export function getDetailPage(type: string, slug: string) {
  return detailPages.find((page) => page.type === type && page.slug === slug)
}
