/** Public contact details for Quayvox */
export const CONTACT_EMAIL = 'info@quayvox.com';
export const CONTACT_PHONE_DISPLAY = '+1 972-383-9794';
export const CONTACT_PHONE_E164 = '+19723839794';
export const CONTACT_TEL_HREF = `tel:${CONTACT_PHONE_E164}`;
export const CONTACT_WHATSAPP_HREF = `https://wa.me/${CONTACT_PHONE_E164.replace('+', '')}`;
export const CONTACT_MAILTO_HREF = `mailto:${CONTACT_EMAIL}`;

/** Global shipping branches — all continents */
export const BRANCHES = [
  { country: 'USA', continent: 'North America' },
  { country: 'Mexico', continent: 'North America' },
  { country: 'UK', continent: 'Europe' },
  { country: 'Russia', continent: 'Europe / Asia' },
  { country: 'Egypt', continent: 'Africa' },
  { country: 'Japan', continent: 'Asia' },
  { country: 'Australia', continent: 'Oceania' },
] as const;

export const BRANCHES_LINE = BRANCHES.map((b) => b.country).join(' · ');
