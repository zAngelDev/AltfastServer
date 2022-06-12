import { Schema, model } from "mongoose";
import { v4 as uuid } from "uuid";

const FileSchema = new Schema(
  {
    uuid: {
      type: String,
      default: () => uuid().replaceAll("-", ""),
    },
    folder: {
      type: String,
    },
    user: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    mimetype: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    visits: {
      type: Array,
      default: [],
    },
    downloads: {
      type: Array,
      default: [],
    },
    link: {
      type: Boolean,
      default: false,
    },
    trash: {
      type: Boolean,
      default: false,
    },
    lastModified: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default model("Files", FileSchema, "files");
