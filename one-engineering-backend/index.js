require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const cookieParser = require('cookie-parser');
const connectDB    = require('./config/db');
const http         = require('http');

const app    = express();
const server = http.createServer(app);

// ── CORS ─────────────────────────────────────────────────────────────
const corsOptions = {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// ── DesignWorks (OE) routes ───────────────────────────────────────────
app.use('/api/users',                 require('./routes/user'));
app.use('/api/projects',              require('./routes/project'));
app.use('/api/dept-hours',            require('./routes/deptHours'));
app.use('/api/allocations',           require('./routes/allocations'));
app.use('/api/weekly-plans',          require('./routes/weeklyPlans'));
app.use('/api/weekly-cap',            require('./routes/weeklyCap'));
app.use('/api/weekly-project-config', require('./routes/weeklyProjectConfig'));
app.use('/api/work-logs',             require('./routes/workLogs'));
app.use('/api/audit-logs',            require('./routes/auditLogs'));
app.use('/api/weekly-summary',        require('./routes/summary'));
app.use('/api/reports',               require('./routes/report'));
app.use('/api/project-progress',      require('./routes/projectProgress'));

// ── Nexus routes ─────────────────────────────────────────────────────
app.use('/api/nexus/projects', require('./routes/nexus/projectRoutes'));
app.use('/api/nexus/kpi',      require('./routes/nexus/kpiRoutes'));
app.use('/api/nexus/updates',  require('./routes/nexus/updateRoutes'));

// ── Health check ─────────────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date() }));

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  console.log('✅  DB connected');

  // Attach socket.io if socket.js exists
  try {
    const initSocket = require('./socket');
    initSocket(server);
    console.log('✅  Socket.io attached');
  } catch (e) {
    console.log('ℹ️   No socket.js found, skipping socket.io');
  }

  server.listen(PORT, () => {
    console.log(`🚀  One Engineering backend: http://localhost:${PORT}`);
    console.log(`    DesignWorks APIs : /api/users, /api/projects, ...`);
    console.log(`    Nexus APIs       : /api/nexus/projects, /api/nexus/kpi, /api/nexus/updates`);
    console.log(`    Project Progress : /api/project-progress`);
  });
});
