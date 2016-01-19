var Wish       = require('../models/wish');
var User       = require('../models/user');
var Rate       = require('../models/rate');
var Configuration     = require('../models/configuration');
var jwt        = require('jsonwebtoken');
var config     = require('../../config');
var bodyParser = require('body-parser');
var rm         = require('../services/rateManager');
var gm         = require('../services/globalManager');
var async      = require('async');

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

            if (err) { return res.status(500).send({ success: false, message: err}); }

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
                    if (err.code == 11000) {
                        return res.send({ success: false, message: "User with such username already exists"});
                    }
                    return res.status(500).send({ success: false, message: err});
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

	// get wishes

	apiRouter.route('/wishes')

		// get all the wishes (accessed at GET http://localhost:8080/api/wishes)
		.get(function(req, res) {
            var limit = 12;
            var skip = 0;
            var count = 12;
            //wish search case
            if (req.query.content) {
                if (req.query.limit != 12 ) {
                    limit = req.query.limit;
                    skip = limit - 4;
                    count = 4;
                }
                Wish.find({ content: new RegExp(req.query.content, 'i')}).sort({_id:-1}).skip(skip).limit(count).exec(function (err, wishes) {
                    if (err) { return res.status(500).send({ success: false, message: err}); }
                    res.json({success: true, wishes: wishes});
                });
                return;
            }
            //wish loadMore case
            if (req.query.limit) {
                Wish.find({isActive: true}).sort({_id:-1}).skip(req.query.limit-4).limit(4).exec(function(err, wishes) {
                    if (err) { return res.status(500).send({ success: false, message: err}); }
                    res.json({success: true, wishes: wishes});
                });
                return;
            }
            //returns all active wishes count
            if (req.query.count && req.query.count == 1) {
                Wish.count({isActive: true}, function(err, count) {
                    if (err) { return res.status(500).send({ success: false, message: err}); }
                    if (!count) {
                        res.json({success: false, count: 0});
                    } else {
                        res.json({success: true, count: count});
                    }
                });
                return;
            }
            //returns 'limit' number of wishes (on main page)

            Wish.find({isActive: true}).sort({_id:-1}).limit(limit).exec(function(err, wishes) {
                if (err) { return res.status(500).send({ success: false, message: err}); }
                res.json({success: true, wishes: wishes});
                //wishes = JSON.parse(JSON.stringify(wishes));
                //var data = [];
                //
                //var pushDoc = function(item, callback) {
                //    if(item) {
                //        Rate.count({ wishId: item._id}, function(err, rate) {
                //
                //            if(rate != null) {
                //                item.rate = rate;
                //                data.push(item);
                //                callback();
                //            } else callback();
                //        });
                //    }
                //};
                //async.forEach(wishes, pushDoc, function(err) {
                //   if (err) return err;
                //    var response = {
                //        success: true,
                //        wishes: gm.sortBy(data, {prop: "_id", desc: true})
                //    };
                //    //response = rm.sortBy(response, {prop: "_id", desc: true});
                //    res.send(response);
                //});
			});
		});

	// get wish by wish_id
	apiRouter.route('/wishes/:wish_id')

		.get(function(req, res) {
			Wish.findById(req.params.wish_id, function(err, wish) {
                if (err) { return res.status(500).send({ success: false, message: err}); }

				res.json({success: true, wishes: wish});
			});
		});

    //get rates for wish with wish_id
    apiRouter.route('/rates/:wish_id')

        .get(function(req, res) {
            Rate.count({wishId: req.params.wish_id}, function(err, rates) {
                if (err) { return res.status(500).send({ success: false, message: err}); }
                if (!rates) {
                    res.json({success: false, rates: 0});
                } else {
                    res.json({success: true, rates: rates});
                }
            });
        });

    //configuration routes
    apiRouter.route('/configuration')

        .get(function(req, res) {
            Configuration.findOne({}, function(err, configs) {
                if (err) { return res.status(500).send({ success: false, message: err}); }
                if (!configs) {
                    res.json({success: false, configs: 0});
                } else {
                    res.json({success: true, configs: configs.configs});
                }
            });
        });

    //username generation route
    apiRouter.route('/users')

        .get(function(req, res) {
            var username = gm.randomName();
            User.findOne({ username: username }).exec(function(err, user) {
               if (user) {
                   username = gm.randomName();
               }
            });
            res.json({success:true, username: username});
        });
    //get test route
    apiRouter.route('/test')

        .get(function(req, res) {
            res.json({ss:rm.sum(req)});
        });

	return apiRouter;
};