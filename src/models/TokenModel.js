import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const schema = new Schema(
  {
    token: { type: String },
    expires: { type: Date },
  },
  { timestamps: true },
);

const Model = model('Token', schema);
Model.ensureIndexes();

export default Model;
