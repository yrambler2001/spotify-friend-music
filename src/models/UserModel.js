import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const schema = new Schema(
  {
    _id: String,
    name: String,
    imageUrl: String,
  },
  { timestamps: true },
);

const Model = model('User', schema);

export default Model;
