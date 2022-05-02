import { Router } from "express";
import * as usersController from "../controllers/users";
import passport from "passport";

const usersRouter = Router();

usersRouter.post("/getUserAvatar", usersController.getUserAvatar);

usersRouter.get(
  "/getStats",
  passport.authenticate("jwt", { session: false }),
  usersController.getStats
);

usersRouter.get(
  "/getAnnouncements",
  passport.authenticate("jwt", { session: false }),
  usersController.getAnnouncements
);

usersRouter.post(
  "/logAnnouncementVisit",
  passport.authenticate("jwt", { session: false }),
  usersController.logAnnouncementVisit
);

export default usersRouter;
