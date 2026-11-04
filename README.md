# Nếp — Digital Resource Hub

[Bản đồ kiến trúc tương tác](docs/architecture-maps/index.html): hệ thống, CI/CD, dữ liệu và Search; mở local bằng Chrome. [Cách dùng và cập nhật](docs/architecture-maps/README.md).

[Thiết kế P02 — API trước, AI sau](docs/PHASE02_DESIGN.md): đề xuất CLI/Git JSON, draft/review, Gemini tùy chọn và milestones. **Thiết kế READY FOR REVIEW; chưa triển khai**, chờ Q-09–11 và lệnh riêng. [Sơ đồ đề xuất](docs/architecture-maps/05-p02-proposed.html).
> Account staging đã xác minh: 4ca521c6746d874c049fd829121ab59e — Nguyenducbang.uit@gmail.com's Account. Worker/D1 đúng account đã tạo và đọc lại; tài nguyên tạo nhầm đã xóa theo yêu cầu. [Bằng chứng](docs/PHASE01_CLOUD_CONNECTION.md).

Ứng dụng Astro + TypeScript, Cloudflare Workers/D1, giao diện Concept A theo P00.3 và Noto Sans. Catalog có **13 tài nguyên thật, 7 loại và 17 nguồn kiểm chứng**. Không auth, rating, submission hoặc AI API thật trong P01.

**P01 — READY FOR REVIEW.** Mở [website Preview](https://develop-digital-resource-hub-staging.nguyenducbang-uit.workers.dev). [Bản sửa và validation04/11](docs/PHASE01_P1_FIXES.md):25 unit/integration tests PASS;45 P01 journeys và19 P1 browser checks PASS trên cả local và Preview ở1440/768/390. Build94f3c52b/commit9a2f732 thành công. GitHub→Preview và main no-op đã kiểm; các Failed attempts giữ riêng. Production/P02 chưa triển khai, UI/P01 chờ chủ dự án nghiệm thu. [Báo cáo](docs/PHASE01_REPORT.md), [luồng làm việc](docs/PHASE01_PREVIEW_RUNBOOK.md#luồng-làm-việc-hiện-tại-đọc-từ-trái-sang-phải), [Final Audit/P02 preparation](docs/PHASE01_FINAL_AUDIT.md).

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
- `main`: release khóa, production command no-op. `develop`: push sẽ tự checks/build, migrate/seed D1 staging và cập nhật Preview nếu mọi guard đều PASS.
- Account staging: `4ca521c6746d874c049fd829121ab59e`; Worker `digital-resource-hub-staging`, D1 `e28f4099-92cf-40bc-ab8c-c47138b4469d`. Target chỉ được `approved:true` sau khi đọc lại đúng ID.
- `wrangler.jsonc` chỉ local; staging dùng `deploy/wrangler.staging.json`. Không có production target.
- Chỉ một Workers Builds pipeline, không thêm Actions song song. Builds API trên account đúng trả HTTP 403, code 10000; Browser Use/Computer Use không khởi tạo được nên chủ dự án hỗ trợ Dashboard.

License/platform/pricing chưa có bằng chứng được để trống hoặc ẩn. Không host installer/ISO/tài liệu/game từ nguồn khác. Nội dung là tóm tắt có nguồn, không giả review đã dùng mọi sản phẩm.

## Lịch sử thiết kế

[P00.3 prototype](prototype-p001/index.html), [ảnh trước/sau](qa/p003/index.html), [P00 cũ](prototype/index.html) giữ nguyên; đây là tham chiếu, không phải app Astro. [AGENTS](AGENTS.md) là quy tắc agent, [PROJECT](PROJECT.md) là hướng sản phẩm.

Ảnh test, raw QA reports/logs/traces chỉ giữ local; gallery HTML và báo cáo tóm tắt vẫn nằm trong repo. Link `qa/...` cần artifact local, không có sẵn trong clone mới. Xem [chính sách QA artifacts](qa/README.md).
