# P00.2 — Audit skill, MCP và browser tooling

Rà **03/11/2026**, trên Windows. Đây là audit development tooling, **không thêm dependency runtime cho website**. Không cài mới, sửa cấu hình global, clone repo vào source hoặc chạy installer trong lane nghiên cứu này. Kết quả QA UI cuối cùng được ghi trong báo cáo bàn giao P00.2 của root; launch browser thành công không tự chứng minh UI PASS.

## 1. Kết luận và bộ nhỏ nhất

1. **Giữ Context7 hiện có**: resolve/query đã trả kết quả thực trong phiên, không cài một bản thứ hai.
2. **Dùng Playwright local sẵn có cho QA trước**: root đã tìm được playwright-core và browser binary hiện có, mở Chromium headless/about:blank rồi đóng thành công, không install/config/escalation. Không cần cài MCP chỉ để chứng minh screenshot, viewport hoặc keyboard.
3. **UI UX Pro Max**: phù hợp design guidance; đọc source/docs làm tham khảo được ngay. Chưa cài và chưa chạy search.py. Nếu muốn skill tái sử dụng cấp user, chuẩn bị dry-run/phạm vi cụ thể rồi xin phép; không tự thêm bảy skill hoặc --force.
4. **Chrome DevTools MCP để sau**: chỉ có ích riêng khi cần performance trace/CPU/network/debug sâu mà Playwright QA hiện tại không giải quyết. Không cài trùng chức năng browser vào vòng này.

Đây là lựa chọn cho agent/developer, không đổi Astro/TypeScript + Workers/D1, không bootstrap P01, không cho phép paid API/deploy.

## 2. Environment đã kiểm

Các phiên bản/hành vi local dưới đây do root kiểm bằng executable/package metadata và smoke thực; không suy từ README:

| Thành phần | Bằng chứng thực tế | Kết luận giới hạn |
| --- | --- | --- |
| Codex CLI | `codex-cli 0.162.1` | CLI có mặt; không tự thay config |
| VS Code | `1.144.0`, x64; code --version in phiên bản nhưng có log crashpad AccessDenied | Không coi log này là proof VS Code không chạy được; chưa kiểm UI extension live |
| Codex extension | `openai.chatgpt 26.51021.22027`, VS Code engine `^1.96.2` | Phiên bản VS Code đáp ứng engine; không đồng nghĩa mọi plugin/MCP đã hoạt động |
| Node/npm/Python | Node `24.18.0`, npm `12.2.0`, Python `3.13.15` | Phù hợp các engine được đối chiếu bên dưới; chưa test installer CLI mới |
| Chrome / Edge | Chrome `156.0.8078.80`, Edge `156.0.4314.58` | Có executable, không dùng profile đăng nhập của người dùng |
| Browser cache | Có `ms-playwright/chromium-1234` | Có binary, cần launch để kết luận |
| Context7 MCP | resolve/query đã chạy thành công | Hai tool hiện có hoạt động; chưa đọc account/quota hoặc tạo key |
| UI UX skill | Không thấy trong skill catalog, `.agents/skills` và `.codex/skills` đã kiểm | Chưa cài/activate bằng skill loader |
| Playwright/DevTools MCP | Không có tool namespace tương ứng trong phiên | Không gọi là MCP installed/connected; khác với package local |
| CUA/node_repl | CUA host thiếu; import playwright/core trong node_repl gặp lỗi adapter named/default export | Không kết luận Windows/Playwright hỏng chỉ từ wrapper này |
| Local fallback | Shell Node require package hiện có `D:/Workspace/CloneWebsite/KatTattoo/node_modules/playwright-core`, v`1.62.0`, Apache-2.0, Node≥20; launch headless Chromium `151.0.7922.34`, context1440×900/about:blank, đóng PASS | Chỉ reuse package/binary, không copy application source repo kia; smoke không phải UI journey |

VS Code hỗ trợ MCP cho một client không tự chứng minh Codex extension đọc cùng file cấu hình đó. Codex MCP/skill configuration phải đối chiếu official OpenAI documentation theo host thực; root phụ trách phần này. Không đọc/in secrets, cookies, `.env`, `.npmrc` hoặc toàn bộ config chứa credential để audit.

## 3. UI UX Pro Max — skill guidance, không phải browser

