import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';

const port = process.env.PORT || 5000;
try {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required');
  await connectDB();
  app.listen(port, () => console.log(`DevOpsPilot API running at http://localhost:${port}`));
} catch (error) {
  console.error('Failed to start API:', error.message);
  process.exit(1);
}
