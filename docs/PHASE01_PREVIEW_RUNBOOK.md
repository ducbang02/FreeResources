# P01 — GitHub → Workers Builds → Preview

Ngày 03/11/2026. Chủ dự án đã xác nhận repo `ducbang02/FreeResources` và account Cloudflare hiện đăng nhập. Lane tích hợp đã tạo D1 staging riêng; **chưa xác minh pipeline GitHub → Workers Builds → Preview** tại thời điểm cập nhật này. Production chưa được phép. Root ghi trạng thái cloud mới nhất trong báo cáo P01.

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
| `tests/deploy.test.mjs` | Bảy nhóm kiểm từ chối sai target/branch/binding, fork, resource ngoài scope và no-op production |

Đã có `deploy/staging-target.json` và `deploy/wrangler.staging.json` sau xác nhận: account `4873c68031c0fc5e0284943a9119dac2`, Worker đích `digital-resource-hub-staging`, D1 mới cùng tên với ID `fea09243-1d9b-4836-82ac-0dea72ef1668`, repo `ducbang02/FreeResources`. Account ID và database ID không phải credential; không đặt token trong JSON. Bất kỳ field target lạ, placeholder, Worker/DB không phải staging, binding không khớp hoặc resource ngoài scope đều bị chặn. Template chưa duyệt vẫn giữ làm ví dụ tái sử dụng, không được coi là target thật.

`plan` chỉ in các thao tác dự kiến từ target hợp lệ; không gọi Cloudflare. `build` chạy validation, D1 migrations/seed **local**, typecheck, tests rồi Astro build với config staging được chỉ định. Khi các bước thành công, ghi proof trong `.cache/` gắn với commit, target, config/artifact, lockfile, seed và migrations. `deploy` chỉ dùng proof còn khớp và artifact đã kiểm; sau đó mới preflight remote rồi migrate/seed D1 staging và chạy `wrangler preview`.

Script không gọi `wrangler deploy`, `versions upload`, secret mutation hoặc tạo resource. `--ignore-base-config` ngăn dashboard Preview base config bổ sung binding chưa review. Generated artifact do adapter sinh, không chỉnh tay.

## Chuẩn bị sau khi được xác nhận

1. Xác minh GitHub owner/repo private, account Cloudflare đúng, quyền và Free plan. Chỉ cấp GitHub App quyền lên repo được xác nhận. Không cấp toàn bộ repo khi không cần. Không tự nâng gói.
2. Tạo repo/private và remote bằng phiên đăng nhập được cho phép. Push checkpoint có tên rõ, không force push. Có branch `main` cho trạng thái khóa release và `develop` cho staging; không để `develop` làm production branch của Workers Builds theo default tự động.
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
| Connected repository | Chính xác repo private được duyệt, cùng origin |
| Production branch | `main`, không phải `develop` |
| Build command | `npm run ci:build` |
| Deploy command | `npm run ci:production` — không upload/migrate/deploy |
| Enable Preview Builds | Bật; nhánh được sử dụng trong P01 là `develop` |
| Preview command | `npm run ci:preview:deploy` |
| Build Node version | Node24.18.0 tương thích lockfile; pin theo cấu hình Build image hiện hành |
| Token scope | Chỉ account/Worker staging và D1 staging theo khả năng giới hạn của Cloudflare; không credential trong Git |

Dashboard branch controls là một phần acceptance, không thay bằng unit test. Chụp/ghi setting thực trước khi kích hoạt lần đầu. Common build dispatcher bỏ qua main với exit0 và không build/upload; nhánh ngoài main/develop bị từ chối. Production deploy command vẫn là no-op. Chỉ `develop` mới có thể vượt guard.

Workers Builds cung cấp `WORKERS_CI=1`, `WORKERS_CI_BRANCH` và `WORKERS_CI_COMMIT_SHA`. Guard so HEAD với SHA này, kiểm origin đúng repo, yêu cầu tracked tree sạch và **đối chiếu HEAD với `refs/heads/develop` đọc từ đúng GitHub repo đã duyệt**. Nhờ vậy tên branch `develop` từ fork/PR không đủ để deploy. Cloud build cần quyền đọc ref private repo khi `git ls-remote` chạy; nếu quyền đọc không có, giữ trạng thái BLOCKED, không gỡ guard để cho qua.

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

