import express from 'express';
import destinationsRouter from './routes/destinations.js';

const app = express();
app.use(express.json());

// Mount the destination endpoints
app.use('/api/destinations', destinationsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`FlyMatrix backend running on port ${PORT}`);
});
