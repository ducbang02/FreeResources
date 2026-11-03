# ROADMAP — Làm nhỏ, kiểm chứng, mở rộng

> P01 đang triển khai: local catalog đã kiểm, D1 staging đã có dữ liệu; còn kết nối Workers Builds và cloud browser QA. Production và P02 chưa được phép.

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

## Phase 02 — Editorial & smart URL import

**Mục tiêu:** admin thêm link nhanh, kiểm soát dữ liệu.

- Auth/admin role nếu chưa có; CSRF/session/permission tests.
- Nhập URL -> fetch GitHub/metadata bằng provider nguồn -> canonicalize, dedupe -> draft.
- Form edit, taxonomy, source provenance, review queue, publish/archive, revision audit.
- **Có thể** thêm Gemini classification ở phase này nếu đã thông qua provider interface; nếu không, form manual vẫn phải dùng được.

**Gate:** metadata đúng nguồn, chống SSRF/duplicate/XSS, không tài nguyên nào tự public khi thiếu duyệt.

## Phase 03 — Accounts, ratings & trust

**Mục tiêu:** đánh giá thật tạo chất lượng lựa chọn.

- Member login, quyền và profile tối giản; unique rating/member/resource.
- Cho sửa điểm, review có moderation/report và chống spam cơ bản.
- Ranking có weighting/sample-size, “Mới”, “Top đánh giá”, “Biên tập chọn”; tests chống thao túng cơ bản.

**Gate:** browser test 2 tài khoản, thao tác đổi điểm, phân quyền admin, duplicate ratings, cache cá nhân.

## Phase 04 — AI discovery pipeline (multi-provider)

**Mục tiêu:** tiết kiệm thời gian biên tập mà không để AI tự xuất bản.

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

P01 READY FOR REVIEW:22 tests,90 local browser checks,45 cloud checks/20PNG và5 smoke checks sau auto-update PASS. Account đúng `4ca521c6746d874c049fd829121ab59e`, D1 `e28f4099-92cf-40bc-ab8c-c47138b4469d`. GitHub→Builds→Preview508a96c và auto-update31d3053 PASS, parent chưa active deployment. Main safeguards cấu hình/source/local/parent PASS; CI main aa369850 timeout trước clone, user commands SKIP. Hai tài nguyên tạo nhầm đã xóa theo yêu cầu và GET404. Chờ chủ dự án nghiệm thu; không tự bắt đầu P02/production.
