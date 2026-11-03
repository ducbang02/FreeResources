# P00.3 — Visual simplification

03/11/2026 · **READY FOR REVIEW**. A giữ hướng Apple-inspired; chờ chủ dự án nghiệm thu. P01 **NOT STARTED**, quyết định Astro/TypeScript + Workers/D1 không đổi, chưa runtime-verified.

## Bản bàn giao

- [Prototype A tương tác](../prototype-p001/index.html), [khung review](../prototype-p001/review.html).
- [So sánh screenshot trước/sau](../qa/p003/index.html): 1440×900, 768×1024, 390×844, có bản toàn trang.
- [45 kiểm tra luồng](../qa/p003/after/results.json), [23 kiểm tra P00.3](../qa/p003/results-specific.json).

Mở `prototype-p001/index.html` trực tiếp bằng browser, mặc định A; hoặc chạy server local theo [SETUP](../SETUP.md). Route Home `#/A/home`, Explore `#/A/discover`, Detail `#/A/detail/localsend`. Không cần npm, key, backend hoặc internet để dùng prototype.

## Thiết kế thay đổi

Hero cũ nằm trong một khung bo góc, sau intro nhiều chữ. Hero mới trải nền ngang viewport, nội dung tối đa1240px, ghép ảnh desktop và điện thoại LocalSend từ nguồn đã audit. H1 “Chuyển tệp. / Nhẹ như không.” đúng hai dòng ở ba viewport. Bỏ đoạn mô tả và dòng giải thích dưới search; giữ một CTA và search rõ.

Home còn **hai lựa chọn** Excalidraw/Godot, nằm trong giới hạn tối đa bốn. Chọn hai để tăng kích thước hình, giảm chữ và dùng icon sản phẩm có nguồn cho mọi card. Card là link toàn khối, hỗ trợ Tab/Enter, tên rõ, mô tả một dòng. Excalidraw dùng artwork ghi nhãn riêng, Godot dùng screenshot editor; không tạo screenshot hoặc rating giả. LocalSend không lặp trong card.

Ảnh hero giữ tỷ lệ gốc2000×1182 và395×800 với height:auto; ảnh card dùng contain. Không credit dài dưới hero; Detail/credits giữ attribution, license, nguồn và manifest. Godot CC BY4.0 vẫn có attribution trong “Nguồn ảnh & giấy phép” liên kết từ footer; không bỏ notice để làm giao diện sạch.

Noto Sans Latin + Vietnamese tự host hai WOFF2, tổng50.276 bytes, normal400–700, font-display:swap, fallback Segoe UI/Arial. Body16px/nav15px; Detail nội dung16px, metadata/caption14–16px, search preview14px. B/C không dùng font mới. [Nguồn, OFL, hash](PHASE003_FONT_ASSETS.md).

Excalidraw A dùng derivative thêm outer viewBox để scale ổn định; paths/màu không đổi, original giữ nguyên. Manifest và credits ghi rõ thay đổi. File original trùng nguồn chính thức và không tái hiện404, vì vậy không khẳng định lỗi do file tải bị hỏng. Bản mới đã kiểm decode, kích thước và raster64×64 có1399 pixel màu, không chỉ dựa vào naturalWidth.

Overlay native P00.2 giữ search/filter/navigation, keyboard và các states. Bỏ hướng dẫn lặp ở default/footer, giữ status cần thiết cho loading/results/empty/error và aria-live. Placeholder A được làm tối sau review contrast. Animation hover nhẹ, reduced motion tắt transition.

## Reuse Audit

Đã kiểm source/helper/data/asset/manifest và công cụ có sẵn. Chọn tiếp tục HTML/CSS/native dialog, local asset, Playwright Core1.62 + Chromium151 đã hoạt động. Không thêm framework/dependency lớn, font loader hoặc backend. Font lấy public official, lưu OFL/provenance; không cài vào hệ điều hành.

Tham khảo [UI UX guidance P00.2](PHASE002_DESIGN_GUIDANCE.md) source-only và review độc lập; skill chưa cài/chạy generator. Ponytail vẫn để sau. Có lane font/license và lane review read-only theo yêu cầu làm nhiều lane; không sửa AGENTS/config/MCP. B/C source và prototype P00 giữ nguyên SHA-256 so với trước task.

## Validation thực tế

