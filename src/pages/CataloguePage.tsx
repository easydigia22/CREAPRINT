import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Clock, Search } from 'lucide-react';
import { useStore } from '@/src/context/StoreContext';
import { Input } from '@/src/components/ui/primitives';
import { cn, formatDH } from '@/src/lib/utils';

export function CataloguePage() {
  const { products, categories } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCat = searchParams.get('categorie') || 'all';
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [query, setQuery] = useState('');

  const handleSelectCat = (slug: string) => {
    setSelectedCategory(slug);
    if (slug === 'all') {
      searchParams.delete('categorie');
    } else {
      searchParams.set('categorie', slug);
    }
    setSearchParams(searchParams, { replace: true });
  };

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (!p.active) return false;
      if (selectedCategory !== 'all') {
        const cat = categories.find((c) => c.id === p.categoryId);
        if (!cat || cat.slug !== selectedCategory) return false;
      }
      if (query.trim()) {
        const q = query.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, categories, selectedCategory, query]);

  return (
    <div className="pb-20">
      <section className="bg-[#151515] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-[0.2em] text-[#F5D84C] mb-3">
            CATALOGUE PRODUITS
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
            Tous nos supports personnalisables
          </h1>
          <p className="mt-3 text-sm sm:text-base text-white/75 max-w-2xl">
            Filtrez par catégorie ou recherchez un support précis. Tarifs indicatifs en dirham
            marocain (DH) — cliquez sur « Personnaliser » pour configurer votre devis.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Search & Category Filter Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-8 border-b border-[#E9E9E6]">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleSelectCat('all')}
              className={cn(
                'px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap',
                selectedCategory === 'all'
                  ? 'bg-[#151515] text-white'
                  : 'bg-white border border-[#E9E9E6] text-[#151515] hover:bg-[#E9E9E6]/60'
              )}
            >
              Tous ({products.filter((p) => p.active).length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelectCat(cat.slug)}
                className={cn(
                  'px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap',
                  selectedCategory === cat.slug
                    ? 'bg-[#151515] text-white'
                    : 'bg-white border border-[#E9E9E6] text-[#151515] hover:bg-[#E9E9E6]/60'
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-80">
            <Search className="h-4 w-4 text-[#70849A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un produit (flyer, roll-up, menu...)"
              className="pl-10"
            />
          </div>
        </div>

        {/* Product Grid */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-[#E9E9E6] mt-8">
            <p className="font-display text-lg font-bold text-[#151515]">
              Aucun produit trouvé pour cette recherche.
            </p>
            <p className="mt-1 text-sm text-[#70849A]">
              Essayez un autre mot-clé ou demandez un devis sur mesure pour un support spécifique.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  handleSelectCat('all');
                }}
                className="h-10 px-4 rounded-lg border border-[#DCDCD7] text-sm font-semibold text-[#151515] hover:bg-[#F7F7F4] cursor-pointer"
              >
                Réinitialiser les filtres
              </button>
              <Link
                to="/devis"
                className="h-10 px-5 inline-flex items-center rounded-lg bg-[#151515] text-white text-sm font-semibold"
              >
                Devis sur mesure
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product) => {
              const cat = categories.find((c) => c.id === product.categoryId);
              return (
                <div
                  key={product.id}
                  className="rounded-xl bg-white border border-[#E9E9E6] overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="aspect-[4/3] bg-[#E9E9E6] overflow-hidden">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between text-xs text-[#70849A] mb-1.5">
                        <span>{cat?.name}</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {product.indicativeLeadTime.replace(' (indicatif)', '')}
                        </span>
                      </div>
                      <h2 className="font-display text-lg font-bold text-[#151515]">
                        {product.name}
                      </h2>
                      <p className="mt-1.5 text-sm text-[#525E6B] leading-relaxed">
                        {product.shortDescription}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-3 border-t border-[#E9E9E6] flex items-center justify-between gap-3">
                    <div>
                      {product.startingPrice ? (
                        <div>
                          <span className="block text-[11px] text-[#70849A]">À partir de</span>
                          <span className="font-mono text-base font-bold text-[#151515] tabular-nums">
                            {formatDH(product.startingPrice)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-[#70849A]">
                          Sur devis personnalisé
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/devis?produit=${product.slug}`}
                      className="h-10 px-4 inline-flex items-center gap-1.5 rounded-lg bg-[#151515] text-white text-xs font-bold hover:bg-[#56B9E8] hover:text-[#151515] transition-colors whitespace-nowrap"
                    >
                      Personnaliser
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
