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
        }).select('username password isActive').exec(function(err, user) {

            if (err) throw err;

            // no user with that username was found
            if (!user) {
                res.json({
                    success: false,
                    message: 'Authentication failed. User not found.'
                });
            } else if (user) {

                if (!user.isActive) {
                    res.json({
                        success: false,
                        message: 'User is disabled.'
                    });
                    return;
                }

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

		// get all the wishes (accessed at GET http://localhost:8080/api/wishes)
		.get(function(req, res) {
            var limit = 12;
            if (req.body.limit) {
                limit = req.body.limit;
            }
			Wish.find({isActive: true}).sort({_id:-1}).limit(limit).exec(function(err, wishes) {
				if (err) res.send(err);

				// return the wishes
                //for (var i = 1; wishes.length; ++i) {
                 //   User.findById(wishes[i].userId, function(err, user) {
                 //       res.json(user);
                 //      wishes[i].username = user._id;
                 //   });
                //}
				res.json(wishes);
			});
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

	return apiRouter;
};