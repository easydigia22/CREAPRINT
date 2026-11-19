import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  INITIAL_ACTIVITY,
  INITIAL_CATEGORIES,
  INITIAL_FILES,
  INITIAL_GALLERY,
  INITIAL_LEADS,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_QUOTES,
  INITIAL_SETTINGS,
  INITIAL_TEAM,
  INITIAL_TESTIMONIALS,
} from '@/src/data/seedData';
import type {
  ActivityLog,
  FileReviewStatus,
  GalleryItem,
  Lead,
  LeadSource,
  LeadStatus,
  Order,
  OrderStatus,
  PaymentStatus,
  Product,
  ProductCategory,
  Profile,
  Quote,
  QuoteStatus,
  SiteSettings,
  Testimonial,
  UploadedFileRecord,
  UserRole,
} from '@/src/types/creaprint';
import { calculateQuoteTotals } from '@/src/lib/pdfGenerator';
import { generateReference } from '@/src/lib/utils';

const STORAGE_KEY = 'creaprint_marrakech_store_v1';

interface UtmData {
  source: LeadSource;
  medium?: string;
  campaign?: string;
}

interface PersistedState {
  settings: SiteSettings;
  categories: ProductCategory[];
  products: Product[];
  gallery: GalleryItem[];
  testimonials: Testimonial[];
  team: Profile[];
  leads: Lead[];
  quotes: Quote[];
  orders: Order[];
  files: UploadedFileRecord[];
  activity: ActivityLog[];
}

interface StoreContextValue extends PersistedState {
  utm: UtmData;
  currentUser: Profile | null;
  loginAsRole: (role: UserRole, customProfile?: Partial<Profile>) => void;
  loginByEmail: (email: string, fullName?: string, phone?: string, company?: string) => Profile;
  logout: () => void;
  // Lead / Quote request submission
  submitQuoteRequest: (payload: {
    productName: string;
    fullName: string;
    company?: string;
    phone: string;
    email?: string;
    city: string;
    comment?: string;
    estimatedPrice?: number;
    quantity: number;
    configSummary: Record<string, string | number | boolean>;
    file?: { name: string; type: string; size: number; previewUrl?: string };
  }) => { lead: Lead; quote: Quote };
  submitContactLead: (payload: {
    fullName: string;
    phone: string;
    email?: string;
    subject: string;
    message: string;
  }) => Lead;
  // CRM
  updateLeadStatus: (leadId: string, status: LeadStatus) => void;
  addLeadNote: (leadId: string, text: string, followUpDate?: string) => void;
  addLeadTag: (leadId: string, tag: string) => void;
  // Quotes
  createQuote: (quote: Omit<Quote, 'id' | 'createdAt'>) => Quote;
  updateQuote: (quoteId: string, patch: Partial<Quote>) => void;
  duplicateQuote: (quoteId: string) => Quote | null;
  convertQuoteToOrder: (quoteId: string) => Order | null;
  // Orders
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateOrderDetails: (
    orderId: string,
    patch: Partial<Pick<Order, 'assignedTo' | 'estimatedDeliveryDate' | 'amountPaid' | 'paymentStatus'>>
  ) => void;
  addOrderInternalNote: (orderId: string, note: string) => void;
  addOrderMessage: (orderId: string, senderRole: 'client' | 'equipe', senderName: string, content: string) => void;
  // Files
  addUploadedFile: (file: Omit<UploadedFileRecord, 'id' | 'uploadedAt'>) => UploadedFileRecord;
  updateFileStatus: (fileId: string, status: FileReviewStatus, reviewNote?: string) => void;
  // Products & Categories
  upsertProduct: (product: Product) => void;
  toggleProductActive: (productId: string) => void;
  addCategory: (category: Omit<ProductCategory, 'id'>) => void;
  // Gallery
  upsertGalleryItem: (item: GalleryItem) => void;
  deleteGalleryItem: (itemId: string) => void;
  // Settings & Team
  updateSettings: (patch: Partial<SiteSettings>) => void;
  addTeamMember: (member: Omit<Profile, 'id' | 'createdAt'>) => void;
  updateTeamRole: (memberId: string, role: UserRole) => void;
}

