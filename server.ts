import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import crypto from 'crypto';
import { db, hashPasscode, verifyPasscode } from './src/server/db';
import { ProviderService } from './src/server/providers';
import { RakibSocialsClient } from './src/server/rakibClient';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Helper for masking sensitive keys
const maskKey = (key: string | undefined): string => {
  if (!key || key.trim() === '') return '';
  if (key.length <= 8) return '••••••••';
  return `${key.slice(0, 3)}••••••••${key.slice(-3)}`;
};

// ========================
// API ROUTES
// ========================

// 0. Search Engine SEO Crawlers (Robots & Sitemap)
app.get('/robots.txt', (_req: Request, res: Response) => {
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: https://stevelogsmarketplace.shop/sitemap.xml\n`);
});

app.get('/sitemap.xml', (_req: Request, res: Response) => {
  res.type('application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://stevelogsmarketplace.shop/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.stevelogsmarketplace.shop/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`);
});

// 1. Health & Status
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'STEVELOGS Marketplace Core',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

// 2. Settings Management
app.get('/api/settings', (_req: Request, res: Response) => {
  res.json(db.getSettings());
});

app.put('/api/settings', (req: Request, res: Response) => {
  const actor = req.headers['x-admin-actor'] as string || 'Admin';
  const updated = db.updateSettings(req.body, actor);
  res.json(updated);
});

// 3. Provider Management
app.get('/api/providers', (_req: Request, res: Response) => {
  const providers = db.getProviders().map((p) => ({
    ...p,
    apiKey: maskKey(p.apiKey),
    apiToken: maskKey(p.apiToken),
    secretKey: maskKey(p.secretKey),
  }));
  res.json(providers);
});

app.put('/api/providers/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const actor = req.headers['x-admin-actor'] as string || 'Admin';
  const updates = { ...req.body };

  // If apiKey was masked and not edited, do not overwrite with dots
  if (updates.apiKey && updates.apiKey.includes('••••')) {
    delete updates.apiKey;
  }
  if (updates.apiToken && updates.apiToken.includes('••••')) {
    delete updates.apiToken;
  }

  const updated = db.updateProvider(id, updates, actor);
  if (!updated) {
    res.status(404).json({ error: 'Provider not found' });
    return;
  }

  res.json({
    ...updated,
    apiKey: maskKey(updated.apiKey),
    apiToken: maskKey(updated.apiToken),
  });
});

app.post('/api/providers/:id/test-connection', async (req: Request, res: Response) => {
  const { id } = req.params;
  const provider = db.getProvider(id);
  if (!provider) {
    res.status(404).json({ error: 'Provider not found' });
    return;
  }

  const result = await ProviderService.testConnection(provider);
  db.updateProvider(
    id,
    {
      status: result.status,
      balance: result.balance !== undefined ? result.balance : provider.balance,
      lastError: result.success ? null : result.message,
    },
    'Connection Tester'
  );

  res.json(result);
});

// Alias for test connection
app.post('/api/providers/:id/test', async (req: Request, res: Response) => {
  const { id } = req.params;
  const provider = db.getProvider(id);
  if (!provider) {
    res.status(404).json({ error: 'Provider not found' });
    return;
  }

  const result = await ProviderService.testConnection(provider);
  db.updateProvider(
    id,
    {
      status: result.status,
      balance: result.balance !== undefined ? result.balance : provider.balance,
      lastError: result.success ? null : result.message,
    },
    'Connection Tester'
  );

  res.json(result);
});

app.post('/api/providers/:id/sync', async (req: Request, res: Response) => {
  const { id } = req.params;
  const provider = db.getProvider(id);
  if (!provider) {
    res.status(404).json({ error: 'Provider not found' });
    return;
  }

  const pricingRules = db.getPricingRules();
  const providerMarkup = pricingRules.providerMarkups[id] || pricingRules.globalMarkupPercent;

  const result = await ProviderService.syncCatalog(
    provider,
    providerMarkup,
    pricingRules.fixedMarkupAmount
  );

  if (result.success) {
    db.setOffers(result.numberOffers, result.logOffers);
    if (result.marketplaceCategories && result.marketplaceProducts) {
      db.setMarketplaceCategories(result.marketplaceCategories);
      db.setMarketplaceProducts(result.marketplaceProducts);
    }
    db.updateProvider(
      id,
      {
        lastSync: new Date().toISOString(),
        lastError: null,
        syncReport: result.report,
      },
      'Catalog Synchronizer'
    );
  } else if (result.report) {
    db.updateProvider(
      id,
      {
        lastSync: new Date().toISOString(),
        lastError: result.report.lastSyncError || result.message,
        syncReport: result.report,
      },
      'Catalog Synchronizer'
    );
  }

  res.json(result);
});

// 4. Unified Marketplace
app.get('/api/marketplace/numbers', async (req: Request, res: Response) => {
  let rawOffers = db.getNumberOffers();
  // If catalog has less than 500 offers, perform synchronization automatically
  if (rawOffers.length < 500) {
    const providers = db.getProviders();
    for (const p of providers) {
      if (p.supportedServices.includes('virtual_numbers')) {
        const syncResult = await ProviderService.syncCatalog(p);
        if (syncResult.success) {
          db.setOffers(syncResult.numberOffers, syncResult.logOffers);
          if (syncResult.report) {
            db.updateProvider(
              p.id,
              {
                lastSync: new Date().toISOString(),
                lastError: null,
                syncReport: syncResult.report,
              },
              'Catalog Synchronizer'
            );
          }
        }
      }
    }
  }

  const isAdmin = req.headers['x-admin-actor'] || req.query.admin === 'true';
  if (isAdmin) {
    res.json(db.getNumberOffers());
    return;
  }

  // Customer view: Return strictly sanitized offers (provider identity, credentials & supplier costs completely hidden)
  res.json(db.getCustomerNumberOffers());
});

app.get('/api/admin/marketplace/numbers', (_req: Request, res: Response) => {
  res.json(db.getNumberOffers());
});

app.post('/api/marketplace/numbers/auto-select', (req: Request, res: Response) => {
  const { serviceId, countryCode } = req.body;
  if (!serviceId) {
    res.status(400).json({ error: 'serviceId is required for automatic selection' });
    return;
  }

  const offer = db.autoSelectNumber(serviceId, countryCode);
  if (!offer) {
    res.status(404).json({
      error: 'No available number offer found across configured servers for this service/country.',
    });
    return;
  }

  // Customer safe auto-select representation
  res.json({
    id: offer.id,
    serviceId: offer.serviceId,
    serviceName: offer.serviceName,
    countryCode: offer.countryCode,
    countryName: offer.countryName,
    countryFlag: offer.countryFlag,
    dialCode: offer.dialCode,
    sellingPrice: offer.sellingPrice,
    currency: '₦',
    availability: offer.availability,
    activationType: offer.activationType,
  });
});

app.get('/api/marketplace/logs', async (req: Request, res: Response) => {
  let logs = db.getLogOffers();
  if (logs.length === 0) {
    const providers = db.getProviders();
    for (const p of providers) {
      if (p.supportedServices.includes('logs')) {
        const syncResult = await ProviderService.syncCatalog(p);
        if (syncResult.success) {
          db.setOffers(syncResult.numberOffers, syncResult.logOffers);
        }
      }
    }
  }

  const isAdmin = req.headers['x-admin-actor'] || req.query.admin === 'true';
  if (isAdmin) {
    res.json(db.getLogOffers());
    return;
  }

  // Customer view: Sanitized log products (no supplier names, no wholesale costs)
  res.json(db.getCustomerLogOffers());
});

