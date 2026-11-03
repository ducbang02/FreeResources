# DECISIONS — Sổ quyết định

> Cập nhật 03/11/2026. **AGREED** = đã nói rõ trong trao đổi; **PROPOSED** = trợ lý gợi ý, chưa được khóa; **OPEN** = cần An chọn; **VERIFIED** = đã kiểm thử bằng code/triển khai (hiện chưa có mục nào).

| ID | Trạng thái | Quyết định / giả định | Lý do hoặc ghi chú |
| --- | --- | --- | --- |
| D-001 | AGREED | Cổng nội dung tài nguyên số tiếng Việt: ứng dụng, repo, học tập, công cụ, game, tài nguyên Windows | Phục vụ học sinh, sinh viên, giáo viên, văn phòng, công nghệ |
| D-002 | AGREED | Admin thêm thủ công và nhập link để AI tạo gợi ý bản nháp | Chủ động chất lượng catalog |
| D-003 | AGREED | Người dùng có thể gửi tài nguyên và chấm/đánh giá; nội dung hữu ích có thể lên top | Tạo cộng đồng và nội dung phong phú |
| D-004 | AGREED | Trước mắt ưu tiên Cloudflare Free + database free; có thể dùng VPS về sau | Giảm chi phí ban đầu |
| D-005 | AGREED | Gemini / Google AI Studio là AI đầu tiên nhưng kiến trúc phải thêm nhiều provider khác | Tránh khóa vào một dịch vụ |
| D-006 | AGREED | Apple-inspired minimalist editorial; typography mạnh, trung tính, một màu nhấn, search nổi bật, mobile-first, reduced motion | A được chọn làm hướng theo D-017; UI hiện tại và thương hiệu chưa nghiệm thu/chốt, không sao chép Apple |
| D-007 | AGREED | P01 public catalog trước, ưu tiên Astro + TypeScript + Cloudflare Workers/D1 | Chủ dự án xác nhận 03/11/2026; chốt định hướng, chưa VERIFIED; phải kiểm runtime thật ở P01 và chờ lệnh bắt đầu |
| D-008 | PROPOSED | Một codebase modular monolith; domain không phụ thuộc SDK AI/SQL | Có đường nâng cấp backend/VPS |
| D-009 | AGREED | Admin duyệt mọi bản nháp AI trước khi public; policy chi tiết với đóng góp cộng đồng còn PROPOSED | Yêu cầu Phase 00 ngày 03/11/2026; AI chỉ phân tích và tạo draft |
| D-010 | PROPOSED | Tài khoản Google OAuth trước, provider đăng nhập khác khi cần | Giảm ma sát; phải xác minh tích hợp và chi phí |
| D-011 | PROPOSED | Một tài khoản chỉ có một rating cho một tài nguyên, được sửa; bảng xếp hạng dùng số phiếu + chất lượng + thời gian | Giảm sự thiên lệch 5 sao từ rất ít phiếu |
| D-012 | PROPOSED | Ban đầu chỉ lưu metadata/link, chưa cho người dùng upload file tùy ý | Tránh rủi ro dung lượng, malware, bản quyền |
| D-013 | PROPOSED | Giới thiệu game cũ và Windows qua nguồn chính thống/nguồn được phép, có review thủ công | Tránh xem nội dung cũ là mặc nhiên tự do phát hành |
| D-014 | AGREED | Chưa cài Ponytail; tiếp tục Reuse Ladder và Ponytail Principle trong AGENTS.md | Chủ dự án xác nhận 03/11/2026; chưa thay đổi cấu hình agent/plugin |
| D-015 | AGREED | Giữ P00 READY FOR REVIEW, P01 NOT STARTED; giữ nguyên prototype A/B và chờ brief thiết kế tiếp | Chủ dự án chưa chấp nhận A hoặc B; chưa cho phép triển khai P01, tạo cloud resource hoặc deploy |
| D-016 | AGREED | Giao P00.1 nghiên cứu UI rồi dựng ba concept mới A Editorial Discovery / B Directory / C Hybrid ở prototype tĩnh | Yêu cầu 03/11/2026; giữ prototype P00 và quyết định kỹ thuật, không backend/cloud/deploy/P01 |
| D-017 | AGREED | Chọn A Editorial Discovery làm hướng chính; chưa nghiệm thu UI A | Brief P00.2 ngày03/11/2026; C chỉ là khuyến nghị cũ, không còn là hướng ưu tiên |
| D-018 | AGREED | Home giới thiệu/truyền cảm hứng; Search preview; Explore catalog; Detail quyết định | Home1 feature/3–4 công cụ, không nhồi taxonomy/thông số; tập trung refinement A, không tạo B/C mới |
| D-019 | AGREED | Audit tooling read-only; hỏi trước global install/config/new permission/cost | P00.2 reuse Context7/Playwright đã có; chưa cài UI UX/Playwright MCP/DevTools MCP; không tool vào runtime production |
| D-020 | AGREED brief; OPEN nghiệm thu | P00.3 giữ A Apple-inspired; hero full-width, headline hai dòng, giảm chữ, tối đa4 lựa chọn, thử Noto Sans Việt, giữ overlay và attribution | Hai card visual được triển khai; 68 browser checks PASS, 29 PNG. READY FOR REVIEW; chưa nghiệm thu, không P01/backend/cloud/deploy |

