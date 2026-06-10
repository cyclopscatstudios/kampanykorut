import { Router } from 'express';

export const questionsRouter = Router();

questionsRouter.get('/', (_req, res) => {
  res.json([]);
});

questionsRouter.get('/:id', (req, res) => {
  res.json({ id: req.params.id });
});
