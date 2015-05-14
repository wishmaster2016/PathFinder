'use strict';

angular.module('aiPathFinder')
	.controller('MainCtrl', function ($scope) {
		$scope.options = {
			selectedItem: "Start",
			selectedSize: 5,
			selectedAlgorithm: "",
			realSize: 250,
			axisSize: 125,
			isEven: false
		}

		$scope.changeItem = function(item) {
			if(item == $scope.options.selectedItem) {
				$scope.options.selectedItem = "";
			}
			else {
				$scope.options.selectedItem = item;
			}
		};

		$scope.changeAlgorithm = function(item) {
			$scope.options.selectedAlgorithm = item;
		}

		$scope.setSize = function(item) {
			$scope.options.selectedSize = item;
			$scope.options.realSize = item * 50;
			$scope.options.axisSize = $scope.options.realSize / 2;
			$scope.options.isEven = isEven($scope.options.axisSize);
		}

		var isEven = function(n) {
			return !(n & 1);
		}
	});
