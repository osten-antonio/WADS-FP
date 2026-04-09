import { adminAuth } from "../lib/firebase-admin";
async function verifyFirebaseToken(token) {
    // Dev helper for local testing before full Firebase auth wiring.
    if (token.startsWith("dev-uid:")) {
        const id = token.slice("dev-uid:".length).trim();
        return id.length > 0 ? id : null;
    }
    try {
        const decoded = await adminAuth.verifyIdToken(token, true);
        return decoded.uid;
    }
    catch {
        try {
            // Fallback: try as a session cookie
            const decoded = await adminAuth.verifySessionCookie(token, true);
            return decoded.uid;
        }
        catch {
            return null;
        }
    }
}
export async function authenticateUser(req, res, next) {
    try {
        const authorization = req.header("authorization")?.trim();
        if (authorization?.toLowerCase().startsWith("bearer ")) {
            const token = authorization.slice(7).trim();
            const userId = await verifyFirebaseToken(token);
            if (userId) {
                res.locals.authUser = {
                    userId,
                    source: "bearer-token",
                };
                next();
                return;
            }
        }
        const allowDevHeader = process.env.ALLOW_DEV_USER_ID_HEADER === "true";
        if (allowDevHeader) {
            const devUserId = req.header("x-user-id")?.trim();
            if (devUserId) {
                res.locals.authUser = {
                    userId: devUserId,
                    source: "dev-header",
                };
                next();
                return;
            }
        }
        res.status(401).json({
            message: "Unauthorized. Provide a valid Bearer token.",
        });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error during authentication" });
    }
}
//# sourceMappingURL=auth.middleware.js.map