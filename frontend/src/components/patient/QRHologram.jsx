import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox, Float, useTexture } from '@react-three/drei';
import { QRCodeSVG } from 'qrcode.react';

function HologramCard({ qrUrl }) {
  const mesh = useRef();
  
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = Math.sin(state.clock.getElapsedTime()) * 0.2;
      mesh.current.rotation.x = Math.cos(state.clock.getElapsedTime()) * 0.1;
    }
  });

  return (
    <Float speed={3} rotationIntensity={0.5} floatIntensity={1}>
      <RoundedBox 
        ref={mesh} 
        args={[4, 6, 0.2]} 
        radius={0.2} 
        smoothness={4}
      >
        <meshStandardMaterial 
          color="#1e293b" 
          metalness={0.9} 
          roughness={0.1} 
          emissive="#0ea5e9" 
          emissiveIntensity={0.2}
        />
      </RoundedBox>
    </Float>
  );
}

export default function QRHologram({ value }) {
  return (
    <div className="h-[400px] w-full relative group">
      <Canvas camera={{ position: [0, 0, 12], fov: 40 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} />
        
        <HologramCard />
      </Canvas>
      
      {/* Overlay QR Code */}
      <div className="absolute inset-0 flex items-center justify-center p-12">
        <div className="relative p-6 glass-card border-brand-500/30 animate-hologram bg-slate-900/80">
          <QRCodeSVG 
            value={value} 
            size={180} 
            bgColor="transparent" 
            fgColor="#0ea5e9"
            level="H"
            includeMargin={false}
          />
          
          {/* Scanning Line Animation */}
          <div className="absolute inset-x-0 h-1 bg-brand-500/50 blur-[2px] animate-[scan_3s_ease-in-out_infinite]" />
        </div>
      </div>
      
      <style>{`
        @keyframes scan {
          0%, 100% { top: 0%; opacity: 0; }
          10%, 90% { opacity: 1; }
          50% { top: 100%; opacity: 1; }
        }
      `}</style>
    </div>
  );
}
