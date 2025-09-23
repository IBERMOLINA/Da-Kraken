import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Center, Environment, PerspectiveCamera } from '@react-three/drei';
import styled from 'styled-components';
import { Symbol3D } from './Symbol3D';

const Logo3DContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  height: 60px;
`;

const LogoCanvasContainer = styled.div`
  width: 80px;
  height: 60px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const LogoTextContainer = styled.div`
  width: 120px;
  height: 60px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const StyledCanvas = styled(Canvas)`
  width: 100%;
  height: 100%;
  border-radius: 10px;
`;

// Animated logo symbol - a complex geometric form
const LogoSymbol = () => {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
      groupRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group ref={groupRef}>
        {/* Central core - octahedron */}
        <mesh position={[0, 0, 0]}>
          <octahedronGeometry args={[0.8]} />
          <meshStandardMaterial
            color="#00ff88"
            emissive="#00ff88"
            emissiveIntensity={0.3}
            metalness={0.9}
            roughness={0.1}
            transparent
            opacity={0.9}
          />
        </mesh>
        
        {/* Orbiting elements */}
        <mesh position={[1.5, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
          <tetrahedronGeometry args={[0.3]} />
          <meshStandardMaterial
            color="#4ecdc4"
            emissive="#4ecdc4"
            emissiveIntensity={0.2}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        
        <mesh position={[-1.5, 0, 0]} rotation={[Math.PI / 4, 0, 0]}>
          <tetrahedronGeometry args={[0.3]} />
          <meshStandardMaterial
            color="#ff6b6b"
            emissive="#ff6b6b"
            emissiveIntensity={0.2}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        
        <mesh position={[0, 1.5, 0]} rotation={[0, Math.PI / 4, Math.PI / 4]}>
          <tetrahedronGeometry args={[0.3]} />
          <meshStandardMaterial
            color="#ffa500"
            emissive="#ffa500"
            emissiveIntensity={0.2}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        
        <mesh position={[0, -1.5, 0]} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
          <tetrahedronGeometry args={[0.3]} />
          <meshStandardMaterial
            color="#9c27b0"
            emissive="#9c27b0"
            emissiveIntensity={0.2}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        
        {/* Energy rings */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2, 0.05, 8, 32]} />
          <meshStandardMaterial
            color="#00ff88"
            emissive="#00ff88"
            emissiveIntensity={0.4}
            transparent
            opacity={0.6}
          />
        </mesh>
        
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[2.2, 0.03, 8, 32]} />
          <meshStandardMaterial
            color="#4ecdc4"
            emissive="#4ecdc4"
            emissiveIntensity={0.3}
            transparent
            opacity={0.4}
          />
        </mesh>
      </group>
    </Float>
  );
};

// 3D Text component for "xomni" - simplified without Text3D dependency
const LogoText3D = () => {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <Float speed={1} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={groupRef}>
        {/* Create letter-like geometric shapes */}
        {/* X */}
        <mesh position={[-2, 0, 0]}>
          <boxGeometry args={[0.3, 1.5, 0.1]} />
          <meshStandardMaterial
            color="#00ff88"
            emissive="#00ff88"
            emissiveIntensity={0.2}
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
        <mesh position={[-2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[0.3, 1.5, 0.1]} />
          <meshStandardMaterial
            color="#00ff88"
            emissive="#00ff88"
            emissiveIntensity={0.2}
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
        
        {/* O */}
        <mesh position={[-0.5, 0, 0]}>
          <torusGeometry args={[0.4, 0.15, 8, 16]} />
          <meshStandardMaterial
            color="#4ecdc4"
            emissive="#4ecdc4"
            emissiveIntensity={0.2}
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
        
        {/* M */}
        <mesh position={[1, 0, 0]}>
          <coneGeometry args={[0.6, 1.5, 3]} />
          <meshStandardMaterial
            color="#ff6b6b"
            emissive="#ff6b6b"
            emissiveIntensity={0.2}
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
        
        {/* N */}
        <mesh position={[2.2, 0, 0]}>
          <octahedronGeometry args={[0.5]} />
          <meshStandardMaterial
            color="#ffa500"
            emissive="#ffa500"
            emissiveIntensity={0.2}
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
        
        {/* I */}
        <mesh position={[3.2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 1.5, 8]} />
          <meshStandardMaterial
            color="#9c27b0"
            emissive="#9c27b0"
            emissiveIntensity={0.2}
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
      </group>
    </Float>
  );
};

export const Logo3D = () => {
  return (
    <Logo3DContainer>
      {/* Logo Symbol */}
      <LogoCanvasContainer>
        <StyledCanvas>
          <Suspense fallback={null}>
            <PerspectiveCamera makeDefault position={[0, 0, 6]} />
            
            <ambientLight intensity={0.2} />
            <directionalLight
              position={[2, 2, 2]}
              intensity={0.5}
              color="#ffffff"
            />
            
            {/* Multiple colored point lights for dynamic lighting */}
            <pointLight position={[2, 0, 2]} color="#00ff88" intensity={0.5} />
            <pointLight position={[-2, 0, 2]} color="#4ecdc4" intensity={0.3} />
            <pointLight position={[0, 2, 2]} color="#ff6b6b" intensity={0.3} />
            
            <Environment preset="studio" />
            <LogoSymbol />
          </Suspense>
        </StyledCanvas>
      </LogoCanvasContainer>
      
      {/* Logo Text - fallback to regular text if 3D font fails */}
      <LogoTextContainer>
        <StyledCanvas>
          <Suspense fallback={
            <div style={{
              color: '#00ff88',
              fontSize: '24px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textShadow: '0 0 10px rgba(0, 255, 136, 0.5)'
            }}>
              xomni
            </div>
          }>
            <PerspectiveCamera makeDefault position={[0, 0, 4]} />
            
            <ambientLight intensity={0.3} />
            <directionalLight position={[1, 1, 1]} intensity={0.5} />
            <pointLight position={[0, 0, 2]} color="#00ff88" intensity={0.6} />
            
            <Environment preset="studio" />
            <LogoText3D />
          </Suspense>
        </StyledCanvas>
      </LogoTextContainer>
    </Logo3DContainer>
  );
};