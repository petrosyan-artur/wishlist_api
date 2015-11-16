angular.module('wishService', [])

.factory('Wish', function($http) {

	// create a new object
	var wishFactory = {};

	// get a single user
	wishFactory.get = function(id) {
		return $http.get('/api/wishes/' + id);
	};

	// get all wishess
	wishFactory.all = function() {
		return $http.get('/api/wishes/');
	};

	// create a wish
	wishFactory.create = function(wishData) {
        //return true;
		return $http.post('/api/wishes/', wishData);
	};

    wishFactory.find = function (findData) {
        return $http.post('/api/wishes/find/', findData);
    };

    wishFactory.loadMore = function (loadMoreData) {
        return $http.post('/api/wishes/loadMore/', loadMoreData);
    };

	//// update a wish
	//wishFactory.update = function(id, wishData) {
	//	return $http.put('/api/wishes/' + id, wishData);
	//};
    //
	//// delete a user
	//userFactory.delete = function(id) {
	//	return $http.delete('/api/users/' + id);
	//};

	// return our entire wishFactory object
	return wishFactory;

});