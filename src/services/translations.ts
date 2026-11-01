export type Language = 'en' | 'ur' | 'ar';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', dir: 'rtl' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' }
];

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // Header & Navigation
    masterPortal: 'Master Portal',
    clientTenant: 'Client Tenant',
    selectCompany: 'Select Enterprise Tenant',
    loginPortal: 'Login Portal',
    language: 'Language',
    quickActions: 'Quick Actions',

    // ERP Departments
    dashboard: 'Executive Dashboard',
    finance: 'Finance & Accounts',
    procurement: 'Procurement & Purchasing',
    inventory: 'Inventory & Warehouse',
    sales: 'Sales & POS Counter',
    production: 'Production & Manufacturing',
    hr: 'HR Management & Payroll',
    formBuilder: 'Dynamic Custom Form Builder',
    reports: 'Universal Reporting Engine',
    approvals: 'Approval Workflows',
    aiAssistant: 'Gemini AI & Voice Center',
    companySettings: 'Company Settings & Branding',
    auditLogs: 'Security Audit Logs',

    // Accordions
    definitions: 'Definitions',
    forms: 'Forms',
    reportsTab: 'Reports',

    // Common Actions
    save: 'Save Changes',
    cancel: 'Cancel',
    print: 'Print / Export PDF',
    exportCsv: 'Export CSV',
    newJournal: 'New Journal Entry',
    scanInventory: 'Scan Inventory Item',
    createInvoice: 'Create Sales Invoice',
    issuePo: 'Issue Purchase Order',
    askAi: 'Ask Gemini AI Assistant',
    statusActive: 'ACTIVE',
    statusBalanced: 'BALANCED'
  },
  ur: {
    // Header & Navigation
    masterPortal: 'ماسٹر پورٹل',
    clientTenant: 'کلائنٹ ٹیننٹ',
    selectCompany: 'کمپنی ٹیننٹ منتخب کریں',
    loginPortal: 'لاگ ان پورٹل',
    language: 'زبان',
    quickActions: 'فوری کارروائیاں',

    // ERP Departments
    dashboard: 'ایکزییکٹیو ڈیش بورڈ',
    finance: 'مالیات اور اکاؤنٹس',
    procurement: 'خریداری اور پروکیورمنٹ',
    inventory: 'انوینٹری اور گودام',
    sales: 'فروخت اور پی او ایس کاؤنٹر',
    production: 'پیداوار اور مینوفیکچرنگ',
    hr: 'ایچ آر اور پے رول',
    formBuilder: 'ڈائنامک کسٹم فارم بلڈر',
    reports: 'یونیورسل رپورٹنگ انجن',
    approvals: 'منظوری کے ورک فلو',
    aiAssistant: 'جیمنائی اے آئی وائس سینٹر',
    companySettings: 'کمپنی ترتیبات اور برانڈنگ',
    auditLogs: 'سیکیورٹی آڈٹ لاگز',

    // Accordions
    definitions: 'تعریفات (ڈیفینیشنز)',
    forms: 'فارمز',
    reportsTab: 'رپورٹس',

    // Common Actions
    save: 'تبدیلیاں محفوظ کریں',
    cancel: 'منسوخ کریں',
    print: 'پرنٹ / پی ڈی ایف',
    exportCsv: 'سی ایس وی ایکسپورٹ',
    newJournal: 'نیا جرنل واؤچر',
    scanInventory: 'انوینٹری کیمرہ اسکین',
    createInvoice: 'فروخت کا انوائس بنائیں',
    issuePo: 'پرچیز آرڈر جاری کریں',
    askAi: 'جیمنائی اے آئی سے پوچھیں',
    statusActive: 'فعال',
    statusBalanced: 'متوازن'
  },
  ar: {
    // Header & Navigation
    masterPortal: 'البوابة الرئيسية',
    clientTenant: 'مؤسسة العميل',
    selectCompany: 'اختر المؤسسة',
    loginPortal: 'بوابة الدخول',
    language: 'اللغة',
    quickActions: 'الإجراءات السريعة',

    // ERP Departments
    dashboard: 'لوحة القيادة التنفيذية',
    finance: 'المالية والحسابات',
    procurement: 'المشتريات والتوريد',
    inventory: 'المخزون والمستودعات',
    sales: 'المبيعات ونقطة البيع',
    production: 'الإنتاج والتصنيع',
    hr: 'الموارد البشرية والمرتبات',
    formBuilder: 'منشئ النماذج المخصصة',
    reports: 'محرك التقارير الشامل',
    approvals: 'سلسلة الاعتمادات',
    aiAssistant: 'المساعد الذكي جيميناي',
    companySettings: 'إعدادات الشركة والعلامة التجارية',
    auditLogs: 'سجلات التدقيق الأمني',

    // Accordions
    definitions: 'التعاريف',
    forms: 'النماذج',
    reportsTab: 'التقارير',

    // Common Actions
    save: 'حفظ التغييرات',
    cancel: 'إلغاء',
    print: 'طباعة / تصدير PDF',
    exportCsv: 'تصدير CSV',
    newJournal: 'قيد يومي جديد',
    scanInventory: 'مسح المخزون',
    createInvoice: 'إنشاء فاتورة مبيعات',
    issuePo: 'إصدار أمر شراء',
    askAi: 'اسأل جيميناي الذكي',
    statusActive: 'نشط',
    statusBalanced: 'متوازن'
  }
};
