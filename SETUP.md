# SETUP — P01 / Windows / Astro + Workers + D1

Ngày03/11/2026. Node24.18.0/npm12.2.0 được dùng. Lockfile pin Astro7.4.5, adapter14.4.4, Wrangler4.156.2, TypeScript6.0.3, checker0.9.12, Node types24.19.2. Không CLI global/framework frontend khác.

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

Check sinh worker-configuration.d.ts rồi Astro check; không tự viết Env. File sinh/node_modules/dist/.astro/.wrangler/.cache không commit. 20 tests gồm validator, SQL/FTS/facets/draft/upsert/duplicates và guard CI; SQLite PASS không thay cloud PASS.

Browser QA dùng Playwright Core đã có, không runtime dependency:

```powershell
node tools/qa-p01.cjs D:\Workspace\CloneWebsite\KatTattoo\node_modules\playwright-core http://127.0.0.1:4321 qa/p01/local
```

Chỉ đọc thư viện dev ở repo khác, không copy source ứng dụng. Máy khác truyền package/browser đã cài; script không tự install. 1440/768/390, 20 screenshot mỗi lượt; physical mobile/software keyboard/AT chưa kiểm.

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

Account4873c68031c0fc5e0284943a9119dac2 qua login nguyenducbang.uit@gmail.com. Worker staging metadata-only ID000318f0fc78496aad07c79236818428, tên digital-resource-hub-staging, workers.dev tắt, chưa upload code. D1 riêng cùng tên IDfea09243-1d9b-4836-82ac-0dea72ef1668: migrate/13resources/17sources/FTS/FK cloud PASS. Không DB dự án khác/production.

[Runbook Dashboard](docs/PHASE01_PREVIEW_RUNBOOK.md) và [bằng chứng kết nối](docs/PHASE01_CLOUD_CONNECTION.md). Các ô phải đặt trước lần build đầu:

| Ô | Giá trị |
| --- | --- |
| Repo | ducbang02/FreeResources |
| Production branch | main |
| Build command | npm run ci:build |
| Deploy command | npm run ci:production |
| Preview builds | Bật, include chỉ develop |
| Preview command | npm run ci:preview:deploy |
| Build variable | NODE_VERSION=24.18.0 |

ci:build bỏ qua main, chỉ checks/build staging trên develop; nhánh khác bị từ chối. ci:production no-op, không upload/migrate/deploy. Preview wrapper yêu cầu native CI branch/commit/origin/clean tree, proof local checks/build và đúng account/DB trước remote migration/seed/Preview. Một Workers Builds pipeline, không Actions song song; GitHub App chỉ đúng repo.

OAuth hiện đủ Worker/D1 nhưng Builds API403; Browser Use/Computer Use host không khởi tạo được. Chủ dự án hỗ trợ nối Dashboard. Không gửi token/mật khẩu vào chat. Chỉ sau connection/branch controls, build GitHub thật và cloud browser PASS mới nghiệm thu deploy workflow. Noindex không phải access control.

## Production dự kiến, chưa thực hiện

Không có production deploy path trong P01. Cần lệnh duyệt riêng, Worker/D1/domain production riêng, kiểm budget/backup/rollback và staging QA trước release. Không tự DNS/paid plan/migration production/auth/ratings/Gemini/P02.
