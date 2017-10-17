/**
 * Created by huzikang on 17/10/17.
 */
import config from './libs/config.js';

document.addEventListener('DOMContentLoaded', () => {
    if (!SPAR.checkBrowser()) {
        let res = confirm('检测到不支持的浏览器，可能无法正常运行，是否继续？');
        if (!res) return;
    }

    // Disables scrolling. Change as you need.
    document.ontouchmove = e => e.preventDefault();

    let info = document.getElementById('info');
    let container = document.getElementById('container');
    let playButton = document.getElementById('play');
    playButton.disabled = true;
    playButton.innerHTML = '载入中...';
    let img = document.createElement('img');

    let videoWidth = 320;
    let videoHeight = 240;
    if (SPAR.browser.ios) {
        // iOS camera doesn't support low resolution
        videoWidth = 640;
        videoHeight = 480;
    }
    let containerWidth = container.clientWidth;
    let containerHeight = container.clientHeight;

    let videoDevice = new SPAR.VideoDevice({
        width: containerWidth,
        height: containerHeight
    });
    let constraint = {
        audio: false,
        video: { width: videoWidth, height: videoHeight, facingMode: 'environment' }
    };
    videoDevice.setVideoSource(new SPAR.CameraVideoSource(constraint))
        .then(() => {
            console.log('video size', videoDevice.videoWidth, videoDevice.videoHeight);
            console.log('video element size', videoDevice.width, videoDevice.height);

            // resize video element size according to container size
            // while maintaining aspect ratio
            let ratio = videoDevice.videoWidth / videoDevice.videoHeight;
            if (videoDevice.width < videoDevice.height) {
                videoDevice.width = videoDevice.height * ratio;
            } else {
                videoDevice.height = videoDevice.width / ratio;
            }

            playButton.disabled = false;
            playButton.innerHTML = '开始';
        })
        .catch(err => {
            console.log('error', err);
            alert(`${err.name} : ${err.message}`);
            playButton.innerHTML = '载入失败';
        });

    playButton.onclick = () => {
        playButton.style.display = 'none';
        videoDevice.play()
            .then(() => {
                let renderer = new SPAR.THREERenderer(videoDevice);
                container.appendChild(renderer.domElement);
                // center renderer dom element in container
                let widthOffset = (containerWidth-videoDevice.width)/2;
                let heightOffset = (containerHeight-videoDevice.height)/2;
                renderer.domElement.style.marginLeft = widthOffset;
                renderer.domElement.style.marginTop = heightOffset;

                let scene = renderer.scene;

                let geometry = new THREE.BoxGeometry(1, 1, 1);
                let material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
                let cube = new THREE.Mesh(geometry, material);
                cube.visible = false;
                scene.add(cube);

                let light = new THREE.SpotLight(0xffffff);
                light.position.z = 5;
                scene.add(light);

                renderer.start(() => {
                    // called on every frame update
                    if (cube.visible) {
                        cube.rotation.x += 0.01;
                        cube.rotation.y += 0.01;
                        cube.rotation.z += 0.01;
                    }
                });

                let recognizer = new SPAR.Recognizer(videoDevice);
                recognizer.start(config.recognizer, (err, res) => {
                    if (err) {
                        info.innerHTML = err.message;
                        cube.visible = false;
                    } else {
                        info.innerHTML = res.targetId;
                        cube.visible = true;
                        img.src = `data:image/jpeg;base64,${res.trackingImage}`;
                        let imgTexture = new THREE.Texture(img);
                        imgTexture.minFilter = THREE.LinearFilter;
                        imgTexture.magFilter = THREE.LinearFilter;
                        let imgMaterial = new THREE.MeshBasicMaterial({
                            map: imgTexture, depthTest: false, depthWrite: false
                        });
                        cube.material = imgMaterial;
                        imgTexture.needsUpdate = true;
                    }
                });
            })
            .catch(err => {
                console.log('error', err);
                alert(`${err.name} : ${err.message}`);
            });
    }

}, false);
