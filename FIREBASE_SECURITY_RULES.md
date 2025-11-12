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
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }
    
    // Collection: users
    match /users/{userId} {
      // کاربران می‌توانند اطلاعات خودشان را بخوانند
      allow read: if isSignedIn() && request.auth.uid == userId;
      // فقط admin می‌تواند کاربران را ایجاد/ویرایش کند
      allow write: if isSignedIn() && getUserRole() == 'admin';
    }
    
    // Collection: transactions
    match /transactions/{transactionId} {
      // همه کاربران لاگین شده می‌توانند تراکنش‌ها را بخوانند
      allow read: if isSignedIn();
      
      // ایجاد تراکنش: editor و admin
      allow create: if isSignedIn() && (getUserRole() == 'editor' || getUserRole() == 'admin');
      
      // ویرایش تراکنش: editor و admin
      allow update: if isSignedIn() && (getUserRole() == 'editor' || getUserRole() == 'admin');
      
      // حذف تراکنش: فقط admin
      allow delete: if isSignedIn() && getUserRole() == 'admin';
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
- اولین کاربر باید به صورت دستی در Firebase Console به عنوان admin تنظیم شود
- یا می‌توانید اولین کاربر را در زمان ثبت‌نام به عنوان admin ثبت کنید

