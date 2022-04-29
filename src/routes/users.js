import { Router } from "express";
import * as usersController from "../controllers/users";
import passport from "passport";

const usersRouter = Router();

usersRouter.post("/getUserAvatar", usersController.getUserAvatar);

export default usersRouter;
