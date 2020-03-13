
class Visual {

    constructor() {

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();

        this.boxes = new THREE.Object3D();
        this.lbox = new THREE.Object3D();
        this.rbox = new THREE.Object3D();
        this.boxes.add(this.lbox);
        this.boxes.add(this.rbox);

        this.init();
        this.curve();

        this.scurve1;
        this.scurve2;

    }

    init() {
        window.addEventListener('resize', () => {

            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();

            this.renderer.setSize(window.innerWidth, window.innerHeight);

        });
        // let controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        this.camera.position.set(0, 20, 40)
        this.camera.lookAt(this.scene.position)
        this.renderer.setClearColor(0x1e90ff);
        this.scene.fog = new THREE.FogExp2(0x1e90ff, 0.005);

        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        var light = new THREE.SpotLight(0xffffff, 0.6, 500, Math.PI / 5);
        light.position.set(10, 30, 90);
        light.lookAt(this.scene.position);
        light.castShadow = true;
        this.scene.add(light);

        var alight = new THREE.AmbientLight(0xffffff, 0.9);
        this.scene.add(alight);


        let hemiLight = new THREE.PointLight(0xffdd00, 1, 500);
        hemiLight.castShadow = true;
        hemiLight.position.set(0, 100, -350)
        hemiLight.lookAt(this.camera.position)
        this.scene.add(hemiLight);


        this.addPlane();
        this.cubes();

        this.GameLoop();

    }

    GameLoop() {
        requestAnimationFrame(this.GameLoop.bind(this));

        this.curve();
        this.cubesUpdate();
        this.renderer.render(this.scene, this.camera);
    }

    addPlane() {

        var geometry = new THREE.PlaneGeometry(700, 700, 32);
        var material = new THREE.MeshPhongMaterial({
            color: 0xeeeeee,
            side: THREE.DoubleSide,
            specular: 0xffffff,
            shininess: 50,
        });
        var plane = new THREE.Mesh(geometry, material);
        plane.rotation.x = Math.PI / 2;
        plane.receiveShadow = true;
        this.scene.add(plane);
    }

    curve() {

        let scaleX = 0.2
        let scaleY = 10;
        let wave = music.getData().split(',');


        this.scene.remove(this.scurve1);
        this.scene.remove(this.scurve2);

        let vectab1 = [];
        let vectab2 = [];

        // vectab1.push(new THREE.Vector2(-1, 128 / scaleY));
        // vectab2.push(new THREE.Vector2(-1, 128 / scaleY));
        // vectab1.push(new THREE.Vector2(0, 128 / scaleY));
        // vectab2.push(new THREE.Vector2(0, 128 / scaleY));

        let i = 1;

        for (let w of wave) {
            if (i % 2 == 0)
                vectab1.push(new THREE.Vector2(i * scaleX, w / scaleY));
            else {
                vectab2.push(new THREE.Vector2(-i * scaleX, w / scaleY));
            }
            i++;
        }
        // vectab1.push(new THREE.Vector2(i * scaleX, 128 / scaleY));
        // vectab2.push(new THREE.Vector2(i * scaleX, 128 / scaleY));


        var curve1 = new THREE.SplineCurve(vectab1);
        var curve2 = new THREE.SplineCurve(vectab2);

        var points1 = curve1.getPoints(132);
        var points2 = curve2.getPoints(132);

        var geometry1 = new THREE.BufferGeometry().setFromPoints(points1);
        var geometry2 = new THREE.BufferGeometry().setFromPoints(points2);

        var material1 = new THREE.LineBasicMaterial({ color: 0x8888ff });
        var material2 = new THREE.LineBasicMaterial({ color: 0x0062ff });

        this.scurve1 = new THREE.Line(geometry1, material1);
        this.scurve2 = new THREE.Line(geometry2, material2);

        this.scene.add(this.scurve1)
        this.scene.add(this.scurve2)
        // this.scurve1.scale(3, 3, 3)
        this.scurve2.position.z -= 6;
        this.scurve1.position.z -= 6;


    }

    cubes() {

        var material2 = new THREE.MeshPhongMaterial({
            color: 0x0062ff,
            side: THREE.DoubleSide,
            wireframe: false,
            shininess: 50,
            specular: 0x000000,
            transparent: true,
            opacity: 0.5
        });

        var material1 = new THREE.MeshPhongMaterial({
            color: 0x8888ff,
            side: THREE.DoubleSide,
            wireframe: false,
            shininess: 50,
            specular: 0xffffff,
            transparent: true,
            opacity: 0.5
        });
        let margin = 2;

        for (let z = 0; z < 8; z++) {
            for (let x = 0; x < 8; x++) {
                var geometry = new THREE.BoxGeometry(2, 2, 2);

                var cube = new THREE.Mesh(geometry, material1);

                cube.position.set(x + x * margin + 2, 1, z + z * margin);
                cube.castShadow = true
                this.lbox.add(cube)

            }
        }

        for (let z = 0; z < 8; z++) {
            for (let x = 0; x < 8; x++) {
                var geometry = new THREE.BoxGeometry(2, 2, 2);

                var cube = new THREE.Mesh(geometry, material2);
                cube.castShadow = true

                cube.position.set(-x + -x * margin - 2, 1, z + z * margin);
                this.rbox.add(cube)
            }
        }

        this.scene.add(this.boxes)


    }

    cubesUpdate() {
        let wave = music.getData().split(',');




        for (let [i, box] of this.lbox.children.entries()) {
            box.scale.y = wave[2 * i] / 40;

        }

        for (let [i, box] of this.rbox.children.entries()) {
            box.scale.y = wave[2 * i + 1] / 40;

        }

    }

}