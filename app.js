// ساختار دسته‌بندی‌ها
const categories = {
    'درآمد': {
        'اتاق‌ها': [],
        'میز اختصاصی': [],
        'میز اشتراکی': ['ماهانه', 'هفتگی', 'روزانه'],
        'اتاق جلسات': ['رویداد', 'کلاس', 'رزرو'],
        'اینترنت': [],
        'سایر': []
    },
    'هزینه': {
        'حقوق و دستمزد': ['پایه حقوق', 'اضافه کار'],
        'قبوض': ['آب', 'برق', 'اینترنت', 'اجاره'],
        'مصرفی‌ها': ['دستمال کاغذی', 'شوینده', 'چای و قند'],
        'اقساط و چک': [],
        'تعمیر و نگهداری': [],
        'سایر': []
    }
};

// نام collection در Firestore
const COLLECTION_NAME = 'transactions';

// شمارنده برای تراکنش‌های همزمان در یک دقیقه
let transactionCounter = 0;
let lastTransactionMinute = '';

// تولید شماره تراکنش خودکار بر اساس تاریخ و زمان ثبت
function generateTransactionNumber() {
    // استفاده از تاریخ و زمان فعلی به هجری شمسی
    const now = new persianDate();
    
    const month = now.month().toString().padStart(2, '0');
    const day = now.date().toString().padStart(2, '0');
    const hour = now.hour().toString().padStart(2, '0');
    const minute = now.minute().toString().padStart(2, '0');
    
    // کلید دقیقه فعلی
    const currentMinute = `${month}${day}${hour}${minute}`;
    
    // اگر در همان دقیقه است، شمارنده را افزایش بده
    if (currentMinute === lastTransactionMinute) {
        transactionCounter++;
    } else {
        // دقیقه جدید، شمارنده را از 1 شروع کن
        transactionCounter = 1;
        lastTransactionMinute = currentMinute;
    }
    
    // فرمت: MMDDHHMM + شمارنده (همیشه یک عدد اضافه می‌شود)
    return `${currentMinute}${transactionCounter}`;
}

// بررسی اینکه Firebase آماده است یا نه
let useFirebase = false;
let allTransactions = [];
let filteredTransactions = [];

// Authentication state - استفاده از localStorage به جای Firebase
let currentUser = null;
let userRole = null;
const USERS_STORAGE_KEY = 'keyhan_financial_users';
const SESSION_STORAGE_KEY = 'keyhan_financial_session';

// مقداردهی اولیه
document.addEventListener('DOMContentLoaded', async function() {
    // بررسی Firebase
    if (typeof firebase !== 'undefined' && db) {
        useFirebase = true;
        // auth در firebase-config.js تعریف شده است
        if (typeof auth === 'undefined') {
            auth = firebase.auth();
        }
        console.log('✅ Firebase آماده است');
        
        // بررسی اینکه Firestore فعال است یا نه
        // این بررسی بعد از لاگین کامل می‌شود
        // در اینجا فقط بررسی می‌کنیم که Firestore در دسترس است
        try {
            // فقط بررسی می‌کنیم که db در دسترس است
            // بررسی کامل Security Rules بعد از لاگین انجام می‌شود
            console.log('✅ Firestore آماده است - بررسی کامل Security Rules بعد از لاگین انجام می‌شود');
        } catch (error) {
            console.error('⚠️ Firestore فعال نیست:', error);
            useFirebase = false;
            showFirestoreWarning();
        }
    } else {
        console.log('⚠️ Firebase تنظیم نشده - از localStorage استفاده می‌شود');
    }
    
    // بررسی وضعیت Authentication (localStorage)
    checkLocalAuthState();
    
    // ایجاد کاربر پیش‌فرض admin اگر کاربری وجود ندارد
    initializeDefaultUsers();
    
    initializeDatePicker();
    setupEventListeners();
    setupNavigation();
    setupAuthListeners();
    
    // نمایش صفحه مناسب بر اساس وضعیت لاگین
    updatePageVisibility();
});

// بررسی اتصال Firestore
async function checkFirestoreConnection() {
    if (!db) return false;
    
    try {
        // تست با collection users که Security Rules اجازه می‌دهد (حتی بدون لاگین)
        // یا اگر کاربر لاگین کرده، با transactions تست می‌کنیم
        if (auth && auth.currentUser) {
            // اگر کاربر لاگین کرده، با transactions تست می‌کنیم
            try {
                const testQuery = db.collection(COLLECTION_NAME).limit(1);
                await testQuery.get();
                console.log('✅ Firestore و Security Rules درست تنظیم شده‌اند');
                return true;
            } catch (error) {
                if (error.code === 'permission-denied') {
                    console.warn('⚠️ Firestore فعال است اما Security Rules نیاز به تنظیم دارد');
                    showSecurityRulesWarning();
                    return false;
                }
                throw error;
            }
        } else {
            // اگر کاربر لاگین نکرده، فقط بررسی می‌کنیم که Firestore فعال است
            // با یک query ساده که نیاز به authentication ندارد (اما Security Rules باید اجازه بدهد)
            // در واقع، ما فقط بررسی می‌کنیم که Firestore پاسخ می‌دهد
            // Security Rules برای users/list اجازه می‌دهد که کاربران لاگین شده ببینند
            // اما برای تست، می‌توانیم فقط بررسی کنیم که db در دسترس است
            console.log('✅ Firestore آماده است (بررسی کامل بعد از لاگین انجام می‌شود)');
            return true; // Firestore فعال است، بررسی کامل بعد از لاگین انجام می‌شود
        }
    } catch (error) {
        if (error.code === 'permission-denied') {
            console.warn('⚠️ Firestore فعال است اما Security Rules نیاز به تنظیم دارد');
            showSecurityRulesWarning();
            return false;
        } else if (error.code === 'failed-precondition') {
            throw new Error('Firestore فعال نیست - لطفاً در Firebase Console فعال کنید');
        }
        console.warn('⚠️ خطا در بررسی Firestore:', error);
        return false;
    }
}

// نمایش هشدار Firestore
function showFirestoreWarning() {
    const warning = document.createElement('div');
    warning.className = 'firestore-warning';
    warning.innerHTML = `
        <div style="background: #fff3cd; border: 2px solid #ffc107; border-radius: 10px; padding: 20px; margin: 20px; direction: rtl;">
            <h3 style="margin: 0 0 10px 0; color: #856404;">⚠️ Firestore فعال نیست</h3>
            <p style="margin: 0 0 15px 0; color: #856404;">
                برای استفاده از دیتابیس Firebase، لطفاً:
            </p>
            <ol style="margin: 0 0 15px 0; padding-right: 20px; color: #856404;">
                <li>به <a href="https://console.firebase.google.com/project/keyhan-financial/firestore" target="_blank" style="color: #007bff;">Firebase Console</a> بروید</li>
                <li>روی <strong>Create database</strong> کلیک کنید</li>
                <li><strong>Start in test mode</strong> را انتخاب کنید</li>
                <li>Location را انتخاب و <strong>Enable</strong> کنید</li>
            </ol>
            <p style="margin: 0; color: #856404; font-size: 0.9em;">
                تا زمانی که Firestore فعال نشود، داده‌ها در localStorage ذخیره می‌شوند.
            </p>
        </div>
    `;
    document.body.insertBefore(warning, document.body.firstChild);
}

