/**
 * Created by Knyazyan on 11/6/2015.
 */
var date = new Date();
var d = date.getFullYear()+'-'+('0' + (date.getMonth() + 1)).slice(-2)+'-'+('0' + date.getDate()).slice(-2);
console.log(d);

var likeButtonOnMouseOver = function() {
    $('#button_liked').removeClass('glyphicon-thumbs-up');
    $('#button_liked').addClass('glyphicon-remove');
    $('#button_liked').removeClass('btn-success');
    $('#button_liked').addClass('btn-danger');
    $('#button_liked_span').css('display','none');
    $('#button_unlike_span').css('display','block');

    };
var likeButtonOnMouseOut = function() {
    $('#button_liked').removeClass('glyphicon-remove');
    $('#button_liked').addClass('glyphicon-thumbs-up');
    $('#button_liked').removeClass('btn-danger');
    $('#button_liked').addClass('btn-success');
    $('#button_liked_span').css('display','block');
    $('#button_unlike_span').css('display','none');
};
//changeLoadLimit = function() {
//    var limit = $('#loadLimit').val();
//    limit = parseInt(limit) + 4;
//    $('#loadLimit').val(limit);
//    console.log(limit);
//};

//var openWishModal = function(content) {
//    $('#wishModalBody').text(content);
//    $('#wishModal').modal({show:true});
//};
