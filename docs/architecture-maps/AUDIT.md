# Audit Archify & validation

05/11/2026 · **READY FOR REVIEW** sau chuẩn hóa. P02 local đã chốt riêng ở `73a6cb9`; lượt này chỉ docs/tooling Archify, không đổi business logic hoặc cloud/CI. Chủ dự án yêu cầu một commit riêng, không push/deploy. Các phần audit cài đặt04/11 bên dưới là lịch sử tại thời điểm P02 chưa triển khai.

## Chuẩn hóa05/11 — bốn sơ đồ theo trách nhiệm

| Xử lý | File và lý do |
| --- | --- |
| Giữ nguyên byte | `01-system.html`/JSON, `02-cicd.html`/JSON, `04-search.html`/JSON: public runtime, pipeline và Search không có thay đổi thuộc scope; giữ pin P01 a84c55a |
| Hợp nhất/cập nhật | `03-data.html`, `sources/03-data.dataflow.json`: URL GitHub/website, metadata/rules, nháp local/cache, quick/deep manual gates, admin CLI preliminary/final/export, Git JSON→SQL→D1→website.12 nodes/14 flows,27 source ranges kiểm tại P02 commit73a6cb9 |
| Loại bỏ | Sơ đồ cấp cao dư `05-p02-proposed.html`, JSON workflow tương ứng và ignored delivery sidecar; đã thay links/lệnh tái tạo. Historical QA receipts04/11 vẫn ignored, không là input sinh sơ đồ |
| Giữ thiết kế | `docs/PHASE02_DESIGN.md` và ROADMAP giữ proposal/lịch sử; thay link hiện trạng sang03, không mô tả proposal cũ là runtime |
| Sửa metadata/hướng dẫn | `index.html`, README/AUDIT, root README, ARCHITECTURE, tracker: bốn câu hỏi và per-map revision/scope; Gemini có code/mocks nhưng chưa live, admin web/community/production vẫn proposed |
| Sửa tooling | `tools/architecture-maps.mjs` registry cố định4 tên/type/output, từ chối input ngoài registry; QA đọc pin/link_mode của từng source JSON, không hardcode mọi diagram cùng P01 SHA |

**Validation PASS:** native finalize03 schema/layout/source Git/strict provenance/browser gate; per-run [summary](../../qa/architecture-maps/archify/03-data.dataflow/2026-11-04T18-41-17-909Z/03-data.finalize-summary.json).27 ranges dựa source committed, không source từ notes hoặc code chưa commit. Update networking disabled; không đổi upstream skill/runtime/license/dependency.

**PASS browser:** Chrome156/file://,37 interaction checks cho index+4 maps ở1440/768/390,19 screenshot/8 PNG/SVG exports,0 automatic HTTP/page/console errors; [receipt](../../qa/architecture-maps/browser/results.json). Đã xem ảnh03 desktop/mobile: desktop đọc được, mobile dùng canvas pan/zoom và node index. Một số nhãn advanced viewer/legend còn Anh; không chứng nhận physical mobile/AT/WebM/clipboard. Browser PASS không nghiệm thu ý nghĩa tài liệu thay người dùng.

**PASS registry/scope:** đúng4 HTML/4 JSON, từ chối argument05 và JSON ngoài registry trước render; thử file QA tạm đã gỡ trong finally. [Static receipt](../../qa/architecture-maps/normalization/static.json). App/scripts/tests/catalog/migrations/package/cloud config và01/02/04 không diff so với73a6cb9. Không chạy app tests/build hoặc deploy lại vì lượt này chỉ docs/tooling; kết quả P02 nằm trong báo cáo riêng.

**Giới hạn nguồn:**03 pin local73a6cb9 với link_mode local-only, có path/dòng/verified metadata nhưng không có GitHub links cho commit chưa push.01/02/04 giữ GitHub links P01 cần mạng khi mở. Không nhúng toàn bộ source hoặc hứa code card offline. Nếu sau này được phép push và muốn web links, cập nhật mode theo source thật rồi regenerate/QA; không push để làm link đẹp trong task này.

**Quy tắc duy trì:** feature/phase mới ưu tiên cập nhật01 System/02 CI/03 Data/04 Search; không tự thêm05/06 theo số phase. Chỉ đề xuất thêm khi có subsystem độc lập hoặc luồng phức tạp cần một góc nhìn riêng, được review rõ trước khi đổi registry/index. Không đổi thuộc tính sơ đồ khác khi trách nhiệm của chúng không đổi.

## Audit gốc04/11 — lịch sử cài đặt và bốn bản đồ P01

## Reuse Audit