// نمایش هشدار Security Rules
function showSecurityRulesWarning() {
    if (document.querySelector('.security-rules-warning')) return;
    
    const warning = document.createElement('div');
    warning.className = 'security-rules-warning';
    warning.innerHTML = `
        <div style="background: #f8d7da; border: 2px solid #dc3545; border-radius: 10px; padding: 20px; margin: 20px; direction: rtl; position: fixed; top: 20px; left: 20px; right: 20px; z-index: 10000; max-width: 800px; margin: 20px auto;">
            <h3 style="margin: 0 0 10px 0; color: #721c24;">🔒 Security Rules نیاز به تنظیم دارد</h3>
            <p style="margin: 0 0 15px 0; color: #721c24;">
                Firestore فعال است اما Security Rules درست تنظیم نشده است. لطفاً:
            </p>
            <ol style="margin: 0 0 15px 0; padding-right: 20px; color: #721c24;">
                <li>به <a href="https://console.firebase.google.com/project/keyhan-financial/firestore/rules" target="_blank" style="color: #007bff; font-weight: bold;">Firebase Console > Firestore > Rules</a> بروید</li>
                <li>این کد را جایگزین کنید:</li>
            </ol>
            <pre style="background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto; direction: ltr; text-align: left; margin: 10px 0; font-size: 0.85em; max-height: 400px; overflow-y: auto;">rules_version = '2';
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
}</pre>
            <p style="margin: 10px 0 0 0; color: #721c24; font-size: 0.9em;">
                سپس روی <strong>Publish</strong> کلیک کنید و صفحه را Refresh کنید.
            </p>
            <button onclick="this.parentElement.parentElement.remove(); location.reload();" style="margin-top: 15px; padding: 10px 20px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">
                بعد از تنظیم Rules، اینجا کلیک کنید
            </button>
        </div>
    `;
    document.body.insertBefore(warning, document.body.firstChild);
}

// راه‌اندازی تقویم شمسی (فقط شمسی)
function initializeDatePicker() {
    const dateInput = document.getElementById('date');
    if (!dateInput) return;
    
    const today = new persianDate();
    
    // حذف datepicker قبلی اگر وجود دارد
    if ($(dateInput).data('persianDatepicker')) {
        $(dateInput).persianDatepicker('destroy');
    }
    
    $(dateInput).persianDatepicker({
        observer: true,
        format: 'YYYY/MM/DD',
        initialValue: true,
        initialValueType: 'persian',
        calendarType: 'persian',
        timePicker: {
            enabled: false
        },
        calendar: {
            persian: {
                enabled: true
            },
            gregorian: {
                enabled: false
            }
        }
    });
    
    dateInput.value = today.format('YYYY/MM/DD');
}

// تنظیم رویدادها
function setupEventListeners() {
    const typeSelect = document.getElementById('type');
    const categorySelect = document.getElementById('category');
    const form = document.getElementById('transactionForm');
    const exportBtn = document.getElementById('exportExcelBtn');
    const addBtn = document.getElementById('addTransactionBtn');
    const modal = document.getElementById('transactionModal');
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');

    typeSelect.addEventListener('change', updateCategories);
    categorySelect.addEventListener('change', updateSubcategories);
    form.addEventListener('submit', handleFormSubmit);
    exportBtn.addEventListener('click', exportToExcel);
    addBtn.addEventListener('click', () => openModal());
    closeModal.addEventListener('click', () => closeModalFunc());
    cancelBtn.addEventListener('click', () => closeModalFunc());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModalFunc();
    });
}

// تنظیم ناوبری بین صفحات
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const page = btn.getAttribute('data-page');
            switchPage(page);
            
            // به‌روزرسانی وضعیت دکمه‌ها
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // فیلترهای گزارشات
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            if (filter === 'custom') {
                document.getElementById('customDateRange').style.display = 'flex';
            } else {
                document.getElementById('customDateRange').style.display = 'none';
            }
            
            loadReports(filter);
        });
    });
}

// جابجایی بین صفحات
function switchPage(page) {
    const transactionsPage = document.getElementById('transactionsPage');
    const reportsPage = document.getElementById('reportsPage');
    const usersPage = document.getElementById('usersPage');
    
    if (page === 'transactions') {
        transactionsPage.style.display = 'block';
        reportsPage.style.display = 'none';
        if (usersPage) usersPage.style.display = 'none';
    } else if (page === 'reports') {
        transactionsPage.style.display = 'none';
        reportsPage.style.display = 'block';
        if (usersPage) usersPage.style.display = 'none';
        loadReports('all');
    } else if (page === 'users') {
        transactionsPage.style.display = 'none';
        reportsPage.style.display = 'none';
        if (usersPage) {
            usersPage.style.display = 'block';
            loadUsers();
        }
    }
}

// بروزرسانی دسته‌ها بر اساس نوع
function updateCategories() {
    const type = document.getElementById('type').value;
    const categorySelect = document.getElementById('category');
    const subcategorySelect = document.getElementById('subcategory');
    
    categorySelect.innerHTML = '<option value="">انتخاب کنید...</option>';
    subcategorySelect.innerHTML = '<option value="">-- بدون زیردسته --</option>';
    
    if (type && categories[type]) {
        Object.keys(categories[type]).forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categorySelect.appendChild(option);
        });
    }
    
}

// بروزرسانی زیردسته‌ها بر اساس دسته
function updateSubcategories() {
    const type = document.getElementById('type').value;
    const category = document.getElementById('category').value;
    const subcategorySelect = document.getElementById('subcategory');
    
    subcategorySelect.innerHTML = '<option value="">-- بدون زیردسته --</option>';
    
    if (type && category && categories[type] && categories[type][category]) {
        const subcategories = categories[type][category];
        if (subcategories.length > 0) {
            subcategories.forEach(sub => {
                const option = document.createElement('option');
                option.value = sub;
                option.textContent = sub;
                subcategorySelect.appendChild(option);
            });
        }
    }
}

// باز کردن Modal
function openModal(transaction = null) {
    const modal = document.getElementById('transactionModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('transactionForm');
    const editId = document.getElementById('editTransactionId');
    
    if (transaction) {
        modalTitle.textContent = 'ویرایش تراکنش';
        editId.value = transaction.id;
        document.getElementById('date').value = transaction.date;
        document.getElementById('type').value = transaction.type;
        updateCategories();
        setTimeout(() => {
            document.getElementById('category').value = transaction.category;
            updateSubcategories();
            setTimeout(() => {
                document.getElementById('subcategory').value = transaction.subcategory || '';
            }, 100);
        }, 100);
        document.getElementById('amount').value = formatNumber(transaction.amount);
        document.getElementById('description').value = transaction.description || '';
        document.getElementById('accountingRegistered').checked = transaction.accountingRegistered || false;
    } else {
        modalTitle.textContent = 'ثبت تراکنش جدید';
        editId.value = '';
        form.reset();
        document.getElementById('accountingRegistered').checked = false;
        initializeDatePicker();
    }
    
    modal.classList.add('show');
}

// بستن Modal
function closeModalFunc() {
    const modal = document.getElementById('transactionModal');
    modal.classList.remove('show');
}

// مدیریت ارسال فرم
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const amountInput = document.getElementById('amount');
    const amountValue = parseAmount(amountInput.value);
    
    if (isNaN(amountValue) || amountValue <= 0) {
        showMessage('لطفاً مبلغ معتبری وارد کنید', 'error');
        return;
    }
    
    const formData = {
        date: document.getElementById('date').value,
        type: document.getElementById('type').value,
        category: document.getElementById('category').value,
        subcategory: document.getElementById('subcategory').value || '',
        amount: amountValue,
        description: document.getElementById('description').value || '',
        accountingRegistered: document.getElementById('accountingRegistered').checked || false
    };
    
    // تولید شماره تراکنش فقط برای تراکنش‌های جدید
    const editId = document.getElementById('editTransactionId').value;
    if (!editId) {
        formData.transactionNumber = generateTransactionNumber();
    }
    
    try {
        if (editId) {
            await updateTransaction(editId, formData);
            showMessage('تراکنش با موفقیت ویرایش شد!', 'success');
        } else {
            await saveTransaction(formData);
            showMessage('تراکنش با موفقیت ثبت شد!', 'success');
        }
        
        closeModalFunc();
        loadTransactions();
    } catch (error) {
        console.error('خطا در ثبت تراکنش:', error);
        showMessage('خطا در ثبت تراکنش. لطفاً دوباره تلاش کنید.', 'error');
    }
}

// تبدیل مبلغ به عدد (پشتیبانی از فارسی و انگلیسی)
function parseAmount(value) {
    if (!value) return 0;
    
    // تبدیل اعداد فارسی به انگلیسی
    const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    
    let cleaned = value.toString().replace(/,/g, '').trim();
    
    persianNumbers.forEach((persian, index) => {
        cleaned = cleaned.replace(new RegExp(persian, 'g'), englishNumbers[index]);
    });
    
    return parseInt(cleaned) || 0;
}

// تبدیل اعداد انگلیسی به فارسی
function toPersianNumbers(str) {
    const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    
    let result = str.toString();
    englishNumbers.forEach((eng, index) => {
        result = result.replace(new RegExp(eng, 'g'), persianNumbers[index]);
    });
    return result;
}

