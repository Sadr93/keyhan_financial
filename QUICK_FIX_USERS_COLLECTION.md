# راهنمای سریع: ایجاد Collection "users" در Firebase

## مشکل: کاربر در Authentication ایجاد شده اما Collection "users" ایجاد نشده

### راه حل سریع:

#### مرحله 1: پیدا کردن UID کاربر

1. به [Firebase Console > Authentication > Users](https://console.firebase.google.com/project/keyhan-financial/authentication/users) بروید
2. کاربری که ایجاد کرده‌اید را پیدا کنید
3. روی کاربر کلیک کنید
4. **User UID** را کپی کنید (مثلاً: `abc123xyz456...`)

#### مرحله 2: ایجاد Collection "users" به صورت دستی

1. به [Firebase Console > Firestore Database](https://console.firebase.google.com/project/keyhan-financial/firestore) بروید
2. روی **Start collection** کلیک کنید (یا اگر Collection دیگری وجود دارد، روی **Add collection** کلیک کنید)
3. Collection ID: `users` را وارد کنید
4. روی **Next** کلیک کنید
5. Document ID: UID کاربر را که در مرحله 1 کپی کردید، وارد کنید
6. فیلدهای زیر را اضافه کنید:
   - Field: `name` | Type: `string` | Value: نام کاربر (مثلاً: "مدیر سیستم")
   - Field: `email` | Type: `string` | Value: ایمیل کاربر
   - Field: `role` | Type: `string` | Value: `admin` (یا `editor` یا `viewer`)
   - Field: `approved` | Type: `boolean` | Value: `true` (برای تایید فوری)
   - Field: `createdAt` | Type: `timestamp` | Value: تاریخ فعلی (یا از **Set** استفاده کنید)
7. روی **Save** کلیک کنید

#### مرحله 3: بررسی Security Rules

1. به [Firebase Console > Firestore > Rules](https://console.firebase.google.com/project/keyhan-financial/firestore/rules) بروید
2. مطمئن شوید که Security Rules از فایل `FIREBASE_SECURITY_RULES.md` کپی شده است
3. اگر Security Rules تنظیم نشده، آن را از فایل `FIREBASE_SECURITY_RULES.md` کپی کنید
4. روی **Publish** کلیک کنید

#### مرحله 4: تست ورود

1. به سایت برگردید
2. با ایمیل و رمز عبوری که ثبت‌نام کردید، وارد شوید
3. باید بتوانید وارد سیستم شوید

---

## اگر Security Rules مشکل دارد (موقت):

اگر Security Rules هنوز تنظیم نشده و می‌خواهید سریع تست کنید، می‌توانید این Rules موقت را استفاده کنید (⚠️ فقط برای تست):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // موقت: اجازه کامل برای users (فقط برای تست)
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
    
    // موقت: اجازه کامل برای transactions (فقط برای تست)
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

⚠️ **هشدار**: این Rules موقت است و فقط برای تست است. بعد از تست، حتماً Rules اصلی را از `FIREBASE_SECURITY_RULES.md` اعمال کنید.

