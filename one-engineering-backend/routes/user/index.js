const express = require('express');
const router  = express.Router();

const {
  getUserById, getUserByEmployeeId, getAllUsers,
  getUsersByDepartment, getUsersByRole, getUsersByManagerId,
} = require('../../controllers/user/getUser');

const userSignUp      = require('../../controllers/user/userSignUp');
const userLogin       = require('../../controllers/user/userLogin');
const userLogout      = require('../../controllers/user/userLogout');
const getMe           = require('../../controllers/user/getMe');
const getTeamMembers  = require('../../controllers/team/getTeamMembers');
const forgotPassword  = require('../../controllers/user/forgotPassword');
const bearerAuthMiddleware = require('../../middlewares/bearerAuth');
const { authMiddleware, isManagerLevel } = require('../../middlewares/auth');

// ── Auth ─────────────────────────────────────────────────────────────
router.post('/signup',          userSignUp);
router.post('/login',           userLogin);
router.post('/logout',          userLogout);
router.post('/forgot-password', forgotPassword);

// ── Profile (accepts Bearer token OR cookie — used by Nexus & OE React) ──
router.get('/me', bearerAuthMiddleware, getMe);

// ── Team ─────────────────────────────────────────────────────────────
router.get('/team', authMiddleware, isManagerLevel, getTeamMembers);

// ── User lookups ─────────────────────────────────────────────────────
router.get('/',                        getAllUsers);
router.get('/id/:id',                  getUserById);
router.get('/employee/:employeeId',    getUserByEmployeeId);
router.get('/department/:department',  getUsersByDepartment);
router.get('/role/:role',              getUsersByRole);
router.get('/manager/:managerEmployeeId', getUsersByManagerId);

module.exports = router;
