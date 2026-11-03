# P00.1 — Nghiên cứu editorial discovery

Ngày rà: **03/11/2026**. Phạm vi lane: Apple.com, App Store và Setapp. Đây là đầu vào thiết kế, không phải nghiệm thu UI hoặc thay đổi kiến trúc P01.

## Phương pháp và giới hạn bằng chứng

Đã đọc nội dung web công khai và hướng dẫn thiết kế chính thức bên dưới. **Không có browser/native host hoạt động** trong phiên; không có screenshot trực tiếp, phép đo computed CSS, viewport mobile hoặc quan sát animation đang chạy. Các nhận xét về cấu trúc thông tin dựa trên thứ tự nội dung/control/image của trang. Những lựa chọn pixel, bố cục, màu và responsive trong phần đề xuất là thiết kế riêng cho hub, không phải thông số đo từ website tham khảo.

Không tự kết luận website tham khảo vượt trội về conversion, accessibility hoặc Core Web Vitals khi chưa có dữ liệu. Đọc trực tiếp Apple HIG ban đầu trả shell JavaScript; bản Markdown qua web tool lỗi content-type. Nội dung Layout/Color/Motion được đọc qua kết quả tìm kiếm chính chủ có đầy đủ văn bản; Typography bổ sung bằng video WWDC chính thức. Không có code/HTML/CSS được tạo trước bước nghiên cứu này.

## 1. Apple.com — sản phẩm làm điểm nhấn

