import cors from 'cors';
import express from 'express';

import { router } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(cors());
app.use(express.json());

app.use('/api', router);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
