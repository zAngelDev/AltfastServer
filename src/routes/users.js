import { Router } from "express";
import * as usersController from "../controllers/users";
import passport from "passport";

const usersRouter = Router();

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

usersRouter.post(
  "/editUser",
  passport.authenticate("jwt", { session: false }),
  usersController.editUser
);

usersRouter.post(
  "/confirmEditEmail",
  passport.authenticate("jwt", { session: false }),
  usersController.confirmEditEmail
);

usersRouter.post(
  "/confirmEditPassword",
  passport.authenticate("jwt", { session: false }),
  usersController.confirmEditPassword
);

usersRouter.post(
  "/resendConfirmEditEmailEmail",
  passport.authenticate("jwt", { session: false }),
  usersController.resendConfirmEditEmailEmail
);

usersRouter.post(
  "/resendConfirmEditPasswordEmail",
  passport.authenticate("jwt", { session: false }),
  usersController.resendConfirmEditPasswordEmail
);

export default usersRouter;
