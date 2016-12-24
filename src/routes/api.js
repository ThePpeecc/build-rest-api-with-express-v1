//We get our required module
var express = require('express')

var User = require('../models/user').User,
    Review = require('../models/review').Review,
    Course = require('../models/course').Course,
    mid = require('../middleware/mid')
var router = express.Router()


// /api/courses
// GET - Returns a list of courses
// POST - Creates a course

router.get('/courses', function(req, res, next) {
    Course.find({})
        .populate('reviews')
        .populate('user')
        .exec(function(err, courses) {
            if (err) {
                next(err)
            }
            res.status = 200
            return res.json({
                data: courses
            })
        })
})

router.post('/courses', mid.isAuth, function(req, res, next) {
    res.status = 201
        //The logged in user must be the same user is referred to in the created the post
    if (req.body.user._id == req.currentUser._id) {
        var course = new Course(req.body)
        course.save(function(err, course) {
            if (err) {
                return next(err)
            }
            res.json(course)
        })
    }
})

// /api/courses/:id
// GET - Returns a single course
// PUT - Updates a course

router.get('/courses/:idCourse', function(req, res, next) {
    Course.findById(req.params.idCourse)
        .populate('reviews')
        .populate('user')
        .exec(function(err, course) {
            if (err) {
                next(err)
            }
            res.status = 200
            return res.json({
                data: [course]
            })
        })
})

router.put('/courses/:idCourse', mid.isAuth, function(req, res, next) {

    //The logged in user must be the same as the user that created the post
    if (req.body.user._id == req.currentUser._id) {
        Course.findOneAndUpdate(req.params.idCourse, req.body)
            .exec(function(err, course) {
                if (err) {
                    next(err)
                }
                res.status = 204
                return res.json(course)
            })
    } else {
        var err = new Error('You do not have authentication to update this course')
        err.status = 401
        next(err)
    }
})

// /api/courses/:courseId/reviews
// POST - Creates a review for the specified course
router.post('/courses/:idCourse/reviews', mid.isAuth, function(req, res, next) {
    res.status = 201

    Course.findById(req.params.idCourse)
        .populate('reviews')
        .populate('user')
        .exec(function(err, course) {
            if (err) {
                next(err)
            }

            var newReview = new Review(req.body)

            newReview.save(function(err, review) {
                if (err) {
                    next(err)
                }
                course.reviews.push(review)
                course.save(function(err, course) {
                    if (err) {
                        next(err)
                    }
                    res.json(course);
                })
            })
        })

    return res.json({
        "demo": req.params.idCourse
    })
})

// /api/courses/:courseId/reviews/:id
// DELETE - Deletes a review
router.delete('/courses/:idCourse/reviews/:idReview', mid.isAuth, function(req, res, next) {
    res.status = 204
    return res.json({
        "idC": req.params.idCourse,
        "idR": req.params.idReview
    })
})

// /api/users
// GET - Returns the current user
// POST - Creates a user
router.get('/users', mid.isAuth, function(req, res, next) {
    res.status = 200
    return res.json({
        data: [req.currentUser]
    })
})

router.post('/users', function(req, res, next) {
    res.status = 201
    var user = new User(req.body)
    user.save(function(err, user) {
        if (err) {
            err.status = 400
            return next(err)
        }
        return res.json(user)
    })
})

module.exports = router
