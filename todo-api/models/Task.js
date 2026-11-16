const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    titre: {
      type: String,
      required: [true, 'Le titre est obligatoire'],
      trim: true,
      maxlength: [100, 'Le titre doit avoir 100 caractères maximum'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'La description doit avoir 500 caractères maximum'],
      default: '',
    },
    statut: {
      type: String,
      enum: {
        values: ['a_faire', 'en_cours', 'termine'],
        message: 'Le statut doit être a_faire, en_cours ou termine',
      },
      default: 'a_faire',
    },
    priorite: {
      type: String,
      enum: {
        values: ['basse', 'moyenne', 'haute'],
        message: 'La priorité doit être basse, moyenne ou haute',
      },
      default: 'moyenne',
    },
    dateLimite: {
      type: Date,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, "L'utilisateur est obligatoire"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);