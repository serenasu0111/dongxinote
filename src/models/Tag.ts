import mongoose from '../database';

const { Schema, model, models } = mongoose;

const tagSchema = new Schema({
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
    maxlength: 50
  },
  color: {
    type: String,
    default: '#6366f1'
  }
}, {
  timestamps: true
});

tagSchema.index({ userId: 1, name: 1 }, { unique: true });

export const Tag = models.Tag || model('Tag', tagSchema);
