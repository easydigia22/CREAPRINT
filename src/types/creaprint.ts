export type UserRole = 'admin' | 'commercial' | 'production' | 'client';

export interface Profile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  company?: string;
  city: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
}

export type LeadStatus = 'nouveau' | 'contacte' | 'devis_envoye' | 'gagne' | 'perdu';
export type LeadSource = 'site' | 'whatsapp' | 'instagram' | 'facebook' | 'google' | 'magasin';

export interface LeadNote {
  id: string;
  author: string;
  text: string;
  createdAt: string;
  followUpDate?: string;
}

export interface Lead {
  id: string;
  reference: string;
  fullName: string;
  company?: string;
  phone: string;
  email?: string;
  city: string;
  source: LeadSource;
  utmMedium?: string;
  utmCampaign?: string;
  status: LeadStatus;
  tags: string[];
  requestedProduct: string;
  estimatedBudget?: number;
  summary: string;
  notes: LeadNote[];
  createdAt: string;
  nextFollowUp?: string;
}

export interface ProductCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  accent: 'cyan' | 'yellow' | 'rose' | 'slate';
  order: number;
}

export interface ProductOptionConfig {
  formats: string[];
  papers: string[];
  finishings: string[];
  quantities: number[];
  supportsDoubleSided: boolean;
  supportsColorChoice: boolean;
  supportsOrientation: boolean;
}

export interface Product {
  id: string;
  slug: string;
  categoryId: string;
  name: string;
  shortDescription: string;
  description: string;
  benefits: string[];
  imageUrl: string;
  startingPrice?: number; // in DH, undefined = Devis personnalisé
  unitPriceBase?: number;
  minQty: number;
  indicativeLeadTime: string;
  active: boolean;
  featured: boolean;
  options: ProductOptionConfig;
}

export type QuoteStatus = 'brouillon' | 'envoye' | 'accepte' | 'refuse' | 'expire';

export interface QuoteItem {
  id: string;
  label: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Quote {
  id: string;
  reference: string;
  leadId?: string;
  clientEmail?: string;
  clientName: string;
  clientCompany?: string;
  clientPhone: string;
  clientCity: string;
  status: QuoteStatus;
  items: QuoteItem[];
  discountPercent: number;
  tvaPercent: number;
  validUntil: string;
  notes?: string;
  createdAt: string;
  configSummary?: Record<string, string | number | boolean>;
}

export type OrderStatus =
  | 'a_verifier'
  | 'devis_valide'
  | 'en_production'
  | 'controle_qualite'
  | 'prete'
  | 'livree'
  | 'annulee';

export type PaymentStatus = 'en_attente' | 'acompte' | 'paye';

export interface OrderMessage {
  id: string;
  senderRole: 'client' | 'equipe';
  senderName: string;
  content: string;
  createdAt: string;
}

export interface Order {
  id: string;
  reference: string;
  quoteId?: string;
  clientEmail?: string;
  clientName: string;
  clientCompany?: string;
  clientPhone: string;
  productName: string;
  specifications: string;
  quantity: number;
  totalTTC: number;
  amountPaid: number;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  assignedTo: string;
  estimatedDeliveryDate: string;
  deliveryMethod: 'retrait' | 'livraison';
  internalNotes: string[];
  messages: OrderMessage[];
  createdAt: string;
}

export type FileReviewStatus = 'en_attente' | 'valide' | 'correction_demandee';

export interface UploadedFileRecord {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  previewUrl?: string;
  uploadedBy: string;
  linkedReference: string;
  linkedType: 'devis' | 'commande';
  status: FileReviewStatus;
  reviewNote?: string;
  uploadedAt: string;
}

export type GalleryCategory =
  | 'cartes'
  | 'vetements'
  | 'enseignes'
  | 'affiches'
  | 'evenements'
  | 'restaurants';

export interface GalleryItem {
  id: string;
  title: string;
  category: GalleryCategory;
  clientSector: string;
  description: string;
  imageUrl: string;
  specs: string;
  featured: boolean;
}

export interface Testimonial {
  id: string;
  authorName: string;
  role: string;
  organization: string;
  content: string;
  projectType: string;
}

export interface SiteSettings {
  companyName: string;
  signature: string;
  hashtag: string;
  phoneDisplay: string;
  whatsappNumber: string;
  email: string;
  city: string;
  addressLabel: string;
  mapsQuery: string;
  openingHours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  socialLinks: {
    instagram: string;
    facebook: string;
    linkedin: string;
  };
  defaultWhatsAppMessage: string;
  defaultTvaPercent: number;
  billingInfo: {
    ice: string;
    rc: string;
    ifCode: string;
    rib: string;
  };
  termsSummary: string;
  gaMeasurementId: string;
}

export interface ActivityLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
}
