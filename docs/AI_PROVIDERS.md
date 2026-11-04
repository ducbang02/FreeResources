# AI_PROVIDERS — API trước, AI sau; Gemini là provider AI đầu tiên

> Cập nhật04/11/2026: **AGREED nguyên tắc** GitHub API/code trước, Gemini chỉ khi cần ngữ nghĩa/biên tập; không AI trên Search/Detail hoặc tự publish. Gemini là AI provider đầu tiên, không phải bước bắt buộc trước API. **P02 implementation NOT STARTED**, contract/caps/trigger vẫn PROPOSED tại [thiết kế P02](PHASE02_DESIGN.md); P01 chưa DONE. Các nghiên cứu Phase00 bên dưới giữ ý nghĩa lịch sử.

## 1. AI làm gì, không làm gì?

**Làm khi thực sự cần:** hiểu README/evidence công khai được cấp, gợi ý công dụng/đối tượng, summary/description tiếng Việt, category/use case/tags khi luật chưa đủ và nội dung Detail dạng **draft**. Một request `analyze_repository` trả nhiều fields. API/code lấy metadata, normalize/validate/dedupe/rules/cache/quota/queue; không cần LLM cho các việc đó. Platforms/requirements chỉ từ nguồn được đối chiếu, không suy bằng AI.

**Không làm:** khẳng định code an toàn, kết luận pháp lý/giấy phép nếu thiếu bằng chứng, tự động execute repo/script, tự công bố nội dung, tự rewrite đoạn đánh giá do người dùng viết, dùng AI để bịa thông số/chấm sao.

## 2. Luồng tổng quát

```text
Admin nhập URL GitHub public
  -> code chuẩn hóa + kiểm trùng
  -> GitHub API + response validation + resolve stable repository ID
  -> code kiểm trùng lại, rules + taxonomy + evidence
  -> nếu cần ngữ nghĩa và được yêu cầu: cache/budget gate -> Gemini một request
  -> nháp: GitHub facts + rules + AI suggestion/lỗi tách riêng
  -> admin sửa -> approved digest -> export Git/JSON
  -> review diff -> commit/push được phép -> CI P01 -> kiểm Preview
```

Metadata cấu trúc vẫn phải phân biệt **quan sát GitHub / lời tác giả / code suy ra / AI gợi ý / người đã đối chiếu / unknown**. Description/topics/README là lời tác giả; license detection không xác minh toàn bộ quyền; stars không phải rating. Ví dụ `Rust` là ngôn ngữ repo, không đủ để xếp `RustDesk` vào Lập trình. AI lỗi/quota vẫn giữ GitHub data; người biên tập có thể hoàn thiện thủ công. Crawler/discovery và nhiều provider là khả năng về sau, không nằm trong P02 importer nhỏ.

## 3. Contract phía domain, không khóa vendor

Ví dụ TypeScript minh họa (không coi là code phải copy nguyên):

```ts
type AITask = 'analyze_repository'; // Một request nhiều fields; contract minh họa, chưa implement.

type AIRequest = {
  task: AITask;
  input: SourceEvidence;
  outputSchema: Readonly<Record<string, unknown>>; // JSON Schema thuộc app
  schemaVersion: string;
  promptVersion: string;
  timeoutMs: number;
};

type AIResponse<T> = {
  data: T; // đã schema-validate; adapter không trả raw text cho domain
  providerId: string;
  modelId: string;
  usage?: { inputTokens?: number; outputTokens?: number };
  requestId?: string;
};

interface AIProvider {
  id: string;
  generateStructured<T>(request: AIRequest, validate: (value: unknown) => T): Promise<AIResponse<T>>;
}
```

`SourceEvidence` nên gồm `canonicalUrl`, `provider`, `fetchedAt`, `title`, `description`, `topics`, `licenseMetadata`, `readmeExcerpt`, `manifestFacts`, `releaseInfo` và `sourceLinks`. Tất cả trường đều **được lấy từ nguồn và được gắn provenance**, không mặc định tin bất kỳ văn bản nào chứa lệnh cho agent.

Contract cần truyền schema thực, không chỉ `schemaVersion`: adapter phải biết schema để yêu cầu structured output, rồi vẫn chạy validator phía app. Mỗi evidence có ID/hash, URL và timestamp; citations output tham chiếu evidence đã cấp, không được tự fetch URL do model sinh. Adapter ánh xạ lỗi về các loại nhỏ `rate_limited/timeout/unavailable/invalid_output/unsupported_schema`; không trả key, raw provider error hay toàn prompt ra client. Tên model, SDK types và vendor response chỉ tồn tại trong adapter. Không cần registry động/plugin engine: object map cấu hình server cho các adapter thực sự có là đủ.

