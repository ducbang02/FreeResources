# SETUP — P01 / Windows / Astro + Workers + D1

Ngày 03/11/2026. Node 24.18.0/npm 12.2.0 được dùng. Lockfile pin Astro7.4.5, adapter14.4.4, Wrangler4.156.2, TypeScript6.0.3, checker0.9.12, Node types24.19.2. Không CLI global/framework frontend khác.

## Cài, chạy và kiểm thử

Trong D:\Workspace\FreeResources:

```powershell
npm ci --ignore-scripts
npm run db:migrate
npm run db:seed
npm run dev
```

Mở http://127.0.0.1:4321, Ctrl+C để dừng. Phiên này dùng npm install --ignore-scripts với dependency pin để tạo lockfile; setup trên máy sạch chưa kiểm riêng. Native optional binaries hiện tại chạy được không postinstall.

`wrangler.jsonc` chỉ local: binding DB, UUID giả, remote:false, D1 tại .wrangler/state/v3. Astro dev dùng workerd/Vite, remoteBindings:false. Không đổi sang remote để chữa lỗi local.

```powershell
npm run check
npm test
npm run build
```

Check sinh worker-configuration.d.ts rồi Astro check; không tự viết Env. File sinh/node_modules/dist/.astro/.wrangler/.cache không commit. 21 tests gồm validator, SQL/FTS/facets/draft/upsert/duplicates và guard CI; SQLite PASS không thay cloud PASS.

Browser QA dùng Playwright Core đã có, không runtime dependency:

```powershell
node tools/qa-p01.cjs D:\Workspace\CloneWebsite\KatTattoo\node_modules\playwright-core http://127.0.0.1:4321 qa/p01/local
```

Chỉ đọc thư viện dev ở repo khác, không copy source ứng dụng. Máy khác truyền package/browser đã cài; script không tự install. 1440/768/390, 20 screenshot mỗi lượt; physical mobile/software keyboard/AT chưa kiểm.

Ảnh test, kết quả JSON/readback, log và trace dưới `qa/` chỉ lưu local, không commit. Repo giữ test scripts, gallery HTML viết tay và báo cáo tóm tắt trong `docs/`. Clone mới cần chạy QA để tạo output; các link bằng chứng `qa/...` trong báo cáo là link artifact local. [Chính sách QA artifacts](qa/README.md). Không ignore ảnh/font/license thuộc website hoặc prototype.

## Local admin, migrations và phục hồi

```powershell
node scripts/catalog.mjs validate data/catalog.json
node scripts/catalog.mjs generate data/catalog.json data/seed.sql
npm run db:migrate
npm run db:seed
```

Sửa JSON, giữ ID bất biến, URL chính thức và nguồn cho từng claim. Field chưa xác minh dùng null/[]; ảnh local phải tồn tại và có quyền. Validate/generate rồi review SQL. Upsert theo ID, giữ createdAt, unique slug/URL; không xóa mục vắng trong file, dùng draft/archived để ẩn. Không public mutation endpoint.

Migrations có version; Wrangler D1 file execute dùng batch atomic, không thêm BEGIN. FTS là index tái tạo: [catalog report](docs/PHASE01_CATALOG.md) có restore/rollback drill D1 local riêng. JSON đã version + migrations là nguồn khôi phục của admin local; không khẳng định export nguyên DB có virtual tables hoặc tự drop FTS trên live.

## Build artifact staging, không deploy

```powershell
$env:P01_STAGING_BUILD='1'
npm run build
Remove-Item Env:P01_STAGING_BUILD
node node_modules/wrangler/bin/wrangler.js deploy --dry-run --config dist/server/wrangler.json
```

Adapter sinh dist/server/wrangler.json và dist/client; không sửa artifact hoặc đổi env sau build. Guard kiểm account/Worker/D1/Preview bindings theo deploy/staging-target.json; sessions:false và imageService:passthrough tránh KV/Images tự tạo. Dry-run không upload.

Artifact được kiểm riêng bằng simulator D1 ở .cache/artifact-runtime, cổng4322; mọi DB command dùng --local --persist-to .cache/artifact-runtime, không ghi test lỗi vào D1 cloud. `npm run preview` dùng config artifact gần nhất; bỏ P01_STAGING_BUILD và build local lại khi cần target local.

## Git workflow

