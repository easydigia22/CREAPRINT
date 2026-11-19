import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Download,
  FileText,
  MessageCircle,
  ShieldCheck,
  Trash2,
  Upload,
} from 'lucide-react';
import { useStore } from '@/src/context/StoreContext';
import { Button, Input, Label, Select, Textarea } from '@/src/components/ui/primitives';
import { downloadQuotePdf } from '@/src/lib/pdfGenerator';
import { buildWhatsAppUrl, cn, formatDH, formatFileSize } from '@/src/lib/utils';
import type { Product, Quote } from '@/src/types/creaprint';

const contactSchema = z.object({
  fullName: z.string().min(2, 'Veuillez indiquer votre nom complet.'),
  company: z.string().optional(),
  phone: z
    .string()
    .min(8, 'Veuillez indiquer un numéro de téléphone ou WhatsApp valide.'),
  email: z
    .string()
    .email('Adresse e-mail invalide.')
    .optional()
    .or(z.literal('')),
  city: z.string().min(2, 'Veuillez indiquer votre ville.'),
  comment: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const STEPS = [
  { id: 1, label: 'Produit' },
  { id: 2, label: 'Configuration' },
  { id: 3, label: 'Fichier' },
  { id: 4, label: 'Coordonnées' },
];

export function QuoteConfiguratorPage() {
  const { products, categories, settings, submitQuoteRequest } = useStore();
  const [searchParams] = useSearchParams();
  const activeProducts = useMemo(() => products.filter((p) => p.active), [products]);

  const preselectedSlug = searchParams.get('produit');
  const initialProduct =
    activeProducts.find((p) => p.slug === preselectedSlug) || activeProducts[0];

  const [step, setStep] = useState<number>(preselectedSlug ? 2 : 1);
  const [selectedProductId, setSelectedProductId] = useState<string>(initialProduct?.id || '');
  const [catFilter, setCatFilter] = useState<string>('all');

  const product: Product =
    activeProducts.find((p) => p.id === selectedProductId) || activeProducts[0];

  // Dynamic configuration parameters
  const [format, setFormat] = useState<string>(product.options.formats[0] || '');
  const [orientation, setOrientation] = useState<'Portrait' | 'Paysage'>('Portrait');
  const [quantity, setQuantity] = useState<number>(product.options.quantities[0] || product.minQty);
  const [paper, setPaper] = useState<string>(product.options.papers[0] || '');
  const [sides, setSides] = useState<'Recto seul' | 'Recto-verso'>('Recto-verso');
  const [colorMode, setColorMode] = useState<'Couleur (CMJN)' | 'Noir & Blanc'>('Couleur (CMJN)');
  const [finishing, setFinishing] = useState<string>(product.options.finishings[0] || 'Sans finition');
  const [urgency, setUrgency] = useState<'Standard' | 'Prioritaire'>('Standard');
  const [designNeed, setDesignNeed] = useState<'ready' | 'need_design'>('ready');
  const [deliveryMode, setDeliveryMode] = useState<'retrait' | 'livraison'>('retrait');

  // File state
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    type: string;
    size: number;
    previewUrl?: string;
  } | null>(null);
  const [fileError, setFileError] = useState<string>('');

  // Confirmation state
  const [submittedResult, setSubmittedResult] = useState<{
    reference: string;
    quote: Quote;
    whatsappUrl: string;
  } | null>(null);

  const selectProduct = (p: Product) => {
    setSelectedProductId(p.id);
    setFormat(p.options.formats[0] || '');
    setPaper(p.options.papers[0] || '');
    setFinishing(p.options.finishings[0] || 'Sans finition');
    setQuantity(p.options.quantities[0] || p.minQty);
    setSides(p.options.supportsDoubleSided ? 'Recto-verso' : 'Recto seul');
  };

  // Price estimator in DH (transparent & realistic)
  const estimatedPrice = useMemo<number | undefined>(() => {
    if (!product.startingPrice || !product.unitPriceBase) return undefined;
    let base = 0;

    if (product.slug === 'roll-up-kakemonos') {
      base = 380 * quantity;
      if (format.includes('100')) base += 90 * quantity;
      if (finishing.includes('Luxe')) base += 120 * quantity;
    } else if (product.slug === 'conception-graphique') {
      base = format.includes('Logo') ? 900 : format.includes('Identité') ? 2200 : format.includes('Menu') ? 450 : 150;
    } else {
      // Progressive volume discount
      const qtyRatio = quantity / Math.max(1, product.minQty);
      const volumeFactor = qtyRatio >= 10 ? 0.62 : qtyRatio >= 5 ? 0.72 : qtyRatio >= 2 ? 0.85 : 1;
      base = Math.max(product.startingPrice, product.unitPriceBase * quantity * volumeFactor);
    }

    if (product.options.supportsDoubleSided && sides === 'Recto-verso') {
      base *= 1.18;
    }
    if (product.options.supportsColorChoice && colorMode === 'Noir & Blanc') {
      base *= 0.8;
    }
    if (finishing.includes('Vernis') || finishing.includes('Dorure') || finishing.includes('Dos carré')) {
      base *= 1.25;
    } else if (finishing.includes('Pelliculage') || finishing.includes('Lamination') || finishing.includes('Broderie')) {
      base *= 1.12;
    }
    if (urgency === 'Prioritaire') {
      base *= 1.15;
    }
    if (designNeed === 'need_design' && product.slug !== 'conception-graphique') {
      base += product.slug === 'roll-up-kakemonos' ? 100 : 180;
    }
    if (deliveryMode === 'livraison') {
      base += 40;
    }

    return Math.round(base / 5) * 5;
  }, [product, quantity, format, sides, colorMode, finishing, urgency, designNeed, deliveryMode]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      city: 'Marrakech',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('');
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedExt = ['pdf', 'jpg', 'jpeg', 'png', 'ai', 'psd'];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!allowedExt.includes(ext)) {
      setFileError('Format non supporté. Formats acceptés : PDF, JPG, PNG, AI, PSD.');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setFileError('Le fichier dépasse 50 Mo. Pour un fichier plus lourd, envoyez-nous un lien dans le commentaire.');
      return;
    }

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedFile({
          name: file.name,
          type: file.type,
          size: file.size,
          previewUrl: typeof reader.result === 'string' ? reader.result : undefined,
        });
      };
      reader.readAsDataURL(file);
    } else {
      setUploadedFile({
        name: file.name,
        type: file.type || ext.toUpperCase(),
        size: file.size,
      });
    }
  };

  const onSubmit = (data: ContactFormValues) => {
    const configSummary: Record<string, string | number | boolean> = {
      Format: format,
      ...(product.options.supportsOrientation ? { Orientation: orientation } : {}),
      Quantité: quantity,
      Support: paper,
      ...(product.options.supportsDoubleSided ? { Impression: sides } : {}),
      ...(product.options.supportsColorChoice ? { Couleur: colorMode } : {}),
      Finition: finishing,
      Urgence: urgency,
      Conception:
        designNeed === 'need_design' ? 'Conception graphique demandée' : 'Fichier prêt fourni',
      Réception:
        deliveryMode === 'livraison' ? 'Livraison demandée' : 'Retrait à l’atelier Marrakech',
      ...(uploadedFile ? { Fichier: `${uploadedFile.name} (${formatFileSize(uploadedFile.size)})` } : {}),
    };

    const { quote } = submitQuoteRequest({
      productName: product.name,
      fullName: data.fullName,
      company: data.company,
      phone: data.phone,
      email: data.email,
      city: data.city,
      comment: data.comment,
      estimatedPrice,
      quantity,
      configSummary,
      file: uploadedFile || undefined,
    });

    const waMessage = [
      `Bonjour CreaPrint Marrakech 👋`,
      `Je viens d’envoyer une demande de devis (Réf : ${quote.reference}).`,
      `• Produit : ${product.name}`,
      `• Format : ${format} | Quantité : ${quantity}`,
      `• Support : ${paper} | Finition : ${finishing}`,
      `• Conception : ${designNeed === 'need_design' ? 'À créer par CreaPrint' : 'Fichier prêt'}`,
      `• Mode : ${deliveryMode === 'livraison' ? 'Livraison' : 'Retrait en magasin'}`,
      estimatedPrice ? `• Estimation indicative : ${formatDH(estimatedPrice)} HT` : `• Demande de devis personnalisé`,
      `• Client : ${data.fullName}${data.company ? ` (${data.company})` : ''} — ${data.phone}`,
      data.comment ? `• Note : ${data.comment}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const whatsappUrl = buildWhatsAppUrl(settings.whatsappNumber, waMessage);

    setSubmittedResult({
      reference: quote.reference,
      quote,
      whatsappUrl,
    });
  };

  if (submittedResult) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <div className="rounded-2xl bg-white border border-[#E9E9E6] p-8 sm:p-10 text-center shadow-xs">
          <div className="h-14 w-14 rounded-2xl bg-[#56B9E8]/15 text-[#151515] inline-flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="h-8 w-8 text-[#56B9E8]" />
          </div>
          <p className="text-xs font-mono font-semibold text-[#70849A]">
            RÉFÉRENCE : {submittedResult.reference}
          </p>
          <h1 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-[#151515]">
            Votre demande de devis est enregistrée
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#525E6B] max-w-xl mx-auto leading-relaxed">
            Merci {submittedResult.quote.clientName}. Un devis brouillon a été créé pour notre
            équipe à Marrakech. Cliquez ci-dessous pour envoyer immédiatement le résumé sur notre
            WhatsApp et accélérer votre prise en charge.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={submittedResult.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto h-12 px-6 inline-flex items-center justify-center gap-2 rounded-lg bg-[#25D366] text-white text-sm font-bold hover:bg-[#1FB858] transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              Envoyer le résumé sur WhatsApp
            </a>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => downloadQuotePdf(submittedResult.quote, settings, 'DEVIS')}
              className="w-full sm:w-auto"
            >
              <Download className="h-4 w-4" />
              Télécharger le récapitulatif PDF
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t border-[#E9E9E6] flex flex-wrap items-center justify-center gap-6 text-xs text-[#70849A]">
            <Link to="/mon-espace" className="font-semibold text-[#151515] hover:text-[#56B9E8]">
              Suivre ma demande dans Mon Espace
            </Link>
            <button
              type="button"
              onClick={() => {
                setSubmittedResult(null);
                setStep(1);
                setUploadedFile(null);
              }}
              className="font-semibold text-[#151515] hover:text-[#56B9E8] cursor-pointer"
            >
              Configurer un autre produit
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredProducts =
    catFilter === 'all'
      ? activeProducts
      : activeProducts.filter((p) => p.categoryId === catFilter);

  return (
    <div className="pb-20">
      <section className="bg-[#151515] text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-[0.2em] text-[#56B9E8] mb-2">
            CONFIGURATEUR &amp; DEVIS EN LIGNE
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
            Configurez votre impression en 4 étapes simples
          </h1>

          {/* Stepper */}
          <div className="mt-6 grid grid-cols-4 gap-2 sm:gap-4 max-w-2xl">
            {STEPS.map((s) => {
              const active = step === s.id;
              const done = step > s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    if (s.id <= step) setStep(s.id);
                  }}
                  className={cn(
                    'flex items-center gap-2 py-2.5 px-3 rounded-lg text-left transition-colors border',
                    active
                      ? 'bg-[#56B9E8] text-[#151515] border-[#56B9E8] font-bold'
                      : done
                      ? 'bg-white/10 text-white border-white/20 cursor-pointer'
                      : 'bg-white/5 text-white/50 border-white/10 cursor-default'
                  )}
                >
                  <span className="h-5 w-5 rounded-full bg-black/15 inline-flex items-center justify-center text-[11px] font-mono shrink-0">
                    {done ? <Check className="h-3.5 w-3.5" /> : s.id}
                  </span>
                  <span className="text-xs truncate">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Step Panel */}
          <div className="lg:col-span-8 rounded-2xl bg-white border border-[#E9E9E6] p-6 sm:p-8">
            {/* STEP 1: CHOOSE PRODUCT */}
            {step === 1 && (
              <div>
                <h2 className="font-display text-xl font-bold text-[#151515]">
                  Étape 1 : Choisissez votre produit
                </h2>
                <p className="mt-1 text-sm text-[#525E6B]">
                  Sélectionnez le support que vous souhaitez imprimer ou concevoir.
                </p>

                <div className="mt-5 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCatFilter('all')}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer',
                      catFilter === 'all'
                        ? 'bg-[#151515] text-white'
                        : 'bg-[#F7F7F4] text-[#151515] hover:bg-[#E9E9E6]'
                    )}
                  >
                    Tous
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCatFilter(c.id)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer',
                        catFilter === c.id
                          ? 'bg-[#151515] text-white'
                          : 'bg-[#F7F7F4] text-[#151515] hover:bg-[#E9E9E6]'
                      )}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredProducts.map((item) => {
                    const isSelected = item.id === product.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => selectProduct(item)}
                        className={cn(
                          'text-left rounded-xl border p-4 flex items-center gap-4 transition-all cursor-pointer',
                          isSelected
                            ? 'border-[#151515] bg-[#F7F7F4] ring-2 ring-[#56B9E8]'
                            : 'border-[#E9E9E6] bg-white hover:border-[#70849A]'
                        )}
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="h-16 w-16 rounded-lg object-cover shrink-0 bg-[#E9E9E6]"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-display text-sm font-bold text-[#151515] truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-[#525E6B] line-clamp-1 mt-0.5">
                            {item.shortDescription}
                          </p>
                          <p className="mt-1.5 text-xs font-mono font-semibold text-[#151515] tabular-nums">
                            {item.startingPrice
                              ? `Dès ${formatDH(item.startingPrice)}`
                              : 'Sur devis personnalisé'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-8 flex justify-end">
                  <Button type="button" size="lg" onClick={() => setStep(2)}>
                    Configurer « {product.name} »
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: DYNAMIC OPTIONS */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#E9E9E6]">
                  <div>
                    <h2 className="font-display text-xl font-bold text-[#151515]">
                      Étape 2 : Paramètres pour {product.name}
                    </h2>
                    <p className="text-xs text-[#70849A] mt-0.5">
                      Délai indicatif : {product.indicativeLeadTime}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-semibold text-[#56B9E8] hover:underline cursor-pointer whitespace-nowrap"
                  >
                    Changer de produit
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <Label htmlFor="cfg-format">Format / Dimensions</Label>
                    <Select
                      id="cfg-format"
                      value={format}
                      onChange={(e) => setFormat(e.target.value)}
                    >
                      {product.options.formats.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="cfg-paper">Papier / Matière</Label>
                    <Select
                      id="cfg-paper"
                      value={paper}
                      onChange={(e) => setPaper(e.target.value)}
                    >
                      {product.options.papers.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="cfg-qty">Quantité</Label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {product.options.quantities.map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setQuantity(q)}
                          className={cn(
                            'px-3 py-1.5 rounded-md text-xs font-mono font-semibold border cursor-pointer',
                            quantity === q
                              ? 'bg-[#151515] text-white border-[#151515]'
                              : 'bg-white text-[#151515] border-[#DCDCD7] hover:bg-[#F7F7F4]'
                          )}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                    <Input
                      id="cfg-qty"
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="cfg-finishing">Finition</Label>
                    <Select
                      id="cfg-finishing"
                      value={finishing}
                      onChange={(e) => setFinishing(e.target.value)}
                    >
                      {product.options.finishings.map((fin) => (
                        <option key={fin} value={fin}>
                          {fin}
                        </option>
                      ))}
                    </Select>
                  </div>

                  {product.options.supportsOrientation && (
                    <div>
                      <Label>Orientation</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['Portrait', 'Paysage'] as const).map((o) => (
                          <button
                            key={o}
                            type="button"
                            onClick={() => setOrientation(o)}
                            className={cn(
                              'h-11 rounded-lg border text-sm font-semibold cursor-pointer transition-colors',
                              orientation === o
                                ? 'bg-[#151515] text-white border-[#151515]'
                                : 'bg-white text-[#151515] border-[#DCDCD7] hover:bg-[#F7F7F4]'
                            )}
                          >
                            {o}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {product.options.supportsDoubleSided && (
                    <div>
                      <Label>Face d’impression</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['Recto seul', 'Recto-verso'] as const).map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setSides(s)}
                            className={cn(
                              'h-11 rounded-lg border text-sm font-semibold cursor-pointer transition-colors',
                              sides === s
                                ? 'bg-[#151515] text-white border-[#151515]'
                                : 'bg-white text-[#151515] border-[#DCDCD7] hover:bg-[#F7F7F4]'
                            )}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {product.options.supportsColorChoice && (
                    <div>
                      <Label>Mode couleur</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['Couleur (CMJN)', 'Noir & Blanc'] as const).map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setColorMode(c)}
                            className={cn(
                              'h-11 rounded-lg border text-xs sm:text-sm font-semibold cursor-pointer transition-colors',
                              colorMode === c
                                ? 'bg-[#151515] text-white border-[#151515]'
                                : 'bg-white text-[#151515] border-[#DCDCD7] hover:bg-[#F7F7F4]'
                            )}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <Label>Délai souhaité</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['Standard', 'Prioritaire'] as const).map((u) => (
                        <button
                          key={u}
                          type="button"
                          onClick={() => setUrgency(u)}
                          className={cn(
                            'h-11 rounded-lg border text-sm font-semibold cursor-pointer transition-colors',
                            urgency === u
                              ? 'bg-[#151515] text-white border-[#151515]'
                              : 'bg-white text-[#151515] border-[#DCDCD7] hover:bg-[#F7F7F4]'
                          )}
                        >
                          {u}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Conception graphique</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDesignNeed('ready')}
                        className={cn(
                          'h-11 px-2 rounded-lg border text-xs font-semibold cursor-pointer transition-colors',
                          designNeed === 'ready'
                            ? 'bg-[#151515] text-white border-[#151515]'
                            : 'bg-white text-[#151515] border-[#DCDCD7] hover:bg-[#F7F7F4]'
                        )}
                      >
                        Fichier déjà prêt
                      </button>
                      <button
                        type="button"
                        onClick={() => setDesignNeed('need_design')}
                        className={cn(
                          'h-11 px-2 rounded-lg border text-xs font-semibold cursor-pointer transition-colors',
                          designNeed === 'need_design'
                            ? 'bg-[#F5D84C] text-[#151515] border-[#F5D84C]'
                            : 'bg-white text-[#151515] border-[#DCDCD7] hover:bg-[#F7F7F4]'
                        )}
                      >
                        Création par CreaPrint
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label>Livraison ou retrait</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDeliveryMode('retrait')}
                        className={cn(
                          'h-11 px-2 rounded-lg border text-xs font-semibold cursor-pointer transition-colors',
                          deliveryMode === 'retrait'
                            ? 'bg-[#151515] text-white border-[#151515]'
                            : 'bg-white text-[#151515] border-[#DCDCD7] hover:bg-[#F7F7F4]'
                        )}
                      >
                        Retrait en magasin
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryMode('livraison')}
                        className={cn(
                          'h-11 px-2 rounded-lg border text-xs font-semibold cursor-pointer transition-colors',
                          deliveryMode === 'livraison'
                            ? 'bg-[#151515] text-white border-[#151515]'
                            : 'bg-white text-[#151515] border-[#DCDCD7] hover:bg-[#F7F7F4]'
                        )}
                      >
                        Livraison Marrakech
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#E9E9E6] flex items-center justify-between">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>
                    <ArrowLeft className="h-4 w-4" />
                    Retour
                  </Button>
                  <Button type="button" size="lg" onClick={() => setStep(3)}>
                    Étape suivante : Fichier
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: FILE UPLOAD */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-xl font-bold text-[#151515]">
                    Étape 3 : Envoyez votre fichier (facultatif)
                  </h2>
                  <p className="mt-1 text-sm text-[#525E6B]">
                    Importez votre maquette, logo ou document de référence. Vous pouvez aussi nous
                    l’envoyer plus tard sur WhatsApp.
                  </p>
                </div>

                <label className="block rounded-2xl border-2 border-dashed border-[#DCDCD7] hover:border-[#56B9E8] bg-[#F7F7F4] p-8 text-center transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.ai,.psd"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                  <Upload className="h-8 w-8 text-[#56B9E8] mx-auto mb-3" />
                  <p className="font-display text-sm font-bold text-[#151515]">
                    Cliquez pour sélectionner un fichier
                  </p>
                  <p className="mt-1 text-xs text-[#70849A]">
                    Formats acceptés : PDF, JPG, PNG, AI, PSD (jusqu’à 50 Mo)
                  </p>
                </label>

                {fileError && (
                  <p className="text-xs font-semibold text-[#DC2626]">{fileError}</p>
                )}

                {uploadedFile && (
                  <div className="rounded-xl border border-[#E9E9E6] bg-white p-4 flex items-center gap-4">
                    {uploadedFile.previewUrl ? (
                      <img
                        src={uploadedFile.previewUrl}
                        alt={uploadedFile.name}
                        className="h-16 w-16 rounded-lg object-cover border border-[#E9E9E6] shrink-0"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-lg bg-[#151515] text-white inline-flex items-center justify-center shrink-0">
                        <FileText className="h-6 w-6 text-[#56B9E8]" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-[#151515] truncate">
                        {uploadedFile.name}
                      </p>
                      <p className="text-xs text-[#70849A] tabular-nums">
                        {formatFileSize(uploadedFile.size)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadedFile(null)}
                      aria-label="Retirer le fichier"
                      className="h-9 w-9 rounded-lg inline-flex items-center justify-center text-[#70849A] hover:text-[#DC2626] hover:bg-[#F7F7F4] cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <div className="rounded-xl bg-[#56B9E8]/10 border border-[#56B9E8]/30 p-4 flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-[#151515] shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-[#151515]">
                    <strong>Votre fichier sera vérifié avant impression.</strong> Nous contrôlons la
                    résolution, les marges et le format avant toute mise en production.
                  </p>
                </div>

                <div className="pt-6 border-t border-[#E9E9E6] flex items-center justify-between">
                  <Button type="button" variant="outline" onClick={() => setStep(2)}>
                    <ArrowLeft className="h-4 w-4" />
                    Retour
                  </Button>
                  <Button type="button" size="lg" onClick={() => setStep(4)}>
                    Étape finale : Coordonnées
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: CONTACT DETAILS */}
            {step === 4 && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <h2 className="font-display text-xl font-bold text-[#151515]">
                    Étape 4 : Vos coordonnées
                  </h2>
                  <p className="mt-1 text-sm text-[#525E6B]">
                    Indiquez vos coordonnées pour recevoir votre devis détaillé et votre lien de
                    suivi.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Nom complet *</Label>
                    <Input
                      id="fullName"
                      placeholder="Ex. Youssef El Amrani"
                      {...register('fullName')}
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-xs text-[#DC2626]">{errors.fullName.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="company">Entreprise (facultatif)</Label>
                    <Input
                      id="company"
                      placeholder="Ex. Café Dar Nour"
                      {...register('company')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Téléphone / WhatsApp *</Label>
                    <Input
                      id="phone"
                      placeholder="Ex. 06 61 00 00 00"
                      {...register('phone')}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-[#DC2626]">{errors.phone.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Adresse e-mail (facultatif)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="nom@entreprise.ma"
                      {...register('email')}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-[#DC2626]">{errors.email.message}</p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="city">Ville *</Label>
                    <Input id="city" placeholder="Marrakech" {...register('city')} />
                    {errors.city && (
                      <p className="mt-1 text-xs text-[#DC2626]">{errors.city.message}</p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="comment">Commentaire ou précisions</Label>
                    <Textarea
                      id="comment"
                      placeholder="Précisez vos dimensions exactes, date souhaitée ou lien vers un fichier volumineux..."
                      {...register('comment')}
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-[#E9E9E6] flex flex-wrap items-center justify-between gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(3)}>
                    <ArrowLeft className="h-4 w-4" />
                    Retour
                  </Button>
                  <Button type="submit" variant="cyan" size="lg">
                    Envoyer ma demande
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Live Summary & Price Estimate Sidebar */}
          <aside className="lg:col-span-4 rounded-2xl bg-[#151515] text-white p-6 sticky top-24">
            <p className="text-xs font-semibold tracking-[0.18em] text-[#56B9E8]">
              RÉCAPITULATIF
            </p>
            <h3 className="mt-1.5 font-display text-lg font-bold">{product.name}</h3>
            <p className="text-xs text-white/60 mt-0.5">{product.indicativeLeadTime}</p>

            <dl className="mt-5 space-y-2.5 text-xs border-t border-white/10 pt-4">
              <div className="flex justify-between gap-3">
                <dt className="text-white/60">Format</dt>
                <dd className="text-right font-medium text-white">{format}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-white/60">Quantité</dt>
                <dd className="text-right font-mono font-semibold text-white tabular-nums">
                  {quantity}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-white/60">Support</dt>
                <dd className="text-right font-medium text-white">{paper}</dd>
              </div>
              {product.options.supportsDoubleSided && (
                <div className="flex justify-between gap-3">
                  <dt className="text-white/60">Impression</dt>
                  <dd className="text-right font-medium text-white">{sides}</dd>
                </div>
              )}
              <div className="flex justify-between gap-3">
                <dt className="text-white/60">Finition</dt>
                <dd className="text-right font-medium text-white">{finishing}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-white/60">Conception</dt>
                <dd className="text-right font-medium text-white">
                  {designNeed === 'need_design' ? 'Par CreaPrint' : 'Fichier prêt'}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-white/60">Réception</dt>
                <dd className="text-right font-medium text-white">
                  {deliveryMode === 'livraison' ? 'Livraison' : 'Retrait atelier'}
                </dd>
              </div>
              {uploadedFile && (
                <div className="flex justify-between gap-3">
                  <dt className="text-white/60">Fichier</dt>
                  <dd className="text-right font-medium text-[#56B9E8] truncate max-w-[160px]">
                    {uploadedFile.name}
                  </dd>
                </div>
              )}
            </dl>

            <div className="mt-6 pt-5 border-t border-white/15">
              {estimatedPrice !== undefined ? (
                <div>
                  <p className="text-xs text-white/65">Estimation indicative (HT)</p>
                  <p className="mt-1 font-mono text-3xl font-bold text-[#F5D84C] tabular-nums">
                    {formatDH(estimatedPrice)}
                  </p>
                  <p className="mt-1.5 text-[11px] text-white/55 leading-relaxed">
                    Tarif indicatif confirmé sur devis définitif après vérification de votre
                    fichier.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-display text-base font-bold text-[#F5D84C]">
                    Demandez votre devis personnalisé
                  </p>
                  <p className="mt-1 text-xs text-white/65 leading-relaxed">
                    Ce produit sur mesure nécessite un chiffrage selon vos dimensions et contraintes
                    de pose à Marrakech.
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
