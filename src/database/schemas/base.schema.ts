import { Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret) => {
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class BaseSchema extends Document {
  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
} 