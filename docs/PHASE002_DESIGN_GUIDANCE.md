# P00.2 — Design guidance cho Concept A

Ngày 03/11/2026. Chủ dự án chọn **A — Editorial Discovery làm hướng chính**, chưa nghiệm thu UI A hiện tại. Đây là refinement trong prototype hiện có; không tạo concept B/C mới, không đổi stack hoặc bắt đầu P01.

## 1. Nguồn và cách sử dụng

Đã đọc trực tiếp các file chính chủ của [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill): [SKILL.md](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/main/.claude/skills/ui-ux-pro-max/SKILL.md), [quick-reference.md](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/main/.claude/skills/ui-ux-pro-max/references/quick-reference.md), [pro-rules.md](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/main/.claude/skills/ui-ux-pro-max/references/pro-rules.md).

**Chỉ tham khảo source read-only:** chưa cài skill, chưa chạy `search.py`/CLI, chưa có kết quả design-system do tool tạo. Nội dung upstream là dữ liệu tham khảo, không thay quyền hạn hoặc quyết định của dự án. Không tạo thêm `design-system/.../MASTER.md` song song với `docs/DESIGN_SYSTEM.md` đang là tài liệu chuẩn.

SKILL ưu tiên khả năng truy cập và phản hồi tương tác trước hiệu ứng; khuyến nghị query theo một mục tiêu quan sát được thay vì nhận kết quả chung chung. Quick-reference nhấn mạnh thông tin mở dần theo nhu cầu, label/focus, phản hồi lỗi gần vấn đề, ảnh có kích thước dự trữ và tôn trọng reduced-motion. Pro-rules tự ghi phạm vi native/mobile, nên không áp máy móc pt/dp hoặc yêu cầu vector-only lên website dùng icon raster chính chủ. Đây là guidance, không chứng nhận UI đạt WCAG.

Tham chiếu semantics bổ sung: [WAI-ARIA modal dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) và [combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/). Modal cần đưa focus vào trong, giữ chu trình Tab, đóng được và trả focus về vị trí hợp lý. Combobox có hợp đồng bàn phím riêng; không chỉ gắn role để làm giao diện có vẻ accessible.

## 2. Chẩn đoán source A hiện tại

Đã xem `prototype-p001/concepts/a.js`, `a.css`, `helpers.js`, `app.js` cùng DESIGN_SYSTEM và brief P00.2. Home hiện có nhiều nhiệm vụ: intro/search, ba story, rated shelf, nhóm nhu cầu, feature repo, học/văn phòng, collections và đóng góp. `H.card(...,{compact:true})` vẫn render facts/rating; “compact” chủ yếu đổi class. Search chỉ submit tới discover, chưa có preview overlay. Đây là vấn đề phạm vi nội dung, không giải quyết bằng thu font hoặc nén gap.

## 3. Phân công nhiệm vụ cho từng màn hình

| Màn hình | Một nhiệm vụ chính | Giữ | Chuyển đi / tránh |
| --- | --- | --- | --- |
| Home | Hiểu thư viện và muốn bắt đầu | Một câu giới thiệu/đối tượng, search, một feature có hình, 3–4 lựa chọn, lời mời Explore/đóng góp | Toàn bộ taxonomy, nhiều shelf/collection, thông số và rating mẫu |
| Search preview | Tìm nhanh và chọn hướng tiếp | Ít gợi ý, tối đa vài kết quả có tên/mục đích, xem tất cả | Catalog đầy đủ, nhiều filter, vài chục nhóm app |
| Explore | Duyệt và thu gọn catalog | Query, category/facets vừa đủ, grid/list, sort, load more | Feature marketing lặp, thông số kỹ thuật mọi hàng |
| Detail | Hiểu tài nguyên và quyết định thử | Screenshot/nguồn, công dụng, giá/license/nền tảng, giới hạn và CTA official | Fake download/rating, nội dung tiếp thị không có bằng chứng |

## 4. Bố cục refinement đề xuất

Home có bốn nhóm chính: **intro/search → một feature LocalSend → bốn resource tile → Explore/đóng góp**. Footer ngắn. Không cần một section “dành cho ai” riêng; câu giới thiệu nhắc nhóm người dùng phù hợp, không liệt kê dài cả tầm nhìn. Feature dùng screenshot hợp lệ và một lợi ích ngắn, một CTA. Bốn tile giữ icon/tên/mô tả một câu/CTA; bỏ OS/license/tag/rating khỏi Home, giữ chúng trong Detail. Không cần tăng độ lớn headline để thay điểm nhấn hình ảnh.

