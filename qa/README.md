# QA artifacts — chỉ lưu local

Ảnh chụp test, JSON kết quả/readback, build logs và performance traces dưới `qa/` là output kiểm thử, được `.gitignore` loại khỏi version control. File đã có trên máy vẫn được giữ nguyên khi bỏ tracking. Clone mới không có các artifact này.

Repo chỉ giữ tài liệu này và các `index.html` gallery viết tay. Gallery và link bằng chứng `qa/...` trong báo cáo dùng để mở **local sau khi tạo/nhận artifact**, không phải link ảnh/report có sẵn trên GitHub.

- Chạy lại P01 browser QA theo [SETUP](../SETUP.md); script [qa-p01.cjs](../tools/qa-p01.cjs) nhận thư mục output ở argument cuối.
- [qa-p002.cjs](../tools/qa-p002.cjs) và [qa-p003.cjs](../tools/qa-p003.cjs) là source kiểm thử, tiếp tục được version control. Ảnh baseline “before” và log cloud lịch sử cần giữ local hoặc chia sẻ riêng; không giả là có thể tái tạo chính xác từ runtime hiện tại.
- Kết luận, lỗi và giới hạn kiểm thử được lưu ngắn gọn trong `docs/` và `TASKS.md`. Không cần commit raw output để ghi nhận PASS/FAIL/SKIP.
- Ảnh/font/license của sản phẩm trong `public/assets/`, assets prototype, test source, catalog/seed và migrations vẫn được giữ trong Git.

Việc này không xóa blob trong commit cũ. Dọn lịch sử Git là tác vụ khác, không được thực hiện ở lần cập nhật này.
