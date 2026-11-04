# ROADMAP — Làm nhỏ, kiểm chứng, mở rộng

> P01 READY FOR REVIEW: ba P1 đã sửa,25 tests PASS;64 browser checks PASS mỗi runtime local/Preview. GitHub→Preview và main no-op đã kiểm. Chờ chủ dự án nghiệm thu, production/P02 chưa được phép. [Cập nhật04/11](docs/PHASE01_P1_FIXES.md).

## Phase 00 — Product & technology validation (lịch sử)

**Mục tiêu:** chốt phạm vi MVP và thiết kế trước khi Codex code lớn.

- Xác nhận Q-01 → Q-06 trong `docs/DECISIONS.md`.
- Audit công cụ/repo/library/MCP/skill có sẵn theo `AGENTS.md`; giữ stack tối giản.
- Thiết kế data types, taxonomy v1, content moderation, rating policy và nguồn hợp pháp.
- Hai biến thể Apple-inspired A/B đã có nhưng chưa được chủ dự án chấp nhận. A bị nhận xét quá trống trải, thiếu điểm nhấn. Giữ prototype tham chiếu, chờ brief thiết kế tiếp; browser/mobile QA thật chưa thực hiện.
- Spike nhỏ xác minh Astro Cloudflare, D1, auth, GitHub API, Gemini structured output **nếu cần**, không được gọi là production.

**Gate:** PROJECT + DECISIONS + UI direction và chi phí/quota cơ bản được An duyệt. Test `PASS/FAIL/SKIP` cho spike; phase = `READY FOR REVIEW` rồi mới `DONE`.

Kết quả P00 và validation xem `docs/PHASE00_REPORT.md`. Q-01/Q-06 đã chốt định hướng public catalog + Astro/TypeScript + Workers/D1; Q-07/UI chưa được chấp nhận. P00 giữ READY FOR REVIEW, chờ brief UI tiếp; chỉ bắt đầu P01 sau khi chủ dự án chốt UI và gửi lệnh bắt đầu. Runtime spike và browser/mobile QA thật chưa chạy; không ghi PASS chỉ từ docs.

## Phase 00.1 — UI/UX redesign

**READY FOR REVIEW**, theo brief riêng 03/11/2026; P00 giữ READY FOR REVIEW.

- Nghiên cứu Apple.com/App Store/Setapp/Raycast và directory trước code, nguồn + ranh giới bằng chứng.
- Ba composition A Editorial/B Directory/C Hybrid; home/discover/detail, bản tĩnh tương tác, review width1440/768/390. Giữ nguyên prototype P00.
- Asset có nguồn/license, fixture trung thực; search/filter/navigation và CTA có feedback. Không backend hoặc đổi stack.
- Logic/static PASS; browser/mobile/tablet, console/keyboard thực tế và screenshot **SKIP** vì host unavailable. Không nghiệm thu UI từ CSS/VM.

**Gate:** chủ dự án xem `prototype-p001/review.html`, chọn UI; báo cáo `docs/PHASE001_REPORT.md`. Chưa bắt đầu P01, không cloud/deploy. Chọn UI cũng không tự cấp lệnh triển khai P01.

## Phase 00.2 — Design refinement & development tooling

**READY FOR REVIEW**. A là hướng chính đã chọn, UI chưa nghiệm thu.

- Home1 feature/4 công cụ/intro-search ngắn; Search overlay tìm nhanh; Explore duyệt/lọc; Detail quyết định.
- Refinement A hiện có, không B/C mới/đổi stack. Audit UI UX/Playwright MCP/Context7/DevTools, không install/config trước duyệt.
- Reuse local Playwright đã có:45 browser checks PASS1440/768/390,20 screenshot. Physical mobile keyboard/AT chưa kiểm. UI UX chỉ đọc source, MCP mới chưa handshake.
- Bàn giao `docs/PHASE002_REPORT.md`, tooling audit và evidence. Chờ chủ dự án nghiệm thu; tool install là quyết định riêng, không cấp quyền P01.

