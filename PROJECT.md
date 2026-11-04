# PROJECT — Cổng tài nguyên số cộng đồng

> P01 READY FOR REVIEW: ba P1 theo Final Audit đã sửa, local và Preview PASS. Astro/TypeScript + Workers/D1, Concept A P00.3 và Noto Sans giữ nguyên. GitHub→Preview và main no-op đã PASS; Failed attempts giữ riêng. Chờ chủ dự án nghiệm thu, không production/P02. [Cập nhật04/11](docs/PHASE01_P1_FIXES.md).

> Định hướng04/11: **API trước, AI sau**; GitHub importer được thiết kế tại [P02 proposal](docs/PHASE02_DESIGN.md), READY FOR REVIEW, chưa implementation. Ba khu vực sản phẩm là Mã nguồn mở & GitHub / Tài nguyên miễn phí / Tài nguyên khác, có thể chồng lấp; phạm vi “Khác” và nguồn biên tập P02 còn chờ duyệt. Chưa đổi UI, D1 hoặc CI/CD.

## 1. Tầm nhìn

Một địa chỉ tiếng Việt giúp học sinh, sinh viên, giáo viên, nhân viên văn phòng và người làm công nghệ **tìm được tài nguyên thực sự hữu ích, hiểu nó làm gì và dùng được**. Giá trị khác biệt không phải số lượng link, mà là nội dung được biên tập dễ hiểu, nguồn minh bạch, tìm kiếm theo nhu cầu thực tế và đánh giá cộng đồng.

Mô hình nội dung kết hợp: (1) admin tự biên tập; (2) khám phá từ nguồn đáng tin cậy như GitHub và kho phần mềm; (3) người dùng đề xuất; (4) AI hỗ trợ mô tả và phân loại nhưng **con người duyệt trước khi xuất bản**.

API chính thức và code xử lý metadata, URL/trùng, validation, rules, cache/quota; Gemini chỉ cho ngữ nghĩa/biên tập cần thiết và ưu tiên một response nhiều fields. Public repo không tự thành open source; unknown license giữ unknown. Phân biệt GitHub facts, lời tác giả, dữ liệu được đối chiếu và gợi ý AI; stars là popularity, không phải community rating. Search/Detail chỉ dùng dữ liệu đã lưu, không gọi AI theo lượt xem.

## 2. Nhóm người dùng và nhu cầu

| Nhóm | Nhiệm vụ phổ biến | Nội dung có ích |
| --- | --- | --- |
| Học sinh / sinh viên | Học ngoại ngữ, lập trình, làm bài tập | Tài liệu học miễn phí hợp pháp, web công cụ, ứng dụng |
| Giáo viên | Soạn bài, quản lý lớp, dùng Office | Công cụ PDF/Word/Excel, bài học, tài nguyên giảng dạy |
| Nhân viên văn phòng | Xử lý file, làm việc nhanh hơn | Phần mềm miễn phí, công cụ online, hướng dẫn |
| Người dùng phổ thông | Cài app, tìm phần mềm thay thế | App, tiện ích Windows, game hợp pháp |
| Người làm công nghệ | Khám phá repo, chạy công cụ | Repo GitHub, TTS, LocalSend, RustDesk, script có hướng dẫn |

## 3. Danh mục nghiệp vụ (không đồng nhất với chuyên mục hiển thị)

- `repository`: mã nguồn GitHub/GitLab; có thể cần biết cách tự triển khai.
- `application`: ứng dụng có bản cài hoặc bản portable.
- `learning_resource`: khóa học, tài liệu, bộ bài tập, thư viện nội dung miễn phí.
- `online_tool`: công cụ chạy trên web như PDF, Word, Excel, ảnh, chuyển đổi tệp.
- `game`: trò chơi miễn phí hoặc nguồn tải/hoạt động có quyền rõ ràng; game tuổi thơ là một chủ đề con.
- `operating_system_resource`: hướng dẫn, ISO/bộ cài **chính chủ**, tiện ích hệ điều hành.
- `collection`: danh sách biên tập theo nhu cầu, ví dụ “10 công cụ miễn phí cho giáo viên”.

**Mỗi mục có thể nằm ở nhiều chủ đề** (học tập, văn phòng, AI, lập trình, bảo mật, giải trí...) và tag công năng. Không ép “repo” và “phần mềm” thành các chuyên mục loại trừ nhau.

## 4. Luồng người dùng cần có

