angular.module('wishService', [])

.factory('Wish', function($http) {

	// create a new object
	var wishFactory = {};

	// get a single user
	wishFactory.get = function(id) {
		return $http.get('/api/wishes/' + id);
	};

	// get all wishes (limited)
	wishFactory.all = function() {
		return $http.get('/api/wishes/');
	};

    //find wishes by passing content
    wishFactory.find = function (content) {
        return $http.get('/api/wishes?content='+content);
    };

    //load more wishes by passing limit, offset is calculating in node controller automatically
    wishFactory.loadMore = function (limit) {
        return $http.get('/api/wishes?limit='+limit);
    };

    // get all wishes count
    wishFactory.count = function() {
        return $http.get('/api/wishes?count=1');
    };

	// create a wish
	wishFactory.create = function(wishData) {
		return $http.post('/api/private/wishes/', wishData);
	};

    //find wish by userId
    wishFactory.findByUserId = function (userId) {
        return $http.get('/api/private/wishes?userId='+ userId);
    };

    // update wish
    wishFactory.updateWish = function(data, requester) {
        return $http.put('/api/private/wishes?requester='+requester, data);
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