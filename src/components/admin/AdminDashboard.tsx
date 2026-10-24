import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Globe, 
  Shield, 
  Users, 
  CreditCard, 
  ArrowLeft, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  DollarSign, 
  Plus, 
  Trash2, 
  Power, 
  Edit3, 
  CheckCircle2, 
  TrendingUp, 
  Server, 
  FileText, 
  Megaphone, 
  Key, 
  Settings,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  Radio,
  Lock,
  Search,
  Cpu,
  Layers,
  PhoneCall,
  ShieldAlert,
  Send,
  Building2,
  Sparkles,
  Award,
  MessageCircle,
  Activity,
  History,
  ShieldCheck,
  RotateCcw,
  Zap,
  SlidersHorizontal,
  BarChart3,
  Percent,
  DownloadCloud,
  X,
  Menu,
  Star,
  Crown,
  Film,
  PlayCircle
} from 'lucide-react';
import { AdminVideoTutorialsTab } from './AdminVideoTutorialsTab';
import { AdminPaymentSettingsTab } from './AdminPaymentSettingsTab';
import { AdminAnnouncementsTab } from './AdminAnnouncementsTab';
import { AdminSpecialMarketplaceTab } from './AdminSpecialMarketplaceTab';
import { 
  ServiceItem, 
  CountryItem, 
  UsaServiceItem, 
  LogAccountProduct, 
  SocialBoostPackage,
  GiftCardRate, 
  ProxyPackage,
  Transaction, 
  AdminSettings, 
  UserWallet,
  ProviderConfig,
  CustomerRecord,
  AuditLogItem,
  WebsiteMasterSettings,
  PricingRuleConfig,
  InterestProgramConfig,
  VirtualNumberOffer,
  LogOffer,
  TelegramPricingConfig,
  TelegramOrder
} from '../../types';

