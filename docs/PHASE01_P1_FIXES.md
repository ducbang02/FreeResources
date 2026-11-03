# P01 — Kết thúc ba vấn đề P1

04/11/2026 · **IN PROGRESS — local PASS, chờ kiểm chứng Preview mới.** P02 NOT STARTED; nghiệm thu UI/P01 thuộc chủ dự án.

## Thay đổi và nguyên nhân

| Final Audit | Sửa tối thiểu | Regression |
| --- | --- | --- |
| A1: overlay tìm toàn catalog trong khi Enter giữ filter | API preview dùng cùng URL/phạm vi với kết quả: Search của Explore giữ category/type/platform/sort; Header/Home tìm toàn thư viện. Reset page; preview tối đa4. Query rỗng có filter cũng dùng SQL đã lọc | Hai nhóm SQL tests và browser: bộ lọc cho kết quả rỗng/có kết quả, thứ tự tên, Enter, Escape/focus, header global, page reset |
| A2: caption Detail 4,395:1 | Đổi màu `#687283` thành `#5b6676` trên nền `#f0f4f8`, đo được **5,268:1**, gồm link attribution | Browser đọc computed style ở1440/768/390 và kiểm ngưỡng4,5:1; không phải chứng nhận WCAG toàn site |
| A3: Hero thiếu kích thước trước tải | Thêm kích thước thật của8 ảnh vào manifest hiện có; Hero lấy width/height theo đường dẫn ảnh của resource được DB chọn. Giữ tỷ lệ/layout/font/ảnh | Unit kiểm metadata cho media catalog; Chromium decode8 ảnh; browser giữ response ảnh rồi so geometry trước/sau ở3 widths |

Reuse: dùng URLSearchParams, query/filter SQL hiện có, manifest asset, native img dimensions và Playwright Core đã cài ngoài repo. Không thêm dependency, đổi schema, CI/CD, prototype hoặc thiết kế lại UI. Nguồn/license và attribution giữ nguyên.

## Kết quả local và bằng chứng

| Kiểm tra | Kết quả |
| --- | --- |
| `db:validate`, `db:migrate`, `db:seed` | **PASS**, chỉ local;13 resources/7 types |
| `npm test` | **PASS 25/25**, gồm2 nhóm search regression và1 media regression mới |
| `npm run check` | **PASS**,27 Astro files,0 errors/warnings/hints |
| `npm run build` | **PASS**, Astro SSR/Cloudflare artifact |
| Browser P01 journeys | **PASS 45/45**, Chromium151,1440/768/390,20PNG; navigation/search/filter/detail, keyboard, error/retry/empty, overflow/image loading,0 lỗi console/page bình thường |
| Browser riêng A1/A2/A3 | **PASS 19/19**,3 widths,15PNG. Hero media/phone/curated geometry lệch≤1px trước/sau tải, native dimensions khớp decoded image; ảnh giữ tỷ lệ |
| Baseline Preview cũ | **FAIL có chủ ý 12 checks**, tái hiện cả3 lỗi ở3 widths;7 checks còn lại PASS. Không coi đây là lỗi của bản sửa |

Test scripts nằm trong Git: [SQL tests](../tests/catalog.test.mjs), [media test](../tests/media.test.mjs), [P1 browser runner](../tools/qa-p01-p1.cjs), [P01 journeys](../tools/qa-p01.cjs). Ảnh/raw JSON/log chỉ local, được `.gitignore` bảo vệ: `qa/p01/p1-fixes/{before,local,local-journeys}/`. Các link artifact cần checkout trên máy đã chạy QA; không tải lên GitHub.

Chạy lại bằng Playwright Core sẵn có, không cài dependency vào repo:

```powershell
node tools/qa-p01-p1.cjs D:/Workspace/CloneWebsite/KatTattoo/node_modules/playwright-core http://127.0.0.1:4321 qa/p01/p1-fixes/local
node tools/qa-p01.cjs D:/Workspace/CloneWebsite/KatTattoo/node_modules/playwright-core http://127.0.0.1:4321 qa/p01/p1-fixes/local-journeys
```

## CI/CD đã kết thúc kiểm tra

- **PASS develop → Preview** theo các log/API/browser đã xác minh ở [báo cáo P01](PHASE01_REPORT.md). Bản sửa lần này chỉ push develop sau local PASS; kiểm chứng deployment mới được bổ sung bên dưới.
- **PASS main no-op** một lần qua log Ready43s do chủ dự án cung cấp: `ci:build` báo bỏ qua production, `ci:production` báo không upload/migrate/deploy, build kết thúc thành công16:01:15.010UTC ngày03/11. `BLOCKED` là khóa production có chủ ý. Không gán UUID/SHA cho dòng xanh khi bằng chứng không có.
- Các Failed attempts là lịch sử riêng; không retry thêm. Không đổi cấu hình/token/scripts CI/CD, không push main/merge hoặc phát hành production.

## Giới hạn và nghiệm thu

**SKIP:** thiết bị vật lý, Safari/Firefox, screen reader, field Core Web Vitals/INP và chứng nhận WCAG toàn site. Test Hero là kiểm tra tải ảnh có kiểm soát tại browser; không mô phỏng lỗi D1 cloud. Media mới sau này phải có kích thước chính xác trong manifest; unit test kiểm sự hiện diện, browser kiểm ảnh featured hiện tại. P2 trong Final Audit chỉ là đề xuất, chưa triển khai.

Chủ dự án review: Home ở desktop/mobile giữ phong cách A; Explore có filter rồi tìm kiếm và Enter cho kết quả nhất quán; mở Detail đọc caption/attribution; thử Tab/Shift+Tab/Escape; reload chậm để xem Hero ổn định. Chưa tự ghi UI/P01 DONE hoặc bắt đầu P02.
