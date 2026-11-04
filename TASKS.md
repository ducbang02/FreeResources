# TASKS — Checklist có thể nghiệm thu

> Cập nhật P01 ngày 04/11/2026. Các log P00/P01 cũ bên dưới giữ ý nghĩa lịch sử. Dùng một tracker này; tick chỉ cho phần đã có bằng chứng, không thay thế nghiệm thu của chủ dự án.

## Trạng thái chung

- Phase hiện tại: **P01 / READY FOR REVIEW**; ba P1 đã sửa và kiểm local/Preview ở1440/768/390. Account đúng `4ca521c6746d874c049fd829121ab59e`. Main live no-op PASS theo log Ready43s; không retry lịch sử. [Kết quả mới nhất](docs/PHASE01_P1_FIXES.md).
- Source: app Astro SSR/TypeScript + D1, catalog thật, local CLI; chưa auth/rating/submission/AI thật. Prototype tĩnh giữ làm lịch sử.
- Cloudflare: build7de0b863 tại508a96c PASS; push31d3053 tự cập nhật Preview,45 browser checks+5 smoke checks PASS/20PNG/0 lỗi bình thường, đúng Worker/DB. Main aa369850 timeout trước clone; parent vẫn chưa active deployment, workers.dev tắt. Production chưa triển khai.
- Owner mặc định: An quyết định sản phẩm, Codex triển khai khi được giao; cần cập nhật phân công thực tế.
- Git: repo public `ducbang02/FreeResources`, tác giả/push `sunny251010` được duyệt; main đã fast-forward31d3053 riêng theo quyền kiểm no-op, develop có app/QA và checkpoint tài liệu bàn giao (xem git log). Không pushmain thêm hoặc cấp quyền production. Log chưa có Git của P00 là lịch sử.

## P00 — Discovery và chốt hướng

- [x] P00-01 — Đã đọc toàn bộ tài liệu ban đầu; inventory chỉ có planning kit, không source/config/deps/Git.
- [ ] P00-02 — Chốt Q-01 → Q-06, cập nhật sổ quyết định; tách AGREED và PROPOSED.
- [x] P00-03 — Nghiên cứu reuse/tool, license/maintenance/compatibility/cost tại `docs/PHASE00_REUSE_AUDIT.md` và `docs/PHASE00_TECH_VALIDATION.md`; không cài dependency/plugin.
- [ ] P00-04 — Lập danh mục taxonomy v1 (type, audience, category, tags, OS, license/price) dựa vào 30–50 tài nguyên mẫu thật.
- [x] P00-05 — Policy/schema đề xuất đã ghi ở báo cáo P00/reuse/architecture; chưa triển khai hoặc chốt SLA/người vận hành.
- [ ] P00-06 — Phác 2–3 UI direction, test mockup trang chủ/list/detail/mobile; An chọn.
- [ ] P00-07 — Kiểm định (spike) Astro/Workers/D1/GitHub API/Gemini khi cần; ghi version, quota và test thật.
- [x] P00-08 — Docs quota và ví dụ tính row-read, rủi ro SSR Free, budget/gate nâng cấp có trong tech report; chưa benchmark hoặc kiểm hóa đơn thật.
- [x] P00-09 — Báo cáo P00 tại `docs/PHASE00_REPORT.md`; sẵn sàng An review, chưa chuyển DONE.

Ghi chú các task còn mở: P00-02 đã chốt Q-01/Q-06 về scope và hướng kỹ thuật, các câu hỏi khác còn mở; P00-04 có taxonomy và 30 candidate để review, chưa phải 30 tài nguyên đã audit nội dung/license đầy đủ; P00-06 chưa được chấp nhận A/B, chờ brief thiết kế tiếp; P00-07 runtime spikes **SKIP** có lý do ở tech report.

Phản hồi chủ dự án 03/11/2026: đã xem A, nhận xét quá trống trải/thiếu điểm nhấn/chưa đạt chất lượng. Chỉ ghi nhận, không sửa prototype hoặc tự thiết kế lại; giữ cả A/B. **Browser/mobile QA thật chưa thực hiện.** P00 READY FOR REVIEW, P01 NOT STARTED; chờ chốt UI và lệnh bắt đầu P01. Ponytail để sau, chưa cài; tiếp tục Reuse Ladder/Ponytail Principle trong AGENTS.md.

