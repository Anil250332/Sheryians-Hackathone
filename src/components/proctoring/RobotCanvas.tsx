import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Sparkles } from 'lucide-react';

export const RobotCanvas: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera: Sized and positioned with ample room to view head, body and arms
    const width = container.clientWidth || 380;
    const height = container.clientHeight || 360;
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0.05, 3.8);
    camera.lookAt(0, 0, 0);

    // 3. Renderer with high performance & transparent background
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // 4. Studio Lighting matching the sleek dark reference look
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    // Top-front key light creates specular shine on the robot head
    const frontKey = new THREE.DirectionalLight(0xffffff, 2.8);
    frontKey.position.set(0.5, 3.5, 3.5);
    scene.add(frontKey);

    // Left and Right soft rim lights
    const leftRim = new THREE.DirectionalLight(0xffffff, 1.8);
    leftRim.position.set(-3.5, 1.5, 1.5);
    scene.add(leftRim);

    const rightRim = new THREE.DirectionalLight(0xffffff, 1.8);
    rightRim.position.set(3.5, 1.5, 1.5);
    scene.add(rightRim);

    // Soft underglow
    const underGlow = new THREE.PointLight(0xa855f7, 1.6, 5);
    underGlow.position.set(0, -1.8, 1.2);
    scene.add(underGlow);

    // 5. Robot Hierarchy
    const robotGroup = new THREE.Group();
    scene.add(robotGroup);

    const pivotGroup = new THREE.Group();
    robotGroup.add(pivotGroup);

    let headNode: THREE.Object3D | null = null;
    const initialHeadRot = new THREE.Euler();
    let isModelReady = false;

    // 6. Smooth Mouse Coordinates
    const mouse = {
      targetX: 0,
      targetY: 0,
      currentX: 0,
      currentY: 0,
    };

    const handleMouseMove = (event: MouseEvent) => {
      // Screen-wide normalized coordinates (-1 to 1)
      mouse.targetX = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        mouse.targetX = (touch.clientX / window.innerWidth) * 2 - 1;
        mouse.targetY = -(touch.clientY / window.innerHeight) * 2 + 1;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // 7. Materials matching reference image (Matte Black + Glowing White Neon)
    const glowingNeonWhite = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 5.0,
      roughness: 0.1,
      metalness: 0.05,
      toneMapped: false,
    });

    const glowingEarWhite = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 4.0,
      roughness: 0.12,
      metalness: 0.05,
      toneMapped: false,
    });

    const glossyFaceScreen = new THREE.MeshStandardMaterial({
      color: 0x07080b,
      roughness: 0.06,
      metalness: 0.85,
    });

    const matteBlackBody = new THREE.MeshStandardMaterial({
      color: 0x141518,
      roughness: 0.28,
      metalness: 0.18,
    });

    const whiteAccentMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xe6edf8,
      emissiveIntensity: 1.2,
      roughness: 0.22,
      metalness: 0.1,
    });

    const innerChestCore = new THREE.MeshStandardMaterial({
      color: 0x090a0d,
      roughness: 0.45,
      metalness: 0.1,
    });

    // 8. Load GLTF
    const loader = new GLTFLoader();
    loader.load(
      '/genkub_greeting_robot.gltf',
      (gltf) => {
        const model = gltf.scene;

        // Disable any embedded lights or cameras from the GLTF
        model.traverse((child) => {
          if (child instanceof THREE.Light || child instanceof THREE.Camera) {
            child.visible = false;
          }
        });

        // Apply authentic materials to each mesh
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            const name = (mesh.name || mesh.parent?.name || '').toLowerCase();

            if (name.includes('eye')) {
              mesh.material = glowingNeonWhite;
            } else if (name.includes('mouth')) {
              mesh.material = glowingNeonWhite;
            } else if (name.includes('circle_1') || (name.includes('body_circle') && !name.includes('circle_2'))) {
              mesh.material = glowingNeonWhite;
            } else if (name.includes('circle_2')) {
              mesh.material = innerChestCore;
            } else if (name === 'head_2') {
              mesh.material = glossyFaceScreen;
            } else if (name.includes('ear') || name === 'cylinder002') {
              mesh.material = glowingEarWhite;
            } else if (name.includes('hand') || name.includes('forearm')) {
              mesh.material = whiteAccentMaterial;
            } else {
              mesh.material = matteBlackBody;
            }
          }
        });

        // Find Head node - ONLY the head will swivel to track the cursor!
        headNode = model.getObjectByName('Head') || null;
        if (headNode) {
          initialHeadRot.copy(headNode.rotation);
        }

        // Base orientation: Face forward (-PI/2 around Y)
        model.rotation.y = -Math.PI / 2;
        model.updateMatrixWorld(true);

        // Auto-center model geometry precisely
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Center on X and Z, and place Y comfortably to frame head and chest
        model.position.x = -center.x;
        model.position.y = -center.y - 0.12;
        model.position.z = -center.z;

        pivotGroup.add(model);

        // Scale nicely so robot is compact and fits gracefully inside card
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetScale = 2.05 / maxDim;
        robotGroup.scale.set(targetScale, targetScale, targetScale);

        isModelReady = true;
        setLoading(false);
      },
      (xhr) => {
        if (xhr.total > 0) {
          const percent = Math.round((xhr.loaded / xhr.total) * 100);
          setLoadProgress(percent);
        }
      },
      (error) => {
        console.error('Error loading robot GLTF:', error);
        setLoading(false);
      }
    );

    // 9. Resize Handling
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // 10. Animation Loop: ONLY the Head/Face tracks the cursor; body stays naturally grounded
    let animationFrameId: number;
    let lastTime = performance.now();
    const startTime = performance.now();

    const animate = (currentTime = performance.now()) => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth, natural fluid interpolation
      const delta = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;
      const lerpSpeed = 6.0 * delta;

      mouse.currentX += (mouse.targetX - mouse.currentX) * lerpSpeed;
      mouse.currentY += (mouse.targetY - mouse.currentY) * lerpSpeed;

      const time = (currentTime - startTime) / 1000;

      if (isModelReady) {
        // Subtle natural idle breathing float on the entire robot
        robotGroup.position.y = Math.sin(time * 1.8) * 0.025;

        // BODY REMAINS GROUNDED AND STABLE (No full body spin)
        robotGroup.rotation.set(0, 0, 0);

        // ONLY THE HEAD / FACE SWIVELS NATURALLY TOWARDS THE CURSOR
        if (headNode) {
          // Yaw: Turn face left/right towards mouse cursor (capped at natural neck range ±25 deg)
          headNode.rotation.y = initialHeadRot.y + mouse.currentX * 0.45;

          // Pitch: Tilt head up/down towards mouse cursor (capped at natural neck range ±16 deg)
          headNode.rotation.z = initialHeadRot.z + mouse.currentY * 0.28;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // 11. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      resizeObserver.disconnect();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.geometry?.dispose();
        }
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none overflow-hidden">
      {/* Loading Indicator */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 z-10 bg-slate-950/60 backdrop-blur-sm rounded-2xl">
          <div className="relative w-8 h-8">
            <div className="w-8 h-8 rounded-full border-2 border-purple-500/20 border-t-purple-400 animate-spin" />
            <Sparkles className="w-3.5 h-3.5 text-purple-400 absolute inset-0 m-auto animate-pulse" />
          </div>
          <div className="text-[11px] font-mono text-purple-300 font-medium">
            Loading AI Bot... {loadProgress > 0 ? `${loadProgress}%` : ''}
          </div>
        </div>
      )}

      {/* Canvas */}
      <div ref={mountRef} className="w-full h-full flex items-center justify-center" />
    </div>
  );
};
