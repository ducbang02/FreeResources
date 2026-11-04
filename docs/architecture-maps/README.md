# FreeResources — bản đồ kiến trúc

04/11/2026 · **READY FOR REVIEW**, chủ dự án đã yêu cầu commit checkpoint Archify local; nội dung vẫn chờ review trước push. P01 vẫn READY FOR REVIEW; P02 NOT STARTED.

Mở **[index.html](index.html)** bằng Chrome (double-click hoặc Ctrl+O). Không cần server, npm, Archify hoặc tài khoản để xem. Mỗi sơ đồ là một HTML tự chứa; giữ index và bốn HTML cùng thư mục để dùng menu. Metadata file/dòng nằm sẵn trong HTML; xem nội dung source qua link GitHub cần mạng. Viewer này không nhúng toàn bộ code hoặc mở code card offline.

| Sơ đồ | Dùng khi muốn hiểu | Nguồn cập nhật |
| --- | --- | --- |
| [01 · System](01-system.html) | Frontend Astro render trên Worker; module SQL, API, D1, static assets và website bên ngoài có trách nhiệm gì | [JSON](sources/01-system.architecture.json) |
| [02 · CI/CD](02-cicd.html) | Local → checks/review → develop → guarded staging Preview; main no-op; production chưa có deploy path | [JSON](sources/02-cicd.workflow.json) |
| [03 · Data](03-data.html) | Nguồn → biên tập JSON → validate/generate SQL → migrate/seed → D1 → trang web; P02-A còn là đề xuất | [JSON](sources/03-data.dataflow.json) |
| [04 · Search](04-search.html) | Từ overlay tới FTS5/filter, Results và Detail; empty/error và giới hạn query | [JSON](sources/04-search.sequence.json) |

Click thành phần để mở focus, quan hệ và nguồn code. Dùng `?` cho hướng dẫn, `+`/`-` để zoom, `0` đặt lại, kéo canvas khi zoom; `T` đổi nền, `E` mở menu Xuất. PNG/SVG tải về máy. Chuyển động chỉ minh họa đường đã vẽ; không phải traffic hay thời gian đo. Nội dung và các điều khiển phổ biến đã Việt hóa; các công cụ nâng cao còn fallback tiếng Anh (68/486 chuỗi viewer được override, không gọi đây là bản dịch đầy đủ).

## Nguồn sự thật và trạng thái

Sơ đồ pin code tại **`a84c55ac84a463585cc11940036e43ea31da9866`**, repo `ducbang02/FreeResources`. Nguồn có path/dòng trên từng semantic node; renderer kiểm byte của Git revision, không tin suy đoán từ tên module. Thẻ ghi chú giải thích điều kiện trên các luồng. Đây là snapshot đọc source và bằng chứng P01 đã ghi, không phải lần kiểm live hạ tầng mới.

- **ĐÃ CÓ:** P01 code đã triển khai, đang chờ nghiệm thu. Astro SSR, overlay/API/query, D1/FTS5, CLI, migration/seed và staging CI hiện có.
- **ĐANG PHÁT TRIỂN:** không có tính năng sản phẩm mới được mở trong snapshot này; task hiện tại chỉ tạo tài liệu.
- **DỰ KIẾN:** production và P02-A trong các sơ đồ là đề xuất chưa triển khai. Không vẽ đường main→production vì chưa có deploy path; không nối nháp P02 vào DB vì nguồn biên tập chính chưa được quyết định.

`docs/ARCHITECTURE.md` còn chứa thiết kế dài hạn (auth, bảng users/ratings, AI, các folder domain/features). Các phần đó không tồn tại trong runtime P01 và không được đưa vào bản đồ như thành phần đang chạy. CLI chỉ sinh SQL offline; Wrangler mới là bên ghi D1. Browser đọc assets/API/HTML, không đọc DB trực tiếp. Website nguồn chỉ được mở qua link, không fetch metadata mỗi lượt xem.

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

Helper xác minh SHA-256 của SKILL/CLI so với lock, gọi `finalize --quality showcase --repo-root` và ghi receipts dưới `qa/architecture-maps/` (ignored). Mỗi lượt có thư mục evidence riêng. Nó đặt `ARCHIFY_UPDATE_CHECK_DISABLED=1` cho child processes: không kiểm cập nhật hoặc ghi reminder state. Safe-directory Git chỉ đặt trong child environment, không sửa global Git config. Helper không gọi cloud, build app hay install/update tự động.

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
