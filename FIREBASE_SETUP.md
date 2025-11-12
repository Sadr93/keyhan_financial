# راهنمای راه‌اندازی Firebase

## چرا Firebase؟

- ✅ رایگان (تا 50,000 خواندن/نوشتن در روز)
- ✅ از Google (هماهنگ با اکوسیستم شما)
- ✅ بدون نیاز به سرور
- ✅ Real-time sync
- ✅ امن و قابل اعتماد

## مراحل راه‌اندازی

### 1. ایجاد پروژه Firebase

1. به [Firebase Console](https://console.firebase.google.com/) بروید
2. روی **Add project** کلیک کنید
3. نام پروژه را وارد کنید (مثلاً: `keyhan-financial`)
4. Google Analytics را می‌توانید فعال یا غیرفعال کنید (اختیاری)
5. روی **Create project** کلیک کنید
6. منتظر بمانید تا پروژه ایجاد شود

### 2. فعال‌سازی Firestore Database

1. در Firebase Console، از منوی سمت چپ **Firestore Database** را انتخاب کنید
2. روی **Create database** کلیک کنید
3. **Start in test mode** را انتخاب کنید (برای شروع)
4. Location را انتخاب کنید (مثلاً: `us-central1` یا نزدیک‌ترین به شما)
5. روی **Enable** کلیک کنید

**⚠️ مهم:** بعداً باید Security Rules را تنظیم کنید (در انتهای راهنما)

### 3. دریافت تنظیمات Firebase

1. در Firebase Console، روی آیکون ⚙️ (Settings) کنار "Project Overview" کلیک کنید
2. **Project settings** را انتخاب کنید
3. به پایین اسکرول کنید تا **Your apps** را ببینید
4. روی آیکون **Web** (`</>`) کلیک کنید
5. نام App را وارد کنید (مثلاً: `Keyhan Financial Web`)
6. روی **Register app** کلیک کنید
7. **Firebase SDK snippet** را کپی کنید
8. مقادیر را در فایل `firebase-config.js` قرار دهید:

```javascript
const FIREBASE_CONFIG = {
    apiKey: "AIza...", // از Firebase کپی کنید
    authDomain: "keyhan-financial.firebaseapp.com",
    projectId: "keyhan-financial",
    storageBucket: "keyhan-financial.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123"
};
```

### 4. تنظیم Security Rules (مهم!)

1. در Firestore Database، به تب **Rules** بروید
2. این کد را جایگزین کنید:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // اجازه خواندن و نوشتن برای همه (برای شروع)
    // بعداً می‌توانید Authentication اضافه کنید
    match /transactions/{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. روی **Publish** کلیک کنید

**⚠️ امنیت:** این قوانین به همه اجازه دسترسی می‌دهند. برای استفاده production، باید Authentication اضافه کنید.

### 5. تست

1. صفحه را Refresh کنید
2. یک تراکنش ثبت کنید
3. به Firebase Console > Firestore Database بروید
4. باید collection `transactions` را ببینید
5. داده‌ها باید در آنجا ذخیره شده باشند

## عیب‌یابی

### مشکل: "Firebase is not defined"
- بررسی کنید که `firebase-config.js` قبل از `app.js` لود شده باشد
- بررسی کنید که Firebase SDK لود شده باشد
- Console مرورگر را بررسی کنید

### مشکل: "Permission denied"
- Security Rules را بررسی کنید
- مطمئن شوید که Rules را Publish کرده‌اید

### مشکل: داده‌ها ذخیره نمی‌شوند
- Console مرورگر را بررسی کنید
- Firestore Database را در Firebase Console بررسی کنید
- بررسی کنید که Firestore فعال است

## امنیت (برای Production)

برای استفاده production، باید Authentication اضافه کنید:

1. در Firebase Console، **Authentication** را فعال کنید
2. **Sign-in method** را تنظیم کنید (مثلاً: Email/Password)
3. Security Rules را تغییر دهید:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /transactions/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## محدودیت‌های رایگان

- **50,000 خواندن/نوشتن در روز** - برای استفاده معمولی کافی است
- **20 GB storage** - برای داده‌های مالی کافی است
- **1 GB download** - برای استفاده معمولی کافی است

## پشتیبان‌گیری

داده‌ها در Firebase ذخیره می‌شوند و می‌توانید:
1. از دکمه "خروجی Excel" استفاده کنید
2. یا از Firebase Console > Firestore > Export استفاده کنید

## هزینه

- **رایگان** تا 50,000 عملیات در روز
- بعد از آن: $0.06 برای هر 100,000 عملیات

برای استفاده معمولی (مثلاً 100 تراکنش در روز)، کاملاً رایگان است!

