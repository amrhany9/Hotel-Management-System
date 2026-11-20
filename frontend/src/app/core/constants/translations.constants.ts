export interface TranslationDictionary {
  appName: string;
  nav: {
    dashboard: string;
    rooms: string;
    reservations: string;
    reports: string;
    auditLogs: string;
    guests: string;
    staff: string;
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
    room: string;
    activeFilters: string;
    select: string;
    noOptions: string;
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
    arrivalsToday: string;
    departuresToday: string;
    inHouse: string;
    paymentsThisMonth: string;
    outstandingBalance: string;
    due: string;
    todaysMovements: string;
    nothingToday: string;
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
    outOfService: string;
    adminOnly: string;
    maxPricePlaceholder: string;
    modalSubtitle: string;
    availableHint: string;
    bookingsCount: string;
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
    guestPhone: string;
    guestEmail: string;
    guestIdNumber: string;
    notes: string;
    notesPlaceholder: string;
    guestDetails: string;
    stayDetails: string;
    returningGuest: string;
    balance: string;
    paid: string;
    viewDetails: string;
    guest: string;
    optional: string;
  };
  stay: {
    confirmed: string;
    checkedIn: string;
    checkedOut: string;
    cancelled: string;
    noShow: string;
    checkIn: string;
    checkOut: string;
    markNoShow: string;
    checkInPrompt: string;
    checkOutPrompt: string;
    noShowPrompt: string;
    checkedInAt: string;
    checkedOutAt: string;
    invoice: string;
  };
  payments: {
    title: string;
    record: string;
    amount: string;
    method: string;
    reference: string;
    referencePlaceholder: string;
    cash: string;
    card: string;
    bankTransfer: string;
    paidAt: string;
    receivedBy: string;
    none: string;
    balanceDue: string;
    paidInFull: string;
    payFullBalance: string;
  };
  invoice: {
    title: string;
    proforma: string;
    number: string;
    issued: string;
    billTo: string;
    stay: string;
    description: string;
    roomNights: string;
    quantity: string;
    rate: string;
    amount: string;
    total: string;
    totalPaid: string;
    balanceDue: string;
    print: string;
    back: string;
    thankYou: string;
    payments: string;
  };
  guests: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    phone: string;
    email: string;
    idNumber: string;
    stays: string;
    totalPaid: string;
    lastStay: string;
    guestSince: string;
  };
  staff: {
    title: string;
    subtitle: string;
    addStaff: string;
    role: string;
    admin: string;
    frontDesk: string;
    activate: string;
    deactivate: string;
    you: string;
    passwordHint: string;
    joined: string;
  };
  demo: {
    title: string;
    subtitle: string;
    adminDesc: string;
    frontDeskDesc: string;
    resetNote: string;
  };
  toast: {
    titleSuccess: string;
    titleError: string;
    titleInfo: string;
    titleNotice: string;
    loadFailed: string;
    genericError: string;
    enterCredentials: string;
    invalidLogin: string;
    welcome: string;
    completeBooking: string;
    checkoutAfterCheckin: string;
    enterAmount: string;
    completeFields: string;
    roomCreated: string;
    roomUpdated: string;
    roomDeleted: string;
    staffCreated: string;
    guestRoom: string;
    roomLabel: string;
    newReservation: string;
    reservationCreated: string;
    checkedIn: string;
    checkedOut: string;
    payment: string;
    cancelled: string;
    noShow: string;
    updated: string;
    roomAdded: string;
    roomChanged: string;
    roomRemoved: string;
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
    topRoomsSubtitle: string;
    periodRevenue: string;
    bookingsInPeriod: string;
    nightsOccupied: string;
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
    actCreated: string;
    actUpdated: string;
    actDeleted: string;
    actCancelled: string;
    actCheckedIn: string;
    actCheckedOut: string;
    actPayment: string;
    actNoShow: string;
    actActivated: string;
    actDeactivated: string;
    entReservation: string;
    entRoom: string;
    entUser: string;
    entSystem: string;
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
      guests: 'Guests',
      staff: 'Staff',
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
      room: 'Room',
      activeFilters: '{count} active',
      select: 'Select...',
      noOptions: 'No options found',
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
      arrivalsToday: 'Arrivals Today',
      departuresToday: 'Departures Due',
      inHouse: 'Guests In-House',
      paymentsThisMonth: 'Payments Received',
      outstandingBalance: 'Outstanding In-House',
      due: 'due',
      todaysMovements: "Today's Arrivals & Departures",
      nothingToday: 'No arrivals or departures left today.',
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
      pricePerNight: 'Price per Night',
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
      outOfService: 'Out of service',
      adminOnly: 'Only admins can add, edit or delete rooms.',
      maxPricePlaceholder: 'e.g. 200',
      modalSubtitle: 'Room number, type, nightly price and availability',
      availableHint: 'Turn off to take the room out of service',
      bookingsCount: '{count} bookings',
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
      filterByGuest: 'Guest name or phone...',
      filterByRoom: 'Filter by room...',
      allStatuses: 'All Statuses',
      guestPhone: 'Phone Number',
      guestEmail: 'Email',
      guestIdNumber: 'ID / Passport Number',
      notes: 'Notes',
      notesPlaceholder: 'Late arrival, extra bed, dietary needs...',
      guestDetails: 'Guest',
      stayDetails: 'Stay',
      returningGuest: 'Returning guest, details filled in',
      balance: 'Balance',
      paid: 'Paid',
      viewDetails: 'Open',
      guest: 'Guest',
      optional: 'optional',
    },
    stay: {
      confirmed: 'Confirmed',
      checkedIn: 'In-House',
      checkedOut: 'Checked Out',
      cancelled: 'Cancelled',
      noShow: 'No-Show',
      checkIn: 'Check In',
      checkOut: 'Check Out',
      markNoShow: 'Mark No-Show',
      checkInPrompt: 'Check in this guest now?',
      checkOutPrompt: 'Check out this guest now? The room will be released.',
      noShowPrompt: 'Mark this booking as a no-show? The room will be released.',
      checkedInAt: 'Checked in',
      checkedOutAt: 'Checked out',
      invoice: 'Invoice',
    },
    payments: {
      title: 'Payments',
      record: 'Record Payment',
      amount: 'Amount',
      method: 'Method',
      reference: 'Reference',
      referencePlaceholder: 'Card slip or transfer number',
      cash: 'Cash',
      card: 'Card',
      bankTransfer: 'Bank Transfer',
      paidAt: 'Date',
      receivedBy: 'Received By',
      none: 'No payments recorded yet.',
      balanceDue: 'Balance Due',
      paidInFull: 'Paid in full',
      payFullBalance: 'Full balance',
    },
    invoice: {
      title: 'Invoice',
      proforma: 'Pro-forma Invoice',
      number: 'Invoice No.',
      issued: 'Issued',
      billTo: 'Bill To',
      stay: 'Stay',
      description: 'Description',
      roomNights: 'Room {room} ({type}), nights',
      quantity: 'Qty',
      rate: 'Rate',
      amount: 'Amount',
      total: 'Total',
      totalPaid: 'Paid',
      balanceDue: 'Balance Due',
      print: 'Print / Save PDF',
      back: 'Back to Reservations',
      thankYou: 'Thank you for staying with us.',
      payments: 'Payments Received',
    },
    guests: {
      title: 'Guest Directory',
      subtitle: 'Every guest profile with stay history and payments',
      searchPlaceholder: 'Search name, phone or email...',
      phone: 'Phone',
      email: 'Email',
      idNumber: 'ID / Passport',
      stays: 'Stays',
      totalPaid: 'Total Paid',
      lastStay: 'Last Stay',
      guestSince: 'Guest since',
    },
    staff: {
      title: 'Staff Accounts',
      subtitle: 'Create front desk and admin accounts, and control who can sign in',
      addStaff: 'Add Staff Member',
      role: 'Role',
      admin: 'Admin',
      frontDesk: 'Front Desk',
      activate: 'Activate',
      deactivate: 'Deactivate',
      you: 'You',
      passwordHint: 'At least 8 characters, with a letter and a number.',
      joined: 'Joined',
    },
    demo: {
      title: 'Try the live demo',
      subtitle: 'Choose an account to sign in instantly.',
      adminDesc: 'Rooms, staff, reports and audit log',
      frontDeskDesc: 'Bookings, check-in/out and payments',
      resetNote: 'Demo data resets every night.',
    },
    toast: {
      titleSuccess: 'Done',
      titleError: 'Error',
      titleInfo: 'Update',
      titleNotice: 'Notice',
      loadFailed: 'Could not load the data. Refresh the page to try again.',
      genericError: 'Something went wrong. Please try again.',
      enterCredentials: 'Enter your email and password.',
      invalidLogin: 'Invalid email or password.',
      welcome: 'Welcome, {name}',
      completeBooking: 'Fill in the guest name, phone, room and dates.',
      checkoutAfterCheckin: 'Check-out date must be after check-in date.',
      enterAmount: 'Enter a payment amount greater than zero.',
      completeFields: 'Complete all required fields.',
      roomCreated: 'Room {room} added',
      roomUpdated: 'Room {room} updated',
      roomDeleted: 'Room {room} deleted',
      staffCreated: '{name} can now sign in',
      guestRoom: '{guest} · Room {room}',
      roomLabel: 'Room {room}',
      newReservation: 'New Reservation',
      reservationCreated: 'Reservation Created',
      checkedIn: 'Guest Checked In',
      checkedOut: 'Guest Checked Out',
      payment: 'Payment Recorded',
      cancelled: 'Reservation Cancelled',
      noShow: 'Marked as No-Show',
      updated: 'Reservation Updated',
      roomAdded: 'Room Added',
      roomChanged: 'Room Updated',
      roomRemoved: 'Room Deleted',
    },
    reports: {
      title: 'Performance & Analytics',
      subtitle: 'Revenue breakdown, top revenue generators, and occupancy trends',
      tabTopRooms: 'Top Rooms',
      tabRevenue: 'Revenue',
      tabOccupancy: 'Occupancy',
      revenueByRoomType: 'Revenue by Room Type',
      totalRevenue: 'Total Revenue',
      totalNights: 'Total Nights Sold',
      totalBookings: 'Total Bookings',
      occupancyPercentage: 'Occupancy %',
      generateReport: 'Generate Report',
      rank: 'Rank',
      bookedNights: 'Booked Nights',
      availableNights: 'Available Nights',
      topRoomsSubtitle: 'Rooms ranked by bookings and revenue',
      periodRevenue: 'For the selected dates',
      bookingsInPeriod: 'Stays in the selected dates',
      nightsOccupied: 'Room nights occupied',
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
      actCreated: 'Created',
      actUpdated: 'Updated',
      actDeleted: 'Deleted',
      actCancelled: 'Cancelled',
      actCheckedIn: 'Checked in',
      actCheckedOut: 'Checked out',
      actPayment: 'Payment',
      actNoShow: 'No-show',
      actActivated: 'Activated',
      actDeactivated: 'Deactivated',
      entReservation: 'Reservation',
      entRoom: 'Room',
      entUser: 'Staff account',
      entSystem: 'System',
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
      guests: 'النزلاء',
      staff: 'الموظفون',
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
      room: 'غرفة',
      activeFilters: '{count} نشط',
      select: 'اختر...',
      noOptions: 'لا توجد خيارات',
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
      arrivalsToday: 'الوصول اليوم',
      departuresToday: 'المغادرة المستحقة',
      inHouse: 'النزلاء المقيمون',
      paymentsThisMonth: 'المدفوعات المستلمة',
      outstandingBalance: 'المستحق على المقيمين',
      due: 'مستحقة',
      todaysMovements: 'حركة الوصول والمغادرة اليوم',
      nothingToday: 'لا يوجد وصول أو مغادرة متبقية اليوم.',
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
      pricePerNight: 'السعر في الليلة',
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
      outOfService: 'خارج الخدمة',
      adminOnly: 'إضافة الغرف وتعديلها وحذفها متاحة للمسؤولين فقط.',
      maxPricePlaceholder: 'مثال: 200',
      modalSubtitle: 'رقم الغرفة ونوعها وسعر الليلة وحالة التوافر',
      availableHint: 'أوقف التفعيل لإخراج الغرفة من الخدمة',
      bookingsCount: '{count} حجوزات',
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
      filterByGuest: 'اسم النزيل أو رقم الهاتف...',
      filterByRoom: 'بحث برقم الغرفة...',
      allStatuses: 'جميع الحالات',
      guestPhone: 'رقم الهاتف',
      guestEmail: 'البريد الإلكتروني',
      guestIdNumber: 'رقم الهوية / جواز السفر',
      notes: 'ملاحظات',
      notesPlaceholder: 'وصول متأخر، سرير إضافي، طلبات خاصة...',
      guestDetails: 'النزيل',
      stayDetails: 'الإقامة',
      returningGuest: 'نزيل سابق، تم ملء بياناته',
      balance: 'المتبقي',
      paid: 'المدفوع',
      viewDetails: 'فتح',
      guest: 'النزيل',
      optional: 'اختياري',
    },
    stay: {
      confirmed: 'مؤكد',
      checkedIn: 'مقيم',
      checkedOut: 'غادر',
      cancelled: 'ملغي',
      noShow: 'لم يحضر',
      checkIn: 'تسجيل الوصول',
      checkOut: 'تسجيل المغادرة',
      markNoShow: 'تسجيل عدم الحضور',
      checkInPrompt: 'تسجيل وصول هذا النزيل الآن؟',
      checkOutPrompt: 'تسجيل مغادرة هذا النزيل الآن؟ سيتم تحرير الغرفة.',
      noShowPrompt: 'تسجيل هذا الحجز كعدم حضور؟ سيتم تحرير الغرفة.',
      checkedInAt: 'وقت الوصول',
      checkedOutAt: 'وقت المغادرة',
      invoice: 'الفاتورة',
    },
    payments: {
      title: 'المدفوعات',
      record: 'تسجيل دفعة',
      amount: 'المبلغ',
      method: 'طريقة الدفع',
      reference: 'المرجع',
      referencePlaceholder: 'رقم إيصال البطاقة أو التحويل',
      cash: 'نقداً',
      card: 'بطاقة',
      bankTransfer: 'تحويل بنكي',
      paidAt: 'التاريخ',
      receivedBy: 'استلمها',
      none: 'لم يتم تسجيل أي مدفوعات بعد.',
      balanceDue: 'المبلغ المستحق',
      paidInFull: 'مدفوع بالكامل',
      payFullBalance: 'كامل المتبقي',
    },
    invoice: {
      title: 'فاتورة',
      proforma: 'فاتورة مبدئية',
      number: 'رقم الفاتورة',
      issued: 'تاريخ الإصدار',
      billTo: 'فاتورة إلى',
      stay: 'الإقامة',
      description: 'البيان',
      roomNights: 'غرفة {room} ({type})، ليالٍ',
      quantity: 'الكمية',
      rate: 'السعر',
      amount: 'المبلغ',
      total: 'الإجمالي',
      totalPaid: 'المدفوع',
      balanceDue: 'المبلغ المستحق',
      print: 'طباعة / حفظ PDF',
      back: 'العودة إلى الحجوزات',
      thankYou: 'شكراً لإقامتكم معنا.',
      payments: 'المدفوعات المستلمة',
    },
    guests: {
      title: 'دليل النزلاء',
      subtitle: 'ملفات جميع النزلاء مع سجل الإقامات والمدفوعات',
      searchPlaceholder: 'ابحث بالاسم أو الهاتف أو البريد...',
      phone: 'الهاتف',
      email: 'البريد الإلكتروني',
      idNumber: 'الهوية / الجواز',
      stays: 'الإقامات',
      totalPaid: 'إجمالي المدفوع',
      lastStay: 'آخر إقامة',
      guestSince: 'نزيل منذ',
    },
    staff: {
      title: 'حسابات الموظفين',
      subtitle: 'إنشاء حسابات الاستقبال والمسؤولين والتحكم في صلاحية الدخول',
      addStaff: 'إضافة موظف',
      role: 'الدور',
      admin: 'مسؤول',
      frontDesk: 'موظف استقبال',
      activate: 'تفعيل',
      deactivate: 'إيقاف',
      you: 'أنت',
      passwordHint: '8 أحرف على الأقل، تتضمن حرفاً ورقماً.',
      joined: 'تاريخ الانضمام',
    },
    demo: {
      title: 'جرّب النسخة التجريبية',
      subtitle: 'اختر حساباً لتسجيل الدخول فوراً.',
      adminDesc: 'الغرف والموظفون والتقارير وسجل التدقيق',
      frontDeskDesc: 'الحجوزات والوصول والمغادرة والمدفوعات',
      resetNote: 'يتم إعادة ضبط البيانات التجريبية كل ليلة.',
    },
    toast: {
      titleSuccess: 'تم',
      titleError: 'خطأ',
      titleInfo: 'تحديث',
      titleNotice: 'تنبيه',
      loadFailed: 'تعذّر تحميل البيانات. حدّث الصفحة للمحاولة مرة أخرى.',
      genericError: 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
      enterCredentials: 'أدخل البريد الإلكتروني وكلمة المرور.',
      invalidLogin: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
      welcome: 'مرحباً، {name}',
      completeBooking: 'أكمل اسم النزيل ورقم الهاتف والغرفة والتواريخ.',
      checkoutAfterCheckin: 'يجب أن يكون تاريخ المغادرة بعد تاريخ الوصول.',
      enterAmount: 'أدخل مبلغ دفع أكبر من صفر.',
      completeFields: 'أكمل جميع الحقول المطلوبة.',
      roomCreated: 'تمت إضافة الغرفة {room}',
      roomUpdated: 'تم تحديث الغرفة {room}',
      roomDeleted: 'تم حذف الغرفة {room}',
      staffCreated: 'يمكن لـ {name} تسجيل الدخول الآن',
      guestRoom: '{guest} · غرفة {room}',
      roomLabel: 'غرفة {room}',
      newReservation: 'حجز جديد',
      reservationCreated: 'تم إنشاء الحجز',
      checkedIn: 'تم تسجيل وصول النزيل',
      checkedOut: 'تم تسجيل مغادرة النزيل',
      payment: 'تم تسجيل دفعة',
      cancelled: 'تم إلغاء الحجز',
      noShow: 'تم تسجيل عدم الحضور',
      updated: 'تم تحديث الحجز',
      roomAdded: 'تمت إضافة غرفة',
      roomChanged: 'تم تحديث غرفة',
      roomRemoved: 'تم حذف غرفة',
    },
    reports: {
      title: 'التقارير ومؤشرات الأداء',
      subtitle: 'التحليل المالي، مصادر الإيرادات، ومعدلات الإشغال الفندقي',
      tabTopRooms: 'أفضل الغرف',
      tabRevenue: 'الإيرادات',
      tabOccupancy: 'الإشغال',
      revenueByRoomType: 'الإيرادات حسب نوع الغرفة',
      totalRevenue: 'إجمالي الإيرادات',
      totalNights: 'إجمالي الليالي المباعة',
      totalBookings: 'عدد الحجوزات',
      occupancyPercentage: 'نسبة الإشغال %',
      generateReport: 'إنشاء التقرير',
      rank: 'الترتيب',
      bookedNights: 'الليالي المحجوزة',
      availableNights: 'الليالي المتاحة',
      topRoomsSubtitle: 'الغرف مرتبة حسب الحجوزات والإيرادات',
      periodRevenue: 'للفترة المحددة',
      bookingsInPeriod: 'الإقامات في الفترة المحددة',
      nightsOccupied: 'الليالي المشغولة',
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
      actCreated: 'إنشاء',
      actUpdated: 'تعديل',
      actDeleted: 'حذف',
      actCancelled: 'إلغاء',
      actCheckedIn: 'تسجيل وصول',
      actCheckedOut: 'تسجيل مغادرة',
      actPayment: 'دفعة',
      actNoShow: 'عدم حضور',
      actActivated: 'تفعيل',
      actDeactivated: 'إيقاف',
      entReservation: 'حجز',
      entRoom: 'غرفة',
      entUser: 'حساب موظف',
      entSystem: 'النظام',
    },
  },
};