const DEFAULT_STATE: PersistedState = {
  settings: INITIAL_SETTINGS,
  categories: INITIAL_CATEGORIES,
  products: INITIAL_PRODUCTS,
  gallery: INITIAL_GALLERY,
  testimonials: INITIAL_TESTIMONIALS,
  team: INITIAL_TEAM,
  leads: INITIAL_LEADS,
  quotes: INITIAL_QUOTES,
  orders: INITIAL_ORDERS,
  files: INITIAL_FILES,
  activity: INITIAL_ACTIVITY,
};

function detectUtmSource(): UtmData {
  try {
    const params = new URLSearchParams(window.location.search);
    const raw = (params.get('utm_source') || '').toLowerCase();
    let source: LeadSource = 'site';
    if (raw.includes('insta')) source = 'instagram';
    else if (raw.includes('fb') || raw.includes('face')) source = 'facebook';
    else if (raw.includes('google') || raw.includes('gads')) source = 'google';
    else if (raw.includes('whats')) source = 'whatsapp';

    return {
      source,
      medium: params.get('utm_medium') || undefined,
      campaign: params.get('utm_campaign') || undefined,
    };
  } catch {
    return { source: 'site' };
  }
}

function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      ...DEFAULT_STATE,
      ...parsed,
      settings: { ...INITIAL_SETTINGS, ...(parsed.settings || {}) },
    };
  } catch {
    return DEFAULT_STATE;
  }
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(() => loadState());
  const [utm] = useState<UtmData>(() => detectUtmSource());
  const [currentUser, setCurrentUser] = useState<Profile | null>(() => {
    try {
      const saved = localStorage.getItem('creaprint_current_user');
      return saved ? (JSON.parse(saved) as Profile) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota errors if preview data URLs are large
    }
  }, [state]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('creaprint_current_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('creaprint_current_user');
      }
    } catch {
      // ignore
    }
  }, [currentUser]);

  const appendActivity = (actor: string, action: string, target: string) => {
    const log: ActivityLog = {
      id: `act-${Date.now()}`,
      actor,
      action,
      target,
      timestamp: new Date().toISOString(),
    };
    setState((prev) => ({ ...prev, activity: [log, ...prev.activity].slice(0, 40) }));
  };

  const loginAsRole = (role: UserRole, customProfile?: Partial<Profile>) => {
    const found = state.team.find((p) => p.role === role);
    if (found && !customProfile) {
      setCurrentUser(found);
      return;
    }
    const created: Profile = {
      id: `usr-${Date.now()}`,
      fullName: customProfile?.fullName || found?.fullName || 'Utilisateur CreaPrint',
      email: customProfile?.email || found?.email || 'client@creaprint.ma',
      phone: customProfile?.phone || found?.phone || '+212 6 00 00 00 00',
      company: customProfile?.company || found?.company,
      city: customProfile?.city || 'Marrakech',
      role,
      active: true,
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(created);
  };

  const loginByEmail = (email: string, fullName?: string, phone?: string, company?: string): Profile => {
    const existing = state.team.find(
      (p) => p.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (existing) {
      setCurrentUser(existing);
      return existing;
    }
    const newClient: Profile = {
      id: `usr-${Date.now()}`,
      fullName: fullName?.trim() || email.split('@')[0],
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || '+212 6 00 00 00 00',
      company: company?.trim() || undefined,
      city: 'Marrakech',
      role: 'client',
      active: true,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({ ...prev, team: [...prev.team, newClient] }));
    setCurrentUser(newClient);
    return newClient;
  };

  const logout = () => setCurrentUser(null);

  const submitQuoteRequest: StoreContextValue['submitQuoteRequest'] = (payload) => {
    const now = new Date().toISOString();
    const leadRef = generateReference('DEM');
    const quoteRef = generateReference('DEV');

    const configLines = Object.entries(payload.configSummary)
      .filter(([, v]) => v !== '' && v !== undefined && v !== false)
      .map(([k, v]) => `${k}: ${typeof v === 'boolean' ? 'Oui' : v}`)
      .join(' · ');

    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      reference: leadRef,
      fullName: payload.fullName,
      company: payload.company || undefined,
      phone: payload.phone,
      email: payload.email || undefined,
      city: payload.city || 'Marrakech',
      source: utm.source,
      utmMedium: utm.medium,
      utmCampaign: utm.campaign,
      status: 'nouveau',
      tags: [payload.productName, utm.source === 'site' ? 'Configurateur' : `UTM:${utm.source}`],
      requestedProduct: payload.productName,
      estimatedBudget: payload.estimatedPrice,
      summary: `${configLines}${payload.comment ? ` — Note : ${payload.comment}` : ''}`,
      notes: [],
      createdAt: now,
    };

    const unitPrice =
      payload.estimatedPrice && payload.quantity > 0
        ? Number((payload.estimatedPrice / payload.quantity).toFixed(2))
        : 0;

    const newQuote: Quote = {
      id: `qt-${Date.now()}`,
      reference: quoteRef,
      leadId: newLead.id,
      clientEmail: payload.email || undefined,
      clientName: payload.fullName,
      clientCompany: payload.company || undefined,
      clientPhone: payload.phone,
      clientCity: payload.city || 'Marrakech',
      status: 'brouillon',
      items: [
        {
          id: `qi-${Date.now()}`,
          label: payload.productName,
          description: configLines,
          quantity: payload.quantity,
          unitPrice,
        },
      ],
      discountPercent: 0,
      tvaPercent: state.settings.defaultTvaPercent,
      validUntil: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
      notes: payload.comment || 'Devis brouillon généré automatiquement via le configurateur.',
      createdAt: now,
      configSummary: payload.configSummary,
    };

    const newFiles: UploadedFileRecord[] = payload.file
      ? [
          {
            id: `file-${Date.now()}`,
            fileName: payload.file.name,
            fileType: payload.file.type || 'application/octet-stream',
            fileSize: payload.file.size,
            previewUrl: payload.file.previewUrl,
            uploadedBy: payload.fullName,
            linkedReference: quoteRef,
            linkedType: 'devis',
            status: 'en_attente',
            uploadedAt: now,
          },
        ]
      : [];

    setState((prev) => ({
      ...prev,
      leads: [newLead, ...prev.leads],
      quotes: [newQuote, ...prev.quotes],
      files: [...newFiles, ...prev.files],
      activity: [
        {
          id: `act-${Date.now()}`,
          actor: payload.fullName,
          action: 'Nouvelle demande de devis',
          target: `${quoteRef} — ${payload.productName}`,
          timestamp: now,
        },
        ...prev.activity,
      ],
    }));

    return { lead: newLead, quote: newQuote };
  };

  const submitContactLead: StoreContextValue['submitContactLead'] = (payload) => {
    const now = new Date().toISOString();
    const lead: Lead = {
      id: `lead-${Date.now()}`,
      reference: generateReference('DEM'),
      fullName: payload.fullName,
      phone: payload.phone,
      email: payload.email || undefined,
      city: 'Marrakech',
      source: utm.source,
      utmMedium: utm.medium,
      utmCampaign: utm.campaign,
      status: 'nouveau',
      tags: ['Contact web'],
      requestedProduct: payload.subject || 'Demande de contact',
      summary: payload.message,
      notes: [],
      createdAt: now,
    };
    setState((prev) => ({
      ...prev,
      leads: [lead, ...prev.leads],
      activity: [
        {
          id: `act-${Date.now()}`,
          actor: payload.fullName,
          action: 'Message via page Contact',
          target: lead.reference,
          timestamp: now,
        },
        ...prev.activity,
      ],
    }));
    return lead;
  };

  const updateLeadStatus = (leadId: string, status: LeadStatus) => {
    setState((prev) => ({
      ...prev,
      leads: prev.leads.map((l) => (l.id === leadId ? { ...l, status } : l)),
    }));
    appendActivity(currentUser?.fullName || 'Équipe', `Statut prospect → ${status}`, leadId);
  };

  const addLeadNote = (leadId: string, text: string, followUpDate?: string) => {
    const note = {
      id: `note-${Date.now()}`,
      author: currentUser?.fullName || 'Équipe commerciale',
      text,
      createdAt: new Date().toISOString(),
      followUpDate: followUpDate || undefined,
    };
    setState((prev) => ({
      ...prev,
      leads: prev.leads.map((l) =>
        l.id === leadId
          ? {
              ...l,
              notes: [note, ...l.notes],
              nextFollowUp: followUpDate || l.nextFollowUp,
            }
          : l
      ),
    }));
  };

  const addLeadTag = (leadId: string, tag: string) => {
    const clean = tag.trim();
    if (!clean) return;
    setState((prev) => ({
      ...prev,
      leads: prev.leads.map((l) =>
        l.id === leadId && !l.tags.includes(clean)
          ? { ...l, tags: [...l.tags, clean] }
          : l
      ),
    }));
  };

  const createQuote: StoreContextValue['createQuote'] = (quoteInput) => {
    const created: Quote = {
      ...quoteInput,
      id: `qt-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({ ...prev, quotes: [created, ...prev.quotes] }));
    appendActivity(currentUser?.fullName || 'Équipe', 'Création devis', created.reference);
    return created;
  };

  const updateQuote = (quoteId: string, patch: Partial<Quote>) => {
    setState((prev) => ({
      ...prev,
      quotes: prev.quotes.map((q) => (q.id === quoteId ? { ...q, ...patch } : q)),
    }));
  };

  const duplicateQuote = (quoteId: string): Quote | null => {
    const original = state.quotes.find((q) => q.id === quoteId);
    if (!original) return null;
    const copy: Quote = {
      ...original,
      id: `qt-${Date.now()}`,
      reference: generateReference('DEV'),
      status: 'brouillon',
      createdAt: new Date().toISOString(),
      items: original.items.map((it, i) => ({ ...it, id: `qi-${Date.now()}-${i}` })),
    };
    setState((prev) => ({ ...prev, quotes: [copy, ...prev.quotes] }));
    appendActivity(currentUser?.fullName || 'Équipe', 'Duplication devis', copy.reference);
    return copy;
  };

  const convertQuoteToOrder = (quoteId: string): Order | null => {
    const quote = state.quotes.find((q) => q.id === quoteId);
    if (!quote) return null;
    const totals = calculateQuoteTotals(quote);
    const totalQty = quote.items.reduce((s, it) => s + it.quantity, 0);
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      reference: generateReference('CMD'),
      quoteId: quote.id,
      clientEmail: quote.clientEmail,
      clientName: quote.clientName,
      clientCompany: quote.clientCompany,
      clientPhone: quote.clientPhone,
      productName: quote.items.map((i) => i.label).join(' + '),
      specifications: quote.items.map((i) => `${i.quantity}× ${i.label} (${i.description})`).join(' | '),
      quantity: totalQty,
      totalTTC: Math.round(totals.totalTTC),
      amountPaid: 0,
      paymentStatus: 'en_attente',
      status: 'devis_valide',
      assignedTo: 'Mehdi Ouali',
      estimatedDeliveryDate: new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10),
      deliveryMethod: 'retrait',
      internalNotes: [`Converti depuis le devis ${quote.reference}.`],
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderRole: 'equipe',
          senderName: currentUser?.fullName || 'CreaPrint',
          content: `Votre devis ${quote.reference} a été validé et converti en commande. Merci pour votre confiance.`,
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      quotes: prev.quotes.map((q) => (q.id === quoteId ? { ...q, status: 'accepte' } : q)),
      orders: [newOrder, ...prev.orders],
    }));
    appendActivity(
      currentUser?.fullName || 'Équipe',
      'Devis converti en commande',
      `${quote.reference} → ${newOrder.reference}`
    );
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
    }));
    appendActivity(currentUser?.fullName || 'Production', `Commande → ${status}`, orderId);
  };

  const updateOrderDetails: StoreContextValue['updateOrderDetails'] = (orderId, patch) => {
    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) => {
        if (o.id !== orderId) return o;
        const nextPaid = patch.amountPaid !== undefined ? patch.amountPaid : o.amountPaid;
        let nextPayStatus: PaymentStatus = patch.paymentStatus || o.paymentStatus;
        if (patch.amountPaid !== undefined && !patch.paymentStatus) {
          if (nextPaid <= 0) nextPayStatus = 'en_attente';
          else if (nextPaid >= o.totalTTC) nextPayStatus = 'paye';
          else nextPayStatus = 'acompte';
        }
        return { ...o, ...patch, amountPaid: nextPaid, paymentStatus: nextPayStatus };
      }),
    }));
  };

  const addOrderInternalNote = (orderId: string, note: string) => {
    if (!note.trim()) return;
    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) =>
        o.id === orderId ? { ...o, internalNotes: [note.trim(), ...o.internalNotes] } : o
      ),
    }));
  };

  const addOrderMessage = (
    orderId: string,
    senderRole: 'client' | 'equipe',
    senderName: string,
    content: string
  ) => {
    if (!content.trim()) return;
    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              messages: [
                ...o.messages,
                {
                  id: `msg-${Date.now()}`,
                  senderRole,
                  senderName,
                  content: content.trim(),
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : o
      ),
    }));
  };

  const addUploadedFile: StoreContextValue['addUploadedFile'] = (fileInput) => {
    const rec: UploadedFileRecord = {
      ...fileInput,
      id: `file-${Date.now()}`,
      uploadedAt: new Date().toISOString(),
    };
    setState((prev) => ({ ...prev, files: [rec, ...prev.files] }));
    return rec;
  };

  const updateFileStatus = (fileId: string, status: FileReviewStatus, reviewNote?: string) => {
    setState((prev) => ({
      ...prev,
      files: prev.files.map((f) =>
        f.id === fileId ? { ...f, status, reviewNote: reviewNote ?? f.reviewNote } : f
      ),
    }));
  };

  const upsertProduct = (product: Product) => {
    setState((prev) => {
      const exists = prev.products.some((p) => p.id === product.id);
      return {
        ...prev,
        products: exists
          ? prev.products.map((p) => (p.id === product.id ? product : p))
          : [product, ...prev.products],
      };
    });
  };

  const toggleProductActive = (productId: string) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) => (p.id === productId ? { ...p, active: !p.active } : p)),
    }));
  };

  const addCategory = (category: Omit<ProductCategory, 'id'>) => {
    const newCat: ProductCategory = { ...category, id: `cat-${Date.now()}` };
    setState((prev) => ({ ...prev, categories: [...prev.categories, newCat] }));
  };

  const upsertGalleryItem = (item: GalleryItem) => {
    setState((prev) => {
      const exists = prev.gallery.some((g) => g.id === item.id);
      return {
        ...prev,
        gallery: exists
          ? prev.gallery.map((g) => (g.id === item.id ? item : g))
          : [item, ...prev.gallery],
      };
    });
  };

  const deleteGalleryItem = (itemId: string) => {
    setState((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((g) => g.id !== itemId),
    }));
  };

  const updateSettings = (patch: Partial<SiteSettings>) => {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...patch,
        openingHours: { ...prev.settings.openingHours, ...(patch.openingHours || {}) },
        socialLinks: { ...prev.settings.socialLinks, ...(patch.socialLinks || {}) },
        billingInfo: { ...prev.settings.billingInfo, ...(patch.billingInfo || {}) },
      },
    }));
  };

  const addTeamMember = (member: Omit<Profile, 'id' | 'createdAt'>) => {
    const created: Profile = {
      ...member,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({ ...prev, team: [...prev.team, created] }));
  };

  const updateTeamRole = (memberId: string, role: UserRole) => {
    setState((prev) => ({
      ...prev,
      team: prev.team.map((m) => (m.id === memberId ? { ...m, role } : m)),
    }));
  };

  return (
    <StoreContext.Provider
      value={{
        ...state,
        utm,
        currentUser,
        loginAsRole,
        loginByEmail,
        logout,
        submitQuoteRequest,
        submitContactLead,
        updateLeadStatus,
        addLeadNote,
        addLeadTag,
        createQuote,
        updateQuote,
        duplicateQuote,
        convertQuoteToOrder,
        updateOrderStatus,
        updateOrderDetails,
        addOrderInternalNote,
        addOrderMessage,
        addUploadedFile,
        updateFileStatus,
        upsertProduct,
        toggleProductActive,
        addCategory,
        upsertGalleryItem,
        deleteGalleryItem,
        updateSettings,
        addTeamMember,
        updateTeamRole,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