**Gate:** nghiệm thu UI A và lệnh bắt đầu P01 rõ ràng. Không backend/AI thật/cloud/deploy/push trong P00.2.

## Phase 00.3 — Visual simplification

**READY FOR REVIEW**. Tinh giản A hiện tại: hero full-width và ảnh sản phẩm lớn đúng tỷ lệ, headline hai dòng; bỏ copy dư, hai card visual với icon thật, Noto Sans tiếng Việt tự host, giữ overlay P00.2 và attribution ở Detail/credits.

68 checks browser PASS ở1440/768/390, 29 PNG trước/sau/bổ sung; font tải thực/fallback và Excalidraw đã kiểm. [Bàn giao](docs/PHASE003_REPORT.md), [gallery](qa/p003/index.html). P00 cũ/B/C không đổi source. Physical device/keyboard/AT và cross-engine chưa kiểm.

**Gate:** dừng chờ chủ dự án nghiệm thu; chỉ bắt đầu P01 khi có lệnh riêng. Không backend/cloud/deploy hoặc đổi kiến trúc trong P00.3.

## Phase 01 — Foundation & public catalog (READY FOR REVIEW)

**Mục tiêu:** website xem được nội dung thật, không cần AI hoặc login.

- Scaffold vừa đủ theo stack đã chốt, lint/type/test/build scripts tối thiểu.
- DB schema, migration local, seed fixture, index + backup/export có quy trình.
- Catalog, category, tag, search/lọc đơn giản, trang chi tiết và SEO baseline.
- Admin **seed/manual management** tối thiểu có kiểm soát; nếu chưa auth thì dùng import tool local, tuyệt đối không public admin endpoint.
- Responsive + accessibility, browser flow, test link official.

**Gate:** catalog fixture và tài nguyên thật có nguồn, bài hiển thị đúng, SQL tests và browser QA local pass; không upload/download file bên thứ ba.

## Phase 02 — Nhập và biên tập local (READY FOR REVIEW,05/11)

Brief05/11 chốt Git/JSON + CLI, GitHub public **và website ứng dụng**, hai mức AI thủ công cùng5 lượt/ngày. Thay thế Q09–11 và các milestone đề xuất cũ. [Contract](docs/PHASE02_DESIGN.md), [bằng chứng](docs/PHASE02_REPORT.md).

Local implementation/gates và Windows CLI đã có,52 tests/typecheck/build/64 P01 browser+5 P02 native D1 checks PASS. GitHub/OBS public import thật PASS; Gemini thật và cloud sync/deploy chưa chạy vì chưa có quyền/cấu hình miễn phí được xác nhận. [Cách dùng](docs/PHASE02_CLI.md). Không tự ghi P01/P02 DONE; chờ chủ dự án review.

1. **P02.0:** audit/chốt contract mới, tách provenance/phân loại, một writer.
2. **P02.1:** URL/identity hai nguồn, dedup/rename/stable ID; SSRF/network boundary.
3. **P02.2:** GitHub API→draft, public-only, README/license unknown, ETag/cache/limits/errors.
4. **P02.3:** website ứng dụng→metadata hạn chế/thủ công, không crawler.
5. **P02.4:** rules/edit/preliminary/final review/export plan và apply có xác nhận, conflict/idempotency, không tự ghi D1.
6. **P02.5:** Gemini quick/deep tùy chọn, shared quota/cache/usage, default off và free-tier fail-closed.
7. **P02.6:** unit/integration/CLI E2E/P01 browser regression, Windows docs, báo cáo READY FOR REVIEW theo kết quả thật.

Admin web/auth là phương án mở rộng nếu chủ dự án chọn D1 writer, cần thiết kế chuyển seed/permissions riêng; không là dependency bắt buộc của CLI-first proposal. Không community ratings/submissions/upload/cron/provider thứ hai ở M1–4. Mọi milestone chỉ triển khai sau lệnh rõ; schema/API tests không thay browser/staging acceptance.

