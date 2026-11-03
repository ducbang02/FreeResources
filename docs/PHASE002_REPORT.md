# P00.2 — Design refinement & development tooling

Ngày **03/11/2026**, Asia/Bangkok. **READY FOR REVIEW**. Chủ dự án chọn **A — Editorial Discovery làm hướng chính**, chưa nghiệm thu UI A. P01 **NOT STARTED**; không backend/AI thật/cloud/deploy/push.

## Xem bản bàn giao

- [Mở prototype A](../prototype-p001/index.html): mặc định vào A. Route `#/A/home`, `#/A/discover`, `#/A/detail/localsend`.
- [Khung review](../prototype-p001/review.html): A là mặc định; B/C giữ tham chiếu, không phát triển thêm. Có link thử lỗi search mô phỏng.
- [20 screenshot browser thật](../qa/p002/index.html) và [kết quả QA JSON](../qa/p002/results.json).
- [Audit bốn skill/MCP](PHASE002_TOOLING_AUDIT.md) và [design guidance đã tham khảo](PHASE002_DESIGN_GUIDANCE.md).

Mở file HTML trực tiếp, không cần install/key/backend; đường file:// đã được kiểm bằng browser. Khung iframe chỉ là công cụ review, còn PNG trong gallery là screenshot thực tế của bản A P00.2.

## Những gì đã tinh giản

| Màn hình | Nhiệm vụ | Thay đổi |
| --- | --- | --- |
| Home | Hiểu website và có điểm bắt đầu | Intro ngắn cho học/giảng dạy/làm việc, search lớn, **một feature LocalSend**, **bốn tile** Excalidraw/Godot/LibreOffice/OBS, một lời mời đóng góp/khám phá |
| Search preview | Tìm nhanh | Native dialog mở từ focus/click, gợi ý nhỏ, kết quả tối đa4, Enter tới catalog, close/Escape/focus đúng |
| Explore | Duyệt và thu gọn catalog | Filter rail/disclosure theo pattern directory, grid/list, sort tên/biên tập, xem8 →16 →19, giữ query/filter |
| Detail | Tìm hiểu và quyết định | Giữ screenshot, nguồn, công dụng, giới hạn, OS/price/license và lưu trong phiên |

Home bỏ các story phụ, taxonomy, nhiều shelf học/văn phòng/repo và collections; không hiện license/OS/tag/rating trên tile. A không hiển thị điểm rating fixture như đánh giá thật, kể cả Detail: chưa có đánh giá thực. Dữ liệu catalog vẫn là fixture có tên/URL thật, cần audit nội dung trước publication.

Logo/icon/screenshot reuse từ asset đã kiểm nguồn và license. Không tải thêm artwork, không copy Apple. Chỉ sửa A và shared helpers theo nhánh A; source b.js/b.css/c.js/c.css giữ nguyên. Prototype P00 cũ và quyết định Astro/TypeScript + Workers/D1 giữ nguyên.

## Search overlay

- Default:3 gợi ý công việc,3 nhu cầu phổ biến,2 công cụ nổi bật. Lịch sử tối đa3 query **trong bộ nhớ phiên**, có xóa; không localStorage/account.
- Nhập từ: trạng thái loading có feedback trong dữ liệu mẫu; debounce160ms, cancel timer khi đóng/đổi query/route. Preview tối đa4 kết quả có icon/tên/mục đích, link xem toàn bộ.
- Empty giữ đường tìm lại. Error là **mô phỏng có chủ đích**, retry hoạt động; không giả lỗi backend thật. Thử qua `#/A/home?qa=search-error`, mở search và nhập một từ; hoặc seam QA `HUB_SEARCH_TEST.failNext()`.
- Modal dùng link/button thường, không giả role combobox/listbox khi chưa có semantics arrow navigation. Tab/Shift+Tab được giữ trong dialog; Escape đóng ngay cả khi input search có text; trả focus không làm mở lại. Mobile có vùng cuộn nội bộ và close/input luôn truy cập được.
- Không fetch/search service/API thật, không thông điệp được gửi ra ngoài. History/query không persist qua reload.

## Tooling: có gì, đã cài gì?

**Không cài mới công cụ nào và không sửa config global/AGENTS.**

| Công cụ | Trạng thái chính xác | Quyết định |
| --- | --- | --- |
| Context7 MCP | Có sẵn, resolve/query đã chạy thật | Giữ, không thêm bản thứ hai |
| Playwright local | Reuse playwright-core1.62.0 + Chromium151.0.7922.34 đã có, launch và QA thật PASS | Dùng cho QA vòng này; package là dev tooling, không runtime website |
| UI UX Pro Max | Chỉ đọc official SKILL/quick-reference/pro-rules/installer source; chưa cài/chạy CLI hoặc search.py | Guidance đã được áp dụng có đánh giá; user-level install chỉ sau duyệt scope/version |
| Microsoft Playwright MCP | Chưa cài/handshake, không namespace đang hoạt động | Chưa cần để thực hiện browser QA đã có local fallback |
| Chrome DevTools MCP | Chưa cài/test server | Hoãn tới khi cần performance trace/debug riêng, tránh trùng công cụ |

