const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
    },
    status: {
        type : Boolean,
        default : false
    },
},
    { timestamps: true }
)
module.exports = mongoose.model("Category", CategorySchema);