## Phase 03 — Accounts, ratings & trust

**Mục tiêu:** đánh giá thật tạo chất lượng lựa chọn.

- Member login, quyền và profile tối giản; unique rating/member/resource.
- Cho sửa điểm, review có moderation/report và chống spam cơ bản.
- Ranking có weighting/sample-size, “Mới”, “Top đánh giá”, “Biên tập chọn”; tests chống thao túng cơ bản.

**Gate:** browser test 2 tài khoản, thao tác đổi điểm, phân quyền admin, duplicate ratings, cache cá nhân.

## Phase 04 — AI discovery pipeline (multi-provider)

**Mục tiêu:** mở rộng discovery/provider khi cần, không để AI tự xuất bản. Nếu Gemini đơn lẻ đã được duyệt và triển khai tại P02-M4 thì reuse, không xây lại adapter/ledger; cron/multi-provider vẫn là phase sau riêng.

- Triển khai `AIProvider` interface, Gemini adapter, model/task config, server secret, schema tests.
- Lưu input evidence, output draft, prompt/schema version, audit, caching, quota và budget cap.
- Eval bộ nguồn đa dạng, đo chất lượng, chi phí, hallucination, fallback dựa trên cấu hình.
- Tùy kết quả, thêm GitHub automated discovery với lịch phù hợp, rate limit và review queue.

**Gate:** ít nhất một provider hoạt động, case lỗi có trạng thái rõ, benchmark và human review, không ghi đè nội dung đã chỉnh sửa.

## Phase 05 — Community contribution

**Mục tiêu:** người dùng tìm/gửi nguồn, nội dung tăng có kiểm soát.

- Submit link + metadata, status tracking, moderation, report policy, chống spam.
- Dedupe với catalog + submissions, chương trình contributor guidelines, admin tools.
- Thêm collection/community curation chỉ sau khi có hoạt động thực.

**Gate:** user submit -> moderator edit/reject/approve -> page public; chống spam và vi phạm quyền cơ bản.

## Phase 06 — Scale & advanced experiences (chưa cam kết)

- Search nâng cao, đề xuất cá nhân hóa, collections, notifications, analytics hiệu quả.
- One-click Windows installer **theo từng app**: cần audit package/source, chữ ký/checksum, dependencies, test Windows Sandbox sạch, rollback, quyền redistribute và user consent. Không phát hành `.bat` execute remote code tự động chỉ dựa trên AI draft.
- Dịch ngôn ngữ, mobile app, upload tài nguyên nếu có quyền, kiến trúc VPS/Postgres khi có bằng chứng tải/chi phí.

**Gate:** từng feature có scope/chi phí/pháp lý/acceptance riêng được duyệt; không phải checklist phải làm hết.

## Công thức nghiệm thu mỗi phase

`Inspect -> Reuse Audit -> Plan -> Implement -> Unit/Integration -> Browser/Runtime QA -> Security Review -> Document -> READY FOR REVIEW -> User Approval -> DONE`

Mỗi phase ghi: file thay đổi, lệnh chạy với environment, PASS/FAIL/SKIP, những gì **chưa** kiểm thử, migration/rollback và commit/branch thực tế. Nếu có việc cần credential, production, DNS, paid plan, legal/takedown: dừng xin quyết định.

P01 READY FOR REVIEW:22 tests,90 local browser checks,45 cloud checks/20PNG và5 smoke checks sau auto-update PASS. Account đúng `4ca521c6746d874c049fd829121ab59e`, D1 `e28f4099-92cf-40bc-ab8c-c47138b4469d`. Develop Preview/auto-update PASS, parent chưa active deployment. Main đã có log live no-op PASS một lần; aa369850 timeout trước clone giữ là FAIL lịch sử. Hai tài nguyên tạo nhầm đã xóa/GET404. Final Audit phát hiện3 P1 chưa sửa; đề xuất P02 còn chờ duyệt, không thay scope roadmap bằng kế hoạch đề xuất. Không tự bắt đầu P02/production.
