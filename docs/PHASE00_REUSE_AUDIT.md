# Phase 00 — Reuse, dữ liệu và trust

> Rà ngày **03/11/2026**. Toàn bộ lựa chọn kỹ thuật dưới đây là **PROPOSED**. Đây là nghiên cứu tài liệu, không phải benchmark, runtime spike hay xác nhận phần mềm an toàn. Không dependency nào đã được cài trong lane này.

## 1. Reuse Audit và quyết định đề xuất

Repo ban đầu chỉ có planning documents, không source/package manifest/lockfile, test hay code có thể mở rộng. Chọn HTML/CSS/JS native cho prototype tĩnh; P01 nếu được duyệt dùng Astro core và CSS nhỏ theo design system. Chưa thêm backend auth, UI framework, search service, AI SDK hay crawler. Chi phí phần mềm OSS không đồng nghĩa hạ tầng/API miễn phí.

Đã dùng skill Context7 và MCP Context7: resolve trước rồi query `/better-auth/better-auth` (High, 5.759 snippets), `/pagefind/pagefind` (High, 1.118), `/websites/ai-sdk_dev` (High, 14.653). Các ID khớp chính chủ hoặc docs chính thức, phù hợp hơn wrapper bên thứ ba. Đã kiểm repo/license/releases và docs nguồn bên dưới; chưa đo dependency graph hoặc bundle vì chưa chọn/pin version. Không khẳng định đã audit toàn bộ CVE hay supply chain.