## 4. Adapter và cấu hình định tuyến

| Provider | Thời điểm | Hình thức |
| --- | --- | --- |
| `GeminiProvider` | **Đầu tiên** | Gemini API với server-side `GEMINI_API_KEY`; yêu cầu structured output theo khả năng model |
| `OpenAIProvider` | Khi cần | Adapter riêng qua API chính thức, server-side key |
| `WorkersAIProvider` | Khi muốn thử chi phí/tính năng Cloudflare | Adapter cho Workers AI; kiểm khả năng structured output thực tế |
| `LocalModelProvider` | Khi có máy/VPS/GPU đủ điều kiện | HTTP adapter đến model host riêng; không giả định có thể chạy model nặng trong Worker |

P02 nhỏ ưu tiên native REST `fetch` của Node đã có nếu spike đáp ứng; chưa cần SDK, router framework hoặc provider registry động. Model/timeout/output cap là cấu hình môi trường quản trị, không nằm trong frontend. Một hàm phân tích có boundary rõ là đủ; provider thứ hai chỉ thêm khi thực sự cần và được duyệt. Thay provider không thay approval/publish contract.

Config logic đề xuất: `analyze_repository -> gemini/<model đã benchmark>`; AI và provider fallback mặc định disabled. Không chia classify/draft/tags thành ba lượt gọi. Model/phiên bản/API schema phải chốt theo tài liệu và live spike lúc M4 được phép, không lấy tên model trong sample làm quyết định production.

## 5. Output schema gợi ý

```json
{
  "summary_vi": "...",
  "description_vi": "...",
  "primary_category": null,
  "primary_use_case": null,
  "tags": [],
  "target_users": [],
  "key_features": [],
  "strengths": [],
  "limitations": [],
  "source_references": [],
  "unknowns": ["Cần người biên tập đối chiếu nguồn"],
  "confidence": "low"
}
```

