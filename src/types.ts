export type ServiceId =
  | 'usa-numbers'
  | 'log-accounts'
  | 'marketplace'
  | 'special-marketplace'
  | 'buy-numbers'
  | 'boost-accounts'
  | 'telegram-tick'
  | 'transaction-history'
  | 'rent-number'
  | 'esim'
  | 'ng-airtime'
  | 'buy-gift-cards'
  | 'sell-gift-cards'
  | 'proxies'
  | 'developer-api'
  | 'partner-program'
  | 'worldwide-gifts'
  | 'tracking-center'
  | 'video-tutorials';

export interface ServiceItem {
  id: ServiceId;
  name: string;
  iconType: string;
  isPrimary?: boolean; // For Transaction History filled circle
  isEnabled?: boolean;
  statusMessage?: string;
}

export interface CountryItem {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
  minPrice: number;
  enabled?: boolean;
}

export interface UsaServiceItem {
  id: string;
  name: string;
  price: number;
  icon: string;
  popular?: boolean;
  enabled?: boolean;
}

export interface AdminSettings {
  systemAnnouncement: string;
  announcementEnabled: boolean;
  upstreamApiUrl: string;
  upstreamApiKey: string;
  maintenanceMode: boolean;
  currencySymbol: string;
  globalPriceMultiplier: number;
  airtimeDiscountPercent?: number;
  telegramTickPrice?: number;
  supportPhone?: string;
  supportTelegram?: string;
  supportWhatsapp?: string;
  whatsappChannelUrl?: string;
}

export interface ProviderSyncReport {
  syncStartTime?: string;
  syncEndTime?: string;
  connectionStatus?: 'Connected' | 'Failed' | 'Pending';
  authStatus?: 'Authenticated' | 'Failed' | 'Credentials Required';
  catalogStatus?: 'Retrieved' | 'Partial' | 'Failed';
  dbStatus?: 'Saved' | 'Preserved' | 'Failed';
  totalCountries: number;
  totalServices: number;
  totalCategories?: number;
  totalProductsRetrieved?: number;
  totalProductsSaved: number;
  productsCreated?: number;
  productsUpdated?: number;
  productsSkipped?: number;
  productsFailed?: number;
  inStockCount?: number;
  outOfStockCount?: number;
  pagesProcessed: number;
  failedRequests: number;
  paginationStatus?: 'Complete' | 'Partial' | 'Failed';
  lastSuccessfulSync: string;
  lastSyncError?: string | null;
  unmappedProductsCount: number;
  unmappedProducts?: string[];
  statusMessage?: string;
}

export interface ProviderConfig {
  id: 'nova' | 'benotp' | 'rakib';
  name: string;
  website: string;
  baseUrl: string;
  docsUrl?: string;
  apiKey: string;
  apiToken?: string;
  secretKey?: string;
  enabled: boolean;
  status: 'active' | 'credentials_required' | 'error' | 'offline';
  priority: number; // 1 = checked first for auto-select (BenOTP default)
  balance: number;
  lastSync: string | null;
  lastError: string | null;
  supportedServices: string[];
  orderHistoryCount?: number;
  syncReport?: ProviderSyncReport;
}

export interface VirtualNumberOffer {
  id: string;
  providerId: 'nova' | 'benotp' | 'rakib';
  providerName: string;
  serviceId: string;
  serviceName: string;
  aliases?: string[];
  countryCode: string;
  countryName: string;
  countryFlag: string;
  dialCode: string;
  providerCost: number; // actual API cost
  sellingPrice: number; // selling price with markup
  currency: string;
  availability: 'in_stock' | 'low_stock' | 'out_of_stock';
  stockCount?: number;
  activationType: 'Single SMS' | 'Rental (20 min)' | 'Multi SMS';
  lastRefreshed: string;
}

export interface LogOffer {
  id: string;
  providerId: 'nova' | 'rakib';
  providerName: string;
  category: string;
  productName: string;
  accountAge: string;
  providerCost: number;
  sellingPrice: number;
  stock: number;
  format: string;
  features: string[];
  availability: 'available' | 'sold_out';
  lastSync: string;
}

