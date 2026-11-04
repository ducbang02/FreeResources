# P02 — Hướng dẫn quản trị trên Windows

Chạy trong PowerShell tại **`D:\Workspace\FreeResources`**. CLI local, Git/JSON là nguồn chính; không có admin web hoặc tự push/deploy. P01/UI chưa được tự nghiệm thu. Dùng `npm.cmd` nếu Windows chặn `npm.ps1`; không cần đổi Execution Policy.

```powershell
Set-Location 'D:\Workspace\FreeResources'
node scripts/catalog.mjs help
```

## 1. Nhập và xem nháp

```powershell
node scripts/catalog.mjs import https://github.com/OWNER/REPO
node scripts/catalog.mjs import https://official-app.example.org/
# Khi website không truy cập được, hoặc muốn nhập thủ công ngay:
node scripts/catalog.mjs import https://official-app.example.org/ --manual
node scripts/catalog.mjs list
node scripts/catalog.mjs show draft-0123456789abcdef
node scripts/catalog.mjs rules draft-0123456789abcdef
```

Thay URL và `draft-...` bằng giá trị thật CLI trả về; URL example trong hướng dẫn là placeholder. GitHub `.git`/www/case/query được chuẩn hóa; repo private/không tồn tại không đủ điều kiện export. GitHub dùng REST public **không token** (hạn mức anonymous có thể thấp); metadata/README/license, tùy chọn `--releases`. License missing/NOASSERTION là unknown, GitHub detection chưa phải review pháp lý. Ngôn ngữ không chứng minh mục đích hoặc OS; stars không phải rating. Website chỉ lấy title/description, không chạy JS hoặc tải installer; timeout/CAPTCHA/403 thì partial, bổ sung bằng tay. Không có AI khi import/refresh.

Nháp/cache/source/usage/config tại **`.local/editorial/`**, ignored và không đưa lên Git. Giữ backup riêng thư mục này; không coi nó là cache có thể xóa vì chứa cả nháp và ledger hạn mức. Chỉ một máy/trạng thái biên tập chủ động. Lock bị bỏ lại sau crash: kiểm PID trong lock, chỉ xóa lock khi chắc tiến trình đó đã dừng; không xóa usage để reset quota. Không đặt key trong JSON.

Để sửa mục đã có thay vì tạo trùng:

```powershell
node scripts/catalog.mjs checkout localsend
```

Checkout giữ ID/slug/media/createdAt và baseline hash. Refresh/edit không ghi đè catalog thật. Nếu CLI trả duplicate, dùng ID mục hiện có; không đổi tên URL để né kiểm trùng.

## 2. Chỉnh sửa bằng JSON patch

Tạo `.local/editorial/patch.json` bằng editor của bạn. Ví dụ dưới chỉ minh họa shape; tự đối chiếu nguồn trước khi đặt `officialSourceVerified: true` hoặc liệt kê `verifiedSources`:

```json
{
  "editorial": {
    "title": "Tên ứng dụng",
    "summary": "Công dụng ngắn bằng tiếng Việt.",
    "description": "Mô tả có nguồn, tối đa 2400 ký tự.",
    "type": "application",
    "categories": ["van-phong"],
    "tags": [],
    "platforms": [],
    "license": null,
    "pricing": "Miễn phí theo điều kiện chính thức"
  },
  "policy": {
    "groups": ["free_apps"],
    "freeModel": "freeware",
    "licenseStatus": "unknown",
    "officialSourceVerified": true,
    "freeEvidenceUrl": "https://official-app.example.org/pricing",
    "freeLimitations": ""
  },
  "verifiedSources": [
    {"url":"https://official-app.example.org/","label":"Trang chính thức đã đối chiếu","fields":["summary","canonicalUrl"]},
    {"url":"https://official-app.example.org/pricing","label":"Điều kiện Free đã đối chiếu","fields":["pricing"]}
  ]
}
```

```powershell
node scripts/catalog.mjs edit draft-0123456789abcdef .local/editorial/patch.json
```

`summary`≤240, title≤120; taxonomy dùng IDs trong `data/catalog.json`. Patch chỉ cập nhật fields được phép; **mảng được thay toàn bộ**, vì vậy giữ các nguồn license/platforms cũ khi sửa mục đã có. Timestamp verifiedAt do CLI đặt khi bạn cung cấp verifiedSources; đó là khai báo review của người quản trị, không phải CLI tự xác minh nội dung.

Ba groups nội bộ: `free_resources` / `free_apps` / `github`, có thể chồng lấp, chưa thay public navigation. Không tạo bản ghi thứ hai cho cùng nội dung. `freeModel`: `freeware`, `open_source`, `freemium`, `free_resource`; unknown/trial/paid không export. Freemium bắt buộc `freeLimitations` rõ (ngắn đủ chứa pricing240 ký tự); xuất sang trường pricing để website hiện giới hạn. `open_source` cần license được reviewer đối chiếu và nguồn trường license, không chỉ public repo. `free_resource` cần `usageRights` và nguồn có field usageRights; miễn phí sử dụng không tự có quyền thương mại/phân phối. Không host file bên thứ ba.

