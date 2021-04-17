import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const schema = new Schema(
  {
    userUri: String,
    songUri: String,
  },
  { timestamps: true },
);
schema.index({ userUri: 1, songUri: 1 }, { unique: true });

const Model = model('SongLog', schema);

Model.ensureIndexes();
Model.syncIndexes();

export default Model;
