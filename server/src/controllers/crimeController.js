import { crimeRepository } from '../services/crimeRepository.js';

export function listCrimes(req, res) {
  const { city, risk, type, q } = req.query;
  const data = crimeRepository.list({ city, risk, type, q });
  res.json({ count: data.length, dataKind: 'sample', data });
}

export function getCrime(req, res) {
  const crime = crimeRepository.findById(req.params.id);
  if (!crime) return res.status(404).json({ error: `No area with id "${req.params.id}"` });
  res.json(crime);
}
