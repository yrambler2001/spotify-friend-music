import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const schema = new Schema(
  {
    _id: String,
    name: String,
  },
  { timestamps: true },
);

const Model = model('Context', schema);

export default Model;
