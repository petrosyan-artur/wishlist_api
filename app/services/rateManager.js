/**
 * Created by Knyazyan on 12/24/2015.
 */
var Rate = require('../models/rate');
var gm = require('../services/globalManager');
var async = require('async');

var exports = module.exports = {};

exports.sum = function(req) {
    return parseInt(req.query.x) + parseInt(req.query.y);
};

var myData = [];

exports.assignCallback = function(data) {
    myData.push(data);
    return true;
};

function getRates(wishId) {
    Rate.count({wishId: wishId}, function(err, rates) {
        if (err) {
            return false;
        } else {
            return rates;
        }
    });
}

exports.checkLiked = function(wishes, userId, prop, callback) {

    wishes = JSON.parse(JSON.stringify(wishes));
    var data = [];

    var pushDoc = function(item, callback) {
        if(item) {
            Rate.findOne({ wishId: item._id, userId: userId}).exec(function(err, rate) {

                if(!rate) {
                    item.liked = false;
                    data.push(item);
                    callback();
                } else {
                    item.liked = true;
                    data.push(item);
                    callback();
                }
            });
        }
    };
    async.forEach(wishes, pushDoc, function(err) {
        if (err) return callback(err, null);
        var response = {
            success: true,
            wishes: gm.sortBy(data, {prop: prop, desc: true})
        };
        return callback(null, response);
    });

};
