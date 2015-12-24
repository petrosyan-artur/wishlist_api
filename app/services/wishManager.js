/**
 * Created by Knyazyan on 12/24/2015.
 */
var exports = module.exports = {};

exports.multiply = function(req) {
    return parseInt(req.query.x) * parseInt(req.query.y);
};