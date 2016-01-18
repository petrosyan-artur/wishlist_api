/**
 * Created by Knyazyan on 12/24/2015.
 */
var Rate = require('../models/rate');

var exports = module.exports = {};

exports.sum = function(req) {
    return parseInt(req.query.x) + parseInt(req.query.y);
};

function getRates(wishId, callback) {
    Rate.count({wishId: wishId}, function(err, rates) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, rates);
        }
    });
}


exports.rates = function(wishes) {

    wishes = JSON.parse(JSON.stringify(wishes));
    for(var i in wishes){
        wishes[i].rate = getRates('569918a6eb5082e65752c9d6');
    }
    return wishes;
};