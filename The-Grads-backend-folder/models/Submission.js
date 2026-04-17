const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true
  },

  code: {
    type: String,
    required: true
  },

  language: {
    type: String,
    default: 'python'
  },

  status: {
    type: String,
    enum: ['PASSED','FAILED','PARTIAL','PENDING'],
    default: 'PENDING'
  },

  expAwarded: {
    type: Number,
    default: 0
  }
}, {timestamps: true});

module.exports = mongoose.model('Submission', submissionSchema);