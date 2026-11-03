# P01 — Foundation, catalog và GitHub → Cloudflare

> Vòng hoàn thiện04/11: [ba bản sửa P1 và validation](PHASE01_P1_FIXES.md) là cập nhật mới nhất; các log/test counts bên dưới thuộc checkpoint03/11. Tài liệu Final Audit trước đó được giữ nguyên.

03/11/2026 · **READY FOR REVIEW — Preview P01**, chờ chủ dự án nghiệm thu. GitHub→Workers Builds→Preview,45 cloud browser checks và auto-update PASS. Đã nhận thêm log main live PASS: build bỏ qua có chủ ý, deploy no-op, không production. Các lần main Failed giữ riêng trong lịch sử; chưa kết luận mọi lần retry đều thành công. UI/P02 vẫn chờ duyệt.

## Account và tài nguyên hiện tại

Account đích được chủ dự án xác nhận là **`4ca521c6746d874c049fd829121ab59e`**, nhãn **Nguyenducbang.uit@gmail.com's Account**. OAuth riêng của dự án đã thành công; whoami đối chiếu đúng ID. Cache nằm trong `.cache/free-resources-auth` và `.cache/free-resources-auth-cache`, được ignore. Mỗi lệnh dùng phiên dự án đặt XDG_CONFIG_HOME/XDG_CACHE_HOME riêng; phiên global Ctcm không bị thay đổi.

