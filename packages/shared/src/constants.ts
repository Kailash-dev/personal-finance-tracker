import { Category, MerchantRule, BankName, PaymentMethod, GoalCategory, DebtType } from '@personal-finance/types';

export const INDIAN_BANKS: { id: BankName; name: string; icon: string }[] = [
  { id: 'HDFC', name: 'HDFC Bank', icon: '🏦' },
  { id: 'SBI', name: 'State Bank of India', icon: '🏦' },
  { id: 'ICICI', name: 'ICICI Bank', icon: '🏦' },
  { id: 'AXIS', name: 'Axis Bank', icon: '🏦' },
  { id: 'KOTAK', name: 'Kotak Mahindra Bank', icon: '🏦' },
  { id: 'INDUSIND', name: 'IndusInd Bank', icon: '🏦' },
  { id: 'PNB', name: 'Punjab National Bank', icon: '🏦' },
  { id: 'BANK_OF_BARODA', name: 'Bank of Baroda', icon: '🏦' },
  { id: 'CANARA', name: 'Canara Bank', icon: '🏦' },
  { id: 'FEDERAL', name: 'Federal Bank', icon: '🏦' },
  { id: 'OTHER', name: 'Other Bank', icon: '🏦' },
];

export const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: 'UPI', label: 'UPI (GPay/PhonePe/Paytm)', icon: '📱' },
  { id: 'CREDIT_CARD', label: 'Credit Card', icon: '💳' },
  { id: 'DEBIT_CARD', label: 'Debit Card', icon: '💳' },
  { id: 'NET_BANKING', label: 'Net Banking', icon: '💻' },
  { id: 'NEFT', label: 'NEFT', icon: '🏦' },
  { id: 'IMPS', label: 'IMPS', icon: '⚡' },
  { id: 'RTGS', label: 'RTGS', icon: '🏛' },
  { id: 'AUTO_DEBIT', label: 'Auto Debit / NACH', icon: '🔄' },
  { id: 'CASH', label: 'Cash', icon: '💵' },
  { id: 'CHEQUE', label: 'Cheque', icon: '📝' },
  { id: 'OTHER', label: 'Other', icon: '⚙' },
];

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat_housing',
    name: 'Housing & Rent',
    icon: '🏠',
    color: '#6366F1',
    isEssential: true,
    subcategories: [
      { id: 'sub_rent', categoryId: 'cat_housing', name: 'Rent', icon: '🏠' },
      { id: 'sub_maintenance', categoryId: 'cat_housing', name: 'Society Maintenance', icon: '🏢' },
      { id: 'sub_homerepair', categoryId: 'cat_housing', name: 'Home Repair & Hardware', icon: '🔨' },
      { id: 'sub_furniture', categoryId: 'cat_housing', name: 'Furniture & Decor', icon: '🛋' },
      { id: 'sub_appliances', categoryId: 'cat_housing', name: 'Home Appliances', icon: '📺' },
    ],
  },
  {
    id: 'cat_food',
    name: 'Food & Dining',
    icon: '🍛',
    color: '#F59E0B',
    isEssential: true,
    subcategories: [
      { id: 'sub_groceries', categoryId: 'cat_food', name: 'Groceries (D-Mart/Blinkit)', icon: '🛒' },
      { id: 'sub_milk', categoryId: 'cat_food', name: 'Milk & Dairy (Amul/Country Delight)', icon: '🥛' },
      { id: 'sub_vegetables', categoryId: 'cat_food', name: 'Vegetables & Fruits', icon: '🥦' },
      { id: 'sub_delivery', categoryId: 'cat_food', name: 'Food Delivery (Zomato/Swiggy)', icon: '🛵' },
      { id: 'sub_restaurants', categoryId: 'cat_food', name: 'Restaurants & Cafes', icon: '🍽' },
      { id: 'sub_snacks', categoryId: 'cat_food', name: 'Chai & Snacks', icon: '☕' },
    ],
  },
  {
    id: 'cat_transport',
    name: 'Transportation',
    icon: '⛽',
    color: '#EC4899',
    isEssential: true,
    subcategories: [
      { id: 'sub_petrol', categoryId: 'cat_transport', name: 'Petrol / Diesel (HPCL/BPCL/IOCL)', icon: '⛽' },
      { id: 'sub_ev', categoryId: 'cat_transport', name: 'EV Charging', icon: '🔌' },
      { id: 'sub_auto_cab', categoryId: 'cat_transport', name: 'Auto / Rickshaw / Cab (Ola/Uber/Rapido)', icon: '🚕' },
      { id: 'sub_metro_bus', categoryId: 'cat_transport', name: 'Metro & Local Bus', icon: '🚇' },
      { id: 'sub_fastag', categoryId: 'cat_transport', name: 'FASTag & Tolls', icon: '🛣' },
      { id: 'sub_service', categoryId: 'cat_transport', name: 'Vehicle Service & Insurance', icon: '🔧' },
    ],
  },
  {
    id: 'cat_financial',
    name: 'Financial & EMIs',
    icon: '💳',
    color: '#EF4444',
    isEssential: true,
    subcategories: [
      { id: 'sub_emi_car', categoryId: 'cat_financial', name: 'Car Loan EMI', icon: '🚗' },
      { id: 'sub_emi_bike', categoryId: 'cat_financial', name: 'Bike Loan EMI', icon: '🏍' },
      { id: 'sub_emi_home', categoryId: 'cat_financial', name: 'Home Loan EMI', icon: '🏡' },
      { id: 'sub_emi_personal', categoryId: 'cat_financial', name: 'Personal Loan EMI', icon: '💳' },
      { id: 'sub_cc_payment', categoryId: 'cat_financial', name: 'Credit Card Bill Payment', icon: '💳' },
      { id: 'sub_insurance_life', categoryId: 'cat_financial', name: 'Life & Term Insurance', icon: '🛡' },
      { id: 'sub_bank_charges', categoryId: 'cat_financial', name: 'Bank Charges & Taxes', icon: '🏦' },
    ],
  },
  {
    id: 'cat_investment',
    name: 'Investments & Savings',
    icon: '📈',
    color: '#10B981',
    isEssential: false,
    subcategories: [
      { id: 'sub_sip', categoryId: 'cat_investment', name: 'Mutual Fund SIP (Groww/Zerodha)', icon: '📊' },
      { id: 'sub_stocks', categoryId: 'cat_investment', name: 'Direct Equity / Stocks', icon: '📈' },
      { id: 'sub_ppf_epf', categoryId: 'cat_investment', name: 'PPF / EPF / VPF', icon: '🔒' },
      { id: 'sub_nps', categoryId: 'cat_investment', name: 'NPS (National Pension Scheme)', icon: '👴' },
      { id: 'sub_fd_rd', categoryId: 'cat_investment', name: 'Fixed Deposit / RD', icon: '💰' },
      { id: 'sub_gold', categoryId: 'cat_investment', name: 'Sovereign Gold / Digital Gold', icon: '🪙' },
    ],
  },
  {
    id: 'cat_utilities',
    name: 'Utilities & Bills',
    icon: '📱',
    color: '#06B6D4',
    isEssential: true,
    subcategories: [
      { id: 'sub_electricity', categoryId: 'cat_utilities', name: 'Electricity Bill', icon: '💡' },
      { id: 'sub_water', categoryId: 'cat_utilities', name: 'Water & Gas (LPG/Piped)', icon: '🔥' },
      { id: 'sub_mobile', categoryId: 'cat_utilities', name: 'Mobile Recharge (Jio/Airtel/Vi)', icon: '📱' },
      { id: 'sub_wifi', categoryId: 'cat_utilities', name: 'Broadband / Wi-Fi', icon: '📶' },
      { id: 'sub_dth', categoryId: 'cat_utilities', name: 'DTH / OTT Subscriptions (Netflix/Prime)', icon: '📺' },
      { id: 'sub_maid', categoryId: 'cat_utilities', name: 'Maid & Cook Salary', icon: '🧹' },
    ],
  },
  {
    id: 'cat_family',
    name: 'Family & Personal',
    icon: '👨‍👩‍👧',
    color: '#8B5CF6',
    isEssential: false,
    subcategories: [
      { id: 'sub_wife_personal', categoryId: 'cat_family', name: 'Wife / Partner Personal', icon: '👗' },
      { id: 'sub_parents', categoryId: 'cat_family', name: 'Parents Support', icon: '👴' },
      { id: 'sub_kids', categoryId: 'cat_family', name: 'Kids & School Education', icon: '🎒' },
      { id: 'sub_shopping', categoryId: 'cat_family', name: 'Clothing & Shopping (Amazon/Myntra)', icon: '🛍' },
      { id: 'sub_grooming', categoryId: 'cat_family', name: 'Salon & Personal Care', icon: '💈' },
      { id: 'sub_gifts', categoryId: 'cat_family', name: 'Gifts & Festivals', icon: '🎁' },
    ],
  },
  {
    id: 'cat_healthcare',
    name: 'Healthcare & Wellness',
    icon: '💊',
    color: '#14B8A6',
    isEssential: true,
    subcategories: [
      { id: 'sub_doctor', categoryId: 'cat_healthcare', name: 'Doctor Consultations', icon: '👨‍⚕️' },
      { id: 'sub_medicines', categoryId: 'cat_healthcare', name: 'Medicines & Pharmacy (Apollo/PharmEasy)', icon: '💊' },
      { id: 'sub_tests', categoryId: 'cat_healthcare', name: 'Diagnostic Tests & Scans', icon: '🧪' },
      { id: 'sub_health_insurance', categoryId: 'cat_healthcare', name: 'Health Insurance Premium', icon: '🏥' },
      { id: 'sub_gym', categoryId: 'cat_healthcare', name: 'Gym & Fitness', icon: '🏋️' },
    ],
  },
  {
    id: 'cat_travel',
    name: 'Travel & Vacations',
    icon: '✈️',
    color: '#3B82F6',
    isEssential: false,
    subcategories: [
      { id: 'sub_flights', categoryId: 'cat_travel', name: 'Flight Bookings (MakeMyTrip/Indigo)', icon: '✈️' },
      { id: 'sub_train', categoryId: 'cat_travel', name: 'Train / IRCTC Tickets', icon: '🚆' },
      { id: 'sub_hotel', categoryId: 'cat_travel', name: 'Hotel & Stays', icon: '🏨' },
      { id: 'sub_trip_food', categoryId: 'cat_travel', name: 'Vacation Sightseeing & Food', icon: '🏖' },
    ],
  },
  {
    id: 'cat_income',
    name: 'Income',
    icon: '💰',
    color: '#10B981',
    isEssential: false,
    subcategories: [
      { id: 'sub_salary', categoryId: 'cat_income', name: 'Monthly Salary', icon: '💼' },
      { id: 'sub_freelance', categoryId: 'cat_income', name: 'Freelance / Consulting', icon: '💻' },
      { id: 'sub_dividend', categoryId: 'cat_income', name: 'Dividends & Interest', icon: '📈' },
      { id: 'sub_rental_income', categoryId: 'cat_income', name: 'Rental Income', icon: '🏠' },
      { id: 'sub_cashback', categoryId: 'cat_income', name: 'Cashback & Rewards', icon: '🎁' },
      { id: 'sub_other_income', categoryId: 'cat_income', name: 'Other Income', icon: '💵' },
    ],
  },
  {
    id: 'cat_transfer',
    name: 'Transfers & Cash',
    icon: '🔄',
    color: '#64748B',
    isEssential: false,
    subcategories: [
      { id: 'sub_acc_transfer', categoryId: 'cat_transfer', name: 'Self Account Transfer', icon: '🔄' },
      { id: 'sub_cash_withdrawal', categoryId: 'cat_transfer', name: 'ATM / Cash Withdrawal', icon: '🏧' },
      { id: 'sub_friend_transfer', categoryId: 'cat_transfer', name: 'Friend / Family Transfer', icon: '🤝' },
    ],
  },
  {
    id: 'cat_misc',
    name: 'Miscellaneous',
    icon: '📦',
    color: '#94A3B8',
    isEssential: false,
    subcategories: [
      { id: 'sub_donations', categoryId: 'cat_misc', name: 'Donations & Charity', icon: '🙏' },
      { id: 'sub_misc_other', categoryId: 'cat_misc', name: 'General Uncategorized', icon: '📦' },
    ],
  },
];