## Log xác minh P00 — local, 03/11/2026

- **PASS:** `rg --files`, đọc UTF-8 toàn bộ planning docs; kiểm kê source/config/manifest; `node --version`, `python --version`, `git --version`.
- **PASS docs-only:** Context7 resolve/query + official web nguồn cho Astro/D1, Pagefind, Better Auth, AI SDK; license/release/quota, 30 candidate chưa được duyệt.
- **PASS:** `node --check prototype/app.js` (lần cuối sau sửa handler). Node VM + DOM stubs chạy 12 checks: home, normalize dấu/đ, filter kết hợp, empty/unknown detail, escape query, deep link/render lại B, search submit, URL demo rejection, draft/XSS escape, review gating, menu/Escape và ví dụ ranking.
- **PASS regression:** Node VM cuối kiểm template bốn route có 1 H1/ID không trùng, search/escape, valid import → invalid source ẩn draft cũ/reset review, skip link focus main. Đây không phải trình duyệt; không xác minh layout, native form validity hoặc hash history bằng browser thật.
- **PASS static:** Python `HTMLParser` kiểm `index.html`/`review.html` IDs và asset paths; kiểm toàn bộ local Markdown links; CSS có responsive/focus/reduced-motion; không `fetch`/XHR/WebSocket trong app.js. Review sheet có iframe viewport 390px, chưa render QA.
- **FAIL đã xử lý trong harness:** lần Node VM đầu dùng pipe PowerShell làm hỏng literal tiếng Việt; chuyển assertion/harness sang ASCII + Unicode escape rồi chạy lại PASS. Không phải lỗi nội dung UTF-8 của prototype.
- **FAIL nguồn truy cập:** Gemini docs redirect lỗi tool; 3 candidate landing pages lỗi và 4 empty; không kết luận app/website hỏng. Xem reuse audit.
- **SKIP browser:** `cua.getState()` trả apps/browsers rỗng, native pipe/browser access host unavailable. Desktop/mobile390, screenshot, keyboard/console/a11y thật chưa kiểm.
- **SKIP runtime/cloud:** chưa có package để build/lint/typecheck; Astro/workerd/D1 migration/restore/auth/Gemini không chạy. Không install, secrets, deploy, production, DNS hoặc paid API.
- **Git:** `git status --short` và `git branch --show-current` fail vì không có `.git`; branch/commit/remote không có. Không commit/push.
- **Review thủ công:** thống nhất type đa nhãn giữa architecture/schema, Bayesian cho 1–5 sao, phân biệt AGREED/PROPOSED, xóa CSS lặp. Không dùng Ponytail vì chưa có plugin; câu hỏi thiết lập đã gửi, không chặn P00.
- **Gate cập nhật:** scope catalog và hướng stack P01 đã được duyệt; UI chưa được chấp nhận, chờ brief vòng thiết kế tiếp và lệnh bắt đầu P01. P00 READY FOR REVIEW, P01 NOT STARTED.

## P00.1 — UI/UX redesign (READY FOR REVIEW)