| Kiểm tra | Kết quả / bằng chứng |
| --- | --- |
| Browser thật Chromium151.0.7922.34 trên Windows | **PASS**, headless; 45 luồng +23 riêng P00.3 =68 checks |
| Desktop1440 / tablet768 / mobile390 | **PASS** Home/Explore/Detail/search, không tràn ngang/ảnh vỡ |
| Hero và ảnh | **PASS** section bắt đầu x0/rộng bằng viewport, inner≤1240px, H1 hai dòng, desktop/phone đúng tỷ lệ |
| Font thực | **PASS** hai request local200, FontFace loaded; CDP xác nhận Noto Sans custom font và glyph tiếng Việt tại400/500/600/700 |
| Font fallback | **PASS** chặn WOFF2 có chủ đích ở1440/390, CDP xác nhận Segoe UI, chữ còn đọc được, hero hai dòng, không overflow |
| Search/keyboard | **PASS** focus/click, modal Tab/Shift+Tab, Escape/restore, Enter/full search, stale query, loading/empty/error/retry;390×480 cuộn nội bộ |
| Navigation/filter/cards | **PASS** card Enter→Detail, official CTA/source, mobile menu/Escape, facets/grid-list/sort/load-more |
| Attribution | **PASS** Detail/credits có MIT/Apache/CC BY, derivative note, Noto/OFL; manifest giữ hash |
| Console/pageerror | **PASS**,0 ở luồng bình thường; font block là simulation riêng, không đánh đồng với lỗi runtime |
| File:// | **PASS** font local, icon, search→LocalSend |
| Logic/static regression | **PASS** `node prototype-p001/verify.mjs`:19 nhóm/63 template; không thay browser QA |
| Screenshot | **PASS**29 PNG:6 trước sửa,20 sau sửa,3 fallback/viewport thấp; gallery và JSON liên kết bên trên |
| Công cụ review | **PASS bổ sung** gallery chọn viewport/toàn trang, link/ảnh/overflow và review iframe ở1440/390; [log](../qa/p003/review-checks.json) |
| Physical mobile/software keyboard/AT, Safari/Firefox | **SKIP**, chưa có phiên kiểm thực;390×480 chỉ proxy chiều cao thấp |
| UI acceptance | **OPEN**, chờ chủ dự án; browser PASS không thay nghiệm thu thiết kế |
| P01/runtime/backend/cloud/deploy | **SKIP theo scope**, chưa bắt đầu |

Probe QA đầu thiếu CSS.enable; assertion MIME ban đầu đòi font/woff2 trong khi Python http.server trên Windows này trả application/octet-stream. Đã sửa harness theo response thực và kiểm CDP/glyph thay vì suy từ MIME, chạy lại PASS. Nguồn upstream trả font/woff2; local Chromium vẫn decode/render WOFF2. Khi được giao P01 cần kiểm MIME/font trên runtime đích, chưa coi stack ổn định từ QA prototype. Không có lỗi browser còn mở đã biết trong phạm vi đã kiểm; không gọi đây là full accessibility/cross-browser audit.

Lệnh đã chạy từ root workspace, dùng thư viện dev đã có, không copy source ứng dụng từ repo kia:

```powershell
python -m http.server 4175 --bind 127.0.0.1 --directory prototype-p001
node tools/qa-p002.cjs D:\Workspace\CloneWebsite\KatTattoo\node_modules\playwright-core http://127.0.0.1:4175/index.html qa/p003/after P00.3
node tools/qa-p003.cjs D:\Workspace\CloneWebsite\KatTattoo\node_modules\playwright-core
node prototype-p001/verify.mjs
```

Server loopback và browser đã dừng sau QA. Tập before được chụp từ A P00.2 thực tế **trước khi sửa**, không tái tạo bằng hình giả hoặc ghi đè screenshot P00.2.

## File thay đổi

| Nhóm | File |
| --- | --- |
| A UI | `prototype-p001/concepts/a.js`, `concepts/a.css` |
| Shell/helper/credits | `prototype-p001/index.html`, `helpers.js`, `app.js` — thay đổi có điều kiện A; dữ liệu và B/C composition không sửa |
| Search | `prototype-p001/search.js`, `search.css` — giảm copy, typography; giữ logic modal P00.2 |
| Review | `prototype-p001/review.html` — nhãn P00.3 và link trước/sau; review.js/css không sửa |
| Asset | `prototype-p001/assets/excalidraw-responsive.svg`, `assets/manifest.json`; `assets/fonts/` gồm2 WOFF2, CSS local, SOURCE.css, OFL, manifest |
| QA | `tools/qa-p002.cjs` thêm output/phase args, giới hạn card2–4; `tools/qa-p003.cjs`; `qa/p003/` gallery, JSON, source hashes,29 PNG |
| Tài liệu | `docs/DESIGN_SYSTEM.md`, `docs/DECISIONS.md`, `docs/PHASE003_FONT_ASSETS.md`, báo cáo này; `README.md`, `PROJECT.md`, `SETUP.md`, `ROADMAP.md`, `TASKS.md` |

Prototype P00 và B/C source không sửa. Không tạo package/backend/database/auth/Gemini/cloud resource, không cài skill/MCP/dependency hệ thống, không deploy. Thư mục không có Git repository nên không branch/commit/push, không tự git init.

**P00.3 READY FOR REVIEW. Dừng chờ chủ dự án nghiệm thu giao diện; P01 chỉ bắt đầu bằng lệnh riêng.**
