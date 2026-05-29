import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Simple sphere representing Earth
function Earth() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  // Create dot pattern for Earth
  const dots = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const count = 2000;
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = 2;
      points.push(new THREE.Vector3(
        r * Math.cos(theta) * Math.sin(phi),
        r * Math.sin(theta) * Math.sin(phi),
        r * Math.cos(phi)
      ));
    }
    return points;
  }, []);

  return (
    <group>
      {/* Wireframe sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshBasicMaterial color="#0B1020" wireframe transparent opacity={0.3} />
      </mesh>
      
      {/* Dots */}
      <points ref={(obj) => {
        if (obj) {
          const geometry = new THREE.BufferGeometry();
          const positions = new Float32Array(dots.flatMap(p => [p.x, p.y, p.z]));
          geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
          obj.geometry = geometry;
        }
      }}>
        <pointsMaterial color="#4F6DF5" size={0.03} transparent opacity={0.8} />
      </points>

      {/* Glowing atmosphere */}
      <mesh>
        <sphereGeometry args={[2.1, 64, 64]} />
        <meshBasicMaterial color="#4F6DF5" transparent opacity={0.05} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

// Arcs connecting points
function Arcs() {
  const arcsRef = useRef<THREE.Group>(null);
  
  const arcCurves = useMemo(() => {
    const curves: THREE.QuadraticBezierCurve3[] = [];
    const pairs = [
      [[34, -118], [31, 121]],
      [[40, -74], [51, 0]],
      [[1, 104], [-33, 151]],
      [[35, 140], [51, 0]],
      [[25, 55], [6, 3]],
    ];
    
    pairs.forEach(([start, end]) => {
      const startVec = new THREE.Vector3(
        2 * Math.cos(start[1] * Math.PI / 180) * Math.cos(start[0] * Math.PI / 180),
        2 * Math.sin(start[0] * Math.PI / 180),
        2 * Math.sin(start[1] * Math.PI / 180) * Math.cos(start[0] * Math.PI / 180)
      );
      const endVec = new THREE.Vector3(
        2 * Math.cos(end[1] * Math.PI / 180) * Math.cos(end[0] * Math.PI / 180),
        2 * Math.sin(end[0] * Math.PI / 180),
        2 * Math.sin(end[1] * Math.PI / 180) * Math.cos(end[0] * Math.PI / 180)
      );
      const mid = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5).normalize().multiplyScalar(2.8);
      curves.push(new THREE.QuadraticBezierCurve3(startVec, mid, endVec));
    });
    return curves;
  }, []);

  useFrame((state) => {
    if (arcsRef.current) {
      arcsRef.current.children.forEach((child, i) => {
        const material = (child as THREE.Line).material as THREE.LineBasicMaterial;
        material.opacity = 0.5 + 0.3 * Math.sin(state.clock.elapsedTime * 2 + i);
      });
    }
  });

  return (
    <group ref={arcsRef}>
      {arcCurves.map((curve, i) => (
        <line key={i}>
          <bufferGeometry setFromPoints={curve.getPoints(50)} />
          <lineBasicMaterial color="#4F6DF5" transparent opacity={0.6} />
        </line>
      ))}
    </group>
  );
}

const Globe3D = () => {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display font-bold text-2xl text-text-primary">3D Globe View</h1>
        <p className="text-sm text-text-secondary mt-1">Interactive global shipment visualization</p>
      </div>

      <div className="card-surface overflow-hidden" style={{ height: '70vh' }}>
        <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={0.5} />
          <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
          <Earth />
          <Arcs />
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={3}
            maxDistance={10}
            autoRotate
            autoRotateSpeed={0.5}
          />
        </Canvas>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card-surface p-4 text-center">
          <p className="font-display font-bold text-xl text-cobalt">2.4M</p>
          <p className="text-xs text-text-secondary">Active Routes</p>
        </div>
        <div className="card-surface p-4 text-center">
          <p className="font-display font-bold text-xl text-emerald-400">120+</p>
          <p className="text-xs text-text-secondary">Countries</p>
        </div>
        <div className="card-surface p-4 text-center">
          <p className="font-display font-bold text-xl text-amber-400">99.7%</p>
          <p className="text-xs text-text-secondary">Uptime</p>
        </div>
      </div>
    </div>
  );
};

export default Globe3D;
