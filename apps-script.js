// کد Google Apps Script
// این کد را در Google Apps Script Editor کپی کنید

function doPost(e) {
  return handleRequest(e);
}

function doGet(e) {
  // اگر action در query parameter باشد، آن را handle کنیم
  if (e.parameter.action === 'add') {
    return handleAddRequest(e.parameter);
  }
  // در غیر این صورت، لیست تراکنش‌ها را برگردان
  return handleGetRequest();
}

function handleRequest(e) {
  try {
    // Parse کردن داده‌ها
    let data;
    try {
      if (e.postData && e.postData.contents) {
        data = JSON.parse(e.postData.contents);
      } else if (e.parameter) {
        // اگر از GET آمده باشد
        data = e.parameter;
      } else {
        throw new Error('داده‌ای دریافت نشد');
      }
    } catch (parseError) {
      return createResponse(false, 'خطا در parse کردن داده‌ها: ' + parseError.toString());
    }
    
    const action = data.action;
    
    if (action === 'add') {
      return handleAddRequest(data);
    }
    
    return createResponse(false, 'عملیات نامعتبر: ' + action);
    
  } catch (error) {
    return createResponse(false, 'خطای عمومی: ' + error.toString());
  }
}

function handleAddRequest(data) {
  try {
    // دریافت Sheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      return createResponse(false, 'خطا: Sheet پیدا نشد');
    }
    
    const sheet = ss.getSheetByName('Sheet1') || ss.getActiveSheet();
    if (!sheet) {
      return createResponse(false, 'خطا: Sheet1 پیدا نشد');
    }
    
    // افزودن تراکنش جدید
    const row = [
      data.date || '',
      data.type || '',
      data.category || '',
      data.subcategory || '',
      data.amount || 0,
      data.description || ''
    ];
    
    sheet.appendRow(row);
    
    return createResponse(true, 'تراکنش با موفقیت ثبت شد');
    
  } catch (error) {
    return createResponse(false, 'خطا در ثبت: ' + error.toString());
  }
}

function handleGetRequest() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Sheet1') || ss.getActiveSheet();
    
    // خواندن داده‌ها (از ردیف 2 به بعد - ردیف 1 هدر است)
    const lastRow = sheet.getLastRow();
    let data = [];
    
    if (lastRow > 1) {
      const range = sheet.getRange(2, 1, lastRow - 1, 6);
      const values = range.getValues();
      
      data = values.map(row => ({
        date: row[0] || '',
        type: row[1] || '',
        category: row[2] || '',
        subcategory: row[3] || '',
        amount: row[4] || '0',
        description: row[5] || ''
      }));
    }
    
    return createResponse(true, '', data);
    
  } catch (error) {
    return createResponse(false, error.toString());
  }
}

function createResponse(success, message, data = null) {
  const response = {
    success: success,
    message: message
  };
  
  if (data !== null) {
    response.data = data;
  }
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}


