import mongoose, { Types } from "mongoose";

export type taskType = {
  owner: Types.ObjectId;
  name: string;
  description: string;
  completed: boolean;
  createdOn: Date;
};

const taskSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
  },
  name: { type: String, required: true },
  description: { type: String, require: true },
  complited: { type: Boolean, default: false },
  createdOn: { type: Date, default: Date.now },
});

const Task = mongoose.model<taskType>("Task", taskSchema);

export default Task;
