# Phase 00.1 — UI/UX Redesign

> Lưu lịch sử P00.1. Sau đó chủ dự án chọn A; [P00.2](PHASE002_REPORT.md) refinement A và có browser QA thật. Khuyến nghị C và browser SKIP bên dưới phản ánh thời điểm P00.1, không phải hướng/trạng thái hiện tại.

Ngày **03/11/2026**, Asia/Bangkok. **READY FOR REVIEW**, chưa nghiệm thu UI. P00 giữ READY FOR REVIEW; **P01 NOT STARTED**.

## Bàn giao và cách xem

1. Mở [prototype-p001/review.html](../prototype-p001/review.html): so A/B/C, Home/Khám phá/Chi tiết, viewport **1440 / 768 / 390px**, một concept hoặc cả ba xếp dọc.
2. Mở [prototype-p001/index.html](../prototype-p001/index.html) để tương tác bình thường. Thanh concept giữ màn/query. Route: `#/A/home`, `#/B/discover`, `#/C/detail/localsend`.
3. Không cần npm/backend/database/account/key. Toàn bộ script/asset local, không fetch, mở file trực tiếp được. HTTP localhost tùy chọn trong SETUP; server chưa chạy trong vòng này.

Iframe có width đúng nhãn, có thể scale cho vừa cửa sổ. Dùng “Mở riêng” cho keyboard/browser tự nhiên. Đây là công cụ xem, không phải screenshot hoặc bằng chứng QA viewport.

## Nghiên cứu trước implementation

[UI research](PHASE001_UI_RESEARCH.md) chẩn đoán bản cũ và chuyển hóa reference. [Editorial](PHASE001_EDITORIAL_RESEARCH.md): Apple.com/App Store/Setapp. [Directory](PHASE001_DIRECTORY_RESEARCH.md): Raycast, Setapp, AlternativeTo/Product Hunt và accessibility. Có primary URLs và ranh giới bằng chứng; không sao chép branding/CSS/layout nguyên bản.

Kết luận: xen chuyện biên tập với list quét nhanh, mô tả theo công việc, hình sản phẩm cạnh thông tin quyết định, tách facet giá/license/platform. Đây là suy luận từ cấu trúc nguồn, chưa là đo giao diện live/usability test. Browser unavailable nên không khẳng định đã quan sát trực tiếp typography/motion/mobile reference.

**Reuse Audit:** bảo toàn P00; reuse ý tưởng normalize/escape/hash và native form/select/dialog. Chung data/helpers, mỗi concept có ba template/CSS riêng. Không framework/icon package/carousel dependency/stack mới. Sites local-only; Context7 không cần vì không tích hợp library. Ponytail để sau theo quyết định đã có.

## So sánh ba phương án

| | A · Editorial Discovery | B · Software & Tools Directory | C · Hybrid |
| --- | --- | --- | --- |
| Home | Search chia cột, mosaic feature/story, app shelf | Rail nhu cầu, task search, feature/shortlist, index/grid | Search cạnh feature, task nav, shelf, quick discovery groups |
| Discover | Filter ngang, cards editorial | Facet rail/disclosure, grid/list | Toolbar, facet rail, grid/list |
| Detail | Ảnh lớn, story, fact sidebar | Identity/CTA/facts trái, ảnh/bài phải | Identity gọn, screenshot/facts song song, navigation nội dung |
| Ưu | Cảm hứng và nhận diện sản phẩm, hợp biên tập | Quét nhanh, thu gọn catalog lớn, so thông tin | Cân bằng thẩm mỹ và tìm kiếm đa nhu cầu |
| Nhược | Nhiều biên tập, mobile cuộn dài, feature dễ lấn catalog | Density dễ giống dashboard | Nhiều module, cần ưu tiên và tránh lặp tài nguyên |

**Khuyến nghị C để cân nhắc**: feature/search cùng vùng, lối vào công việc và catalog ở gần. Đây là đánh giá cấu trúc/coverage; chưa chứng minh C thắng usability/thị giác. A/B bàn giao đầy đủ, chủ dự án chọn.

## Nội dung và assets

- **19 fixture** tên/URL thật; giá/platform/license/mô tả cần review trước catalog thật. Rating/count mẫu có nhãn phiếu mẫu, không dữ liệu thì chưa có đánh giá. Không testimonial/quy mô production giả.
- **3 icon chính chủ, 3 screenshot nguồn, 1 artwork Excalidraw**. Giữ ảnh LocalSend mobile trong pack, layout ưu tiên screenshot desktop/Godot theo nội dung. Workflow khác là sơ đồ nguyên bản có caption, không phải UI sản phẩm.
- [Asset audit](PHASE001_ASSETS.md), [manifest/hash](../prototype-p001/assets/manifest.json), bốn license và credits giữ nguồn/attribution. Asset+notice dưới 1 MB; không ảnh/branding Apple/Setapp/Raycast.
- Mục chưa có asset rà quyền dùng category symbol riêng, không emoji/nhái logo. Không chạy/cài source/installer giới thiệu.

