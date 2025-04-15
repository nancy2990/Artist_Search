const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImageUrl: { type: String },
    favorite: [
      {
        artistId: { type: String, required: true },
        addedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const favoriteSchema = new mongoose.Schema({
  artistId: { type: String, required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  birthday: { type: String },
  deathday: { type: String },
  nationality: { type: String },
  addedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);