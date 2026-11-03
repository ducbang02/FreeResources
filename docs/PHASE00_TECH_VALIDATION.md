# Phase 00 — Kiểm chứng stack và chi phí

> Rà ngày **03/11/2026**. Kết luận kiến trúc là **PROPOSED**; bằng chứng dưới đây là tài liệu chính thức đã đọc, **không phải** thử nghiệm Astro/D1/Cloudflare runtime. Không cài dependency, tạo cloud resource, gọi AI hay deploy trong lane này.

## 1. Kết luận đề xuất

Astro + TypeScript + Workers + D1 phù hợp catalog nội dung tiếng Việt ở quy mô đầu: HTML công khai, ít JavaScript, metadata quan hệ, quản trị có kiểm duyệt. **Chưa có bằng chứng SSR/auth/AI import chạy ổn trong Workers Free 10 ms CPU.** P01 nên prerender trang công khai khi phù hợp; chỉ dùng on-demand cho phần cần dữ liệu tức thời, đo CPU bằng fixture trước khi chốt.

Một codebase, query module gọn theo use case, không thêm backend riêng/cache service/queue/R2 khi chưa dùng. SQL migrations và quy tắc nghiệp vụ độc lập provider đủ tạo đường chuyển sang Postgres; không cần generic repository framework. Schema/taxonomy và lựa chọn search chi tiết nằm trong [reuse audit](PHASE00_REUSE_AUDIT.md).

## 2. Compatibility và version: không copy hướng dẫn cũ

Context7 đã resolve `Astro` → `/withastro/docs` (nguồn chính thức, nhiều snippet và relevance cao) và `Cloudflare D1` → `/llmstxt/developers_cloudflare_d1_llms-full_txt`; sau đó query riêng adapter/bindings và FTS/export. Context7 trả cả hướng dẫn Astro 6. Đã đối chiếu trang chính thức trực tiếp để tránh dùng snapshot cũ.