// فرمت کردن عدد با جدا کردن ارقام و تبدیل به فارسی
function formatNumber(num) {
    const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return toPersianNumbers(formatted);
}

// مدیریت ورود مبلغ (جدا کردن ارقام)
function setupAmountInput() {
    const amountInput = document.getElementById('amount');
    
    amountInput.addEventListener('input', function(e) {
        let value = e.target.value;
        
        // حذف کاماها
        value = value.replace(/,/g, '');
        
        // تبدیل فارسی به انگلیسی
        const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        
        persianNumbers.forEach((persian, index) => {
            value = value.replace(new RegExp(persian, 'g'), englishNumbers[index]);
        });
        
        // فقط اعداد
        value = value.replace(/[^\d]/g, '');
        
        // جدا کردن ارقام
        if (value) {
            value = formatNumber(value);
        }
        
        e.target.value = value;
    });
}

// ذخیره تراکنش
async function saveTransaction(transaction) {
    // اضافه کردن Audit Log
    if (currentUser) {
        transaction.createdBy = currentUser.id;
        transaction.createdByName = currentUser.name || currentUser.email;
    }
    
    if (!db) {
        throw new Error('Firebase Firestore تنظیم نشده است. لطفاً Firebase را تنظیم کنید.');
    }
    
    try {
        if (transaction.createdAt === undefined) {
            transaction.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        }
        await db.collection(COLLECTION_NAME).add(transaction);
    } catch (error) {
        console.error('خطا در ذخیره Firebase:', error);
        throw error;
    }
}

// بروزرسانی تراکنش
async function updateTransaction(id, transaction) {
    // اضافه کردن Audit Log
    if (currentUser) {
        transaction.updatedBy = currentUser.id;
        transaction.updatedByName = currentUser.name || currentUser.email;
        transaction.updatedAt = new Date().toISOString();
    }
    
    if (!db) {
        throw new Error('Firebase Firestore تنظیم نشده است. لطفاً Firebase را تنظیم کنید.');
    }
    
    try {
        await db.collection(COLLECTION_NAME).doc(id).update(transaction);
    } catch (error) {
        console.error('خطا در بروزرسانی Firebase:', error);
        throw error;
    }
}

// حذف تراکنش
async function deleteTransaction(id) {
    if (!canDelete()) {
        showMessage('شما دسترسی حذف تراکنش را ندارید', 'error');
        return;
    }
    
    if (!confirm('آیا مطمئن هستید که می‌خواهید این تراکنش را حذف کنید؟')) {
        return;
    }
    
    if (!db) {
        showMessage('Firebase Firestore تنظیم نشده است. لطفاً Firebase را تنظیم کنید.', 'error');
        return;
    }
    
    try {
        // اضافه کردن Audit Log قبل از حذف
        if (currentUser) {
            const deletedBy = currentUser.id;
            const deletedByName = currentUser.name || currentUser.email;
            // ذخیره اطلاعات حذف در document (soft delete)
            await db.collection(COLLECTION_NAME).doc(id).update({
                deletedBy: deletedBy,
                deletedByName: deletedByName,
                deletedAt: firebase.firestore.FieldValue.serverTimestamp(),
                isDeleted: true
            });
        } else {
            await db.collection(COLLECTION_NAME).doc(id).delete();
        }
        
        showMessage('تراکنش با موفقیت حذف شد!', 'success');
        loadTransactions();
    } catch (error) {
        console.error('خطا در حذف تراکنش:', error);
        showMessage('خطا در حذف تراکنش. لطفاً دوباره تلاش کنید.', 'error');
    }
}

// دریافت تمام تراکنش‌ها
async function getTransactions() {
    if (!db) {
        throw new Error('Firebase Firestore تنظیم نشده است. لطفاً Firebase را تنظیم کنید.');
    }
    
    try {
        const snapshot = await db.collection(COLLECTION_NAME)
            .orderBy('createdAt', 'desc')
            .get();
        
        const transactions = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            // فیلتر کردن تراکنش‌های حذف شده (soft delete)
            if (!data.isDeleted) {
                transactions.push({
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
                    updatedAt: data.updatedAt ? data.updatedAt.toDate() : null
                });
            }
        });
        
        return transactions;
    } catch (error) {
        console.error('خطا در خواندن Firebase:', error);
        throw error;
    }
}

// بارگذاری تراکنش‌ها
async function loadTransactions() {
    const tbody = document.getElementById('transactionsTableBody');
    
    tbody.innerHTML = '<tr><td colspan="8" class="loading-cell"><div class="loading">در حال بارگذاری...</div></td></tr>';
    
    try {
        allTransactions = await getTransactions();
        filteredTransactions = [...allTransactions];
        renderTable();
    } catch (error) {
        console.error('خطا در بارگذاری تراکنش‌ها:', error);
        tbody.innerHTML = '<tr><td colspan="8" class="empty-state">خطا در بارگذاری داده‌ها. لطفاً دوباره تلاش کنید.</td></tr>';
    }
}

