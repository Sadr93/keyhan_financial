# راهنمای دستی ایجاد Collection "users" در Firebase

اگر بعد از ثبت‌نام Collection "users" ایجاد نمی‌شود، می‌توانید به صورت دستی آن را ایجاد کنید.

> **💡 پیشنهاد**: ابتدا **روش 1** را امتحان کنید (ساده‌تر و سریع‌تر است)

## روش 1: ایجاد دستی Collection و Document (ساده‌تر)

### مرحله 1: تنظیم Security Rules موقت (برای اولین بار)

1. به [Firebase Console > Firestore > Rules](https://console.firebase.google.com/project/keyhan-financial/firestore/rules) بروید
2. این کد **موقت** را جایگزین کنید (فقط برای اولین بار):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // موقت: اجازه ایجاد Collection users (فقط برای اولین بار)
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow list: if request.auth != null;
    }
    
    // موقت: اجازه ایجاد Collection transactions (فقط برای اولین بار)
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. روی **Publish** کلیک کنید

### مرحله 2: ثبت‌نام در سایت

1. در سایت ثبت‌نام کنید (نقش را "admin" انتخاب کنید)
2. حالا باید Collection "users" ایجاد شود
3. Console مرورگر را باز کنید (F12) و ببینید آیا پیام `✅ کاربر در Firestore ثبت شد` را می‌بینید

### مرحله 3: Admin کردن کاربر

1. به [Firebase Console > Firestore Database](https://console.firebase.google.com/project/keyhan-financial/firestore) بروید
2. Collection **`users`** را باز کنید
3. Document مربوط به کاربر خودتان را پیدا کنید
4. روی Document کلیک کنید
5. فیلد **`approved`** را از `false` به `true` تغییر دهید
6. فیلد **`role`** را بررسی کنید - باید `admin` باشد
7. روی **Update** کلیک کنید

### مرحله 4: بازگرداندن Security Rules اصلی

1. به [Firebase Console > Firestore > Rules](https://console.firebase.google.com/project/keyhan-financial/firestore/rules) بروید
2. کد Security Rules اصلی را از فایل `FIREBASE_SECURITY_RULES.md` کپی کنید
3. جایگزین کنید
4. روی **Publish** کلیک کنید

### مرحله 5: ورود به سایت

1. با ایمیل و رمز عبور خود وارد شوید
2. باید بتوانید تراکنش‌ها را ببینید

---

## روش 2: ایجاد دستی Collection و Document (بدون تغییر Security Rules)

اگر نمی‌خواهید Security Rules را تغییر دهید، می‌توانید به صورت دستی Collection و Document ایجاد کنید:

### مرحله 1: ایجاد Collection "users"

1. به [Firebase Console > Firestore Database](https://console.firebase.google.com/project/keyhan-financial/firestore) بروید
2. روی **Start collection** کلیک کنید
3. Collection ID را `users` بنویسید
4. روی **Next** کلیک کنید

### مرحله 2: ایجاد Document برای کاربر

1. Document ID را از Console مرورگر کپی کنید:
   - در سایت ثبت‌نام کنید
   - Console مرورگر را باز کنید (F12)
   - بعد از ثبت‌نام، باید خطای `permission-denied` ببینید
   - در خطا، UID کاربر را پیدا کنید (مثلاً: `abc123def456...`)
   - یا از Firebase Console > Authentication > Users، UID را کپی کنید

2. در Firestore:
   - Document ID را وارد کنید (همان UID)
   - روی **Add field** کلیک کنید
   - فیلدها را اضافه کنید:
     - `name` (string): نام کاربر
     - `email` (string): ایمیل کاربر
     - `role` (string): `admin`
     - `approved` (boolean): `true`
     - `createdAt` (timestamp): تاریخ فعلی

3. روی **Save** کلیک کنید

### مرحله 3: تنظیم Security Rules اصلی

1. به [Firebase Console > Firestore > Rules](https://console.firebase.google.com/project/keyhan-financial/firestore/rules) بروید
2. کد Security Rules اصلی را از فایل `FIREBASE_SECURITY_RULES.md` کپی کنید
3. جایگزین کنید
4. روی **Publish** کلیک کنید

### مرحله 4: ورود به سایت

1. با ایمیل و رمز عبور خود وارد شوید
2. باید بتوانید تراکنش‌ها را ببینید

---

## روش 3: استفاده از Firebase Console برای ایجاد Document (سریع‌تر)

### مرحله 1: دریافت UID کاربر

1. به [Firebase Console > Authentication > Users](https://console.firebase.google.com/project/keyhan-financial/authentication/users) بروید
2. کاربر خودتان را پیدا کنید
3. UID را کپی کنید (مثلاً: `abc123def456...`)

### مرحله 2: ایجاد Document در Firestore

1. به [Firebase Console > Firestore Database](https://console.firebase.google.com/project/keyhan-financial/firestore) بروید
2. اگر Collection "users" وجود ندارد:
   - روی **Start collection** کلیک کنید
   - Collection ID: `users`
   - روی **Next** کلیک کنید
3. Document ID را وارد کنید (همان UID که کپی کردید)
4. فیلدها را اضافه کنید:
   - `name` (string): نام کاربر
   - `email` (string): ایمیل کاربر
   - `role` (string): `admin`
   - `approved` (boolean): `true`
   - `createdAt` (timestamp): روی **Set** کلیک کنید و تاریخ فعلی را انتخاب کنید
5. روی **Save** کلیک کنید

### مرحله 3: تنظیم Security Rules

1. به [Firebase Console > Firestore > Rules](https://console.firebase.google.com/project/keyhan-financial/firestore/rules) بروید
2. کد Security Rules اصلی را از فایل `FIREBASE_SECURITY_RULES.md` کپی کنید
3. جایگزین کنید
4. روی **Publish** کلیک کنید

### مرحله 4: ورود به سایت

1. با ایمیل و رمز عبور خود وارد شوید
2. باید بتوانید تراکنش‌ها را ببینید

---

## عیب‌یابی

### مشکل: نمی‌توانم UID را پیدا کنم
**راه حل:**
1. به Firebase Console > Authentication > Users بروید
2. کاربر خودتان را پیدا کنید
3. UID در ستون اول نمایش داده می‌شود

### مشکل: بعد از ایجاد Document، هنوز نمی‌توانم وارد شوم
**راه حل:**
1. مطمئن شوید که `approved: true` و `role: admin` را تنظیم کرده‌اید
2. صفحه سایت را Refresh کنید (F5)
3. دوباره وارد شوید

### مشکل: Security Rules را نمی‌توانم Publish کنم
**راه حل:**
1. Console مرورگر را باز کنید (F12)
2. خطاهای syntax را بررسی کنید
3. مطمئن شوید که تمام کد را کپی کرده‌اید

