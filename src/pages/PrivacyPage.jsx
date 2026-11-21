import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/lib/i18n.jsx';

const EN = [
  ['Who is responsible', 'Novam LLC ("Mucho Gusto Xo") is the controller of your personal data.'],
  ['What we collect', 'Your name, email, phone, photo, optional Instagram handle and bio, your approximate location (rounded to about 1 km), your replies to invitations, and, only if you choose to verify, a selfie and/or ID check.'],
  ['Why we use it', 'To create your account, match you with events in your city, let hosts invite you, send you invitations and reminders, keep events safe, and confirm that guests of women-only events are who they say they are.'],
  ['Verification and biometrics', 'Verification is optional. If you upload a selfie, a Mucho Gusto host reviews it and it is deleted as soon as they decide, or after 7 days if it is not reviewed. We do not create or store face templates. If you choose ID verification, our provider Stripe Identity processes your ID and selfie under its own privacy policy and we only receive the result.'],
  ['What hosts can see', 'Your first name, photo (unless you blur it), age, bio and interests. Hosts never see your phone, email or exact location unless you accept an invitation, and never see whether or why you declined.'],
  ['How long we keep it', 'Until you delete your account. Selfies as described above. Notifications and login codes are deleted automatically.'],
  ['Your rights', 'You can access, correct and delete your data at any time. Delete everything yourself in Me > Delete my account and data, or write to privacy@muchogusto.com. You can withdraw consent to location or verification at any time without losing your account.'],
  ['Contact', 'privacy@muchogusto.com'],
];
const ES = [
  ['Responsable', 'Novam LLC ("Mucho Gusto Xo") es la responsable del tratamiento de tus datos personales.'],
  ['Qué recopilamos', 'Tu nombre, correo, teléfono, foto, usuario de Instagram y biografía (opcionales), tu ubicación aproximada (redondeada a ~1 km), tus respuestas a invitaciones y, solo si decides verificarte, una selfie y/o verificación de documento.'],
  ['Para qué lo usamos', 'Para crear tu cuenta, conectarte con eventos de tu ciudad, permitir que los anfitriones te inviten, enviarte invitaciones y recordatorios, mantener seguros los eventos y confirmar que las invitadas a eventos solo para mujeres son quienes dicen ser.'],
  ['Verificación y datos biométricos', 'La verificación es opcional. Si subes una selfie, un anfitrión de Mucho Gusto la revisa y se elimina apenas decide, o a los 7 días si no se revisa. No creamos ni guardamos plantillas faciales. Si eliges la verificación con documento, nuestro proveedor Stripe Identity procesa tu documento y selfie bajo su propia política y nosotros solo recibimos el resultado.'],
  ['Qué ven los anfitriones', 'Tu nombre, foto (salvo que la difumines), edad, biografía e intereses. Los anfitriones nunca ven tu teléfono, correo ni ubicación exacta a menos que aceptes una invitación, y nunca ven si rechazaste ni por qué.'],
  ['Cuánto tiempo la conservamos', 'Hasta que elimines tu cuenta. Las selfies como se indicó arriba. Las notificaciones y códigos de acceso se eliminan automáticamente.'],
  ['Tus derechos', 'Puedes conocer, corregir y eliminar tus datos en cualquier momento. Elimina todo en Yo > Eliminar mi cuenta y datos, o escribe a privacy@muchogusto.com. Puedes retirar tu autorización de ubicación o verificación sin perder tu cuenta.'],
  ['Contacto', 'privacy@muchogusto.com'],
];

const PrivacyPage = () => {
  const { language } = useTranslation();
  const rows = language === 'es' ? ES : EN;
  return (
    <div className="mg-page space-y-6">
      <Helmet><title>Privacy | Mucho Gusto Xo</title></Helmet>
      <Link to="/" className="font-display text-lg text-primary">Mucho Gusto</Link>
      <h1 className="text-3xl">{language === 'es' ? 'Política de Privacidad' : 'Privacy Policy'}</h1>
      {rows.map(([h, b]) => (
        <section key={h} className="space-y-1">
          <h2 className="text-lg">{h}</h2>
          <p className="text-sm text-muted-foreground">{b}</p>
        </section>
      ))}
      <p className="text-xs text-muted-foreground">{language === 'es' ? 'Versión 2026-11' : 'Version 2026-11'}</p>
    </div>
  );
};

export default PrivacyPage;
