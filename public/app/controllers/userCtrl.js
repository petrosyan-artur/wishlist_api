angular.module('userCtrl', ['wishService', 'userService', 'rateService'])

    .controller('userController', function (Wish, User, Rate, $routeParams, $rootScope, $location, Auth) {

        var vm = this;

        // user authentication part
        vm.loggedIn = Auth.isLoggedIn();
        if (!vm.loggedIn) {
            $location.path('/login');
        }

        Auth.getUser()
            .then(function (data) {
                //console.log(data);
                vm.user = data.data;
                User.getByUsername(vm.user.username).success(function (data) {
                    vm.userData = data.user[0];
                    //console.log(data[0]);
                    Wish.findByUserId(vm.userData._id)
                        .success(function(data){
                            if (data) {
                                vm.myWishes = data.wishes;
                            }
                        });
                })
            });


        vm.changePassword = function (userId, username) {
            var pw = $('#password_' + userId).val();
            var pw2 = $('#password2_' + userId).val();
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
            userData.username = username;
            userData.password = pw;
            userData.password2 = pw2;

            User.changePassword(userData, username)
                .success(function (data) {
                    if (data.success == true) {
                        $('#password_' + userId).val('');
                        $('#password2_' + userId).val('');
                        alert(data.message);
                        return false;
                    }
                });

            return false;
        };

        vm.updateWish = function (wishId) {
            var content = $('#'+wishId+'_content').val();
            var username = $('#user_name').val();
            if (content == '') {
                alert('Wish cannot be empty!');
                return false;
            }
            var data = {};
            data._id = wishId;
            data.content = content;
            Rate.getRate(wishId)
                .success(function(result) {
                    console.log(result.rates);
                    //return false;
                    if(result.rates == 0) {
                        Wish.updateWish(data, username)
                            .success(function(res){
                                if(res.success == true) {
                                    alert('The wish is successfully updated!');
                                    return false;
                                } else {
                                    alert('Something went wrong!');
                                    return false;
                                }
                            })
                    } else {
                        alert('The wish is rated and cannot be updated!');
                        return false;
                    }
                });
        };
        vm.deleteWish = function (wishId) {
            var username = $('#user_name').val();
            Wish.deleteWish(wishId, username)
                .success(function(res){
                    console.log(res);
                    if(res.success == true) {
                        Wish.findByUserId(vm.userData._id)
                            .success(function(data){
                                if (data) {
                                    vm.myWishes = data.wishes;
                                }
                            });
                        alert('The wish is successfully deleted!');
                    } else {
                        alert(res.message);
                        return false;
                    }
                })
        };
    });