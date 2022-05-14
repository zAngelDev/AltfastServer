import { Router } from "express";
import * as usersController from "../controllers/users";

const usersRouter = Router();

usersRouter.get("/getStats", usersController.getStats);

usersRouter.post("/getAnnouncements", usersController.getAnnouncements);

usersRouter.get("/getAnnouncement", usersController.getAnnouncement);

usersRouter.post("/searchAnnouncements", usersController.searchAnnouncements);

usersRouter.post("/logAnnouncementVisit", usersController.logAnnouncementVisit);

usersRouter.post("/editUser", usersController.editUser);

usersRouter.post("/confirmEditEmail", usersController.confirmEditEmail);

usersRouter.post("/confirmEditPassword", usersController.confirmEditPassword);

usersRouter.post(
  "/resendConfirmEditEmailEmail",
  usersController.resendConfirmEditEmailEmail
);

usersRouter.post(
  "/resendConfirmEditPasswordEmail",
  usersController.resendConfirmEditPasswordEmail
);

export default usersRouter;
