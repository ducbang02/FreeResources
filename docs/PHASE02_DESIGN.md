# P02 — API trước, AI sau: thiết kế nhập GitHub

> **Quyết định triển khai05/11/2026 — thay thế các đề xuất mâu thuẫn bên dưới.** P02 được giao local, không push/deploy/cloud. Git/JSON + CLI là nguồn biên tập duy nhất; D1 là projection. Hỗ trợ repo GitHub public và website ứng dụng chính thức (metadata hạn chế hoặc thủ công), không crawler. Ba nhóm: **Tài nguyên miễn phí / Ứng dụng & công cụ miễn phí / Mã nguồn mở & GitHub**, có thể giao nhau, không nhân bản record. Freeware/free lâu dài/freemium có free tier rõ được phép; trial-only/paid-only/crack không phù hợp. Không còn khu vực “Khác” freemium/trial như đề xuất cũ.
>
> AI **nhanh và chuyên sâu đều thủ công**, không tự gọi khi import/refresh; deep cần duyệt sơ bộ suitable. Cùng ledger bền vững **5 requests/ngày Asia/Ho_Chi_Minh**, lỗi/retry thực gửi đều tính; cache hit không tính. Chưa có xác nhận key/project/model/free tier thì fail-closed, không gọi thật. Người duyệt sơ bộ/final tách riêng; AI suggestion không tự đổi editorial hoặc license/pricing. Không cần AI để final approve/export khi đủ nguồn. Schema D1/public navigation giữ nguyên; metadata/provenance mới optional trong Git record, draft/cache/usage local ignored. [Tiến độ và bằng chứng](PHASE02_REPORT.md). Phần04/11 bên dưới là snapshot thiết kế lịch sử, không phải contract triển khai05/11.

04/11/2026 · **READY FOR REVIEW — thiết kế PROPOSED, implementation NOT STARTED.** P01 vẫn READY FOR REVIEW, chưa được người dùng xác nhận DONE. Brief mới đã chốt nguyên tắc sản phẩm; chưa cấp quyền code, dùng key, migration, push hoặc release. Archify P01 đã được lưu riêng ở commit local `301fd2a`, chưa push; bốn sơ đồ hiện trạng được giữ nguyên.

## 1. Kết luận đề xuất

Giữ **Git/JSON là nguồn biên tập chính cho P02 nhỏ**, quản trị bằng CLI trên một máy của người biên tập. **D1 là projection phục vụ đọc**, được cập nhật qua pipeline Preview P01 đã có. Nháp/ảnh chụp nguồn/approval/usage ledger lưu local bền vững, tách khỏi cache có thể xóa. Không tạo admin web, public mutation API, Cloudflare Queue hay database mới ở bước đầu.

Luồng mục tiêu: **URL GitHub → chuẩn hóa/trùng → GitHub API public → validate/quy tắc → Gemini tùy chọn → nháp → người duyệt → xuất Git/JSON → review diff/commit/push được phép → CI P01 → kiểm Preview**. Các mũi tên trước bước xuất Git là đề xuất chưa triển khai. AI không được gọi trên Search hoặc Detail.

[Data flow hiện trạng P01/P02](architecture-maps/03-data.html) · [Index bốn sơ đồ](architecture-maps/index.html). Theo yêu cầu chuẩn hóa05/11, luồng P02 được hợp nhất vào Data; proposal04/11 vẫn được giữ trong tài liệu này/roadmap như lịch sử thiết kế. Sơ đồ phân biệt local implementation, Gemini live chưa kiểm và backlog proposed, không coi đề xuất là runtime.

## 2. Audit hiện trạng và bằng chứng