`--name` là tên Preview; `--worker-name` là Worker cha, không được đảo hai cờ. Các lệnh trên là mô tả pipeline chưa chạy; không copy placeholder để thực thi. Seed SQL là metadata công khai, không installer/ISO/source code từ repo được phát hiện.

5. Lấy URL thật từ build log, browser QA1440/768/390: Home/Explore/Detail, truy vấn D1, search dấu/không dấu, filter/pagination, loading/empty/error/retry, keyboard, font/ảnh/overflow/console. Kiểm robots/noindex và runtime logs; API data từ D1 staging thật. Ghi commit/build/Preview ID/DB ID và các PASS/FAIL/SKIP, không gộp local PASS thành cloud PASS.
6. Push checkpoint tiếp theo lên develop để chứng minh cập nhật tự động qua GitHub; không dựa vào deploy thủ công từ máy. Xác minh main không cập nhật active deployment bằng setting/log trước các thử nghiệm có mutation.

## Validation của phần chuẩn bị

**PASS local:** `node --test tests/deploy.test.mjs` bảy nhóm, dùng fixture và không gọi cloud; production no-op exit0. Đã kiểm `wrangler preview --help`, `d1 info --help`, schema package4.156.2 và adapter14.4.4 `configPath` trong installed types. Guard từ chối template chưa duyệt. Plan test xác nhận chỉ D1 staging và Worker Preview, không production command.

**PASS về target:** owner/repo/account đã được chủ dự án xác nhận; D1 staging được lane tích hợp tạo và ID ghi trong target/source config thật; `plan` không cloud call, kiểm source target thành công. **PENDING:** quyền GitHub/remote/push, parent Worker staging, build artifact staging thật, dashboard branch control, private-ref read trong Builds, preflight cloud, migrations remote, Preview deployment/URL và cloud browser QA. Chưa có bằng chứng hoàn thành đường GitHub → Cloudflare; không báo P01 READY FOR REVIEW từ runbook này. Xem báo cáo tích hợp P01 để biết trạng thái sau thời điểm này.

## Nguồn chính thức đã đối chiếu

- [Workers Builds branch controls](https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/) — production/default branch và Preview command.
- [Build configuration/environment variables](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/) — biến CI do Builds cấp; được đối chiếu qua Context7 official Workers docs.
- [Build image](https://developers.cloudflare.com/workers/ci-cd/builds/build-image/) — pin runtime của build.
- [Preview configuration](https://developers.cloudflare.com/workers/previews/configuration/), [resource isolation](https://developers.cloudflare.com/workers/previews/resources/) — settings và storage phải khai báo riêng.
- [Wrangler Preview command](https://developers.cloudflare.com/workers/wrangler/commands/workers/#preview), [D1 commands](https://developers.cloudflare.com/d1/wrangler-commands/) — cú pháp hiện hành; help/schema local là baseline đã pin.

Production release cần lệnh duyệt riêng, cấu hình Worker/DB/domain riêng, migrations/test/release/rollback tương ứng. Runbook P01 này không có production deployment path.

## Cập nhật tích hợp

Worker metadata-only đã tạo, D1 staging đã migrate/seed/readback PASS13resources/17sources/FTS/foreignkeys. Artifact stagingbuild +guard +dry-run PASS, không upload code. OAuthWorkersBuildsAPI403; BrowserUse và ComputerUse host lỗi khởi tạo. Chủ dự án chọn hỗ trợ bằng Dashboard thay vì gửi token. Khi kết nối, đặt đúng bảng Setting ở trên trước lần build đầu; NODE_VERSION=24.18.0 trong Build variables, Preview branchinclude chỉdevelop. Production branchmain với ci:productionkhông deploy. Chưa cóPreviewURL.
