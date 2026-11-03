# P01 — Foundation, catalog & GitHub → Cloudflare

03/11/2026 · **IN PROGRESS — chờ kết nối Dashboard/Workers Builds**. Source local và D1 staging đã kiểm; chưa có Preview URL, chưa deploy ứng dụng, chưa nghiệm thu P01. Không production/P02.

## Đã hoàn thành

Astro7.4.5 + adapter14.4.4, TypeScript6.0.3 strict, Wrangler4.156.2, checker0.9.12 và Node types24.19.2; Node24.18/npm12.2. Lockfile có, npm audit0 vulnerabilities. Reuse P00.3/Noto/assets, native Astro router/SSR/native dialog và D1 SQL/FTS5; không frontend framework khác, ORM/backend server riêng, auth/rating/AI hoặc dependency lớn ngoài stack đã giao.

Home full-width theo A P00.3 và một câu định vị; featured/curated từ D1, không hardcode LocalSend trong component. Explore search/facets/sort/grid-list/pagination; Detail metadata có bằng chứng, nguồn/attribution, unknown ẩn; overlay API thật có loading/empty/error/retry/abort, keyboard/focus, native GET fallback không JS. Clean URLs, title/description riêng, sitemap/robots/noindex và security headers. CTA đóng góp nói rõ chưa mở tiếp nhận, không giả ghi dữ liệu.

Schema0001 gồm resources/resource_types/categories/tags/resource_categories/resource_tags/sources và FTS5/triggers/indexes. 13 tài nguyên, đủ7 loại,17 nguồn official. Local CLI validate/generate/upsert theo stable ID, URL/slug unique, field provenance và asset checks; không public admin endpoint. [Catalog và nguồn kiểm chứng](PHASE01_CATALOG.md), [stack/reuse audit](PHASE01_STACK_AUDIT.md).

## Validation

| Mục | Kết quả |
| --- | --- |
| Typecheck | PASS,0errors/0warnings/0hints |
| Unit/SQLite/CI guards | PASS20 tests:13catalog+7CI; không thay cloud/browser |
| Local D1 | PASS migrations/seed/query, restore riêng, FK/FTS và rollback duplicate batch |
| Dev browser | PASS45 checks,1440/768/390,20PNG,0normalconsole/pageerror |
| Built Worker browser local | PASS45 checks riêng cùng viewport,20PNG; D1 simulator cô lập |
| Staging artifact/dry-run | PASS đúng account/Worker/DB/Preview bindings, không KV/Images; gzip173,80KiB; không upload |
| Cloud D1 staging | PASS migration0001,13resources/17sources,0FK violations,FTS chuyển file→LocalSend |
| Worker cloud | PASS tạo metadata-only, đọc lại0versions; workers.dev tắt, chưa có code/deployment |
| GitHub | Repo/collaborator đã xác nhận, quyền truy cập kiểm thật; commit/push cập nhật trong log Git |
| Workers Builds connection | BLOCKED API403 với OAuth hiện có; browser host cũng lỗi khởi tạo |
| Preview/cloud-browser/auto-update | SKIP chờ connection; không coi local hoặc cloudDB PASS là cloudapp PASS |
| Physical mobile/soft keyboard/AT/cross-browser | SKIP, chỉ Chromium và viewport emulation |

[Screenshot và JSON evidence](../qa/p01/index.html), [D1 cloud readback](../qa/p01/cloud-d1.json). Search503/delay chỉ do QA request interception; không tạo endpoint giả lỗi trong sản phẩm. Một lượt probe H1 đầu lẫn dev-toolbar shadow DOM; đã giới hạn selector main và tắt dev toolbar. Xung đột DOM/Workers Element.append đã sửa dùng native appendChild. Seed remote CLI thành công nhưng parser gặp progress text trước JSON; đã đọc lại DB độc lập, không chạy lại mutation mù.

## GitHub và cloud đích

Repo [ducbang02/FreeResources](https://github.com/ducbang02/FreeResources), dùng `sunny251010` theo lệnh chủ dự án. `main` khóa release, `develop` staging. Baseline `c862af9` giữ planning/prototype trước P01; không sửa/xóa prototype lịch sử hoặc rewrite history.

Account `4873c68031c0fc5e0284943a9119dac2`. Worker `digital-resource-hub-staging`, immutableID `000318f0fc78496aad07c79236818428`. D1 cùng tên, ID `fea09243-1d9b-4836-82ac-0dea72ef1668`, binding `DB`; top-level/Preview cùng stagingDB. Không production Worker/DB/domain/DNS hoặc paid service. Địa chỉ workers.dev trong metadata bị disable, không phải Preview URL.

## Còn thiếu để hoàn tất P01

Chủ dự án chọn hỗ trợ bằng browser/Dashboard, không gửi token. Browser Use reset vẫn lỗi `helper_unknown_error: setup refresh had errors`, Computer Use dự phòng cũng không khởi tạo. OAuth Wrangler đủ Worker/D1, nhưng Builds API403; không tự nâng scope hoặc lấy browser cookies để né.

Kết nối GitHub App đúng repo ở Worker staging → Settings → Builds. Đặt production branchmain, buildcommand `npm run ci:build`, deploycommand `npm run ci:production`, bật Preview chỉdevelop, previewcommand `npm run ci:preview:deploy`, Build variable `NODE_VERSION=24.18.0`. Main build/deploy no-op, nhánh khác chặn; develop kiểm CI/repo/SHA/proof/bindings trước migration/seed/Preview. Một native Workers Builds pipeline, không Actions song song.

Sau connection: đọc lại controls, build từ GitHub thật, lấy Preview URL, chạy lại cloud browser/API/runtime/noindex, xác minh push develop tiếp theo tự cập nhật. Chỉ khi các gate này PASS mới chuyển **READY FOR REVIEW** và dừng chờ nghiệm thu. [Runbook chi tiết](PHASE01_PREVIEW_RUNBOOK.md), [bằng chứng cloud/permissions](PHASE01_CLOUD_CONNECTION.md).

## File thay đổi và bước sau

App tại `src/`, asset có license tại `public/`; schema `migrations/`, catalog `data/`, CLI/CI `scripts/`, stagingtarget `deploy/`, tests `tests/`, browserharness `tools/qa-p01.cjs`, evidence `qa/p01/`. Package/lock/Astro/TS/Wrangler/Gitignore/Gitattributes và README/SETUP/PROJECT/ROADMAP/TASKS/ARCHITECTURE/DECISIONS/DESIGN_SYSTEM cập nhật. Các prototype P00/P00.3 giữ nguyên.

P02 chỉ đề xuất sau khi P01 nghiệm thu: biên tập/import có kiểm soát, auth/admin/moderation theo brief riêng; không tự bắt đầu.
