import React, { useMemo, useState } from 'react';
import {
  ArrowRightLeft,
  Copy,
  Download,
  MessageCircle,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useStore } from '@/src/context/StoreContext';
import { Button, Input, Label, Modal, Select, Textarea } from '@/src/components/ui/primitives';
import { calculateQuoteTotals, downloadQuotePdf } from '@/src/lib/pdfGenerator';
import { buildWhatsAppUrl, cn, formatDH, generateReference } from '@/src/lib/utils';
import type { Lead, LeadStatus, Quote, QuoteItem, QuoteStatus } from '@/src/types/creaprint';

const LEAD_STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: 'nouveau', label: 'Nouveau' },
  { value: 'contacte', label: 'Contacté' },
  { value: 'devis_envoye', label: 'Devis envoyé' },
  { value: 'gagne', label: 'Gagné' },
  { value: 'perdu', label: 'Perdu' },
];

const QUOTE_STATUS_OPTIONS: { value: QuoteStatus; label: string }[] = [
  { value: 'brouillon', label: 'Brouillon' },
  { value: 'envoye', label: 'Envoyé' },
  { value: 'accepte', label: 'Accepté' },
  { value: 'refuse', label: 'Refusé' },
  { value: 'expire', label: 'Expiré' },
];

export function AdminCrmModule() {
  const { leads, quotes, orders, updateLeadStatus, addLeadNote, addLeadTag } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | LeadStatus>('all');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [newTag, setNewTag] = useState('');

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (statusFilter !== 'all' && l.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          l.fullName.toLowerCase().includes(q) ||
          (l.company || '').toLowerCase().includes(q) ||
          l.phone.toLowerCase().includes(q) ||
          l.requestedProduct.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [leads, search, statusFilter]);

  const selectedLead: Lead | null = leads.find((l) => l.id === selectedLeadId) || null;

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !noteText.trim()) return;
    addLeadNote(selectedLead.id, noteText.trim(), followUpDate || undefined);
    setNoteText('');
    setFollowUpDate('');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer',
              statusFilter === 'all' ? 'bg-[#151515] text-white' : 'bg-white border border-[#E9E9E6]'
            )}
          >
            Tous ({leads.length})
          </button>
          {LEAD_STATUS_OPTIONS.map((st) => (
            <button
              key={st.value}
              type="button"
              onClick={() => setStatusFilter(st.value)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer',
                statusFilter === st.value
                  ? 'bg-[#151515] text-white'
                  : 'bg-white border border-[#E9E9E6]'
              )}
            >
              {st.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="h-4 w-4 text-[#70849A] absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher prospect, entreprise..."
            className="pl-9 h-10"
          />
        </div>
      </div>

      <div className="rounded-xl bg-white border border-[#E9E9E6] overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F7F7F4] border-b border-[#E9E9E6] text-[#70849A]">
            <tr>
              <th className="py-3 px-4 font-semibold">Client / Entreprise</th>
              <th className="py-3 px-4 font-semibold">Besoin</th>
              <th className="py-3 px-4 font-semibold">Origine</th>
              <th className="py-3 px-4 font-semibold">Statut</th>
              <th className="py-3 px-4 font-semibold text-right">Budget est.</th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E9E9E6]">
            {filtered.map((lead) => {
              const wa = buildWhatsAppUrl(
                lead.phone,
                `Bonjour ${lead.fullName}, suite à votre demande ${lead.reference} chez CreaPrint Marrakech concernant ${lead.requestedProduct}...`
              );
              return (
                <tr key={lead.id} className="hover:bg-[#F7F7F4]/60">
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => setSelectedLeadId(lead.id)}
                      className="text-left font-bold text-[#151515] hover:text-[#56B9E8] cursor-pointer"
                    >
                      {lead.fullName}
                    </button>
                    <p className="text-[11px] text-[#70849A]">
                      {lead.company || lead.city} · <span className="tabular-nums">{lead.phone}</span>
                    </p>
                  </td>
                  <td className="py-3 px-4 max-w-[240px]">
                    <p className="font-semibold text-[#151515] truncate">{lead.requestedProduct}</p>
                    <p className="text-[11px] text-[#70849A] truncate">{lead.tags.join(' · ')}</p>
                  </td>
                  <td className="py-3 px-4 capitalize text-[#525E6B]">{lead.source}</td>
                  <td className="py-3 px-4">
                    <select
                      value={lead.status}
                      onChange={(e) => updateLeadStatus(lead.id, e.target.value as LeadStatus)}
                      className="h-8 rounded-md border border-[#DCDCD7] bg-white px-2 text-xs font-semibold text-[#151515]"
                    >
                      {LEAD_STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-[#151515] tabular-nums">
                    {lead.estimatedBudget ? formatDH(lead.estimatedBudget) : '—'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <a
                        href={wa}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-8 px-2.5 inline-flex items-center gap-1 rounded-md bg-[#25D366]/15 text-[#15803D] font-semibold hover:bg-[#25D366]/25"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        WhatsApp
                      </a>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedLeadId(lead.id)}
                      >
                        Fiche
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Lead Full Detail Modal */}
      <Modal
        open={Boolean(selectedLead)}
        onClose={() => setSelectedLeadId(null)}
        title={selectedLead ? `Fiche prospect — ${selectedLead.fullName}` : ''}
        maxWidthClass="max-w-3xl"
      >
        {selectedLead && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl bg-[#F7F7F4] p-4 text-xs">
              <div>
                <p className="text-[#70849A]">Coordonnées</p>
                <p className="font-bold text-[#151515] mt-1">{selectedLead.fullName}</p>
                {selectedLead.company && <p>{selectedLead.company}</p>}
                <p className="tabular-nums">{selectedLead.phone}</p>
                {selectedLead.email && <p>{selectedLead.email}</p>}
              </div>
              <div>
                <p className="text-[#70849A]">Demande &amp; Origine</p>
                <p className="font-bold text-[#151515] mt-1">{selectedLead.requestedProduct}</p>
                <p className="capitalize">
                  Source : {selectedLead.source}
                  {selectedLead.utmCampaign ? ` (${selectedLead.utmCampaign})` : ''}
                </p>
                {selectedLead.nextFollowUp && (
                  <p className="text-[#D97706] font-semibold mt-1">
                    Relance prévue : {selectedLead.nextFollowUp}
                  </p>
                )}
              </div>
              <div className="sm:col-span-2 pt-2 border-t border-[#E9E9E6]">
                <p className="text-[#70849A]">Résumé</p>
                <p className="text-[#151515] mt-0.5">{selectedLead.summary}</p>
              </div>
            </div>

            {/* Tags */}
            <div>
              <Label>Tags client</Label>
              <div className="flex flex-wrap items-center gap-2">
                {selectedLead.tags.map((t) => (
                  <span
                    key={t}
                    className="text-xs font-semibold text-[#525E6B] bg-[#F7F7F4] px-2.5 py-1 rounded-md border border-[#E9E9E6]"
                  >
                    {t}
                  </span>
                ))}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    addLeadTag(selectedLead.id, newTag);
                    setNewTag('');
                  }}
                  className="inline-flex gap-1.5"
                >
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="+ Ajouter tag"
                    className="h-8 w-32 text-xs"
                  />
                  <Button type="submit" size="sm" variant="outline">
                    OK
                  </Button>
                </form>
              </div>
            </div>

            {/* Linked Quotes & Orders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl border border-[#E9E9E6] p-3.5">
                <p className="font-bold text-[#151515] mb-2">Devis liés</p>
                {quotes.filter((q) => q.leadId === selectedLead.id).length === 0 ? (
                  <p className="text-[#70849A]">Aucun devis lié.</p>
                ) : (
                  quotes
                    .filter((q) => q.leadId === selectedLead.id)
                    .map((q) => (
                      <p key={q.id} className="font-mono">
                        {q.reference} · {q.status}
                      </p>
                    ))
                )}
              </div>
              <div className="rounded-xl border border-[#E9E9E6] p-3.5">
                <p className="font-bold text-[#151515] mb-2">Commandes liées</p>
                {orders.filter((o) => o.clientPhone === selectedLead.phone).length === 0 ? (
                  <p className="text-[#70849A]">Aucune commande liée.</p>
                ) : (
                  orders
                    .filter((o) => o.clientPhone === selectedLead.phone)
                    .map((o) => (
                      <p key={o.id} className="font-mono">
                        {o.reference} · {o.status}
                      </p>
                    ))
                )}
              </div>
            </div>

            {/* Commercial Notes & Follow-up */}
            <form onSubmit={handleAddNote} className="space-y-3 pt-3 border-t border-[#E9E9E6]">
              <Label>Ajouter une note commerciale &amp; date de relance</Label>
              <Textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Ex. Client intéressé par 1000 flyers A5 + 2 roll-ups. Rappeler après validation logo."
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#70849A]">Date de relance :</span>
                  <Input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="h-9 w-44 text-xs"
                  />
                </div>
                <Button type="submit" size="sm">
                  Enregistrer la note
                </Button>
              </div>
            </form>

            {selectedLead.notes.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-[#151515]">Historique des notes</p>
                {selectedLead.notes.map((n) => (
                  <div key={n.id} className="rounded-lg bg-[#F7F7F4] p-3 text-xs">
                    <p className="text-[#151515]">{n.text}</p>
                    <p className="text-[11px] text-[#70849A] mt-1">
                      {n.author} · {new Date(n.createdAt).toLocaleDateString('fr-MA')}
                      {n.followUpDate ? ` · Relance : ${n.followUpDate}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export function AdminQuotesModule({ onConverted }: { onConverted: () => void }) {
  const { quotes, settings, createQuote, updateQuote, duplicateQuote, convertQuoteToOrder } =
    useStore();
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [isNew, setIsNew] = useState(false);

  const openNewQuote = () => {
    setIsNew(true);
    setEditingQuote({
      id: '',
      reference: generateReference('DEV'),
      clientName: '',
      clientCompany: '',
      clientPhone: '+212 6 ',
      clientEmail: '',
      clientCity: 'Marrakech',
      status: 'brouillon',
      items: [
        {
          id: `qi-${Date.now()}`,
          label: 'Roll-up 85×200 cm',
          description: 'Structure aluminium + impression bâche HD',
          quantity: 1,
          unitPrice: 380,
        },
      ],
      discountPercent: 0,
      tvaPercent: settings.defaultTvaPercent,
      validUntil: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
      notes: '',
      createdAt: new Date().toISOString(),
    });
  };

  const handleSaveQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuote || !editingQuote.clientName.trim()) return;
    if (isNew) {
      const { id: _id, createdAt: _c, ...rest } = editingQuote;
      createQuote(rest);
    } else {
      updateQuote(editingQuote.id, editingQuote);
    }
    setEditingQuote(null);
  };

  const updateItem = (idx: number, patch: Partial<QuoteItem>) => {
    if (!editingQuote) return;
    const next = editingQuote.items.map((it, i) => (i === idx ? { ...it, ...patch } : it));
    setEditingQuote({ ...editingQuote, items: next });
  };

  const addItem = () => {
    if (!editingQuote) return;
    setEditingQuote({
      ...editingQuote,
      items: [
        ...editingQuote.items,
        { id: `qi-${Date.now()}`, label: '', description: '', quantity: 1, unitPrice: 0 },
      ],
    });
  };

  const removeItem = (idx: number) => {
    if (!editingQuote || editingQuote.items.length <= 1) return;
    setEditingQuote({
      ...editingQuote,
      items: editingQuote.items.filter((_, i) => i !== idx),
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-[#525E6B]">
          Créez, dupliquez, exportez en PDF aux couleurs CreaPrint et convertissez vos devis acceptés
          en commandes.
        </p>
        <Button type="button" variant="cyan" onClick={openNewQuote}>
          <Plus className="h-4 w-4" />
          Nouveau devis
        </Button>
      </div>

      <div className="rounded-xl bg-white border border-[#E9E9E6] overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F7F7F4] border-b border-[#E9E9E6] text-[#70849A]">
            <tr>
              <th className="py-3 px-4 font-semibold">Réf.</th>
              <th className="py-3 px-4 font-semibold">Client</th>
              <th className="py-3 px-4 font-semibold">Statut</th>
              <th className="py-3 px-4 font-semibold text-right">Total TTC</th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E9E9E6]">
            {quotes.map((q) => {
              const totals = calculateQuoteTotals(q);
              return (
                <tr key={q.id} className="hover:bg-[#F7F7F4]/60">
                  <td className="py-3 px-4 font-mono font-bold text-[#151515]">{q.reference}</td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-[#151515]">{q.clientName}</p>
                    <p className="text-[11px] text-[#70849A]">
                      {q.clientCompany || q.clientPhone} · {q.items.length} ligne(s)
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={q.status}
                      onChange={(e) =>
                        updateQuote(q.id, { status: e.target.value as QuoteStatus })
                      }
                      className="h-8 rounded-md border border-[#DCDCD7] bg-white px-2 text-xs font-semibold text-[#151515]"
                    >
                      {QUOTE_STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-[#151515] tabular-nums">
                    {formatDH(totals.totalTTC)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5 flex-wrap justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsNew(false);
                          setEditingQuote(q);
                        }}
                      >
                        Modifier
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        title="Dupliquer"
                        onClick={() => duplicateQuote(q.id)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => downloadQuotePdf(q, settings, 'DEVIS')}
                      >
                        <Download className="h-3.5 w-3.5" />
                        PDF
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          convertQuoteToOrder(q.id);
                          onConverted();
                        }}
                      >
                        <ArrowRightLeft className="h-3.5 w-3.5" />
                        Commande
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Quote Modal */}
      <Modal
        open={Boolean(editingQuote)}
        onClose={() => setEditingQuote(null)}
        title={isNew ? 'Créer un nouveau devis' : `Modifier ${editingQuote?.reference}`}
        maxWidthClass="max-w-4xl"
      >
        {editingQuote && (
          <form onSubmit={handleSaveQuote} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label>Nom du client *</Label>
                <Input
                  required
                  value={editingQuote.clientName}
                  onChange={(e) =>
                    setEditingQuote({ ...editingQuote, clientName: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Entreprise</Label>
                <Input
                  value={editingQuote.clientCompany || ''}
                  onChange={(e) =>
                    setEditingQuote({ ...editingQuote, clientCompany: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Téléphone *</Label>
                <Input
                  required
                  value={editingQuote.clientPhone}
                  onChange={(e) =>
                    setEditingQuote({ ...editingQuote, clientPhone: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Label className="mb-0">Lignes du devis (HT en DH)</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-3.5 w-3.5" /> Ajouter une ligne
                </Button>
              </div>
              {editingQuote.items.map((item, idx) => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-start p-3 rounded-lg bg-[#F7F7F4] border border-[#E9E9E6]"
                >
                  <div className="sm:col-span-5 space-y-1.5">
                    <Input
                      placeholder="Désignation produit"
                      value={item.label}
                      onChange={(e) => updateItem(idx, { label: e.target.value })}
                      className="h-9 text-xs"
                    />
                    <Input
                      placeholder="Détails techniques (format, papier, finition)"
                      value={item.description}
                      onChange={(e) => updateItem(idx, { description: e.target.value })}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) || 1 })}
                      className="h-9 text-xs font-mono"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <Input
                      type="number"
                      min={0}
                      step="0.5"
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateItem(idx, { unitPrice: Number(e.target.value) || 0 })
                      }
                      className="h-9 text-xs font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2 flex items-center justify-between pt-2 text-xs font-mono font-bold">
                    <span>{formatDH(item.quantity * item.unitPrice)}</span>
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="text-[#70849A] hover:text-[#DC2626] cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-[#E9E9E6]">
              <div>
                <Label>Remise (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={editingQuote.discountPercent}
                  onChange={(e) =>
                    setEditingQuote({
                      ...editingQuote,
                      discountPercent: Number(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label>TVA (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={30}
                  value={editingQuote.tvaPercent}
                  onChange={(e) =>
                    setEditingQuote({ ...editingQuote, tvaPercent: Number(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="rounded-xl bg-[#151515] text-white p-3.5 text-right tabular-nums">
                <p className="text-[11px] text-white/65">Total TTC</p>
                <p className="font-mono text-xl font-bold text-[#F5D84C]">
                  {formatDH(calculateQuoteTotals(editingQuote).totalTTC)}
                </p>
              </div>
            </div>

            <div>
              <Label>Remarques sur le devis</Label>
              <Textarea
                value={editingQuote.notes || ''}
                onChange={(e) => setEditingQuote({ ...editingQuote, notes: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditingQuote(null)}>
                Annuler
              </Button>
              <Button type="submit" variant="cyan">
                Enregistrer le devis
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
