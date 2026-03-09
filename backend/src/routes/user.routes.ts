import express from "express";

import { globalRateLimit } from "../middleware/rateLimit.middleware";
import { register, login, profile, updateUsername, filterHistory, deleteHistory, changePassword } from "../controllers/user.controller";

const userRouter = express.Router();

userRouter.post('/register', globalRateLimit, register);
userRouter.post('/login', globalRateLimit, login);
userRouter.get('/profile', globalRateLimit, profile);
userRouter.post('/update-username', globalRateLimit, updateUsername);
userRouter.post('/filter-history', globalRateLimit, filterHistory);
userRouter.post('/delete-history', globalRateLimit, deleteHistory);
userRouter.post('/change-password', globalRateLimit, changePassword);

export default userRouter;
