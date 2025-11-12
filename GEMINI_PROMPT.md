# پرامپت برای Gemini - تنظیمات خودکار Firebase

این پرامپت را کپی کنید و به Gemini بدهید:

---

```
سلام! من یک پروژه Firebase دارم به نام "keyhan-financial" و می‌خواهم Firestore Database را برای آن راه‌اندازی کنم.

لطفاً این کارها را برای من انجام بده:

1. به Firebase Console برو و پروژه "keyhan-financial" را باز کن

2. Firestore Database را فعال کن:
   - از منوی سمت چپ "Firestore Database" را انتخاب کن
   - اگر دکمه "Create database" می‌بینی، روی آن کلیک کن
   - "Start in test mode" را انتخاب کن (برای شروع)
   - Location را انتخاب کن (ترجیحاً نزدیک‌ترین به ایران یا us-central1)
   - روی "Enable" کلیک کن

3. Security Rules را تنظیم کن:
   - در همان صفحه Firestore Database، به تب "Rules" برو
   - این کد را جایگزین کن:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /transactions/{document=**} {
      allow read, write: if true;
    }
  }
}

   - روی دکمه "Publish" کلیک کن

4. بررسی کن که همه چیز درست است:
   - مطمئن شو که Firestore فعال است
   - مطمئن شو که Rules منتشر شده است
   - یک پیام تأیید برای من بفرست

لطفاً تمام مراحل را انجام بده و در پایان به من بگو که همه چیز آماده است یا اگر مشکلی پیش آمد، آن را به من بگو.
```

---

## نحوه استفاده:

1. این متن را کپی کنید
2. به [Google Gemini](https://gemini.google.com/) بروید
3. متن را پیست کنید
4. Gemini تمام کارها را انجام می‌دهد

---

## نکات:

- Gemini باید به حساب Google شما دسترسی داشته باشد
- اگر Gemini نتوانست دسترسی داشته باشد، از شما اجازه می‌خواهد
- بعد از انجام، صفحه را Refresh کنید

