# P01 — Catalog, provenance và D1 local

Ngày kiểm tra: 03/11/2026. Phần catalog đã có schema, seed và truy vấn đọc; đây không phải nghiệm thu toàn bộ P01 hoặc xác nhận cloud đã triển khai.

## Reuse Audit

Chọn D1 native prepared statements và SQLite FTS5; không thêm ORM, search service, dashboard admin hoặc bảng tương lai. Validator/normalizer dùng chung giữa query module và CLI offline. CLI chỉ đọc JSON, kiểm dữ liệu/asset rồi sinh SQL để review; không fetch, không thực thi mã repo và không kết nối cloud.

Các đường dẫn và lệnh thuộc dự án này, không thêm vào AGENTS universal. Tài nguyên và bindings local/cloud do root kiểm tra riêng trước khi áp dụng SQL.

## Schema P01

`migrations/0001_catalog.sql` tạo:

- `resources`: stable ID, slug/canonical URL unique, primary type, summary/description, platform JSON, license/pricing nullable, status, media, featured/curated ranks, timestamps và normalized search text.
- `resource_types`, `categories`, `tags`: taxonomy lưu trong database; UI lấy qua query, không tự khai báo lại taxonomy.
- `resource_categories`, `resource_tags`: quan hệ nhiều-nhiều, composite primary keys, foreign keys và index ngược theo facet.
- `sources`: nguồn URL chính thức, các field có bằng chứng và thời điểm xác minh; unique `(resource_id,url)`.
- `resource_search`: FTS5 derived index, insert/update/delete triggers. Không có users, ratings, submissions, AI jobs hoặc bảng chưa dùng.

Index phục vụ published/type, featured, curated, updated; source/relation lookup có index. Search chuẩn hóa dấu tiếng Việt và đ/Đ, tách tối đa12 token, quote từng token FTS và bind query; không ghép từ khóa vào SQL. Facets category/type/platform bind parameters. Trang8 mục mặc định, tối đa24; search preview tối đa4. Home, Detail, Explore và Search chỉ trả `published`.

`src/lib/catalog.ts` xuất `listResources`, `getResource`, `getHome`, `getTaxonomy`, `searchResources`. Home chọn featured/curated từ D1, không hardcode LocalSend trong UI. Primary type là góc nhìn hiển thị; categories/tags vẫn nhiều-nhiều. Một repo có thể được mô tả với tag công năng thay vì bị ép thành category lập trình.

## Dữ liệu thật và nguồn đã rà

13 tài nguyên, đủ7 primary types,17 source records. Mô tả tiếng Việt là bản biên tập ngắn dựa trên nguồn, không sao chép nguyên bài. Không có rating, review count, stars hoặc thống kê tải bịa. License/platform chưa đủ bằng chứng được để `null`/mảng rỗng và ẩn phù hợp. Verification ngày03/11 được ghi trong seed ở UTC đầu ngày; không phải cam kết kiểm tra lại liên tục.

