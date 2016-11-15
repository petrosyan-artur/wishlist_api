var Wish       = require('../models/wish');
var User       = require('../models/user');
var Rate       = require('../models/rate');
var Configuration     = require('../models/configuration');
var jwt        = require('jsonwebtoken');
var config     = require('../../config');
var bodyParser = require('body-parser');
var rm         = require('../services/rateManager');
var gm         = require('../services/globalManager');
var ObjectId   = require('mongoose').Types.ObjectId;

// super secret for creating tokens
var superSecret = config.secret;

module.exports = function(app, express) {

	var apiRouter = express.Router();

    // route middleware to get user-agent
    apiRouter.use(function(req, res, next) {
        // do logging
        var d = new Date();
        var date = d.getFullYear()+'-'+('0' + (d.getMonth() + 1)).slice(-2)+'-'+('0' + d.getDate()).slice(-2) +
            ' '+ ('0' + d.getHours()).slice(-2) + ":" + ('0' + d.getMinutes()).slice(-2) + ":" + ('0' + d.getSeconds()).slice(-2) ;
        var ip = req.headers['x-forwarded-for'];

        console.log('API:Public ' + date + ' - ' + ip);

        // check user-agent
        var userAgent = req.headers['my-user-agent'];
        if (userAgent) {
            req.userAgent = gm.parseUserAgent(userAgent);
        } else {
            req.userAgent = {};
        }
        console.log('Device: ' + req.userAgent.device_type + ' Version: ' + req.userAgent.app_version);
        next();
    });


        // route to authenticate a user (POST http://localhost:8080/api/authenticate)
    apiRouter.post('/authenticate', function(req, res) {

        // find the user
        User.findOne({
            username: req.body.username
        }).select('_id username password isActive').exec(function(err, user) {

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
                        userId: user._id,
                        username: user.username
                    }, superSecret, {
                        expiresInMinutes: 55000000 // expires in ~100 years
                    });
                    console.log(token);
                    // return the information including token as JSON
                    res.json({
                        success: true,
                        message: 'Enjoy your token!',
                        userId: user._id,
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
            if (JSON.stringify(req.userAgent) != '{}') {user.userAgent = req.userAgent;}

            user.save(function(err) {

                if (err) {
                    if (err.code == 11000) {
                        return res.send({ success: false, message: "User with such username already exists"});
                    }
                    return res.status(500).send({ success: false, message: err});
                }

                //create a token
                var token = jwt.sign({
                    userId: user._id,
                    username: user.username
                }, superSecret, {
                    expiresInMinutes: 55000000 // expires in ~100 years
                });
                console.log(token);
                // return the information including token as JSON
                res.json({
                    success: true,
                    message: 'Enjoy your token!',
                    userId: user._id,
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



            //checking new wishes
            if (req.query.wishId && req.query.count && req.query.count == 1) {
                var wishId = new ObjectId(req.query.wishId);
                Wish.count({_id: {$gt: wishId}}, function(err, count) {
                    if (err) { return res.status(500).send({ success: false, message: err}); }
                    if (!count || count == null) {
                        res.json({success: true, hasNew: false});
                    } else {
                        res.json({success: true, hasNew: true, count: count});
                    }
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

            var skip = 0;
            var count = 12;
            var next = 4;
            if (req.query.limit && req.query.limit != 0) {
                skip = req.query.limit;
                count = next;
            }
            //wish search case
            if (req.query.content) {
                Wish.find({isActive: true, $text : { $search : req.query.content }}, { score: { $meta: "textScore" }, content: 1}).sort({ score: { $meta: "textScore" }}).skip(skip).limit(count).exec(function (err, wishes) {
                    if (err) { return res.status(500).send({ success: false, message: err}); }

                    var finalFishes = [];


                    for( i in wishes ) {
                        var tmp = wishes[i];
                        tmp.color = tmp.decoration.color;
                        tmp.image = tmp.decoration.image;
                        finalFishes.push(tmp);
                    }

                    res.json({success: true, wishes: finalFishes});
                });
                return;
            }

            //returns user's own wishes
            if (req.query.userId) {
                var userId = new ObjectId(req.query.userId);
                Wish.find({ userId: userId}).sort({_id:-1}).skip(skip).limit(count).exec(function (err, wishes) {
                    if (err) { return res.status(500).send({ success: false, message: err}); }


                    var finalFishes = [];


                    for( i in wishes ) {
                        var tmp = wishes[i];
                        tmp.color = tmp.decoration.color;
                        tmp.image = tmp.decoration.image;
                        finalFishes.push(tmp);
                    }

                    res.json({success: true, a: 'q', wishes: finalFishes});

                });
                return;
            }

            //returns wishes newer than wishId
            if (req.query.wishId) {
                wishId = new ObjectId(req.query.wishId);
                Wish.find({_id: {$gt: wishId}}).sort({_id:-1}).skip(skip).limit(count).exec(function(err, wishes) {
                    if (err) { return res.status(500).send({ success: false, message: err}); }


                    var finalFishes = [];


                    for( i in wishes ) {
                        var tmp = wishes[i];
                        tmp.color = tmp.decoration.color;
                        tmp.image = tmp.decoration.image;
                        finalFishes.push(tmp);
                    }

                    res.json({success: true, a: 'z', wishes: finalFishes});
                });
                return;
            }

            //returns 'count' number of wishes and skips 'skip'
            Wish.find({isActive: true}).sort({_id:-1}).skip(skip).limit(count).exec(function(err, wishes) {
                if (err) { return res.status(500).send({ success: false, message: err}); }

                var finalFishes = [];


                for( i in wishes ) {
                    var tmp = wishes[i];
                    //var tmp = {};
                    tmp.zzzz = 1;
                    tmp.color = wishes[i].decoration.color;
                    tmp.image = wishes[i].decoration.image;
                    res.json({success: true, a: 'l', wishes: tmp, z:wishes[i]});
                    return;
                    finalFishes.push(tmp);
                }

                res.json({success: true, a: 'l', wishes: finalFishes});
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
            var text = "Please make sure to remember your password and login, as it is not possible to recover it.";
            gm.newUsername(function(err, username){
                if (err) res.send(err);
                res.json({success:true, username: username, hint: text});
            });
        });
    //get test route
    apiRouter.route('/test')

        .get(function(req, res) {
            res.send(req.userAgent);
        });

	return apiRouter;
};