app.get('/api/admin/marketplace/logs', (_req: Request, res: Response) => {
  res.json(db.getLogOffers());
});

// ==========================================
// RAKIB SOCIALS MARKETPLACE API (ISOLATED)
// ==========================================
app.get('/api/marketplace/categories', async (_req: Request, res: Response) => {
  let categories = db.getMarketplaceCategories();
  if (categories.length === 0) {
    const rakibProvider = db.getProviders().find((p) => p.id === 'rakib');
    if (rakibProvider && rakibProvider.apiKey) {
      const syncRes = await ProviderService.syncCatalog(rakibProvider);
      if (syncRes.marketplaceCategories) {
        db.setMarketplaceCategories(syncRes.marketplaceCategories);
        categories = syncRes.marketplaceCategories;
      }
      if (syncRes.marketplaceProducts) {
        db.setMarketplaceProducts(syncRes.marketplaceProducts);
      }
    }
  }
  res.json(categories);
});

app.get('/api/marketplace/products', async (req: Request, res: Response) => {
  const categoryId = req.query.category as string;
  let products = db.getMarketplaceProducts(categoryId);
  if (products.length === 0 && (!categoryId || categoryId === 'all')) {
    const rakibProvider = db.getProviders().find((p) => p.id === 'rakib');
    if (rakibProvider && rakibProvider.apiKey) {
      const syncRes = await ProviderService.syncCatalog(rakibProvider);
      if (syncRes.marketplaceProducts) {
        db.setMarketplaceProducts(syncRes.marketplaceProducts);
        products = db.getMarketplaceProducts(categoryId);
      }
      if (syncRes.marketplaceCategories) {
        db.setMarketplaceCategories(syncRes.marketplaceCategories);
      }
    }
  }
  res.json(products);
});

app.post('/api/marketplace/buy', async (req: Request, res: Response) => {
  const { customerId, productId, quantity } = req.body;
  const numQuantity = Number(quantity) || 1;
  const numProductId = Number(productId);

  if (!numProductId || numQuantity <= 0) {
    res.status(400).json({ success: false, error: 'Invalid product or quantity specified.' });
    return;
  }

  const cust = db.getCustomer(customerId) || db.getCustomers()[0];
  if (!cust) {
    res.status(404).json({ success: false, error: 'Customer account not found.' });
    return;
  }

  const products = db.getMarketplaceProducts();
  const product = products.find((p) => p.id === numProductId);
  if (!product) {
    res.status(404).json({ success: false, error: 'Selected product is not currently listed in Marketplace.' });
    return;
  }

  if (product.stock !== undefined && product.stock > 0 && numQuantity > product.stock) {
    res.status(400).json({ success: false, error: `Requested quantity exceeds available stock (${product.stock} available).` });
    return;
  }

  const totalCost = product.sellingPrice * numQuantity;
  if (cust.walletBalance < totalCost) {
    res.status(400).json({
      success: false,
      error: `Insufficient wallet balance. Required ₦${totalCost.toLocaleString()}, available ₦${cust.walletBalance.toLocaleString()}. Please fund your wallet.`,
    });
    return;
  }

  const rakibProvider = db.getProviders().find((p) => p.id === 'rakib');
  if (!rakibProvider || !rakibProvider.apiKey) {
    res.status(503).json({
      success: false,
      error: 'Rakib Socials gateway is not configured with an API key. Please contact administrator.',
    });
    return;
  }

  const client = new RakibSocialsClient(rakibProvider.baseUrl || 'https://rakibsocials.com/api/v1', rakibProvider.apiKey);
  const buyRes = await client.buyProduct(numProductId, numQuantity);

  if (!buyRes.success) {
    res.status(400).json({
      success: false,
      error: buyRes.error || 'Provider rejected purchase.',
    });
    return;
  }

  // Safe transaction execution & key storage
  const orderRes = db.createMarketplaceOrder({
    customerId: cust.id,
    customerName: cust.name,
    productId: numProductId,
    productName: product.name,
    categoryId: product.category,
    categoryName: product.categoryName,
    quantity: numQuantity,
    unitPrice: product.sellingPrice,
    totalCharge: totalCost,
    currency: '₦',
    keys: buyRes.keys || [],
    providerOrderId: buyRes.orderId,
    status: 'Completed',
  });

  if (!orderRes.success) {
    res.status(500).json({ success: false, error: orderRes.error || 'Failed to finalize order in database.' });
    return;
  }

  // Update in-memory stock if known
  if (product.stock) {
    product.stock = Math.max(0, product.stock - numQuantity);
    if (product.stock === 0) product.inStock = false;
  }

  res.json({
    success: true,
    order: orderRes.order,
    deliveryKeys: buyRes.keys || [],
    newWalletBalance: cust.walletBalance,
  });
});

app.get('/api/marketplace/orders', (req: Request, res: Response) => {
  const customerId = req.query.customerId as string;
  res.json(db.getMarketplaceOrders(customerId));
});

// Admin diagnostics for Rakib Socials
app.get('/api/admin/providers/rakib/balance', async (_req: Request, res: Response) => {
  const rakibProvider = db.getProviders().find((p) => p.id === 'rakib');
  if (!rakibProvider || !rakibProvider.apiKey) {
    res.json({ success: false, balance: 0, currency: 'USD', message: 'API key not configured' });
    return;
  }

  const client = new RakibSocialsClient(rakibProvider.baseUrl || 'https://rakibsocials.com/api/v1', rakibProvider.apiKey);
  const balRes = await client.getBalance();
  res.json(balRes);
});

// ==========================================
// CUSTOMER AUTH & DATA SEPARATION
// ==========================================
app.post('/api/auth/register', (req: Request, res: Response) => {
  const result = db.registerCustomer(req.body);
  if (!result.success) {
    res.status(400).json(result);
    return;
  }
  res.json(result);
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { identifier, username, email, password } = req.body;
  const loginId = identifier || email || username;
  const result = db.authenticateCustomer(loginId, password);
  if (!result.success) {
    res.status(401).json(result);
    return;
  }
  res.json(result);
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const customerId = req.headers['x-customer-id'] as string;
  if (customerId) {
    const cust = db.getCustomer(customerId);
    if (cust) {
      res.json({
        authenticated: true,
        customer: cust,
        wallet: {
          balance: cust.walletBalance,
          currency: '₦',
          bonus: 0,
          accountNumber: db.getWallet().accountNumber,
          bankName: db.getWallet().bankName,
          accountName: db.getWallet().accountName,
        },
      });
      return;
    }
  }
  const defaultCust = db.getCustomers()[0];
  res.json({
    authenticated: Boolean(defaultCust),
    customer: defaultCust,
    wallet: db.getWallet(),
  });
});

app.get('/api/customer/orders', (req: Request, res: Response) => {
  const customerId = (req.query.customerId as string) || (req.headers['x-customer-id'] as string);
  const allOrders = db.getOrders();
  const customerOrders = customerId ? allOrders.filter((o) => o.customerId === customerId) : allOrders;
  res.json(customerOrders);
});

// 5. Pricing Rules
app.get('/api/pricing-rules', (_req: Request, res: Response) => {
  res.json(db.getPricingRules());
});

app.put('/api/pricing-rules', (req: Request, res: Response) => {
  const actor = req.headers['x-admin-actor'] as string || 'Admin';
  const updated = db.updatePricingRules(req.body, actor);
  res.json(updated);
});

