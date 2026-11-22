import { getAdviceForArea } from '../services/advisorService.js';

export async function getAdvice(req, res, next) {
  try {
    const advice = await getAdviceForArea(req.params.id);
    if (!advice) return res.status(404).json({ error: `No area with id "${req.params.id}"` });
    res.json(advice);
  } catch (err) {
    next(err);
  }
}
