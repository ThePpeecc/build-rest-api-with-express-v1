'use strict'

/**
 * @summary   This Module holds the main api router
 *
 * @since     25.12.2016
 * @requires Node.js, mid & express
 * @NOTE     [For devs only this module also uses eslint for code quality]
 **/

//We get our required module
var express = require('express'),
    User = require('../models/user').User,
    Review = require('../models/review').Review,
    Course = require('../models/course').Course,
    mid = require('../middleware/mid')

var router = express.Router()

// /api/courses
// GET - Returns a list of courses
// POST - Creates a course

router.get('/courses', function(req, res, next) {
    Course.find({}) //We find all the courses
        .select('_id title') //We only get the _id and title
        .exec(function(err, courses) {
            if (err) { //if err
                return next(err)
            }
            res.status(200)
            return res.json({
                data: courses //return the response
            })
        })
})

router.post('/courses', mid.isAuth, function(req, res, next) {
    //The logged in user must be the same user is referred to in the created the post
    if (req.body.user) {
        if (req.body.user._id == req.currentUser._id) {
            var course = new Course(req.body) //We create a new course
            course.save(function(err) {
                if (err) { //if err
                    err.status = 400
                    return next(err)
                }
                res.status(201)
                res.location('/courses')
                return res.end() //We end the response with a http 201 response
            })
        } else { //The user is not logged in
            var err = new Error('You do not have authentication to create this course')
            err.status = 401
            return next(err)
        }
    } else {
        //No user has been added to the body object
        var error = new Error('You need to supply an author of the course')
        error.status = 401
        return next(error)
    }
})

// /api/courses/:id
// GET - Returns a single course
// PUT - Updates a course

router.get('/courses/:idCourse', function(req, res, next) {
    Course.findById(req.params.idCourse) //We find the course by the supplied id
        .populate('reviews')
        .populate('user', '_id') //We populate the reviews and user
        .exec(function(err, course) {
            if (err) { //if err
                err.status = 404
                return next(err)
            }

            res.status(200)
            return res.json({
                data: [course] //Return the courses
            })
        })
})


//We update a course
router.put('/courses/:idCourse', mid.isAuth, function(req, res, next) {
    //The logged in user must be the same as the user that created the post
    if (req.body.user) {
        if (req.body.user._id == req.currentUser._id) {
            Course.findOneAndUpdate({
                '_id': req.params.idCourse
            }, req.body) //We find and try to update the course
                .exec(function(err) {
                    if (err) { //If err
                        err.status = 400
                        return next(err)
                    }

                    res.status(204)
                    return res.end() //We return a response
                })
        } else { //They are either not logged in or are not the same user
            var err = new Error('You do not have authentication to update this course')
            err.status = 401
            return next(err)
        }
    } else {
        //No user has been added to the body object
        var error = new Error('You need to supply an author of the course')
        error.status = 401
        return next(error)
    }
})

// /api/courses/:courseId/reviews
// POST - Creates a review for the specified course
router.post('/courses/:idCourse/reviews', mid.isAuth, function(req, res, next) {
    Course.findById(req.params.idCourse) //We find the course
        .populate('reviews')
        .populate('user', '_id')
        .exec(function(err, course) {
            if (err) { //if err
                return next(err)
            }

            if (course) {
                var newReview = new Review(req.body) //create the a new review
                newReview.user = req.currentUser //We assign the current user to the review

                newReview.save(function(err, review) { //we try to save the review
                    if (err) {
                        err.status = 400
                        return next(err)
                    }

                    course.reviews.push(review) //We add the review to the course
                    course.save(function(err) { //We 'update' the course with the review
                        if (err) { //if err
                            err.status = 400
                            return next(err)
                        }

                        res.status(201)
                        res.location('/courses/' + req.params.idCourse)
                        return res.end() //We end the response with a http 201 response
                    })
                })
            } else {
                var error = new Error('Course not Found')
                error.status = 404
                return next(error)
            }
        })
})

// /api/courses/:courseId/reviews/:id
// DELETE - Deletes a review
router.delete('/courses/:idCourse/reviews/:idReview', mid.isAuth, function(req, res, next) {
    Course.findById(req.params.idCourse) //We find the course
        .populate('reviews')
        .populate('user', '_id')
        .exec(function(err, course) {
            if (err) {
                err.status = 404
                return next(err)
            }

            if (course) {
                var exist = false,
                    indexForReview = 0

                course.reviews.forEach(function(review, index) { //We find the index for the review on the course and tjek if it even exist on this course
                    if (review._id == req.params.idReview) {
                        exist = true
                        indexForReview = index
                    }
                })

                if (!exist) { //The review is not asosiated with this course, aka it is not related
                    var error = new Error('The specified review is not asosiated with this course')
                    error.status = 404
                    return next(error) //We return an err
                }

                Review.findById(req.params.idReview) //We try to find the review
                    .populate('user', '_id')
                    .exec(function(err, review) {
                        if (err) { //if err
                            err.status = 404
                            return next(err)
                        }

                        //For some reason we have to compare the id's in string format, simply because it dose not work in any other way.
                        //Mabye it is because some of the date is in Json format, but this works for now.
                        if ('' + review.user._id == '' + req.currentUser._id || '' + course.user._id == '' + req.currentUser._id) { //We make sure the user is allowed to delete the review
                            course.reviews.splice(indexForReview, 1) //We remove the review from the course
                            course.save(function(err) { //We 'update' the course without the review
                                if (err) { //if err
                                    err.status = 400
                                    return next(err)
                                }

                                Review.findById(req.params.idReview).remove(function(err) { //We find and remove the review
                                    if (err) { //if err
                                        err.status = 400
                                        return next(err)
                                    }
                                    res.status(204)
                                    return res.end()
                                })
                            })
                        } else {
                            var error = new Error('This user is not allowed to delete this review')
                            error.status = 404
                            return next(error)
                        }
                    })
            } else {
                var foundErr = new Error('Course not Found')
                foundErr.status = 404
                return next(foundErr)
            }
        })
})

// /api/users
// GET - Returns the current user
// POST - Creates a user
router.get('/users', mid.isAuth, function(req, res) {
    res.status(200)
    return res.json({
        data: [req.currentUser] //we return the currentUser since we already have gotten the currentUser from our authentication middleware
    })
})

router.post('/users', function(req, res, next) {

    var user = new User(req.body) //We create a new user
    user.save(function(err) { //We try to save the user
        if (err) { //if err
            err.status = 400
            return next(err)
        }

        res.status(201)
        res.location('/')
        return res.end()
    })
})

module.exports = router