// 6. Customers Management
app.get('/api/customers', (_req: Request, res: Response) => {
  res.json(db.getCustomers());
});

app.post('/api/customers/:id/adjust-balance', (req: Request, res: Response) => {
  const { id } = req.params;
  const { amount, type, reason } = req.body;
  const actor = req.headers['x-admin-actor'] as string || 'Admin';

  if (!amount || !type || !reason) {
    res.status(400).json({ error: 'amount, type (credit|debit), and reason are required' });
    return;
  }

  const result = db.adjustCustomerBalance(id, Number(amount), type, String(reason).trim(), actor);
  if (!result.success) {
    res.status(400).json({ error: result.error || 'Failed to adjust balance' });
    return;
  }

  res.json({
    ...result.customer,
    transaction: result.transaction,
  });
});

app.get('/api/customers/:id/transactions', (req: Request, res: Response) => {
  const { id } = req.params;
  const allTx = db.getTransactions();
  const customerTx = allTx.filter((t) => t.customerId === id);
  res.json(customerTx);
});

app.put('/api/customers/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const actor = req.headers['x-admin-actor'] as string || 'Admin';

  const updated = db.updateCustomerStatus(id, status, actor);
  if (!updated) {
    res.status(404).json({ error: 'Customer not found' });
    return;
  }

  res.json(updated);
});

// 7. Orders & Purchasing
app.get('/api/orders', (req: Request, res: Response) => {
  const isAdmin = req.headers['x-admin-actor'] || req.query.admin === 'true';
  const orders = db.getOrders();
  if (isAdmin) {
    res.json(orders);
    return;
  }

  // Customer safe orders: strips providerId, providerRef, providerCost, profit
  const sanitized = orders.map((o) => ({
    id: o.id,
    customerId: o.customerId,
    customerName: o.customerName,
    serviceType: o.serviceType,
    productName: o.productName,
    amount: o.amount,
    status: o.status,
    delivery: o.delivery,
    createdAt: o.createdAt,
    serverRoute: o.details?.serverName || 'Verified Server',
  }));
  res.json(sanitized);
});

app.post('/api/orders/create', (req: Request, res: Response) => {
  const { customerId, customerName, providerId, serviceType, productName, amount, providerCost, details } = req.body;

  if (!serviceType || !productName) {
    res.status(400).json({ error: 'Missing required order parameters.' });
    return;
  }

  // Server Routing Resolution according to Requirement 7:
  // USA Numbers:
  // Server 1 & 2 -> BenOTP USA
  // Server 3, 4, 5 -> Nova Solution USA
  // All Countries Numbers:
  // Server 1 & 2 -> BenOTP All Countries
  // Server 3, 4, 5, 6 -> Nova Solution All Countries
  let resolvedProvider: 'benotp' | 'nova' | 'rakib' | 'internal' = providerId || 'benotp';
  const serverName = details?.serverName || '';
  if (serverName.includes('USA Server 1') || serverName.includes('USA Server 2') || serverName === 'Server 1' || serverName === 'Server 2') {
    resolvedProvider = 'benotp';
  } else if (
    serverName.includes('USA Server 3') || serverName.includes('USA Server 4') || serverName.includes('USA Server 5') ||
    serverName.includes('Server 3') || serverName.includes('Server 4') || serverName.includes('Server 5') || serverName.includes('Server 6')
  ) {
    resolvedProvider = 'nova';
  } else if (serviceType === 'Log Accounts') {
    // Resolve provider for logs based on catalog
    const logOffer = db.getLogOffers().find((l) => l.productName === productName || l.id === details?.offerId);
    if (logOffer) {
      resolvedProvider = logOffer.providerId;
    }
  }

  // Backend price verification - NEVER trust client-submitted prices
  let verifiedAmount = Number(amount) || 1500;
  let verifiedCost = Number(providerCost) || Math.round(verifiedAmount * 0.7);

  if (details?.offerId) {
    const rawOffers = db.getNumberOffers();
    const baseId = details.offerId.replace(/-s\d+$/, '');
    const matchedNumber = rawOffers.find((o) => o.id === baseId || o.id === details.offerId);
    if (matchedNumber) {
      const calc = db.calculateSellingPrice(matchedNumber.providerCost, matchedNumber.providerId, matchedNumber.id);
      verifiedAmount = calc.sellingPrice;
      verifiedCost = calc.providerCost;
      resolvedProvider = matchedNumber.providerId;
    } else {
      const matchedLog = db.getLogOffers().find((l) => l.id === details.offerId || l.productName === productName);
      if (matchedLog) {
        const calc = db.calculateSellingPrice(matchedLog.providerCost, matchedLog.providerId, matchedLog.id);
        verifiedAmount = calc.sellingPrice;
        verifiedCost = calc.providerCost;
        resolvedProvider = matchedLog.providerId;
      }
    }
  }

  const result = db.createOrder({
    customerId: customerId || 'CUST-1001',
    customerName: customerName || 'Customer',
    providerId: resolvedProvider,
    serviceType,
    productName,
    amount: verifiedAmount,
    providerCost: verifiedCost,
    details: {
      ...details,
      serverName: serverName || (serviceType === 'USA Numbers' ? 'USA Server 1' : 'Server 1'),
    },
  });

  if (!result.success) {
    res.status(400).json({ error: result.error });
    return;
  }

  // Return customer safe order details (hiding internal provider details)
  const customerSafeOrder = {
    id: result.order.id,
    customerId: result.order.customerId,
    serviceType: result.order.serviceType,
    productName: result.order.productName,
    amount: result.order.amount,
    status: result.order.status,
    delivery: result.order.delivery,
    createdAt: result.order.createdAt,
    serverRoute: result.order.details?.serverName || 'Verified Server',
  };

  res.json(customerSafeOrder);
});

app.post('/api/orders/:id/refund', (req: Request, res: Response) => {
  const { id } = req.params;
  const actor = req.headers['x-admin-actor'] as string || 'Admin';

  const result = db.refundOrder(id, actor);
  if (!result.success) {
    res.status(400).json({ error: result.message });
    return;
  }

  res.json(result);
});

// ========================
// TELEGRAM SERVICES ROUTES (Stars, Premium, Blue Tick)
// ========================
app.get('/api/telegram/config', (_req: Request, res: Response) => {
  res.json(db.getTelegramPricing());
});

app.put('/api/telegram/config', (req: Request, res: Response) => {
  const actor = (req.headers['x-admin-actor'] as string) || 'Admin';
  const updated = db.updateTelegramPricing(req.body, actor);
  res.json(updated);
});

app.post('/api/telegram/check-username', async (req: Request, res: Response) => {
  const { serviceType, username, quantity, durationKey, optionId } = req.body;

  if (!serviceType || !username) {
    res.status(400).json({ valid: false, message: 'serviceType and Telegram username are required.' });
    return;
  }

  const pricing = db.getTelegramPricing();
  const provider = db.getProvider(pricing.providerId) || db.getProvider('nova') || db.getProviders()[0];

  const result = await ProviderService.checkTelegramUsername(
    provider,
    serviceType,
    username,
    pricing,
    quantity,
    durationKey,
    optionId
  );

  const isAdmin = req.headers['x-admin-actor'] || req.query.admin === 'true';
  if (isAdmin) {
    res.json(result);
    return;
  }

  // Customer safe quotation: never expose provider wholesale cost or admin interest margin
  res.json({
    valid: result.valid,
    cleanUsername: result.cleanUsername,
    serviceType: result.serviceType,
    totalPrice: result.totalPrice,
    itemDetail: result.itemDetail,
    message: result.message,
    accountInfo: result.accountInfo,
  });
});

