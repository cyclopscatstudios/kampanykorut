import { Router } from 'express';

export const campaignsRouter = Router();

campaignsRouter.get('/', (_req, res) => {
  res.json([]);
});

campaignsRouter.get('/:id', (req, res) => {
  res.json({ id: req.params.id });
});
