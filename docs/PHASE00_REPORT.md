# Phase 00 — Audit, kiến trúc và UI concept

Ngày: **03/11/2026 (Asia/Bangkok)**. Trạng thái: **READY FOR REVIEW**, chưa được chủ dự án nghiệm thu; P01 **NOT STARTED**.

## 1. Kết luận và phạm vi

Chủ dự án đã đồng ý **định hướng P01 public catalog trước với Astro + TypeScript + Cloudflare Workers/D1** ngày 03/11/2026. Prerender nội dung công khai vẫn là đề xuất implementation. Chưa xác minh stack bằng runtime; pin phiên bản, build adapter, D1 migration và đo runtime là gate P01. Chưa có lệnh bắt đầu P01.

Đã chốt visual direction **Apple-inspired minimalist editorial**, nhưng **chưa chấp nhận concept A hoặc B**. Sau khi xem A, chủ dự án thấy quá trống trải, thiếu điểm nhấn và chưa đạt chất lượng mong muốn. Giữ cả prototype làm tham chiếu; chờ brief thiết kế lại, hiện chỉ ghi nhận phản hồi. Browser/mobile QA thật chưa thực hiện. Prototype HTML/CSS/JS native chỉ dùng thử UX.

## 2. Audit trạng thái thực tế

- Đã đọc `AGENTS.md`, `README.md`, `SETUP.md`, `PROJECT.md`, `ROADMAP.md`, `TASKS.md` và toàn bộ bốn tài liệu ban đầu trong `docs/`.
- Thư mục ban đầu có 10 file Markdown; không có source, package.json, lockfile, test, deploy config, thư mục con có AGENTS riêng hoặc `.git`. `git status --short` và `git branch --show-current` trả **fatal: not a git repository**. Không thể báo diff/branch/commit; không tự khởi tạo Git.
- Môi trường đọc được: Windows/PowerShell, Node v24.18.0, Python 3.13.15, Git 2.53.0.windows.3. Không cài dependencies, skill, plugin hoặc CLI.
- Đã dùng ba lane: stack/quota; reuse/schema/AI; UI prototype. Root tích hợp tài liệu và kiểm tra. Không giao cùng một file cho nhiều lane.
- Tool audit: Context7 resolve/query cho docs; web nguồn chính thức cho quota/license/upstream; Cloudflare skill cho chọn sản phẩm; Sites skill **local-only** cho prototype. Kết nối CUA có tool nhưng không có browser/native host hoạt động. Không có Ponytail skill/tool trong catalog và thư mục skill/plugin đã kiểm tra; áp dụng trực tiếp nguyên tắc reuse/YAGNI và review thủ công.

## 3. Mâu thuẫn và phần thiếu đã xử lý

| Vấn đề | Cách xử lý |
| --- | --- |
| Planning kit nói UI chưa chốt; yêu cầu mới chốt Apple-inspired | Cập nhật DESIGN_SYSTEM, PROJECT, DECISIONS; chỉ A/B vẫn OPEN |
| D-009 còn PROPOSED dù yêu cầu mới bắt buộc admin duyệt AI | Chuyển riêng quy tắc AI → human approval sang AGREED; policy cộng đồng vẫn đề xuất |
| README/SETUP nói chưa có giao diện/code nào | Phân biệt prototype tĩnh với source ứng dụng; thêm cách xem không cài package |
| Roadmap yêu cầu chốt mọi câu hỏi trước P01 dù auth/AI thuộc phase sau | Q-01/Q-06/Q-07 là gate scaffold; các câu hỏi khác chốt trước phase phụ thuộc |
| `type` đơn lẻ có thể làm repo và app loại trừ nhau | Mô hình nhiều nhãn/facet; primary type chỉ để trình bày, app có thể kèm source repository |
| Chưa có bằng chứng version/runtime/chi phí thật | Báo docs-only, không gắn VERIFIED cho stack; spike runtime và billing thật SKIP |
| Tài liệu Astro/Context7/upstream khác snapshot | Không copy cấu hình cũ hoặc pin theo snippet; P01 chọn cùng major và kiểm peer dependencies/runtime |

## 4. Reuse và kiến trúc đề xuất

Chi tiết có nguồn: [Tech validation](PHASE00_TECH_VALIDATION.md), [Reuse audit, schema và taxonomy](PHASE00_REUSE_AUDIT.md), [Architecture](ARCHITECTURE.md), [AI providers](AI_PROVIDERS.md).

