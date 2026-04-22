const express = require('express');
const Incident = require('../models/Incident');

const router = express.Router();

// ─────────────────────────────────────────
// POST /api/incidents   — Create new incident
// ─────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const {
      caseId, type, location, description,
      severity, status, contact, people,
      lat, lng, reportedBy, reportedAt
    } = req.body;

    // Validate required fields
    if (!location || !description || !type) {
      return res.status(400).json({
        success: false,
        error: 'type, location, and description are required'
      });
    }

    // Normalise type to match enum (capitalise first letter)
    const normalisedType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
    const allowedTypes = ['Flood', 'Earthquake', 'Fire', 'Cyclone', 'Landslide', 'Drought', 'Other'];
    const finalType = allowedTypes.includes(normalisedType) ? normalisedType : 'Other';

    const incident = new Incident({
      caseId: caseId || `DS-${Date.now()}`,
      type: finalType,
      location,
      description,
      severity: severity || 'medium',
      status: status || 'active',
      contact: contact || '',
      people: people || '',
      lat: lat || null,
      lng: lng || null,
      reportedBy: reportedBy || 'Anonymous',
      reportedAt: reportedAt ? new Date(reportedAt) : new Date()
    });

    const saved = await incident.save();
    console.log(`✅ [DB] Incident saved: ${saved.caseId} (${saved.type} @ ${saved.location})`);

    res.status(201).json({
      success: true,
      _id: saved._id,
      caseId: saved.caseId,
      type: saved.type,
      location: saved.location,
      description: saved.description,
      severity: saved.severity,
      status: saved.status,
      reportedAt: saved.reportedAt,
      createdAt: saved.createdAt
    });

  } catch (error) {
    if (error.code === 11000) {
      // Duplicate caseId — generate a new one and retry
      try {
        req.body.caseId = `DS-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        return router.handle(req, res);
      } catch {}
    }
    console.error('❌ [DB] Error saving incident:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─────────────────────────────────────────
// GET /api/incidents   — Get all incidents (newest first)
// ─────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const limit  = Math.min(parseInt(req.query.limit)  || 100, 200);
    const skip   = parseInt(req.query.skip)  || 0;
    const status = req.query.status || null;

    const filter = status ? { status } : {};

    const incidents = await Incident.find(filter)
      .sort({ reportedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Incident.countDocuments(filter);

    res.json({
      success: true,
      total,
      count: incidents.length,
      incidents: incidents.map(i => ({
        id: i._id,
        caseId: i.caseId,
        type: i.type,
        location: i.location,
        description: i.description,
        severity: i.severity,
        status: i.status,
        contact: i.contact,
        people: i.people,
        lat: i.lat,
        lng: i.lng,
        reportedBy: i.reportedBy,
        reportedAt: i.reportedAt,
        createdAt: i.createdAt
      }))
    });

  } catch (error) {
    console.error('❌ [DB] Error fetching incidents:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─────────────────────────────────────────
// GET /api/incidents/:id   — Get single incident
// ─────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const incident = await Incident.findOne({
      $or: [
        { _id: req.params.id.match(/^[a-f\d]{24}$/i) ? req.params.id : null },
        { caseId: req.params.id }
      ]
    }).lean();

    if (!incident) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }

    res.json({ success: true, incident });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─────────────────────────────────────────
// PATCH /api/incidents/:id   — Update status
// ─────────────────────────────────────────
router.patch('/:id', async (req, res) => {
  try {
    const updated = await Incident.findOneAndUpdate(
      { $or: [{ _id: req.params.id }, { caseId: req.params.id }] },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }

    res.json({ success: true, incident: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─────────────────────────────────────────
// DELETE /api/incidents/:id
// ─────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Incident.findOneAndDelete({
      $or: [{ _id: req.params.id }, { caseId: req.params.id }]
    });

    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }

    res.json({ success: true, message: `Incident ${deleted.caseId} deleted` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