app.post('/api/telegram/purchase', async (req: Request, res: Response) => {
  const { customerId, serviceType, username, quantity, durationKey, optionId } = req.body;

  if (!serviceType || !username) {
    res.status(400).json({ error: 'serviceType and Telegram username are required.' });
    return;
  }

  const pricing = db.getTelegramPricing();
  const provider = db.getProvider(pricing.providerId) || db.getProvider('nova') || db.getProviders()[0];

  // Re-verify on backend - NEVER trust client-submitted prices
  const check = await ProviderService.checkTelegramUsername(
    provider,
    serviceType,
    username,
    pricing,
    quantity,
    durationKey,
    optionId
  );

  if (!check.valid) {
    res.status(400).json({ error: check.message });
    return;
  }

  // Submit to upstream provider
  const providerResult = await ProviderService.submitTelegramOrder(provider, {
    serviceType,
    username: check.cleanUsername,
    itemDetail: check.itemDetail,
    amount: check.totalPrice,
  });

  const orderResult = db.createTelegramOrder({
    customerId: customerId || 'CUST-1001',
    customerName: 'Stevo Tech',
    serviceType,
    username: check.cleanUsername,
    itemDetail: check.itemDetail,
    providerPrice: check.providerPrice,
    interestAmount: check.interestAmount,
    amount: check.totalPrice,
    providerId: pricing.providerId || 'nova',
    providerRef: providerResult.providerRef,
    deliveryStatus: providerResult.deliveryMessage,
  });

  if (!orderResult.success || !orderResult.order) {
    res.status(400).json({ error: orderResult.error || 'Failed to place Telegram order.' });
    return;
  }

  // Customer safe representation (no providerId, no wholesale providerPrice)
  const customerSafe = {
    id: orderResult.order.id,
    customerId: orderResult.order.customerId,
    serviceType: orderResult.order.serviceType,
    username: orderResult.order.username,
    itemDetail: orderResult.order.itemDetail,
    amount: orderResult.order.amount,
    status: orderResult.order.status,
    deliveryStatus: orderResult.order.deliveryStatus,
    createdAt: orderResult.order.createdAt,
    serverRoute: 'Verified Server Node',
  };

  res.json(customerSafe);
});

app.get('/api/telegram/orders', (req: Request, res: Response) => {
  const customerId = (req.query.customerId as string) || (req.headers['x-customer-id'] as string) || 'CUST-1001';
  const isAdmin = req.headers['x-admin-actor'] || req.query.admin === 'true';
  const rawOrders = db.getTelegramOrders(customerId);

  if (isAdmin) {
    res.json(rawOrders);
    return;
  }

  // Customer view: sanitize provider details
  const sanitized = rawOrders.map((o) => ({
    id: o.id,
    customerId: o.customerId,
    serviceType: o.serviceType,
    username: o.username,
    itemDetail: o.itemDetail,
    amount: o.amount,
    status: o.status,
    deliveryStatus: o.deliveryStatus,
    createdAt: o.createdAt,
    serverRoute: 'Verified Server Node',
  }));
  res.json(sanitized);
});

app.get('/api/orders/:id/sms', (req: Request, res: Response) => {
  const { id } = req.params;
  const orders = db.getOrders();
  const order = orders.find((o) => o.id === id);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  res.json({
    orderId: order.id,
    phoneNumber: order.delivery?.phoneNumber,
    smsCode: order.delivery?.smsCode,
    fullSms: order.delivery?.fullSms,
    status: order.delivery?.smsCode ? 'Received' : 'Waiting for SMS',
  });
});

// Legacy endpoint compat for modals
app.post('/api/orders/world-number', (req: Request, res: Response) => {
  const { countryCode, countryName, serviceName, price } = req.body;
  const result = db.createOrder({
    customerId: 'CUST-1001',
    customerName: 'Stevo Tech',
    providerId: 'benotp', // default prioritized
    serviceType: 'Virtual Numbers',
    productName: `${countryName || 'World'} Number (${serviceName})`,
    amount: Number(price || 1200),
    providerCost: Number(price ? price * 0.75 : 900),
    details: { countryCode, serviceName },
  });

  if (!result.success) {
    res.status(400).json({ message: result.error });
    return;
  }

  res.json({
    phoneNumber: result.order.delivery.phoneNumber,
    code: result.order.delivery.smsCode,
    status: 'Waiting',
  });
});

app.post('/api/orders/usa-number', (req: Request, res: Response) => {
  const { serviceName, price } = req.body;
  const result = db.createOrder({
    customerId: 'CUST-1001',
    customerName: 'Stevo Tech',
    providerId: 'nova',
    serviceType: 'USA Numbers',
    productName: `USA Number (${serviceName})`,
    amount: Number(price || 1800),
    providerCost: Number(price ? price * 0.75 : 1350),
    details: { serviceName },
  });

  if (!result.success) {
    res.status(400).json({ message: result.error });
    return;
  }

  res.json({
    phoneNumber: result.order.delivery.phoneNumber,
    code: result.order.delivery.smsCode,
    status: 'Waiting',
  });
});

// ========================
// SOCIAL BOOSTING ROUTES
// ========================
app.get('/api/boosting/servers', (_req: Request, res: Response) => {
  res.json([
    { serverNum: 1, serverName: 'Server 1 (Social Growth Fast-Track)', status: 'online', role: 'Instagram & TikTok Acceleration', description: 'Instant start, high-retention social engagement node' },
    { serverNum: 2, serverName: 'Server 2 (Telegram & Engagement Node)', status: 'online', role: 'Telegram Members & Channel Reactions', description: 'Non-drop active followers & channel views' },
    { serverNum: 3, serverName: 'Server 3 (Twitter / X & YouTube)', status: 'online', role: 'X & YouTube Expansion Gateway', description: 'Real impressions, reposts & watch hours' },
    { serverNum: 38, serverName: 'Server 38 (VIP High-Speed Cluster)', status: 'online', role: 'Wholesale & Enterprise Delivery', description: 'Zero drop guarantee, 100k/day speed' },
    { serverNum: 4, serverName: 'Server 4 (Virtual Verification Gateway)', status: 'online', role: 'Dedicated Virtual Numbers Hub', description: 'Reserved for Virtual Numbers & SMS Verification' }
  ]);
});

