# P02 — Nhập, phân tích và quản trị local

**Mới nhất P02.2 Admin local05/11:** [hướng dẫn/kiến trúc/validation](PHASE022_ADMIN.md), [sơ đồ link GitHub→website](architecture-maps/03-data.html).58 tests và browser regression PASS, Gemini live SKIP; READY FOR REVIEW, không push/deploy. Các mục CLI-only bên dưới là lịch sử trước P02.2; Admin loopback hiện đã có.

05/11/2026 · **P02 local READY FOR REVIEW**. P01 vẫn READY FOR REVIEW, chưa DONE. Baseline sạch `363c7f1` trên develop, ahead2 của origin/develop; Archify `301fd2a` được bảo toàn. Brief mới cho phép code/tests/commit local, không push/deploy/cloud/production. [Hướng dẫn thao tác Windows](PHASE02_CLI.md).

## P02.0 — Audit và contract

**PASS source audit:** validator dựng object mới nên cần parse/preserve metadata optional; CLI P01 validate/generate SQL offline, upsert giữ ID/createdAt; D1 là projection đọc. CI remote staging seed từ Git, không có writer admin. Không tạo writer D1 thứ hai hoặc sửa CI trong P02. Không được sửa trực tiếp D1: dữ liệu chỉnh phải vào Git sau review. Trước lần đồng bộ cloud tương lai phải kiểm drift/backup, vì pipeline P01 hiện tại có thể ghi đè sửa trực tiếp trong DB; lượt này không chạy đồng bộ cloud.

**Quyết định05/11:** Git/JSON + CLI đã duyệt; website ứng dụng bổ sung bên cạnh GitHub public. Ba nhóm mới thay “Khác”: tài nguyên miễn phí, ứng dụng/công cụ miễn phí, mã nguồn mở/GitHub. Nhóm không loại trừ nhau; type/source/category/free-model/license/review tách biệt. Trial-only/paid-only không export. Deep AI cần preliminary suitable, final approval độc lập; AI không bắt buộc. Hai mode chung5 HTTP requests/ngày Asia/Ho_Chi_Minh, mỗi retry tính một lượt.

**Reuse Audit:** mở rộng CLI/catalog validator/SQL generator; Node24 stdlib filesystem/crypto/DNS/HTTPS/SQLite có sẵn. Không thêm npm package/MCP/global tool/admin web/DB/schema D1/public UI. REST nhỏ phù hợp hai adapter và một Gemini provider; không cần crawler framework hoặc AI SDK/router. Context7 + official GitHub/Gemini docs đã kiểm; không có Gemini key/project/free tier được xác nhận nên live AI phải SKIP. API/free quota không được bảo đảm chỉ theo tên model.

**Milestones:** P02.0 audit PASS; P02.1–6 đang thực hiện. Commit/test/giới hạn mỗi mốc sẽ được bổ sung sau khi chạy thật. Snapshot Archify05 vẫn mô tả proposal04/11, không xem là sơ đồ implementation05/11.

## P02.1 — URL, identity và network boundary

P02.0 checkpoint `0aed560`. **PASS:** `node --test tests/editorial-network.test.mjs tests/catalog.test.mjs`18/18. GitHub .git/www/case/query variants, website normalization, aliases/stable IDs, không merge theo tên; DNS mixed-private/internal/IPv6 transition blocks, timeout, pin lookup trước TLS; redirect kiểm lại từng hop, API credentials chỉ cùng allowlist host. Không thực thi HTML/source, không npm dependency. Validator giữ optional sourceIdentity/editorial metadata trong Git, SQL projection P01 không đổi; không migrate/backfill catalog thật. Live socket/redirect tests mở rộng tại P02.6; đây chưa phải integration cloud.

## P02.2 — GitHub API và nháp bền vững

P02.1 checkpoint `0f7807a`. Reuse entrypoint `scripts/catalog.mjs`; lệnh cũ validate/generate không đổi. Import/show/list/refresh lưu nháp/source/cache local, fsync+atomic rename và single-writer lock; không reset khi CLI restart. GitHub public REST **không dùng token**, tránh lỡ đọc private repo; rate headers/ETag/negative cache, không retry ẩn. README/license có thể thiếu; giữ unknown và cần review, không chuyển GitHub detection thành license đã xác minh. Refresh giữ editorial sửa tay, identity/aliases ổn định; không gọi AI hoặc sửa catalog.

