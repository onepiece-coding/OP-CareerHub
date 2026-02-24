import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IResource {
  url: string;
  publicId: string | null;
}

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  location: string;
  gender: 'male' | 'female';
  role: 'admin' | 'recruiter' | 'user';
  isAccountVerified: boolean;
  profilePhoto: IResource;
  resume: IResource;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      minlength: 5,
      maxlength: 100,
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
      enum: ['male', 'female'],
    },
    role: {
      type: String,
      enum: ['admin', 'recruiter', 'user'],
      default: 'user',
    },
    isAccountVerified: {
      type: Boolean,
      default: false,
    },
    resume: {
      type: Object,
      default: {
        url: '',
        publicId: null,
      },
    },
    profilePhoto: {
      type: Object,
      default: {
        url: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png',
        publicId: null,
      },
    },
  },
  { timestamps: true }, // to keep track
);

// Hash password before save
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

// User Model
export default model<IUser>('User', UserSchema);
