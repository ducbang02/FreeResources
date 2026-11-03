# AI_PROVIDERS — Thiết kế Gemini-first, multi-provider

> Quyết định kiến trúc **AGREED**: dùng Google AI Studio/Gemini trước, nhưng hỗ trợ nhiều nhà cung cấp AI về sau. Implementation cụ thể **chưa làm**. Rà Phase 00 ngày 03/11/2026: contract dưới đây là **PROPOSED**, chưa test API/runtime; chỉ phân tích và tạo draft, admin duyệt trước xuất bản theo yêu cầu Phase 00.

## 1. AI làm gì, không làm gì?

**Làm:** đọc metadata công khai của repo, README/manifest/release/official docs trong giới hạn; gợi ý chức năng, danh mục, chủ đề, nền tảng, độ khó, tiếng Việt dễ hiểu và bài viết **draft** cho admin.

**Không làm:** khẳng định code an toàn, kết luận pháp lý/giấy phép nếu thiếu bằng chứng, tự động execute repo/script, tự công bố nội dung, tự rewrite đoạn đánh giá do người dùng viết, dùng AI để bịa thông số/chấm sao.

## 2. Luồng tổng quát

```text
Admin nhập URL / crawler tìm candidate
  -> kiểm URL, chống SSRF và duplicate
  -> metadata fetcher đọc API GitHub hoặc trang nguồn có quyền
  -> chuẩn hóa thành SourceEvidence (văn bản + URL + timestamp)
  -> AI Task Router (task='classify' hoặc 'draft')
  -> Provider adapter theo cấu hình + model registry
  -> schema validation + evidence check + quality guards
  -> Draft + provenance + chi phí + trạng thái cần duyệt
  -> Admin chỉnh sửa -> duyệt -> publish
```

Metadata có cấu trúc (license field, stars, language, tags, platform files) được ưu tiên làm **sự thật nền**; AI chỉ suy luận tính năng từ nội dung. Ví dụ `Rust` là **ngôn ngữ repo**, không có nghĩa đó là app dành cho developer; `RustDesk` là **remote desktop**, không xếp đơn giản vào “Lập trình” chỉ vì tên.

## 3. Contract phía domain, không khóa vendor

Ví dụ TypeScript minh họa (không coi là code phải copy nguyên):

```ts
type AITask = 'classify_resource' | 'draft_resource_page' | 'suggest_tags';

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

Task router chọn model từ **server config** theo `task`, capability (JSON/schema, language, context), độ trễ, privacy và ngân sách. Không hardcode provider trong trang admin, schema DB hoặc business logic. Thêm vendor mới = adapter + tests + config, không đổi luồng publish.

Ví dụ config logic: `classify_resource -> gemini/model-A`; `draft_resource_page -> gemini/model-B`; `fallback -> disabled` khi MVP. Không hardcode model name/version trong docs: lấy từ tài liệu chính thức và cấu hình tại thời điểm implement.

## 5. Output schema gợi ý

```json
{
  "resourceType": "repository",
  "additionalResourceTypes": ["application"],
  "primaryCategoryId": "dev-tools",
  "suggestedTagIds": ["remote-access", "open-source"],
  "oneLineSummaryVi": "Công cụ truy cập máy tính từ xa.",
  "features": ["Điều khiển từ xa"],
  "audiences": ["support", "office"],
  "platforms": ["windows", "linux"],
  "license": {"claimedSpdx": null, "sourceUrl": null, "needsReview": true},
  "draftMarkdownVi": "...",
  "citations": [{"url": "https://example.org/official", "field": "features"}],
  "unknowns": ["Chưa xác minh phiên bản Windows tối thiểu"],
  "confidenceHint": "needs_review"
}
```

ID category/tag chỉ được chọn từ taxonomy thật (không tin AI tự tạo ID). `resourceType` chính chỉ phục vụ hiển thị; additional types và chủ đề là đa nhãn theo [reuse audit](PHASE00_REUSE_AUDIT.md), không loại trừ app vì có repo. Server validate enum, size, URL, JSON shape và **ý nghĩa**; `confidenceHint` không phải điểm xác suất tin cậy. Nguồn/license là **claim kèm evidence**, không thành sự thật chỉ vì model đã viết ra. Bất kỳ trường nào thiếu bằng chứng -> `unknown` hoặc `needs_review`, không bịa.

## 6. Bảo vệ chi phí và độ tin cậy

- Quota **mỗi admin/ngày**, giới hạn số job đồng thời, timeout/size mỗi nguồn, budget cap; ẩn nút Analyze khi hết hạn mức.
- **Cache** bằng `normalizedUrl + sourceContentHash + task + promptVersion + schemaVersion + provider + model` để tránh AI gọi lại nếu không cần; admin có nút Force refresh có kiểm soát.
- Ghi `status`: queued/running/succeeded/needs_review/failed; lỗi schema hoặc thiếu bằng chứng không được âm thầm chuyển thành public.
- Retry có backoff + jitter **chỉ** với timeout/rate limit/transient error; không loop vô hạn. Fallback sang provider khác chỉ khi được cấu hình và có budget/consent phù hợp; log rõ provider nào đã dùng.
- Lưu `provider/model`, usage/cost estimate, version prompt, input digest, trích nguồn, trạng thái admin edit. Giữ bản nháp và nội dung đã publish tách riêng; không overwrite chỉnh sửa thủ công.
- Không gửi bí mật nội bộ, email người dùng, token, source private hoặc nội dung độc quyền lên API AI khi chưa có cơ sở xử lý/cho phép.
- **Prompt injection:** README/manifest/webpage/issue là input không đáng tin; cắt/escape độ dài hợp lý, cô lập khỏi system instructions và không cấp tool quyền thực thi, duyệt output trước khi publish.

## 7. Tách discovery khỏi classification

- **Discovery**: GitHub Search API, curated lists/topic, submissions; trả URL + metadata nguồn và kiểm quota; không cần LLM cho mọi thao tác.
- **Classification**: rules từ metadata/manifest trước, AI giải quyết phần nhập nhằng/tóm tắt; dùng taxonomy nhiều nhãn.
- **Editorial**: AI đề xuất bài tiếng Việt theo chuẩn nội dung; admin rà nguồn từng claim, bổ sung ảnh/hướng dẫn.
- **Ranking**: dùng rating của cộng đồng và editorial score có quy tắc minh bạch, **không dùng AI để tự chấm sao**.

## 8. Đánh giá chất lượng trước khi tự động hóa

Chuẩn bị tập 50–100 nguồn đa dạng (TTS, Rust language project, RustDesk, LocalSend, game, PDF tool, tutorial...) có nhãn do người xác nhận. So sánh theo accuracy loại/công năng, taxonomy, citation coverage, hallucination, chi phí, độ trễ. Khi thêm provider mới, chạy lại cùng bộ test. Không tự động xuất bản dù benchmark tốt.

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