export const DEFAULT_MERCHANT_RULES: Omit<MerchantRule, 'id' | 'userId' | 'createdAt'>[] = [
  // Food & Dining
  { pattern: 'ZOMATO', merchantName: 'Zomato', categoryId: 'cat_food', subcategoryId: 'sub_delivery', confidenceScore: 0.98 },
  { pattern: 'SWIGGY', merchantName: 'Swiggy', categoryId: 'cat_food', subcategoryId: 'sub_delivery', confidenceScore: 0.98 },
  { pattern: 'DOMINOS', merchantName: "Domino's Pizza", categoryId: 'cat_food', subcategoryId: 'sub_delivery', confidenceScore: 0.95 },
  { pattern: 'MCDONALDS|MC DONALDS', merchantName: "McDonald's", categoryId: 'cat_food', subcategoryId: 'sub_restaurants', confidenceScore: 0.95, isRegex: true },
  { pattern: 'STARBUCKS|CHAAYOS|CHAI POINT', merchantName: 'Cafe', categoryId: 'cat_food', subcategoryId: 'sub_snacks', confidenceScore: 0.95, isRegex: true },
  
  // Groceries & Dairy
  { pattern: 'DMART|AVENUE SUPERMARTS', merchantName: 'DMart', categoryId: 'cat_food', subcategoryId: 'sub_groceries', confidenceScore: 0.98, isRegex: true },
  { pattern: 'BLINKIT|GROFERS', merchantName: 'Blinkit', categoryId: 'cat_food', subcategoryId: 'sub_groceries', confidenceScore: 0.98, isRegex: true },
  { pattern: 'ZEPTO', merchantName: 'Zepto', categoryId: 'cat_food', subcategoryId: 'sub_groceries', confidenceScore: 0.98 },
  { pattern: 'INSTAMART', merchantName: 'Swiggy Instamart', categoryId: 'cat_food', subcategoryId: 'sub_groceries', confidenceScore: 0.98 },
  { pattern: 'BIGBASKET|SUPERMARKET', merchantName: 'BigBasket', categoryId: 'cat_food', subcategoryId: 'sub_groceries', confidenceScore: 0.95, isRegex: true },
  { pattern: 'AMUL|COUNTRY DELIGHT|MOTHER DAIRY|MILK', merchantName: 'Dairy', categoryId: 'cat_food', subcategoryId: 'sub_milk', confidenceScore: 0.95, isRegex: true },
  { pattern: 'NATURES BASKET|RELIANCE SMART|RELIANCE FRESH', merchantName: 'Supermarket', categoryId: 'cat_food', subcategoryId: 'sub_groceries', confidenceScore: 0.95, isRegex: true },

  // Fuel & Auto
  { pattern: 'HPCL|HINDUSTAN PETROLEUM', merchantName: 'HP Petrol Pump', categoryId: 'cat_transport', subcategoryId: 'sub_petrol', confidenceScore: 0.98, isRegex: true },
  { pattern: 'BPCL|BHARAT PETROLEUM', merchantName: 'BPCL Petrol Pump', categoryId: 'cat_transport', subcategoryId: 'sub_petrol', confidenceScore: 0.98, isRegex: true },
  { pattern: 'IOCL|INDIAN OIL', merchantName: 'Indian Oil Petrol Pump', categoryId: 'cat_transport', subcategoryId: 'sub_petrol', confidenceScore: 0.98, isRegex: true },
  { pattern: 'SHELL', merchantName: 'Shell Petrol Pump', categoryId: 'cat_transport', subcategoryId: 'sub_petrol', confidenceScore: 0.98 },
  { pattern: 'OLA|UBER|RAPIDO', merchantName: 'Ride Hailing', categoryId: 'cat_transport', subcategoryId: 'sub_auto_cab', confidenceScore: 0.95, isRegex: true },
  { pattern: 'IHMCL|FASTAG|NETC', merchantName: 'FASTag Toll', categoryId: 'cat_transport', subcategoryId: 'sub_fastag', confidenceScore: 0.98, isRegex: true },

  // Shopping & eCommerce
  { pattern: 'AMAZON|AMZN', merchantName: 'Amazon', categoryId: 'cat_family', subcategoryId: 'sub_shopping', confidenceScore: 0.95, isRegex: true },
  { pattern: 'FLIPKART', merchantName: 'Flipkart', categoryId: 'cat_family', subcategoryId: 'sub_shopping', confidenceScore: 0.95 },
  { pattern: 'MYNTRA|AJIO|NYKAA|TATA CLIQ', merchantName: 'Fashion Shopping', categoryId: 'cat_family', subcategoryId: 'sub_shopping', confidenceScore: 0.95, isRegex: true },

  // Bills & Utilities
  { pattern: 'AIRTEL|JIO|VODAFONE|VI PREPAID|VI POSTPAID', merchantName: 'Telecom', categoryId: 'cat_utilities', subcategoryId: 'sub_mobile', confidenceScore: 0.98, isRegex: true },
  { pattern: 'BESCOM|TATA POWER|ADANI ELECTRICITY|MSEDCL|UPPCL|BSES', merchantName: 'Electricity Board', categoryId: 'cat_utilities', subcategoryId: 'sub_electricity', confidenceScore: 0.98, isRegex: true },
  { pattern: 'ACT FIBERNET|HATHWAY|AIRTEL FIBER|JIO FIBER', merchantName: 'Broadband', categoryId: 'cat_utilities', subcategoryId: 'sub_wifi', confidenceScore: 0.98, isRegex: true },
  { pattern: 'NETFLIX|SPOTIFY|PRIME VIDEO|HOTSTAR|DISNEY', merchantName: 'OTT Subscription', categoryId: 'cat_utilities', subcategoryId: 'sub_dth', confidenceScore: 0.98, isRegex: true },
  { pattern: 'INDRAPRASTHA GAS|IGL|MAHANAGAR GAS|MGL|HP GAS|INDANE', merchantName: 'Gas Utility', categoryId: 'cat_utilities', subcategoryId: 'sub_water', confidenceScore: 0.98, isRegex: true },

  // Housing & Maintenance
  { pattern: 'RENT|MYGATE|NOBROKER|APNACOMPLEX', merchantName: 'Rent / Society', categoryId: 'cat_housing', subcategoryId: 'sub_rent', confidenceScore: 0.92, isRegex: true },

  // Financial, Loans & EMIs
  { pattern: 'HDFC LOAN|BAJAJ FINANCE|BAJAJ FINSERV|TATA CAPITAL|SBI LOAN|ICICI LOAN|HOME LOAN|CAR LOAN|FULLERTON', merchantName: 'EMI Payment', categoryId: 'cat_financial', subcategoryId: 'sub_emi_car', defaultType: 'DEBT_PAYMENT', confidenceScore: 0.98, isRegex: true },
  { pattern: 'CRED|CRED CLUB', merchantName: 'CRED CC Bill', categoryId: 'cat_financial', subcategoryId: 'sub_cc_payment', defaultType: 'TRANSFER', confidenceScore: 0.98, isRegex: true },
  { pattern: 'LIC|HDFC LIFE|ICICI PRUDENTIAL|MAX LIFE|STAR HEALTH|CARE HEALTH|NIVA BUPA', merchantName: 'Insurance', categoryId: 'cat_financial', subcategoryId: 'sub_insurance_life', confidenceScore: 0.95, isRegex: true },

  // Investments
  { pattern: 'ZERODHA|GROWW|INDMONEY|KITE|UPSTOX|KUVERA|CAMSONLINE|KARVY|MUTUAL FUND|BSE LTD|NSE', merchantName: 'Investment / SIP', categoryId: 'cat_investment', subcategoryId: 'sub_sip', defaultType: 'INVESTMENT', confidenceScore: 0.98, isRegex: true },

  // Healthcare
  { pattern: 'APOLLO|PHARMEASY|1MG|NETMEDS|MEDPLUS', merchantName: 'Pharmacy', categoryId: 'cat_healthcare', subcategoryId: 'sub_medicines', confidenceScore: 0.98, isRegex: true },
  { pattern: 'LAL PATH|DR LAL|THYROCARE|SRL DIAGNOSTICS', merchantName: 'Diagnostics', categoryId: 'cat_healthcare', subcategoryId: 'sub_tests', confidenceScore: 0.95, isRegex: true },

  // Travel
  { pattern: 'IRCTC', merchantName: 'IRCTC Railways', categoryId: 'cat_travel', subcategoryId: 'sub_train', confidenceScore: 0.98 },
  { pattern: 'MAKEMYTRIP|MMT|GOIBIBO|EASEMYTRIP|INDIGO|AIR INDIA|VISTARA', merchantName: 'Flight / Travel Booking', categoryId: 'cat_travel', subcategoryId: 'sub_flights', confidenceScore: 0.95, isRegex: true },

  // Salary & Income
  { pattern: 'SALARY|SAL CR|PAYROLL|INFOSYS|TCS|WIPRO|GOOGLE|MICROSOFT|AMAZON DEV|CREDIT-SALARY', merchantName: 'Employer Salary', categoryId: 'cat_income', subcategoryId: 'sub_salary', defaultType: 'INCOME', confidenceScore: 0.98, isRegex: true },

  // ATM / Cash
  { pattern: 'ATM WDL|CASH WDL|ATM CASH|NFS WDL|EAW-', merchantName: 'ATM Cash Withdrawal', categoryId: 'cat_transfer', subcategoryId: 'sub_cash_withdrawal', defaultType: 'CASH_WITHDRAWAL', confidenceScore: 0.98, isRegex: true },
];