| Tài nguyên | Loại | Nguồn dùng xác minh | Quyết định dữ liệu |
| --- | --- | --- | --- |
| LocalSend | application | [Website](https://localsend.org/), [license](https://raw.githubusercontent.com/localsend/localsend/main/LICENSE) | Chuyển file mạng nội bộ,5 OS, miễn phí, Apache-2.0 |
| Excalidraw | online_tool | [Repo chính thức](https://github.com/excalidraw/excalidraw), [license](https://raw.githubusercontent.com/excalidraw/excalidraw/master/LICENSE) | Bảng trắng web, MIT cho source; không gán MIT cho mọi dịch vụ thương mại |
| Godot Engine | application | [Website](https://godotengine.org/), [license engine](https://godotengine.org/license/) | Engine2D/3D, miễn phí, MIT cho engine; platform chưa seed |
| OBS Studio | application | [OBS Project](https://obsproject.com/) | Ghi hình/live stream, Windows/macOS/Linux, miễn phí; license chưa seed |
| LibreOffice | application | [Website](https://www.libreoffice.org/) | Writer/Calc/Impress, miễn phí; platform/license chưa seed |
| Visual Studio Code | application | [Website](https://code.visualstudio.com/), [download](https://code.visualstudio.com/download) | Trình soạn mã, Windows/macOS/Linux, miễn phí; license phân phối không đồng nhất với repo nên để unknown |
| PhET | learning_resource | [University of Colorado](https://phet.colorado.edu/) | Mô phỏng học khoa học/toán trên web, miễn phí; không phân phối lại mô phỏng |
| MDN Web Docs | learning_resource | [MDN](https://developer.mozilla.org/en-US/) | Tài liệu HTML/CSS/JS/web API; license nội dung/sample chưa seed |
| freeCodeCamp | learning_resource | [Repo và curriculum chính thức](https://github.com/freeCodeCamp/freeCodeCamp) | Học lập trình miễn phí trên web; không gán license phần mềm cho curriculum |
| Microsoft PowerToys | repository | [Microsoft Learn](https://learn.microsoft.com/en-us/windows/powertoys/), liên kết GitHub chính thức từ trang | Bộ tiện ích Windows miễn phí; không tải/chạy repo |
| OpenTTD | game | [About chính thức](https://www.openttd.org/about) | Game mô phỏng vận tải, GNU GPL2 cho game; không suy ra license mọi gói nội dung |
| Hướng dẫn cài Ubuntu Desktop | operating_system_resource | [Canonical documentation](https://ubuntu.com/desktop/docs/en/latest/tutorial/install-ubuntu-desktop/) | Chỉ liên kết hướng dẫn, không tải ISO hoặc thao tác cài hệ điều hành |
| Awesome Selfhosted | collection | [Repo chính thức](https://github.com/awesome-selfhosted/awesome-selfhosted) | Danh sách tuyển chọn dịch vụ/app tự host; không bảo chứng mọi project trong danh sách |

Nguồn PhET là SPA nên text extractor thấy nội dung hạn chế; title/meta chính thức xác nhận chủ đề và miễn phí. Không gán license nội dung từ suy đoán. Phiên bản ứng dụng cụ thể không ghi cứng vì không cần cho P01.

Hình và Noto Sans tái sử dụng pack P00.3 có manifest/license. Excalidraw artwork vẫn ghi rõ không phải screenshot, icon responsive derivative có credit. Seed không tải installer, tài liệu học, ISO hoặc game để phân phối lại.

## Local admin/import

```powershell
node scripts/catalog.mjs validate data/catalog.json
node scripts/catalog.mjs generate data/catalog.json data/seed.sql
```

Validator kiểm loại/trường/độ dài/taxonomy/timestamps, duplicate ID/slug/URL, HTTPS domain không credential/IP literal/local hostname, đường media local và file tồn tại, source evidence cho metadata công bố. Không tự xác minh nội dung nguồn bằng AI hoặc coi việc có URL evidence là proof mọi giá trị được nhập đều đúng: người biên tập vẫn phải đọc nguồn trước khi cập nhật.

Muốn thêm/sửa: sửa bản JSON có provenance rồi validate/generate, review diff SQL và chọn môi trường trước khi apply. Upsert chỉ dựa stable ID; đổi slug/URL giữ ID/createdAt và cập nhật FTS. Một ID khác chiếm slug/URL hiện có bị unique constraint chặn. Xóa một mục khỏi JSON không tự xóa database: đánh dấu `archived` để thay trạng thái có chủ đích.

Apply cả file bằng Wrangler D1 execute. Không chạy từng dòng riêng, không thêm BEGIN/COMMIT vào SQL D1. Đã đối chiếu installed Wrangler4.156.2: local execute tách SQL rồi gọi `db.batch(...)`; [D1 batch](https://developers.cloudflare.com/d1/worker-api/d1-database/) rollback cả sequence nếu một statement lỗi. **Không suy quy trình remote import có semantics giống local**; remote phải kiểm ở bước cloud do root thực hiện, chưa được lane này gọi.

## Diễn tập phục hồi local đã chạy

Source of truth hiện tại là JSON/migrations trong Git, vì P01 chỉ có quản trị local CLI. Phục hồi vào persistence directory khác giúp kiểm tái tạo catalog mà không sửa database app đang dùng:

```powershell
node_modules\.bin\wrangler.cmd d1 migrations apply DB --local --config wrangler.jsonc --persist-to .cache/catalog-restore
node_modules\.bin\wrangler.cmd d1 execute DB --local --config wrangler.jsonc --persist-to .cache/catalog-restore --file data/seed.sql
node_modules\.bin\wrangler.cmd d1 execute DB --local --config wrangler.jsonc --persist-to .cache/catalog-restore --command "SELECT count(*) AS resources,count(DISTINCT type) AS types FROM resources; SELECT count(*) AS sources FROM sources; PRAGMA foreign_key_check;" --json
```

Kết quả **PASS** trên workerd/D1 local:20 lệnh migration,129 lệnh seed,13 resources/7 types/17 sources; foreign_key_check rỗng; FTS `chuyen AND file` trả LocalSend. Đây là rebuild từ nội dung có version, **không phải snapshot backup database live**.

Đã thử transaction failure trên bản local cô lập: statement đầu sửa title LocalSend, statement sau gây duplicate slug; CLI trả lỗi và title vẫn `LocalSend` khi đọc lại. **PASS rollback**, không đổi database `.wrangler/state` đang dùng.

FTS là derived index. [D1 import/export limitations](https://developers.cloudflare.com/d1/best-practices/import-export-data/) hiện nói export database có virtual table không được hỗ trợ; không hứa full dump thành công hoặc tự drop FTS trên remote/live. Khi cần snapshot dữ liệu ngoài JSON: chốt phương án Time Travel hoặc logical export base tables với root, dựng bản sao để kiểm IDs/source/count, tạo lại schema/triggers và rebuild FTS ở bản sao. Không tự xóa index/bảng cloud để né limitation.

## Validation và giới hạn

| Kiểm tra | Kết quả |
| --- | --- |
| `node --test tests/catalog.test.mjs` | **PASS13/13**, Node SQLite: migration/seed/idempotency, stable upsert, unique collisions, source evidence, missing asset, URL/calendar validation, Vietnamese FTS/injection, combined facets, pagination/cap, taxonomy from DB, DB-driven Home, draft/archive exclusion |
| CLI validate + generate | **PASS**,13 resources/7 types, seed tái sinh từ JSON |
| D1 local isolated restore + FTS + foreign keys | **PASS**, thực thi Wrangler/workerd, không chỉ SQLite mock |
| D1 local batch failure rollback | **PASS**, ghi trước lỗi đã rollback trên bản cô lập |
| Strict TS riêng catalog | Không thấy lỗi module catalog khi chạy tsc; root chạy full Astro typecheck/build sau tích hợp |
| Browser/local app integration | Root kiểm riêng; không suy từ tests catalog |
| Remote D1/migration/Preview/production | **SKIP ở lane này**, không thực hiện cloud mutation |

Lỗi phát hiện và sửa: một test cũ đòi validator nhận biết license/platform bịa dù source đã đánh dấu field, vượt khả năng validator offline; test mới kiểm missing-evidence đúng failure path. Mở rộng guard IP literal/local domain, từ chối ngày UTC không tồn tại, thêm kiểm asset thật trước import. Không bỏ validation hoặc bẻ schema để làm test pass.