**PASS:**8 tests P02 network/import; mock API public/private404/invalid/oversize/license missing/rename/ETag304/rate limit/restart/dedup/manual edit. CLI help chạy thực tế. GitHub document selector có allowlist path/extension, không clone/tải/chạy repo. Live GitHub request và CLI E2E đầy đủ thực hiện riêng ở QA cuối; chưa dùng credentials.

## P02.3 — Website ứng dụng chính thức

P02.2 checkpoint `1b2d974`. Adapter website dùng HTTPS/DNS boundary chung, tối đa256KiB response/64KiB head; lấy title/meta description dạng text, không chạy JS/nhúng ảnh/tải installer/crawl links. HTTP chặn/CAPTCHA/encoding/metadata thiếu → partial và cho phép thủ công; `--manual` không gọi mạng. Website/Free/giấy phép đều chưa xác minh cho đến người biên tập đối chiếu, không tin quảng cáo trong meta. Redirect lưu aliases, kiểm trùng, không tự chứng nhận domain chính thức.

**PASS:**11 P02 tests network/import/website; metadata/script/comment sanitization, free/license unknown, manual no-network, timeout403/non-HTML/CAPTCHA/missing head, redirect aliases/duplicate. Không thêm dependency hay public UI. Chưa chứng nhận website bên thứ ba live; fallback không phải bằng chứng nguồn đó đúng.

## P02.4 — Rules, edit/review và export

P02.3 checkpoint `b0fa89d`. Rules whitelist topics có version, không suy mục đích từ language. Edit patch chỉ cho fields biên tập/policy/nguồn được duyệt; không sửa approval/source identity bằng patch. Preliminary suitable/unsuitable/needs_check riêng với final; edit/semantic source/taxonomy đổi làm approval cũ không hợp lệ. Checkout giữ P01 ID/slug/media/createdAt; export kiểm baseline hash, URL/ID collision và final digest. Plan mặc định không ghi catalog; apply yêu cầu đúng planId và lock cả state/catalog. AI không bắt buộc. Freemium Free limitations được chiếu vào pricing public hiện có, không mở schema/navigation mới.

**PASS:**17 P02 tests, bao gồm review/export→SQL SQLite/re-import idempotent, manual edits, stale approval/plan/catalog conflicts, trial/paid/unknown, website freeware/freemium, source changes vs stars-only. `projection-check` chỉ đọc SQLite local so với Git baseline **trước thay đổi**, báo FAIL khi có DB-only edit và không sửa để che drift. CI cloud hiện tại không được đổi: trước sync cloud sau này phải được phép readback/backup/reconcile riêng; local guard không tự chứng minh cloud không drift. Không chạy migration hoặc ghi DB cloud trong milestone.

Một fixture checkout ban đầu bỏ mất nguồn license cũ nên final validation từ chối đúng; sửa fixture để giữ/merge nguồn, không nới validator. Unit/SQLite PASS không thay cloud hoặc browser acceptance.

## P02.5 — Gemini tùy chọn quick/deep

P02.4 checkpoint `59658f9`. Hai mode thủ công, deep cần preliminary suitable hiện hành; mặc định disabled. Native REST generateContent với responseJsonSchema, không SDK/tools/grounding/fallback/retry ẩn. Config phải được người quản trị xác nhận Free Tier/model/access/billing-disabled, ràng buộc key fingerprint + project/model và hết hiệu lực tối đa7ngày; đây là **attestation thủ công, không phải đọc billing tự động**. Thiếu xác nhận không gọi mạng. Không dùng key thật trong lượt triển khai.

Ledger fsync/atomic+lock dùng chung5 requests/attempts cho cả hai mode/ngày Asia/Ho_Chi_Minh; reserve trước network, kể cả lỗi/timeout không rõ đã xử lý. Reserve không rõ vẫn tính bảo thủ, không tự hoàn hay retry; limit không bảo vệ các máy/app khác cùng project và không chống người quản trị tự xóa state. Cache theo exact bounded public input + taxonomy/rules/prompt/schema/model/mode; stars/checkedAt không làm gọi lại. Input≤32KiB toàn payload, excerpt6/16KiB quick/deep; output2000 mặc định, config chỉ256–4096. Không giả bytes là token count. Usage counters/modelVersion lưu khi API cung cấp, thiếu ghi null; estimatedCostUsd unknown không giả hóa đơn0 hoặc bảo đảm mọi model miễn phí.

