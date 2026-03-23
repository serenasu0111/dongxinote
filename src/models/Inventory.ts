import mongoose from '../database';

const { Schema, model, models } = mongoose;

const inventorySchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  type: {
    type: String,
    enum: ['book', 'course', 'other'],
    required: true
  },
  remark: {
    type: String,
    trim: true,
    default: '',
    maxlength: 500
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  noteCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

inventorySchema.index({ userId: 1, isArchived: 1 });

export const Inventory = models.Inventory || model('Inventory', inventorySchema);