1. Truy cập trang chủ -> tìm kiếm bằng từ ngữ thường ngày -> lọc mục đích, nền tảng, miễn phí/open source -> đọc trang chi tiết -> đến trang gốc.
2. Xem nguồn, giấy phép/điều kiện sử dụng, tính tương thích, độ khó, đánh giá cộng đồng, thời điểm kiểm tra gần nhất.
3. Có tài khoản -> đề xuất link và mô tả -> theo dõi trạng thái: chờ duyệt, cần bổ sung, đã xuất bản, từ chối.
4. Có tài khoản -> đánh giá/chấm điểm; có thể chỉnh đánh giá của chính mình; report tài nguyên lỗi hoặc vi phạm.
5. Luồng P02 được thiết kế trước cho GitHub public: URL → code chuẩn hóa/trùng → GitHub API + validation/nguồn → rules → Gemini tùy chọn khi cần ngữ nghĩa → nháp → người biên tập đối chiếu/chỉnh/duyệt → export và quy trình Preview có quyền. Metadata lấy được chưa đồng nghĩa đã xác minh; không tự publish hoặc bắt buộc AI. App/tài liệu từ nguồn khác để phase được giao sau.

## 5. Chất lượng nội dung

Mỗi trang tài nguyên có hai tầng:

- **Tầng catalog**: tên, icon có nguồn, một câu mô tả, chủ đề/tag, nền tảng, link chính thức, loại giá/giấy phép, ngày kiểm tra và trạng thái.
- **Tầng biên tập** (không bắt buộc với mọi mục): dành cho ai, giải quyết việc gì, ưu/nhược, hướng dẫn, cách cài đặt, lưu ý về quyền và an toàn, ảnh minh họa có quyền.

Phân biệt các nhãn **miễn phí**, **freemium**, **mã nguồn mở**, **trial** và **miễn phí cho giáo dục**. “Có trên GitHub” không đồng nghĩa được phân phối, bán lại hoặc tự động cài.

## 6. MVP đề xuất

- Trang chủ riêng biệt, directory có trang chi tiết SEO tốt, danh mục + tag, tìm kiếm/lọc cơ bản.
- Admin thêm/sửa/xuất bản mục thủ công, nhập URL có đọc metadata, kiểm tra trùng.
- Công khai đường dẫn gốc, nguồn và chính sách; có trang báo link hỏng/vi phạm.
- Tài khoản cơ bản, người dùng gửi **link và thông tin** (chưa host file), đánh giá một lần mỗi tài nguyên, duyệt nội dung.
- AI Gemini soạn **bản nháp** qua interface provider trung lập (có thể triển khai sau khi catalog hoạt động).
- Bảng xếp hạng có yếu tố số lượng đánh giá và chống thao túng; có tab “Mới”, “Nổi bật”, “Biên tập chọn”.

Không đưa vào MVP: tự chạy lệnh trên máy người dùng, tải lại Windows ISO/game lên server, kho upload công khai, diễn đàn lớn, extension, gợi ý theo cá nhân, ứng dụng mobile, AI đăng bài tự động.

## 7. Nguyên tắc nội dung và vận hành

- Chỉ liên kết tới nguồn chính thức hoặc nguồn được phép phân phối; có cơ chế xử lý khiếu nại/gỡ bỏ, nguồn và thông tin liên hệ minh bạch.
- Trước mắt lưu **metadata và link**, không sao chép file/bài học của bên thứ ba lên R2.
- Tài liệu do người dùng nộp phải có khai báo quyền chia sẻ; admin kiểm tra trước khi hiển thị.
- AI đưa ra gợi ý chứ không bảo chứng về bản quyền, tính chính xác, an toàn hoặc khả năng cài đặt.
- Nội dung về kích hoạt Windows, crack, game thương mại cũ không tự động được xem là hợp pháp vì “đã lâu đời” hoặc “chia sẻ miễn phí”.

## 8. Đo lường thành công

- Chất lượng: tỷ lệ link còn sống, lỗi được giải quyết, tỷ lệ nội dung có nguồn/loại giấy phép rõ, bình chọn có độ tin cậy.
- Sản phẩm: người dùng tìm thấy thứ cần, click qua nguồn chính thức, dùng lại website, tỷ lệ tìm kiếm không có kết quả.
- Vận hành: thời gian duyệt, chi phí mỗi bản nháp AI, số đề xuất có ích, bài trùng/spam.
- Phát triển: organic search và người quay lại; **không hy sinh nội dung hay pháp lý chỉ vì traffic**.

## 9. Điều cần xác nhận trước khi code

Xem `docs/DECISIONS.md`. Ưu tiên chốt phạm vi MVP, quy trình kiểm duyệt, tài khoản và hướng UI. Công nghệ ở `docs/ARCHITECTURE.md` là phương án khởi đầu, không phải giấy phép tự deploy.

## 10. Kết quả định hướng Phase 00 — lịch sử

