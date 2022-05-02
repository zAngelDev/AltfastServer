import { Schema, model } from "mongoose";
import { v4 as uuid } from "uuid";

const FolderSchema = new Schema(
  {
    uuid: {
      type: String,
      default: uuid(),
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
      required: true,
    },
    downloads: {
      type: Array,
      default: [],
      required: true,
    },
    link: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default model("Folders", FolderSchema, "folders");
