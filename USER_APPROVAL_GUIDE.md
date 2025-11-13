# راهنمای تایید کاربران در Firebase

## روش تایید کاربران

### روش 1: از طریق Firebase Console (ساده‌ترین روش)

1. به [Firebase Console](https://console.firebase.google.com/) بروید
2. پروژه `keyhan-financial` را انتخاب کنید
3. از منوی سمت چپ **Firestore Database** را کلیک کنید
4. Collection **users** را باز کنید
5. Document مربوط به کاربری که می‌خواهید تایید کنید را پیدا کنید (Document ID همان UID کاربر از Authentication است)
6. روی Document کلیک کنید
7. فیلد `approved` را پیدا کنید و مقدار آن را از `false` به `true` تغییر دهید
8. روی **Update** کلیک کنید

### روش 2: پیدا کردن UID کاربر

اگر نمی‌دانید کدام Document مربوط به کاربر است:

1. به [Firebase Console > Authentication > Users](https://console.firebase.google.com/project/keyhan-financial/authentication/users) بروید
2. ایمیل کاربر را پیدا کنید
3. روی کاربر کلیک کنید
4. **User UID** را کپی کنید
5. به Firestore بروید و Document با همین ID را پیدا کنید
6. فیلد `approved` را به `true` تغییر دهید

### روش 3: ایجاد دستی کاربر (اگر کاربر در Authentication وجود ندارد)

1. به [Firebase Console > Authentication > Users](https://console.firebase.google.com/project/keyhan-financial/authentication/users) بروید
2. روی **Add user** کلیک کنید
3. ایمیل و رمز عبور را وارد کنید
4. **User UID** را کپی کنید
5. به Firestore بروید
6. Collection **users** را باز کنید (یا ایجاد کنید)
7. روی **Add document** کلیک کنید
8. Document ID: UID کاربر را وارد کنید
9. فیلدهای زیر را اضافه کنید:
   - `name` (string): نام کاربر
   - `email` (string): ایمیل کاربر
   - `role` (string): `viewer`, `editor` یا `admin`
   - `approved` (boolean): `true`
   - `createdAt` (timestamp): تاریخ فعلی

## نکات مهم

- اولین کاربری که با نقش `admin` ثبت‌نام می‌کند، به صورت خودکار تایید می‌شود
- کاربران دیگر باید توسط مدیر تایید شوند
- بعد از تایید، کاربر می‌تواند وارد سیستم شود

## بررسی وضعیت کاربر

برای بررسی اینکه کاربر تایید شده است یا نه:

1. به Firestore > Collection `users` بروید
2. Document کاربر را پیدا کنید
3. فیلد `approved` را بررسی کنید:
   - `true`: کاربر تایید شده و می‌تواند وارد شود
   - `false`: کاربر در انتظار تایید است

