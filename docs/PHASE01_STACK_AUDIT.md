# P01 — Stack, runtime và GitHub → Cloudflare audit

Snapshot 03/11/2026. Lane nghiên cứu: đọc source/context/skills, Context7 và tài liệu official; đọc metadata npm và tarball adapter trong bộ nhớ, **không thực thi upstream script, không cài CLI/package, không đọc credentials hoặc thay cloud**. Kết quả runtime/deploy thực tế do lane tích hợp ghi ở báo cáo P01; bảng dưới là compatibility đã đối chiếu tài liệu/metadata, không thay local/cloud tests.

## Reuse Audit

| Lựa chọn | Đánh giá | Quyết định |
| --- | --- | --- |
| Astro + adapter Cloudflare official + D1 binding/SQL | Đúng stack được giao; SSR, router và asset pipeline có sẵn; không cần frontend framework thứ hai/ORM/backend server riêng | Chọn. Cài dependency trong project, pin và giữ lockfile |
| `cf` CLI beta | Hợp hướng mặc định của skill cho project mới, nhưng bản hiện tại không hỗ trợ Node24.18 theo engines; không tự nâng Node/global config. Adapter Astro hiện hành có peer bắt buộc Wrangler và hướng dẫn Wrangler config | Không thêm CLI thứ hai; xem ngoại lệ có bằng chứng bên dưới |
| Workers Builds official / GitHub Actions | Builds đủ khả năng Preview riêng và kiểm production branch; Actions có thể làm fallback staging-only khi không xác minh được integration/controls | Ưu tiên **một Workers Builds pipeline**. Không bật song song hai deploy pipeline |

Không thêm KV, Images, auth, ratings, queue, Redis, search service hoặc AI trong P01. Các package CLI/build là công cụ phát triển, không tự trở thành dependency client. Dependency license không tự đặt license cho toàn repository.

## Phiên bản và compatibility

