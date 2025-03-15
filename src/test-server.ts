import express from 'express';
import prisma from './core/database/prisma';

const app = express();
const port = process.env.PORT || 3002;

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.get('/test-db', async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    res.json({ status: 'ok', userCount });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ status: 'error', message: 'Database error' });
  }
});

app.listen(port, () => {
  console.log(`Test server running on port ${port}`);
}); 