const mongoose = require('mongoose');

const serverSchema = new mongoose.Schema({
    serverID: {type: String, require: true},
    prefix: {type: String, require: true, default: ">"},
})

const model = mongoose.model('ServerModels', serverSchema);

module.exports = model;