Nguồn: [repo/README](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill), [MIT license](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/main/LICENSE), [core skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/main/.claude/skills/ui-ux-pro-max/SKILL.md), [search.py](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/main/src/ui-ux-pro-max/scripts/search.py).

Core cung cấp dữ liệu/guidance tìm kiếm về UI style, typography, UX và stack; search script dùng Python standard library. Không cần API key cho core lookup, không runtime website/network call của search. Đây là đề xuất thiết kế cần đánh giá phù hợp requirement, không bảo đảm UI đẹp hoặc WCAG PASS. OSS core MIT; premium/add-on khác có thể trả phí.

**Bảo trì/version:** [releases](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/releases) hiện có skill v2.15.0 và release quality checks. Nhưng [CLI package.json](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/main/cli/package.json) snapshot main ghi `ui-ux-pro-max-cli` v2.5.0. Skill tag, npm CLI version và Context7/cache không đồng nhất; phải kiểm npm dist-tag/integrity cho version cụ thể trước pin. Không giả sử có npm CLI@2.15.0.

### Installer và quyền ghi đã đọc source

- [Codex platform template](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/main/src/ui-ux-pro-max/templates/platforms/codex.json) đặt skill tại `.agents/skills/ui-ux-pro-max/SKILL.md`; `--global` đổi base sang home, dùng được nhiều project.
- [Generator/planner](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/main/cli/src/utils/template.ts) hiện **còn copy sáu sibling sub-skills**. File skill có sẵn được skip nếu không force; --force có thể overwrite, legacy layout có thể bị remove. Không thấy ghi AGENTS.md hay Codex config trong đường Codex template/generator đã đọc; đây là kết luận có scope, không bảo chứng mọi version.
- [Init source](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/main/cli/src/commands/init.ts) có --dry-run dùng planner, in planned writes/copies/removals trước phần cài. Tuy nhiên npx khi chưa cache vẫn tải/chạy npm code; dry-run không biến bước bootstrap thành chỉ đọc.
- [CLI entry](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/main/cli/src/index.ts) có global/force/dry-run. Source package không có install/postinstall trong manifest đã đọc; chưa audit npm tarball/transitive scripts. Legacy [extract helper](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/main/cli/src/utils/extract.ts) có shell Expand-Archive/unzip; không cần chọn legacy ZIP.
- Sibling [design skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/main/cli/assets/skills/design/SKILL.md) còn có logo/image workflows Gemini/Atlas/MuAPI. Chúng có thể cần key/chi phí, khác core Python search. Không auto-activate/run add-on hoặc coi cài core nghĩa đã cho phép gọi AI.

**Chưa cài/chưa chạy.** Tối thiểu cần người dùng duyệt execution/phạm vi ghi trước. Không dùng --ai all/--force, không sửa AGENTS.md, không tạo thêm design-system tracker trùng docs hiện có. Có thể đọc guidance làm tài liệu ngay, nhưng phải ghi rõ chưa phải installed skill hoặc search output đã chạy.

## 4. Microsoft Playwright MCP — browser server cho coding agent

