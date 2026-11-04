# FreeResources — bản đồ kiến trúc

05/11/2026 · **READY FOR REVIEW** cho nội dung tài liệu. P01 và P02 local vẫn chờ chủ dự án nghiệm thu. Chuẩn hóa này chỉ đổi docs/tooling Archify, không logic ứng dụng/cloud/CI, không push/deploy.

Mở **[index.html](index.html)** bằng Chrome (double-click hoặc Ctrl+O). Không cần server, npm, Archify hoặc tài khoản để xem. Mỗi sơ đồ là một HTML tự chứa; giữ index và bốn HTML cùng thư mục. Metadata file/dòng nằm sẵn trong HTML;01/02/04 có link GitHub cần mạng,03 giữ chứng cứ path/dòng local vì commit chưa push. Viewer không nhúng toàn bộ code hoặc có code card offline.

| Sơ đồ | Dùng khi muốn hiểu | Nguồn cập nhật |
| --- | --- | --- |
| [01 · System](01-system.html) | Frontend Astro render trên Worker; module SQL, API, D1, static assets và website bên ngoài có trách nhiệm gì | [JSON](sources/01-system.architecture.json) |
| [02 · CI/CD](02-cicd.html) | Local → checks/review → develop → guarded staging Preview; main no-op; production chưa có deploy path | [JSON](sources/02-cicd.workflow.json) |
| [03 · Data](03-data.html) | Smart Import GitHub/website → nháp/rules → AI thủ công tùy chọn → admin review/export JSON → SQL/D1 → website | [JSON](sources/03-data.dataflow.json) |
| [04 · Search](04-search.html) | Từ overlay tới FTS5/filter, Results và Detail; empty/error và giới hạn query | [JSON](sources/04-search.sequence.json) |

Click thành phần để mở focus, quan hệ và nguồn code. Dùng `?` cho hướng dẫn, `+`/`-` để zoom, `0` đặt lại, kéo canvas khi zoom; `T` đổi nền, `E` mở menu Xuất. PNG/SVG tải về máy. Chuyển động chỉ minh họa đường đã vẽ; không phải traffic hay thời gian đo. Nội dung và các điều khiển phổ biến đã Việt hóa; các công cụ nâng cao còn fallback tiếng Anh (68/486 chuỗi viewer được override, không gọi đây là bản dịch đầy đủ).

## Nguồn sự thật và trạng thái

Nguồn có path/dòng trên từng semantic node; renderer kiểm byte của Git revision. **01/02/04** pin runtime P01 `a84c55ac84a463585cc11940036e43ea31da9866`, repo `ducbang02/FreeResources`: public runtime/CI/Search không đổi. **03** pin P02 local `73a6cb9c9b57cdc34efec82002e5232ee26ea5dd`, link_mode local-only vì chưa push; vẫn có metadata path/dòng được kiểm Git local, không hứa GitHub source URL đã truy cập được. Đây là source snapshot, không phải dashboard live hoặc lần kiểm cloud mới.

- **ĐÃ CÓ LOCAL:** P02 CLI URL/identity/metadata/draft/rules/review/export; GitHub/OBS public import và local native D1/browser đã kiểm. P01 runtime/CI/Search hiện có.
- **CODE / MOCK PASS, LIVE CHƯA KIỂM:** Gemini quick/deep optional đã implement, chỉ gọi thủ công khi đủ gates. Chưa có key/project/model/free tier xác nhận để gọi thật; không vẽ AI như service mặc định đang chạy.
- **DỰ KIẾN:** admin web/community/ratings/facets public mới và production. Giữ ở proposal/roadmap/thẻ ghi chú; không vẽ service hoặc đường main→production chưa có. Không có feature mới được triển khai trong lượt chuẩn hóa docs này.

`docs/ARCHITECTURE.md` còn chứa thiết kế dài hạn (auth, bảng users/ratings, các folder domain/features). Không đưa chúng lên bản đồ như runtime hiện có. CLI mới có thể fetch metadata nhập liệu, nhưng export chỉ ghi JSON; CLI validate/generate sinh SQL offline. Wrangler mới ghi D1 theo lệnh local hoặc CI được phép. Browser đọc assets/API/HTML, không đọc DB trực tiếp. Public Search/Detail không fetch nguồn hoặc gọi Gemini mỗi lượt xem.

## Quy tắc tổ chức: bốn câu hỏi, không phải mỗi phase một sơ đồ

Giữ đúng01 System /02 CI/CD /03 Data /04 Search. Feature hoặc phase mới cập nhật sơ đồ có trách nhiệm tương ứng; Smart Import/P02 thuộc **Data**, không sinh sơ đồ cấp cao thứ năm. Chỉ đề xuất sơ đồ mới khi subsystem độc lập hoặc luồng đủ phức tạp cần tách, nêu lý do và chờ review trước khi thêm registry/index.

Proposal P02 giữ trong [PHASE02_DESIGN](../PHASE02_DESIGN.md) và [ROADMAP](../../ROADMAP.md); chức năng local đã triển khai xem [PHASE02_REPORT](../PHASE02_REPORT.md). Sơ đồ P02 riêng cũ đã hợp nhất vào03, HTML/JSON dư và lệnh tái tạo riêng đã loại bỏ sau kiểm tham chiếu. Historical QA receipts chỉ ở ignored qa, không là nguồn sinh sơ đồ.