export interface QuickExpenseChip {
  id: string;
  name: string;
  icon: string;
  defaultDesc: string;
  group?: 'essentials' | 'bills' | 'lifestyle' | 'financial';
}

export const QUICK_CATEGORY_CHIPS: QuickExpenseChip[] = [
  // 1. Daily & Monthly Essentials
  { id: 'cat_housing:sub_rent', name: 'Rent', icon: '🏠', defaultDesc: 'Monthly House Rent', group: 'essentials' },
  { id: 'cat_food:sub_groceries', name: 'Groceries', icon: '🛒', defaultDesc: 'Groceries (D-Mart/Blinkit)', group: 'essentials' },
  { id: 'cat_food:sub_milk', name: 'Milk & Dairy', icon: '🥛', defaultDesc: 'Daily Milk (Amul/Country Delight)', group: 'essentials' },
  { id: 'cat_food:sub_vegetables', name: 'Vegetables', icon: '🥦', defaultDesc: 'Vegetables & Sabzi Mandi', group: 'essentials' },
  { id: 'cat_transport:sub_petrol', name: 'Fuel / Petrol', icon: '⛽', defaultDesc: 'Petrol / Diesel Fuel', group: 'essentials' },
  { id: 'cat_utilities:sub_maid', name: 'Maid / Cook', icon: '🧹', defaultDesc: 'Maid & Cook Salary', group: 'essentials' },

  // 2. Bills & Utilities
  { id: 'cat_utilities:sub_electricity', name: 'Electricity', icon: '⚡', defaultDesc: 'Electricity Bill', group: 'bills' },
  { id: 'cat_utilities:sub_wifi', name: 'Wi-Fi / Net', icon: '📶', defaultDesc: 'Broadband / Wi-Fi Bill', group: 'bills' },
  { id: 'cat_utilities:sub_mobile', name: 'Mobile Recharge', icon: '📱', defaultDesc: 'Mobile Recharge (Jio/Airtel)', group: 'bills' },
  { id: 'cat_utilities:sub_water', name: 'Gas / LPG', icon: '🔥', defaultDesc: 'LPG Gas Cylinder / Piped Gas', group: 'bills' },
  { id: 'cat_housing:sub_maintenance', name: 'Society Maint.', icon: '🏢', defaultDesc: 'Society Maintenance Fee', group: 'bills' },

  // 3. Lifestyle & Family
  { id: 'cat_food:sub_delivery', name: 'Swiggy/Zomato', icon: '🛵', defaultDesc: 'Food Delivery (Swiggy/Zomato)', group: 'lifestyle' },
  { id: 'cat_food:sub_restaurants', name: 'Dining / Chai', icon: '🍽', defaultDesc: 'Dining Out & Chai', group: 'lifestyle' },
  { id: 'cat_family:sub_shopping', name: 'Shopping', icon: '🛍', defaultDesc: 'Shopping (Amazon/Myntra)', group: 'lifestyle' },
  { id: 'cat_family:sub_wife_personal', name: 'Wife / Family', icon: '👨‍👩‍👧', defaultDesc: 'Wife / Family Allowance', group: 'lifestyle' },
  { id: 'cat_healthcare:sub_medicines', name: 'Medicines', icon: '💊', defaultDesc: 'Medicines & Pharmacy (Apollo/1mg)', group: 'lifestyle' },

  // 4. Financial, Loans & EMIs
  { id: 'cat_financial:sub_emi_bike', name: 'Bike EMI', icon: '🏍', defaultDesc: 'Bike Loan EMI', group: 'financial' },
  { id: 'cat_financial:sub_emi_car', name: 'Car EMI', icon: '🚗', defaultDesc: 'Car Loan EMI', group: 'financial' },
  { id: 'cat_financial:sub_bank_charges', name: 'Chit Fund / VC', icon: '🪙', defaultDesc: 'Chit Fund (VC 1 / VC 2)', group: 'financial' },
  { id: 'cat_financial:sub_cc_payment', name: 'Card Dues', icon: '💳', defaultDesc: 'Credit Card Bill Payment', group: 'financial' },
  { id: 'cat_investment:sub_sip', name: 'SIP Investment', icon: '📈', defaultDesc: 'Mutual Fund SIP (Groww/Zerodha)', group: 'financial' },
  { id: 'cat_misc:sub_misc_other', name: 'Other Misc', icon: '📦', defaultDesc: 'Miscellaneous Expense', group: 'lifestyle' },
];

export const QUICK_INCOME_CHIPS = [
  { id: 'cat_income:sub_salary', name: 'Salary', icon: '💼', defaultDesc: 'Monthly In-Hand Salary' },
  { id: 'cat_income:sub_freelance', name: 'Freelance', icon: '💻', defaultDesc: 'Freelance / Client Payment' },
  { id: 'cat_income:sub_dividend', name: 'Investments', icon: '📈', defaultDesc: 'Dividend / Interest Return' },
  { id: 'cat_income:sub_rental_income', name: 'Rent Received', icon: '🏠', defaultDesc: 'Rental Property Income' },
  { id: 'cat_income:sub_cashback', name: 'Cashback/Bonus', icon: '🎁', defaultDesc: 'Cashback / Performance Bonus' },
  { id: 'cat_income:sub_other_income', name: 'Other Income', icon: '💵', defaultDesc: 'Other Income / Credits' },
];

