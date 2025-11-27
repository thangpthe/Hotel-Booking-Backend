import express from "express";
import { GetProfile, Login, Logout, SignUp } from "../controllers/user.controller.js";
import { isAuthenticated } from "../middllewares/isAuthenticated.js";


const userRouter = express.Router();
userRouter.post("/signup",SignUp);

userRouter.post("/login",Login);

userRouter.post("/logout",Logout);
userRouter.get("/profile", isAuthenticated, GetProfile);

export default userRouter;