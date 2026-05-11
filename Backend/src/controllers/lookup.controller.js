const db = require('../db');
const asyncHandler = require('../middleware/asyncHandler');

// ── Generic helpers ──────────────────────────────────────────
const makeList = (table, orderBy = 'name') =>
  asyncHandler(async (req, res) => {
    const { rows } = await db.query(`SELECT * FROM ${table} ORDER BY ${orderBy}`);
    res.json(rows);
  });

const makeCreate = (table) =>
  asyncHandler(async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const { rows } = await db.query(
      `INSERT INTO ${table} (name) VALUES ($1) RETURNING *`,
      [name]
    );
    res.status(201).json(rows[0]);
  });

const makeDelete = (table) =>
  asyncHandler(async (req, res) => {
    const { rows } = await db.query(
      `DELETE FROM ${table} WHERE id = $1 RETURNING id`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  });

// ── Cities ───────────────────────────────────────────────────
const listCities  = makeList('cities', 'name');
const createCity  = makeCreate('cities');
const deleteCity  = makeDelete('cities');

// ── Skills ───────────────────────────────────────────────────
const listSkills  = makeList('skills', 'name');
const createSkill = makeCreate('skills');
const deleteSkill = makeDelete('skills');

// ── Skill Levels ─────────────────────────────────────────────
const listSkillLevels  = makeList('skill_levels', 'id');
const createSkillLevel = makeCreate('skill_levels');
const deleteSkillLevel = makeDelete('skill_levels');

// ── Categories ───────────────────────────────────────────────
const listCategories  = makeList('categories', 'name');
const createCategory  = makeCreate('categories');
const deleteCategory  = makeDelete('categories');

// ── Statuses ─────────────────────────────────────────────────
const listStatuses  = makeList('statuses', 'id');
const createStatus  = makeCreate('statuses');
const deleteStatus  = makeDelete('statuses');

// ── Urgencies ────────────────────────────────────────────────
const listUrgencies  = makeList('urgencies', 'id');
const createUrgency  = makeCreate('urgencies');
const deleteUrgency  = makeDelete('urgencies');

// ── Roles ────────────────────────────────────────────────────
const listRoles = makeList('roles', 'id');

module.exports = {
  listCities, createCity, deleteCity,
  listSkills, createSkill, deleteSkill,
  listSkillLevels, createSkillLevel, deleteSkillLevel,
  listCategories, createCategory, deleteCategory,
  listStatuses, createStatus, deleteStatus,
  listUrgencies, createUrgency, deleteUrgency,
  listRoles,
};