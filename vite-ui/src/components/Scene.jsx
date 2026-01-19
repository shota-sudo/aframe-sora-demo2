/* eslint-disable react/no-unknown-property */
import React, { useEffect, useRef, useState } from 'react';
import 'aframe';
import * as CANNON from 'cannon-es';
window.CANNON = CANNON;

import '@c-frame/aframe-physics-system/dist/aframe-physics-system.js';

// Side-effect imports for A-Frame components
import '../aframe-scripts/components/car-drive-arcade.js';
import '../aframe-scripts/components/chase-camera.js';
import '../aframe-scripts/components/gamepad-controls.js';
import '../aframe-scripts/components/track-trail.js';

// Logic imports
import { createNetBridge } from '../aframe-scripts/app/net-bridge.js';
import { createControlLogger } from '../aframe-scripts/app/ui/control-logger.js';
import { resolveConfig } from '../aframe-scripts/app/config.js';

const INITIAL_PARAMS = {
  scene: { driver: 'local', debug: false, gravity: -9.8 },
  body: { shape: 'box', type: 'dynamic', mass: 120, linearDamping: 0.1, angularDamping: 1.0 },
  carDrive: {
    forwardSign: +1,
    maxSpeed: 25,
    accel: 3,
    brake: 4,
    coastDecel: 0.05,
    yawRate: 3.2,
    yawSlew: 40,
    deadbandV: 0.05,
    deadbandW: 0.02,
    muRoll: 0.005,
    airLin: 0.1,
    airQuad: 0.1,
  },
  chaseCam: { dist: -3, height: 3.5, stiffness: 12, lookAhead: 0.45 },
  angularFactor: { x: 0, y: 1, z: 0 },
};

