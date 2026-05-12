import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const viewStates = {
  1: { cameraY: 0, cameraZ: 1.86, globeY: -0.98 },
  2: { cameraY: 0, cameraZ: 2.95, globeY: 0 },
  3: { cameraY: 0, cameraZ: 2.2, globeY: 1.05 }
};

function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function GlobeScene() {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;

    if (!host) {
      return undefined;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040a16);

    const camera = new THREE.PerspectiveCamera(44, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, viewStates[1].cameraZ);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.replaceChildren(renderer.domElement);

    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(1, 128, 128),
      new THREE.MeshStandardMaterial({
        map: new THREE.TextureLoader().load('https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg'),
        roughness: 0.9,
        metalness: 0.02
      })
    );
    scene.add(globe);

    scene.add(new THREE.AmbientLight(0xffffff, 0.34));

    const sun = new THREE.DirectionalLight(0xffffff, 1.28);
    sun.position.set(4.5, 2.5, 3.2);
    scene.add(sun);

    const fill = new THREE.DirectionalLight(0x58a8ff, 0.22);
    fill.position.set(-3.2, -1.3, -2.6);
    scene.add(fill);

    let activeViewport = 1;
    const current = { cameraY: viewStates[1].cameraY, cameraZ: viewStates[1].cameraZ, globeY: viewStates[1].globeY };
    const target = { ...current };

    const setTargetByViewport = () => {
      const view = viewStates[activeViewport] || viewStates[1];
      target.cameraY = view.cameraY;
      target.cameraZ = view.cameraZ;
      target.globeY = view.globeY;
    };

    const screens = Array.from(document.querySelectorAll('.home-screen'));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const viewportId = Number(entry.target.dataset.screen || '1');

        if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
          entry.target.classList.add('is-active');
          activeViewport = viewportId;
          setTargetByViewport();
        } else {
          entry.target.classList.remove('is-active');
        }
      });
    }, { threshold: [0.55] });

    screens.forEach(screen => observer.observe(screen));

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      setTargetByViewport();
    };

    window.addEventListener('resize', onResize);

    let animationFrame = 0;

    const animate = () => {
      current.cameraY = lerp(current.cameraY, target.cameraY, 0.08);
      current.cameraZ = lerp(current.cameraZ, target.cameraZ, 0.08);
      current.globeY = lerp(current.globeY, target.globeY, 0.08);

      camera.position.y = current.cameraY;
      camera.position.z = current.cameraZ;
      globe.position.y = current.globeY;
      globe.rotation.y += 0.0022;

      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(animate);
    };

    setTargetByViewport();
    animate();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', onResize);
      observer.disconnect();
      renderer.dispose();
      globe.geometry.dispose();
      globe.material.dispose();
      host.replaceChildren();
    };
  }, []);

  return (
    <div id="sceneLayer" aria-hidden="true">
      <div id="globeCanvas" ref={hostRef} />
      <div className="vignette" />
    </div>
  );
}