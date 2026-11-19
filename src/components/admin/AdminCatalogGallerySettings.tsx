import React, { useState } from 'react';
import { Eye, EyeOff, Plus, Save, Trash2 } from 'lucide-react';
import { useStore } from '@/src/context/StoreContext';
import { ASSETS } from '@/src/data/seedData';
import { Button, Input, Label, Modal, Select, Textarea } from '@/src/components/ui/primitives';
import { formatDH } from '@/src/lib/utils';
import type { GalleryCategory, GalleryItem, Product, UserRole } from '@/src/types/creaprint';

export function AdminProductsModule() {
  const { products, categories, upsertProduct, toggleProductActive, addCategory } = useStore();
  const [editing, setEditing] = useState<Product | null>(null);
  const [newCatName, setNewCatName] = useState('');

  const openNewProduct = () => {
    setEditing({
      id: `prod-${Date.now()}`,
      slug: `produit-${Date.now()}`,
      categoryId: categories[0]?.id || '',
      name: '',
      shortDescription: '',
      description: '',
      benefits: ['Qualité professionnelle CreaPrint', 'Vérification fichier incluse'],
      imageUrl: ASSETS.businessCards,
      startingPrice: 250,
      unitPriceBase: 2.5,
      minQty: 100,
      indicativeLeadTime: '48h ouvrées (indicatif)',
      active: true,
      featured: false,
      options: {
        formats: ['Standard'],
        papers: ['Couché 350g'],
        finishings: ['Sans finition', 'Pelliculage Mat'],
        quantities: [100, 250, 500],
        supportsDoubleSided: true,
        supportsColorChoice: true,
        supportsOrientation: true,
      },
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing || !editing.name.trim()) return;
    upsertProduct({
      ...editing,
      slug:
        editing.slug ||
        editing.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
    });
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!newCatName.trim()) return;
            addCategory({
              name: newCatName.trim(),
              slug: newCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              description: 'Catégorie personnalisée CreaPrint.',
              accent: 'cyan',
              order: categories.length + 1,
            });
            setNewCatName('');
          }}
          className="flex items-center gap-2"
        >
          <Input
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Nouvelle catégorie..."
            className="h-10 w-56"
          />
          <Button type="submit" variant="outline" size="md">
            + Catégorie
          </Button>
        </form>

        <Button type="button" variant="cyan" onClick={openNewProduct}>
          <Plus className="h-4 w-4" />
          Nouveau produit
        </Button>
      </div>

      <div className="rounded-xl bg-white border border-[#E9E9E6] overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F7F7F4] border-b border-[#E9E9E6] text-[#70849A]">
            <tr>
              <th className="py-3 px-4 font-semibold">Produit</th>
              <th className="py-3 px-4 font-semibold">Catégorie</th>
              <th className="py-3 px-4 font-semibold">Délai indicatif</th>
              <th className="py-3 px-4 font-semibold text-right">À partir de</th>
              <th className="py-3 px-4 font-semibold text-center">Visibilité</th>
              <th className="py-3 px-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E9E9E6]">
            {products.map((p) => {
              const cat = categories.find((c) => c.id === p.categoryId);
              return (
                <tr key={p.id}>
                  <td className="py-3 px-4 font-bold text-[#151515]">{p.name}</td>
                  <td className="py-3 px-4 text-[#525E6B]">{cat?.name}</td>
                  <td className="py-3 px-4 text-[#525E6B]">{p.indicativeLeadTime}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                    {p.startingPrice ? formatDH(p.startingPrice) : 'Sur devis'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => toggleProductActive(p.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold cursor-pointer"
                    >
                      {p.active ? (
                        <>
                          <Eye className="h-4 w-4 text-[#16A34A]" /> Public
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-4 w-4 text-[#70849A]" /> Masqué
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button type="button" variant="outline" size="sm" onClick={() => setEditing(p)}>
                      Modifier
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?.name ? `Modifier : ${editing.name}` : 'Nouveau produit'}
      >
        {editing && (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Nom du produit *</Label>
                <Input
                  required
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Catégorie</Label>
                <Select
                  value={editing.categoryId}
                  onChange={(e) => setEditing({ ...editing, categoryId: e.target.value })}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Prix de départ (DH — vide = sur devis)</Label>
                <Input
                  type="number"
                  value={editing.startingPrice ?? ''}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      startingPrice: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>
              <div>
                <Label>Délai standard indicatif</Label>
                <Input
                  value={editing.indicativeLeadTime}
                  onChange={(e) => setEditing({ ...editing, indicativeLeadTime: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Description courte</Label>
              <Input
                value={editing.shortDescription}
                onChange={(e) => setEditing({ ...editing, shortDescription: e.target.value })}
              />
            </div>
            <div>
              <Label>Formats disponibles (séparés par une virgule)</Label>
              <Input
                value={editing.options.formats.join(', ')}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    options: {
                      ...editing.options,
                      formats: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    },
                  })
                }
              />
            </div>
            <div>
              <Label>Papiers / Matières (séparés par une virgule)</Label>
              <Input
                value={editing.options.papers.join(', ')}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    options: {
                      ...editing.options,
                      papers: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    },
                  })
                }
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                Annuler
              </Button>
              <Button type="submit" variant="cyan">
                Enregistrer
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

export function AdminGalleryModule() {
  const { gallery, upsertGalleryItem, deleteGalleryItem } = useStore();
  const [editing, setEditing] = useState<GalleryItem | null>(null);

  const openNew = () => {
    setEditing({
      id: `gal-${Date.now()}`,
      title: '',
      category: 'cartes',
      clientSector: 'Entreprise — Marrakech',
      description: '',
      imageUrl: ASSETS.heroStudio,
      specs: '',
      featured: true,
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-[#525E6B]">
          Ajoutez ou modifiez les réalisations affichées sur l’accueil et la page /realisations.
        </p>
        <Button type="button" variant="cyan" onClick={openNew}>
          <Plus className="h-4 w-4" />
          Ajouter une réalisation
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {gallery.map((item) => (
          <div
            key={item.id}
            className="rounded-xl bg-white border border-[#E9E9E6] overflow-hidden flex flex-col justify-between"
          >
            <div>
              <img
                src={item.imageUrl}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="w-full h-44 object-cover bg-[#E9E9E6]"
              />
              <div className="p-4">
                <p className="text-[11px] text-[#70849A] capitalize">
                  {item.category} · {item.clientSector}
                </p>
                <h3 className="font-display text-sm font-bold text-[#151515] mt-1">{item.title}</h3>
              </div>
            </div>
            <div className="px-4 pb-4 flex items-center justify-between gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditing(item)}>
                Modifier
              </Button>
              <button
                type="button"
                onClick={() => deleteGalleryItem(item.id)}
                className="h-9 w-9 rounded-lg inline-flex items-center justify-center text-[#70849A] hover:text-[#DC2626] hover:bg-[#F7F7F4] cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Éditer la réalisation"
      >
        {editing && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!editing.title.trim()) return;
              upsertGalleryItem(editing);
              setEditing(null);
            }}
            className="space-y-4"
          >
            <div>
              <Label>Titre *</Label>
              <Input
                required
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Catégorie</Label>
                <Select
                  value={editing.category}
                  onChange={(e) =>
                    setEditing({ ...editing, category: e.target.value as GalleryCategory })
                  }
                >
                  <option value="cartes">Cartes</option>
                  <option value="vetements">Vêtements</option>
                  <option value="enseignes">Enseignes</option>
                  <option value="affiches">Affiches</option>
                  <option value="evenements">Événements</option>
                  <option value="restaurants">Restaurants</option>
                </Select>
              </div>
              <div>
                <Label>Client / Secteur</Label>
                <Input
                  value={editing.clientSector}
                  onChange={(e) => setEditing({ ...editing, clientSector: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Spécifications techniques</Label>
              <Input
                value={editing.specs}
                onChange={(e) => setEditing({ ...editing, specs: e.target.value })}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                Annuler
              </Button>
              <Button type="submit" variant="cyan">
                Enregistrer
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

export function AdminSettingsModule() {
  const { settings, team, updateSettings, addTeamMember, updateTeamRole } = useStore();
  const [form, setForm] = useState(settings);
  const [savedNotice, setSavedNotice] = useState(false);

  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<UserRole>('commercial');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-xl bg-white border border-[#E9E9E6] p-6 space-y-4">
          <h3 className="font-display text-base font-bold text-[#151515]">
            Coordonnées, Horaires &amp; Carte Marrakech
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Téléphone affiché</Label>
              <Input
                value={form.phoneDisplay}
                onChange={(e) => setForm({ ...form, phoneDisplay: e.target.value })}
              />
            </div>
            <div>
              <Label>Numéro WhatsApp international</Label>
              <Input
                value={form.whatsappNumber}
                onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
              />
            </div>
            <div>
              <Label>E-mail de contact</Label>
              <Input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <Label>Requête Google Maps (modifiable)</Label>
              <Input
                value={form.mapsQuery}
                onChange={(e) => setForm({ ...form, mapsQuery: e.target.value })}
                placeholder="Ex. Guéliz, Marrakech, Maroc ou lat,lng"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Libellé d’adresse affiché sur /contact</Label>
              <Input
                value={form.addressLabel}
                onChange={(e) => setForm({ ...form, addressLabel: e.target.value })}
              />
            </div>
            <div>
              <Label>Horaires Lundi–Vendredi</Label>
              <Input
                value={form.openingHours.weekdays}
                onChange={(e) =>
                  setForm({
                    ...form,
                    openingHours: { ...form.openingHours, weekdays: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <Label>Horaires Samedi</Label>
              <Input
                value={form.openingHours.saturday}
                onChange={(e) =>
                  setForm({
                    ...form,
                    openingHours: { ...form.openingHours, saturday: e.target.value },
                  })
                }
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white border border-[#E9E9E6] p-6 space-y-4">
          <h3 className="font-display text-base font-bold text-[#151515]">
            WhatsApp par défaut, Facturation &amp; Conditions
          </h3>
          <div>
            <Label>Message WhatsApp par défaut</Label>
            <Input
              value={form.defaultWhatsAppMessage}
              onChange={(e) => setForm({ ...form, defaultWhatsAppMessage: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <Label>ICE</Label>
              <Input
                value={form.billingInfo.ice}
                onChange={(e) =>
                  setForm({ ...form, billingInfo: { ...form.billingInfo, ice: e.target.value } })
                }
              />
            </div>
            <div>
              <Label>RC</Label>
              <Input
                value={form.billingInfo.rc}
                onChange={(e) =>
                  setForm({ ...form, billingInfo: { ...form.billingInfo, rc: e.target.value } })
                }
              />
            </div>
            <div>
              <Label>TVA par défaut (%)</Label>
              <Input
                type="number"
                value={form.defaultTvaPercent}
                onChange={(e) =>
                  setForm({ ...form, defaultTvaPercent: Number(e.target.value) || 0 })
                }
              />
            </div>
            <div>
              <Label>Google Analytics ID (GA4)</Label>
              <Input
                value={form.gaMeasurementId}
                onChange={(e) => setForm({ ...form, gaMeasurementId: e.target.value })}
                placeholder="G-XXXXXXXXXX"
              />
            </div>
          </div>
          <div>
            <Label>Conditions générales sur devis PDF</Label>
            <Textarea
              value={form.termsSummary}
              onChange={(e) => setForm({ ...form, termsSummary: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" variant="cyan">
              <Save className="h-4 w-4" />
              Enregistrer les paramètres
            </Button>
            {savedNotice && (
              <span className="text-xs font-semibold text-[#16A34A]">
                Paramètres enregistrés et appliqués au site.
              </span>
            )}
          </div>
        </div>
      </form>

      {/* Team & Roles */}
      <div className="rounded-xl bg-white border border-[#E9E9E6] p-6 space-y-4">
        <h3 className="font-display text-base font-bold text-[#151515]">
          Utilisateurs &amp; Rôles équipe
        </h3>
        <div className="divide-y divide-[#E9E9E6]">
          {team
            .filter((m) => m.role !== 'client')
            .map((m) => (
              <div key={m.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-[#151515]">{m.fullName}</p>
                  <p className="text-xs text-[#70849A]">{m.email}</p>
                </div>
                <select
                  value={m.role}
                  onChange={(e) => updateTeamRole(m.id, e.target.value as UserRole)}
                  className="h-9 rounded-lg border border-[#DCDCD7] bg-white px-3 text-xs font-semibold"
                >
                  <option value="admin">Administrateur</option>
                  <option value="commercial">Commercial</option>
                  <option value="production">Production</option>
                </select>
              </div>
            ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!newMemberName.trim() || !newMemberEmail.trim()) return;
            addTeamMember({
              fullName: newMemberName.trim(),
              email: newMemberEmail.trim(),
              phone: settings.whatsappNumber,
              city: 'Marrakech',
              role: newMemberRole,
              active: true,
            });
            setNewMemberName('');
            setNewMemberEmail('');
          }}
          className="pt-4 border-t border-[#E9E9E6] grid grid-cols-1 sm:grid-cols-4 gap-2"
        >
          <Input
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            placeholder="Nom membre"
          />
          <Input
            type="email"
            value={newMemberEmail}
            onChange={(e) => setNewMemberEmail(e.target.value)}
            placeholder="email@creaprint.ma"
          />
          <Select
            value={newMemberRole}
            onChange={(e) => setNewMemberRole(e.target.value as UserRole)}
          >
            <option value="commercial">Commercial</option>
            <option value="production">Production</option>
            <option value="admin">Administrateur</option>
          </Select>
          <Button type="submit" variant="primary">
            Ajouter membre
          </Button>
        </form>
      </div>
    </div>
  );
}
