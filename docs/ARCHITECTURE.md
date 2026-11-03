# ARCHITECTURE — Phương án khởi đầu, có đường lớn lên

> **AGREED về định hướng P01:** public catalog trước, ưu tiên Astro + TypeScript + Cloudflare Workers/D1 (chủ dự án xác nhận 03/11/2026). Chi tiết bên dưới vẫn PROPOSED, chưa runtime-verified; P01 chưa bắt đầu, chờ UI được duyệt và lệnh triển khai. Có đường lên VPS/Postgres khi cần, không cam kết di chuyển một click.

## 1. Nguyên tắc kiến trúc

1. Bắt đầu với **modular monolith** (một sản phẩm, ranh giới module rõ), không tách microservice sớm.
2. Nội dung công khai ưu tiên HTML server-rendered/pre-rendered, indexable, ít JS client; API và admin động chỉ khi cần.
3. Business rules (moderation, ranking, taxonomy, AI output) không phụ thuộc trực tiếp nhà cung cấp AI hoặc UI framework.
4. Tách adapter I/O (DB, API bên ngoài, AI, auth, object storage) khỏi core logic; chỉ tạo boundary đang thực sự cần.
5. Không chạy script/repo do người dùng đề xuất trong Cloudflare Worker hay trên máy chủ.

## 2. Stack đề xuất để thử nghiệm

| Mảng | Mặc định đề xuất | Ghi chú |
| --- | --- | --- |
| Frontend/SEO | Astro + TypeScript | Chủ yếu page/catalog, phần interactive chỉ hydrate khi cần |
| Host | Cloudflare Workers + static assets | Đề xuất prerender public khi phù hợp; SSR phải đo CPU Free; không dùng adapter Pages cũ |
| SQL database | Cloudflare D1 (SQLite) | Free mỗi DB 500 MB, tổng account 5 GB; phải có index và đo rows scanned |
| DB access | SQL rõ ràng hoặc Drizzle nếu giảm công thực tế | Migration có version, không cần ORM “cho đẹp” |
| Authentication | Google OAuth qua giải pháp auth đang bảo trì | Kiểm tra session, CSRF, Cloudflare compatibility; chưa khóa thư viện |
| Media | Link nguồn gốc, assets nhỏ trong project; R2 **khi cần** | Không host file phần mềm/tài liệu bản quyền trong MVP |
| AI | Gateway do app sở hữu, Gemini adapter đầu tiên | Chi tiết `AI_PROVIDERS.md` |
| Search | Pagefind cho prerender hoặc D1 FTS5 cho on-demand, sau spike | Kiểm tiếng Việt và freshness; không mặc định dùng LIKE scan toàn catalog |
| Scheduled discovery | Cron Trigger / admin task có giới hạn | Sau MVP, batch nhỏ + rate limit + hàng chờ phê duyệt |

Tài liệu chính thức: https://docs.astro.build/en/guides/integrations-guide/cloudflare/ và https://developers.cloudflare.com/d1/platform/limits/ . Hạn mức thay đổi theo thời gian: rà lại trước khi deploy.

Rà tài liệu ngày 03/11/2026: xem [kiểm chứng kỹ thuật P00](PHASE00_TECH_VALIDATION.md) để biết version snapshot, quota/chi phí, rủi ro workerd và các kiểm thử còn SKIP. Đây là kiểm chứng tài liệu, chưa phải runtime spike. Schema/taxonomy chi tiết đề xuất xem [reuse audit](PHASE00_REUSE_AUDIT.md); chỉ tạo bảng theo phase thực làm.

## 3. Các module nghiệp vụ

```text
src/
  domain/           # types, validation, taxonomy, ranking logic (không import SDK cloud)
  features/
    catalog/        # tài nguyên, nguồn, category/tag, link status
    submissions/    # đề xuất của cộng đồng + lịch sử duyệt
    ratings/        # điểm, review, chống spam, báo cáo
    editorial/      # bài hướng dẫn, nội dung đã xuất bản
    discovery/      # tìm nguồn mới, metadata fetch, deduplication
    ai/             # task, schema, router, provider adapters
  infrastructure/   # DB, GitHub API, auth, storage, queue cụ thể
  pages/            # Astro routes
```

Đây là **sơ đồ trách nhiệm**, không phải yêu cầu bắt buộc phải tạo toàn bộ folder từ ngày đầu. Chỉ sinh folder/module khi implement feature thật.

## 4. Dữ liệu cốt lõi (logical model)

| Bảng | Nội dung và ràng buộc |
| --- | --- |
| `resources` | `id` bất biến, `slug` riêng, `title`, `summary`, `canonical_url`, `status`, `created_at`, `updated_at`, `last_verified_at`; type qua quan hệ nhiều-nhiều, primary type nếu có chỉ phục vụ hiển thị |
| `sources` | URL nguồn, provider (GitHub/manual...), external ID, metadata snapshot, fetched_at; unique canonical provider ID khi có |
| `terms`, `resource_terms` | Taxonomy nhiều-nhiều với facet cố định type/topic/audience/platform/function; category primary chỉ là một góc nhìn, không tạo thêm hệ tag song song |
| `resource_contents` | hướng dẫn/ghi chú biên tập, provenance, revision và editor |
| `users` | định danh account & role, hạn chế lưu PII |
| `submissions` | người gửi, resource candidate, status, notes và moderator |
| `ratings` | `user_id`, `resource_id`, `score`, timestamp; `UNIQUE(user_id, resource_id)` |
| `reviews` | nội dung đánh giá, cờ kiểm duyệt, sửa đổi (có thể gộp với ratings khi MVP) |
| `reports` | link chết, sai mô tả, nghi ngờ malware, bản quyền, spam |
| `audit_logs` | ai thay đổi nội dung/quyền/trạng thái, lúc nào; không chứa token |
| `ai_jobs` | input hash, provider/model, prompt/schema version, status, token/cost, source provenance, output draft |

