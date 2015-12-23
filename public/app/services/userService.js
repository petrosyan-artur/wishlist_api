angular.module('userService', [])

.factory('User', function($http) {

	// create a new object
	var userFactory = {};

	// get a single user
	userFactory.get = function(id) {
		return $http.get('/api/private/users/' + id);
	};

	// get all users
	userFactory.all = function(requester) {
		return $http.get('/api/private/users?requester='+requester);
	};

	// create a user
	userFactory.create = function(userData) {
		return $http.post('/api/users/', userData);
	};

    // get a single user
    userFactory.getByUsername = function(username) {
        return $http.get('/api/private/users?username=' + username+'&requester='+username);
    };

    // get users like username
    userFactory.getLikeUsername = function(userData) {
       return $http.get('/api/private/users?like=1&username=' + userData.username+'&requester='+userData.requester);
    };

    // change user password
    userFactory.changePassword = function(data, requester) {
        return $http.put('/api/private/users?action=changePassword&requester='+requester, data);
    };

	// update a user
	//userFactory.update = function(id, userData) {
	//	return $http.put('/api/users/' + id, userData);
	//};

	// delete a user
	//userFactory.delete = function(id) {
	//	return $http.delete('/api/users/' + id);
	//};

	// return our entire userFactory object
	return userFactory;

});