## Archify đã cài ở đâu?

**`.agents/skills/archify`**, project-local, nằm trong `.gitignore` sẵn có. Skill được Codex nhận ở lượt tiếp theo; lượt hiện tại đã đọc và dùng trực tiếp SKILL/CLI. Không cài global/MCP, không thay package.json/lockfile hay CI/CD. Snapshot tool pin tại [archify.lock.json](archify.lock.json): package3.2.0 từ upstream commit `a4065941f12be7967436261d9934784e381d423c`, không mặc định đồng nhất với archive release v3.2.0 cũ.

Node ≥18, máy này24.18.0/npm12.2.0. Runtime renderer/validator/browser-check dùng Node standard library và Chrome; không chạy npm install trong skill. `ajv`/`simple-icons` là devDependencies upstream phục vụ phát triển tool, không được thêm/cài vào app. HTML dùng viewer/font được nhúng sẵn. Máy chỉ xem HTML không cần Node.

## Tái tạo hoặc cập nhật

1. Khi thay route/module, schema, importer, filter/search hoặc CI commands: đọc lại source có liên quan, phân biệt code thật với đề xuất.
2. Cập nhật JSON trong `sources/`; nếu đổi code, pin commit mới đã chứa code và kiểm lại từng source range. Không gán code chưa commit cho một revision cũ. Không chỉ đổi revision để làm mất cảnh báo.
3. Render và kiểm chứng bằng helper local:

```powershell
node tools/architecture-maps.mjs       # cả bốn
node tools/architecture-maps.mjs 04    # chỉ Search
```

Helper có **registry bốn tên/type/output chính xác**, từ chối JSON sơ đồ cấp cao ngoài registry thay vì tự khám phá theo phase. Nó xác minh SHA-256 của SKILL/CLI so với lock, gọi `finalize --quality showcase --repo-root` và ghi receipts dưới `qa/architecture-maps/` (ignored). Mỗi lượt có thư mục evidence riêng. Nó đặt `ARCHIFY_UPDATE_CHECK_DISABLED=1` cho child processes: không kiểm cập nhật hoặc ghi reminder state. Safe-directory Git chỉ đặt trong child environment, không sửa global Git config. Helper không gọi cloud, build app hay install/update tự động.

4. Kiểm tra HTML trong browser: nội dung/nguồn, thao tác focus/zoom/pan/export, keyboard, console, offline và viewport nhỏ. Chỉ nhận claim đã kiểm; automated PASS không thay thế review ý nghĩa sơ đồ.
5. Review diff rồi mới commit/push theo lệnh của chủ dự án. HTML/JSON là tài liệu bàn giao nên giữ trong Git; raw receipts, ảnh test và downloads chỉ local. `.delivery.json` cạnh HTML được ignore; clone mới cần render để tạo provenance trước khi chạy lại strict checker, nhưng mở HTML không cần receipts.

Nếu clone mới chưa có skill, từ workspace dùng helper Skill Installer của Codex đã có trên máy, không dùng installer global của Archify:

```powershell
$archifyInstaller = Join-Path $env:USERPROFILE '.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py'
python $archifyInstaller --repo tt-a1i/archify --path archify --ref a4065941f12be7967436261d9934784e381d423c --dest "$((Get-Location).Path)/.agents/skills" --method download
$env:ARCHIFY_UPDATE_CHECK_DISABLED = '1'
node .agents/skills/archify/bin/archify.mjs doctor
node tools/architecture-maps.mjs
```

Installer tải source chính thức về local, không thực thi lifecycle script của package. Đích tồn tại thì installer dừng: giữ file đang có và review xung đột, không xóa/ghi đè bừa. Nếu máy không có helper của Codex, nhờ agent dùng hướng dẫn upstream sau khi audit đúng snapshot; không tự tải/chạy thêm installer ngẫu nhiên. Chrome/Edge được Archify tìm native trên Windows; có thể đặt `ARCHIFY_CHROME` thành đường dẫn browser đã cài khi cần.

## Chi phí, quyền và giới hạn

Không thêm phí Archify/API/cloud; không upload source, telemetry hoặc gọi AI từ HTML. Chi phí phiên Codex vẫn theo gói đang dùng. Chỉ cấp quyền đọc source/Git đã có, ghi tài liệu/QA local và mở browser test. Công cụ update/reminder upstream đã tắt trong mọi lệnh được dùng cho task này; không tự gọi share/hosting.

Viewer/software snapshot là **Apache-2.0**, có historical MIT grants và font OFL theo NOTICE; giữ [license/notices](licenses/Archify-LICENSE.txt), [NOTICE](licenses/Archify-NOTICE.txt) và third-party notices cạnh các HTML. Không dùng brand marks bên thứ ba trong diagram; license không cấp quyền logo/thương hiệu nói chung. [Audit và validation](AUDIT.md) ghi nguồn tham khảo, kết quả thực tế và những phần SKIP.