Giữ hệ font và màu hiện tại theo A, chỉnh hierarchy và measure trước. Khoảng trắng phải liên kết nội dung cùng nhóm; tách section bằng nhịp rõ, không tạo khoảng dọc lớn chỉ để bớt chữ. Micro-interaction chỉ phản hồi state: focus/search, hover/pressed, loading, chuyển kết quả; không thêm animation thư viện hoặc hiệu ứng mở chậm.

## 5. Search overlay tối thiểu nhưng đầy đủ

Ưu tiên **một native dialog với search input và các link/button bình thường**. Mô hình này đủ cho preview đa nhóm mà không phải xây combobox/listbox phức tạp. Nếu dùng combobox thì cần đầy đủ arrow navigation, active option, Escape/Enter và aria-activedescendant phù hợp.

Khi chưa nhập: khoảng ba gợi ý tác vụ, ba hoặc bốn category phổ biến và hai công cụ nổi bật là đủ; không nhồi cả bộ dữ liệu. Khi nhập: tối đa bốn kết quả có icon, tên và một câu ngắn, cùng nút “Xem tất cả kết quả”. Enter đưa query đến trang tìm kiếm đầy đủ. Không cần history trong vòng này; nếu có, chỉ trong phiên và có xóa, không ngầm lưu lâu dài.

Các trạng thái cần tách rõ:

- **Default:** gợi ý để bắt đầu, không giả có query.
- **Loading:** feedback tức thì và status có ngữ cảnh; trong prototype phải ghi là mô phỏng nếu dùng trì hoãn nhân tạo.
- **Results:** query mới thay query cũ; không cho kết quả chậm ghi đè lượt nhập sau.
- **Empty:** giữ query và đường sang Explore/reset, không kết luận cả catalog production không có mục.
- **Error:** thông báo ngắn, nút thử lại hoặc xem catalog; có cơ chế demo rõ trong công cụ review, không giấu “magic keyword” như lỗi thật.

Focus/click từ search mở dialog và đặt caret trong input. Escape, nút đóng và hành vi ngoài dialog nếu hỗ trợ đều phải nhất quán. **Tránh vòng lặp focus:** trả focus về input kích hoạt không được làm dialog tự mở lại ngay. Hủy timer/debounce khi đóng hoặc đổi route; focus không bị timer cũ giành lại. Live region thông báo trạng thái/số kết quả, không đọc lại toàn bộ menu mỗi ký tự.

Mobile dùng vùng cuộn bên trong theo chiều dọc, max-height theo viewport động; input và nút đóng vẫn dễ tiếp cận khi keyboard mở. Không ép độ rộng desktop hoặc chia quá nhiều cột ở 390px. Các target chính nên đủ lớn và không dựa vào hover. Dialog native không thay thế việc test mobile keyboard, scroll lock và focus thực tế.

## 6. Reuse và file sửa tối thiểu

| File hiện có | Thay đổi đề xuất |
| --- | --- |
| `concepts/a.js` | Rút Home; Explore dùng facet/grid-list của pattern B nhưng vẫn là route A; Detail giữ nhiệm vụ quyết định |
| `concepts/a.css` | Bỏ/chỉnh layout của section không còn dùng, căn feature/tile và breakpoints |
| `helpers.js` | Một biến thể card đơn giản thực sự bằng markup; không đổi mọi card B/C chỉ để sửa Home A |
| `index.html`, `base.css`, `app.js` hoặc một file search chuyên trách nhỏ | Một dialog/state machine search, mở/đóng/input/Enter/query route; không backend/service abstraction |
| `verify.mjs` và browser checks khi có runtime | Focus restore, stale query, Enter, loading/empty/error, keyboard/close và filter/load more |

Không cần UI framework, cache/search server hoặc package animation. Tái sử dụng `H.data`, normalize/escape, `H.url`, icon/preview và assets đã có license. A được refinement; B/C giữ để tham chiếu, không tiếp tục phát triển như phương án mới.

## 7. Acceptance cần kiểm

Home chỉ một feature và 3–4 tile, không taxonomy/license/OS/rating dày. Overlay mở từ focus/click, giới hạn gợi ý, query/Enter đúng, close không tự mở lại, stale request không ghi đè, error có retry. Explore giữ query/filter/sort và load-more có trạng thái cuối; Detail vẫn rõ source/giới hạn.

Kiểm desktop1440/tablet768/mobile390, overflow, ảnh vỡ, console, Tab/Shift+Tab/Enter/Escape và reduced-motion bằng browser thật nếu parent thiết lập được. Audit source/DOM stubs không thay visual/keyboard QA. Báo cáo này chỉ cung cấp guidance read-only và kế hoạch refinement, không khẳng định skill hoặc browser đã được cài/test.