export interface PricingRuleConfig {
  globalMarkupPercent: number; // e.g. 15%
  fixedMarkupAmount: number; // e.g. 500 (Admin-set fixed profit in Naira)
  defaultProfitMargin: number; // e.g. 500
  providerMarkups: Record<string, number>; // { nova: 15, benotp: 12, rakib: 20 }
  providerFixedProfits: Record<string, number>; // { nova: 500, benotp: 500, rakib: 1000 }
  serviceMarkups: Record<string, number>;
  productFixedProfits?: Record<string, number>; // Custom fixed profit per product ID
  customProductPrices?: Record<string, number>; // Custom override price per product ID
  categoryMarkups?: Record<string, number>;
  countryMarkups?: Record<string, number>;
  roundingRule: 'none' | 'round_50' | 'round_100';
  allowCustomManualPrice: boolean;
  minimumProfitMargin: number;
}

export interface CustomerNumberOffer {
  id: string;
  serviceId: string;
  serviceName: string;
  aliases?: string[];
  countryCode: string;
  countryName: string;
  countryFlag: string;
  dialCode: string;
  sellingPrice: number;
  currency: string;
  availability: 'in_stock' | 'low_stock' | 'out_of_stock';
  stockCount?: number;
  activationType: 'Single SMS' | 'Rental (20 min)' | 'Multi SMS';
  serverNumber: number;
  serverLabel: string;
  category: 'usa' | 'all';
}

export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  username?: string;
  passwordHash?: string;
  salt?: string;
  walletBalance: number;
  totalDeposited: number;
  totalSpent: number;
  ordersCount: number;
  successfulOrders: number;
  failedOrders: number;
  status: 'Active' | 'Suspended' | 'Under Review';
  tier: 'Standard' | 'VIP Reseller' | 'Wholesale';
  joinedAt: string;
  lastActive: string;
  referralCode?: string;
  referralLink?: string;
  referredBy?: string;
  totalReferrals?: number;
  qualifiedReferrals?: number;
  referralEarnings?: number;
  referralBalance?: number;
  virtualAccount?: {
    accountNumber: string;
    bankName: string;
    accountName: string;
    flwRef?: string;
    orderRef?: string;
    createdAt: string;
    status: 'active' | 'pending' | 'failed';
    note?: string;
  };
}

export interface MarketplaceCategory {
  id: number | string;
  name: string;
}

export interface MarketplaceProduct {
  id: number;
  name: string;
  category: number | string;
  categoryName?: string;
  price: number; // raw provider price
  sellingPrice: number; // customer price in NGN
  currency: string;
  stock: number;
  inStock: boolean;
  description?: string;
}

export interface MarketplaceOrder {
  id: string;
  customerId: string;
  customerName?: string;
  productId: number;
  productName: string;
  categoryId?: number | string;
  categoryName?: string;
  quantity: number;
  unitPrice: number;
  totalCharge: number;
  currency: string;
  keys: string[]; // actual purchased keys delivered
  providerOrderId?: number | string;
  status: 'Completed' | 'Pending' | 'Failed';
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  category?: 'AUTH' | 'PROVIDER' | 'ORDER' | 'WALLET' | 'PRICING' | 'SETTINGS' | 'SECURITY';
  details: string;
  ip?: string;
  status?: 'Success' | 'Warning' | 'Failed';
}

export interface InterestProgramConfig {
  enabled: boolean;
  programName: string;
  annualRatePercent: number;
  calculationFrequency: 'daily' | 'weekly' | 'monthly';
  accrualSchedule: string;
  minEligibleBalance: number;
  maxEligibleBalance: number;
  eligibleAccountTypes: string[];
  withdrawalRules: string;
  terms: string;
  disclaimer: string;
}

