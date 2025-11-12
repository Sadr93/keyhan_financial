# Security Rules برای Firestore با Authentication

بعد از فعال‌سازی Authentication، این Security Rules را در Firebase Console تنظیم کنید:

## مراحل تنظیم

1. به [Firebase Console](https://console.firebase.google.com/) بروید
2. پروژه `keyhan-financial` را انتخاب کنید
3. از منوی سمت چپ **Firestore Database** را کلیک کنید
4. به تب **Rules** بروید
5. این کد را جایگزین کنید:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function: بررسی اینکه کاربر لاگین است
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Helper function: بررسی اینکه کاربر تایید شده است
    function isUserApproved() {
      return exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.approved == true;
    }
    
    // Helper function: دریافت نقش کاربر
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }
    
    // Helper function: بررسی اینکه کاربر admin است
    function isAdmin() {
      return exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.approved == true;
    }
    
    // Collection: users
    match /users/{userId} {
      // کاربران می‌توانند اطلاعات خودشان را بخوانند
      allow read: if isSignedIn() && request.auth.uid == userId;
      // همه کاربران لاگین شده می‌توانند لیست کاربران را ببینند (برای admin)
      allow list: if isSignedIn();
      
      // ایجاد: کاربران می‌توانند خودشان را ثبت‌نام کنند (با approved: false)
      allow create: if request.auth != null && 
                     request.auth.uid == userId && 
                     request.resource.data.approved == false;
      
      // ویرایش: 
      // 1. کاربر می‌تواند خودش را approve کند (برای اولین admin)
      // 2. یا admin می‌تواند کاربران دیگر را approve/رد کند
      allow update: if isSignedIn() && (
        (request.auth.uid == userId && 
         !resource.data.approved && 
         request.resource.data.approved == true) ||
        (isAdmin())
      );
      
      // حذف: فقط admin
      allow delete: if isSignedIn() && isAdmin();
    }
    
    // Collection: transactions
    match /transactions/{transactionId} {
      // همه کاربران لاگین شده و تایید شده می‌توانند تراکنش‌ها را بخوانند
      allow read: if isSignedIn() && isUserApproved();
      
      // ایجاد تراکنش: editor و admin (باید تایید شده باشند)
      allow create: if isSignedIn() && 
                     isUserApproved() && 
                     (getUserRole() == 'editor' || isAdmin());
      
      // ویرایش تراکنش: editor و admin (باید تایید شده باشند)
      allow update: if isSignedIn() && 
                     isUserApproved() && 
                     (getUserRole() == 'editor' || isAdmin());
      
      // حذف تراکنش: فقط admin (باید تایید شده باشد)
      allow delete: if isSignedIn() && isUserApproved() && isAdmin();
    }
  }
}
```

6. روی دکمه **Publish** کلیک کنید

## توضیحات

- **viewer**: فقط می‌تواند تراکنش‌ها را مشاهده کند
- **editor**: می‌تواند تراکنش‌ها را مشاهده، اضافه و ویرایش کند
- **admin**: دسترسی کامل (مشاهده، اضافه، ویرایش، حذف)

## نکات مهم

- قبل از تنظیم این Rules، مطمئن شوید که Authentication فعال است
- **اولین کاربر (Admin)**: باید به صورت دستی در Firebase Console admin شود

## 🔧 راهنمای Admin کردن اولین کاربر (گام به گام)

> **⚠️ مهم**: اگر بعد از ثبت‌نام Collection "users" ایجاد نمی‌شود، به فایل `MANUAL_SETUP_GUIDE.md` مراجعه کنید که راهنمای کامل ایجاد دستی Collection را دارد.

### مرحله 1: ثبت‌نام اولین کاربر
1. در سایت ثبت‌نام کنید (نقش را "admin" انتخاب کنید)
2. بعد از ثبت‌نام، باید پیام "ثبت‌نام با موفقیت انجام شد" را ببینید
3. **مهم**: اگر خطای "Security Rules" دیدید، ابتدا Security Rules را تنظیم کنید (مرحله 2)

### مرحله 2: تنظیم Security Rules
1. به [Firebase Console > Firestore > Rules](https://console.firebase.google.com/project/keyhan-financial/firestore/rules) بروید
2. کد Security Rules بالا را کپی و جایگزین کنید
3. روی **Publish** کلیک کنید
4. منتظر بمانید تا "Rules published successfully" نمایش داده شود

### مرحله 3: بررسی ایجاد Collection "users"
1. به [Firebase Console > Firestore Database](https://console.firebase.google.com/project/keyhan-financial/firestore) بروید
2. باید Collection به نام **`users`** را ببینید
3. اگر نمی‌بینید:
   - دوباره ثبت‌نام کنید (بعد از تنظیم Security Rules)
   - یا Console مرورگر را باز کنید (F12) و ببینید آیا خطایی هست

### مرحله 4: Admin کردن کاربر در Firebase Console
1. در Firebase Console > Firestore Database، Collection **`users`** را باز کنید
2. Document مربوط به کاربر خودتان را پیدا کنید (UID را می‌توانید از Console مرورگر ببینید)
3. روی Document کلیک کنید
4. فیلد **`approved`** را پیدا کنید و مقدار آن را از `false` به `true` تغییر دهید
5. فیلد **`role`** را بررسی کنید - باید `admin` باشد
6. اگر `role` وجود ندارد یا `viewer` است، آن را به `admin` تغییر دهید
7. روی **Update** کلیک کنید

### مرحله 5: ورود به سایت
1. حالا می‌توانید با ایمیل و رمز عبور خود وارد سایت شوید
2. باید بتوانید تراکنش‌ها را ببینید
3. در منوی بالا باید دکمه **"مدیریت کاربران"** را ببینید
4. می‌توانید کاربران دیگر را تایید یا رد کنید

## سیستم تایید کاربران

- کاربران جدید با `approved: false` ثبت می‌شوند
- تا زمانی که admin آن‌ها را تایید نکند، نمی‌توانند وارد شوند
- Admin می‌تواند در صفحه "مدیریت کاربران" کاربران را تایید یا رد کند

## 🔍 عیب‌یابی

### مشکل: Collection "users" ایجاد نمی‌شود
**راه حل:**
1. Console مرورگر را باز کنید (F12)
2. دوباره ثبت‌نام کنید
3. اگر خطای `permission-denied` دیدید:
   - Security Rules را بررسی کنید
   - مطمئن شوید که Rules را Publish کرده‌اید
   - صفحه را Refresh کنید و دوباره امتحان کنید

### مشکل: نمی‌توانم کاربر را در Firebase Console پیدا کنم
**راه حل:**
1. Console مرورگر را باز کنید (F12)
2. بعد از ثبت‌نام، باید پیام `✅ کاربر در Firestore ثبت شد: [UID]` را ببینید
3. UID را کپی کنید
4. در Firebase Console، Collection `users` را باز کنید
5. Document با همان UID را پیدا کنید

### مشکل: بعد از Admin کردن، هنوز نمی‌توانم وارد شوم
**راه حل:**
1. مطمئن شوید که `approved: true` و `role: admin` را در Firebase Console تنظیم کرده‌اید
2. صفحه سایت را Refresh کنید (F5)
3. دوباره وارد شوید
