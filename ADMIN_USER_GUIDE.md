# راهنمای ایجاد کاربران در Firebase Console

از این پس، ثبت‌نام از طریق سایت انجام نمی‌شود. شما باید کاربران را به صورت دستی در Firebase Console ایجاد کنید.

## مراحل ایجاد کاربر جدید

### مرحله 1: ایجاد کاربر در Firebase Authentication

1. به [Firebase Console > Authentication > Users](https://console.firebase.google.com/project/keyhan-financial/authentication/users) بروید
2. روی دکمه **Add user** کلیک کنید
3. **Email** و **Password** را وارد کنید
4. روی **Add user** کلیک کنید
5. **UID** کاربر را کپی کنید (مثلاً: `abc123def456...`)

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
   - `role` (string): یکی از این مقادیر:
     - `viewer`: فقط مشاهده تراکنش‌ها
     - `editor`: مشاهده و ویرایش تراکنش‌ها
     - `admin`: دسترسی کامل (مشاهده، ویرایش، حذف، مدیریت کاربران)
   - `approved` (boolean): `true` (برای فعال کردن کاربر)
   - `createdAt` (timestamp): تاریخ فعلی (اختیاری)
5. روی **Save** کلیک کنید

### مرحله 3: دادن اطلاعات به کاربر

اطلاعات زیر را به کاربر بدهید:
- **ایمیل**: همان ایمیلی که در Authentication وارد کردید
- **رمز عبور**: همان رمز عبوری که در Authentication وارد کردید
- **لینک سایت**: آدرس سایت شما

کاربر می‌تواند با این اطلاعات وارد سایت شود.

---

## مثال کامل

فرض کنید می‌خواهید کاربری با نام "علی احمدی" و ایمیل "ali@example.com" ایجاد کنید:

### مرحله 1: Authentication
1. به Authentication > Users بروید
2. Add user > Email: `ali@example.com`, Password: `123456` (یا رمز قوی‌تر)
3. Add user
4. UID را کپی کنید: `xyz789abc123...`

### مرحله 2: Firestore
1. به Firestore Database بروید
2. Collection "users" را باز کنید (یا ایجاد کنید)
3. Document ID: `xyz789abc123...` (همان UID)
4. فیلدها:
   - `name`: `علی احمدی`
   - `email`: `ali@example.com`
   - `role`: `editor`
   - `approved`: `true`
5. Save

### مرحله 3: دادن اطلاعات
به علی بگویید:
- ایمیل: `ali@example.com`
- رمز عبور: `123456`
- لینک سایت: `https://your-site.netlify.app`

---

## نقش‌های کاربری

- **viewer**: فقط می‌تواند تراکنش‌ها را مشاهده کند
- **editor**: می‌تواند تراکنش‌ها را مشاهده، اضافه و ویرایش کند
- **admin**: دسترسی کامل (مشاهده، اضافه، ویرایش، حذف تراکنش‌ها + مدیریت کاربران)

---

## نکات مهم

1. **همیشه `approved: true` را تنظیم کنید** - در غیر این صورت کاربر نمی‌تواند وارد شود
2. **UID را درست کپی کنید** - Document ID در Firestore باید دقیقاً همان UID از Authentication باشد
3. **رمز عبور قوی انتخاب کنید** - حداقل 6 کاراکتر (پیشنهاد: 8+ کاراکتر با حروف و اعداد)
4. **نقش را درست انتخاب کنید** - فقط `viewer`, `editor`, یا `admin`

---

## عیب‌یابی

### کاربر نمی‌تواند وارد شود
- بررسی کنید که `approved: true` در Firestore تنظیم شده باشد
- بررسی کنید که Document ID در Firestore دقیقاً همان UID از Authentication باشد
- بررسی کنید که ایمیل و رمز عبور درست باشد

### کاربر می‌تواند وارد شود اما نمی‌تواند تراکنش اضافه کند
- بررسی کنید که `role` درست تنظیم شده باشد (`editor` یا `admin`)
- بررسی کنید که `approved: true` باشد

