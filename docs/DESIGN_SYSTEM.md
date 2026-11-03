# DESIGN_SYSTEM — Concept A / Editorial Discovery

Ngày 03/11/2026. **P00.3 READY FOR REVIEW; chưa nghiệm thu UI.** A là hướng chính Apple-inspired, tên Nếp và nhận diện vẫn là thử nghiệm. P01 NOT STARTED; hướng Astro/TypeScript + Workers/D1 giữ nguyên và chưa kiểm runtime.

## 1. Mỗi trang một nhiệm vụ

| Màn hình | Nhiệm vụ | Giới hạn |
| --- | --- | --- |
| Home | Truyền cảm hứng bằng sản phẩm | Một hero LocalSend, search, hai card có hình thật; tối đa bốn lựa chọn |
| Search overlay | Tìm nhanh | Tối đa bốn kết quả, gợi ý ngắn; Enter/xem tất cả sang catalog |
| Explore | Duyệt và thu gọn | Search, facets, grid/list, sort, load-more 8→16→19 fixture |
| Detail | Tìm hiểu và quyết định | Screenshot, nguồn/attribution, công dụng, OS/price/license, giới hạn, CTA chính thức |

Home không lặp intro/feature, không đoạn giải thích dưới search, không metadata/rating dày. Hai card Excalidraw và Godot thay bốn tile P00.2 để tăng kích thước hình, giảm chữ và chỉ dùng icon sản phẩm có nguồn. LocalSend không lặp lại trong card. Không có rating giả trên A.

## 2. Hero và hình ảnh

Hero là section nằm ngoài content container: nền `#edf3f7` trải ngang viewport; nội dung trong container tối đa 1240px. Desktop hai cột, tablet điều chỉnh tỷ lệ, mobile xếp dọc và căn giữa. Không dùng `100vw` gây overflow do scrollbar.

Headline “Chuyển tệp. / Nhẹ như không.” có hai dòng; không thêm mô tả. LocalSend identity, một CTA Detail và search nổi bật. Ảnh desktop 2000×1182 và điện thoại 395×800 giữ nguyên file nguồn; `height:auto`, không kéo giãn hoặc cắt mất giao diện. Desktop có tài nguyên hữu ích ngay trong màn hình đầu.

Card Home là một link toàn khối có focus rõ, icon, tên, hình sản phẩm và tối đa một dòng mô tả. Excalidraw dùng artwork chính thức, ghi nhãn **Artwork sản phẩm**, không gọi là screenshot. Godot dùng screenshot editor. `object-fit:contain` giữ tỷ lệ ảnh trong khung.

Không đặt credit dài dưới hero. Detail giữ caption/source; footer dẫn đến “Nguồn ảnh & giấy phép”, nơi có attribution, license, link nguồn, manifest ảnh/font. Godot CC BY 4.0, LocalSend Apache-2.0, Excalidraw MIT và Noto OFL vẫn được giữ. Không xóa notice bắt buộc để giảm chữ.

Excalidraw A dùng `excalidraw-responsive.svg`: chỉ thêm outer `viewBox="0 0 1000 1000"`; đường nét/màu giữ nguyên. Original vẫn lưu và hash không đổi. Manifest ghi derivative, credits ghi thay đổi. B/C tiếp tục dùng original.

## 3. Typography và màu

| Token | P00.3 |
| --- | --- |
| Font | Noto Sans normal 400–700, Latin + Vietnamese, tự host hai WOFF2 tổng 50.276 bytes |
| Fallback | Segoe UI → Arial → sans-serif; `font-display:swap`, không font loader |
| Phạm vi | A và dialog khi A hoạt động; B/C giữ font/style tham chiếu |
| Body / nav | Body 16px, navigation 15px; nội dung Detail 16px |
| Heading Home | 52px desktop / 40px tablet / 36px mobile; hai dòng, line-height 1.15–1.17 |
| Card Home | Tên 20/19px; mô tả 16px desktop, 14px tablet, 15px mobile; một dòng |
| Metadata chính | Detail label 14px / value 16px, caption nguồn 14px; search preview 14px |
| Màu | Chữ `#192e3c`, secondary hero `#446174`, accent `#245ac4`; placeholder A `#5d6e84` |
| Layout | Container 1240px; gutter desktop 48px trở lên, tablet 28px, mobile 18px |

