'use strict';

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

console.clear();

const Constants = {
	fps: 1000 / 60,
	Camera: {
		FOV: 75,
		near: 0.1,
		far: 1000,
		Position: {
			z: 1.25,
		},
	},
	Renderer: {
		antialias: true,
		alpha: true,
		ShadowMap: {
			enabled: true,
		},
	},
	Lighting: {
		Ambient: {
			color: 0xffffff,
			intensity: 1,
		},
		Directional: {
			color: 0xffffff,
			intensity: 1,
			x: -3,
			y: 4,
			z: 3,
			castShadow: true,
			Shadow: {
				bias: -0.0005,
				Camera: {
					near: 0.1,
					far: 1000,
				},
			},
		},
	},
	Model: {
		path: 'https://assets.codepen.io/430361/Spideleton.gltf',
		castShadow: true,
		receiveShadow: true,
		roughness: 0.5,
		metalness: 0.25,
		Rotation: {
			y: 180,
		},
		Position: {
			y: -0.5,
		},
	},
	Animations: {
		path: 'https://assets.codepen.io/430361/Spideleton.animation.json',
		time: 0.02,
		Clips: {
			idle: 'Idle',
			eat: 'Eat',
			happy: 'Happy',
		},
	},
};

class Utils {
	static getRadian(degree) {
		return degree * Math.PI / 180;
	}	
};

class Spideleton {
	#canvas = null;
	#scene = null;
	#camera = null;
	#renderer = null;
	#controls = null;
	#model = null;
	#clips = null;
	#mixer = null;
	#currentClip = null;
	#clock = null;
	
	constructor() {
		this.#canvas = document.getElementById('canvas');
		this.#scene = new THREE.Scene();
		this.#camera = new THREE.PerspectiveCamera(
			Constants.Camera.FOV,
			window.innerWidth / window.innerHeight,
			Constants.Camera.near,
			Constants.Camera.far,
		);
		this.#controls = new OrbitControls(this.#camera, this.#canvas);
		this.#clock = new THREE.Clock();

