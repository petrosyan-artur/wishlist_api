/**
 * Created by Knyazyan on 12/24/2015.
 */
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