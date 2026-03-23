import mongoose from '../database';

const { Schema, model, models } = mongoose;

const noteSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  inventoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Inventory',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['image', 'document', 'text'],
    required: true
  },
  originalContent: {
    type: String,
    required: true
  },
  ocrContent: {
    type: String,
    default: ''
  },
  remark: {
    type: String,
    default: '',
    maxlength: 5000
  },
  tags: [{
    type: String,
    trim: true
  }],
  embedding: [{
    type: Number
  }],
  relatedNotes: [{
    type: Schema.Types.ObjectId,
    ref: 'Note'
  }]
}, {
  timestamps: true
});

noteSchema.index({ userId: 1, createdAt: -1 });
noteSchema.index({ inventoryId: 1, createdAt: -1 });
noteSchema.index({ tags: 1 });

export const Note = models.Note || model('Note', noteSchema);
