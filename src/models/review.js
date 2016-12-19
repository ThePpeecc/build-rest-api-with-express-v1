var mongoose = require('mongoose')

var reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    postedOn: {
        type: Date,
        default: Date.now
    },
    rating: Number,
    review: String
})



module.exports.Review = mongoose.model('Review', reviewSchema)
