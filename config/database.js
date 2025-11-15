/**
 * MongoDB Database Configuration and Models
 * Provides persistent storage for documents
 */

import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

/**
 * Connect to MongoDB
 */
export const connectDatabase = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kmrl';
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(mongoURI, options);
    
    logger.info('MongoDB connected successfully', {
      host: mongoose.connection.host,
      database: mongoose.connection.name
    });

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    logger.error('MongoDB connection failed', error);
    // Fall back to in-memory storage
    logger.warn('Falling back to in-memory storage');
  }
};

/**
 * Document Schema
 */
const documentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  filename: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Engineering', 'Finance', 'Procurement', 'HR', 'Legal', 'Safety', 'Regulatory', 'Other'],
    index: true
  },
  priority: {
    type: String,
    required: true,
    enum: ['High', 'Medium', 'Low'],
    index: true
  },
  analysis: {
    type: String,
    required: true
  },
  extractedText: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  azureUrl: {
    type: String,
    default: null
  },
  uploadedBy: {
    type: String,
    default: 'anonymous'
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'completed',
    index: true
  },
  processingTime: {
    type: Number, // in milliseconds
    default: 0
  },
  metadata: {
    aiModel: String,
    ocrEngine: String,
    processingDate: Date,
    keywords: [String]
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
documentSchema.index({ createdAt: -1 });
documentSchema.index({ category: 1, priority: 1 });
documentSchema.index({ uploadedBy: 1, createdAt: -1 });

// Virtual for formatted date
documentSchema.virtual('uploadedAtFormatted').get(function() {
  return this.createdAt.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Method to get document summary (without large text fields)
documentSchema.methods.getSummary = function() {
  return {
    id: this.id,
    filename: this.filename,
    category: this.category,
    priority: this.priority,
    analysis: this.analysis,
    fileSize: this.fileSize,
    uploadedAt: this.createdAt,
    status: this.status
  };
};

// Static method to find by custom ID
documentSchema.statics.findByCustomId = function(id) {
  return this.findOne({ id });
};

// Pre-save hook to extract keywords from analysis
documentSchema.pre('save', function(next) {
  if (this.isModified('analysis')) {
    // Extract keywords from analysis (simple implementation)
    const words = this.analysis.toLowerCase().split(/\W+/);
    const stopWords = ['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but'];
    this.metadata.keywords = words
      .filter(word => word.length > 3 && !stopWords.includes(word))
      .slice(0, 10);
  }
  next();
});

export const Document = mongoose.model('Document', documentSchema);

/**
 * Database service class
 */
export class DatabaseService {
  /**
   * Check if MongoDB is connected
   */
  static isConnected() {
    return mongoose.connection.readyState === 1;
  }

  /**
   * Save a document
   */
  static async saveDocument(documentData) {
    if (!this.isConnected()) {
      throw new Error('Database not connected');
    }

    const document = new Document(documentData);
    await document.save();
    return document;
  }

  /**
   * Get all documents with pagination and filtering
   */
  static async getDocuments(filters = {}, page = 1, limit = 50) {
    if (!this.isConnected()) {
      throw new Error('Database not connected');
    }

    const query = {};
    
    if (filters.category) {
      query.category = filters.category;
    }
    
    if (filters.priority) {
      query.priority = filters.priority;
    }
    
    if (filters.status) {
      query.status = filters.status;
    }

    const skip = (page - 1) * limit;

    const [documents, total] = await Promise.all([
      Document.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Document.countDocuments(query)
    ]);

    return {
      documents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get document by ID
   */
  static async getDocumentById(id) {
    if (!this.isConnected()) {
      throw new Error('Database not connected');
    }

    return await Document.findByCustomId(id);
  }

  /**
   * Update document
   */
  static async updateDocument(id, updates) {
    if (!this.isConnected()) {
      throw new Error('Database not connected');
    }

    return await Document.findOneAndUpdate(
      { id },
      { $set: updates },
      { new: true, runValidators: true }
    );
  }

  /**
   * Delete document
   */
  static async deleteDocument(id) {
    if (!this.isConnected()) {
      throw new Error('Database not connected');
    }

    return await Document.findOneAndDelete({ id });
  }

  /**
   * Get statistics
   */
  static async getStatistics() {
    if (!this.isConnected()) {
      throw new Error('Database not connected');
    }

    const [
      total,
      byCategory,
      byPriority,
      recentUploads
    ] = await Promise.all([
      Document.countDocuments(),
      Document.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      Document.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]),
      Document.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      })
    ]);

    return {
      total,
      byCategory: byCategory.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byPriority: byPriority.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      recentUploads
    };
  }
}
