import express from 'express';
import session from 'express-session';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const configPath = path.join(__dirname, 'data', 'siteConfig.json');
const adminPassword = process.env.ADMIN_PASSWORD || 'casatopstore123';
const sessionSecret = process.env.SESSION_SECRET || 'casatopstore-admin-session-secret';
const isProduction = process.env.NODE_ENV === 'production';

const defaultConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

function ensureConfigFile() {
  const dataDir = path.dirname(configPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
  }
}

function readConfig() {
  ensureConfigFile();

  try {
    const raw = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    return JSON.parse(JSON.stringify(defaultConfig));
  }
}

function saveConfig(nextConfig) {
  ensureConfigFile();
  fs.writeFileSync(configPath, JSON.stringify(nextConfig, null, 2));
  return nextConfig;
}

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(express.json({ limit: '10mb' }));
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      maxAge: 1000 * 60 * 60 * 8
    }
  })
);

app.get('/api/health', (req, res) => {
  res.json({ ok: true, status: 'online' });
});

app.get('/api/auth/session', (req, res) => {
  res.json({ authenticated: Boolean(req.session.authenticated) });
});

app.post('/api/auth/login', (req, res) => {
  const { password } = req.body || {};

  if (password === adminPassword) {
    req.session.authenticated = true;
    return res.json({ ok: true, message: 'Login realizado com sucesso.' });
  }

  return res.status(401).json({ ok: false, message: 'Senha incorreta. Tente novamente.' });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true, message: 'Sessão encerrada.' });
  });
});

app.get('/api/config', (req, res) => {
  res.json({ config: readConfig() });
});

app.put('/api/config', (req, res) => {
  if (!req.session.authenticated) {
    return res.status(401).json({ ok: false, message: 'Você precisa estar autenticado para editar o conteúdo.' });
  }

  const payload = req.body || {};
  const nextConfig = saveConfig(payload);

  return res.json({ ok: true, config: nextConfig });
});

const distPath = path.join(rootDir, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }

    return res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Admin backend running on http://0.0.0.0:${port}`);
});
