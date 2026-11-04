# P02 — Nhập, phân tích và quản trị local

05/11/2026 · **IN PROGRESS**. P01 vẫn READY FOR REVIEW. Baseline sạch `363c7f1` trên develop, ahead2 của origin/develop; Archify `301fd2a` được bảo toàn. Brief mới cho phép code/tests/commit local, không push/deploy/cloud/production.

## P02.0 — Audit và contract

**PASS source audit:** validator dựng object mới nên cần parse/preserve metadata optional; CLI P01 validate/generate SQL offline, upsert giữ ID/createdAt; D1 là projection đọc. CI remote staging seed từ Git, không có writer admin. Không tạo writer D1 thứ hai hoặc sửa CI trong P02. Không được sửa trực tiếp D1: dữ liệu chỉnh phải vào Git sau review. Trước lần đồng bộ cloud tương lai phải kiểm drift/backup, vì pipeline P01 hiện tại có thể ghi đè sửa trực tiếp trong DB; lượt này không chạy đồng bộ cloud.

**Quyết định05/11:** Git/JSON + CLI đã duyệt; website ứng dụng bổ sung bên cạnh GitHub public. Ba nhóm mới thay “Khác”: tài nguyên miễn phí, ứng dụng/công cụ miễn phí, mã nguồn mở/GitHub. Nhóm không loại trừ nhau; type/source/category/free-model/license/review tách biệt. Trial-only/paid-only không export. Deep AI cần preliminary suitable, final approval độc lập; AI không bắt buộc. Hai mode chung5 HTTP requests/ngày Asia/Ho_Chi_Minh, mỗi retry tính một lượt.

**Reuse Audit:** mở rộng CLI/catalog validator/SQL generator; Node24 stdlib filesystem/crypto/DNS/HTTPS/SQLite có sẵn. Không thêm npm package/MCP/global tool/admin web/DB/schema D1/public UI. REST nhỏ phù hợp hai adapter và một Gemini provider; không cần crawler framework hoặc AI SDK/router. Context7 + official GitHub/Gemini docs đã kiểm; không có Gemini key/project/free tier được xác nhận nên live AI phải SKIP. API/free quota không được bảo đảm chỉ theo tên model.

**Milestones:** P02.0 audit PASS; P02.1–6 đang thực hiện. Commit/test/giới hạn mỗi mốc sẽ được bổ sung sau khi chạy thật. Snapshot Archify05 vẫn mô tả proposal04/11, không xem là sơ đồ implementation05/11.

## P02.1 — URL, identity và network boundary

P02.0 checkpoint `0aed560`. **PASS:** `node --test tests/editorial-network.test.mjs tests/catalog.test.mjs`18/18. GitHub .git/www/case/query variants, website normalization, aliases/stable IDs, không merge theo tên; DNS mixed-private/internal/IPv6 transition blocks, timeout, pin lookup trước TLS; redirect kiểm lại từng hop, API credentials chỉ cùng allowlist host. Không thực thi HTML/source, không npm dependency. Validator giữ optional sourceIdentity/editorial metadata trong Git, SQL projection P01 không đổi; không migrate/backfill catalog thật. Live socket/redirect tests mở rộng tại P02.6; đây chưa phải integration cloud.
