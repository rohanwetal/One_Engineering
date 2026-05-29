// routes/nexus/updateRoutes.js
const express = require('express');
const router  = express.Router();
const Update  = require('../../models/Nexus_Update');
const Project = require('../../models/Nexus_Project');

// POST /api/nexus/updates/:projectId — Save or upsert progress
router.post('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { coe, coeNotes } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const update = await Update.findOneAndUpdate(
      { projectId },
      { $set: { coe: coe || {}, coeNotes: coeNotes || {} } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    return res.json(update);
  } catch (err) {
    console.error('NEXUS UPDATE SAVE ERROR:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/nexus/updates/:projectId — Get update for one project
router.get('/:projectId', async (req, res) => {
  try {
    const update = await Update.findOne({ projectId: req.params.projectId });
    return res.json(update || { coe: {}, coeNotes: {} });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/nexus/updates — Get all updates
router.get('/', async (req, res) => {
  try {
    const updates = await Update.find();
    return res.json(updates);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/nexus/updates/:projectId — Remove update for a project
router.delete('/:projectId', async (req, res) => {
  try {
    await Update.deleteOne({ projectId: req.params.projectId });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
