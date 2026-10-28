"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles, TorusKnot } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function Art() {
  const a = useRef<THREE.Mesh>(null);
  const b = useRef<THREE.Mesh>(null);

  useFrame((_, d) => {
    if (a.current) {
      a.current.rotation.x += d * 0.13;
      a.current.rotation.y += d * 0.2;
    }

    if (b.current) {
      b.current.rotation.z += d * 0.16;
      b.current.rotation.x -= d * 0.1;
    }
  });

  return (
    <group>
      <Float
        speed={1.2}
        rotationIntensity={0.25}
        floatIntensity={0.65}
      >
        <mesh ref={a}>
          <icosahedronGeometry args={[1.25, 2]} />
          <meshStandardMaterial
            color="#8b5cf6"
            metalness={0.8}
            roughness={0.18}
            wireframe
          />
        </mesh>

        <mesh ref={b} scale={0.72}>
          <icosahedronGeometry args={[1.25, 1]} />
          <meshPhysicalMaterial
            color="#67e8f9"
            metalness={0.55}
            roughness={0.12}
            transparent
            opacity={0.72}
          />
        </mesh>

        <TorusKnot args={[1.72, 0.018, 180, 8, 2, 5]}>
          <meshStandardMaterial
            color="#c4b5fd"
            metalness={0.7}
            roughness={0.25}
          />
        </TorusKnot>
      </Float>

      <Sparkles
        count={90}
        scale={7}
        size={2.4}
        speed={0.25}
        color="#c4b5fd"
      />
    </group>
  );
}

export default function ThreeScene() {
  return (
    <div
      className="absolute inset-0 opacity-90"
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 6.8], fov: 42 }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={1.25} />

        <pointLight
          position={[4, 3, 4]}
          intensity={22}
          color="#a78bfa"
        />

        <pointLight
          position={[-4, -2, 2]}
          intensity={14}
          color="#67e8f9"
        />

        <Art />
      </Canvas>
    </div>
  );
}