Đây là shape minh họa, không phải fixture đã phân tích. Contract chi tiết/limits/provenance ở [P02 schema](PHASE02_DESIGN.md#7-schema-nháp-và-nguồn--proposed-v1). Category/use-case/tag chỉ từ ID được cấp; features/strengths/limitations là claims có evidence IDs, source_references chỉ trỏ IDs input. Type/identity/license/price/stars/platforms/system requirements không do model ghi. Code đặt requires_review=true; confidence không phải xác suất/rating hoặc quyền publish. Validate cả shape/enum/length và nguồn/ý nghĩa; thiếu bằng chứng giữ null/[]/unknown. Schema provider không thay validator/reviewer.

## 6. Bảo vệ chi phí và độ tin cậy

- P02 đề xuất một máy/người biên tập, ledger atomic và cap request/token/ngày, concurrency/timeout/size. CLI không gửi request khi thiếu budget; không có nút/admin web đã triển khai. Ledger local không giới hạn toàn bộ ứng dụng khác cùng project provider.
- **Cache** theo toàn bộ input thực gửi + content hash/excerpt + taxonomy/rule/prompt/schema/config/model version/ngôn ngữ; không thêm stars biến động nếu không dùng trong prompt. Force-analyze có lý do và vẫn chịu budget. Chi tiết cap/TTL ở PHASE02_DESIGN, chưa phải cấu hình runtime.
- Tách `metadataState`, `aiState`, `reviewState` như schema P02; lỗi schema/quota không xóa GitHub facts hoặc âm thầm chuyển thành approved/public. Human edit/refresh làm mất hiệu lực approved digest.
- Retry có backoff+jitter, attempt cap và budget reservation. Rate limit ngày thì giữ queue; timeout có outcome_unknown không được mặc định là API chưa xử lý để gọi lại ngay. JSON sai schema không tự tạo vòng “AI sửa AI”. Không đổi provider/key/tài khoản để né quota hoặc tự fallback lên model trả phí.
- Lưu `provider/model`, usage/cost estimate, version prompt, input digest, trích nguồn, trạng thái admin edit. Giữ bản nháp và nội dung đã publish tách riêng; không overwrite chỉnh sửa thủ công.
- Không gửi bí mật nội bộ, email người dùng, token, source private hoặc nội dung độc quyền lên API AI khi chưa có cơ sở xử lý/cho phép.
- **Prompt injection:** README/manifest/webpage/issue là input không đáng tin; cắt/escape độ dài hợp lý, cô lập khỏi system instructions và không cấp tool quyền thực thi, duyệt output trước khi publish.

## 7. Tách discovery khỏi classification

- **Discovery**: GitHub Search API, curated lists/topic, submissions; trả URL + metadata nguồn và kiểm quota; không cần LLM cho mọi thao tác.
- **Classification**: rules từ metadata/manifest trước, AI giải quyết phần nhập nhằng/tóm tắt; dùng taxonomy nhiều nhãn.
- **Editorial**: AI đề xuất bài tiếng Việt theo chuẩn nội dung; admin rà nguồn từng claim, bổ sung ảnh/hướng dẫn.
- **Ranking**: dùng rating của cộng đồng và editorial score có quy tắc minh bạch, **không dùng AI để tự chấm sao**.

## 8. Đánh giá chất lượng trước khi tự động hóa

P02-M4 đề xuất bộ nhỏ10–20 repo public có nhãn người xác nhận (TTS, Rust language project/RustDesk, LocalSend, PDF, thiếu README/license), chia lượt trong cap thay vì gọi hàng loạt. So sánh tiếng Việt, taxonomy/evidence, hallucination, token/chi phí và độ trễ. Rules-only baseline và đường AI off phải hoạt động trước. Bộ50–100/cron/multi-provider chỉ mở rộng khi được giao về sau; benchmark tốt không cho phép auto-publish.

## 9. Tài liệu chính thức cần xác minh khi triển khai

- Gemini structured output: https://ai.google.dev/gemini-api/docs/structured-output
- GitHub API / limits: https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api
- Cloudflare AI Gateway/Workers AI: https://developers.cloudflare.com/workers-ai/

Tính năng schema của từng model/provider không giống nhau; kể cả API trả JSON đúng cấu trúc, **logic app phải kiểm dữ liệu và nguồn**.

## 10. Kết quả reuse và validation Phase 00

- Context7 đã resolve/query AI SDK từ `/websites/ai-sdk_dev`; [Google provider](https://ai-sdk.dev/providers/ai-sdk-providers/google) nêu giới hạn JSON Schema và [structured data](https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data) có validation output. Đề xuất dùng AI SDK bên trong adapter khi cần nhiều provider để tránh tự viết lại chuẩn hóa; [Apache-2.0](https://github.com/vercel/ai/blob/main/LICENSE). Chưa pin/cài/test version, không copy tên model từ ví dụ docs thành quyết định.
- [Google Gen AI SDK](https://github.com/googleapis/js-genai) (Apache-2.0) là phương án Gemini-only đầu tiên; hoặc REST `fetch` hẹp nếu spike chứng minh đơn giản hơn. Không dùng đồng thời hai SDK làm cùng việc. Domain vẫn giữ contract của app. So sánh integration/maintenance/chi phí đầy đủ ở [PHASE00_REUSE_AUDIT](PHASE00_REUSE_AUDIT.md).
- URL Gemini structured-output chính thức đã được mở nhưng redirect sang AI Studio bị web tool lỗi 500; không coi tài liệu này là đã đọc trực tiếp thành công. AI SDK docs chính thức hỗ trợ đánh giá sơ bộ; khả năng đúng model phải kiểm lại ở P04. [Pricing chính thức](https://ai.google.dev/gemini-api/docs/pricing) khác nhau theo model/tier; không giả định AI Studio free đồng nghĩa mọi model/API production miễn phí. Free-tier data handling và quota cần chủ dự án đọc/chốt trước dùng source không công khai.
- **PASS (docs):** contract có schema, evidence, lỗi, quota/cache và human approval boundary. **SKIP (runtime):** Gemini call, structured-output model support, Workers SDK compatibility, latency/cost, timeout/retry/fallback và test provider thứ hai. Chưa gọi paid API hay yêu cầu secret.
- Gate P04: fixture test đủ/thiếu citation; schema lỗi; prompt injection README; 429/timeout; budget exhausted; retry idempotency; AI draft dựa trên revision cũ không được ghi đè bản đã sửa. Kết quả AI lưu ở job/draft riêng; endpoint publish là quyền editor kiểm server, không phải một field model có thể đặt.
