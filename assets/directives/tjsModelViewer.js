angular.module("tjsModelViewer", [])
	.directive("tjsModelViewer", [function () {
		return {
			restrict: "E",
			scope: {
				selectedItem: "=",
				realSize: "=",
				axisSize: "=",
				isEven: "="
			},
			link: function (scope, elem, attr) {

				scope.$watch("size", function(newValue, oldValue) {
					if (newValue != oldValue) loadModel(newValue);
				});

				if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

	      var container;
	      var camera, scene, renderer;
	      var plane, cube;
	      var mouse, raycaster, controls, model, isShiftDown = false, isCtrlDown = false;
	      var rollOverMesh, rollOverMaterial;
	      var cubeGeo, cubeMaterial;
	      var objects = [];
	    
	      function init() {
	        container = document.createElement( 'div' );
	        document.body.appendChild( container );

	        /*var info = document.createElement( 'div' );
	        info.style.position = 'absolute';
	        info.style.top = '10px';
	        info.style.width = '100%';
	        info.style.textAlign = 'center';
	        info.innerHTML = '<a href="http://threejs.org" target="_blank">three.js</a> - voxel painter - webgl<br><strong>click</strong>: add voxel, <strong>shift + click</strong>: remove voxel';
	        container.appendChild( info );*/


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
	        cubeMaterial = new THREE.MeshBasicMaterial( { color: 0xfeb74c,  map: THREE.ImageUtils.loadTexture( "./assets/images/wall.jpg" ) } );

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

	        document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	        document.addEventListener( 'mousedown', onDocumentMouseDown, false );
	        document.addEventListener( 'keydown', onDocumentKeyDown, false );
	        document.addEventListener( 'keyup', onDocumentKeyUp, false );
	        window.addEventListener( 'resize', onWindowResize, false );
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

	          /*for(var i = -sizeX / 2 + 25; i <= sizeX / 2 - 25; i+= 50) {
	            if(rollOverMesh.position.x == i) {
								var span3 = document.getElementById("ipos");
	              span3.textContent = counterX;
	              break;
	            }
	            counterX++;
	          }

	          for(var i = -sizeY / 2 + 25; i <= sizeY / 2 - 25; i+= 50) {
	            if(rollOverMesh.position.z == i) {
	              var span4 = document.getElementById("jpos");
	              span4.textContent = counterY;
	              break;
	            }
	            counterY++;
	          }*/
	        }
	        render();
	      }

	      function onDocumentMouseDown( event ) {
	        event.preventDefault();
	        mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );
	        raycaster.setFromCamera( mouse, camera );

	        var intersects = raycaster.intersectObjects( objects );
	        if ( intersects.length > 0) {
	          var intersect = intersects[ 0 ];
	          if (scope.selectedItem == "Empty") {
	            if ( intersect.object != plane ) {
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
	              //mesh.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
	              if(!scope.isEven) {
	          			mesh.position.divideScalar( 25 ).floor().multiplyScalar( 25 ).addScalar( 25 ).divideScalar( 50 ).floor().multiplyScalar( 50 );
	          			mesh.position.y += 25;
			          }
			          else if(scope.isEven) {
			          	mesh.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
			          }
	              mesh.position.y = 0;
	              scene.add( mesh );
	              objects.push( mesh );
	            });
	          }
	          else if(scope.selectedItem == "Wall") {
	            if(intersects.length > 1) {
	              intersect = intersects[intersects.length - 1]
	            }
	            var voxel = new THREE.Mesh( cubeGeo, cubeMaterial );
	            voxel.position.copy( intersect.point ).add( intersect.face.normal );
	            //voxel.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
	            if(!scope.isEven) {
	          		voxel.position.divideScalar( 25 ).floor().multiplyScalar( 25 ).addScalar( 25 ).divideScalar( 50 ).floor().multiplyScalar( 50 );
	          		voxel.position.y += 25;
		          }
		          else if(scope.isEven) {
		          	voxel.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
		          }
	            scene.add( voxel );
	            objects.push( voxel );
	          }
	          render();
	        }
	      }

	      function onDocumentKeyDown( event ) {
	        switch( event.keyCode ) {
	          case 16: isShiftDown = true; break;
	          case 17: isCtrlDown = true; break;
	        }
	      }

	      function onDocumentKeyUp( event ) {
	        switch ( event.keyCode ) {
	          case 16: isShiftDown = false; break;
	          case 17: isCtrlDown = false; break;
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

	      init();
	      animate();
			}
		}
	}]);
