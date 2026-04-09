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
declare const userRouter: import("express-serve-static-core").Router;
export default userRouter;
//# sourceMappingURL=user.routes.d.ts.map