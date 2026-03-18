const mongoose = require("mongoose");

const { KNOWLEDGE_TYPES } = require("../utils/knowledgeTypes");

const knowledgeSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: KNOWLEDGE_TYPES,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false
    },
    versionKey: false
  }
);

module.exports = mongoose.model("Knowledge", knowledgeSchema);
