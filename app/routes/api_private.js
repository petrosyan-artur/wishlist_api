var Wish       = require('../models/wish');
var User       = require('../models/user');
var Rate       = require('../models/rate');
var jwt        = require('jsonwebtoken');
var config     = require('../../config');
var bodyParser = require('body-parser');

// super secret for creating tokens
var superSecret = config.secret;

module.exports = function(app, express) {

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

    // on routes that end in /users
    // ----------------------------------------------------
    apiRouter.route('/users')

        // create a user (accessed at POST http://localhost:8080/users)
        //.post(function(req, res) {
        //    var user = new User();		// create a new instance of the User model
        //    user.name = req.body.name;  // set the users name (comes from the request)
        //    user.username = req.body.username;  // set the users username (comes from the request)
        //    user.password = req.body.password;  // set the users password (comes from the request)
        //
        //    user.save(function(err) {
        //        if (err) {
        //            // duplicate entry
        //            if (err.code == 11000)
        //                return res.json({ success: false, message: 'A user with that username already exists. '});
        //            else
        //                return res.send(err);
        //        }
        //
        //        // return a message
        //        res.json({ message: 'User created!' });
        //    });
        //
        //})

        // get all the users (accessed at GET http://localhost:8080/api/users)
        .get(function(req, res) {

            User.find({}, function(err, users) {
                if (err) res.send(err);

                // return the users
                res.json(users);
            });
        });

    // on routes that end in /users/:user_id
    // ----------------------------------------------------
    apiRouter.route('/users/:user_id')

        // get the user with that id
        .get(function(req, res) {
            User.findById(req.params.user_id, function(err, user) {
                if (err) res.send(err);

                // return that user
                res.json(user);
            });
        })

        // update the user with this id
        .put(function(req, res) {
            User.findById(req.params.user_id, function(err, user) {

                if (err) res.send(err);

                // set the new user information if it exists in the request
                if (req.body.name) user.name = req.body.name;
                if (req.body.username) user.username = req.body.username;
                if (req.body.password) user.password = req.body.password;

                // save the user
                user.save(function(err) {
                    if (err) res.send(err);

                    // return a message
                    res.json({ message: 'User updated!' });
                });

            });
        });

        // delete the user with this id
        //.delete(function(req, res) {
        //    User.remove({
        //        _id: req.params.user_id
        //    }, function(err, user) {
        //        if (err) res.send(err);
        //
        //        res.json({ message: 'Successfully deleted' });
        //    });
        //});

    //find user by username
    apiRouter.get('/user/:username', function(req, res) {
        User.find({username: req.params.username}, function(err, user) {
            if (err) res.send(err);
            // return that user
            res.json(user);
        });
    });

    apiRouter.route('/changePassword')
        // change user password
        .post(function(req, res) {
            if (!req.body.password || req.body.password == '') {
                return res.json({ success: false, message: 'Passwords is empty! '});
            }
            if (req.body.password != req.body.password2) {
                return res.json({ success: false, message: 'Passwords Mismatch! '});
            }
            User.findById(req.body.userId, function(err, user) {

                if (err) res.send(err);

                if (!user) {
                    res.json({ success:false, message: 'Invalid User!' });
                }
                if (req.body.password) user.password = req.body.password;

                user.save(function(err) {
                    if (err) res.send(err);

                    res.json({ success:true, message: 'Password is updated!' });
                });

            });

        });

    apiRouter.route('/user/deactivate')
        // deactivate user
        .post(function(req, res) {
            if (!req.body.userId) {
                return res.json({ success: false, message: 'Invalid userId!'});
            }
            User.findById(req.body.userId, function(err, user) {

                if (err) res.send(err);

                if (!user) {
                    res.json({ success:false, message: 'Invalid User!' });
                }

                user.isActive = false;

                user.save(function(err) {
                    if (err) res.send(err);

                    res.json({ success:true, message: 'User is deactivated successfully!' });
                });

            });

        });

    apiRouter.route('/user/activate')
        // deactivate user
        .post(function(req, res) {
            if (!req.body.userId) {
                return res.json({ success: false, message: 'Invalid userId!'});
            }
            User.findById(req.body.userId, function(err, user) {

                if (err) res.send(err);

                if (!user) {
                    res.json({ success:false, message: 'Invalid User!' });
                }

                user.isActive = true;

                user.save(function(err) {
                    if (err) res.send(err);

                    res.json({ success:true, message: 'User is activated successfully!' });
                });

            });

        });

    //rates actions
    apiRouter.route('/addRate')

        .post(function(req, res) {
            var rate = new Rate();
            //rate.rate = req.body.rate;
            rate.wishId = req.body.wishId;
            rate.userId = req.body.userId;

            rate.save(function(err, result) {
                if (err) {
                    res.send(err);
                }
                // return a message
                res.json({ success: true, message: 'Rated!', data: result });
            });
        });

    apiRouter.route('/checkRated')

        .post(function(req, res) {
            if (req.body.userId) {
                var userId = req.body.userId;
            }
            if (req.body.wishId) {
                var wishId = req.body.wishId;
            }
            Rate.findOne({userId: userId, wishId: wishId}).exec(function(err, rate) {
                if (err) res.send(err);
                if (!rate) {
                    res.json({success:true, isRated: false});
                } else {
                    res.json({success:true, isRated: true});
                }
            });
        });

    // api endpoint to get user information
    apiRouter.get('/me', function(req, res) {
        res.send(req.decoded);
    });

    apiRouter.route('/test')

        .post(function(req, res) {
                res.json({success: 'true!'});
        });

    //private administration routes
    apiRouter.route('/admin/wish')

        .put(function(req, res) {
            if (req.body.wishId && req.body.content) {
                var wishId = req.body.wishId;
                var content = req.body.content;
            } else {
                res.json({success:false, message: 'Invalid params.'});
            }

            Wish.findById(wishId, function(err, wish) {

                if (err) res.send(err);

                // set the wish information if it exists in the request
                if (req.body.content) wish.content = req.body.content;

                // save the wish
                wish.save(function(err) {
                    if (err) res.send(err);

                    // return a message
                    res.json({ success:true, message: 'Wish updated!' });
                });

            });
        });

    apiRouter.route('/admin/wish/:wishId')

        .delete(function(req, res) {
            Wish.remove({
                _id: req.params.wishId
            }, function(err, wish) {
                if (err) res.send(err);

                res.json({ success: true, message: 'Successfully deleted!', wish: wish });
            });
        });

    apiRouter.route('/admin/wishes/find/:userId')

        .get(function(req, res) {
            var ObjectId = require('mongoose').Types.ObjectId;
            var userId = new ObjectId(req.params.userId);
            Wish.find({ userId: userId}).sort({_id:-1}).exec(function (err, wishes) {
                if (!wishes) {
                    res.json({success: false});
                } else {
                    res.json(wishes);
                }
            });
        });

	return apiRouter;
};