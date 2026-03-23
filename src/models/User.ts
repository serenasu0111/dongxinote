import mongoose from '../database';

const { Schema, model, models } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  settings: {
    aiAnswerLength: {
      type: String,
      enum: ['normal', 'long', 'short'],
      default: 'normal'
    },
    autoBackup: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

export const User = models.User || model('User', userSchema);
