const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
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
    required: false // Set to true if you have user authentication
  }
}, {
  timestamps: true, // Automatically manages createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted creation date
noteSchema.virtual('formattedCreatedAt').get(function() {
  return this.createdAt.toLocaleDateString();
});

// Virtual for word count
noteSchema.virtual('wordCount').get(function() {
  return this.content.split(/\s+/).filter(word => word.length > 0).length;
});

// Index for better search performance
noteSchema.index({ title: 'text', content: 'text', tags: 'text' });
noteSchema.index({ createdAt: -1 });
noteSchema.index({ userId: 1, createdAt: -1 });

noteSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

noteSchema.statics.findByTitle = function(title) {
  return this.find({ title: title });
};

noteSchema.statics.findByTag = function(tag) {
  return this.find({ tags: { $in: [tag] } });
};

noteSchema.statics.findByCategory = function(category) {
  return this.find({ category: category });
};

const Note = mongoose.models.Note || mongoose.model('Note', noteSchema);

module.exports = Note;