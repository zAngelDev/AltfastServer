import { Router } from "express";
import * as usersController from "../controllers/users";
import passport from "passport";

const usersRouter = Router();

usersRouter.post("/getUserAvatar", usersController.getUserAvatar);

usersRouter.post(
  "/getStats",
  passport.authenticate("jwt", { session: false }),
  usersController.getStats
);

export default usersRouter;
