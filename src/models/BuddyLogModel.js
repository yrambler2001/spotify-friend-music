import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const schema = new Schema(
  {
    data: { type: Buffer },
  },
  { timestamps: true },
);

const Model = model('BuddyLog', schema);

export default Model;