Environment: Codex CLI0.162.1, VS Code1.144.0, extension26.51021.22027, Node24.18.0/npm12.2.0/Python3.13.15. Windows runtime báo NT10.0.26200.0; CIM đọc marketing edition bị AccessDenied, không xin thêm quyền để ép đọc. Chrome/Edge có sẵn; QA dùng Chromium cache. CUA vẫn thiếu host; node_repl import wrapper lỗi export. **Lỗi của hai đường đó không có nghĩa Playwright local không chạy.**

Fallback reuse package từ một node_modules hiện có, chỉ đọc thư viện published Playwright, không copy source ứng dụng dự án khác. Đường package nằm ngoài repo nên khả năng tái chạy trên máy mới phụ thuộc package/binary; hướng dẫn tham số trong SETUP. Không auto npm install/download.

Audit có primary links/license/maintenance/Windows requirements/cost/permission và proposal install chưa chạy. UI UX installer hiện có thể thêm sáu sibling skills, overwrite/cleanup legacy khi dùng force; không chạy bootstrap chỉ vì có dry-run. Không cần những thay đổi đó để hoàn tất P00.2. Nếu cài user/global/MCP/new permission/paid service ở bước sau, phải xin duyệt trước theo brief.

## Validation thực tế

| Hạng mục | Kết quả | Bằng chứng / giới hạn |
| --- | --- | --- |
| Read-only environment + official tool/source audit | PASS | Không install/config/credential mutation |
| JS syntax / VM regressions | PASS | `node prototype-p001/verify.mjs`:19 nhóm,63 template A/B/C; không thay browser |
| Browser **1440×900,768×1024,390×844** | **PASS —45 checks** | Playwright local/Chromium, fresh contexts, không profile đăng nhập |
| Home composition/first resource | PASS |1 feature/4 tile; feature bắt đầu~380px desktop, ảnh/CTA trong viewport |
| Focus/click/Tab/Shift+Tab/Enter/Escape/close | PASS browser | Modal focus vòng, trả focus, không tự mở lại; menu tablet/mobile |
| Loading/results/empty/error/retry/latest query | PASS browser | Explicit local simulation, giới hạn preview và hủy kết quả cũ |
| Search/filter/grid-list/sort/load-more | PASS browser | Giữ query/filter; kết thúc ở19 fixture, không button giả |
| Overflow/broken images/console/pageerror | PASS tại các màn kiểm | Không tràn ngang/ảnh lỗi;0 console error/pageerror |
| Reduced motion | PASS browser | Computed transition duration về0s khi emulate reduce |
| Direct file:// + viewport390×480 | PASS bổ sung | Dialog nằm trong viewport, có cuộn nội bộ, cap4 kết quả, nút đóng; không thay kiểm soft keyboard vật lý |
| Screenshot | PASS |20 PNG browser thật; đã xem ảnh Home1440/768/390, overlay390 và Explore/Detail390, rà lại contrast chữ overlay |
| Physical iOS/Android, keyboard ảo, screen reader, full WCAG | **SKIP** | Chưa thiết bị/AT; không tuyên bố chứng nhận accessibility đầy đủ |
| MCP mới / UI UX installed skill | **SKIP** | Không cài hoặc handshake, không gọi là đã hoạt động |
| Backend/auth/AI/Cloudflare/deploy | **SKIP theo scope** | P01 chưa bắt đầu |

Các lỗi do browser phát hiện đã sửa: Tab ở cuối modal từng rời nội dung; Escape đầu tiên bị input search dùng để xóa query thay vì đóng. Thêm guard focus và Escape có mục đích rồi chạy lại PASS. Ảnh được decode/đợi paint trước capture để tránh ảnh trống tạm thời. Review độc lập phát hiện ba màu text nhỏ chưa đủ4.5:1, đã làm tối; đây là rà chọn mẫu, không full WCAG audit.

Lệnh đã chạy từ workspace:

```powershell
python -m http.server 4175 --bind 127.0.0.1 --directory prototype-p001
node tools/qa-p002.cjs D:\Workspace\CloneWebsite\KatTattoo\node_modules\playwright-core
node prototype-p001/verify.mjs
```

HTTP server chỉ phục vụ QA local và được dừng khi bàn giao. Mở index.html trực tiếp vẫn hoạt động. Browser contexts/process của QA đã đóng trong finally. Script dùng path package được truyền vào, không tự tải dependency.

## File và nghiệm thu

Sửa A a.js/a.css; helpers/app/index và review hiện có. Thêm search.js/search.css, favicon nguyên bản, dev script `tools/qa-p002.cjs`, evidence `qa/p002/`; cập nhật docs/trackers chuẩn. Không file B/C mới, không package/lockfile hoặc hạ tầng mới; chưa Git repository nên không branch/commit/diff/push.

Tiếp theo: chủ dự án xem **Home A và search overlay**, phản hồi/duyệt P00.2. Tool installation là quyết định riêng có scope/approval, hiện không chặn QA. Chỉ bắt đầu P01 khi có lệnh rõ ràng sau nghiệm thu.

**P00.2 READY FOR REVIEW — DỪNG.**
