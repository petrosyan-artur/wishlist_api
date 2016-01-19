/**
 * Created by Knyazyan on 12/24/2015.
 */
var Rate = require('../models/rate');
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

exports.rates = function(wishes) {

    wishes = JSON.parse(JSON.stringify(wishes));
    return wishes;
    var data = [];

    var pushDoc = function(item, callback) {
        if(item) {
            Rate.count({ wishId: item._id}, function(err, rate) {

                if(rate != null) {
                    item.rate = rate;
                    data.push(item);
                    callback();
                } else callback();
            });
        }
    };
    async.forEach(wishes, pushDoc, function(err) {
        if (err) return err;
        var response = {
            success: true,
            wishes: data
        };
        return response;
    });

};
