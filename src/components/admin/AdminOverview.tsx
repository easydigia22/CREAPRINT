import React, { useMemo } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useStore } from '@/src/context/StoreContext';
import { CHART_30_DAYS } from '@/src/data/seedData';
import { formatDH } from '@/src/lib/utils';

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  site: { label: 'Site web', color: '#56B9E8' },
  whatsapp: { label: 'WhatsApp', color: '#25D366' },
  instagram: { label: 'Instagram', color: '#F17B9B' },
  facebook: { label: 'Facebook', color: '#70849A' },
  google: { label: 'Google', color: '#F5D84C' },
  magasin: { label: 'Magasin', color: '#151515' },
};

export function AdminOverview({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { leads, quotes, orders, activity } = useStore();

  const metrics = useMemo(() => {
    const monthlyRevenue = orders
      .filter((o) => o.status !== 'annulee')
      .reduce((sum, o) => sum + o.totalTTC, 0);
    const newLeads = leads.filter((l) => l.status === 'nouveau').length;
    const pendingQuotes = quotes.filter((q) => q.status === 'brouillon' || q.status === 'envoye').length;
    const inProduction = orders.filter(
      (o) => o.status === 'en_production' || o.status === 'controle_qualite'
    ).length;
    const readyOrders = orders.filter((o) => o.status === 'prete').length;
    return { monthlyRevenue, newLeads, pendingQuotes, inProduction, readyOrders };
  }, [leads, quotes, orders]);

  const sourceData = useMemo(() => {
    const counts: Record<string, number> = {
      site: 0,
      whatsapp: 0,
      instagram: 0,
      facebook: 0,
      google: 0,
      magasin: 1,
    };
    leads.forEach((l) => {
      counts[l.source] = (counts[l.source] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([key, value]) => ({
        name: SOURCE_LABELS[key]?.label || key,
        value,
        color: SOURCE_LABELS[key]?.color || '#70849A',
      }))
      .filter((d) => d.value > 0);
  }, [leads]);

  const topProducts = useMemo(() => {
    const map: Record<string, number> = {};
    leads.forEach((l) => {
      map[l.requestedProduct] = (map[l.requestedProduct] || 0) + 1;
    });
    orders.forEach((o) => {
      map[o.productName] = (map[o.productName] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [leads, orders]);

  return (
    <div className="space-y-6">
      {/* 5 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <div className="rounded-xl bg-[#151515] text-white p-5">
          <p className="text-xs text-white/65">CA estimé du mois</p>
          <p className="mt-2 font-mono text-2xl font-bold text-[#F5D84C] tabular-nums">
            {formatDH(metrics.monthlyRevenue)}
          </p>
          <p className="mt-1 text-[11px] text-white/55">Commandes actives TTC</p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('crm')}
          className="text-left rounded-xl bg-white border border-[#E9E9E6] p-5 hover:border-[#56B9E8] transition-colors cursor-pointer"
        >
          <p className="text-xs text-[#70849A]">Nouveaux prospects</p>
          <p className="mt-2 font-mono text-2xl font-bold text-[#151515] tabular-nums">
            {metrics.newLeads}
          </p>
          <p className="mt-1 text-[11px] text-[#56B9E8] font-semibold">Voir le CRM →</p>
        </button>
        <button
          type="button"
          onClick={() => onNavigate('quotes')}
          className="text-left rounded-xl bg-white border border-[#E9E9E6] p-5 hover:border-[#56B9E8] transition-colors cursor-pointer"
        >
          <p className="text-xs text-[#70849A]">Devis en attente</p>
          <p className="mt-2 font-mono text-2xl font-bold text-[#151515] tabular-nums">
            {metrics.pendingQuotes}
          </p>
          <p className="mt-1 text-[11px] text-[#70849A]">Brouillons &amp; envoyés</p>
        </button>
        <button
          type="button"
          onClick={() => onNavigate('orders')}
          className="text-left rounded-xl bg-white border border-[#E9E9E6] p-5 hover:border-[#56B9E8] transition-colors cursor-pointer"
        >
          <p className="text-xs text-[#70849A]">En production</p>
          <p className="mt-2 font-mono text-2xl font-bold text-[#151515] tabular-nums">
            {metrics.inProduction}
          </p>
          <p className="mt-1 text-[11px] text-[#D97706] font-semibold">Atelier &amp; contrôle</p>
        </button>
        <button
          type="button"
          onClick={() => onNavigate('orders')}
          className="text-left rounded-xl bg-white border border-[#E9E9E6] p-5 hover:border-[#56B9E8] transition-colors cursor-pointer"
        >
          <p className="text-xs text-[#70849A]">Commandes prêtes</p>
          <p className="mt-2 font-mono text-2xl font-bold text-[#16A34A] tabular-nums">
            {metrics.readyOrders}
          </p>
          <p className="mt-1 text-[11px] text-[#70849A]">À livrer ou retirer</p>
        </button>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 rounded-xl bg-white border border-[#E9E9E6] p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-base font-bold text-[#151515]">
                Prospects &amp; Commandes sur 30 jours
              </h2>
              <p className="text-xs text-[#70849A]">Évolution des demandes reçues et conversions</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-[#525E6B]">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-xs bg-[#56B9E8]" /> Prospects
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-xs bg-[#151515]" /> Commandes
              </span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_30_DAYS} margin={{ top: 5, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9E9E6" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#70849A' }} />
                <YAxis tick={{ fontSize: 11, fill: '#70849A' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: '1px solid #E9E9E6',
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="prospects"
                  name="Prospects"
                  stroke="#56B9E8"
                  strokeWidth={2}
                  fill="#56B9E8"
                  fillOpacity={0.18}
                />
                <Area
                  type="monotone"
                  dataKey="commandes"
                  name="Commandes"
                  stroke="#151515"
                  strokeWidth={2}
                  fill="#151515"
                  fillOpacity={0.08}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 rounded-xl bg-white border border-[#E9E9E6] p-6">
          <h2 className="font-display text-base font-bold text-[#151515]">
            Origine des prospects (UTM)
          </h2>
          <p className="text-xs text-[#70849A] mb-5">
            Site, WhatsApp, Instagram, Facebook, Google, Magasin
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceData} layout="vertical" margin={{ left: 10, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9E9E6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#70849A' }} allowDecimals={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={78}
                  tick={{ fontSize: 11, fill: '#151515' }}
                />
                <Tooltip />
                <Bar dataKey="value" name="Prospects" radius={[0, 6, 6, 0]}>
                  {sourceData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Tables: Latest Leads & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-xl bg-white border border-[#E9E9E6] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-base font-bold text-[#151515]">
              Dernières demandes reçues
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('crm')}
              className="text-xs font-semibold text-[#56B9E8] hover:underline cursor-pointer"
            >
              Tout voir
            </button>
          </div>
          <div className="divide-y divide-[#E9E9E6]">
            {leads.slice(0, 5).map((lead) => (
              <div key={lead.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#151515] truncate">
                    {lead.fullName}{' '}
                    {lead.company && (
                      <span className="font-normal text-[#70849A]">· {lead.company}</span>
                    )}
                  </p>
                  <p className="text-xs text-[#525E6B] truncate">
                    {lead.requestedProduct} · Source : {lead.source}
                  </p>
                </div>
                <div className="text-right shrink-0 tabular-nums">
                  <p className="font-mono text-xs font-bold text-[#151515]">
                    {lead.estimatedBudget ? formatDH(lead.estimatedBudget) : 'Sur devis'}
                  </p>
                  <p className="text-[11px] text-[#70849A] capitalize">
                    {lead.status.replace('_', ' ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 rounded-xl bg-white border border-[#E9E9E6] p-6 space-y-6">
          <div>
            <h2 className="font-display text-base font-bold text-[#151515] mb-3">
              Produits les plus demandés
            </h2>
            <div className="space-y-2.5">
              {topProducts.map(([name, count], idx) => (
                <div key={name} className="flex items-center justify-between text-xs">
                  <span className="text-[#151515] font-medium truncate pr-3">
                    0{idx + 1}. {name}
                  </span>
                  <span className="font-mono font-bold text-[#56B9E8] tabular-nums shrink-0">
                    {count} dem.
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#E9E9E6]">
            <h3 className="font-display text-sm font-bold text-[#151515] mb-2.5">
              Journal d’activité récent
            </h3>
            <div className="space-y-2">
              {activity.slice(0, 4).map((act) => (
                <p key={act.id} className="text-xs text-[#525E6B]">
                  <strong className="text-[#151515]">{act.actor}</strong> — {act.action} (
                  <span className="font-mono text-[11px]">{act.target}</span>)
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
