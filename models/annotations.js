
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Annotation = new Schema({
    total:Number,
    rows:Object,
    file_name:String,
    id:String
});

module.exports = mongoose.model('Annotations',Annotation);
