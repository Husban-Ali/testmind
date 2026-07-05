import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Stars, MeshDistortMaterial } from "@react-three/drei";

function FloatingSphere({ position, color, scale = 1, speed = 1 }) {
  const meshRef = useRef();

  useFrame((state) => {
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.2 * speed;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.3 * speed;
  });

  return (
    <Float speed={speed * 1.5} rotationIntensity={0.4} floatIntensity={0.8}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <sphereGeometry args={[1, 32, 32]} />
        <MeshDistortMaterial color={color} distort={0.4} speed={2} roughness={0.1} metalness={0.8} />
      </mesh>
    </Float>
  );
}

export function HeroScene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={2} color="#7C3AED" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#2563EB" />
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
      <FloatingSphere position={[3, 1, -2]} color="#7C3AED" scale={1.5} speed={0.8} />
      <FloatingSphere position={[-3, -1, -3]} color="#2563EB" scale={1} speed={1.2} />
      <FloatingSphere position={[0, 2.5, -4]} color="#10B981" scale={0.7} speed={1.5} />
      <FloatingSphere position={[-2, 1.5, -1]} color="#F59E0B" scale={0.5} speed={2} />
      <FloatingSphere position={[2, -2, -2]} color="#EC4899" scale={0.6} speed={0.9} />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.3} />
    </>
  );
}
