import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "hi";
export type Theme = "light" | "dark";

const en = {
  brand: "Kisan Setu",
  tagline: "Your direct bridge to fair procurement",
  nav: {
    home: "Home",
    register: "Register",
    documents: "Documents",
    bookSlot: "Book Slot",
    queue: "Live Queue",
    prices: "Prices",
    history: "History",
    support: "Support",
    profile: "Profile",
    settings: "Settings",
    about: "About",
    logout: "Log out",
  },
  landing: {
    heroTitle: "Sell your harvest. Skip the queue.",
    heroSub:
      "Kisan Setu gives every farmer a verified profile, a booked slot and a live queue position — no more waiting all day at the procurement centre.",
    ctaPrimary: "Register as a farmer",
    ctaSecondary: "Sign in",
    statFarmers: "Farmers registered",
    statCentres: "Procurement centres",
    statSlots: "Slots booked today",
    feature1Title: "Verified in minutes",
    feature1Body:
      "Upload Aadhaar, land record and bank passbook. Our OCR pipeline reads your documents and verifies your profile automatically.",
    feature2Title: "Book your slot",
    feature2Body:
      "Pick a centre, date and hourly slot that works for you. Capacity is live — no more 5 AM queues.",
    feature3Title: "Know your place",
    feature3Body:
      "See exactly how many farmers are ahead of you, and get an SMS when it's almost your turn.",
    howTitle: "How it works",
    how1: "Create your account",
    how1Body: "Sign in with your email — it takes 30 seconds.",
    how2: "Register & verify",
    how2Body: "Add your details and upload documents for verification.",
    how3: "Book a slot",
    how3Body: "Choose a centre, day and time. Get your queue token instantly.",
    how4: "Sell & get paid",
    how4Body: "Reach the centre on time. Payment status is tracked in-app.",
    ctaTitle: "Ready to sell at the right price?",
    ctaBody: "Join thousands of farmers already using Kisan Setu.",
    footerNote: "Built for farmers of Bundelkhand · BIET Jhansi",
  },
  auth: {
    title: "Welcome to Kisan Setu",
    subtitle: "Sign in with your email to continue",
    emailLabel: "Email address",
    sendCode: "Send code",
    codeSent: "We sent a 6-digit code to",
    verify: "Verify & sign in",
    tryAgain: "Try again",
    changeEmail: "Use a different email",
    or: "or",
    guest: "Continue as guest",
    secured: "Secured by freebuff.com",
  },
  home: {
    greeting: "Welcome back",
    notRegistered: "Complete your registration to start booking slots.",
    registerNow: "Register now",
    verificationPending: "Verification pending",
    verificationPendingBody:
      "Your documents are under review. Slot booking opens as soon as you're verified.",
    verified: "Verified farmer",
    verifiedBody: "You're all set — book a slot and sell your harvest.",
    activeBooking: "Active booking",
    noBooking: "No active booking",
    noBookingBody: "You haven't booked a procurement slot yet.",
    position: "Your position",
    ahead: "farmers ahead of you",
    of: "of",
    inQueue: "in queue",
    quickActions: "Quick actions",
    bookSlot: "Book a slot",
    uploadDoc: "Upload documents",
    viewPrices: "Today's prices",
    statDocs: "Documents",
    statTx: "Transactions",
    recentTx: "Recent payments",
    noTx: "No transactions yet.",
  },
  register: {
    title: "Farmer registration",
    subtitle: "Details for your Kisan Setu farmer profile",
    name: "Full name",
    phone: "Mobile number",
    village: "Village",
    district: "District",
    state: "State",
    land: "Land holding (acres)",
    save: "Save & continue",
    saved: "Registration saved",
    updateSaved: "Profile updated",
    editProfile: "Edit profile",
  },
  docs: {
    title: "Document verification",
    subtitle:
      "Upload your documents. OCR reads them automatically and verifies your profile.",
    aadhaar: "Aadhaar card",
    pan: "PAN card",
    landRecord: "Land record (khatauni)",
    bankPassbook: "Bank passbook",
    upload: "Upload",
    uploaded: "Uploaded documents",
    status: "Status",
    none: "No documents uploaded yet.",
    verified: "Verified",
    processing: "Processing",
    rejected: "Rejected",
    delete: "Remove",
    ocrNote:
      "Our OCR + NLP pipeline extracts your ID number and name from the file and marks it verified.",
    idNumber: "Extracted ID",
    holder: "Holder",
  },
  booking: {
    title: "Book a procurement slot",
    subtitle: "Choose a centre, day and time",
    center: "Procurement centre",
    day: "Day",
    today: "Today",
    tomorrow: "Tomorrow",
    slot: "Time slot",
    capacity: "capacity",
    book: "Book this slot",
    booked: "Booked",
    full: "Full",
    confirmTitle: "Confirm your booking",
    confirmBody: "You'll get a queue token and a live position instantly.",
    cancel: "Cancel",
    confirm: "Confirm",
    bookedToast: "Slot booked! Token",
    alreadyBooked: "You already have an active booking.",
    needVerification: "Verify your documents to book a slot.",
  },
  queue: {
    title: "Live queue",
    subtitle: "Real-time position at your procurement centre",
    token: "Token",
    center: "Centre",
    slotLabel: "Slot",
    yourPosition: "Your position",
    total: "Total in queue",
    peopleAhead: "Farmers ahead of you",
    active: "You're up soon — get ready!",
    waiting: "Waiting for your turn. We'll notify you by SMS.",
    noneActive: "No active booking",
    noneActiveBody: "Book a slot to see your live queue position.",
    bookNow: "Book a slot now",
    cancelBooking: "Cancel booking",
    cancelledToast: "Booking cancelled",
    history: "Past bookings",
    historyEmpty: "No past bookings.",
  },
  prices: {
    title: "Today's support prices",
    subtitle: "Minimum Support Price (MSP) per quintal",
    crop: "Crop",
    price: "Price / quintal",
    updated: "Updated",
    searchPlaceholder: "Search crops…",
  },
  history: {
    title: "Transaction history",
    subtitle: "Payments for your sold produce",
    ref: "Reference",
    crop: "Crop",
    qty: "Quantity (q)",
    rate: "Rate (₹/q)",
    amount: "Amount",
    status: "Status",
    paid: "Paid",
    pending: "Pending",
    empty: "No transactions yet.",
    total: "Total received",
    totalPending: "Awaiting payment",
  },
  support: {
    title: "Contact & support",
    subtitle: "We're here to help",
    helpline: "Helpline (toll free)",
    email: "Email",
    office: "Office",
    officeAddr: "Bundelkhand Institute of Engineering & Technology, Jhansi, UP 284128",
    hours: "Mon–Sat, 8 AM – 6 PM",
    faq: "Frequently asked questions",
    rate: "Rate your experience",
    rateThanks: "Thanks for your feedback!",
    faq1: "What documents do I need?",
    faq1Body:
      "Aadhaar, PAN, land record (khatauni) and bank passbook. Upload them in the Documents tab.",
    faq2: "When do I get paid?",
    faq2Body:
      "Payment is transferred within 3 working days of procurement. Track it in Transaction history.",
    faq3: "Can I change my slot?",
    faq3Body:
      "Yes — cancel your active booking and book a different slot anytime before your turn.",
  },
  profile: {
    title: "Profile",
    subtitle: "Your Kisan Setu identity",
    personal: "Personal details",
    verification: "Verification",
    member: "Member since",
    notRegistered: "Not registered yet",
  },
  settings: {
    title: "Settings",
    subtitle: "Language and appearance",
    language: "Language",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    about: "About Kisan Setu",
    aboutBody:
      "Kisan Setu connects farmers directly with government procurement centres: register once, verify your documents, book a slot, and track your queue and payment — all from your phone.",
  },
  common: {
    loading: "Loading…",
    save: "Save",
    cancel: "Cancel",
    close: "Close",
    viewAll: "View all",
    dashboard: "Dashboard",
  },
};

