# راهنمای سریع Firebase (3 مرحله)

## ✅ مرحله 1: فعال‌سازی Firestore (30 ثانیه)

1. به [Firebase Console](https://console.firebase.google.com/) بروید
2. پروژه `keyhan-financial` را انتخاب کنید
3. از منوی سمت چپ **Firestore Database** را کلیک کنید
4. اگر دکمه **Create database** می‌بینید:
   - روی آن کلیک کنید
   - **Start in test mode** را انتخاب کنید
   - Location را انتخاب کنید (مثلاً: `us-central1`)
   - روی **Enable** کلیک کنید
5. اگر قبلاً ساخته‌اید، هیچ کاری نکنید ✅

## ✅ مرحله 2: تنظیم Security Rules (30 ثانیه)

1. در همان صفحه Firestore Database
2. به تب **Rules** بروید
3. این کد را جایگزین کنید:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /transactions/{document=**} {
      allow read, write: if true;
    }
  }
}
```

4. روی **Publish** کلیک کنید

## ✅ مرحله 3: تست (10 ثانیه)

1. صفحه را Refresh کنید
2. یک تراکنش ثبت کنید
3. به Firebase Console > Firestore Database بروید
4. باید collection `transactions` را ببینید ✅

---

## 🎉 تمام! 

حالا سیستم شما با Firebase کار می‌کند و داده‌ها در ابر ذخیره می‌شوند.

---

## ❓ اگر مشکلی پیش آمد:

### "Permission denied"
→ Security Rules را بررسی کنید (مرحله 2)

### "Collection not found"
→ Firestore را فعال کنید (مرحله 1)

### داده‌ها ذخیره نمی‌شوند
→ Console مرورگر را باز کنید (F12) و خطاها را ببینید

