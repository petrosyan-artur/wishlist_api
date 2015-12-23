angular.module('privateCtrl', ['privateService','userService', 'wishService'])

    .controller('privateController', function(Private, $routeParams, $rootScope, $location, Auth, User, Wish) {

        var vm = this;

        vm.loggedIn = Auth.isLoggedIn();
        if (!vm.loggedIn) {
            window.location = '/login';
            //$location.path('/login');
        }

        // check to see if a user is logged in on every request
        $rootScope.$on('$routeChangeStart', function () {
            vm.loggedIn = Auth.isLoggedIn();

            // get user information on page load
            Auth.getUser()
                .then(function (data) {
                    console.log(data);
                    vm.user = data.data;
                    if (vm.user.username != 'wishlistAdmin') {
                        window.location = '/';
                        //$location.path('/');
                    }
                    User.getByUsername(vm.user.username).success(function (data) {
                        vm.userData = data[0];
                        //console.log(data[0]);
                    })
                });
        });

        // function to handle logging out
        vm.doLogout = function () {
            Auth.logout();
            vm.user = '';
            window.location = '/login';
            //$location.path('/login');
        };

        Wish.all()
            .success(function (data) {
                vm.wishes = data;
            });

        vm.findWish = function() {
            Wish.find(vm.findData)
                .success(function(data) {
                    vm.wishes = data;
                    $('#loadMore').css('display', 'none');
                });
        };
        vm.userData = false;
        vm.findUser = function() {
            if (!vm.user.username || vm.user.username == '') {
                alert('Username is empty!');
                return false;
            }
            vm.user.requester = 'wishlistAdmin';
            User.getLikeUsername(vm.user)
                .success(function(data) {
                    if ((data.success && data.success == false) || data.length == 0 ) {
                        alert('User not found');
                        return false;
                    } else {
                        console.log(data);
                        vm.userData = data;
                        Wish.findByUserId(data[0]._id)
                            .success(function(wishes) {
                                vm.wishes = wishes;
                                $('#loadMore').css('display', 'none');
                            });
                    }
                });
        };

        vm.getAllUsers = function() {
            User.all('wishlistAdmin')
                .success(function(data){
                    console.log(data);
                    vm.userData = data;
                });
        };

        vm.hideAllUsers = function() {
            vm.userData = false;
        };

        vm.changePassword = function(userId) {
            var pw = $('#password_'+userId).val();
            var pw2 = $('#password2_'+userId).val();
            if (pw == '') {
                alert('Password is empty!');
                return false;
            }
            if (pw != pw2) {
                alert('Passwords mismatch!');
                return false;
            }
            var userData = {};
            userData.userId = userId;
            userData.password = pw;
            userData.password2 = pw2;

            Private.changePassword(userData, 'wishlistAdmin')
                .success(function(data){
                   if (data.success == true) {
                       $('#password_'+userId).val('');
                       $('#password2_'+userId).val('');
                       alert(data.message);
                       return false;
                   }
                });

            return false;
        };

        vm.deactivateUser = function(userId, key) {
            var userData = {};
            userData.userId = userId;

            Private.deactivateUser(userData, 'wishlistAdmin')
                .success(function(data){
                    if (data.success == true) {
                        alert(data.message);
                        vm.userData[key].isActive = false;
                        return false;
                    }
                });
        };

        vm.activateUser = function(userId, key) {
            var userData = {};
            userData.userId = userId;

            Private.activateUser(userData, 'wishlistAdmin')
                .success(function(data){
                    if (data.success == true) {
                        alert(data.message);
                        vm.userData[key].isActive = true;
                        return false;
                    }
                });
        };


        vm.wishesCount = 1000000;
        vm.loadMoreWish = function() {
            vm.loadMore = false;
            var limit = document.getElementById('loadLimit').value;
            limit = parseInt(limit) + 4;
            var lm = {};
            lm.limit = limit;
            console.log(lm);

            Wish.loadMore(lm)
                .success(function(data) {
                    for (var i=0; i < data.wishes.length; i++) {
                        vm.wishes.push({
                            _id: data.wishes[i]._id,
                            content: data.wishes[i].content,
                            createdDate: data.wishes[i].createdDate,
                            isActive: data.wishes[i].isActive,
                            username: data.wishes[i].username,
                            userId: data.wishes[i].userId
                        });
                    }
                    Wish.count()
                        .success(function(data) {
                            //console.log(data);
                            vm.wishesCount = data.count;
                        });
                    console.log(vm.wishesCount);

                    if (vm.wishesCount <= limit) {
                        vm.loadMore = true;
                    } else {
                        document.getElementById('loadLimit').value = limit;
                    }
                    vm.wishData = {};
                    //vm.message = data._id;
                });
        };

        vm.updateWish = function (wishId) {
            var content = $('#'+wishId+'_content').val();
            if (content == '') {
                alert('Wish cannot be empty!');
                return false;
            }
            var data = {};
            data.wishId = wishId;
            data.content = content;
            Private.updateWish(data)
                .success(function(res){
                    if(res.success == true) {
                        alert('The wish is successfully updated!');
                        return false;
                    } else {
                        alert('Something went wrong!');
                        return false;
                    }
                })
        };
        vm.deleteWish = function (wishId) {
            console.log(wishId);
            Private.deleteWish(wishId)
                .success(function(res){
                    console.log(res);
                    if(res.success == true) {
                        Wish.all()
                            .success(function (data) {
                                vm.wishes = data;
                            });
                        alert('The wish is successfully deleted!');
                    } else {
                        alert('Something went wrong!');
                        return false;
                    }
                })
        };
    });