"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { ThemeId } from "@/lib/types";
import { getTheme, type ThemeForest3D } from "@/lib/themes";

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type TreeSpec = {
  x: number;
  z: number;
  scale: number;
  phase: number;
  speed: number;
  tint: THREE.Color;
  lean: number;
};

function buildTrees(count: number, foliage: string[]): TreeSpec[] {
  const rand = mulberry32(20260712);
  const trees: TreeSpec[] = [];
  let guard = 0;
  while (trees.length < count && guard < count * 40) {
    guard++;
    const x = (rand() - 0.5) * 70;
    const z = -rand() * 38 + 8;
    // Sendero central despejado
    const corridor = Math.max(0, 1 - Math.abs(z - 2) / 16) * 6;
    if (Math.abs(x) < 2.2 + corridor) continue;
    if (Math.hypot(x, z - 11) < 5.5) continue;
    trees.push({
      x,
      z,
      scale: 0.75 + rand() * 1.65,
      phase: rand() * Math.PI * 2,
      speed: 0.25 + rand() * 0.35,
      tint: new THREE.Color(foliage[Math.floor(rand() * foliage.length)]),
      lean: (rand() - 0.5) * 0.08,
    });
  }
  return trees;
}

function InstancedForest({
  animate,
  count,
  foliage,
  trunkColor,
}: {
  animate: boolean;
  count: number;
  foliage: string[];
  trunkColor: string;
}) {
  const trees = useMemo(() => buildTrees(count, foliage), [count, foliage]);
  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const lowerLayerRef = useRef<THREE.InstancedMesh>(null);
  const middleLayerRef = useRef<THREE.InstancedMesh>(null);
  const upperLayerRef = useRef<THREE.InstancedMesh>(null);
  const layerRefs = useMemo(
    () => [lowerLayerRef, middleLayerRef, upperLayerRef],
    []
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const layers: [number, number, number][] = useMemo(
    () => [
      [1.7, 2.6, 2.4],
      [1.25, 2.15, 3.55],
      [0.8, 1.8, 4.65],
    ],
    []
  );

  useEffect(() => {
    const trunk = trunkRef.current;
    if (!trunk) return;
    trees.forEach((t, i) => {
      dummy.position.set(t.x, t.scale * 1.05, t.z);
      dummy.scale.set(t.scale * 0.35, t.scale * 2.1, t.scale * 0.35);
      dummy.rotation.set(t.lean, t.phase, t.lean * 0.5);
      dummy.updateMatrix();
      trunk.setMatrixAt(i, dummy.matrix);
    });
    trunk.instanceMatrix.needsUpdate = true;
    trunk.count = trees.length;

    layers.forEach((layer, li) => {
      const mesh = layerRefs[li].current;
      if (!mesh) return;
      trees.forEach((t, i) => {
        const [r, h, y] = layer;
        dummy.position.set(t.x, t.scale * y, t.z);
        dummy.scale.set(t.scale * r, t.scale * h * 0.5, t.scale * r);
        dummy.rotation.set(0, t.phase + li, 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        mesh.setColorAt(i, t.tint);
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.count = trees.length;
    });
  }, [trees, dummy, layers, layerRefs]);

  useFrame(({ clock }) => {
    if (!animate) return;
    const t = clock.elapsedTime;
    layers.forEach((layer, li) => {
      const mesh = layerRefs[li].current;
      if (!mesh) return;
      trees.forEach((tree, i) => {
        const [r, h, y] = layer;
        const sway = Math.sin(t * tree.speed + tree.phase + li * 0.4) * 0.035;
        dummy.position.set(tree.x + sway * 0.15, tree.scale * y, tree.z);
        dummy.scale.set(tree.scale * r, tree.scale * h * 0.5, tree.scale * r);
        dummy.rotation.set(sway * 0.3, tree.phase + li, sway);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    });
  });

  return (
    <group>
      <instancedMesh ref={trunkRef} args={[undefined, undefined, trees.length]} castShadow={false}>
        <cylinderGeometry args={[0.35, 0.55, 2, 6]} />
        <meshLambertMaterial color={trunkColor} />
      </instancedMesh>
      {layers.map((_, li) => (
        <instancedMesh key={li} ref={layerRefs[li]} args={[undefined, undefined, trees.length]}>
          <coneGeometry args={[1, 2, 7]} />
          <meshLambertMaterial vertexColors />
        </instancedMesh>
      ))}
    </group>
  );
}

function Ground({
  groundColor,
  groundEmissive,
  trailColor,
  trailEmissive,
}: {
  groundColor: string;
  groundEmissive: string;
  trailColor: string;
  trailEmissive: string;
}) {
  const geometry = useMemo(() => {
    const geo = new THREE.CircleGeometry(70, 48);
    geo.rotateX(-Math.PI / 2);
    const rand = mulberry32(42);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const d = Math.hypot(x, z);
      if (d > 5) {
        pos.setY(
          i,
          Math.sin(x * 0.2) * Math.cos(z * 0.18) * 0.7 * Math.min(1, (d - 5) / 12) + rand() * 0.12
        );
      } else {
        // sendero más plano y ligeramente hundido
        pos.setY(i, -0.05 + rand() * 0.02);
      }
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <group>
      <mesh geometry={geometry} position={[0, 0, 0]}>
        <meshLambertMaterial color={groundColor} emissive={groundEmissive} emissiveIntensity={0.3} />
      </mesh>
      {/* sendero */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 2]}>
        <planeGeometry args={[3.2, 28]} />
        <meshLambertMaterial color={trailColor} emissive={trailEmissive} emissiveIntensity={0.24} />
      </mesh>
    </group>
  );
}

function Fireflies({
  animate,
  count,
  color,
  glowRgb,
}: {
  animate: boolean;
  count: number;
  color: string;
  glowRgb: string;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const { base, phases } = useMemo(() => {
    const rand = mulberry32(9);
    const base = new Float32Array(count * 3);
    const phases = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      base[i * 3] = (rand() - 0.5) * 36;
      base[i * 3 + 1] = 0.5 + rand() * 4.5;
      base[i * 3 + 2] = -rand() * 24 + 5;
      phases[i * 2] = rand() * Math.PI * 2;
      phases[i * 2 + 1] = 0.25 + rand() * 0.55;
    }
    return { base, phases };
  }, [count]);

  const positions = useMemo(() => base.slice(), [base]);

  const glowTexture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const ctx = c.getContext("2d")!;
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(255,255,220,1)");
    grad.addColorStop(0.3, `rgba(${glowRgb},0.55)`);
    grad.addColorStop(1, `rgba(${glowRgb},0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }, [glowRgb]);

  useFrame(({ clock }) => {
    if (!animate || !pointsRef.current) return;
    const t = clock.elapsedTime;
    const attr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      const ph = phases[i * 2];
      const sp = phases[i * 2 + 1];
      attr.setXYZ(
        i,
        base[i * 3] + Math.sin(t * sp + ph) * 1.2,
        base[i * 3 + 1] + Math.sin(t * sp * 0.6 + ph * 2) * 0.55,
        base[i * 3 + 2] + Math.cos(t * sp * 0.45 + ph) * 1.1
      );
    }
    attr.needsUpdate = true;
    const mat = pointsRef.current.material as THREE.PointsMaterial;
    mat.opacity = 0.45 + Math.sin(t * 0.7) * 0.2;
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.26}
        map={glowTexture}
        color={color}
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

function GodRays({ animate, count = 3, colorRgb }: { animate: boolean; count?: number; colorRgb: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 256;
    const ctx = c.getContext("2d")!;
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, `rgba(${colorRgb}, 0.5)`);
    grad.addColorStop(0.55, `rgba(${colorRgb}, 0.12)`);
    grad.addColorStop(1, `rgba(${colorRgb}, 0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 256);
    return new THREE.CanvasTexture(c);
  }, [colorRgb]);

  useFrame(({ clock }) => {
    if (!animate || !groupRef.current) return;
    const t = clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      mat.opacity = 0.05 + (Math.sin(t * 0.2 + i) * 0.5 + 0.5) * 0.06;
    });
  });

  const allShafts = useMemo(
    () => [
      { x: -8, z: -7, rot: 0.25, w: 3.4 },
      { x: 5, z: -11, rot: -0.18, w: 4.2 },
      { x: 12, z: -5, rot: 0.32, w: 2.8 },
    ],
    []
  );
  const shafts = allShafts.slice(0, count);

  return (
    <group ref={groupRef}>
      {shafts.map((s, i) => (
        <mesh key={i} position={[s.x, 9, s.z]} rotation={[0, 0, s.rot]}>
          <planeGeometry args={[s.w, 22]} />
          <meshBasicMaterial
            map={texture}
            transparent
            opacity={0.07}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Cámara lenta, sin seguir el mouse (no consume pointer events) */
function GentleCamera({ animate }: { animate: boolean }) {
  useFrame(({ clock, camera }) => {
    if (!animate) return;
    const t = clock.elapsedTime;
    const tx = Math.sin(t * 0.04) * 0.9;
    const ty = 2.35 + Math.sin(t * 0.06) * 0.18;
    const tz = 10.5 + Math.sin(t * 0.03) * 0.7;
    camera.position.x += (tx - camera.position.x) * 0.02;
    camera.position.y += (ty - camera.position.y) * 0.02;
    camera.position.z += (tz - camera.position.z) * 0.02;
    camera.lookAt(0, 2.5, -9);
  });
  return null;
}

/** ~20 fps: libera CPU para clics/taps */
function FramePacer({ active }: { active: boolean }) {
  const { invalidate: inv } = useThree();
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => inv(), 50);
    return () => clearInterval(id);
  }, [active, inv]);
  return null;
}

function SceneLights({ palette }: { palette: ThemeForest3D }) {
  return (
    <>
      <fogExp2 attach="fog" args={[palette.fogColor, palette.fogDensity]} />
      <color attach="background" args={["#000000"]} />
      <hemisphereLight args={[palette.hemiSky, palette.hemiGround, palette.hemiIntensity]} />
      <ambientLight color={palette.ambientColor} intensity={palette.ambientIntensity} />
      <directionalLight position={[8, 16, 5]} color={palette.dirColor} intensity={palette.dirIntensity} />
      <directionalLight position={[-6, 8, -4]} color={palette.dir2Color} intensity={palette.dir2Intensity} />
      <pointLight
        position={[0, 6, -4]}
        color={palette.pointColor}
        intensity={palette.pointIntensity}
        distance={20}
        decay={2}
      />
    </>
  );
}

export function Forest3D({
  animate = true,
  quality = "auto",
  theme = "bosque",
}: {
  animate?: boolean;
  quality?: "auto" | "low" | "high";
  theme?: ThemeId;
}) {
  const palette = getTheme(theme).forest3d;
  const isMobile =
    typeof window !== "undefined" &&
    (window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent));

  const q = quality === "auto" ? (isMobile ? "low" : "high") : quality;
  const treeCount = q === "low" ? 42 : 58;
  const fireflyCount = q === "low" ? 22 : 30;
  const godRayCount = q === "low" ? 2 : 3;
  const dpr: [number, number] = q === "low" ? [1, 1.3] : [1, 1.5];

  return (
    <Canvas
      className="forest-3d"
      dpr={dpr}
      camera={{ position: [0, 2.4, 10.5], fov: 52, near: 0.1, far: 100 }}
      gl={{
        antialias: q === "high",
        alpha: true,
        powerPreference: "low-power",
        stencil: false,
        depth: true,
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        const el = gl.domElement;
        el.style.pointerEvents = "none";
        el.style.touchAction = "none";
        el.setAttribute("aria-hidden", "true");
        // Bloquear cualquier captura residual
        el.addEventListener(
          "pointerdown",
          (e) => {
            e.stopPropagation();
          },
          true
        );
      }}
      style={{ pointerEvents: "none", touchAction: "none" }}
      events={undefined}
      // demand + pacer = animación suave sin saturar el hilo de la UI
      frameloop="demand"
    >
      <FramePacer active={animate} />
      <SceneLights palette={palette} />
      <Ground
        groundColor={palette.groundColor}
        groundEmissive={palette.groundEmissive}
        trailColor={palette.trailColor}
        trailEmissive={palette.trailEmissive}
      />
      <InstancedForest animate={animate} count={treeCount} foliage={palette.foliage} trunkColor={palette.trunkColor} />
      <Fireflies animate={animate} count={fireflyCount} color={palette.fireflyColor} glowRgb={palette.fireflyGlowRgb} />
      <GodRays animate={animate} count={godRayCount} colorRgb={palette.rayColor} />
      <GentleCamera animate={animate} />
    </Canvas>
  );
}
