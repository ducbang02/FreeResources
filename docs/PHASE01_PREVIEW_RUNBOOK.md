# P01 — GitHub → Workers Builds → Preview
> Đích hiện tại đã xác minh: account 4ca521c6746d874c049fd829121ab59e, Worker/D1 staging mới đã tạo và đọc lại. Target approved:true sau kiểm ID; tài nguyên tạo nhầm đã xóa theo yêu cầu. Builds API trên account đúng trả 403/code 10000; chủ dự án hỗ trợ Dashboard. Chưa deploy ứng dụng hoặc có Preview URL.

Ngày 03/11/2026. Chủ dự án đã xác nhận repo `ducbang02/FreeResources` và account `4ca521c6746d874c049fd829121ab59e` (Nguyenducbang.uit@gmail.com's Account). OAuth dự án và whoami đã khớp account; Worker/D1 staging đã tạo, D1 cloud đã kiểm; **chưa xác minh pipeline GitHub → Workers Builds → Preview** tại thời điểm cập nhật này. Production chưa được phép. Root ghi trạng thái cloud mới nhất trong báo cáo P01.

## Một pipeline, một staging target

Chọn Workers Builds official, không thêm GitHub Actions deployment song song. Nghiên cứu và phiên bản tại [stack audit](PHASE01_STACK_AUDIT.md). Dùng Worker tên kết thúc `-staging`, D1 staging riêng và branch `develop`; không tạo Worker/database production, route/domain, DNS, KV, R2, Images, auth hoặc paid service.

Preview URL là public nếu không cấu hình access control. P01 chỉ có catalog công khai và ảnh/font có quyền phân phối; noindex không phải bảo mật. Không đưa dữ liệu riêng tư lên Preview. Nếu cần dữ liệu nhạy cảm, dừng và thiết kế access control trước.

Config `previews.d1_databases` phải khai báo rõ và trỏ đúng D1 staging; không suy isolation từ URL. P01 chia sẻ **một D1 staging cho Preview develop**, không phải một DB mới cho từng commit/branch. Version URL không tương đương Worker Preview.

## File và guard đã chuẩn bị

| File | Trách nhiệm |
| --- | --- |
| `deploy/staging-target.json.example` | Target chưa duyệt; `approved:false`, account/repository/database ID trống |
| `deploy/wrangler.staging.json.example` | Config riêng cho staging, top-level/Preview cùng D1, parent workers.dev disabled |
| `scripts/preview.mjs` | Plan/build/deploy với kiểm target, source và artifact, branch/repo/commit, D1 identity |
| `scripts/no-production.mjs` | Không mutation; chỉ báo production bị chặn và exit0 |
| `tests/deploy.test.mjs` | Tám nhóm guard kiểm sai target/branch/binding/account, fork, resource ngoài scope và no-op production |

Đã có `deploy/staging-target.json` và `deploy/wrangler.staging.json` sau xác nhận: account `4ca521c6746d874c049fd829121ab59e`, Worker đích `digital-resource-hub-staging`, D1 mới cùng tên với ID `e28f4099-92cf-40bc-ab8c-c47138b4469d`, repo `ducbang02/FreeResources`. Worker ID đã đọc lại là `0540bcf9fa6448d6843935471fe0265c`; có 1 version khởi tạo chưa deploy, không bindings, workers.dev tắt (xem [chẩn đoán Connect](PHASE01_CLOUD_CONNECTION.md#chẩn-đoán-nút-connect-bị-khóa)). Target `approved:true` sau xác minh; guard chặn cứng account/repo khác. Account ID và database ID không phải credential; không đặt token trong JSON. Bất kỳ field target lạ, placeholder, Worker/DB không phải staging, binding không khớp hoặc resource ngoài scope đều bị chặn. Template chưa duyệt vẫn giữ làm ví dụ tái sử dụng, không được coi là target thật.

`plan` chỉ in các thao tác dự kiến từ target hợp lệ; không gọi Cloudflare. `build` chạy validation, D1 migrations/seed **local**, typecheck, tests rồi Astro build với config staging được chỉ định. Khi các bước thành công, ghi proof trong `.cache/` gắn với commit, target, config/artifact, lockfile, seed và migrations. `deploy` chỉ dùng proof còn khớp và artifact đã kiểm; sau đó mới preflight remote rồi migrate/seed D1 staging và chạy `wrangler preview`.

Script không gọi `wrangler deploy`, `versions upload`, secret mutation hoặc tạo resource. `--ignore-base-config` ngăn dashboard Preview base config bổ sung binding chưa review. Generated artifact do adapter sinh, không chỉnh tay.

## Tham chiếu quy trình chuẩn bị target

1. Xác minh GitHub owner/repo và visibility thực tế, account Cloudflare đúng, quyền và Free plan. Chỉ cấp GitHub App quyền lên repo được xác nhận. Không cấp toàn bộ repo khi không cần. Không tự nâng gói.
2. Dùng repo/remote đã được chỉ định; không tự thay visibility. Push checkpoint có tên rõ, không force push. Có branch `main` cho trạng thái khóa release và `develop` cho staging; không để `develop` làm production branch của Workers Builds theo default tự động.
3. Tạo Worker staging và D1 staging mới trong account xác nhận, **không tạo production Worker**. Đọc lại ID/name/account sau tạo, ghi vào `deploy/staging-target.json` rồi đặt `approved:true` sau kiểm. Điền cùng các giá trị vào `deploy/wrangler.staging.json`; không dùng DB từ dự án khác hoặc production.
4. Astro adapter cần chọn `configPath:'deploy/wrangler.staging.json'` chỉ khi `P01_STAGING_BUILD=1`; local tiếp tục dùng `wrangler.jsonc`. Root tích hợp lựa chọn này trong `astro.config.mjs`. Session và Images passthrough giữ như hiện tại.
5. Các package scripts đã có trong `package.json`:

```json
{
  "ci:build": "node scripts/build-worker.mjs",
  "ci:preview:plan": "node scripts/preview.mjs plan",
  "ci:preview:build": "node scripts/preview.mjs build",
  "ci:preview:deploy": "node scripts/preview.mjs deploy",
  "ci:production": "node scripts/no-production.mjs"
}
```

`build` được gọi qua npm script để có `npm_execpath` đúng trên Windows/Linux. Không shell-build command từ JSON hoặc chạy lệnh tùy ý do metadata cung cấp.

## Thiết lập dashboard trước push kết nối đầu

Ở Worker **staging đã xác nhận**, kiểm Settings → Builds và Branch control. Không giữ nguyên default được suy từ default branch của GitHub.

| Setting | Giá trị cần đọc lại |
| --- | --- |
| Connected repository | Repo ducbang02/FreeResources, hiện public, cùng origin |
| Production branch | `main`, không phải `develop` |
| Build command | `npm run ci:build` |
| Deploy command | `npm run ci:production` — không upload/migrate/deploy |
| Enable Preview Builds | Bật; nhánh được sử dụng trong P01 là `develop` |
| Preview command | `npm run ci:preview:deploy` |
| Runtime | Node 24.18.0 từ `.node-version`, npm 12.2.0 từ `packageManager`; NODE_VERSION trong UI là tùy chọn |
| Token scope | Chỉ account/Worker staging và D1 staging theo khả năng giới hạn của Cloudflare; không credential trong Git |

Dashboard branch controls là một phần acceptance, không thay bằng unit test. Chụp/ghi setting thực trước khi kích hoạt lần đầu. Common build dispatcher bỏ qua main với exit0 và không build/upload; nhánh ngoài main/develop bị từ chối. Production deploy command vẫn là no-op. Chỉ `develop` mới có thể vượt guard.

Workers Builds cung cấp `WORKERS_CI=1`, `WORKERS_CI_BRANCH` và `WORKERS_CI_COMMIT_SHA`. Guard so HEAD với SHA này, kiểm origin đúng repo, yêu cầu tracked tree sạch và **đối chiếu HEAD với `refs/heads/develop` đọc từ đúng GitHub repo đã duyệt**. Nhờ vậy tên branch `develop` từ fork/PR không đủ để deploy. Cloud build cần đọc được ref repo được duyệt khi `git ls-remote` chạy; nếu quyền đọc không có, giữ trạng thái BLOCKED, không gỡ guard để cho qua.

Không chạy fork/PR không tin cậy với quyền cloud. Nếu dashboard không thể chứng minh branch control hoặc phạm vi integration phù hợp, dừng trước kết nối; đánh giá fallback GitHub Actions staging-only riêng, tắt Workers Builds trước khi thay. Không tự bật pipeline thứ hai.

## Thứ tự chạy và nghiệm thu cloud

1. Local migration/seed/typecheck/unit/integration/browser PASS, code và config commit/push lên `develop` sau khi target/repo được duyệt.
2. Workers Builds chạy guarded build; kiểm generated `dist/server/wrangler.json` có đúng Worker/account/D1 và không tự phát sinh KV/Images/session/service bindings.
3. Guard đọc danh tính Cloudflare và `wrangler d1 info` để đối chiếu UUID/name của D1 staging. Những lệnh này chỉ đọc; nếu không trùng thì dừng.
4. Chỉ khi proof/identity đều khớp mới chạy các lệnh dưới bằng Wrangler local đã pin:

```text
wrangler d1 migrations apply DB --remote --config deploy/wrangler.staging.json
wrangler d1 execute DB --remote --config deploy/wrangler.staging.json --file data/seed.sql
wrangler preview --config dist/server/wrangler.json --name develop --worker-name <approved-staging-worker> --ignore-base-config
```

`--name` là tên Preview; `--worker-name` là Worker cha, không được đảo hai cờ. Các lệnh migration/seed đã chạy trên D1 đúng account và PASS. Lệnh Preview vẫn là bước pipeline chưa chạy; không copy placeholder để thực thi. Seed SQL là metadata công khai, không installer/ISO/source code từ repo được phát hiện.

5. Lấy URL thật từ build log, browser QA1440/768/390: Home/Explore/Detail, truy vấn D1, search dấu/không dấu, filter/pagination, loading/empty/error/retry, keyboard, font/ảnh/overflow/console. Kiểm robots/noindex và runtime logs; API data từ D1 staging thật. Ghi commit/build/Preview ID/DB ID và các PASS/FAIL/SKIP, không gộp local PASS thành cloud PASS.
6. Push checkpoint tiếp theo lên develop để chứng minh cập nhật tự động qua GitHub; không dựa vào deploy thủ công từ máy. Xác minh main không cập nhật active deployment bằng setting/log trước các thử nghiệm có mutation.

## Validation và trạng thái hiện tại

**PASS local:** 21 tests tổng, gồm 13 catalog và 8 nhóm guard; production no-op exit 0, từ chối account sai và template chưa duyệt. Đã kiểm help/schema Wrangler 4.156.2 và adapter 14.4.4. Typecheck/build và 45 dev + 45 built Worker browser checks PASS; 40 PNG. Artifact dùng account sai đã hủy. Artifact staging đã build mới với account đúng/D1 mới, generated config top-level/Preview khớp, dry-run PASS (gzip 173.80 KiB), không tự phát sinh KV/Images, không upload. `npm test` 21 tests và `ci:preview:plan` kiểm lại PASS. Chưa deploy Preview.

**PASS cloud target:** OAuth dự án thành công, whoami đúng account; Worker/D1 mới đã tạo, đọc lại và target chỉ approved sau đối chiếu ID. D1 migrate/seed/readback PASS: 13 tài nguyên, 17 nguồn, FK 0, FTS LocalSend. Hai tài nguyên tạo nhầm đã xóa theo yêu cầu, GET trả 404. Proof tại [cloud resources](../qa/p01/cloud-resources.json), [D1](../qa/p01/cloud-d1.json), [cleanup](../qa/p01/ctcm-cleanup.json).

**PASS GitHub:** repo public, sunny251010 có quyền push nhưng không admin; baseline c862af9, app ddae9fe, corrective ace99a1 đã push main/develop. Các thay đổi đúng account/cleanup sau ace99a1 còn cần checkpoint tiếp theo.

**BLOCKED:** Builds API kiểm độc lập trên account đúng trả HTTP 403/code 10000; Browser Use/Computer Use lỗi khởi tạo sandbox helper. Chủ dự án hỗ trợ Dashboard cho phiên này, không gửi token.

**SKIP:** connection/readback branch controls, build từ GitHub, Preview deployment/URL, cloud browser/runtime và push tiếp theo tự cập nhật. Chỉ sau các gate này mới P01 READY FOR REVIEW; local PASS và D1 PASS chưa thay thế nghiệm thu workflow.

## Nguồn chính thức đã đối chiếu

- [Workers Builds branch controls](https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/) — production/default branch và Preview command.
- [Build configuration/environment variables](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/) — biến CI do Builds cấp; được đối chiếu qua Context7 official Workers docs.
- [Build image](https://developers.cloudflare.com/workers/ci-cd/builds/build-image/) — pin runtime của build.
- [Preview configuration](https://developers.cloudflare.com/workers/previews/configuration/), [resource isolation](https://developers.cloudflare.com/workers/previews/resources/) — settings và storage phải khai báo riêng.
- [Wrangler Preview command](https://developers.cloudflare.com/workers/wrangler/commands/workers/#preview), [D1 commands](https://developers.cloudflare.com/d1/wrangler-commands/) — cú pháp hiện hành; help/schema local là baseline đã pin.

Production release cần lệnh duyệt riêng, cấu hình Worker/DB/domain riêng, migrations/test/release/rollback tương ứng. Runbook P01 này không có production deployment path.

## Xác thực khi tiếp tục

Phiên global Ctcm được giữ nguyên. Lệnh Wrangler dùng OAuth dự án phải đặt XDG_CONFIG_HOME trỏ đường dẫn tuyệt đối tới .cache/free-resources-auth và XDG_CACHE_HOME tới .cache/free-resources-auth-cache theo từng lệnh; không đọc/in file auth hoặc token. Không đổi HOME/profile global. Account đích phải tiếp tục khớp ID đã duyệt.

Sau khi người dùng nối Dashboard, đọc lại bảng setting trước lần build đầu; Preview branch include chỉ develop, main production command no-op. Không nối sang account khác, không tạo tài nguyên production hoặc pipeline deployment song song.
