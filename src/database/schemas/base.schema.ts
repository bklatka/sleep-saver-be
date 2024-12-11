import { Schema } from 'mongoose';

export const BaseSchema = new Schema(
  {},
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
); 