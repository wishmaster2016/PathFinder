angular.module("tjsModelViewer", [])
	.directive("tjsModelViewer", [function () {
		return {
			restrict: "E",
			scope: {
				selectedItem: "=",
				realSize: "=",
				axisSize: "=",
				isEven: "=",
				robotWay: "=",
				anotherAlgoPos: "=",
				isClearBoard: "="
			},
			link: function (scope, elem, attr) {
				if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
				var container = undefined;
	      var camera = undefined;
	      var scene = undefined;
	      var renderer = undefined;
	      var plane = undefined;
	      var cube = undefined;
	      var mouse = undefined;
	      var raycaster = undefined;
	      var controls = undefined;
	      var model = undefined;
	      var rollOverMesh = undefined;
	      var rollOverMaterial = undefined;
	      var finishGeo = undefined;
	      var cubeGeo = undefined;
	      var cubeMaterial = undefined;
	      var finishMaterial = undefined;
	      var objects = [];
	      var isFirst = true;
	      var android = undefined;
	      var timeAndroid = 1;

	      document.addEventListener( 'mousemove', onDocumentMouseMove, false );
		    document.addEventListener( 'mousedown', onDocumentMouseDown, false );
		    window.addEventListener( 'resize', onWindowResize, false );

      	var moveBot = function(path, place) {
	      	var itemSize = 25;
	        var tl = new TimelineLite();//,
	        tl.clear();
	        for(var i = 0; i < path.length; i++) {
	          var target0 = { x: path[i].x, y: path[i].y, z: path[i].z };
	          tl.add(TweenLite.to(android.position, timeAndroid, target0));
	        }
	        tl.delay(0);
	        tl.play();
	      };

	      scope.$watch("anotherAlgoPos", function(newValue, oldValue) {
	      	if(newValue.x != undefined && newValue.y != undefined) {
	      		android.position.x = newValue.x;
	      		android.position.z = newValue.y;
	      	}
	      });

	      scope.$watch("isClearBoard", function(newValue, oldValue) {
	      	if(newValue != undefined && newValue) {
	      		for(var i = 1; i < objects.length; i++) {
	      			scene.remove(objects[i]);
	      		}
	      		scope.$parent.isClearBoard = true;
	      	}
	      });


	      scope.$watch("robotWay", function(newValue, oldValue) {
	      	if(newValue != undefined && newValue.way && newValue.way.length > 0) {
	      		moveBot(scope.robotWay.way, scope.robotWay.point);
	      	}
	      });

				scope.$watch("realSize", function(newValue, oldValue) {
					if(!isFirst) {
		      	container.removeChild( renderer.domElement );
		      }
					container = undefined;
		      camera = undefined;
		      scene = undefined;
		      renderer = undefined;
		      plane = undefined;
		      cube = undefined;
		      mouse = undefined;
		      raycaster = undefined;
		      controls = undefined;
		      model = undefined;
		      rollOverMesh = undefined;
		      rollOverMaterial = undefined;
		      cubeGeo = undefined;
		      finishGeo = undefined;
		      cubeMaterial = undefined;
		      finishMaterial = undefined;
		      objects = [];
		      anroid = undefined;
		      init();
		      animate();
		      isFirst = false;
				});
				function init() {
	        container = document.createElement( 'div' );
	        document.body.appendChild( container );

	        scene = new THREE.Scene();
	        camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
	        camera.position.set( 500, 800, 1300 );
	        scene.add(camera);

	        var light = new THREE.PointLight(0xffffff);
	        light.position.set(-500, 500, 500);
	        scene.add(light);
	        var ambientLight = new THREE.AmbientLight(0xffffff);
	        scene.add(ambientLight);

	        rollOverGeo = new THREE.BoxGeometry( 50, 50, 50 );
	        rollOverMaterial = new THREE.MeshBasicMaterial( { color: 0xfeb74c, opacity: 0.5, transparent: true } );
	        rollOverMesh = new THREE.Mesh( rollOverGeo, rollOverMaterial );
	        scene.add( rollOverMesh );

	        cubeGeo = new THREE.BoxGeometry( 50, 50, 50 );
	        finishGeo = new THREE.BoxGeometry( 50, 1, 50 );
	        cubeMaterial = new THREE.MeshBasicMaterial( { color: 0xfeb74c,  map: THREE.ImageUtils.loadTexture( "./assets/images/wall.jpg" ) } );
	        finishMaterial = new THREE.MeshBasicMaterial( { color: 0x399C24 } );

	        var size = scope.axisSize, step = 50;
	        var geometry = new THREE.Geometry();

	        for ( var i = - size; i <= size; i += step ) {
	          geometry.vertices.push( new THREE.Vector3( - size, 0, i ) );
	          geometry.vertices.push( new THREE.Vector3(   size, 0, i ) );
	          geometry.vertices.push( new THREE.Vector3( i, 0, - size ) );
	          geometry.vertices.push( new THREE.Vector3( i, 0,   size ) );
	        }

	        var material = new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2, transparent: true } );
	        var line = new THREE.Line( geometry, material, THREE.LinePieces );
	        scene.add( line );

	        raycaster = new THREE.Raycaster();
	        mouse = new THREE.Vector2();

	        var geometry = new THREE.PlaneBufferGeometry( scope.realSize, scope.realSize );
	        geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
	        plane = new THREE.Mesh( geometry );
	        plane.visible = false;
	        scene.add( plane );
	        objects.push( plane );

	        renderer = new THREE.WebGLRenderer( { antialias: true } );
	        renderer.setClearColor( 0xffffff);
	        renderer.setPixelRatio( window.devicePixelRatio );
	        renderer.setSize( window.innerWidth, window.innerHeight );
	        container.appendChild( renderer.domElement );

	        controls = new THREE.TrackballControls( camera );
	        controls.target.set( 0, 0, 0 );
	        controls.noZoom = false;
	        controls.noPan = false;
	        controls.staticMoving = false;
	        controls.keys = [ 65, 83, 68 ];
	      }

	      function onWindowResize() {
	        camera.aspect = window.innerWidth / window.innerHeight;
	        camera.updateProjectionMatrix();
	        renderer.setSize( window.innerWidth, window.innerHeight );
	        controls.handleResize();
	      }

	      function onDocumentMouseMove( event ) {
	        event.preventDefault();
	        mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );
	        raycaster.setFromCamera( mouse, camera );
	        var intersects = raycaster.intersectObjects( objects );

	        if ( intersects.length > 0) {
	          var intersect = intersects[ intersects.length - 1 ];
	          rollOverMesh.position.copy( intersect.point ).add( intersect.face.normal );
	          if(!scope.isEven) {
	          	rollOverMesh.position.divideScalar( 25 ).floor().multiplyScalar( 25 ).addScalar( 25 ).divideScalar( 50 ).floor().multiplyScalar( 50 );
	          	rollOverMesh.position.y += 25;
	          }
	          else if(scope.isEven) {
	          	rollOverMesh.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
	          }
	        }
	        render();
	      }

	      function onDocumentMouseDown( event ) {
	        event.preventDefault();
	        mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );
	        raycaster.setFromCamera( mouse, camera );
	        var counterX = 0;
	        var counterY = 0;
	        var intersects = raycaster.intersectObjects( objects );
	        if ( intersects.length > 0) {
	          var intersect = intersects[ 0 ];
	          if (scope.selectedItem == "Empty") {
	            if ( intersect.object != plane ) {
		            for(var i = -scope.realSize / 2 + 25; i <= scope.realSize / 2 - 25; i+= 50) {
			            if(intersect.object.position.x == i) {
			              break;
			            }
			            counterX++;
			          }
			          for(var i = -scope.realSize / 2 + 25; i <= scope.realSize / 2 - 25; i+= 50) {
			            if(intersect.object.position.z == i) {
			              break;
			            }
			            counterY++;
			          }
			          console.log('x: ', counterX, ', y: ', counterY);
			          scope.$parent.playfieldMouseClick(counterX + 1, counterY + 1);
	              scene.remove( intersect.object );
	              objects.splice( objects.indexOf( intersect.object ), 1 );
	            }
	          }
	          else if(scope.selectedItem == "Start") {
	            var jsonLoader = new THREE.JSONLoader();
	            jsonLoader.load("./assets/models/android-animations.js", function(geometry, materials) {
	              for(var i = 0; i < materials.length; i++) {
	                materials[i].morphTargets = true;
	              }
	              var material = new THREE.MeshFaceMaterial(materials);
	              var mesh = new THREE.Mesh( geometry, material );
	              mesh.rotation.y = 2 * Math.PI;
	              mesh.scale.set(5, 5, 5);
	              mesh.position.copy( intersect.point ).add( intersect.face.normal );
	              if(!scope.isEven) {
	          			mesh.position.divideScalar( 25 ).floor().multiplyScalar( 25 ).addScalar( 25 ).divideScalar( 50 ).floor().multiplyScalar( 50 );
	          			mesh.position.y += 25;
			          }
			          else if(scope.isEven) {
			          	mesh.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
			          }
	              for(var i = -scope.realSize / 2 + 25; i <= scope.realSize / 2 - 25; i+= 50) {
			            if(mesh.position.x == i) {
			              break;
			            }
			            counterX++;
			          }
			          for(var i = -scope.realSize / 2 + 25; i <= scope.realSize / 2 - 25; i+= 50) {
			            if(mesh.position.z == i) {
			              break;
			            }
			            counterY++;
			          }
			          console.log('x: ', counterX, ', y: ', counterY);
			          if(scope.$parent.playfieldMouseClick(counterX + 1, counterY + 1)) {
			          	mesh.position.y = 0;
		              android = mesh;
		              scene.add( mesh );
		              objects.push( mesh );
			          }
	            });
	          }
	          else if(scope.selectedItem == "Wall") {
	            if(intersects.length > 1) {
	              intersect = intersects[intersects.length - 1]
	            }
	            var voxel = new THREE.Mesh( cubeGeo, cubeMaterial );
	            voxel.position.copy( intersect.point ).add( intersect.face.normal );
	            if(!scope.isEven) {
	          		voxel.position.divideScalar( 25 ).floor().multiplyScalar( 25 ).addScalar( 25 ).divideScalar( 50 ).floor().multiplyScalar( 50 );
	          		voxel.position.y += 25;
		          }
		          else if(scope.isEven) {
		          	voxel.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
		          }


	            for(var i = -scope.realSize / 2 + 25; i <= scope.realSize / 2 - 25; i+= 50) {
		            if(voxel.position.x == i) {
		              break;
		            }
		            counterX++;
		          }
		          for(var i = -scope.realSize / 2 + 25; i <= scope.realSize / 2 - 25; i+= 50) {
		            if(voxel.position.z == i) {
		              break;
		            }
		            counterY++;
		          }
		          console.log('x: ', counterX, ', y: ', counterY);
		          if(scope.$parent.playfieldMouseClick(counterX + 1, counterY + 1)) {
		          	scene.add( voxel );
	            	objects.push( voxel );
		          }
	          }
	          else if(scope.selectedItem == "Finish") {
	            if(intersects.length > 1) {
	              intersect = intersects[intersects.length - 1]
	            }
	            var voxel = new THREE.Mesh( finishGeo, finishMaterial );
	            voxel.position.copy( intersect.point ).add( intersect.face.normal );
	            if(!scope.isEven) {
	          		voxel.position.divideScalar( 25 ).floor().multiplyScalar( 25 ).addScalar( 25 ).divideScalar( 50 ).floor().multiplyScalar( 50 );
	          		voxel.position.y = 0;
		          }
		          else if(scope.isEven) {
		          	voxel.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
		          	voxel.position.y = 0;
		          }

	            for(var i = -scope.realSize / 2 + 25; i <= scope.realSize / 2 - 25; i+= 50) {
		            if(voxel.position.x == i) {
		              break;
		            }
		            counterX++;
		          }
		          for(var i = -scope.realSize / 2 + 25; i <= scope.realSize / 2 - 25; i+= 50) {
		            if(voxel.position.z == i) {
		              break;
		            }
		            counterY++;
		          }
		          console.log('x: ', counterX, ', y: ', counterY);
		          if(scope.$parent.playfieldMouseClick(counterX + 1, counterY + 1)) {
		          	scene.add( voxel );
	            	objects.push( voxel );
		          }
	          }

	          render();
	        }
	      }

	      function render() {
	        renderer.render( scene, camera );
	      }

	      function animate () {
	        requestAnimationFrame(animate);
	        controls.update();
	        renderer.render( scene, camera );
	      };
			}
		}
	}]);