Tối thiểu dùng stable ID không đổi dù đổi tên/slug. Có unique index canonical URL đã chuẩn hóa; **normalization không được phá semantic query params cần thiết**. Tránh lưu toàn bộ nội dung README lớn nếu chỉ cần trích đoạn hợp lý, tôn trọng nguồn và API TOS.

## 5. Trạng thái và quyền truy cập

- `resource.status`: `draft`, `pending_review`, `published`, `rejected`, `archived`.
- Roles tối thiểu: `visitor`, `member`, `moderator`, `admin` (role là server-side, không tin client).
- Ai chưa đăng nhập: đọc public + click nguồn; đăng nhập: gửi đề xuất, sửa review của mình; moderator: duyệt nội dung; admin: taxonomy, cấu hình và audit.
- Mọi mutation phải validate phía server, kiểm session/authorization, chống CSRF khi dùng cookie, rate limit chống spam và bảo vệ khỏi XSS/script từ Markdown.
- Không public `draft`, `ai_jobs` raw input, email người dùng, logs nhạy cảm.

## 6. Xếp hạng tài nguyên

Không xếp “5 sao/1 phiếu” cao hơn “4.8 sao/300 phiếu” bằng trung bình đơn thuần. Đề xuất **Bayesian average** cho điểm 1–5 sao; Wilson dành cho mô hình phiếu nhị phân, không áp trực tiếp vào sao. Kiểm tra bằng test cụ thể và tránh công bố như một thước đo an toàn:

`bayesian = (v/(v+m))*R + (m/(v+m))*C`

Trong đó `v` = số đánh giá hợp lệ, `R` = trung bình mục, `m` = ngưỡng lượng phiếu cần để tin cậy, `C` = trung bình toàn site. Các tham số phải có config/test; chưa khóa số. Bảng “Mới”, “Được đánh giá cao”, “Biên tập chọn”, “Xu hướng” nên tách thuật toán. Hạn chế bot vote, nhiều account và tự đánh giá; report xung đột lợi ích.

## 7. Hiệu năng, SEO và chi phí

- Trang công khai cached theo route/data version; admin và user private responses **không public cache**.
- Pagination/keyset với index phù hợp; không SELECT toàn bộ catalog để lọc trên client.
- Meta title, canonical, sitemap, schema.org phù hợp; danh mục và detail server-rendered.
- Không gọi AI trên mỗi lượt xem trang. AI chạy **khi nhập link/batch theo lịch**, lưu bản nháp đã duyệt.
- Giới hạn max URL, redirect hops, response bytes, timeout cho fetch; chặn localhost/private IP/metadata IP để phòng SSRF; tôn trọng robots/TOS API.
- Quan sát error rate, cold/CPU time, số rows read/write, Gemini usage, traffic cache hits, chi phí.

## 8. Khi nào chuyển lên VPS / Postgres?

Chỉ chuyển khi có *bằng chứng* về quota, truy vấn nặng, full-text/search yêu cầu cao, job dài hạn, ảnh/file lớn, hoặc chi phí hiện tại không tốt. Trước khi chuyển:

1. Database adapter đủ hẹp để thay implementation, business logic không phụ thuộc SQL dialect; D1/SQLite sang Postgres vẫn cần **chuyển schema, query, index, migration và test**.
2. Export + backup định kỳ, diễn tập restore độc lập; kiểm encoding, timestamps, foreign keys, quyền và ID.
3. Chạy parallel/read-only verification hoặc staging, test dữ liệu, regression, rollback plan trước cutover.
4. Tách quyết định chuyển **host backend** khỏi chuyển **database**; có thể chuyển từng phần.

Không tạo abstraction cho giả định tương lai nếu khiến MVP phức tạp hơn lợi ích. Một interface cho AI là yêu cầu đã được nêu rõ; database có thể dùng query module gọn, chưa cần generic storage framework.

FTS là index tái tạo được. D1 hiện có hạn chế export với database chứa virtual table; phải kiểm runbook backup/rebuild trên local/copy, không drop index trên live một cách tự động. Không hứa SQL dump D1 import thẳng sang Postgres. Chi tiết và nguồn trong [báo cáo kỹ thuật P00](PHASE00_TECH_VALIDATION.md).

## 9. Kiểm thử tối thiểu

- Unit: taxonomy, normalization, ranking, validation, AI schema parsing.
- Integration local: migrate DB, unique rating, duplicate URL, quyền moderator/admin, submission transitions, cached/public/private boundary.
- Browser: search -> detail -> source; login -> rate/edit; submit -> preview -> moderation -> publish; responsive/keyboard.
- Security: prompt injection README, SSRF, XSS nội dung, spam, forged role/ID, CSRF.
- Staging có fixture giả, DB/keys tách production; không deploy/live data trước khi An duyệt.
