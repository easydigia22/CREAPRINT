import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, HeartHandshake, Lightbulb, Zap } from 'lucide-react';
import { ASSETS } from '@/src/data/seedData';
import { useStore } from '@/src/context/StoreContext';

const VALUES = [
  {
    icon: Lightbulb,
    title: 'Créativité',
    description:
      'Nous pensons chaque support comme le reflet concret de votre image de marque : typographie lisible, contrastes justes et finitions pertinentes.',
    accent: 'text-[#F5D84C]',
  },
  {
    icon: Zap,
    title: 'Réactivité',
    description:
      'Échanges fluides par WhatsApp, vérification rapide des fichiers et suivi clair de la mise en production jusqu’au retrait ou à la livraison.',
    accent: 'text-[#56B9E8]',
  },
  {
    icon: Award,
    title: 'Qualité',
    description:
      'Contrôle systématique avant tirage, sélection rigoureuse des papiers, encres et vinyles adaptés aux usages professionnels et au climat de Marrakech.',
    accent: 'text-[#F17B9B]',
  },
  {
    icon: HeartHandshake,
    title: 'Accompagnement',
    description:
      'Que vous imprimiez 100 cartes de visite ou habilliez toute la façade de votre commerce, vous échangez avec une équipe locale qui conseille sans jargon.',
    accent: 'text-[#70849A]',
  },
];

export function AboutPage() {
  const { settings } = useStore();

  return (
    <div className="pb-20">
      <section className="bg-[#151515] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-[0.2em] text-[#56B9E8] mb-3">
            À PROPOS · {settings.hashtag}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight max-w-3xl [text-wrap:balance]">
            Votre partenaire design &amp; impression à Marrakech.
          </h1>
          <p className="mt-3 text-sm sm:text-base text-white/75 max-w-2xl">
            CreaPrint accompagne les entreprises, cafés, riads, commerces, associations et
            particuliers dans la conception et la fabrication de tous leurs supports visuels.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#151515]">
              Du design à l’impression, vos projets prennent forme.
            </h2>
            <p className="text-sm sm:text-base text-[#525E6B] leading-relaxed">
              Implantée à Marrakech, notre imprimerie réunit sous un même toit un studio de
              création graphique, un atelier d’impression numérique, un pôle grand format /
              enseignes et un espace de personnalisation textile et objets.
            </p>
            <p className="text-sm sm:text-base text-[#525E6B] leading-relaxed">
              Notre approche est simple : écouter votre besoin réel, vous conseiller le bon papier
              ou support au juste prix, vérifier vos fichiers avant tirage et vous livrer des
              supports propres, fidèles et durables.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/devis"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-[#151515] text-white text-sm font-semibold hover:bg-[#56B9E8] hover:text-[#151515] transition-colors"
              >
                Demander un devis
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-lg border border-[#DCDCD7] bg-white text-[#151515] text-sm font-semibold hover:bg-[#F7F7F4] transition-colors"
              >
                Nous contacter
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-2xl overflow-hidden border border-[#E9E9E6] bg-[#151515] shadow-sm">
              <img
                src={ASSETS.storefrontPhoto}
                alt="Devanture CreaPrint — Design & Impression à Marrakech"
                referrerPolicy="no-referrer"
                className="w-full h-[420px] object-cover"
              />
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mt-16 pt-12 border-t border-[#E9E9E6]">
          <h2 className="font-display text-2xl font-extrabold text-[#151515] mb-8">
            Nos 4 engagements au quotidien
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.title}
                  className="rounded-xl bg-white border border-[#E9E9E6] p-6"
                >
                  <span className="h-10 w-10 rounded-lg bg-[#151515] inline-flex items-center justify-center mb-4">
                    <Icon className={`h-5 w-5 ${v.accent}`} />
                  </span>
                  <h3 className="font-display text-base font-bold text-[#151515]">{v.title}</h3>
                  <p className="mt-2 text-sm text-[#525E6B] leading-relaxed">{v.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
