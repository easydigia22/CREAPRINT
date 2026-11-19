import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Maximize2 } from 'lucide-react';
import { useStore } from '@/src/context/StoreContext';
import { Modal } from '@/src/components/ui/primitives';
import type { GalleryCategory, GalleryItem } from '@/src/types/creaprint';
import { cn } from '@/src/lib/utils';

const GALLERY_FILTERS: { id: 'all' | GalleryCategory; label: string }[] = [
  { id: 'all', label: 'Toutes' },
  { id: 'cartes', label: 'Cartes' },
  { id: 'vetements', label: 'Vêtements' },
  { id: 'enseignes', label: 'Enseignes' },
  { id: 'affiches', label: 'Affiches' },
  { id: 'evenements', label: 'Événements' },
  { id: 'restaurants', label: 'Restaurants' },
];

export function RealisationsPage() {
  const { gallery } = useStore();
  const [filter, setFilter] = useState<'all' | GalleryCategory>('all');
  const [selected, setSelected] = useState<GalleryItem | null>(null);

  const items = filter === 'all' ? gallery : gallery.filter((g) => g.category === filter);

  return (
    <div className="pb-20">
      <section className="bg-[#151515] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-[0.2em] text-[#F17B9B] mb-3">
            PORTFOLIO · #CreaPrintMarrakech
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
            Nos réalisations d’impression et signalétique
          </h1>
          <p className="mt-3 text-sm sm:text-base text-white/75 max-w-2xl">
            Sélection de projets conçus et imprimés pour des professionnels, commerces, hôtels et
            événements à Marrakech.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Filter tabs */}
        <div className="flex flex-wrap items-center gap-2 pb-8 border-b border-[#E9E9E6]">
          {GALLERY_FILTERS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={cn(
                'px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap',
                filter === tab.id
                  ? 'bg-[#151515] text-white'
                  : 'bg-white border border-[#E9E9E6] text-[#151515] hover:bg-[#E9E9E6]/60'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelected(item)}
              className="group text-left rounded-xl bg-white border border-[#E9E9E6] overflow-hidden hover:shadow-md transition-all cursor-pointer flex flex-col"
            >
              <div className="relative aspect-[4/3] w-full bg-[#E9E9E6] overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                />
                <span className="absolute top-3 right-3 h-8 w-8 rounded-lg bg-[#151515]/80 text-white inline-flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="h-4 w-4" />
                </span>
              </div>
              <div className="p-5 flex-1">
                <p className="text-xs text-[#70849A]">{item.clientSector}</p>
                <h2 className="mt-1 font-display text-base font-bold text-[#151515] group-hover:text-[#56B9E8] transition-colors">
                  {item.title}
                </h2>
                <p className="mt-2 text-xs text-[#525E6B] line-clamp-2">{item.description}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Lightbox Modal */}
      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.title}
        maxWidthClass="max-w-3xl"
      >
        {selected && (
          <div className="space-y-5">
            <div className="rounded-xl overflow-hidden bg-[#151515] max-h-[420px]">
              <img
                src={selected.imageUrl}
                alt={selected.title}
                referrerPolicy="no-referrer"
                className="w-full h-full max-h-[420px] object-contain mx-auto"
              />
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#70849A]">
              <span>
                <strong className="text-[#151515]">Secteur :</strong> {selected.clientSector}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                <strong className="text-[#151515]">Spécifications :</strong> {selected.specs}
              </span>
            </div>
            <p className="text-sm text-[#151515] leading-relaxed">{selected.description}</p>
            <div className="pt-3 border-t border-[#E9E9E6] flex justify-end">
              <Link
                to="/devis"
                onClick={() => setSelected(null)}
                className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-[#151515] text-white text-sm font-semibold hover:bg-[#56B9E8] hover:text-[#151515] transition-colors"
              >
                Demander un projet similaire
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
