# P01 — Bằng chứng kết nối Cloudflare

Ngày 03/11/2026. Trạng thái hiện tại: **xác thực và tài nguyên đúng account PASS; Workers Builds/Preview chưa hoàn tất**. Tài liệu này thay các bảng account sai trong ghi nhận chuẩn bị trước đó; lịch sử cleanup được giữ riêng bên dưới.

## Đích hiện tại đã xác minh

| Mục | Giá trị |
| --- | --- |
| GitHub | [ducbang02/FreeResources](https://github.com/ducbang02/FreeResources), public |
| Tác giả và tài khoản push | `sunny251010`, đã được chủ dự án duyệt |
| Account Cloudflare | `4ca521c6746d874c049fd829121ab59e` |
| Nhãn account | Nguyenducbang.uit@gmail.com's Account |
| Xác thực | OAuth dự án thành công; whoami khớp chính xác account ID |
| Worker staging | `digital-resource-hub-staging`, ID `0540bcf9fa6448d6843935471fe0265c` |
| Worker runtime | 1 version khởi tạo chưa deploy, không bindings; workers.dev tắt; chưa upload ứng dụng |
| D1 staging cùng tên | `e28f4099-92cf-40bc-ab8c-c47138b4469d` |
| D1 đã kiểm | Migrate/seed/query PASS: 13 tài nguyên, 17 nguồn, FK 0, FTS LocalSend |
| Target/bindings | approved:true sau đọc lại; DB top-level và Preview cùng UUID trên |

[Bằng chứng tạo/đọc lại](../qa/p01/cloud-resources.json), [kết quả D1 cloud](../qa/p01/cloud-d1.json). Account ID/Worker ID/D1 ID không phải credential. Không có Preview URL hoặc deployment ứng dụng đã nghiệm thu.

Phiên dự án dùng `XDG_CONFIG_HOME=.cache/free-resources-auth` và `XDG_CACHE_HOME=.cache/free-resources-auth-cache`, đặt theo từng lệnh bằng đường dẫn tuyệt đối trong workspace. Không đổi HOME hoặc credential global Ctcm. Cache đã ignore; không đọc/in/copy token, cookie hoặc file auth vào chat/source/log. Không cần đổi tài khoản GitHub cộng tác viên sang owner.

## Lịch sử chọn sai account và cleanup đã hoàn tất

Ban đầu đã nhầm email đăng nhập với account và tạo tài nguyên ở Ctcm `4873c68031c0fc5e0284943a9119dac2`. Kết quả này đã rút khỏi nghiệm thu P01; target/proof sai bị thu hồi, artifact staging cũ bị xóa. Commit `ace99a1` đã push để khóa target sai, giữ nguyên lịch sử.

Người dùng sau đó yêu cầu xóa cả hai tài nguyên của dự án đã tạo nhầm:

| Tài nguyên đã xóa | ID lịch sử | Đọc lại |
| --- | --- | --- |
| Worker digital-resource-hub-staging | `000318f0fc78496aad07c79236818428` | GET 404 |
| D1 digital-resource-hub-staging | `fea09243-1d9b-4836-82ac-0dea72ef1668` | GET 404 |

[Proof cleanup](../qa/p01/ctcm-cleanup.json). Không xóa tài nguyên khác. Worker cũ chỉ có metadata, chưa có code deployment. ID cũ chỉ dùng đối chiếu lịch sử; target hiện tại dùng account/D1 mới.

## Blocker Workers Builds trên account đúng

Probe đã được chạy lại trên **account đúng**, kết quả **HTTP 403, Cloudflare error code 10000** được lưu trong [cloud-resources.json](../qa/p01/cloud-resources.json). Đây là bằng chứng mới độc lập, không kế thừa kết luận quyền từ account cũ. OAuth dùng được Workers/D1 không chứng minh đủ quyền cấu hình Builds.

Theo [Builds API reference](https://developers.cloudflare.com/workers/ci-cd/builds/api-reference/), cấu hình Builds qua API cần user-scoped token và quyền Builds tương ứng. Chủ dự án đã chọn **hỗ trợ Dashboard cho phiên này**, không tạo/gửi token vào chat. Không yêu cầu re-login OAuth lặp lại để giải quyết quyền Builds chưa được cấp. HTTP 403 không chứng minh GitHub App chưa cài.

Browser Use và Computer Use đều không khởi tạo được do sandbox helper. Không đọc browser profile/cookie để vượt giới hạn. Người dùng hỗ trợ account đúng → Workers & Pages → `digital-resource-hub-staging` → Settings → Builds → Connect. Nếu cần cài GitHub App, chỉ cấp repo `ducbang02/FreeResources`; không mở toàn bộ repo.

## Kết nối và nghiệm thu còn lại

### Chẩn đoán nút Connect bị khóa

Chủ dự án xác nhận Connect bị mờ và con trỏ cấm thao tác. Đọc API trước sửa: Worker chưa có version, endpoint settings trả HTTP 404/code 10222. Đã tạo một module khởi tạo trả 503, không bindings, bằng Create Worker Version với `deploy=false`. Đọc lại PASS: 1 version, settings HTTP 200, `deployed_on:null`, workers.dev vẫn tắt. Sau refresh, chủ dự án xác nhận Connect dùng được. [Bằng chứng](../qa/p01/cloud-bootstrap.json). Ứng dụng vẫn triển khai qua GitHub; không kích hoạt deployment hoặc sửa D1 trong bước khởi tạo này.

### Kết nối Git đã quan sát trên Dashboard

Ảnh chủ dự án cung cấp xác nhận repo `ducbang02/FreeResources`, production branch `main`, build `npm run ci:build`, deploy `npm run ci:production`, Version command `npm run ci:preview:deploy`, root `/`, non-production builds bật. Token riêng `free-resources-staging-build` có D1 Edit và account đúng; không sửa token dự án khác. [Ghi nhận settings](../qa/p01/builds-dashboard.json). Dashboard đang bật các nhánh non-production; guard trong repo chỉ cho develop vượt qua. Chưa chứng minh build/Preview thành công; cần push develop rồi đọc log thật. Banner đề nghị đổi tên trong root wrangler là cảnh báo cần theo dõi: config local được giữ riêng, build staging chủ động chọn `deploy/wrangler.staging.json`.

Build đầu `fdbb35ab` từ develop `2be13d0` đã clone/cài dependencies đúng Node/npm, nhưng FAIL ở kiểm origin trước migration/upload. [Record](../qa/p01/build-origin-failure.json). Guard được sửa để so danh tính GitHub host/repository bằng URL parser thay vì so toàn chuỗi chứa credentials; không cho fork/host khác, vẫn kiểm SHA từ develop chính thức. 22 tests local PASS; cloud retest chưa có kết quả. Không in origin hoặc credentials vào log. Chưa cần đổi build settings để xử lý lỗi này.

Dùng [runbook Preview](PHASE01_PREVIEW_RUNBOOK.md), đọc lại cấu hình trước build đầu:

| Setting | Giá trị |
| --- | --- |
| Repository | ducbang02/FreeResources |
| Production branch | main |
| Build command | `npm run ci:build` |
| Deploy command | `npm run ci:production` — no-op |
| Preview builds | Bật, include chỉ develop |
| Preview command | `npm run ci:preview:deploy` |
| Runtime | Node 24.18.0 từ .node-version; npm 12.2.0 từ packageManager |

Common build bỏ qua main, chỉ checks/build staging trên develop; các nhánh khác bị từ chối. Guard kiểm cứng account/repo, CI branch/commit/origin/clean tree, artifact và D1 identity trước migration/seed/Preview. Binding Preview phải cùng D1 staging đã duyệt. Chỉ một Workers Builds pipeline, không Actions song song.

Sau connection cần build thật từ GitHub, URL thật, cloud browser/runtime/D1 PASS và push develop tiếp theo chứng minh tự cập nhật. Chưa READY FOR REVIEW từ việc tạo Worker hoặc D1. Không production, DNS, paid service hoặc P02.

## Nguồn đã dùng trong nghiên cứu ban đầu

- [Create Worker](https://developers.cloudflare.com/api/resources/workers/subresources/beta/subresources/workers/methods/create/) và [Workers API changelog](https://developers.cloudflare.com/changelog/post/2025-09-03-new-workers-api/): parent Worker có thể tạo metadata mà chưa upload version/deployment.
- [GitHub integration](https://developers.cloudflare.com/workers/ci-cd/builds/git-integration/github-integration/): quyền GitHub App trên đúng repository.
- [Preview configuration](https://developers.cloudflare.com/workers/previews/configuration/): runtime bindings cần khai báo riêng.

Các nguồn này giải thích lựa chọn triển khai; kết quả cloud hiện tại dựa trên proof JSON nêu trên. [Báo cáo P01](PHASE01_REPORT.md) ghi đầy đủ PASS/FAIL/SKIP và Git checkpoint.
