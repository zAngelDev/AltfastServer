import mongoose from "mongoose";

(async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URI);
    console.log("MongoDB Database has been conected succesfully!");
  } catch (error) {
    console.log(error);
  }
})();