## Cần An xác nhận trước mốc triển khai tương ứng

| ID | Câu hỏi | Đề xuất mặc định | Quyết định cuối |
| --- | --- | --- | --- |
| Q-01 | Giai đoạn đầu có đăng nhập/đánh giá và đóng góp ngay, hay admin catalog trước? | Public catalog trước; auth, community ratings, submissions hoàn chỉnh và AI thật theo phase sau | AGREED — chủ dự án xác nhận 03/11/2026; chờ lệnh bắt đầu P01 |
| Q-02 | Người dùng gửi link hay có thể upload PDF/file thật? | Chỉ gửi URL + metadata trước | OPEN |
| Q-03 | Mức độ AI tự động: chỉ khi admin bấm, hay cron tự quét GitHub? | Bấm phân tích thủ công trước; tự quét sau khi có kiểm duyệt | OPEN |
| Q-04 | Login: Google trước, email magic link, hay cả hai? | Google trước, tùy yêu cầu người dùng | OPEN |
| Q-05 | Tên thương hiệu, domain, ngôn ngữ thứ hai, thị trường? | Tiếng Việt, đặt tên sau bản mẫu UI | OPEN |
| Q-06 | DB D1 hay PostgreSQL managed như Supabase/Neon? | Ưu tiên D1 với Workers cho hướng khởi đầu; kiểm chứng runtime ở P01 | AGREED về định hướng — chưa xác minh tích hợp, không tự provision |
| Q-07 | UI/UX nào đạt chất lượng để triển khai? | Visual simplification A trong P00.3, xem hero/card/search | AGREED hướng A; **OPEN nghiệm thu UI P00.3**; không tự bắt đầu P01 |
| Q-08 | Khi vượt quota free: dừng tính năng động hay xin nâng gói? | Dừng job AI/import, giữ nội dung tĩnh; không tự phát sinh chi phí | OPEN trước vận hành cloud |

## Kết quả audit Phase 00 — 03/11/2026

- **AGREED:** Phase 00 chỉ nghiên cứu, thiết kế và prototype tĩnh; không deploy, cloud resource, paid API, DNS, production hoặc push remote. Gemini-first và khả năng thêm provider đã chốt; chưa chốt SDK/model.
- **AGREED về định hướng:** P01 public catalog trước với Astro/TypeScript + Workers/D1; auth, ratings, submissions hoàn chỉnh và AI thật ở phase sau. Tool quản lý dữ liệu local và chi tiết implementation vẫn là đề xuất; P01 chưa được giao bắt đầu.
- **VERIFIED (phạm vi hẹp):** thư mục hiện có planning kit, không có `.git`, package manifest, lockfile, source ứng dụng hoặc cấu hình deploy. Không có stack/cloud/auth/AI runtime nào đã được kiểm chứng.
- Q-01/Q-06 đã chốt định hướng; Q-07 chờ review/chọn trong vòng P00.1. Chỉ bắt đầu P01 sau khi chủ dự án chốt UI và gửi lệnh rõ ràng. Q-02–Q-04 chốt trước phase phụ thuộc.
- Bằng chứng nghiên cứu: `PHASE00_TECH_VALIDATION.md`, `PHASE00_REUSE_AUDIT.md`; nghiệm thu và giới hạn trong `PHASE00_REPORT.md`. Tài liệu upstream và Context7 có thể khác snapshot/version; phải pin bộ version tương thích rồi kiểm thử ở P01.