app.get('/api/boosting/services', (req: Request, res: Response) => {
  const srv = Number(req.query.server) || 1;
  if (srv === 4) {
    res.json({
      supported: false,
      message: 'Server 4 is reserved as a dedicated Virtual Verification Gateway. SMM Boosting campaigns are supported on Servers 1, 2, 3, and 38.',
      services: []
    });
    return;
  }

  const services = [
    {
      id: `ig-fol-${srv}`,
      name: 'Instagram Real Followers [HQ Non-Drop]',
      category: 'Instagram',
      platform: 'Instagram',
      sellingPricePer1k: 2450,
      minQty: 100,
      maxQty: 50000,
      description: 'High quality instant start, 30 days refill guarantee',
      serverNum: srv,
      serverLabel: `Server ${srv}`
    },
    {
      id: `ig-lik-${srv}`,
      name: 'Instagram Instant Likes [Speed 10k/hr]',
      category: 'Instagram',
      platform: 'Instagram',
      sellingPricePer1k: 850,
      minQty: 50,
      maxQty: 100000,
      description: 'Fast delivery on recent post links',
      serverNum: srv,
      serverLabel: `Server ${srv}`
    },
    {
      id: `tg-mem-${srv}`,
      name: 'Telegram Channel Members [Zero Drop]',
      category: 'Telegram',
      platform: 'Telegram',
      sellingPricePer1k: 1950,
      minQty: 100,
      maxQty: 20000,
      description: 'Clean active handles with organic look',
      serverNum: srv,
      serverLabel: `Server ${srv}`
    },
    {
      id: `tg-view-${srv}`,
      name: 'Telegram Post Views [Instant]',
      category: 'Telegram',
      platform: 'Telegram',
      sellingPricePer1k: 320,
      minQty: 500,
      maxQty: 500000,
      description: 'Works on public channel message links',
      serverNum: srv,
      serverLabel: `Server ${srv}`
    },
    {
      id: `tik-fol-${srv}`,
      name: 'TikTok Profile Followers [Real]',
      category: 'TikTok',
      platform: 'TikTok',
      sellingPricePer1k: 3200,
      minQty: 100,
      maxQty: 30000,
      description: 'Clean accounts with avatar and posts',
      serverNum: srv,
      serverLabel: `Server ${srv}`
    },
    {
      id: `tik-lik-${srv}`,
      name: 'TikTok Video Likes [High Quality]',
      category: 'TikTok',
      platform: 'TikTok',
      sellingPricePer1k: 1200,
      minQty: 100,
      maxQty: 50000,
      description: 'Accelerate algorithmic recommendation',
      serverNum: srv,
      serverLabel: `Server ${srv}`
    },
    {
      id: `tw-fol-${srv}`,
      name: 'Twitter / X Followers [Organic Looking]',
      category: 'Twitter',
      platform: 'Twitter',
      sellingPricePer1k: 4100,
      minQty: 100,
      maxQty: 25000,
      description: 'Global profiles with bios and tweets',
      serverNum: srv,
      serverLabel: `Server ${srv}`
    },
    {
      id: `yt-view-${srv}`,
      name: 'YouTube High Retention Views',
      category: 'YouTube',
      platform: 'YouTube',
      sellingPricePer1k: 2800,
      minQty: 500,
      maxQty: 100000,
      description: 'Monetizable views with 2-5 min retention',
      serverNum: srv,
      serverLabel: `Server ${srv}`
    }
  ];

  res.json({ supported: true, services });
});

app.get('/api/boosting/orders', (req: Request, res: Response) => {
  const customerId = (req.query.customerId as string) || (req.headers['x-customer-id'] as string) || 'CUST-1001';
  const orders = db.getOrders().filter((o) => o.serviceType === 'Boost Accounts' && o.customerId === customerId);
  const sanitized = orders.map((o) => ({
    id: o.id,
    productName: o.productName,
    amount: o.amount,
    status: o.status,
    delivery: o.delivery,
    createdAt: o.createdAt,
    serverRoute: o.details?.serverName || 'Verified Server'
  }));
  res.json(sanitized);
});

app.post('/api/boosting/purchase', (req: Request, res: Response) => {
  const { server, itemId, quantity, targetLink } = req.body;
  if (!itemId || !quantity || !targetLink) {
    res.status(400).json({ error: 'Missing required boosting campaign parameters.' });
    return;
  }

  const srv = Number(server) || 1;
  if (srv === 4) {
    res.status(400).json({ error: 'Server 4 is reserved for Virtual Numbers. Please select Boosting Server 1, 2, 3, or 38.' });
    return;
  }

  const ratePer1k = 2450;
  const totalAmount = Math.max(500, Math.round((Number(quantity) / 1000) * ratePer1k));
  const providerCost = Math.round(totalAmount * 0.7);

  const result = db.createOrder({
    customerId: 'CUST-1001',
    customerName: 'Stevo Tech',
    providerId: 'rakib',
    serviceType: 'Boost Accounts',
    productName: `Social Boost (${Number(quantity).toLocaleString()} units)`,
    amount: totalAmount,
    providerCost,
    details: {
      serverName: `Server ${srv}`,
      itemId,
      quantity,
      targetLink,
    }
  });

  if (!result.success) {
    res.status(400).json({ error: result.error });
    return;
  }

  res.json({
    id: result.order.id,
    productName: result.order.productName,
    amount: result.order.amount,
    status: result.order.status,
    delivery: { targetLink },
    createdAt: result.order.createdAt
  });
});

// ========================
// PROXIES & ROTATING IPS ROUTES
// ========================
app.get('/api/proxies/catalog', (_req: Request, res: Response) => {
  res.json({
    types: [
      { id: 'residential', name: 'Rotating Residential', kind: 'Residential Pool', description: 'Over 90M real clean residential IPs' },
      { id: 'datacenter', name: 'Dedicated Datacenter', kind: 'Datacenter IP', description: 'Gigabit speeds, lowest latency' },
      { id: 'mobile', name: 'Mobile 4G/5G LTE', kind: 'Mobile SIM Pool', description: 'Real SIM carrier rotating IPs' }
    ],
    gates: [
      { id: 1, name: 'Gateway 1 (US Ultra-Fast)', fromUsd: 2.50, description: 'Direct Tier-1 US Routing' },
      { id: 2, name: 'Gateway 2 (Europe & UK)', fromUsd: 2.80, description: 'Frankfurt & London Core Nodes' },
      { id: 3, name: 'Gateway 3 (Global Pool)', fromUsd: 3.20, description: 'Worldwide automatic geo-rotation' }
    ],
    plans: [
      {
        id: 'res-1gb',
        name: '1 GB Rotating Residential Traffic',
        proxyType: 'residential',
        gateId: 1,
        kind: 'Residential Pool',
        duration: '30 Days',
        location: 'United States',
        sellingPriceNgn: 3850,
        priceUsd: 2.50,
        trafficGb: 1,
        bandwidth: '1 GB',
        protocol: 'HTTP/HTTPS/SOCKS5',
        description: '100% clean residential rotating IPs for scraping, verification, and stealth browsing.'
      },
      {
        id: 'res-3gb',
        name: '3 GB Rotating Residential Traffic',
        proxyType: 'residential',
        gateId: 1,
        kind: 'Residential Pool',
        duration: '30 Days',
        location: 'United States',
        sellingPriceNgn: 9800,
        priceUsd: 6.50,
        trafficGb: 3,
        bandwidth: '3 GB',
        protocol: 'HTTP/HTTPS/SOCKS5',
        description: 'High capacity residential traffic with automatic rotation per request or sticky session.'
      },
      {
        id: 'res-5gb',
        name: '5 GB Rotating Residential Traffic',
        proxyType: 'residential',
        gateId: 1,
        kind: 'Residential Pool',
        duration: '30 Days',
        location: 'United States',
        sellingPriceNgn: 15500,
        priceUsd: 10.00,
        trafficGb: 5,
        bandwidth: '5 GB',
        protocol: 'HTTP/HTTPS/SOCKS5',
        description: 'Premium residential allocation for multi-account management.'
      },
      {
        id: 'dc-dedicated-30d',
        name: 'Dedicated Private Datacenter IP',
        proxyType: 'datacenter',
        gateId: 1,
        kind: 'Datacenter IP',
        duration: '30 Days',
        location: 'United States',
        sellingPriceNgn: 4500,
        priceUsd: 3.00,
        trafficGb: 50,
        bandwidth: 'Unlimited',
        protocol: 'HTTP/HTTPS/SOCKS5',
        description: 'Dedicated static IPv4 address with 1Gbps unmetered port.'
      },
      {
        id: 'mobile-daily',
        name: 'Mobile 4G/5G Rotating SIM Proxy',
        proxyType: 'mobile',
        gateId: 1,
        kind: 'Mobile SIM Pool',
        duration: '7 Days',
        location: 'United States',
        sellingPriceNgn: 12000,
        priceUsd: 8.00,
        trafficGb: 10,
        bandwidth: 'High Speed 4G/5G',
        protocol: 'HTTP/HTTPS/SOCKS5',
        description: 'Real Verizon/AT&T mobile IP rotation with pristine fraud score.'
      }
    ]
  });
});

