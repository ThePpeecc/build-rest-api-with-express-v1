//We get our required module
var express = require('express')

var User = require('../models/user').User,
    Review = require('../models/review').Review,
    Course = require('../models/course').Course

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

router.post('/courses', function(req, res, next) {
    res.status = 201
    return res.json({
        "stuff": 'stuff'
    })
})

// /api/courses/:id
// GET - Returns a single course
// PUT - Updates a course

router.get('/courses/:idCourse', function(req, res, next) {
    Course.findById(req.params.idCourse)
        .populate('reviews')
        .populate('user')
        .exec(function(err, course) {
            console.log(course);
            if (err) {
                next(err)
            }
            res.status = 200
            return res.json({
                data: [course]
            })
        })
})

router.put('/courses/:idCourse', function(req, res, next) {
    res.status = 204
    return res.json({
        "demo": req.params.idCourse
    })
})

// /api/courses/:courseId/reviews
// POST - Creates a review for the specified course
router.post('/courses/:idCourse/reviews', function(req, res, next) {
    res.status = 201
    return res.json({
        "demo": req.params.idCourse
    })
})

// /api/courses/:courseId/reviews/:id
// DELETE - Deletes a review
router.delete('/courses/:idCourse/reviews/:idReview', function(req, res, next) {
    res.status = 204
    return res.json({
        "idC": req.params.idCourse,
        "idR": req.params.idReview
    })
})

// /api/users
// GET - Returns the current user
// POST - Creates a user
router.get('/users', function(req, res, next) {
    res.status = 200
    return res.json({
        "demo": 'Hello :D'
    })
})

router.post('/users', function(req, res, next) {
    res.status = 201
    return res.json({
        "demo": 'Hello 2'
    })
})

module.exports = router
