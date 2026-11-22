/**
 * Module 3 - last-resort advice used when the API cannot be reached (server
 * down, API not deployed, no network). Keeps the demo alive on stage.
 */
import { calcSafetyScore, scoreBand } from '@/utils/risk';

const TIPS = {
  Low: ['Stay aware of your surroundings, even in calm areas.', 'Keep valuables out of sight.', 'Share your plans with someone you trust.'],
  Medium: ['Prefer daylight and busy, well-lit streets.', 'Keep your phone and bag secured.', 'Tell someone your route if you are out late.'],
  High: ['Avoid travelling alone after dark.', 'Stay on main roads and keep valuables hidden.', 'Share your live location with a trusted contact.'],
};

export function buildOfflineAdvice(area) {
  const score = calcSafetyScore(area);
  return {
    areaId: area.id,
    area: area.area,
    city: area.city,
    safetyScore: score,
    riskLevel: area.riskLevel,
    summary: `${area.area}, ${area.city} is rated ${area.riskLevel.toLowerCase()} risk (${scoreBand(score).label.toLowerCase()}), mainly for ${area.crimeType.toLowerCase()}. ${area.description}`,
    tips: TIPS[area.riskLevel] ?? TIPS.Medium,
    emergency: {
      actions: ['Call Police on 15 if you are in immediate danger.'],
      contacts: [
        { label: 'Police', number: '15' },
        { label: 'Rescue', number: '1122' },
        { label: 'Ambulance', number: '115' },
      ],
    },
    source: 'offline',
  };
}
