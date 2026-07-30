/** Backend area/profession values (Turkish) — used in API query params */
export type HomeSearchService = {
  id: string;
  profession: string;
  area: string;
  areaId: string;
};

export const HOME_SEARCH_SERVICES: HomeSearchService[] = [
  { id: 'hairdresser', profession: 'Kuaför', area: 'Güzellik & Bakım', areaId: 'beauty' },
  { id: 'barber', profession: 'Berber', area: 'Güzellik & Bakım', areaId: 'beauty' },
  { id: 'beautyExpert', profession: 'Güzellik Uzmanı', area: 'Güzellik & Bakım', areaId: 'beauty' },
  { id: 'spa', profession: 'SPA & Hamam', area: 'Güzellik & Bakım', areaId: 'beauty' },
  { id: 'massage', profession: 'Masaj Salonu', area: 'Güzellik & Bakım', areaId: 'beauty' },
  { id: 'dentist', profession: 'Diş Hekimi', area: 'Sağlık', areaId: 'health' },
  { id: 'psychologist', profession: 'Psikolog', area: 'Sağlık', areaId: 'health' },
  { id: 'dietitian', profession: 'Diyetisyen', area: 'Sağlık', areaId: 'health' },
  { id: 'physiotherapist', profession: 'Fizyoterapist', area: 'Sağlık', areaId: 'health' },
  { id: 'pilates', profession: 'Pilates Eğitmeni', area: 'Spor & Wellness', areaId: 'sport' },
  { id: 'fitness', profession: 'Fitness & Personal Trainer', area: 'Spor & Wellness', areaId: 'sport' },
  { id: 'vet', profession: 'Veteriner Kliniği', area: 'Hayvan Bakımı', areaId: 'pet' },
  { id: 'auto', profession: 'Oto Tamir & Mekanik Servis', area: 'Otomotiv', areaId: 'auto' },
  { id: 'restaurant', profession: 'Restoran', area: 'Yeme & İçme', areaId: 'food' },
];

export function findHomeSearchServiceByProfession(profession: string): HomeSearchService | undefined {
  const q = profession.trim().toLowerCase();
  return HOME_SEARCH_SERVICES.find((s) => s.profession.toLowerCase() === q);
}
