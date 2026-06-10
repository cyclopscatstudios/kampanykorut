import { Router } from 'express';

import { campaignsRouter } from './campaigns.js';
import { gameRouter } from './game.js';
import { questionsRouter } from './questions.js';

export const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

router.use('/campaigns', campaignsRouter);
router.use('/questions', questionsRouter);
router.use('/game', gameRouter);
