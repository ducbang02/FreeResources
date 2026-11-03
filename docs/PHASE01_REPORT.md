# P01 — Foundation, catalog và GitHub → Cloudflare

03/11/2026 · **IN PROGRESS**. Local và D1 cloud đã kiểm; kết nối Workers Builds/Preview còn BLOCKED. Chưa READY FOR REVIEW, chưa deploy ứng dụng, production hoặc P02.

## Account và tài nguyên hiện tại

Account đích được chủ dự án xác nhận là **`4ca521c6746d874c049fd829121ab59e`**, nhãn **Nguyenducbang.uit@gmail.com's Account**. OAuth riêng của dự án đã thành công; whoami đối chiếu đúng ID. Cache nằm trong `.cache/free-resources-auth` và `.cache/free-resources-auth-cache`, được ignore. Mỗi lệnh dùng phiên dự án đặt XDG_CONFIG_HOME/XDG_CACHE_HOME riêng; phiên global Ctcm không bị thay đổi.

| Tài nguyên đã tạo và đọc lại | Giá trị |
| --- | --- |
| Worker | `digital-resource-hub-staging` |
| Worker ID | `0540bcf9fa6448d6843935471fe0265c` |
| Trạng thái Worker | 1 version khởi tạo chưa deploy, không bindings; workers.dev tắt; chưa upload ứng dụng |
| D1 cùng tên | `e28f4099-92cf-40bc-ab8c-c47138b4469d` |
| D1 cloud | 13 tài nguyên, 17 nguồn, 0 lỗi khóa ngoại; FTS tìm thấy LocalSend |
| Config | Binding DB top-level và Preview cùng UUID mới; target approved:true sau khi đọc lại |

[Bằng chứng tài nguyên](../qa/p01/cloud-resources.json), [D1 cloud](../qa/p01/cloud-d1.json). Guard ràng buộc cứng account đích và repo `ducbang02/FreeResources`, có test từ chối tái dùng account sai.

## Lịch sử đính chính và cleanup

Trước đó đã chọn nhầm account Ctcm `4873c68031c0fc5e0284943a9119dac2` do nhầm email đăng nhập với account. Kết quả cloud ở account này đã rút khỏi nghiệm thu; target/proof cũ bị thu hồi, artifact staging cũ bị xóa. Commit đính chính `ace99a1` đã push main/develop; không sửa lịch sử Git.

Sau đó người dùng yêu cầu rõ **xóa cả Worker và D1 đã tạo nhầm**. Cả hai đã xóa và GET đọc lại trả **404**:

| Tài nguyên lịch sử đã xóa | ID cũ |
| --- | --- |
| Worker digital-resource-hub-staging | `000318f0fc78496aad07c79236818428` |
| D1 digital-resource-hub-staging | `fea09243-1d9b-4836-82ac-0dea72ef1668` |

[Record cleanup](../qa/p01/ctcm-cleanup.json). Các ID cũ chỉ phục vụ đối chiếu lịch sử, không dùng cho cấu hình hoặc triển khai. Worker cũ chưa có code deployment.

## Source và local đã hoàn thành

Astro 7.4.5/adapter 14.4.4, TypeScript 6.0.3 strict, Wrangler 4.156.2, checker 0.9.12, Node types 24.19.2. Node 24.18.0 tại `.node-version`, npm 12.2.0 tại `packageManager`; giữ lockfile và stack hiện có. Reuse Concept A/P00.3, Noto Sans/asset có license, native Astro SSR/router/dialog và D1 SQL/FTS5. Không thêm frontend framework, ORM, backend riêng, auth, rating hoặc AI thật.

Home featured/curated từ DB, hero full-width và một câu định vị. Explore có FTS tiếng Việt, taxonomy DB, filter/sort/grid-list/phân trang. Detail có nguồn/provenance và metadata đã kiểm; unknown ẩn, không rating giả. Overlay API có loading/empty/error/retry/abort và keyboard/focus; GET fallback khi không JS. Có title/description, sitemap/robots/noindex và security headers. Đóng góp trực tuyến ghi rõ chưa mở.

