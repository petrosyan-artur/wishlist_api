var Wish       = require('../models/wish');
var User       = require('../models/user');
var Rate       = require('../models/rate');
var jwt        = require('jsonwebtoken');
var config     = require('../../config');
var bodyParser = require('body-parser');

// super secret for creating tokens
var superSecret = config.secret;

var apiPrivate = function(app, express) {

	var apiRouter = express.Router();

    // route middleware to verify a token
    apiRouter.use(function(req, res, next) {
        // do logging
        console.log('Somebody just came to our app!');

        // check header or url parameters or post parameters for token
        var token = req.body.token || req.param('token') || req.headers['x-access-token'];

        // decode token
        if (token) {

            // verifies secret and checks exp
            jwt.verify(token, superSecret, function(err, decoded) {

                if (err) {
                    res.status(403).send({
                        success: false,
                        message: 'Failed to authenticate token.'
                    });
                } else {
                    // if everything is good, save to request for use in other routes
                    decoded.role = 1;
                    req.decoded = decoded;

                    next(); // make sure we go to the next routes and don't stop here
                }
            });

        } else {

            // if there is no token
            // return an HTTP response of 403 (access forbidden) and an error message
            res.status(403).send({
                success: false,
                message: 'No token provided.'
            });

        }
    });

    apiRouter.route('/wishes')

        // create a wish (accessed at POST http://localhost:8080/wishes)
        .post(function(req, res) {
            var d = new Date();
            var date = d.getFullYear()+'-'+('0' + (d.getMonth() + 1)).slice(-2)+'-'+('0' + d.getDate()).slice(-2);

            var wish = new Wish();		// create a new instance of the Wish model
            wish.content = req.body.content;  // set the wish content (comes from the request)
            wish.createdDate = date;  // set the wish created date (comes from the request)
            wish.userId = req.body.userId;  // set the wish owner id (comes from the request)
            wish.username = req.body.username;  // set the wish owner name (comes from the request)

            wish.save(function(err, result) {
                if (err) { return res.status(500).send({ success: false, message: err}); }
                // return a message
                res.json({ success: true, message: 'Wish created!', data: result });
            });

        })

        //update a wish
        .put(function(req, res) {

            if (req.body.wishId && req.body.content) {

                Wish.findById(req.body.wishId, function (err, wish) {

                    if (err) { return res.status(500).send({ success: false, message: err}); }

                    if (req.decoded.username && (req.decoded.username == 'wishlistAdmin' || req.decoded.username == wish.username)) {
                        // set the wish information if it exists in the request
                        if (req.body.content) wish.content = req.body.content;

                        // save the wish
                        wish.save(function (err) {
                            if (err) { return res.status(500).send({ success: false, message: err}); }

                            // return a message
                            res.json({success: true, message: 'Wish updated!'});
                        });
                    } else {
                        res.json({success: false, message: 'Private request roles required!'});
                    }
                });

            } else {
                res.json({success: false, message: 'Invalid params.'});
            }
        });

    //delete wish by wishId
    apiRouter.route('/wishes/:wishId')

        .delete(function(req, res) {
            if (req.decoded.username && req.decoded.username == 'wishlistAdmin') {
                Wish.remove({
                    _id: req.params.wishId
                }, function(err, wish) {
                    if (err) { return res.status(500).send({ success: false, message: err}); }

                    Rate.remove({wishId: req.params.wishId}, function(err, rate) {
                        if (err) { return res.status(500).send({ success: false, message: err}); }
                    });

                    res.json({ success: true, message: 'Successfully deleted!', wish: wish });
                });
            } else {
                res.json({success: false, message: 'Private request roles required!'});
            }
        });

    apiRouter.route('/wishes')
    //get users' wishes
        .get(function(req, res) {
            if (req.query.userId) {
                var ObjectId = require('mongoose').Types.ObjectId;
                var userId = new ObjectId(req.query.userId);
                Wish.find({ userId: userId}).sort({_id:-1}).exec(function (err, wishes) {
                    if (wishes.length == 0) {
                        res.json({success: false, wishes: 0});
                    } else {
                        res.json({success: true, wishes: wishes});
                    }
                });
            }
        });

    // on routes that end in /users
    // ----------------------------------------------------
    apiRouter.route('/users')

        // get all the users or get userData by username(accessed at GET http://localhost:8080/api/users)
        .get(function (req, res) {
            if (req.query.username && req.decoded.username && (req.query.username == req.decoded.username)) {
            //find user by username
                User.find({username: req.query.username}, function (err, user) {
                    if (err) { return res.status(500).send({ success: false, message: err}); }
                    // return that user
                    res.json({success: true, user: user});
                });
                return;
            }

            if (req.decoded.username && req.decoded.username == 'wishlistAdmin') {
            //find user like username
                if (req.query.like && req.query.like == 1 && req.query.username) {
                    User.find({username: new RegExp(req.query.username, 'i')}).sort({_id: -1}).exec(function (err, users) {
                        res.json({successs: true, users:users});
                    });
                    return;
                }
            //find all users
                User.find({}, function (err, users) {
                    if (err) { return res.status(500).send({ success: false, message: err}); }
                    // return the users
                    res.json({successs: true, users:users});
                });
            } else {
                res.json({success: false, message: 'Private request roles required!'})
            }
        })

        .put(function(req, res) {

            if (req.decoded.username && (req.decoded.username == 'wishlistAdmin' || req.decoded.username == req.body.username)) {
                //change password
                if (req.query.action == 'changePassword') {

                    if (!req.body.password || req.body.password == '') {
                        return res.json({ success: false, message: 'Password is empty! '});
                    }
                    if (req.body.password != req.body.password2) {
                        return res.json({ success: false, message: 'Passwords Mismatch! '});
                    }
                    User.findById(req.body.userId, function(err, user) {

                        if (err) { return res.status(500).send({ success: false, message: err}); }

                        if (!user) {
                            res.json({ success:false, message: 'Invalid User!' });
                        }
                        if (req.body.password) user.password = req.body.password;

                        user.save(function(err) {
                            if (err) { return res.json({ success: false, message: err}); }

                            res.json({ success:true, message: 'Password is updated!' });
                        });

                    });
                }
                //activate deactivate user
                if (req.query.action == 'activate' || req.query.action == 'deactivate') {
                    if (!req.body.userId) {
                        return res.json({ success: false, message: 'Invalid userId!'});
                    }
                    User.findById(req.body.userId, function(err, user) {

                        if (err) { return res.status(500).send({ success: false, message: err}); }

                        if (!user) {
                            res.json({ success:false, message: 'Invalid User!' });
                        }

                        if (req.query.action == 'activate') {user.isActive = true; var msg = 'User is activated successfully!';}
                        if (req.query.action == 'deactivate') {user.isActive = false; msg = 'User is deactivated successfully!';}

                        user.save(function(err) {
                            if (err) { return res.status(500).send({ success: false, message: err}); }

                            res.json({ success:true, message: msg });
                        });

                    });
                }
            } else {
                res.json({ success:false, message: 'Private request roles required!' });
            }
        });

    // on routes that end in /users/:user_id
    // ----------------------------------------------------
    apiRouter.route('/users/:userId')

        // get the user with that id
        .get(function(req, res) {
            User.findById(req.params.userId, function(err, user) {
                if (err) { return res.status(500).send({ success: false, message: err}); }
                if (req.decoded.username && (req.decoded.username == user.username || req.decoded.username == 'wishlistAdmin')) {
                    // return that user
                    res.json({success: true, user: user});
                } else {
                    res.json({success:false, message:'Private request roles required!'})
                }
            });
        });

    //rates actions
    apiRouter.route('/rates')
        //add rate
        .post(function(req, res) {
            var rate = new Rate();
            rate.wishId = req.body.wishId;
            rate.userId = req.body.userId;

            rate.save(function(err, result) {
                if (err) { return res.status(500).send({ success: false, message: err}); }
                // return a message
                res.json({ success: true, message: 'Rated!', data: result });
            });
        })

        .get(function(req, res) {
            if (req.query.userId) {
                var userId = req.query.userId;
            }
            if (req.query.wishId) {
                var wishId = req.query.wishId;
            }
            Rate.findOne({userId: userId, wishId: wishId}).exec(function(err, rate) {
                if (err) { return res.status(500).send({ success: false, message: err}); }
                if (!rate) {
                    res.json({success:true, isRated: false});
                } else {
                    res.json({success:true, isRated: true});
                }
            });
        });

    //delete rates by userId and wishId
    apiRouter.route('/rates/:userId/:wishId')

        .delete(function(req, res) {
            Rate.remove({ wishId: req.params.wishId, userId: req.params.userId }, function(err, rate) {
                if (err) { return res.status(500).send({ success: false, message: err}); }
                res.json({ success: true, message: 'Successfully deleted!', rate: rate });
            });
        });


    // api endpoint to get user information
    apiRouter.get('/me', function(req, res) {
        res.send(req.decoded);
    });

    apiRouter.get('/test', function(req, res) {
        var user = req.decoded;
        res.send(user);
    });

	return apiRouter;
};

module.exports = apiPrivate;