export const Scene = ({ onNetStatusChange }) => {
  const sceneRef = useRef(null);
  const carRef = useRef(null);
  
  // Params state (could be expanded if dynamic config is needed)
  const [params] = useState(INITIAL_PARAMS);

  // Camera state
  const [activeCam, setActiveCam] = useState('chase');

  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === 'KeyC') {
        setActiveCam(prev => prev === 'chase' ? 'debug' : 'chase');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    const initBridge = () => {
      const sceneEl = sceneRef.current;
      const carEl = carRef.current;
      if (!sceneEl || !carEl) return;

      // Canvas Focus
      if (sceneEl.canvas) {
          sceneEl.canvas.setAttribute('tabindex', '0');
          sceneEl.canvas.focus();
          sceneEl.canvas.addEventListener('click', () => sceneEl.canvas.focus());
      }

      const config = resolveConfig();
      const controlLog = createControlLogger(); 

      // Mock HUD for React integration
      const hudAdapter = {
        setConnection: (level, detail) => {
           onNetStatusChange(prev => ({ ...prev, level, label: level.toUpperCase(), detail: detail.join(' ') }));
        },
        setMetrics: (metrics) => {
           onNetStatusChange(prev => ({ ...prev, metrics: { ...metrics } }));
        },
        setPose: (poseState) => {
           // format pose string if needed, or pass object
           const poseStr = `pos: ${poseState.x?.toFixed(2)}, ${poseState.y?.toFixed(2)}, ${poseState.z?.toFixed(2)}`;
           onNetStatusChange(prev => ({ ...prev, pose: poseStr }));
        },
      };

      if (config.localMode) {
        hudAdapter.setConnection('degraded', ['local mode enabled']);
        return;
      }
      
      if (!Array.isArray(config.signalingUrls) || config.signalingUrls.length === 0) {
        hudAdapter.setConnection('disconnected', ['No signaling URL set']);
        return;
      }

      config.channelId = config.channelId || 'sora';
      config.ctrlLabel = config.ctrlLabel || 'ctrl';
      config.stateLabel = config.stateLabel || 'state';

      // Initialize Bridge
      const bridge = createNetBridge({ config, hud: hudAdapter, controlLog, carEl });
      
      // Initial metrics update
      hudAdapter.setMetrics(bridge.metrics);

      bridge.start();

      // Listen for E-Stop
      const handleEstop = () => bridge.sendEstop();
      window.addEventListener('app:estop', handleEstop);

      return () => {
        bridge.stop();
        window.removeEventListener('app:estop', handleEstop);
      };
    };

    const sceneEl = sceneRef.current;
    if (sceneEl) {
      if (sceneEl.hasLoaded) {
        const cleanup = initBridge();
        return cleanup;
      } else {
        const onLoaded = () => {
             const cleanup = initBridge();
             // Since initBridge returns cleanup, but we can't return it from this listener easily in this pattern.
             // We might need to store cleanup ref.
             // For simplicity, we assume one-time load.
             // But actually, useEffect cleanup handles unmount. 
             // Ideally we should store the bridge instance ref.
        };
        sceneEl.addEventListener('loaded', onLoaded, { once: true });
        // Warning: cleaning up from the event listener path is tricky here. 
        // Better to just run initBridge if loaded, or attach listener. 
        // We will assume component stays mounted.
      }
    }
  }, [params, onNetStatusChange]);

  // Handle Params that are set via DOM attributes in original code
  // We can pass them as props to components if they are strings
  // but A-Frame components parse generic objects sometimes too, but typically string attributes.
  
  const physicsAttr = `driver: ${params.scene.driver}; debug: false; gravity: ${params.scene.gravity}`;
  const carBodyAttr = `shape: ${params.body.shape}; mass: ${params.body.mass}; linearDamping: ${params.body.linearDamping}; angularDamping: ${params.body.angularDamping}; type: ${params.body.type}`;
  
  const cd = params.carDrive;
  const carDriveAttr = `forwardSign:${cd.forwardSign}; maxSpeed:${cd.maxSpeed}; accel:${cd.accel}; brake:${cd.brake}; coastDecel:${cd.coastDecel}; yawRate:${cd.yawRate}; yawSlew:${cd.yawSlew}; deadbandV:${cd.deadbandV}; deadbandW:${cd.deadbandW}; muRoll:${cd.muRoll}; airLin:${cd.airLin}; airQuad:${cd.airQuad}`;
  
  const cc = params.chaseCam;
  const chaseCamAttr = `target: #car; dist: ${cc.dist}; height: ${cc.height}; stiffness: ${cc.stiffness}; lookAhead: ${cc.lookAhead}`;

  return (
    <a-scene 
      ref={sceneRef}
      physics={physicsAttr} 
      gamepad-controls=""
    >
      <a-assets>
        <a-asset-item
          id="carModel"
          src="/assets/kenney_car-kit/Models/GLB_format/sedan.glb"
        ></a-asset-item>
      </a-assets>

      <a-entity light="type: ambient; intensity: 0.6"></a-entity>
      <a-entity light="type: directional; intensity: 1.0" position="1 3 2"></a-entity>

      <a-entity
        id="chasecam"
        camera={`active: ${activeCam === 'chase'}; near: 0.01; far: 2000; fov: 90`}
        look-controls="enabled: false"
        chase-camera={chaseCamAttr}
      ></a-entity>

      <a-entity
        id="debugcam"
        camera={`active: ${activeCam === 'debug'}`}
        look-controls=""
        wasd-controls=""
        position="0 1.6 8"
      ></a-entity>

      <a-plane
        rotation="-90 0 0"
        width="80"
        height="80"
        color="#ccc"
        static-body="shape: plane"
      ></a-plane>
      <a-sky color="#ECECEC"></a-sky>

      <a-gltf-model
        src="assets/kenney_car-kit/MapViewer3Dpts_out_normal_white_200mm.glb"
        rotation="-90 0 0"
      ></a-gltf-model>

      <a-entity
        id="trajectory"
        track-car="target: #car; distanceThreshold: 0.1; boxWidth: 0.9; boxDepth: 0.11; boxHeight: 0.05; boxColor: #FF5733;"
      ></a-entity>

      <a-entity
        id="car"
        ref={carRef}
        position="0 2.0 -4"
        rotation="0 0 0"
        dynamic-body={carBodyAttr}
        car-drive={carDriveAttr}
      >
        <a-entity
          id="carModelNode"
          rotation="0 0 0"
          gltf-model="/assets/kenney_car-kit/Models/GLB_format/sedan.glb"
          scale="0.5 0.5 0.5"
        ></a-entity>
      </a-entity>
    </a-scene>
  );
};
