// routes/nexus/kpiRoutes.js
const express = require('express');
const router  = express.Router();
const Project = require('../../models/Nexus_Project');
const Update  = require('../../models/Nexus_Update');

const COE_LIST = [
  { key: 'mechanical', label: 'Mechanical',                        short: 'Mech' },
  { key: 'electrical', label: 'Electrical',                        short: 'Elec' },
  { key: 'hydraulics', label: 'Hydraulics',                        short: 'Hyd'  },
  { key: 'virtual',    label: 'Virtual Manufacturing Engineering',  short: 'VME'  },
  { key: 'lean',       label: 'Lean Manufacturing & Tool Design',   short: 'Lean' },
  { key: 'digital',    label: 'Digital Tech. & Program Management', short: 'DPM'  },
];

function parseEndDate(str) {
  if (!str) return null;
  const MONTHS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
  const match  = str.trim().match(/^([A-Za-z]{3})\s*'(\d{2})$/);
  if (!match) return null;
  const mIdx = MONTHS.indexOf(match[1].toLowerCase());
  if (mIdx === -1) return null;
  return new Date(2000 + parseInt(match[2]), mIdx + 1, 0, 23, 59, 59);
}

function computeAvg(coeData) {
  if (!coeData) return 0;
  const vals = COE_LIST.map(c => parseInt(coeData[c.key]) || 0).filter(v => v > 0);
  return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
}

function isDelayed(project, pct) {
  if (pct === 100) return false;
  const endDate = parseEndDate(project.end);
  if (!endDate) return false;
  return new Date() > endDate;
}

function classify(project, pct) {
  if (pct === 100) return 'completed';
  if (pct === 0)   return 'noprog';
  if (isDelayed(project, pct)) return 'delayed';
  return 'ongoing';
}

function hasWatchNotes(update) {
  if (!update || !update.coeNotes) return false;
  return COE_LIST.some(c => (update.coeNotes[c.key] || '').trim().length > 0);
}

async function buildEnriched() {
  const [projects, updates] = await Promise.all([
    Project.find().sort({ createdAt: -1 }).lean(),
    Update.find().lean(),
  ]);
  const updateMap = {};
  updates.forEach(u => { updateMap[String(u.projectId)] = u; });

  return projects.map(p => {
    const id     = String(p._id);
    const upd    = updateMap[id] || { coe: {}, coeNotes: {} };
    const pct    = computeAvg(upd.coe);
    const status = classify(p, pct);
    const depts  = Array.isArray(p.departments) && p.departments.length
      ? p.departments
      : (p.coe ? p.coe.split(', ') : []);
    return { project: p, update: upd, pct, status, depts, hasWatch: hasWatchNotes(upd), id };
  });
}

// GET /api/nexus/kpi/summary
router.get('/summary', async (req, res) => {
  try {
    const enriched = await buildEnriched();
    return res.json({
      total:     enriched.length,
      ongoing:   enriched.filter(e => e.status === 'ongoing').length,
      completed: enriched.filter(e => e.status === 'completed').length,
      delayed:   enriched.filter(e => e.status === 'delayed').length,
      noprog:    enriched.filter(e => e.status === 'noprog').length,
      watchlist: enriched.filter(e => e.hasWatch).length,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/nexus/kpi/details
router.get('/details', async (req, res) => {
  try {
    let enriched = await buildEnriched();
    if (req.query.status)     enriched = enriched.filter(e => e.status === req.query.status);
    if (req.query.department) {
      const dept = req.query.department.toLowerCase();
      enriched = enriched.filter(e => e.depts.some(d => d.toLowerCase().includes(dept)));
    }
    return res.json(enriched.map(e => ({
      id: e.id, name: e.project.name, lead: e.project.lead,
      priority: e.project.priority, pmo: e.project.pmo,
      start: e.project.start, end: e.project.end,
      departments: e.depts, status: e.status, pct: e.pct,
      coe: e.update.coe || {}, coeNotes: e.update.coeNotes || {}, hasWatch: e.hasWatch,
    })));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/nexus/kpi/delayed
router.get('/delayed', async (req, res) => {
  try {
    const enriched = await buildEnriched();
    const limit    = parseInt(req.query.limit) || 10;
    return res.json(
      enriched.filter(e => e.status === 'delayed')
        .sort((a, b) => a.pct - b.pct)
        .slice(0, limit)
        .map(e => ({
          id: e.id, name: e.project.name, lead: e.project.lead,
          start: e.project.start, end: e.project.end,
          pct: e.pct, priority: e.project.priority, depts: e.depts,
        }))
    );
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/nexus/kpi/departments
router.get('/departments', async (req, res) => {
  try {
    const enriched = await buildEnriched();
    return res.json(COE_LIST.map(c => {
      const matching = enriched.filter(e =>
        e.depts.some(d => d.toLowerCase() === c.label.toLowerCase())
      );
      const avgPct = matching.length
        ? Math.round(matching.reduce((sum, e) => sum + e.pct, 0) / matching.length) : 0;
      return {
        key: c.key, label: c.label, short: c.short, count: matching.length, avgPct,
        ongoing:   matching.filter(e => e.status === 'ongoing').length,
        completed: matching.filter(e => e.status === 'completed').length,
        delayed:   matching.filter(e => e.status === 'delayed').length,
        noprog:    matching.filter(e => e.status === 'noprog').length,
      };
    }));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/nexus/kpi/watchlist
router.get('/watchlist', async (req, res) => {
  try {
    const enriched = await buildEnriched();
    return res.json(
      enriched.filter(e => e.hasWatch).map(e => ({
        id: e.id, name: e.project.name, lead: e.project.lead,
        priority: e.project.priority, pmo: e.project.pmo,
        start: e.project.start, end: e.project.end,
        departments: e.depts, status: e.status, pct: e.pct,
        coe: e.update.coe || {}, coeNotes: e.update.coeNotes || {},
      }))
    );
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/nexus/kpi/health-table
router.get('/health-table', async (req, res) => {
  try {
    const enriched = await buildEnriched();
    const sortOrder = { delayed: 0, noprog: 1, ongoing: 2, completed: 3 };
    return res.json(
      [...enriched]
        .sort((a, b) =>
          sortOrder[a.status] !== sortOrder[b.status]
            ? sortOrder[a.status] - sortOrder[b.status]
            : a.pct - b.pct
        )
        .map(e => ({
          id: e.id, name: e.project.name, lead: e.project.lead,
          priority: e.project.priority, pmo: e.project.pmo,
          start: e.project.start, end: e.project.end,
          departments: e.depts, status: e.status, pct: e.pct,
          coe: e.update.coe || {}, coeNotes: e.update.coeNotes || {}, hasWatch: e.hasWatch,
        }))
    );
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