| Bằng chứng | Hệ quả cho P01 |
| --- | --- |
| [Astro Cloudflare adapter](https://docs.astro.build/en/guides/integrations-guide/cloudflare/) hiển thị v14.4.4; dev/preview dùng workerd, bindings qua `cloudflare:workers`; Pages đã bị bỏ khỏi adapter mới | Chọn Workers, không dùng ví dụ `Astro.locals.runtime.env` hoặc output `_worker.js` đời cũ |
| [Manifest adapter upstream](https://raw.githubusercontent.com/withastro/astro/main/packages/integrations/cloudflare/package.json) đang v14.4.3, peer Astro `^7.4.0`, Wrangler `^4.125.0`, MIT | Đây là snapshot main, chưa phải bộ version đã cài/đã test; docs và main lệch patch |
| [Manifest Astro upstream](https://raw.githubusercontent.com/withastro/astro/main/packages/astro/package.json) v7.4.5, Node `>=22.23.4`, MIT | Rà manifest của release thực chọn, pin package/lockfile ở P01; không chọn chỉ vì nhãn “Node LTS” |
| [Astro v7 guide](https://docs.astro.build/en/guides/upgrade-to/v7/) bỏ `@astrojs/db` | Dùng D1 binding/SQL hoặc Drizzle được đánh giá riêng; không thêm Astro DB |

Adapter mới mặc định biến đổi ảnh bằng Cloudflare Images binding; đề xuất P01 dùng asset tự sở hữu/build-time hoặc passthrough có kiểm soát, không tự provision dịch vụ ảnh. Node compatibility không biến Workers thành VPS đầy đủ. Thư viện CJS/Node native cần kiểm tra trong workerd thực tế. Nguồn: [adapter guide](https://docs.astro.build/en/guides/integrations-guide/cloudflare/).

## 3. Quota và chi phí đã đối chiếu

| Dịch vụ | Free hiện tại | Paid/đường nâng cấp | Ý nghĩa |
| --- | --- | --- | --- |
| Workers | 100.000 request/ngày; 10 ms CPU/request; 128 MB; 50 subrequest/request | Standard từ $5/tháng; gồm 10M request và 30M CPU-ms/tháng; vượt lần lượt $0,30/M request và $0,02/M CPU-ms | SSR + auth + parsing phải đo; thời gian đợi mạng không phải CPU |
| Static Assets | Request tới asset miễn phí và không giới hạn; tối đa 20.000 file/version, 25 MiB/file | Paid 100.000 file/version | `run_worker_first` có thể khiến asset gọi Worker và chịu quota |
| D1 | 5M rows read/ngày; 100.000 rows written/ngày; tổng storage 5 GB/account | Paid gồm 25B read + 50M write/tháng và 5 GB; vượt $0,001/M read, $1/M write, $0,75/GB-tháng | Rows scanned/index updates ảnh hưởng quota, không chỉ số query |
| D1 giới hạn cứng | 10 DB/account, **500 MB mỗi DB**, 7 ngày Time Travel; 50 query/invocation | Paid 10 GB/DB và 30 ngày Time Travel | 5 GB/account không có nghĩa một DB Free được 5 GB |

Nguồn bảng: [Workers limits](https://developers.cloudflare.com/workers/platform/limits/), [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/), [Static Assets billing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/), [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/), [D1 limits](https://developers.cloudflare.com/d1/platform/limits/). Giá USD, chưa gồm thuế/dịch vụ ngoài; đây không phải cam kết hóa đơn.

D1 vượt quota Free sẽ lỗi query tới khi reset; Workers Free cũng có giới hạn ngày. Reset 00:00 UTC tương ứng **07:00 giờ Việt Nam/Thái Lan**. Không tự bật paid plan. Ngưỡng cảnh báo đề xuất 70% quota, 85% cần giảm tải/lên kế hoạch; phải có chủ dự án duyệt ngân sách. Dùng `meta.rows_read/rows_written`, query plan và CPU để đo. Nguồn: [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/) và [Workers limits](https://developers.cloudflare.com/workers/platform/limits/).

Ví dụ tính toán, **không phải load test**: 10.000 search/ngày, mỗi lần scan 1.000 hàng → khoảng 10M rows read/ngày, đã vượt Free dù catalog nhỏ. Nếu query có index chỉ đọc 50 hàng/lần thì khoảng 500k; cần đo số thực. Không quy đổi quota thành lời hứa “hỗ trợ X người dùng”.

AI tách ngân sách khỏi hosting, mặc định tắt nếu chưa được cấp quyền; free hosting không làm Gemini miễn phí. AI không chạy trên lượt xem public. Chi phí auth email, domain, media hoặc monitoring nâng cao không nằm trong $0 giả định này.

## 4. Search và SEO

- D1 có FTS5; chưa xác minh tokenizer tiếng Việt, tìm không dấu, typo và relevance. `LIKE '%q%'` có thể scan toàn bảng; giới hạn pattern LIKE/GLOB **50 bytes** đặc biệt dễ gặp với UTF-8. Không coi parameter binding là giải pháp hiệu năng. Nguồn: [D1 SQL](https://developers.cloudflare.com/d1/sql-api/sql-statements/) và [D1 limits](https://developers.cloudflare.com/d1/platform/limits/).
- P01 thử Pagefind nếu public content được prerender và rebuild sau biên tập là chấp nhận được; nếu cần search dữ liệu vừa xuất bản tức thì, thử FTS5 local với tập truy vấn tiếng Việt. Quyết định vẫn PROPOSED; không cài search service lớn trước benchmark.
- Detail/category có URL ổn định, HTML indexable, canonical, title/description, breadcrumb và sitemap chỉ chứa bài published. Query/filter tổ hợp tránh sinh vô hạn URL indexable; admin/draft và search nội bộ không index. `noindex` không thay authorization. Đây là thiết kế, chưa đo SEO thật.
- Chỉ hiện `AggregateRating` khi rating hợp lệ hiển thị cùng trang; không dựng số phiếu giả, không hứa rich result. Prototype fixture phải gắn nhãn minh họa.

## 5. Đường lên Postgres/VPS tối thiểu

1. Giữ stable text ID, URL chuẩn hóa có unique constraint, UTC timestamps có convention, foreign key và constraint trong schema; query D1 ở vài module cụ thể, không rải binding trong UI/domain.
2. Export base tables + schema migrations versioned; FTS chỉ là index có thể tái tạo. [D1 export](https://developers.cloudflare.com/d1/best-practices/import-export-data/) hiện **không hỗ trợ DB chứa virtual table**, export chặn request khác. Cần thử runbook an toàn trên local/copy và rebuild FTS; không tự drop index trên live để backup.
3. Khi có nhu cầu, map SQLite types/SQL/FTS sang Postgres, tạo migration riêng, chuyển dữ liệu có kiểm count/hash/ID/quyền/encoding rồi restore thử. SQL dump SQLite không phải dump Postgres có thể import trực tiếp.
4. Có thể giữ frontend Workers và đổi DB, hoặc chuyển cả backend sang VPS; mỗi cách cần kiểm driver/pooling/network/session. Chưa thêm Hyperdrive hay dual-write. Cutover có cửa sổ ghi rõ ràng, backup, rollback và chủ dự án duyệt.

Trigger đánh giá lại: query/CPU thường chạm quota sau tối ưu, một DB sắp 500 MB, yêu cầu transaction/concurrency/search vượt khả năng đã benchmark, job dài hoặc tổng chi phí đáng kể. Thử nâng Workers Paid/D1 có thể ít công hơn migration VPS; VPS thêm patching, backup và vận hành, không mặc định rẻ hơn.

## 6. Validation và gate tiếp theo

| Kiểm tra | Trạng thái | Bằng chứng/giới hạn |
| --- | --- | --- |
| Đọc docs planning và audit source | PASS | Hiện có tài liệu, chưa có package/lockfile/source; parent xác nhận chưa có `.git` |
| Context7 resolve/query + đối chiếu nguồn chính thức | PASS | Có nguồn trực tiếp trong báo cáo; phát hiện lệch patch Astro |
| Xác nhận quota/chi phí/FTS-export qua docs | PASS | Chỉ kiểm chứng tài liệu, không gọi API tài khoản |
| Astro build + workerd SSR/D1 local | SKIP | Chưa scaffold/pin version; không cần để làm prototype tĩnh P00 |
| Tốc độ/CPU/load, tokenizer tiếng Việt, export/restore | SKIP | Phải spike ở P01 trước xác nhận runtime |
| Auth/AI/GitHub live/cloud deployment | SKIP | Ngoài phạm vi quyền P00; không có credential và không yêu cầu secrets |

P01 chỉ bắt đầu sau chốt hướng UI, scope catalog trước, D1 vs Postgres và cách public search/rebuild. Acceptance P01: pin version tương thích, migration/seed/restore local, constraint/dedupe/published-only, search tiếng Việt có dấu/không dấu + empty/error, browser 390px/desktop, CPU kiểm trong runtime phù hợp. Không chuyển lựa chọn stack sang VERIFIED chỉ từ tài liệu này.
