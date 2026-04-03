import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  userId?: mongoose.Types.ObjectId;
  name: string;
  type: 'expense' | 'income';
  icon: string;
  color: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [50, 'Category name cannot exceed 50 characters'],
    },
    type: {
      type: String,
      enum: ['expense', 'income'],
      required: [true, 'Category type is required'],
    },
    icon: {
      type: String,
      default: '📦',
    },
    color: {
      type: String,
      default: '#6366f1',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.index({ userId: 1, type: 1 });

export default mongoose.model<ICategory>('Category', categorySchema);