**Reuse Audit:** không có code/dependency cũ để mở rộng. Native HTML/CSS/JS đủ cho prototype; API GitHub metadata và Gemini structured output dùng qua boundary nhỏ ở phase được giao. Không clone template/CMS lớn, không cần UI framework hoặc generic repository/provider engine cho P00.

- **Catalog:** nội dung biên tập + URL/provenance, nhiều facet type/topic/audience/platform/price/license. Collection là tập mục có thứ tự, không ép thành tag. License chưa xác minh phải thể hiện `unknown/needs_review`.
- **Search:** prerender thì xem xét Pagefind; catalog SSR dùng D1 FTS5/index. Chỉ chọn một index phục vụ truy vấn chính; search tiếng Việt phải kiểm dữ liệu thực, dấu/không dấu, token và relevance ở P01. Không coi LIKE `%term%` là giải pháp scale.
- **Auth:** hoãn P02/P03. Better Auth là ứng viên cần kiểm version và security advisory; P01 dùng seed/import local, không public admin endpoint chưa bảo vệ.
- **Ranking:** Bayesian mean cho điểm 1–5, unique `(user_id, resource_id)`, hiển thị số phiếu; không dùng GitHub stars/AI score thay đánh giá người dùng. Tab mới, biên tập chọn và điểm cộng đồng tách rõ. Tham số cần được duyệt/test trước P03, không dùng Wilson cho sao 1–5 mà chưa chuyển mô hình.
- **AI:** một interface tác vụ có evidence, schema/prompt version, timeout và usage; Gemini adapter đầu tiên. Validate schema lẫn claim nguồn, human approval, giới hạn retry/budget; fallback mặc định tắt. SDK vendor chỉ ở adapter. Cloudflare AI Gateway là sản phẩm tùy chọn về sau, khác boundary AI nội bộ của app.
- **Scale:** query module gọn, stable IDs và migration/version; export/restore có diễn tập. SQLite/D1 → Postgres cần sửa dialect, FTS, timestamp, auth storage và tests, không hứa chuyển một click. Chuyển DB không đồng nghĩa phải chuyển toàn bộ frontend.

## 5. Moderation, nguồn và rủi ro

Policy dưới đây là **PROPOSED**, chưa có endpoint hoặc workflow thật:

1. Candidate/submission → pending_review → needs_changes hoặc approved/rejected; chỉ bản resource đã được người có quyền xuất bản mới public. Khi sửa mục đã public, giữ revision đang public cho tới khi bản mới được duyệt.
2. Admin kiểm URL gốc, quyền liên kết/phân phối, giá/giấy phép, nội dung tiếng Việt và bằng chứng trước publish. Không host installer/ISO/tài liệu/game; open source của code không cấp quyền tự động cho artwork/media/trademark.
3. Reports có loại link lỗi, mô tả sai, spam, an toàn, quyền nội dung. Ghi thời điểm/người xử lý/lý do, cho sửa hoặc archive và đường yêu cầu xem xét lại. Cam kết thời gian xử lý và người trực vận hành chưa chốt.
4. Vote chỉ từ tài khoản hợp lệ; rate limit, chống self-vote/xung đột lợi ích và review spam. Ẩn review text đang chờ duyệt; nếu loại điểm khỏi ranking phải có lý do/audit và chính sách nhất quán.
5. Import server về sau ưu tiên GitHub allowlist; chỉ HTTPS, chặn credential URL, IP private/loopback/metadata, kiểm lại mỗi redirect/DNS resolution, timeout/byte/content-type limit. Không clone/run code, không fetch URL người dùng ngay từ client để né validation.
6. README/web/AI là input không đáng tin. Markdown sanitize, không raw HTML tùy ý; không prompt tools thực thi; không gửi email/secret/private source vào AI. Chuẩn hóa URL theo provider, không xóa query có ý nghĩa chỉ để dedupe.

Rủi ro lớn: Workers Free CPU nhỏ cho SSR; D1 row scan/write amplification; search tiếng Việt; auth security/version; nguồn/giấy phép không rõ; bias do ít phiếu và Sybil; Gemini quota/schema khác model; AI bịa claim hoặc prompt injection; public/private cache lẫn nhau. Gate kiểm thử và giới hạn được ghi tại tài liệu kỹ thuật/reuse.

## 6. Prototype và cách nghiệm thu

Mở [prototype tương tác](../prototype/index.html) hoặc [bảng so sánh A/B desktop + 390px](../prototype/review.html) trực tiếp bằng trình duyệt; hướng dẫn HTTP preview tùy chọn trong [SETUP](../SETUP.md). Không cần cài dependencies hay API key. “Nếp” chỉ là tên thử nghiệm, chưa chốt thương hiệu.

