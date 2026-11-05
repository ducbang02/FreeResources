# Remotion — công bố lên Preview staging

Ngày 05/11/2026. Chủ dự án đã tự duyệt cuối và Export bản Remotion trong Admin local, sau đó yêu cầu đưa lên D1 Cloudflare. Chỉ công bố bản ghi `gh-274495425` cùng SQL tương ứng. Không đưa draft, cache AI, cấu hình Gemini hoặc các thay đổi P02 chưa nghiệm thu lên cloud.

## Luồng đang sử dụng

`Admin local → duyệt cuối → Export JSON → đưa bản đã duyệt vào data/catalog.json → sinh data/seed.sql → kiểm thử → commit/push develop → Workers Builds → migrate/seed D1 staging → Preview develop → kiểm tra website`.

Export chỉ ghi catalog local; không tự ghi D1 cloud. Push chỉ kích hoạt pipeline: dữ liệu xuất hiện trên cloud sau khi bước seed remote thành công. Không cần Gemini chạy lại để công bố bản đã duyệt. Các lần seed tiếp theo tiếp tục đọc catalog trong Git, vì vậy bản đã công bố phải được giữ trong catalog này.

- Repository: `ducbang02/FreeResources`, nhánh `develop`.
- Account: `4ca521c6746d874c049fd829121ab59e`.
- Worker/D1: `digital-resource-hub-staging`; D1 UUID `e28f4099-92cf-40bc-ab8c-c47138b4469d`.
- [Trang Remotion trên Preview](https://develop-digital-resource-hub-staging.nguyenducbang-uit.workers.dev/resources/gh-274495425).
- Giữ nguyên CI/CD; không push `main`, không upload/deploy production.

## Phạm vi nội dung

Catalog tăng từ 13 lên 14 tài nguyên; 13 bản cũ giữ nguyên. Remotion có giấy phép tùy điều kiện, không được mô tả là miễn phí vô điều kiện hoặc MIT. Điều kiện Free License / Company License và nguồn LICENSE.md được giữ trong Detail. Tài nguyên chưa có ảnh/icon riêng, sử dụng fallback hiện có.

## Kiểm chứng trước khi push

- PASS: đọc D1 staging, đối chiếu đủ các trường và nguồn với catalog Git baseline; không có DB-only drift.
- PASS: 59 unit/integration tests; typecheck/Astro check không lỗi hoặc cảnh báo; build thành công.
- PASS: Chrome thật 1440/768/390, Home search → Results → Detail; điều kiện giấy phép rõ, không overflow hoặc console error.
- Test số lượng dữ liệu dùng kích thước catalog đầu vào để các lần thêm tài nguyên sau không phá test; có regression riêng cho tìm kiếm và giấy phép Remotion.
- Bằng chứng sinh tự động nằm trong `qa/p023/remotion-publish/` và bị Git ignore.

Kết quả này là kiểm local trước push, chưa thay thế kiểm chứng cloud. Sau push phải đọc lại Preview deployment tag/bindings, đối chiếu D1 cloud đủ 14 bản ghi và chạy browser trên URL thực tế. Trạng thái nghiệm thu vẫn READY FOR REVIEW; chưa tự đánh dấu người dùng đã duyệt UI/P02.
