'use strict';

angular.module('aiPathFinder')
	.controller('MainCtrl', function ($scope) {
		$scope.options = {
			selectedItem: "Start",
			selectedSize: 5,
			selectedAlgorithm: ""
		}

		$scope.changeItem = function(item) {
			$scope.options.selectedItem = item;
		};

		$scope.changeAlgorithm = function(item) {
			$scope.options.selectedAlgorithm = item;
		}

		$scope.setSize = function(item) {
			$scope.options.selectedSize = item;
		} 
	});
