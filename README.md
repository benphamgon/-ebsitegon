# GỌN Fitness & Yoga — Website

Website giới thiệu GỌN Fitness & Yoga, dựng lại từ bản thiết kế Framer bằng HTML/CSS/JS thuần (không cần build).

## Cấu trúc

```
index.html     # Nội dung các section
styles.css     # Giao diện (màu, font, responsive)
motion.js      # Hiệu ứng theo cuộn: hero chuỗi ảnh + vòng chia độ, logo GỌN → video, vòng ảnh 3D
script.js      # Menu, slider PT, popup, form, âm thanh video
config.js      # Cấu hình nơi nhận dữ liệu form
assets/img     # Ảnh (webp)
assets/frames  # Chuỗi ảnh hero (máy tính), assets/frames-m (điện thoại)
assets/video   # Video giới thiệu (bản thường + bản nhẹ cho điện thoại)
assets/vendor  # GSAP + ScrollTrigger + Lenis (lưu sẵn, không phụ thuộc CDN)
```

## Các section

1. Hero ghim màn hình: người kéo lat pulldown chuyển động theo cuộn, vòng chia độ xoay đổi chữ
   "LIVE STRONG / LIVE LONG / FIT FOR LIFE", rồi hiện tuyên ngôn
2. Chữ O → logo GỌN → ảnh bay vào → video giới thiệu mở ra (tự phát, có nút âm thanh)
3. Các bộ môn nổi bật: Gym / Dance / Yoga
4. Dịch vụ dành cho Member: Locker, Sauna, Stretching (thẻ xếp chồng khi cuộn)
5. Chương trình thành viên + form tư vấn
6. Slider Huấn luyện viên cá nhân
7. Đội ngũ PT + 4 cam kết
8. Kết quả học viên (trước / sau)
9. Form "Bắt đầu thay đổi ngay"
10. Bài viết mới (Tin tức / Blog)
11. CTA + Footer, nút tư vấn nổi

## Chạy thử

```bash
python3 -m http.server 8080
# mở http://localhost:8080
```

## Kết nối Google Sheets

Cả 3 form (chương trình thành viên, "Bắt đầu thay đổi ngay", popup tư vấn) gửi về cùng một Google Sheet.
Mặc định `FORM_ENDPOINT` để trống thì form chạy chế độ demo (chỉ hiện thông báo cảm ơn).

1. Vào [sheets.new](https://sheets.new) tạo một Google Sheet mới, đặt tên ví dụ **GỌN — Khách đăng ký**.
2. Trong Sheet: **Tiện ích mở rộng → Apps Script**.
3. Xóa code mặc định, dán toàn bộ nội dung file [`google-apps-script/Code.gs`](google-apps-script/Code.gs), bấm **Lưu**.
   - Muốn nhận email khi có khách mới: điền email vào `NOTIFY_EMAIL`.
4. Bấm **Triển khai → Tùy chọn triển khai mới**, chọn loại **Ứng dụng web**:
   - *Thực thi với tư cách*: **Tôi**
   - *Người có quyền truy cập*: **Bất kỳ ai**
5. Bấm **Triển khai**, cấp quyền cho tài khoản Google (nếu hiện "Google chưa xác minh ứng dụng này" → *Nâng cao* → *Đi tới …*).
6. Copy **URL ứng dụng web** (dạng `https://script.google.com/macros/s/.../exec`) và dán vào `config.js`:

   ```js
   window.GON_CONFIG = { FORM_ENDPOINT: "https://script.google.com/macros/s/XXXX/exec" };
   ```

7. Kiểm tra: mở URL đó trên trình duyệt sẽ thấy `{"ok":true,...}`. Gửi thử form trên web → dữ liệu hiện trong tab **Leads**.

Cột trong Sheet: Thời gian (giờ Việt Nam) · Tên · Số điện thoại (Zalo) · Email · Địa chỉ · Nguồn form · Trang.

> Khi sửa `Code.gs` sau này: **Triển khai → Quản lý triển khai → ✏️ → Phiên bản: Phiên bản mới** để giữ nguyên URL.

Có sẵn chống spam (ô ẩn honeypot), kiểm tra số điện thoại và chặn chèn công thức vào Sheet.

## Đưa lên mạng

Đây là site tĩnh, deploy được ngay lên GitHub Pages, Netlify, Vercel hoặc Cloudflare Pages
(trỏ thư mục gốc, không cần lệnh build).

## Cần cập nhật

- Link Facebook / TikTok / Zalo ở footer
- Nội dung bài viết blog (hiện là nội dung mẫu)
- Ảnh / tên huấn luyện viên thật
