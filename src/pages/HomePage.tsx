import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  FileCheck2,
  Layers,
  MapPin,
  MessageCircle,
  Palette,
  Printer,
  Sparkles,
  Truck,
  Zap,
} from 'lucide-react';
import { useStore } from '@/src/context/StoreContext';
import { ASSETS, FAQ_ITEMS } from '@/src/data/seedData';
import { buildWhatsAppUrl, cn, formatDH } from '@/src/lib/utils';

const ACCENT_BORDER: Record<string, string> = {
  cyan: 'border-t-[#56B9E8]',
  yellow: 'border-t-[#F5D84C]',
  rose: 'border-t-[#F17B9B]',
  slate: 'border-t-[#70849A]',
};

export function HomePage() {
  const { categories, products, gallery, testimonials, settings } = useStore();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const featuredProducts = products.filter((p) => p.active && p.featured).slice(0, 6);
  const featuredGallery = gallery.slice(0, 6);
  const whatsappHref = buildWhatsAppUrl(
    settings.whatsappNumber,
    settings.defaultWhatsAppMessage
  );

  return (
    <div>
      {/* 1. HERO SECTION */}
      <section className="bg-[#151515] text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            {/* Hero Copy */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              <p className="text-xs font-semibold tracking-[0.2em] text-[#56B9E8] mb-4">
                MARRAKECH · DESIGN &amp; IMPRESSION · {settings.hashtag}
              </p>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight leading-[1.08] text-white [text-wrap:balance]">
                Vos idées prennent forme.
              </h1>
              <p className="mt-5 text-base sm:text-lg text-white/75 leading-relaxed max-w-xl">
                Impression, design et personnalisation pour particuliers et entreprises à
                Marrakech. Cartes de visite, flyers, menus, roll-up, enseignes et objets sur
                mesure.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <Link
                  to="/devis"
                  className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-[#56B9E8] text-[#151515] text-sm font-bold hover:bg-[#F5D84C] transition-colors whitespace-nowrap"
                >
                  Obtenir un devis
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg border border-white/25 bg-white/5 text-white text-sm font-semibold hover:bg-white/10 transition-colors whitespace-nowrap"
                >
                  <MessageCircle className="h-4 w-4 text-[#F5D84C]" />
                  WhatsApp CreaPrint
                </a>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/65">
                <span>Roll-up 85×200 cm dès <strong className="text-[#F5D84C] tabular-nums">380 DH</strong></span>
                <span aria-hidden="true">·</span>
                <span>Conception sur mesure</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{settings.whatsappNumber}</span>
              </div>
            </div>

            {/* Hero Print Photography */}
            <div className="lg:col-span-6 relative">
              <div className="relative h-full min-h-[300px] lg:min-h-[430px] rounded-2xl overflow-hidden border border-white/10 bg-[#1F1F1F]">
                <img
                  src={ASSETS.heroStudio}
                  alt="Produits imprimés CreaPrint Marrakech : cartes de visite, brochures, stickers, t-shirt personnalisé et roll-up"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#151515]/90 via-[#151515]/45 to-transparent p-6">
                  <p className="text-xs font-medium text-white/90">
                    Imprimez votre image. Marquez les esprits.
                  </p>
                  <p className="text-xs text-white/65 mt-0.5">
                    Papeterie · Grand format · Enseignes · Textile &amp; Stickers
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. REASSURANCE BAR */}
      <section className="bg-white border-b border-[#E9E9E6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3.5">
              <span className="h-10 w-10 rounded-lg bg-[#56B9E8]/15 text-[#151515] inline-flex items-center justify-center shrink-0">
                <Zap className="h-5 w-5 text-[#151515]" />
              </span>
              <div>
                <p className="font-display text-sm font-bold text-[#151515]">Devis rapide</p>
                <p className="text-xs text-[#70849A]">Estimation claire en DH</p>
              </div>
            </div>
            <div className="flex items-center gap-3.5">
              <span className="h-10 w-10 rounded-lg bg-[#F5D84C]/25 text-[#151515] inline-flex items-center justify-center shrink-0">
                <Truck className="h-5 w-5 text-[#151515]" />
              </span>
              <div>
                <p className="font-display text-sm font-bold text-[#151515]">Livraison possible</p>
                <p className="text-xs text-[#70849A]">Ou retrait à l’atelier</p>
              </div>
            </div>
            <div className="flex items-center gap-3.5">
              <span className="h-10 w-10 rounded-lg bg-[#F17B9B]/20 text-[#151515] inline-flex items-center justify-center shrink-0">
                <FileCheck2 className="h-5 w-5 text-[#151515]" />
              </span>
              <div>
                <p className="font-display text-sm font-bold text-[#151515]">Fichiers vérifiés</p>
                <p className="text-xs text-[#70849A]">Contrôle avant impression</p>
              </div>
            </div>
            <div className="flex items-center gap-3.5">
              <span className="h-10 w-10 rounded-lg bg-[#70849A]/15 text-[#151515] inline-flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5 text-[#151515]" />
              </span>
              <div>
                <p className="font-display text-sm font-bold text-[#151515]">Service à Marrakech</p>
                <p className="text-xs text-[#70849A]">Accompagnement local dédié</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CLICKABLE PRODUCT CATEGORIES */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#151515] tracking-tight">
                Nos univers d’impression
              </h2>
              <p className="mt-2 text-sm sm:text-base text-[#525E6B] max-w-2xl">
                Du support de prospection quotidien à la signalétique extérieure de votre commerce,
                choisissez votre catégorie pour configurer votre besoin.
              </p>
            </div>
            <Link
              to="/catalogue"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#151515] hover:text-[#56B9E8] transition-colors whitespace-nowrap"
            >
              Voir tout le catalogue
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {categories.map((cat, idx) => (
              <Link
                key={cat.id}
                to={`/catalogue?categorie=${cat.slug}`}
                className={cn(
                  'group rounded-xl bg-white border border-[#E9E9E6] border-t-4 p-5 flex flex-col justify-between hover:shadow-md transition-all duration-150',
                  ACCENT_BORDER[cat.accent] || 'border-t-[#56B9E8]'
                )}
              >
                <div>
                  <span className="text-xs font-mono font-semibold text-[#70849A]">
                    0{idx + 1}
                  </span>
                  <h3 className="mt-2 font-display text-base font-bold text-[#151515] group-hover:text-[#56B9E8] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="mt-2 text-xs text-[#525E6B] leading-relaxed">
                    {cat.description}
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#151515] group-hover:translate-x-0.5 transition-transform">
                  Explorer <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
          </div>

          {/* Featured Products Preview */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="group rounded-xl bg-white border border-[#E9E9E6] overflow-hidden flex flex-col hover:shadow-md transition-shadow"
              >
                <div className="aspect-[4/3] bg-[#E9E9E6] overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs text-[#70849A] mb-1.5">
                      <span>{product.indicativeLeadTime}</span>
                      <span className="font-mono font-semibold text-[#151515] tabular-nums">
                        {product.startingPrice
                          ? `Dès ${formatDH(product.startingPrice)}`
                          : 'Sur devis'}
                      </span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-[#151515]">
                      {product.name}
                    </h3>
                    <p className="mt-1.5 text-sm text-[#525E6B] leading-relaxed">
                      {product.shortDescription}
                    </p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-[#E9E9E6] flex items-center justify-between">
                    <Link
                      to={`/devis?produit=${product.slug}`}
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-[#151515] hover:text-[#56B9E8] transition-colors"
                    >
                      Personnaliser &amp; Devis
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS — 4 STEPS */}
      <section className="py-16 lg:py-20 bg-white border-y border-[#E9E9E6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#151515] tracking-tight">
              Comment ça marche ?
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#525E6B]">
              Un parcours simple, sans jargon technique, avec un interlocuteur basé à Marrakech du
              fichier jusqu’au retrait ou à la livraison.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Choisissez votre produit',
                desc: 'Parcourez nos supports : cartes de visite, flyers, menus, roll-up, enseignes ou textiles.',
                accent: 'bg-[#56B9E8]',
              },
              {
                step: '02',
                title: 'Configurez votre commande',
                desc: 'Sélectionnez le format, la quantité, le papier, les finitions et l’option design si besoin.',
                accent: 'bg-[#F5D84C]',
              },
              {
                step: '03',
                title: 'Envoyez votre fichier',
                desc: 'Déposez votre PDF, AI, PSD, JPG ou PNG. Notre équipe contrôle systématiquement la qualité.',
                accent: 'bg-[#F17B9B]',
              },
              {
                step: '04',
                title: 'Recevez votre devis et validez',
                desc: 'Confirmez votre devis sur WhatsApp ou votre espace client pour lancer la production.',
                accent: 'bg-[#70849A]',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-xl bg-[#F7F7F4] border border-[#E9E9E6] p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className={cn(
                        'h-8 w-8 rounded-lg inline-flex items-center justify-center font-mono text-xs font-bold text-[#151515]',
                        item.accent
                      )}
                    >
                      {item.step}
                    </span>
                    <span className="h-px flex-1 bg-[#E9E9E6]" />
                  </div>
                  <h3 className="font-display text-base font-bold text-[#151515]">{item.title}</h3>
                  <p className="mt-2 text-sm text-[#525E6B] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. ADVANTAGES — ASYMMETRIC BENTO */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#151515] tracking-tight">
              Du design à l’impression, un seul atelier à Marrakech
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#525E6B]">
              Quatre pôles complémentaires pour assurer la cohérence visuelle de toute votre
              communication.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 rounded-2xl bg-[#151515] text-white p-8 flex flex-col justify-between">
              <div>
                <Printer className="h-7 w-7 text-[#56B9E8] mb-5" />
                <h3 className="font-display text-xl font-bold">
                  01. Impression numérique haute définition
                </h3>
                <p className="mt-3 text-sm text-white/75 leading-relaxed max-w-xl">
                  Idéale pour les petites et moyennes séries réactives : cartes de visite 350g,
                  flyers, menus de restaurants, brochures et étiquettes produits aux couleurs
                  fidèles et calibrées.
                </p>
              </div>
              <ul className="mt-6 pt-5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-white/80">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#56B9E8] shrink-0" />
                  Vérification prépresse avant tirage
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#F5D84C] shrink-0" />
                  Papiers couchés, texturés et kraft
                </li>
              </ul>
            </div>

            <div className="lg:col-span-5 rounded-2xl bg-white border border-[#E9E9E6] p-8 flex flex-col justify-between">
              <div>
                <Layers className="h-7 w-7 text-[#151515] mb-5" />
                <h3 className="font-display text-xl font-bold text-[#151515]">
                  02. Impression grand format &amp; enseignes
                </h3>
                <p className="mt-3 text-sm text-[#525E6B] leading-relaxed">
                  Roll-up 85×200 cm, bâches PVC avec œillets, habillage vitrine micro-perforé,
                  marquage véhicule et enseignes façade Alucobond ou lettres relief.
                </p>
              </div>
              <Link
                to="/services"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-[#151515] hover:text-[#56B9E8]"
              >
                Découvrir nos formats <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="lg:col-span-5 rounded-2xl bg-white border border-[#E9E9E6] p-8 flex flex-col justify-between">
              <div>
                <Palette className="h-7 w-7 text-[#F17B9B] mb-5" />
                <h3 className="font-display text-xl font-bold text-[#151515]">
                  03. Conception graphique intégrée
                </h3>
                <p className="mt-3 text-sm text-[#525E6B] leading-relaxed">
                  Vous partez d’une simple idée ou d’un ancien logo ? Nos graphistes créent des
                  maquettes modernes et prêtes à imprimer, validées par vos soins avant tirage.
                </p>
              </div>
              <p className="mt-6 text-xs text-[#70849A]">
                Ex. Conception Roll-up : +100 DH en option claire
              </p>
            </div>

            <div className="lg:col-span-7 rounded-2xl bg-white border border-[#E9E9E6] p-8 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              <div className="sm:col-span-7">
                <Sparkles className="h-7 w-7 text-[#70849A] mb-4" />
                <h3 className="font-display text-xl font-bold text-[#151515]">
                  04. Finitions professionnelles &amp; personnalisation
                </h3>
                <p className="mt-3 text-sm text-[#525E6B] leading-relaxed">
                  Pelliculage mat velours, vernis sélectif, découpe à la forme, reliures soignées,
                  flocage et DTF textile : chaque détail compte pour valoriser votre marque.
                </p>
              </div>
              <div className="sm:col-span-5 aspect-[4/3] rounded-xl overflow-hidden bg-[#E9E9E6]">
                <img
                  src={ASSETS.storefrontPhoto}
                  alt="Atelier CreaPrint Marrakech façade et vitrine"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. GALLERY PREVIEW */}
      <section className="py-16 lg:py-20 bg-white border-y border-[#E9E9E6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#151515] tracking-tight">
                Réalisations récentes à Marrakech
              </h2>
              <p className="mt-2 text-sm sm:text-base text-[#525E6B]">
                Aperçu de projets produits pour des restaurants, cabinets, boutiques et événements.
              </p>
            </div>
            <Link
              to="/realisations"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#151515] hover:text-[#56B9E8] transition-colors whitespace-nowrap"
            >
              Toute la galerie
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredGallery.map((item) => (
              <Link
                key={item.id}
                to="/realisations"
                className="group rounded-xl overflow-hidden bg-[#F7F7F4] border border-[#E9E9E6] flex flex-col"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[#E9E9E6]">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <p className="text-xs text-[#70849A]">
                    {item.clientSector} · {item.specs}
                  </p>
                  <h3 className="mt-1 font-display text-base font-bold text-[#151515] group-hover:text-[#56B9E8] transition-colors">
                    {item.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#151515] tracking-tight">
              Ils nous confient leurs impressions
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#525E6B]">
              Retours d’entreprises, commerçants et créateurs accompagnés à Marrakech.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="rounded-xl bg-white border border-[#E9E9E6] p-6 flex flex-col justify-between"
              >
                <div>
                  <p className="text-xs font-semibold text-[#70849A] mb-3">{t.projectType}</p>
                  <p className="text-sm text-[#151515] leading-relaxed">« {t.content} »</p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#E9E9E6]">
                  <p className="font-display text-sm font-bold text-[#151515]">{t.authorName}</p>
                  <p className="text-xs text-[#70849A]">
                    {t.role}, {t.organization}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FAQ */}
      <section className="py-16 lg:py-20 bg-white border-t border-[#E9E9E6]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#151515] tracking-tight text-center mb-10">
            Questions fréquentes
          </h2>
          <div className="divide-y divide-[#E9E9E6] border-y border-[#E9E9E6]">
            {FAQ_ITEMS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={faq.question} className="py-4">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between gap-4 text-left cursor-pointer py-1"
                    aria-expanded={isOpen}
                  >
                    <span className="font-display text-sm sm:text-base font-bold text-[#151515]">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={cn(
                        'h-5 w-5 text-[#70849A] shrink-0 transition-transform duration-150',
                        isOpen && 'rotate-180 text-[#151515]'
                      )}
                    />
                  </button>
                  {isOpen && (
                    <p className="mt-3 text-sm text-[#525E6B] leading-relaxed pr-6">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. FINAL WHATSAPP & QUOTE CTA */}
      <section className="bg-[#151515] text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold tracking-[0.2em] text-[#F5D84C] mb-3">
            {settings.hashtag}
          </p>
          <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight [text-wrap:balance]">
            Un projet d’impression ou d’enseigne à Marrakech ?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-white/75 max-w-2xl mx-auto">
            Configurez votre commande en ligne en moins de 2 minutes ou envoyez directement votre
            besoin sur WhatsApp au <strong className="text-white tabular-nums">{settings.whatsappNumber}</strong>.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              to="/devis"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-[#56B9E8] text-[#151515] text-sm font-bold hover:bg-[#F5D84C] transition-colors"
            >
              Configurer mon devis gratuit
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-[#F5D84C] text-[#151515] text-sm font-bold hover:bg-white transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              Écrire sur WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
