# P01 — Kết thúc ba vấn đề P1

04/11/2026 · **P01 READY FOR REVIEW — ba P1 đã sửa, local và Preview PASS.** P02 NOT STARTED; nghiệm thu UI/P01 thuộc chủ dự án.

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

## Preview mới đã kiểm chứng

Code commit **`9a2f73205f38e696c02c784e9fdc1bf622e03743`**, push bằng sunny251010 lên develop, gồm cả checkpoint dọn QA artifacts `1717bad`. Các tài liệu Final Audit chưa commit trước đó đã được giữ và đưa vào checkpoint. Commit bàn giao tiếp theo chỉ cập nhật tài liệu kết quả, không đổi source/runtime/CI.

| Kiểm tra cloud | Kết quả và bằng chứng |
| --- | --- |
| Workers Builds | **PASS**: [build94f3c52b](https://dash.cloudflare.com/4ca521c6746d874c049fd829121ab59e/workers/services/view/digital-resource-hub-staging/production/previews/develop/builds/94f3c52b-e2e2-49ff-be13-d09e99b7cebf), GitHub Check Run126103629090 báo `completed / success` với head_sha đúng9a2f732. Bản đọc lại local: `qa/p01/p1-fixes/github-build.json` |
| Deployment | **PASS**: API trả deployment `cb15215f-93db-4a88-a065-5fa644b4425c`, tag9a2f732, repository đúng ducbang02/FreeResources, tạo17:58:44UTC03/11 (=00:58:44UTC+7 ngày04/11). Bản đọc lại: `qa/p01/p1-fixes/cloud-verified.json` |
| Identity/bindings | **PASS**: account `4ca521c6746d874c049fd829121ab59e`, Worker `digital-resource-hub-staging`/ID0540bcf9fa6448d6843935471fe0265c; đúng3 bindings: DB `e28f4099-92cf-40bc-ab8c-c47138b4469d`, ASSETS, APP_ENV=staging |
| Browser P01 | **PASS 45/45**,1440/768/390,20PNG,0 console/page errors bình thường. `qa/p01/p1-fixes/cloud-journeys/results.json` |
| Browser A1/A2/A3 | **PASS 19/19**,1440/768/390,15PNG: overlay/results cùng filter, header global, caption/link5,268:1, Hero geometry ổn định và đúng tỷ lệ. `qa/p01/p1-fixes/cloud/results.json` |
| Production safeguards | **PASS** readback trước/sau: parent deployed_on=null, workers.dev disabled, vẫn1 bootstrap version. Main remote giữ `31d3053bdfd38298c467dd61ef66a571d1f8f150`. Không pushmain, merge, upload/migrate/deploy production, đổi DNS hoặc cấu hìnhCI |
| Đọc full build log trực tiếp | **SKIP**: OAuth không có quyền Builds API; Computer Use helper lỗi khởi tạo hai lần. Trạng thái build thành công được xác nhận độc lập qua GitHub Check Run, deployment API và browser, không suy từ local PASS |

Preview: **https://develop-digital-resource-hub-staging.nguyenducbang-uit.workers.dev**.

So sánh Hero trước tải (px): desktop1440 từ24→425,703 trước sửa, nay425,703→425,703; tablet768 từ24→216,25, nay216,25→216,25; mobile390 từ4→190,156, nay190,156→190,156. Trước/sau full ảnh tải giữ nguyên bố cục. [Ảnh mobile trước tải cũ](../qa/p01/p1-fixes/before/hero-pending-390.png), [trước tải đã sửa trên cloud](../qa/p01/p1-fixes/cloud/hero-pending-390.png), [sau tải cloud](../qa/p01/p1-fixes/cloud/hero-loaded-390.png). Ảnh/raw evidence chỉ local, không tracked.

## File thay đổi

- App: `src/scripts/interactions.ts`, `src/pages/api/search.ts`, `src/lib/catalog.ts` (search); `src/styles/base.css` (caption); `src/pages/index.astro`, `public/assets/manifest.json` (Hero dimensions).
- Regression: `tests/catalog.test.mjs`, `tests/media.test.mjs`, `tools/qa-p01-p1.cjs`.
- Tài liệu hiện hành: PROJECT/README/ROADMAP/SETUP/TASKS, DECISIONS, DESIGN_SYSTEM, PHASE01_REPORT/CLOUD_CONNECTION/PREVIEW_RUNBOOK, Final Audit và báo cáo này. Không bỏ phần P02 preparation chưa được duyệt.

## Giới hạn và nghiệm thu

**SKIP:** thiết bị vật lý, Safari/Firefox, screen reader, field Core Web Vitals/INP và chứng nhận WCAG toàn site. Test Hero là kiểm tra tải ảnh có kiểm soát tại browser; không mô phỏng lỗi D1 cloud. Media mới sau này phải có kích thước chính xác trong manifest; unit test kiểm sự hiện diện, browser kiểm ảnh featured hiện tại. P2 trong Final Audit chỉ là đề xuất, chưa triển khai.

Chủ dự án review: Home ở desktop/mobile giữ phong cách A; Explore có filter rồi tìm kiếm và Enter cho kết quả nhất quán; mở Detail đọc caption/attribution; thử Tab/Shift+Tab/Escape; reload chậm để xem Hero ổn định. Chưa tự ghi UI/P01 DONE hoặc bắt đầu P02.
