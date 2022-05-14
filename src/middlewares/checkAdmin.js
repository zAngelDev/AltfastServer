import { isAdmin } from "../utils/utils";

const checkAdmin = (req, res, next) => {
  const user = req.user;
  const canAccess = isAdmin(user);
  if (!canAccess) {
    res.status(401).end();
    return;
  }
  next();
};

export default checkAdmin;