AI result giữ riêng với evidence IDs, schema/length/taxonomy/reference/safety-claim checks. JSON hợp schema vẫn cần người đối chiếu ý nghĩa. `apply-ai` chỉ plan, apply cần đúng planId; không tự đổi OS/requirements/license/price hoặc sources verified. Apply vào summary/description/category/tags làm mất hiệu lực review cũ. Không ghi đè sửa tay khi import/refresh/analyze.

P02.5 checkpoint `300e698`.

## P02.6 — Validation và bàn giao

| Kiểm tra | Kết quả, phạm vi và bằng chứng |
| --- | --- |
| Unit/integration/CLI | **PASS52/52** `npm.cmd test`, gồm25 regression P01 và27 P02 cases; CLI E2E qua process thật với native HTTPS/DNS mock chỉ ở test preload. Network transport tests bao gồm DNS pin/redirect đổi host/private, response cap/encoding/loop/timeout. GitHub owner/identity mismatches và malformed JSON fail an toàn |
| Typecheck/build | **PASS** `npm.cmd run check` (27 files,0 errors/warnings/hints), `npm.cmd run build`; artifact kiểm đúng local Worker/fake DB UUID/remote:false, không account cloud |
| P01 browser | **PASS45+19 checks** Chrome156 thực ở1440/768/390 trên artifact workerd+D1 local cô lập;35 PNG,0 normal console/page errors. [P01 journeys](../qa/p02/browser-p01/results.json), [P1 regressions](../qa/p02/browser-p1/results.json). Không UI redesign |
| P02 native runtime | **PASS5 checks** CLI import manual fixture→edit→preliminary→final→plan/apply→generate SQL→Wrangler local D1; Explore/search→Detail mới ở1440/768/390 +FTS API,0 console/page errors. [Receipt](../qa/p02/runtime/results.json),3 PNG. Fixture ghi nhãn QA, chỉ trong `.cache/p02-runtime`, không vào catalog Git/cloud |
| Local drift | **PASS** read-only projection-check trên D1 local khớp13 mục baseline trước QA fixture; unit/CLI chứng minh DB-only edits bị phát hiện và không bị sửa. Checkout/rebase có plan/ack, giữ sửa tay rồi buộc review lại |
| Live public imports | **PASS GitHub** repo FreeResources public, identity/README thật, license missing giữ unknown; **PASS website OBS** title/meta thật. [GitHub/fallback receipt](../qa/p02/live-summary.json), [OBS receipt](../qa/p02/live-website-obs.json). Inkscape timeout: metadata fetch **SKIP**, manual fallback PASS, không vượt hạn chế truy cập |
| Gemini thật | **SKIP**, chưa có key/project/model/access/Free Tier được xác nhận; mocks/schema/CLI PASS không thay live model acceptance hoặc billing verification |
| Cloud/production | **SKIP**, không push/deploy, không remote D1 read/write/migration, không auth/DNS/CI thay đổi; không retry build lịch sử. Production không upload/migrate/deploy |
| Thiết bị/AT khác | **SKIP** physical mobile/software keyboard, Safari/Firefox và screen reader certification; viewport browser không thay nghiệm thu UI của chủ dự án |

Raw QA/source snapshots/screenshots/cache/keys/ledger ignored, không commit. Catalog thật vẫn13 mục, không dummy ratings/tài nguyên; migrations/package lock/CI/public UI không đổi. Không thêm dependency. Các lỗi fixture/harness đã được sửa và chạy lại; không có FAIL local còn chặn bàn giao được biết. Việc chuẩn hóa Archify theo yêu cầu mới là task docs riêng sau checkpoint P02, không gộp code vào commit docs đó.

**File chính:** `scripts/catalog.mjs` mở rộng entrypoint; modules `scripts/editorial/{network,store,github,website,review,workflow,projection,gemini,cli}.mjs`; `src/lib/validation.ts` optional identity/editorial metadata;6 test files P02 + helpers; config example/.env.example/.gitignore; PROJECT/ROADMAP/TASKS/SETUP/README/DECISIONS/ARCHITECTURE/AI_PROVIDERS và hai tài liệu P02. Source diagram/HTML Archify chưa đổi ở các code commits.

**Giới hạn cần nghiệm thu:** app guard dựa trên một state/máy chủ động, không phải quota toàn Google project; Free Tier là manual attestation có hạn, không API đảm bảo giá. Estimated cost unknown nếu thiếu billing/rate verified, không ghi0 giả. Metadata website không có browser crawler, thiếu JS-rendered data thì bổ sung tay. Data-group verification nằm Git/draft, public facets/schema mới ngoài P02. Trước cloud sync cần kiểm drift/backup được phép riêng vì CI hiện tại chưa có guard drift. P02 READY FOR REVIEW local, không tự chuyển DONE/P03; cần chủ dự án thao tác thử theo hướng dẫn.