| Phần | Thực tế đã có | Còn thiếu cho P02 |
| --- | --- | --- |
| Nguồn biên tập | [catalog JSON](../data/catalog.json),13 resources/7 types,6 categories/12 tags; Git lưu nội dung được seed | Chưa có importer GitHub, ID nhà cung cấp, ETag hoặc snapshot version |
| Validation | [validation.ts](../src/lib/validation.ts): URL HTTPS public, taxonomy, trùng ID/slug/canonicalUrl, nguồn theo trường, missing media; public description≤2400 ký tự | Chưa phải GitHub URL parser/SSRF client, chưa có validation response GitHub/AI/draft |
| CLI | [catalog.mjs](../scripts/catalog.mjs): đọc JSON, validate media, sinh SQL offline, upsert theo ID, giữ createdAt | Chưa fetch API, draft store, approval hoặc AI integration |
| D1 | [migration0001](../migrations/0001_catalog.sql): resource/taxonomy/sources + FTS5/triggers | Không có bảng jobs/drafts/users/ratings; license/pricing hiện là text nullable, không phải enum xác minh |
| Website | [catalog.ts](../src/lib/catalog.ts), [Search API](../src/pages/api/search.ts), [Explore](../src/pages/explore.astro), [Detail](../src/pages/resources/[slug].astro): SQL bind, chỉ published | Chưa có ba khu vực điều hướng mới, structured system requirements hay community ratings |
| CI | [build-worker](../scripts/build-worker.mjs), [preview](../scripts/preview.mjs#L82-L134), [no-production](../scripts/no-production.mjs): develop checks/build → staging migrate/seed → Preview; main no-op | Không có production deploy path; không được thêm writer D1 cạnh Git seed |
| AI | [AI_PROVIDERS](AI_PROVIDERS.md) là tài liệu định hướng | Không SDK/client/key/router/AI call thật trong app |

Đã xác minh lại bằng thao tác **read-only**: remote develop=`a84c55a`, main=`31d3053`; local develop=`301fd2a` ahead1 trước thay đổi thiết kế này. Home, Explore lọc repository, Detail LocalSend và `/api/search?q=file` trên Preview trả HTTP200/noindex. Đây là HTTP smoke mới, không thay bộ browser45+19 của P01. Deployment SHA/bindings cloud không được đọc lại trong lượt thiết kế; bằng chứng live trước đó nằm trong [P1 fixes](PHASE01_P1_FIXES.md). Không retry CI hoặc dùng credential cloud/Gemini.

Các điểm cần sửa trong tài liệu cũ: “Gemini-first” nghĩa là **provider AI đầu tiên khi cần AI**, không phải gọi AI trước API; “metadata là sự thật nền” cần tách quan sát API với lời tác giả. Ví dụ AI tự trả license/platforms và router gọi riêng classify/draft/tags không còn là mặc định P02. Admin web/auth trong roadmap cũ là phương án dài hạn; CLI-first bên dưới vẫn chờ duyệt.

## 3. Phân chia trách nhiệm

| GitHub API chính thức | Code thông thường | Gemini, chỉ khi cần |
| --- | --- | --- |
| ID repo, owner/full_name, canonical URL, public/private, default branch | Parse URL allowlist, chuẩn hóa, loại trùng trước AI; ID ổn định sau resolve alias | Đọc ngữ nghĩa README đã giới hạn |
| Stars/forks, language, topics, updated_at/pushed_at | Kiểm kiểu/range, chuẩn hóa timestamp, luật phân loại và mapping taxonomy | Viết summary/description tiếng Việt |
| README và metadata/blob SHA | Chọn excerpt, hash/version, cache, kiểm dữ liệu thiếu | Giải thích công dụng, đối tượng phù hợp |
| License được GitHub nhận diện và file LICENSE khi cần | Giữ unknown/null, đối chiếu nguồn, quy tắc nhãn license/pricing | Gợi ý category/use case/tags nếu luật chưa đủ |
| Releases/version/link phát hành khi người biên tập cần | Draft state, retry/quota/queue, approval, export, theo dõi usage | Gộp key features/strengths/limitations/Detail trong **một response có cấu trúc**, chỉ khi nguồn đủ |

API là phương tiện lấy dữ liệu, không biến nội dung tác giả thành dữ liệu đã được FreeResources xác minh. Stars/forks là popularity, không phải điểm chất lượng. Language là metadata kỹ thuật, không suy ra mục đích hoặc OS: RustDesk không thành “Lập trình” chỉ vì tên/ngôn ngữ.

Provenance tách `origin = github_api | repository_author | rule_derived | ai_suggestion | human_review | unknown` khỏi `verification = unreviewed | verified | unknown | disputed`. Description/topics/README/release body là lời tác giả dù được vận chuyển qua GitHub API; số stars/id/timestamps là quan sát API. License API là phát hiện của GitHub trên tài liệu tác giả, không phải xác minh toàn bộ code/dependencies/assets. [GitHub mô tả phạm vi nhận diện license](https://docs.github.com/en/rest/licenses/licenses).

## 4. Ba khu vực khám phá, không phải ba resource types

| Khu vực theo brief | Quy tắc đề xuất, chưa có UI |
| --- | --- |
| Mã nguồn mở & GitHub | Repo public GitHub được trình bày là “GitHub”. Chỉ có badge “mã nguồn mở đã đối chiếu” khi license có bằng chứng, trạng thái review phù hợp và thuộc danh sách license được chấp nhận; public/null/NOASSERTION không đủ |
| Tài nguyên miễn phí | Có khả năng sử dụng miễn phí được đối chiếu từ nguồn chính thức; freemium/giáo dục phải nói rõ phần miễn phí, điều kiện và giới hạn. Không suy miễn phí từ license hoặc public repo |
| Tài nguyên khác | Đề xuất giới hạn ban đầu ở freemium/trial có nguồn chính thức và use case rõ. Không phải phần bù chứa mọi mục unknown/paid; chờ Q-11 |

Một resource có thể nằm ở nhiều khu vực; không nhân đôi record. Giữ7 `resource.type` P01. Tách topic/category, purpose/use case, tags, license, pricing, platforms, requirements và verification. Hiện6 categories là nhóm rộng; `chuyen-file`, `ve-so-do`, `hoc-lap-trinh` đã là tags. Đề xuất chọn subset tags làm use-case IDs có registry được duyệt, bổ sung TTS/remote desktop/PDF/AI-tools khi có nhu cầu; không tạo taxonomy service hoặc tự sinh ID từ model.

Draft có một `primaryCategoryId` từ categories hiện có, một `primaryUseCaseId` từ tập purpose được duyệt, các secondary use cases và tags. Rule mapping có version/evidence; xung đột giữ null/needs_attention hoặc chuyển người biên tập, không dùng AI để che thiếu bằng chứng. Platform/requirements chỉ lấy từ nguồn được đối chiếu; language hoặc AI không đủ chứng minh tương thích thiết bị. UI ba khu vực và persist facets mới là milestone có gate riêng, không mặc định đã được giao triển khai.

## 5. Luồng nhập và ranh giới an toàn

1. **URL:** phiên bản đầu chỉ HTTPS GitHub repo root với owner/repo; chặn credentials, port lạ, host giả, IP, encoded slash và subpath không được hỗ trợ. `.git`, trailing slash, case được xử lý theo contract/test; canonical từ API là kết quả cuối. Không fetch URL nhập vào: xây endpoint trên `api.github.com` từ owner/repo đã validate.
2. **Trùng:** tra canonical/aliases có sẵn, draft đang mở và `github.id` trước khi gọi AI. Nếu có match rõ thì trả mục hiện có; refresh là hành động riêng. Với rename/transfer chưa biết, cho phép một lần resolve API rồi kiểm lại ID trước AI. Match có thể trùng với resource application dùng website làm URL chính thì giữ `possible_duplicate`, người duyệt quyết định liên kết; không dùng tên gần giống để tự merge.
3. **Public API:** GET repository trước, chỉ đi tiếp khi xác nhận public; token có quyền private cũng không làm private repo hợp lệ. README có thể thiếu; license/releases có thể chưa biết. GET readme khi cần nội dung, license khi cần đối chiếu, languages breakdown/releases chỉ theo nhu cầu. Không crawl issues/history hoặc tải/chạy release assets. `updated_at` khác `pushed_at`; bản README có hash riêng.
4. **Response:** timeout, giới hạn byte trước parse/decode, check shape/ranges/URL, ghi snapshot công khai + observedAt + ETag/blob SHA. Private/unavailable không đưa content mới vào draft nguồn public. Redirect chỉ theo allowlist endpoint GitHub API, giới hạn bước; không follow Location sang host bất kỳ. Markdown/HTML/README là dữ liệu không tin cậy, không thực thi hoặc dùng làm system instructions.
5. **Rules:** luật whitelist từ metadata có version, trả kết quả + evidence/rule ID. `needs_ai` là lý do cụ thể như thiếu mô tả Việt/phân loại ngữ nghĩa; dữ liệu nguồn không đủ thì ghi unknown, không bắt AI đoán.
6. **AI gate đề xuất:** chỉ chạy khi có nhu cầu ngữ nghĩa/biên tập **và người quản trị yêu cầu**, repo public/không trùng, snapshot còn phù hợp, không có cache hợp lệ, còn quota/budget và đã xác nhận chế độ miễn phí phù hợp. Đủ rules hoặc không muốn AI thì bỏ qua; người biên tập vẫn hoàn thiện nháp thủ công.
7. **Nháp:** lưu GitHub facts, trạng thái AI/kết quả lỗi riêng. AI fail/quota/README missing không xóa dữ liệu GitHub, không biến import thành phụ thuộc Gemini.
8. **Review:** người biên tập chỉnh riêng editorial; approval gắn digest của input/fields/evidence hiện tại. Edit, refresh nguồn hoặc đổi bản ghi gốc làm mất approval; phản hồi AI trễ không ghi đè sửa tay.
9. **Export:** chỉ approved + digest hiện hành + không trùng + đủ nguồn mới xuất qua validator P01. Ghi JSON atomic, preview diff, sinh/review SQL; không tự git push hoặc gọi Wrangler từ importer. Commit/push develop chỉ theo quyền riêng, CI P01 giữ nguyên; Preview được kiểm lại trước ghi nhận published. Chưa đổi production.

README/description/topics không đủ xác minh license, giá, yêu cầu hệ thống hoặc an toàn tuyệt đối. License null/NOASSERTION/custom không được AI chuyển thành MIT/open-source. Link/download/image trong README không tự fetch, nhúng hoặc phân phối; icon/image của mục nhập mới mặc định null, dùng fallback P01 cho đến khi có nguồn/quyền phù hợp.

## 6. Nguồn biên tập: lựa chọn và migration

| | Git/JSON + CLI, **ưu tiên đề xuất** | D1 làm nguồn biên tập + admin web |
| --- | --- | --- |
| Phù hợp hiện tại | Reuse validator/importer/CI; diff/review/rollback bằng Git, một người biên tập | Hợp nhiều editor/jobs và cộng đồng nhưng cần admin auth, permissions, audit, backup |
| Writer nội dung | Chỉ export đã duyệt/maintainer có quyền vào Git | Chỉ backend admin ghi D1, Git không còn seed ghi đè nội dung |
| Chi phí/độ phức tạp | Không thêm cloud/dependency; nháp local cần backup và không đồng bộ nhiều máy | Thêm schema/migrations, runtime mutation, sessions và vận hành |
| Rủi ro | Hai máy dùng một Gemini project có thể vượt ledger local; chọn một máy biên tập chủ động ở P02 nhỏ | Nếu giữ seed CI hiện nay sẽ ghi đè sửa tay trong D1; không được mở writer web trước khi giải quyết |
| Chuyển tiếp | Stable resource.id/provenance giúp chuyển writer sau này | Cần gate chuyển nguồn: freeze, backup, import/verify, ngừng seed authoritative, rollback drill và chỉ một writer |

**P02 importer nhỏ không cần migration D1 ngay.** Draft đầy đủ ở local; public export ban đầu giữ contract P01 (`summary≤240`, `description≤2400`, type/taxonomy/sources, stable ID). Đề xuất mở rộng **optional `github` metadata trong cùng record Git/JSON** cho `id` dạng chuỗi, `fullName`, aliases và snapshot/fetchedAt để dedup bền vững qua clone/rename. Phải sửa validator để parse/preserve trường được duyệt; validator hiện tạo object mới nên thêm field tùy tiện sẽ bị mất. SQL generator vẫn chiếu các cột public hiện có; website không đọc metadata này, D1 chưa cần thêm cột. Không tạo sidecar cùng có quyền sửa title/description.

Giữ ID của resource cũ; mục mới có thể dùng `gh-<numeric-id>` (phù hợp slug validator, không dùng `github:<id>` có dấu hai chấm). Không tự đổi slug/createdAt theo rename; unique URL collision yêu cầu người duyệt giải quyết. Existing records chưa có github.id vẫn hợp lệ; backfill là thay đổi Git có review, không rewrite13 mục trong lượt thiết kế.

Khi được giao hiển thị/filter ba khu vực, license/pricing verification hoặc requirements mới trên website, **cần contract public + migration bổ sung được review** để projection D1 lưu các facts có cấu trúc; không ép vào free text hoặc nhét làm tags giả. Có thể thêm facts JSON/enum hẹp với defaults unknown; exact columns/indexes chốt khi biết query/UI. Không tạo file migration/DDL hoặc chạy backfill trong lượt này. Chưa cần bảng users/ratings/jobs cloud. Community sau này tham chiếu stable resource.id bằng các bảng riêng; không seed lại dữ liệu người dùng từ catalog.

## 7. Schema nháp và nguồn — PROPOSED v1

Đề xuất local state bền vững ở `.local/editorial/` (sẽ ignore và bảo vệ/backup khi được giao code), cache có thể bỏ ở `.cache/import/`. Chưa tạo các thư mục dữ liệu này. Không commit raw drafts/prompts/usage/keys lên repo public; nháp “không hiện website” khác “không lộ trên GitHub”. Một tiến trình ghi local mỗi lần, lock/atomic writes; không cần queue service. Cache hết hạn không được xóa snapshot/evidence mà approval đang tham chiếu.

| Nhóm draft | Fields/constraint dự kiến |
| --- | --- |
| Identity/version | `schemaVersion=1`, draftId, draftRevision, resourceId nếu đã liên kết, baseCatalogDigest; timestamps UTC |
| GitHub source | id dạng chuỗi an toàn, fullName/canonicalUrl/aliases/public, description/topics/language/counts, updatedAt/pushedAt; source snapshot/hash và observedAt |
| License/pricing | detected SPDX/file/blob SHA hoặc null, detection `detected/unknown/custom`, verification; pricing model `free/freemium/trial/paid/unknown` + điều kiện/nguồn. Không có license ≠ không an toàn hay tự động không hợp lệ; không gắn OSS |
| Evidence | id, URL, origin/transport, observedAt, content hash/blob SHA/path nếu có, fields, verifiedAt/reviewer khi đã review. Không đánh đồng fetchAt với verifiedAt |
| Derived rules | ruleVersion, taxonomyDigest, primaryCategory/useCase, secondaryUseCases/tags, matched evidence và lý do cần người/AI |
| AI analysis | aiState, request/attempt ID, inputDigest, prompt/schema/model config version, requested model/returned modelVersion, usage nếu có, generatedAt, result hoặc error code. Không lưu key/raw headers |
| Editorial | title/summary/description, primaryCategory/useCase/secondary/tags, verified platforms/requirements; provenance và overrides của người biên tập tách khỏi raw facts/AI suggestion |
| Review/export | reviewState, approvedDigest/by/at; xuất record nào, catalog commit/Preview verification khi có. Quyền Git/CI không được suy ra từ approval trong draft |

Trạng thái tách ba trục nhỏ thay vì một enum trộn lỗi/quota/duyệt:

- `metadataState`: **pending → complete/partial**, hoặc **blocked/failed**; partial vẫn giữ dữ liệu lấy được, không tự bỏ validation khi export.
- `aiState`: **not_needed/queued/running/complete/invalid/quota_wait/failed**. Timeout không rõ kết quả ghi thêm `outcome_unknown`, giữ reservation, không tự coi là chưa tính phí.
- `reviewState`: **draft → approved/rejected**. Mọi chỉnh sửa/refresh ảnh hưởng nội dung approved trả về draft. Không có transition AI→approved. `requires_review=true` do code đặt, model không có quyền tắt.

Retry dùng attemptCount/nextAttemptAt/errorClass trên job; `quota_wait` chỉ được resume khi đủ điều kiện hoặc có thao tác quản trị. Xuất JSON chưa có nghĩa Preview đã cập nhật: giữ catalog commit và kết quả CI/browser riêng. Publish/verification không phải trạng thái AI.

### Một payload AI cho một bản phân tích

Task đầu là **`analyze_repository`**, một request bao gồm các trường dưới đây; không gọi lần lượt classify_resource/draft_resource_page/suggest_tags. ID/tên repo, type=repository, license, giá, stars, OS và yêu cầu cấu hình là fields do code/nguồn/review quản lý, không thuộc quyền model.

| Output đề xuất | Validation phía app |
| --- | --- |
| `summary_vi`, `description_vi` | Plain text tiếng Việt,≤240/2400 ký tự; không HTML/claim an toàn tuyệt đối; có nguồn cho công dụng |
| `primary_category`, `primary_use_case`, `tags` | Chỉ ID taxonomy được cấp; nullable/[] nếu chưa đủ nguồn; tags≤8, không tự tạo category/license badge |
| `target_users` | ≤5 mô tả ngắn; gợi ý chưa xác minh, cần reviewer |
| `key_features`, `strengths`, `limitations` | Mỗi mảng≤4 claim `{text, evidence_ids}`; có thể rỗng. Không ép model bịa ưu/nhược hoặc minimum OS |
| `source_references` | Ánh xạ field/claim → IDs trong evidence input; không chấp nhận URL/nguồn do AI tự tạo |
| `unknowns`, `confidence` | Unknowns ngắn; confidence `low/medium/high` chỉ là tự nhận xét, không phải xác suất, rating hoặc quyền publish |

Strict shape/length/enums/references, reject extra sensitive/unrequested fields, kiểm finishReason/truncation/safety refusal; JSON đúng schema vẫn có thể sai nghĩa. Evidence ID tồn tại không chứng minh claim đúng — reviewer phải đối chiếu. AI result chỉ nằm dưới `ai_suggestion`; không tự overwrite editorial đã sửa. Gemini hỗ trợ subset JSON Schema và vẫn yêu cầu validation giá trị ở app: [structured output](https://ai.google.dev/gemini-api/docs/structured-output).

## 8. Cache, quota, lỗi và chi phí

### GitHub

Đề xuất TTL: repository metadata6h, README/license theo blob/content hash và conditional refresh, negative unavailable10phút; languages/releases chỉ theo nhu cầu, TTL24h. Đây là cấu hình đề xuất, không phải hạn mức GitHub. Khóa cache gồm endpoint/canonical ID, Accept/media type, API-version và ngữ cảnh public; không chứa credential. 304 giữ body cũ và cập nhật checkedAt; không được tạo body từ304 khi cache thiếu. Chỉ request hết TTL hoặc admin yêu cầu refresh, không cron quét lại cả catalog.

Đọc `x-ratelimit-remaining/reset/resource`, `retry-after`, ETag/Last-Modified; request nối tiếp/concurrency1, tổng attempt cap. 304 chỉ được miễn primary quota theo điều kiện authenticated được GitHub mô tả, không suy “mọi304 miễn mọi limit”. [Best practices](https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api), [rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api).

| Lỗi/đổi nguồn | Hành vi thiết kế |
| --- | --- |
| Repository404/private | Unavailable/blocked, không AI;404 không đủ phân biệt private với không tồn tại. Giữ record đã xuất bản trước đó, báo cần người xem, không tự xóa/archive |
| README/license/release404 | Trường tương ứng missing/unknown; không coi repo đã biến mất; metadata còn lại vẫn vào draft |
| Rename/transfer/301 | Theo redirect allowlist có giới hạn; resolve repo ID, ghi alias và yêu cầu review thay canonical; kiểm trùng lại trước AI |
| GitHub403/429 | Phân loại auth/forbidden vs primary remaining0 vs secondary. Tôn trọng retry-after/reset, secondary không có chỉ dẫn thì chờ ít nhất1phút và backoff có giới hạn; không đổi key để né |
| Network/timeout/5xx | Giữ snapshot trước; retry tối đa3 attempts có backoff+jitter/deadline; không treo CLI vô hạn |
| Invalid/truncated response | needs_attention, không parse/nhập một phần như dữ liệu đã xác minh |

### Gemini và budget local

**Mặc định AI disabled, chỉ bật M4 sau khi được duyệt.** Đề xuất chọn một model text thuộc nhóm chi phí thấp/Flash-Lite đang hỗ trợ schema và đáp ứng benchmark Việt; cấu hình model ID/phiên bản tại spike, không tự fallback lên model đắt. Không dùng grounding, URL-context, code execution, tools, paid context caching hoặc batch service ở bản đầu. Cache kết quả local khác với context caching trả phí của provider.

Cache AI = hash của **toàn bộ input thực sự gửi** + excerpt/source hashes + taxonomy/rule/prompt/schema/config/model version + ngôn ngữ. Không đưa stars/forks/timestamp biến động vào prompt nếu không cần; chúng đổi không làm chạy AI lại. Lưu modelVersion trả về; alias không bảo đảm version bất biến, nên có config revision/thời hạn review. Force-analyze cần lý do và vẫn chịu quota/budget, không overwrite sửa tay.

| Guard mặc định đề xuất, chờ duyệt M4 | Giá trị |
| --- | --- |
| Chế độ | Một máy/người biên tập chủ động; free-only đã xác nhận, paid budget0; chưa rõ billing/free eligibility thì block AI |
| AI attempts/ngày | 5, kể cả retry; concurrency1 |
| Input/output mỗi attempt | ≤4000 input tokens /≤2000 output tokens; chọn thinking tối thiểu nếu model hỗ trợ |
| Ngân sách token/ngày | ≤20000 input /≤10000 output, cộng provider usage cần tính phí theo contract model |
| Kích thước/ngắt chờ | README decoded≤256KiB; excerpt≤12KiB UTF-8, input token check vẫn riêng; GitHub timeout15s/AI45s |
| Retry/queue | Tối đa3 attempts có backoff+jitter cho lỗi transient đã phân loại và còn budget; quota ngày thì lưu queue, không retry dồn |

Các số trên là **cap ứng dụng đề xuất**, không phải quota/rate provider. Khi cần token count chính xác dùng API countTokens có giới hạn, không mặc định ký tự/4 là token count. Reserve budget trước network, lưu attempt ledger atomic và đối chiếu actual usage khi có; timeout/outcome_unknown không tự trả reservation hoặc gọi lại ngay vì chưa chứng minh API chưa xử lý. Không hứa exactly-once generation. Một kết quả JSON sai schema không tự mở chuỗi “AI sửa AI”; giữ invalid để người quản trị xem.

App ledger theo ngày Asia/Bangkok, timestamps UTC; reset/quota provider theo project/model và múi giờ của họ. Gemini giới hạn theo project chứ không chỉ key; một ledger local không giới hạn các máy/ứng dụng khác cùng project. Mặc định vận hành một máy, không xoay tài khoản/key; hết quota giữ draft và nextAttemptAt. [Rate limits](https://ai.google.dev/gemini-api/docs/rate-limits), [retry guidance](https://ai.google.dev/gemini-api/docs/troubleshooting).

Ghi request/attempt count, prompt/candidate/thought/cache token counters nếu có, totalTokenCount làm tổng đối chiếu, returned modelVersion/responseId và bảng giá version. Không cộng cached tokens thêm lần nữa vào prompt hoặc cộng total vào các thành phần. Thiếu usage/giá thì ghi unknown/conservative reservation, không ghi0 giả. Paid-equivalent estimate để so model khác với tiền thực trả; chưa chốt giá USD/model trong thiết kế và không bật paid project. Free-tier eligibility/data policy phải xác nhận trước M4; chỉ gửi evidence public được chọn, không gửi notes riêng/key/draft chưa duyệt. [Usage response](https://ai.google.dev/api/generate-content), [pricing](https://ai.google.dev/gemini-api/docs/pricing), [billing](https://ai.google.dev/gemini-api/docs/billing).

## 9. Milestones và tiêu chí nghiệm thu dự kiến

| Mốc | Phạm vi nhỏ nhất, chỉ làm sau lệnh triển khai | Gate/test bắt buộc |
| --- | --- | --- |
| M0 · Khóa contract | Chốt Q09–11, nguồn biên tập, taxonomy, approval/export, budget; P01 nghiệm thu hoặc có lệnh rõ chấp nhận baseline | Thiết kế được review; không suy READY thành quyền code |
| M1 · URL/identity | CLI GitHub-only, dedup current URLs/sources/open drafts, stable ID/rename; optional github metadata Git contract | Valid/invalid/host giả/encoded path; duplicate trước AI; slug/createdAt cũ giữ; optional field round-trip không bị validator bỏ |
| M2 · API → draft | Repository/README/license response validation, public-only, durable draft, ETag/cache, bounded errors | Missing/private404, unknown license, README missing/too large, redirect/collision, timeout/rate-limit/304 cache-miss; GitHub data tồn tại khi AI chưa có |
| M3 · Rules/review/export | Luật versioned, editable draft, approval digest, conflict check, output qua validator/SQL P01 | Rules không gọi AI; admin edit vô hiệu approval; draft/rejected không export; edited/source-changed draft không dùng approval cũ; CLI không tự push; Seed/re-import idempotent |
| M4 · Gemini tùy chọn | Một analyze_repository response, local cache/usage/queue/guards, manual trigger; M1–3 dùng được khi AI off | Timeout/429/quota, invalid JSON/schema/evidence, injected README, one logical analysis nhiều fields, cache/force budget, late response không đè edit; free/project/model spike được duyệt |
| M5 · Public facets, gate riêng | Nếu được giao: ba khu vực + verified facts/platform/requirements hiển thị/filter | Chốt exact schema/migration và unknown defaults trước; overlap không duplicate, badge không suy license/giá từ AI; rollback/local/staging + browser QA |

Chưa có auth/admin web/member/ratings/community upload/cron hay provider thứ hai trong M1–4. Future ratings tách **community score / popularity / suitability**; dùng minimum sample/Bayesian hoặc phương án được kiểm, không Top1 theo trung bình một phiếu. Độ phù hợp thiết bị dựa trên requirements có nguồn; không AI đoán compatibility.

## 10. Matrix kiểm thử để triển khai sau này

| Nhóm | Cases tối thiểu và điều không được xảy ra |
| --- | --- |
| URL/public/dup | URL hợp lệ/không hợp lệ/private/nonexistent, rename/transfer, same repo alias, existing application có repo liên quan; không AI trước giải quyết trùng |
| Source/evidence | No license/NOASSERTION/custom; README missing/over cap; language không thành OS; stars không thành rating; observedAt khác verifiedAt |
| Network/cache | GitHub timeout/403/429/301/404, ETag304 với/không cache, media/API version cache key, response too large; retry có giới hạn |
| AI | Disabled/not needed không gọi; một response đủ fields; invalid/truncated/refusal/prompt injection/unknown evidence IDs; missing source không bịa claim |
| Quota/cost | Gemini timeout/429, daily caps/reset windows, partial/unknown usage, reservation concurrency, cache hit/force-analyze, không hidden SDK retry hoặc paid fallback |
| Review/publish | Admin edit sau AI/approval, source refresh và baseCatalog conflict, approved digest mismatch, late result, rejected/draft không seed, no key trong HTML/log/fixtures/Git |
| End-to-end | Local import→review→JSON diff→CI staging được phép→Preview Home/Explore/Search/Detail, no-JS/keyboard/responsive; production/main no-op và DB staging không bị trộn |

Unit/mock PASS chỉ chứng minh contract. Trước bàn giao M2/M4 phải có public GitHub/Gemini live spike được cấp quyền (không ghi secrets); M3/M5 cần runtime/browser/staging khi thực sự được giao. Hiện **SKIP toàn bộ P02 feature tests/live integrations/migrations** vì chưa code, không báo PASS từ tài liệu.

## 11. Ba quyết định cần duyệt một lần

| ID | Đề xuất mặc định | Lựa chọn cần chốt |
| --- | --- | --- |
| Q-09 | **CLI-first, Git/JSON là nguồn biên tập, D1 read projection**, nháp local bền vững; không admin web ở M1–4 | Chọn hướng này hoặc D1/admin web (cần thiết kế chuyển writer/auth/seed riêng trước code) |
| Q-10 | **AI manual opt-in**, disabled mặc định; M4 tùy chọn sau M1–3, cap/free-only như mục8 | Duyệt trigger/caps này, hoặc muốn tự xếp hàng khi rules thiếu; live key/billing/model vẫn cần gate riêng |
| Q-11 | **“Khác” giới hạn freemium/trial có nguồn chính thức và use case rõ**, không catch-all | Đồng ý phạm vi này hoặc chỉ định tập nội dung cụ thể khác |

API-first, AI không tự publish, một request nhiều fields, three discovery areas và không gọi AI trên lượt xem/tìm kiếm là định hướng do chủ dự án nêu rõ, không hỏi lại. Duyệt thiết kế không tự đánh dấu P01 DONE hoặc cấp lệnh bắt đầu P02.

## 12. Validation lượt thiết kế và file bàn giao

**PASS:** đọc source/config/schema/importer/CI và đối chiếu các gaps; HTTP smoke Preview4/4; remote refs đọc lại; kiểm tài liệu chính thức GitHub/Gemini bằng Context7 + official web (schema/API docs có thể thay đổi, không copy sample syntax/model thành code đã ổn định). Không dùng key thật, không generateContent, không migration/cloud mutation/push/deploy.

**PASS — kiểm tra diff/tài liệu:**9 Markdown files,89 local links/4 heading anchors tồn tại; JSON đề xuất parse được. Source ứng dụng/config/dependencies/importer và bốn HTML/JSON P01 không có diff so với301fd2a;4 kiểm tra ignore cho receipts/screenshot/helper/delivery sidecar PASS. `git diff --check` PASS cho các thay đổi tracked hiện tại. [Receipt local](../qa/architecture-maps/p02-design/docs-check.json); link QA không có sẵn trong clone mới.

**PASS — tài liệu HTML local:** Archify native `finalize workflow --quality showcase` đạt validate/deliver/strict check/browser-check; receipt [finalize summary](../qa/architecture-maps/p02-design/second/05-p02-proposed.finalize-summary.json). Chrome156.0.8078.80/file:// kiểm thêm8 checks: render/containment1440/768/390, keyboard focus/giải thích/Escape, zoom/pan/reset/theme, xuất PNG/SVG, không tự gọi HTTP hoặc console/page errors. [Browser receipt](../qa/architecture-maps/p02-design/browser/results.json),4 screenshot/2 exports local. Đã xem ảnh desktop/mobile: desktop đọc được, mobile overview chữ nhỏ nên dùng zoom/focus/node index để đọc; toolbar trong canvas có thể cần cuộn. Đây không phải thiết kế UI website mới hay chứng nhận mobile/AT.

**FAIL harness đã sửa:** QA đầu chờ phần tử chứng nhận source code vốn không có ở diagram đề xuất. Sửa assertion để kiểm không giả `verified=true` và JSON không có repository proof; chạy lại8/8 PASS. Không sửa HTML để làm test qua. Native finalize trước đó phát hiện mainPath đi ngược cột; sửa vị trí lane/cột, chạy lại toàn bộ gates PASS. Cảnh báo còn lại: viewer có68/486 nhãn Việt,418 fallback Anh (đa phần tính năng nâng cao).

**SKIP:** P02 feature unit/integration/browser/live API tests; chưa có implementation. Không chạy lại app typecheck/build vì app/deps/config không đổi; không đọc lại cloud bindings/deployment identity. Physical mobile/screen reader/WebM/clipboard export chưa kiểm. P01 nghiệm thu và Q09–11 còn mở. Raw QA/screenshots/receipts đều ignored, không có trong clone mới; HTML/JSON và báo cáo này là artifact bàn giao.

| File thay đổi trong lượt thiết kế | Nội dung |
| --- | --- |
| `docs/PHASE02_DESIGN.md` | Báo cáo audit/đề xuất/schema/quota/test/milestones và ba quyết định |
| Diagram P02 riêng04/11 | Sau chuẩn hóa05/11 đã hợp nhất vào `03-data`; proposal được giữ ở tài liệu này, không sinh thêm sơ đồ cấp cao theo phase |
| `PROJECT.md`, `ROADMAP.md`, `TASKS.md`, `README.md` | Định hướng và tracker/link, không ghi implementation đã hoàn thành |
| `docs/DECISIONS.md`, `docs/ARCHITECTURE.md`, `docs/AI_PROVIDERS.md` | AGREED/PROPOSED, nguồn biên tập, API/code/AI và gates |
| `docs/architecture-maps/README.md` | Link05, giới hạn và lệnh tái tạo riêng; helper01–04 không đổi |

Không sửa nguồn ứng dụng, JSON catalog, migration, CI/CD hoặc bốn HTML/JSON bản đồ P01. Archify checkpoint `301fd2a` nằm trên local develop ahead1, không gộp với thay đổi thiết kế mới; đề xuất P02 giữ chưa commit để review. Không push/deploy. Dừng **thiết kế P02 READY FOR REVIEW**, implementation NOT STARTED; không bắt đầu milestone hoặc tự ghi P01 DONE.
