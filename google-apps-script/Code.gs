/**
 * GỌN Fitness & Yoga — nhận dữ liệu form website vào Google Sheets.
 *
 * Cách dùng: mở Google Sheet > Tiện ích mở rộng > Apps Script, dán toàn bộ file này,
 * rồi Triển khai > Tùy chọn triển khai mới > Ứng dụng web
 * (Thực thi với tư cách: Tôi; Người có quyền truy cập: Bất kỳ ai).
 */

// Tên tab lưu dữ liệu (tự tạo nếu chưa có).
const SHEET_NAME = 'Leads';

// Email nhận thông báo khi có khách mới. Để trống '' nếu không cần.
const NOTIFY_EMAIL = '';

const HEADERS = ['Thời gian', 'Tên', 'Số điện thoại (Zalo)', 'Email', 'Địa chỉ', 'Nguồn form', 'Trang'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    // Bẫy spam: ô ẩn "website" chỉ bot mới điền.
    if (data.website) return json({ ok: true });

    const name = clean(data.name, 100);
    const phone = clean(data.phone, 30);
    if (!name || !/^[0-9 +.]{9,15}$/.test(phone)) {
      return json({ ok: false, error: 'invalid' });
    }

    const sheet = getSheet();
    const row = [
      Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm:ss'),
      name,
      phone,
      clean(data.email, 120),
      clean(data.address, 200),
      clean(data.source, 60),
      clean(data.page, 300),
    ];
    // Định dạng văn bản để giữ số 0 đầu số điện thoại.
    sheet.getRange(sheet.getLastRow() + 1, 1, 1, row.length).setNumberFormat('@').setValues([row]);

    if (NOTIFY_EMAIL) {
      MailApp.sendEmail(
        NOTIFY_EMAIL,
        'GỌN — Khách mới: ' + name,
        HEADERS.map(function (h, i) { return h + ': ' + row[i]; }).join('\n')
      );
    }
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Mở URL Web App trên trình duyệt để kiểm tra đã deploy đúng.
function doGet() {
  return json({ ok: true, service: 'GON form endpoint' });
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#eabb87');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Cắt độ dài và chặn chèn công thức (=, +, -, @) vào Sheet.
function clean(v, max) {
  let s = String(v == null ? '' : v).trim().slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
