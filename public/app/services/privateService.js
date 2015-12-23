angular.module('privateService', [])

.factory('Private', function($http) {

	// create a new object
	var privateFactory = {};

        // get all wishes
        privateFactory.all = function() {
            return $http.get('/api/wishes/');
        };

        // edit wish
        privateFactory.updateWish = function(data) {
            return $http.put('/api/private/wishes/', data);
        };

        // delete wish
        privateFactory.deleteWish = function(id) {
            return $http.delete('/api/private/wishes/' + id);
        };

        // change user password
        privateFactory.changePassword = function(data, requester) {
            return $http.put('/api/private/users?action=changePassword&requester='+requester, data);
        };

        // deactivate user
        privateFactory.deactivateUser = function(data, requester) {
            return $http.put('/api/private/users?action=deactivate&requester='+requester, data);
        };

        // activate user
        privateFactory.activateUser = function(data, requester) {
            return $http.put('/api/private/users?action=activate&requester='+requester, data);
        };

	return privateFactory;

});