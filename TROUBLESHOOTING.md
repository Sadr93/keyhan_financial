# راهنمای عیب‌یابی

## مشکل: "خطا در ثبت تراکنش"

### مرحله 1: بررسی Console مرورگر

1. صفحه را باز کنید
2. دکمه **F12** را بزنید (یا راست کلیک > Inspect)
3. به تب **Console** بروید
4. یک تراکنش را ثبت کنید
5. خطاها را ببینید

**خطاهای رایج:**

#### خطای CORS:
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```
**راه حل:** Apps Script را دوباره Deploy کنید

#### خطای 401 یا 403:
```
خطای سرور: 401
```
**راه حل:** Authorization را دوباره انجام دهید

#### خطای 404:
```
خطای سرور: 404
```
**راه حل:** URL در config.js را بررسی کنید

---

### مرحله 2: بررسی Google Sheet

1. Google Sheet را باز کنید
2. بررسی کنید که:
   - ✅ ردیف اول دارای هدر است: `تاریخ | نوع | دسته | زیردسته | مبلغ | توضیحات`
   - ✅ Sheet نام "Sheet1" دارد (یا نام Sheet فعال)
   - ✅ Sheet به حساب Google شما دسترسی دارد

---

### مرحله 3: بررسی Apps Script

1. Apps Script Editor را باز کنید
2. بررسی کنید که:
   - ✅ کد `apps-script.js` کامل کپی شده باشد
   - ✅ توابع `doPost` و `doGet` وجود داشته باشند
   - ✅ Deployment انجام شده باشد

---

### مرحله 4: تست مستقیم Apps Script

1. Apps Script Editor را باز کنید
2. یک تابع تست اضافه کنید:

```javascript
function test() {
  const testData = {
    action: 'add',
    date: '1403/01/01',
    type: 'درآمد',
    category: 'سایر',
    subcategory: '',
    amount: 1000,
    description: 'تست'
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const result = doPost(mockEvent);
  Logger.log(result.getContent());
}
```

3. تابع `test` را انتخاب کنید
4. روی دکمه **Run** کلیک کنید
5. Authorization را انجام دهید
6. به **View** > **Logs** بروید و نتیجه را ببینید

---

### مرحله 5: بررسی URL

1. URL را در مرورگر باز کنید (مستقیم)
2. باید یک JSON ببینید (نه صفحه Sign in)
3. اگر صفحه Sign in دیدید:
   - Authorization را دوباره انجام دهید
   - "Who has access" را روی "Anyone" بگذارید

---

### مرحله 6: بررسی Network

1. Console مرورگر را باز کنید (F12)
2. به تب **Network** بروید
3. یک تراکنش را ثبت کنید
4. درخواست POST را پیدا کنید
5. بررسی کنید:
   - Status Code (باید 200 باشد)
   - Response (باید JSON با `success: true` باشد)

---

## مشکل: "خطا در بارگذاری داده‌ها"

### بررسی کنید:

1. ✅ Sheet دارای داده است؟
2. ✅ هدر در ردیف اول وجود دارد؟
3. ✅ URL در config.js صحیح است؟
4. ✅ Apps Script به درستی Deploy شده است؟

---

## مشکل: فرم پر نمی‌شود

### بررسی کنید:

1. ✅ Console مرورگر را باز کنید و خطاها را ببینید
2. ✅ jQuery و کتابخانه‌های دیگر لود شده‌اند؟
3. ✅ فایل‌های JavaScript به درستی لود شده‌اند؟

---

## راه حل سریع

اگر هیچ کدام کار نکرد:

1. **Apps Script را دوباره Deploy کنید:**
   - Deploy > Manage deployments
   - Edit > New version
   - Deploy

2. **Authorization را دوباره انجام دهید:**
   - Deploy > Manage deployments
   - Settings > Test deployments
   - Authorization

3. **URL را دوباره کپی کنید:**
   - از Deploy > Manage deployments
   - URL جدید را کپی کنید
   - در config.js قرار دهید

---

## تماس برای کمک

اگر مشکل حل نشد، این اطلاعات را بفرستید:

1. خطای دقیق از Console
2. Status Code از Network tab
3. Response از Network tab
4. آیا Sheet آماده است؟

