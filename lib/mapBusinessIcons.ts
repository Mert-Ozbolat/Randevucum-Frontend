import { colors } from '@/lib/colors';

/** Lucide-style 24×24 paths for map pins (centered in green circle) */
const PATHS: Record<string, string> = {
  scissors:
    '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/>',
  sparkles:
    '<path d="M12 3v3M12 18v3M3 12h3M18 12h3"/><path d="m5.6 5.6 2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>',
  waves: '<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>',
  heart:
    '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  stethoscope:
    '<path d="M11 2v2"/><path d="M5 2v2"/><path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"/><path d="M8 15a6 6 0 0 0 12 0v-3"/><circle cx="20" cy="10" r="2"/>',
  paw: '<circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/>',
  dumbbell:
    '<path d="M14.4 14.4 9.6 9.6"/><path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z"/><path d="m21.5 21.5-1.4-1.4"/><path d="M5.343 12.172a2 2 0 0 0 2.829 2.829l1.767-1.768a2 2 0 1 0 2.829 2.829l-6.364 6.364a2 2 0 1 0-2.829-2.829l1.768-1.767a2 2 0 0 0-2.828-2.829z"/><path d="m2.5 2.5 1.4 1.4"/>',
  car: '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',
  utensils:
    '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
  wrench:
    '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  building:
    '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>',
  mapPin:
    '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
};

const TYPE_TO_KEY: Record<string, keyof typeof PATHS> = {
  hair_salon: 'scissors',
  barber: 'scissors',
  beauty_center: 'sparkles',
  nail_salon: 'sparkles',
  lash_brow: 'sparkles',
  laser_epilation: 'sparkles',
  skin_care: 'sparkles',
  aesthetic_clinic: 'sparkles',
  spa_hamam: 'waves',
  massage_salon: 'waves',
  dental_clinic: 'stethoscope',
  eye_doctor: 'stethoscope',
  physiotherapist: 'stethoscope',
  psychologist: 'heart',
  dietitian: 'heart',
  lab: 'stethoscope',
  veterinarian: 'paw',
  pet_groomer: 'paw',
  pet_trainer: 'paw',
  pet_hotel: 'paw',
  pet_vaccine_tracking: 'paw',
  pilates_yoga_instructor: 'dumbbell',
  auto_repair: 'car',
  car_wash: 'car',
  tire_shop: 'car',
  ac_service: 'car',
  body_paint: 'car',
  auto_expert: 'car',
  rent_a_car: 'car',
  electrician: 'wrench',
  plumber: 'wrench',
  ac_install_maint: 'wrench',
  satellite_internet_setup: 'wrench',
  carpenter: 'wrench',
  painter: 'wrench',
  restaurant: 'utensils',
  private_tutor: 'building',
  driving_school: 'car',
  language_course: 'building',
  software_course: 'building',
  boat_tour: 'waves',
  diving_center: 'waves',
  photographer: 'sparkles',
  wedding_organization: 'sparkles',
  other: 'mapPin',
};

function buildPinSvg(innerPath: string, fill: string, size: number) {
  const s = size;
  const pad = (s - 24) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <circle cx="${s / 2}" cy="${s / 2}" r="${s / 2 - 2}" fill="${fill}" stroke="#ffffff" stroke-width="3"/>
  <g transform="translate(${pad},${pad})" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${innerPath}</g>
</svg>`;
}

export function getBusinessMapIconUrl(
  businessType: string | undefined,
  selected = false
): string {
  const key = TYPE_TO_KEY[String(businessType || '')] || 'mapPin';
  const path = PATHS[key] || PATHS.mapPin;
  const fill = selected ? colors.accent[500] : colors.primary[500];
  const size = selected ? 44 : 40;
  const svg = buildPinSvg(path, fill, size);
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

/** Red user-location pin */
export function getUserLocationIconUrl(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
  <circle cx="14" cy="14" r="12" fill="#ef4444" stroke="#ffffff" stroke-width="3"/>
  <circle cx="14" cy="14" r="4" fill="#ffffff"/>
</svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
