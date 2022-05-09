import { Router } from "express";
import * as usersController from "../controllers/users";
import passport from "passport";

const usersRouter = Router();

usersRouter.post(
  "/getPasswordLength",
  passport.authenticate("jwt", { session: false }),
  usersController.getPasswordLength
);

usersRouter.get(
  "/getStats",
  passport.authenticate("jwt", { session: false }),
  usersController.getStats
);

usersRouter.post(
  "/getAnnouncements",
  passport.authenticate("jwt", { session: false }),
  usersController.getAnnouncements
);

usersRouter.get(
  "/getAnnouncement",
  passport.authenticate("jwt", { session: false }),
  usersController.getAnnouncement
);

usersRouter.post(
  "/logAnnouncementVisit",
  passport.authenticate("jwt", { session: false }),
  usersController.logAnnouncementVisit
);

export default usersRouter;
