import express from "express";
import { Login, Logout, SignUp } from "../controllers/user.controller.js";
import { isAuthenticated } from "../middllewares/isAuthenticated.js";


const userRouter = express.Router();
userRouter.post("/signup",SignUp);

userRouter.post("/login",Login);

userRouter.post("/logout",isAuthenticated,Logout);

export default userRouter;