# Digital Resource Hub — Planning Kit

> **P00.3 READY FOR REVIEW**: A Editorial Discovery đã chọn làm hướng, bản UI chưa nghiệm thu. Chưa bắt đầu P01.

**Vòng hiện tại:** mở [A P00.3](prototype-p001/index.html) hoặc [khung review](prototype-p001/review.html). Hero full-width, hình sản phẩm lớn, hai card trực quan, Noto Sans Việt tự host và search overlay. [Screenshot trước/sau + 68 browser checks](qa/p003/index.html), [bàn giao / file thay đổi](docs/PHASE003_REPORT.md). B/C và prototype P00 giữ tham chiếu. Chưa nghiệm thu UI; physical mobile keyboard/AT chưa kiểm.

**Bản P00 giữ tham chiếu:** [prototype/index.html](prototype/index.html) và [prototype/review.html](prototype/review.html) là A/B cũ, chưa được chấp nhận. [Báo cáo Phase 00](docs/PHASE00_REPORT.md) giữ nghiên cứu kỹ thuật trước đó; UI mới nằm ở P00.1 bên trên.

Bộ tài liệu này dành cho dự án cổng công cụ và tài nguyên số tiếng Việt: khám phá GitHub repo, giới thiệu phần mềm, tài liệu học tập, game và tài nguyên miễn phí; hỗ trợ người dùng gửi nội dung và đánh giá.

## Bắt đầu

1. Giải nén rồi **copy nội dung bên trong thư mục** `digital-resource-hub-planning-kit` vào **root repo mới** (không lồng cả thư mục kit). Bộ này có `AGENTS.md` universal **đã được chỉnh từ bản An cung cấp**; hãy xem diff và chủ động thay bản cũ sau khi kiểm tra, không giữ hai bản hướng dẫn mâu thuẫn.
2. Đọc `PROJECT.md`, `docs/DECISIONS.md`, `docs/ARCHITECTURE.md`, `docs/AI_PROVIDERS.md` và `docs/DESIGN_SYSTEM.md`.
3. Chốt các câu hỏi còn mở trước khi yêu cầu Codex tạo mã nguồn.
4. Dùng `ROADMAP.md` để triển khai từng phase; ghi trạng thái vào `TASKS.md`.
5. Sau khi Codex tạo source thực tế và script, cập nhật `SETUP.md` với lệnh đã chạy/kiểm chứng.

## Cấu trúc

| File | Vai trò |
| --- | --- |
| `AGENTS.md` | **Dùng chung cho mọi dự án**: audit/reuse trước khi code, Ponytail, scope, kiểm thử và bảo mật |
| `PROJECT.md` | Mục tiêu, người dùng, MVP, giá trị sản phẩm |
| `ROADMAP.md` | Các phase và điều kiện chuyển phase |
| `TASKS.md` | Checklist công việc có thể nghiệm thu |
| `SETUP.md` | Yêu cầu môi trường và quy trình setup/kiểm thử (chờ source) |
| `docs/ARCHITECTURE.md` | Kiến trúc đề xuất, dữ liệu, bảo mật, scaling |
| `docs/AI_PROVIDERS.md` | Thiết kế AI đa nhà cung cấp, fallback, chi phí và an toàn |
| `docs/DESIGN_SYSTEM.md` | Trải nghiệm, giao diện, quy tắc thiết kế có bản sắc |
| `docs/DECISIONS.md` | Nhật ký quyết định và các lựa chọn chưa chốt |

## Trạng thái và phạm vi

- Đã thống nhất định hướng: website nội dung + cộng đồng; admin thêm thủ công; AI hỗ trợ khám phá và soạn bản nháp; người dùng có thể gửi và đánh giá tài nguyên; chi phí đầu thấp.
- **Đã chốt định hướng P01:** public catalog trước, Astro + TypeScript + Cloudflare Workers/D1; chưa kiểm chứng runtime, chưa bắt đầu. Drizzle, Better Auth, R2 và chi tiết implementation vẫn là đề xuất.
- **UI:** A là hướng chính đã chọn, P00.3 chờ nghiệm thu. B/C và prototype P00 giữ tham chiếu. Browser Chromium đã QA1440/768/390; giới hạn physical mobile/AT ghi trong báo cáo. Khuyến nghị C của P00.1 là lịch sử, không thay quyết định A.
- **Đã có để review:** prototype giao diện tĩnh với fixture; chưa có database, auth, AI API, ranking cộng đồng thật hoặc production. Validation và phần SKIP ghi tại báo cáo Phase 00.
- Quy tắc chung trong `AGENTS.md` không thay thế yêu cầu nghiệp vụ riêng của từng dự án. Bản AGENTS đã xóa các chỉ dẫn gắn riêng với THEOLOI.

## Nguyên tắc làm việc

- Giải pháp nhỏ nhất đúng yêu cầu; không thêm hạ tầng sớm khi chưa có dữ liệu nhu cầu.
- Đánh giá và quyền sử dụng phải được kiểm chứng; AI không tự cấp quyền phát hành hoặc tuyên bố phần mềm an toàn.
- Không đưa secrets vào repo hoặc prompt; tách local/staging/production.
- Báo cáo PASS/FAIL/SKIP, phân biệt test local, staging và sử dụng thật.