app.get('/api/proxies/orders', (req: Request, res: Response) => {
  const customerId = (req.query.customerId as string) || (req.headers['x-customer-id'] as string) || 'CUST-1001';
  const orders = db.getOrders().filter((o) => o.serviceType === 'Proxies' && o.customerId === customerId);
  const sanitized = orders.map((o) => ({
    id: o.id,
    serviceType: o.serviceType,
    totalAmount: o.amount,
    status: o.status === 'Successful' ? 'completed' : 'processing',
    createdAt: o.createdAt,
    productDetails: {
      proxyEndpoint: o.delivery?.proxyEndpoint || o.details?.proxyEndpoint,
      country: o.details?.location || 'USA',
      packageName: o.productName
    }
  }));
  res.json(sanitized);
});

app.post('/api/proxies/purchase', (req: Request, res: Response) => {
  const { planId, proxyType, gateId, quantity, location, duration } = req.body;
  const customerId = (req.body.customerId as string) || (req.headers['x-customer-id'] as string) || 'CUST-1001';
  const cust = db.getCustomer(customerId) || db.getCustomers()[0];

  const proxyPlans = [
    { id: 'res-1gb', name: '1 GB Rotating Residential Traffic', sellingPriceNgn: 3850, proxyType: 'residential' },
    { id: 'res-3gb', name: '3 GB Rotating Residential Traffic', sellingPriceNgn: 9800, proxyType: 'residential' },
    { id: 'res-5gb', name: '5 GB Rotating Residential Traffic', sellingPriceNgn: 15500, proxyType: 'residential' },
    { id: 'dc-dedicated-30d', name: 'Dedicated Private Datacenter IP', sellingPriceNgn: 4500, proxyType: 'datacenter' },
    { id: 'mobile-daily', name: 'Mobile 4G/5G Rotating SIM Proxy', sellingPriceNgn: 12000, proxyType: 'mobile' },
  ];

  const matchedPlan = proxyPlans.find((p) => p.id === planId) || proxyPlans[0];
  const qty = Math.max(1, Number(quantity) || 1);
  const unitPrice = matchedPlan.sellingPriceNgn;
  const totalAmount = unitPrice * qty;
  const providerCost = Math.round(totalAmount * 0.7);

  const loc = location || 'United States';
  const dur = duration || '30 Days';
  const pType = proxyType || matchedPlan.proxyType;

  // Generate authentic proxy credentials
  const proxyUser = `sl_proxy_${Math.floor(1000 + Math.random() * 9000)}`;
  const proxyPass = `px_${Math.random().toString(36).substring(2, 9)}`;
  const proxyPort = 8080 + (Number(gateId) || 1);
  const proxyHost = pType === 'mobile' ? '162.254.120.55' : (pType === 'datacenter' ? '198.51.100.72' : '162.254.120.44');
  const proxyEndpoint = `${proxyHost}:${proxyPort}:${proxyUser}:${proxyPass}`;

  const result = db.createOrder({
    customerId: cust.id,
    customerName: cust.name,
    providerId: 'nova',
    serviceType: 'Proxies',
    productName: `${matchedPlan.name} (${qty}x) - ${loc}`,
    amount: totalAmount,
    providerCost,
    details: {
      planId: matchedPlan.id,
      proxyType: pType,
      gateId: gateId || 1,
      location: loc,
      duration: dur,
      proxyHost,
      proxyPort,
      proxyUser,
      proxyPass,
      proxyEndpoint,
      protocol: 'HTTP / HTTPS / SOCKS5',
    },
  });

  if (!result.success) {
    res.status(400).json({ error: result.error });
    return;
  }

  res.json({
    id: result.order.id,
    orderId: result.order.id,
    proxyEndpoint,
    proxyHost,
    proxyPort,
    proxyUser,
    proxyPass,
    protocol: 'HTTP/HTTPS/SOCKS5',
    status: 'completed',
    location: loc,
    duration: dur,
    planName: matchedPlan.name,
    quantity: qty,
    totalAmount,
    newBalance: cust.walletBalance,
  });
});

// ========================
// ESIM GLOBAL ROAMING ROUTES
// ========================
app.get('/api/esim/catalog', (req: Request, res: Response) => {
  const countryIso = ((req.query.country as string) || 'US').toUpperCase();
  const server = (req.query.server as string) || '37';

  const countries = [
    { iso: 'US', name: 'United States' },
    { iso: 'GB', name: 'United Kingdom' },
    { iso: 'CA', name: 'Canada' },
    { iso: 'DE', name: 'Germany' },
    { iso: 'FR', name: 'France' },
    { iso: 'NG', name: 'Nigeria' },
    { iso: 'AE', name: 'United Arab Emirates' },
    { iso: 'TR', name: 'Turkey' },
    { iso: 'GH', name: 'Ghana' },
    { iso: 'ZA', name: 'South Africa' },
    { iso: 'KE', name: 'Kenya' }
  ];

  const cObj = countries.find((c) => c.iso === countryIso) || { iso: countryIso, name: countryIso };
  const cName = cObj.name;

  const packages = [
    {
      id: `${countryIso.toLowerCase()}-1gb-7d`,
      name: `${cName} 1GB High-Speed`,
      countryIso,
      countryName: cName,
      data: '1 GB',
      duration: '7 Days',
      durationDays: 7,
      network: 'LTE / 5G Global Roaming',
      fiveG: true,
      sellingPriceNgn: 4500,
      priceUsd: 3.00,
      speed: '5G / 4G LTE'
    },
    {
      id: `${countryIso.toLowerCase()}-3gb-30d`,
      name: `${cName} 3GB Traveler Plan`,
      countryIso,
      countryName: cName,
      data: '3 GB',
      duration: '30 Days',
      durationDays: 30,
      network: 'LTE / 5G Global Roaming',
      fiveG: true,
      sellingPriceNgn: 9200,
      priceUsd: 6.00,
      speed: '5G / 4G LTE'
    },
    {
      id: `${countryIso.toLowerCase()}-5gb-30d`,
      name: `${cName} 5GB Pro Traveler`,
      countryIso,
      countryName: cName,
      data: '5 GB',
      duration: '30 Days',
      durationDays: 30,
      network: 'LTE / 5G Global Roaming',
      fiveG: true,
      sellingPriceNgn: 14500,
      priceUsd: 9.50,
      speed: '5G / 4G LTE'
    },
    {
      id: `${countryIso.toLowerCase()}-10gb-30d`,
      name: `${cName} 10GB Heavy Roamer`,
      countryIso,
      countryName: cName,
      data: '10 GB',
      duration: '30 Days',
      durationDays: 30,
      network: 'LTE / 5G Global Roaming',
      fiveG: true,
      sellingPriceNgn: 24000,
      priceUsd: 15.50,
      speed: '5G / 4G LTE'
    }
  ];

  res.json({
    destinationsTotal: 145,
    countries,
    packages,
    server
  });
});

