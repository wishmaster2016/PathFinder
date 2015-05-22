'use strict';

angular.module('aiPathFinder')
	.controller('MainCtrl', [ '$scope', 'toaster', function ($scope, toaster) {
		$scope.options = {
			selectedItem: "Start",
			selectedSize: 5,
			selectedAlgorithm: "",
			realSize: 250,
			axisSize: 125,
			isEven: false
		}
    $scope.playfield = [];
    $scope.robotWay = [];

    $scope.comparsionData = {
      left: undefined,
      right: undefined
    }

    $scope.startFinishPos = {
      start: {
        x: undefined,
        y: undefined
      },
      finish: {
        x: undefined,
        y: undefined
      }
    }

    $scope.anotherAlgoPos = {
      x: undefined,
      y: undefined
    }
    $scope.isAnotherAlgo = false;
    $scope.isClearBoard = false;
    $scope.wayLength = 0;
    $scope.isAlgorithm = false;
    $scope.isComparsion = false;

		var initializePlayfield = function() {
      $scope.playfield = [];
			var buf = [];
			for(var i = 0; i < $scope.options.selectedSize + 2; i++) {
				buf = [];
				for(var j = 0; j < $scope.options.selectedSize + 2; j++) {
					if(i == 0) {
						buf.push(1);
						continue;
					}
					if(i == $scope.options.selectedSize + 1) {
						buf.push(1);
						continue;
					}
					if(j == 0 || j == $scope.options.selectedSize + 1) {
						buf.push(1);
					}
					else {
						buf.push(0);
					}
				}
				$scope.playfield.push(buf);
			}
			console.log($scope.playfield);
		};
		initializePlayfield();

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
      if(item == "Left hand") {
        if(!isStartExist || !isFinishExists) {
          toaster.pop('error', 'Error', 'Set start and finish positions');
          return;
        }
        $scope.startLeftHand();
      }
      else if(item == "Right hand") {
        if(!isStartExist || !isFinishExists) {
          toaster.pop('error', 'Error', 'Set start and finish positions');
          return;
        }
        $scope.startRightHand();
      }
      else if(item == "Comparsion") {
        if(!isStartExist || !isFinishExists) {
          toaster.pop('error', 'Error', 'Set start and finish positions');
          return;
        }
        $scope.startComparsion();
      }
		};

    var isFirst = true;
    var isStartExist = false;
    var isFinishExists = false;

		$scope.setSize = function(item) {
      isStartExist = false;
      isFinishExists = false;
			$scope.options.selectedSize = item;
			//$scope.options.realSize = item * 50;
      var bufReal = item * 50;
			$scope.options.axisSize = bufReal / 2;
			$scope.options.isEven = isEven($scope.options.axisSize);
      $scope.options.realSize = bufReal;
			initializePlayfield();
      $scope.isClearBoard = false;
      $scope.clearBoard();
		};

		var isEven = function(n) {
			return !(n & 1);
		};

		var A = {
			x: null,
			y: null
		};
		var B = {
			x: null,
			y: null
		};

    var W = {
        x: null,
        y: null
    };
    var P = {
      x: null,
      y: null
    };
    var D = {
      x: null,
      y: null
    };

    var straight = [];

    var popToaster = function() {
       toaster.pop('error', 'Error', 'Place element only on empty position');
    }

		$scope.playfieldMouseClick = function(_x, _y) {
			if($scope.options.selectedItem == "Wall") {
        if($scope.playfield[_x][_y] == 0) {
          $scope.playfield[_x][_y] = 1;
          return true;
        }
        else {
          //alert("Error! Place element only on empty position!");
          //toaster.pop('error', 'Error', 'Place element only on empty position');
          return false;
        }

			}
			else if($scope.options.selectedItem == "Empty") {
        if($scope.playfield[_x][_y] == 2) {
          isStartExist = false;
        }
        if($scope.playfield[_x][_y] == 3) {
          isFinishExists = false;
        } 
				$scope.playfield[_x][_y] = 0;
        return true;
			}
			else if($scope.options.selectedItem == "Start" && !isStartExist) {
        if($scope.playfield[_x][_y] == 0) {          
          $scope.startFinishPos.start.x = _x;
          $scope.startFinishPos.start.y = _y;

  				$scope.playfield[_x][_y] = 2;
  				A.x = _x;
  				A.y= _y;
          isStartExist = true;
          return true;
        }
        else {
          //alert("Error! Place element only on empty position!");
          //toaster.pop('error', 'Error', 'Place element only on empty position');
          return false;
        }
			}
			else if($scope.options.selectedItem == "Finish" && !isFinishExists) {
        if($scope.playfield[_x][_y] == 0) {
          $scope.startFinishPos.finish.x = _x;
          $scope.startFinishPos.finish.y = _y;

  				$scope.playfield[_x][_y] = 3;
  				B.x = _x;
  				B.y= _y;
          isFinishExists = true;
          return true;
        }
        else {
          //alert("Error! Place element only on empty position!");
          //toaster.pop('error', 'Error', 'Place element only on empty position');
          return false;
        }
			}
    };

    var contains = function(array, point) {
      for(var i = 0; i < array.length; i++) {
        if(array[i].x == point.x && array[i].y == point.y) {
          return true;
        }
      }
      return false;
    };

		var straightWay = function() {
      var k, b;
      if (A.x == B.x)
      {
        if (A.y < B.y) {
        	for (var i = A.y; i <= B.y; i++) {
          	straight.push({
            	x: A.x, 
            	y: i
            });
          }
        } 
        else {
        	for (var i = B.y; i <= A.y; i++) {
          	straight.push({
            	x: A.x, 
            	y: i
            });
           }
        }
        return;
      }
      else
      {
        k = (B.y - A.y) / (B.x - A.x);
        b = (A.y * B.x - A.x * B.y) / (B.x - A.x);
      }

      var dx = Math.abs(A.x - B.x);
      var dy = Math.abs(A.y - B.y);
      if (dx > dy) {
        if (A.x < B.x) {
          straight.push({
          	x: A.x,
          	y: A.y
          });
          for (var xx = A.x; xx <= B.x; xx += 0.01) {
            var temp = {
              x: Math.round(xx),
              y: Math.round(k * xx + b)
            };
            if (temp.x != straight[straight.length - 1].x || temp.y != straight[straight.length - 1].y) {
              straight.push(temp);
            }
          }
        }
        else {
          straight.push({
            x: A.x,
            y: A.y
          });
          for (var xx = A.x; xx >= B.x; xx -= 0.01) {
            var temp = {
              x: Math.round(xx),
              y: Math.round(k * xx + b)
            };
            if (temp.x != straight[straight.length - 1].x || temp.y != straight[straight.length - 1].y) {
              straight.push(temp);
            }
          }
        }
      }
      else {
        if (A.y < B.y) {
          straight.push({
            x: A.x,
            y: A.y
          });
          for (var yy = A.y; yy <= B.y; yy += 0.01) {
            var temp = {
              x: Math.round((yy - b) / k),
              y: Math.round(yy)
            };
            if (temp.x != straight[straight.length - 1].x || temp.y != straight[straight.length - 1].y) {
              straight.push(temp);
            }
          }
        }
        else {
          straight.push({
            x: A.x,
            y: A.y
          });
          for (var yy = A.y; yy >= B.y; yy -= 0.01) {
            var temp = {
              x: Math.round((yy - b) / k),
              y: Math.round(yy)
            };
            if (temp.x != straight[straight.length - 1].x || temp.y != straight[straight.length - 1].y) {
              straight.push(temp);
            }
          }
        }
      }
      for (var i = 0; i < straight.length - 1; i++) {
        if (straight[i].x != straight[i + 1].x && straight[i].y != straight[i + 1].y) {
          straight.splice(i + 1, 0, {x: straight[i].x, y: straight[i + 1].y});
        }
      }
    };

		var PWD = function() {
      W = {
        x: 0,
        y: 0
      };
      P = {
        x: 0,
        y: 0
      };
      D = {
        x: 0,
        y: 0
      };
      var i = 0;
      for (var i = 0; i < straight.length - 1; i++) {
      	if ($scope.playfield[straight[i + 1].x][straight[i + 1].y] == 1) {
            P = straight[i];
            W = straight[i + 1];
            break;
        }
      }
      for (var i = (straight.length - 1); i > 0; i--) {
        if ($scope.playfield[straight[i - 1].x][straight[i - 1].y] == 1) {
          D = straight[i];
          break;
        }
      }
    };

    var LeftCoors = function() {
      var x1 = W.x - W.y + P.y;
      var x2 = P.x - W.y + P.y;
      var y1 = W.y - P.x + W.x;
      var y2 = P.y - P.x + W.x;
      return {
        x1: x1,
        x2: x2,
        y1: y1,
        y2: y2
      }
    };

    var RightCoors = function() {
      var x1 = W.x + W.y - P.y;
      var x2 = P.x + W.y - P.y;
      var y1 = W.y + P.x - W.x;
      var y2 = P.y + P.x - W.x;
      return {
        x1: x1,
        x2: x2,
        y1: y1,
        y2: y2
      }
    };

  	var findWay = function(left) {
			var myway = []
      var i = 0;
      var old_w = {
      	x: null,
      	y: null
      };
      var old_p = {
      	x: null,
      	y: null
      };
      PWD();
      if (A.x == P.x && A.y == P.y) {
        myway.push(P);
      }
      else {
        for (i = 0; i < straight.length; i++) {
          if (straight[i].x != W.x || straight[i].y != W.y) {
              myway.push(straight[i]);
          }
          if (straight[i].x == W.x && straight[i].y != W.y) {
            break;             
          }
        }
      }
      var iterations = 0;
      var flag = true;
      var deleted = {
        x: 0,
        y: 0
      };
      do {
        var x1 = 0;
        var x2 = 0;
        var y1 = 0;
        var y2 = 0;
        if (left == true) {
          var leftcrds = LeftCoors();
          x1 = leftcrds.x1;
          x2 = leftcrds.x2;
          y1 = leftcrds.y1;
          y2 = leftcrds.y2;
        }
        else {
          var rightcrds = RightCoors();
          x1 = rightcrds.x1;
          x2 = rightcrds.x2;
          y1 = rightcrds.y1;
          y2 = rightcrds.y2;
        }

        old_p = P;
        old_w = W;

        if ($scope.playfield[x2][y2] == 1) {
          W = {
            x: x2,
            y: y2
          };
        }
        else {
          if ($scope.playfield[x1][y1] != 1) {
            P = {
              x: x1, 
              y: y1
            }
            myway.push(P);
          }
          else {
            W = {
              x: x1, 
              y: y1
            }
            P = {
              x: x2, 
              y: y2
            }
            myway.push(P);
          }
        }
        if (P.x == D.x && P.y == D.y) {
          flag = false;
          break;
        }
        if (P.x == B.x && P.y == B.y) {
          myway.push(P);
          flag = false;
          return EndOfFind(myway);
        }
        if (contains(straight, P)) {
          for (i = 0; i < straight.length; i++) {
            if (straight[i].x == P.x && straight[i].y == P.y) {
              break;
            }
          }
          i++;
          for (; i < straight.length; i++) {
            if ($scope.playfield[straight[i].x][straight[i].y] != 1) {
              myway.push(straight[i]);
            }
            else {
              break;
            }
          }
          if (myway[myway.length - 1].x == B.x && myway[myway.length - 1].y == B.y) {
            myway.push(B);
            flag = false;
            return EndOfFind(myway);
          }
          var p_count = 0;
          var old_p_count = 0;
          for (var j = 0; j < myway.length; j++) {
            if (myway[j].x == P.x && myway[j].y == P.y) {
              p_count++; 
            }
            if (myway[j].x == old_p.x) {
              old_p_count++;   
            }
          }
          if (p_count > 2 && old_p_count > 1) {
            deleted = myway[myway.length - 1];
            myway.splice(myway.length - 1, 1);
          }
          else {
            i--;
            if ((straight[i].x != old_p.x || straight[i].y != old_p.y) && (straight[i + 1].x != old_w.x || straight[i + 1].y != old_w.y)) {
              P = straight[i];
              W = straight[i + 1];
            }
            else {
              if (old_w.x != W.x || old_w.y != W.y) {
                if (myway.length > 1) {
                  deleted = myway[myway.length - 1];
                  myway.splice(myway.length - 1, 1);
                }
              }
            }
          }
        }
        iterations++;
        if (iterations > 500) {
          myway = null;
          return 0;
        }
      } while (flag);

      for (; i < straight.length; i++) {
        if (straight[i].x == D.x || straight[i].y == D.y) {
          break;
        }
      }
      for (i++; i < straight.length; i++) {
        if ($scope.playfield[straight[i].x][straight[i].y] != 1) {
          myway.push(straight[i]); 
        }
      }
      return EndOfFind(myway);
  	};

    var AreNeighs = function(one, two) { 
      if (!(one.x == two.x && one.y == two.y) &&
           ((one.x == two.x && (Math.abs(one.y - two.y) == 1)) || (one.y == two.y && (Math.abs(one.x - two.x) == 1)) || (Math.abs(one.x - two.x) == 1 && Math.abs(one.y - two.y) == 1))
         ) {
        return true;
      }
      else {
        return false;
      }
    };

    var CutDublicates = function(myway) {
      for (var i = 0; i < myway.length - 2; i++) {
        for (var j = (i + 2); j < myway.length; j++) {
          if (AreNeighs(myway[i], myway[j]) == true) {
            myway.splice(i + 1, j - i - 1);
          }
        }
      }
      for (var i = 0; i < myway.length - 1; i++) {
        for (var j = (i + 1); j < myway.length; j++) {
          if (myway[i] == myway[j]) {
            myway.splice(i + 1, j - i);
          }
        }
      }
      return Reduce(myway);
    };

    var Reduce = function(myway) {
      for (var i = 0; i < myway.length - 2; i++) {
        for (var j = (i + 2); j < myway.length; j++) {
          if (AreNeighs(myway[i], myway[j])) {
            myway.splice(i + 1, j - i - 1);
          }
        }
      }
      for (var i = 0; i < myway.length - 2; i++) {
        if (IsAngle(myway[i], myway[i + 1], myway[i + 2])) {
          var temp = {
            x: ((myway[i].x + myway[i + 2].x) / 2),
            y: ((myway[i].y + myway[i + 2].y) / 2)
          }
          if ($scope.playfield[temp.x][temp.y] != 1) {
            myway[i + 1] = temp;
            Reduce(myway);
          }   
        }
      }
      return myway;
    };

    var IsAngle = function(one, two, three) {
      if( (Math.abs(one.x - two.x) == 1 && Math.abs(one.y - two.y) == 1) &&
          (Math.abs(three.x - two.x) == 1 && Math.abs(three.y - two.y) == 1) &&
          ((one.x == three.x && (Math.abs(one.y - three.y) == 2)) || (one.y == three.y && (Math.abs(one.x - three.x) == 2)))
        ) {
        return true; 
      }
      else {
        return false;
      }
    };

    var EndOfFind = function(myway) {
      myway = CutDublicates(myway);
      myway = Reduce(myway);
      //Если у нас вдруг выпали точки
      var i = 0;
      for (i = 0; i < myway.length - 1; i++) {
        if (!AreNeighs(myway[i], myway[i + 1])) {
          var one_x;
          var one_y;
          var two_x;
          var two_y;
          one_x = Math.round(((myway[i].x + myway[i + 1].x + 0.1) / 2));
          two_x = Math.round(((myway[i].x + myway[i + 1].x - 0.1) / 2));
          one_y = Math.round(((myway[i].y + myway[i + 1].y + 0.1) / 2));
          two_y = Math.round(((myway[i].y + myway[i + 1].y - 0.1) / 2));
          if ($scope.playfield[one_x][one_y] != 1) {
            //myway.Insert(i + 1, new Point(one_x, one_y));
            myway.splice(i + 1, 0, {x: one_x, y: one_y});
          }

          else {
            if ($scope.playfield[one_x, two_y] != 1) {
              //myway.Insert(i + 1, new Point(one_x, two_y));
              myway.splice(i + 1, 0, {x: one_x, y: two_y});
            }
            else {
              if ($scope.playfield[two_x, two_y] != 1) {
                //myway.Insert(i + 1, new Point(two_x, two_y));
                myway.splice(i + 1, 0, {x: two_x, y: two_y});
              }
              else {
                if ($scope.playfield[two_x, one_y] != 1) {
                  //myway.Insert(i + 1, new Point(two_x, one_y));
                  myway.splice(i + 1, 0, {x: two_x, y: one_y});
                }
              }
            }
          }
        }  
      } 
      //way = true;
      return {length: myway.length, way: myway};
    };

    $scope.startLeftHand = function() {
      $scope.isComparsion = false;
      $scope.isClearBoard = false;
      $scope.isAlgorithm = true;
      if(isFirst) {
        isFirst = false;
      }
      else {
        straight = [];
        W = {
          x: null,
          y: null
        };
        P = {
          x: null,
          y: null
        };
        D = {
          x: null,
          y: null
        };
        var buf = $scope.options.selectedItem;
        $scope.options.selectedItem = "Start";
        $scope.playfieldMouseClick($scope.startFinishPos.start.x, $scope.startFinishPos.start.y);
        $scope.options.selectedItem = "Finish";
        $scope.playfieldMouseClick($scope.startFinishPos.finish.x, $scope.startFinishPos.finish.y);
        $scope.options.selectedItem = buf;
      }
      straightWay();
      PWD();
      var result = findWay(true);

      $scope.wayLength = result.length;

      if((result.way[result.way.length - 1].x == $scope.startFinishPos.start.x) && 
         (result.way[result.way.length - 1].y == $scope.startFinishPos.start.y)) {
        result.way.reverse();
      }

      if(result == 0) {
        alert("Way insn't exists!!!");
        return;
      }
      //var b = 7;
      var bufWay = [];
      for(var i = 0; i < result.way.length; i++) {
        bufWay.push({
          x: toRealCoord(result.way[i].x),
          z: toRealCoord(result.way[i].y),
          y: 0
        });
      }
      $scope.robotWay = {
        point: {
          x: toRealCoord(result.way[result.way.length - 1].x),
          z: toRealCoord(result.way[result.way.length - 1].y),
          y: 0
        },
        way: bufWay
      };
    };

    $scope.startRightHand = function() {
      $scope.isComparsion = false;
      $scope.isClearBoard = false;
      $scope.isAlgorithm = true;
      if(isFirst) {
        isFirst = false;
      }
      else {
        straight = [];
        W = {
          x: null,
          y: null
        };
        P = {
          x: null,
          y: null
        };
        D = {
          x: null,
          y: null
        };
        var buf = $scope.options.selectedItem;
        $scope.options.selectedItem = "Start";
        $scope.playfieldMouseClick($scope.startFinishPos.start.x, $scope.startFinishPos.start.y);
        $scope.options.selectedItem = "Finish";
        $scope.playfieldMouseClick($scope.startFinishPos.finish.x, $scope.startFinishPos.finish.y);
        $scope.options.selectedItem = buf;
      }
      straightWay();
      PWD();
      var result = findWay(false);

      $scope.wayLength = result.length;

      if((result.way[result.way.length - 1].x == $scope.startFinishPos.start.x) && 
         (result.way[result.way.length - 1].y == $scope.startFinishPos.start.y)) {
        result.way.reverse();
      }

      if(result == 0) {
        alert("Way insn't exists!!!");
        return;
      }
      var bufWay = [];
      for(var i = 0; i < result.way.length; i++) {
        bufWay.push({
          x: toRealCoord(result.way[i].x),
          z: toRealCoord(result.way[i].y),
          y: 0
        });
      }
      $scope.robotWay = {
        point: {
          x: toRealCoord(result.way[result.way.length - 1].x),
          z: toRealCoord(result.way[result.way.length - 1].y),
          y: 0
        },
        way: bufWay
      };
    };

    $scope.startComparsion = function() {
      $scope.isComparsion = true;
      $scope.isClearBoard = false;
      $scope.isAlgorithm = true;
      if(isFirst) {
        isFirst = false;
      }
      else {
        straight = [];
        W = {
          x: null,
          y: null
        };
        P = {
          x: null,
          y: null
        };
        D = {
          x: null,
          y: null
        };
        var buf = $scope.options.selectedItem;
        $scope.options.selectedItem = "Start";
        $scope.playfieldMouseClick($scope.startFinishPos.start.x, $scope.startFinishPos.start.y);
        $scope.options.selectedItem = "Finish";
        $scope.playfieldMouseClick($scope.startFinishPos.finish.x, $scope.startFinishPos.finish.y);
        $scope.options.selectedItem = buf;
      }
      straightWay();
      PWD();
      var resultRight = findWay(false);

      straight = [];
      W = {
        x: null,
        y: null
      };
      P = {
        x: null,
        y: null
      };
      D = {
        x: null,
        y: null
      };

      straightWay();
      PWD();
      var resultLeft = findWay(true);
      var result;
      $scope.comparsionData = {
        left: resultLeft.length,
        right: resultRight.length
      }
      if(resultLeft == 0) {
        alert("Way insn't exists!!!");
        return;
      }
      if(resultRight == 0) {
        alert("Way insn't exists!!!");
        return;
      }
      if(resultLeft.length < resultRight.length) {
        $scope.wayLength = resultLeft.length;
        $scope.options.selectedAlgorithm = "Left hand";
        result = resultLeft;
      }
      else if(resultLeft.length > resultRight.length) {
        $scope.wayLength = resultRight.length;
        $scope.options.selectedAlgorithm = "Right hand";
        result = resultRight;
      }
      else {
        $scope.wayLength = resultLeft.length;
        $scope.options.selectedAlgorithm = "Algorhitms have the same way length";
        result = resultLeft;
      }

      if((result.way[result.way.length - 1].x == $scope.startFinishPos.start.x) && 
         (result.way[result.way.length - 1].y == $scope.startFinishPos.start.y)) {
        result.way.reverse();
      }

      var bufWay = [];
      for(var i = 0; i < result.way.length; i++) {
        bufWay.push({
          x: toRealCoord(result.way[i].x),
          z: toRealCoord(result.way[i].y),
          y: 0
        });
      }
      $scope.robotWay = {
        point: {
          x: toRealCoord(result.way[result.way.length - 1].x),
          z: toRealCoord(result.way[result.way.length - 1].y),
          y: 0
        },
        way: bufWay
      };
    };

    var toRealCoord = function(num) {
      var startField = -($scope.options.axisSize - 25);
      for(var i = 1; i < num; i++) {
        startField += 50 ;
      }
      return startField;
    };

    $scope.anotherAlgorithm = function() {
      $scope.isAlgorithm = false;
      $scope.anotherAlgoPos = {
        x: toRealCoord($scope.startFinishPos.start.x),
        y: toRealCoord($scope.startFinishPos.start.y)
      }
    };

    $scope.clearBoard = function() {
      isStartExist = false;
      isFinishExists = false;
      $scope.isAlgorithm = false;
      $scope.isClearBoard = true;
      isStartExist = false;
      isFinishExists = false;
      $scope.setSize($scope.options.selectedSize);
    };
  }]);
