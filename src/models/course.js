var mongoose = require('mongoose')

var Schema = mongoose.Schema

var courseSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    title: String,
    description: String,
    estimatedTime: String,
    materialsNeeded: String,
    steps: [{
        stepNumber: Number,
        title: String,
        description: String
    }],
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review' //We refer to the Review model. Read more about it here http://mongoosejs.com/docs/populate.html
    }]
})

courseSchema.virtual('overallRating').get(function() {

    var reviews = this.reviews
    var totalScore = 0,
        length = 1
    if (reviews) {
        length = reviews.length
        reviews.forEach(review => {
            totalScore += review.rating
        })
    }
    return Math.round(totalScore / length)
})



module.exports.Course = mongoose.model('Course', courseSchema)