Nguồn thủ công để AI đọc (chỉ nội dung công khai, không notes/private/keys): thêm patch `manualEvidence: [{"url":"https://official-app.example.org/docs","content":"Trích đoạn công khai cần đối chiếu..."}]`. Mỗi entry tối đa16000 ký tự, tối đa8; không fetch URL đó tự động. Nhãn `manual-1`, `manual-2` được CLI gán. Nội dung quan trọng vẫn cần reviewer kiểm; reference tồn tại chưa chứng minh claim đúng.

## 3. Quick, preliminary và deep

AI là tùy chọn. Nếu thông tin đủ, bỏ qua hai lệnh analyze/apply-ai và vẫn duyệt/export được.

```powershell
node scripts/catalog.mjs analyze draft-0123456789abcdef quick
# Xem gợi ý, không tự thay editorial:
node scripts/catalog.mjs show draft-0123456789abcdef
node scripts/catalog.mjs apply-ai draft-0123456789abcdef quick
# Sau khi xem patch, copy đúng planId vừa trả:
node scripts/catalog.mjs apply-ai draft-0123456789abcdef quick --apply --expect PLAN_ID
node scripts/catalog.mjs review draft-0123456789abcdef suitable --by 'Tên người biên tập'
node scripts/catalog.mjs analyze draft-0123456789abcdef deep
```

Preliminary có `suitable`, `unsuitable`, `needs_check`; suitable chưa phải xuất bản. Deep chỉ chạy với suitable còn hiệu lực. Muốn đọc chọn lọc tài liệu/manifest của repo public trước deep:

```powershell
node scripts/catalog.mjs document draft-0123456789abcdef docs/install.md
node scripts/catalog.mjs review draft-0123456789abcdef suitable --by 'Tên người biên tập'
node scripts/catalog.mjs analyze draft-0123456789abcdef deep
node scripts/catalog.mjs apply-ai draft-0123456789abcdef deep
```

Đường dẫn tài liệu có allowlist txt/md/rst/json/toml/yaml/yml, tối đa256KiB/file, không secret/executable, không clone toàn bộ source. Thêm tài liệu/đổi nội dung làm review cũ mất hiệu lực. Deep không phải security audit. OS/requirements/dependency/cài đặt chỉ là claims có evidence IDs, bạn phải đối chiếu rồi tự biên tập vào fields có nguồn; `apply-ai` chỉ đụng summary/description/category/tags sau xác nhận plan. Sau apply cần duyệt sơ bộ/final lại. Không tự suy license/quyền, malware-free hoặc an toàn tuyệt đối.

## 4. Cấu hình Gemini — mặc định tắt

```powershell
Copy-Item data/editorial-config.example.json .local/editorial/config.json
node scripts/catalog.mjs ai-config
node scripts/catalog.mjs ai-usage
```

Không cần Google AI Pro. Trước khi enabled: trên Google AI Studio kiểm đúng project của key, billing **không bật**, model hiện được cấp Free Tier, quota và quyền truy cập, cùng data-use policy phù hợp với public evidence. Model ID không được khóa sẵn; ưu tiên Flash-Lite **nếu** hiện đủ quyền/Free Tier/chất lượng/schema. Không thể xác nhận hoàn toàn billing từ API generateContent: cần chủ dự án tự kiểm Dashboard; chưa rõ thì giữ disabled.

Nhập key kín vào phiên PowerShell, không vào chat/commit hoặc file config:

```powershell
$p02Key = Read-Host 'Gemini API key (chỉ local)' -AsSecureString
$env:GEMINI_API_KEY = [System.Net.NetworkCredential]::new('', $p02Key).Password
node scripts/catalog.mjs ai-config
```

Lệnh chỉ hiện keyPresent/keyFingerprint, không hiện key. Sửa config ignored với đúng projectId/model, enabled=true và `freeTierConfirmation`:

```json
{
  "projectId": "PROJECT_ID_DA_KIEM_TRA",
  "model": "MODEL_ID_DA_KIEM_TRA",
  "keyFingerprint": "SHA256_TU_AI_CONFIG",
  "billingTier": "free",
  "billingEnabled": false,
  "accessConfirmed": true,
  "verifiedBy": "Tên người kiểm tra Dashboard",
  "verifiedAt": "UTC_ISO_HIEN_TAI",
  "expiresAt": "UTC_ISO_KHONG_QUA_7_NGAY"
}
```

Đây là object để đặt vào field `freeTierConfirmation`, không thay cả config. Ngày ISO thật ví dụ lấy `(Get-Date).ToUniversalTime().ToString('o')`; dùng ngày hiện tại, không copy ngày quá khứ. Xác nhận này ràng buộc project/model/key, tối đa7ngày; không bảo đảm nhà cung cấp không thay tier/quota sau đó. Không enabled khi chưa kiểm được. Không tự nâng Paid Tier, xoay key/account hoặc fallback provider/model đắt.

