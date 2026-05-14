const db = require('../db');
const asyncHandler = require('../middleware/asyncHandler');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// POST /api/upload/profile
const uploadProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const image_url = `${BASE_URL}/uploads/${req.file.filename}`;

  const { rows } = await db.query(
    `INSERT INTO user_images (user_id, image_url)
     VALUES ($1, $2) RETURNING *`,
    [req.user.id, image_url]
  );

  res.status(201).json(rows[0]);
});

// DELETE /api/upload/profile/:imageId
const deleteProfileImage = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `DELETE FROM user_images 
     WHERE id = $1 AND user_id = $2 
     RETURNING *`,
    [req.params.imageId, req.user.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Image not found' });

  // Obrisi fizicki fajl
  const fs = require('fs');
  const filename = rows[0].image_url.split('/uploads/')[1];
  const filepath = path.join(__dirname, '../../uploads', filename);
  if (fs.existsSync(filepath)) fs.unlinkSync(filepath);

  res.status(204).end();
});

// GET /api/upload/profile
const getProfileImages = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    'SELECT * FROM user_images WHERE user_id = $1',
    [req.user.id]
  );
  res.json(rows);
});

// POST /api/upload/property/:propertyId
const uploadPropertyImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Provjeri da li je owner
  const prop = await db.query(
    'SELECT owner_id FROM properties WHERE id = $1',
    [req.params.propertyId]
  );
  if (!prop.rows.length) {
    return res.status(404).json({ error: 'Property not found' });
  }
  if (prop.rows[0].owner_id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const image_url = `${BASE_URL}/uploads/${req.file.filename}`;

  const { rows } = await db.query(
    `INSERT INTO property_images (property_id, image_url)
     VALUES ($1, $2) RETURNING *`,
    [req.params.propertyId, image_url]
  );

  res.status(201).json(rows[0]);
});

// DELETE /api/upload/property/:propertyId/:imageId
const deletePropertyImage = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `DELETE FROM property_images 
     WHERE id = $1 AND property_id = $2 
     RETURNING *`,
    [req.params.imageId, req.params.propertyId]
  );
  if (!rows.length) return res.status(404).json({ error: 'Image not found' });

  const fs = require('fs');
  const filename = rows[0].image_url.split('/uploads/')[1];
  const filepath = path.join(__dirname, '../../uploads', filename);
  if (fs.existsSync(filepath)) fs.unlinkSync(filepath);

  res.status(204).end();
});

// POST /api/upload/repair/:repairId
const uploadRepairImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const image_url = `${BASE_URL}/uploads/${req.file.filename}`;

  const { rows } = await db.query(
    `INSERT INTO repair_images (repair_id, image_url)
     VALUES ($1, $2) RETURNING *`,
    [req.params.repairId, image_url]
  );

  res.status(201).json(rows[0]);
});

// DELETE /api/upload/repair/:repairId/:imageId
const deleteRepairImage = asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `DELETE FROM repair_images 
     WHERE id = $1 AND repair_id = $2 
     RETURNING *`,
    [req.params.imageId, req.params.repairId]
  );
  if (!rows.length) return res.status(404).json({ error: 'Image not found' });

  const fs = require('fs');
  const filename = rows[0].image_url.split('/uploads/')[1];
  const filepath = path.join(__dirname, '../../uploads', filename);
  if (fs.existsSync(filepath)) fs.unlinkSync(filepath);

  res.status(204).end();
});

module.exports = {
  uploadProfileImage,
  deleteProfileImage,
  getProfileImages,
  uploadPropertyImage,
  deletePropertyImage,
  uploadRepairImage,
  deleteRepairImage,
};