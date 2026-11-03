# P01 — Cloudflare connection evidence

Ngày 03/11/2026. Lane kết nối dùng tài liệu Cloudflare chính thức, Context7 và project-local Wrangler4.156.2. Không thêm CLI/package, không đọc browser profile/cookie và không lưu credential vào source/log.

## Đích đã được xác nhận

Chủ dự án đã chỉ định `https://github.com/ducbang02/FreeResources.git` và phiên Cloudflare đăng nhập bằng `nguyenducbang.uit@gmail.com`. Root xác nhận Git dùng tài khoản cộng tác viên `sunny251010` có quyền trên repo; không cần đổi sang owner hoặc tạo account Cloudflare khác.

| Resource | Giá trị / phạm vi |
| --- | --- |
| Account ID | `4873c68031c0fc5e0284943a9119dac2` |
| D1 staging do root tạo | `digital-resource-hub-staging` · `fea09243-1d9b-4836-82ac-0dea72ef1668` |
| Worker staging | `digital-resource-hub-staging` |
| Worker immutable ID | `000318f0fc78496aad07c79236818428` |
| Worker tags | `digital-resource-hub`, `staging` |
| Worker workers.dev enabled | `false` |
| Preview URLs enabled setting | `true` |
| Worker versions tại thời điểm kiểm | **0** |

Không tạo Worker production, domain/DNS hoặc liên kết resource từ dự án khác. D1 staging chưa được chứng minh có dữ liệu cloud từ lane này; root phải chạy migration vào đúng ID và kiểm runtime riêng.

## Worker được tạo mà không deploy ứng dụng