- [x] P00.1-01 — Đọc context/source, kiểm Git/tool; giữ hướng kỹ thuật và hash4 file prototype cũ.
- [x] P00.1-02 — Nghiên cứu Apple.com/App Store/Setapp/Raycast + directory và accessibility trước HTML/CSS; nguồn và giới hạn trong `docs/PHASE001_UI_RESEARCH.md` cùng hai nghiên cứu chuyên đề.
- [x] P00.1-03 — Ba concept A Editorial/B Directory/C Hybrid có home, discover, detail; CSS1440/768/390 và review iframe. Chưa khẳng định đã render QA.
- [x] P00.1-04 — Data/helpers dùng chung, search/filter/navigation/empty, grid-list B/C, quick groups C, save và contribution/report demo có feedback; không backend/API.
- [x] P00.1-05 — Asset nguồn/rights/manifest/license/credits;19 fixture ghi nhãn, rating có số phiếu mẫu, không dữ liệu giả thành production.
- [x] P00.1-06 — Node syntax + `node prototype-p001/verify.mjs`:19 nhóm/63 template PASS; HTMLParser/links/assets/hash P00 PASS. Review độc lập84 routes, lỗi tích hợp đã sửa.
- [x] P00.1-07 — Kiểm khả năng browser: CUA host/native pipe unavailable; ghi **SKIP** desktop1440/tablet768/mobile390, console/keyboard/flow thực tế và screenshot; có hướng dẫn review thủ công.
- [x] P00.1-08 — Bàn giao `docs/PHASE001_REPORT.md`, cập nhật design/decisions/docs; khuyến nghị C từ cấu trúc, không thay chủ dự án chọn.
- [ ] P00.1-09 — Chủ dự án xem và chọn/duyệt UI. Không tự chuyển DONE/P01.

Validation log P00.1: Node24 local, không Git branch/commit; file mới nằm `prototype-p001/`, P00 giữ nguyên SHA-256. PASS là nghiên cứu/logic/static và callback bằng DOM stubs, **không phải browser QA**. Không screenshot UI được tạo; ảnh app nguồn không thay screenshot QA. Không server chạy, không install/deploy/cloud/paid API. Chi tiết lệnh/giới hạn ở báo cáo P00.1.

## P00.2 — A refinement & tooling (READY FOR REVIEW)

- [x] P00.2-01 — Đọc brief/context/source/tool audit, ghi chọn A hướng chính chưa nghiệm thu; giữ kiến trúc.
- [x] P00.2-02 — Audit4 skill/MCP theo nguồn/license/maintenance/install/permission/cost/Windows; không global install/config, UI UX source-only.
- [x] P00.2-03 — Home A1 feature/4 tile/intro-search/CTA, bỏ taxonomy/thông số/rating dày; B/C code giữ nguyên.
- [x] P00.2-04 — Search native dialog default/loading/results/empty/error/retry, cap4/history3 trong phiên, focus/click/Tab/Escape/Enter/cancel stale.
- [x] P00.2-05 — Explore A filter/grid-list/sort/load-more8→16→19; Detail facts/nguồn, không fake rating thật.
- [x] P00.2-06 — Playwright local1.62/Chromium151:45 browser checks PASS1440/768/390;0 console/pageerror, không tràn/ảnh lỗi;20 screenshot. File:// và390×480 proxy PASS bổ sung.
- [x] P00.2-07 — VM regression19 nhóm/63 template PASS; cập nhật docs và `qa/p002/index.html`, `results.json`; physical mobile keyboard/AT SKIP.
- [ ] P00.2-08 — Chủ dự án nghiệm thu UI. P01 chưa bắt đầu; không tự DONE.

Log P00.2: Context7 đã có resolve/query PASS; local Playwright binary/package reuse, không mới cài. CUA thiếu host/node_repl import lỗi wrapper nhưng shell fallback chạy thật. Sửa lỗi browser phát hiện: Tab cuối dialog, Escape search-input, paint ảnh trước capture; làm tối ba màu text overlay theo review. Server local4175 đã dừng, browser contexts đóng. Không active MCP/skill install/config/AGENTS mutation, backend/cloud/paidAPI/deploy/push. Báo cáo `docs/PHASE002_REPORT.md` và tooling audit; các SKIP P00/P00.1 giữ ý nghĩa lịch sử.

## P00.3 — Visual simplification (READY FOR REVIEW)

