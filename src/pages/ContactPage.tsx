import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useStore } from '@/src/context/StoreContext';
import { Button, Input, Label, Textarea } from '@/src/components/ui/primitives';
import { buildWhatsAppUrl } from '@/src/lib/utils';

const contactFormSchema = z.object({
  fullName: z.string().min(2, 'Veuillez saisir votre nom.'),
  phone: z.string().min(8, 'Numéro de téléphone ou WhatsApp requis.'),
  email: z.string().email('Adresse e-mail invalide.').optional().or(z.literal('')),
  subject: z.string().min(2, 'Précisez l’objet de votre demande.'),
  message: z.string().min(8, 'Décrivez brièvement votre besoin.'),
});

type ContactValues = z.infer<typeof contactFormSchema>;

export function ContactPage() {
  const { settings, submitContactLead } = useStore();
  const [sentRef, setSentRef] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = (values: ContactValues) => {
    const lead = submitContactLead(values);
    setSentRef(lead.reference);
    reset();
  };

  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsappNumber,
    settings.defaultWhatsAppMessage
  );

  const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(
    settings.mapsQuery || 'Marrakech, Maroc'
  )}&output=embed`;

  return (
    <div className="pb-20">
      <section className="bg-[#151515] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-[0.2em] text-[#F5D84C] mb-3">
            CONTACT · MARRAKECH
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
            Parlons de votre projet d’impression
          </h1>
          <p className="mt-3 text-sm sm:text-base text-white/75 max-w-2xl">
            Une question sur un support, un délai ou un fichier ? Contactez-nous directement sur
            WhatsApp au <strong className="text-white tabular-nums">{settings.phoneDisplay}</strong>{' '}
            ou laissez-nous un message ci-dessous.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Contact Details & Hours */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl bg-white border border-[#E9E9E6] p-6 space-y-5">
              <h2 className="font-display text-lg font-bold text-[#151515]">
                Coordonnées directes
              </h2>

              <div className="flex items-start gap-3.5">
                <span className="h-10 w-10 rounded-lg bg-[#151515] text-[#56B9E8] inline-flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs text-[#70849A]">Téléphone / WhatsApp</p>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-display text-base font-bold text-[#151515] hover:text-[#56B9E8] tabular-nums"
                  >
                    {settings.phoneDisplay} ({settings.whatsappNumber})
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="h-10 w-10 rounded-lg bg-[#151515] text-[#F5D84C] inline-flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs text-[#70849A]">E-mail</p>
                  <a
                    href={`mailto:${settings.email}`}
                    className="font-semibold text-sm text-[#151515] hover:text-[#56B9E8]"
                  >
                    {settings.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="h-10 w-10 rounded-lg bg-[#151515] text-[#F17B9B] inline-flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs text-[#70849A]">Localisation</p>
                  <p className="text-sm font-semibold text-[#151515]">{settings.city}</p>
                  <p className="text-xs text-[#525E6B] mt-0.5">{settings.addressLabel}</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 pt-3 border-t border-[#E9E9E6]">
                <span className="h-10 w-10 rounded-lg bg-[#F7F7F4] text-[#151515] inline-flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5" />
                </span>
                <div className="space-y-1 text-xs text-[#525E6B]">
                  <p className="font-display text-sm font-bold text-[#151515]">
                    Horaires d’ouverture
                  </p>
                  <p>{settings.openingHours.weekdays}</p>
                  <p>{settings.openingHours.saturday}</p>
                  <p>{settings.openingHours.sunday}</p>
                </div>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-lg bg-[#25D366] text-white text-sm font-bold hover:bg-[#1FB858] transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
                Démarrer une discussion WhatsApp
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 rounded-2xl bg-white border border-[#E9E9E6] p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold text-[#151515]">
              Envoyez-nous un message
            </h2>
            <p className="mt-1 text-sm text-[#525E6B]">
              Votre demande est transmise directement à notre équipe commerciale.
            </p>

            {sentRef ? (
              <div className="mt-6 rounded-xl bg-[#56B9E8]/10 border border-[#56B9E8]/30 p-6 text-center">
                <CheckCircle2 className="h-8 w-8 text-[#56B9E8] mx-auto mb-2" />
                <p className="font-display text-base font-bold text-[#151515]">
                  Message envoyé (Réf. {sentRef})
                </p>
                <p className="mt-1 text-sm text-[#525E6B]">
                  Nous revenons vers vous rapidement par téléphone ou WhatsApp.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setSentRef(null)}
                >
                  Envoyer un autre message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="c-name">Nom complet *</Label>
                    <Input id="c-name" placeholder="Votre nom" {...register('fullName')} />
                    {errors.fullName && (
                      <p className="mt-1 text-xs text-[#DC2626]">{errors.fullName.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="c-phone">Téléphone / WhatsApp *</Label>
                    <Input id="c-phone" placeholder="06 XX XX XX XX" {...register('phone')} />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-[#DC2626]">{errors.phone.message}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="c-email">E-mail (facultatif)</Label>
                    <Input
                      id="c-email"
                      type="email"
                      placeholder="nom@domaine.ma"
                      {...register('email')}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-[#DC2626]">{errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="c-subject">Objet *</Label>
                    <Input
                      id="c-subject"
                      placeholder="Ex. Enseigne boutique / Roll-up"
                      {...register('subject')}
                    />
                    {errors.subject && (
                      <p className="mt-1 text-xs text-[#DC2626]">{errors.subject.message}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="c-msg">Message *</Label>
                  <Textarea
                    id="c-msg"
                    placeholder="Décrivez votre besoin, les quantités et vos délais souhaités..."
                    {...register('message')}
                  />
                  {errors.message && (
                    <p className="mt-1 text-xs text-[#DC2626]">{errors.message.message}</p>
                  )}
                </div>
                <Button type="submit" size="lg">
                  Envoyer le message
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Configurable Map Embed (controlled from Admin Settings) */}
        <div className="mt-10 rounded-2xl overflow-hidden border border-[#E9E9E6] bg-white">
          <div className="px-6 py-4 border-b border-[#E9E9E6] flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-display text-sm font-bold text-[#151515]">
                Emplacement — {settings.city}
              </h3>
              <p className="text-xs text-[#70849A]">{settings.addressLabel}</p>
            </div>
            <span className="text-xs font-mono text-[#70849A]">
              Zone : {settings.mapsQuery}
            </span>
          </div>
          <div className="h-[340px] w-full bg-[#E9E9E6]">
            <iframe
              title="Localisation CreaPrint Marrakech"
              src={mapEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full border-0"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
