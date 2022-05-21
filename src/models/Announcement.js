import { Schema, model } from "mongoose";
import { v4 as uuid } from "uuid";

const AnnouncementSchema = new Schema(
  {
    uuid: {
      type: String,
      default: uuid,
    },
    title: {
      type: String,
      required: true,
    },
    announcement: {
      type: String,
      required: true,
    },
    visits: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default model("Announcements", AnnouncementSchema, "announcements");
