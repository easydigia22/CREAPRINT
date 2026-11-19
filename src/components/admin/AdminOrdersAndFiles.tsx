import React, { useState } from 'react';
import {
  CheckCircle2,
  FileText,
  MessageSquare,
  Send,
  XCircle,
} from 'lucide-react';
import { useStore } from '@/src/context/StoreContext';
import { Button, Input, Label, Modal, Select } from '@/src/components/ui/primitives';
import { cn, formatDH, formatFileSize } from '@/src/lib/utils';
import type { FileReviewStatus, Order, OrderStatus } from '@/src/types/creaprint';

const KANBAN_COLUMNS: { id: OrderStatus; title: string; accent: string }[] = [
  { id: 'a_verifier', title: 'À vérifier', accent: 'border-t-[#70849A]' },
  { id: 'devis_valide', title: 'Devis validé', accent: 'border-t-[#56B9E8]' },
  { id: 'en_production', title: 'En production', accent: 'border-t-[#F5D84C]' },
  { id: 'controle_qualite', title: 'Contrôle qualité', accent: 'border-t-[#F17B9B]' },
  { id: 'prete', title: 'Prête', accent: 'border-t-[#16A34A]' },
  { id: 'livree', title: 'Livrée', accent: 'border-t-[#151515]' },
];

