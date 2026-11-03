# P00.3 — Noto Sans assets

Ngày lấy nguồn: 03/11/2026. Chỉ thêm asset vào prototype A hiện tại; không cài font hệ thống, package hoặc dịch vụ ngoài. Kiểm browser/font fallback thuộc báo cáo QA P00.3, không suy từ download thành nghiệm thu UI.

## Reuse Audit và quyết định

- Đã có fallback Segoe UI/Arial, chưa có webfont trong source. Yêu cầu P00.3 cho phép thử Noto Sans hỗ trợ tiếng Việt.
- Dùng hai WOFF2 subset nguyên bản từ Google Fonts: Latin + Vietnamese, normal, CSS khai báo weight 400–700. Tổng **50.276 bytes (~49,1 KiB)**; không cần dependency, runtime API hay font tải từ xa khi review local.
- Không tải TTF đầy đủ nhiều script hoặc một file cho từng weight; không thêm font khác. Không chỉnh glyph hoặc tự subset. Tên file local thay đổi để dễ nhận biết.
- Asset API v42 và SHA-256 ghi nhận bản đã tải; upstream nhánh main có thể thay đổi. Giới hạn trục thực trong binary chưa được phân tích độc lập; 400–700 là range khai báo từ CSS response chính thức.

## Nguồn và giấy phép

[Google Fonts CSS2 response](https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400..700&display=swap) trả CSS cho normal 400–700. Chỉ giữ hai block cần dùng tại `SOURCE.css`, nguyên URL và unicode-range. [Google Fonts Noto Sans repository](https://github.com/google/fonts/tree/main/ofl/notosans) và [Noto upstream](https://github.com/notofonts/latin-greek-cyrillic) là nguồn dự án.

[OFL chính thức](https://raw.githubusercontent.com/google/fonts/main/ofl/notosans/OFL.txt) được lưu đầy đủ, không cắt gọn tại `prototype-p001/assets/fonts/OFL.txt`: Copyright 2022 The Noto Project Authors, SIL Open Font License 1.1. Khi phân phối font cần kèm copyright và toàn bộ license, không bán riêng font; các điều kiện về reserved name và endorsement tiếp tục áp dụng. Không cần đặt credit dài dưới hero; giữ file license và đường nguồn/credits dễ truy cập. Font không thay đổi license của trang sử dụng nó.

| File trong `prototype-p001/assets/fonts/` | Bytes | SHA-256 |
| --- | ---: | --- |
| `noto-sans-v42-vietnamese-wght-400-700.woff2` | 14.456 | `791e3f213c155a5b1f4bbe4cbf8e33f321cfb7f46248a5ed11077dc79209a63c` |
| `noto-sans-v42-latin-wght-400-700.woff2` | 35.820 | `51ca196f49a33e79e7870ff88ebd2829a3f627a51e7d690986618f0e7ad2b52d` |
| `OFL.txt` | 4.396 | `cee9892f9f0cc8fe882c9e9537ee6a89621d86ee7ceaf70b02e2b2b1c25c061a` |

URL gstatic cụ thể, unicode-range, retrieval UTC, user-agent lấy CSS và hash nằm trong [font manifest](../prototype-p001/assets/fonts/manifest.json). WOFF2 không có kích thước pixel như ảnh. `noto-sans.css` dùng URL tương đối tới hai font local, giữ unicode-range từ Google, `font-display: swap`, `font-stretch: 100%`, `font-style: normal`, `font-weight: 400 700`.

## Cách tích hợp và kiểm tra

Concept A có thể nạp `assets/fonts/noto-sans.css` trước CSS giao diện rồi đặt `font-family: "Noto Sans", "Segoe UI", Arial, sans-serif` nhất quán cho body, control và navigation. Không include `SOURCE.css` trong trang vì file này giữ URL upstream để làm bằng chứng. Không cần preload toàn bộ subset hoặc thêm thư viện font loader.

- **PASS — asset:** nguồn public official; MIME `font/woff2`; chữ ký `wOF2`; header length khớp byte file; SHA-256; giữ OFL đầy đủ.
- **PASS — khai báo:** Vietnamese + Latin unicode-range bao phủ mẫu chữ Việt NFC viết hoa/thường có đ/Đ, đủ các dấu Việt và ký hiệu ₫. Đây là kiểm range CSS, không thay kiểm glyph bằng browser.
- **Cần QA browser ở integration:** `document.fonts.ready`, request font local thành công và không remote font request; đo/render chữ Việt ở 400/500/600/700; dùng DevTools/CDP xác nhận font thực; chặn hai WOFF2 để kiểm Segoe UI/Arial không mất chữ/overflow. Với nội dung Unicode decomposed/NFD có thể có combining marks ngoài hai range Google; kiểm riêng nếu có thay vì khẳng định hỗ trợ mọi script.
- Không tải font global hoặc thay cấu hình. Normal sandbox chặn socket; escalation đọc/tải public official vào workspace đã được automatic review chấp thuận. Không có rejection hoặc thay đổi ngoài workspace.

## Kiểm tra Excalidraw — chỉ đọc ở asset lane

Kết quả integration sau asset lane: hai font local đã tải200, FontFace loaded và CDP xác nhận Noto Sans/glyph tiếng Việt tại400/500/600/700. Chặn font ở1440/390 fallback Segoe UI vẫn đọc được, hero hai dòng/không overflow; file:// cũng PASS. Python server Windows trả application/octet-stream cho WOFF2, khác MIME font/woff2 của upstream; browser đã decode/render thật. Bằng chứng và giới hạn trong [bàn giao P00.3](PHASE003_REPORT.md), không suy thành nghiệm thu trên mọi trình duyệt.

File `assets/excalidraw.svg` 4.937 bytes trùng **từng byte** với [favicon chính thức](https://raw.githubusercontent.com/excalidraw/excalidraw/master/public/favicon.svg), SHA-256 `ff042440a415c5e3f0b3c77dfbf2a367906e38cbabdd5b2270e6e01ff4f8a97f`. XML parse được, không script. Không có bằng chứng file tải bị hỏng.

Outer SVG khai báo width/height 1000 nhưng không có viewBox; SVG con có viewBox `0 0 107 101`. Đây là điểm cần kiểm khi scale/contain trong card, chưa đủ bằng chứng kết luận nguyên nhân. Implementation lane cần kiểm URL thực, `naturalWidth/naturalHeight`, `decode()`, computed size và screenshot. Nếu chuẩn hóa responsive root `viewBox="0 0 1000 1000"`, phải ghi đây là thay đổi hình thức, giữ MIT notice/nguồn và không bóp méo tỷ lệ. Asset lane không sửa icon, helper hay manifest ảnh.
