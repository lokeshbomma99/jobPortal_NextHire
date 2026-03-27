import { Canvas } from "@react-three/fiber";
import { Float, OrbitControls, MeshDistortMaterial, Sphere, MeshWobbleMaterial } from "@react-three/drei";
import { Suspense } from "react";

export default function ThreeDModel() {
    return (
        <div className="w-full h-[400px] md:h-full relative overflow-hidden">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <ambientLight intensity={1} />
                <directionalLight position={[2, 1, 1]} intensity={2} />

                <Suspense fallback={null}>
                    <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
                        <Sphere args={[1.5, 64, 64]} scale={1}>
                            <MeshDistortMaterial
                                color="#e94560"
                                speed={4}
                                distort={0.4}
                                radius={1}
                            />
                        </Sphere>
                    </Float>

                    <Float speed={1.5} rotationIntensity={1} floatIntensity={1.5}>
                        <mesh position={[-2, 1, -1]} rotation={[0.5, 0.5, 0.5]}>
                            <boxGeometry args={[0.5, 0.5, 0.5]} />
                            <MeshWobbleMaterial color="#1a1a2e" speed={2} factor={0.6} />
                        </mesh>
                    </Float>

                    <Float speed={3} rotationIntensity={2} floatIntensity={1}>
                        <mesh position={[2, -1, 0]} rotation={[1, 0, 1]}>
                            <octahedronGeometry args={[0.6]} />
                            <MeshDistortMaterial color="#0f3460" speed={1} distort={0.2} />
                        </mesh>
                    </Float>
                </Suspense>

                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
            </Canvas>
        </div>
    );
}
