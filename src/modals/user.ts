import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export type userType = {
  id: string;
  fullname: string;
  email: string;
  password: string;
};

const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 8);
    next();
  }
});

const User = mongoose.model<userType>("User", userSchema);
export default User;