- **A — Minimal Editorial Library:** khoảng trắng và typography lớn, nhóm tuyển chọn/biên tập dẫn dắt; bản hiện tại chưa đạt kỳ vọng của chủ dự án, không coi là concept đã duyệt.
- **B — Minimal Product Discovery:** ưu tiên scan/search/list, mật độ cao hơn; phù hợp người đã biết nhu cầu và muốn so nhanh.
- Phạm vi: Home, khám phá/search/filter, chi tiết, khung 390px và sơ đồ UX admin URL → metadata → AI draft → preview. Các con số/review/AI chỉ là fixture; không có AI request hay publish thật.
- Kiểm bằng người dùng: chọn A/B; tìm một nhu cầu, lọc nền tảng, mở chi tiết/nguồn; thử không có kết quả, reload/back và keyboard; xem 390px; nhập URL lỗi rồi URL hợp lệ trong demo admin; phân biệt draft với nội dung công khai.

## 7. Validation

Kết quả chạy thực tế, lệnh và giới hạn cập nhật trong `TASKS.md`. Không chạy build/lint/framework tests vì chưa có package/application; không gọi API AI, OAuth, DB/cloud hoặc tài nguyên trả phí.

| Kiểm tra | Kết quả | Phạm vi |
| --- | --- | --- |
| Đọc đủ tài liệu, inventory/source/config và Git | PASS audit; Git không khả dụng | Không có Git repository để diff/commit |
| Official docs + Context7 compatibility/quota/reuse | PASS nghiên cứu | Không tương đương runtime hoặc kiểm bill |
| HTML/JS và smoke fixture UX | PASS | `node --check`; 12 checks Node VM/DOM giả lập và regression sau sửa; HTML IDs/assets/local Markdown links, không có network API trong prototype |
| Nguồn web không đọc được | FAIL truy cập, không kết luận dịch vụ lỗi | Gemini structured-output redirect lỗi tool; 3 candidate lỗi và 4 empty, chi tiết tại reuse report |
| Browser desktop, viewport 390px, keyboard/console thật | SKIP | CUA trả browser host/native pipe unavailable |
| Astro build/Workers CPU/D1 migrate/query/restore | SKIP | P00 nghiên cứu, chưa scaffold/cài stack |
| OAuth/session/SSRF/rating integration/Gemini schema thật | SKIP | Chưa backend/credential/API; thực hiện tại phase tương ứng |
| Deployment, DNS, cloud production | SKIP theo phạm vi | Không tạo tài nguyên, không push/deploy |

## 8. Lựa chọn cần chốt và P01

**Đã chốt:** P01 public catalog trước, ưu tiên Astro/TypeScript + Workers/D1, cần kiểm runtime thật. Auth, community ratings, submissions hoàn chỉnh và AI thật theo phase sau. **Chưa chốt:** UI; cả A/B chưa được chấp nhận, chờ brief vòng thiết kế tiếp thay vì mặc định chọn A. Tìm kiếm/lọc/khám phá nhanh, thông tin rõ và dễ dùng cho catalog lớn vẫn là yêu cầu. Tên/domain, Google login, upload, discovery cron và ngân sách giữ trạng thái tương ứng trong DECISIONS.

P01 sau khi được giao: pin stack, scaffold tối thiểu, local migration/fixture + backup/restore, catalog/search/detail SEO, import/seed local, tests dữ liệu và browser QA thật. Khi chưa qua gate này, không coi prototype là foundation production.

Chủ dự án đã chọn **để sau, chưa cài Ponytail**. Tiếp tục Reuse Ladder/Ponytail Principle trong AGENTS.md; không đổi cấu hình agent hoặc trust hooks. Quyết định này không chặn P00.

**Dừng tại P00 READY FOR REVIEW; không bắt đầu P01 khi chưa có yêu cầu tiếp.**

## 9. File thay đổi

- Cập nhật: `README.md`, `SETUP.md`, `PROJECT.md`, `ROADMAP.md`, `TASKS.md`; `docs/DESIGN_SYSTEM.md`, `docs/DECISIONS.md`, `docs/ARCHITECTURE.md`, `docs/AI_PROVIDERS.md`.
- Tạo: báo cáo này, `docs/PHASE00_TECH_VALIDATION.md`, `docs/PHASE00_REUSE_AUDIT.md`; `prototype/index.html`, `prototype/review.html`, `prototype/styles.css`, `prototype/app.js`.
- `AGENTS.md` giữ nguyên. Không có dependency/lockfile, secret, migration, deploy config hoặc tracker trùng. Git không có nên danh sách này là inventory thao tác, không phải Git diff.
