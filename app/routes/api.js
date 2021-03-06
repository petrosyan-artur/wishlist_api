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

    // route to authenticate a user (POST http://localhost:8080/api/authenticate)
    apiRouter.post('/authenticate', function(req, res) {

        // find the user
        User.findOne({
            username: req.body.username
        }).select('username password').exec(function(err, user) {

            if (err) throw err;

            // no user with that username was found
            if (!user) {
                res.json({
                    success: false,
                    message: 'Authentication failed. User not found.'
                });
            } else if (user) {

                // check if password matches
                var validPassword = user.comparePassword(req.body.password);
                if (!validPassword) {
                    res.json({
                        success: false,
                        message: 'Authentication failed. Wrong password.'
                    });
                } else {

                    // if user is found and password is right
                    // create a token
                    var token = jwt.sign({
                        name: user.name,
                        username: user.username
                    }, superSecret, {
                        expiresInMinutes: 1440 // expires in 24 hours
                    });
                    console.log(token);
                    // return the information including token as JSON
                    res.json({
                        success: true,
                        message: 'Enjoy your token!',
                        token: token
                    });
                }

            }

        });
    });

    apiRouter.route('/register')

        // create a user (accessed at POST http://localhost:8080/register)
        .post(function(req, res) {
            if (req.body.password != req.body.password2) {
                return res.json({ success: false, message: 'Passwords Mismatch! '});
            }
            var user = new User();		// create a new instance of the User model
            user.username = req.body.username;  // set the users username (comes from the request)
            user.password = req.body.password;  // set the users password (comes from the request)

            user.save(function(err) {
                if (err) {
                    // duplicate entry
                    if (err.code == 11000)
                        return res.json({ success: false, message: 'A user with that username already exists. '});
                    else
                        return res.send(err);
                }
                //create a token
                var token = jwt.sign({
                    name: user.name,
                    username: user.username
                }, superSecret, {
                    expiresInMinutes: 1440 // expires in 24 hours
                });
                // return a message
                res.json({
                    success: true,
                    message: 'User created! Enjoy your token!',
                    token: token
                });
            });

        });

    // accessed at GET http://localhost:8080/api
	apiRouter.get('/', function(req, res) {
		res.json({ message: 'hooray! welcome to our api!' });
	});



	// on routes that end in /wishes
	// ----------------------------------------------------
	apiRouter.route('/wishes')

		// create a wish (accessed at POST http://localhost:8080/wishes)
		.post(function(req, res) {
            //res.json({success: true});
            var d = new Date();
            var date = d.getFullYear()+'-'+('0' + (d.getMonth() + 1)).slice(-2)+'-'+('0' + d.getDate()).slice(-2);
            //req.body.date = date;
            //res.json({ success: true, message: req.body.content, d: date});
            var wish = new Wish();		// create a new instance of the Wish model
            wish.content = req.body.content;  // set the wish content (comes from the request)
            wish.createdDate = date;  // set the wish created date (comes from the request)
            wish.userId = req.body.userId;  // set the wish content (comes from the request)

            wish.save(function(err, result) {
				if (err) {
					// duplicate entry
					if (err.code == 11000)
						return res.json({ success: false, message: 'A wish with that content already exists. '});
					else
						return res.send(err);
				}
				// return a message
				res.json({ success: true, message: 'Wish created!', data: result });
			});

		})

		// get all the wishes (accessed at GET http://localhost:8080/api/wishes)
		.get(function(req, res) {
            var limit = 12;
            if (req.body.limit) {
                limit = req.body.limit;
            }
			Wish.find({isActive: true}).sort({_id:-1}).limit(limit).exec(function(err, wishes) {
				if (err) res.send(err);

				// return the users
				res.json(wishes);
			});
		});



    apiRouter.route('/wishes/ppp').get(function(req, res) {
        res.json({'a':'b'});
    });



	// on routes that end in /users/:user_id
	// ----------------------------------------------------
	apiRouter.route('/wishes/:wish_id')

		// get the wish with that id
		.get(function(req, res) {
			Wish.findById(req.params.wish_id, function(err, wish) {
				if (err) res.send(err);

				// return that wish
				res.json(wish);
			});
		});

    apiRouter.route('/wishes/find/')

        // get the wish with content like content
        .post(function(req, res) {
            var content = req.body.content;
            Wish.find({ content: new RegExp(content, 'i')}).sort({_id:-1}).exec(function (err, docs) {
                if (!docs) {
                    res.json({success: false});
                } else {
                    res.json(docs);
                }
            });
        });

    apiRouter.route('/wishes/loadMore')

        .post(function(req, res) {
            //var limit = 16;
            if (req.body.limit) {
               var limit = req.body.limit;
            }
            Wish.find().sort({_id:-1}).skip(limit-4).limit(4).exec(function(err, wishes) {
                if (err) res.send(err);
                res.json({wishes: wishes, limit: limit});
            });
        });

    apiRouter.route('/wishes/allCount')

        .post(function(req, res) {
            Wish.count({isActive: true}, function(err, count) {
                if (err) res.send(err);
                if (!count) {
                    res.json({success: false, count: 0});
                } else {
                    res.json({success: true, count: count});
                }
            });
        });

    //getRate for wish with wish_id
    apiRouter.route('/getRate/:wish_id')

        .get(function(req, res) {
            Rate.count({wishId: req.params.wish_id}, function(err, rates) {
                if (err) res.send(err);
                if (!rates) {
                    res.json({success: false, rates: 0});
                } else {
                    res.json({success: true, rates: rates});
                }
            });
        });

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
    apiRouter.route('/private/users')

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
    apiRouter.route('/private/users/:user_id')

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
    apiRouter.get('/private/user/:username', function(req, res) {
        User.find({username: req.params.username}, function(err, user) {
            if (err) res.send(err);
            // return that user
            res.json(user);
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
    apiRouter.get('/private/me', function(req, res) {
        res.send(req.decoded);
    });

    apiRouter.route('/private/test')

        .post(function(req, res) {
                res.json({success: 'true!'});
        });

	return apiRouter;
};