import { Schema, model } from "mongoose";
import { v4 as uuid } from "uuid";

const FolderSchema = new Schema(
  {
    uuid: {
      type: String,
      default: () => uuid().replaceAll("-", ""),
    },
    parent: {
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
    clasification: {
      type: String,
      default: "NONE",
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

export default model("Folders", FolderSchema, "folders");
