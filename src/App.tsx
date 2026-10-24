/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ServiceId, 
  UserWallet, 
  Transaction, 
  ServiceItem, 
  CountryItem, 
  UsaServiceItem, 
  LogAccountProduct, 
  SocialBoostPackage,
  GiftCardRate, 
  ProxyPackage,
  AdminSettings,
  WebsiteMasterSettings,
  InterestProgramConfig,
  CustomerRecord,
  AnnouncementItem,
  SpecialMarketplaceOrder,
  CustomerNotification
} from './types';
import { 
  initialWallet, 
  initialTransactions, 
  MAIN_SERVICES, 
  USA_SERVICES, 
  COUNTRIES_LIST, 
  LOG_ACCOUNTS_INVENTORY, 
  SOCIAL_BOOST_PACKAGES,
  GIFT_CARD_RATES, 
  PROXY_PACKAGES,
  initialAdminSettings 
} from './data/mockData';
import { Header } from './components/Header';
import { MainServicesGrid } from './components/MainServicesGrid';
import { FloatingActions } from './components/FloatingActions';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLoginPage } from './components/admin/AdminLoginPage';
import { UnifiedNumbersMarketplaceModal } from './components/UnifiedNumbersMarketplaceModal';
import { CustomerProfileModal } from './components/CustomerProfileModal';
import { CustomerSidebar, CustomerPanelTab } from './components/CustomerSidebar';
import { MarketplaceModal } from './components/MarketplaceModal';
import { CustomerAuthModal } from './components/CustomerAuthModal';
import { CustomerWelcomeAuthGate } from './components/CustomerWelcomeAuthGate';
import { Megaphone, ShieldAlert, Sparkles, Lock, AlertTriangle, CheckCircle2, X } from 'lucide-react';

// Service Modals
import { UsaNumbersModal } from './components/services/UsaNumbersModal';
import { LogAccountsModal } from './components/services/LogAccountsModal';
import { BuyNumbersModal } from './components/services/BuyNumbersModal';
import { BoostAccountsModal } from './components/services/BoostAccountsModal';
import { TelegramTickModal } from './components/services/TelegramTickModal';
import { TransactionHistoryModal } from './components/services/TransactionHistoryModal';
import { RentNumberModal } from './components/services/RentNumberModal';
import { EsimModal } from './components/services/EsimModal';
import { NgAirtimeModal } from './components/services/NgAirtimeModal';
import { BuyGiftCardsModal } from './components/services/BuyGiftCardsModal';
import { SellGiftCardsModal } from './components/services/SellGiftCardsModal';
import { ProxiesModal } from './components/services/ProxiesModal';
import { DeveloperApiModal } from './components/services/DeveloperApiModal';
import { PartnerProgramModal } from './components/services/PartnerProgramModal';
import { WorldwideGiftDeliveryModal } from './components/services/WorldwideGiftDeliveryModal';
import { OrderTrackingModal } from './components/services/OrderTrackingModal';
import { VideoTutorialsModal } from './components/services/VideoTutorialsModal';

// Action Modals
import { FundWalletModal } from './components/FundWalletModal';
import { SupportModal } from './components/SupportModal';
import { AppDownloadModal } from './components/AppDownloadModal';
import { SpecialMarketplaceModal } from './components/SpecialMarketplaceModal';
import { AnnouncementPopupModal } from './components/AnnouncementPopupModal';
import { PaymentApprovedModal } from './components/PaymentApprovedModal';

const STORAGE_WALLET_KEY = 'stevelogs_wallet_v2';
const STORAGE_TX_KEY = 'stevelogs_transactions_v2';
const STORAGE_SERVICES_KEY = 'stevelogs_services_v2';
const STORAGE_USA_SERVICES_KEY = 'stevelogs_usa_services_v2';
const STORAGE_COUNTRIES_KEY = 'stevelogs_countries_v2';
const STORAGE_LOGS_KEY = 'stevelogs_logs_inventory_v2';
const STORAGE_BOOST_KEY = 'stevelogs_boost_packages_v2';
const STORAGE_RATES_KEY = 'stevelogs_giftcard_rates_v2';
const STORAGE_PROXIES_KEY = 'stevelogs_proxy_packages_v2';
const STORAGE_SETTINGS_KEY = 'stevelogs_admin_settings_v2';