- [x] P00.3-01 — Đọc context/reuse source, chụp 6 ảnh trước ở 1440/768/390; lưu SHA-256 P00 và B/C để kiểm scope.
- [x] P00.3-02 — Hero nền full-width, nội dung max1240px, headline hai dòng, ảnh LocalSend desktop/mobile đúng tỷ lệ; bỏ intro/mô tả/helper search dư.
- [x] P00.3-03 — Hai card visual Excalidraw/Godot có icon thật, link toàn khối và một dòng mô tả; không fake rating/metadata dày. A Excalidraw derivative thêm viewBox, original giữ nguyên.
- [x] P00.3-04 — Noto Sans Latin/Vietnamese self-host 50.276 bytes, OFL/provenance/hashes/credits; body16/nav15, Detail metadata14–16; font thực ở400/500/600/700 và fallback PASS.
- [x] P00.3-05 — Giữ overlay P00.2: focus/click/Tab/Shift+Tab/Escape/Enter, loading/results/empty/error/retry, full search/filter/load-more; attribution ở Detail/credits.
- [x] P00.3-06 — 68 browser checks PASS (45 luồng +23 riêng P00.3), Chromium151 thật1440/768/390; 0 console/pageerror bình thường, 29 PNG gồm trước/sau/fallback/viewport thấp. File:// PASS.
- [x] P00.3-07 — VM19 nhóm/63 template PASS, SHA-256 P00/B/C không đổi, gallery/design/decisions/report/tracker cập nhật. Không dependency lớn/global install/config.
- [ ] P00.3-08 — Chủ dự án nghiệm thu UI. Dừng tại READY FOR REVIEW; P01 NOT STARTED.

Log P00.3: reuse HTML/CSS/native dialog, asset đã audit, Playwright Core1.62/Chromium151 có sẵn. Source-only UI UX guidance, không cài skill/MCP. Có lane font/license và review độc lập; placeholder contrast đã làm tối. Probe CDP đầu thiếu CSS.enable và assertion MIME WOFF2 ban đầu không phù hợp Python server Windows, đã sửa harness rồi chạy lại PASS; font thực đã render. MIME local application/octet-stream được ghi rõ, không suy ra cấu hình production. Font bị chặn là failure simulation có chủ đích. Physical iOS/Android/software keyboard/AT/Safari/Firefox SKIP. Chi tiết `docs/PHASE003_REPORT.md`, evidence `qa/p003/index.html`. Server local đã dừng sau QA, browser đóng; không Git repo/commit/push/backend/cloud/deploy/P01.

## P01 — Foundation, catalog & GitHub → Cloudflare (READY FOR REVIEW)

- [x] P01-01 — Đọc context/reuse, pin Astro7.4.5/adapter14.4.4/Wrangler4.156.2/TS6; Git develop và baseline c862af9.
- [x] P01-02 — D1 schema/versioned migration/FTS5/indexes,13 tài nguyên/7 loại/17 nguồn; local migrate/seed/restore/rollback PASS.
- [x] P01-03 — Nguồn official, nhiều category/tag, stable ID/slug/canonical unique; unknown ẩn, không rating giả.
- [x] P01-04 — Astro SSR P00.3 Home/Explore/Detail, Noto Sans, featured/taxonomy từ DB, overlay API thật, facets/sort/pagination/grid-list, SEO/noindex/sitemap.
- [x] P01-05 — Local JSON validator/SQL importer; không public admin/auth/AI.
- [x] P01-06 — Typecheck0errors, local build và dry-run,22 tests,45dev +45built Worker browser checks1440/768/390,40PNG;0 lỗi console bình thường.
- [x] P01-07 — Repo ducbang02/FreeResources hiện public; sunny251010 có quyền push, được chủ dự án duyệt. App ddae9fe và đính chính ace99a1 đã push main/develop.
- [x] P01-08 — OAuth dự án thành công, whoami đúng account đích; Worker/D1 staging đã tạo và đọc lại. D1 13 tài nguyên/17 nguồn/FK 0/FTS LocalSend PASS. Hai tài nguyên tạo nhầm đã xóa theo yêu cầu và GET trả 404; proof tại qa/p01/ctcm-cleanup.json.
- [x] P01-09 — Một Workers Builds pipeline: guard source/artifact/branch/commit/DB, main build và production deploy no-op;9 nhóm guard tests PASS.
- [x] P01-10 — Kết nối GitHub/Workers Builds đúng account/repo/token và main no-op được đọc qua ảnh Dashboard; build7de0b863 PASS, API Preview khớp tag508a96c. Builds API OAuth403 còn là giới hạn đọc log, không chặn pipeline CI.
- [x] P01-11 — Develop508a96c→Preview thật:45 browser checks/20PNG PASS; push31d3053 tạo deployment ID mới cùng URL/DB,5 smoke checks PASS. Không deploy thủ công ứng dụng.
- [x] P01-12 — Báo cáo/luồng/galleries/evidence cập nhật; READY FOR REVIEW cho Preview, chờ chủ dự án nghiệm thu. Main safeguards và một lần live no-op PASS theo log mới chủ dự án; các Failed attempts giữ riêng. Không P02/production.

