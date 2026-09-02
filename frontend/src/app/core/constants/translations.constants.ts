export interface TranslationDictionary {
  appName: string;
  nav: {
    dashboard: string;
    rooms: string;
    reservations: string;
    reports: string;
    auditLogs: string;
    login: string;
    register: string;
    logout: string;
    liveSync: string;
    language: string;
    edition: string;
  };
  common: {
    search: string;
    filter: string;
    clear: string;
    add: string;
    edit: string;
    delete: string;
    save: string;
    cancel: string;
    confirm: string;
    close: string;
    actions: string;
    loading: string;
    noData: string;
    status: string;
    all: string;
    refresh: string;
    details: string;
    from: string;
    to: string;
    nights: string;
    perNight: string;
    viewAll: string;
    active: string;
    inactive: string;
    id: string;
  };
  auth: {
    signInTitle: string;
    signInSubtitle: string;
    email: string;
    password: string;
    fullName: string;
    signInBtn: string;
    signUpBtn: string;
    signingIn: string;
    signingUp: string;
    quickDemo: string;
    noAccount: string;
    alreadyAccount: string;
    createAccount: string;
    registerSubtitle: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    totalRooms: string;
    availableRooms: string;
    confirmedBookings: string;
    cancelledBookings: string;
    occupancyRate: string;
    quickActions: string;
    newBooking: string;
    manageRooms: string;
    viewReports: string;
    recentReservations: string;
    topRooms: string;
  };
  rooms: {
    title: string;
    subtitle: string;
    addRoom: string;
    editRoom: string;
    deleteRoom: string;
    deletePrompt: string;
    deleteWarning: string;
    roomNumber: string;
    roomType: string;
    pricePerNight: string;
    availability: string;
    available: string;
    occupied: string;
    checkAvailability: string;
    allTypes: string;
    single: string;
    double: string;
    suite: string;
    deluxe: string;
    minPrice: string;
    maxPrice: string;
    enterRoomNumber: string;
  };
  reservations: {
    title: string;
    subtitle: string;
    newReservation: string;
    guestName: string;
    checkInDate: string;
    checkOutDate: string;
    totalAmount: string;
    cancelReservation: string;
    cancelPrompt: string;
    confirmed: string;
    cancelled: string;
    selectRoom: string;
    bookedBy: string;
    stayDuration: string;
    filterByGuest: string;
    filterByRoom: string;
    allStatuses: string;
  };
  reports: {
    title: string;
    subtitle: string;
    tabTopRooms: string;
    tabRevenue: string;
    tabOccupancy: string;
    revenueByRoomType: string;
    totalRevenue: string;
    totalNights: string;
    totalBookings: string;
    occupancyPercentage: string;
    generateReport: string;
    rank: string;
    bookedNights: string;
    availableNights: string;
  };
  auditLogs: {
    title: string;
    subtitle: string;
    action: string;
    entity: string;
    user: string;
    date: string;
    details: string;
    recentCount: string;
  };
}

