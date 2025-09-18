const mongoose = require('mongoose');

const noteBookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  notes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note'
  }],
  category: {
    type: String,
    trim: true,
    default: 'general'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  authorID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false 
  }
}, {
  timestamps: true, // Automatically manages createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


noteBookSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

noteBookSchema.pre('updateOne', function(next) {
  this.updatedAt = Date.now();
  next();
});

noteBookSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('NoteBook', noteBookSchema);
