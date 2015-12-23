angular.module('rateService', [])

.factory('Rate', function($http) {

	// create a new object
	var rateFactory = {};

	// get the rates of wish with wish_id
	rateFactory.getRate = function(wishId) {
		return $http.get('/api/rates/' + wishId);
	};

	// add a rate
	rateFactory.addRate = function(rateData) {
		return $http.post('/api/private/rates/', rateData);
	};

    // remove a rate
    rateFactory.removeRate = function(rateData) {
        return $http.delete('/api/private/rates/'+rateData.userId+'/'+rateData.wishId);
    };

    // check if already rated
    rateFactory.checkRated = function (rateData) {
        return $http.get('/api/private/rates?userId='+rateData.userId+'&wishId='+rateData.wishId);
    };

	// return our entire wishFactory object
	return rateFactory;

});