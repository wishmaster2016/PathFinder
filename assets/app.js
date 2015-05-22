'use strict';

angular.module('aiPathFinder', ['ngRoute', 'ngAnimate', 'toaster', 'tjsModelViewer'])
	.config(function ($routeProvider) {
		$routeProvider
			.when('/', {
				templateUrl: 'assets/partials/main.html',
				controller: 'MainCtrl'
			})
			.otherwise({
				redirectTo: '/'
			});
	});
