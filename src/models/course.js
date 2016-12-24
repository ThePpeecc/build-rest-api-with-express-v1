var mongoose = require('mongoose')

var Schema = mongoose.Schema

var courseSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    title: {
        type: String,
        required: [true, 'We need a title']
    },
    description: {
        type: String,
        required: [true, 'We need a description']
    },
    estimatedTime: String,
    materialsNeeded: String,
    steps: {
        type: [{
            stepNumber: Number,
            title: {
                type: String,
                required: [true, 'We need a step title']
            },
            description: {
                type: String,
                required: [true, 'We need a step description']
            },
        }],
        validate: {
            validator: function(steps) { //Validator function
                return steps.length > 0 ? true : false
            },
            message: 'We need at least one step'
        },
        required: [true, 'We need steps']
    },
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