## Nguyên tắc thay đổi quyết định

### P00.3 — tinh giản thị giác, 03/11/2026

Chủ dự án đánh giá A P00.2 tốt hơn nhưng còn nhiều chữ, giao brief P00.3. Đã tinh giản A theo D-020, giữ tài liệu/giấy phép/nguồn ảnh và overlay. Hai card thay bốn để hình lớn và chỉ dùng icon có nguồn; đây là implementation để review, không tự chốt UI. **P00.3 READY FOR REVIEW**, P01 NOT STARTED; kiến trúc D-007 không đổi. 68 browser checks PASS/29 PNG, font/CDP/fallback/ratio/Excalidraw đã kiểm; physical keyboard/AT/cross-engine SKIP. [Bàn giao](PHASE003_REPORT.md). Không global install/config, backend/cloud/deploy.

### P00.2 — hướng A và QA thật,03/11/2026

Chủ dự án đã xem A/B/C và chọn A làm hướng chính, chưa nghiệm thu bản A. P00.2 tinh giản A, search overlay, Explore có pattern directory; không phát triển B/C. **READY FOR REVIEW**, P01 NOT STARTED.45 checks Chromium thật PASS ở1440/768/390,20 screenshot; physical keyboard/AT chưa kiểm. Context7 và local Playwright có sẵn đã test; không install hoặc sửa config mới. Chi tiết `PHASE002_REPORT.md` và `PHASE002_TOOLING_AUDIT.md`. Các ghi SKIP ở P00/P00.1 là lịch sử đúng tại thời điểm đó, không phải tình trạng QA P00.2.

### P00.1 — bàn giao redesign, 03/11/2026

Đã được giao và đã thực hiện vòng nghiên cứu/prototype mới; trạng thái **P00.1 READY FOR REVIEW**. A/B/C có home/discover/detail và khung review1440/768/390, dùng chung fixture/logic nhưng composition khác nhau. Giữ nguyên cả4 file prototype P00. Nghiên cứu/asset/logic-static có bằng chứng tại `PHASE001_REPORT.md`; **browser/mobile/tablet QA thật, console/keyboard thực tế và screenshot vẫn SKIP** vì host unavailable. Chưa concept nào được duyệt. P00 giữ READY FOR REVIEW, P01 NOT STARTED. D-007 và các quyết định kỹ thuật không đổi, chưa runtime-verified; Ponytail chưa cài.

### Phản hồi sau khi xem prototype — 03/11/2026

Chủ dự án ban đầu nghiêng về A, nhưng sau khi xem thực tế nhận xét **quá trống trải, thiếu điểm nhấn thị giác và chưa đạt chất lượng mong muốn**. **A/B P00 chưa được chấp nhận**. Giữ Apple-inspired, cần đổi bố cục/phân cấp/điểm nhấn chứ không chỉ màu/chữ; search/lọc/khám phá nhanh vẫn bắt buộc. Thời điểm phản hồi chỉ ghi nhận và chờ brief; sau đó D-016 giao P00.1 riêng. Browser/mobile QA thật **chưa thực hiện (SKIP)**; người dùng xem A không thay thế QA có hệ thống.

1. Khi chốt, thay `OPEN/PROPOSED` bằng `AGREED`, ghi ngày và bằng chứng (tin nhắn/PR/đường dẫn tài liệu).
2. Nếu thay đổi gây ảnh hưởng đến schema, quyền dữ liệu, chi phí hoặc deploy: dừng để An duyệt.
3. Khi build/test thật, ghi kết quả vào `TASKS.md`; không tự chuyển quyết định thành `VERIFIED` nếu chưa có bằng chứng.

## Nguồn kiểm chứng cần rà lại khi triển khai

- Cloudflare D1 limits: https://developers.cloudflare.com/d1/platform/limits/
- Cloudflare D1 pricing: https://developers.cloudflare.com/d1/platform/pricing/
- Astro Cloudflare: https://docs.astro.build/en/guides/integrations-guide/cloudflare/
- Google Gemini structured output: https://ai.google.dev/gemini-api/docs/structured-output
- GitHub API limits: https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api

Giới hạn và giá dịch vụ có thể thay đổi. Mỗi phase phải rà tài liệu chính thức ngay trước khi tích hợp; không đưa hạn mức 2026 vào code như hằng số vĩnh viễn.