Nguồn: [README](https://github.com/microsoft/playwright-mcp), [Apache-2.0](https://github.com/microsoft/playwright-mcp/blob/main/LICENSE), [package manifest](https://github.com/microsoft/playwright-mcp/blob/main/package.json), [releases](https://github.com/microsoft/playwright-mcp/releases).

Node≥18 theo manifest. Release hiện v0.0.84 (31/10), main sử dụng Playwright alpha trong dependency; Context7 còn có snapshot v0.0.80. Đó là version khác nhau, không chọn “stable Playwright” chỉ từ tên MCP release. Pin MCP version và kiểm dependency/runtime thay vì @latest vĩnh viễn.

MCP cung cấp snapshot/accessibility và thao tác browser có trạng thái. Local Playwright/library hoặc CLI phù hợp regression/scripts; MCP phù hợp agent khám phá tương tác. Không cần API key dịch vụ cho QA local, nhưng tốn RAM/CPU/process browser; mỗi session/profile có lifecycle. Đã có core/binary chạy thì không phải cài MCP để có QA.

MCP là tiến trình có quyền người khởi chạy, có khả năng đọc trang/chụp ảnh/download/evaluate. README nói không phải security boundary. Đề xuất nếu cài: headless + isolated, profile sạch, không extension nối profile cá nhân, không grant camera/clipboard/geolocation, không secrets/storage-state cá nhân, không --allow-unrestricted-file-access/--no-sandbox. Serve prototype qua localhost; mặc định file:// bị chặn trong MCP, không nới quyền chỉ để mở file.

## 5. Context7 MCP — docs retrieval đã có

Nguồn: [repo](https://github.com/upstash/context7), [MIT](https://github.com/upstash/context7/blob/master/LICENSE), [MCP manifest](https://github.com/upstash/context7/blob/master/packages/mcp/package.json), [installation](https://context7.com/docs/installation), [privacy](https://context7.com/docs/security/data-privacy), [plans](https://context7.com/plans).

Manifest MCP main v4.4.4, Node≥20.18.1. Monorepo releases có SDK riêng, không dùng nhãn Latest của SDK làm version MCP. Kết nối hosted HTTP tránh process Node local; stdio dùng npm package. Tool resolve/query thực sự đã trả tài liệu trong phiên này, nên không cần setup thêm.

Free plan công khai có1.000 API calls/tháng; có tier paid/overage. Chưa kiểm plan/account của kết nối hiện tại, không phát sinh nâng gói/key mới. API key/OAuth tùy cách tích hợp; không cần yêu cầu người dùng gửi key vào prompt khi tool hiện có hoạt động.

Lookup gửi query/library metadata và dữ liệu xác thực/client khi có; privacy docs mô tả reranking, lưu query ẩn danh và ngoại lệ Enterprise. Agent phải không đưa secrets/private code/PII vào query. MCP retrieval không tự đưa SDK vào bundle website và không tự cấp quyền index private repo. CLI setup/plugin có thể sửa cấu hình nhiều agent; không chạy chỉ để thêm bản thứ hai.

## 6. Chrome DevTools MCP — chỉ thêm khi có nhu cầu riêng

Nguồn: [README](https://github.com/ChromeDevTools/chrome-devtools-mcp), [Apache-2.0](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/LICENSE), [manifest](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/package.json), [releases](https://github.com/ChromeDevTools/chrome-devtools-mcp/releases), [security](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/SECURITY.md), [client configurations](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/client-configurations.md).

v1.12.0 là release hiện tại; Node engine `^20.19.0 || ^22.12.0 || >=23`, README yêu cầu Node LTS + Chrome current stable. Chỉ Chrome/Chrome for Testing được support chính thức, không giả định Edge/Chromium bất kỳ được bảo đảm. Performance traces/network/CPU là giá trị riêng; click/search/screenshot overlap Playwright, chưa cần thêm trong P00.2.

Usage statistics bật mặc định; có `--no-usage-statistics`. Performance có thể gửi trace URLs cho CrUX, tắt bằng `--no-performance-crux`; update check có env opt-out. Server có khả năng đọc nội dung browser/files/source maps/evaluate theo quyền host. Security docs nhấn mạnh workspace/PATH/npm config là trusted inputs; roots/URL guardrails không thay OS sandbox. Không attach profile đang đăng nhập hoặc bật remote-debugging cá nhân chỉ cho vòng local.

Windows client guide có cmd /c npx và timeout example; phải đối chiếu tên timeout setting với Codex version/docs hiện tại trước dùng, không copy key cũ tự động. Không clone/npm ci từ source chỉ để install; source build có prepare/scripts. Chưa cài hoặc handshake server này; không có bằng chứng runtime hoạt động.

## 7. Cách cài chính thức và proposal chưa thực thi

Các ví dụ sau phục vụ review, **không phải lệnh đã chạy hoặc đã được duyệt**. Official guides dùng latest để bắt đầu; thay bằng version cụ thể đã đối chiếu registry/source trước thực thi.

```text
# UI UX: official package tạo lệnh uipro (uipro-cli cũ không dùng)
npm install -g ui-ux-pro-max-cli@<verified-cli-version>
uipro init --ai codex --global --dry-run
# Sau review planned files, chỉ chạy install thật khi người dùng duyệt.

# Playwright MCP: official Codex recipe (command wrapper Windows cần xác minh)
codex mcp add playwright -- npx @playwright/mcp@<verified-version> --isolated --headless --browser chrome

# Chrome DevTools: không đề xuất thêm lúc này
codex mcp add chrome-devtools -- npx chrome-devtools-mcp@<verified-version> --no-usage-statistics --no-performance-crux
```

`npm -g`, `codex mcp add`, global skill install hoặc MCP connection thêm quyền là thay đổi hệ thống/config, cần hỏi theo yêu cầu người dùng. Repo-local skill install cũng là code/instruction mới phải review; không clone nguyên repo. Không dùng setup hàng loạt hay inject key vào shell args. Khi cài, giữ backup config trước merge nhỏ đúng block, không overwrite file toàn bộ; không chỉnh AGENTS.md universal bằng hướng dẫn riêng dự án.

Không bắt buộc cài CLI global: sau phê duyệt có thể dùng npm exec/npx với **CLI version đã xác minh** để chạy đúng dry-run một lần; npm cache/download và việc thực thi package vẫn cần review. Cài skill user-level tiện tái dùng nhiều project, project-level tiện review cùng source nhưng tạo thêm instruction trong repo. Đường core-only/manual cần kiểm artifact/phụ thuộc trước, chưa hứa installer có flag chọn bỏ sáu sibling. Với hiện trạng, đọc guidance + local Playwright đang có vẫn là bộ có ít thay đổi nhất.

## 8. Validation và trạng thái chính xác

| Hạng mục | Trạng thái |
| --- | --- |
| Đọc README/license/package/releases/installer source của4 lựa chọn | PASS docs-only, primary sources |
| Context7 resolve rồi query cho Playwright MCP/Context7/ChromeDevTools MCP | PASS tool calls thực tế; đối chiếu nguồn vì snapshot/version lệch |
| Global install/config/hooks/cost | Không thay đổi; không cần để hoàn tất audit |
| UI UX Pro Max CLI dry-run/search.py | SKIP — chưa cài/chưa chạy code mới, chưa có phê duyệt |
| Playwright/DevTools MCP handshake/tools | SKIP — chưa cài/kết nối, không giả lập namespace |
| Local existing Playwright core/binary initial launch | PASS root smoke; không phải mới cài hoặc MCP |
| Prototype browser QA/screenshots | PASS45 checks/20 PNG thực tế, xem mục tích hợp cuối bên dưới |

### Kết quả tích hợp cuối — root

- **PASS browser thật:** Playwright Core1.62.0/Chromium151.0.7922.34 đã chạy **45 kiểm tra** A ở1440×900,768×1024,390×844; không console/pageerror, không ảnh vỡ hoặc tràn ngang tại các màn kiểm. **20 screenshot thực tế** và [gallery](../qa/p002/index.html), [JSON](../qa/p002/results.json).
- **PASS thêm:** mở trực tiếp file://, dialog ở390×480 cuộn nội bộ/không tràn, query có nhiều match giới hạn4 kết quả, nút đóng không tự mở lại. Viewport thấp chỉ là proxy, không phải bàn phím ảo thật.
- **SKIP:** physical iOS/Android/soft keyboard và assistive technology; không suy từ browser headless rằng đã đạt WCAG đầy đủ. CUA vẫn thiếu host; shell fallback hoạt động độc lập.
- OS marketing edition qua Win32_OperatingSystem/CIM bị AccessDenied; không xin thêm quyền chỉ để đọc tên edition vì runtime Windows đã launch được. Không nhầm lỗi CIM/crashpad với browser không chạy.
- Official OpenAI documentation: [MCP](https://learn.chatgpt.com/docs/extend/mcp?surface=cli) mô tả config chung CLI/IDE/desktop, user `~/.codex/config.toml` và project `.codex/config.toml` khi trusted. [Skill discovery](https://learn.chatgpt.com/docs/build-skills) có repo `.agents/skills` và user `~/.agents/skills`. Khả năng host hỗ trợ không đồng nghĩa server đã cài. Không đọc/in raw config có thể chứa secrets hoặc sửa cấu hình.

**Không công cụ nào mới được cài.** Context7 và local Playwright đang có đã được dùng/test; UI UX chỉ source guidance, Playwright MCP và DevTools MCP vẫn chưa cài/handshake. Mọi proposal global/install/permission mới còn phải được người dùng duyệt trước khi thực hiện; hiện không cần các thay đổi đó để hoàn tất P00.2.

Không có công cụ nào mới được cài. Context7 và local playwright-core/browser hiện có đã test; QA prototype hoàn tất như mục tích hợp cuối. Nếu muốn skill/MCP cấp user về sau, duyệt planned changes trước rồi test lookup/browser/cleanup. Không tooling nào vào runtime production.