// Private Route Checker: Only accessible at /secure-admin or /admin (or hash / query flag)
const checkIsAdminRoute = (): boolean => {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const search = window.location.search.toLowerCase();
  return (
    path === '/secure-admin' ||
    path.startsWith('/secure-admin/') ||
    path === '/admin' ||
    path.startsWith('/admin/') ||
    hash === '#secure-admin' ||
    hash === '#admin' ||
    search.includes('admin=true')
  );
};

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<'customer' | 'admin'>(() =>
    checkIsAdminRoute() ? 'admin' : 'customer'
  );

  const [adminUnlocked, setAdminUnlocked] = useState<boolean>(() => {
    try {
      return (
        sessionStorage.getItem('stevelogs_admin_unlocked') === 'true' &&
        Boolean(sessionStorage.getItem('stevelogs_admin_token'))
      );
    } catch (e) {
      return false;
    }
  });

  // Dedicated Route Listener (URL & PopState synchronization)
  useEffect(() => {
    const handleLocationChange = () => {
      const isAdmin = checkIsAdminRoute();
      setCurrentRoute(isAdmin ? 'admin' : 'customer');
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Server-side session verification when on admin route
  useEffect(() => {
    if (currentRoute === 'admin') {
      const token = sessionStorage.getItem('stevelogs_admin_token');
      if (!token) {
        setAdminUnlocked(false);
        return;
      }
      fetch('/api/admin/session', {
        headers: { Authorization: `Bearer ${token}`, 'x-admin-token': token },
      })
        .then((res) => {
          if (res.ok) {
            setAdminUnlocked(true);
          } else if (res.status === 401 || res.status === 403) {
            sessionStorage.removeItem('stevelogs_admin_token');
            sessionStorage.removeItem('stevelogs_admin_unlocked');
            setAdminUnlocked(false);
          }
        })
        .catch(() => {
          // Keep offline state safe, do not wipe token on temporary network hiccup
        });
    }
  }, [currentRoute]);

  // Customer Wallet state
  const [wallet, setWallet] = useState<UserWallet>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_WALLET_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return initialWallet;
  });

  // Transactions state
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_TX_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return initialTransactions;
  });

  // Dynamic Services Config
  const [services, setServices] = useState<ServiceItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SERVICES_KEY);
      if (saved) {
        const parsed: ServiceItem[] = JSON.parse(saved);
        MAIN_SERVICES.forEach((ms) => {
          if (!parsed.some((s) => s.id === ms.id)) {
            parsed.push({ ...ms, isEnabled: true });
          }
        });
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return MAIN_SERVICES.map((s) => ({ ...s, isEnabled: true }));
  });

  // Dynamic USA Services Config
  const [usaServices, setUsaServices] = useState<UsaServiceItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_USA_SERVICES_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return USA_SERVICES.map((s) => ({ ...s, enabled: true }));
  });

  // Dynamic Countries Config
  const [countries, setCountries] = useState<CountryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_COUNTRIES_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return COUNTRIES_LIST.map((c) => ({ ...c, enabled: true }));
  });

  // Dynamic Log Accounts Inventory
  const [logAccounts, setLogAccounts] = useState<LogAccountProduct[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LOGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return LOG_ACCOUNTS_INVENTORY;
  });

  // Dynamic Social Boost Packages
  const [socialBoostPackages, setSocialBoostPackages] = useState<SocialBoostPackage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_BOOST_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return SOCIAL_BOOST_PACKAGES;
  });

  // Dynamic Gift Card Rates
  const [giftCardRates, setGiftCardRates] = useState<GiftCardRate[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_RATES_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return GIFT_CARD_RATES;
  });

  // Dynamic Proxy Packages
  const [proxyPackages, setProxyPackages] = useState<ProxyPackage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PROXIES_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return PROXY_PACKAGES;
  });

  // Dynamic Admin Settings
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SETTINGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return initialAdminSettings;
  });

  // Modals state
  const [activeServiceModal, setActiveServiceModal] = useState<ServiceId | null>(null);
  const [isFundWalletOpen, setIsFundWalletOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [isMarketplaceOpen, setIsMarketplaceOpen] = useState(false);
  const [isSpecialMarketplaceOpen, setIsSpecialMarketplaceOpen] = useState(false);
  const [isAnnouncementsOpen, setIsAnnouncementsOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [unreadAnnouncementsCount, setUnreadAnnouncementsCount] = useState(0);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCustomerSidebarOpen, setIsCustomerSidebarOpen] = useState(false);
  const [activeCustomerTab, setActiveCustomerTab] = useState<CustomerPanelTab>('overview');
  const [trackingQuery, setTrackingQuery] = useState<string>('');
  const [paymentNotice, setPaymentNotice] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
  } | null>(null);
  const [paymentApprovalNotification, setPaymentApprovalNotification] = useState<CustomerNotification | null>(null);

  // Customer state & Authentication
  const [currentCustomer, setCurrentCustomer] = useState<CustomerRecord | null>(() => {
    try {
      const saved = localStorage.getItem('stevelogs_customer_data');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return null;
  });
  const [isCustomerAuthOpen, setIsCustomerAuthOpen] = useState(false);
  const [customerAuthMode, setCustomerAuthMode] = useState<'login' | 'register'>('login');

  // Verify and sync customer session on mount
  useEffect(() => {
    const token = localStorage.getItem('stevelogs_customer_token');
    if (token) {
      fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-customer-token': token,
        },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data && data.authenticated && data.customer) {
            setCurrentCustomer(data.customer);
            localStorage.setItem('stevelogs_customer_data', JSON.stringify(data.customer));
            if (data.wallet) {
              setWallet((prev) => ({
                ...prev,
                balance: data.wallet.balance ?? prev.balance,
                accountNumber: data.wallet.accountNumber || prev.accountNumber,
                bankName: data.wallet.bankName || prev.bankName,
                accountName: data.wallet.accountName || prev.accountName,
              }));
            }
          } else {
            localStorage.removeItem('stevelogs_customer_token');
            localStorage.removeItem('stevelogs_customer_data');
            setCurrentCustomer(null);
          }
        })
        .catch(() => {
          // If offline, preserve saved customer session
        });
    } else {
      setCurrentCustomer(null);
      localStorage.removeItem('stevelogs_customer_data');
    }
  }, []);

  // ==========================================
  // REAL-TIME INSTANT BALANCE & APPROVAL LISTENER
  // ==========================================
  useEffect(() => {
    if (!currentCustomer?.id) return;

    let eventSource: EventSource | null = null;
    let reconnectTimer: NodeJS.Timeout | null = null;

    const connectSSE = () => {
      try {
        const sseUrl = `/api/realtime/events?customerId=${encodeURIComponent(currentCustomer.id)}`;
        eventSource = new EventSource(sseUrl);

        eventSource.addEventListener('payment_approved', (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data);
            if (data && data.newBalance !== undefined) {
              // Update balance everywhere on screen automatically
              setWallet((prev) => ({ ...prev, balance: data.newBalance }));
              setCurrentCustomer((prev) =>
                prev ? { ...prev, walletBalance: data.newBalance } : null
              );

              // Show instant celebration pop-up
              if (data.notification) {
                setPaymentApprovalNotification(data.notification);
                // Mark pop-up as shown on server
                fetch(`/api/notifications/${encodeURIComponent(data.notification.id)}/shown`, {
                  method: 'POST',
                  headers: { 'x-customer-id': currentCustomer.id },
                }).catch(() => {});
              }

              // Refresh transactions ledger
              fetch(`/api/transactions?customerId=${encodeURIComponent(currentCustomer.id)}`, {
                headers: { 'x-customer-id': currentCustomer.id },
              })
                .then((r) => r.json())
                .then((txs) => {
                  if (Array.isArray(txs)) setTransactions(txs);
                })
                .catch(() => {});
            }
          } catch (err) {
            console.error('[Realtime] Failed to parse payment_approved event:', err);
          }
        });

        eventSource.addEventListener('payment_rejected', (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data);
            setPaymentNotice({
              type: 'error',
              message: `Deposit Rejected [Ref: ${data.reference || ''}]: ${data.rejectionReason || 'Contact support.'}`,
            });
          } catch (err) {}
        });

        eventSource.onerror = () => {
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          // Auto-reconnect after 4s
          reconnectTimer = setTimeout(connectSSE, 4000);
        };
      } catch (err) {
        console.warn('[Realtime] SSE connection error:', err);
        reconnectTimer = setTimeout(connectSSE, 4000);
      }
    };

    connectSSE();

    // Periodic & On-Focus Instant Sync (Guarantee for offline reconnects or background tab wakeup)
    const performSync = async () => {
      try {
        const res = await fetch(`/api/customer/sync?customerId=${encodeURIComponent(currentCustomer.id)}`, {
          headers: { 'x-customer-id': currentCustomer.id },
        });
        const data = await res.json();
        if (data && data.success && data.wallet) {
          // Synchronize balance if changed
          setWallet((prev) => {
            if (prev.balance !== data.wallet.balance) {
              return { ...prev, balance: data.wallet.balance };
            }
            return prev;
          });

          setCurrentCustomer((prev) => {
            if (prev && prev.walletBalance !== data.wallet.balance) {
              return { ...prev, walletBalance: data.wallet.balance };
            }
            return prev;
          });

          // Check for unshown payment approved notifications (e.g. approved while offline)
          if (Array.isArray(data.unshownPopups) && data.unshownPopups.length > 0) {
            const approvalPopup = data.unshownPopups.find(
              (p: CustomerNotification) => p.type === 'PAYMENT_APPROVED'
            );
            if (approvalPopup) {
              setPaymentApprovalNotification(approvalPopup);
              fetch(`/api/notifications/${encodeURIComponent(approvalPopup.id)}/shown`, {
                method: 'POST',
                headers: { 'x-customer-id': currentCustomer.id },
              }).catch(() => {});
            }
          }
        }
      } catch (e) {
        // Offline safe
      }
    };

    // Run sync immediately on connect
    performSync();

    // Background heartbeat poller every 3.5s for zero-delay reassurance
    const pollInterval = setInterval(performSync, 3500);

    const handleWindowFocus = () => {
      performSync();
    };
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      if (eventSource) eventSource.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [currentCustomer?.id]);

  const handleCustomerAuthSuccess = (cust: CustomerRecord) => {
    setCurrentCustomer(cust);
    localStorage.setItem('stevelogs_customer_data', JSON.stringify(cust));
    if (cust.walletBalance !== undefined) {
      setWallet((prev) => ({
        ...prev,
        balance: cust.walletBalance,
        bankName: cust.virtualAccount?.bankName || prev.bankName,
        accountNumber: cust.virtualAccount?.accountNumber || prev.accountNumber,
        accountName: cust.virtualAccount?.accountName || prev.accountName,
      }));
    }
    setIsCustomerAuthOpen(false);
  };

  const handleCustomerLogout = () => {
    localStorage.removeItem('stevelogs_customer_token');
    localStorage.removeItem('stevelogs_customer_data');
    setCurrentCustomer(null);
  };

  // Handle sidebar navigation selection
  const handleSelectCustomerTab = (tab: CustomerPanelTab) => {
    setActiveCustomerTab(tab);
    switch (tab) {
      case 'overview':
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'balance':
      case 'fund-wallet':
        setIsFundWalletOpen(true);
        break;
      case 'browse-products':
      case 'categories':
      case 'search-products':
      case 'featured-products':
        setIsMarketplaceOpen(true);
        break;
      case 'special-marketplace':
        setIsSpecialMarketplaceOpen(true);
        break;
      case 'announcements':
        setIsAnnouncementsOpen(true);
        break;
      case 'browse-logs':
        setActiveServiceModal('log-accounts');
        break;
      case 'worldwide-gifts':
        setActiveServiceModal('worldwide-gifts');
        break;
      case 'tracking-center':
        setActiveServiceModal('tracking-center');
        break;
      case 'video-tutorials':
        setActiveServiceModal('video-tutorials');
        break;
      case 'my-orders':
      case 'order-history':
      case 'successful-orders':
      case 'pending-orders':
      case 'failed-orders':
      case 'wallet-transactions':
      case 'recent-activity':
        setActiveServiceModal('transaction-history');
        break;
      case 'profile':
        setIsProfileOpen(true);
        break;
      case 'rewards':
        setActiveServiceModal('partner-program');
        break;
      case 'notifications':
        setIsProfileOpen(true);
        break;
      case 'ai-support':
      case 'live-chat':
      case 'whatsapp-support':
      case 'help-center':
      case 'faqs':
        setIsSupportOpen(true);
        break;
      default:
        break;
    }
  };

  // Live master settings & interest program synced with backend DB
  const [websiteMasterSettings, setWebsiteMasterSettings] = useState<WebsiteMasterSettings | null>(null);
  const [interestProgramConfig, setInterestProgramConfig] = useState<InterestProgramConfig>({
    enabled: false,
    programName: 'Stevelogs Wallet Growth & Reseller Yield',
    annualRatePercent: 4.8,
    calculationFrequency: 'daily',
    accrualSchedule: 'Midnight 00:00 UTC',
    minEligibleBalance: 25000,
    maxEligibleBalance: 2500000,
    eligibleAccountTypes: ['VIP Reseller', 'Wholesale'],
    withdrawalRules: 'Earned interest credits directly into main wallet.',
    terms: 'Qualifying balance must be maintained.',
    disclaimer: 'This is a customer loyalty rewards credit program.',
  });

  // Fetch live backend settings and catalog on mount
  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.websiteName) {
          setWebsiteMasterSettings(data);
          // Sync bank details if present
          if (data.accountNumber) {
            setWallet((prev) => ({
              ...prev,
              bankName: data.bankName || prev.bankName,
              accountNumber: data.accountNumber,
              accountName: data.accountName || prev.accountName,
            }));
          }
          // Sync announcement & maintenance
          setAdminSettings((prev) => ({
            ...prev,
            systemAnnouncement: data.systemAnnouncement,
            announcementEnabled: data.announcementEnabled,
            maintenanceMode: data.maintenanceMode,
          }));
        }
      })
      .catch((e) => console.error('Failed to sync master settings:', e));

    fetch('/api/interest-program')
      .then((r) => r.json())
      .then((data) => {
        if (data) setInterestProgramConfig(data);
      })
      .catch((e) => console.error('Failed to sync interest program:', e));

    // Fetch synchronized live logs from backend catalog
    fetch('/api/marketplace/logs')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mappedLogs: LogAccountProduct[] = data.map((item: any) => {
            let platform: any = 'Google';
            const cat = (item.category || item.productName || '').toLowerCase();
            if (cat.includes('facebook')) platform = 'Facebook';
            else if (cat.includes('instagram')) platform = 'Instagram';
            else if (cat.includes('twitter')) platform = 'Twitter';
            else if (cat.includes('telegram')) platform = 'Telegram';
            else if (cat.includes('tiktok')) platform = 'TikTok';
            else if (cat.includes('linkedin')) platform = 'LinkedIn';
            else if (cat.includes('discord')) platform = 'Discord';

            return {
              id: item.id,
              platform,
              name: item.productName,
              age: item.accountAge || 'Aged PVA',
              price: item.sellingPrice,
              stock: item.stock || 1,
              format: item.format || 'email:pass:2fa',
              features: item.features || ['Instant Delivery', 'High Trust Score'],
            };
          });
          setLogAccounts(mappedLogs);
        }
      })
      .catch((e) => console.error('Failed to load marketplace logs:', e));

    // Fetch active published announcements
    fetch('/api/announcements')
      .then((r) => r.json())
      .then((data: AnnouncementItem[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setAnnouncements(data);
          try {
            const dismissed: string[] = JSON.parse(
              localStorage.getItem('stevelogs_dismissed_announcements') || '[]'
            );
            const unread = data.filter((a) => !dismissed.includes(a.id));
            setUnreadAnnouncementsCount(unread.length);
            // Automatically show announcements popup if unread or important
            if (unread.length > 0) {
              setIsAnnouncementsOpen(true);
            }
          } catch (e) {
            setIsAnnouncementsOpen(true);
          }
        }
      })
      .catch((e) => console.error('Failed to load announcements:', e));
  }, []);

  const handleDismissAnnouncement = (id: string) => {
    try {
      const dismissed: string[] = JSON.parse(
        localStorage.getItem('stevelogs_dismissed_announcements') || '[]'
      );
      if (!dismissed.includes(id)) {
        dismissed.push(id);
        localStorage.setItem('stevelogs_dismissed_announcements', JSON.stringify(dismissed));
      }
      setUnreadAnnouncementsCount((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Flutterwave callback query parameters on redirect return
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get('payment_status');
      const txRef = urlParams.get('tx_ref');
      const amt = urlParams.get('amount') || urlParams.get('amt');

      if (paymentStatus === 'success' && txRef) {
        fetch(`/api/payments/verify/${encodeURIComponent(txRef)}`)
          .then((r) => r.json())
          .then((data) => {
            if (data.success && data.walletBalance !== undefined) {
              setWallet((prev) => ({ ...prev, balance: data.walletBalance }));
              const displayAmt = amt ? Number(amt) : data.payment?.amount;
              setPaymentNotice({
                type: 'success',
                message: `Payment Confirmed! ₦${(displayAmt || 0).toLocaleString()} has been credited to your Stevelogs wallet.`,
              });
              // Refresh customer data if present
              if (currentCustomer) {
                setCurrentCustomer((prev) =>
                  prev ? { ...prev, walletBalance: data.walletBalance } : null
                );
              }
              // Refresh transactions ledger
              fetch('/api/transactions')
                .then((r) => r.json())
                .then((txs) => {
                  if (Array.isArray(txs)) setTransactions(txs);
                })
                .catch(() => {});
            }
          })
          .catch((err) => console.error('Error verifying returned payment:', err));

        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (paymentStatus === 'cancelled') {
        setPaymentNotice({
          type: 'warning',
          message: 'Payment was cancelled by the customer.',
        });
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (paymentStatus === 'failed') {
        setPaymentNotice({
          type: 'error',
          message: 'Payment could not be completed or was declined by your bank.',
        });
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  // Auto-dismiss notification
  useEffect(() => {
    if (paymentNotice) {
      const timer = setTimeout(() => setPaymentNotice(null), 7000);
      return () => clearTimeout(timer);
    }
  }, [paymentNotice]);

  // Persistence effects
  useEffect(() => {
    try { localStorage.setItem(STORAGE_WALLET_KEY, JSON.stringify(wallet)); } catch (e) {}
  }, [wallet]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_TX_KEY, JSON.stringify(transactions)); } catch (e) {}
  }, [transactions]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_SERVICES_KEY, JSON.stringify(services)); } catch (e) {}
  }, [services]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_USA_SERVICES_KEY, JSON.stringify(usaServices)); } catch (e) {}
  }, [usaServices]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_COUNTRIES_KEY, JSON.stringify(countries)); } catch (e) {}
  }, [countries]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(logAccounts)); } catch (e) {}
  }, [logAccounts]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_BOOST_KEY, JSON.stringify(socialBoostPackages)); } catch (e) {}
  }, [socialBoostPackages]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_RATES_KEY, JSON.stringify(giftCardRates)); } catch (e) {}
  }, [giftCardRates]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_PROXIES_KEY, JSON.stringify(proxyPackages)); } catch (e) {}
  }, [proxyPackages]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(adminSettings)); } catch (e) {}
  }, [adminSettings]);

  // Balance deduction helper for customer purchases
  const handleDeductBalance = (amount: number, service: string, description: string): boolean => {
    if (wallet.balance < amount) return false;

    setWallet((prev) => ({
      ...prev,
      balance: prev.balance - amount,
    }));

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      reference: `SL-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      service,
      description,
      amount,
      type: 'debit',
      status: 'Successful',
      date: 'Just now',
    };

    setTransactions((prev) => [newTx, ...prev]);
    return true;
  };

  // Balance credit helper
  const handleCreditWallet = (amount: number, description: string) => {
    setWallet((prev) => ({
      ...prev,
      balance: prev.balance + amount,
    }));

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      reference: `SL-DEP-${Math.floor(10000 + Math.random() * 90000)}`,
      service: 'Wallet Deposit',
      description,
      amount,
      type: 'credit',
      status: 'Successful',
      date: 'Just now',
    };

    setTransactions((prev) => [newTx, ...prev]);
  };

  // Admin Controls Handlers
  const handleToggleService = (serviceId: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, isEnabled: s.isEnabled === false ? true : false } : s))
    );
  };

  const handleUpdateServiceMessage = (serviceId: string, msg: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, statusMessage: msg } : s))
    );
  };

  const handleToggleAllServices = (enable: boolean) => {
    setServices((prev) => prev.map((s) => ({ ...s, isEnabled: enable })));
  };

  const handleUpdateUsaPrice = (id: string, newPrice: number) => {
    setUsaServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, price: newPrice } : s))
    );
  };

  const handleToggleUsaService = (id: string) => {
    setUsaServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handleAddUsaService = (newService: UsaServiceItem) => {
    setUsaServices((prev) => [newService, ...prev]);
  };

  const handleUpdateCountryPrice = (code: string, newPrice: number) => {
    setCountries((prev) =>
      prev.map((c) => (c.code === code ? { ...c, minPrice: newPrice } : c))
    );
  };

  const handleToggleCountry = (code: string) => {
    setCountries((prev) =>
      prev.map((c) => (c.code === code ? { ...c, enabled: !c.enabled } : c))
    );
  };

  const handleAddCountry = (newCountry: CountryItem) => {
    setCountries((prev) => [newCountry, ...prev]);
  };

  const handleAddLogAccount = (item: LogAccountProduct) => {
    setLogAccounts((prev) => [item, ...prev]);
  };

  const handleUpdateLogPrice = (id: string, newPrice: number, stock: number) => {
    setLogAccounts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, price: newPrice, stock } : item))
    );
  };

  const handleDeleteLogAccount = (id: string) => {
    setLogAccounts((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateBoostRate = (id: string, newRate: number) => {
    setSocialBoostPackages((prev) =>
      prev.map((pkg) => (pkg.id === id ? { ...pkg, ratePerThousand: newRate } : pkg))
    );
  };

  const handleUpdateGiftCardRate = (id: string, newRate: number) => {
    setGiftCardRates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ratePerDollar: newRate } : c))
    );
  };

  const handleAddGiftCardRate = (item: GiftCardRate) => {
    setGiftCardRates((prev) => [item, ...prev]);
  };

  const handleUpdateProxyPrice = (id: string, newPrice: number) => {
    setProxyPackages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, price: newPrice } : p))
    );
  };

  const handleCreditUserWallet = (amount: number, reason: string) => {
    handleCreditWallet(amount, reason);
  };

  const handleDebitUserWallet = (amount: number, reason: string) => {
    setWallet((prev) => ({
      ...prev,
      balance: Math.max(0, prev.balance - amount),
    }));

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      reference: `SL-ADJ-${Math.floor(10000 + Math.random() * 90000)}`,
      service: 'Admin Debit Adjustment',
      description: reason,
      amount,
      type: 'debit',
      status: 'Successful',
      date: 'Just now',
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleUpdateWalletBankDetails = (bankName: string, accNum: string, accName: string) => {
    setWallet((prev) => ({
      ...prev,
      bankName,
      accountNumber: accNum,
      accountName: accName,
    }));
  };

  const handleResetWallet = () => {
    setWallet(initialWallet);
  };

  const handleRefundTransaction = (txId: string) => {
    const targetTx = transactions.find((t) => t.id === txId);
    if (!targetTx || targetTx.status === 'Failed') return;

    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, status: 'Failed', description: `${t.description} [REFUNDED]` } : t))
    );

    // Credit back amount
    setWallet((prev) => ({
      ...prev,
      balance: prev.balance + targetTx.amount,
    }));

    const refundTx: Transaction = {
      id: `tx-${Date.now()}`,
      reference: `SL-REF-${Math.floor(10000 + Math.random() * 90000)}`,
      service: 'Order Refund',
      description: `Refund for ${targetTx.reference} (${targetTx.service})`,
      amount: targetTx.amount,
      type: 'credit',
      status: 'Successful',
      date: 'Just now',
    };
    setTransactions((prev) => [refundTx, ...prev]);
  };

  const handleUpdateTransactionStatus = (txId: string, status: 'Successful' | 'Pending' | 'Failed') => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, status } : t))
    );
  };

  // Navigation & Authentication Handlers for Admin
  const navigateToCustomer = () => {
    window.history.pushState({}, '', '/');
    if (window.location.hash === '#admin' || window.location.hash === '#secure-admin') {
      window.location.hash = '';
    }
    setCurrentRoute('customer');
  };

  const handleAdminLoginSuccess = (token: string) => {
    sessionStorage.setItem('stevelogs_admin_token', token);
    sessionStorage.setItem('stevelogs_admin_unlocked', 'true');
    setAdminUnlocked(true);
    setCurrentRoute('admin');
  };

  const handleLockAdmin = async () => {
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
    setAdminUnlocked(false);
  };

  // If in Admin View Mode (Private /secure-admin Route)
  if (currentRoute === 'admin') {
    // If not authenticated, show the separate Full-Screen Admin Login Page!
    if (!adminUnlocked) {
      return (
        <AdminLoginPage
          onSuccess={handleAdminLoginSuccess}
          onBackToWebsite={navigateToCustomer}
        />
      );
    }

    // Unlocked: Render full Admin Dashboard
    return (
      <AdminDashboard
        onBackToCustomer={navigateToCustomer}
        onLockAdmin={handleLockAdmin}
        services={services}
        onToggleService={handleToggleService}
        onUpdateServiceMessage={handleUpdateServiceMessage}
        onToggleAllServices={handleToggleAllServices}
        usaServices={usaServices}
        onUpdateUsaPrice={handleUpdateUsaPrice}
        onToggleUsaService={handleToggleUsaService}
        onAddUsaService={handleAddUsaService}
        countries={countries}
        onUpdateCountryPrice={handleUpdateCountryPrice}
        onToggleCountry={handleToggleCountry}
        onAddCountry={handleAddCountry}
        logAccounts={logAccounts}
        onAddLogAccount={handleAddLogAccount}
        onUpdateLogPrice={handleUpdateLogPrice}
        onDeleteLogAccount={handleDeleteLogAccount}
        socialBoostPackages={socialBoostPackages}
        onUpdateBoostRate={handleUpdateBoostRate}
        giftCardRates={giftCardRates}
        onUpdateGiftCardRate={handleUpdateGiftCardRate}
        onAddGiftCardRate={handleAddGiftCardRate}
        proxyPackages={proxyPackages}
        onUpdateProxyPrice={handleUpdateProxyPrice}
        wallet={wallet}
        onCreditUserWallet={handleCreditUserWallet}
        onDebitUserWallet={handleDebitUserWallet}
        onUpdateWalletBankDetails={handleUpdateWalletBankDetails}
        onResetWallet={handleResetWallet}
        transactions={transactions}
        onRefundTransaction={handleRefundTransaction}
        onUpdateTransactionStatus={handleUpdateTransactionStatus}
        adminSettings={adminSettings}
        onUpdateAdminSettings={setAdminSettings}
      />
    );
  }

  // Strict Customer Login Gate: Show professional yellow-and-blue welcome page first
  if (currentRoute === 'customer' && !currentCustomer) {
    return (
      <CustomerWelcomeAuthGate
        onAuthSuccess={handleCustomerAuthSuccess}
        settings={websiteMasterSettings || undefined}
      />
    );
  }

  // Customer Dashboard View Mode
  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-600/20 selection:text-blue-900">
      {/* Customer Sidebar Navigation Drawer (Slide-in mobile & desktop drawer) */}
      <CustomerSidebar
        isOpen={isCustomerSidebarOpen}
        onClose={() => setIsCustomerSidebarOpen(false)}
        currentTab={activeCustomerTab}
        onSelectTab={handleSelectCustomerTab}
        wallet={wallet}
        settings={websiteMasterSettings || undefined}
        customer={currentCustomer}
        onOpenAuth={(mode) => {
          setCustomerAuthMode(mode || 'login');
          setIsCustomerAuthOpen(true);
        }}
        onLogout={handleCustomerLogout}
      />

      {/* Top Header */}
      <Header
        wallet={wallet}
        settings={websiteMasterSettings || undefined}
        onOpenFundWallet={() => setIsFundWalletOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenMarketplace={() => setIsMarketplaceOpen(true)}
        onOpenAnnouncements={() => setIsAnnouncementsOpen(true)}
        hasAnnouncements={unreadAnnouncementsCount > 0}
        onToggleSidebar={() => setIsCustomerSidebarOpen(true)}
        customer={currentCustomer}
        onOpenAuth={(mode) => {
          setCustomerAuthMode(mode || 'login');
          setIsCustomerAuthOpen(true);
        }}
        onLogout={handleCustomerLogout}
      />

      {/* Global Maintenance Alert (Admin controlled) */}
      {adminSettings.maintenanceMode && (
        <div className="bg-amber-500 text-slate-950 text-xs py-2 px-4 font-bold flex items-center justify-center gap-2 shadow-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Platform Maintenance Notice: Some features are undergoing scheduled updates by administrator.</span>
        </div>
      )}

      {/* System Announcement Banner (Admin Controlled) */}
      {adminSettings.announcementEnabled && adminSettings.systemAnnouncement && (
        <div className="bg-blue-600 text-white text-xs py-2 px-4 shadow-xs">
          <div className="max-w-4xl mx-auto flex items-center justify-center text-center gap-3">
            <div className="flex items-center gap-2 font-medium">
              <Megaphone className="w-3.5 h-3.5 shrink-0 animate-bounce" />
              <span className="truncate">{adminSettings.systemAnnouncement}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content: 14 Services Grid */}
      <main className="flex-1 pb-16 pt-2">
        <MainServicesGrid
          services={services}
          wallet={wallet}
          customer={currentCustomer}
          onSelectService={(serviceId) => setActiveServiceModal(serviceId)}
          onOpenFundWallet={() => setIsFundWalletOpen(true)}
          onOpenMarketplace={() => setIsMarketplaceOpen(true)}
          onOpenSpecialMarketplace={() => setIsSpecialMarketplaceOpen(true)}
          onOpenSupport={() => setIsSupportOpen(true)}
          onOpenHistory={() => setActiveServiceModal('transaction-history')}
        />
      </main>

      {/* Floating Action Buttons */}
      <FloatingActions
        onOpenPartner={() => setActiveServiceModal('partner-program')}
        onOpenSupport={() => setIsSupportOpen(true)}
        onOpenDownload={() => setIsDownloadOpen(true)}
      />

      {/* Service Modals */}
      {activeServiceModal === 'log-accounts' && (
        <LogAccountsModal
          onClose={() => setActiveServiceModal(null)}
          walletBalance={wallet.balance}
          onDeductBalance={handleDeductBalance}
          inventory={logAccounts}
        />
      )}

      {activeServiceModal === 'boost-accounts' && (
        <BoostAccountsModal
          onClose={() => setActiveServiceModal(null)}
          walletBalance={wallet.balance}
          onDeductBalance={handleDeductBalance}
          packagesList={socialBoostPackages}
        />
      )}

      {activeServiceModal === 'telegram-tick' && (
        <TelegramTickModal
          onClose={() => setActiveServiceModal(null)}
          walletBalance={wallet.balance}
          onDeductBalance={handleDeductBalance}
        />
      )}

      {activeServiceModal === 'transaction-history' && (
        <TransactionHistoryModal
          transactions={transactions}
          onClose={() => setActiveServiceModal(null)}
        />
      )}

      {activeServiceModal === 'rent-number' && (
        <RentNumberModal
          onClose={() => setActiveServiceModal(null)}
          walletBalance={wallet.balance}
          onDeductBalance={handleDeductBalance}
        />
      )}

      {activeServiceModal === 'esim' && (
        <EsimModal
          onClose={() => setActiveServiceModal(null)}
          walletBalance={wallet.balance}
          onDeductBalance={handleDeductBalance}
        />
      )}

      {activeServiceModal === 'ng-airtime' && (
        <NgAirtimeModal
          onClose={() => setActiveServiceModal(null)}
          walletBalance={wallet.balance}
          onDeductBalance={handleDeductBalance}
        />
      )}

      {activeServiceModal === 'buy-gift-cards' && (
        <BuyGiftCardsModal
          onClose={() => setActiveServiceModal(null)}
          walletBalance={wallet.balance}
          onDeductBalance={handleDeductBalance}
          rates={giftCardRates}
        />
      )}

      {activeServiceModal === 'sell-gift-cards' && (
        <SellGiftCardsModal
          onClose={() => setActiveServiceModal(null)}
          onCreditWallet={handleCreditWallet}
          rates={giftCardRates}
        />
      )}

      {activeServiceModal === 'proxies' && (
        <ProxiesModal
          onClose={() => setActiveServiceModal(null)}
          walletBalance={wallet.balance}
          onDeductBalance={handleDeductBalance}
          packagesList={proxyPackages}
        />
      )}

      {activeServiceModal === 'developer-api' && (
        <DeveloperApiModal
          onClose={() => setActiveServiceModal(null)}
          walletBalance={wallet.balance}
        />
      )}

      {activeServiceModal === 'partner-program' && (
        <PartnerProgramModal
          onClose={() => setActiveServiceModal(null)}
          walletBalance={wallet.balance}
          customer={currentCustomer}
          onClaimCommission={(amt) => handleCreditWallet(amt, 'Referral Commission Claimed')}
          onRefreshWallet={() => {
            if (currentCustomer?.id) {
              fetch('/api/auth/me', { headers: { 'x-customer-id': currentCustomer.id } })
                .then((r) => r.json())
                .then((d) => {
                  if (d.customer) {
                    setCurrentCustomer(d.customer);
                    if (d.wallet) setWallet((prev) => ({ ...prev, balance: d.wallet.balance }));
                  }
                })
                .catch(() => {});
            }
          }}
        />
      )}

      {activeServiceModal === 'worldwide-gifts' && (
        <WorldwideGiftDeliveryModal
          onClose={() => setActiveServiceModal(null)}
          customer={currentCustomer}
          walletBalance={wallet.balance}
          onOpenTracking={(trk) => {
            if (trk) setTrackingQuery(trk);
            setActiveServiceModal('tracking-center');
          }}
        />
      )}

      {activeServiceModal === 'tracking-center' && (
        <OrderTrackingModal
          onClose={() => {
            setActiveServiceModal(null);
            setTrackingQuery('');
          }}
          initialQuery={trackingQuery}
        />
      )}

      {activeServiceModal === 'video-tutorials' && (
        <VideoTutorialsModal
          onClose={() => setActiveServiceModal(null)}
          onSelectService={(serviceId) => {
            setActiveServiceModal(serviceId);
          }}
        />
      )}

      {/* Auxiliary Modals */}
      {isFundWalletOpen && (
        <FundWalletModal
          wallet={wallet}
          customer={currentCustomer}
          onClose={() => setIsFundWalletOpen(false)}
          onAddFunds={(amt) => handleCreditWallet(amt, 'Flutterwave Wallet Deposit')}
        />
      )}

      {isSupportOpen && (
        <SupportModal
          onClose={() => setIsSupportOpen(false)}
          settings={websiteMasterSettings || undefined}
          customer={currentCustomer}
        />
      )}

      {/* Special Marketplace 2 (Direct Admin-Curated Accounts & Services) */}
      <SpecialMarketplaceModal
        isOpen={isSpecialMarketplaceOpen || activeServiceModal === 'special-marketplace'}
        onClose={() => {
          setIsSpecialMarketplaceOpen(false);
          if (activeServiceModal === 'special-marketplace') {
            setActiveServiceModal(null);
          }
        }}
        wallet={wallet}
        customer={currentCustomer}
        onOpenFundWallet={() => setIsFundWalletOpen(true)}
        onOrderSuccess={(order: SpecialMarketplaceOrder, newBalance: number) => {
          setWallet((prev) => ({ ...prev, balance: newBalance }));
          const newTx: Transaction = {
            id: `tx-${Date.now()}`,
            reference: order.reference,
            service: 'Special Marketplace 2',
            description: `Purchased ${order.listingName}`,
            amount: order.price,
            type: 'debit',
            status: 'Successful',
            date: 'Just now',
          };
          setTransactions((prev) => [newTx, ...prev]);
          setPaymentNotice({
            type: 'success',
            message: `Purchase successful! Credentials for "${order.listingName}" are ready in your account.`,
          });
        }}
      />

      {/* Platform Announcements Popup */}
      {isAnnouncementsOpen && announcements.length > 0 && (
        <AnnouncementPopupModal
          announcements={announcements}
          onClose={() => setIsAnnouncementsOpen(false)}
          onDismissAnnouncement={handleDismissAnnouncement}
        />
      )}

      {isDownloadOpen && (
        <AppDownloadModal
          onClose={() => setIsDownloadOpen(false)}
        />
      )}

      {/* Unified Multi-Provider Numbers Marketplace (USA Servers 1-5 & All Countries Servers 1-6) */}
      <UnifiedNumbersMarketplaceModal
        isOpen={activeServiceModal === 'buy-numbers' || activeServiceModal === 'usa-numbers'}
        initialServiceCategory={activeServiceModal === 'usa-numbers' ? 'usa' : 'all'}
        onClose={() => {
          setActiveServiceModal(null);
        }}
        wallet={wallet}
        customer={currentCustomer}
        onOrderSuccess={(order) => {
          handleDeductBalance(
            order.amount,
            'Virtual Numbers',
            `${order.productName} (${order.details?.serverName || 'Verified Server'})`
          );
        }}
      />

      {/* NEW Isolated Marketplace Modal powered by Rakib Socials only */}
      <MarketplaceModal
        isOpen={isMarketplaceOpen || activeServiceModal === 'marketplace'}
        onClose={() => {
          setIsMarketplaceOpen(false);
          if (activeServiceModal === 'marketplace') {
            setActiveServiceModal(null);
          }
        }}
        wallet={wallet}
        customerId={currentCustomer?.id}
        onDeductBalance={handleDeductBalance}
        onOpenFundWallet={() => setIsFundWalletOpen(true)}
      />

      {/* Customer Sign In & Registration Modal */}
      <CustomerAuthModal
        isOpen={isCustomerAuthOpen}
        onClose={() => setIsCustomerAuthOpen(false)}
        initialMode={customerAuthMode}
        onAuthSuccess={handleCustomerAuthSuccess}
      />

      {/* Customer Profile & Account Details Modal */}
      <CustomerProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        wallet={wallet}
        transactions={transactions}
        settings={websiteMasterSettings || {
          websiteName: 'STEVELOGS',
          tagline: 'Multi-Provider Marketplace',
          logoUrl: '',
          contactEmail: 'support@stevelogs.com',
          whatsappSupportNumber: '+2348149021844',
          whatsappSupportLabel: 'WhatsApp Live Desk',
          whatsappWelcomeMessage: 'Hello Stevelogs Support',
          whatsappSupportPlacement: 'all',
          whatsappSupportEnabled: true,
          whatsappChannelUrl: 'https://whatsapp.com/channel/0029Vb3stevelogs',
          whatsappChannelTitle: 'Stevelogs VIP Channel',
          whatsappChannelLabel: 'Join WhatsApp Channel',
          whatsappChannelDescription: '',
          whatsappChannelPlacement: 'all',
          whatsappChannelEnabled: true,
          systemAnnouncement: '',
          announcementEnabled: false,
          customerNotice: '',
          customerNoticeEnabled: false,
          maintenanceMode: false,
          currency: 'NGN',
          currencySymbol: '₦',
          minDeposit: 500,
          maxDeposit: 5000000,
          minPurchase: 200,
          maxPurchase: 1000000,
          bankName: wallet.bankName,
          accountNumber: wallet.accountNumber,
          accountName: wallet.accountName,
          termsOfService: '',
          privacyPolicy: '',
        }}
        interestProgram={interestProgramConfig}
        onOpenFundWallet={() => {
          setIsProfileOpen(false);
          setIsFundWalletOpen(true);
        }}
      />

      {/* Dedicated Real-Time Payment Approved Celebration Modal */}
      <PaymentApprovedModal
        notification={paymentApprovalNotification}
        onClose={() => setPaymentApprovalNotification(null)}
        onOpenWallet={() => setIsFundWalletOpen(true)}
        onOpenMarketplace={() => setIsMarketplaceOpen(true)}
      />

      {/* Floating Payment Notification Banner */}
      {paymentNotice && (
        <div
          className={`fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-2xl shadow-2xl border flex items-center justify-between gap-3 text-xs font-bold animate-in slide-in-from-bottom duration-300 ${
            paymentNotice.type === 'success'
              ? 'bg-emerald-950/95 text-emerald-200 border-emerald-500/30 shadow-emerald-950/50'
              : paymentNotice.type === 'warning'
              ? 'bg-amber-950/95 text-amber-200 border-amber-500/30 shadow-amber-950/50'
              : 'bg-rose-950/95 text-rose-200 border-rose-500/30 shadow-rose-950/50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {paymentNotice.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <span>{paymentNotice.message}</span>
          </div>
          <button
            onClick={() => setPaymentNotice(null)}
            className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