		this.#createRenderer();
		this.#createLighting();
	}
	
	#createRenderer() {
		this.#renderer = new THREE.WebGLRenderer({
			canvas: this.#canvas,
			antialias: Constants.Renderer.antialias,
			alpha: Constants.Renderer.alpha,
		});

		this.#renderer.setPixelRatio(window.devicePixelRatio);
		this.#renderer.setSize(window.innerWidth, window.innerHeight);

		this.#renderer.shadowMap.enabled =
			Constants.Renderer.ShadowMap.enabled;
		this.#renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	}
	
	#createLighting() {
		const {
			color: ambientColor,
			intensity: ambientIntensity,
		} = Constants.Lighting.Ambient;
		const {
			color: directionalColor,
			intensity: directionalIntensity,
			x: directionalX,
			y: directionalY,
			z: directionalZ,
			castShadow,
			Shadow,
		} = Constants.Lighting.Directional;

		const ambientLight = new THREE.AmbientLight(
			ambientColor, ambientIntensity);
		const directionalLight = new THREE.DirectionalLight(
			directionalColor, directionalIntensity);

		directionalLight.position.set(
			directionalX, directionalY, directionalZ);
		directionalLight.castShadow = castShadow;
		directionalLight.shadow.camera.near = Shadow.Camera.near;
		directionalLight.shadow.camera.far = Shadow.Camera.far;
		directionalLight.shadow.bias = Shadow.bias;

		this.#scene.add(ambientLight);
		this.#scene.add(directionalLight);
		this.#scene.add(directionalLight.target);
	}
	
	#addModel() {
		const loader = new GLTFLoader();
		
		return new Promise((resolve) => {
			loader.load(Constants.Model.path, (gltf) => {
				this.#model = gltf.scene;
				this.#clips = gltf.animations;
				this.#mixer = new THREE.AnimationMixer(this.#model);
				
				this.#model.rotation.y =
					Utils.getRadian(Constants.Model.Rotation.y);
				this.#model.position.y = Constants.Model.Position.y;
				this.#model.castShadow = Constants.Model.castShadow;
				this.#model.receiveShadow = Constants.Model.receiveShadow;
				
				this.#model.traverse((child) => {
					if (child.isMesh) {
						child.material.roughness = Constants.Model.roughness;
						child.material.metalness = Constants.Model.metalness;
						
						// child.material = new THREE.MeshPhongMaterial();
						// child.material = new THREE.MeshNormalMaterial();
						// child.material = new THREE.MeshToonMaterial();
						// child.material = new THREE.MeshBasicMaterial();
						// child.material = new THREE.MeshStandardMaterial();
						
						// child.material.flatShading = true;
						// console.log(child.material.flatShading)
						
						// const uv = child.geometry.getAttribute('uv');
						// const oldnormal = child.geometry.getAttribute('normal');
						
						// child.geometry.setAttribute('normal', uv);
						
						// --------------------
						
						// TODO: THIS IS THE CLOSEST I CAN GET!
						child.geometry.deleteAttribute('normal');
						// child.geometry.deleteAttribute('uv');
						
						// TODO: THIS IS THE CLOSEST I CAN GET!
						child.geometry = BufferGeometryUtils.mergeVertices(child.geometry);
						
						// TODO: THIS IS THE CLOSEST I CAN GET!
						child.geometry.computeVertexNormals();
						
						// --------------------
						
						// const normal = child.geometry.getAttribute('normal');
						
						// child.geometry.deleteAttribute('normal');
						
						// child.geometry.setAttribute('uv', normal);
						
						// child.geometry.computeVertexNormals();
						// child.geometry.normalizeNormals();
						
						// console.log(normal);
						// uv.needsUpdate = true;
						
						// child.geometry.computeTangents();
						// child.geometry.computeBoundingBox();
						// child.geometry.computeBoundingSphere();
						// child.geometry.normalizeNormals();
						
						// const normal = child.geometry.getAttribute('normal');
						// const uv = child.geometry.getAttribute('uv');
						
						// console.log(normal);
						// console.log(oldnormal, normal);
						// console.log(uv, child.geometry.getAttribute('uv'));
						// console.log(child);
						
						// child.castShadow = Constants.Model.castShadow;
						// child.receiveShadow = Constants.Model.receiveShadow;
					}
				});

				this.#scene.add(this.#model);

				resolve();
			}, undefined, (error) => {
				console.error(error);
			});
		});
	}
	
	#stopAnimation() {
		const clip = THREE.AnimationClip.findByName(this.#clips, this.#currentClip);
		const action = this.#mixer.clipAction(clip);
		
		action.stop();
	}
	
	#playAnimation(name, isLoop) {
		this.#currentClip = name;

		const clip = THREE.AnimationClip.findByName(this.#clips, name);
		const action = this.#mixer.clipAction(clip);
		
		if (isLoop) {
			action.setLoop(THREE.LoopRepeat);
		} else {
			action.setLoop(THREE.LoopOnce);
		}
		
		action.clampWhenFinished = true;
		action.play();
	}
	
	#render() {
		this.#renderer.render(this.#scene, this.#camera);
	}
	
	#update() {
		requestAnimationFrame(this.#update.bind(this));

		const delta = this.#clock.getDelta();
		
		this.#controls.update();
		this.#mixer.update(delta);

		this.#render();
	}
	
	// Syntax highlighting of "async" in private property?
	async #initialize() {
		await this.#addModel();

		this.resize();

		this.#camera.position.z = Constants.Camera.Position.z;
		this.#controls.update();

		this.#update();

		this.#playAnimation(Constants.Animations.Clips.idle, true);
		
		this.#mixer.addEventListener('finished', () => {
			this.#stopAnimation();
			this.#playAnimation(Constants.Animations.Clips.idle, true);
		});
	}
	
	resize() {
		this.#camera.aspect = window.innerWidth / window.innerHeight;
		this.#camera.updateProjectionMatrix();

		this.#renderer.setSize(window.innerWidth, window.innerHeight);
	}
	
	praise() {
		this.#stopAnimation();
		this.#playAnimation(Constants.Animations.Clips.happy, false);
	}
	
	feed() {
		this.#stopAnimation();
		this.#playAnimation(Constants.Animations.Clips.eat, false);
	}
	
	main() {
		this.#initialize();
	}
}

const praiseButton = document.getElementById('praise');
const feedButton = document.getElementById('feed');
const spideleton = new Spideleton();

spideleton.main();

praiseButton.addEventListener('click', () => {
	spideleton.praise();
});

feedButton.addEventListener('click', () => {
	spideleton.feed();
});

window.addEventListener('resize', () => {
	spideleton.resize();
});