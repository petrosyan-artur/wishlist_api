angular.module('rateService', [])

.factory('Rate', function($http) {

	// create a new object
	var rateFactory = {};

	// get the rates of wish_id
	rateFactory.getRate = function(wishId) {
		return $http.get('/api/getRate/' + wishId);
	};

	// add a rate
	rateFactory.addRate = function(rateData) {
		return $http.post('/api/private/addRate/', rateData);
	};

    // check if already rated
    rateFactory.checkRated = function (rateData) {
        return $http.post('/api/private/checkRated', rateData);
    };

	// return our entire wishFactory object
	return rateFactory;

});