Noto chỉ được dùng trong prototype; không cài font hệ thống hoặc thay global config. OFL đầy đủ, provenance và hash tại [font audit](PHASE003_FONT_ASSETS.md). CSS upstream lưu làm bằng chứng, không được include vì chứa URL remote. Không phối thêm font. Font actual đã xác minh bằng CDP, không chỉ nhìn `font-family` computed.

## 4. Search và tương tác

Giữ native dialog P00.2, ordinary links/buttons và label; không gắn role combobox/listbox thiếu hợp đồng keyboard.

- Click/focus search mở overlay, caret vào input. Enter đến Explore; close/Escape trả focus và không mở lại ngoài ý muốn.
- Default tối đa ba nhu cầu, ba category và hai công cụ. Bỏ dòng hướng dẫn dư thừa; status vẫn báo loading/results/empty/error cho người dùng và aria-live.
- Preview tối đa bốn, history tối đa ba query trong phiên, có xóa; không persist.
- Loading 160ms là mô phỏng dữ liệu local. Error có nhãn mô phỏng và retry. Query mới/close/route hủy timer cũ.
- Tab/Shift+Tab trong dialog; Escape xử lý trước hành vi xóa text mặc định của search input.
- Mobile dùng 100dvh và nội dung cuộn bên trong; 390×480 đã kiểm như proxy chiều cao thấp, không thay bàn phím ảo thật.

Motion chỉ hover 160–180ms và dịch nhẹ tối đa 3px; không autoplay/parallax. `prefers-reduced-motion:reduce` tắt transition/animation.

## 5. QA và ranh giới bằng chứng

**PASS:** Chromium thật 1440×900, 768×1024, 390×844; 45 checks luồng + 23 checks P00.3; ảnh/font/overflow/navigation/search/keyboard, Excalidraw decode và raster có hình, hai subset font local, tiếng Việt weight 400/500/600/700, fallback khi chặn font, file://. Không console/page error ở các luồng bình thường. 29 PNG gồm trước/sau và bổ sung.

Rà contrast chọn mẫu đã làm tối placeholder A; không gọi đây là full WCAG audit. Native labels, một H1/main, skip link, focus-visible, menu aria-expanded/Escape và trạng thái aria-live được giữ.

**SKIP:** thiết bị iOS/Android vật lý, software keyboard thật, screen reader, cross-engine Safari/Firefox và nghiệm thu của chủ dự án. Không suy browser headless thành thiết kế đã được duyệt.

## 6. Guidance, review và bước dừng

Reuse HTML/CSS/JS, asset/manifest hiện có và local Playwright. [UI UX guidance](PHASE002_DESIGN_GUIDANCE.md) là source-only đã tham khảo; skill chưa cài/chạy generator. [Tooling audit](PHASE002_TOOLING_AUDIT.md) giữ nguyên; không cài MCP/plugin/dependency lớn.

- [A tương tác](../prototype-p001/index.html), [khung review](../prototype-p001/review.html).
- [Trước/sau và browser evidence](../qa/p003/index.html), [báo cáo P00.3](PHASE003_REPORT.md).
- Logic regression: `node prototype-p001/verify.mjs`, 19 nhóm/63 template; đây là VM, không phải browser.

**Dừng chờ chủ dự án nghiệm thu P00.3. Không bắt đầu P01, backend, cloud hoặc deploy.**

## P01 implementation

Chu du an chonConceptA/P00.3/NotoSanslambaseline. Astroapp reuse reviewedassetsandfull-widthhero, themmotcau dinhvi theo briefP01. Featured/curated/taxonomy fromD1, nothardcodedLocalSend. CleanSSRroutes /,/explore,/resources/[slug]; searchoverlayGET/api/search realD1 withloading/empty/error/retry/abort. Detailprovenanceverified, unknownmetadatahidden; nofakeratings. LocaldevandbuiltWorker browserPASS1440/768/390; cloudPreviewpending, no physicaldevice/AT claim. Oldprototypesunchanged.
