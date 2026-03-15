import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  es: {
    // Signup Page
    "signup.title": "Únete a The Homies",
    "signup.subtitle": "Únete a nuestra exclusiva comunidad de vida nocturna",
    "signup.required_info": "Información Requerida",
    "signup.name": "Nombre Completo",
    "signup.name_placeholder": "Ingresa tu nombre completo",
    "signup.instagram": "Usuario de Instagram",
    "signup.instagram_placeholder": "@usuario",
    "signup.whatsapp": "Número de WhatsApp",
    "signup.optional_info": "Información Opcional",
    "signup.city": "Ciudad/Barrio",
    "signup.city_placeholder": "ej., Medellín, Bogotá",
    "signup.age_range": "Rango de Edad",
    "signup.age_placeholder": "Selecciona rango de edad",
    "signup.bio": "Biografía Corta",
    "signup.bio_placeholder": "Cuéntanos un poco sobre ti...",
    "signup.photos": "Subir Fotos (Opcional, 1-3 fotos)",
    "signup.interests_title": "¿Qué te interesa?",
    "signup.interest_events": "Eventos presenciales",
    "signup.interest_livestreams": "Transmisiones en vivo",
    "signup.interest_both": "Ambos eventos y transmisiones",
    "signup.consent_title": "Consentimiento y Acuerdos",
    "signup.consent_18": "Confirmo que soy mayor de 18 años",
    "signup.consent_contact": "Acepto ser contactado sobre eventos",
    "signup.consent_media": "Consiento aparecer en transmisiones/videos (opcional)",
    "signup.submit": "Unirse a The Homies",
    "signup.submitting": "Enviando...",
    
    // Thank You Page
    "thank_you.title": "¡Todo Listo! 🎉",
    "thank_you.subtitle": "Tu registro ha sido recibido",
    "thank_you.desc": "Nos pondremos en contacto si hay un lugar para próximos eventos o transmisiones",
    "thank_you.received": "Registro Recibido",
    "thank_you.share": "Compartir con Amigos",
    "thank_you.home": "Volver al Inicio",
    "thank_you.footer": "¿Quieres compartir esto con más personas?",
    "thank_you.view_qr": "Ver Código QR",

    // QR Code Page
    "qr.title": "Código QR",
    "qr.subtitle": "Escanea para unirte a la comunidad",
    "qr.instruction_title": "Cómo usar este código QR",
    "qr.instruction_desc": "Apunta la cámara de tu teléfono al código QR de arriba para acceder al instante al formulario de registro.",
    "qr.download": "Descargar Código QR",
    "qr.copy": "Copiar Enlace",
    "qr.footer": "Perfecto para compartir en redes sociales, mostrar en eventos o imprimir",

    // Admin Login
    "login.title": "Inicio de Sesión",
    "login.subtitle": "Acceder al panel de administración",
    "login.email": "Correo Electrónico",
    "login.password": "Contraseña",
    "login.submit": "Iniciar Sesión",
    "login.submitting": "Iniciando...",
    "login.protected": "Área protegida. Solo acceso autorizado.",

    // Admin Dashboard
    "admin.title": "Panel de Administración",
    "admin.subtitle": "Gestionar registros de la comunidad",
    "admin.logout": "Cerrar Sesión",
    "admin.total": "Total Registros",
    "admin.events": "Interés Eventos",
    "admin.livestreams": "Interés Transmisiones",
    "admin.media": "Consentimiento Medios",
    "admin.search": "Buscar por nombre, Instagram...",
    "admin.sort": "Ordenar por",
    "admin.sort_newest": "Más Recientes",
    "admin.sort_oldest": "Más Antiguos",
    "admin.sort_name": "Nombre A-Z",
    "admin.filter_all": "Todos",
    "admin.col_name": "Nombre",
    "admin.col_ig": "Instagram",
    "admin.col_wa": "WhatsApp",
    "admin.col_city": "Ciudad",
    "admin.col_age": "Edad",
    "admin.col_interests": "Intereses",
    "admin.col_media": "Medios",
    "admin.col_created": "Creado",
    "admin.col_actions": "Acciones",
    "admin.delete": "Eliminar",
    "admin.view_photos": "Ver Fotos",
    
    // Validation
    "val.required": "Requerido",
    "val.invalid_email": "Formato de correo inválido",
    "val.invalid_ig": "Formato de Instagram inválido",
    
    // Common
    "common.yes": "Sí",
    "common.no": "No",
    "common.cancel": "Cancelar"
  },
  en: {
    "signup.title": "Join The Homies",
    "signup.subtitle": "Join our exclusive nightlife community",
    "signup.required_info": "Required Information",
    "signup.name": "Full Name",
    "signup.name_placeholder": "Enter your full name",
    "signup.instagram": "Instagram Handle",
    "signup.instagram_placeholder": "@username",
    "signup.whatsapp": "WhatsApp Number",
    "signup.optional_info": "Optional Information",
    "signup.city": "City/Neighborhood",
    "signup.city_placeholder": "e.g., Brooklyn, Manhattan",
    "signup.age_range": "Age Range",
    "signup.age_placeholder": "Select age range",
    "signup.bio": "Short Bio",
    "signup.bio_placeholder": "Tell us a bit about yourself...",
    "signup.photos": "Upload Photos (Optional, 1-3 photos)",
    "signup.interests_title": "What are you interested in?",
    "signup.interest_events": "In-person events",
    "signup.interest_livestreams": "Livestreams",
    "signup.interest_both": "Both events and livestreams",
    "signup.consent_title": "Consent & Agreements",
    "signup.consent_18": "I confirm that I am 18 years or older",
    "signup.consent_contact": "I agree to be contacted about events",
    "signup.consent_media": "I consent to appear in livestreams/videos (optional)",
    "signup.submit": "Join The Homies",
    "signup.submitting": "Submitting...",
    
    "thank_you.title": "You're All Set! 🎉",
    "thank_you.subtitle": "Your signup has been received",
    "thank_you.desc": "We'll reach out if there's a fit for upcoming events or livestreams",
    "thank_you.received": "Signup Received",
    "thank_you.share": "Share with Friends",
    "thank_you.home": "Back to Home",
    "thank_you.footer": "Want to share this with more people?",
    "thank_you.view_qr": "View QR Code",

    "qr.title": "QR Code",
    "qr.subtitle": "Scan to join the community",
    "qr.instruction_title": "How to use this QR code",
    "qr.instruction_desc": "Point your phone camera at the QR code above to instantly access the signup form.",
    "qr.download": "Download QR Code",
    "qr.copy": "Copy Link",
    "qr.footer": "Perfect for sharing on social media, displaying at events, or printing on flyers",

    "login.title": "Admin Login",
    "login.subtitle": "Access the management dashboard",
    "login.email": "Email",
    "login.password": "Password",
    "login.submit": "Sign In",
    "login.submitting": "Signing in...",
    "login.protected": "Protected area. Authorized access only.",

    "admin.title": "Admin Dashboard",
    "admin.subtitle": "Manage community signups",
    "admin.logout": "Logout",
    "admin.total": "Total Signups",
    "admin.events": "Events Interest",
    "admin.livestreams": "Livestreams Interest",
    "admin.media": "Media Consent",
    "admin.search": "Search by name, Instagram...",
    "admin.sort": "Sort by",
    "admin.sort_newest": "Newest First",
    "admin.sort_oldest": "Oldest First",
    "admin.sort_name": "Name A-Z",
    "admin.filter_all": "All",
    "admin.col_name": "Name",
    "admin.col_ig": "Instagram",
    "admin.col_wa": "WhatsApp",
    "admin.col_city": "City",
    "admin.col_age": "Age",
    "admin.col_interests": "Interests",
    "admin.col_media": "Media",
    "admin.col_created": "Created",
    "admin.col_actions": "Actions",
    "admin.delete": "Delete",
    "admin.view_photos": "View Photos",

    "val.required": "Required",
    "val.invalid_email": "Invalid email format",
    "val.invalid_ig": "Invalid Instagram format",

    "common.yes": "Yes",
    "common.no": "No",
    "common.cancel": "Cancel"
  },
  th: {
    "signup.title": "เข้าร่วม The Homies",
    "signup.subtitle": "เข้าร่วมชุมชนสถานบันเทิงยามค่ำคืนสุดพิเศษของเรา",
    "signup.required_info": "ข้อมูลที่จำเป็น",
    "signup.name": "ชื่อ-นามสกุล",
    "signup.name_placeholder": "กรอกชื่อ-นามสกุลของคุณ",
    "signup.instagram": "อินสตาแกรม",
    "signup.instagram_placeholder": "@username",
    "signup.whatsapp": "หมายเลข WhatsApp",
    "signup.optional_info": "ข้อมูลทางเลือก",
    "signup.city": "เมือง/ย่าน",
    "signup.city_placeholder": "เช่น กรุงเทพฯ, เชียงใหม่",
    "signup.age_range": "ช่วงอายุ",
    "signup.age_placeholder": "เลือกช่วงอายุ",
    "signup.bio": "ประวัติย่อ",
    "signup.bio_placeholder": "บอกเราเกี่ยวกับตัวคุณสักเล็กน้อย...",
    "signup.photos": "อัปโหลดรูปภาพ (ทางเลือก, 1-3 รูป)",
    "signup.interests_title": "คุณสนใจอะไร?",
    "signup.interest_events": "งานกิจกรรมแบบเจอตัว",
    "signup.interest_livestreams": "สตรีมสด",
    "signup.interest_both": "ทั้งงานกิจกรรมและสตรีมสด",
    "signup.consent_title": "ความยินยอมและข้อตกลง",
    "signup.consent_18": "ฉันยืนยันว่าฉันอายุ 18 ปีขึ้นไป",
    "signup.consent_contact": "ฉันยินยอมให้ติดต่อเกี่ยวกับงานกิจกรรม",
    "signup.consent_media": "ฉันยินยอมให้ปรากฏในสตรีมสด/วิดีโอ (ทางเลือก)",
    "signup.submit": "เข้าร่วม The Homies",
    "signup.submitting": "กำลังส่ง...",

    "thank_you.title": "เรียบร้อย! 🎉",
    "thank_you.subtitle": "ได้รับข้อมูลการสมัครของคุณแล้ว",
    "thank_you.desc": "เราจะติดต่อกลับหากมีความเหมาะสมสำหรับกิจกรรมหรือสตรีมสดที่กำลังจะมาถึง",
    "thank_you.received": "ได้รับเมื่อ",
    "thank_you.share": "แบ่งปันกับเพื่อน",
    "thank_you.home": "กลับหน้าหลัก",
    "thank_you.footer": "ต้องการแบ่งปันกับคนอื่นไหม?",
    "thank_you.view_qr": "ดูคิวอาร์โค้ด",

    "qr.title": "คิวอาร์โค้ด",
    "qr.subtitle": "สแกนเพื่อเข้าร่วมชุมชน",
    "qr.instruction_title": "วิธีใช้คิวอาร์โค้ดนี้",
    "qr.instruction_desc": "เล็งกล้องโทรศัพท์ของคุณไปที่คิวอาร์โค้ดด้านบนเพื่อเข้าถึงแบบฟอร์มการสมัครทันที",
    "qr.download": "ดาวน์โหลดคิวอาร์โค้ด",
    "qr.copy": "คัดลอกลิงก์",
    "qr.footer": "เหมาะสำหรับการแชร์บนโซเชียลมีเดีย แสดงในงาน หรือพิมพ์บนใบปลิว",

    "login.title": "เข้าสู่ระบบผู้ดูแล",
    "login.subtitle": "เข้าถึงแดชบอร์ดการจัดการ",
    "login.email": "อีเมล",
    "login.password": "รหัสผ่าน",
    "login.submit": "เข้าสู่ระบบ",
    "login.submitting": "กำลังเข้าสู่ระบบ...",
    "login.protected": "พื้นที่คุ้มครอง การเข้าถึงที่ได้รับอนุญาตเท่านั้น",

    "admin.title": "แดชบอร์ดผู้ดูแล",
    "admin.subtitle": "จัดการการสมัครของชุมชน",
    "admin.logout": "ออกจากระบบ",
    "admin.total": "ยอดสมัครทั้งหมด",
    "admin.events": "สนใจกิจกรรม",
    "admin.livestreams": "สนใจสตรีมสด",
    "admin.media": "ยินยอมสื่อ",
    "admin.search": "ค้นหาด้วยชื่อ, Instagram...",
    "admin.sort": "จัดเรียงตาม",
    "admin.sort_newest": "ใหม่ล่าสุด",
    "admin.sort_oldest": "เก่าที่สุด",
    "admin.sort_name": "ชื่อ A-Z",
    "admin.filter_all": "ทั้งหมด",
    "admin.col_name": "ชื่อ",
    "admin.col_ig": "อินสตาแกรม",
    "admin.col_wa": "WhatsApp",
    "admin.col_city": "เมือง",
    "admin.col_age": "อายุ",
    "admin.col_interests": "ความสนใจ",
    "admin.col_media": "สื่อ",
    "admin.col_created": "สร้างเมื่อ",
    "admin.col_actions": "การกระทำ",
    "admin.delete": "ลบ",
    "admin.view_photos": "ดูรูปภาพ",

    "val.required": "จำเป็น",
    "val.invalid_email": "รูปแบบอีเมลไม่ถูกต้อง",
    "val.invalid_ig": "รูปแบบอินสตาแกรมไม่ถูกต้อง",

    "common.yes": "ใช่",
    "common.no": "ไม่",
    "common.cancel": "ยกเลิก"
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('app_language') || 'es';
  });

  useEffect(() => {
    localStorage.setItem('app_language', language);
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations['es'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};