## Hành vi prototype

- Search dấu/không dấu/đ/alias; facets nhu cầu/type/platform/price; sort tên/weighted rating mẫu; empty/reset.
- Hash navigation/detail của19 fixture, concept switch giữ route/query; B/C grid-list, C quick groups.
- Save/unsave và saved page chỉ trong phiên; reload mất, không database/localStorage.
- Đóng góp mở dialog, validate HTTPS/không credential/mô tả, preview text không gửi/lưu/fetch; report feedback demo. Không login/download/vote giả.
- Responsive1440/768/390, reduced motion, focus-visible, skip link, native controls/labels/status có trong code. Có code không đồng nghĩa đã kiểm bằng browser.

## Validation

| Kiểm tra | Kết quả | Phạm vi |
| --- | --- | --- |
| Context/source/reuse, nghiên cứu trước HTML/CSS | PASS | Không đổi kiến trúc/bootstrap P01 |
| Cú pháp tất cả JS | PASS | Node --check, không phải browser console |
| `node prototype-p001/verify.mjs` | PASS | **19 nhóm,63 template**:3 home,3 discover,57 detail; helpers thật, Node VM/DOM stubs |
| Search/filter/sort/route/save/form/menu/quick groups | PASS mock | Escape/alias/facets/empty/deep link/giữ filter-view/dialog feedback/state-focus callbacks |
| HTML parser | PASS static |63 template có1 H1/main, IDs/labels/alt/assets, không nested anchor/button/form/dummy href |
| Asset/source integrity | PASS | Hash/bytes manifest, local links; không network dependency |
| Bảo toàn P00 | PASS | SHA-256 cả4 file prototype cũ giữ nguyên |
| Browser desktop1440 | **SKIP** | Browser access host unavailable |
| Tablet768 / mobile390 | **SKIP** | Chưa đo reflow/overflow/crop/tap thật |
| Browser navigation/search/filter | **SKIP** | Mới mock/static, chưa browser journey |
| Console / keyboard / assistive technology | **SKIP** | Node syntax/callback không thay kiểm thật |
| Screenshot A/B/C | **SKIP — không tạo** | Ảnh nguồn không phải screenshot UI prototype |
| Backend/cloud/AI/auth/DB/deploy | **SKIP theo scope** | Không resource/paid API/DNS/production |

`cua.getState()` trả apps/browsers rỗng, native pipe/browser access host unavailable. Không cài browser hoặc tạo screenshot giả. Không coi UI đạt nghiệm thu từ mock/static.

Review độc lập dùng helpers thật còn kiểm84 route. Đã sửa callback row mất `this` ở B; alias “chuyển file”; nhóm học miễn phí khớp metadata; menu Escape reset accessible label; compact panels/metadata và caption artwork/screenshot. Chỉnh layout từ source vẫn cần review trực quan.

## Review thủ công

1. Home1440 A/B/C: tài nguyên có hiện sớm không, hình/search có hấp dẫn và rõ hành động không.
2. Chuyển768/390: tràn chữ/ảnh, menu/filter, giá/license/CTA, thử zoom200%.
3. Tìm chuyển file, lọc Windows, mở LocalSend/nguồn. Tìm PDF, thử query vô nghĩa/reset, grid-list B/C, back/refresh deep link.
4. Tab/Shift+Tab, Enter/Space/Escape; focus, menu/dialog, reduced motion. Mở riêng để kiểm luồng tự nhiên.
5. Save/unsave; đề xuất URL sai/đúng có feedback minh họa, không giả gửi lên hệ thống.
6. DevTools console, ảnh vỡ, viewport; chụp từng concept khi browser hoạt động, không dùng source screenshot thay QA.

## File và ranh giới

Tạo prototype-p001: index/review HTML, base/review CSS, data/helpers/app/review JS,6 file concept, verify.mjs, CONTRACT, assets/licenses/manifest. Tạo5 báo cáo UI/editorial/directory/assets/bàn giao. Cập nhật DESIGN_SYSTEM, DECISIONS, PROJECT, ROADMAP, TASKS, README, SETUP.

Prototype P00 và quyết định kỹ thuật giữ nguyên. Không có `.git`, status/branch trả not a git repository; không branch/commit/push. Không cloud resource/deploy.

**Dừng tại P00.1 READY FOR REVIEW. Chờ chủ dự án chọn UI; không bắt đầu P01.**
