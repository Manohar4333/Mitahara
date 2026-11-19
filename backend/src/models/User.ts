import mongoose, { Document, Schema } from 'mongoose';

export interface IAddress {
  fullName: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  pinCode?: string;
  marketingConsent: boolean;
  role: 'user' | 'admin';
  accountStatus: 'active' | 'suspended';
  savedAddresses: IAddress[];
  refreshTokenHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    streetAddress: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: 'India' },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, default: 'Mitahara Member', trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: { type: String, trim: true, default: '' },
    location: { type: String, trim: true, default: '' },
    pinCode: { type: String, trim: true, default: '' },
    marketingConsent: { type: Boolean, default: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    accountStatus: { type: String, enum: ['active', 'suspended'], default: 'active' },
    savedAddresses: [AddressSchema],
    refreshTokenHash: { type: String, select: false },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