[Trang chủ Apple](https://www.apple.com/) có điều hướng sản phẩm, search, các cụm nội dung theo sản phẩm: tên, thông điệp ngắn, hình sản phẩm và cặp hành động tìm hiểu/mua. Cấu trúc lặp có tiết chế giúp người xem nhận ra mỗi khối đang nói về sản phẩm nào; hình mang nội dung, không chỉ làm nền trang trí. Đây là quan sát từ nội dung/alt text, không phải xác nhận vị trí pixel hoặc animation.

**Áp dụng riêng cho hub:** một lời hứa ngắn, search ngay dưới, rồi tài nguyên cụ thể có hình minh họa chức năng. Tránh đưa hero tiếp thị chiều cao gần một màn hình vào directory: hub có hàng nghìn lựa chọn khác với chiến dịch cho một sản phẩm. “Tối giản” phải cắt yếu tố không phục vụ quyết định, không cắt hết hình và nội dung hữu ích.

## 2. Apple App Store — chuyện biên tập và danh sách cùng tồn tại

[Today trên web](https://apps.apple.com/us/iphone/today) kết hợp story/event, bộ sưu tập có chủ đề và danh sách ứng dụng; có search, nhóm Today/Games/Apps và lựa chọn platform. [Trang Duolingo](https://apps.apple.com/us/app/duolingo-learn-languages/id570060128) đưa tên, mô tả ngắn, loại giá, rating/count, category/developer và ảnh lên trước phần nội dung dài. Không chuyển điểm số hoặc lời biên tập của họ sang fixture hub.

**Áp dụng riêng:** story trả lời “vì sao tôi nên quan tâm”, card/row trả lời “đây là gì, dùng ở đâu, có phí không”. Một feature có screenshot đi cạnh tài nguyên nhỏ cho phép vừa hấp dẫn vừa có mật độ. Detail cần cho người mới một câu giải thích và CTA nguồn chính thức trước thông số; không biến mỗi bài thành bài PR. Không xếp “được biên tập chọn” ngang nghĩa với cộng đồng đánh giá cao.

## 3. Setapp — chuyển nhu cầu thành lựa chọn

[Trang chủ Setapp](https://setapp.com/) có search, proposition, các tab nhu cầu và app kèm lợi ích/hình/CTA. [All apps](https://setapp.com/apps) có điều hướng theo công việc, nền tảng, sort và danh sách tên + mô tả + tín hiệu đánh giá. [CleanShot detail](https://setapp.com/apps/cleanshot) kết hợp nhận diện app, ratings và ảnh sản phẩm. Đây là dịch vụ subscription; mô hình giá không phải mặc định thích hợp cho hub miễn phí.

**Áp dụng riêng:** dùng nhãn tác vụ quen thuộc như “Soạn bài”, “Xử lý PDF”, “Chuyển tệp” thay vì bắt người mới hiểu repository/ngôn ngữ. Card có mô tả tác dụng cụ thể và nền tảng. Giữ taxonomy đa nhãn đã thống nhất; một app open source không bị ép thành một category loại trừ. Không dùng tỷ lệ rating mẫu như chứng nhận an toàn.

## 4. Các nguyên tắc Apple có thể chuyển sang web

- [Layout HIG](https://developer.apple.com/design/human-interface-guidelines/layout): nhóm nội dung liên quan, làm thông tin chính dễ tìm, căn hàng để quét nhanh, progressive disclosure, thích ứng khi thay đổi kích thước và độ dài chữ. **Suy ra cho hub:** khoảng trắng nằm giữa nhóm, không chia rời tên–giá–CTA của cùng một tài nguyên; giảm cột ở tablet thay vì thu nhỏ chữ.
- [Typography WWDC](https://developer.apple.com/videos/play/wwdc2020/10175/): text style tạo hierarchy. [UI design tips](https://developer.apple.com/design/tips/) đề cập legibility và vùng chạm. **Suy ra:** typography có hệ rõ nhưng không chỉ dùng headline khổng lồ; body tiếng Việt phải đọc được, metadata không rơi vào cỡ 9–10px. Mốc control web 44px được chọn cho prototype, không đồng nhất đơn vị CSS px với point iOS.
- [Color HIG](https://developer.apple.com/design/human-interface-guidelines/color): màu cần nhất quán về nghĩa, đủ tương phản và không là tín hiệu duy nhất. **Suy ra:** một accent cho hành động; artwork/identity ứng dụng có màu riêng, được đặt trong frame có kiểm soát. Nền trung tính không buộc mọi thumbnail thành xám.
- [Motion HIG](https://developer.apple.com/design/human-interface-guidelines/motion?changes=l_9_3): motion phục vụ trạng thái/feedback, ngắn và có thể tránh. [Reduced Motion criteria](https://developer.apple.com/help/app-store-connect/manage-app-accessibility/reduced-motion-evaluation-criteria): cơ sở kiểm tương tác giảm chuyển động. **Suy ra:** hover/focus tinh tế, menu có phản hồi rõ; không autoplay carousel, parallax hoặc trì hoãn search để chạy animation. Reduced motion tắt chuyển động không thiết yếu.
- [Principles of great design](https://developer.apple.com/videos/play/wwdc2026/250/?time=68): đơn giản không đồng nghĩa dồn mọi chức năng vào một nơi; hierarchy truyền đạt thứ tự quan trọng. **Suy ra:** search luôn dễ tìm nhưng taxonomy/discovery vẫn cần lộ diện.

## 5. Khung thiết kế đề xuất cho Concept A mới

Các thông số sau là **PROPOSED cho hub**:

| Mảng | Quyết định riêng | Lý do và giới hạn |
| --- | --- | --- |
| Homepage desktop 1440 | Content khoảng 1240px, header gọn, intro/search khoảng 150–180px; hàng editorial ngay sau | Có hình/tài nguyên trước fold ở viewport cao phổ biến; phải kiểm viewport thật, không bảo đảm từ phép cộng CSS |
| Editorial stage | Một story rộng có screenshot chức năng, hai thẻ nhỏ hơn có bố cục riêng | Nhịp thị giác khác directory grid nhưng không rỗng; không cần 3 story đều quảng cáo |
| App shelf | Sau stage là shelf ứng dụng với icon, tên, tác dụng, platform, giá/license và CTA | Tăng density và khả năng nhận diện ngay; điểm/count chỉ hiện nếu fixture ghi nhãn |
| Discovery | Search tại đầu, category/platform/price filter rõ, số kết quả và reset, card/grid quét nhanh | Đẹp không được làm chậm việc thu gọn nhiều tài nguyên |
| Detail | Icon/name/value + primary source CTA; screenshot rõ, facts gọn; nội dung biên tập và community tách | Không phải screenshot collage trống thông tin; nguồn/giấy phép không giả xác minh |
| Typography | Headline khoảng 42–48px desktop, 32–36px mobile; body 15–16px; meta 12–13px | Tỷ lệ là điểm khởi đầu, cần kiểm line wrap và zoom; dùng font hệ thống sẵn có hoặc font có license rõ |
| Whitespace | Nhịp 8px, gap nội dung 16–24px, section 40–56px | Không dùng khoảng trắng để che thiếu nội dung; mỗi màn phải có một điểm neo hình ảnh |
| Mobile 390 | Hero gọn, search đủ lớn, story chính lên trước; shelf/section chuyển một cột, filter bằng control có label | Không shrink desktop screenshot thành chữ không đọc được; ảnh có alt/caption, vùng chạm rõ |
| Tablet 768 | Hai cột editorial khi đủ chỗ; nhóm phụ xuống hàng, điều hướng thu gọn có menu thật | Đây là phương án cần QA, không khẳng định đã nhìn ở tablet |
| Interaction | Search/filters cập nhật hash, empty state/reset; thẻ mở detail; nút góp link mở form demo có feedback | Không có CTA trang trí; tác vụ ngoài scope phải nói rõ chưa gửi/lưu |

## 6. Asset, bản sắc và quyền sử dụng

Không dùng logo Apple, ảnh Apple.com/App Store/Setapp, layout nguyên bản hoặc headline marketing của họ trong prototype. [Apple trademark guidelines](https://www.apple.com/legal/intellectual-property/guidelinesfor3rdparties.html) là nguồn rà quyền thương hiệu, không phải cấp phép sao chép mọi asset.

Ảnh/icon app của hub phải có provenance: URL gốc, tên tác giả/owner, license hoặc phạm vi sử dụng được kiểm. Logo sản phẩm không tự thuộc license của code. Nếu chưa có quyền phù hợp, tạo **minh họa chức năng nguyên bản và ghi nhãn fixture**, không tự vẽ logo giả dễ gây nhầm với logo chính thức. Screenshot tự dựng từ UI mock phải ghi “minh họa”, không gọi screenshot sản phẩm thực. Không dùng screenshot Apple để thay screenshot phần mềm đang giới thiệu.

## 7. Đánh giá và điểm cần xác minh

**PASS nghiên cứu:** đọc các trang chính chủ trên, đối chiếu hierarchy, nội dung ứng dụng, navigation/facets và HIG. **SKIP visual/browser:** không quan sát trực tiếp typography computed, màu hiện tại, breakpoints, animation, keyboard/mobile hoặc console. Thử đọc nguồn HTML qua terminal cũng bị socket policy chặn; không dùng công cụ ngoài browser để giả lập quan sát UI.

Concept A mới nên thắng ở cảm xúc biên tập và khả năng nhận diện; rủi ro là stage lấy quá nhiều chiều cao hoặc artwork làm metadata chìm. Gate kiểm tiếp: tài nguyên đầu hiện trên desktop 1440, không overflow ở 390/768, source CTA rõ, focus/contrast, nội dung không bị che bởi card, và ảnh/icon không bịa quyền sử dụng. Báo cáo này không tự chọn A thay chủ dự án.
