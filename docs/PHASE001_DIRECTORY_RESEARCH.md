# P00.1 — Nghiên cứu discovery và directory

Ngày rà: **03/11/2026**. Phạm vi: cấu trúc nội dung và UX từ trang chính chủ. **Chưa kiểm thị giác, animation hoặc responsive bằng browser**: CUA của phiên này trả browser host/native pipe unavailable. Phần “đề xuất” dưới đây là thiết kế suy ra cho hub, không phải số đo CSS hoặc kết quả usability test của các website tham khảo. Chưa viết HTML/CSS ở bước nghiên cứu này.

## 1. Raycast: tách lời hứa sản phẩm khỏi công cụ tìm

[Trang chủ Raycast](https://www.raycast.com/) tổ chức nội dung quanh lợi ích làm việc nhanh, thao tác bàn phím và các nhóm extension theo công việc. Đây là marketing cho một sản phẩm, không phải mẫu phù hợp để chép nguyên vào catalog nhiều loại tài nguyên. Bài học: dùng một ý tưởng thị giác cụ thể gắn với công việc; không để hero giới thiệu thương hiệu lấn phần tìm tài nguyên.

[Raycast Store](https://www.raycast.com/store) đưa search và phím tắt lên trước, tiếp đến Featured, rồi All/Recent/Popular. Mỗi extension có tên, mô tả hành động, tác giả và CTA; một số có compatibility hoặc số command/install. Tầng tuyển chọn dẫn vào thư viện, thay vì biến toàn bộ thư viện thành quảng cáo.

[Chi tiết Color Picker](https://www.raycast.com/thomas/color-picker) có icon, mục đích một câu, CTA, gallery, các phần Overview/Commands/Version History; compatibility, categories và source được tách riêng. Chuyển hóa cho hub: ảnh phải giải thích tài nguyên làm gì; fact panel và nguồn phải tìm được nhanh; không bê số install hoặc command vào review cộng đồng của hub.

## 2. Setapp: mô tả theo việc cần làm

[Setapp All apps](https://setapp.com/apps) có search cho app/guide, navigation theo nhóm công việc, bộ lọc nền tảng, thứ tự Top rated/New. Kết quả nối tên app với tác vụ ngắn, nền tảng và tín hiệu đánh giá. Chuyển hóa: người không biết tên phần mềm vẫn có lối vào qua nhu cầu. Không nhập mô hình subscription hay điểm phần trăm của Setapp thành dữ liệu của hub.

[Chi tiết CleanShot X](https://setapp.com/apps/cleanshot) trình bày icon/tên, lợi ích một câu, gallery và CTA; làm rõ điều kiện giá, phiên bản, OS, dung lượng và review count. Chuyển hóa: đặt “đến nguồn chính thức” cùng thông tin giá/điều kiện rõ ràng; gallery cạnh nội dung có ích hơn một khối trống trang trí. Đây chỉ là nghiên cứu bố cục, không đánh giá chất lượng app hoặc xác nhận giá để seed catalog.

## 3. AlternativeTo: nhiều facet, không một cây danh mục cứng

[Browse all apps](https://alternativeto.net/browse/) tách category, license/giá, features/tags và platforms; các nhóm có tìm kiếm riêng. Cấu trúc này hỗ trợ catalog lớn nhưng bày tất cả cùng lúc có thể gây quá tải với người mới. Hub nên mở trước nhu cầu + nền tảng + chi phí, đưa facet nâng cao sau; giữ miễn phí và open source độc lập. Không dùng số lượng app của nguồn để tạo bằng chứng quy mô cho prototype.

## 4. Product Hunt: đọc nhanh nhưng tránh đồng nhất vote với chất lượng

[Trang chủ](https://www.producthunt.com/) dùng thứ tự sản phẩm, icon, mô tả ngắn và tín hiệu cộng đồng để quét nhiều mục; nội dung promoted có nhãn. [Trang categories](https://www.producthunt.com/categories) có nhóm lớn và tên tác vụ chi tiết. Hub có thể học khả năng quét kết quả và cách ghi rõ nội dung được tài trợ nếu sau này có; không lấy thứ hạng ngày ra mắt, vote hoặc popularity làm “tốt nhất” cho học sinh/giáo viên.

## 5. Typography, màu, khoảng trắng và motion: ranh giới bằng chứng

Text extraction xác nhận hierarchy nội dung, không xác nhận font-family, kích thước chữ, sắc màu, cột pixel hoặc animation đang chạy. Vì vậy không ghi những thuộc tính đó như quan sát thực tế. Đề xuất riêng cho hub:

- **Typography:** body đủ đọc tiếng Việt, tên app phân biệt rõ với metadata; headline ngắn, không dùng cỡ chữ cực lớn làm điểm nhấn duy nhất. Hạn chế uppercase/letter spacing cho tiếng Việt dài.
- **Màu:** bề mặt trung tính + một accent hệ thống; màu icon/screenshot thuộc sản phẩm được giữ riêng, không biến thành nhiều accent điều khiển. Chỉ một vùng feature dùng nền tương phản để tạo nhịp.
- **Khoảng trắng:** khoảng cách giữa section rộng hơn giữa các mục trong cùng nhóm. Density có chủ đích; card không cao chỉ vì thiếu nội dung. Giữ tài nguyên trong màn hình đầu 1440px bằng intro ngắn và minh họa nằm cùng khối nội dung.
- **Motion:** hover/focus ngắn cho phản hồi, không parallax/autoplay/scroll hijack. Tắt chuyển động trang trí khi reduced motion; đây là yêu cầu hub, chưa xác minh behavior của các nguồn. [W3C về animation do tương tác](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html).

## 6. Mobile: thiết kế lại thứ tự, không co desktop

Ở 390px, sidebar chuyển thành nút mở bộ lọc có số filter đang áp dụng; selected facets và nút xóa luôn thấy được. Mỗi hàng giữ icon + tên + một câu công dụng + nền tảng/chi phí + CTA; không nhồi mọi nhãn. Search đứng trước nội dung, sort sau tổng kết quả. 768px có thể hai cột nội dung và filter gọn; 1440px có sidebar. Đây là **đề xuất cần kiểm browser**, không phải mô tả mobile của nguồn.

[W3C Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) yêu cầu nội dung thông thường không mất chức năng hoặc bắt cuộn hai chiều khi thu hẹp tương đương 320 CSS px, có ngoại lệ cho nội dung cần hai chiều. [Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) đặt mức 24×24 CSS px hoặc điều kiện khoảng cách/ngoại lệ; hub đặt mục tiêu control chính 44px để thao tác thoải mái hơn, không gọi 44px là mức AA bắt buộc.

## 7. Concept B khác biệt thực chất

**Modern Software & Tools Directory** là công cụ tìm có tính hệ thống:

1. Navigation/brand gọn; search và đóng góp luôn tìm thấy.
2. Sidebar taxonomy + mục đích, main content là intro ngắn, thanh search, một dải công cụ gợi ý có hình nhỏ; danh sách/grid tài nguyên vào sớm.
3. Home ưu tiên phần mềm/learning/repo ở các nhóm quét nhanh; trang khám phá dùng sidebar facet, grid/list switch và sort. Thông tin đa chiều cùng một schema nhất quán, không một dãy card khổng lồ giống nhau.
4. Detail thiên về quyết định: identity + fact/nguồn/CTA, screenshot, công dụng/hạn chế, related. Không dùng màn intro toàn chiều cao.

**Ưu:** người biết nhu cầu tìm nhanh, hỗ trợ catalog lớn, đọc nền tảng/chi phí dễ so. **Nhược:** dễ giống dashboard, kém cảm giác tuyển chọn nếu quá đều hoặc quá dày. Cần icon/screenshot chất lượng và một điểm nhấn editor nhỏ, không thêm chart/counter giả.

**Hybrid C** nên giữ feature có hình và câu chuyện ngắn như điểm vào, nhưng đặt search/facet + kết quả thật trong cùng nhịp nhìn; không làm nửa đầu landing page rồi mới đến directory. Khác biệt với A là khả năng định tuyến từ nhu cầu và mật độ thường trực; khác B là nhịp tuyển chọn có hình và collection rõ hơn.

## 8. Reuse và quyền nội dung

Không cần framework/UI package để chứng minh bố cục tĩnh. Tái sử dụng fixture đã ghi nhãn và primitive trình duyệt, viết phần bố cục nhỏ riêng cho mỗi concept. Không sao chép CSS, branding, logo hub hoặc screenshot của website tham khảo. Icon/screenshot tài nguyên cần nguồn và điều kiện sử dụng riêng; logo thương hiệu không mặc nhiên theo license code. Nguồn tham khảo phục vụ phân tích thiết kế, không cấp quyền tái phân phối assets.

**Validation:** PASS nghiên cứu primary pages/IA và nguồn accessibility; SKIP browser visual/viewport/motion/user test. Chưa kết luận concept nào đạt chất lượng nghiệm thu; chờ implementation và review của chủ dự án.
