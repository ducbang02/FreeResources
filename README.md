# Nếp — Digital Resource Hub
> ĐÍNH CHÍNH ACCOUNT: Đích đúng là 4ca521c6746d874c049fd829121ab59e. Tài nguyên đã tạo ở Ctcm4873…dac2 là sai account, không được nghiệm thu cho P01. Target cũ đã approved:false, ID thật đã gỡ khỏi config; chưa deploy ứng dụng. Chờ xác thực đúng account trước khi tạo lại.

Ứng dụng Astro + TypeScript, Cloudflare Workers/D1, giao diện Concept A theo P00.3 và Noto Sans. Catalog có **13 tài nguyên thật, 7 loại và 17 nguồn kiểm chứng**. Không auth, rating, submission hoặc AI API thật trong P01.

**P01 còn chờ kết nối Workers Builds và kiểm Preview.** Local typecheck/build, 20 tests, D1 và browser đã PASS. Worker/D1 staging riêng đã tạo, D1 cloud migrate/seed/query PASS. Chưa deploy ứng dụng, chưa có Preview URL; không triển khai production.

## Chạy local trên Windows

```powershell
npm ci --ignore-scripts
npm run db:migrate
npm run db:seed
npm run dev
```

Mở http://127.0.0.1:4321. Home `/`, Explore `/explore`, Detail `/resources/localsend`. Dữ liệu từ D1; search tiếng Việt, filter, sort, pagination; JSON import có validator, không public admin endpoint.

```powershell
npm run check
npm test
npm run build
```

[SETUP](SETUP.md), [tracker](TASKS.md), [catalog/nguồn](docs/PHASE01_CATALOG.md), [stack audit](docs/PHASE01_STACK_AUDIT.md), [runbook GitHub → Cloudflare](docs/PHASE01_PREVIEW_RUNBOOK.md), [kết nối cloud](docs/PHASE01_CLOUD_CONNECTION.md).

## GitHub và staging

- Repo: [ducbang02/FreeResources](https://github.com/ducbang02/FreeResources), cộng tác viên/tác giả `sunny251010` được chủ dự án duyệt.
- `main`: release khóa, production command no-op. `develop`: Preview khi Workers Builds được kết nối.
- Worker/D1: `digital-resource-hub-staging`; `DB` riêng ID `fea09243-1d9b-4836-82ac-0dea72ef1668`.
- `wrangler.jsonc` chỉ local; staging dùng `deploy/wrangler.staging.json`. Không có production target.
- Chỉ một Workers Builds pipeline, không thêm Actions song song. OAuth không có quyền Builds API; browser host lỗi nên chủ dự án hỗ trợ Dashboard.

License/platform/pricing chưa có bằng chứng được để trống hoặc ẩn. Không host installer/ISO/tài liệu/game từ nguồn khác. Nội dung là tóm tắt có nguồn, không giả review đã dùng mọi sản phẩm.

## Lịch sử thiết kế

[P00.3 prototype](prototype-p001/index.html), [ảnh trước/sau](qa/p003/index.html), [P00 cũ](prototype/index.html) giữ nguyên; đây là tham chiếu, không phải app Astro. [AGENTS](AGENTS.md) là quy tắc agent, [PROJECT](PROJECT.md) là hướng sản phẩm.
