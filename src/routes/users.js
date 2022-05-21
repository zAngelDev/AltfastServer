import { Router } from "express";
import * as usersController from "../controllers/users";

const usersRouter = Router();

usersRouter.post("/getAnnouncements", usersController.getAnnouncements);

usersRouter.post("/getAnnouncement", usersController.getAnnouncement);

usersRouter.post("/getPayments", usersController.getPayments);

usersRouter.get("/getStats", usersController.getStats);

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

usersRouter.post("/requestPayment", usersController.requestPayment);

usersRouter.post("/updatePaymentMethods", usersController.updatePaymentMethods);

export default usersRouter;