Schema 0001 có resources/resource_types/categories/tags/resource_categories/resource_tags/sources, FTS5/triggers/indexes. Catalog 13 tài nguyên thật/7 loại/17 nguồn; CLI validate/generate/upsert theo ID ổn định, URL/slug unique, kiểm evidence và asset. Không endpoint mutation public. [Catalog](PHASE01_CATALOG.md), [stack/reuse](PHASE01_STACK_AUDIT.md).

| Validation | Kết quả và giới hạn |
| --- | --- |
| Typecheck | PASS: 0 errors/warnings/hints |
| Unit/SQLite/CI | PASS: 21 tests, gồm 13 catalog và 8 guard; từ chối account sai |
| Local D1 | PASS: migrate/seed/query, restore riêng, FK/FTS và atomic rollback |
| Browser Astro dev | PASS: 45 checks, 1440/768/390, 20 PNG, không lỗi console/pageerror bình thường |
| Browser built Worker local | PASS: 45 checks riêng, 20 PNG, DB simulator cô lập |
| Build/dry-run | PASS: artifact đã build mới trên account đúng/D1 mới, generated config top-level/Preview khớp; dry-run PASS, gzip 173.80 KiB, không KV/Images hoặc upload. Artifact sai account đã hủy |
| Assets/fonts | PASS: 14 manifest entries và hash OFL; giữ byte license upstream |
| Cloud đúng account | PASS: xác thực, tạo/đọc lại Worker/D1, D1 migrate/seed/query |
| Cleanup account sai | PASS: xóa đúng hai tài nguyên theo yêu cầu; GET 404 |
| GitHub | PASS: repo public, sunny251010 có quyền push; main/develop đến ace99a1 |
| Workers Builds API đúng account | FAIL quyền hiện tại: HTTP 403, error code 10000 |
| Preview/CI/cloud browser | SKIP: chưa có connection và Preview URL đã kiểm |
| Physical mobile/keyboard/AT/cross-browser | SKIP: chỉ Chromium và viewport emulation |

[40 screenshot và JSON local](../qa/p01/index.html). UI/app local PASS không thay thế cloud browser PASS. Các lỗi harness đã được sửa và kiểm lại; không che lỗi runtime sản phẩm.

## Git và việc còn lại

Repo [ducbang02/FreeResources](https://github.com/ducbang02/FreeResources), tác giả/push `sunny251010` được chủ dự án duyệt. Baseline `c862af9`, app `ddae9fe`, đính chính `ace99a1` đã push main/develop. Thay đổi account đúng/cleanup trong working tree cần checkpoint tiếp theo; không khẳng định đã push các thay đổi này. Prototype và lịch sử giữ nguyên; không commit credential/cache/artifact.

Builds API đã kiểm **riêng trên account đúng**, vẫn trả HTTP 403/code 10000; không suy từ probe cũ. Browser Use/Computer Use không khởi tạo được do sandbox helper. Chủ dự án chọn hỗ trợ Dashboard, không gửi token.

Cần nối đúng GitHub repo và đọc lại controls trước lần build đầu: `npm run ci:build` bỏ qua main, chỉ build develop; production `npm run ci:production` no-op; Preview `npm run ci:preview:deploy`, include chỉ develop. Node/npm đã pin trong repo, NODE_VERSION ở UI là tùy chọn.

Sau connection: build từ GitHub, lấy Preview URL thật, kiểm cloud browser/runtime/D1 và push tiếp theo tự cập nhật. Chỉ sau các gate này mới READY FOR REVIEW. Một Workers Builds pipeline, không Actions song song; không production/DNS/paid plan/P02.

[Runbook](PHASE01_PREVIEW_RUNBOOK.md), [kết nối cloud](PHASE01_CLOUD_CONNECTION.md), [SETUP](../SETUP.md), [tracker](../TASKS.md).
