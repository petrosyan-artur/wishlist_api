/**
 * Created by Knyazyan on 12/24/2015.
 */
var Wish = require('../models/wish');
var User = require('../models/user');

var exports = module.exports = {};

exports.randomName = function() {
    var text = "";
    var charset = "abcdefghijklmnopqrstuvwxyz";
    for( var i=0; i < 4; i++ )
        text += charset.charAt(Math.floor(Math.random() * charset.length));
    var a = Math.floor(100000 + Math.random() * 900000);
    text += a.toString().substring(0, 4);

    return text;
};

exports.newUsername = function(callback) {
    var username = this.randomName();
    User.findOne({ username: username }).exec(function(err, user) {
        if (err) callback(err, null);
        if (user) {
            username = self.newUsername();
        } else {
            callback(null, username);
        }
    });
};

exports.sortBy = (function () {

    //cached privated objects
    var _toString = Object.prototype.toString,
    //the default parser function
        _parser = function (x) { return x; },
    //gets the item to be sorted
        _getItem = function (x) {
            return this.parser((_toString.call(x) === "[object Object]" && x[this.prop]) || x);
        };

    // Creates a method for sorting the Array
    // @array: the Array of elements
    // @o.prop: property name (if it is an Array of objects)
    // @o.desc: determines whether the sort is descending
    // @o.parser: function to parse the items to expected type
    return function (array, o) {
        if (!(array instanceof Array) || !array.length)
            return [];
        if (_toString.call(o) !== "[object Object]")
            o = {};
        if (typeof o.parser !== "function")
            o.parser = _parser;
        //if @o.desc is false: set 1, else -1
        o.desc = [1, -1][+!!o.desc];
        return array.sort(function (a, b) {
            a = _getItem.call(o, a);
            b = _getItem.call(o, b);
            return ((a > b) - (b > a)) * o.desc;
        });
    };

}());

exports.parseUserAgent = function(userAgent) {
    var values = userAgent.split(';');
    var result = {};
    result.device_type = values[0]; //iPhone, Android, iPad..
    result.device_os_version = values[1]; //
    result.device_name = values[2]; //Samsung Galaxy, LG...
    result.app_version = values[3].replace(/\D/g,''); //1.0.2

    return result;
};