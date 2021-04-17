import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const schema = new Schema(
  {
    _id: String,
    name: String,
    imageUrl: String,
    albumUri: String,
    artistUri: String,
    contextUri: String,
  },
  { timestamps: true },
);

const Model = model('Song', schema);

export default Model;
