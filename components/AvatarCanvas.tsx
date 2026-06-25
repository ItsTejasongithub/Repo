'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export function AvatarCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const floatingRef  = useRef(false);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [isFloating, setIsFloating] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const canvas    = canvasRef.current;
    if (!container || !canvas) return;

    // ── Renderer ──────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);

    // ── Scene / Camera ────────────────────────────────────────────────
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      32,
      container.clientWidth / container.clientHeight,
      0.01,
      500,
    );

    // Bright neutral lights so the PBR model is clearly visible
    scene.add(new THREE.AmbientLight(0xffffff, 2.0));
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.0);
    keyLight.position.set(3, 6, 5);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0x88ddff, 1.2);
    fillLight.position.set(-5, 2, -3);
    scene.add(fillLight);
    const topLight = new THREE.DirectionalLight(0xffffff, 1.0);
    topLight.position.set(0, 10, 1);
    scene.add(topLight);

    // ── Avatar root ───────────────────────────────────────────────────
    const avatarRoot = new THREE.Group();
    scene.add(avatarRoot);

    // ── Mutable state ─────────────────────────────────────────────────
    let mixer: any = null;
    let greetTimer = 0;
    const modelBox    = new THREE.Box3();
    const modelCenter = new THREE.Vector3();

    // Bones that share the look-at, parent->child order, with their weight.
    // Neck-only tracking keeps the floating pose inside a believable range.
    const lookBones: { bone: any; weight: number }[] = [];
    // Stores the bone quaternion AFTER the mixer runs but BEFORE the look
    // offset is applied. Restored at the top of every tick so the offset
    // never accumulates across frames (the root cause of the spinning-head bug
    // when the current clip does not key these bones).
    const boneBaseQuats = new Map<any, any>();
    // The bone's ORIGINAL bind pose (captured once at load, never overwritten).
    // While floating we slerp toward this to lift the head out of the float
    // emote's deep downward curl, so the cursor look reads as "looking up".
    const boneRestQuats = new Map<any, any>();

    // The Head bone + its neutral WORLD orientation (captured at load). Used
    // for floating: we drive the head to an absolute world-space look target
    // so the float emote's spine-curl can't drag the gaze toward the floor.
    let headBone: any = null;
    const headRestWorld = new THREE.Quaternion();

    // Maximum look angles (radians). Small enough to prevent impossible twists.
    const MAX_YAW   = 2; // about 45 degrees left / right
    const MAX_PITCH = 0.8; // about 16 degrees up / down — natural nod range

    // targets are clamped to [-1, 1] so a cursor far past the avatar simply
    // pins the look to the extreme side instead of over-rotating.
    let targetX = 0, targetY = 0, curYaw = 0, curPitch = 0;
    // Raw cursor coords (client px). Used by floating mode to track relative to
    // the widget's own on-screen position instead of the viewport centre.
    let pointerClientX = 0, pointerClientY = 0, hasCursor = false;
    const BASE_MODEL_YAW = -Math.PI / 2;

    // Intro state: walk in from one side, settle at center, then greet.
    let introPhase: 'walk' | 'center' | 'greet' | 'idle' | 'preview' = 'walk';
    const introStartPos = new THREE.Vector3();
    const introEndPos = new THREE.Vector3(0, 0, 0);
    let introProgress = 0;
    let introDuration = 0;
    let centerHold = 0;
    let walkAction: any = null;
    let greetAction: any = null;
    let idleAction: any = null;
    let floatAction: any = null;
    let dizzyAction: any = null;
    let activeBaseAction: any = null;
    let modelRoot: any = null;

    // Dizziness emote (Track 2): triggered by shaking the mouse fast on the
    // hero screen. Never plays while floating.
    let dizzyActive = false;
    let dizzyCharge = 0;     // 0→1, builds while the cursor moves fast
    let dizzyCooldown = 0;   // seconds before it can fire again
    let dizzyTimer = 0;      // setTimeout handle for the auto-recover
    let pointerSpeed = 0;    // px/ms, refreshed on move, decays each frame
    let lastMoveX = 0, lastMoveY = 0, lastMoveTime = 0;

    // 3D star/ring halo — orbits the head in world space so it tilts with him
    // when he falls. Built once the model + head bone are known.
    let dizzyHalo: { group: any; spinner: any; mats: any[]; tex: any } | null = null;
    let dizzyHaloOffset = 0; // world-units the halo sits above the head
    let haloOpacity = 0;     // eased 0→1 for a soft fade in/out

    // End-of-page emote (Track 14): plays once when the user reaches the very
    // bottom while floating, then holds the standing idle until they scroll up.
    let endAction: any = null;
    let endTimer = 0;
    let atBottom = false;
    let bottomState: 'none' | 'playing' | 'resting' = 'none';

    // Random emotes from the unused clips (0–14), fired by clicking near the
    // avatar on the hero screen only.
    const clickEmotes: any[] = [];
    let clickEmoteActive = false;
    let clickEmoteTimer = 0;

    let walkStopped = false;

    // Draw a soft glowing 5-point star into a canvas texture (used by the
    // dizzy halo sprites). One texture is shared by every star.
    const makeStarTexture = () => {
      const size = 128;
      const c = document.createElement('canvas');
      c.width = c.height = size;
      const g = c.getContext('2d')!;
      g.translate(size / 2, size / 2);
      const glow = g.createRadialGradient(0, 0, 0, 0, 0, size / 2);
      glow.addColorStop(0,   'rgba(255,244,170,0.95)');
      glow.addColorStop(0.45,'rgba(253,224,71,0.35)');
      glow.addColorStop(1,   'rgba(253,224,71,0)');
      g.fillStyle = glow;
      g.beginPath();
      g.arc(0, 0, size / 2, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#fff7c0';
      g.beginPath();
      const spikes = 5, outer = size * 0.3, inner = size * 0.13;
      for (let i = 0; i < spikes * 2; i++) {
        const rad = i % 2 === 0 ? outer : inner;
        const a = (i * Math.PI) / spikes - Math.PI / 2;
        const x = Math.cos(a) * rad, y = Math.sin(a) * rad;
        i === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
      }
      g.closePath();
      g.fill();
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };

    // ── Load GLB ──────────────────────────────────────────────────────
    let destroyed = false;

    import('three/addons/loaders/GLTFLoader.js').then(({ GLTFLoader }: any) => {
      if (destroyed) return;
      const loader = new GLTFLoader();
      loader.load(
        '/avatar.glb',
        (gltf: any) => {
          if (destroyed) return;

          const model = gltf.scene;
          modelRoot = model;
          model.rotation.y = BASE_MODEL_YAW;
          avatarRoot.add(model);

          // Auto-fit: scale to a fixed height, drop feet to y = 0, centre x/z
          modelBox.setFromObject(model);
          const size = modelBox.getSize(new THREE.Vector3());
          model.scale.setScalar(3.6 / Math.max(size.x, size.y, size.z));

          modelBox.setFromObject(model);
          modelBox.getCenter(modelCenter);
          model.position.set(-modelCenter.x, -modelBox.min.y, -modelCenter.z);

          modelBox.setFromObject(model);
          modelBox.getCenter(modelCenter);

          const h = modelBox.max.y - modelBox.min.y;
          // Pull back for headroom so the head never clips when it tilts up,
          // floats, or gestures — the model stays comfortably inside the frame.
          camera.position.set(0, modelCenter.y, h * 2.5);
          camera.lookAt(modelCenter);

          // Collect the look-at chain, parent→child order.
          // Including the Head bone gives full symmetric left/right range —
          // twist bones alone tend to produce asymmetric results because their
          // local axes are skewed by the bind-pose rotation.
          const found: Record<string, any> = {};
          model.traverse((obj: any) => {
            const n = obj.name;
            if (n === 'Neck' || n === 'NeckTwist01' || n === 'NeckTwist02' || n === 'Head') {
              found[n] = obj;
            }
          });

          // Build chain. If the Head bone is present give it the majority of
          // the look rotation (50 %) — it's the actual head pivot and moves
          // symmetrically.  The lower bones add a natural S-curve bend.
          // Fallback: only twist bones were found → keep original weights.
          const boneChain: Array<[any, number]> = [];
          if (found.Head) {
            if (found.Neck)        boneChain.push([found.Neck,        0.10]);
            if (found.NeckTwist01) boneChain.push([found.NeckTwist01, 0.18]);
            if (found.NeckTwist02) boneChain.push([found.NeckTwist02, 0.22]);
            boneChain.push([found.Head, 0.50]);
          } else {
            if (found.NeckTwist01) boneChain.push([found.NeckTwist01, 0.45]);
            if (found.NeckTwist02) boneChain.push([found.NeckTwist02, 0.55]);
          }
          for (const [bone, weight] of boneChain) {
            lookBones.push({ bone, weight });
            boneBaseQuats.set(bone, bone.quaternion.clone());
            // Captured here, before the mixer ever runs — this is the neutral
            // bind pose with the head roughly level.
            boneRestQuats.set(bone, bone.quaternion.clone());
          }

          // Capture the head's neutral WORLD orientation (model is already set
          // to BASE_MODEL_YAW and the mixer hasn't run, so this is the level,
          // forward-facing gaze). getWorldQuaternion forces an ancestor world
          // matrix update, so this is accurate.
          if (found.Head) {
            headBone = found.Head;
            headBone.getWorldQuaternion(headRestWorld);

            // Build the 3D dizzy halo, sized to the model. It lives in world
            // space (added to the scene) and is repositioned/reoriented to
            // follow the head every frame while dizzy.
            const r = h * 0.13;            // halo radius
            const starS = h * 0.085;       // star sprite size
            dizzyHaloOffset = h * 0.16;    // height above the head

            const group = new THREE.Group();
            group.visible = false;
            group.renderOrder = 999;
            const spinner = new THREE.Group();
            group.add(spinner);

            const tex = makeStarTexture();
            const mats: any[] = [];
            const STARS = 7;
            for (let i = 0; i < STARS; i++) {
              const m = new THREE.SpriteMaterial({
                map: tex, transparent: true, depthTest: false,
                depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0,
              });
              m.userData.base = 1;
              const sp = new THREE.Sprite(m);
              const a = (i / STARS) * Math.PI * 2;
              sp.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
              const s = i % 2 ? starS * 0.65 : starS;
              sp.scale.set(s, s, 1);
              spinner.add(sp);
              mats.push(m);
            }

            // Two flat rings (yellow + cyan), lying horizontal around the head.
            const mkRing = (radius: number, tube: number, color: number, base: number) => {
              const rm = new THREE.MeshBasicMaterial({
                color, transparent: true, opacity: 0, depthTest: false, depthWrite: false,
              });
              rm.userData.base = base;
              const torus = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 8, 48), rm);
              torus.rotation.x = Math.PI / 2;
              group.add(torus);
              mats.push(rm);
            };
            mkRing(r, h * 0.006, 0xfde047, 0.5);
            mkRing(r * 0.72, h * 0.005, 0x67e8f9, 0.4);

            scene.add(group);
            dizzyHalo = { group, spinner, mats, tex };
          }

          // Animation: walk in on track 3, greet once (track 0 — the wave),
          // then settle into the looping idle (track 6) and stay there.
          // ?anim=N overrides with a single looping clip (handy for previewing).
          if (gltf.animations?.length) {
            mixer = new THREE.AnimationMixer(model);
            const clips = gltf.animations;
            const walkIdx = Math.min(3, clips.length - 1);
            // Floating emote: keep this on clip index 9.
            const floatIdx = Math.min(9, clips.length - 1);
            const idleIdx = Math.min(6, clips.length - 1);
            // NB: URLSearchParams.get returns null when absent, and Number(null)
            // is 0 — so coalesce to NaN to avoid falling into preview mode (idx 0).
            const animParam = new URLSearchParams(location.search).get('anim');
            const q = animParam === null ? NaN : Number(animParam);

            if (Number.isInteger(q) && q >= 0 && q < clips.length) {
              introPhase = 'preview';
              const only = mixer.clipAction(clips[q]);
              only.reset();
              only.setLoop(THREE.LoopRepeat, Infinity);
              only.play();
            } else {
              walkAction = mixer.clipAction(clips[walkIdx]);
              walkAction.setLoop(THREE.LoopRepeat, Infinity);
              walkAction.reset().fadeIn(0.2).play();

              idleAction = mixer.clipAction(clips[idleIdx]);
              idleAction.setLoop(THREE.LoopRepeat, Infinity);

              floatAction = mixer.clipAction(clips[floatIdx]);
              floatAction.setLoop(THREE.LoopRepeat, Infinity);

              greetAction = mixer.clipAction(clips[0]);
              greetAction.setLoop(THREE.LoopOnce, 1);
              greetAction.clampWhenFinished = true;

              // Dizzy / falling-down emote on clip index 2.
              dizzyAction = mixer.clipAction(clips[Math.min(2, clips.length - 1)]);
              dizzyAction.setLoop(THREE.LoopOnce, 1);
              dizzyAction.clampWhenFinished = true;

              // End-of-page emote on clip index 14.
              endAction = mixer.clipAction(clips[Math.min(14, clips.length - 1)]);
              endAction.setLoop(THREE.LoopOnce, 1);
              endAction.clampWhenFinished = true;

              // Collect the leftover clips (0–14) not already used by walk/idle/
              // float/greet/dizzy/end — these fire randomly on click.
              const usedClips = new Set([0, 2, 3, 6, 9, 14]);
              for (let i = 0; i <= 14 && i < clips.length; i++) {
                if (usedClips.has(i)) continue;
                const a = mixer.clipAction(clips[i]);
                a.setLoop(THREE.LoopOnce, 1);
                a.clampWhenFinished = true;
                clickEmotes.push(a);
              }

              const cameraDistance = camera.position.distanceTo(modelCenter);
              const visibleHalfWidth =
                Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)) *
                cameraDistance *
                camera.aspect;
              const spawnX = visibleHalfWidth + Math.max(size.x * 1.25, 1.8);
              // Keep diagonal entries subtle and on the far side of the stage
              // so the character stays side-on instead of turning into a back view.
              const spawnZ = Math.max(0.45, Math.min(spawnX * 0.16, 1.0));
              const side = (() => {
                const lastSide = sessionStorage.getItem('avatarIntroSide');
                const nextSide = lastSide === 'left'
                  ? 'right'
                  : lastSide === 'right'
                    ? 'left'
                    : Math.random() < 0.5 ? 'left' : 'right';
                sessionStorage.setItem('avatarIntroSide', nextSide);
                return nextSide;
              })();
              const sideSign = side === 'left' ? -1 : 1;
              const diagonal = Math.random() < 0.45;
              const chosenSpawn = new THREE.Vector3(
                sideSign * spawnX,
                0,
                diagonal ? -spawnZ : 0,
              );
              introStartPos.copy(chosenSpawn);
              introDuration = Math.max(1.55, Math.min(walkAction.getClip().duration * 0.95, introStartPos.length() / 4.2));
              introProgress = 0;
              centerHold = 0.32;
              walkStopped = false;
              introPhase = 'walk';
              avatarRoot.position.copy(introStartPos);
              faceCenter();
            }
          }

          setStatus('ready');
        },
        undefined,
        (err: any) => {
          if (destroyed) return;
          console.error('Avatar failed to load:', err);
          setStatus('error');
        },
      );
    });

    // ── Mouse (viewport-normalised — scroll cannot affect this) ──────────
    // Coordinates are normalised against the full viewport, NOT the container.
    // Using getBoundingClientRect() here would shift rect.top as the page
    // scrolls, making targetY change with scroll even if the cursor is still —
    // that was the "scroll-drives-rotation" bug. Viewport dimensions are fixed.
    const clamp1 = (v: number) => (v < -1 ? -1 : v > 1 ? 1 : v);
    const onMouseMove = (e: MouseEvent) => {
      targetX = clamp1((e.clientX / window.innerWidth)  * 2 - 1);
      targetY = clamp1((e.clientY / window.innerHeight) * 2 - 1);
      pointerClientX = e.clientX;
      pointerClientY = e.clientY;
      hasCursor = true;

      // Cursor speed (px/ms) — feeds the dizziness charge.
      const now = performance.now();
      const moveDt = now - lastMoveTime;
      if (lastMoveTime && moveDt > 0) {
        const dist = Math.hypot(e.clientX - lastMoveX, e.clientY - lastMoveY);
        pointerSpeed = dist / moveDt;
      }
      lastMoveX = e.clientX;
      lastMoveY = e.clientY;
      lastMoveTime = now;
    };
    // Return neck to neutral when the cursor leaves the browser window.
    const onMouseLeave = () => { targetX = 0; targetY = 0; hasCursor = false; };
    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);

    const onScroll = () => {
      const shouldFloat = window.scrollY > window.innerHeight * 0.65;
      floatingRef.current = shouldFloat;
      setIsFloating(shouldFloat);
      const doc = document.documentElement;
      atBottom = window.innerHeight + window.scrollY >= doc.scrollHeight - 40;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Click near the avatar on the hero screen → play a random unused emote.
    const onAvatarClick = (e: MouseEvent) => {
      if (
        !mixer || !headBone || floatingRef.current || introPhase !== 'idle' ||
        dizzyActive || clickEmoteActive || bottomState !== 'none' ||
        clickEmotes.length === 0
      ) return;

      // Is the click near the avatar? Project the head to screen and measure.
      const rect = container.getBoundingClientRect();
      headBone.getWorldPosition(_headPos);
      _headPos.project(camera);
      const hx = rect.left + (_headPos.x * 0.5 + 0.5) * rect.width;
      const hy = rect.top  + (-_headPos.y * 0.5 + 0.5) * rect.height;
      const radius = Math.min(rect.width, rect.height) * 0.55;
      if (Math.hypot(e.clientX - hx, e.clientY - hy) > radius) return;

      const act = clickEmotes[Math.floor(Math.random() * clickEmotes.length)];
      clickEmoteActive = true;
      setBaseAction(act);                    // cross-fades cleanly, no orphans
      clearTimeout(clickEmoteTimer);
      const dur = act.getClip().duration;
      clickEmoteTimer = window.setTimeout(() => {
        clickEmoteActive = false;            // base selector fades idle back in
      }, Math.max(400, (dur - 0.2) * 1000));
    };
    window.addEventListener('click', onAvatarClick);

    // Pre-allocated helpers — avoids per-frame GC pressure.
    const _yawAxis   = new THREE.Vector3(0, 1, 0);
    const _pitchAxis = new THREE.Vector3(1, 0, 0);
    const _yawQuat      = new THREE.Quaternion();
    const _pitchQuat    = new THREE.Quaternion();
    const _lookQuat     = new THREE.Quaternion();
    const _desiredWorld = new THREE.Quaternion();
    const _parentWorld  = new THREE.Quaternion();
    const _headPos      = new THREE.Vector3();
    const _haloQuat     = new THREE.Quaternion();
    const _deltaQuat    = new THREE.Quaternion();
    const _headRestInv  = new THREE.Quaternion();
    const _haloUp       = new THREE.Vector3();

    // Apply a look delta on top of the animated neck pose.
    //
    // We PRE-multiply (parent-frame), not post-multiply (bone-local frame).
    // Post-multiplying rides the bone's own animated rotation: in the curled
    // "float" emote the head is tilted forward, so its local axes are skewed —
    // a pitch around local-X became a sideways roll and the head refused to
    // look up. The parent (neck base) stays roughly upright in every clip, so
    // pre-multiplying keeps yaw = horizontal turn and pitch = vertical nod
    // consistent regardless of pose. Angles stay clamped, so it can never spin.
    const applyLook = (bone: any, yaw: number, pitch: number) => {
      _yawQuat.setFromAxisAngle(_yawAxis, THREE.MathUtils.clamp(yaw, -MAX_YAW, MAX_YAW));
      _pitchQuat.setFromAxisAngle(_pitchAxis, THREE.MathUtils.clamp(pitch, -MAX_PITCH, MAX_PITCH));
      _lookQuat.multiplyQuaternions(_yawQuat, _pitchQuat);
      bone.quaternion.premultiply(_lookQuat);
    };

    const faceCenter = () => {
      if (!modelRoot) return;
      const dx = -avatarRoot.position.x;
      const dz = -avatarRoot.position.z;
      const centerYaw = Math.atan2(dx, dz);
      const sideSafeYaw =
        avatarRoot.position.x > 0
          ? Math.min(centerYaw, 0)
          : Math.max(centerYaw, 0);

      modelRoot.rotation.y = BASE_MODEL_YAW - sideSafeYaw;
    };

    const setBaseAction = (nextAction: any) => {
      if (!nextAction || activeBaseAction === nextAction) return;
      activeBaseAction?.fadeOut(0.35);
      nextAction.reset().fadeIn(0.35).play();
      activeBaseAction = nextAction;
    };

    const startDizzy = () => {
      if (dizzyActive || !dizzyAction) return;
      dizzyActive = true;
      dizzyCharge = 0;
      activeBaseAction?.fadeOut(0.2);
      dizzyAction.reset().fadeIn(0.2).play();
      clearTimeout(dizzyTimer);
      // Auto-recover a touch before the clip ends so the fade back is smooth.
      const dur = dizzyAction.getClip().duration;
      dizzyTimer = window.setTimeout(endDizzy, Math.max(600, (dur - 0.3) * 1000));
    };

    const endDizzy = () => {
      if (!dizzyActive) return;
      dizzyActive = false;
      dizzyCharge = 0;
      dizzyCooldown = 2.5;             // brief immunity so it doesn't re-fire
      clearTimeout(dizzyTimer);
      dizzyAction?.fadeOut(0.4);
      // Force the idle/float base to fade back in next frame.
      activeBaseAction = null;
    };

    // ── Render loop ───────────────────────────────────────────────────
    const clock = new THREE.Clock();
    let animId = 0;

    const tick = () => {
      animId = requestAnimationFrame(tick);
      const dt = clock.getDelta();

      // Restore bones to last frame's clean (pre-look) pose so the mixer is
      // the sole contributor before we add the procedural offset. Without this,
      // bones that the current clip does NOT key keep accumulating the offset
      // every frame, which causes the spinning-head / looking-at-floor bug.
      for (const { bone } of lookBones) {
        const base = boneBaseQuats.get(bone);
        if (base) bone.quaternion.copy(base);
      }

      if (mixer) mixer.update(dt);

      // Capture the clean mixer pose as next frame's restore point.
      for (const { bone } of lookBones) {
        const base = boneBaseQuats.get(bone);
        if (base) base.copy(bone.quaternion);
      }

      const introLocked = introPhase === 'walk' || introPhase === 'center' || introPhase === 'greet';
      // Let the dizzy / click emotes drive the head — no cursor look-at on top.
      const lookLocked = introLocked || dizzyActive || clickEmoteActive;

      if (introPhase === 'walk' && introDuration > 0) {
        introProgress = Math.min(1, introProgress + dt / introDuration);
        const eased = 1 - Math.pow(1 - introProgress, 3);
        avatarRoot.position.lerpVectors(introStartPos, introEndPos, eased);
        faceCenter();
        if (introProgress >= 1) {
          introPhase = 'center';
          centerHold = 0.32;
          avatarRoot.position.set(0, 0, 0);
          faceCenter();
          if (!walkStopped) {
            walkStopped = true;
            walkAction?.stop();
            idleAction?.reset().fadeIn(0.15).play();
            activeBaseAction = idleAction;
          }
        }
      } else if (introPhase === 'center') {
        centerHold -= dt;
        avatarRoot.position.set(0, 0, 0);
        faceCenter();
        if (centerHold <= 0 && mixer && greetAction && idleAction) {
          introPhase = 'greet';
          idleAction.fadeOut(0.2);
          activeBaseAction = null;
          greetAction.reset().fadeIn(0.35).play();

          let settled = false;
          const settleToIdle = () => {
            if (settled) return;
            settled = true;
            greetAction.fadeOut(0.5);
            introPhase = 'idle';
            setBaseAction(floatingRef.current ? floatAction : idleAction);
          };
          mixer.addEventListener('finished', (e: any) => {
            if (e.action === greetAction) settleToIdle();
          });
          greetTimer = window.setTimeout(
            settleToIdle,
            Math.max(0, (greetAction.getClip().duration - 0.4) * 1000),
          );
        }
      }

      // ── End-of-page emote: drive the bottom state machine ──
      // All transitions go through setBaseAction below, which cross-fades the
      // previous action out — so no action is ever left playing underneath
      // (that orphaned-action blend was why the legs didn't return to float).
      if (!floatingRef.current && bottomState !== 'none') {
        bottomState = 'none';                 // scrolled back up to the hero
        clearTimeout(endTimer);
      } else if (introPhase === 'idle' && floatingRef.current && endAction) {
        if (atBottom && bottomState === 'none') {
          // Reached the bottom — play Track 14 once.
          bottomState = 'playing';
          setBaseAction(endAction);
          clearTimeout(endTimer);
          const dur = endAction.getClip().duration;
          endTimer = window.setTimeout(() => {
            bottomState = 'resting';
          }, Math.max(400, (dur - 0.2) * 1000));
        } else if (!atBottom && bottomState !== 'none') {
          // Scrolled away from the bottom — back to floating.
          bottomState = 'none';
          clearTimeout(endTimer);
        }
      }

      if (introPhase === 'idle' && !dizzyActive && !clickEmoteActive) {
        if (bottomState === 'playing') {
          // endAction is playing — don't override it.
        } else if (bottomState === 'resting') {
          setBaseAction(idleAction);           // stand in the corner until scroll-up
        } else {
          setBaseAction(floatingRef.current ? floatAction : idleAction);
        }
      }

      // ── Dizziness: shake the mouse fast on the hero screen to trigger ──
      if (dizzyCooldown > 0) dizzyCooldown -= dt;
      pointerSpeed = Math.max(0, pointerSpeed - dt * 8);   // decay when still
      if (dizzyActive && floatingRef.current) {
        endDizzy();                                        // never dizzy while floating
      } else if (
        introPhase === 'idle' && !floatingRef.current &&
        !dizzyActive && dizzyCooldown <= 0 && dizzyAction
      ) {
        // SPEED_TRIGGER ≈ 2.2 px/ms is a brisk flick; charge fills after ~0.6s
        // of sustained fast movement so a single twitch won't set it off.
        if (pointerSpeed > 2.2) dizzyCharge = Math.min(1, dizzyCharge + dt * 1.8);
        else                    dizzyCharge = Math.max(0, dizzyCharge - dt * 1.2);
        if (dizzyCharge >= 1) startDizzy();
      }

      // 3D halo: follow the head's position AND orientation so the stars/rings
      // tilt with the head when he falls — instead of staying screen-upright.
      if (dizzyHalo) {
        haloOpacity += ((dizzyActive ? 1 : 0) - haloOpacity) * 0.12;
        const vis = haloOpacity > 0.01;
        dizzyHalo.group.visible = vis;
        if (vis && headBone) {
          // deltaQuat = how far the head has rotated from its neutral pose.
          headBone.getWorldQuaternion(_haloQuat);
          _headRestInv.copy(headRestWorld).invert();
          _deltaQuat.multiplyQuaternions(_haloQuat, _headRestInv);
          // Sit the halo above the head along the head's (rotated) up axis.
          _haloUp.set(0, 1, 0).applyQuaternion(_deltaQuat).multiplyScalar(dizzyHaloOffset);
          headBone.getWorldPosition(_headPos);
          dizzyHalo.group.position.copy(_headPos).add(_haloUp);
          dizzyHalo.group.quaternion.copy(_deltaQuat);   // ring plane tilts with head
          dizzyHalo.spinner.rotation.y += dt * 3.2;       // stars orbit
          for (const m of dizzyHalo.mats) m.opacity = (m.userData.base ?? 1) * haloOpacity;
        }
      }

      // Two distinct tracking modes so floating and hero never share the same
      // sensitivity.
      let nextYaw  = 0;
      let nextPitch = 0;

      if (!lookLocked) {
        if (floatingRef.current) {
          // Floating corner: track relative to the widget's OWN on-screen
          // centre, not the viewport centre — the avatar sits on the right, so
          // its neutral gaze point is itself. The widget is position:fixed, so
          // its rect is scroll-safe. Pitch is flipped vs standing because the
          // world-space look-at applies the nod in the opposite sense here.
          let fx = 0, fy = 0;
          if (hasCursor) {
            const rect = container.getBoundingClientRect();
            const cx = rect.left + rect.width  / 2;
            const cy = rect.top  + rect.height / 2;
            fx = clamp1((pointerClientX - cx) / (window.innerWidth  * 0.5));
            fy = clamp1((pointerClientY - cy) / (window.innerHeight * 0.5));
          }
          nextYaw   = Math.sign(fx) * Math.pow(Math.abs(fx), 0.9) * MAX_YAW;
          nextPitch = (fy) * MAX_PITCH;
        } else {
          // Hero section: full natural cursor tracking.
          const curvedX = Math.sign(targetX) * Math.pow(Math.abs(targetX), 0.9);
          nextYaw   = THREE.MathUtils.clamp(curvedX * MAX_YAW, -MAX_YAW, MAX_YAW);
          nextPitch = (-targetY) * MAX_PITCH;
        }
      }

      const lookEase = 0.8;
      curYaw   += (nextYaw   - curYaw)   * lookEase;
      curPitch += (nextPitch - curPitch) * lookEase;

      // Gently rotate the whole body toward the cursor direction (standing
      // only). Skipped while floating — there we want the head to track, not
      // the body to swivel, and a fixed body keeps the world look-at stable.
      if (!floatingRef.current && (introPhase === 'idle' || introPhase === 'preview') && modelRoot) {
        const bodyTarget = BASE_MODEL_YAW - curYaw * 0.38;
        modelRoot.rotation.y += (bodyTarget - modelRoot.rotation.y) * 0.04;
      }

      if (floatingRef.current && headBone && bottomState !== 'playing') {
        // ── FLOATING: absolute world-space look-at on the head ──
        // (Skipped while the end-of-page emote plays so it owns the head.)
        // The float emote curls the spine forward, so the head's PARENT chain
        // already points at the floor. Adding a local offset can't beat that.
        // Instead we set the head's desired WORLD orientation = neutral facing
        // rotated by the cursor yaw/pitch (in world axes: Y = horizontal turn,
        // X = vertical nod), then convert back to local space given the curled
        // parent. Result: the head looks exactly where the cursor is, up or
        // down, regardless of how the body is floating.
        _yawQuat.setFromAxisAngle(_yawAxis, THREE.MathUtils.clamp(curYaw, -MAX_YAW, MAX_YAW));
        _pitchQuat.setFromAxisAngle(_pitchAxis, THREE.MathUtils.clamp(curPitch, -MAX_PITCH, MAX_PITCH));
        _lookQuat.multiplyQuaternions(_yawQuat, _pitchQuat);
        _desiredWorld.multiplyQuaternions(_lookQuat, headRestWorld);

        // Ease the neck twist bones toward their neutral pose so the
        // head-to-shoulders line stays natural rather than kinked. Do this
        // before reading the parent's world matrix so it reflects the change.
        for (const { bone } of lookBones) {
          if (bone === headBone) continue;
          const rest = boneRestQuats.get(bone);
          if (rest) bone.quaternion.slerp(rest, 0.5);
        }

        // local = parentWorld⁻¹ · desiredWorld
        headBone.parent.updateWorldMatrix(true, false);
        headBone.parent.getWorldQuaternion(_parentWorld);
        headBone.quaternion.copy(_parentWorld.invert()).multiply(_desiredWorld);
      } else if (!floatingRef.current) {
        // ── STANDING: distribute a gentle look across the neck chain ──
        for (const { bone, weight } of lookBones) {
          applyLook(bone, curYaw * weight, curPitch * weight);
        }
      }

      renderer.render(scene, camera);
    };
    clock.start();
    tick();

    // ── Resize (track the container, not just the window) ─────────────
    const onResize = () => {
      const w = container.clientWidth, h = container.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    return () => {
      destroyed = true;
      clearTimeout(greetTimer);
      clearTimeout(dizzyTimer);
      clearTimeout(endTimer);
      clearTimeout(clickEmoteTimer);
      cancelAnimationFrame(animId);
      ro.disconnect();
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('click', onAvatarClick);
      if (dizzyHalo) {
        dizzyHalo.group.traverse((o: any) => o.geometry?.dispose?.());
        for (const m of dizzyHalo.mats) m.dispose();
        dizzyHalo.tex.dispose();
        scene.remove(dizzyHalo.group);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={
        isFloating
          ? 'pointer-events-none fixed bottom-24 right-4 z-40 h-[220px] w-[170px] transition-all duration-500 sm:bottom-24 sm:right-8 sm:h-[280px] sm:w-[220px]'
          : 'relative h-full w-full transition-all duration-500'
      }
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Dizziness halo is rendered in 3D inside the canvas (stars + rings that
          follow the head's orientation), so there is no DOM overlay here. */}

      {/* Lightweight loading / error states */}
      {status === 'loading' && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-white/15 border-t-cyan-300 animate-spin" />
        </div>
      )}
      {status === 'error' && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="text-xs text-white/40">Avatar unavailable</p>
        </div>
      )}
    </div>
  );
}
