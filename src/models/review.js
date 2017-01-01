'use strict'

/**
 * @summary   This module holds the Review mongo schema and Model
 *
 * @since     25.12.2016
 * @requires Node.js, mongoose
 * @NOTE     [For devs only this module also uses eslint for code quality]
 **/


var mongoose = require('mongoose')

//We setup the review rchema
var reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    postedOn: {
        type: Date,
        default: Date.now //The standard day is today
    },
    rating: {
        type: Number,
        required: [true, 'We need a rating'],
        min: [1, 'The rating needs to be at least 1'],
        max: [5, 'The rating may not exeed 5']
    },
    review: String
}, { id: false })

reviewSchema.pre('save', function(next) {
    this.rating = Math.floor(this.rating) //We floor the rating before we save
    next()
})

module.exports.Review = mongoose.model('Review', reviewSchema)