Đọc trực tiếp public npm registry `/latest` và version metadata ngày03/11. Thư viện source official: [Astro monorepo](https://github.com/withastro/astro), [Workers SDK](https://github.com/cloudflare/workers-sdk).

| Package | Pin đề xuất đã kiểm | License | Compatibility / kích thước unpacked |
| --- | --- | --- | --- |
| `astro` | `7.4.5` | MIT | Node≥22.23.4; npm≥9.6.5. Current Node24.18/npm12 đáp ứng. ~3,49MB |
| `@astrojs/cloudflare` | `14.4.4` | MIT | Peers Astro `^7.4.0`, Wrangler `^4.125.0`; ~133KB |
| `wrangler` | `4.156.2` | MIT OR Apache-2.0 | Node≥22.0; ~15,81MB, kèm dev runtime/bundler qua dependencies |
| `@astrojs/check` | `0.9.12` | MIT | Peer TypeScript `^5.0.0 || ^6.0.0`; ~15,7KB |
| `typescript` | `6.0.3` | Apache-2.0 | Đáp ứng checker. Không chọn latest7.0.2 vì nằm ngoài peer range của checker; ~24,35MB |
| `@cloudflare/workers-types` | `5.20261103.1` nếu cần | MIT OR Apache-2.0 | Wrangler optional peer `^5.20261102.1` chấp nhận. Ưu tiên `wrangler types` sinh Env từ cấu hình; không tự viết Env trùng binding |

Transitive snapshot: adapter yêu cầu `@cloudflare/vite-plugin ^1.63.1`; version1.63.1 có peer Vite6/7/8 và Wrangler `^4.149.0`. Wrangler4.156.2 đáp ứng. Astro7.4.5 dùng Vite `^8.3.5`; Vite8.3.5 yêu cầu Node `^20.19.0 || >=22.12.0`, current24.18 đáp ứng. Không cần thêm Vite direct chỉ để pin trùng; lockfile ghi resolution thực.

Metadata npm bao gồm repository official, peer/engines/license, dist integrity; root cần giữ package-lock và chạy audit/check/build runtime thực. Kích thước trên là từng package unpacked, **không phải** kích thước Worker bundle, client JS hoặc toàn bộ dependency tree.

## Wrangler và ngoại lệ `cf` có căn cứ

Skill cf-cli khuyên cf cho project chưa có config. Yêu cầu người dùng hiện tại chốt Astro + official adapter + nghiên cứu Wrangler; adapter14.4.4 có peer Wrangler bắt buộc, source dùng Cloudflare Vite plugin và theo dõi `wrangler.json/jsonc`. Vì vậy chọn đường tích hợp official nhỏ nhất thay vì thêm/migrate công cụ beta.

`cf@1.0.0-beta.27` hiện yêu cầu Node `^22.23.0 || ^24.22.0 || ^26.12.0`; current24.18 nằm ngoài range. Không tự cài global hoặc nâng runtime máy. Thêm nữa, [hướng dẫn cf/Wrangler](https://developers.cloudflare.com/cf/wrangler/) cảnh báo chạy cf project commands trong Wrangler Vite project chưa migrate có thể sinh SPA config thiếu entrypoint/bindings. Không chạy `cf dev/build/deploy` cạnh cấu hình adapter đang dùng.

Đây là quyết định tích hợp cho P01, không sửa AGENTS hoặc global preference. Khi source đã có Wrangler config, tiếp tục Wrangler theo quy tắc skill; không tạo thêm `cloudflare.config.ts` song song.

## Astro runtime: cấu hình tối thiểu cần giữ

[Adapter official](https://docs.astro.build/en/guides/integrations-guide/cloudflare/) và Context7 `/withastro/docs` xác nhận:

```js
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'server',
  session: false,
  adapter: cloudflare({ imageService: 'passthrough' }),
});
```

`session:false` có từ Astro7.2: loại bỏ session runtime và KV tự provision. `imageService:'passthrough'` giữ asset local đã tối ưu, tránh Images binding tự provision hoặc dịch vụ ảnh trả phí. Nếu sau này cần image transform, đánh giá riêng thay vì để default `cloudflare-binding` phát sinh binding ngoài scope.

Astro6+ dev/preview chạy workerd qua Vite plugin; bỏ API cũ `Astro.locals.runtime`. Dùng `import { env } from 'cloudflare:workers'`, query `env.DB` ở server và truyền binding vào module query; không đặt I/O/mutable request state ở module global. Sinh types từ cấu hình bằng `wrangler types`, cập nhật khi binding thay đổi. Astro7 adapter ghi build-output Wrangler config dưới `dist/server/`; kiểm artifact thực sau build, không suy từ hướng dẫn adapter đời trước.

Astro6+ chọn environment lúc **build** qua `CLOUDFLARE_ENV`, không build một artifact rồi đổi environment tùy ý ở deploy. P01 chỉ một staging target để giảm lỗi. Cấu hình mới dùng ngày tương thích hiện tại, `nodejs_compat`, logs/traces và sampling phù hợp Free; kiểm schema package đã pin và local workerd thực.

## Workers Builds và bảo vệ production

Tài liệu [Build branches](https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/) cập nhật01/10/2026: branch production mặc định theo default branch của Git repository. Push vào branch đó chạy build rồi deploy command. Không nối repo rồi để nguyên default command.

Phương án ưu tiên, **chỉ thực hiện sau khi root xác minh account/repo/quyền**:

1. Chỉ tạo Worker có tên staging đã được người dùng xác nhận và D1 staging riêng. Không tạo hoặc kết nối Worker production thật, custom domain, DNS, cron hoặc service binding sang dự án khác.
2. Cấu hình production-branch deploy command là một script harmless chỉ báo “production chưa được duyệt”, **không remote migration/upload/deploy**. Default/main push có thể build nhưng không được cập nhật active deployment. Script và cấu hình dashboard cần được đọc lại/kiểm thử trước push kết nối đầu.
3. Bật Preview builds; dùng Preview command gọi wrapper chỉ chấp nhận branch phát triển đã xác nhận. Wrapper kiểm account ID, Worker name, DB name/ID và equality của bindings trước mutation; migrate/seed staging sau local tests PASS rồi gọi Wrangler Preview.
4. Build command chỉ validate/test/build local. Remote migration nằm trong nhánh Preview guarded command, không chạy cho production branch hoặc PR không tin cậy.
5. Chỉ cấp GitHub App quyền trên repository được xác nhận, không tự cấp tất cả repository. Không đưa token vào source/command line/log. Không chạy deploy từ fork hoặc untrusted PR với secrets.
6. Sau kết nối, push một checkpoint lên develop; xác minh build thực, branch/ref, binding, cloud D1 query, Detail/search, noindex và runtime log. Chỉ cấu hình dashboard chưa chứng minh CI/CD hoạt động.

Theo [Build configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/), new Worker preview command hiện mặc định là `npx wrangler preview`. Không dựa vào tài liệu cũ dùng `versions upload` như thể đó là cùng loại Preview.

Theo [Wrangler command reference](https://developers.cloudflare.com/workers/wrangler/commands/workers/#preview), `wrangler preview --name develop --worker-name <worker-staging>`: `--name` là **tên Preview**, còn `--worker-name` là Worker cha. Kiểm `--help` của bản đã pin trước mutation. Không chạy script chứa placeholder và không tự đoán account.

## D1 isolation: Preview khác Version URL

[Preview configuration](https://developers.cloudflare.com/workers/previews/configuration/) quy định storage/vars/secrets cần khai báo trong `previews` block; không mặc định kế thừa production. [Resources/isolation](https://developers.cloudflare.com/workers/previews/resources/) nêu D1/KV/R2 chỉ được cô lập khi trỏ đến resource riêng; URL khác **không tự tạo DB riêng**.

Với P01 staging-only Worker, top-level DB phục vụ local/migration và `previews.d1_databases` đều phải chỉ đúng DB staging đã xác nhận; không có production DB trong config. Nếu dùng file `wrangler.preview-migrations.jsonc` riêng, top-level `d1_databases` của file này phải khớp chính xác ID/name dưới `previews` của Worker. Áp migrations vào DB đó **trước** Preview deployment. DB dùng chung cho develop previews là staging chung, không được mô tả thành isolation riêng mỗi branch.

[Compare workflows](https://developers.cloudflare.com/workers/previews/compare-workflows/) phân biệt Version URL chạy Worker version với bindings của version, còn Worker Preview có settings riêng. `wrangler versions upload` không tạo branch-isolated resources. Không dùng nó thay cho Preview test rồi tuyên bố D1 đã tách biệt.

## Khi nào dùng GitHub Actions

[Official Actions guide](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/) là fallback nếu không xác minh được Workers Builds branch control hoặc không kết nối được GitHub App an toàn. Khi đổi, disconnect/disable Workers Builds trước; chỉ một workflow `push: develop`, explicit staging target, least-privilege secret/environment, không `pull_request_target` chạy code không tin cậy. Pin third-party Actions theo commit đã kiểm nếu dùng.

Không tự thêm Actions chỉ vì root chưa có account credentials trong phiên. Khả năng đọc/thiết lập integration hiện chưa xác minh; root đã hỏi owner/repo/account một lần và tiếp tục local work. Cloud steps còn **PENDING**, không phải PASS.

## Security và giới hạn nghiên cứu

Đã xem advisory official thay vì mặc định “latest an toàn”. [Astro AVIF advisory](https://github.com/withastro/astro/security/advisories/GHSA-26w7-cxv4-gfx2) ghi fix7.2.8; đề xuất7.4.5 nằm trên fix, đồng thời không xử lý ảnh AVIF do người dùng cung cấp. [Wrangler Pages command injection](https://github.com/cloudflare/workers-sdk/security/advisories/GHSA-36p8-mvp6-cv38) fix4.59.1/3.114.17; đề xuất4.156.2 nằm trên fix, dự án dùng Workers. Không suy hai advisory này thành audit đầy đủ tree.

Normal sandbox chặn socket registry; các lần đọc metadata/public tarball bằng escalation được automatic review chấp thuận. Không có hành động cài/chạy hoặc cloud mutation ở lane nghiên cứu. Source tarball chỉ được mở trong bộ nhớ để kiểm config/API, không extract executable hoặc chạy postinstall.

**PASS nghiên cứu:** Context7 resolve/query, primary docs/registry, peer/engine/license, source adapter và ranh giới Preview/D1. **Chưa kiểm ở lane này:** npm install/audit tree, typecheck/build, workerd/D1 migration, GitHub handshake, Workers Builds control thật, Preview URL/cloud QA. Không có production deploy hoặc paid service.
