import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getRecommendations } from '../services/recommendationEngine.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const recommendations = await getRecommendations(req.user.userId);
    res.json({ recommendations });
  } catch {
    res.status(500).json({ message: 'Erreur lors de la génération des recommandations.' });
  }
});

export default router;