**PASS mock:**6 tests AI với nhiều cases: disabled/no key/unconfirmed/paid/mismatched/expired, quick/deep gates, one response nhiều fields, explicit apply, cache, combined5/sixth blocked, Vietnam midnight, schema/source injection/rights claims/truncation/timeouts/429/cooldown, source-change vs stars, selected docs. **SKIP live Gemini** vì chưa có xác nhận cấu hình miễn phí, không yêu cầu key trong chat. Docs/API syntax đã đối chiếu bằng [Context7/structured output](https://ai.google.dev/gemini-api/docs/structured-output), [REST reference](https://ai.google.dev/api/generate-content), [pricing](https://ai.google.dev/gemini-api/docs/pricing); model/Free Tier cụ thể cần live spike riêng trước dùng thật.

## Kiểm tra tự chủ với dữ liệu thật — 05/11/2026

Theo yêu cầu chủ dự án, chạy CLI và browser local khi không cần người dùng thao tác. **P02 local vẫn READY FOR REVIEW**; duyệt kỹ thuật sandbox dưới tên Codex không thay nghiệm thu hoặc quyền xuất bản của chủ dự án.

| Kiểm tra | Kết quả và bằng chứng local |
| --- | --- |
| Nhập nguồn thật | **PASS** GitHub public [Archify](https://github.com/tt-a1i/archify) và website [7-Zip](https://www.7-zip.org/), không mock network và không token GitHub. Nhận metadata/evidence, kiểm trùng, chặn export nháp chưa duyệt và chặn AI khi disabled. [Intake receipt](../qa/p02/acceptance-2026-11-04T19-37-50-340Z/intake.json) |
| Biên tập → review → export | **PASS** sửa tay có nguồn, preliminary/final review, plan không ghi và apply chỉ vào catalog sao chép. Kiểm idempotence, sửa tay làm approval cũ mất hiệu lực, refresh không ghi đè nội dung đã sửa. Hai mục mang nhãn `[Bản thử]`; không vào catalog chính. License website thiếu giữ unknown; không suy quyền phân phối từ việc sử dụng miễn phí. [Review receipt](../qa/p02/acceptance-2026-11-04T19-37-50-340Z/review.json) |
| Website chính local | **PASS** Home → Search → Results → LocalSend Detail ở 1440/768/390; Explore/filter/empty state. Lần đầu mobile filter **FAIL harness** vì chọn khi panel đang đóng; chạy lại thao tác mở panel rồi chọn/apply **PASS**, không sửa sản phẩm. Giữ cả [receipt ban đầu](../qa/p02/autonomous-browser/results.json) và [receipt kiểm lại mobile](../qa/p02/autonomous-browser/mobile-filter.json) |
| Hai mục mới trong runtime riêng | **PASS 8/8** Chrome 156 hiển thị thật: Search → Results → Detail cho cả hai mục ở 1440/768/390, click CTA đến nguồn chính thức trên desktop, font ready, không overflow, 0 console/page errors. Đã xem ảnh desktop/mobile. [Runtime receipt](../qa/p02/acceptance-2026-11-04T19-37-50-340Z/browser-runtime.json), [desktop](../qa/p02/acceptance-2026-11-04T19-37-50-340Z/try-archify-1440.png), [mobile](../qa/p02/acceptance-2026-11-04T19-37-50-340Z/try-7zip-390.png) |
| Bảo toàn dữ liệu | **PASS** catalog/seed chính giữ nguyên byte; D1 chính vẫn 13 mục và hash nội dung/quan hệ/nguồn không đổi. Runtime thử riêng có 15 mục, persist trong `.cache`; trang chính không tìm thấy mục thử. Không remote D1, cloud, CI, push/deploy hoặc sửa UI/logic |
| Computer Use / Gemini | **SKIP Computer Use helper**: hai lần khởi tạo lỗi `trusted Node process exited unexpectedly`; fallback Playwright có sẵn điều khiển Chrome thật, không cài thêm dependency. **SKIP Gemini thật**: chưa xác nhận key/project/model/Free Tier; sandbox 0 lượt gọi. Không mở AI Studio hoặc thay cấu hình billing |

Mở [website chính](http://127.0.0.1:4321) hoặc [website dữ liệu thử riêng](http://127.0.0.1:4324/explore?sort=newest) khi hai server local còn chạy. Browser chỉ kiểm viewport, không thay kiểm thiết bị thật/Safari/Firefox/screen reader. Không chạy lại unit/typecheck/build vì lượt này không sửa source; kết quả 52 tests và build ở P02.6 vẫn là lần kiểm trước. Raw receipts/screenshots và state thử được ignore, không đưa vào Git. Lượt này chỉ cập nhật báo cáo/tracker, chưa commit/push.

<a id="p021-local-e2e"></a>

## P02.1 — Local End-to-End Acceptance, 05/11/2026

**READY FOR REVIEW**, theo brief nghiệm thu mới; không đổi tên các milestone implementation P02.1–6 ở trên, không tự chuyển sang P02.2/MVP/P03. Kiểm từ source HEAD `1e877f9` (code P02 ở `73a6cb9`); chưa có thay đổi app/test/dependency/config/cloud. Khi bắt đầu, Git chỉ có **2 file tracked đã sửa** là báo cáo này và TASKS; không phải8 file cần commit như mô tả trong brief. Bảo toàn hai diff đó; script `.cache` và ảnh/receipts `qa` là local ignored.

**Reuse Audit:** đọc hướng dẫn/source/config, sáu file test P02, script CLI/browser đêm trước và JSON/log/PNG. Dùng lại Node24/SQLite read-only, Playwright Core và Chrome156 có sẵn; không thêm package/MCP/skill hoặc source test trùng lặp. Context7 và tài liệu Google chính thức được đối chiếu cho hướng dẫn cấu hình; không truyền source/credential cho dịch vụ AI.

| Phần kiểm | Kết quả đã xác minh |
| --- | --- |
| Bằng chứng kế thừa | **PASS** script intake/review/render không preload mock; JSON intake3, review3 và runtime8 checks PASS. Đối chiếu nháp với2 record đã export, SHA256 catalog/seed và D1 chính. Xác minh lại receipts P01 browser45+19 checks,5 native-runtime checks và các ảnh tồn tại. Mobile filter FAIL cũ là chọn khi panel đóng, receipt kiểm lại PASS được giữ riêng. [Receipt đối chiếu mới](../qa/p02/local-e2e-2026-11-05/verification.json) |
| Import/README/metadata/rules | **PASS** kế thừa GitHub Archify/website7-Zip live; metadata API, README và license giữ đúng provenance, phần website thiếu giữ unknown. Bổ sung CLI thật:3 URL sai bị từ chối trước tạo nháp; `rules` trên cả2 nháp chạy không key/Gemini. Không suy category từ language, không tự dịch README bằng rules |
| Lỗi mạng/rate limit/duplicate | **PASS 27/27 focused tests mới**,6 file `tests/editorial-{network,import,website,review,ai,cli}.test.mjs`: URL/SSRF, metadata thiếu, timeout/response caps, ETag304, GitHub429/cooldown, trùng, stale approval/plan/conflict, export/SQL, AI. [Log](../qa/p02/local-e2e-2026-11-05/focused-tests.log). Rate limit/API failures được inject bằng fixture, **không phải đã làm cạn quota GitHub thật**; timeout website thật trước đó có bằng chứng riêng |
| Review/export/cách ly | **PASS** final approval bắt buộc, plan không ghi, apply/idempotence đúng; sửa tay làm review mất hiệu lực, refresh giữ nội dung sửa. Catalog sao chép15 mục có2 nhãn `[Bản thử]`; catalog/seed chính giữ nguyên byte và D1 chính13 mục/nguồn/quan hệ giữ cùng content digest. Không seed/migrate mới hoặc sửa DB chính |
| Browser bổ sung | **PASS 13/13**, Chrome hiển thị thật1440/768/390: Home ảnh/font/overflow; search loading/aria-busy;503 inject chỉ trên request trong browser → error → retry bằng Enter; empty/Escape trả focus; Search → Results → Detail7-Zip đã export → Explore qua navigation.0 lỗi bất ngờ;3 console503 là lỗi chủ động để kiểm recovery. [Receipt](../qa/p02/local-e2e-2026-11-05/browser.json), [ảnh mobile](../qa/p02/local-e2e-2026-11-05/search-error-390.png). Đã xem ảnh mobile trực tiếp |
| Gemini source/mocks | **PASS local** default off, `GEMINI_API_KEY` trong process env; model/project từ `.local/editorial/config.json`, không hardcode model. Quick/Deep chung5 attempts/ngày Việt Nam, cache không tốn lượt, reserve lỗi vẫn tính, không retry/fallback tự động, deep cần suitable hiện hành; schema/evidence/cap validation và apply plan riêng. Có regression chứng minh `analyze` không thay editorial/final approval/catalog |
| Gemini API thật | **SKIP** kiểm hiện tại: enabled=false, keyPresent=false, model/project/confirmation chưa có; usage local hôm nay0/5. Không đọc/in `.env` hay key, không tạo key/Google project/billing; không gọi Quick/Deep thật. Model thực tế, chất lượng Việt/hallucination, quyền truy cập và compatibility schema trên model đó **chưa kiểm chứng**. [Hướng dẫn cấu hình và lượt thử tối đa2 calls](PHASE02_CLI.md#4-cấu-hình-gemini--mặc-định-tắt) |
| Public/production | **PASS HTTP read-only** hai truy vấn public Preview Archify/7-Zip trả200, không có markers của mục thử. [Receipt](../qa/p02/local-e2e-2026-11-05/public-readonly.json). Không push/deploy/remote migration/secret/DNS/CI mutation. **SKIP readback remote D1/production hiện tại**: không truy cập credential hoặc giả nhận hash cloud bằng hash local |
| Build/thiết bị khác | **SKIP chạy lại full52/typecheck/build**: source/config/lockfile không đổi; PASS cũ là lịch sử tại P02.6, không phải kết quả mới trong lượt này. Physical mobile, keyboard ảo, Safari/Firefox/screen reader và lỗi mất D1 thật SKIP. Browser503 inject kiểm UI recovery, không chứng minh D1 outage/restore |

Hai server của phiên đêm trước đã dừng. Đã mở lại **chỉ runtime thử riêng** tại [127.0.0.1:4324](http://127.0.0.1:4324/explore?sort=newest) bằng Wrangler local pin4.156.2, `--local`, artifact đúng Worker local/DB UUID giả/remote:false, persist cũ trong `.cache/p02-acceptance-2026-11-04T19-37-50-340Z/runtime`. Không cần migrate/seed hoặc rebuild. Cổng4321 chưa được mở lại trong lượt này. Server local chỉ truy cập được trên máy đang chạy; đóng tiến trình hoặc khởi động lại máy thì cần chạy lại. [Wrangler local flags](https://github.com/cloudflare/workers-sdk/blob/main/packages/wrangler/src/dev.ts).

**FAIL còn chặn local:** chưa phát hiện sau các kiểm tra trên. Không coi SKIP Gemini thành PASS hoặc user acceptance. Source/lockfile/migrations/catalog/cloud config giữ nguyên; chỉ5 tài liệu `PROJECT.md`, `ROADMAP.md`, `TASKS.md`, `docs/PHASE02_CLI.md`, `docs/PHASE02_REPORT.md` vào checkpoint local. Raw script/state/log/screenshot không stage. Commit local dùng subject `docs: verify P02.1 local end-to-end acceptance`; SHA/trạng thái thực tế báo sau khi commit. Không push/deploy.

**PASS kiểm tài liệu:**49 liên kết file local trong5 tài liệu tồn tại,44 ảnh được các receipts browser tham chiếu còn trên máy,14 block PowerShell trong CLI guide parse đúng cú pháp (không thực thi các lệnh key/AI), `git diff --check` sạch. Không kiểm API thật bằng việc parse ví dụ.

**An cần nghiệm thu thủ công:**

1. Mở bản thử4324, tìm Archify/7-Zip, đọc Detail và mở nguồn; xác nhận cách trình bày/tiếng Việt, không xem hai mục sandbox là tài nguyên được xuất bản.
2. Thử CLI import → edit → review → export trong bản sao nếu cần; quản trị hiện là CLI, chưa có Admin web. Đồng ý nội dung/giấy phép/điều kiện Free trước khi đưa bất kỳ mục thật nào vào catalog chính.
3. Nếu muốn nghiệm thu AI, tự xác nhận project/key/model/Free Tier và nhập key kín theo hướng dẫn; một Quick và một Deep, không force/retry, ghi cache/usage và đọc gợi ý so với evidence. Không gửi key vào chat. Chưa đáp ứng thì giữ SKIP.
4. Gửi quyết định nghiệm thu P01/P02 hoặc danh sách cần sửa. P01/P02 giữ **READY FOR REVIEW**, không DONE; cloud sync/MVP20–30 mục/installer/P03 cần lệnh riêng.