export function AdminOrdersModule() {
  const {
    orders,
    team,
    currentUser,
    updateOrderStatus,
    updateOrderDetails,
    addOrderInternalNote,
    addOrderMessage,
  } = useStore();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [internalNote, setInternalNote] = useState('');
  const [clientReply, setClientReply] = useState('');

  const selectedOrder: Order | null = orders.find((o) => o.id === selectedOrderId) || null;
  const staff = team.filter((t) => t.role !== 'client');

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#525E6B]">
        Suivez la production étape par étape, assignez un responsable, gérez les acomptes et
        répondez aux clients.
      </p>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3.5 items-start">
        {KANBAN_COLUMNS.map((col) => {
          const colOrders = orders.filter((o) => o.status === col.id);
          return (
            <div
              key={col.id}
              className={cn(
                'rounded-xl bg-[#F7F7F4] border border-[#E9E9E6] border-t-4 p-3 min-h-[260px]',
                col.accent
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-xs font-bold text-[#151515]">{col.title}</h3>
                <span className="font-mono text-xs font-bold text-[#70849A] tabular-nums">
                  {colOrders.length}
                </span>
              </div>

              <div className="space-y-2.5">
                {colOrders.map((order) => {
                  const due = Math.max(0, order.totalTTC - order.amountPaid);
                  return (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrderId(order.id)}
                      className="rounded-lg bg-white border border-[#E9E9E6] p-3 hover:border-[#151515] transition-colors cursor-pointer space-y-2"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#70849A]">
                        <span>{order.reference}</span>
                        <span>{order.estimatedDeliveryDate}</span>
                      </div>
                      <p className="text-xs font-bold text-[#151515] leading-snug">
                        {order.productName}
                      </p>
                      <p className="text-[11px] text-[#525E6B] truncate">
                        {order.clientName}
                        {order.clientCompany ? ` · ${order.clientCompany}` : ''}
                      </p>
                      <div className="pt-2 border-t border-[#E9E9E6] flex items-center justify-between text-[11px] tabular-nums">
                        <span className="font-semibold text-[#151515]">
                          {formatDH(order.totalTTC)}
                        </span>
                        <span
                          className={cn(
                            'font-semibold',
                            due === 0 ? 'text-[#16A34A]' : 'text-[#D97706]'
                          )}
                        >
                          {due === 0 ? 'Payé' : `Reste ${formatDH(due)}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {colOrders.length === 0 && (
                  <p className="text-[11px] text-[#70849A] text-center py-8">Aucune commande</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Detail Modal */}
      <Modal
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrderId(null)}
        title={selectedOrder ? `Commande ${selectedOrder.reference}` : ''}
        maxWidthClass="max-w-3xl"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Statut Kanban</Label>
                <Select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    updateOrderStatus(selectedOrder.id, e.target.value as OrderStatus)
                  }
                >
                  {KANBAN_COLUMNS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                  <option value="annulee">Annulée</option>
                </Select>
              </div>
              <div>
                <Label>Responsable assigné</Label>
                <Select
                  value={selectedOrder.assignedTo}
                  onChange={(e) =>
                    updateOrderDetails(selectedOrder.id, { assignedTo: e.target.value })
                  }
                >
                  {staff.map((s) => (
                    <option key={s.id} value={s.fullName}>
                      {s.fullName} ({s.role})
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Livraison prévue (indicative)</Label>
                <Input
                  type="date"
                  value={selectedOrder.estimatedDeliveryDate}
                  onChange={(e) =>
                    updateOrderDetails(selectedOrder.id, {
                      estimatedDeliveryDate: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* Payment Tracking */}
            <div className="rounded-xl bg-[#F7F7F4] border border-[#E9E9E6] p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end tabular-nums">
              <div>
                <p className="text-xs text-[#70849A]">Total TTC</p>
                <p className="font-mono text-lg font-bold text-[#151515]">
                  {formatDH(selectedOrder.totalTTC)}
                </p>
              </div>
              <div>
                <Label>Montant encaissé (DH)</Label>
                <Input
                  type="number"
                  min={0}
                  max={selectedOrder.totalTTC}
                  value={selectedOrder.amountPaid}
                  onChange={(e) =>
                    updateOrderDetails(selectedOrder.id, {
                      amountPaid: Math.max(0, Number(e.target.value) || 0),
                    })
                  }
                  className="h-9 font-mono"
                />
              </div>
              <div className="text-right">
                <p className="text-xs text-[#70849A]">Reste à payer</p>
                <p className="font-mono text-lg font-bold text-[#D97706]">
                  {formatDH(Math.max(0, selectedOrder.totalTTC - selectedOrder.amountPaid))}
                </p>
              </div>
            </div>

            {/* Internal Notes */}
            <div>
              <Label>Commentaires internes atelier</Label>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  addOrderInternalNote(selectedOrder.id, internalNote);
                  setInternalNote('');
                }}
                className="flex gap-2 mb-3"
              >
                <Input
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="Note interne (machine, pelliculage, coupe...)"
                />
                <Button type="submit" variant="outline">
                  Ajouter
                </Button>
              </form>
              <div className="space-y-1.5">
                {selectedOrder.internalNotes.map((n, i) => (
                  <p key={i} className="text-xs bg-[#F7F7F4] rounded-lg px-3 py-2 text-[#151515]">
                    {n}
                  </p>
                ))}
              </div>
            </div>

            {/* Client Messaging */}
            <div className="pt-4 border-t border-[#E9E9E6]">
              <Label className="flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-[#56B9E8]" />
                Messagerie client (visible dans Mon Espace)
              </Label>
              <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
                {selectedOrder.messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      'rounded-lg px-3 py-2 text-xs',
                      m.senderRole === 'equipe'
                        ? 'bg-[#151515] text-white ml-8'
                        : 'bg-[#F7F7F4] text-[#151515] mr-8'
                    )}
                  >
                    <p className="font-bold opacity-80">{m.senderName}</p>
                    <p>{m.content}</p>
                  </div>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  addOrderMessage(
                    selectedOrder.id,
                    'equipe',
                    `${currentUser?.fullName || 'Équipe'} (CreaPrint)`,
                    clientReply
                  );
                  setClientReply('');
                }}
                className="flex gap-2"
              >
                <Input
                  value={clientReply}
                  onChange={(e) => setClientReply(e.target.value)}
                  placeholder="Répondre au client..."
                />
                <Button type="submit" variant="cyan">
                  <Send className="h-4 w-4" />
                  Envoyer
                </Button>
              </form>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export function AdminFilesModule() {
  const { files, updateFileStatus } = useStore();
  const [noteById, setNoteById] = useState<Record<string, string>>({});

  const statusLabel: Record<FileReviewStatus, { text: string; cls: string }> = {
    en_attente: { text: 'En attente', cls: 'text-[#D97706]' },
    valide: { text: 'Validé pour impression', cls: 'text-[#16A34A]' },
    correction_demandee: { text: 'Correction demandée', cls: 'text-[#DC2626]' },
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#525E6B]">
        Vérifiez les fichiers envoyés par les clients avant mise en production : validez le BAT ou
        demandez une correction technique.
      </p>
      <div className="rounded-xl bg-white border border-[#E9E9E6] overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F7F7F4] border-b border-[#E9E9E6] text-[#70849A]">
            <tr>
              <th className="py-3 px-4 font-semibold">Fichier</th>
              <th className="py-3 px-4 font-semibold">Client &amp; Lien</th>
              <th className="py-3 px-4 font-semibold">Statut</th>
              <th className="py-3 px-4 font-semibold">Vérification / Commentaire</th>
              <th className="py-3 px-4 font-semibold text-right">Décision</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E9E9E6]">
            {files.map((f) => (
              <tr key={f.id}>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    {f.previewUrl ? (
                      <img
                        src={f.previewUrl}
                        alt={f.fileName}
                        className="h-10 w-10 rounded-md object-cover border border-[#E9E9E6]"
                      />
                    ) : (
                      <span className="h-10 w-10 rounded-md bg-[#151515] text-[#56B9E8] inline-flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4" />
                      </span>
                    )}
                    <div>
                      <p className="font-bold text-[#151515]">{f.fileName}</p>
                      <p className="text-[11px] text-[#70849A] tabular-nums">
                        {formatFileSize(f.fileSize)}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <p className="font-semibold text-[#151515]">{f.uploadedBy}</p>
                  <p className="font-mono text-[11px] text-[#70849A]">
                    {f.linkedType.toUpperCase()} · {f.linkedReference}
                  </p>
                </td>
                <td className="py-3 px-4">
                  <span className={cn('font-bold', statusLabel[f.status].cls)}>
                    {statusLabel[f.status].text}
                  </span>
                  {f.reviewNote && (
                    <p className="text-[11px] text-[#525E6B] mt-0.5 max-w-[220px]">{f.reviewNote}</p>
                  )}
                </td>
                <td className="py-3 px-4">
                  <Input
                    value={noteById[f.id] ?? f.reviewNote ?? ''}
                    onChange={(e) => setNoteById({ ...noteById, [f.id]: e.target.value })}
                    placeholder="Ex. Fonds perdus 3 mm OK / Résolution trop faible..."
                    className="h-8 text-xs min-w-[200px]"
                  />
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateFileStatus(f.id, 'valide', noteById[f.id] || 'Fichier conforme.')
                      }
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#16A34A]" />
                      Valider
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateFileStatus(
                          f.id,
                          'correction_demandee',
                          noteById[f.id] || 'Merci de renvoyer un fichier haute résolution.'
                        )
                      }
                    >
                      <XCircle className="h-3.5 w-3.5 text-[#DC2626]" />
                      Correction
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