| Mảng / lựa chọn | Nguồn, license và dấu hiệu bảo trì | Tích hợp / footprint / chi phí | Đề xuất và lý do |
| --- | --- | --- | --- |
| Astro core + starter tối thiểu | [Repo](https://github.com/withastro/astro), [MIT và notices đi kèm](https://github.com/withastro/astro/blob/main/LICENSE); repo có changesets, releases và security policy | Build dependency; có thể xuất HTML ít JS; Workers adapter cần spike version cụ thể. Không phí license, hosting riêng | **Chọn có điều kiện P01**; ít sửa cấu trúc ngoài yêu cầu catalog |
| Starlight template | [Repo MIT](https://github.com/withastro/starlight), official Astro documentation framework; có releases và contributor workflow | Đã có navigation/search/docs layout nhưng phải thay đáng kể để làm resource directory; thêm framework cấu hình | **Không chọn cho catalog**; hợp documentation hơn home/search/detail editorial |
| Native HTML/CSS và browser controls | Có sẵn trong browser, không kéo package hay template license vào prototype | 0 dependency runtime; tự kiểm focus, contrast, labels, reduced motion và responsive | **Chọn P00**. Sang P01 giữ CSS tokens và chỉ tạo component thật sự dùng lại; không thêm React/Tailwind chỉ vì thói quen |
| D1 FTS5 | [D1 SQL extensions](https://developers.cloudflare.com/d1/sql-api/sql-statements/) xác nhận FTS5; platform theo Cloudflare terms | Không thêm search server/package; query server cần indexes, pagination và quota monitoring | **Ưu tiên nếu catalog SSR/đổi thường xuyên**. Test dấu/không dấu, `đ`, từ ghép; FTS không mặc nhiên có Vietnamese relevance tốt. Xem runbook export virtual tables trong [tech validation](PHASE00_TECH_VALIDATION.md) |
| Pagefind | [Repo MIT](https://github.com/Pagefind/pagefind), [release](https://github.com/Pagefind/pagefind/releases) thấy v1.6.0 ngày 01/11; [indexing](https://pagefind.app/docs/running-pagefind/), [multilingual](https://pagefind.app/docs/multilingual/) | CLI build + WASM/JS/index tải trong browser; không server search và không phí dịch vụ. Thêm build step, index phải regenerate sau publish | **Phương án nếu toàn catalog prerender**. Không chọn để tìm các trang SSR chưa có HTML build; không dùng đồng thời FTS và Pagefind khi chưa cần. `lang=vi` cần test thực tế, không suy ra từ chữ “multilingual” |
| Better Auth | [Repo MIT](https://github.com/better-auth/better-auth), [Astro integration](https://www.better-auth.com/docs/integrations/astro), [releases](https://github.com/better-auth/better-auth/releases) thấy stable v1.7.15 ngày 01/11 và beta riêng | Library self-hosted cùng app/DB; thêm auth tables, cookie/session, OAuth credentials và DB adapter. Không license fee; session I/O tính quota D1; email nếu thêm có chi phí riêng | **Ứng viên P02**, chưa khóa. D1 driver trong source không hỗ trợ interactive transactions; phải thử đúng flow Google + session + logout + guards. Chỉ cài core/plugin thực sự cần |
| Auth.js | [Repo](https://github.com/nextauthjs/next-auth), [ISC](https://github.com/nextauthjs/next-auth/blob/main/LICENSE), [integrations](https://authjs.dev/getting-started/integrations) có hướng chuyển Better Auth | Framework integration khác Astro cần kiểm support; thêm adapter/session tương tự, không đơn giản chỉ đổi tên package | **Không chọn mặc định cho dự án mới này**; Better Auth có tài liệu Astro rõ hơn. Không tự viết OAuth/session thay thư viện |
| GitHub REST bằng `fetch` | [API limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api), [best practices](https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api); API hosted, không phải license tái phân phối nội dung | Không thêm SDK; vài endpoint repository/README/release đủ cho admin import. API token chỉ server khi phase cho phép | **Chọn P02** với cache và conditional requests; chưa cần Octokit/crawler framework. 60 requests/giờ unauthenticated; thông thường 5.000 authenticated, search và secondary limits riêng; đọc headers, không hardcode quota làm cam kết |
| AI SDK + Google provider | [Repo](https://github.com/vercel/ai), [Apache-2.0](https://github.com/vercel/ai/blob/main/LICENSE), [releases](https://github.com/vercel/ai/releases); [Google provider](https://ai-sdk.dev/providers/ai-sdk-providers/google), [structured data](https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data) | Core + provider + validator/JSON Schema; không cần Vercel host hay Vercel Gateway để gọi provider trực tiếp. API token/model vẫn có quota/giá; footprint byte chưa đo | **Ứng viên ưu tiên khi P04 cần provider thứ hai**, giảm việc tự chuẩn hóa SDK. Chỉ dùng trong adapter, domain không nhận vendor types |
| Google Gen AI SDK | [Repo Apache-2.0](https://github.com/googleapis/js-genai), official Google SDK với docs/release workflow | Một vendor SDK trong Gemini adapter; API cost riêng. Dễ dùng tính năng Google nhưng không thay interface đa provider | **Phương án Gemini đầu tiên** nếu SDK giảm xử lý lỗi thật; không cài cả Google SDK và AI SDK cùng chức năng. REST `fetch` hẹp cũng được sau spike; tránh xây generic SDK riêng |
| Ratings/moderation | Dùng ràng buộc SQL + policy trong source; không thêm “review platform” | Không dependency mới; auth, abuse controls và vận hành duyệt mới là chi phí thực | **Chọn logic nhỏ trực tiếp**; algorithm minh bạch, không chấm sao bằng AI |

Security gate Better Auth: [GHSA-965c-763c-88jm](https://github.com/better-auth/better-auth/security/advisories/GHSA-965c-763c-88jm) công bố 30/09/2026, ảnh hưởng `>=1.4.0-beta.18,<1.7.7` với tổ hợp Magic Link/OAuth cụ thể; vá ở 1.7.7. Đây là ví dụ phải đọc advisory theo cấu hình và pin phiên bản vá cùng adapters, **không** chứng nhận v1.7.15 không còn lỗ hổng khác. P01 không cần auth; P02 rà [advisories](https://github.com/better-auth/better-auth/security/advisories) lại và test authorization phía app.

## 2. Schema tối thiểu theo phase

Đề xuất logical schema, **chưa phải migration**. Dùng stable text IDs, UTC timestamp nhất quán, foreign keys và `CHECK`/enum tại server. Tên slug có thể đổi; canonical URL không đồng nghĩa URL được phép fetch.

| Phase | Bảng / trường chính | Constraint / mục đích |
| --- | --- | --- |
| P01 | `resources(id, slug, canonical_url, title, summary_vi, editorial_markdown, status, pricing_model, license_spdx, license_status, license_url, difficulty, verified_at, published_at, created_at, updated_at)` | `UNIQUE(slug)`, `UNIQUE(canonical_url)`; license nullable/unknown hợp lệ. Publish phải có bằng chứng nguồn/quyền và review; index `(status, published_at, id)` |
| P01 | `terms(id, facet, slug, label_vi)`; `resource_terms(resource_id, term_id)` | `UNIQUE(facet,slug)` và PK cặp; facets cố định `type/topic/audience/platform/function`; quan hệ nhiều-nhiều, index chiều ngược `(term_id,resource_id)` |
| P01 | `sources(id, resource_id, url, provider, external_id, fetched_at, content_hash, evidence_excerpt)` | Unique `(provider,external_id)` khi non-null; lưu trích đoạn cần thiết, tránh README lớn. Có thể nhiều nguồn cho một mục |
| P01 | `editorial_events(id, resource_id, actor_ref, action, reason, created_at)` | Import local ghi nguồn thao tác; không cần tạo users/auth tables chỉ để có actor ID. Published revision không ghi đè âm thầm |
| P02 | Auth tables do library sở hữu; `resource_revisions` khi có editor/AI nhiều bản; `ai_jobs` theo AI doc khi AI được duyệt | Không tự thiết kế lại bảng session. App role kiểm server; immutable publish event gắn editor, revision |
| P03 | `ratings(resource_id,user_id,score,review_text,status,created_at,updated_at)` | PK/UNIQUE cặp user/resource; score nguyên 1–5; 1 row/account/resource, update thay vì chèn thêm; review text cùng row đủ MVP |
| P05 | `submissions(id,user_id,canonical_url,summary,status,moderator_id,reason,created_at,updated_at)`; `reports(id,resource_id,reporter_id,kind,details,status,resolution,created_at)` | Không cho user sửa moderation status; dedupe cả submissions lẫn catalog. Báo cáo có dữ liệu cá nhân không đưa vào public cache |

Không tạo tất cả bảng từ P01. Collections có thứ tự dùng `collection_items(collection_id,resource_id,position)` khi thực sự triển khai; không nhét danh sách IDs vào text. Search index là dữ liệu dẫn xuất có thể rebuild, không phải nguồn dữ liệu chính. Chi tiết scale/migration ở [ARCHITECTURE](ARCHITECTURE.md).

## 3. Taxonomy v1 nhiều nhãn

Tách chiều độc lập: `type` (application, repository, online_tool, learning_resource, game, operating_system_resource, collection), `topic` (học tập, văn phòng, sáng tạo, lập trình, bảo mật, giải trí), `audience` (học sinh/sinh viên, giáo viên, văn phòng, công nghệ, phổ thông), `platform` (web, Windows, macOS, Linux, Android, iOS), `function` (PDF, chuyển file, ghi màn hình, remote desktop…). Một resource có nhiều type: PowerToys vừa application vừa repository; PhET vừa learning_resource vừa online_tool. Category chính là góc hiển thị, không loại trừ nhãn khác.

`pricing_model` tách khỏi license: free/freemium/trial/education_free/paid/unknown; license SPDX chỉ gán khi có nguồn đúng version. `open_source` derive từ license đã kiểm + source, không từ tag do AI tự gắn. Web miễn phí không suy ra mã nguồn mở. Ghi source license của code riêng với license nội dung, logo và assets. Dùng IDs ổn định, label tiếng Việt có thể đổi; alias tìm kiếm cho từ thông dụng, không tạo term mới từ mọi README.

### Bộ 30 candidate để thử taxonomy

Các hàng **không phải catalog đã duyệt**; mô tả/phân loại là fixture đề xuất, cần biên tập lại và kiểm giấy phép/giá/nền tảng/version trước publish. Tất cả đều `license_status=needs_review`; không sao chép ảnh/logo hay phân phối installer. Cột “Đọc” chỉ là kết quả web tool ngày 03/11, **không phải kiểm thử app hoặc HTTP uptime monitoring**. `OK` = trích được văn bản; `EMPTY` = không trích được; `ERR` = lỗi truy cập.

| Candidate / URL nguồn | Type đề xuất | Topic / function | Audience; platform cần kiểm | Đọc |
| --- | --- | --- | --- | --- |
| [LocalSend](https://localsend.org/) | application | Văn phòng; chuyển file | Phổ thông; desktop/mobile | OK |
| [RustDesk](https://rustdesk.com/) | application | Văn phòng; remote desktop | Văn phòng/công nghệ; desktop | OK |
| [LibreOffice](https://www.libreoffice.org/) | application | Văn phòng; tài liệu/bảng tính | Giáo viên/văn phòng; desktop | OK |
| [Firefox](https://www.mozilla.org/firefox/) | application | Web; trình duyệt | Phổ thông; desktop/mobile | OK, redirect Firefox.com |
| [VLC](https://www.videolan.org/vlc/) | application | Giải trí; phát media | Phổ thông; desktop/mobile | ERR 418 |
| [OBS Studio](https://obsproject.com/) | application | Sáng tạo; ghi màn hình | Giáo viên/creator; desktop | OK |
| [GIMP](https://www.gimp.org/) | application | Sáng tạo; sửa ảnh | Học sinh/creator; desktop | OK |
| [Krita](https://krita.org/) | application | Sáng tạo; vẽ | Creator; desktop | EMPTY |
| [Inkscape](https://inkscape.org/) | application | Sáng tạo; vector | Creator; desktop | ERR 403 |
| [Blender](https://www.blender.org/) | application | Sáng tạo; 3D | Creator/công nghệ; desktop | ERR 402 |
| [Audacity](https://www.audacityteam.org/) | application | Sáng tạo; âm thanh | Giáo viên/creator; desktop | OK |
| [7-Zip](https://www.7-zip.org/) | application | Văn phòng; nén file | Phổ thông; Windows | OK |
| [KeePassXC](https://keepassxc.org/) | application | Bảo mật; mật khẩu | Văn phòng/công nghệ; desktop | OK |
| [Syncthing](https://syncthing.net/) | application | Văn phòng; đồng bộ file | Công nghệ; desktop | OK |
| [PowerToys](https://github.com/microsoft/PowerToys) | application + repository + operating_system_resource | Văn phòng; tiện ích OS | Văn phòng/công nghệ; Windows | OK |
| [freeCodeCamp](https://www.freecodecamp.org/) | learning_resource | Lập trình; bài tập | Sinh viên; web | EMPTY |
| [Khan Academy](https://www.khanacademy.org/) | learning_resource | Học tập; toán/khoa học | Học sinh/giáo viên; web | EMPTY |
| [MIT OpenCourseWare](https://ocw.mit.edu/) | learning_resource | Học tập; khóa học | Sinh viên; web | OK |
| [The Odin Project](https://www.theodinproject.com/) | learning_resource | Lập trình; lộ trình | Sinh viên; web | OK |
| [Exercism](https://exercism.org/) | learning_resource + online_tool | Lập trình; bài tập | Sinh viên; web | OK |
| [MDN](https://developer.mozilla.org/) | learning_resource | Lập trình; tài liệu web | Công nghệ; web | OK |
| [GeoGebra](https://www.geogebra.org/) | online_tool + learning_resource | Học tập; toán | Học sinh/giáo viên; web | OK |
| [PhET](https://phet.colorado.edu/) | online_tool + learning_resource | Học tập; mô phỏng | Học sinh/giáo viên; web | OK, ít nội dung |
| [LearningApps](https://learningapps.org/) | online_tool + learning_resource | Học tập; bài tập tương tác | Giáo viên; web | OK |
| [draw.io](https://www.diagrams.net/) | online_tool + application | Văn phòng; sơ đồ | Văn phòng/công nghệ; web/desktop | OK, redirect drawio.com |
| [Photopea](https://www.photopea.com/) | online_tool | Sáng tạo; sửa ảnh | Sinh viên/văn phòng; web | OK |
| [Desmos](https://www.desmos.com/) | online_tool + learning_resource | Học tập; đồ thị | Học sinh/giáo viên; web | EMPTY |
| [OpenStreetMap](https://www.openstreetmap.org/) | online_tool | Bản đồ; dữ liệu địa lý | Phổ thông/công nghệ; web | OK |
| [SuperTuxKart](https://supertuxkart.net/) | game | Giải trí; đua xe | Phổ thông; desktop | OK |
| [OpenTTD](https://www.openttd.org/) | game | Giải trí; mô phỏng | Phổ thông; desktop | OK |

Kết quả mẫu cho thấy: điều hướng chỉ theo “repo/app” gây trùng; “miễn phí” và “open source” phải là hai trục; educational resource có thể đồng thời là công cụ. Chưa có collection nguồn ngoài: collection là nội dung biên tập của hub, chỉ tạo sau khi có ít nhất vài mục đủ chất lượng. Mẫu chưa cân bằng cho tài nguyên hệ điều hành/tiếng Việt và chưa được người dùng mục tiêu đánh giá; P01 cần bổ sung trước khi chốt taxonomy v1.

## 4. Review/ranking và moderation đề xuất

- Chỉ tính rating `published`, tài khoản chưa bị ban; unique user/resource ở DB. Edit không tăng số phiếu, xóa/ban phải recompute aggregate. Star mean hiển thị cùng số phiếu, thời gian cập nhật và giải thích xếp hạng.
- Dùng Bayesian average cho 1–5 sao; không dùng Wilson trực tiếp cho sao nếu chưa đổi về bài toán nhị phân. Với ví dụ kiểm tra lý thuyết `C=3.5,m=10`, mục 5 sao/1 phiếu có score 3.636; 4.8 sao/300 phiếu có 4.758. Đây chỉ là tính minh họa, chưa là unit test hay tham số đã chốt. `C,m` và anti-abuse phải công khai, không cộng “AI score”.
- “Mới” theo published time; “Biên tập chọn” theo quyết định có editor/reason; “Đánh giá cao” theo weighted ratings. Chưa gọi click nhiều là “tốt nhất”. Rate limit/account-age review, phát hiện bursts và xung đột lợi ích; không hứa chống Sybil bằng IP đơn thuần. Không tự động loại mọi đánh giá tiêu cực.
- Draft -> pending_review -> published cần moderator; rejected/archived có reason và audit. Reviewer kiểm nguồn chính thức, license/giá, mô tả, platform, URL và quyền asset. AI không có quyền publish. Nội dung bị report nghiêm trọng có thể unlist tạm có ghi lý do; người gửi có quyền bổ sung/kháng nghị, thời hạn phản hồi phải do chủ dự án chốt.
- Submissions chỉ URL + metadata; file uploads chưa mở. Report loại broken_link/inaccurate/abuse/rights/security; lưu trạng thái received/triaged/resolved/dismissed, không hứa SLA chưa có người vận hành. Chỉ nội dung approved đi vào search/sitemap; noindex drafts/review queue.

## 5. Boundary import URL và AI

Ưu tiên allowlist API GitHub và một nhóm domain nguồn tin cậy cho P02. HTTPS, cấm credentials trong URL và IP literal/private/loopback/link-local/metadata ranges, hạn chế port. Validate lại mọi redirect và địa chỉ đích; DNS rebinding cần giải pháp egress/resolution thực tế, regex URL không đủ. Nếu Workers không kiểm được arbitrary destination an toàn thì giữ allowlist, không mở “fetch mọi URL”. Giới hạn redirect/bytes/timeout/content type; không clone/install/run repo. Render Markdown bằng sanitizer phù hợp hoặc không nhận HTML; `textContent` cho metadata; không tin remote favicon/SVG.

Discovery dùng API/rules, không cần LLM. Gemini-first qua `AIProvider` ở [AI_PROVIDERS](AI_PROVIDERS.md); AI SDK hoặc Google SDK chỉ nằm trong adapter. Output validate schema, enum taxonomy, lengths, source citations và claims; thiếu evidence -> unknown/needs_review. Cache có source hash + task/prompt/schema/model, timeout/backoff hữu hạn, manual fallback và budget cap. Không fallback sang paid provider tự động. Không gửi user PII/secrets/private source. Không coi structured JSON là chứng nhận dữ liệu đúng.

## 6. Kết quả xác minh của lane

| Trạng thái | Bằng chứng / giới hạn |
| --- | --- |
| PASS — nghiên cứu | Đọc planning docs và skill Context7; resolve/query 3 thư viện; đọc official repos/license/releases, D1 FTS5, GitHub quota; có 30 URLs candidate và trạng thái đọc nguồn |
| PASS — kiểm tra tài liệu local | PowerShell đếm đúng 30 candidate rows; UTF-8 tiếng Việt và `outputSchema` tồn tại; tính lại ví dụ ranking ra 3.636 và 4.758. Đây là kiểm tra tài liệu/số học, không phải test implementation |
| PASS — phân biệt scope | Đề xuất theo phase; không cài package, không migration, không auth/AI/network importer thật |
| FAIL — nguồn truy cập | Gemini structured-output URL chính thức redirect sang AI Studio bị web tool 500; candidate VLC/Inkscape/Blender lỗi truy cập. Không suy ra website hay API hỏng; cần rà lại bằng đường truy cập phù hợp khi implement |
| SKIP — runtime/security | Không chạy package/bundle audit, Google OAuth, API GitHub authenticated, Gemini, D1 search/export, moderation đa user hay ranking test. Cần spike có pin version ở phase được duyệt |
| OPEN | P01 prerender + Pagefind hay SSR + FTS5, auth provider P02, moderation SLA, ranking parameters, taxonomy mẫu tiếng Việt. Chưa thêm plugin/skill Ponytail; parent tổng hợp lựa chọn cài một lần |

Trước thêm dependency: pin stable version, đọc notices/advisories, kiểm lockfile và dependency tree/package size, chạy runtime compatibility/security regression. Không có số byte đo thực thì không ghi package “nhẹ” như bằng chứng.