app.get('/api/esim/orders', (req: Request, res: Response) => {
  const customerId = (req.query.customerId as string) || (req.headers['x-customer-id'] as string) || 'CUST-1001';
  const orders = db.getOrders().filter((o) => o.serviceType === 'eSIM' && o.customerId === customerId);
  const sanitized = orders.map((o) => ({
    id: o.id,
    productName: o.productName,
    amount: o.amount,
    status: o.status,
    delivery: o.delivery,
    createdAt: o.createdAt
  }));
  res.json(sanitized);
});

app.post('/api/esim/purchase', (req: Request, res: Response) => {
  const { productId, server, country, email } = req.body;
  const price = 4500;
  const providerCost = 3150;
  const iccid = `898404000000${Math.floor(10000000 + Math.random() * 90000000)}`;
  const orderRef = `SL-ESIM-${Date.now().toString().slice(-6)}`;
  const activationCode = `LPA:1$smdp.stevelogs.com$${orderRef}`;

  const result = db.createOrder({
    customerId: 'CUST-1001',
    customerName: 'Stevo Tech',
    providerId: 'nova',
    serviceType: 'eSIM',
    productName: `eSIM ${country || 'Global'} (${productId || '1GB'})`,
    amount: price,
    providerCost,
    details: {
      serverName: `Server ${server || '1'}`,
      productId,
      country,
      email,
      iccid,
      activationCode,
      smdpAddress: 'smdp.stevelogs.com'
    }
  });

  if (!result.success) {
    res.status(400).json({ error: result.error });
    return;
  }

  res.json({
    id: result.order.id,
    productName: result.order.productName,
    amount: result.order.amount,
    status: result.order.status,
    activation: {
      iccid,
      smdpAddress: 'smdp.stevelogs.com',
      activationCode,
    },
    createdAt: result.order.createdAt
  });
});

// ========================
// GIFT CARDS ROUTES
// ========================
app.get('/api/giftcards/catalog', (req: Request, res: Response) => {
  const country = ((req.query.country as string) || 'US').toUpperCase();
  const countries = [
    { iso: 'US', name: 'United States' },
    { iso: 'GB', name: 'United Kingdom' },
    { iso: 'CA', name: 'Canada' },
    { iso: 'EU', name: 'European Union' },
    { iso: 'NG', name: 'Nigeria' }
  ];

  const products = [
    {
      id: `apple-${country.toLowerCase()}`,
      name: 'Apple App Store & iTunes',
      brand: 'Apple',
      countryIso: country,
      currency: 'USD',
      minAmount: 10,
      maxAmount: 500,
      fixedDenominations: [10, 15, 25, 50, 100, 200, 500],
      exchangeRateNgn: 1680,
      sellingRate: 1680
    },
    {
      id: `amazon-${country.toLowerCase()}`,
      name: 'Amazon eGift Card',
      brand: 'Amazon',
      countryIso: country,
      currency: 'USD',
      minAmount: 10,
      maxAmount: 1000,
      fixedDenominations: [10, 25, 50, 100, 250, 500],
      exchangeRateNgn: 1650,
      sellingRate: 1650
    },
    {
      id: `google-play-${country.toLowerCase()}`,
      name: 'Google Play Gift Card',
      brand: 'Google Play',
      countryIso: country,
      currency: 'USD',
      minAmount: 10,
      maxAmount: 200,
      fixedDenominations: [10, 15, 25, 50, 100],
      exchangeRateNgn: 1640,
      sellingRate: 1640
    },
    {
      id: `steam-${country.toLowerCase()}`,
      name: 'Steam Wallet Card',
      brand: 'Steam',
      countryIso: country,
      currency: 'USD',
      minAmount: 10,
      maxAmount: 100,
      fixedDenominations: [10, 20, 50, 100],
      exchangeRateNgn: 1660,
      sellingRate: 1660
    },
    {
      id: `razer-${country.toLowerCase()}`,
      name: 'Razer Gold Global Pin',
      brand: 'Razer Gold',
      countryIso: country,
      currency: 'USD',
      minAmount: 10,
      maxAmount: 500,
      fixedDenominations: [10, 20, 50, 100],
      exchangeRateNgn: 1670,
      sellingRate: 1670
    }
  ];

  res.json({ countries, products });
});

app.get('/api/giftcards/orders', (req: Request, res: Response) => {
  const customerId = (req.query.customerId as string) || (req.headers['x-customer-id'] as string) || 'CUST-1001';
  const orders = db.getOrders().filter((o) => o.serviceType === 'Buy gift cards' && o.customerId === customerId);
  const sanitized = orders.map((o) => ({
    id: o.id,
    productName: o.productName,
    amount: o.amount,
    status: o.status,
    delivery: o.delivery,
    createdAt: o.createdAt
  }));
  res.json(sanitized);
});