// رندر کردن جدول
function renderTable() {
    const tbody = document.getElementById('transactionsTableBody');
    
    if (filteredTransactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-state">هیچ تراکنشی یافت نشد</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredTransactions.map(transaction => `
        <tr class="transaction-row ${transaction.type === 'درآمد' ? 'income-row' : 'expense-row'}">
            <td class="transaction-number-cell">${transaction.transactionNumber ? toPersianNumbers(transaction.transactionNumber) : '-'}</td>
            <td>${transaction.date}</td>
            <td>${transaction.category}</td>
            <td>${transaction.subcategory || '-'}</td>
            <td class="amount-cell">${formatNumber(transaction.amount)}</td>
            <td>${transaction.description || '-'}</td>
            <td class="accounting-checkbox-cell">
                <label class="checkbox-label-inline">
                    <input type="checkbox" 
                           ${transaction.accountingRegistered ? 'checked' : ''} 
                           onchange="toggleAccountingRegistered('${transaction.id}', this.checked)"
                           class="accounting-checkbox">
                    <span class="checkmark"></span>
                </label>
            </td>
            <td class="action-buttons-cell">
                ${canEdit() ? `<button class="btn-edit" onclick="editTransaction('${transaction.id}')">ویرایش</button>` : ''}
                ${canDelete() ? `<button class="btn-delete" onclick="deleteTransaction('${transaction.id}')">حذف</button>` : ''}
            </td>
        </tr>
    `).join('');
}

// تغییر وضعیت ثبت حسابداری
async function toggleAccountingRegistered(transactionId, checked) {
    if (!db) {
        showMessage('Firebase Firestore تنظیم نشده است. لطفاً Firebase را تنظیم کنید.', 'error');
        return;
    }
    
    try {
        const transaction = allTransactions.find(t => t.id === transactionId);
        if (!transaction) return;
        
        transaction.accountingRegistered = checked;
        
        await db.collection(COLLECTION_NAME).doc(transactionId).update({
            accountingRegistered: checked
        });
        
        showMessage(checked ? 'ثبت حسابداری فعال شد' : 'ثبت حسابداری غیرفعال شد', 'success');
    } catch (error) {
        console.error('خطا در تغییر وضعیت ثبت حسابداری:', error);
        showMessage('خطا در تغییر وضعیت ثبت حسابداری', 'error');
        // برگرداندن checkbox به حالت قبل
        loadTransactions();
    }
}

// ویرایش تراکنش
function editTransaction(id) {
    if (!canEdit()) {
        showMessage('شما دسترسی ویرایش تراکنش را ندارید', 'error');
        return;
    }
    const transaction = allTransactions.find(t => t.id == id);
    if (transaction) {
        openModal(transaction);
    }
}


// خروجی به Excel
async function exportToExcel() {
    try {
        const transactions = await getTransactions();
        
        if (transactions.length === 0) {
            showMessage('هیچ تراکنشی برای خروجی وجود ندارد', 'error');
            return;
        }
        
        const data = [
            ['شماره تراکنش', 'تاریخ', 'نوع', 'دسته', 'زیردسته', 'مبلغ (تومان)', 'توضیحات', 'ثبت حسابداری']
        ];
        
        transactions.forEach(transaction => {
            data.push([
                transaction.transactionNumber || '-',
                transaction.date,
                transaction.type,
                transaction.category,
                transaction.subcategory || '',
                transaction.amount,
                transaction.description || '',
                transaction.accountingRegistered ? 'بله' : 'خیر'
            ]);
        });
        
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'تراکنش‌ها');
        
        const colWidths = [
            { wch: 18 }, { wch: 12 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 12 }
        ];
        ws['!cols'] = colWidths;
        
        const today = new persianDate();
        const fileName = `تراکنش‌های_کیهان_${today.format('YYYY-MM-DD')}.xlsx`;
        
        XLSX.writeFile(wb, fileName);
        showMessage('فایل Excel با موفقیت دانلود شد!', 'success');
        
    } catch (error) {
        console.error('خطا در خروجی Excel:', error);
        showMessage('خطا در ساخت فایل Excel. لطفاً دوباره تلاش کنید.', 'error');
    }
}

// نمایش پیام
function showMessage(text, type) {
    const message = document.getElementById('message');
    message.textContent = text;
    message.className = `message ${type}`;
    
    setTimeout(() => {
        message.className = 'message';
    }, 3000);
}

// Export functions برای استفاده در onclick
window.editTransaction = editTransaction;
window.deleteTransaction = deleteTransaction;
window.applyCustomDateRange = applyCustomDateRange;
window.toggleCategory = toggleCategory;

// باز و بسته کردن دسته
function toggleCategory(categoryId) {
    const subcategoryRows = document.querySelectorAll(`.subcategory-row[data-parent="${categoryId}"]`);
    const categoryRow = document.querySelector(`.category-row[data-category-id="${categoryId}"]`);
    const expandIcon = categoryRow ? categoryRow.querySelector('.expand-icon') : null;
    const categoryIcon = categoryRow ? categoryRow.querySelector('.category-icon') : null;
    
    if (!categoryRow || subcategoryRows.length === 0) return;
    
    const isExpanded = subcategoryRows[0].style.display !== 'none';
    
    if (isExpanded) {
        // بستن
        subcategoryRows.forEach(row => {
            row.style.display = 'none';
        });
        if (expandIcon) {
            expandIcon.textContent = '▼';
        }
        if (categoryIcon) {
            categoryIcon.textContent = '📂';
        }
    } else {
        // باز کردن
        subcategoryRows.forEach(row => {
            row.style.display = 'table-row';
        });
        if (expandIcon) {
            expandIcon.textContent = '▲';
        }
        if (categoryIcon) {
            categoryIcon.textContent = '📂';
        }
    }
}

// متغیرهای نمودار
let incomeExpenseChart = null;
let expenseCategoryChart = null;
let incomeCategoryChart = null;
let timeSeriesChart = null;

// بارگذاری گزارشات
async function loadReports(filterType) {
    try {
        const transactions = await getTransactions();
        let filteredData = [...transactions];
        
        // فیلتر بر اساس بازه زمانی
        if (filterType === 'custom') {
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;
            
            if (startDate && endDate) {
                filteredData = transactions.filter(t => {
                    const dateParts = t.date.split('/');
                    const dateStr = dateParts.join('/');
                    return dateStr >= startDate && dateStr <= endDate;
                });
            }
        }
        
        // محاسبه خلاصه
        calculateSummary(filteredData);
        
        // رسم نمودارها
        drawCharts(filteredData);
        
        // نمایش جداول
        renderReportsTables(filteredData);
        
    } catch (error) {
        console.error('خطا در بارگذاری گزارشات:', error);
    }
}

// محاسبه خلاصه گزارشات
function calculateSummary(transactions) {
    let totalIncome = 0;
    let totalExpense = 0;
    let totalCount = transactions.length;
    
    transactions.forEach(t => {
        if (t.type === 'درآمد') {
            totalIncome += t.amount || 0;
        } else {
            totalExpense += t.amount || 0;
        }
    });
    
    const balance = totalIncome - totalExpense;
    
    document.getElementById('totalIncome').textContent = formatNumber(totalIncome);
    document.getElementById('totalExpense').textContent = formatNumber(totalExpense);
    document.getElementById('totalBalance').textContent = formatNumber(balance);
    document.getElementById('totalCount').textContent = toPersianNumbers(totalCount.toString());
}

// رسم نمودارها
function drawCharts(transactions) {
    // نمودار درآمد و هزینه
    const incomeExpenseCtx = document.getElementById('incomeExpenseChart');
    if (incomeExpenseCtx) {
        if (incomeExpenseChart) {
            incomeExpenseChart.destroy();
        }
        
        const incomeData = transactions.filter(t => t.type === 'درآمد').reduce((sum, t) => sum + (t.amount || 0), 0);
        const expenseData = transactions.filter(t => t.type === 'هزینه').reduce((sum, t) => sum + (t.amount || 0), 0);
        
        incomeExpenseChart = new Chart(incomeExpenseCtx, {
            type: 'bar',
            data: {
                labels: ['درآمد', 'هزینه'],
                datasets: [{
                    label: 'مبلغ (تومان)',
                    data: [incomeData, expenseData],
                    backgroundColor: [
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(239, 68, 68, 0.8)'
                    ],
                    borderColor: [
                        'rgba(16, 185, 129, 1)',
                        'rgba(239, 68, 68, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    // نمودار دسته‌بندی درآمدها
    const incomeCategoryCtx = document.getElementById('incomeCategoryChart');
    if (incomeCategoryCtx) {
        if (incomeCategoryChart) {
            incomeCategoryChart.destroy();
        }
        
        const incomeTransactions = transactions.filter(t => t.type === 'درآمد');
        const categoryData = {};
        
        incomeTransactions.forEach(t => {
            const cat = t.category || 'سایر';
            categoryData[cat] = (categoryData[cat] || 0) + (t.amount || 0);
        });
        
        const labels = Object.keys(categoryData);
        const data = Object.values(categoryData);
        
        if (labels.length > 0) {
            incomeCategoryChart = new Chart(incomeCategoryCtx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: [
                            'rgba(16, 185, 129, 0.8)',
                            'rgba(16, 185, 129, 0.6)',
                            'rgba(16, 185, 129, 0.4)',
                            'rgba(16, 185, 129, 0.3)',
                            'rgba(16, 185, 129, 0.2)',
                            'rgba(16, 185, 129, 0.1)'
                        ],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
    }
    
    // نمودار دسته‌بندی هزینه‌ها
    const expenseCategoryCtx = document.getElementById('expenseCategoryChart');
    if (expenseCategoryCtx) {
        if (expenseCategoryChart) {
            expenseCategoryChart.destroy();
        }
        
        const expenseTransactions = transactions.filter(t => t.type === 'هزینه');
        const categoryData = {};
        
        expenseTransactions.forEach(t => {
            const cat = t.category || 'سایر';
            categoryData[cat] = (categoryData[cat] || 0) + (t.amount || 0);
        });
        
        const labels = Object.keys(categoryData);
        const data = Object.values(categoryData);
        
        if (labels.length > 0) {
            expenseCategoryChart = new Chart(expenseCategoryCtx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: [
                            'rgba(239, 68, 68, 0.8)',
                            'rgba(239, 68, 68, 0.6)',
                            'rgba(239, 68, 68, 0.4)',
                            'rgba(239, 68, 68, 0.3)',
                            'rgba(239, 68, 68, 0.2)',
                            'rgba(239, 68, 68, 0.1)'
                        ],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
    }
    
    // نمودار خطی درآمد و هزینه بر محور زمان
    const timeSeriesCtx = document.getElementById('timeSeriesChart');
    if (timeSeriesCtx) {
        if (timeSeriesChart) {
            timeSeriesChart.destroy();
        }
        
        // گروه‌بندی تراکنش‌ها بر اساس تاریخ
        const dateData = {};
        
        transactions.forEach(t => {
            const date = t.date;
            if (!dateData[date]) {
                dateData[date] = {
                    income: 0,
                    expense: 0
                };
            }
            
            if (t.type === 'درآمد') {
                dateData[date].income += t.amount || 0;
            } else {
                dateData[date].expense += t.amount || 0;
            }
        });
        
        // مرتب‌سازی بر اساس تاریخ
        const sortedDates = Object.keys(dateData).sort((a, b) => {
            const aParts = a.split('/');
            const bParts = b.split('/');
            const aDate = new Date(parseInt(aParts[0]), parseInt(aParts[1]) - 1, parseInt(aParts[2]));
            const bDate = new Date(parseInt(bParts[0]), parseInt(bParts[1]) - 1, parseInt(bParts[2]));
            return aDate - bDate;
        });
        
        const incomeData = sortedDates.map(date => dateData[date].income);
        const expenseData = sortedDates.map(date => dateData[date].expense);
        
        if (sortedDates.length > 0) {
            timeSeriesChart = new Chart(timeSeriesCtx, {
                type: 'line',
                data: {
                    labels: sortedDates,
                    datasets: [
                        {
                            label: 'درآمد',
                            data: incomeData,
                            borderColor: 'rgba(16, 185, 129, 1)',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.4,
                            pointRadius: 4,
                            pointHoverRadius: 6
                        },
                        {
                            label: 'هزینه',
                            data: expenseData,
                            borderColor: 'rgba(239, 68, 68, 1)',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.4,
                            pointRadius: 4,
                            pointHoverRadius: 6
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'top'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }
}

// نمایش جداول گزارشات به صورت درختی
function renderReportsTables(transactions) {
    const incomeTbody = document.getElementById('incomeReportsTableBody');
    const expenseTbody = document.getElementById('expenseReportsTableBody');
    
    if (!incomeTbody || !expenseTbody) return;
    
    // جدا کردن درآمدها و هزینه‌ها
    const incomeTransactions = transactions.filter(t => t.type === 'درآمد');
    const expenseTransactions = transactions.filter(t => t.type === 'هزینه');
    
    // ساختار درختی برای درآمدها
    const incomeTree = {};
    incomeTransactions.forEach(t => {
        const cat = t.category || 'سایر';
        const subcat = t.subcategory || '';
        
        if (!incomeTree[cat]) {
            incomeTree[cat] = {
                count: 0,
                total: 0,
                subcategories: {}
            };
        }
        
        incomeTree[cat].count++;
        incomeTree[cat].total += t.amount || 0;
        
        if (subcat) {
            if (!incomeTree[cat].subcategories[subcat]) {
                incomeTree[cat].subcategories[subcat] = {
                    count: 0,
                    total: 0
                };
            }
            incomeTree[cat].subcategories[subcat].count++;
            incomeTree[cat].subcategories[subcat].total += t.amount || 0;
        }
    });
    
    // ساختار درختی برای هزینه‌ها
    const expenseTree = {};
    expenseTransactions.forEach(t => {
        const cat = t.category || 'سایر';
        const subcat = t.subcategory || '';
        
        if (!expenseTree[cat]) {
            expenseTree[cat] = {
                count: 0,
                total: 0,
                subcategories: {}
            };
        }
        
        expenseTree[cat].count++;
        expenseTree[cat].total += t.amount || 0;
        
        if (subcat) {
            if (!expenseTree[cat].subcategories[subcat]) {
                expenseTree[cat].subcategories[subcat] = {
                    count: 0,
                    total: 0
                };
            }
            expenseTree[cat].subcategories[subcat].count++;
            expenseTree[cat].subcategories[subcat].total += t.amount || 0;
        }
    });
    
    // رندر کردن جدول درآمدها
    const incomeRows = Object.keys(incomeTree).map((cat, index) => {
        const data = incomeTree[cat];
        const hasSubcategories = Object.keys(data.subcategories).length > 0;
        const categoryId = `income-cat-${index}`;
        const subcatRows = Object.keys(data.subcategories).map((subcat, subIndex) => {
            const subData = data.subcategories[subcat];
            return `
                <tr class="subcategory-row subcategory-hidden" data-parent="${categoryId}" style="display: none;">
                    <td class="tree-cell">
                        <div class="subcategory-content">
                            <span class="subcategory-dot"></span>
                            <span class="subcategory-name">${subcat}</span>
                        </div>
                    </td>
                    <td class="subcategory-count">${toPersianNumbers(subData.count.toString())}</td>
                    <td class="subcategory-amount">${formatNumber(subData.total)}</td>
                </tr>
            `;
        }).join('');
        
        const expandIcon = hasSubcategories ? '<span class="expand-icon">▼</span>' : '';
        
        return `
            <tr class="category-row" data-category-id="${categoryId}" onclick="toggleCategory('${categoryId}')" style="cursor: ${hasSubcategories ? 'pointer' : 'default'}">
                <td class="category-cell">
                    <div class="category-header">
                        <span class="category-icon">${hasSubcategories ? '📂' : '📁'}</span>
                        <span class="category-name">${cat}</span>
                        ${expandIcon}
                    </div>
                </td>
                <td class="category-count"><strong>${toPersianNumbers(data.count.toString())}</strong></td>
                <td class="category-amount"><strong>${formatNumber(data.total)}</strong></td>
            </tr>
            ${subcatRows}
        `;
    }).join('');
    
    incomeTbody.innerHTML = incomeRows || '<tr><td colspan="3" class="empty-state">داده‌ای یافت نشد</td></tr>';
    
    // رندر کردن جدول هزینه‌ها
    const expenseRows = Object.keys(expenseTree).map((cat, index) => {
        const data = expenseTree[cat];
        const hasSubcategories = Object.keys(data.subcategories).length > 0;
        const categoryId = `expense-cat-${index}`;
        const subcatRows = Object.keys(data.subcategories).map((subcat, subIndex) => {
            const subData = data.subcategories[subcat];
            return `
                <tr class="subcategory-row subcategory-hidden" data-parent="${categoryId}" style="display: none;">
                    <td class="tree-cell">
                        <div class="subcategory-content">
                            <span class="subcategory-dot"></span>
                            <span class="subcategory-name">${subcat}</span>
                        </div>
                    </td>
                    <td class="subcategory-count">${toPersianNumbers(subData.count.toString())}</td>
                    <td class="subcategory-amount">${formatNumber(subData.total)}</td>
                </tr>
            `;
        }).join('');
        
        const expandIcon = hasSubcategories ? '<span class="expand-icon">▼</span>' : '';
        
        return `
            <tr class="category-row" data-category-id="${categoryId}" onclick="toggleCategory('${categoryId}')" style="cursor: ${hasSubcategories ? 'pointer' : 'default'}">
                <td class="category-cell">
                    <div class="category-header">
                        <span class="category-icon">${hasSubcategories ? '📂' : '📁'}</span>
                        <span class="category-name">${cat}</span>
                        ${expandIcon}
                    </div>
                </td>
                <td class="category-count"><strong>${toPersianNumbers(data.count.toString())}</strong></td>
                <td class="category-amount"><strong>${formatNumber(data.total)}</strong></td>
            </tr>
            ${subcatRows}
        `;
    }).join('');
    
    expenseTbody.innerHTML = expenseRows || '<tr><td colspan="3" class="empty-state">داده‌ای یافت نشد</td></tr>';
}

// اعمال فیلتر بازه انتخابی
function applyCustomDateRange() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (!startDate || !endDate) {
        showMessage('لطفاً هر دو تاریخ را انتخاب کنید', 'error');
        return;
    }
    
    loadReports('custom');
}

// راه‌اندازی datepicker برای فیلتر بازه
function initializeReportDatePickers() {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    if (startDateInput && !$(startDateInput).data('persianDatepicker')) {
        $(startDateInput).persianDatepicker({
            observer: true,
            format: 'YYYY/MM/DD',
            initialValue: false,
            calendarType: 'persian'
        });
    }
    
    if (endDateInput && !$(endDateInput).data('persianDatepicker')) {
        $(endDateInput).persianDatepicker({
            observer: true,
            format: 'YYYY/MM/DD',
            initialValue: false,
            calendarType: 'persian'
        });
    }
}

// تنظیم amount input بعد از لود شدن
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        setupAmountInput();
        initializeReportDatePickers();
    }, 100);
});

// ==================== Authentication Functions (localStorage) ====================

// دریافت لیست کاربران از localStorage
function getLocalUsers() {
    try {
        const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
        return usersJson ? JSON.parse(usersJson) : [];
    } catch (error) {
        console.error('خطا در خواندن کاربران:', error);
        return [];
    }
}

// ذخیره لیست کاربران در localStorage
function saveLocalUsers(users) {
    try {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (error) {
        console.error('خطا در ذخیره کاربران:', error);
    }
}

// ایجاد کاربر پیش‌فرض admin
function initializeDefaultUsers() {
    const users = getLocalUsers();
    if (users.length === 0) {
        // ایجاد کاربر پیش‌فرض admin
        const defaultUser = {
            id: 'admin-001',
            email: 'admin@keyhan.com',
            password: 'admin123', // کاربر باید این را تغییر دهد
            name: 'مدیر سیستم',
            role: 'admin',
            createdAt: new Date().toISOString()
        };
        users.push(defaultUser);
        saveLocalUsers(users);
        console.log('✅ کاربر پیش‌فرض admin ایجاد شد');
        console.log('📧 ایمیل: admin@keyhan.com');
        console.log('🔒 رمز عبور: admin123');
        console.log('⚠️ لطفاً بعد از ورود، رمز عبور را تغییر دهید!');
    }
}

// بررسی وضعیت لاگین از localStorage
function checkLocalAuthState() {
    try {
        const sessionJson = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (sessionJson) {
            const session = JSON.parse(sessionJson);
            const users = getLocalUsers();
            const user = users.find(u => u.id === session.userId);
            if (user) {
                currentUser = {
                    id: user.id,
                    email: user.email,
                    name: user.name
                };
                userRole = user.role;
                console.log('✅ کاربر لاگین شده:', currentUser.email);
                updateUIForAuth();
                updatePageVisibility();
                if (allTransactions.length === 0) {
                    loadTransactions();
                }
                return;
            }
        }
    } catch (error) {
        console.error('خطا در بررسی وضعیت لاگین:', error);
    }
    
    // اگر لاگین نیست
    currentUser = null;
    userRole = null;
    updatePageVisibility();
}

// بررسی وضعیت Authentication (قدیمی - دیگر استفاده نمی‌شود)
async function checkAuthState() {
    if (!auth) {
        // اگر Firebase نیست، صفحه ورود را نمایش بده
        updatePageVisibility();
        return;
    }
    
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            // بررسی اینکه کاربر تایید شده است یا نه
            try {
                // بررسی اتصال Firestore با یک query واقعی (بعد از لاگین)
                try {
                    const testQuery = db.collection(COLLECTION_NAME).limit(1);
                    await testQuery.get();
                    console.log('✅ Firestore و Security Rules درست تنظیم شده‌اند');
                    useFirebase = true;
                } catch (error) {
                    if (error.code === 'permission-denied') {
                        console.warn('⚠️ Firestore فعال است اما Security Rules نیاز به تنظیم دارد');
                        showSecurityRulesWarning();
                        useFirebase = false;
                        // اما ادامه می‌دهیم تا کاربر را بررسی کنیم
                    } else {
                        throw error;
                    }
                }
                
                const userDoc = await db.collection('users').doc(user.uid).get();
                
                if (!userDoc.exists || !userDoc.data().approved) {
                    // کاربر تایید نشده - خروج و نمایش صفحه ورود
                    await auth.signOut();
                    currentUser = null;
                    userRole = null;
                    updateUIForAuth();
                    updatePageVisibility();
                    return;
                }
                
                // کاربر تایید شده است
                currentUser = user;
                await loadUserRole(user.uid);
                updateUIForAuth();
                updatePageVisibility();
                if (allTransactions.length === 0) {
                    loadTransactions();
                }
            } catch (error) {
                console.error('خطا در بررسی وضعیت کاربر:', error);
                // در صورت خطا، خروج و نمایش صفحه ورود
                if (auth.currentUser) {
                    await auth.signOut();
                }
                currentUser = null;
                userRole = null;
                updateUIForAuth();
                updatePageVisibility();
            }
        } else {
            currentUser = null;
            userRole = null;
            updateUIForAuth();
            updatePageVisibility();
        }
    });
}

// به‌روزرسانی نمایش صفحات بر اساس وضعیت لاگین
function updatePageVisibility() {
    const authPage = document.getElementById('authPage');
    const mainHeader = document.getElementById('mainHeader');
    const mainContent = document.getElementById('mainContent');
    
    // بررسی وضعیت فعلی کاربر (localStorage)
    const isLoggedIn = currentUser !== null;
    
    if (isLoggedIn) {
        // کاربر لاگین کرده - نمایش محتوای اصلی
        if (authPage) authPage.style.display = 'none';
        if (mainHeader) mainHeader.style.display = 'block';
        if (mainContent) mainContent.style.display = 'block';
    } else {
        // کاربر لاگین نکرده - نمایش صفحه ورود
        if (authPage) authPage.style.display = 'flex';
        if (mainHeader) mainHeader.style.display = 'none';
        if (mainContent) mainContent.style.display = 'none';
    }
}

// بارگذاری نقش کاربر
async function loadUserRole(userId) {
    if (!useFirebase || !db) return;
    
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) {
            userRole = userDoc.data().role || 'viewer';
        } else {
            userRole = 'viewer'; // پیش‌فرض
        }
    } catch (error) {
        console.error('خطا در بارگذاری نقش کاربر:', error);
        userRole = 'viewer';
    }
}

// نمایش صفحه ورود (دیگر استفاده نمی‌شود - صفحه همیشه نمایش داده می‌شود)
function showAuthModal() {
    updatePageVisibility();
    switchAuthTab('login');
}

// مخفی کردن صفحه ورود (دیگر استفاده نمی‌شود)
function hideAuthModal() {
    updatePageVisibility();
}

// تغییر Tab در Modal ورود
// تابع switchAuthTab حذف شد - دیگر ثبت‌نام از طریق سایت انجام نمی‌شود

// Toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.type = input.type === 'password' ? 'text' : 'password';
    }
}

// تنظیم Event Listeners برای Authentication
function setupAuthListeners() {
    // Tab switching
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchAuthTab(tabName);
        });
    });
    
    // دیگر دکمه بستن نداریم - صفحه ورود صفحه اصلی است
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            await handleLogin(email, password);
        });
    }
    
    // Register form حذف شد - ثبت‌نام فقط از طریق Firebase Console انجام می‌شود
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// ورود (localStorage)
async function handleLogin(email, password) {
    try {
        const users = getLocalUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (!user) {
            showMessage('کاربری با این ایمیل یافت نشد', 'error');
            return;
        }
        
        if (user.password !== password) {
            showMessage('رمز عبور اشتباه است', 'error');
            return;
        }
        
        // لاگین موفق
        currentUser = {
            id: user.id,
            email: user.email,
            name: user.name
        };
        userRole = user.role;
        
        // ذخیره session
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
            userId: user.id,
            loginTime: new Date().toISOString()
        }));
        
        showMessage('✅ ورود موفقیت‌آمیز بود', 'success');
        updateUIForAuth();
        updatePageVisibility();
        switchPage('transactions');
        loadTransactions();
    } catch (error) {
        console.error('خطا در ورود:', error);
        showMessage('خطا در ورود. لطفاً دوباره تلاش کنید.', 'error');
    }
}

// ثبت‌نام
async function handleRegister(name, email, password, role) {
    console.log('🔵 شروع ثبت‌نام:', { name, email, role });
    
    if (!auth || !db) {
        console.error('❌ Firebase فعال نیست');
        showMessage('Firebase فعال نیست', 'error');
        return;
    }
    
    try {
        console.log('🔵 در حال ایجاد کاربر در Authentication...');
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        console.log('✅ کاربر در Authentication ایجاد شد:', userCredential.user.uid);
        
        // بررسی اینکه آیا این اولین کاربر است یا نه
        let isFirstUser = false;
        let shouldAutoApprove = false;
        
        try {
            console.log('🔵 در حال بررسی کاربران موجود...');
            const usersSnapshot = await db.collection('users').get();
            isFirstUser = usersSnapshot.empty;
            shouldAutoApprove = isFirstUser && role === 'admin';
            console.log('✅ بررسی کاربران انجام شد:', { isFirstUser, shouldAutoApprove });
        } catch (error) {
            console.warn('⚠️ خطا در بررسی کاربران موجود:', error);
            // اگر خطا داد، فرض می‌کنیم که اولین کاربر است
            isFirstUser = true;
            shouldAutoApprove = role === 'admin';
            console.log('⚠️ فرض می‌کنیم اولین کاربر است:', { isFirstUser, shouldAutoApprove });
        }
        
        // ذخیره اطلاعات کاربر در Firestore (همیشه با approved: false شروع می‌کنیم)
        console.log('🔵 در حال ثبت کاربر در Firestore...');
        try {
            const userData = {
                name: name,
                email: email,
                role: role,
                approved: false, // Security Rules اجازه approved: true در create نمی‌دهد
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            console.log('🔵 داده‌های کاربر:', userData);
            
            await db.collection('users').doc(userCredential.user.uid).set(userData);
            console.log('✅ کاربر در Firestore ثبت شد:', userCredential.user.uid);
            console.log('✅ Collection "users" باید اکنون در Firebase Console قابل مشاهده باشد');
        } catch (firestoreError) {
            console.error('❌ خطا در ثبت کاربر در Firestore:', firestoreError);
            console.error('❌ کد خطا:', firestoreError.code);
            console.error('❌ پیام خطا:', firestoreError.message);
            
            // اگر خطای permission-denied بود، پیام واضح بده
            if (firestoreError.code === 'permission-denied') {
                // کاربر را از Authentication حذف کن
                if (auth && auth.currentUser) {
                    try {
                        await auth.currentUser.delete();
                    } catch (deleteError) {
                        console.error('خطا در حذف کاربر از Authentication:', deleteError);
                    }
                }
                
                showMessage('❌ خطا در ثبت‌نام: Security Rules در Firebase تنظیم نشده است. لطفاً Security Rules را از پیام هشدار کپی کنید و در Firebase Console قرار دهید. یا به فایل MANUAL_SETUP_GUIDE.md مراجعه کنید برای راهنمای ایجاد دستی Collection.', 'error');
                showSecurityRulesWarning();
                
                // نمایش راهنمای دستی
                setTimeout(() => {
                    const manualGuide = document.createElement('div');
                    manualGuide.style.cssText = 'background: #e7f3ff; border: 2px solid #2196F3; border-radius: 10px; padding: 20px; margin: 20px; direction: rtl; position: fixed; top: 200px; left: 20px; right: 20px; z-index: 10001; max-width: 800px; margin: 20px auto;';
                    manualGuide.innerHTML = `
                        <h3 style="margin: 0 0 10px 0; color: #1976D2;">📖 راهنمای ایجاد دستی Collection</h3>
                        <p style="margin: 0 0 15px 0; color: #1976D2;">
                            می‌توانید به صورت دستی Collection "users" را ایجاد کنید:
                        </p>
                        <ol style="margin: 0 0 15px 0; padding-right: 20px; color: #1976D2;">
                            <li>به <a href="https://console.firebase.google.com/project/keyhan-financial/firestore" target="_blank" style="color: #1976D2; font-weight: bold;">Firebase Console > Firestore</a> بروید</li>
                            <li>روی <strong>Start collection</strong> کلیک کنید</li>
                            <li>Collection ID: <code>users</code></li>
                            <li>Document ID: UID کاربر را از <a href="https://console.firebase.google.com/project/keyhan-financial/authentication/users" target="_blank" style="color: #1976D2; font-weight: bold;">Authentication > Users</a> کپی کنید</li>
                            <li>فیلدها را اضافه کنید: <code>name</code> (string), <code>email</code> (string), <code>role</code> (string: "admin"), <code>approved</code> (boolean: true)</li>
                            <li>برای راهنمای کامل، فایل <code>MANUAL_SETUP_GUIDE.md</code> را ببینید</li>
                        </ol>
                        <button onclick="this.parentElement.remove();" style="padding: 10px 20px; background: #2196F3; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">
                            بستن
                        </button>
                    `;
                    document.body.appendChild(manualGuide);
                }, 500);
                
                return;
            }
            
            // برای سایر خطاها، کاربر را حذف کن
            if (auth && auth.currentUser) {
                try {
                    await auth.currentUser.delete();
                } catch (deleteError) {
                    console.error('خطا در حذف کاربر از Authentication:', deleteError);
                }
            }
            
            throw firestoreError; // خطا را به catch اصلی بفرست
        }
        
        // اگر اولین admin است، خودش را approve می‌کند
        if (shouldAutoApprove) {
            try {
                await db.collection('users').doc(userCredential.user.uid).update({
                    approved: true,
                    approvedBy: userCredential.user.uid,
                    approvedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                showMessage('✅ ثبت‌نام با موفقیت انجام شد! شما به عنوان اولین مدیر سیستم تایید شدید.', 'success');
                await loadUserRole(userCredential.user.uid);
                updateUIForAuth();
                updatePageVisibility();
                switchPage('transactions');
                loadTransactions();
                return;
            } catch (updateError) {
                console.error('خطا در approve کردن اولین admin:', updateError);
                // اگر update خطا داد، کاربر باید منتظر بماند
                showMessage('⚠️ ثبت‌نام انجام شد اما تایید خودکار با خطا مواجه شد. لطفاً منتظر تایید مدیر بمانید.', 'error');
            }
        }
        
        // خروج خودکار بعد از ثبت‌نام (برای کاربران عادی)
        await auth.signOut();
        
        // تنظیم currentUser به null
        currentUser = null;
        userRole = null;
        
        // صبر کردن تا signOut کامل شود
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // این بخش دیگر استفاده نمی‌شود - ثبت‌نام از طریق سایت حذف شده است
        
    } catch (error) {
        console.error('❌ خطا در ثبت‌نام:', error);
        console.error('❌ کد خطا:', error.code);
        console.error('❌ پیام خطا:', error.message);
        console.error('❌ جزئیات خطا:', error);
        
        // اگر کاربر در Authentication ایجاد شد اما در Firestore خطا داد، کاربر را حذف کن
        if (auth && auth.currentUser) {
            try {
                console.log('🔵 در حال حذف کاربر از Authentication...');
                await auth.currentUser.delete();
                console.log('✅ کاربر از Authentication حذف شد');
            } catch (deleteError) {
                console.error('❌ خطا در حذف کاربر از Authentication:', deleteError);
            }
        }
        
        let errorMessage = 'خطا در ثبت‌نام';
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'این ایمیل قبلاً استفاده شده است';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'رمز عبور باید حداقل 6 کاراکتر باشد';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'ایمیل نامعتبر است';
        } else if (error.code === 'auth/network-request-failed') {
            errorMessage = 'خطا در اتصال به اینترنت. لطفاً دوباره تلاش کنید.';
        } else if (error.code === 'permission-denied') {
            errorMessage = '❌ خطا در دسترسی به دیتابیس. لطفاً Security Rules را بررسی کنید. برای راهنمای کامل، فایل MANUAL_SETUP_GUIDE.md را ببینید.';
            showSecurityRulesWarning();
        } else {
            errorMessage = `خطا در ثبت‌نام: ${error.message || error.code || 'خطای ناشناخته'}`;
        }
        showMessage(errorMessage, 'error');
        
        // نمایش راهنمای دستی در صورت خطای permission-denied
        if (error.code === 'permission-denied') {
            setTimeout(() => {
                const manualGuide = document.createElement('div');
                manualGuide.style.cssText = 'background: #e7f3ff; border: 2px solid #2196F3; border-radius: 10px; padding: 20px; margin: 20px; direction: rtl; position: fixed; top: 200px; left: 20px; right: 20px; z-index: 10001; max-width: 800px; margin: 20px auto;';
                manualGuide.innerHTML = `
                    <h3 style="margin: 0 0 10px 0; color: #1976D2;">📖 راهنمای ایجاد دستی Collection</h3>
                    <p style="margin: 0 0 15px 0; color: #1976D2;">
                        می‌توانید به صورت دستی Collection "users" را ایجاد کنید:
                    </p>
                    <ol style="margin: 0 0 15px 0; padding-right: 20px; color: #1976D2;">
                        <li>به <a href="https://console.firebase.google.com/project/keyhan-financial/firestore" target="_blank" style="color: #1976D2; font-weight: bold;">Firebase Console > Firestore</a> بروید</li>
                        <li>روی <strong>Start collection</strong> کلیک کنید</li>
                        <li>Collection ID: <code>users</code></li>
                        <li>Document ID: UID کاربر را از <a href="https://console.firebase.google.com/project/keyhan-financial/authentication/users" target="_blank" style="color: #1976D2; font-weight: bold;">Authentication > Users</a> کپی کنید</li>
                        <li>فیلدها را اضافه کنید: <code>name</code> (string), <code>email</code> (string), <code>role</code> (string: "admin"), <code>approved</code> (boolean: true)</li>
                        <li>برای راهنمای کامل، فایل <code>MANUAL_SETUP_GUIDE.md</code> را ببینید</li>
                    </ol>
                    <button onclick="this.parentElement.remove();" style="padding: 10px 20px; background: #2196F3; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">
                        بستن
                    </button>
                `;
                document.body.appendChild(manualGuide);
            }, 500);
        }
    }
}

// نمایش پیام در انتظار تایید
function showPendingApprovalMessage() {
    const authPage = document.getElementById('authPage');
    if (!authPage) return;
    
    // حذف پیام قبلی اگر وجود دارد
    const existingMessage = authPage.querySelector('.pending-approval-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'pending-approval-message';
    messageDiv.innerHTML = `
        <p>
            ⏳ حساب کاربری شما در انتظار تایید مدیر است. بعد از تایید می‌توانید وارد شوید.
        </p>
    `;
    
    const authFormsWrapper = authPage.querySelector('.auth-forms-wrapper');
    if (authFormsWrapper) {
        // حذف پیام قبلی اگر وجود دارد
        const existing = authFormsWrapper.querySelector('.pending-approval-message');
        if (existing) {
            existing.remove();
        }
        authFormsWrapper.insertBefore(messageDiv, authFormsWrapper.firstChild);
    }
}

// خروج
async function handleLogout() {
    if (!auth) return;
    
            try {
                await auth.signOut();
                currentUser = null;
                userRole = null;
                allTransactions = [];
                filteredTransactions = [];
                updateUIForAuth();
                updatePageVisibility();
                showMessage('خروج موفقیت‌آمیز بود', 'success');
            } catch (error) {
                console.error('خطا در خروج:', error);
                showMessage('خطا در خروج', 'error');
            }
}

// به‌روزرسانی UI بر اساس Authentication
function updateUIForAuth() {
    const userInfo = document.getElementById('userInfo');
    const userName = document.getElementById('userName');
    const userRoleSpan = document.getElementById('userRole');
    const addTransactionBtn = document.getElementById('addTransactionBtn');
    
    if (currentUser) {
        // نمایش اطلاعات کاربر
        if (userInfo) userInfo.style.display = 'flex';
        if (userName) {
            userName.textContent = currentUser.name || currentUser.email;
        }
        
        // نمایش نقش
        if (userRoleSpan) {
            const roleNames = {
                'admin': 'مدیر',
                'editor': 'ویرایش‌گر',
                'viewer': 'مشاهده‌گر'
            };
            userRoleSpan.textContent = roleNames[userRole] || 'کاربر';
        }
        
        // محدود کردن دسترسی بر اساس نقش
        if (addTransactionBtn) {
            if (userRole === 'viewer') {
                addTransactionBtn.style.display = 'none';
            } else {
                addTransactionBtn.style.display = 'block';
            }
        }

        // نمایش دکمه مدیریت کاربران فقط برای admin
        const usersNavBtn = document.getElementById('usersNavBtn');
        if (usersNavBtn) {
            if (userRole === 'admin') {
                usersNavBtn.style.display = 'block';
            } else {
                usersNavBtn.style.display = 'none';
            }
        }
    } else {
        // مخفی کردن اطلاعات کاربر
        if (userInfo) userInfo.style.display = 'none';
        if (addTransactionBtn) addTransactionBtn.style.display = 'none';
        const usersNavBtn = document.getElementById('usersNavBtn');
        if (usersNavBtn) usersNavBtn.style.display = 'none';
    }
}

// بررسی دسترسی برای عملیات
function canEdit() {
    return userRole === 'admin' || userRole === 'editor';
}

function canDelete() {
    return userRole === 'admin';
}

// ==================== User Management Functions ====================

// بارگذاری لیست کاربران
async function loadUsers() {
    if (!useFirebase || !db || userRole !== 'admin') return;
    
    try {
        const usersSnapshot = await db.collection('users').get();
        const pendingUsers = [];
        const activeUsers = [];
        
        usersSnapshot.forEach(doc => {
            const userData = doc.data();
            const user = {
                id: doc.id,
                ...userData,
                createdAt: userData.createdAt ? userData.createdAt.toDate() : new Date()
            };
            
            if (!userData.approved) {
                pendingUsers.push(user);
            } else {
                activeUsers.push(user);
            }
        });
        
        renderPendingUsers(pendingUsers);
        renderActiveUsers(activeUsers);
    } catch (error) {
        console.error('خطا در بارگذاری کاربران:', error);
        showMessage('خطا در بارگذاری کاربران', 'error');
    }
}

// رندر کاربران در انتظار تایید
function renderPendingUsers(users) {
    const tbody = document.getElementById('pendingUsersTableBody');
    if (!tbody) return;
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">کاربری در انتظار تایید نیست</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(user => {
        const roleNames = {
            'admin': 'مدیر',
            'editor': 'ویرایش‌گر',
            'viewer': 'مشاهده‌گر'
        };
        
        const dateStr = user.createdAt ? new persianDate(user.createdAt).format('YYYY/MM/DD') : '-';
        
        return `
            <tr>
                <td>${user.name || '-'}</td>
                <td>${user.email}</td>
                <td>${roleNames[user.role] || user.role}</td>
                <td>${dateStr}</td>
                <td>
                    <button class="btn-approve" onclick="approveUser('${user.id}')">تایید</button>
                    <button class="btn-reject" onclick="rejectUser('${user.id}')">رد</button>
                </td>
            </tr>
        `;
    }).join('');
}

// رندر کاربران فعال
function renderActiveUsers(users) {
    const tbody = document.getElementById('activeUsersTableBody');
    if (!tbody) return;
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">کاربر فعالی وجود ندارد</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(user => {
        const roleNames = {
            'admin': 'مدیر',
            'editor': 'ویرایش‌گر',
            'viewer': 'مشاهده‌گر'
        };
        
        const dateStr = user.createdAt ? new persianDate(user.createdAt).format('YYYY/MM/DD') : '-';
        
        return `
            <tr>
                <td>${user.name || '-'}</td>
                <td>${user.email}</td>
                <td>${roleNames[user.role] || user.role}</td>
                <td>${dateStr}</td>
                <td>
                    ${user.id !== currentUser.uid ? `<button class="btn-reject" onclick="rejectUser('${user.id}')">غیرفعال کردن</button>` : '<span style="color: var(--text-medium);">شما</span>'}
                </td>
            </tr>
        `;
    }).join('');
}

// تایید کاربر
async function approveUser(userId) {
    if (!canDelete() || !db) {
        showMessage('شما دسترسی تایید کاربر را ندارید', 'error');
        return;
    }
    
    if (!confirm('آیا مطمئن هستید که می‌خواهید این کاربر را تایید کنید؟')) {
        return;
    }
    
    try {
        await db.collection('users').doc(userId).update({
            approved: true,
            approvedBy: currentUser.uid,
            approvedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showMessage('کاربر با موفقیت تایید شد', 'success');
        loadUsers();
    } catch (error) {
        console.error('خطا در تایید کاربر:', error);
        showMessage('خطا در تایید کاربر', 'error');
    }
}

// رد یا غیرفعال کردن کاربر
async function rejectUser(userId) {
    if (!canDelete() || !db) {
        showMessage('شما دسترسی رد کاربر را ندارید', 'error');
        return;
    }
    
    if (!confirm('آیا مطمئن هستید که می‌خواهید این کاربر را رد/غیرفعال کنید؟')) {
        return;
    }
    
    try {
        await db.collection('users').doc(userId).update({
            approved: false,
            rejectedBy: currentUser.uid,
            rejectedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showMessage('کاربر با موفقیت رد/غیرفعال شد', 'success');
        loadUsers();
    } catch (error) {
        console.error('خطا در رد کاربر:', error);
        showMessage('خطا در رد کاربر', 'error');
    }
}
