/**
 * Created by Knyazyan on 11/6/2015.
 */
var date = new Date();
var d = date.getFullYear()+'-'+('0' + (date.getMonth() + 1)).slice(-2)+'-'+('0' + date.getDate()).slice(-2);
console.log(d);

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