type Dict = typeof en;

const hi: Dict = {
  brand: "किसान सेतु",
  tagline: "न्यायपूर्ण खरीद के लिए आपका सीधा पुल",
  nav: {
    home: "होम",
    register: "पंजीकरण",
    documents: "दस्तावेज़",
    bookSlot: "स्लॉट बुक करें",
    queue: "लाइव कतार",
    prices: "भाव",
    history: "इतिहास",
    support: "सहायता",
    profile: "प्रोफ़ाइल",
    settings: "सेटिंग्स",
    about: "बारे में",
    logout: "लॉग आउट",
  },
  landing: {
    heroTitle: "अपनी फ़सल बेचें। कतार छोड़ें।",
    heroSub:
      "किसान सेतु हर किसान को सत्यापित प्रोफ़ाइल, बुक किया हुआ स्लॉट और लाइव कतार स्थिति देता है — खरीद केंद्र पर दिनभर इंतज़ार नहीं।",
    ctaPrimary: "किसान पंजीकरण करें",
    ctaSecondary: "साइन इन करें",
    statFarmers: "पंजीकृत किसान",
    statCentres: "खरीद केंद्र",
    statSlots: "आज बुक हुए स्लॉट",
    feature1Title: "मिनटों में सत्यापन",
    feature1Body:
      "आधार, भू-अभिलेख और बैंक पासबुक अपलोड करें। हमारी OCR पाइपलाइन आपके दस्तावेज़ पढ़कर प्रोफ़ाइल सत्यापित करती है।",
    feature2Title: "अपना स्लॉट बुक करें",
    feature2Body:
      "केंद्र, दिन और अपने अनुसार एक घंटे का स्लॉट चुनें। क्षमता लाइव दिखती है — सुबह 5 बजे की कतार नहीं।",
    feature3Title: "अपनी जगह जानें",
    feature3Body:
      "देखें कि आपसे पहले कितने किसान हैं, और आपकी बारी आने पर SMS पाएं।",
    howTitle: "यह कैसे काम करता है",
    how1: "खाता बनाएं",
    how1Body: "अपने ईमेल से साइन इन करें — बस 30 सेकंड।",
    how2: "पंजीकरण और सत्यापन",
    how2Body: "अपनी जानकारी भरें और दस्तावेज़ अपलोड करें।",
    how3: "स्लॉट बुक करें",
    how3Body: "केंद्र, दिन और समय चुनें। कतार टोकन तुरंत मिलेगा।",
    how4: "बेचें और भुगतान पाएं",
    how4Body: "समय पर केंद्र पहुंचें। भुगतान स्थिति ऐप में दिखती है।",
    ctaTitle: "सही दाम पर बेचने के लिए तैयार?",
    ctaBody: "हज़ारों किसान पहले से किसान सेतु का उपयोग कर रहे हैं।",
    footerNote: "बुंदेलखंड के किसानों के लिए · बीआईईटी झांसी",
  },
  auth: {
    title: "किसान सेतु में आपका स्वागत है",
    subtitle: "आगे बढ़ने के लिए अपने ईमेल से साइन इन करें",
    emailLabel: "ईमेल पता",
    sendCode: "कोड भेजें",
    codeSent: "हमने 6 अंकों का कोड भेजा है",
    verify: "सत्यापित करें और साइन इन करें",
    tryAgain: "फिर कोशिश करें",
    changeEmail: "दूसरा ईमेल उपयोग करें",
    or: "या",
    guest: "अतिथि के रूप में जारी रखें",
    secured: "freebuff.com द्वारा सुरक्षित",
  },
  home: {
    greeting: "वापसी पर स्वागत",
    notRegistered: "स्लॉट बुक करने के लिए अपना पंजीकरण पूरा करें।",
    registerNow: "अभी पंजीकरण करें",
    verificationPending: "सत्यापन लंबित",
    verificationPendingBody:
      "आपके दस्तावेज़ समीक्षा में हैं। सत्यापन होते ही स्लॉट बुकिंग खुल जाएगी।",
    verified: "सत्यापित किसान",
    verifiedBody: "सब तैयार है — स्लॉट बुक करें और अपनी फ़सल बेचें।",
    activeBooking: "सक्रिय बुकिंग",
    noBooking: "कोई सक्रिय बुकिंग नहीं",
    noBookingBody: "आपने अभी तक कोई स्लॉट बुक नहीं किया है।",
    position: "आपकी जगह",
    ahead: "किसान आपसे आगे",
    of: "में से",
    inQueue: "कतार में",
    quickActions: "त्वरित कार्य",
    bookSlot: "स्लॉट बुक करें",
    uploadDoc: "दस्तावेज़ अपलोड करें",
    viewPrices: "आज के भाव",
    statDocs: "दस्तावेज़",
    statTx: "लेन-देन",
    recentTx: "हाल के भुगतान",
    noTx: "अभी कोई लेन-देन नहीं।",
  },
  register: {
    title: "किसान पंजीकरण",
    subtitle: "आपकी किसान सेतु प्रोफ़ाइल के लिए जानकारी",
    name: "पूरा नाम",
    phone: "मोबाइल नंबर",
    village: "गाँव",
    district: "ज़िला",
    state: "राज्य",
    land: "भूमि (एकड़ में)",
    save: "सहेजें और आगे बढ़ें",
    saved: "पंजीकरण सहेजा गया",
    updateSaved: "प्रोफ़ाइल अपडेट हुई",
    editProfile: "प्रोफ़ाइल संपादित करें",
  },
  docs: {
    title: "दस्तावेज़ सत्यापन",
    subtitle:
      "अपने दस्तावेज़ अपलोड करें। OCR उन्हें स्वतः पढ़ता है और प्रोफ़ाइल सत्यापित करता है।",
    aadhaar: "आधार कार्ड",
    pan: "पैन कार्ड",
    landRecord: "भू-अभिलेख (खसरा/खतौनी)",
    bankPassbook: "बैंक पासबुक",
    upload: "अपलोड",
    uploaded: "अपलोड किए दस्तावेज़",
    status: "स्थिति",
    none: "अभी कोई दस्तावेज़ अपलोड नहीं किया गया।",
    verified: "सत्यापित",
    processing: "प्रक्रिया में",
    rejected: "अस्वीकृत",
    delete: "हटाएं",
    ocrNote:
      "हमारी OCR + NLP पाइपलाइन फ़ाइल से आपका आईडी नंबर और नाम निकालकर उसे सत्यापित करती है।",
    idNumber: "निकाला गया आईडी",
    holder: "धारक",
  },
  booking: {
    title: "खरीद स्लॉट बुक करें",
    subtitle: "केंद्र, दिन और समय चुनें",
    center: "खरीद केंद्र",
    day: "दिन",
    today: "आज",
    tomorrow: "कल",
    slot: "समय स्लॉट",
    capacity: "क्षमता",
    book: "यह स्लॉट बुक करें",
    booked: "बुक",
    full: "भरा हुआ",
    confirmTitle: "बुकिंग की पुष्टि करें",
    confirmBody: "आपको तुरंत कतार टोकन और स्थिति मिलेगी।",
    cancel: "रद्द करें",
    confirm: "पुष्टि करें",
    bookedToast: "स्लॉट बुक हुआ! टोकन",
    alreadyBooked: "आपकी पहले से एक सक्रिय बुकिंग है।",
    needVerification: "स्लॉट बुक करने के लिए दस्तावेज़ सत्यापित कराएं।",
  },
  queue: {
    title: "लाइव कतार",
    subtitle: "खरीद केंद्र पर वास्तविक समय की स्थिति",
    token: "टोकन",
    center: "केंद्र",
    slotLabel: "स्लॉट",
    yourPosition: "आपकी जगह",
    total: "कतार में कुल",
    peopleAhead: "आपसे आगे किसान",
    active: "आपकी बारी आने वाली है — तैयार हो जाएं!",
    waiting: "अपनी बारी की प्रतीक्षा करें। हम SMS से सूचित करेंगे।",
    noneActive: "कोई सक्रिय बुकिंग नहीं",
    noneActiveBody: "लाइव कतार स्थिति देखने के लिए स्लॉट बुक करें।",
    bookNow: "अभी स्लॉट बुक करें",
    cancelBooking: "बुकिंग रद्द करें",
    cancelledToast: "बुकिंग रद्द हुई",
    history: "पिछली बुकिंग",
    historyEmpty: "कोई पिछली बुकिंग नहीं।",
  },
  prices: {
    title: "आज के समर्थन मूल्य",
    subtitle: "प्रति क्विंटल न्यूनतम समर्थन मूल्य (MSP)",
    crop: "फ़सल",
    price: "मूल्य / क्विंटल",
    updated: "अपडेट",
    searchPlaceholder: "फ़सलें खोजें…",
  },
  history: {
    title: "लेन-देन इतिहास",
    subtitle: "बेची गई फ़सल के भुगतान",
    ref: "संदर्भ",
    crop: "फ़सल",
    qty: "मात्रा (क्विंटल)",
    rate: "दर (₹/क्विंटल)",
    amount: "राशि",
    status: "स्थिति",
    paid: "भुगतान हुआ",
    pending: "लंबित",
    empty: "अभी कोई लेन-देन नहीं।",
    total: "कुल प्राप्त",
    totalPending: "भुगतान प्रतीक्षित",
  },
  support: {
    title: "संपर्क और सहायता",
    subtitle: "हम आपकी मदद के लिए यहां हैं",
    helpline: "हेल्पलाइन (टोल फ्री)",
    email: "ईमेल",
    office: "कार्यालय",
    officeAddr:
      "बुंदेलखंड प्रौद्योगिकी संस्थान (BIET), झांसी, उप्र 284128",
    hours: "सोम–शनि, सुबह 8 – शाम 6",
    faq: "अक्सर पूछे जाने वाले प्रश्न",
    rate: "अपने अनुभव को रेट करें",
    rateThanks: "आपकी राय के लिए धन्यवाद!",
    faq1: "मुझे कौन से दस्तावेज़ चाहिए?",
    faq1Body:
      "आधार, पैन, भू-अभिलेख (खतौनी) और बैंक पासबुक। इन्हें दस्तावेज़ टैब में अपलोड करें।",
    faq2: "भुगतान कब मिलेगा?",
    faq2Body:
      "खरीद के 3 कार्य दिवसों में भुगतान जमा हो जाता है। लेन-देन इतिहास में देखें।",
    faq3: "क्या मैं स्लॉट बदल सकता हूं?",
    faq3Body:
      "हां — अपनी सक्रिय बुकिंग रद्द करें और अपनी बारी से पहले कभी भी दूसरा स्लॉट बुक करें।",
  },
  profile: {
    title: "प्रोफ़ाइल",
    subtitle: "आपकी किसान सेतु पहचान",
    personal: "व्यक्तिगत जानकारी",
    verification: "सत्यापन",
    member: "सदस्य बने",
    notRegistered: "अभी पंजीकृत नहीं",
  },
  settings: {
    title: "सेटिंग्स",
    subtitle: "भाषा और रूप",
    language: "भाषा",
    theme: "थीम",
    light: "लाइट",
    dark: "डार्क",
    about: "किसान सेतु के बारे में",
    aboutBody:
      "किसान सेतु किसानों को सरकारी खरीद केंद्रों से सीधे जोड़ता है: एक बार पंजीकरण करें, दस्तावेज़ सत्यापित कराएं, स्लॉट बुक करें, और अपनी कतार व भुगतान ट्रैक करें — सब अपने फोन से।",
  },
  common: {
    loading: "लोड हो रहा है…",
    save: "सहेजें",
    cancel: "रद्द करें",
    close: "बंद करें",
    viewAll: "सभी देखें",
    dashboard: "डैशबोर्ड",
  },
};

interface AppContext {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const AppContext = createContext<AppContext | null>(null);

function detectTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem("kisan-theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en";
    return localStorage.getItem("kisan-lang") === "hi" ? "hi" : "en";
  });
  const [theme, setThemeState] = useState<Theme>(detectTheme);

  useEffect(() => {
    localStorage.setItem("kisan-lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    localStorage.setItem("kisan-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const value = useMemo<AppContext>(
    () => ({
      lang,
      setLang: setLangState,
      t: lang === "hi" ? hi : en,
      theme,
      setTheme: setThemeState,
    }),
    [lang, theme],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
