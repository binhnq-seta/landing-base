export default function GuidePage() {
  return (
    <div className="mx-auto max-w-4xl p-8">
      {/* Header */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📖</span>
          <div>
            <h1 className="text-2xl font-bold">Hướng dẫn sử dụng CRM</h1>
            <p className="mt-1 text-amber-100 text-sm">Tài liệu hướng dẫn đầy đủ cho quản trị viên website General Systems</p>
          </div>
        </div>
      </div>

      {/* TOC */}
      <div className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-slate-500">Mục lục</h2>
        <ol className="grid gap-1 sm:grid-cols-2 text-sm text-blue-600">
          {[
            ['#hero', '1. Hero'],
            ['#showcase', '2. Showcase Corners'],
            ['#features', '3. Vì sao chọn chúng tôi'],
            ['#core-values', '4. Giá trị cốt lõi'],
            ['#solutions', '5. Giải pháp'],
            ['#projects', '6. Dự án'],
            ['#partners', '7. Đối tác'],
            ['#footer', '8. Footer'],
            ['#section-labels', '9. Nhãn section'],
            ['#detail-pages', '10. Trang chi tiết'],
            ['#rich-text', '11. Định dạng văn bản (Rich Text)'],
            ['#icon-guide', '12. Upload icon / SVG code'],
            ['#image-style', '13. Chọn style ảnh'],
            ['#detail-button', '14. Nút "Xem thêm"'],
            ['#slug', '15. Cách điền Slug'],
            ['#settings', '16. Cài đặt'],
            ['#workflow', '17. Quy trình thêm nội dung mới'],
            ['#copy-page', '18. Sao chép trang chi tiết'],
          ].map(([href, label]) => (
            <li key={href}>
              <a href={href} className="hover:underline">{label}</a>
            </li>
          ))}
        </ol>
      </div>

      <div className="space-y-10">

        {/* ── 1. Hero ── */}
        <Section id="hero" icon="🦸" title="1. Hero">
          <p>Trang <strong>Hero</strong> cho phép chỉnh nội dung xuất hiện trên màn hình đầu tiên khi vào website.</p>
          <FieldTable rows={[
            ['Tiêu đề (Heading)', 'Dòng tiêu đề lớn nằm giữa trang — có dropdown chọn cỡ chữ (sm / base / lg / xl)'],
            ['Mô tả (Description)', 'Đoạn văn bên dưới tiêu đề — soạn thảo bằng Rich Text Editor (xem mục 11)'],
            ['Nhãn nút CTA', 'Chữ hiển thị trên nút hành động (ví dụ: "Khám Phá Giải Pháp")'],
            ['Href nút CTA', 'Liên kết khi nhấn nút, thường là #solutions'],
            ['Stats', 'Số liệu thống kê hiển thị phía dưới (giá trị + nhãn)'],
          ]} />
          <Note>Nội dung Hero hỗ trợ cả hai ngôn ngữ VI và EN. Dùng tab <em>VI / EN</em> để chuyển đổi.</Note>
        </Section>

        {/* ── 2. Showcase Corners ── */}
        <Section id="showcase" icon="🎯" title="2. Showcase Corners">
          <p>8 góc của khối Rubik trên trang chủ — mỗi góc có nhãn, phụ nhãn và ảnh đại diện khi cube xoay tới góc đó.</p>
          <FieldTable rows={[
            ['Nhãn (Label)', 'Tên lĩnh vực, ví dụ: "TÍCH HỢP", "BẢO MẬT"'],
            ['Phụ nhãn (Sublabel)', 'Mô tả phụ ngắn gọn bên dưới nhãn'],
            ['Ảnh', 'Ảnh hiển thị trong khung khi spotlight chiếu vào góc đó. Nhấn "Tải ảnh lên" hoặc nhập đường dẫn thủ công'],
          ]} />
          <Note>Thứ tự các góc cố định — không thể thay đổi thứ tự, chỉ có thể sửa nội dung từng góc.</Note>
        </Section>

        {/* ── 3. Features ── */}
        <Section id="features" icon="✅" title="3. Vì sao chọn chúng tôi">
          <p>Section liệt kê các lý do nổi bật, hiển thị dưới dạng lưới thẻ trên trang chủ.</p>
          <FieldTable rows={[
            ['Tiêu đề section', 'Đầu đề của cả section'],
            ['Mỗi mục: Tiêu đề', 'Tiêu đề ngắn của lý do — có dropdown chọn cỡ chữ (xs / sm / base / lg / xl)'],
            ['Mỗi mục: Mô tả', 'Nội dung giải thích chi tiết — soạn thảo bằng Rich Text Editor (xem mục 11)'],
            ['Mỗi mục: Icon', 'Icon hiển thị trên thẻ — upload ảnh hoặc dán SVG code (xem mục 12)'],
          ]} />
          <Note>Nếu không cài icon, hệ thống tự dùng icon mặc định theo thứ tự mục. Xem mục 12 để biết cách thêm icon tùy chỉnh.</Note>
        </Section>

        {/* ── 4. Core Values ── */}
        <Section id="core-values" icon="💎" title="4. Giá trị cốt lõi">
          <p>Các giá trị cốt lõi của công ty, hiển thị dạng thẻ có icon.</p>
          <FieldTable rows={[
            ['Tiêu đề section', 'Đầu đề của section giá trị cốt lõi'],
            ['Mỗi mục: Tiêu đề', 'Tên giá trị (ví dụ: "Uy tín & Tin cậy") — có dropdown chọn cỡ chữ (xs / sm / base / lg / xl)'],
            ['Mỗi mục: Mô tả', 'Diễn giải giá trị đó — soạn thảo bằng Rich Text Editor (xem mục 11)'],
            ['Mỗi mục: Icon', 'Icon hiển thị trên thẻ — upload ảnh hoặc dán SVG code (xem mục 12)'],
          ]} />
          <Note>Nếu không cài icon, hệ thống tự dùng icon mặc định theo thứ tự mục. Xem mục 12 để biết cách thêm icon tùy chỉnh.</Note>
        </Section>

        {/* ── 5. Solutions ── */}
        <Section id="solutions" icon="🧩" title="5. Giải pháp">
          <p>Danh sách lĩnh vực giải pháp — mỗi mục là một thẻ trong section Giải pháp.</p>
          <FieldTable rows={[
            ['Tên giải pháp', 'Tiêu đề thẻ giải pháp'],
            ['Mô tả', 'Đoạn mô tả ngắn'],
            ['Ảnh', 'Ảnh bìa của thẻ giải pháp'],
            ['Slug', 'Mã định danh URL cho trang chi tiết (xem mục 15)'],
          ]} />
        </Section>

        {/* ── 6. Projects ── */}
        <Section id="projects" icon="🏗️" title="6. Dự án">
          <p>Danh sách dự án tiêu biểu hiển thị trong section Dự án.</p>
          <FieldTable rows={[
            ['Tiêu đề', 'Tên dự án'],
            ['Danh mục', 'Khách hàng và năm thực hiện (ví dụ: "VIETNAM AIRLINES | 2018")'],
            ['Mô tả', 'Tóm tắt dự án'],
            ['Ảnh', 'Ảnh minh họa dự án'],
            ['Slug', 'Mã định danh trang chi tiết dự án'],
          ]} />
        </Section>

        {/* ── 7. Partners ── */}
        <Section id="partners" icon="🤝" title="7. Đối tác">
          <p>Logo và tên các đối tác hiển thị trong section Đối tác trên trang chủ.</p>
          <FieldTable rows={[
            ['Tiêu đề section', 'Đầu đề của section — có dropdown chọn cỡ chữ (sm / base / lg / xl)'],
            ['Mô tả', 'Đoạn mô tả phía dưới tiêu đề — soạn thảo bằng Rich Text Editor (xem mục 11)'],
            ['Mỗi logo: Ảnh', 'Đường dẫn hoặc tải ảnh logo lên'],
            ['Mỗi logo: Tên công ty (alt)', 'Tên đối tác — dùng cho alt text ảnh (SEO & accessibility)'],
          ]} />
        </Section>

        {/* ── 8. Footer ── */}
        <Section id="footer" icon="🦶" title="8. Footer">
          <p>Quản lý toàn bộ nội dung và cỡ chữ của footer website. Footer chia làm 3 nhóm:</p>

          <h3 className="mt-4 mb-2 font-bold text-slate-800">Thông tin công ty</h3>
          <FieldTable rows={[
            ['Tên công ty', 'Hiển thị đầu footer — có dropdown chọn cỡ chữ'],
            ['Địa chỉ 1 / Địa chỉ 2', 'Hai dòng địa chỉ — soạn thảo bằng Rich Text Editor (xem mục 11); cỡ chữ inline trong editor'],
            ['Cỡ chữ liên hệ', 'Một dropdown điều chỉnh cùng lúc cỡ chữ của SĐT, Email, Website'],
            ['Số điện thoại', 'Số hiển thị và liên kết tel:'],
            ['Email', 'Địa chỉ email liên hệ'],
            ['Website (hiển thị)', 'Tên miền hiển thị (ví dụ: gs-group.vn)'],
            ['Website (href)', 'Đường dẫn đầy đủ khi nhấn vào (ví dụ: https://gs-group.vn)'],
          ]} />

          <h3 className="mt-4 mb-2 font-bold text-slate-800">Cột điều hướng</h3>
          <FieldTable rows={[
            ['Tiêu đề cột (cỡ chữ)', 'Dropdown chọn cỡ chữ cho tiêu đề cột Giải pháp và Dự án'],
            ['Tiêu đề cột Giải pháp', 'Nhãn đầu cột bên trái (ví dụ: "GIẢI PHÁP")'],
            ['Tiêu đề cột Dự án', 'Nhãn đầu cột bên phải (ví dụ: "DỰ ÁN TIÊU BIỂU")'],
            ['Nội dung danh sách link (cỡ chữ)', 'Dropdown chọn cỡ chữ cho các link trong cột — link tự lấy từ dữ liệu Giải pháp / Dự án'],
          ]} />

          <h3 className="mt-4 mb-2 font-bold text-slate-800">Copyright</h3>
          <FieldTable rows={[
            ['Nội dung copyright', 'Dòng bản quyền cuối trang — có dropdown chọn cỡ chữ'],
          ]} />

          <Note>Tên miền SĐT, Email, Website và các cỡ chữ được đồng bộ sang ngôn ngữ kia khi nhấn <em>Đồng bộ sang EN/VI</em>. Nội dung văn bản (tên công ty, địa chỉ, nhãn cột, copyright) giữ nguyên bản dịch của từng ngôn ngữ.</Note>
        </Section>

        {/* ── 9. Section Labels ── */}
        <Section id="section-labels" icon="🏷️" title="9. Nhãn section">
          <p>Tùy chỉnh các tiêu đề, phụ đề và mô tả mặc định của các section trên trang chủ mà không thuộc trang nào cụ thể.</p>
          <Note>Nếu để trống, hệ thống sẽ dùng nội dung mặc định đã cấu hình sẵn trong code.</Note>
        </Section>

        {/* ── 10. Trang chi tiết ── */}
        <Section id="detail-pages" icon="📄" title="10. Trang chi tiết">
          <p>Quản lý nội dung các trang chi tiết cho Giải pháp và Dự án. Mỗi trang chi tiết gồm:</p>
          <ul className="ml-5 mt-2 list-disc space-y-1 text-slate-700 text-sm">
            <li>Danh sách các <strong>section</strong> có thứ tự — kéo để sắp xếp lại</li>
            <li>Mỗi section có một <strong>loại (kind)</strong> quyết định cách hiển thị</li>
          </ul>

          <h3 className="mt-5 mb-2 font-bold text-slate-800">Các loại section (Kind)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <Th>Kind</Th>
                  <Th>Hiển thị</Th>
                  <Th>Trường dữ liệu</Th>
                </tr>
              </thead>
              <tbody>
                <Tr cells={['heading', 'Tiêu đề section lớn (có thể kèm ảnh)', 'Tiêu đề, Nội dung (tùy chọn)']} />
                <Tr cells={['content', 'Đoạn văn bản thông thường', 'Tiêu đề, Nội dung, Ảnh (tùy chọn)']} />
                <Tr cells={['image-points', 'Ảnh + danh sách điểm nổi bật', 'Tiêu đề, Ảnh, Style ảnh, Danh sách điểm']} />
                <Tr cells={['casestudies', 'Lưới thẻ case study', 'Tiêu đề, Danh sách thẻ (tên + mô tả)']} />
              </tbody>
            </table>
          </div>

          <h3 className="mt-6 mb-2 font-bold text-slate-800">Tùy chỉnh nâng cao</h3>

          <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-800 mb-1">🎨 Định dạng tiêu đề & văn bản</p>
              <p>Tất cả các ô tiêu đề, mô tả, nội dung trong trang chi tiết đều hỗ trợ <strong>rich text</strong> — có thể in đậm, đổi màu, chỉnh cỡ chữ v.v. Xem chi tiết tại <a href="#rich-text" className="text-blue-600 underline">mục 11</a>.</p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-800 mb-1">🌅 Layout Headline — Padding top phần text</p>
              <p>Khi trang sử dụng layout <strong>Headline</strong>, xuất hiện trường <strong>"Margin top (vh)"</strong> cho phép đẩy khối text trái xuống thấp hơn. Đơn vị là <code className="rounded bg-slate-100 px-1">vh</code> (% chiều cao màn hình) — mặc định 12.5vh.</p>
              <ul className="mt-2 ml-4 list-disc text-xs text-slate-600 space-y-0.5">
                <li>Giá trị nhỏ (5–10): text gần đỉnh màn hình hơn</li>
                <li>Giá trị lớn (20–40): text xuống thấp hơn, tạo khoảng thoáng phía trên</li>
              </ul>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-800 mb-1">🌑 Image-points Background — Opacity màn phủ</p>
              <p>Với section <strong>image-points</strong> kiểu <strong>background</strong> (ảnh phủ toàn section), có thanh kéo <strong>"Độ mờ nền (opacity)"</strong> điều chỉnh độ tối của lớp phủ màu tối phía trên ảnh.</p>
              <ul className="mt-2 ml-4 list-disc text-xs text-slate-600 space-y-0.5">
                <li>0% — ảnh hiện rõ hoàn toàn, không có lớp phủ</li>
                <li>82% — mặc định, ảnh khá tối để text dễ đọc</li>
                <li>100% — tối hoàn toàn (ảnh không nhìn thấy)</li>
              </ul>
            </div>
          </div>
        </Section>

        {/* ── 11. Rich Text ── */}
        <Section id="rich-text" icon="✏️" title="11. Định dạng văn bản (Rich Text Editor)">
          <p>Tất cả các ô mô tả / nội dung dài trong CRM đều dùng <strong>Rich Text Editor</strong> — có thanh công cụ định dạng phía trên. Áp dụng cho:</p>
          <ul className="ml-5 mt-1 mb-3 list-disc space-y-0.5 text-slate-700">
            <li><strong>Hero</strong> — trường Mô tả</li>
            <li><strong>Vì sao chọn chúng tôi</strong> — Mô tả của từng mục</li>
            <li><strong>Giá trị cốt lõi</strong> — Mô tả của từng mục</li>
            <li><strong>Đối tác</strong> — trường Mô tả section</li>
            <li><strong>Footer</strong> — Địa chỉ 1 và Địa chỉ 2</li>
            <li><strong>Trang chi tiết</strong> — tất cả ô Nội dung (body) trong từng section</li>
          </ul>
          <p>Các thao tác có thể thực hiện:</p>

          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <Th>Nút / Công cụ</Th>
                  <Th>Chức năng</Th>
                  <Th>Cách dùng</Th>
                </tr>
              </thead>
              <tbody>
                <Tr cells={['B / I / U', 'In đậm / Nghiêng / Gạch chân', 'Bôi đen text → nhấn nút']} />
                <Tr cells={['Căn chỉnh (≡)', 'Trái / Giữa / Phải', 'Đặt con trỏ trong đoạn → nhấn nút']} />
                <Tr cells={['• List / 1. List', 'Danh sách bullet / danh sách số', 'Đặt con trỏ → nhấn nút, mỗi Enter tạo dòng mới']} />
                <Tr cells={['Dropdown cỡ chữ (px)', 'Chọn cỡ chữ chính xác như Word: 8–72px', 'Bôi đen text → chọn cỡ trong dropdown']} />
                <Tr cells={['Dropdown font chữ', 'Đổi kiểu chữ (Sans, Serif, Mono…)', 'Bôi đen text → chọn font']} />
                <Tr cells={['Ô màu (■)', 'Đổi màu chữ', 'Bôi đen text → nhấn ô màu → chọn màu trong bảng chọn màu của trình duyệt']} />
              </tbody>
            </table>
          </div>

          <h3 className="mt-5 mb-2 font-bold text-slate-800">Lưu ý khi dùng Rich Text</h3>
          <ul className="ml-5 list-disc space-y-2 text-slate-700 text-sm">
            <li><strong>Bôi đen trước, định dạng sau:</strong> Luôn chọn (bôi đen) phần text muốn định dạng trước khi nhấn nút trên toolbar. Nhấn nút khi không có gì được chọn sẽ không có tác dụng.</li>
            <li><strong>Màu chữ:</strong> Khi nhấn ô màu trên toolbar, trình duyệt sẽ mở bảng chọn màu hệ thống (có thể nhập mã HEX). Bôi đen text trước, sau đó nhấn ô màu để áp dụng.</li>
            <li><strong>Cỡ chữ:</strong> Dropdown hiển thị danh sách các cỡ phổ biến (8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72 px). Bôi đen text rồi chọn cỡ.</li>
            <li><strong>Xem trước:</strong> Định dạng hiển thị ngay trong ô soạn thảo — đúng như trên trang web thật.</li>
            <li><strong>Không bị mất khi lưu:</strong> Định dạng (HTML) được lưu cùng nội dung — khi mở lại vẫn giữ nguyên.</li>
          </ul>

          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <strong>⚠️ Chú ý tiêu đề trong danh sách:</strong> Các tiêu đề trang chi tiết (ô "Tên trang") hiển thị ở danh sách CRM và phần "Khám phá thêm" sẽ tự động bỏ định dạng HTML để hiện chữ thuần — tránh lỗi hiển thị thẻ HTML. Tuy nhiên trên trang web thật, định dạng vẫn hiển thị đầy đủ.
          </div>
        </Section>

        {/* ── 12. Icon Guide ── */}
        <Section id="icon-guide" icon="🎨" title="12. Upload icon / SVG code">
          <p>Các mục trong <strong>Vì sao chọn chúng tôi</strong> và <strong>Giá trị cốt lõi</strong> cho phép cài icon tùy chỉnh theo hai cách: upload ảnh hoặc dán SVG code.</p>

          <h3 className="mt-4 mb-2 font-bold text-slate-800">So sánh hai cách</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <Th>Cách</Th>
                  <Th>Ưu điểm</Th>
                  <Th>Nhược điểm</Th>
                </tr>
              </thead>
              <tbody>
                <Tr cells={['SVG code (khuyến nghị)', 'Màu sắc thay đổi theo brand (currentColor) — tự động xanh #30549B. Không cần host ảnh', 'Cần copy đúng toàn bộ thẻ <svg>...</svg>']} />
                <Tr cells={['Upload ảnh (.svg / .png / .webp)', 'Đơn giản, kéo thả file', 'Màu cố định trong file ảnh, không đổi khi hover. SVG upload không nhận currentColor']} />
              </tbody>
            </table>
          </div>

          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="font-semibold text-green-800 mb-2">✅ Khuyến nghị: Dùng SVG code</p>
            <ol className="ml-4 list-decimal space-y-1.5 text-sm text-green-800">
              <li>Tìm icon phù hợp trên <strong>heroicons.com</strong>, <strong>lucide.dev</strong>, hoặc <strong>iconify.design</strong>.</li>
              <li>Chọn icon → chọn kiểu <strong>Outline</strong> hoặc <strong>Solid</strong> → nhấn <strong>Copy SVG</strong>.</li>
              <li>Trong CRM, cuộn xuống phần <strong>Icon</strong> của mục cần chỉnh.</li>
              <li>Dán code vào ô <strong>"hoặc dán SVG code"</strong> phía dưới.</li>
              <li>Nhấn <strong>Lưu</strong> — icon hiển thị ngay với màu xanh brand.</li>
            </ol>
          </div>

          <h3 className="mt-5 mb-2 font-bold text-slate-800">Màu sắc SVG hoạt động như thế nào?</h3>
          <ul className="ml-5 list-disc space-y-1.5 text-slate-700 text-sm">
            <li>SVG dùng <code className="rounded bg-slate-100 px-1">fill=&quot;currentColor&quot;</code> hoặc <code className="rounded bg-slate-100 px-1">stroke=&quot;currentColor&quot;</code> → tự lấy màu <strong>#30549B</strong> (xanh brand) do hệ thống thiết lập sẵn.</li>
            <li>SVG có màu cứng trong code (ví dụ: <code className="rounded bg-slate-100 px-1">fill=&quot;#FF0000&quot;</code>) → giữ nguyên màu đó, không bị ảnh hưởng.</li>
            <li>Nếu muốn icon có màu khác brand, hãy sửa trực tiếp giá trị màu trong SVG code trước khi dán.</li>
          </ul>

          <h3 className="mt-5 mb-2 font-bold text-slate-800">Dùng upload ảnh khi nào?</h3>
          <p>Khi có file ảnh thiết kế sẵn (logo, biểu tượng riêng của dự án) không có phiên bản SVG code — dùng <strong>Tải ảnh lên</strong> thay vì dán SVG. Lưu ý: màu sắc sẽ cố định theo file ảnh gốc.</p>

          <Note>Hai cách dùng cùng một trường dữ liệu — nếu vừa upload vừa dán SVG, cái nào nhập sau sẽ ghi đè cái trước. Nhấn <strong>Xóa</strong> để xóa SVG code hiện tại và chuyển sang upload ảnh.</Note>
        </Section>

        {/* ── 13. Image Style ── */}
        <Section id="image-style" icon="🖼️" title="13. Chọn style ảnh">
          <p>Khi section có trường <strong>Ảnh</strong>, bạn cần chọn <strong>Image Style</strong> để quyết định cách ảnh được hiển thị:</p>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <Th>Style</Th>
                  <Th>Mô tả</Th>
                  <Th>Dùng khi nào</Th>
                </tr>
              </thead>
              <tbody>
                <Tr cells={['cover', 'Ảnh phủ toàn bộ khung, cắt viền nếu cần', 'Ảnh bối cảnh, banner']} />
                <Tr cells={['contain', 'Ảnh thu nhỏ vừa khung, không cắt', 'Ảnh sơ đồ, biểu đồ, logo']} />
                <Tr cells={['portrait', 'Ảnh chiều dọc, tỷ lệ 3:4', 'Ảnh chân dung, ảnh thẳng đứng']} />
                <Tr cells={['wide', 'Ảnh chiều ngang, tỷ lệ 16:9', 'Ảnh panorama, screenshot']} />
                <Tr cells={['background', 'Ảnh nền phía sau nội dung text', 'Ảnh minh họa, section đặc biệt']} />
              </tbody>
            </table>
          </div>
          <Note>Với kind <code>image-points</code>, thường chọn <strong>cover</strong> hoặc <strong>background</strong>. Với sơ đồ/biểu đồ, chọn <strong>contain</strong>. Khi chọn <strong>background</strong>, dùng thanh kéo <em>Opacity màn phủ</em> để điều chỉnh độ tối.</Note>
        </Section>

        {/* ── 14. Detail Button ── */}
        <Section id="detail-button" icon="🔗" title='14. Nút "Xem thêm"'>
          <p>Mỗi trang chi tiết (Giải pháp / Dự án) có thể bật/tắt nút <strong>"Xem chi tiết"</strong> dẫn tới trang riêng:</p>
          <ul className="ml-5 mt-2 list-disc space-y-1 text-slate-700 text-sm">
            <li>Bật nút: tích vào ô <strong>"Hiển thị nút xem thêm"</strong></li>
            <li>URL nút tự động tạo từ slug: <code className="rounded bg-slate-100 px-1">/solutions/[slug]</code> hoặc <code className="rounded bg-slate-100 px-1">/projects/[slug]</code></li>
            <li>Nội dung nút được đồng bộ giữa VI và EN — chỉ cần bật một lần</li>
          </ul>
          <Note>Nếu trang chi tiết chưa có nội dung, hãy tắt nút để tránh dẫn vào trang trống.</Note>
        </Section>

        {/* ── 15. Slug ── */}
        <Section id="slug" icon="🔑" title="15. Cách điền Slug">
          <p>Slug là mã định danh URL cho từng giải pháp hoặc dự án. Slug quyết định đường dẫn trang chi tiết.</p>

          <h3 className="mt-4 mb-2 font-bold text-slate-800">Quy tắc đặt slug</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <Th>Quy tắc</Th>
                  <Th>Ví dụ đúng</Th>
                  <Th>Ví dụ sai</Th>
                </tr>
              </thead>
              <tbody>
                <Tr cells={['Chỉ dùng chữ thường, số, dấu gạch ngang', 'an-ninh-quoc-phong', 'An Ninh Quốc Phòng']} />
                <Tr cells={['Không dấu tiếng Việt', 'dien-luc-nang-luong', 'điện-lực-năng-lượng']} />
                <Tr cells={['Không có khoảng trắng', 'bao-mat-attt', 'bao mat attt']} />
                <Tr cells={['Không bắt đầu/kết thúc bằng dấu -', 'he-thong-gsm', '-he-thong-gsm-']} />
                <Tr cells={['Ngắn gọn, mô tả nội dung', 'phan-mem-phan-bay-aves', 'page-1-detail-new']} />
              </tbody>
            </table>
          </div>

          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-700">⚠️ Quan trọng</p>
            <p className="mt-1 text-sm text-red-600">
              Slug <strong>không thể chỉnh sửa qua CRM</strong> sau khi đã tạo trang chi tiết. Muốn đổi slug phải sửa trực tiếp trong file <code>data/content.json</code> và đồng thời đổi tên thư mục tương ứng trong <code>data/detail/</code>.
            </p>
          </div>
        </Section>

        {/* ── 16. Settings ── */}
        <Section id="settings" icon="⚙️" title="16. Cài đặt">
          <h3 className="mb-2 font-bold text-slate-800">Đổi mật khẩu</h3>
          <FieldTable rows={[
            ['Mật khẩu hiện tại', 'Nhập mật khẩu đang dùng để xác thực'],
            ['Mật khẩu mới', 'Mật khẩu mới, tối thiểu 6 ký tự'],
            ['Xác nhận mật khẩu mới', 'Nhập lại đúng mật khẩu mới'],
          ]} />

          <h3 className="mt-5 mb-2 font-bold text-slate-800">Quản lý người dùng</h3>
          <ul className="ml-5 list-disc space-y-1 text-slate-700 text-sm">
            <li>Xem danh sách tài khoản đang tồn tại trong hệ thống</li>
            <li>Thêm tài khoản mới bằng form <strong>Tên đăng nhập + Mật khẩu</strong></li>
            <li>Xóa tài khoản (nút xóa ẩn đi nếu chỉ còn 1 user)</li>
            <li>Nếu chưa có user trong file, hệ thống dùng biến môi trường <code className="rounded bg-slate-100 px-1">ADMIN_USERNAME</code> / <code className="rounded bg-slate-100 px-1">ADMIN_PASSWORD</code></li>
          </ul>
          <Note>Không chia sẻ mật khẩu qua kênh không bảo mật. Mỗi thành viên nên có tài khoản riêng.</Note>
        </Section>

        {/* ── 17. Workflow ── */}
        <Section id="workflow" icon="🔄" title="17. Quy trình thêm nội dung mới">
          <ol className="ml-5 list-decimal space-y-3 text-slate-700 text-sm">
            <li><strong>Chuẩn bị ảnh:</strong> Đặt tên ảnh theo format <code className="rounded bg-slate-100 px-1">ten-du-an.jpg</code>, không dùng tiếng Việt hay khoảng trắng.</li>
            <li><strong>Tải ảnh lên:</strong> Dùng nút "Tải ảnh lên" trong CRM — ảnh sẽ lưu vào <code className="rounded bg-slate-100 px-1">/public/image/</code>.</li>
            <li><strong>Tạo mục:</strong> Vào trang tương ứng (Giải pháp / Dự án) → điền thông tin → điền Slug theo quy tắc mục 15 → Lưu.</li>
            <li><strong>Bật trang chi tiết:</strong> Vào <strong>Trang chi tiết</strong> → chọn mục vừa tạo → tích "Hiển thị nút xem thêm".</li>
            <li><strong>Thêm các section:</strong> Nhấn "Thêm section" → chọn loại phù hợp → điền nội dung → chọn style ảnh.</li>
            <li><strong>Định dạng văn bản:</strong> Bôi đen text trong ô soạn thảo → dùng toolbar để in đậm, đổi màu, chỉnh cỡ chữ (xem mục 11).</li>
            <li><strong>Thêm icon (nếu cần):</strong> Vào mục Vì sao chọn / Giá trị cốt lõi → dán SVG code vào ô icon của từng mục (xem mục 12).</li>
            <li><strong>Sắp xếp thứ tự:</strong> Kéo thả các section để sắp xếp theo thứ tự muốn hiển thị.</li>
            <li><strong>Kiểm tra tiếng Anh:</strong> Chuyển tab sang EN → điền bản dịch cho các trường cần thiết.</li>
            <li><strong>Lưu và xem trước:</strong> Nhấn Lưu → nhấn "Xem trang web" ở sidebar để kiểm tra kết quả.</li>
          </ol>
        </Section>

        {/* ── 18. Sao chép trang chi tiết ── */}
        <Section id="copy-page" icon="📋" title="18. Sao chép trang chi tiết">
          <p>Tính năng <strong>Sao chép trang</strong> giúp tạo nhanh một trang chi tiết mới với toàn bộ nội dung giống hệt trang hiện tại, chỉ thay đổi category và slug.</p>
          <p><strong>Cách dùng:</strong></p>
          <ol className="ml-5 list-decimal space-y-1">
            <li>Mở trang chi tiết cần sao chép trong CRM (<strong>Trang chi tiết → chọn trang</strong>).</li>
            <li>Nhấn nút <strong>Sao chép</strong> (màu xanh lá, cạnh nút Xem trước) ở góc phải phía trên.</li>
            <li>Trong hộp thoại xuất hiện:
              <ul className="ml-5 mt-1 list-disc space-y-1">
                <li>Chọn <strong>Category</strong>: <em>Giải pháp (solutions)</em> hoặc <em>Dự án (projects)</em>.</li>
                <li>Nhập <strong>Slug mới</strong> — theo cùng quy tắc mục 15: chữ thường, số, dấu gạch ngang, không dấu cách.</li>
              </ul>
            </li>
            <li>Nhấn <strong>Sao chép</strong> để xác nhận. Hệ thống sẽ tạo trang mới và chuyển thẳng vào trang vừa tạo.</li>
          </ol>
          <Note>
            Bản sao chép nội dung của <em>cả hai ngôn ngữ</em> (VI và EN). Sau khi sao chép, nhớ vào từng tab ngôn ngữ để chỉnh lại tiêu đề và nội dung phù hợp với trang mới, rồi nhấn <strong>Lưu</strong>.
          </Note>
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span className="font-semibold">⚠️ Lưu ý:</span> Slug mới không được trùng với bất kỳ trang nào đã tồn tại trong cùng category. Nếu trùng, hệ thống sẽ thông báo lỗi và không tạo bản sao.
          </div>
        </Section>

      </div>

      <div className="mt-12 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
        <strong>💡 Cần hỗ trợ thêm?</strong> Liên hệ nhóm kỹ thuật hoặc xem lại hướng dẫn này bất kỳ lúc nào qua menu <strong>Hướng dẫn</strong> ở thanh bên trái.
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({ id, icon, title, children }: { id: string; icon: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6">
      <div className="mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">
        <span className="text-xl">{icon}</span>
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
      </div>
      <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
        {children}
      </div>
    </section>
  )
}

function FieldTable({ rows }: { rows: [string, string][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-slate-100">
            <Th>Trường</Th>
            <Th>Ý nghĩa</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([field, desc]) => (
            <Tr key={field} cells={[field, desc]} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="border border-slate-200 px-3 py-2 text-left text-xs font-semibold text-slate-600">
      {children}
    </th>
  )
}

function Tr({ cells }: { cells: string[] }) {
  return (
    <tr className="even:bg-slate-50">
      {cells.map((cell, i) => (
        <td key={i} className={`border border-slate-200 px-3 py-2 ${i === 0 ? 'font-medium text-slate-800 whitespace-nowrap' : 'text-slate-600'}`}>
          {cell}
        </td>
      ))}
    </tr>
  )
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
      <span className="font-semibold">💡 Lưu ý:</span> {children}
    </div>
  )
}
