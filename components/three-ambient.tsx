'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function ThreeAmbient() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, mount.clientWidth / mount.clientHeight, 0.1, 120);
    camera.position.z = 9;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // Particle field
    const count = 220;
    const positions = new Float32Array(count * 3);
    const particleColors = new Float32Array(count * 3);
    const colorA = new THREE.Color('#5ef0ff');
    const colorB = new THREE.Color('#8b5cf6');

    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 22;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      const c = colorA.clone().lerp(colorB, Math.random());
      particleColors[i * 3]     = c.r;
      particleColors[i * 3 + 1] = c.g;
      particleColors[i * 3 + 2] = c.b;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
    const pMat = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // Wireframe torus knot — dim accent
    const tkGeo = new THREE.TorusKnotGeometry(1.6, 0.22, 140, 20);
    const tkMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#63d4ff'),
      wireframe: true,
      transparent: true,
      opacity: 0.07,
    });
    const tk = new THREE.Mesh(tkGeo, tkMat);
    tk.position.set(4, -1, -3);
    scene.add(tk);

    // Large orbital ring
    const rGeo = new THREE.TorusGeometry(4.0, 0.012, 12, 140);
    const rMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#8b5cf6'),
      transparent: true,
      opacity: 0.1,
    });
    const ring = new THREE.Mesh(rGeo, rMat);
    ring.rotation.x = Math.PI / 3.5;
    ring.position.set(-2.5, 0.5, -2);
    scene.add(ring);

    // Second ring — cyan
    const rGeo2 = new THREE.TorusGeometry(2.6, 0.008, 12, 100);
    const rMat2 = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#5ef0ff'),
      transparent: true,
      opacity: 0.08,
    });
    const ring2 = new THREE.Mesh(rGeo2, rMat2);
    ring2.rotation.x = Math.PI / 5;
    ring2.rotation.y = Math.PI / 4;
    ring2.position.set(3, 1.5, -1);
    scene.add(ring2);

    let frame = 0;
    const animate = () => {
      particles.rotation.y += 0.0007;
      particles.rotation.x += 0.0002;
      tk.rotation.x += 0.003;
      tk.rotation.y += 0.005;
      ring.rotation.z  += 0.0012;
      ring2.rotation.z += 0.0018;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };

    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };

    window.addEventListener('resize', onResize);
    animate();

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(frame);
      pGeo.dispose(); pMat.dispose();
      tkGeo.dispose(); tkMat.dispose();
      rGeo.dispose(); rMat.dispose();
      rGeo2.dispose(); rMat2.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="pointer-events-none absolute inset-0 opacity-65" />;
}
