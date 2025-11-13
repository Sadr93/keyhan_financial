# Security Rules برای Firestore (بدون Authentication)

از آنجایی که Authentication از localStorage استفاده می‌کند، Security Rules ساده‌تر می‌شود.

## مراحل تنظیم

1. به [Firebase Console > Firestore > Rules](https://console.firebase.google.com/project/keyhan-financial/firestore/rules) بروید
2. این کد را جایگزین کنید:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Collection: transactions
    // اجازه خواندن و نوشتن برای همه (چون Authentication از localStorage است)
    match /transactions/{transactionId} {
      allow read, write: if true;
    }
  }
}
```

3. روی **Publish** کلیک کنید

## ⚠️ نکته امنیتی

این Security Rules به همه اجازه دسترسی می‌دهد. برای استفاده production، باید:
- Authentication را در Firebase فعال کنید
- یا Security Rules را محدودتر کنید (مثلاً فقط از IP های خاص)

اما برای استفاده داخلی و محدود، این کافی است.

