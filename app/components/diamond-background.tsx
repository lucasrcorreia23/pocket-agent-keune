'use client';

import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import {
  Caustics,
  CubeCamera,
  Environment,
  MeshRefractionMaterial,
  useGLTF,
} from '@react-three/drei';
import { Suspense, useMemo, useRef, useState } from 'react';
import { EquirectangularReflectionMapping, type BufferGeometry, type Group } from 'three';
import { RGBELoader } from 'three-stdlib';

function useFirstGeometry(nodes: Record<string, unknown>) {
  return useMemo(() => {
    const values = Object.values(nodes) as Array<{ geometry?: BufferGeometry }>;
    const match = values.find((value) => value?.geometry);
    return match?.geometry ?? null;
  }, [nodes]);
}

function DiamondMesh({ envTexture }: { envTexture: ReturnType<typeof useLoader> }) {
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const hoverLightRef = useRef<Group>(null);
  const { nodes } = useGLTF('/dflat.glb') as { nodes: Record<string, unknown> };
  const geometry = useFirstGeometry(nodes);
  useMemo(() => {
    envTexture.mapping = EquirectangularReflectionMapping;
    envTexture.needsUpdate = true;
  }, [envTexture]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.15;
    if (hoverLightRef.current) {
      const targetX = state.pointer.x * 1.4;
      const targetY = -0.6 + state.pointer.y * 0.6;
      hoverLightRef.current.position.x += (targetX - hoverLightRef.current.position.x) * 0.15;
      hoverLightRef.current.position.y += (targetY - hoverLightRef.current.position.y) * 0.15;
    }
  });

  if (!geometry) return null;

  return (
    <CubeCamera resolution={256} frames={1} envMap={envTexture}>
      {(texture) => (
        <group ref={groupRef} position={[0, -1, 0]}>
          <group ref={hoverLightRef} position={[0, -0.6, 1.1]}>
            <pointLight
              color="#cfe3ff"
              intensity={hovered ? 6 : 0}
              distance={2.5}
              decay={2}
            />
          </group>
          <pointLight
            color="#d6e9ff"
            intensity={hovered ? 24 : 20}
            distance={6}
            decay={2}
            position={[0.6, -0.9, 0.8]}
          />
          <pointLight
            color="#d6e9ff"
            intensity={hovered ? 17 : 14}
            distance={6}
            decay={2}
            position={[-0.6, -0.85, 0.6]}
          />
          <spotLight
            color="#d6e9ff"
            intensity={11}
            position={[0, -0.4, 2.4]}
            angle={0.4}
            penumbra={0.9}
            decay={1}
          />
          <Caustics
            causticsOnly={false}
            backside
            color="#cfe3ff"
            position={[0, -0.75, 0]}
            lightSource={[2.5, 3, 2]}
            worldRadius={0.1}
            ior={1.8}
            backsideIOR={1.1}
            intensity={hovered ? 0.26 : 0.22}
          >
            <mesh
              castShadow
              geometry={geometry}
              rotation={[0, 0, 0]}
              scale={1.8}
              onPointerEnter={() => setHovered(true)}
              onPointerLeave={() => setHovered(false)}
            >
              <MeshRefractionMaterial
                envMap={texture}
                bounces={2}
                aberrationStrength={0.004}
                ior={2.4}
                fresnel={0.6}
                color="#d6e9ff"
                toneMapped={false}
              />
            </mesh>
          </Caustics>
        </group>
      )}
    </CubeCamera>
  );
}

function DiamondScene() {
  const envTexture = useLoader(RGBELoader, '/peppermint_powerplant_2_4k.hdr');
  return (
    <>
      <color attach="background" args={['#f6f7fb']} />
      <ambientLight intensity={0.7 * Math.PI} color="#d6e9ff" />
      <spotLight
        decay={0}
        position={[4, 4, -8]}
        angle={0.18}
        penumbra={1}
        intensity={1.2}
      />
      <pointLight decay={0} position={[-8, -8, -8]} intensity={0.6} />
      <DiamondMesh envTexture={envTexture} />
      <Environment map={envTexture} />
    </>
  );
}

export function DiamondBackground() {
  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden">
      <div className="absolute w-[760px] h-[760px] bg-[#eef5ff] rounded-full blur-[150px] opacity-80 pointer-events-none" />
      <div className="absolute w-[980px] h-[980px] bg-[#e9f2ff] rounded-full blur-[220px] opacity-45 pointer-events-none" />
      <div className="absolute left-0 bottom-0 h-full w-56 bg-gradient-to-r from-[#e6f0ff] to-transparent opacity-90 pointer-events-none" />
      <div className="absolute right-0 bottom-0 h-full w-56 bg-gradient-to-l from-[#e6f0ff] to-transparent opacity-90 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none">
        <Canvas
          shadows
          camera={{ position: [-3.2, 0.5, 3.5], fov: 45 }}
          gl={{ alpha: true, antialias: true }}
          dpr={[1, 1.5]}
        >
          <Suspense fallback={<color attach="background" args={['#f6f7fb']} />}>
            <DiamondScene />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}

export function DiamondIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M12 2L2 9L12 22L22 9L12 2Z" fill="#ffffff" />
      <path d="M12 2L7 9H17L12 2Z" fill="#e2e8f0" opacity="0.9" />
      <path d="M7 9L12 22L2 9H7Z" fill="#cbd5f5" opacity="0.8" />
    </svg>
  );
}
