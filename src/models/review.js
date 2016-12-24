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
    rating: {type: Number, required: [true, 'We need a rating'], type: Number,
        min: [1, 'The rating needs to be at least 1'],
        max: [5, 'The rating may not exeed 5']},
    review: String
})

reviewSchema.pre('save', function(next) {
    this.rating = Math.floor(this.rating)
})


module.exports.Review = mongoose.model('Review', reviewSchema)
