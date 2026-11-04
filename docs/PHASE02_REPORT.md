# P02 — Nhập, phân tích và quản trị local

05/11/2026 · **IN PROGRESS**. P01 vẫn READY FOR REVIEW. Baseline sạch `363c7f1` trên develop, ahead2 của origin/develop; Archify `301fd2a` được bảo toàn. Brief mới cho phép code/tests/commit local, không push/deploy/cloud/production.

## P02.0 — Audit và contract

**PASS source audit:** validator dựng object mới nên cần parse/preserve metadata optional; CLI P01 validate/generate SQL offline, upsert giữ ID/createdAt; D1 là projection đọc. CI remote staging seed từ Git, không có writer admin. Không tạo writer D1 thứ hai hoặc sửa CI trong P02. Không được sửa trực tiếp D1: dữ liệu chỉnh phải vào Git sau review. Trước lần đồng bộ cloud tương lai phải kiểm drift/backup, vì pipeline P01 hiện tại có thể ghi đè sửa trực tiếp trong DB; lượt này không chạy đồng bộ cloud.

**Quyết định05/11:** Git/JSON + CLI đã duyệt; website ứng dụng bổ sung bên cạnh GitHub public. Ba nhóm mới thay “Khác”: tài nguyên miễn phí, ứng dụng/công cụ miễn phí, mã nguồn mở/GitHub. Nhóm không loại trừ nhau; type/source/category/free-model/license/review tách biệt. Trial-only/paid-only không export. Deep AI cần preliminary suitable, final approval độc lập; AI không bắt buộc. Hai mode chung5 HTTP requests/ngày Asia/Ho_Chi_Minh, mỗi retry tính một lượt.

**Reuse Audit:** mở rộng CLI/catalog validator/SQL generator; Node24 stdlib filesystem/crypto/DNS/HTTPS/SQLite có sẵn. Không thêm npm package/MCP/global tool/admin web/DB/schema D1/public UI. REST nhỏ phù hợp hai adapter và một Gemini provider; không cần crawler framework hoặc AI SDK/router. Context7 + official GitHub/Gemini docs đã kiểm; không có Gemini key/project/free tier được xác nhận nên live AI phải SKIP. API/free quota không được bảo đảm chỉ theo tên model.

**Milestones:** P02.0 audit PASS; P02.1–6 đang thực hiện. Commit/test/giới hạn mỗi mốc sẽ được bổ sung sau khi chạy thật. Snapshot Archify05 vẫn mô tả proposal04/11, không xem là sơ đồ implementation05/11.

## P02.1 — URL, identity và network boundary

P02.0 checkpoint `0aed560`. **PASS:** `node --test tests/editorial-network.test.mjs tests/catalog.test.mjs`18/18. GitHub .git/www/case/query variants, website normalization, aliases/stable IDs, không merge theo tên; DNS mixed-private/internal/IPv6 transition blocks, timeout, pin lookup trước TLS; redirect kiểm lại từng hop, API credentials chỉ cùng allowlist host. Không thực thi HTML/source, không npm dependency. Validator giữ optional sourceIdentity/editorial metadata trong Git, SQL projection P01 không đổi; không migrate/backfill catalog thật. Live socket/redirect tests mở rộng tại P02.6; đây chưa phải integration cloud.

## P02.2 — GitHub API và nháp bền vững

P02.1 checkpoint `0f7807a`. Reuse entrypoint `scripts/catalog.mjs`; lệnh cũ validate/generate không đổi. Import/show/list/refresh lưu nháp/source/cache local, fsync+atomic rename và single-writer lock; không reset khi CLI restart. GitHub public REST **không dùng token**, tránh lỡ đọc private repo; rate headers/ETag/negative cache, không retry ẩn. README/license có thể thiếu; giữ unknown và cần review, không chuyển GitHub detection thành license đã xác minh. Refresh giữ editorial sửa tay, identity/aliases ổn định; không gọi AI hoặc sửa catalog.

**PASS:**8 tests P02 network/import; mock API public/private404/invalid/oversize/license missing/rename/ETag304/rate limit/restart/dedup/manual edit. CLI help chạy thực tế. GitHub document selector có allowlist path/extension, không clone/tải/chạy repo. Live GitHub request và CLI E2E đầy đủ thực hiện riêng ở QA cuối; chưa dùng credentials.

## P02.3 — Website ứng dụng chính thức

P02.2 checkpoint `1b2d974`. Adapter website dùng HTTPS/DNS boundary chung, tối đa256KiB response/64KiB head; lấy title/meta description dạng text, không chạy JS/nhúng ảnh/tải installer/crawl links. HTTP chặn/CAPTCHA/encoding/metadata thiếu → partial và cho phép thủ công; `--manual` không gọi mạng. Website/Free/giấy phép đều chưa xác minh cho đến người biên tập đối chiếu, không tin quảng cáo trong meta. Redirect lưu aliases, kiểm trùng, không tự chứng nhận domain chính thức.

**PASS:**11 P02 tests network/import/website; metadata/script/comment sanitization, free/license unknown, manual no-network, timeout403/non-HTML/CAPTCHA/missing head, redirect aliases/duplicate. Không thêm dependency hay public UI. Chưa chứng nhận website bên thứ ba live; fallback không phải bằng chứng nguồn đó đúng.