interface AdminDashboardProps {
  onBackToCustomer: () => void;
  onLockAdmin?: () => void;
  // Fallback props for existing state
  services: ServiceItem[];
  onToggleService: (serviceId: string) => void;
  onUpdateServiceMessage: (serviceId: string, msg: string) => void;
  onToggleAllServices?: (enable: boolean) => void;
  usaServices: UsaServiceItem[];
  onUpdateUsaPrice: (id: string, newPrice: number) => void;
  onToggleUsaService: (id: string) => void;
  onAddUsaService?: (newService: UsaServiceItem) => void;
  countries: CountryItem[];
  onUpdateCountryPrice: (code: string, newPrice: number) => void;
  onToggleCountry: (code: string) => void;
  onAddCountry?: (newCountry: CountryItem) => void;
  logAccounts: LogAccountProduct[];
  onAddLogAccount: (item: LogAccountProduct) => void;
  onUpdateLogPrice: (id: string, newPrice: number, stock: number) => void;
  onDeleteLogAccount?: (id: string) => void;
  socialBoostPackages?: SocialBoostPackage[];
  onUpdateBoostRate?: (id: string, newRate: number) => void;
  giftCardRates: GiftCardRate[];
  onUpdateGiftCardRate: (id: string, newRate: number) => void;
  onAddGiftCardRate?: (item: GiftCardRate) => void;
  proxyPackages?: ProxyPackage[];
  onUpdateProxyPrice?: (id: string, newPrice: number) => void;
  wallet: UserWallet;
  onCreditUserWallet: (amount: number, reason: string) => void;
  onDebitUserWallet: (amount: number, reason: string) => void;
  onUpdateWalletBankDetails?: (bankName: string, accNum: string, accName: string) => void;
  onResetWallet?: () => void;
  transactions: Transaction[];
  onRefundTransaction: (txId: string) => void;
  onUpdateTransactionStatus?: (txId: string, status: 'Successful' | 'Pending' | 'Failed') => void;
  adminSettings: AdminSettings;
  onUpdateAdminSettings: (newSettings: AdminSettings) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToCustomer,
  onLockAdmin,
  services,
  onToggleService,
  onUpdateServiceMessage,
  onToggleAllServices,
  usaServices,
  onUpdateUsaPrice,
  onToggleUsaService,
  onAddUsaService,
  countries,
  onUpdateCountryPrice,
  onToggleCountry,
  onAddCountry,
  logAccounts,
  onAddLogAccount,
  onUpdateLogPrice,
  onDeleteLogAccount,
  socialBoostPackages = [],
  onUpdateBoostRate,
  giftCardRates,
  onUpdateGiftCardRate,
  onAddGiftCardRate,
  proxyPackages = [],
  onUpdateProxyPrice,
  wallet,
  onCreditUserWallet,
  onDebitUserWallet,
  onUpdateWalletBankDetails,
  onResetWallet,
  transactions,
  onRefundTransaction,
  onUpdateTransactionStatus,
  adminSettings,
  onUpdateAdminSettings,
}) => {
  // Dedicated Admin Sections
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'customers'
    | 'providers'
    | 'marketplace'
    | 'special-marketplace'
    | 'pricing'
    | 'wallet'
    | 'orders'
    | 'announcements'
    | 'interest'
    | 'whatsapp-support'
    | 'whatsapp-channel'
    | 'content'
    | 'video-tutorials'
    | 'audit-logs'
    | 'payments'
    | 'settings'
    | 'security'
    | 'analytics'
  >('overview');

  // Backend state
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [websiteSettings, setWebsiteSettings] = useState<WebsiteMasterSettings | null>(null);
  const [pricingRules, setPricingRules] = useState<PricingRuleConfig | null>(null);
  const [interestProgram, setInterestProgram] = useState<InterestProgramConfig | null>(null);
  const [telegramConfig, setTelegramConfig] = useState<TelegramPricingConfig | null>(null);
  const [numberOffers, setNumberOffers] = useState<VirtualNumberOffer[]>([]);
  const [logOffers, setLogOffers] = useState<LogOffer[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [mobileAdminSidebarOpen, setMobileAdminSidebarOpen] = useState(false);

  // Loading & notification state
  const [loadingBackend, setLoadingBackend] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);
  const [testingProviderId, setTestingProviderId] = useState<string | null>(null);
  const [syncingProviderId, setSyncingProviderId] = useState<string | null>(null);

  // Filters & search
  const [customerSearch, setCustomerSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [auditSearch, setAuditSearch] = useState('');
  const [auditCategory, setAuditCategory] = useState<string>('ALL');

  // Selected customer for modal
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  const [customerTransactions, setCustomerTransactions] = useState<Transaction[]>([]);
  const [loadingCustomerTx, setLoadingCustomerTx] = useState(false);
  const [balanceAdjustAmount, setBalanceAdjustAmount] = useState('5000');
  const [balanceAdjustReason, setBalanceAdjustReason] = useState('Manual Administrative Credit');

  // Security Passcode Change State
  const [currentPasscode, setCurrentPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [adminUsernameVal, setAdminUsernameVal] = useState(websiteSettings?.adminUsername || 'admin');
  const [passcodeLoading, setPasscodeLoading] = useState(false);
  const [passcodeMsg, setPasscodeMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Bank Account State
  const [bankNameVal, setBankNameVal] = useState(wallet.bankName || '');
  const [accountNumVal, setAccountNumVal] = useState(wallet.accountNumber || '');
  const [accountNameVal, setAccountNameVal] = useState(wallet.accountName || '');
  const [savingBank, setSavingBank] = useState(false);

  // Saving Provider State
  const [savingProviderId, setSavingProviderId] = useState<string | null>(null);

  const adminFetch = async (url: string, init?: RequestInit) => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('stevelogs_admin_token') : null;
    const existingHeaders = (init?.headers as Record<string, string>) || {};
    const headers: Record<string, string> = {
      ...existingHeaders,
      ...(token ? { 'Authorization': `Bearer ${token}`, 'x-admin-token': token } : {}),
      'x-admin-actor': 'Super Admin',
    };

    const res = await fetch(url, { ...init, headers });
    if (res.status === 401) {
      sessionStorage.removeItem('stevelogs_admin_token');
      sessionStorage.removeItem('stevelogs_admin_unlocked');
      onLockAdmin?.();
    }
    return res;
  };

  const fetchCustomerTransactions = async (customerId: string) => {
    setLoadingCustomerTx(true);
    try {
      const res = await adminFetch(`/api/customers/${customerId}/transactions`);
      if (res.ok) {
        const txs = await res.json();
        setCustomerTransactions(Array.isArray(txs) ? txs : []);
      }
    } catch (e) {
      console.error('Error fetching customer transactions:', e);
    } finally {
      setLoadingCustomerTx(false);
    }
  };

  const showNotification = (msg: string) => {
    setFeedbackNotice(msg);
    setTimeout(() => setFeedbackNotice(null), 3500);
  };

  // Fetch full backend state on mount
  const fetchBackendData = async () => {
    setLoadingBackend(true);
    try {
      const [
        provRes,
        custRes,
        auditRes,
        settingsRes,
        pricingRes,
        interestRes,
        tgRes,
        numRes,
        logRes,
        analyticsRes,
      ] = await Promise.all([
        adminFetch('/api/providers').then((r) => r.json()).catch(() => []),
        adminFetch('/api/customers').then((r) => r.json()).catch(() => []),
        adminFetch('/api/audit-logs').then((r) => r.json()).catch(() => []),
        adminFetch('/api/settings').then((r) => r.json()).catch(() => null),
        adminFetch('/api/pricing-rules').then((r) => r.json()).catch(() => null),
        adminFetch('/api/interest-program').then((r) => r.json()).catch(() => null),
        adminFetch('/api/telegram/config').then((r) => r.json()).catch(() => null),
        adminFetch('/api/marketplace/numbers').then((r) => r.json()).catch(() => []),
        adminFetch('/api/marketplace/logs').then((r) => r.json()).catch(() => []),
        adminFetch('/api/analytics').then((r) => r.json()).catch(() => null),
      ]);

      if (Array.isArray(provRes)) setProviders(provRes);
      if (Array.isArray(custRes)) setCustomers(custRes);
      if (Array.isArray(auditRes)) setAuditLogs(auditRes);
      if (settingsRes) setWebsiteSettings(settingsRes);
      if (pricingRes) setPricingRules(pricingRes);
      if (interestRes) setInterestProgram(interestRes);
      if (tgRes) setTelegramConfig(tgRes);
      if (Array.isArray(numRes)) setNumberOffers(numRes);
      if (Array.isArray(logRes)) setLogOffers(logRes);
      if (analyticsRes) setAnalyticsData(analyticsRes);
    } catch (e) {
      console.error('Error fetching admin data:', e);
    } finally {
      setLoadingBackend(false);
    }
  };

  useEffect(() => {
    fetchBackendData();
  }, []);

  // Provider Connection Test
  const handleTestConnection = async (providerId: string) => {
    setTestingProviderId(providerId);
    try {
      const res = await adminFetch(`/api/providers/${providerId}/test-connection`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Success: ${data.message}`);
      } else {
        showNotification(`Notice: ${data.message}`);
      }
      fetchBackendData();
    } catch (e: any) {
      showNotification(`Test failed: ${e.message}`);
    } finally {
      setTestingProviderId(null);
    }
  };

  // Provider Catalog Sync
  const handleSyncProvider = async (providerId: string) => {
    setSyncingProviderId(providerId);
    try {
      const res = await adminFetch(`/api/providers/${providerId}/sync`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message);
      } else {
        showNotification(`Sync error: ${data.message}`);
      }
      fetchBackendData();
    } catch (e: any) {
      showNotification(`Sync failed: ${e.message}`);
    } finally {
      setSyncingProviderId(null);
    }
  };

  // Provider config update
  const handleUpdateProvider = async (providerId: string, updates: Partial<ProviderConfig>) => {
    try {
      const res = await adminFetch(`/api/providers/${providerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        showNotification('Provider configuration saved securely!');
        fetchBackendData();
      }
    } catch (e: any) {
      showNotification(`Failed to save provider: ${e.message}`);
    } finally {
      setSavingProviderId(null);
    }
  };

  // Save Dedicated Bank Account Details
  const handleSaveBankDetails = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingBank(true);
    try {
      if (onUpdateWalletBankDetails) {
        onUpdateWalletBankDetails(bankNameVal, accountNumVal, accountNameVal);
      }
      const res = await adminFetch('/api/wallet', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankName: bankNameVal,
          accountNumber: accountNumVal,
          accountName: accountNameVal,
        }),
      });
      if (res.ok) {
        showNotification('Dedicated bank account details saved to database!');
        fetchBackendData();
      } else {
        const d = await res.json().catch(() => ({}));
        showNotification(d.error || 'Failed to update bank details.');
      }
    } catch (e: any) {
      showNotification(`Bank save error: ${e.message}`);
    } finally {
      setSavingBank(false);
    }
  };

  // Change Admin Passcode Handler
  const handleChangePasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeMsg(null);

    if (!currentPasscode.trim()) {
      setPasscodeMsg({ text: 'Please enter your current administrative passcode.', isError: true });
      return;
    }
    if (!newPasscode.trim() || newPasscode.trim().length < 4) {
      setPasscodeMsg({ text: 'New passcode must be at least 4 digits or characters.', isError: true });
      return;
    }
    if (newPasscode.trim() !== confirmPasscode.trim()) {
      setPasscodeMsg({ text: 'New passcode and confirmation do not match. Please verify.', isError: true });
      return;
    }

    setPasscodeLoading(true);
    try {
      const res = await adminFetch('/api/admin/change-passcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPasscode: currentPasscode.trim(),
          newPasscode: newPasscode.trim(),
          newUsername: adminUsernameVal.trim() || 'admin',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to change administrative passcode.');
      }

      setPasscodeMsg({ text: data.message || 'Administrative passcode updated successfully! Active immediately.', isError: false });
      setCurrentPasscode('');
      setNewPasscode('');
      setConfirmPasscode('');
      showNotification('Administrative passcode updated and saved to database!');
      fetchBackendData();
    } catch (err: any) {
      setPasscodeMsg({ text: err.message || 'Passcode change failed. Please verify current passcode.', isError: true });
    } finally {
      setPasscodeLoading(false);
    }
  };

  // Save Settings
  const handleSaveSettings = async (updates: Partial<WebsiteMasterSettings>) => {
    if (!websiteSettings) return;
    try {
      const res = await adminFetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        setWebsiteSettings(updated);
        showNotification('Website settings saved to persistent database!');
      }
    } catch (e: any) {
      showNotification(`Failed to save settings: ${e.message}`);
    }
  };

  // Save Pricing Rules
  const handleSavePricing = async (updates: Partial<PricingRuleConfig>) => {
    if (!pricingRules) return;
    try {
      const res = await adminFetch('/api/pricing-rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        setPricingRules(updated);
        showNotification('Pricing markups & profit rules updated successfully!');
      }
    } catch (e: any) {
      showNotification(`Failed to save pricing: ${e.message}`);
    }
  };

  // Save Telegram Services Pricing
  const handleSaveTelegramPricing = async (updates: Partial<TelegramPricingConfig>) => {
    if (!telegramConfig) return;
    try {
      const res = await adminFetch('/api/telegram/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        setTelegramConfig(updated);
        showNotification('Telegram Stars, Premium & Blue Tick pricing updated!');
      }
    } catch (e: any) {
      showNotification(`Failed to save Telegram pricing: ${e.message}`);
    }
  };

  // Save Interest Program
  const handleSaveInterest = async (updates: Partial<InterestProgramConfig>) => {
    if (!interestProgram) return;
    try {
      const res = await adminFetch('/api/interest-program', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        setInterestProgram(updated);
        showNotification('Interest & Rewards settings updated!');
      }
    } catch (e: any) {
      showNotification(`Failed to save interest settings: ${e.message}`);
    }
  };

  // Customer balance adjustment
  const handleAdjustCustomerBalance = async (customerId: string, type: 'credit' | 'debit') => {
    const amt = Number(balanceAdjustAmount);
    if (!amt || amt <= 0) {
      showNotification('Please enter a valid positive adjustment amount.');
      return;
    }

    if (!balanceAdjustReason || balanceAdjustReason.trim() === '') {
      showNotification('An audit reason is required for every balance adjustment.');
      return;
    }

    if (type === 'debit' && selectedCustomer && amt > selectedCustomer.walletBalance) {
      showNotification(
        `Insufficient customer funds: Customer balance is ₦${selectedCustomer.walletBalance.toLocaleString()}, cannot remove ₦${amt.toLocaleString()}.`
      );
      return;
    }

    try {
      const res = await adminFetch(`/api/customers/${customerId}/adjust-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amt,
          type,
          reason: balanceAdjustReason.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedCustomer(data);
        showNotification(`Successfully ${type}ed ₦${amt.toLocaleString()} for ${data.name}! Ledger entry recorded.`);
        fetchCustomerTransactions(customerId);
        fetchBackendData();
      } else {
        showNotification(`Adjustment error: ${data.error || 'Server rejected request'}`);
      }
    } catch (e: any) {
      showNotification(`Failed to adjust balance: ${e.message}`);
    }
  };

  // Customer status update
  const handleUpdateCustomerStatus = async (customerId: string, status: CustomerRecord['status']) => {
    try {
      const res = await adminFetch(`/api/customers/${customerId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updatedCust = await res.json();
        setSelectedCustomer(updatedCust);
        showNotification(`Customer status changed to ${status}!`);
        fetchBackendData();
      }
    } catch (e: any) {
      showNotification(`Failed to change status: ${e.message}`);
    }
  };

  // Refund order
  const handleRefundOrder = async (orderId: string) => {
    try {
      const res = await adminFetch(`/api/orders/${orderId}/refund`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message);
        fetchBackendData();
      } else {
        showNotification(`Refund error: ${data.error}`);
      }
    } catch (e: any) {
      showNotification(`Refund failed: ${e.message}`);
    }
  };

  // Sidebar Items definition
  const navItems = [
    { id: 'overview', label: '1. Overview Dashboard', icon: BarChart3 },
    { id: 'customers', label: '2. Customer Management', icon: Users },
    { id: 'special-marketplace', label: '3. Special Marketplace 2 (Direct Logs)', icon: Sparkles },
    { id: 'announcements', label: '4. Announcements Management', icon: Megaphone },
    { id: 'providers', label: '5. API Providers (Nova, BenOTP, Rakib)', icon: Server },
    { id: 'marketplace', label: '6. Unified Product Marketplace', icon: Globe },
    { id: 'pricing', label: '7. Price & Profit Management', icon: Percent },
    { id: 'wallet', label: '8. Wallet & Ledger', icon: CreditCard },
    { id: 'orders', label: '9. Order Management', icon: FileText },
    { id: 'interest', label: '10. Interest & Earnings', icon: Award },
    { id: 'whatsapp-support', label: '11. WhatsApp Support Settings', icon: MessageCircle },
    { id: 'whatsapp-channel', label: '12. WhatsApp Channel Settings', icon: Send },
    { id: 'content', label: '13. Content & General Notice', icon: Megaphone },
    { id: 'video-tutorials', label: '14. Video Tutorials Management', icon: Film },
    { id: 'audit-logs', label: '15. Activity & Audit Logs', icon: History },
    { id: 'payments', label: '16. Payment & Refund Policy', icon: Building2 },
    { id: 'settings', label: '17. Website Master Settings', icon: Settings },
    { id: 'security', label: '18. Security & Passcode (200911)', icon: Lock },
    { id: 'analytics', label: '19. Reports & Analytics', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-blue-600/30 selection:text-white">
      {/* Top Admin Executive Bar */}
      <header className="sticky top-0 z-40 bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Admin Menu Drawer Toggle */}
          <button
            onClick={() => setMobileAdminSidebarOpen(true)}
            className="md:hidden p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
            aria-label="Open Admin Menu"
            title="Admin Menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          <button
            onClick={onBackToCustomer}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer border border-slate-700"
            title="Switch to Customer Dashboard"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Customer View</span>
          </button>

          <div className="h-5 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-mono text-xs font-black tracking-wider text-amber-400 uppercase truncate">
              STEVELOGS // MASTER CONTROL
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 font-mono text-[10px] font-bold">
              SESSION AUTHENTICATED
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchBackendData}
            disabled={loadingBackend}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 border border-slate-700 cursor-pointer disabled:opacity-50"
            title="Refresh All Database Records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingBackend ? 'animate-spin text-blue-400' : ''}`} />
            <span className="hidden md:inline">Sync DB</span>
          </button>

          {onLockAdmin && (
            <button
              onClick={async () => {
                try {
                  const token = sessionStorage.getItem('stevelogs_admin_token');
                  if (token) {
                    await fetch('/api/admin/logout', {
                      method: 'POST',
                      headers: { Authorization: `Bearer ${token}`, 'x-admin-token': token },
                    });
                  }
                } catch (e) {}
                sessionStorage.removeItem('stevelogs_admin_token');
                sessionStorage.removeItem('stevelogs_admin_unlocked');
                onLockAdmin();
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-bold transition-all border border-rose-500/30 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lock & Sign Out</span>
            </button>
          )}
        </div>
      </header>

      {/* Floating Notification */}
      {feedbackNotice && (
        <div className="fixed top-16 right-6 z-50 p-4 rounded-2xl bg-slate-900 border border-amber-500/40 text-amber-300 text-xs shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-top-4">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-medium">{feedbackNotice}</span>
        </div>
      )}

      {/* Mobile Dark Overlay Backdrop for Admin Drawer */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs transition-opacity duration-300 ${
          mobileAdminSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileAdminSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Main Admin Workspace with Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 relative">
        {/* Left Sidebar Navigation (Desktop Fixed, Mobile Slide-in Drawer) */}
        <aside
          className={`fixed md:static top-0 bottom-0 left-0 z-50 md:z-auto w-72 md:w-64 bg-[#0a0f1d] border-r border-slate-800/80 p-3 flex flex-col gap-1 overflow-y-auto shrink-0 shadow-2xl md:shadow-none transition-transform duration-300 ease-in-out ${
            mobileAdminSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 md:border-b-0 mb-1">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              Management Console (16 Modules)
            </span>
            <button
              onClick={() => setMobileAdminSidebarOpen(false)}
              className="md:hidden p-1 rounded-lg text-slate-400 hover:text-white"
              aria-label="Close Admin Sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setMobileAdminSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md font-bold'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Right Main Panel Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-6xl mx-auto w-full space-y-6">

          {/* 1. OVERVIEW DASHBOARD */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white">Executive Operations Overview</h2>
                  <p className="text-xs text-slate-400">
                    Real-time database metrics, provider connection health, and confirmed transaction margins.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
                  ● Verified Data
                </span>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Products Sold
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-white font-mono">
                    {analyticsData?.productsSold ?? 0}
                  </div>
                  <span className="text-[10px] text-slate-400 block">Verified units sold to customers</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Completed Orders
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                    {analyticsData?.completedOrders ?? 0}
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    {analyticsData?.successfulOrders || 0} Successful • {analyticsData?.refundedOrders || 0} Refunded
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Sales Revenue
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">
                    ₦{(analyticsData?.salesRevenue ?? 0).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-blue-400 block">From completed customer orders</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Realized Profit
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                    ₦{(analyticsData?.realizedProfit ?? 0).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-emerald-400 block">Sales Revenue minus Provider Costs</span>
                </div>
              </div>

              {/* Provider Health Summary Cards */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                  Provider Upstream Connection Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {providers.map((p) => {
                    const isBenOtp = p.id === 'benotp';
                    const isNova = p.id === 'nova';
                    return (
                      <div
                        key={p.id}
                        className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-3 flex flex-col justify-between"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-sm font-bold text-white">{p.name}</h4>
                              {isBenOtp && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[9px] font-mono font-bold">
                                  PRIORITY #1
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                              {p.baseUrl}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              p.status === 'active'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {p.status}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-mono">Provider Balance</span>
                            {p.balance > 0 ? (
                              <span className="font-mono font-bold text-white">₦{p.balance.toLocaleString()}</span>
                            ) : (
                              <span className="font-mono text-[11px] text-slate-400 italic">Balance unavailable from provider API</span>
                            )}
                          </div>
                          <button
                            onClick={() => handleTestConnection(p.id)}
                            disabled={testingProviderId === p.id}
                            className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
                          >
                            {testingProviderId === p.id ? 'Testing...' : 'Test Ping'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Audit Activities Stream */}
              <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-400" />
                    Live Activity & Audit Feed
                  </h3>
                  <button
                    onClick={() => setActiveTab('audit-logs')}
                    className="text-xs font-semibold text-blue-400 hover:underline cursor-pointer"
                  >
                    View All Logs ({auditLogs.length}) →
                  </button>
                </div>
                <div className="divide-y divide-slate-800/60 max-h-60 overflow-y-auto">
                  {auditLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{log.action}</span>
                          <span className="text-[10px] text-slate-400 font-mono">by {log.actor}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{log.details}</p>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. CUSTOMER MANAGEMENT */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-white">Customer Account Management</h2>
                  <p className="text-xs text-slate-400">
                    Search customer records, adjust balances with audit trails, and manage account authorization status.
                  </p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search name, email, or ID..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Customers Table */}
              <div className="bg-[#0f172a] rounded-2xl border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/80 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                      <tr>
                        <th className="p-3.5">Customer</th>
                        <th className="p-3.5">Wallet Balance</th>
                        <th className="p-3.5">Total Orders</th>
                        <th className="p-3.5">Tier</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {customers
                        .filter((c) =>
                          c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                          c.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
                          c.id.toLowerCase().includes(customerSearch.toLowerCase())
                        )
                        .map((c) => (
                          <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="p-3.5">
                              <span className="font-bold text-white block">{c.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{c.email} • {c.id}</span>
                            </td>
                            <td className="p-3.5 font-mono font-bold text-emerald-400">
                              ₦{c.walletBalance.toLocaleString()}
                            </td>
                            <td className="p-3.5 font-mono">
                              {c.ordersCount} ({c.successfulOrders} OK / {c.failedOrders} Fail)
                            </td>
                            <td className="p-3.5">
                              <span className="px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-700 text-[10px] font-bold">
                                {c.tier}
                              </span>
                            </td>
                            <td className="p-3.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  c.status === 'Active'
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : 'bg-rose-500/20 text-rose-300'
                                }`}
                              >
                                {c.status}
                              </span>
                            </td>
                            <td className="p-3.5 text-right">
                              <button
                                onClick={() => {
                                  setSelectedCustomer(c);
                                  fetchCustomerTransactions(c.id);
                                }}
                                className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
                              >
                                Manage
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Selected Customer Modal Drawer */}
              {selectedCustomer && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex justify-center p-4">
                  <div className="w-full max-w-xl bg-[#0f172a] rounded-3xl border border-slate-700 p-6 space-y-5 my-auto text-white shadow-2xl max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h3 className="text-base font-bold text-white">{selectedCustomer.name}</h3>
                        <p className="text-xs text-slate-400 font-mono">ID: {selectedCustomer.id} • {selectedCustomer.email}</p>
                      </div>
                      <button
                        onClick={() => setSelectedCustomer(null)}
                        className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block">Current Balance</span>
                        <span className="text-lg font-bold text-emerald-400 font-mono mt-0.5 block">
                          ₦{selectedCustomer.walletBalance.toLocaleString()}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block">Account Status</span>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() => handleUpdateCustomerStatus(selectedCustomer.id, 'Active')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              selectedCustomer.status === 'Active' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            Active
                          </button>
                          <button
                            onClick={() => handleUpdateCustomerStatus(selectedCustomer.id, 'Suspended')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              selectedCustomer.status === 'Suspended' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            Suspend
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Balance Adjuster Form (Controlled Management) */}
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                          Controlled Balance Adjustment
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400">
                          Authorized Admin: SuperAdmin
                        </span>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Adjustment Amount (₦)</label>
                        <input
                          type="number"
                          min="1"
                          value={balanceAdjustAmount}
                          onChange={(e) => setBalanceAdjustAmount(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Audit Reason (Required)</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Deposit reconciliation, manual refund, bonus"
                          value={balanceAdjustReason}
                          onChange={(e) => setBalanceAdjustReason(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                        />
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => handleAdjustCustomerBalance(selectedCustomer.id, 'credit')}
                          className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                        >
                          + Add Funds (Credit)
                        </button>
                        <button
                          onClick={() => handleAdjustCustomerBalance(selectedCustomer.id, 'debit')}
                          disabled={Number(balanceAdjustAmount) > selectedCustomer.walletBalance}
                          className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-bold text-xs cursor-pointer"
                        >
                          - Remove Funds (Debit)
                        </button>
                      </div>
                      {Number(balanceAdjustAmount) > selectedCustomer.walletBalance && (
                        <p className="text-[10px] text-rose-400 italic">
                          Debit disabled: requested amount exceeds current customer balance (₦{selectedCustomer.walletBalance.toLocaleString()}).
                        </p>
                      )}
                    </div>

                    {/* Customer Transaction Ledger History */}
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <History className="w-3.5 h-3.5 text-blue-400" />
                          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                            Customer Transaction Ledger ({customerTransactions.length})
                          </h4>
                        </div>
                        <button
                          onClick={() => fetchCustomerTransactions(selectedCustomer.id)}
                          className="text-[10px] text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" /> Refresh
                        </button>
                      </div>

                      {loadingCustomerTx ? (
                        <div className="py-4 text-center text-xs text-slate-500">Loading customer ledger...</div>
                      ) : customerTransactions.length === 0 ? (
                        <div className="py-3 text-center text-xs text-slate-500 italic">
                          No transactions found for this customer.
                        </div>
                      ) : (
                        <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                          {customerTransactions.map((tx) => (
                            <div
                              key={tx.id}
                              className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
                            >
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
                                      tx.type === 'credit'
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                    }`}
                                  >
                                    {tx.type}
                                  </span>
                                  <span className="font-bold text-white text-xs">{tx.service}</span>
                                </div>
                                <p className="text-[11px] text-slate-400">{tx.description}</p>
                                <span className="text-[9px] text-slate-500 font-mono block">
                                  Ref: {tx.reference} • {tx.date}
                                </span>
                              </div>
                              <div className="text-right">
                                <span
                                  className={`font-mono font-bold text-xs block ${
                                    tx.type === 'credit' ? 'text-emerald-400' : 'text-rose-400'
                                  }`}
                                >
                                  {tx.type === 'credit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                                </span>
                                <span className="text-[9px] text-slate-400 font-mono">{tx.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. PROVIDER & API MANAGEMENT */}
          {activeTab === 'providers' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white">Three-Provider API Management</h2>
                <p className="text-xs text-slate-400">
                  Configure upstream API credentials, test connections safely with real pings, and synchronize product catalogs.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {providers.map((p) => {
                  const isBenOtp = p.id === 'benotp';
                  const isNova = p.id === 'nova';
                  const isRakib = p.id === 'rakib';

                  return (
                    <div
                      key={p.id}
                      className="p-5 sm:p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base ${
                            isBenOtp ? 'bg-amber-500 text-slate-950' : isNova ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'
                          }`}>
                            {p.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-bold text-white">{p.name}</h3>
                              {isBenOtp && (
                                <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-mono font-bold">
                                  Default Auto-Select Priority #1
                                </span>
                              )}
                            </div>
                            <a
                              href={p.website}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-blue-400 hover:underline"
                            >
                              {p.website}
                            </a>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateProvider(p.id, { enabled: !p.enabled })}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                              p.enabled ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {p.enabled ? 'Enabled' : 'Disabled'}
                          </button>
                        </div>
                      </div>

                      {/* Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                            API Base URL
                          </label>
                          <input
                            type="text"
                            defaultValue={p.baseUrl}
                            id={`base-url-${p.id}`}
                            onBlur={(e) => handleUpdateProvider(p.id, { baseUrl: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                            Live API Key / Secret Token
                          </label>
                          <div className="relative">
                            <input
                              type="password"
                              placeholder="Paste provider API Key or Token"
                              defaultValue={p.apiKey}
                              id={`api-key-${p.id}`}
                              className="w-full px-3 py-2 pr-16 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const input = document.getElementById(`api-key-${p.id}`) as HTMLInputElement;
                                if (input) {
                                  handleUpdateProvider(p.id, { apiKey: input.value });
                                }
                              }}
                              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold cursor-pointer"
                            >
                              Save Key
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                            Automatic Selection Priority (1 = Top)
                          </label>
                          <input
                            type="number"
                            defaultValue={p.priority}
                            id={`priority-${p.id}`}
                            onBlur={(e) => handleUpdateProvider(p.id, { priority: Number(e.target.value) })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                            Supported Services
                          </label>
                          <span className="text-slate-300 font-mono block mt-2 text-xs">
                            {p.supportedServices.join(', ')}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons & status report */}
                      <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="text-xs text-slate-400 space-y-0.5">
                          <div>
                            Status: <strong className="text-white uppercase">{p.status}</strong> • Balance: {p.balance > 0 ? (
                              <strong className="text-emerald-400 font-mono">₦{p.balance.toLocaleString()}</strong>
                            ) : (
                              <span className="text-slate-400 italic font-mono text-[11px]">Balance unavailable from provider API</span>
                            )}
                          </div>
                          {p.lastSync && (
                            <div className="text-[10px] text-slate-500 font-mono">
                              Last Catalog Sync: {new Date(p.lastSync).toLocaleString()}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => {
                              const keyInput = document.getElementById(`api-key-${p.id}`) as HTMLInputElement;
                              const urlInput = document.getElementById(`base-url-${p.id}`) as HTMLInputElement;
                              const priorityInput = document.getElementById(`priority-${p.id}`) as HTMLInputElement;
                              setSavingProviderId(p.id);
                              handleUpdateProvider(p.id, {
                                baseUrl: urlInput?.value || p.baseUrl,
                                apiKey: keyInput?.value !== undefined ? keyInput.value : p.apiKey,
                                priority: priorityInput?.value ? Number(priorityInput.value) : p.priority,
                              });
                            }}
                            disabled={savingProviderId === p.id}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{savingProviderId === p.id ? 'Saving...' : 'Save Provider Settings'}</span>
                          </button>
                          <button
                            onClick={() => handleTestConnection(p.id)}
                            disabled={testingProviderId === p.id}
                            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 cursor-pointer disabled:opacity-50"
                          >
                            {testingProviderId === p.id ? 'Pinging...' : 'Test Connection'}
                          </button>
                          <button
                            onClick={() => handleSyncProvider(p.id)}
                            disabled={syncingProviderId === p.id}
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <DownloadCloud className="w-3.5 h-3.5" />
                            <span>{syncingProviderId === p.id ? 'Syncing...' : 'Sync Catalog'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Provider Synchronization Report (Requirement 5) */}
                      {p.syncReport && (
                        <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-blue-500/30 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5 uppercase tracking-wider">
                              <ShieldCheck className="w-4 h-4 text-emerald-400" />
                              Provider Synchronization Report
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Status: {p.status.toUpperCase()}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
                              <span className="text-[10px] text-slate-400 block">
                                {p.id === 'rakib' ? 'Categories Retrieved' : 'Total Countries'}
                              </span>
                              <span className="text-sm font-black text-white font-mono">
                                {p.id === 'rakib' 
                                  ? `${p.syncReport.totalCategories ?? p.syncReport.totalServices} Categories` 
                                  : `${p.syncReport.totalCountries} Countries`}
                              </span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
                              <span className="text-[10px] text-slate-400 block">Products Retrieved</span>
                              <span className="text-sm font-black text-white font-mono">
                                {p.syncReport.totalProductsRetrieved ?? p.syncReport.totalProductsSaved} Products
                              </span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
                              <span className="text-[10px] text-slate-400 block">Products Saved</span>
                              <span className="text-sm font-black text-emerald-400 font-mono">
                                {p.syncReport.totalProductsSaved} Saved
                              </span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
                              <span className="text-[10px] text-slate-400 block">Pagination Status</span>
                              <span className="text-sm font-black text-white font-mono">
                                {p.syncReport.paginationStatus || `${p.syncReport.pagesProcessed} Page(s)`}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                            <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-800/40 border border-slate-800 text-slate-400">
                              <span>In Stock:</span>
                              <span className="font-mono font-bold text-emerald-400">
                                {p.syncReport.inStockCount !== undefined ? p.syncReport.inStockCount : 'Available'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-800/40 border border-slate-800 text-slate-400">
                              <span>Out of Stock:</span>
                              <span className="font-mono font-bold text-amber-400">
                                {p.syncReport.outOfStockCount !== undefined ? p.syncReport.outOfStockCount : 0}
                              </span>
                            </div>
                            <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-800/40 border border-slate-800 text-slate-400">
                              <span>Failed Requests:</span>
                              <span className="font-mono font-bold text-rose-400">{p.syncReport.failedRequests}</span>
                            </div>
                            <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-800/40 border border-slate-800 text-slate-400">
                              <span>Pages Done:</span>
                              <span className="font-mono font-bold text-slate-200">{p.syncReport.pagesProcessed}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-800/40 border border-slate-800 text-slate-400 text-[11px]">
                            <span>Last Synchronization Time:</span>
                            <span className="font-mono text-slate-300 text-[10px]">
                              {p.syncReport.lastSuccessfulSync ? new Date(p.syncReport.lastSuccessfulSync).toLocaleString() : 'Pending'}
                            </span>
                          </div>

                          {p.syncReport.lastSyncError && (
                            <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                              <span>Last Synchronization Error: {p.syncReport.lastSyncError}</span>
                            </div>
                          )}

                          {p.syncReport.statusMessage && (
                            <p className="text-[11px] text-slate-400 italic bg-slate-950/40 p-2 rounded-lg border border-slate-800/50">
                              {p.syncReport.statusMessage}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. UNIFIED PRODUCT MARKETPLACE MANAGEMENT */}
          {activeTab === 'marketplace' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white">Unified Product Marketplace</h2>
                  <p className="text-xs text-slate-400">
                    Live synchronized catalogs from Nova Solution and BenOTP. All offers are displayed side-by-side with genuine pricing.
                  </p>
                </div>
                <button
                  onClick={() => {
                    handleSyncProvider('benotp');
                    handleSyncProvider('nova');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                >
                  Resync Catalogs
                </button>
              </div>

              {/* Number Offers Table */}
              <div className="bg-[#0f172a] rounded-2xl border border-slate-800 overflow-hidden">
                <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 font-bold text-xs text-white flex items-center justify-between">
                  <span>Virtual Number Offers ({numberOffers.length})</span>
                  <span className="text-[10px] text-slate-400 font-normal">Nova Solution & BenOTP Combined</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/60 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                      <tr>
                        <th className="p-3">Country / Flag</th>
                        <th className="p-3">Service</th>
                        <th className="p-3">Provider</th>
                        <th className="p-3">Provider Cost</th>
                        <th className="p-3">Customer Selling Price</th>
                        <th className="p-3">Stock / Availability</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {numberOffers.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-800/40">
                          <td className="p-3">
                            <span className="text-lg mr-2">{o.countryFlag}</span>
                            <span className="font-bold text-white">{o.countryName}</span>
                            <span className="text-[10px] font-mono text-slate-400 ml-1">({o.dialCode})</span>
                          </td>
                          <td className="p-3 font-semibold text-white">{o.serviceName}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              o.providerId === 'benotp' ? 'bg-amber-400/20 text-amber-300' : 'bg-blue-400/20 text-blue-300'
                            }`}>
                              {o.providerName}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-slate-400">₦{o.providerCost.toLocaleString()}</td>
                          <td className="p-3 font-mono font-bold text-emerald-400">
                            ₦{o.sellingPrice.toLocaleString()}
                          </td>
                          <td className="p-3">
                            <span className="text-emerald-400 font-mono text-[11px] font-bold">
                              ● {o.stockCount || 100} Available
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Log Offers Table */}
              <div className="bg-[#0f172a] rounded-2xl border border-slate-800 overflow-hidden">
                <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 font-bold text-xs text-white flex items-center justify-between">
                  <span>Verified Log Accounts ({logOffers.length})</span>
                  <span className="text-[10px] text-slate-400 font-normal">Nova Solution & Rakib Socials</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/60 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                      <tr>
                        <th className="p-3">Category</th>
                        <th className="p-3">Product Name</th>
                        <th className="p-3">Provider</th>
                        <th className="p-3">Cost</th>
                        <th className="p-3">Selling Price</th>
                        <th className="p-3">Format</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {logOffers.map((l) => (
                        <tr key={l.id} className="hover:bg-slate-800/40">
                          <td className="p-3 font-bold text-white">{l.category}</td>
                          <td className="p-3 text-slate-200">{l.productName}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-purple-900/40 text-purple-300 text-[10px] font-bold">
                              {l.providerName}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-slate-400">₦{l.providerCost.toLocaleString()}</td>
                          <td className="p-3 font-mono font-bold text-emerald-400">₦{l.sellingPrice.toLocaleString()}</td>
                          <td className="p-3 font-mono text-[11px] text-slate-400">{l.format}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 5. PRICE AND PROFIT MANAGEMENT */}
          {pricingRules && activeTab === 'pricing' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white">Price, Markup & Profit Engine</h2>
                <p className="text-xs text-slate-400">
                  Configure global fixed monetary interest amounts (₦1,000, ₦2,000, ₦5,000) and Telegram service pricing.
                </p>
              </div>

              {/* Fixed Interest Amount Formula Card */}
              <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-800/60 flex items-center justify-between text-xs text-blue-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600/30 text-blue-300 flex items-center justify-center font-bold">
                    ₦
                  </div>
                  <div>
                    <span className="font-bold text-white block">Marketplace Pricing Formula</span>
                    <span>Final Selling Price = Provider Cost + Admin Fixed Interest Amount</span>
                  </div>
                </div>
                <span className="font-mono text-emerald-400 font-bold bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700">
                  e.g. ₦3,000 (Cost) + ₦2,000 (Interest) = ₦5,000
                </span>
              </div>

              <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-5">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Global Fixed Interest Settings (Whole-Number Integer Input)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                      Fixed Monetary Markup / Interest (₦)
                    </label>
                    <input
                      type="number"
                      step={100}
                      defaultValue={pricingRules.fixedMarkupAmount || 2000}
                      onBlur={(e) => handleSavePricing({ fixedMarkupAmount: Math.round(Number(e.target.value)) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:ring-1 focus:ring-blue-500"
                    />
                    <div className="flex items-center gap-1.5 mt-2 overflow-x-auto">
                      {[1000, 2000, 3000, 5000, 10000].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handleSavePricing({ fixedMarkupAmount: preset })}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-colors ${
                            pricingRules.fixedMarkupAmount === preset
                              ? 'bg-blue-600 text-white font-bold'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          }`}
                        >
                          ₦{preset.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                      Fallback Percentage Markup (%)
                    </label>
                    <input
                      type="number"
                      defaultValue={pricingRules.globalMarkupPercent}
                      onBlur={(e) => handleSavePricing({ globalMarkupPercent: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                      Price Rounding Rule
                    </label>
                    <select
                      defaultValue={pricingRules.roundingRule}
                      onChange={(e) => handleSavePricing({ roundingRule: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                    >
                      <option value="none">Exact Math (No rounding)</option>
                      <option value="round_50">Round to nearest ₦50</option>
                      <option value="round_100">Round to nearest ₦100</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                    Provider-Specific Markup Overrides
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="text-[10px] font-mono text-amber-400 block mb-1">BenOTP Markup (%)</label>
                      <input
                        type="number"
                        defaultValue={pricingRules.providerMarkups?.benotp || 12}
                        onBlur={(e) =>
                          handleSavePricing({
                            providerMarkups: { ...pricingRules.providerMarkups, benotp: Number(e.target.value) },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-blue-400 block mb-1">Nova Solution Markup (%)</label>
                      <input
                        type="number"
                        defaultValue={pricingRules.providerMarkups?.nova || 15}
                        onBlur={(e) =>
                          handleSavePricing({
                            providerMarkups: { ...pricingRules.providerMarkups, nova: Number(e.target.value) },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-purple-400 block mb-1">Rakib Socials Markup (%)</label>
                      <input
                        type="number"
                        defaultValue={pricingRules.providerMarkups?.rakib || 20}
                        onBlur={(e) =>
                          handleSavePricing({
                            providerMarkups: { ...pricingRules.providerMarkups, rakib: Number(e.target.value) },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      if (pricingRules) handleSavePricing(pricingRules);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Markup & Profit Rules</span>
                  </button>
                </div>
              </div>

              {/* TELEGRAM STARS, PREMIUM & BLUE TICK PRICING ENGINE */}
              {telegramConfig && (
                <div className="p-6 rounded-2xl bg-[#0f172a] border border-blue-900/50 space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <Send className="w-4 h-4 text-blue-400" />
                        <h3 className="text-sm font-bold text-white">Telegram Services Pricing & Provider Routing</h3>
                      </div>
                      <p className="text-xs text-slate-400">
                        Configure provider costs and fixed interest markups for Stars, Premium, and Blue Tick
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 uppercase font-mono">Assigned Provider:</span>
                      <select
                        defaultValue={telegramConfig.providerId}
                        onChange={(e) => handleSaveTelegramPricing({ providerId: e.target.value as any })}
                        className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs font-bold"
                      >
                        <option value="nova">Nova Solution (Verified)</option>
                        <option value="benotp">BenOTP</option>
                        <option value="rakib">Rakib Socials</option>
                      </select>
                    </div>
                  </div>

                  {/* 1. Telegram Stars Settings */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>Telegram Stars Pricing Rule</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Provider Unit Cost per Star (₦)</label>
                        <input
                          type="number"
                          defaultValue={telegramConfig.stars?.unitCostPerStar || 28}
                          onBlur={(e) =>
                            handleSaveTelegramPricing({
                              stars: { ...telegramConfig.stars, unitCostPerStar: Number(e.target.value) },
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Admin Fixed Interest Markup (₦)</label>
                        <input
                          type="number"
                          step={500}
                          defaultValue={telegramConfig.stars?.fixedInterestAmount || 2000}
                          onBlur={(e) =>
                            handleSaveTelegramPricing({
                              stars: { ...telegramConfig.stars, fixedInterestAmount: Math.round(Number(e.target.value)) },
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Live Example (1,000 Stars)</label>
                        <div className="font-mono text-xs text-slate-300 pt-2">
                          ₦{(1000 * (telegramConfig.stars?.unitCostPerStar || 28)).toLocaleString()} + ₦{(telegramConfig.stars?.fixedInterestAmount || 2000).toLocaleString()} = <strong className="text-emerald-400 font-bold">₦{((1000 * (telegramConfig.stars?.unitCostPerStar || 28)) + (telegramConfig.stars?.fixedInterestAmount || 2000)).toLocaleString()}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Telegram Premium Pricing */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5 fill-purple-400" />
                      <span>Telegram Premium Pricing (Duration Packages)</span>
                    </h4>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs bg-slate-950 rounded-xl border border-slate-800">
                        <thead className="bg-slate-900/80 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                          <tr>
                            <th className="p-3">Duration</th>
                            <th className="p-3">Provider Cost (₦)</th>
                            <th className="p-3">Admin Interest (₦)</th>
                            <th className="p-3">Selling Price (₦)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-200 font-mono">
                          {Object.entries(telegramConfig.premium?.options || {}).map(([key, opt]) => (
                            <tr key={key}>
                              <td className="p-3 font-bold text-white font-sans">{opt.label}</td>
                              <td className="p-3">
                                <input
                                  type="number"
                                  defaultValue={opt.providerCost}
                                  onBlur={(e) => {
                                    const cost = Number(e.target.value);
                                    const selling = cost + opt.interestAmount;
                                    handleSaveTelegramPricing({
                                      premium: {
                                        options: {
                                          ...telegramConfig.premium.options,
                                          [key]: { ...opt, providerCost: cost, sellingPrice: selling },
                                        },
                                      },
                                    });
                                  }}
                                  className="w-24 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white text-xs"
                                />
                              </td>
                              <td className="p-3">
                                <input
                                  type="number"
                                  step={500}
                                  defaultValue={opt.interestAmount}
                                  onBlur={(e) => {
                                    const interest = Math.round(Number(e.target.value));
                                    const selling = opt.providerCost + interest;
                                    handleSaveTelegramPricing({
                                      premium: {
                                        options: {
                                          ...telegramConfig.premium.options,
                                          [key]: { ...opt, interestAmount: interest, sellingPrice: selling },
                                        },
                                      },
                                    });
                                  }}
                                  className="w-24 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-emerald-400 text-xs font-bold"
                                />
                              </td>
                              <td className="p-3 font-bold text-emerald-400">
                                ₦{(opt.providerCost + opt.interestAmount).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 3. Telegram Blue Tick Pricing */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 fill-blue-400" />
                      <span>Telegram Blue Tick Verification Pricing</span>
                    </h4>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs bg-slate-950 rounded-xl border border-slate-800">
                        <thead className="bg-slate-900/80 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                          <tr>
                            <th className="p-3">Verification Tier</th>
                            <th className="p-3">Provider Cost (₦)</th>
                            <th className="p-3">Admin Interest (₦)</th>
                            <th className="p-3">Selling Price (₦)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-200 font-mono">
                          {(telegramConfig.blueTick?.options || []).map((opt, idx) => (
                            <tr key={opt.id}>
                              <td className="p-3">
                                <span className="font-bold text-white font-sans block">{opt.name}</span>
                                <span className="text-[10px] text-slate-400 font-sans">{opt.description}</span>
                              </td>
                              <td className="p-3">
                                <input
                                  type="number"
                                  defaultValue={opt.providerCost}
                                  onBlur={(e) => {
                                    const cost = Number(e.target.value);
                                    const selling = cost + opt.interestAmount;
                                    const updated = [...telegramConfig.blueTick.options];
                                    updated[idx] = { ...opt, providerCost: cost, sellingPrice: selling };
                                    handleSaveTelegramPricing({
                                      blueTick: { options: updated },
                                    });
                                  }}
                                  className="w-28 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white text-xs"
                                />
                              </td>
                              <td className="p-3">
                                <input
                                  type="number"
                                  step={1000}
                                  defaultValue={opt.interestAmount}
                                  onBlur={(e) => {
                                    const interest = Math.round(Number(e.target.value));
                                    const selling = opt.providerCost + interest;
                                    const updated = [...telegramConfig.blueTick.options];
                                    updated[idx] = { ...opt, interestAmount: interest, sellingPrice: selling };
                                    handleSaveTelegramPricing({
                                      blueTick: { options: updated },
                                    });
                                  }}
                                  className="w-28 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-emerald-400 text-xs font-bold"
                                />
                              </td>
                              <td className="p-3 font-bold text-emerald-400">
                                ₦{(opt.providerCost + opt.interestAmount).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex justify-end pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        if (telegramConfig) handleSaveTelegramPricing(telegramConfig);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <Check className="w-4 h-4" />
                      <span>Save Telegram Pricing & Routing</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 6. WALLET AND TRANSACTION MANAGEMENT */}
          {activeTab === 'wallet' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white">Wallet & Ledger Management</h2>
                <p className="text-xs text-slate-400">
                  Manage dedicated virtual funding accounts and review double-entry wallet ledger movements.
                </p>
              </div>

              {/* Dedicated Bank Config */}
              <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  Dedicated Customer Virtual Funding Account
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={bankNameVal}
                      onChange={(e) => setBankNameVal(e.target.value)}
                      placeholder="e.g. PalmPay / Wema Bank"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Account Number</label>
                    <input
                      type="text"
                      value={accountNumVal}
                      onChange={(e) => setAccountNumVal(e.target.value)}
                      placeholder="e.g. 9012345678"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Account Name</label>
                    <input
                      type="text"
                      value={accountNameVal}
                      onChange={(e) => setAccountNameVal(e.target.value)}
                      placeholder="e.g. STEVELOGS VENTURES"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => handleSaveBankDetails()}
                    disabled={savingBank}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>{savingBank ? 'Saving Bank Details...' : 'Save Dedicated Bank Account'}</span>
                  </button>
                </div>
              </div>

              {/* Transaction Ledger */}
              <div className="bg-[#0f172a] rounded-2xl border border-slate-800 overflow-hidden">
                <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 font-bold text-xs text-white">
                  Auditable Transaction Ledger ({transactions.length})
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/60 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                      <tr>
                        <th className="p-3">Reference</th>
                        <th className="p-3">Service</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-800/40">
                          <td className="p-3 font-mono font-bold text-white">{tx.reference}</td>
                          <td className="p-3">{tx.service} - {tx.description}</td>
                          <td className="p-3 uppercase font-mono text-[10px]">{tx.type}</td>
                          <td className="p-3 font-mono font-bold">
                            <span className={tx.type === 'credit' ? 'text-emerald-400' : 'text-slate-200'}>
                              {tx.type === 'credit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              tx.status === 'Successful' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400">{tx.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 7. ORDER MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white">Order Routing & Fulfillment</h2>
                  <p className="text-xs text-slate-400">
                    Track provider order routing (Nova Solution, BenOTP, Rakib Socials) and process 1-click wallet refunds.
                  </p>
                </div>
              </div>

              <div className="bg-[#0f172a] rounded-2xl border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/60 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                      <tr>
                        <th className="p-3">Order Ref</th>
                        <th className="p-3">Product Name</th>
                        <th className="p-3">Routed Provider</th>
                        <th className="p-3">Price</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {transactions.filter((t) => t.type === 'debit').map((t) => (
                        <tr key={t.id} className="hover:bg-slate-800/40">
                          <td className="p-3 font-mono font-bold text-white">{t.reference}</td>
                          <td className="p-3">{t.description}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 text-[10px] font-mono uppercase font-bold">
                              {t.providerId || 'Provider'}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-white">₦{t.amount.toLocaleString()}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              t.status === 'Successful' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                            }`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {t.status !== 'Failed' && (
                              <button
                                onClick={() => onRefundTransaction(t.id)}
                                className="px-2.5 py-1 rounded-lg bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white text-[11px] font-bold transition-colors cursor-pointer"
                              >
                                Refund to Wallet
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 8. INTEREST AND EARNINGS CONFIGURATION */}
          {interestProgram && activeTab === 'interest' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white">Interest & Rewards Tier Program</h2>
                <p className="text-xs text-slate-400">
                  Configure legitimate customer balance rewards or reseller yield. Strictly disabled until reviewed and approved.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white">{interestProgram.programName}</h3>
                    <p className="text-xs text-slate-400">
                      When enabled, qualifying balances accrue rewards on midnight schedule.
                    </p>
                  </div>
                  <button
                    onClick={() => handleSaveInterest({ enabled: !interestProgram.enabled })}
                    className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                      interestProgram.enabled ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {interestProgram.enabled ? 'Program Enabled' : 'Program Disabled'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                      Annual Yield Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      defaultValue={interestProgram.annualRatePercent}
                      onBlur={(e) => handleSaveInterest({ annualRatePercent: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                      Minimum Qualifying Balance (₦)
                    </label>
                    <input
                      type="number"
                      defaultValue={interestProgram.minEligibleBalance}
                      onBlur={(e) => handleSaveInterest({ minEligibleBalance: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                      Maximum Balance Cap (₦)
                    </label>
                    <input
                      type="number"
                      defaultValue={interestProgram.maxEligibleBalance}
                      onBlur={(e) => handleSaveInterest({ maxEligibleBalance: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                    Customer Disclosure & Terms
                  </label>
                  <textarea
                    rows={2}
                    defaultValue={interestProgram.disclaimer}
                    onBlur={(e) => handleSaveInterest({ disclaimer: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  />
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      if (interestProgram) handleSaveInterest(interestProgram);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Interest Program Settings</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 9. WHATSAPP SUPPORT SETTINGS */}
          {websiteSettings && activeTab === 'whatsapp-support' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white">WhatsApp Customer Support Desk</h2>
                <p className="text-xs text-slate-400">
                  Configure customer live support number with country code, button label, and pre-filled welcome text.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm font-bold text-white">Live Support Integration</span>
                  </div>
                  <button
                    onClick={() =>
                      handleSaveSettings({
                        whatsappSupportEnabled: !websiteSettings.whatsappSupportEnabled,
                      })
                    }
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      websiteSettings.whatsappSupportEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {websiteSettings.whatsappSupportEnabled ? 'Active' : 'Disabled'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                      WhatsApp Number (Include Country Code, e.g. +234...)
                    </label>
                    <input
                      type="text"
                      defaultValue={websiteSettings.whatsappSupportNumber}
                      onBlur={(e) => handleSaveSettings({ whatsappSupportNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                      Button Label
                    </label>
                    <input
                      type="text"
                      defaultValue={websiteSettings.whatsappSupportLabel}
                      onBlur={(e) => handleSaveSettings({ whatsappSupportLabel: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                    Default Welcome Message (Auto URL-encoded)
                  </label>
                  <input
                    type="text"
                    defaultValue={websiteSettings.whatsappWelcomeMessage}
                    onBlur={(e) => handleSaveSettings({ whatsappWelcomeMessage: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  />
                </div>

                {/* Live Link Preview */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                  <span className="text-slate-400 font-mono truncate">
                    Preview:{' '}
                    <span className="text-emerald-400">
                      https://wa.me/{websiteSettings.whatsappSupportNumber.replace(/\D/g, '')}?text=...
                    </span>
                  </span>
                  <a
                    href={`https://wa.me/${websiteSettings.whatsappSupportNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
                      websiteSettings.whatsappWelcomeMessage
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-emerald-400 hover:underline shrink-0 ml-2"
                  >
                    Test Link ↗
                  </a>
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      if (websiteSettings) handleSaveSettings(websiteSettings);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save WhatsApp Support Settings</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 10. WHATSAPP CHANNEL SETTINGS */}
          {websiteSettings && activeTab === 'whatsapp-channel' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white">WhatsApp VIP Channel Promotions</h2>
                <p className="text-xs text-slate-400">
                  Manage the official broadcast channel link for daily drops, 0-min OTP updates, and restock notifications.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Send className="w-5 h-5 text-blue-400" />
                    <span className="text-sm font-bold text-white">Channel Promotion</span>
                  </div>
                  <button
                    onClick={() =>
                      handleSaveSettings({
                        whatsappChannelEnabled: !websiteSettings.whatsappChannelEnabled,
                      })
                    }
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      websiteSettings.whatsappChannelEnabled ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {websiteSettings.whatsappChannelEnabled ? 'Active' : 'Disabled'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                      Official WhatsApp Channel URL
                    </label>
                    <input
                      type="text"
                      defaultValue={websiteSettings.whatsappChannelUrl}
                      onBlur={(e) => handleSaveSettings({ whatsappChannelUrl: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                      Channel Button Label
                    </label>
                    <input
                      type="text"
                      defaultValue={websiteSettings.whatsappChannelLabel}
                      onBlur={(e) => handleSaveSettings({ whatsappChannelLabel: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                    Channel Description / Benefit to Customers
                  </label>
                  <input
                    type="text"
                    defaultValue={websiteSettings.whatsappChannelDescription}
                    onBlur={(e) => handleSaveSettings({ whatsappChannelDescription: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  />
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      if (websiteSettings) handleSaveSettings(websiteSettings);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save WhatsApp Channel Settings</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 11. WEBSITE CONTENT AND ANNOUNCEMENTS */}
          {websiteSettings && activeTab === 'content' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white">Content & Broadcast Announcements</h2>
                <p className="text-xs text-slate-400">
                  Update customer header alerts, notices, and platform policies in real time without touching source code.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase">
                      Top Header Announcement Bar
                    </label>
                    <button
                      onClick={() =>
                        handleSaveSettings({
                          announcementEnabled: !websiteSettings.announcementEnabled,
                        })
                      }
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        websiteSettings.announcementEnabled ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {websiteSettings.announcementEnabled ? 'Banner Active' : 'Banner Off'}
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    defaultValue={websiteSettings.systemAnnouncement}
                    onBlur={(e) => handleSaveSettings({ systemAnnouncement: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                    Terms of Service (Customer Notice)
                  </label>
                  <textarea
                    rows={3}
                    defaultValue={websiteSettings.termsOfService}
                    onBlur={(e) => handleSaveSettings({ termsOfService: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  />
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      if (websiteSettings) handleSaveSettings(websiteSettings);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Content & Notices</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 12. VIDEO TUTORIALS MANAGEMENT */}
          {activeTab === 'video-tutorials' && (
            <AdminVideoTutorialsTab onShowNotice={showNotification} />
          )}

          {/* 13. WEBSITE ACTIVITY AND AUDIT LOGS */}
          {activeTab === 'audit-logs' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-white">System Activity & Audit Logs</h2>
                  <p className="text-xs text-slate-400">
                    Comprehensive immutable record of logins, orders, refunds, and administrator actions.
                  </p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="bg-[#0f172a] rounded-2xl border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/60 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                      <tr>
                        <th className="p-3">Timestamp</th>
                        <th className="p-3">Actor</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Action</th>
                        <th className="p-3">Details</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {auditLogs
                        .filter(
                          (l) =>
                            l.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
                            l.details.toLowerCase().includes(auditSearch.toLowerCase()) ||
                            l.actor.toLowerCase().includes(auditSearch.toLowerCase())
                        )
                        .map((l) => (
                          <tr key={l.id} className="hover:bg-slate-800/40">
                            <td className="p-3 font-mono text-[10px] text-slate-400">
                              {new Date(l.timestamp).toLocaleString()}
                            </td>
                            <td className="p-3 font-bold text-white">{l.actor}</td>
                            <td className="p-3 font-mono text-[10px]">{l.category || 'SYSTEM'}</td>
                            <td className="p-3 font-semibold text-slate-200">{l.action}</td>
                            <td className="p-3 text-slate-400 max-w-xs truncate">{l.details}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                                {l.status || 'Success'}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 13. PAYMENT AND REFUND MANAGEMENT */}
          {websiteSettings && activeTab === 'payments' && (
            <AdminPaymentSettingsTab
              settings={websiteSettings}
              onSaveSettings={handleSaveSettings}
              onShowNotice={showNotification}
            />
          )}

          {/* 14. WEBSITE MASTER SETTINGS */}
          {websiteSettings && activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white">Website Master Information</h2>
                <p className="text-xs text-slate-400">
                  Branding, contact email, default currency, and emergency maintenance mode.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-sm font-bold text-white block">Global Maintenance Mode</span>
                    <span className="text-xs text-slate-400">Puts customer interface into scheduled service alert</span>
                  </div>
                  <button
                    onClick={() =>
                      handleSaveSettings({
                        maintenanceMode: !websiteSettings.maintenanceMode,
                      })
                    }
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      websiteSettings.maintenanceMode ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {websiteSettings.maintenanceMode ? 'Maintenance ON' : 'Normal Operations'}
                  </button>
                </div>

                {/* General Branding & Support Info */}
                <div>
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">General Marketplace Branding</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                        Website Name
                      </label>
                      <input
                        type="text"
                        defaultValue={websiteSettings.websiteName}
                        id="setting-website-name"
                        onBlur={(e) => handleSaveSettings({ websiteName: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                        Contact / Support Email
                      </label>
                      <input
                        type="email"
                        defaultValue={websiteSettings.contactEmail}
                        id="setting-contact-email"
                        onBlur={(e) => handleSaveSettings({ contactEmail: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                        Support Phone (WhatsApp)
                      </label>
                      <input
                        type="text"
                        defaultValue={websiteSettings.whatsappSupportNumber}
                        id="setting-support-phone"
                        onBlur={(e) => handleSaveSettings({ whatsappSupportNumber: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                        Direct Call Phone Number
                      </label>
                      <input
                        type="text"
                        defaultValue={websiteSettings.callPhoneNumber || '+2348149021844'}
                        id="setting-call-phone"
                        onBlur={(e) => handleSaveSettings({ callPhoneNumber: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Google OAuth 2.0 Credentials */}
                <div className="pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" />
                      <span>Google OAuth 2.0 Sign-In Credentials</span>
                    </h4>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      websiteSettings.googleClientId ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {websiteSettings.googleClientId ? 'Configured' : 'Credentials Not Set'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3">
                    Obtain OAuth 2.0 Client credentials from the Google Cloud Console (APIs & Services &rarr; Credentials).
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                        Google Client ID
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 123456789-xxx.apps.googleusercontent.com"
                        defaultValue={websiteSettings.googleClientId || ''}
                        id="setting-google-client-id"
                        onBlur={(e) => handleSaveSettings({ googleClientId: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                        Google Client Secret
                      </label>
                      <input
                        type="password"
                        placeholder="Google OAuth Client Secret"
                        defaultValue={websiteSettings.googleClientSecret || ''}
                        id="setting-google-client-secret"
                        onBlur={(e) => handleSaveSettings({ googleClientSecret: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Email Delivery Service Configuration */}
                <div className="pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email Delivery Provider (Password Reset & OTPs)</span>
                    </h4>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      websiteSettings.emailApiKey || websiteSettings.smtpHost ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {websiteSettings.emailApiKey ? 'Resend API Active' : websiteSettings.smtpHost ? 'SMTP Active' : 'Sandbox (In-App Codes)'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs mb-3">
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                        Provider Type
                      </label>
                      <select
                        defaultValue={websiteSettings.emailProvider || 'resend'}
                        id="setting-email-provider"
                        onChange={(e) => handleSaveSettings({ emailProvider: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                      >
                        <option value="resend">Resend API (Recommended)</option>
                        <option value="smtp">Custom SMTP Server</option>
                        <option value="none">Sandbox / None (Manual)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                        Resend API Key (re_...)
                      </label>
                      <input
                        type="password"
                        placeholder="re_xxxxxxxxxxxxxx"
                        defaultValue={websiteSettings.emailApiKey || ''}
                        id="setting-email-api-key"
                        onBlur={(e) => handleSaveSettings({ emailApiKey: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                        Sender From Address
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. notifications@stevelogsmarketplace.shop"
                        defaultValue={websiteSettings.emailFromAddress || 'noreply@stevelogsmarketplace.shop'}
                        id="setting-email-from"
                        onBlur={(e) => handleSaveSettings({ emailFromAddress: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Explicit Master Save Button */}
                <div className="flex justify-end pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      const nameInput = document.getElementById('setting-website-name') as HTMLInputElement;
                      const emailInput = document.getElementById('setting-contact-email') as HTMLInputElement;
                      const phoneInput = document.getElementById('setting-support-phone') as HTMLInputElement;
                      const callInput = document.getElementById('setting-call-phone') as HTMLInputElement;
                      const gIdInput = document.getElementById('setting-google-client-id') as HTMLInputElement;
                      const gSecInput = document.getElementById('setting-google-client-secret') as HTMLInputElement;
                      const mailKeyInput = document.getElementById('setting-email-api-key') as HTMLInputElement;
                      const mailFromInput = document.getElementById('setting-email-from') as HTMLInputElement;
                      const provSelect = document.getElementById('setting-email-provider') as HTMLSelectElement;

                      handleSaveSettings({
                        websiteName: nameInput?.value || websiteSettings.websiteName,
                        contactEmail: emailInput?.value || websiteSettings.contactEmail,
                        whatsappSupportNumber: phoneInput?.value || websiteSettings.whatsappSupportNumber,
                        callPhoneNumber: callInput?.value || websiteSettings.callPhoneNumber,
                        googleClientId: gIdInput?.value || websiteSettings.googleClientId,
                        googleClientSecret: gSecInput?.value || websiteSettings.googleClientSecret,
                        emailApiKey: mailKeyInput?.value || websiteSettings.emailApiKey,
                        emailFromAddress: mailFromInput?.value || websiteSettings.emailFromAddress,
                        emailProvider: (provSelect?.value as any) || websiteSettings.emailProvider,
                      });
                    }}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Master Website & Credentials</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 15. SECURITY AND PERMISSIONS */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white">Security & Passcode Authentication</h2>
                <p className="text-xs text-slate-400">
                  Role-based permissions and dedicated salted cryptographic passcode gate.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-5">
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-start sm:items-center gap-3">
                  <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-300">Master Passcode Protection Active</h4>
                    <p className="text-xs text-emerald-400/90 mt-0.5">
                      Status: <span className="font-mono text-white bg-emerald-900/60 px-2 py-0.5 rounded text-[11px]">PBKDF2-SHA256 Encrypted</span> • Protected against brute-force attacks with automatic progressive lockout.
                    </p>
                    {websiteSettings?.adminPasscodeLastChanged && (
                      <p className="text-[11px] text-emerald-300/70 mt-1 font-mono">
                        Last passcode change: {new Date(websiteSettings.adminPasscodeLastChanged).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Change Administrator Passcode Form */}
                <form onSubmit={handleChangePasscode} className="p-5 rounded-2xl bg-slate-900 border border-slate-700/80 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-amber-400" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Change Administrator Passcode</h4>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">Persists to Database</span>
                  </div>

                  {passcodeMsg && (
                    <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
                      passcodeMsg.isError ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300' : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                    }`}>
                      {passcodeMsg.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                      <span>{passcodeMsg.text}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                        Admin Identifier
                      </label>
                      <input
                        type="text"
                        value={adminUsernameVal}
                        onChange={(e) => setAdminUsernameVal(e.target.value)}
                        placeholder="admin"
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:ring-1 focus:ring-amber-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                        Current Passcode *
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPass ? 'text' : 'password'}
                          required
                          value={currentPasscode}
                          onChange={(e) => setCurrentPasscode(e.target.value)}
                          placeholder="Current passcode"
                          className="w-full px-3 py-2.5 pr-8 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:ring-1 focus:ring-amber-400 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPass(!showCurrentPass)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                        >
                          {showCurrentPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                        New Passcode *
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPass ? 'text' : 'password'}
                          required
                          minLength={4}
                          value={newPasscode}
                          onChange={(e) => setNewPasscode(e.target.value)}
                          placeholder="Min. 4 digits/chars"
                          className="w-full px-3 py-2.5 pr-8 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:ring-1 focus:ring-amber-400 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                        >
                          {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                        Confirm New Passcode *
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPass ? 'text' : 'password'}
                          required
                          minLength={4}
                          value={confirmPasscode}
                          onChange={(e) => setConfirmPasscode(e.target.value)}
                          placeholder="Repeat new passcode"
                          className="w-full px-3 py-2.5 pr-8 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:ring-1 focus:ring-amber-400 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPass(!showConfirmPass)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                        >
                          {showConfirmPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <p className="text-[11px] text-slate-400">
                      • When changed, the old passcode is invalidated and the new passcode is required immediately for future logins.
                    </p>
                    <button
                      type="submit"
                      disabled={passcodeLoading || !currentPasscode || !newPasscode || !confirmPasscode}
                      className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      {passcodeLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving to Database...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Save & Activate New Passcode</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <div className="text-xs text-slate-400 space-y-1.5 pt-1">
                  <p>• Ordinary customer sessions cannot access administrative endpoints or view provider credentials.</p>
                  <p>• All administrative actions are cryptographically signed with actor identifiers and stored in the audit trail.</p>
                  <p>• Passcode changes are committed immediately to persistent database storage (`data/stevelogs_db.json`).</p>
                </div>
              </div>
            </div>
          )}

          {/* 16. REPORTS AND ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white">Executive Reports & Analytics</h2>
                  <p className="text-xs text-slate-400">
                    Exportable performance summaries and provider fulfillment breakdown.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(analyticsData || {}, null, 2));
                    const dlAnchor = document.createElement('a');
                    dlAnchor.setAttribute('href', dataStr);
                    dlAnchor.setAttribute('download', `stevelogs_report_${Date.now()}.json`);
                    dlAnchor.click();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <DownloadCloud className="w-3.5 h-3.5" />
                  <span>Export JSON Report</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-2">
                  <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">BenOTP (Priority #1)</span>
                  <div className="text-xl font-bold text-white font-mono">
                    {analyticsData?.providerStats?.benotp || 0} Orders
                  </div>
                  <p className="text-[10px] text-slate-400">Primary routing for virtual numbers</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-2">
                  <span className="text-[10px] font-mono uppercase text-blue-400 font-bold">Nova Solution</span>
                  <div className="text-xl font-bold text-white font-mono">
                    {analyticsData?.providerStats?.nova || 0} Orders
                  </div>
                  <p className="text-[10px] text-slate-400">Virtual numbers, logs & rentals</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-2">
                  <span className="text-[10px] font-mono uppercase text-purple-400 font-bold">Rakib Socials</span>
                  <div className="text-xl font-bold text-white font-mono">
                    {analyticsData?.providerStats?.rakib || 0} Orders
                  </div>
                  <p className="text-[10px] text-slate-400">Verified log accounts & social packages</p>
                </div>
              </div>
            </div>
          )}

          {/* SPECIAL MARKETPLACE 2 (DIRECT MANUAL LOGS) */}
          {activeTab === 'special-marketplace' && (
            <AdminSpecialMarketplaceTab adminFetch={adminFetch} />
          )}

          {/* ANNOUNCEMENTS MANAGEMENT SYSTEM */}
          {activeTab === 'announcements' && (
            <AdminAnnouncementsTab adminFetch={adminFetch} />
          )}

        </main>
      </div>
    </div>
  );
};