Repo https://github.com/ducbang02/FreeResources.git; author/collaborator sunny251010 đã được chủ dự án xác nhận. Main khóa release, develop cho Preview. Commit checkpoint, review staged diff/secrets; không force push/rewrite hoặc commit token/.env/.dev.vars/generated artifacts.

.gitattributes giữ byte prototype/asset/license, tránh autocrlf làm sai hash. Sandbox thấy owner khác thì dùng per-command, không sửa global:

```powershell
git -c safe.directory=D:/Workspace/FreeResources status
```

## Cloudflare Preview qua GitHub

Account đúng `4ca521c6746d874c049fd829121ab59e` — Nguyenducbang.uit@gmail.com's Account — đã xác thực và đối chiếu bằng whoami. Worker `digital-resource-hub-staging` (ID `0540bcf9fa6448d6843935471fe0265c`), D1 `e28f4099-92cf-40bc-ab8c-c47138b4469d`. Build7de0b863 từ develop508a96c đã triển khai [Preview thật](https://develop-digital-resource-hub-staging.nguyenducbang-uit.workers.dev);45 cloud browser checks PASS ở1440/768/390. Parent chưa active deployment, workers.dev tắt; runtime Preview bind đúng DB/ASSETS/APP_ENV staging. Hai tài nguyên tạo nhầm đã xóa và GET404. [Readback](qa/p01/cloud-preview.json), [bằng chứng/log](docs/PHASE01_CLOUD_CONNECTION.md), [gallery](qa/p01/index.html). Git giữ ducbang02/FreeResources, push bằng sunny251010.

Phiên Wrangler global cũ chỉ truy cập Ctcm. Device login của dự án dùng XDG_CONFIG_HOME=.cache/free-resources-auth và XDG_CACHE_HOME=.cache/free-resources-auth-cache; thư mục đã ignore, không đổi HOME hoặc profile global. Named profile auth không hỗ trợ device flow trong phiên bản này. Không đọc/in/copy token vào chat/Git. Xác thực dự án đã thành công; whoami khớp account đích. Mỗi lệnh Wrangler có dùng phiên này phải đặt hai biến XDG trên theo đường dẫn tuyệt đối trong workspace; không đọc/copy file auth. Guard CI chặn cứng account khác đích và repo khác ducbang02/FreeResources.
[Runbook Dashboard](docs/PHASE01_PREVIEW_RUNBOOK.md) và [bằng chứng kết nối](docs/PHASE01_CLOUD_CONNECTION.md). Các ô phải đặt trước lần build đầu:

| Ô | Giá trị |
| --- | --- |
| Repo | ducbang02/FreeResources |
| Production branch | main |
| Build command | npm run ci:build |
| Deploy command | npm run ci:production |
| Preview builds | Bật non-production; guard trong repo chỉ cho develop triển khai |
| Preview command | npm run ci:preview:deploy |
| Runtime | `.node-version`: 24.18.0; `packageManager`: npm@12.2.0; biến NODE_VERSION trong UI là tùy chọn |

ci:build bỏ qua main, chỉ checks/build staging trên develop; nhánh khác bị từ chối. ci:production no-op, không upload/migrate/deploy. Preview wrapper yêu cầu native CI branch/commit/origin/clean tree, proof local checks/build và đúng account/DB trước remote migration/seed/Preview. Một Workers Builds pipeline, không Actions song song; GitHub App chỉ đúng repo.

OAuth dự án đủ Worker/D1; Builds API vẫn thiếu quyền đọc trực tiếp (endpoint list builds403/code12004). Chủ dự án đã hỗ trợ Dashboard và cung cấp log build thành công; Playwright kiểm website cloud độc lập. Không gửi token/mật khẩu vào chat. [Luồng làm việc từng bước và sơ đồ](docs/PHASE01_PREVIEW_RUNBOOK.md#luồng-làm-việc-hiện-tại-đọc-từ-trái-sang-phải). Noindex không phải access control. Worker Previews đang open beta; giữ version đã pin và kiểm sau mỗi lần thay toolchain.

## Production dự kiến, chưa thực hiện

Không có production deploy path trong P01. Cần lệnh duyệt riêng, Worker/D1/domain production riêng, kiểm budget/backup/rollback và staging QA trước release. Không tự DNS/paid plan/migration production/auth/ratings/Gemini/P02.
