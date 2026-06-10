import { Router } from 'express';

export const gameRouter = Router();

gameRouter.get('/state/:campaignId', (req, res) => {
  res.json({ campaignId: req.params.campaignId });
});

gameRouter.post('/turn', (req, res) => {
  const { campaignId, questionId, answerId } = req.body;
  res.json({ campaignId, questionId, answerId });
});
