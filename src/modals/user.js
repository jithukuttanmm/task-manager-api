const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Tasks = require("./task");
// create seperate schemea to use middleware
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      validate(value) {
        if (!validator.isEmail(value)) throw new Error("Email is invalid !");
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minLength: 6,
      validate(value) {
        if (value.includes("password"))
          throw new Error("Password is invalid !");
      },
    },
    age: {
      type: Number,
      validate(value) {
        if (value < 0) throw new Error("Age must be positive number");
      },
    },
    tokens: [
      {
        token: { type: String, required: true },
      },
    ],
    avatar: {
      type: Buffer,
    },
  },
  { timestamps: true }
);

userSchema.virtual("tasks", {
  ref: "Tasks",
  localField: "_id", //
  foreignField: "owner", //foreignkey
});

userSchema.statics.findByCredentials = async (email, password) => {
  // static methods
  const user = await User.findOne({ email });
  if (!user) throw new Error("Unable to login !");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Unable to login !");

  return user;
};

userSchema.methods.generateAuthToken = async function () {
  // instance method
  const user = this;
  const token = jwt.sign(
    { _id: user._id.toString() },
    process.env.JWT_SECRET_KEY
  );
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

userSchema.methods.toJSON = async function () {
  // instance method
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;
  return userObject;
};

// something to run before save operation. - hash mongoose middleware
userSchema.pre("save", async function (next) {
  const user = this; // use the current obj
  if (user.isModified("password")) {
    user["password"] = await bcrypt.hash(user["password"], 8);
    console.log(user);
  }
  next(); // continue the op / exit from interceptor
});

userSchema.pre("remove", async function (next) {
  const user = this;
  await Tasks.deleteMany({ owner: user._id });
  next();
});

// mongoose middleware
const User = mongoose.model("User", userSchema);

module.exports = User;
