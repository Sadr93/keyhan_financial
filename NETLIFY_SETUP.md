# راهنمای کامل Deploy به Netlify

این راهنما به شما کمک می‌کند تا پروژه را از GitHub به Netlify deploy کنید.

## مراحل Deploy

### مرحله 1: اتصال GitHub به Netlify

1. به [Netlify](https://www.netlify.com/) بروید و وارد حساب کاربری شوید
2. روی دکمه **"Add new site"** کلیک کنید
3. **"Import an existing project"** را انتخاب کنید
4. **"Deploy with GitHub"** را انتخاب کنید
5. اگر اولین بار است، GitHub را authorize کنید
6. Repository **`keyhan_financial`** را انتخاب کنید
7. Branch **`main`** را انتخاب کنید

### مرحله 2: تنظیم Build Settings

در صفحه تنظیمات Netlify:

- **Build command:** `node build-config.js`
- **Publish directory:** `.` (یا خالی بگذارید)

**نکته:** این تنظیمات در فایل `netlify.toml` هم وجود دارند و به صورت خودکار اعمال می‌شوند.

### مرحله 3: تنظیم Environment Variables (مهم!)

قبل از Deploy، باید Environment Variables را در Netlify تنظیم کنید:

1. در صفحه تنظیمات Netlify، به بخش **"Environment variables"** بروید
2. روی **"Add variable"** کلیک کنید
3. این متغیرها را یکی یکی اضافه کنید:

```
FIREBASE_API_KEY = AIzaSyCdlsV7yH5CPYMa-59TtTkSHz6IHzDxdsE
FIREBASE_AUTH_DOMAIN = keyhan-financial.firebaseapp.com
FIREBASE_PROJECT_ID = keyhan-financial
FIREBASE_STORAGE_BUCKET = keyhan-financial.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID = 708113788753
FIREBASE_APP_ID = 1:708113788753:web:d4ea31e9a1733a0de06d70
FIREBASE_MEASUREMENT_ID = G-GYZQ0BKYFD
```

**نکته:** مقادیر بالا را با اطلاعات Firebase خود جایگزین کنید.

### مرحله 4: تنظیم Secret Scanning (برای جلوگیری از خطا)

برای جلوگیری از خطای "Exposed secrets detected"، این Environment Variable را هم اضافه کنید:

**Key:** `SECRETS_SCAN_OMIT_KEYS`  
**Value:** `FIREBASE_API_KEY,FIREBASE_APP_ID,FIREBASE_AUTH_DOMAIN,FIREBASE_MEASUREMENT_ID,FIREBASE_MESSAGING_SENDER_ID,FIREBASE_PROJECT_ID,FIREBASE_STORAGE_BUCKET`

**چرا؟** چون Firebase config برای client-side apps public است و نباید به عنوان secret تلقی شود.

### مرحله 5: Deploy

1. روی دکمه **"Deploy site"** کلیک کنید
2. Netlify به صورت خودکار:
   - Repository را clone می‌کند
   - Build command را اجرا می‌کند (که Environment Variables را در HTML جایگزین می‌کند)
   - فایل‌ها را deploy می‌کند

### مرحله 6: بررسی Deploy

بعد از Deploy:
- Netlify یک URL به شما می‌دهد (مثلاً: `https://random-name-123.netlify.app`)
- می‌توانید این URL را باز کنید و پروژه را تست کنید
- اگر مشکلی بود، در بخش **"Deploy logs"** می‌توانید لاگ‌ها را ببینید

## عیب‌یابی

### Build موفق نمی‌شود

- بررسی کنید که Environment Variables به درستی تنظیم شده‌اند
- در Deploy logs بررسی کنید که خطایی وجود دارد یا نه
- مطمئن شوید که Node.js در Netlify فعال است

### خطای "Exposed secrets detected"

- مطمئن شوید که Environment Variable `SECRETS_SCAN_OMIT_KEYS` را اضافه کرده‌اید
- بررسی کنید که مقادیر درست هستند

### Firebase کار نمی‌کند

- بررسی کنید که Environment Variables درست تنظیم شده‌اند
- Console مرورگر را باز کنید و خطاها را بررسی کنید
- مطمئن شوید که Firestore Security Rules تنظیم شده است

## نکات مهم

- ✅ Environment Variables در Netlify امن هستند و در کد source نمایش داده نمی‌شوند
- ✅ هر بار که Deploy می‌کنید، Firebase config از Environment Variables ساخته می‌شود
- ✅ اگر Environment Variables تنظیم نشوند، سیستم از localStorage استفاده می‌کند
- ✅ می‌توانید Environment Variables را در Netlify Dashboard تغییر دهید و دوباره Deploy کنید

## لینک‌های مفید

- [Netlify Documentation](https://docs.netlify.com/)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)
- [Firebase Setup Guide](./FIREBASE_SETUP.md)

