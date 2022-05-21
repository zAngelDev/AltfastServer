import { Schema, model } from "mongoose";
import { v4 as uuid } from "uuid";

const FolderSchema = new Schema(
  {
    uuid: {
      type: String,
      default: uuid,
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
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default model("Folders", FolderSchema, "folders");
