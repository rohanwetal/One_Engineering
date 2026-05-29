// routes/nexus/projectRoutes.js
const express = require('express');
const router  = express.Router();
const Project = require('../../models/Nexus_Project');
const Update  = require('../../models/Nexus_Update');

const validateProject = (data) => {
  if (!data.name  || !data.name.trim())  return 'Project name is required';
  if (!data.lead  || !data.lead.trim())  return 'Project lead is required';
  if (!data.start || !data.end)          return 'Start and End dates are required';
  if (!Array.isArray(data.departments) || data.departments.length === 0)
    return 'At least one department must be selected';
  return null;
};

// POST /api/nexus/projects — Create
router.post('/', async (req, res) => {
  try {
    const error = validateProject(req.body);
    if (error) return res.status(400).json({ error });
    const project = await Project.create({
      ...req.body,
      coe: req.body.departments.join(', '),
    });
    return res.status(201).json(project);
  } catch (err) {
    console.error('NEXUS CREATE ERROR:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: Object.values(err.errors).map(e => e.message).join(', ') });
    }
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/nexus/projects — Get all
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    return res.json(projects);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/nexus/projects/:id — Get one
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    return res.json(project);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/nexus/projects/:id — Edit
router.put('/:id', async (req, res) => {
  try {
    const error = validateProject(req.body);
    if (error) return res.status(400).json({ error });
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      {
        name:        req.body.name.trim(),
        lead:        req.body.lead.trim(),
        priority:    req.body.priority    || 'Medium',
        pmo:         req.body.pmo         || 'No',
        start:       req.body.start,
        end:         req.body.end,
        departments: req.body.departments,
        coe:         req.body.departments.join(', '),
      },
      { new: true, runValidators: true }
    );
    if (!project) return res.status(404).json({ error: 'Project not found' });
    return res.json(project);
  } catch (err) {
    console.error('NEXUS EDIT ERROR:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: Object.values(err.errors).map(e => e.message).join(', ') });
    }
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/nexus/projects/:id — Delete (also cleans up update doc)
router.delete('/:id', async (req, res) => {
  try {
    const result = await Project.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: 'Project not found' });
    await Update.deleteOne({ projectId: req.params.id });
    return res.json({ success: true, message: 'Project and its updates deleted' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
