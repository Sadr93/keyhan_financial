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
    
    // Helper function: دریافت نقش کاربر
    function getUserRole() {
      let userData = get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
      return userData != null && userData.role != null ? userData.role : 'viewer';
    }
    
    // Helper function: بررسی اینکه کاربر تایید شده است
    function isUserApproved() {
      let userData = get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
      return userData != null && userData.approved == true;
    }
    
    // Collection: users
    match /users/{userId} {
      // کاربران می‌توانند اطلاعات خودشان را بخوانند
      allow read: if isSignedIn() && request.auth.uid == userId;
      // همه کاربران لاگین شده می‌توانند لیست کاربران را ببینند (برای admin)
      allow list: if isSignedIn();
      
      // ایجاد: کاربران می‌توانند خودشان را ثبت‌نام کنند (با approved: false)
      // نکته: userId باید با request.auth.uid یکسان باشد (یعنی کاربر خودش را ثبت می‌کند)
      allow create: if request.auth != null && request.auth.uid == userId && 
                     request.resource.data.approved == false;
      
      // اجازه update برای approve کردن (برای اولین admin که خودش را approve می‌کند)
      // یا برای admin هایی که کاربران دیگر را approve می‌کنند
      
      // ویرایش: فقط admin می‌تواند کاربران را ویرایش کند (تایید/رد)
      allow update: if isSignedIn() && getUserRole() == 'admin';
      
      // حذف: فقط admin
      allow delete: if isSignedIn() && getUserRole() == 'admin';
    }
    
    // Collection: transactions
    match /transactions/{transactionId} {
      // همه کاربران لاگین شده و تایید شده می‌توانند تراکنش‌ها را بخوانند
      allow read: if isSignedIn() && isUserApproved();
      
      // ایجاد تراکنش: editor و admin (باید تایید شده باشند)
      allow create: if isSignedIn() && isUserApproved() && 
                     (getUserRole() == 'editor' || getUserRole() == 'admin');
      
      // ویرایش تراکنش: editor و admin (باید تایید شده باشند)
      allow update: if isSignedIn() && isUserApproved() && 
                     (getUserRole() == 'editor' || getUserRole() == 'admin');
      
      // حذف تراکنش: فقط admin (باید تایید شده باشد)
      allow delete: if isSignedIn() && isUserApproved() && getUserRole() == 'admin';
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
- **اولین کاربر (Admin)**: باید به صورت دستی در Firebase Console تنظیم شود:
  1. اولین کاربر را ثبت‌نام کنید (یا خودتان را)
  2. به Firebase Console > Firestore Database بروید
  3. Collection `users` را پیدا کنید
  4. Document مربوط به کاربر را باز کنید
  5. فیلد `approved` را به `true` تغییر دهید
  6. فیلد `role` را به `admin` تغییر دهید
  7. حالا می‌توانید وارد شوید و کاربران دیگر را تایید کنید

## سیستم تایید کاربران

- کاربران جدید با `approved: false` ثبت می‌شوند
- تا زمانی که admin آن‌ها را تایید نکند، نمی‌توانند وارد شوند
- Admin می‌تواند در صفحه "مدیریت کاربران" کاربران را تایید یا رد کند

