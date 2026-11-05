# P02.2 — Admin Dashboard & Smart Import UI

05/11/2026 · **READY FOR REVIEW local**, chưa phải An nghiệm thu. Code checkpoint `2ded209`; không push/deploy, không đổi Cloudflare/DNS/D1 remote/public UI. P01/P02 chưa DONE.

## Mở Admin

Máy hiện chạy **bản thử dữ liệu riêng** tại [Admin4325](http://127.0.0.1:4325/admin/resources); [website4326](http://127.0.0.1:4326/resources/admin-try-archify) đọc D1 thử riêng. Đóng server/máy thì URL local ngừng hoạt động. Hai nguồn thử là Archify và7-Zip; chỉ Archify được Export vào bản sao14 mục, không phải catalog chính13 mục.

Để chạy với dữ liệu quản trị chính trên máy:

```powershell
Set-Location 'D:\Workspace\FreeResources'
npm.cmd run admin
```

Mở **http://127.0.0.1:4325/admin/resources**, không thay bằng localhost. Ctrl+C dừng. Nếu cổng bản thử đang dùng, dừng đúng tiến trình đó hoặc chạy `npm.cmd run admin -- --port 4327`. Không cần Astro để quản trị. Key phải có trong env của phiên chạy server; không tự nạp `.env`.

Mặc định `.local/editorial` và `data/catalog.json` dùng chung với CLI: **Export được xác nhận sẽ sửa catalog chính local**. Muốn thử riêng, tạo thư mục mới, không ghi đè dữ liệu đã có:

```powershell
$p022Try = Join-Path '.cache' ('admin-try-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))
New-Item -ItemType Directory -Path $p022Try | Out-Null
Copy-Item data/catalog.json (Join-Path $p022Try 'catalog.json')
npm.cmd run admin -- --port 4327 --catalog (Join-Path $p022Try 'catalog.json') --state-dir (Join-Path $p022Try 'editorial')
```

## Thao tác thường ngày bằng browser

1. **Nhập:** dán `https://github.com/tt-a1i/archify` hoặc website chính thức → **Nhập tài nguyên**. Loading chặn bấm lặp; trùng mở nháp/checkout mục có sẵn. GitHub public không token; website chỉ metadata text, không crawler/installer. Không tự gọi AI.
2. **Xem nguồn/Rules:** mở **Dữ liệu nguồn · chỉ đọc** để xem metadata/README/evidence. Dữ liệu tác giả chưa phải FreeResources xác minh. Rules gợi ý taxonomy từ topic, không tự dịch README hoặc chứng nhận giá/license.
3. **Sửa và lưu:** nhập tên/công dụng/mô tả/category/tags/platforms. Mở điều kiện sử dụng: chọn nhóm, mô hình Free, license status. Thêm URL nguồn và các trường đã thực sự đối chiếu. Chỉ bật xác minh khi đã đọc nguồn; chưa rõ giữ unknown. Thiếu nguồn vẫn lưu nháp được, nhưng trial/paid/unknown không thể duyệt cuối. Trích đoạn bổ sung chỉ chứa nội dung công khai, không key/ghi chú riêng.
4. **Review:** lưu trước; nhập tên người duyệt, chọn Phù hợp/Không phù hợp/Cần kiểm tra thêm và xác nhận. Suitable chỉ là sơ bộ. **Xác nhận duyệt cuối** kiểm policy/nguồn/current digest. Sửa nội dung/nguồn sau duyệt buộc duyệt lại; nháp bị CLI/tab khác đổi thì DRAFT_CHANGED, không ghi đè và giữ biểu mẫu chưa lưu.
5. **Export:** **Xem bản Export** → đọc before/after/đường dẫn catalog → Hủy hoặc **Xác nhận ghi local**. Backend kiểm lại plan/current approval/conflict rồi atomic write. Xem **Receipt Export local** sau thành công. Không tự sinh SQL/seed D1/push/deploy; đã Export local chưa đồng nghĩa website đổi.
6. **AI tùy chọn:** chưa đủ cấu hình thì Quick/Deep bị tắt; UI hiện quota. Cấu hình key/project/model/Free Tier phía server theo [CLI phần4](PHASE02_CLI.md#4-cấu-hình-gemini--mặc-định-tắt), chạy Admin từ cùng PowerShell. Không nhập key vào browser. Quick chỉ khi bấm, Deep cần suitable. Chung5 attempts/ngày, cache không tính lượt, không force/retry/fallback tự động. Gợi ý riêng, xem patch và xác nhận áp dụng rồi duyệt lại. Live Gemini chưa kiểm.

**Lỗi thường gặp:** URL sai thì sửa; private/missing repo kiểm link public. Timeout/rate limit xem **Dữ liệu nguồn**, chờ cooldown rồi chủ động **Lấy lại thông tin nguồn**. Partial/không có evidence cảnh báo và giữ nháp. Checkbox nhập thủ công chỉ dành website, không bypass public GitHub. EDITOR_BUSY: chờ, không xóa active lock. CATALOG_CONFLICT: **Catalog đã đổi?**, so ba phiên bản và tự hợp nhất nội dung cần giữ trước khi xác nhận baseline/duyệt lại; không seed để che drift. Lỗi lưu giữ nguyên biểu mẫu; tải lại/chuyển trang khi có sửa chưa lưu sẽ hỏi xác nhận.

## Từ link GitHub tới website

[Sơ đồ tương tác03](architecture-maps/03-data.html) có10 bước, giải thích và nguồn code; không tạo sơ đồ thứ năm.

**1–5:** Admin/CLI nhập URL → metadata/README → nháp/Rules/AI tùy chọn → chỉnh và duyệt hai cấp → xác nhận Export JSON.

**6–10, chỉ sau khi được phép:** review diff/nguồn/drift/backup → commit/push develop → CI validate/test/build, sinh SQL/artifact → migrate/seed D1 staging + Preview → website đọc published. Main vẫn no-op, production cần lần phát hành được duyệt riêng. P02.2 chưa push nên cloud chưa có thay đổi này.

Local có thể generate SQL rồi đồng bộ bằng quy trình P01 vào D1 **thử riêng** để kiểm website, không cần push. QA đã làm và tìm thấy Archify ở4326. Không có nút Sync/Deploy trong Admin theo scope này.

## Kiến trúc và bảo mật

**Reuse Audit:** `Editor`/adapters/validator/Store lock+atomic/Gemini/quota/cache/export plan hiện có. Node `http` + UI HTML/CSS/JS native/Noto Sans/favicon đã có; không dependency/framework/auth service/DB/schema mới. Không chạy shell từ HTTP. Hai thay đổi domain nhỏ: optional expectedRevision dưới lock cho edit/review/approve, và config readiness không lộ key; CLI cũ tương thích.

Server riêng trong `scripts/admin`, ngoài `src`/`public`/bundle Astro. Listen chỉ127.0.0.1, exact Host+port, từ chối Origin khác/null và Fetch Metadata cross-site. POST cần Origin đúng, nonce CSRF theo process, JSON/body≤128KiB; không CORS mở. Action whitelist, không client shell/path/catalog target; target chỉ đặt khi startup. Một mutation tại một thời điểm, lock/revision chống ghi đè. CSP/no frames/no-store/no-referrer/nosniff; nội dung nguồn và AI dùng textContent, không chạy HTML. API không trả key/fingerprint/confirmation; lỗi không phản chiếu provider body/stack, key server biết được redaction; không log body/credentials.

**Giới hạn:** CSRF nonce không phải authentication production; local-only không chống process độc hại/người có quyền trên máy. Không tunnel/reverse proxy/bind0.0.0.0. Trước cloud cần auth/roles/session/CSRF/rate limits/audit, storage/concurrency/backup/drift và thiết kế writer thay Node filesystem. Không chỉ copy server này lên Worker.

## Validation

| Kiểm tra | Kết quả/bằng chứng |
| --- | --- |
| Unit/integration/CLI | **PASS58/58**:52 regression và6 Admin HTTP/security/revision/duplicate/export/secrets tests. Rate/error/quota AI dùng fixture, không live API |
| Typecheck/build | **PASS**27 Astro files,0 errors/warnings/hints; build local. `src`/catalog/seed/migration/lockfile/Cloudflare config không đổi |
| Admin browser | **PASS9/9 nhóm**, Chrome156 hiển thị1440/768/390: mỗi viewport Import→Rules→edit/save→review→hủy/xác nhận Export, list/filter/duplicate/reload; website/missing/timeout/invalid, retry lấy lại nguồn thành công, API503 lưu lỗi giữ nguyên biểu mẫu rồi lưu lại; Quick/Deep/apply/cache fixture đúng2attempts. [Receipt cuối](../qa/p022/browser-final/results.json),3 PNG và ảnh live đã xem desktop/mobile;0 console lỗi bất ngờ,400/503 chủ động tách riêng |
| Lỗi phát hiện và sửa | Lượt đầu **FAIL**: website partial/không evidence bị báo thành công, thiếu favicon gây404. Đã sửa cảnh báo/giữ nháp/reuse favicon và chạy lại PASS. [Receipt cũ](../qa/p022/browser/results.json) được giữ |
| Nguồn thật qua UI | **PASS4 checks** Archify metadata/README/Apache LICENSE → sandbox edit/review/Export;7-Zip metadata vào nháp, license unknown/final null;0 console/page errors,0 Gemini attempts. [Receipt](../qa/p022/live/results.json) |
| Public regression | **PASS45/45**1440/768/390 trên D1 local riêng13 mục trước sync,20 PNG,0 normal console errors. [Receipt](../qa/p022/public-regression/results.json) |
| Export → website/cách ly | **PASS5 checks** SQL/sync D1 thử14 mục, Search/Detail Archify1440/768/390; Worker public trả404 Admin pages/API/JS; catalog/seed SHA256 và D1 content digest chính vẫn13 mục. [Receipt](../qa/p022/live/projection.json) |
| Archify | **PASS** finalize/schema/layout/Git evidence/provenance/browser gate; Data pin code2ded209. [Receipt](../qa/architecture-maps/archify/03-data.dataflow/2026-11-05T03-46-17-152Z/03-data.finalize-summary.json). Thêm **37/37** Chrome/file interaction checks1440/768/390,19 PNG/8 exports,0 auto HTTP/console errors; [receipt](../qa/p022/maps/results.json). Đã xem ảnh Data1440.01/02/04 giữ nguyên byte; advanced viewer còn English fallback |
| SKIP | Gemini live/model quality/billing (chưa cấu hình); physical mobile/AT/Safari/Firefox; deployment/remote D1/production readback. Fixture không thay live acceptance |

Raw scripts/cache/config/nháp/ledger/receipts/PNG ignored, không commit. Helper fixture ở `tests/helpers`, không cờ mock/SSRF bypass trong Admin runtime. File chính: `scripts/admin/{server.mjs,ui/*}`, nhỏ ở `scripts/editorial/{workflow,gemini}.mjs`, npm script `admin`, `tests/admin.test.mjs`, helper và `tools/qa-admin.cjs`; docs/tracker/Data map riêng. Không thay public UI/CI/CD.

**An nghiệm thu:** mở4325 xem nháp/source/receipt, thử URL khác trên bản sao, kiểm form/keyboard/review; mở4326 xem kết quả sau sync local. Duyệt nội dung/giấy phép trước đưa vào catalog chính. P01/P02 giữ READY FOR REVIEW, không DONE/phase tiếp theo.
