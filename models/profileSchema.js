const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    userID: {type: String, require: true, unique: true},
    xp: {type: Number, default: 0},
    level: {type: Number, default: 0},
    coins: {type: Number, default: 1000},
    bank: { type: Number, default: 0}
})

const model = mongoose.model('ProfileModels', profileSchema);

module.exports = model;