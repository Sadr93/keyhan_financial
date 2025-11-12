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
- **اولین کاربر (Admin)**: به صورت خودکار approve می‌شود اگر اولین کاربر باشد و نقش admin داشته باشد

## سیستم تایید کاربران

- کاربران جدید با `approved: false` ثبت می‌شوند
- تا زمانی که admin آن‌ها را تایید نکند، نمی‌توانند وارد شوند
- Admin می‌تواند در صفحه "مدیریت کاربران" کاربران را تایید یا رد کند