| Tài nguyên đã tạo và đọc lại | Giá trị |
| --- | --- |
| Worker | `digital-resource-hub-staging` |
| Worker ID | `0540bcf9fa6448d6843935471fe0265c` |
| Trạng thái Worker cha | 1 version khởi tạo chưa deploy, workers.dev tắt, deployed_on:null; ứng dụng chạy trong Preview develop |
| Preview | [develop](https://develop-digital-resource-hub-staging.nguyenducbang-uit.workers.dev), ID 9198f00ce8c14f3cb2dc3aa5c32b53fa |
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
| Unit/SQLite/CI | PASS: 22 tests, gồm 13 catalog và 9 guard; từ chối account sai, fork và URL giả; nhận URL checkout GitHub có credentials mà không log credentials |
| Local D1 | PASS: migrate/seed/query, restore riêng, FK/FTS và atomic rollback |
| Browser Astro dev | PASS: 45 checks, 1440/768/390, 20 PNG, không lỗi console/pageerror bình thường |
| Browser built Worker local | PASS: 45 checks riêng, 20 PNG, DB simulator cô lập |
| Build/dry-run | PASS: artifact đã build mới trên account đúng/D1 mới, generated config top-level/Preview khớp; dry-run PASS, gzip 173.80 KiB, không KV/Images hoặc upload. Artifact sai account đã hủy |
| Assets/fonts | PASS: 14 manifest entries và hash OFL; giữ byte license upstream |
| Cloud đúng account | PASS: xác thực, tạo/đọc lại Worker/D1, D1 migrate/seed/query |
| Cleanup account sai | PASS: xóa đúng hai tài nguyên theo yêu cầu; GET 404 |
| GitHub | PASS: repo public, sunny251010 có quyền push; develop app508a96c + QA31d3053; main fast-forward31d3053 đúng quyền kiểm một lần; checkpoint docs bàn giao xem git log |
| Workers Builds API đúng account | SKIP đọc logs tự động: OAuth thiếu quyền, endpoint list builds403/code12004; log đầy đủ do chủ dự án cung cấp đã đọc và trích lưu |
| Git connection | PASS qua ảnh Dashboard: đúng repo, main no-op, Preview command và token riêng có D1 Edit |
| Workers Builds develop | PASS build 7de0b863 tại 508a96c; ảnh Dashboard xanh cả build/deploy, API deployment annotations khớp repo/commit |
| Preview/cloud browser | PASS: 45 checks thực qua HTTPS1440/768/390, 20 PNG, 0 lỗi console/page bình thường; Home/Explore/Detail/Search/D1, keyboard/filter/pagination/ảnh/font/noindex |
| Preview auto-update | PASS: push31d3053 tạo deployment7a79bea8-f3e9-473d-9567-2e4d38ae1f00 mới, cùng URL/DB; log develop xác nhận updated,5 smoke checks sau cập nhật PASS |
| Main không release production | PASS một lần main live: log kết thúc16:01:15.010UTC xác nhận hai no-op commands thành công, Dashboard Ready43s/No active deployment. Build UUID/SHA riêng của dòng xanh chưa được cung cấp; các lần Failed là lịch sử riêng |
| Physical mobile/keyboard/AT/cross-browser | SKIP: chỉ Chromium và viewport emulation |

[Gallery local và cloud](../qa/p01/index.html), [45 checks cloud](../qa/p01/cloud/results.json), [API readback binding/Worker/D1](../qa/p01/cloud-preview.json). Error/loading dùng QA interception có nhãn; 3 lỗi503 có chủ đích không bị gộp vào console bình thường. Một query QA ban đầu dùng nhầm resource_id trong FTS đã FAIL; sửa dùng rowid theo schema rồi read-only query PASS, không đổi schema hoặc dữ liệu.

## Git và việc còn lại

Repo [ducbang02/FreeResources](https://github.com/ducbang02/FreeResources), tác giả/push `sunny251010` được chủ dự án duyệt. Baseline `c862af9`, app `ddae9fe`, đính chính `ace99a1`, đúng account/cleanup `bf46b7a` đã push main/develop; connection/bootstrap `2be13d0` chỉ push develop. Prototype và lịch sử giữ nguyên; không commit credential/cache/artifact.

Builds API đã kiểm **riêng trên account đúng**, endpoint list builds403/code12004. Chủ dự án cung cấp full log build7de0b863; [trích đoạn](../qa/p01/build-7de0b863.txt) ghi rõ phần rút gọn. Log xác nhận22 tests, typecheck0errors/warnings/hints, Astro build, migration remote không còn pending,129 seed queries vào DB đúng và wrangler preview trả URL/unique deployment URL. Postinstall warning không làm fail build/runtime; không mở rộng quyền scripts hoặc nâng dependency theo suy đoán. Browser điều khiển Dashboard không hoạt động, nhưng Chromium QA live website đã hoạt động.

Lỗi build đầu fdbb35ab/2be13d0 tại origin guard được giữ làm lịch sử trong [record](../qa/p01/build-origin-failure.json). Bản sửa508a96c đã được cloud build thật kiểm thành công. URL origin chứa credentials không được log; không coi dạng origin cụ thể là đã biết. Giữ các test fork/host giả, branch/SHA/account/DB và kiểm đối chiếu develop chính thức.

`npm run ci:build` bỏ qua main, chỉ build develop; production `npm run ci:production` no-op; Preview `npm run ci:preview:deploy`. Dashboard bật non-production builds; guard chỉ cho develop qua. Node/npm đã pin trong repo, NODE_VERSION ở UI là tùy chọn.

Build xanh và Preview/D1 đã đọc lại: deployment đầu e4cac6f1-75af-43c0-8ab0-eb63e90ea122/tag508a96c, DB đúng UUID staging, APP_ENV=staging, ASSETS; không binding khác. Push QA31d3053 tạo deployment mới7a79bea8-f3e9-473d-9567-2e4d38ae1f00, cùng URL/DB; [auto-update proof](../qa/p01/cloud-auto-update.json), [5 smoke checks sau cập nhật](../qa/p01/cloud-post-update.json). Diff source/config/lock/migrations/catalog giữa508a96c và31d3053 trống, nên45 browser checks vẫn cùng app đã kiểm. Parent deployed_on:null, workers.dev false, số version bootstrap giữ1. Một Workers Builds pipeline, không Actions song song; không production/DNS/paid plan/P02.

Chủ dự án đã duyệt riêng một lần fast-forward main từ bf46b7a tới31d3053 sau khi automatic review chặn thao tác chưa có quyền. Push đúng checkpoint đã thành công; không sửa settings hoặc scripts release. Diff hai script main từ main cũ tới checkpoint này trống; local main no-op PASS. Lần aa369850 FAIL do khởi tạo timeout15:48:59UTC, chưa clone/chạy commands: [log lịch sử](../qa/p01/build-main-31d3053-timeout.txt). Sau đó đã nhận log main live thành công ở cập nhật bên dưới; [protection proof](../qa/p01/main-protection.json) giữ cả hai kết quả. Quyền push thử main không phải quyền release production hoặc quyền pushmain không giới hạn.

Full log develop31d3053 đã được chủ dự án cung cấp ở3 file trùng SHA-256; [trích đoạn và hash](../qa/p01/build-develop-31d3053.txt) xác nhận22 tests, typecheck0errors/warnings/hints, remote DB đúng, Preview updated và build completed. Bàn giao không cần đổi code/token theo lỗi main init. Giới hạn còn lại: Worker Previews là open beta của Wrangler4.156.2; physical devices/software keyboard/AT/Safari/Firefox SKIP. Review không đồng nghĩa phê duyệt production hoặc P02.

Cập nhật riêng từ chủ dự án trong lúc audit: [main Ready43s và log thành công](../qa/p01/build-main-noop-success.txt) xác nhận “Production build intentionally skipped” và “No upload, migration or deployment performed”, kết thúc16:01:15.010UTC. Main live no-op đã PASS một lần; không còn SKIP phép thực thi hai commands. `BLOCKED` là nội dung khóa production có chủ ý, không phải lỗi job. UUID/SHA riêng dòng xanh không hiện trong bằng chứng; main remote vẫn31d3053 tại đọc refs. Dòng main Failed mới hơn chưa có log nên không suy là commit cũ hoặc cùng nguyên nhân. Không retry/sửa CI trong audit. [Final Audit/P02 preparation](PHASE01_FINAL_AUDIT.md) ghi3 P1 UI/UX chưa sửa; UI chưa được nghiệm thu.

Luồng hiện tại: **sửa local → test/commit → push develop → Cloudflare checks/build → kiểm account/DB → migrate/seed D1 staging → Preview → browser QA/chủ dự án review**. Main gọi no-op. Bản giải thích từng bước và sơ đồ tại [runbook](PHASE01_PREVIEW_RUNBOOK.md#luồng-làm-việc-hiện-tại-đọc-từ-trái-sang-phải).

[Runbook](PHASE01_PREVIEW_RUNBOOK.md), [kết nối cloud](PHASE01_CLOUD_CONNECTION.md), [SETUP](../SETUP.md), [tracker](../TASKS.md).