export const TRANSLATIONS: Record<'en' | 'ar', TranslationDictionary> = {
  en: {
    appName: 'Hotel Management System',
    nav: {
      dashboard: 'Dashboard',
      rooms: 'Rooms',
      reservations: 'Reservations',
      reports: 'Reports',
      auditLogs: 'Audit Logs',
      login: 'Sign In',
      register: 'Register',
      logout: 'Logout',
      liveSync: 'Live Sync Active',
      language: 'Language',
      edition: 'Enterprise Edition',
    },
    common: {
      search: 'Search',
      filter: 'Filter',
      clear: 'Clear',
      add: 'Add',
      edit: 'Edit',
      delete: 'Delete',
      save: 'Save Changes',
      cancel: 'Cancel',
      confirm: 'Confirm',
      close: 'Close',
      actions: 'Actions',
      loading: 'Loading...',
      noData: 'No records found',
      status: 'Status',
      all: 'All',
      refresh: 'Refresh',
      details: 'Details',
      from: 'From',
      to: 'To',
      nights: 'nights',
      perNight: '/ night',
      viewAll: 'View All',
      active: 'Active',
      inactive: 'Inactive',
      id: 'ID',
    },
    auth: {
      signInTitle: 'Hotel Management System',
      signInSubtitle: 'Enter your credentials to access operations',
      email: 'Email Address',
      password: 'Password',
      fullName: 'Full Name',
      signInBtn: 'Sign In',
      signUpBtn: 'Create Staff Account',
      signingIn: 'Signing in...',
      signingUp: 'Creating account...',
      quickDemo: 'Fill Demo Admin Credentials',
      noAccount: "Don't have an account?",
      alreadyAccount: 'Already have an account?',
      createAccount: 'Sign Up',
      registerSubtitle: 'Register new front desk or managerial staff',
    },
    dashboard: {
      title: 'Operations Dashboard',
      subtitle: 'Real-time room availability, active guest stays, and performance metrics',
      totalRooms: 'Total Rooms',
      availableRooms: 'Available Rooms',
      confirmedBookings: 'Confirmed Bookings',
      cancelledBookings: 'Cancelled Bookings',
      occupancyRate: 'Occupancy Rate',
      quickActions: 'Quick Actions',
      newBooking: 'New Reservation',
      manageRooms: 'Manage Rooms',
      viewReports: 'View Reports',
      recentReservations: 'Recent Reservations',
      topRooms: 'Top Performing Rooms',
    },
    rooms: {
      title: 'Room Inventory',
      subtitle: 'Manage hotel rooms, configure pricing, and check dates',
      addRoom: 'Add New Room',
      editRoom: 'Edit Room',
      deleteRoom: 'Delete Room',
      deletePrompt: 'Are you sure you want to delete room',
      deleteWarning: 'Rooms with active or future confirmed reservations cannot be deleted.',
      roomNumber: 'Room Number',
      roomType: 'Room Type',
      pricePerNight: 'Price per Night ($)',
      availability: 'Availability',
      available: 'Available',
      occupied: 'Occupied',
      checkAvailability: 'Filter by Availability Dates',
      allTypes: 'All Types',
      single: 'Single',
      double: 'Double',
      suite: 'Suite',
      deluxe: 'Deluxe',
      minPrice: 'Min Price',
      maxPrice: 'Max Price',
      enterRoomNumber: 'e.g. 101, 204',
    },
    reservations: {
      title: 'Reservation Management',
      subtitle: 'Create guest bookings, track check-ins, and manage stays',
      newReservation: 'New Reservation',
      guestName: 'Guest Full Name',
      checkInDate: 'Check-In Date',
      checkOutDate: 'Check-Out Date',
      totalAmount: 'Total Amount',
      cancelReservation: 'Cancel Reservation',
      cancelPrompt: 'Are you sure you want to cancel reservation for',
      confirmed: 'Confirmed',
      cancelled: 'Cancelled',
      selectRoom: 'Select Room',
      bookedBy: 'Booked By',
      stayDuration: 'Stay Duration',
      filterByGuest: 'Filter by guest name...',
      filterByRoom: 'Filter by room...',
      allStatuses: 'All Statuses',
    },
    reports: {
      title: 'Performance & Analytics',
      subtitle: 'Revenue breakdown, top revenue generators, and occupancy trends',
      tabTopRooms: 'Top Rooms (R1)',
      tabRevenue: 'Revenue Analysis (R2)',
      tabOccupancy: 'Occupancy Rates (R3)',
      revenueByRoomType: 'Revenue by Room Type',
      totalRevenue: 'Total Revenue',
      totalNights: 'Total Nights Sold',
      totalBookings: 'Total Bookings',
      occupancyPercentage: 'Occupancy %',
      generateReport: 'Generate Report',
      rank: 'Rank',
      bookedNights: 'Booked Nights',
      availableNights: 'Available Nights',
    },
    auditLogs: {
      title: 'Activity Audit Trail',
      subtitle: 'Immutable record of all room updates, reservations, and security events',
      action: 'Action',
      entity: 'Entity',
      user: 'User',
      date: 'Timestamp',
      details: 'Audit Details',
      recentCount: 'Showing recent audit entries',
    },
  },
  ar: {
    appName: 'نظام إدارة الفنادق',
    nav: {
      dashboard: 'لوحة التحكم',
      rooms: 'الغرف',
      reservations: 'الحجوزات',
      reports: 'التقارير',
      auditLogs: 'سجل التدقيق',
      login: 'تسجيل الدخول',
      register: 'حساب جديد',
      logout: 'تسجيل الخروج',
      liveSync: 'المزامنة المباشرة نشطة',
      language: 'اللغة',
      edition: 'النسخة الاحترافية',
    },
    common: {
      search: 'بحث',
      filter: 'تصفية',
      clear: 'إعادة تعيين',
      add: 'إضافة',
      edit: 'تعديل',
      delete: 'حذف',
      save: 'حفظ التغييرات',
      cancel: 'إلغاء',
      confirm: 'تأكيد',
      close: 'إغلاق',
      actions: 'إجراءات',
      loading: 'جارٍ التحميل...',
      noData: 'لا توجد بيانات متاحة',
      status: 'الحالة',
      all: 'الكل',
      refresh: 'تحديث',
      details: 'التفاصيل',
      from: 'من',
      to: 'إلى',
      nights: 'ليالٍ',
      perNight: '/ ليلة',
      viewAll: 'عرض الكل',
      active: 'نشط',
      inactive: 'غير نشط',
      id: 'المعرف',
    },
    auth: {
      signInTitle: 'نظام إدارة الفنادق',
      signInSubtitle: 'قم بتسجيل الدخول للوصول إلى لوحة العمليات',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      fullName: 'الاسم الكامل',
      signInBtn: 'تسجيل الدخول',
      signUpBtn: 'إنشاء حساب موظف',
      signingIn: 'جارٍ تسجيل الدخول...',
      signingUp: 'جارٍ إنشاء الحساب...',
      quickDemo: 'تعبئة حساب المسؤول التجريبي',
      noAccount: 'ليس لديك حساب؟',
      alreadyAccount: 'لديك حساب بالفعل؟',
      createAccount: 'تسجيل جديد',
      registerSubtitle: 'تسجيل موظف استقبال أو إدارة جديد',
    },
    dashboard: {
      title: 'لوحة العمليات الرئيسية',
      subtitle: 'مخزون الفندق اللحظي، الحجوزات النشطة، ومؤشرات الأداء',
      totalRooms: 'إجمالي الغرف',
      availableRooms: 'الغرف المتاحة',
      confirmedBookings: 'الحجوزات المؤكدة',
      cancelledBookings: 'الحجوزات الملغاة',
      occupancyRate: 'نسبة الإشغال',
      quickActions: 'إجراءات سريعة',
      newBooking: 'حجز جديد',
      manageRooms: 'إدارة الغرف',
      viewReports: 'عرض التقارير',
      recentReservations: 'أحدث الحجوزات',
      topRooms: 'أعلى الغرف أداءً',
    },
    rooms: {
      title: 'إدارة الغرف والمخزون',
      subtitle: 'إدارة غرف الفندق، تحديد الأسعار، وفحص التوافر بالتواريخ',
      addRoom: 'إضافة غرفة جديدة',
      editRoom: 'تعديل الغرفة',
      deleteRoom: 'حذف الغرفة',
      deletePrompt: 'هل أنت متأكد من حذف الغرفة',
      deleteWarning: 'لا يمكن حذف الغرف التي تحتوي على حجوزات مؤكدة حالية أو مستقبلية.',
      roomNumber: 'رقم الغرفة',
      roomType: 'نوع الغرفة',
      pricePerNight: 'السعر في الليلة ($)',
      availability: 'حالة التوافر',
      available: 'متاحة',
      occupied: 'مشغولة',
      checkAvailability: 'تصفية التوافر حسب التواريخ',
      allTypes: 'جميع الأنواع',
      single: 'مفردة (Single)',
      double: 'مزدوجة (Double)',
      suite: 'جناح (Suite)',
      deluxe: 'ديلوكس (Deluxe)',
      minPrice: 'أدنى سعر',
      maxPrice: 'أقصى سعر',
      enterRoomNumber: 'مثال: 101, 204',
    },
    reservations: {
      title: 'إدارة الحجوزات',
      subtitle: 'إنشاء حجوزات النزلاء، متابعة الإقامات، وحساب الأسعار تلقائياً',
      newReservation: 'حجز جديد',
      guestName: 'اسم النزيل',
      checkInDate: 'تاريخ الوصول',
      checkOutDate: 'تاريخ المغادرة',
      totalAmount: 'المبلغ الإجمالي',
      cancelReservation: 'إلغاء الحجز',
      cancelPrompt: 'هل أنت متأكد من رغبتك في إلغاء حجز',
      confirmed: 'مؤكد',
      cancelled: 'ملغي',
      selectRoom: 'اختر الغرفة',
      bookedBy: 'تم الحجز بواسطة',
      stayDuration: 'مدة الإقامة',
      filterByGuest: 'بحث باسم النزيل...',
      filterByRoom: 'بحث برقم الغرفة...',
      allStatuses: 'جميع الحالات',
    },
    reports: {
      title: 'التقارير ومؤشرات الأداء',
      subtitle: 'التحليل المالي، مصادر الإيرادات، ومعدلات الإشغال الفندقي',
      tabTopRooms: 'أفضل الغرف (R1)',
      tabRevenue: 'تحليل الإيرادات (R2)',
      tabOccupancy: 'معدلات الإشغال (R3)',
      revenueByRoomType: 'الإيرادات حسب نوع الغرفة',
      totalRevenue: 'إجمالي الإيرادات',
      totalNights: 'إجمالي الليالي المباعة',
      totalBookings: 'عدد الحجوزات',
      occupancyPercentage: 'نسبة الإشغال %',
      generateReport: 'إنشاء التقرير',
      rank: 'الترتيب',
      bookedNights: 'الليالي المحجوزة',
      availableNights: 'الليالي المتاحة',
    },
    auditLogs: {
      title: 'سجل تدقيق الأنشطة',
      subtitle: 'سجل غير قابل للتعديل لجميع عمليات الغرف والحجوزات والمستخدمين',
      action: 'الإجراء',
      entity: 'العنصر',
      user: 'المستخدم',
      date: 'الوقت والتاريخ',
      details: 'تفاصيل العملية',
      recentCount: 'عرض أحدث سجلات التدقيق',
    },
  },
};
