# P00.1 — UI research và luận điểm thiết kế

Ngày 03/11/2026. Nghiên cứu được thực hiện **trước HTML/CSS P00.1**. Nguồn là trang chính thức; không sao chép branding, artwork hoặc layout nguyên bản. Browser CUA trả native pipe/browser host unavailable, do đó không tuyên bố đã trực tiếp quan sát animation, đo font/khoảng cách hay kiểm responsive của website tham khảo.

## 1. Chẩn đoán prototype cũ

Phản hồi chủ dự án: A quá trống trải, thiếu điểm nhấn, chưa đạt chất lượng. Xem source cho thấy hero lớn + nhiều khoảng dọc trước tài nguyên, không có icon/screenshot, feature trang trí bằng chữ; danh sách thiếu dấu hiệu nhận diện sản phẩm. A/B cùng skeleton nên chưa đủ khác nhau. Vấn đề là **phân bổ sự chú ý và thông tin**, không thể sửa chỉ bằng màu hoặc typography lớn hơn.

## 2. Nguồn đã khảo sát và cách chuyển hóa

| Nguồn chính thức | Bằng chứng đọc được | Áp dụng vào hub | Không sao chép / giới hạn |
| --- | --- | --- | --- |
| [Apple.com](https://www.apple.com/) | Điều hướng theo nhóm sản phẩm, search; mỗi khối nêu lời hứa ngắn, hình sản phẩm và hành động tiếp theo | Phân cấp rõ, hình ảnh giải thích tài nguyên; header nhất quán | Không dùng hero bán hardware toàn màn hình cho catalog; không lấy font/logo/artwork Apple |
| [App Store Today](https://apps.apple.com/us/iphone/today) | Story biên tập xen nhóm app, category/platform và app identity | A dùng feature image-led, app shelves và collection theo nhu cầu | Không sao chép Today card hoặc nội dung/rating bên Apple |
| [Setapp apps](https://setapp.com/apps) | Search, intent categories, nền tảng, top-rated/new; app có tên và công việc giải quyết | Mô tả bằng động từ, facet độc lập, fact nhất quán | Mô hình subscription Mac khác hub đa nền tảng; không copy điểm/giá |
| [Raycast Store](https://www.raycast.com/store) | Search, featured, recent/popular; detail và gallery riêng | Search-first directory B, đọc lướt nhanh, detail có nguồn và hình | Không áp command palette như điều hướng duy nhất với người phổ thông |
| [AlternativeTo browse](https://alternativeto.net/browse/) | Catalog theo platform/category/license, quan hệ alternative | Facet giá và license khác nhau; đường khám phá theo mục đích | Không bê mật độ/badge dày sang mobile |
| [Product Hunt](https://www.producthunt.com/) | Danh sách sản phẩm và nội dung ngày/chủ đề | Nhịp list giúp nhìn nhiều ứng dụng trong một màn hình | Không dùng upvotes/launch rank làm chứng nhận chất lượng |
| [Linear features](https://linear.app/features) | Hình sản phẩm đi cùng nhóm khả năng cụ thể, điều hướng và CTA rõ | Mỗi hình có nhiệm vụ giải thích, không dùng ảnh trang trí chung chung | Đây là marketing product, không phải mẫu directory; không lấy dark/glow làm bản sắc |

Phân tích editorial sâu: [Editorial research](PHASE001_EDITORIAL_RESEARCH.md). Phân tích directory và accessibility: [Directory research](PHASE001_DIRECTORY_RESEARCH.md).

## 3. Các trục thiết kế chung (đề xuất, không phải số đo nguồn)

- **Bố cục:** intro/search gọn, tài nguyên đầu tiên xuất hiện trước khoảng 500px trên desktop theo mục tiêu thiết kế. Không dùng viewport-height hero. Mỗi màn hình có feature, danh sách hoặc đường vào công việc cụ thể.
- **Typography:** system font hỗ trợ tiếng Việt; heading 40–52px desktop, 30–36px mobile, nội dung chính 15–16px; metadata 12–13px. Giới hạn dòng, không tracking quá chặt làm dấu tiếng Việt khó đọc. Không dùng font SF tải ngoài license.
- **Màu:** surface sáng trung tính, chữ near-black; accent xanh lam tiết chế cho hành động. Màu từ icon/screenshot tạo chiều sâu; mỗi feature có màu nền có ý nghĩa. Không tạo hàng loạt gradient/glow.
- **Khoảng trắng:** gutter 24–64px theo viewport, section gap 32–56px, card gap 16–24px; khoảng thở nằm giữa nhóm nội dung có quan hệ, không kéo dài hero rỗng. Mật độ ba concept khác nhau.
- **Trình bày app:** icon có nguồn hoặc category tile nguyên bản được phân biệt; purpose một câu, nền tảng, phí/license, điểm kèm số phiếu **mẫu** nếu fixture; không có rating thì hiện chưa có đánh giá. Có CTA detail và link official ở detail.
- **Navigation:** nhóm theo học/làm/sáng tạo/code và khám phá toàn bộ; header search luôn truy cập được, đóng góp có dialog demo phản hồi thật, không endpoint giả. Facet type/category/platform/price tách độc lập.
- **Motion:** phản hồi hover/focus 140–220ms, không autoplay/parallax/scroll hijack; reduced-motion tắt transition/animation. Không coi source website có animation cụ thể nếu chưa nhìn thấy.
- **Mobile:** reflow một cột/nhóm 2 cột hợp lý, menu có trạng thái và Escape, filter disclosure/summary, không sidebar cố định 200px; search trên cùng, target chính ≥44px; không bắt horizontal scroll để đọc tài nguyên.

Các trang [Apple HIG layout](https://developer.apple.com/design/human-interface-guidelines/layout), [typography](https://developer.apple.com/design/human-interface-guidelines/typography), [motion](https://developer.apple.com/design/human-interface-guidelines/motion), [searching](https://developer.apple.com/design/human-interface-guidelines/searching) mở được landing JS-only nhưng Markdown fetch bị tool từ chối content-type; không ghi là đã đọc đầy đủ. Không suy diễn giá trị font hoặc breakpoints từ HIG.

## 4. Ba concept khác nhau về cấu trúc

| Concept | Ưu tiên | Home | Discover | Detail |
| --- | --- | --- | --- | --- |
| A — Editorial Discovery | Cảm hứng + biên tập | Mosaic có screenshot + câu chuyện, shelves app, collection | Nhóm khám phá và cards rộng, filter dễ thấy | Story dẫn dắt, ảnh lớn, facts hỗ trợ |
| B — Software & Tools Directory | Tốc độ scan và lọc | Rail chủ đề, task band ngắn, index/grid mật độ cao | Facet rail + kết quả dày, sort/empty rõ | Identity/facts cột riêng, nội dung và gallery cột chính |
| C — Hybrid | Biên tập có kiểm soát + catalog lớn | Header ngang, intro/search bên cạnh feature, shelf và nhóm theo công việc | Toolbar compact, filter và grid/list | Hero gọn, screenshot + fact song song, section rõ |

Nội dung fixture dùng chung để so sánh cấu trúc thay vì thay dữ liệu làm phương án đẹp giả. Tên làm việc “Nếp” và token chưa chốt. P00.1 không thay kiến trúc Astro/TypeScript + Workers/D1 đã thống nhất; chưa là P01.

## 5. Reuse và quyền nội dung

Reuse normalize/escape/hash navigation từ prototype cũ theo ý tưởng, giữ nguyên file cũ. Native HTML/CSS/JS đủ cho ba concept; không cần framework/dependency/network API. Dùng shared data và primitives để hành vi tìm kiếm nhất quán, mỗi concept có composition riêng. Không thêm React/Tailwind/carousel library chỉ cho bản mẫu.

Asset audit tại [PHASE001_ASSETS](PHASE001_ASSETS.md): chọn icon/screenshot có nguồn và điều kiện rõ; không dùng artwork Apple/Setapp/Raycast. Hình tự dựng phải ghi là sơ đồ minh họa, không gọi screenshot thật. Giấy phép mã nguồn không mặc nhiên là giấy phép logo; tài nguyên không có asset rõ quyền dùng category symbol gốc, không emoji giả logo.

## 6. Gate nghiên cứu → thực hiện

Đã có phân tích reference và ba cấu trúc trước khi dựng HTML/CSS. Đề xuất nghiêng **C** về cân bằng nhu cầu đa nhóm, nhưng chỉ đưa khuyến nghị cuối sau kiểm logic/static và đối chiếu brief. Browser/screenshots/desktop1440/tablet768/mobile390 vẫn phải báo SKIP nếu host không khôi phục; không gọi đây là UI đã nghiệm thu.