export interface WebsiteMasterSettings {
  websiteName: string;
  tagline: string;
  logoUrl: string;
  contactEmail: string;
  whatsappSupportNumber: string;
  callPhoneNumber?: string;
  whatsappSupportLabel: string;
  whatsappWelcomeMessage: string;
  whatsappSupportPlacement: 'all' | 'header' | 'floating';
  whatsappSupportEnabled: boolean;
  whatsappChannelUrl: string;
  whatsappChannelTitle: string;
  whatsappChannelLabel: string;
  whatsappChannelDescription: string;
  whatsappChannelPlacement: 'all' | 'header' | 'banner';
  whatsappChannelEnabled: boolean;
  systemAnnouncement: string;
  announcementEnabled: boolean;
  customerNotice: string;
  customerNoticeEnabled: boolean;
  maintenanceMode: boolean;
  currency: string;
  currencySymbol: string;
  minDeposit: number;
  maxDeposit: number;
  minPurchase: number;
  maxPurchase: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  manualPaymentEnabled?: boolean;
  manualPaymentInstructions?: string;
  manualPaymentMinDeposit?: number;
  termsOfService: string;
  privacyPolicy: string;
  adminPasscodeHash?: string;
  adminPasscodeSalt?: string;
  adminUsername?: string;
  adminPasscodeLastChanged?: string;
  referralCommissionPercent?: number;
  referralMinWithdrawal?: number;
  referralEnabled?: boolean;
  flutterwaveEnabled?: boolean;
  flutterwaveMode?: 'test' | 'live';
  flutterwavePublicKey?: string;
  flutterwaveSecretKey?: string;
  flutterwaveSecretHash?: string;
  googleClientId?: string;
  googleClientSecret?: string;
  emailServiceEnabled?: boolean;
  emailProvider?: 'resend' | 'smtp' | 'sendgrid' | 'none';
  emailApiKey?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  emailFromAddress?: string;
}

