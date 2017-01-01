'use strict'

/**
 * @summary   This module holds the Course mongo schema and Model
 *
 * @since     25.12.2016
 * @requires Node.js, mongoose
 * @NOTE     [For devs only this module also uses eslint for code quality]
 **/


var mongoose = require('mongoose')

var Schema = mongoose.Schema

//We setup the course schema
var courseSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId, //We refer to the users id
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
}, { id: false })

//We setup the viertual overallRating
courseSchema.virtual('overallRating').get(function() {

    var reviews = this.reviews
    var totalScore = 0,
        length = 1

    if (reviews) { //If we have a review
        length = reviews.length
        reviews.forEach(review => { //We run through all of the reviews and add their rating up
            totalScore += review.rating
        })
    }
    return Math.round(totalScore / length) //we calculate the average rating
})

module.exports.Course = mongoose.model('Course', courseSchema)
