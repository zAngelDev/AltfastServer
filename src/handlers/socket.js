import { createServer } from "http";
import { Server } from "socket.io";
import passportJwtSocketIo from "passport-jwt.socketio";
import { ExtractJwt } from "passport-jwt";
import User from "../models/User";

let socket;
const socketio = createServer();
const io = new Server(socketio, {
  serveClient: false,
  cors: {
    origin: process.env.SOCKET_ORIGIN,
    methods: ["GET", "POST"],
  },
});

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET_KEY,
};

const verify = async (jwt_payload, done) => {
  try {
    const user = await User.findOne({
      uuid: jwt_payload.uuid,
      password: jwt_payload.password,
    });
    if (!user) {
      return done(null, false);
    }
    return done(null, user.toObject());
  } catch (error) {
    console.log(error);
    return done(error, false);
  }
};

io.use(passportJwtSocketIo.authorize(options, verify));

const socketHost = process.env.SOCKET_HOST;
const socketPort = process.env.SOCKET_PORT;

socketio.listen(socketPort, socketHost, () => {
  console.log(
    `SocketIO has been successfully started on http://${socketHost}:${socketPort}`
  );
});

io.on("connection", (socket) => (socket = socket));

export { io, socket };
