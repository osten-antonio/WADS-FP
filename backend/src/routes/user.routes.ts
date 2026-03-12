import express from "express";

import { globalRateLimit } from "../middleware/rateLimit.middleware";
import { register, login, profile, updateUsername, filterHistory, deleteHistory, changePassword, forgotPassword } from "../controllers/user.controller";

/**
 * @openapi
 * tags:
 *   - name: User
 *     description: User profile, authentication sync, and history management via Firebase Admin SDK.
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: Firebase ID Token obtained from the client-side Firebase SDK. Required for most user operations.
 */

const userRouter = express.Router();

/**
 * @openapi
 * /users/register:
 *   post:
 *     tags: [User]
 *     summary: Register a new user
 *     description: Sync user account after Firebase registration. Decodes Firebase ID token to get UID.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [displayName]
 *             properties:
 *               displayName:
 *                 type: string
 *           example:
 *             displayName: Jane Doe
 *     responses:
 *       '201':
 *         description: User registered in local database
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/profileResponse'
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
 *     summary: Login user
 *     description: Sync session/validate Firebase ID token using Admin SDK.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Authenticated and synced
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/profileResponse'
 *       '401':
 *         description: Invalid or expired Firebase token
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
 *         description: Profile returned with submission history
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/profileResponse'
 *             example:
 *               user:
 *                 firebaseUID: "abc123firebase"
 *                 displayName: "John Doe"
 *               history:
 *                 - id: "3bdf1a46-51ab-4a6c-b9fb-9f4f3ce1b1e2"
 *                   inputMode: "TEXT"
 *                   category: "Calculus"
 *                   type: "Derivatives"
 *                   subtype: "Power Rule"
 *                   text: "What is the derivative of x^2?"
 *                   createdAt: "2026-03-12T10:00:00Z"
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Unauthorized access"
 */
userRouter.get('/profile', globalRateLimit, profile);

/**
 * @openapi
 * /users/update-username:
 *   patch:
 *     tags: [User]
 *     summary: Update display name
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/updateUsernameRequest'
 *           example:
 *             displayName: "Johnny Doe"
 *     responses:
 *       '200':
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/profileResponse'
 *             example:
 *               user:
 *                 firebaseUID: "abc123firebase"
 *                 displayName: "Johnny Doe"
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
userRouter.patch('/update-username', globalRateLimit, updateUsername);

/**
 * @openapi
 * /users/filter-history:
 *   get:
 *     tags: [User]
 *     summary: Filter submission history by category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Category to filter submissions by.
 *     responses:
 *       '200':
 *         description: Filtered history
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/historyResponse'
 *             example:
 *               items:
 *                 - id: "3bdf1a46-51ab-4a6c-b9fb-9f4f3ce1b1e2"
 *                   inputMode: "TEXT"
 *                   category: "Calculus"
 *                   type: "Derivatives"
 *                   subtype: "Power Rule"
 *                   text: "What is the derivative of x^2?"
 *                   createdAt: "2026-03-12T10:00:00Z"
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
userRouter.get('/filter-history', globalRateLimit, filterHistory);

/**
 * @openapi
 * /users/delete-history:
 *   delete:
 *     tags: [User]
 *     summary: Delete submission history items
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/deleteHistoryRequest'
 *           example:
 *             submissionIds:
 *               - 3bdf1a46-51ab-4a6c-b9fb-9f4f3ce1b1e2
 *     responses:
 *       '200':
 *         description: Deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/deleteHistoryResponse'
 *             example:
 *               deletedCount: 1
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
userRouter.delete('/delete-history', globalRateLimit, deleteHistory);

/**
 * @openapi
 * /users/delete-history/{id}:
 *   delete:
 *     tags: [User]
 *     summary: Delete a specific submission history item
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique ID of the problem submission to delete.
 *     responses:
 *       '200':
 *         description: Item deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/deleteHistoryResponse'
 *             example:
 *               deletedCount: 1
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Submission not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
userRouter.delete('/delete-history/:id', globalRateLimit, deleteHistory);

/**
 * @openapi
 * /users/change-password:
 *   patch:
 *     tags: [User]
 *     summary: Change password (Authenticated)
 *     description: Update password for a logged-in user using Firebase Admin SDK. Requires a fresh token.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/changePasswordRequest'
 *           example:
 *             newPassword: "newSecurePass123"
 *     responses:
 *       '200':
 *         description: Password updated in Firebase
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/profileResponse'
 *       '400':
 *         description: Validation error or token too old
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
userRouter.patch('/change-password', globalRateLimit, changePassword);

/**
 * @openapi
 * /users/forgot-password:
 *   post:
 *     tags: [User]
 *     summary: Request password reset email
 *     description: Generates a Firebase password reset link and triggers an email to the user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/forgotPasswordRequest'
 *           example:
 *             email: "user@example.com"
 *     responses:
 *       '200':
 *         description: Reset email sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               example:
 *                 message: "Reset link sent to user@example.com"
 *       '400':
 *         description: User not found or invalid email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
userRouter.post('/forgot-password', globalRateLimit, forgotPassword);

export default userRouter;