Đã đọc AGENTS/SETUP/PROJECT/ARCHITECTURE/ROADMAP/TASKS và source entry points, call sites, SQL/importer, migration, CI guards. Chọn Archify Skill + CLI renderer/validator có sẵn trong gói, lưu JSON IR + HTML. Không chọn MCP, dịch vụ upload, thư viện sơ đồ mới hoặc tự viết renderer. Index dùng HTML/CSS native; không thêm dependency vào app.

## Nguồn upstream đã đọc và pin

- [Repository chính thức](https://github.com/tt-a1i/archify), [llms.txt tại snapshot](https://github.com/tt-a1i/archify/blob/a4065941f12be7967436261d9934784e381d423c/llms.txt): chính thức hỗ trợ agent Codex và project-only install khi bỏ --global.
- [SKILL.md](https://github.com/tt-a1i/archify/blob/a4065941f12be7967436261d9934784e381d423c/archify/SKILL.md), [repository authoring](https://github.com/tt-a1i/archify/blob/a4065941f12be7967436261d9934784e381d423c/archify/references/repository-authoring.md), authoring defaults/schemas/examples cho architecture/workflow/dataflow/sequence; delivery contract và viewer-runtime cho browser/export.
- [Package manifest](https://github.com/tt-a1i/archify/blob/a4065941f12be7967436261d9934784e381d423c/archify/package.json): version3.2.0, Node≥18, không runtime npm dependency; hai devDependencies upstream không được cài.
- [LICENSE](https://github.com/tt-a1i/archify/blob/a4065941f12be7967436261d9934784e381d423c/archify/LICENSE), [NOTICE](https://github.com/tt-a1i/archify/blob/a4065941f12be7967436261d9934784e381d423c/archify/NOTICE), [third-party notices](https://github.com/tt-a1i/archify/blob/a4065941f12be7967436261d9934784e381d423c/archify/THIRD_PARTY_NOTICES.md): Apache-2.0 ở snapshot này, historical MIT và font OFL được bảo toàn. Context7 resolve/query được dùng nhưng có đoạn index cũ ghi MIT/3.1; ưu tiên byte source đã pin. Release cũ giữ license riêng, không suy đổi license ngược lịch sử.
- [Update checker](https://github.com/tt-a1i/archify/blob/a4065941f12be7967436261d9934784e381d423c/archify/scripts/check-update.mjs): opt-out `ARCHIFY_UPDATE_CHECK_DISABLED=1` được dùng. Chỉ tải tool/source công khai từ GitHub, không gửi source FreeResources tới endpoint ngoài.

Gói skill local gồm206 files/18.147.415bytes tại `.agents/skills/archify`, ignored. Không clone cả upstream vào Git của dự án. SHA-256 SKILL/entrypoint và revision nằm trong lock. HTML bốn sơ đồ khoảng3,4MB tổng, gồm viewer/font và metadata source path/dòng/link; không nhúng toàn bộ source. Source mở bằng link GitHub, không có code card offline trong native viewer này. HTML được giữ làm tài liệu theo yêu cầu. License files được copy nguyên byte, không sửa upstream skill/runtime.

## Mốc source và ý nghĩa

FreeResources snapshot `a84c55ac84a463585cc11940036e43ea31da9866`, branch develop; worktree sạch khi bắt đầu. Thay đổi sau đó chỉ docs/tooling local. P01 vẫn READY FOR REVIEW; không tự nghiệm thu hoặc triển khai P02.

Quan hệ Browser→API được chứng minh bởi `src/scripts/interactions.ts`; API→SQL qua `src/pages/api/search.ts`/`src/lib/catalog.ts`; FTS/index qua `migrations/0001_catalog.sql`. Astro chạy trên Worker theo `astro.config.mjs` và config staging. CLI đọc/ghi file tại `scripts/catalog.mjs`; Wrangler áp dụng DB tại `scripts/preview.mjs:82–88,118–134`. Main no-op tại `scripts/build-worker.mjs` và `scripts/no-production.mjs`. Node nguồn có các ranges tương ứng và links pin commit trong từng HTML. Mỗi đường mô tả cùng phạm vi gọi/ghi thực tế; không coi các folder/bảng tương lai trong ARCHITECTURE là đã có.

## Validation local

| Kiểm tra | Kết quả / bằng chứng |
| --- | --- |
| Cài project-local + `doctor` | **PASS** trên Windows, Node24.18.0/npm12.2.0; các renderer/template/validators/finalizer đều ready |
| Native finalize cả4 sơ đồ | **PASS**: schema/layout, Git source evidence, atomic delivery, strict HTML/SVG và Chrome browser gate |
| Native browser | **PASS** tại1440×900,1600×1000,1920×1080,2048×1320; theme/containment/readability theo gate của Archify. Raw receipts tại `qa/architecture-maps/archify/`, không tracked |
| i18n | **Giới hạn đã ghi rõ**: nội dung tác giả bằng tiếng Việt,68 chuỗi điều khiển Việt hóa;418 chuỗi advanced fallback English. `i18n/translation-coverage` warning không làm fail gate theo delivery contract; không tuyên bố đã dịch toàn bộ viewer |
| Trang index + thao tác browser | **PASS 37/37** bằng Chrome156 thật, file:// tại1440/768/390: index navigation/keyboard/no-JS,4 sơ đồ render/focus/nguồn/quan hệ, zoom/pan/reset, light/dark/guide/Escape, PNG/SVG downloads |
| Offline / console | **PASS**: chặn HTTP/HTTPS trong context,0 request tự động,0 page exceptions/console errors; file:// vẫn tương tác và xuất ảnh |
| Captures / visual review | **PASS có giới hạn**:19 screenshots và8 PNG/SVG exports được tạo local, đã xem ảnh thực tế cả4 sơ đồ desktop, index/mobile và bản Data/Search sau refinement. Đây là review tài liệu, không thay nghiệm thu của người dùng |

Browser version156.0.8078.80. Results: `qa/architecture-maps/browser/results.json`; screenshots và downloads cùng thư mục, ignored. Native browser receipts được bind SHA của từng HTML; summary nằm trong thư mục run tương ứng dưới `qa/architecture-maps/archify/`. Source links đã kiểm đúng repo/revision/file/range; không giả vờ đã tải từng trang GitHub khi chạy offline. PNG/SVG được tải thật và kiểm header/bytes; chưa kiểm clipboard/WebM vì ngoài yêu cầu xuất ảnh. Năm license/notice files đã đối chiếu SHA-256 với upstream skill local và trùng byte.

Checkpoint Git: bốn HTML native có trailing whitespace do renderer upstream sinh. Giữ nguyên byte để bảo toàn provenance; không chỉnh artifact bằng tay. Whitespace check áp dụng riêng các file biên tập, loại trừ đúng bốn HTML generated; HTML vẫn đã qua native strict check/browser gate.

Các draft đầu bị source-evidence validator từ chối do end_line vượt EOF; đã đọc lại ranges thực tế và sửa trước khi publish HTML. QA tương tác đầu có1 FAIL pan Dataflow do harness lấy điểm kéo từ SVG đã zoom nằm ngoài panel; sửa harness dùng panel hiển thị và lượt cuối PASS37/37. Nhãn dự kiến được làm rõ trực tiếp trên node, các mũi tên Worker→D1 ghi SQL thay vì tên hàm nội bộ. Không sửa/nới validator hoặc upstream runtime. Không có lỗi schema/layout còn lại ở các bản finalize PASS. Không có cấp quyền cloud mới, token/env/auth file trong source citations hoặc HTML.

## File thay đổi và bàn giao

- `docs/architecture-maps/`: index,4 HTML tự chứa,4 JSON IR,README/AUDIT,tool lock và5 license/notice files.
- `tools/architecture-maps.mjs`: render/finalize local từ nguồn; `tools/qa-architecture-maps.cjs`: browser regression cho tài liệu.
- README/SETUP/TASKS và `docs/ARCHITECTURE.md`: thêm đường vào sơ đồ và quy trình cập nhật. Không đổi quyết định kiến trúc/roadmap.
- `.gitignore`: ignore delivery receipts; `.gitattributes`: giữ nguyên byte HTML/license để tránh Windows autocrlf làm sai provenance. QA outputs và skill local đã nằm trong ignore sẵn có.

Không thay `src/`, catalog/migrations, deploy config, CI scripts hoặc app package/lockfile; không tạo cloud resource. Baseline kiểm source là `a84c55a`, branch develop. Theo lệnh bổ sung của chủ dự án, lưu Archify thành một commit local riêng trước khi làm thiết kế P02; chưa push. Nội dung sơ đồ vẫn chờ người dùng review, không suy yêu cầu commit thành nghiệm thu hoặc quyền triển khai P02.

**SKIP:** thiết bị vật lý, Safari/Firefox, screen reader đầy đủ và setup trên máy sạch; không kiểm cloud/DB/CI live trong task tài liệu. App unit/typecheck/build không chạy lại vì không đổi app/dependencies/config; không suy browser tài liệu PASS thành nghiệm thu website hoặc production.
