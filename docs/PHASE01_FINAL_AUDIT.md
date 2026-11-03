# P01 Final Audit & P02 Preparation

> Cập nhật04/11: A1/A2/A3 đã sửa và regression PASS local/Preview; P01 READY FOR REVIEW. Giữ nguyên phát hiện lịch sử bên dưới; xem [P01 P1 fixes](PHASE01_P1_FIXES.md). Đề xuất P02 vẫn chưa triển khai, UI/P01 chưa được người dùng nghiệm thu.

**READY FOR REVIEW · 03/11/2026.** Chỉ audit và đề xuất; P02 **NOT STARTED**, UI chưa được chủ dự án nghiệm thu. Không sửa app/UI, cloud/D1/CI, không commit/push/deploy. Retry `main` là công việc riêng, không được thao tác hoặc suy kết quả từ audit này.

Đích: [Preview develop](https://develop-digital-resource-hub-staging.nguyenducbang-uit.workers.dev). Source local `e3dcb37`; remote develop cùng SHA, main `31d3053` tại lần đọc. Reuse Playwright/Chromium có sẵn, native CDP/PerformanceObserver, npm audit và manifests; không thêm dependency/MCP/skill. Skill web-perf hướng dẫn đo; ba lane chỉ đọc source, nguồn/license và roadmap.

[Scope verification](../qa/p01/final-audit/scope-verification.json) xác nhận source/config không diff và hai remote refs không đổi; bằng chứng/report còn ở local, chưa stage hoặc commit.

Cập nhật **tách riêng** trong lúc audit: chủ dự án gửi [log main Ready43s](../qa/p01/build-main-noop-success.txt), kết thúc16:01:15.010UTC; hai no-op commands **PASS**, không upload/migration/deployment, Dashboard không active deployment. Đây là bằng chứng user cung cấp, không phải thao tác retry/cloud của audit. UUID/SHA riêng dòng xanh chưa hiện; dòng Failed mới hơn chưa có log để quy nguyên nhân/commit. Các tài liệu trạng thái được cập nhật local theo bằng chứng này; không đổi cấu hình.

## Kết quả có bằng chứng

| Phần | Kết quả | Bằng chứng/giới hạn |
| --- | --- | --- |
| Home/Explore/Detail/Search, navigation/filter/pagination, keyboard/Escape/focus, loading/empty/retry | **PASS 45/45** lượt mới ở1440/768/390,20PNG | [Browser journeys](../qa/p01/final-audit/journeys/results.json). Error503/delay được QA chặn request tại browser, không gây lỗi D1 thật |
| Home→Explore; Search→Detail→website chính thức; Filter→Detail | **PASS** thao tác Chromium thật | [Extended results](../qa/p01/final-audit/extended-results.json); đã click và mở LocalSend chính thức |
| Input đặc biệt | **PASS** 7 mẫu: trắng, tiếng Việt NFC/NFD, SQL-like, HTML/XSS-like, ký tự/emoji,161 ký tự | Không alert/exception; API161 ký tự trả400, Explore giới hạn160 ký tự; không coi đây là pentest đầy đủ |
| Link/ảnh/SEO | **PASS trong phạm vi kiểm** | [36 URL nội bộ](../qa/p01/final-audit/internal-link-crawl.json), [13 URL chính thức HTTP200](../qa/p01/final-audit/link-and-exposure-checks.json);20 route gồm13 Detail không ảnh hỏng/thiếu alt. Ba trang mẫu có title/description riêng,1H1/1main; robots/noindex và sitemap hoạt động |
| Font/a11y cơ bản | **PASS có giới hạn** | Noto Sans được CDP xác nhận thực sự render; chặn WOFF2 ở browser dùng Segoe UI; skip link đưa focus đến main, focus outline hiện, không interactive AX node vô danh trong Home mẫu: [kết quả](../qa/p01/final-audit/a11y-extra.json). Có lỗi contrast riêng bên dưới |
| Asset/data/dependency | **PASS** | [14 manifest entries + OFL hash](../qa/p01/final-audit/source-checks.json);13 resource/7 type/17 source, không rating giả. [npm audit:0 advisory đã biết](../qa/p01/final-audit/npm-audit.json); không thấy dependency trực tiếp đủ bằng chứng để gỡ |
| Lộ dữ liệu | **PASS kiểm tra cơ bản** | Bảy đường dẫn nhạy cảm/config trả404; không có secret/cache/auth file tracked trong kiểm tên file. Source dùng SQL bind, DOM textContent, lỗi API không trả exception nội bộ. Không đọc nội dung credential, không bảo đảm an ninh tuyệt đối |

Canonical hiện **không sinh** vì chưa có Astro.site/domain chính thức; phù hợp staging noindex. Cấu hình canonical/domain/sitemap production là gate release sau này, không sửa trong audit.

Nguồn/license được đối chiếu có giới hạn: [catalog/provenance](PHASE01_CATALOG.md), [Detail](https://develop-digital-resource-hub-staging.nguyenducbang-uit.workers.dev/resources/localsend) và [credits](https://develop-digital-resource-hub-staging.nguyenducbang-uit.workers.dev/credits) giữ attribution. Godot phân biệt [MIT của engine](https://godotengine.org/license/) với [nguồn press/asset](https://godotengine.org/press/); không gán license source cho mọi nội dung/dịch vụ. Metadata chưa xác minh vẫn null/[] hoặc ẩn; không phát hiện claim sai trong mẫu nguồn chính thức đã đọc.

## Vấn đề đã xác nhận, chưa sửa

Không phát hiện P0 trong phạm vi P01 đã kiểm. Ba việc **P1** nên xử lý trước lần nghiệm thu tiếp theo khi được giao sửa:

| ID | Vấn đề và cách tái hiện | Đề xuất nhỏ nhất |
| --- | --- | --- |
| A1 | `/explore?type=learning_resource` → tìm `file`: overlay gợi ý LocalSend; Enter giữ type và trả0 kết quả. [Overlay](../qa/p01/final-audit/search-filter-overlay-1440.png), [Results](../qa/p01/final-audit/search-filter-results-1440.png). [Fetch chỉ q](../src/scripts/interactions.ts#L76), full URL giữ filters ởL25–28 | Chốt search toàn thư viện hay trong bộ lọc; dùng cùng phạm vi ở gợi ý và kết quả. Không thêm search service |
| A2 | Caption/link “Nguồn ảnh & giấy phép” của LocalSend có màu `#687283` trên `#f0f4f8`,14px: **4,395:1** ở cả3 widths | Tăng contrast của chữ hiện có, giữ attribution. [W3C yêu cầu4,5:1 cho chữ thường](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html); phép đo có trong extended results, không phải chứng nhận WCAG toàn site |
| A3 | Hero chưa giữ kích thước ảnh trước tải: `.a-feature-media` cao24→425,7px, phần dưới dịch19,7px; observed load-shift có mẫu≈0,102 | Đặt intrinsic width/height hoặc aspect-ratio đúng asset; giữ nguyên layout/ảnh/tỷ lệ đã chọn. [Nguồn img](../src/pages/index.astro#L23), [culprit rects](../qa/p01/final-audit/layout-shifts.json). Đã tái hiện không throttle và kiểm thêm bằng delay800ms có nhãn |

## Nhận xét UI/UX và quyết định cần chủ dự án

Đánh giá từ ảnh render thật: Home gọn, hero full-width có điểm nhấn, một câu định vị, hai lựa chọn biên tập; header/footer đơn giản. Ảnh desktop/phone giữ tỷ lệ thực; không thấy ảnh kéo giãn. Không cần đổi concept hoặc nhồi thêm section/metadata. [Home desktop](../qa/p01/final-audit/journeys/home-1440.png), [tablet](../qa/p01/final-audit/journeys/home-768.png), [mobile](../qa/p01/final-audit/journeys/home-390.png).

Các lựa chọn **P2**, chưa phải UI được duyệt:

- **Độ đọc:** body16/nav15 đúng mục tiêu; Explore card desktop13px, CTA12px, list mobile12px hơi nhỏ cho nội dung chính. Đề xuất thử14–16px và so mật độ trước khi chốt; không gọi font nhỏ tự nó là vi phạm WCAG. [Mobile list](../qa/p01/final-audit/explore-list-390.png).
- **Vùng bấm:** Home card click toàn khối; Explore chỉ tên/CTA có link, thân/icon card không chuyển trang dù cả card có hover. Chủ dự án chọn toàn card clickable hay giữ CTA và giảm tín hiệu hover; giữ keyboard/name rõ ràng.
- **Nhận diện/metadata:**10/13 mục dùng icon fallback, chưa phải icon thương hiệu; bổ sung dần icon có quyền và platforms đã kiểm cho Godot/LibreOffice/OpenTTD. Unknown hiện ẩn đúng, không bịa metadata để lấp trống. Manifest asset nên thêm permalink/revision upstream bên cạnh hash.
- **Docs:** SETUP còn ghi21 tests thay vì22; dòng trạng thái đầu ROADMAP còn cũ. Chỉ ghi nhận, không đổi roadmap hoặc quyết định phase trong audit.

## Hiệu năng: lab, không phải nghiệm thu Core Web Vitals

| Home,3 mẫu mỗi profile | TTFB median | LCP median/range | Dịch chuyển quan sát trong cửa sổ tải |
| --- | --- | --- | --- |
| Desktop1440, không throttle |278ms|688ms /684–728ms|0,00017–0,10180|
| Viewport390,CPU4x,1,6Mbps down/750Kbps up/150ms latency |304ms|1468ms /1324–1472ms|≈0,00180|

Browser cache lạnh; edge cache không kiểm soát. Đây là mẫu máy lab, không phải p75 field/INP/Lighthouse score; tổng layout-shift quan sát không thay phép đo CLS đầy đủ ngoài thực tế. LCP lab thuận lợi, riêng ổn định Hero cần cải thiện. [Web Vitals giải thích đánh giá theo p75 người dùng](https://web.dev/articles/vitals). [Trace desktop](../qa/p01/final-audit/desktop-trace.json.gz), [trace mobile lab](../qa/p01/final-audit/mobile-lab-trace.json.gz); số liệu/network trong extended results.

JS client chỉ≈3,7KiB transfer trong mẫu. Desktop tải quan sát≈796KiB; Godot JPEG588.954bytes chiếm phần lớn. **P2:** thử biến thể WebP/AVIF cho ảnh này nếu được giao, giữ chất lượng/license; chưa có số tiết kiệm đo được nên không khẳng định cải thiện LCP. Không đề xuất thêm framework/cache/search infrastructure.

## P02: kế hoạch đề xuất, chưa triển khai

**Gate P0 trước P02 — chốt nguồn biên tập chính.** CI đang chạy seed mỗi deploy ([preview.mjs](../scripts/preview.mjs#L86)); importer upsert resource và tạo lại relations/sources ([catalog.mjs](../scripts/catalog.mjs#L22)). Admin web ghi D1 có thể bị JSON ghi đè ở deploy sau. Đây là ràng buộc khi mở P02, không phải lỗi của P01 quản trị bằng Git/JSON.

| Ưu tiên | Phạm vi đề xuất |
| --- | --- |
| 1.Cần thiết | **P02-A nhỏ nhất:** Git/JSON vẫn là nguồn chính; reuse local validator/importer. URL GitHub chính thức→metadata candidate→draft local→người biên tập review diff→catalog. URL khác nhập thủ công trước; không tự publish, không fetch installer/chạy README, không public admin endpoint |
| 2.Cải thiện trải nghiệm | Report trùng/field đổi/missing evidence rõ; bổ sung nguồn/platform/icon hợp lệ; kiểm link theo lệnh thủ công có giới hạn; xử lý A1–A3 theo lệnh sửa riêng |
| 3.Hoãn | Admin web lớn, member login/ratings(P03), AI thật/cron discovery(P04), community submissions(P05), upload/R2/search service. Không tạo provider abstraction dự phòng |

P02-A là **đề xuất điều chỉnh scope**, chưa thay roadmap đang có admin web/auth. Chủ dự án cần chọn Git/CLI trước hay admin web ngay. Nếu web ngay: chốt Git hay D1 là nguồn chỉnh sửa chính và auth admin; member auth là việc khác, Google OAuth vẫn PROPOSED/Q-04 OPEN. Roadmap đang cho AI tùy chọn ởP02 nhưng có AI phaseP04; đề xuất hoãn AI thật đếnP04, chờ chủ dự án chốt.

Acceptance P02-A đề xuất: draft có nguồn/thời điểm, unknown giữ null/[]; duplicate/timeout/404/quota không ghi đè catalog; giữ stableID/createdAt; draft không lọt trang/API công khai; publish sau review. Fetch tương lai cần giới hạn nguồn/redirect/DNS/timeout/size, không coi validator URL hiện tại là SSRF guard. Không triển khai các kiểm soát đó trong audit này.

## SKIP và điểm dừng

Physical iOS/Android, software keyboard, screen reader, Safari/Firefox, WCAG đầy đủ, field INP/p75/CrUX, Lighthouse score, D1 outage thật và trải nghiệm toàn bộ13 sản phẩm bên ngoài **SKIP**. HTTP200 không thay kiểm sản phẩm. Retry main **ngoài phạm vi**, không đổi CI để làm xanh. Ba P1 được ghi nhận chờ lệnh sửa; UI và phạm vi P02 vẫn chờ chủ dự án quyết định. Dừng ở **READY FOR REVIEW**, không commit/push/deploy.
