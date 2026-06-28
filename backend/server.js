import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🛡️  Aegis Backend running on http://localhost:${PORT}`);
  console.log(`   Health check → http://localhost:${PORT}/health\n`);
});