**Cả quick và deep chung5 lượt/ngày Việt Nam**, persistent qua restart; mỗi attempt/reservation kể cả lỗi/quota/timeout vẫn tính bảo thủ. Cache hit không tính; `--force` bỏ cache nhưng vẫn chịu cap. Không có retry tự động; 429 lưu cooldown, chờ rồi chủ động chạy lại. `ai-usage` cho biết used/remaining/resetAt UTC (reset lúc00:00 Việt Nam). Model/usage token counters lưu khi có; chi phí không rõ ghi unknown, không phải hóa đơn0. Ledger chỉ giới hạn máy/state này; không kiểm soát app khác cùng Google project. Không xóa ledger hoặc dùng nhiều state-dirs để né hạn mức.

Kết thúc dùng key:

```powershell
Remove-Item Env:GEMINI_API_KEY
Remove-Variable p02Key
```

## 5. Duyệt cuối và export có kiểm soát

```powershell
node scripts/catalog.mjs review draft-0123456789abcdef suitable --by 'Tên người biên tập'
node scripts/catalog.mjs approve draft-0123456789abcdef --by 'Tên người biên tập'
node scripts/catalog.mjs export draft-0123456789abcdef
# Đọc before/after rồi copy đúng planId:
node scripts/catalog.mjs export draft-0123456789abcdef --apply --expect PLAN_ID
node scripts/catalog.mjs validate data/catalog.json
node scripts/catalog.mjs generate data/catalog.json data/seed.sql
git diff -- data/catalog.json data/seed.sql
```

Export chỉ ghi JSON, không gọi Wrangler/Git. Final gate yêu cầu nguồn summary/URL/free pricing, official source review, policy cho phép và current digest. Thay editorial/nguồn/taxonomy khiến approval cũ hết hiệu lực; catalog đổi từ lúc checkout thì conflict, không ghi đè. Apply-ai/source refresh không tự cập nhật nội dung đã xuất bản. Repeated export không tạo mục mới. Import lại mục đã export trả duplicate; sửa tiếp bằng checkout để có baseline mới.

Nếu có `CATALOG_CONFLICT`: `node scripts/catalog.mjs rebase DRAFT_ID` để xem baseline cũ/Git hiện tại/nội dung bạn sửa. Tự edit patch để hợp nhất các thay đổi cần giữ; sau đó `rebase DRAFT_ID --apply --expect PLAN_ID` chỉ cập nhật baseline, giữ sửa tay và hủy review cũ. Duyệt lại trước export. Không dùng rebase để che mất sửa của người khác.

## 6. Cập nhật nguồn và bảo vệ D1

```powershell
node scripts/catalog.mjs refresh draft-0123456789abcdef
node scripts/catalog.mjs show draft-0123456789abcdef
```

Refresh dùng ETag/cache; không gọi Gemini. Stars đổi không bắt buộc AI lại. Nguồn đổi nghĩa hoặc thêm tài liệu làm review cũ hết hiệu lực; lỗi GitHub giữ bản nguồn cũ và trạng thái cần xử lý. Chỉ sau review/apply/export thì Git JSON thay đổi.

D1 là projection, **không sửa nội dung trực tiếp trong DB**. Trước khi export/seed, giữ copy Git catalog đang đồng bộ làm baseline; kiểm SQLite local read-only:

```powershell
Copy-Item data/catalog.json .local/editorial/pre-change-catalog.json
node scripts/catalog.mjs projection-check 'DUONG_DAN_D1_LOCAL.sqlite' --catalog .local/editorial/pre-change-catalog.json
```

Lệnh không sửa DB, báo FAIL khi khác/thiếu/thừa record hoặc nguồn/quan hệ. Nếu drift: dừng, giữ backup, đưa sửa tay hợp lệ về Git qua checkout/review; không seed để xóa cảnh báo. Sau export, dùng **baseline trước export** để phân biệt DB cũ hợp lệ với DB-only edits. Chỉ chạy migrations/seed **local** theo SETUP sau khi đã đối chiếu. CI/cloud hiện tại chưa tích hợp guard này; trước push/deploy tương lai cần quyền và kiểm cloud drift/backup riêng. P02 không tự sync cloud hay bảo đảm cloud không có sửa ngoài Git.

## 7. Kiểm thử và nghiệm thu

```powershell
npm.cmd test
npm.cmd run check
npm.cmd run build
```

Mock API và CLI E2E nằm trong tests; helper preload chỉ dùng process kiểm thử, ứng dụng không có cờ bypass SSRF/mock API. [Báo cáo](PHASE02_REPORT.md) phân biệt local unit/SQLite/CLI/browser, live public imports và Gemini/cloud SKIP. Raw evidence/screenshot ignored; không commit nháp/key/usage. Chờ nghiệm thu P02 READY FOR REVIEW, không tự coi P01 DONE hoặc mở P03.
