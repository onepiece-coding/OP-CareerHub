const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
    },
    location: {
      type: String,
    },
    gender: {
      type: String,
    },
    role: {
      type: String,
      enum: ["admin", "recruiter", "user"],
      default: "user",
    },
    resume: {
      type: Object,
      default: {
        url: "",
        publicId: null,
      },
    },
    profilePhoto: {
      type: Object,
      default: {
        url: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png",
        publicId: null,
      },
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true } // to keep track
);

// Hashing Password
UserSchema.pre("save", async function (next) {
  const password = this.password;
  const salt = await bcrypt.genSalt(16);
  const hashedPassword = bcrypt.hashSync(password, salt);
  this.password = hashedPassword;
  next();
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
