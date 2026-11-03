# SETUP — Planning và prototype local

> Chưa có source ứng dụng/package.json/Wrangler. Prototype A P00.3 vẫn HTML/CSS/JS không dependency runtime; dev QA reuse Playwright Core và Chromium đã có. Lệnh npm phía dưới vẫn dự kiến P01.

## P00.3 — mở A và QA thật

Mở `prototype-p001/index.html` trực tiếp (đã test file://), mặc định A; `review.html` có khung1440/768/390. Mở `qa/p003/index.html` xem29 PNG trước/sau/bổ sung và JSON68 browser checks PASS (45+23). Noto Sans được tải từ hai WOFF2 local, kèm OFL; không cài font vào máy. Thiết kế chưa được chủ dự án nghiệm thu.

Đã có Node24.18.0/npm12.2.0/Python3.13.15. Local playwright-core1.62.0 và Chromium151.0.7922.34 được reuse, không cài thêm. Package dev hiện ở `D:\Workspace\CloneWebsite\KatTattoo\node_modules\playwright-core`; chỉ đọc thư viện, không copy source ứng dụng dự án kia. Script nhận package path để không hardcode vào website.

Muốn tái chạy QA, mở một terminal server và terminal riêng cho checks trong root workspace:

```powershell
python -m http.server 4175 --bind 127.0.0.1 --directory prototype-p001
```

```powershell
node tools/qa-p002.cjs D:\Workspace\CloneWebsite\KatTattoo\node_modules\playwright-core http://127.0.0.1:4175/index.html qa/p003/after P00.3
node tools/qa-p003.cjs D:\Workspace\CloneWebsite\KatTattoo\node_modules\playwright-core
node prototype-p001/verify.mjs
```

Server4175 của phiên bàn giao đã dừng; tự dừng terminal server bằng Ctrl+C sau QA. Script đóng browser trong finally, ghi `qa/p003/after/results.json`, `qa/p003/results-specific.json`/PNG, không auto install/download. Máy mới cần đường package/binary hợp lệ đã được cài riêng; nếu cần cài/global config/new permission thì hỏi trước, không chạy npm install chỉ từ docs này.

UI UX Pro Max chỉ đọc source, chưa cài/chạy. Context7 có sẵn/test. Playwright MCP/DevTools MCP chưa cài. [Tooling audit](docs/PHASE002_TOOLING_AUDIT.md) có official nguồn/license/installer/proposal chưa thực thi. Tooling không thuộc bundle production. Python http.server trên máy này phục vụ WOFF2 với MIME application/octet-stream; Chromium đã decode/render font thật. MIME font/woff2 cần kiểm trên runtime P01 khi được giao. Ảnh before là snapshot P00.2 đã chụp trước sửa, không ghi đè khi chạy lại QA.

Muốn thử error search: mở `index.html#/A/home?qa=search-error`, focus search rồi nhập từ; đây là simulation, retry trở lại dữ liệu local. History/save chỉ trong phiên. Physical mobile keyboard/screen reader chưa test.

## Xem prototype Phase 00.1 — log lịch sử

Mở `D:\Workspace\FreeResources\prototype-p001\review.html` để so A/B/C và home/discover/detail ở khung1440/768/390; hoặc `prototype-p001\index.html` cho tương tác bình thường. Route `#/A/home`, `#/B/discover`, `#/C/detail/localsend`. Không npm/API/key; toàn bộ asset/script local. Viewport iframe là công cụ review, chưa phải QA/screenshot thật.

Kiểm logic/template bằng Node có sẵn (trong root workspace):

```powershell
node prototype-p001/verify.mjs
```

Đã chạy PASS19 nhóm/63 template bằng Node VM và DOM stubs; không thay browser/console/keyboard/viewport thật. Muốn HTTP preview local có thể tự chạy:

```powershell
python -m http.server 4174 --bind 127.0.0.1 --directory prototype-p001
```

Mở `http://127.0.0.1:4174/review.html`; Ctrl+C để dừng. Server này chưa chạy trong P00.1. Browser/native host của phiên không hoạt động nên QA/screenshot SKIP; hướng dẫn trong `docs/PHASE001_REPORT.md`. Prototype P00 bên dưới giữ nguyên, không phải vòng mới.

## Xem prototype Phase 00 — lưu tham chiếu

Mở `D:\Workspace\FreeResources\prototype\index.html` bằng trình duyệt, chọn A/B rồi thử Home → Khám phá → Chi tiết và Admin demo. Có thể mở file trực tiếp, không cần Node/npm, backend hoặc API key. Toàn bộ dữ liệu, điểm số và AI draft là minh họa; reload không phải thao tác lưu lên database.

Nếu cần HTTP preview local, chạy trong `D:\Workspace\FreeResources`:

```powershell
python -m http.server 4173 --bind 127.0.0.1 --directory prototype
```

Sau đó mở `http://127.0.0.1:4173`. Đây là lệnh tùy chọn cho người xem, **chưa chạy trong phiên P00**, dừng bằng Ctrl+C. Không expose server ra LAN.

Môi trường đã đọc trong P00: Node `v24.18.0`, Python `3.13.15`, Git `2.53.0.windows.3`. Thư mục hiện không có `.git`, chưa có branch/commit/remote. Không tự `git init` trong P00.

## 1. Môi trường phát triển của An

- Windows + VS Code/Codex; Git; Node.js LTS và package manager sẽ xác nhận sau khi chốt stack.
- Cloudflare account dùng cho project mới, **project-specific** Worker/D1/R2 và staging/production riêng; không đụng tài nguyên dự án khác.
- GitHub API token (nếu cần quota phù hợp), Gemini API key tạo trong Google AI Studio; không nhập key vào prompt, docs hoặc commit.
- Có thể phát triển/test local trước khi tạo resource Cloudflare thật.

### Xác minh phiên bản (PowerShell, trong terminal VS Code)

```powershell
git --version
node --version
npm --version
```

Không chạy `wrangler`/`npm install` chỉ vì tài liệu này tồn tại; trước tiên kiểm tra `package.json`, version và script thực tế khi repo đã được tạo.

## 2. Khởi tạo repo mới từ bộ tài liệu

1. Tạo **folder/repo riêng**, không sao chép source của THEOLOI, Sunny, Sion hay tài nguyên R2 từ dự án khác.
2. Giải nén bộ tài liệu vào root repo.
3. Tài liệu `AGENTS.md` trong bộ này là **bản universal mới** để An review/dùng thay bản cũ; nên xem diff trước khi thay. Không giữ đồng thời hai file `AGENTS.md` với quy tắc mâu thuẫn.
4. Đọc các file theo `README.md`; chốt phase P00 trước khi scaffold.
5. Tạo `.gitignore` phù hợp stack khi đã có source; secrets và dữ liệu fixture nhạy cảm phải được ignore.

## 3. Lệnh phát triển đề xuất — CHƯA KHẢ DỤNG

Chỉ khi Codex đã tạo project, xác nhận `package.json` và viết scripts phù hợp, **mới có thể** dùng những tên lệnh kiểu:

```powershell
npm install
npm run dev
npm run check
npm run lint
npm test
npm run build
```

Các lệnh trên **chưa được chạy và có thể chưa tồn tại**. Codex phải sửa thành thực tế, ghi cwd, version, và kết quả PASS/FAIL/SKIP. Không tự làm mờ lỗi bằng cách xóa test hoặc bỏ validation.

## 4. Secrets và cấu hình môi trường

Tên biến ví dụ (tùy provider chọn):

```text
GEMINI_API_KEY=<set via local secret / Cloudflare secret>
GITHUB_TOKEN=<optional, server-side>
OPENAI_API_KEY=<optional, future provider>
```

- Đây là **tên biến minh họa, không chứa giá trị thật**; file mẫu `.dev.vars.example` hoặc `.env.example` chỉ chứa placeholder.
- Local secret (`.dev.vars`/`.env`) phải nằm trong `.gitignore` trước khi tạo file.
- Với Cloudflare, dùng cơ chế `wrangler secret` hoặc binding chính thức cho môi trường tương ứng; không lưu khóa vào code, D1 hay client bundle.
- Cấu hình quota, provider/model và prompt/schema version server-side; frontend chỉ nhận status/result đã qua kiểm duyệt.
- Tách Cloudflare dev/staging/prod, DB và data fixture; rủi ro chi phí phải được An duyệt.

## 5. GitHub / data ingest

- Dùng API chính thức có auth hợp lệ và rate limits; fetch README/manifest theo scope nhỏ, lưu URL + thời điểm + content hash và source evidence.
- Validate URL và target network trước server fetch (SSRF); giới hạn content bytes/timeout/redirect.
- **Không auto `git clone` hoặc thực thi postinstall/build script của repo ngẫu nhiên** trong máy phát triển/server vì việc đọc README không cần chạy code.
- Nếu sau này thử one-click installation: dùng Windows Sandbox/VM sạch, xem nguồn/phụ thuộc/checksum/signature và nhận diện quyền chạy trước khi phát hành.

## 6. Ponytail: dùng một lần cho agent, không vendoring vào từng repo

Repo: https://github.com/DietrichGebert/ponytail

Nếu An dùng **Codex CLI hỗ trợ plugin** và đã kiểm tra phiên bản/tài liệu chính thức, có thể chủ động cài (tự quyết định sau khi review plugin/hook):

```powershell
codex plugin marketplace add DietrichGebert/ponytail
codex plugin add ponytail@ponytail
```

Sau đó vào Codex CLI, mở `/hooks`, **review và chỉ trust hooks nếu An chấp nhận**, mở session mới. Tài liệu chính thức: https://github.com/DietrichGebert/ponytail/blob/main/INSTALL.md . Nếu bản VS Code extension/CLI của An không hỗ trợ lệnh `codex plugin`, **không ép cài**; dùng những rule Ponytail đã được nhúng trong `AGENTS.md`, hoặc tích hợp skill bằng đường hỗ trợ của phiên bản đó.

Không tự install plugin thay An, không coi plugin là runtime dependency của web. `$ponytail:ponytail-review` là lệnh review diff có thể dùng **nếu plugin đã xuất hiện** trong môi trường; không nhận định nó đã được cài thành công nếu chưa kiểm chứng.

## 7. Checklist trước staging / production

- [ ] Test local DB migrations, rating uniqueness, auth/admin ACL, AI schema and failure paths.
- [ ] Browser test từ user journey thật (390px/desktop), loading/error, accessibility.
- [ ] Source/license/manual content review; không có ISO/game/tài liệu không rõ quyền trên máy chủ.
- [ ] Rate limit, cache boundary, secrets scan, storage/AI quota/budget limit.
- [ ] Staging riêng, backups/restore test, rollout/rollback plan.
- [ ] An phê duyệt explicitly trước bất kỳ deploy, DNS, paid plan hoặc production mutation.

## 8. Các báo cáo Codex cần cập nhật sau P00/P01

- Version và script thực tế, setup từ Windows mới, migration local, commands và kết quả.
- File thay đổi, test pass/fail/skip, có thực chạy browser/nền tảng Windows hay chỉ mock.
- Checklist task/phase, Git commit/branch, trạng thái cloud (local/staging/live), blocker và bước tiếp theo.
