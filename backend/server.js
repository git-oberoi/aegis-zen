import 'dotenv/config';
import app from './app.js';
import { connectDB } from './services/database.service.js';

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🛡️  Aegis Backend running on http://localhost:${PORT}`);
    console.log(`   Health check → http://localhost:${PORT}/health\n`);
  });
});