export interface ManualPaymentRequest {
  id: string;
  reference: string;
  customerId: string;
  customerName: string;
  customerUsername?: string;
  customerEmail: string;
  customerPhone?: string;
  amount: number;
  approvedAmount?: number;
  currency: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  transferReference?: string;
  receiptUrl?: string; // image URL or base64 data URI
  receiptFileName?: string;
  status: 'Pending Approval' | 'Approved' | 'Rejected';
  rejectionReason?: string;
  adminNotes?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  reference: string;
  flwTransactionId?: string | number;
  flwRef?: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  amount: number;
  currency: string;
  status: 'pending' | 'successful' | 'failed' | 'cancelled';
  paymentMethod?: string;
  creditedToWallet: boolean;
  creditedAt?: string;
  paymentUrl?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FlutterwaveConfigSummary {
  enabled: boolean;
  mode: 'test' | 'live';
  isConfigured: boolean;
  hasSecretKey: boolean;
  hasPublicKey: boolean;
  hasSecretHash: boolean;
  maskedSecretKey: string;
  publicKey: string;
  webhookUrl: string;
  secretHashMasked: string;
  currency: string;
}

export interface UserWallet {
  balance: number;
  currency: string;
  bonus: number;
  accountNumber: string;
  bankName: string;
  accountName: string;
}

export interface Transaction {
  id: string;
  reference: string;
  service: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  status: 'Successful' | 'Pending' | 'Failed';
  date: string;
  providerId?: 'nova' | 'benotp' | 'rakib' | 'internal';
  providerRef?: string;
  refunded?: boolean;
  customerId?: string;
  details?: Record<string, string>;
}

export interface VirtualNumberOrder {
  id: string;
  phoneNumber: string;
  country: string;
  serviceName: string;
  price: number;
  status: 'Waiting for SMS' | 'Received' | 'Expired';
  code?: string;
  expiresInSeconds: number;
  fullSms?: string;
  providerId?: 'nova' | 'benotp' | 'rakib';
  providerOrderId?: string;
}

export interface LogAccountProduct {
  id: string;
  platform: 'Google' | 'Facebook' | 'Instagram' | 'Twitter' | 'TikTok' | 'LinkedIn' | 'Discord' | 'Telegram';
  name: string;
  age: string;
  price: number;
  stock: number;
  format: string;
  features: string[];
}

export interface PurchasedLogAccount {
  id: string;
  productName: string;
  credentials: {
    email?: string;
    username?: string;
    password?: string;
    recoveryEmail?: string;
    twoFaSecret?: string;
    cookieJson?: string;
  };
  purchasedAt: string;
}

export interface SocialBoostPackage {
  id: string;
  platform: 'Instagram' | 'Telegram' | 'Twitter' | 'TikTok' | 'YouTube' | 'Facebook';
  serviceType: string;
  ratePerThousand: number;
  min: number;
  max: number;
  speed: string;
}

export interface GiftCardRate {
  id: string;
  brand: string;
  country: string;
  type: 'Physical' | 'E-code';
  ratePerDollar: number; // in NGN
}

export interface ProxyPackage {
  id: string;
  name: string;
  type: 'Residential' | 'Datacenter' | 'Mobile 4G/5G';
  bandwidth: string;
  protocol: 'HTTP/HTTPS/SOCKS5';
  price: number;
  location: string;
}

export interface ApiConfiguration {
  apiKey: string;
  apiSecret: string;
  baseUrl: string;
  webhookUrl?: string;
}

export type TelegramServiceType = 'stars' | 'premium' | 'blue_tick';

export interface TelegramPricingConfig {
  providerId: 'nova' | 'benotp' | 'rakib';
  stars: {
    unitCostPerStar: number; // in NGN, e.g. 30
    fixedInterestAmount: number; // whole integer e.g. 2000
    supportedQuantities: number[]; // e.g. [50, 100, 250, 500, 1000, 2500, 5000, 10000]
    minQuantity: number;
    maxQuantity: number;
  };
  premium: {
    options: {
      '3_months': { label: string; months: number; providerCost: number; interestAmount: number; sellingPrice: number };
      '6_months': { label: string; months: number; providerCost: number; interestAmount: number; sellingPrice: number };
      '12_months': { label: string; months: number; providerCost: number; interestAmount: number; sellingPrice: number };
    };
  };
  blueTick: {
    options: Array<{
      id: string;
      name: string;
      description: string;
      providerCost: number;
      interestAmount: number;
      sellingPrice: number;
    }>;
  };
}

export interface TelegramOrder {
  id: string;
  customerId: string;
  customerName: string;
  serviceType: TelegramServiceType;
  username: string;
  itemDetail: string;
  providerPrice: number;
  interestAmount: number;
  amount: number;
  providerId: 'nova' | 'benotp' | 'rakib';
  providerRef: string;
  status: 'Completed' | 'Processing' | 'Pending Verification' | 'Failed' | 'Refunded';
  deliveryStatus: string;
  refundStatus: string | null;
  createdAt: string;
}

export interface SmmServiceItem {
  id: string;
  name: string;
  category: string;
  platform: string;
  ratePer1000?: number;
  sellingPricePer1k: number;
  minQty: number;
  maxQty: number;
  description?: string;
  serverNum: number;
  serverLabel: string;
}

export interface GiftCardProductItem {
  id: string;
  name: string;
  brand: string;
  countryIso: string;
  currency: string;
  minPrice?: number;
  maxPrice?: number;
  minAmount: number;
  maxAmount: number;
  fixedDenominations?: number[];
  ratePerDollar?: number;
  exchangeRateNgn: number;
  sellingRate?: number;
  logoUrl?: string;
  terms?: string;
}

export interface EsimPackageItem {
  id: string;
  name: string;
  countryIso: string;
  countryName: string;
  data: string;
  duration: string;
  durationDays: number;
  network: string;
  fiveG?: boolean;
  sellingPriceNgn: number;
  priceUsd: number;
  speed: string;
  providerCost?: number;
  serverNumber?: string;
}

export interface ProxyPlanItem {
  id: string;
  name: string;
  proxyType: string;
  gateId: number;
  kind: string;
  duration: string;
  location: string;
  sellingPriceNgn: number;
  priceUsd: number;
  trafficGb?: number;
  bandwidth?: string;
  protocol?: string;
  description?: string;
}

export interface ProxyGateItem {
  id: number;
  name: string;
  fromUsd: number;
  description?: string;
}

export interface ProxyTypeItem {
  id: string;
  name: string;
  kind: string;
  description?: string;
}

// ==========================================
// REFERRAL & AFFILIATE PROGRAM
// ==========================================
export interface ReferralTransaction {
  id: string;
  referrerId: string;
  referrerName: string;
  referredCustomerId: string;
  referredCustomerName: string;
  orderId?: string;
  orderAmount?: number;
  commissionPercent: number;
  commissionEarned: number;
  type: 'commission' | 'withdrawal' | 'wallet_credit';
  status: 'credited' | 'withdrawn' | 'completed';
  createdAt: string;
  notes?: string;
}

export interface ReferralStats {
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  qualifiedReferrals: number;
  totalEarnings: number;
  availableBalance: number;
  commissionPercent: number;
  minWithdrawal: number;
  transactions: ReferralTransaction[];
  referredUsers: {
    id: string;
    name: string;
    joinedAt: string;
    ordersCount: number;
    totalSpent: number;
    qualified: boolean;
  }[];
}

// ==========================================
// WORLDWIDE GIFT DELIVERY
// ==========================================
export interface GiftDeliveryOrder {
  id: string; // e.g. WGD-829104
  reference: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  // Sender details
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  // Recipient details
  recipientName: string;
  recipientPhone: string;
  recipientEmail?: string;
  destinationCountry: string;
  stateProvince: string;
  city: string;
  deliveryAddress: string;
  postalCode?: string;
  // Gift details
  category: string; // Flowers & Bouquets, Birthday Gifts, Cakes & Celebration Packages, Chocolates & Gift Boxes, Perfumes & Personal Gifts, Anniversary & Romantic Gifts, Custom Arrangements
  description: string;
  preferredItem: string;
  occasion: string;
  preferredDeliveryDate: string;
  specialInstructions?: string;
  budgetAmount: number;
  currency: string;
  // Quotation, Fulfillment & Status
  status: 'Pending Review' | 'Quotation Sent' | 'Payment Confirmed' | 'Preparing Gift' | 'Dispatched / In Transit' | 'Delivered' | 'Cancelled';
  quotedPrice?: number;
  adminNotes?: string;
  carrierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDeliveryDate?: string;
  createdAt: string;
  updatedAt: string;
  timeline: {
    title: string;
    description: string;
    timestamp: string;
  }[];
}

// ==========================================
// UNIVERSAL ORDER & SHIPMENT TRACKING
// ==========================================
export interface TrackingShipment {
  id: string;
  trackingNumber: string; // Order reference or courier tracking code
  orderReference?: string;
  category: 'gift_delivery' | 'courier_parcel' | 'international' | 'digital_service';
  carrier: string;
  origin: string;
  destination: string;
  currentStatus: 'Order Placed' | 'In Review' | 'Processing / Preparing' | 'Dispatched / In Transit' | 'Out for Delivery' | 'Delivered' | 'Exception / Delayed';
  estimatedDeliveryDate?: string;
  lastUpdated: string;
  createdAt: string;
  timeline: {
    title: string;
    description: string;
    location?: string;
    timestamp: string;
    completed: boolean;
  }[];
}

// ==========================================
// VIDEO TUTORIALS
// ==========================================
export interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  category: string;
  serviceId?: string;
  videoUrl: string;
  videoType: 'direct' | 'embed' | 'upload';
  thumbnailUrl?: string;
  duration?: string;
  displayOrder: number;
  isPublished: boolean;
  viewsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  targetAudience: 'all' | 'vip' | 'reseller';
  isImportant: boolean;
  displayOrder: number;
  published: boolean;
  startDate: string;
  expiryDate?: string;
  readCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SpecialMarketplaceListing {
  id: string;
  name: string;
  logoUrl?: string;
  rules: string;
  username: string; // SENSITIVE: restricted to admin and authorized buyer
  password: string; // SENSITIVE: restricted to admin and authorized buyer
  loginUrl: string; // SENSITIVE: restricted to admin and authorized buyer
  twoFactorUrl?: string; // SENSITIVE: restricted to admin and authorized buyer
  price: number;
  currency: string;
  availability: 'available' | 'unavailable' | 'out_of_stock';
  additionalInstructions?: string; // SENSITIVE: restricted to admin and authorized buyer
  stock: number;
  published: boolean;
  category?: string;
  totalSales?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PublicSpecialListing {
  id: string;
  name: string;
  logoUrl?: string;
  rules: string;
  price: number;
  currency: string;
  availability: 'available' | 'unavailable' | 'out_of_stock';
  stock: number;
  published: boolean;
  category?: string;
}

export interface SpecialMarketplaceOrder {
  id: string;
  reference: string;
  listingId: string;
  listingName: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  price: number;
  currency: string;
  status: 'Successful' | 'Pending' | 'Failed';
  credentials: {
    username: string;
    password: string;
    loginUrl: string;
    twoFactorUrl?: string;
    additionalInstructions?: string;
  };
  purchasedAt: string;
}

// ==========================================
// REAL-TIME NOTIFICATIONS
// ==========================================
export interface CustomerNotification {
  id: string;
  customerId: string;
  type: 'PAYMENT_APPROVED' | 'PAYMENT_REJECTED' | 'ORDER_COMPLETED' | 'GENERAL';
  title: string;
  message: string;
  amount?: number;
  newBalance?: number;
  reference?: string;
  read: boolean;
  popUpShown: boolean;
  createdAt: string;
}

export interface AdminSession {
  token: string;
  actor: string;
  role: 'super_admin';
  createdAt: number;
  expiresAt: number;
  ip: string;
}



