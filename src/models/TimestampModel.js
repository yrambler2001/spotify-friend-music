import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

const schema = new Schema(
  {
    songLogId: Types.ObjectId,
    timestamp: Date,
  },
  { timestamps: true },
);

schema.index({ songLogId: 1, timestamp: 1 }, { unique: true });

const Model = model('SongTimestamp', schema);

Model.ensureIndexes();
Model.syncIndexes();

export default Model;
