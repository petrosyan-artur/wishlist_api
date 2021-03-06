angular.module('userService', [])

.factory('User', function($http) {

	// create a new object
	var userFactory = {};

	// get a single user
	userFactory.get = function(id) {
		return $http.get('/api/private/users/' + id);
	};

	// get all users
	userFactory.all = function() {
		return $http.get('/api/private/users');
	};

	// create a user
	userFactory.create = function(userData) {
		return $http.post('/api/users/', userData);
	};

    // get a single user
    userFactory.getByUsername = function(username) {
        return $http.get('/api/private/users?username=' + username);
    };

    // get users like username
    userFactory.getLikeUsername = function(userData) {
       return $http.get('/api/private/users?like=1&username=' + userData.username);
    };

    // change user password
    userFactory.changePassword = function(data) {
        return $http.put('/api/private/users?action=changePassword', data);
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