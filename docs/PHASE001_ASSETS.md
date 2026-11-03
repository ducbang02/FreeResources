# Phase 00.1 — Nguồn và quyền sử dụng hình ảnh

Rà ngày **03/11/2026**. Chỉ phục vụ prototype local P00.1; không deploy, không tải/cài/chạy phần mềm từ repo bên ngoài. Asset dùng để nhận diện và trình bày đúng sản phẩm, không làm thương hiệu của hub hoặc ngụ ý nhà phát triển bảo trợ.

## Lựa chọn thực tế

Repo cũ không có icon/screenshot có thể reuse. Chọn **3 icon ứng dụng chính chủ, 3 screenshot thật và 1 promotional artwork**, giữ file gốc, không chỉnh hình. Không kéo package icon hoặc template; tổng asset và license dưới 1 MB. Asset của Apple, App Store, Raycast và Setapp không được đưa vào prototype.

| File trong `prototype-p001/assets/` | Nguồn chính chủ | Quyền và attribution | Cách dùng |
| --- | --- | --- | --- |
| `localsend.png` | [LocalSend app asset](https://github.com/localsend/localsend/blob/main/app/assets/img/logo-256.png) | [Apache-2.0](https://github.com/localsend/localsend/blob/main/LICENSE), copyright Tien Do Nam/LocalSend contributors; giữ license đi kèm | Icon nhận diện LocalSend, không đổi tỉ lệ/màu, không dùng làm logo hub |
| `excalidraw.svg` | [Excalidraw public favicon](https://github.com/excalidraw/excalidraw/blob/master/public/favicon.svg) | [MIT](https://github.com/excalidraw/excalidraw/blob/master/LICENSE), copyright Excalidraw; giữ notice/license | Icon nhận diện Excalidraw; SVG được parse và kiểm không script/event handler/foreignObject |
| `godot.svg` | [Godot press kit](https://godotengine.org/press/) → `icon_color.svg` | [Logo license](https://github.com/godotengine/godot/blob/master/misc/logo/LICENSE.txt): copyright 2017 Andrea Calabró, **CC BY 4.0** | Press kit cho phép nhận diện Godot trên website, giữ tỉ lệ và không ngụ ý endorsement |
| `godot-editor.jpg` | [Godot official design screenshots](https://github.com/godotengine/godot-design/blob/master/screenshots/editor_tps_demo_1920x1080.jpg) | [Godot design CC BY 4.0](https://github.com/godotengine/godot-design/blob/master/LICENSE), Godot Engine contributors | Screenshot editor thật, có caption nguồn; không coi là screenshot UI prototype hoặc ảnh do nhóm tự chụp |
| `localsend-desktop.webp` | [LocalSend website source](https://github.com/localsend/website/blob/main/public/img/screenshot-pc.webp) | [Website Apache-2.0](https://github.com/localsend/website/blob/main/LICENSE), Tien Nam Do/LocalSend contributors | Screenshot app chính chủ có laptop/Windows desktop; không mô tả là giao diện mới nhất đã tự dùng thử |
| `localsend-mobile.webp` | [LocalSend website source](https://github.com/localsend/website/blob/main/public/img/screenshot-iphone.webp) | Cùng website Apache-2.0 | Screenshot app với phone frame; hiển thị như ảnh nguồn, không phải bằng chứng mobile QA của hub |
| `excalidraw-promo.png` | [Excalidraw public og-image](https://github.com/excalidraw/excalidraw/blob/master/public/og-image-3.png) | Repository MIT, Excalidraw contributors; giữ notice | **Promotional artwork, không phải screenshot UI.** Tùy chọn cho mục Excalidraw, không dùng làm hero branding của hub |

Raw download URLs, byte sizes, SHA-256, vai trò, ngày lấy và dimensions ở [manifest](../prototype-p001/assets/manifest.json). URL upstream nhánh main/master có thể đổi; hash ghi nhận chính xác bản đã tải. Không có file nào bị sửa nội dung, rename promotional artwork chỉ để tránh gọi nhầm screenshot. Có thể scale giữ tỉ lệ khi hiển thị.

Các license đầy đủ đã lưu cạnh asset:

- `LICENSE-LocalSend-Apache-2.0.txt`.
- `LICENSE-LocalSend-Website-Apache-2.0.txt`.
- `LICENSE-Excalidraw-MIT.txt`.
- `LICENSE-Godot-CC-BY-4.0.txt`.

Đã kiểm root directory listings của LocalSend app, LocalSend website và Excalidraw: không thấy NOTICE hoặc TRADEMARK riêng ở root. Đây là kiểm tra có giới hạn, không phải audit mọi file hoặc kết luận pháp lý. Apache/MIT và CC cấp quyền theo phạm vi của tác giả, **không tự cấp mọi quyền trademark hoặc media bên thứ ba xuất hiện trong screenshot**. Device frame/OS trong LocalSend cần lưu ý khi sử dụng ngoài bản demo local. [Godot press guidelines](https://godotengine.org/press/) có quy tắc nhận diện và không endorsement rõ ràng.

## Attribution cần giữ khi bàn giao

Prototype nên có đường “Nguồn hình ảnh” tới tài liệu này hoặc phần credits tương đương. Nội dung tối thiểu:

> LocalSend icon và screenshot: LocalSend contributors, Apache-2.0. Excalidraw icon/artwork: Excalidraw contributors, MIT. Godot icon: Andrea Calabró; screenshot: Godot contributors, CC BY 4.0. File gốc không chỉnh sửa; xem nguồn và license đi kèm. Tên và biểu trưng thuộc chủ sở hữu tương ứng; không có quan hệ bảo trợ.

Các app chưa có icon được kiểm nguồn dùng function icon hoặc letter tile do hub tự tạo, ghi rõ fallback, không giả logo chính thức. Sơ đồ workflow do nhóm tự dựng phải gắn nhãn minh họa, không gọi là screenshot hoặc bằng chứng tính năng đã kiểm thử.

## Đã loại và lý do

| Lựa chọn | Quyết định |
| --- | --- |
| Joplin icon | **Không tải/dùng.** [License chính chủ](https://github.com/laurent22/joplin/blob/dev/LICENSE) tách logo/icon khỏi code, yêu cầu permission riêng. Đây là ví dụ OSS code không đồng nghĩa quyền dùng logo |
| Simple Icons lấy hàng loạt dưới CC0 | **Không dùng shortcut.** [Disclaimer](https://github.com/simple-icons/simple-icons/blob/develop/DISCLAIMER.md) nói quyền icon riêng có thể khác license dự án và cần kiểm brand guidelines |
| Excalidraw CDN `product_showcase.png` | Chưa đưa vào vì asset ngoài repo có content/license cần xác minh riêng; không suy từ MIT của code sang mọi ảnh CDN |
| Blender, Krita, OBS và bộ logo khác | Chưa giải quyết đủ phạm vi asset/trademark để thêm trong lane này; một số trang brand không đọc được. Không tự dùng license code làm bằng chứng cho mọi logo/artwork |
| Logo/ảnh Apple, Setapp, Raycast | Chỉ tham khảo thiết kế; không sao chép vào asset bundle |

## Validation

- **PASS:** download từ official source, giữ bản gốc + license; manifest kiểm byte/hash; bitmap mở được; SVG parse được và không active script; đã nhìn trực tiếp hai ảnh LocalSend, Godot editor và Excalidraw promotional artwork để phân biệt loại nội dung.
- **PASS:** chỉ đọc/tải public assets bằng script tự viết; không chạy mã upstream, không cài dependency, không gọi paid API.
- **SKIP:** render asset trong browser prototype/viewport và kiểm visual crop/contrast/alt text thực tế; browser host của phiên không hoạt động. Root thực hiện static integration checks, user review thủ công sau.
- **Giới hạn:** kiểm quyền có nguồn và scope rõ, không phải xác nhận pháp lý cho mọi cách dùng production; cần rà lại khi xuất bản hoặc thay asset.