API mới [Create Worker](https://developers.cloudflare.com/api/resources/workers/subresources/beta/subresources/workers/methods/create/) cho phép tạo parent resource bằng JSON metadata. [Changelog chính thức](https://developers.cloudflare.com/changelog/post/2025-09-03-new-workers-api/) phân biệt Worker, Version và Deployment; tạo parent không cần upload code.

Đã kiểm exact-name `GET /accounts/{account_id}/workers/workers/digital-resource-hub-staging` trả404, sau đó thực hiện **một** POST vào `/accounts/{account_id}/workers/workers`, chỉ có name/tags/subdomain settings đã được root duyệt. POST200; đọc lại Worker200 và danh sách versions200, count0. Không gọi version upload hoặc deployment endpoint.

Response có trường URL `https://digital-resource-hub-staging.ctcm251010.workers.dev`, nhưng `enabled:false` và chưa có version. Đây là địa chỉ dự kiến do account suffix cung cấp, **không phải website đang chạy hoặc Preview URL đã nghiệm thu**. Không dùng URL này làm bằng chứng deploy thành công.

## Blocker chính xác của Workers Builds

Wrangler có OAuth hợp lệ cho Workers Scripts/D1. Kiểm bằng API chỉ đọc trong account đã xác nhận:

| Endpoint | Kết quả |
| --- | --- |
| `GET /workers/scripts` |200, dùng để xác minh parent target; không sửa Worker khác |
| `GET /builds/workers` |403, Cloudflare error10000 `Authentication error` |
| `GET /builds/tokens` |403, error10000 |
| `GET /builds/account/limits` |403, error10000 |

Token được lấy bằng `wrangler auth token --json` qua subprocess, giữ **chỉ trong bộ nhớ** cho Authorization header. Không in, lưu file, gửi vào chat hoặc commit token. Chỉ status/error code và metadata cần thiết được báo cáo.

Theo [Builds API reference](https://developers.cloudflare.com/workers/ci-cd/builds/api-reference/), cần **user-scoped API token** với **Workers Builds Configuration — Edit**; Workers Scripts — Read dùng để đọc script tag. Account-scoped token không được hỗ trợ cho Builds API. Token gọi API khác với build token dùng khi CI triển khai; CI cần build token UUID riêng. Một phiên Wrangler có quyền deploy Worker không tự chứng minh có quyền cấu hình Builds.

Đã kiểm `wrangler login --scopes-list` và validator của bản4.156.2: Builds không nằm trong `DefaultScopeKeys` được flow OAuth Wrangler chấp nhận. Các chuỗi `workers_builds:read/write` trong bundle thuộc `CF_CLIENT_REGISTERED_SCOPES` của **cf client khác**, không phải bằng chứng có thể thêm bằng `wrangler login --scopes`. Không reauthenticate mù hoặc sửa validator để vượt scope.

403 khiến lane chưa thể biết Cloudflare GitHub App đã được cài cho owner `ducbang02` và repo này hay chưa. **Không kết luận App chưa cài.** Theo [GitHub integration](https://developers.cloudflare.com/workers/ci-cd/builds/git-integration/github-integration/), owner/người có quyền cần cấp GitHub App quyền trên đúng repository trước khi Cloudflare đọc source. Nếu cần thao tác trên dashboard, browser session phải có mặt; CUA của root hiện lỗi sandbox helper, không được lấy cookie từ profile để né giới hạn.

## Kế hoạch kết nối cụ thể sau khi có quyền Builds

1. Người dùng tạo user API token tại [Cloudflare API tokens](https://dash.cloudflare.com/profile/api-tokens), cấp Builds Configuration Edit và Scripts Read cho account được xác nhận; giữ trong secret manager hoặc môi trường local được bảo vệ, **không dán giá trị vào chat/source/command arguments**. Token triển khai CI cũng cần đúng quyền Worker staging và D1 staging nếu pipeline áp migration. Không dùng account token để thay user token của Builds API.
2. Nếu GitHub App chưa có quyền, mở account → Workers & Pages → đúng Worker `digital-resource-hub-staging` → Settings → Builds → Connect. Cấp GitHub App quyền **chỉ repo** `ducbang02/FreeResources`; không mở quyền toàn bộ repository theo mặc định.
3. Root đọc lại trạng thái connection/token bằng API. Chỉ chọn **một** Workers Builds pipeline, không bật thêm GitHub Actions song song.
4. Cấu hình production branch `main` với deploy command `node scripts/no-production.mjs` chỉ báo dừng, không remote migration/upload/deploy. Nhánh `develop` chạy Preview wrapper có guard target/branch/commit, D1 staging riêng và noindex.
5. Đọc lại cấu hình trước push/trigger; xác minh preview DB là ID staging ở bảng trên. Chỉ sau local tests PASS mới chạy staging migration và Preview từ GitHub. Cuối cùng kiểm URL thật, search/Detail/D1/runtime và kết quả build.

API tổng hợp chính thức hiện dùng `POST /accounts/{account_id}/builds/workers` với `script_tag`, `git_repository`, `production_settings`, `previews_enabled`, `previews_base_config`. Đọc lại bằng `GET /builds/workers/{worker_tag}`; sửa bằng PATCH cùng path. Không thay endpoint suy từ phiên bản documentation cũ. Cấu hình runtime Preview khác build environment variables; xem [Preview configuration](https://developers.cloudflare.com/workers/previews/configuration/).

## PASS / FAIL / SKIP

- **PASS:** xác minh danh tính/account, endpoint/resource đích; tạo parent Worker metadata-only và đọc lại;0 versions, không deployment.
- **FAIL quyền hiện tại:** Workers Builds API403 do scope OAuth hiện có không đủ. Đây là lỗi authorization của API, không phải automatic approval review rejection.
- **SKIP:** GitHub App inspection/connection, Builds configuration, Preview build/deployment/cloud-browser QA vì chưa có quyền Builds trong lane này. Không báo READY FOR REVIEW chỉ từ việc tạo Worker hoặc D1.

Root tiếp tục kiểm local và cập nhật tracker/bàn giao. Không triển khai production hoặc tự chuyển P02.
