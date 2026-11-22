/**
 * fallbackAdvisor.js - the "intelligent predefined responses" path.
 * Used when GEMINI_API_KEY is missing, Gemini is slow, or Gemini returns
 * something unusable. Deterministic, instant and works fully offline.
 */
import { calcSafetyScore, scoreBand } from '../../../shared/riskScore.js';

const TIPS_BY_TYPE = {
  'Street Theft': [
    'Keep bags zipped and worn in front of you in crowded lanes.',
    'Carry only the cash you need and keep a spare card elsewhere.',
    'Avoid pulling out your phone or wallet in dense crowds.',
  ],
  'Mobile Snatching': [
    'Do not use your phone near the road edge; step into a shop to make calls.',
    'Hold your phone away from passing motorcycles, especially at junctions.',
    'Enable device tracking and a screen lock before you go out.',
  ],
  'Vehicle Theft': [
    'Park in attended, well-lit lots and use a steering or wheel lock.',
    'Never leave valuables or documents visible inside the vehicle.',
    'Take a photo of your parking spot and plate before walking away.',
  ],
  Burglary: [
    'Lock all entrances and ask a neighbour to watch the property when away.',
    'Keep outdoor lights on a timer and avoid advertising travel plans.',
    'Store valuables out of sight and photograph serial numbers.',
  ],
  'Highway Robbery': [
    'Avoid this route late at night; travel in daylight or in a convoy.',
    'Keep doors locked and windows up; do not stop for unknown flagging.',
    'Share your live location and expected arrival time with someone.',
  ],
  Harassment: [
    'Stay on well-lit, busy streets and walk with a companion when possible.',
    'Keep a trusted contact on speed dial and share your route.',
    'If you feel unsafe, step into a shop or guarded entrance.',
  ],
  'Fraud / Scams': [
    'Never share OTPs or card PINs, even with callers claiming to be a bank.',
    'Check card machines for tampering before paying.',
    'Prefer official apps or verified sellers for online orders.',
  ],
  Vandalism: [
    'Park inside a compound or under cameras where you can.',
    'Report damage promptly so patrols can respond.',
    'Photograph any damage for insurance or complaints.',
  ],
};

const TIPS_BY_RISK = {
  Low: ['Stay aware of your surroundings; low risk is not no risk.'],
  Medium: [
    'Prefer daylight hours and stay on busy, well-lit streets.',
    'Tell someone your plan if you will be out late.',
  ],
  High: [
    'Avoid walking alone after dark; use a trusted ride service.',
    'Travel with a companion and share your live location.',
    'Keep valuables hidden and stay near main roads.',
  ],
};

const ACTIONS_BY_TYPE = {
  'Street Theft': ['If something is stolen, move to a safe spot and call Police on 15.', 'Block affected cards immediately through your bank app.'],
  'Mobile Snatching': ['Do not chase the snatcher; call Police on 15 from another phone.', 'Lock or remotely erase your device and inform your SIM provider.'],
  'Vehicle Theft': ['Report the theft to Police on 15 with the plate and location.', 'Notify your insurer once you have the report number.'],
  Burglary: ['Do not enter if you suspect someone is inside; call Police on 15.', 'Leave the scene untouched until officers arrive.'],
  'Highway Robbery': ['If threatened, hand over valuables and prioritise your safety.', 'Call Police on 15 or the Motorway Police helpline 130 on motorways.'],
  Harassment: ['Move to a crowded, lit place and call Police on 15.', 'Note descriptions, times and locations for a report.'],
  'Fraud / Scams': ['Call your bank straight away to freeze the account or card.', 'Report cyber fraud to the FIA Cyber Crime wing on 1991.'],
  Vandalism: ['Photograph the damage and report it to Police on 15.', 'Contact your insurer or property manager.'],
};

/** Verified national numbers. Always injected by the server, never by an LLM. */
export const EMERGENCY_CONTACTS = [
  { label: 'Police', number: '15' },
  { label: 'Rescue', number: '1122' },
  { label: 'Ambulance', number: '115' },
  { label: 'Fire Brigade', number: '16' },
  { label: 'Motorway', number: '130' },
];

export function buildFallbackAdvice(area) {
  const score = calcSafetyScore(area);
  const band = scoreBand(score);
  const typeTips = TIPS_BY_TYPE[area.crimeType] ?? [];
  const riskTips = TIPS_BY_RISK[area.riskLevel] ?? [];

  const summary =
    `${area.area}, ${area.city} is rated ${area.riskLevel.toLowerCase()} risk (${band.label.toLowerCase()}), ` +
    `mainly because of ${area.crimeType.toLowerCase()}. ${area.description}`;

  return {
    areaId: area.id,
    area: area.area,
    city: area.city,
    safetyScore: score,
    riskLevel: area.riskLevel,
    summary,
    tips: [...typeTips, ...riskTips].slice(0, 5),
    emergency: {
      actions: ACTIONS_BY_TYPE[area.crimeType] ?? ['Call Police on 15 if you are in immediate danger.'],
      contacts: EMERGENCY_CONTACTS,
    },
    source: 'fallback',
  };
}
