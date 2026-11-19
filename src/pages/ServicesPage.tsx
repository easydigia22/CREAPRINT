import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, MessageCircle } from 'lucide-react';
import { useStore } from '@/src/context/StoreContext';
import { buildWhatsAppUrl, formatDH } from '@/src/lib/utils';

export function ServicesPage() {
  const { products, categories, settings } = useStore();
  const activeProducts = products.filter((p) => p.active);

  const getCategoryName = (catId: string) =>
    categories.find((c) => c.id === catId)?.name || 'Impression';

  return (
    <div className="pb-20">
      {/* Page Header */}
      <section className="bg-[#151515] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-[0.2em] text-[#56B9E8] mb-3">
            SERVICES · IMPRIMERIE MARRAKECH
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight max-w-3xl [text-wrap:balance]">
            Nos services de design, d’impression et de signalétique
          </h1>
          <p className="mt-3 text-sm sm:text-base text-white/75 max-w-2xl">
            13 pôles dédiés pour équiper votre entreprise, votre restaurant, votre boutique ou vos
            événements à Marrakech. Délais communiqués à titre indicatif et confirmés dès validation
            de votre fichier.
          </p>
        </div>
      </section>

      {/* Services Detailed List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {activeProducts.map((service) => {
            const waUrl = buildWhatsAppUrl(
              settings.whatsappNumber,
              `Bonjour CreaPrint, je souhaite des informations pour le service : ${service.name}.`
            );
            return (
              <article
                key={service.id}
                className="rounded-2xl bg-white border border-[#E9E9E6] overflow-hidden flex flex-col justify-between shadow-[0_1px_2px_rgba(21,21,21,0.03)]"
              >
                <div>
                  <div className="aspect-[16/10] bg-[#E9E9E6] overflow-hidden">
                    <img
                      src={service.imageUrl}
                      alt={service.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between gap-2 text-xs text-[#70849A] mb-2">
                      <span>{getCategoryName(service.categoryId)}</span>
                      <span className="font-mono font-semibold text-[#151515] tabular-nums">
                        {service.startingPrice
                          ? `À partir de ${formatDH(service.startingPrice)}`
                          : 'Devis personnalisé'}
                      </span>
                    </div>

                    <h2 className="font-display text-xl font-bold text-[#151515]">
                      {service.name}
                    </h2>
                    <p className="mt-2 text-sm text-[#525E6B] leading-relaxed">
                      {service.description}
                    </p>

                    <ul className="mt-4 space-y-2">
                      {service.benefits.map((b) => (
                        <li key={b} className="flex items-start gap-2 text-xs sm:text-sm text-[#151515]">
                          <Check className="h-4 w-4 text-[#56B9E8] mt-0.5 shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-5 pt-4 border-t border-[#E9E9E6] space-y-1.5 text-xs text-[#525E6B]">
                      <p>
                        <strong className="text-[#151515]">Formats courants :</strong>{' '}
                        {service.options.formats.slice(0, 3).join(' · ')}
                      </p>
                      <p>
                        <strong className="text-[#151515]">Délai indicatif :</strong>{' '}
                        {service.indicativeLeadTime}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6 flex flex-wrap items-center gap-3">
                  <Link
                    to={`/devis?produit=${service.slug}`}
                    className="flex-1 min-w-[180px] h-11 inline-flex items-center justify-center gap-2 rounded-lg bg-[#151515] text-white text-sm font-semibold hover:bg-[#56B9E8] hover:text-[#151515] transition-colors"
                  >
                    Configurer ce produit
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-11 px-4 inline-flex items-center justify-center gap-2 rounded-lg border border-[#DCDCD7] text-sm font-semibold text-[#151515] hover:bg-[#F7F7F4] transition-colors"
                  >
                    <MessageCircle className="h-4 w-4 text-[#25D366]" />
                    WhatsApp
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
