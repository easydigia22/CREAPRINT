import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Download,
  FileText,
  LogOut,
  MessageSquare,
  Package,
  Send,
  ShieldCheck,
  Upload,
  UserCheck,
} from 'lucide-react';
import { useStore } from '@/src/context/StoreContext';
import { Button, Input, Label } from '@/src/components/ui/primitives';
import { calculateQuoteTotals, downloadQuotePdf } from '@/src/lib/pdfGenerator';
import { cn, formatDH, formatFileSize } from '@/src/lib/utils';
import type { OrderStatus } from '@/src/types/creaprint';

const ORDER_STATUS_LABELS: Record<OrderStatus, { label: string; color: string }> = {
  a_verifier: { label: 'À vérifier', color: 'text-[#70849A]' },
  devis_valide: { label: 'Devis validé', color: 'text-[#56B9E8]' },
  en_production: { label: 'En production', color: 'text-[#D97706]' },
  controle_qualite: { label: 'Contrôle qualité', color: 'text-[#56B9E8]' },
  prete: { label: 'Prêt', color: 'text-[#16A34A]' },
  livree: { label: 'Livré', color: 'text-[#151515]' },
  annulee: { label: 'Annulé', color: 'text-[#DC2626]' },
};

export function ClientPortalPage() {
  const {
    currentUser,
    loginAsRole,
    loginByEmail,
    logout,
    quotes,
    orders,
    files,
    settings,
    addOrderMessage,
    addUploadedFile,
  } = useStore();

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('client@darnour.ma');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');

  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState<string>('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    loginByEmail(email, fullName, phone, company);
  };

  if (!currentUser) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="rounded-2xl bg-white border border-[#E9E9E6] p-8 shadow-xs">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#56B9E8]">
            ESPACE CLIENT CREAPRINT
          </p>
          <h1 className="mt-1.5 font-display text-2xl font-extrabold text-[#151515]">
            Suivez vos devis et commandes
          </h1>
          <p className="mt-1 text-sm text-[#525E6B]">
            Accédez à vos devis PDF, au statut de production et échangez directement avec notre
            atelier.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-1 p-1 rounded-lg bg-[#F7F7F4]">
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={cn(
                'h-9 rounded-md text-xs font-bold cursor-pointer transition-colors',
                authMode === 'login' ? 'bg-white text-[#151515] shadow-xs' : 'text-[#70849A]'
              )}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('register')}
              className={cn(
                'h-9 rounded-md text-xs font-bold cursor-pointer transition-colors',
                authMode === 'register' ? 'bg-white text-[#151515] shadow-xs' : 'text-[#70849A]'
              )}
            >
              Créer un compte
            </button>
          </div>

          <form onSubmit={handleAuth} className="mt-5 space-y-4">
            {authMode === 'register' && (
              <>
                <div>
                  <Label htmlFor="cl-name">Nom complet</Label>
                  <Input
                    id="cl-name"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex. Salma Benjelloun"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="cl-phone">Téléphone</Label>
                    <Input
                      id="cl-phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="06 XX XX XX XX"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cl-co">Entreprise</Label>
                    <Input
                      id="cl-co"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Facultatif"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <Label htmlFor="cl-email">Adresse e-mail</Label>
              <Input
                id="cl-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@entreprise.ma"
              />
            </div>

            <Button type="submit" size="lg" className="w-full">
              {authMode === 'login' ? 'Accéder à mon espace' : 'Créer mon espace client'}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#E9E9E6] space-y-2.5">
            <p className="text-xs text-[#70849A] text-center">
              Découvrir instantanément avec le compte client de démonstration :
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => loginAsRole('client')}
            >
              <UserCheck className="h-4 w-4 text-[#56B9E8]" />
              Connexion démo — Café Dar Nour
            </Button>
            <Link
              to="/admin"
              className="block text-center text-xs font-semibold text-[#70849A] hover:text-[#151515] pt-2"
            >
              Vous faites partie de l’équipe CreaPrint ? Accéder au Dashboard Admin →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const userOrders = orders.filter(
    (o) =>
      currentUser.role !== 'client' ||
      o.clientEmail?.toLowerCase() === currentUser.email.toLowerCase()
  );
  const userQuotes = quotes.filter(
    (q) =>
      currentUser.role !== 'client' ||
      q.clientEmail?.toLowerCase() === currentUser.email.toLowerCase()
  );

  const selectedOrder =
    userOrders.find((o) => o.id === activeOrderId) || userOrders[0] || null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !messageInput.trim()) return;
    addOrderMessage(selectedOrder.id, 'client', currentUser.fullName, messageInput);
    setMessageInput('');
  };

  const handleExtraFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedOrder) return;
    addUploadedFile({
      fileName: file.name,
      fileType: file.type || 'application/octet-stream',
      fileSize: file.size,
      uploadedBy: currentUser.fullName,
      linkedReference: selectedOrder.reference,
      linkedType: 'commande',
      status: 'en_attente',
    });
    setUploadSuccess(`Fichier « ${file.name} » ajouté à la commande ${selectedOrder.reference}.`);
  };

  return (
    <div className="pb-20">
      <section className="bg-[#151515] text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-[#56B9E8]">
              MON ESPACE CLIENT
            </p>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold">
              Bonjour, {currentUser.fullName}
            </h1>
            <p className="text-xs text-white/65 mt-0.5">
              {currentUser.email} {currentUser.company ? `· ${currentUser.company}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/devis"
              className="h-10 px-4 inline-flex items-center rounded-lg bg-[#56B9E8] text-[#151515] text-xs font-bold hover:bg-[#F5D84C] transition-colors"
            >
              Nouvelle demande
            </Link>
            {currentUser.role !== 'client' && (
              <Link
                to="/admin"
                className="h-10 px-4 inline-flex items-center gap-1.5 rounded-lg border border-white/20 text-white text-xs font-semibold hover:bg-white/10"
              >
                <ShieldCheck className="h-4 w-4 text-[#F5D84C]" />
                Admin
              </Link>
            )}
            <Button type="button" variant="outlineDark" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-10">
        {/* Orders + Messaging Split */}
        <div>
          <h2 className="font-display text-xl font-bold text-[#151515] mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-[#56B9E8]" />
            Mes commandes ({userOrders.length})
          </h2>

          {userOrders.length === 0 ? (
            <div className="rounded-xl bg-white border border-[#E9E9E6] p-8 text-center">
              <p className="text-sm text-[#525E6B]">Aucune commande en cours pour ce compte.</p>
              <Link
                to="/devis"
                className="mt-4 inline-flex items-center h-10 px-5 rounded-lg bg-[#151515] text-white text-xs font-bold"
              >
                Configurer ma première commande
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Orders List */}
              <div className="lg:col-span-5 space-y-3">
                {userOrders.map((order) => {
                  const statusInfo = ORDER_STATUS_LABELS[order.status];
                  const isSelected = selectedOrder?.id === order.id;
                  return (
                    <button
                      key={order.id}
                      type="button"
                      onClick={() => {
                        setActiveOrderId(order.id);
                        setUploadSuccess('');
                      }}
                      className={cn(
                        'w-full text-left rounded-xl border p-4 transition-all cursor-pointer',
                        isSelected
                          ? 'bg-white border-[#151515] ring-2 ring-[#56B9E8]/50'
                          : 'bg-white border-[#E9E9E6] hover:border-[#70849A]'
                      )}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-mono font-semibold text-[#70849A]">
                          {order.reference}
                        </span>
                        <span className={cn('font-bold', statusInfo.color)}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="font-display text-sm font-bold text-[#151515]">
                        {order.productName}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-xs text-[#525E6B] tabular-nums">
                        <span>Total : {formatDH(order.totalTTC)}</span>
                        <span>Livraison ind. : {order.estimatedDeliveryDate}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Order Detail + Messaging + File Upload */}
              {selectedOrder && (
                <div className="lg:col-span-7 rounded-2xl bg-white border border-[#E9E9E6] p-6 space-y-6">
                  <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[#E9E9E6]">
                    <div>
                      <p className="text-xs font-mono text-[#70849A]">{selectedOrder.reference}</p>
                      <h3 className="font-display text-lg font-bold text-[#151515]">
                        {selectedOrder.productName}
                      </h3>
                      <p className="text-xs text-[#525E6B] mt-1">{selectedOrder.specifications}</p>
                    </div>
                    <div className="text-right tabular-nums">
                      <p className="font-mono text-lg font-bold text-[#151515]">
                        {formatDH(selectedOrder.totalTTC)}
                      </p>
                      <p className="text-xs text-[#70849A]">
                        Payé : {formatDH(selectedOrder.amountPaid)} · Reste :{' '}
                        {formatDH(Math.max(0, selectedOrder.totalTTC - selectedOrder.amountPaid))}
                      </p>
                    </div>
                  </div>

                  {/* Supplementary File Upload */}
                  <div className="rounded-xl bg-[#F7F7F4] border border-[#E9E9E6] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-[#151515]">
                          Fichiers liés à cette commande
                        </p>
                        <p className="text-[11px] text-[#70849A]">
                          Ajoutez un fichier corrigé ou complémentaire (PDF, AI, PNG, JPG).
                        </p>
                      </div>
                      <label className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-[#151515] text-white text-xs font-semibold hover:bg-[#56B9E8] hover:text-[#151515] transition-colors cursor-pointer">
                        <Upload className="h-3.5 w-3.5" />
                        Ajouter un fichier
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.ai,.psd"
                          onChange={handleExtraFile}
                          className="sr-only"
                        />
                      </label>
                    </div>
                    {uploadSuccess && (
                      <p className="mt-2 text-xs font-semibold text-[#16A34A]">{uploadSuccess}</p>
                    )}
                    <div className="mt-3 space-y-1.5">
                      {files
                        .filter((f) => f.linkedReference === selectedOrder.reference)
                        .map((f) => (
                          <div
                            key={f.id}
                            className="flex items-center justify-between text-xs bg-white rounded-lg px-3 py-2 border border-[#E9E9E6]"
                          >
                            <span className="truncate font-medium text-[#151515]">{f.fileName}</span>
                            <span className="text-[#70849A] shrink-0 ml-2">
                              {formatFileSize(f.fileSize)} ·{' '}
                              {f.status === 'valide'
                                ? 'Validé'
                                : f.status === 'correction_demandee'
                                ? 'Correction demandée'
                                : 'En vérification'}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Messaging linked to order */}
                  <div>
                    <h4 className="text-xs font-bold text-[#151515] mb-3 flex items-center gap-1.5">
                      <MessageSquare className="h-4 w-4 text-[#56B9E8]" />
                      Messagerie commande
                    </h4>
                    <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 mb-3">
                      {selectedOrder.messages.length === 0 ? (
                        <p className="text-xs text-[#70849A]">
                          Aucun message pour le moment. Posez une question à notre équipe ci-dessous.
                        </p>
                      ) : (
                        selectedOrder.messages.map((m) => (
                          <div
                            key={m.id}
                            className={cn(
                              'rounded-xl px-4 py-2.5 text-xs',
                              m.senderRole === 'client'
                                ? 'bg-[#151515] text-white ml-8'
                                : 'bg-[#F7F7F4] text-[#151515] border border-[#E9E9E6] mr-8'
                            )}
                          >
                            <p className="font-bold opacity-80 mb-0.5">{m.senderName}</p>
                            <p className="leading-relaxed">{m.content}</p>
                          </div>
                        ))
                      )}
                    </div>
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Input
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Écrire un message à l’équipe CreaPrint..."
                      />
                      <Button type="submit" size="md">
                        <Send className="h-4 w-4" />
                        Envoyer
                      </Button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quotes & Invoices PDF Section */}
        <div>
          <h2 className="font-display text-xl font-bold text-[#151515] mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#F5D84C]" />
            Mes devis &amp; factures PDF ({userQuotes.length})
          </h2>
          <div className="rounded-xl bg-white border border-[#E9E9E6] overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F7F7F4] border-b border-[#E9E9E6] text-xs text-[#70849A]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Référence</th>
                  <th className="py-3 px-4 font-semibold">Désignation</th>
                  <th className="py-3 px-4 font-semibold">Statut</th>
                  <th className="py-3 px-4 font-semibold text-right">Total TTC</th>
                  <th className="py-3 px-4 font-semibold text-right">Documents</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E9E6]">
                {userQuotes.map((q) => {
                  const totals = calculateQuoteTotals(q);
                  return (
                    <tr key={q.id} className="hover:bg-[#F7F7F4]/60">
                      <td className="py-3 px-4 font-mono text-xs font-semibold text-[#151515]">
                        {q.reference}
                      </td>
                      <td className="py-3 px-4 text-xs text-[#151515]">
                        {q.items.map((i) => i.label).join(', ')}
                      </td>
                      <td className="py-3 px-4 text-xs font-semibold text-[#525E6B] capitalize">
                        {q.status}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-xs font-bold text-[#151515] tabular-nums">
                        {formatDH(totals.totalTTC)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => downloadQuotePdf(q, settings, 'DEVIS')}
                          >
                            <Download className="h-3.5 w-3.5" />
                            Devis PDF
                          </Button>
                          {q.status === 'accepte' && (
                            <Button
                              type="button"
                              variant="primary"
                              size="sm"
                              onClick={() => downloadQuotePdf(q, settings, 'FACTURE')}
                            >
                              <Download className="h-3.5 w-3.5" />
                              Facture PDF
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {userQuotes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-[#70849A]">
                      Aucun devis enregistré pour ce compte.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
