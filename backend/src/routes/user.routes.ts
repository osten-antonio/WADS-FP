import express from "express";

import { globalRateLimit } from "../middleware/rateLimit.middleware";
import { register, login, profile, updateUsername, filterHistory, deleteHistory, changePassword } from "../controllers/user.controller";

/**
 * @openapi
 * tags:
 *   - name: User
 *     description: User authentication and profile management (draft; update as implementation solidifies).
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     UserRole:
 *       type: string
 *       enum: [GUEST, USER]
 *     InputType:
 *       type: string
 *       enum: [TEXT, IMAGE]
 *     SubmissionStatus:
 *       type: string
 *       enum: [RECEIVED, PROCESSING, COMPLETED, FAILED]
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         email:
 *           type: string
 *           format: email
 *         displayName:
 *           type: string
 *         role:
 *           $ref: '#/components/schemas/UserRole'
 *         createdAt:
 *           type: string
 *           format: date-time
 *     SubmissionSummary:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         inputType:
 *           $ref: '#/components/schemas/InputType'
 *         rawText:
 *           type: string
 *           nullable: true
 *         imageUrl:
 *           type: string
 *           nullable: true
 *         topicSelected:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         status:
 *           $ref: '#/components/schemas/SubmissionStatus'
 *     RegisterRequest:
 *       type: object
 *       required: [email, password, displayName]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           minLength: 6
 *         displayName:
 *           type: string
 *     LoginRequest:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *     UpdateUsernameRequest:
 *       type: object
 *       required: [displayName]
 *       properties:
 *         displayName:
 *           type: string
 *     ChangePasswordRequest:
 *       type: object
 *       required: [oldPassword, newPassword]
 *       properties:
 *         oldPassword:
 *           type: string
 *         newPassword:
 *           type: string
 *           minLength: 6
 *     HistoryFilterRequest:
 *       type: object
 *       properties:
 *         topic:
 *           type: string
 *         status:
 *           $ref: '#/components/schemas/SubmissionStatus'
 *         inputType:
 *           $ref: '#/components/schemas/InputType'
 *         from:
 *           type: string
 *           format: date-time
 *         to:
 *           type: string
 *           format: date-time
 *         limit:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         offset:
 *           type: integer
 *           minimum: 0
 *     DeleteHistoryRequest:
 *       type: object
 *       required: [submissionIds]
 *       properties:
 *         submissionIds:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *     AuthResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT access token (placeholder; update if using Firebase ID tokens).
 *         user:
 *           $ref: '#/components/schemas/User'
 *     ProfileResponse:
 *       type: object
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/User'
 *     HistoryResponse:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SubmissionSummary'
 *     DeleteHistoryResponse:
 *       type: object
 *       properties:
 *         deletedCount:
 *           type: integer
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 */

const userRouter = express.Router();

/**
 * @openapi
 * /users/register:
 *   post:
 *     tags: [User]
 *     summary: Register a new user
 *     description: Draft endpoint. Replace fields once auth flow is finalized.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           example:
 *             email: user@example.com
 *             password: strongPass123
 *             displayName: Jane Doe
 *     responses:
 *       '201':
 *         description: User registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       '400':
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
userRouter.post('/register', globalRateLimit, register);

/**
 * @openapi
 * /users/login:
 *   post:
 *     tags: [User]
 *     summary: Login with email and password
 *     description: Draft endpoint. Replace fields once auth flow is finalized.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: user@example.com
 *             password: strongPass123
 *     responses:
 *       '200':
 *         description: Authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       '401':
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
userRouter.post('/login', globalRateLimit, login);

/**
 * @openapi
 * /users/profile:
 *   get:
 *     tags: [User]
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Profile returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProfileResponse'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
userRouter.get('/profile', globalRateLimit, profile);

/**
 * @openapi
 * /users/update-username:
 *   post:
 *     tags: [User]
 *     summary: Update display name
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUsernameRequest'
 *           example:
 *             displayName: Jane D.
 *     responses:
 *       '200':
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProfileResponse'
 *       '400':
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
userRouter.post('/update-username', globalRateLimit, updateUsername);

/**
 * @openapi
 * /users/filter-history:
 *   post:
 *     tags: [User]
 *     summary: Filter submission history
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HistoryFilterRequest'
 *           example:
 *             topic: Algebra
 *             status: COMPLETED
 *             inputType: TEXT
 *             from: 2025-01-01T00:00:00Z
 *             to: 2025-12-31T23:59:59Z
 *             limit: 20
 *             offset: 0
 *     responses:
 *       '200':
 *         description: Filtered history
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HistoryResponse'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
userRouter.post('/filter-history', globalRateLimit, filterHistory);

/**
 * @openapi
 * /users/delete-history:
 *   post:
 *     tags: [User]
 *     summary: Delete submission history items
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeleteHistoryRequest'
 *           example:
 *             submissionIds:
 *               - 3bdf1a46-51ab-4a6c-b9fb-9f4f3ce1b1e2
 *               - 8f1a8a52-65a2-4e1d-b29a-2e6b241d48ab
 *     responses:
 *       '200':
 *         description: Deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteHistoryResponse'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
userRouter.post('/delete-history', globalRateLimit, deleteHistory);

/**
 * @openapi
 * /users/change-password:
 *   post:
 *     tags: [User]
 *     summary: Change password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *           example:
 *             oldPassword: oldPass123
 *             newPassword: newPass123
 *     responses:
 *       '200':
 *         description: Password changed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProfileResponse'
 *       '400':
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
userRouter.post('/change-password', globalRateLimit, changePassword);

export default userRouter;
