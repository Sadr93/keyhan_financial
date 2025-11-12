# پرامپت کامل برای Gemini - تنظیمات خودکار Firebase

## نسخه فارسی (برای کپی):

```
سلام! من یک پروژه Firebase دارم به نام "keyhan-financial" (Project ID: keyhan-financial) و می‌خواهم Firestore Database را برای یک سیستم مدیریت مالی راه‌اندازی کنم.

لطفاً این مراحل را به ترتیب و با دقت انجام بده:

**مرحله 1: فعال‌سازی Firestore Database**
- به Firebase Console برو: https://console.firebase.google.com/
- پروژه "keyhan-financial" را انتخاب کن
- از منوی سمت چپ، روی "Firestore Database" کلیک کن
- اگر پیام "Create database" می‌بینی:
  * روی دکمه "Create database" کلیک کن
  * گزینه "Start in test mode" را انتخاب کن (این برای شروع است و بعداً می‌توانیم تغییر دهیم)
  * در قسمت "Cloud Firestore location"، یک location انتخاب کن (ترجیحاً us-central1 یا نزدیک‌ترین به ایران)
  * روی دکمه "Enable" کلیک کن
  * منتظر بمان تا Firestore فعال شود (چند ثانیه طول می‌کشد)

**مرحله 2: تنظیم Security Rules**
- بعد از فعال شدن Firestore، در همان صفحه به تب "Rules" برو
- کد موجود را پاک کن و این کد را جایگزین کن:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /transactions/{document=**} {
      allow read, write: if true;
    }
  }
}

- روی دکمه "Publish" کلیک کن
- منتظر بمان تا Rules منتشر شود

**مرحله 3: بررسی و تأیید**
- مطمئن شو که:
  * Firestore Database فعال است (در تب "Data" باید صفحه خالی ببینی)
  * Security Rules منتشر شده است (در تب "Rules" باید کد جدید را ببینی)
  * هیچ خطایی وجود ندارد

**مرحله 4: گزارش نهایی**
- به من بگو که:
  * آیا Firestore با موفقیت فعال شد؟
  * آیا Security Rules منتشر شد؟
  * Location انتخاب شده چیست؟
  * آیا مشکلی وجود دارد؟

لطفاً تمام مراحل را به ترتیب انجام بده و در پایان یک گزارش کامل برای من بفرست. اگر در هر مرحله‌ای مشکلی پیش آمد، فوراً به من اطلاع بده.
```

---

## نسخه انگلیسی (اگر Gemini به فارسی پاسخ نمی‌دهد):

```
Hello! I have a Firebase project called "keyhan-financial" (Project ID: keyhan-financial) and I need to set up Firestore Database for a financial management system.

Please complete these steps in order and carefully:

**Step 1: Enable Firestore Database**
- Go to Firebase Console: https://console.firebase.google.com/
- Select the project "keyhan-financial"
- From the left menu, click on "Firestore Database"
- If you see "Create database" message:
  * Click the "Create database" button
  * Select "Start in test mode" option (this is for now, we can change it later)
  * In "Cloud Firestore location", select a location (preferably us-central1 or closest to Iran)
  * Click the "Enable" button
  * Wait for Firestore to be enabled (takes a few seconds)

**Step 2: Configure Security Rules**
- After Firestore is enabled, go to the "Rules" tab in the same page
- Delete the existing code and replace it with this:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /transactions/{document=**} {
      allow read, write: if true;
    }
  }
}

- Click the "Publish" button
- Wait for Rules to be published

**Step 3: Verification**
- Make sure that:
  * Firestore Database is enabled (in "Data" tab you should see an empty page)
  * Security Rules are published (in "Rules" tab you should see the new code)
  * There are no errors

**Step 4: Final Report**
- Tell me:
  * Was Firestore successfully enabled?
  * Were Security Rules published?
  * What location was selected?
  * Are there any issues?

Please complete all steps in order and send me a complete report at the end. If you encounter any issues at any step, inform me immediately.
```

---

## نحوه استفاده:

1. متن بالا را کپی کنید (فارسی یا انگلیسی)
2. به [Google Gemini](https://gemini.google.com/) بروید
3. متن را در چت Gemini پیست کنید
4. Gemini تمام کارها را انجام می‌دهد

---

## نکات مهم:

- ✅ Gemini باید به حساب Google شما دسترسی داشته باشد
- ✅ اگر Gemini نتوانست دسترسی داشته باشد، از شما اجازه می‌خواهد
- ✅ بعد از انجام، صفحه وب را Refresh کنید
- ✅ اگر مشکلی پیش آمد، Gemini به شما اطلاع می‌دهد

---

## بعد از انجام:

1. صفحه را Refresh کنید
2. یک تراکنش تست ثبت کنید
3. به Firebase Console > Firestore Database بروید
4. باید collection "transactions" را ببینید ✅