- **Đã chốt:** Apple-inspired minimalist editorial, bản sắc riêng, nền trung tính, một màu nhấn, typography và search làm trọng tâm; mobile-first và reduced motion. A/B P00 chưa đạt, ba concept P00.1 chờ chủ dự án review/chọn.
- **Đã chốt hướng P01:** public catalog trước, ưu tiên Astro + TypeScript + Workers/D1; phải kiểm runtime thật. Auth, community ratings, submissions hoàn chỉnh và AI thật ở phase sau. Chi tiết import/seed local vẫn đề xuất.
- **Đã tạo để review:** `prototype/index.html` dùng fixture, mô phỏng admin URL → draft; không phải backend và không chứng minh nội dung/điểm số đã được xác minh.
- **Chờ nghiệm thu:** `docs/PHASE00_REPORT.md` cùng nghiên cứu stack/reuse; dừng ở P00 `READY FOR REVIEW`, không tự chuyển sang P01.
- **Phản hồi UI:** A/B P00 chưa được chấp nhận vì quá trống trải/thiếu điểm nhấn. Đã thực hiện brief P00.1: nghiên cứu trước code, ba concept mới khác composition ở `prototype-p001/`, xem `docs/PHASE001_REPORT.md`. C là khuyến nghị, chưa chốt UI. Bản P00 giữ nguyên; browser/tablet/mobile QA thật và screenshot SKIP. Ponytail chưa cài.

## 11. P00.2 — log refinement

A được chọn làm hướng chính, không đồng nghĩa nghiệm thu giao diện. Home ít chữ/section: search,1 feature,4 công cụ và lời mời khám phá/đóng góp. Search preview giới hạn; Explore giữ catalog/filter/grid-list/load-more; Detail giữ nguồn/OS/price/license/giới hạn. B/C chỉ lưu tham chiếu; khuyến nghị C trước đây đã được thay bằng quyết định của chủ dự án.

P00.2 có QA Chromium thật45 checks/20 screenshot ở1440/768/390, không còn chỉ mock/static. Physical iOS/Android/keyboard ảo/AT chưa kiểm. Tooling chỉ dev: reuse Context7/Playwright có sẵn, UI UX source guidance; không install/config mới hoặc runtime dependency. Báo cáo `docs/PHASE002_REPORT.md`. P00.2 READY FOR REVIEW, P01 NOT STARTED.

## 12. P00.3 — baseline thiết kế và log lịch sử

A giữ Apple-inspired, hero nền trải ngang với ảnh LocalSend desktop/mobile đúng tỷ lệ, headline hai dòng, không đoạn giải thích dư. Home hai card Excalidraw/Godot có icon và hình thật, không rating giả; search overlay giữ các luồng P00.2. Noto Sans Latin/Việt tự host, không cài font hệ thống. Attribution ở Detail/credits, không mất license.

68 browser checks PASS (45 luồng +23 P00.3), 29 PNG trước/sau/bổ sung; font thật/fallback và Excalidraw đã kiểm. [Bàn giao](docs/PHASE003_REPORT.md), [so sánh](qa/p003/index.html). P00.3 READY FOR REVIEW, chờ chủ dự án nghiệm thu. P01 NOT STARTED; không backend/cloud/deploy; B/C và P00 source giữ nguyên.

## 13. P01 — trạng thái hiện tại

App Astro SSR có Home/Explore/Detail, overlay tìm kiếm API D1, taxonomy từ DB, filter/sort/phân trang và local CLI có validation. Catalog13 tài nguyên/7 loại/17 nguồn; không auth/rating/submission/Gemini thật. Local check/build/tests/browser PASS. Account staging đúng `4ca521c6746d874c049fd829121ab59e` đã xác thực; Worker metadata và D1 `e28f4099-92cf-40bc-ab8c-c47138b4469d` đã tạo, đọc lại. Cloud D1 migrate/seed/query PASS; tài nguyên tạo nhầm đã xóa và kiểm 404.

Repo `ducbang02/FreeResources` hiện public; cộng tác viên/tác giả `sunny251010` được chủ dự án cho phép. Build7de0b863 từ develop508a96c đã tạo [Preview](https://develop-digital-resource-hub-staging.nguyenducbang-uit.workers.dev); Worker/DB bindings được API đọc lại đúng account. Browser cloud45 checks PASS,20PNG. Chủ dự án hỗ trợ Dashboard/log vì OAuth thiếu quyền Builds API; không chặn deploy qua CI. Nhánh main có build/deploy no-op, không production target; kiểm thử live main chỉ theo quyền riêng của chủ dự án. Chỉ Preview/staging được phép, không production/P02. Báo cáo [P01](docs/PHASE01_REPORT.md); các log P00 NOT STARTED là lịch sử đã được brief P01 thay thế.
