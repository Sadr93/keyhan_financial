# راهنمای سریع راه‌اندازی (رایگان)

## ⚡ مراحل سریع (5 دقیقه):

### 1️⃣ ایجاد Google Sheet
- یک Sheet جدید بسازید
- در ردیف اول بنویسید: `تاریخ | نوع | دسته | زیردسته | مبلغ | توضیحات`

### 2️⃣ ساخت Apps Script
1. در Sheet: **Extensions** > **Apps Script**
2. کد `apps-script.js` را کپی و پیست کنید
3. **Save** کنید

### 3️⃣ Deploy کردن
1. **Deploy** > **New deployment**
2. ⚙️ Settings > **Web app** انتخاب کنید
3. **Execute as**: "Me" ✅
4. **Who has access**: "Anyone" ✅
5. **Deploy** کنید
6. اولین بار: **Authorize access** > **Advanced** > **Go to [Project] (unsafe)** > **Allow**
7. **URL را کپی کنید** (با `/exec` تمام می‌شود)

📖 **برای توضیحات کامل**: فایل `DEPLOY_GUIDE.md` را ببینید

### 4️⃣ تنظیم config.js
```javascript
const CONFIG = {
    WEB_APP_URL: 'URL_که_کپی_کردید'
};
```

### 5️⃣ اجرا
```bash
python3 -m http.server 8000
```
سپس `http://localhost:8000` را باز کنید

✅ **تمام! کاملاً رایگان و آماده استفاده**

---

## 📝 نکات:

- **هیچ هزینه‌ای نداره** - Google Apps Script رایگانه
- **نیازی به Google Cloud Console نیست**
- URL همیشه ثابت می‌مونه
- برای تغییر کد، Deploy جدید بسازید