Artifact staging từ account sai đã hủy. Artifact đúng account/D1 đã build và kiểm generated config PASS top-level/Preview; dry-run PASS, gzip173.80KiB. CI đã deploy Preview develop thật, không KV/Images tự phát sinh. Node24.18.0/npm12.2.0 đã pin; main no-op, chỉ develop được Preview. [Cloud proof](qa/p01/cloud-preview.json), [auto-update](qa/p01/cloud-auto-update.json), [main proof](qa/p01/main-protection.json).

Log P01 ngày03/11/2026: local,CI develop,cloud D1/browser/auto-update PASS. Main aa369850 init FAIL là lịch sử; log Ready43s mới bổ sung xác nhận main live no-op PASS, không production. UUID/SHA riêng dòng xanh chưa hiện; không suy mọi Failed đã được giải quyết. Prototype cũ giữ nguyên, không credentials/global MCP install/paid service/DNS/production mutation. Lệnh/giới hạn tại SETUP/báo cáo P01. Các SKIP/NOT STARTED của P00 giữ ý nghĩa lịch sử.
## P01 — kết thúc ba P1, 04/11/2026 — READY FOR REVIEW

- [x] A1: overlay và Results cùng filter/sort; Header/Home global; page reset, preview bounded.
- [x] A2: caption/link Detail đạt5,268:1, giữ attribution.
- [x] A3: Hero giữ native image dimensions từ manifest; không đổi bố cục/tỷ lệ.
- [x] Local25 tests/typecheck/build PASS;45 P01 journeys +19 P1 checks PASS mỗi runtime local/Preview ở1440/768/390; ảnh/raw logs ignored.
- [x] Develop9a2f732 → build94f3c52b completed/success → deploymentcb15215f → bindings staging và browser PASS. Main giữ31d3053; không production/configCI/DNS/P02.
- [ ] Chủ dự án nghiệm thu P01/UI; chưa DONE. Physical mobile/Safari/Firefox/AT/field CWV SKIP. [Báo cáo và checklist](docs/PHASE01_P1_FIXES.md).

## P01 Final Audit & P02 Preparation — 03/11/2026, lịch sử READY FOR REVIEW

- [x] Chỉ đọc Preview/source: browser journeys mới45/45 PASS ở1440/768/390,20PNG; thêm luồng click, input đặc biệt, network/trace/font fallback/SEO/a11y/link/license/dependency checks.
- [x] Ghi3 P1 chưa sửa: search overlay khác phạm vi bộ lọc với full results; caption/link nguồn contrast4,395:1; Hero dịch chuyển khi ảnh tải. Không đồng nghĩa UI được nghiệm thu.
- [x] Kế hoạch P02 theo3 mức ưu tiên; chốt nguồn biên tập Git/JSON hay D1 trước admin web. Đây là đề xuất, chưa thay roadmap hoặc triển khai P02.
- [x] [Báo cáo và bằng chứng](docs/PHASE01_FINAL_AUDIT.md); source/UI/cloud/D1/CI không đổi, không commit/push/deploy. Retry main là việc riêng, không suy kết quả trong audit.
- [ ] Chủ dự án review các phát hiện, chọn cách xử lý UI/search và phạm vi P02. P02 **NOT STARTED**.

## Archify — tài liệu kiến trúc P01 (READY FOR REVIEW, local)

