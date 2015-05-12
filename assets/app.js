'use strict';

angular.module('aiPathFinder', ['ngRoute', 'tjsModelViewer'])
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
