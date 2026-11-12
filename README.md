# GỌN Fitness & Yoga — Website

Website giới thiệu GỌN Fitness & Yoga, dựng lại từ bản thiết kế Framer bằng HTML/CSS/JS thuần (không cần build).

## Cấu trúc

```
index.html     # Nội dung các section
styles.css     # Giao diện (màu, font, responsive)
script.js      # Hiệu ứng: hero dial, chữ chạy, slider PT, popup, form
config.js      # Cấu hình nơi nhận dữ liệu form
assets/img     # Ảnh (webp)
assets/video   # Video hero
```

## Các section

1. Hero video + vòng chia độ "LIVE STRONG / LIVE LONG / FIT FOR LIFE"
2. Tuyên ngôn "Chúng tôi tin rằng để có một sức khỏe tốt — không cần phức tạp"
3. Video tour (bấm PLAY VIDEO mở popup)
4. Các bộ môn nổi bật: Gym / Dance / Yoga
5. Dịch vụ dành cho Member: Locker, Sauna, Stretching (thẻ xếp chồng khi cuộn)
6. Chương trình thành viên + form tư vấn
7. Slider Huấn luyện viên cá nhân
8. Đội ngũ PT + 4 cam kết
9. Kết quả học viên (trước / sau)
10. Form "Bắt đầu thay đổi ngay"
11. Bài viết mới (Tin tức / Blog)
12. CTA + Footer, nút tư vấn nổi

## Chạy thử

```bash
python3 -m http.server 8080
# mở http://localhost:8080
```

## Nhận dữ liệu form

Mặc định form chạy chế độ demo (chỉ hiện thông báo cảm ơn). Để nhận dữ liệu thật, điền URL vào `config.js`:

```js
window.GON_CONFIG = { FORM_ENDPOINT: "https://script.google.com/macros/s/XXX/exec" };
```

Form gửi `POST` JSON gồm `name`, `phone`, `email`, `address`, `source`, `submittedAt`.
Có thể dùng Google Apps Script (lưu vào Google Sheets) hoặc Formspree.

## Đưa lên mạng

Đây là site tĩnh, deploy được ngay lên GitHub Pages, Netlify, Vercel hoặc Cloudflare Pages
(trỏ thư mục gốc, không cần lệnh build).

## Cần cập nhật

- Link Facebook / TikTok / Zalo ở footer
- Nội dung bài viết blog (hiện là nội dung mẫu)
- Ảnh / tên huấn luyện viên thật