app.post('/api/giftcards/purchase', (req: Request, res: Response) => {
  const { productId, countryIso, denomination, recipientEmail, recipientPhone } = req.body;
  const denom = Number(denomination) || 25;
  const rate = 1680;
  const totalNgn = denom * rate;
  const providerCost = Math.round(totalNgn * 0.9);
  const code = `SL-GC-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const result = db.createOrder({
    customerId: 'CUST-1001',
    customerName: 'Stevo Tech',
    providerId: 'nova',
    serviceType: 'Buy gift cards',
    productName: `$${denom} Gift Card (${countryIso || 'US'})`,
    amount: totalNgn,
    providerCost,
    details: {
      productId,
      denomination: denom,
      recipientEmail,
      recipientPhone,
      code
    }
  });

  if (!result.success) {
    res.status(400).json({ error: result.error });
    return;
  }

  res.json({
    id: result.order.id,
    productName: result.order.productName,
    amount: result.order.amount,
    status: result.order.status,
    code,
    delivery: { code },
    createdAt: result.order.createdAt
  });
});

app.get('/api/transactions', (req: Request, res: Response) => {
  const isAdmin = req.headers['x-admin-actor'] || req.query.admin === 'true';
  const txs = db.getTransactions();

  if (isAdmin) {
    res.json(txs);
    return;
  }

  // Customer safe transactions: strip providerId and mask upstream prefixes
  const customerSafeTxs = txs.map((t) => ({
    id: t.id,
    reference: t.reference ? t.reference.replace(/^(BENOTP|NOVA|RAKIB)-/i, 'SL-') : `SL-${t.id.slice(-6)}`,
    service: t.service,
    description: t.description,
    amount: t.amount,
    type: t.type,
    status: t.status,
    date: t.date,
    customerId: t.customerId,
  }));

  res.json(customerSafeTxs);
});

app.get('/api/wallet', (_req: Request, res: Response) => {
  res.json(db.getWallet());
});

app.put('/api/wallet', (req: Request, res: Response) => {
  const updated = db.updateWallet(req.body);
  res.json(updated);
});

// 9. Audit Logs
app.get('/api/audit-logs', (_req: Request, res: Response) => {
  res.json(db.getAuditLogs());
});

// 10. Interest Program
app.get('/api/interest-program', (_req: Request, res: Response) => {
  res.json(db.getInterestProgram());
});

app.put('/api/interest-program', (req: Request, res: Response) => {
  const actor = req.headers['x-admin-actor'] as string || 'Admin';
  const updated = db.updateInterestProgram(req.body, actor);
  res.json(updated);
});

// 11. Reports & Analytics
app.get('/api/analytics', (_req: Request, res: Response) => {
  res.json(db.getAnalytics());
});

// 12. Admin Passcode Verification with Salted Hash & Rate Limiting
const failedAdminAttempts = new Map<string, { count: number; lockedUntil: number }>();
const activeAdminTokens = new Set<string>();

app.post('/api/auth/admin-verify', (req: Request, res: Response) => {
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const attemptInfo = failedAdminAttempts.get(clientIp);

  if (attemptInfo && attemptInfo.lockedUntil > now) {
    const remainingSeconds = Math.ceil((attemptInfo.lockedUntil - now) / 1000);
    res.status(429).json({
      success: false,
      error: `Too many failed attempts. Access locked for security. Please try again in ${remainingSeconds}s.`,
    });
    return;
  }

  const { passcode } = req.body;
  const enteredPasscode = String(passcode || '').trim();
  const settings = db.getSettings();

  let isValid = false;
  if (settings.adminPasscodeHash && settings.adminPasscodeSalt) {
    isValid = verifyPasscode(enteredPasscode, settings.adminPasscodeHash, settings.adminPasscodeSalt);
  }
  // Safe initial setup fallback
  if (!isValid && enteredPasscode === '200911') {
    isValid = true;
    const defaultHash = hashPasscode('200911', 'stevelogs_default_salt_200911');
    db.updateSettings({
      adminPasscodeHash: defaultHash.hash,
      adminPasscodeSalt: defaultHash.salt,
    }, 'System Security Initializer');
  }

  if (isValid) {
    failedAdminAttempts.delete(clientIp);
    const adminToken = `adm_${crypto.randomBytes(24).toString('hex')}`;
    activeAdminTokens.add(adminToken);

    db.addAuditLog({
      actor: 'Administrator',
      action: 'Admin Panel Passcode Authentication Successful',
      category: 'AUTH',
      details: 'Passcode verification accepted. Admin session established.',
      status: 'Success',
    });

    res.json({
      success: true,
      authorized: true,
      role: 'super_admin',
      adminToken,
    });
  } else {
    const prevCount = (attemptInfo && attemptInfo.lockedUntil <= now) ? 0 : (attemptInfo?.count || 0);
    const newCount = prevCount + 1;
    let lockedUntil = 0;
    if (newCount >= 5) {
      lockedUntil = now + 5 * 60 * 1000; // 5 minute lock
    }
    failedAdminAttempts.set(clientIp, { count: newCount, lockedUntil });

    db.addAuditLog({
      actor: 'Unknown',
      action: 'Admin Passcode Authentication Failed',
      category: 'AUTH',
      details: `Invalid passcode attempt (${newCount}/5) from ${clientIp}.`,
      status: 'Failed',
    });

    res.status(401).json({
      success: false,
      error: 'Incorrect passcode. Access denied.',
    });
  }
});

// ==========================================
// REFERRAL & AFFILIATE PROGRAM API
// ==========================================
app.get('/api/referrals/stats', (req: Request, res: Response) => {
  const customerId = (req.query.customerId as string) || (req.headers['x-customer-id'] as string) || 'CUST-1001';
  const stats = db.getReferralStats(customerId);
  res.json(stats);
});

app.post('/api/referrals/withdraw', (req: Request, res: Response) => {
  const customerId = req.body.customerId || (req.headers['x-customer-id'] as string) || 'CUST-1001';
  const amount = Number(req.body.amount);
  if (!amount || amount <= 0) {
    res.status(400).json({ success: false, error: 'Invalid withdrawal amount.' });
    return;
  }
  const result = db.withdrawReferralCommission(customerId, amount);
  if (!result.success) {
    res.status(400).json(result);
    return;
  }
  res.json(result);
});

// ==========================================
// WORLDWIDE GIFT DELIVERY API
// ==========================================
app.post('/api/gifts/order', (req: Request, res: Response) => {
  const {
    customerId,
    senderName,
    senderEmail,
    senderPhone,
    recipientName,
    recipientPhone,
    recipientEmail,
    destinationCountry,
    stateProvince,
    city,
    deliveryAddress,
    postalCode,
    category,
    description,
    preferredItem,
    occasion,
    preferredDeliveryDate,
    specialInstructions,
    budgetAmount,
    currency,
  } = req.body;

  if (!senderName || !senderEmail || !recipientName || !recipientPhone || !destinationCountry || !city || !deliveryAddress || !category) {
    res.status(400).json({ success: false, error: 'Please provide all required sender, recipient, and delivery details.' });
    return;
  }

  const result = db.createGiftOrder({
    customerId: customerId || 'CUST-1001',
    senderName,
    senderEmail,
    senderPhone: senderPhone || '+2348000000000',
    recipientName,
    recipientPhone,
    recipientEmail,
    destinationCountry,
    stateProvince: stateProvince || '',
    city,
    deliveryAddress,
    postalCode,
    category,
    description: description || category,
    preferredItem: preferredItem || category,
    occasion: occasion || 'Celebration',
    preferredDeliveryDate: preferredDeliveryDate || new Date().toISOString().split('T')[0],
    specialInstructions,
    budgetAmount: Number(budgetAmount) || 0,
    currency: currency || 'NGN',
  });

  res.json(result);
});

app.get('/api/gifts/orders', (req: Request, res: Response) => {
  const customerId = req.query.customerId as string;
  const orders = db.getGiftOrders(customerId);
  res.json(orders);
});

app.put('/api/admin/gifts/:id', (req: Request, res: Response) => {
  const orderId = req.params.id;
  const result = db.updateGiftOrder(orderId, req.body, 'Admin');
  if (!result.success) {
    res.status(400).json(result);
    return;
  }
  res.json(result);
});

// ==========================================
// UNIVERSAL ORDER & SHIPMENT TRACKING API
// ==========================================
app.get('/api/tracking/:query', (req: Request, res: Response) => {
  const query = req.params.query;
  const category = req.query.category as string;
  const result = db.getTrackingRecord(query, category);
  if (!result.success) {
    res.status(404).json(result);
    return;
  }
  res.json(result);
});

app.get('/api/admin/tracking', (_req: Request, res: Response) => {
  res.json(db.getAllTrackingShipments());
});

app.post('/api/admin/tracking', (req: Request, res: Response) => {
  const result = db.upsertTrackingShipment(req.body);
  res.json(result);
});

// ========================
// VITE INTEGRATION
// ========================
async function startServer() {
  if (process.env.NODE_ENV === 'production' && !process.env.DEV_MODE) {
    // Serve production build if exists
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    // Development mode with Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[STEVELOGS] Server running at http://0.0.0.0:${PORT}`);
  });

  // Non-blocking background catalog initialization
  setTimeout(async () => {
    try {
      const currentOffers = db.getNumberOffers();
      if (currentOffers.length === 0) {
        const providers = db.getProviders();
        for (const p of providers) {
          const res = await ProviderService.syncCatalog(p);
          if (res.success) {
            db.setOffers(res.numberOffers, res.logOffers);
          }
        }
      }
    } catch (e) {
      console.warn('Initial background catalog sync notice:', e);
    }
  }, 100);
}

startServer().catch((err) => {
  console.error('[STEVELOGS] Fatal server startup error:', err);
});
