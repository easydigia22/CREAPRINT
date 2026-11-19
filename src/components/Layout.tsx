import React, { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, MessageCircle, Phone, Mail, Clock, MapPin, X, ShieldCheck } from 'lucide-react';
import { CreaPrintLogo } from '@/src/components/CreaPrintLogo';
import { useStore } from '@/src/context/StoreContext';
import { buildWhatsAppUrl, cn } from '@/src/lib/utils';

const NAV_LINKS = [
  { to: '/services', label: 'Services' },
  { to: '/catalogue', label: 'Catalogue' },
  { to: '/realisations', label: 'Réalisations' },
  { to: '/contact', label: 'Contact' },
  { to: '/mon-espace', label: 'Mon espace' },
];

export function Layout() {
  const { settings } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  React.useEffect(() => {
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  const whatsappHref = buildWhatsAppUrl(
    settings.whatsappNumber,
    settings.defaultWhatsAppMessage
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F4] text-[#151515]">
      {/* Top Navigation Bar — strict 3-zone contract on #151515 graphite */}
      <header className="sticky top-0 z-40 bg-[#151515] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <Link
            to="/"
            aria-label="CreaPrint — Accueil"
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#56B9E8] rounded-md shrink-0"
          >
            <CreaPrintLogo variant="light" size="md" />
          </Link>

          {/* Zone 2: 5 concise single-line navigation links */}
          <nav
            aria-label="Navigation principale"
            className="hidden lg:flex items-center gap-7"
          >
            {NAV_LINKS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'text-sm font-medium transition-colors whitespace-nowrap shrink-0 py-1 border-b-2',
                    isActive
                      ? 'text-white border-[#56B9E8]'
                      : 'text-white/75 border-transparent hover:text-white hover:border-[#F5D84C]'
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Zone 3: 1 Primary Conversion CTA + Mobile trigger */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/devis"
              className="hidden sm:inline-flex items-center justify-center h-10 px-5 rounded-lg bg-[#56B9E8] text-[#151515] text-sm font-bold hover:bg-[#F5D84C] transition-colors whitespace-nowrap shrink-0"
            >
              Obtenir un devis gratuit
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={mobileOpen}
              className="lg:hidden h-10 w-10 inline-flex items-center justify-center rounded-lg text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="lg:hidden bg-[#151515] border-t border-white/10 px-4 pt-3 pb-5 space-y-1">
            {NAV_LINKS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'block px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-white/10 text-[#56B9E8]'
                      : 'text-white/85 hover:bg-white/5 hover:text-white'
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/a-propos"
              className="block px-3.5 py-2.5 rounded-lg text-sm font-medium text-white/75 hover:bg-white/5 hover:text-white"
            >
              À propos
            </Link>
            <Link
              to="/admin"
              className="block px-3.5 py-2.5 rounded-lg text-sm font-medium text-[#F5D84C] hover:bg-white/5"
            >
              Dashboard Équipe
            </Link>
            <div className="pt-3 flex flex-col gap-2">
              <Link
                to="/devis"
                className="w-full h-11 inline-flex items-center justify-center rounded-lg bg-[#56B9E8] text-[#151515] text-sm font-bold"
              >
                Obtenir un devis gratuit
              </Link>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 text-white text-sm font-medium"
              >
                <MessageCircle className="h-4 w-4 text-[#F5D84C]" />
                WhatsApp {settings.phoneDisplay}
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Main Route Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer in #151515 graphite with #56B9E8 & #F5D84C accents */}
      <footer className="bg-[#151515] text-white border-t border-white/10">
        {/* Subtle 4-color brand hairline inspired by the logo symbol */}
        <div className="grid grid-cols-4 h-1 w-full">
          <div className="bg-[#F5D84C]" />
          <div className="bg-[#F17B9B]" />
          <div className="bg-[#56B9E8]" />
          <div className="bg-[#70849A]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand Column */}
            <div className="space-y-4">
              <CreaPrintLogo variant="light" showSignature size="md" />
              <p className="text-sm text-white/70 leading-relaxed">
                Votre partenaire design &amp; impression à Marrakech. Du design à l’impression, vos
                projets prennent forme pour particuliers et entreprises.
              </p>
              <p className="text-xs font-semibold text-[#56B9E8] tracking-wide">
                {settings.hashtag}
              </p>
              <div className="pt-1 flex items-center gap-3 text-xs text-white/60">
                <span className="text-white font-semibold">FR</span>
                <span aria-hidden="true">/</span>
                <span title="Version arabe en préparation">العربية (bientôt)</span>
              </div>
            </div>

            {/* Navigation Links */}
            <div>
              <h3 className="font-display text-sm font-bold text-white mb-4">Navigation</h3>
              <ul className="space-y-2.5 text-sm text-white/70">
                <li>
                  <Link to="/services" className="hover:text-[#56B9E8] transition-colors">
                    Nos services d’impression
                  </Link>
                </li>
                <li>
                  <Link to="/catalogue" className="hover:text-[#56B9E8] transition-colors">
                    Catalogue &amp; tarifs indicatifs
                  </Link>
                </li>
                <li>
                  <Link to="/devis" className="hover:text-[#F5D84C] transition-colors font-medium text-white">
                    Configurer un devis en ligne
                  </Link>
                </li>
                <li>
                  <Link to="/realisations" className="hover:text-[#56B9E8] transition-colors">
                    Galerie de réalisations
                  </Link>
                </li>
                <li>
                  <Link to="/a-propos" className="hover:text-[#56B9E8] transition-colors">
                    À propos de CreaPrint
                  </Link>
                </li>
                <li>
                  <Link to="/mon-espace" className="hover:text-[#56B9E8] transition-colors">
                    Espace client &amp; suivi
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact & Hours */}
            <div>
              <h3 className="font-display text-sm font-bold text-white mb-4">
                Contact &amp; Horaires
              </h3>
              <ul className="space-y-3 text-sm text-white/75">
                <li className="flex items-start gap-2.5">
                  <Phone className="h-4 w-4 text-[#56B9E8] mt-0.5 shrink-0" />
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#F5D84C] transition-colors font-medium tabular-nums"
                  >
                    {settings.whatsappNumber}
                  </a>
                </li>
                <li className="flex items-start gap-2.5">
                  <Mail className="h-4 w-4 text-[#56B9E8] mt-0.5 shrink-0" />
                  <a
                    href={`mailto:${settings.email}`}
                    className="hover:text-white transition-colors"
                  >
                    {settings.email}
                  </a>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-[#F5D84C] mt-0.5 shrink-0" />
                  <span>{settings.city}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Clock className="h-4 w-4 text-[#70849A] mt-0.5 shrink-0" />
                  <div className="space-y-1 text-xs text-white/65">
                    <p>{settings.openingHours.weekdays}</p>
                    <p>{settings.openingHours.saturday}</p>
                    <p>{settings.openingHours.sunday}</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Direct Conversion Box */}
            <div className="space-y-4">
              <h3 className="font-display text-sm font-bold text-white">Besoin d’un conseil ?</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Envoyez vos dimensions, quantités ou votre maquette directement sur WhatsApp pour
                une réponse rapide de notre équipe.
              </p>
              <div className="flex flex-col gap-2.5">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-lg bg-[#F5D84C] text-[#151515] text-sm font-bold hover:bg-[#56B9E8] transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  Discuter sur WhatsApp
                </a>
                <Link
                  to="/admin"
                  className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg border border-white/15 text-xs font-medium text-white/80 hover:text-white hover:border-white/30 transition-colors"
                >
                  <ShieldCheck className="h-4 w-4 text-[#56B9E8]" />
                  Accès Dashboard Équipe
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/55">
            <p>
              © {new Date().getFullYear()} {settings.companyName} — {settings.signature},{' '}
              {settings.city}. Tous droits réservés.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/contact" className="hover:text-white transition-colors">
                Nous contacter
              </Link>
              <span aria-hidden="true">·</span>
              <Link to="/devis" className="hover:text-white transition-colors">
                Demande de devis
              </Link>
              <span aria-hidden="true">·</span>
              <Link to="/admin" className="hover:text-[#F5D84C] transition-colors">
                Admin
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp CTA on all public pages */}
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Contacter CreaPrint sur WhatsApp au ${settings.whatsappNumber}`}
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2.5 h-12 px-4 sm:px-5 rounded-full bg-[#151515] text-white border border-white/15 shadow-lg hover:bg-[#232323] hover:scale-[1.02] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#56B9E8]"
      >
        <span className="h-7 w-7 rounded-full bg-[#25D366] text-white inline-flex items-center justify-center shrink-0">
          <MessageCircle className="h-4 w-4" />
        </span>
        <span className="hidden sm:inline text-sm font-semibold whitespace-nowrap">
          WhatsApp <span className="text-[#F5D84C] tabular-nums">{settings.phoneDisplay}</span>
        </span>
      </a>
    </div>
  );
}
