import mongoose, { Schema } from 'mongoose';

const subscriptionSchema = new Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId, // jo subscribe kar rha h
      ref: 'User',
    },
    channel: {
      type: Schema.Types.ObjectId, // kon kisko subscribe kar rha hai
      ref: 'User',
    },
  },
  { timestamps: true }
);

export const Subscription = mongoose.model('Subscription', subscriptionSchema);
