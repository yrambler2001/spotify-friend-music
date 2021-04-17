import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const schema = new Schema(
  {
    _id: String,
    name: String,
  },
  { timestamps: true },
);

const Model = model('Album', schema);

export default Model;
