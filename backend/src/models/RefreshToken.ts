import { Schema, model, Document, Types } from 'mongoose';

export interface IRefreshToken extends Document {
  userId: Types.ObjectId;
  tokenHash: string; // sha256 hash of the token/JWT string
  expiresAt: Date;
  createdAt: Date;
  revoked?: boolean;
  replacedByToken?: string | null; // optional: store the new token hash when rotated
}

const RefreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tokenHash: { type: String, required: true, index: true, unique: true },
    expiresAt: { type: Date, required: true },
    revoked: { type: Boolean, default: false },
    replacedByToken: { type: String, default: null },
  },
  { timestamps: true },
);

export default model<IRefreshToken>('RefreshToken', RefreshTokenSchema);
