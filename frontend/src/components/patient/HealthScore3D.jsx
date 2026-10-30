import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Torus, Float, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function Ring({ score }) {
  const mesh = useRef();
  
  // Map score to color
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';
  
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.z = state.clock.getElapsedTime() * 0.5;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <Torus 
        ref={mesh} 
        args={[3, 0.4, 16, 100]} 
        rotation={[Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={0.5} 
          roughness={0.2}
          metalness={0.8}
        />
      </Torus>
    </Float>
  );
}

export default function HealthScore3D({ score }) {
  return (
    <div className="h-[300px] w-full relative">
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} />
        
        <Ring score={score} />
        
        <OrbitControls enableZoom={false} makeDefault />
      </Canvas>
      
      {/* Centered Score Display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-6xl font-display font-black text-white">{score}</span>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Health Score</span>
      </div>
    </div>
  );
}