- [x] Audit upstream SKILL/install/license/Node/dependencies/quyền; cài project-local `.agents/skills/archify`, pin snapshot, không MCP/global hoặc npm dependency app.
- [x] Bốn JSON IR + HTML dựa trên source `a84c55a`, có source file/dòng, phân biệt P01 hiện có và đề xuất tương lai; index mở offline bằng Chrome.
- [x] Native finalize/schema/layout/Git evidence/HTML/SVG/Chrome gate PASS cả4; giới hạn UI advanced fallback English được ghi rõ.
- [x] Chrome/file:// interaction QA37/37 PASS ở1440/768/390;19 screenshots/8 exports local,0 automatic HTTP requests/console/page errors. [Audit và bàn giao](docs/architecture-maps/AUDIT.md).
- [x] Chủ dự án yêu cầu commit checkpoint Archify local riêng trước khi tiếp tục thiết kế P02.
- [ ] Chủ dự án review nội dung trước push. Không triển khai P02, thay app/cloud/D1/CI/CD hoặc nghiệm thu UI thay người dùng.

## P02 — Import & biên tập (chưa bắt đầu)

- [ ] P02-01 — Chốt auth/role; implement secure session/admin guard.
- [ ] P02-02 — Fetch URL có giới hạn, SSRF guard, GitHub API quota và provenance.
- [ ] P02-03 — Dedupe, taxonomy suggestion rules, tạo draft/manual edit, publish revision.
- [ ] P02-04 — Moderation + audit log, chống sai link, missing license, XSS/HTML unsafe.
- [ ] P02-05 — API + browser QA cho đường admin, báo kết quả, nghiệm thu.

## P03 — Đánh giá cộng đồng

- [ ] P03-01 — Login member với quyền chỉ sửa dữ liệu của mình.
- [ ] P03-02 — Unique rating, thay đổi rating, rating count, optional text review.
- [ ] P03-03 — Ranking có giải thích thuật toán; test 1 phiếu 5 sao không áp đảo mẫu lớn chất lượng.
- [ ] P03-04 — Report abuse, moderation, spam/rate limit; browser QA với 2 user + moderator.
- [ ] P03-05 — Nghiệm thu P03.

## P04 — Gemini adapter, nhiều provider

- [ ] P04-01 — Chuẩn hóa `SourceEvidence`, `AITask`, schema và validation.
- [ ] P04-02 — Interface/provider registry + `GeminiProvider`, tests với mock API và lỗi.
- [ ] P04-03 — Server-side secret, quota, budget, caching, retry, task/model config.
- [ ] P04-04 — Admin AI analysis/draft review flow, không auto publish, ghi nguồn, không đè sửa tay.
- [ ] P04-05 — Bộ benchmark có 50–100 mẫu, hallucination/confidence/chi phí được báo cáo.
- [ ] P04-06 — Nếu cần, GitHub discovery job, rate limit và candidate moderation; staging test.
- [ ] P04-07 — Tài liệu thêm provider thứ hai (chưa bắt buộc triển khai), nghiệm thu P04.

## P05 — Cộng đồng đề xuất

- [ ] P05-01 — Member submit URL + fields + quyền chia sẻ; duplicate/abuse checks.
- [ ] P05-02 — Queue, notifications tối thiểu, approve/reject/request changes.
- [ ] P05-03 — Report/takedown/appeal workflow, QA nhiều vai trò.
- [ ] P05-04 — Nghiệm thu P05 và quyết định backlog.

## Backlog chưa duyệt

- [ ] B-01 — Windows one-click installer từ nguồn chính thức với Sandbox validation.
- [ ] B-02 — Full-text search service nâng cao khi SQL search kém hiệu quả.
- [ ] B-03 — Upload file community với malware scan + license verification.
- [ ] B-04 — VPS/Postgres migration khi có số liệu thực; plan backup/restore.
- [ ] B-05 — Thêm AI provider khác và routing tối ưu chi phí sau benchmark.

## Mẫu log xác minh (điền sau khi chạy thật)

```text
Task ID:
Environment/branch/commit:
Changes:
Reuse Audit:
Commands/flows run:
PASS:
FAIL:
SKIP + reason:
Limitations/blocker:
Approval/next phase:
```
