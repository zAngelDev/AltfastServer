import passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import User from "../models/User";
import { adminUser } from "../config";

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET_KEY,
};

passport.use(
  new Strategy(options, async (jwtPayload, done) => {
    try {
      const user = await User.findOne({
        uuid: jwtPayload.uuid,
        password: jwtPayload.password,
      });
      if (!user) {
        return done(null, false);
      }
      return done(null, user.toObject());
    } catch (error) {
      console.log(error);
      return done(error, false);
    }
  })
);

(async () => {
  try {
    const user = await User.findOne({ username: adminUser.username });
    if (!user) {
      new User(adminUser).save();
    }
  } catch (error) {
    console.log(error);
  }
})();
