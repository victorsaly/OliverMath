<template>
  <div
    ref="host"
    class="robot3d"
    :style="{ width: size, height: size }"
  >
    <canvas ref="canvas" class="robot3d-canvas"></canvas>
  </div>
</template>

<script>
/**
 * Robot3D - a WebGL robot that mirrors the bot state machine.
 *
 * Uses RobotExpressive.glb (CC0 1.0, Tomás Laulhé; facial morph targets added
 * by Don McCurdy) which ships 14 animation clips and three morph targets.
 *
 * three.js is loaded with a dynamic import so it stays out of the entry chunk.
 * If WebGL is missing or the model fails to load we emit 'unsupported' and the
 * parent falls back to the Lottie robot.
 */

// State -> presentation. Every state the botState validator allows is mapped,
// so no state silently falls back to looking like another one.
//
// clip:  animation clip from the GLB
// once:  play a single time and hold the last frame, then settle back to Idle
// morph: facial morph target, 0-1
// color: the state light. This is the only signal a pre-reading child can read
//        without motion, so no two adjacent states share one.
// halo:  pulse the ring on the FLOOR with audioLevel, to show we can hear the
//        child. On the floor rather than floating behind the head, so the scene
//        keeps looking like a place.
// Note: no procedural mouth or eyes. Bolting flat discs onto this low-poly
// model fought its art direction - it is designed with solid black eyes and no
// mouth. Expression comes from the rig's own morph targets, the body clips, the
// state colour and the floor ring instead.
const STATES = {
  // Waiting for Play: the robot strolls and the ground scrolls under it, so the
  // idle screen reads as "going somewhere" rather than a frozen model.
  neutral:   { clip: 'Walking',  color: 0x4ce6ff, speed: 1, walk: true },
  sleepy:    { clip: 'Sitting',  color: 0x5980b2, speed: 0.5 },
  listening: { clip: 'Idle',     color: 0x33e666, speed: 1, halo: true, lean: 0.12 },
  speaking:  { clip: 'Idle',     color: 0x4cd9ff, speed: 1, bob: true },
  thinking:  { clip: 'Idle',     color: 0xffb432, speed: 0.6, lookUp: 0.18, orbit: true },
  computing: { clip: 'Idle',     color: 0xffb432, speed: 0.6, lookUp: 0.18, orbit: true },
  happy:     { clip: 'Yes',      color: 0x33e666, speed: 1, once: true },
  proud:     { clip: 'ThumbsUp', color: 0xffd700, speed: 1, once: true },
  excited:   { clip: 'Dance',    color: 0xffd700, speed: 1.2 },
  laughing:  { clip: 'Jump',     color: 0xffd700, speed: 1, once: true },
  // Deliberately NOT a celebration: 'surprised' fires before a question is
  // asked, so a reward animation here would teach the child the star is noise.
  surprised: { clip: 'Idle',     color: 0xffffff, speed: 1, morph: 'Surprised' },
  sad:       { clip: 'No',       color: 0x5980b2, speed: 1, once: true, morph: 'Sad' },
  // 'confused' means "I did not hear you" - a head shake, not the thinking pose,
  // so it never reads as "you were wrong".
  confused:  { clip: 'No',       color: 0xffb432, speed: 0.7, once: true, morph: 'Surprised' },
  // 'broken' is a system failure, visually distinct from a wrong answer.
  broken:    { clip: 'Death',    color: 0xeb445a, speed: 1, once: true, morph: 'Sad' }
};

const MODEL_URL = `${import.meta.env.BASE_URL}models/RobotExpressive.glb`;

// States whose animation is carried by the body rather than the face, so the
// camera pulls back for them. Everything else is about expression, where a
// close framing reads far better on a phone.
// 'neutral' is in here because the idle state now walks - a walk is invisible
// in a head-and-shoulders close-up.
const BODY_VIEW_STATES = new Set([
  'neutral', 'excited', 'laughing', 'proud', 'broken', 'sleepy'
]);

export default {
  name: 'Robot3D',
  props: {
    botState: { type: String, default: 'neutral' },
    audioLevel: { type: Number, default: 0 },
    size: { type: String, default: '200px' },
    // 'auto' picks per state; 'face' and 'full' pin the framing.
    view: {
      type: String,
      default: 'auto',
      validator: (v) => ['auto', 'face', 'full'].includes(v)
    },
    // Fraction of the frame kept clear above the robot for the speech bubble.
    // 0 fills the frame; 0.5 leaves a third of the height empty at the top.
    headroom: { type: Number, default: 0.1 },
    // Fraction kept clear BELOW the robot, so the dock at the bottom of the
    // screen does not sit over its legs.
    footroom: { type: Number, default: 0.24 }
  },
  emits: ['unsupported', 'ready', 'anchor'],
  data() {
    return { reducedMotion: false };
  },
  computed: {
    config() {
      return STATES[this.botState] || STATES.neutral;
    },
    activeView() {
      if (this.view !== 'auto') return this.view;
      return BODY_VIEW_STATES.has(this.botState) ? 'full' : 'face';
    }
  },
  watch: {
    botState() {
      this.applyState();
    },
    // The bubble appears and disappears between questions, so the amount of
    // reserved space changes with it.
    headroom() {
      this.computeFraming();
    },
    footroom() {
      this.computeFraming();
    }
  },
  async mounted() {
    this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.reducedMotion = this.motionQuery.matches;
    this.onMotionChange = (e) => {
      this.reducedMotion = e.matches;
      this.applyState();
    };
    this.motionQuery.addEventListener('change', this.onMotionChange);

    try {
      await this.initScene();
    } catch (err) {
      console.warn('Robot3D unavailable, falling back to 2D:', err);
      this.$emit('unsupported');
    }
  },
  beforeUnmount() {
    this.teardown();
  },
  methods: {
    async initScene() {
      const THREE = await import('three');
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
      this.THREE = THREE;

      const canvas = this.$refs.canvas;
      if (!canvas) throw new Error('canvas gone before init');

      this.renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true
      });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;

      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);

      // Soft, even light. No shadow maps - this runs on a child's phone.
      this.scene.add(new THREE.HemisphereLight(0xffffff, 0x444466, 2.2));
      const key = new THREE.DirectionalLight(0xffffff, 1.6);
      key.position.set(2, 4, 3);
      this.scene.add(key);

      // Thinking dots that orbit the head.
      this.orbit = new THREE.Group();
      const dotGeo = new THREE.SphereGeometry(0.055, 10, 10);
      this.orbitDots = [0, 1, 2].map((i) => {
        const dot = new THREE.Mesh(
          dotGeo,
          new THREE.MeshBasicMaterial({ color: 0xffb432, transparent: true, opacity: 0.9 })
        );
        const a = (i / 3) * Math.PI * 2;
        dot.position.set(Math.cos(a) * 0.42, 0, Math.sin(a) * 0.42);
        this.orbit.add(dot);
        return dot;
      });
      this.orbit.visible = false;
      this.scene.add(this.orbit);

      const gltf = await new Promise((resolve, reject) => {
        new GLTFLoader().load(MODEL_URL, resolve, undefined, reject);
      });

      this.model = gltf.scene;
      this.scene.add(this.model);

      // The GLB contains BOTH a bone and a mesh named 'Head'. The bone is what
      // we rotate; the morph targets live on the mesh. getObjectByName('Head')
      // returns the bone, so the morph mesh has to be found by capability.
      // This runs before framing because the face view is measured from the
      // head's real bounds.
      this.neck = this.model.getObjectByName('Neck');
      this.model.traverse((o) => {
        if (o.isMesh && o.morphTargetDictionary && !this.morphMesh) {
          this.morphMesh = o;
        }
        // Tint the body material so the state colour reads on the robot itself,
        // not just on the ring.
        if (o.isMesh && o.material && o.material.name === 'Main') {
          o.material = o.material.clone();
          this.bodyMaterial = o.material;
        }
      });

      // Frame from the model's own bounds rather than hardcoded numbers, so a
      // different GLB can be dropped in without retuning the camera.
      const box = new THREE.Box3().setFromObject(this.model);
      const sizeVec = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      // Measure the head itself instead of guessing a fraction of the body.
      // Guessing put the camera at the jaw, showing chest and no face.
      const headBox = this.morphMesh
        ? new THREE.Box3().setFromObject(this.morphMesh)
        : null;

      this.bounds = {
        center,
        sizeVec,
        maxY: box.max.y,
        headSize: headBox ? headBox.getSize(new THREE.Vector3()) : null,
        headCenter: headBox ? headBox.getCenter(new THREE.Vector3()) : null
      };

      this.computeFraming();
      const start = this.framing[this.activeView];
      this.lookTarget = start.target.clone();
      this.camera.position.copy(start.pos);
      this.camera.lookAt(this.lookTarget);

      this.orbit.position.set(0, box.max.y + sizeVec.y * 0.1, 0);
      this.baseRotation = this.model.rotation.y;
      this.createEnvironment(box, sizeVec);
      this.createFaceAnchor();
      this.bindPointer();

      this.mixer = new THREE.AnimationMixer(this.model);
      this.actions = {};
      gltf.animations.forEach((clip) => {
        const action = this.mixer.clipAction(clip);
        this.actions[clip.name] = action;
      });

      this.clock = new THREE.Clock();
      this.resize();
      this.observeSize();
      this.observeVisibility();
      this.applyState();
      this.start();
      this.$emit('ready');
    },

    /**
     * Cross-fade to the clip for the current state and set the colour + face.
     * Playback is driven only by botState - never by isPlayMode - so the robot
     * cannot end up frozen mid-turn.
     */
    applyState() {
      if (!this.mixer || !this.THREE) return;
      const cfg = this.config;
      const THREE = this.THREE;

      // Under reduced motion we hold the Idle pose and let colour and the face
      // carry the state, so no information is lost - only the movement is.
      const clipName = this.reducedMotion ? 'Idle' : cfg.clip;
      const next = this.actions[clipName] || this.actions.Idle;

      if (next && next !== this.current) {
        next.reset();
        next.enabled = true;
        next.timeScale = this.reducedMotion ? 0 : cfg.speed;
        if (cfg.once && !this.reducedMotion) {
          next.setLoop(THREE.LoopOnce, 1);
          next.clampWhenFinished = true;
        } else {
          next.setLoop(THREE.LoopRepeat, Infinity);
          next.clampWhenFinished = false;
        }
        next.fadeIn(0.25).play();
        if (this.current) this.current.fadeOut(0.25);
        this.current = next;

        // One-shot states settle back to a looping Idle on their own.
        clearTimeout(this.settleTimer);
        if (cfg.once && !this.reducedMotion) {
          const ms = next.getClip().duration * 1000 / (cfg.speed || 1);
          this.settleTimer = setTimeout(() => {
            if (this.config.once) this.settleToIdle();
          }, ms + 120);
        }
      } else if (next) {
        next.timeScale = this.reducedMotion ? 0 : cfg.speed;
      }

      if (this.floorRing) this.floorRing.material.color.setHex(cfg.color);

      if (this.bodyMaterial) {
        this.bodyMaterial.emissive = new THREE.Color(cfg.color);
        this.bodyMaterial.emissiveIntensity = 0.22;
      }
      if (this.orbit) this.orbit.visible = !!cfg.orbit;
      this.applyMorph(cfg.morph);
    },

    settleToIdle() {
      const idle = this.actions.Idle;
      if (!idle || !this.THREE) return;
      idle.reset();
      idle.setLoop(this.THREE.LoopRepeat, Infinity);
      idle.clampWhenFinished = false;
      idle.timeScale = 1;
      idle.fadeIn(0.3).play();
      if (this.current && this.current !== idle) this.current.fadeOut(0.3);
      this.current = idle;
    },

    applyMorph(name) {
      this.baseMorphName = name || null;
      this.updateMorphs();
    },

    setTalkMorph(amount) {
      if (this.talkAmount === amount) return;
      this.talkAmount = amount;
      this.updateMorphs();
    },

    /**
     * One place that writes morph influences, so the state expression and the
     * speech movement cannot fight each other. 'Surprised' doubles as the
     * talking shape because it opens the face.
     */
    updateMorphs() {
      const mesh = this.morphMesh;
      if (!mesh || !mesh.morphTargetDictionary) return;
      const dict = mesh.morphTargetDictionary;
      const talk = this.talkAmount || 0;

      Object.keys(dict).forEach((key) => {
        let value = key === this.baseMorphName ? 1 : 0;
        if (key === 'Surprised') value = Math.max(value, talk);
        mesh.morphTargetInfluences[dict[key]] = value;
      });
    },

    /**
     * Work out the two camera framings for the CURRENT aspect ratio.
     *
     * The canvas is full-bleed, so it is usually tall and narrow on a phone and
     * wide on a desktop. Fitting by vertical FOV alone would crop the robot
     * sideways on a narrow screen, so each framing takes whichever distance is
     * larger - the one that fits the height, or the one that fits the width.
     * The margin is deliberately tight (1.02) so the robot fills as much of the
     * available space as it can without clipping.
     *
     * Recomputed on resize, which is why it reads from this.bounds rather than
     * capturing values at load.
     */
    computeFraming() {
      const THREE = this.THREE;
      if (!THREE || !this.bounds || !this.camera) return;

      const { center, sizeVec, maxY, headSize, headCenter } = this.bounds;
      const halfFov = (this.camera.fov * Math.PI) / 180 / 2;
      const aspect = this.camera.aspect || 1;

      // Distance at which a subject of the given height and width is fully
      // visible in both axes.
      const fit = (height, width, margin) => {
        const forHeight = (height / 2) / Math.tan(halfFov);
        const forWidth = (width / 2) / (Math.tan(halfFov) * aspect);
        return Math.max(forHeight, forWidth) * margin;
      };

      const bodyWidth = Math.max(sizeVec.x, sizeVec.z);
      const faceHeight = headSize ? headSize.y * 1.9 : sizeVec.y * 0.45;
      const faceWidth = headSize ? headSize.x * 2.2 : sizeVec.x * 0.9;
      const faceY = headCenter ? headCenter.y : maxY - sizeVec.y * 0.18;

      // The speech bubble occupies the top of the screen, so the scene reserves
      // room for it instead of letting the two collide. Looking ABOVE the
      // subject pushes the subject down the frame; the extra fitted height is
      // the empty band that leaves at the top.
      // Headroom pushes the robot down the frame, footroom pushes it up. The
      // difference is how far the camera looks off-centre; the sum is the extra
      // height it has to fit, which is the empty space at top and bottom.
      const HEADROOM = this.headroom;
      const FOOTROOM = this.footroom;
      const lift = sizeVec.y * (HEADROOM - FOOTROOM) * 0.5;

      this.framing = {
        full: {
          pos: new THREE.Vector3(
            0,
            center.y + lift,
            fit(sizeVec.y * (1 + HEADROOM + FOOTROOM), bodyWidth, 1.04)
          ),
          target: new THREE.Vector3(0, center.y + lift, 0)
        },
        face: {
          pos: new THREE.Vector3(
            0,
            faceY + faceHeight * HEADROOM * 0.5,
            fit(faceHeight * (1 + HEADROOM), faceWidth, 1.06)
          ),
          target: new THREE.Vector3(0, faceY + faceHeight * HEADROOM * 0.5, 0)
        }
      };
    },
    /**
     * A ground the robot stands on and a soft backdrop behind it, so it reads
     * as being somewhere rather than floating. The ground texture scrolls while
     * the Walking clip plays, which is what sells the movement - the robot
     * itself stays at the origin.
     *
     * Both are drawn into canvases rather than loaded as images: no extra
     * network requests, and they recolour per state for free.
     */
    createEnvironment(box, sizeVec) {
      const THREE = this.THREE;
      const floorY = box.min.y;
      const HORIZON = 0x2f3c66;

      // Fog is what makes this read as a place rather than a plane: the ground
      // dissolves into the sky at distance instead of ending on a hard edge.
      this.scene.fog = new THREE.Fog(HORIZON, sizeVec.y * 2.2, sizeVec.y * 9);

      // Ground: subtle tonal variation plus a faint grid, so the scroll is
      // readable as travel without turning into a strobing stripe pattern.
      const gc = document.createElement('canvas');
      gc.width = 128;
      gc.height = 128;
      const g = gc.getContext('2d');
      g.fillStyle = '#24314e';
      g.fillRect(0, 0, 128, 128);
      for (let i = 0; i < 420; i++) {
        const v = 28 + Math.random() * 26;
        g.fillStyle = `rgba(${v + 14},${v + 22},${v + 42},0.55)`;
        g.fillRect(Math.random() * 128, Math.random() * 128, 2.5, 2.5);
      }
      g.strokeStyle = 'rgba(126,163,214,0.14)';
      g.lineWidth = 1;
      g.strokeRect(0.5, 0.5, 127, 127);
      this.groundTexture = new THREE.CanvasTexture(gc);
      this.groundTexture.wrapS = THREE.RepeatWrapping;
      this.groundTexture.wrapT = THREE.RepeatWrapping;
      this.groundTexture.repeat.set(10, 10);
      this.groundTexture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();

      this.ground = new THREE.Mesh(
        new THREE.PlaneGeometry(sizeVec.y * 16, sizeVec.y * 16),
        new THREE.MeshBasicMaterial({ map: this.groundTexture, fog: true })
      );
      this.ground.rotation.x = -Math.PI / 2;
      this.ground.position.y = floorY;
      this.scene.add(this.ground);

      // Sky: a dusk gradient with a sun and two mountain ranges, painted into a
      // canvas. Two ranges rather than one because the lighter, higher range
      // behind the darker one is what creates the sense of distance.
      const sc = document.createElement('canvas');
      sc.width = 1024;
      sc.height = 512;
      const s = sc.getContext('2d');

      // Deterministic noise, so the sky is identical on every reload.
      let seed = 20260101;
      const rand = () => {
        seed = (seed * 1103515245 + 12345) % 2147483648;
        return seed / 2147483648;
      };

      const sky = s.createLinearGradient(0, 0, 0, 512);
      sky.addColorStop(0, '#0a1230');
      sky.addColorStop(0.3, '#23356e');
      sky.addColorStop(0.56, '#5b5c9e');
      sky.addColorStop(0.74, '#a96f96');
      sky.addColorStop(0.86, '#e79a74');
      sky.addColorStop(0.95, '#f7c489');
      sky.addColorStop(1, '#fbe0ad');
      s.fillStyle = sky;
      s.fillRect(0, 0, 1024, 512);

      // Stars, fading out as the sky brightens towards the horizon.
      for (let i = 0; i < 260; i++) {
        const sx = rand() * 1024;
        const sy = rand() * 300;
        const fade = 1 - sy / 300;
        s.fillStyle = `rgba(255,255,255,${(0.15 + rand() * 0.6) * fade})`;
        const r = rand() * 1.5 + 0.4;
        s.beginPath();
        s.arc(sx, sy, r, 0, Math.PI * 2);
        s.fill();
      }

      // Sun, low and warm, with a wide bloom.
      const sunX = 700;
      const sunY = 362;
      const glow = s.createRadialGradient(sunX, sunY, 4, sunX, sunY, 230);
      glow.addColorStop(0, 'rgba(255,241,205,0.98)');
      glow.addColorStop(0.18, 'rgba(255,206,142,0.5)');
      glow.addColorStop(1, 'rgba(255,170,110,0)');
      s.fillStyle = glow;
      s.fillRect(sunX - 240, sunY - 240, 480, 480);
      s.fillStyle = '#fff6dc';
      s.beginPath();
      s.arc(sunX, sunY, 30, 0, Math.PI * 2);
      s.fill();

      // Soft cloud bands, lit from the sun side.
      const cloud = (cx0, cy0, w0, h0, alpha) => {
        const g2 = s.createRadialGradient(cx0, cy0, 2, cx0, cy0, w0);
        g2.addColorStop(0, `rgba(255,214,196,${alpha})`);
        g2.addColorStop(1, 'rgba(255,214,196,0)');
        s.fillStyle = g2;
        s.save();
        s.translate(cx0, cy0);
        s.scale(1, h0 / w0);
        s.beginPath();
        s.arc(0, 0, w0, 0, Math.PI * 2);
        s.fill();
        s.restore();
      };
      for (let i = 0; i < 9; i++) {
        cloud(rand() * 1024, 250 + rand() * 120, 70 + rand() * 150, 14 + rand() * 20, 0.1 + rand() * 0.16);
      }

      // Mountain ranges. Each is a random walk clamped around a base height,
      // drawn from the shared deterministic seed so the horizon never changes
      // between reloads.
      const ridge = (baseY, amp, step, fill) => {
        s.fillStyle = fill;
        s.beginPath();
        s.moveTo(0, 512);
        let y = baseY;
        for (let x = 0; x <= 1024; x += step) {
          y += (rand() - 0.5) * amp;
          y = Math.max(baseY - amp * 1.6, Math.min(baseY + amp * 1.2, y));
          s.lineTo(x, y);
        }
        s.lineTo(1024, 512);
        s.closePath();
        s.fill();
      };

      // Three ranges with haze between them: the further back, the lighter and
      // bluer, which is what actually reads as distance.
      ridge(352, 40, 72, '#6b7bb0');
      const haze = s.createLinearGradient(0, 330, 0, 430);
      haze.addColorStop(0, 'rgba(226,186,186,0)');
      haze.addColorStop(1, 'rgba(226,186,186,0.32)');
      s.fillStyle = haze;
      s.fillRect(0, 330, 1024, 100);
      ridge(384, 30, 56, '#495a93');
      ridge(416, 22, 44, '#2b375f');

      this.skyTexture = new THREE.CanvasTexture(sc);
      this.skyTexture.colorSpace = THREE.SRGBColorSpace;

      // The ridges are painted in the lower third of the texture, so the plane
      // is placed with that third straddling the floor line - otherwise the
      // mountains sit below the horizon and are never seen, which is exactly
      // what happened with the first attempt.
      const skyH = sizeVec.y * 11;
      this.sky = new THREE.Mesh(
        new THREE.PlaneGeometry(skyH * 2, skyH),
        new THREE.MeshBasicMaterial({ map: this.skyTexture, fog: false, depthWrite: false })
      );
      this.sky.position.set(0, floorY + skyH * 0.3, -sizeVec.y * 7);
      this.scene.add(this.sky);

      // Contact shadow. A soft dark blob under the feet does more for the sense
      // of the robot being grounded than any amount of lighting work, and costs
      // one textured quad instead of a shadow map.
      const shc = document.createElement('canvas');
      shc.width = 128;
      shc.height = 128;
      const sh = shc.getContext('2d');
      const blob = sh.createRadialGradient(64, 64, 2, 64, 64, 62);
      blob.addColorStop(0, 'rgba(0,0,0,0.55)');
      blob.addColorStop(0.55, 'rgba(0,0,0,0.22)');
      blob.addColorStop(1, 'rgba(0,0,0,0)');
      sh.fillStyle = blob;
      sh.fillRect(0, 0, 128, 128);
      this.shadowTexture = new THREE.CanvasTexture(shc);

      this.contactShadow = new THREE.Mesh(
        new THREE.PlaneGeometry(sizeVec.y * 0.85, sizeVec.y * 0.85),
        new THREE.MeshBasicMaterial({
          map: this.shadowTexture,
          transparent: true,
          depthWrite: false,
          fog: false
        })
      );
      this.contactShadow.rotation.x = -Math.PI / 2;
      this.contactShadow.position.set(0, floorY + sizeVec.y * 0.004, 0);
      this.scene.add(this.contactShadow);

      // The listening indicator now lies ON the floor rather than floating
      // behind the robot's head. Same information, no hovering circle.
      this.floorRing = new THREE.Mesh(
        new THREE.RingGeometry(sizeVec.y * 0.34, sizeVec.y * 0.4, 56),
        new THREE.MeshBasicMaterial({
          color: 0x33e666,
          transparent: true,
          opacity: 0,
          side: THREE.DoubleSide,
          depthWrite: false,
          fog: false
        })
      );
      this.floorRing.rotation.x = -Math.PI / 2;
      this.floorRing.position.set(0, floorY + sizeVec.y * 0.008, 0);
      this.scene.add(this.floorRing);

      this.createFloatingMath(floorY, sizeVec);
    },

    /**
     * Digits and operators drifting through the background. This is the scene
     * saying what the app is for: without it the robot could be advertising
     * anything. Kept faint and slow so it never competes with the question.
     */
    createFloatingMath(floorY, sizeVec) {
      const THREE = this.THREE;
      const GLYPHS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '−', '×', '÷', '='];

      const textureFor = (glyph) => {
        const c = document.createElement('canvas');
        c.width = 128;
        c.height = 128;
        const x = c.getContext('2d');
        x.font = 'bold 92px ui-rounded, system-ui, sans-serif';
        x.textAlign = 'center';
        x.textBaseline = 'middle';
        x.fillStyle = '#cfe4ff';
        x.fillText(glyph, 64, 70);
        const tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
      };

      this.mathTextures = GLYPHS.map(textureFor);
      this.mathSprites = [];

      for (let i = 0; i < 16; i++) {
        const tex = this.mathTextures[i % this.mathTextures.length];
        const sprite = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: tex,
            transparent: true,
            opacity: 0.1 + Math.random() * 0.16,
            depthWrite: false,
            fog: false
          })
        );
        const scale = sizeVec.y * (0.16 + Math.random() * 0.2);
        sprite.scale.set(scale, scale, 1);
        sprite.position.set(
          (Math.random() - 0.5) * sizeVec.y * 6,
          floorY + sizeVec.y * (0.3 + Math.random() * 2.4),
          -sizeVec.y * (1.2 + Math.random() * 3.4)
        );
        sprite.userData.speed = sizeVec.y * (0.025 + Math.random() * 0.045);
        sprite.userData.sway = Math.random() * Math.PI * 2;
        this.scene.add(sprite);
        this.mathSprites.push(sprite);
      }

      this.mathCeiling = floorY + sizeVec.y * 3;
      this.mathFloor = floorY + sizeVec.y * 0.2;
    },
    /**
     * Measures the head in world space to find the point the speech bubble
     * should point at.
     */
    createFaceAnchor() {
      const THREE = this.THREE;
      const face = this.morphMesh;
      if (!face) return;

      this.model.updateWorldMatrix(true, true);
      const box = new THREE.Box3().setFromObject(face);
      const h = box.max.y - box.min.y;
      const cx = (box.min.x + box.max.x) / 2;

      // Where the speech bubble should point: just above the crown, stored in
      // the model's local space so it survives the model being rotated.
      this.headAnchorPoint = this.model.worldToLocal(
        new THREE.Vector3(cx, box.max.y + h * 0.26, box.max.z)
      );
    },

    /**
     * Track the pointer so the robot can look at it. Normalised to -1..1 across
     * the canvas. Touch devices have no hover, so the gaze simply stays centred
     * there - the idle sway below keeps it alive either way.
     */
    bindPointer() {
      this.pointer = { x: 0, y: 0 };
      this.onPointerMove = (e) => {
        const host = this.$refs.host;
        if (!host) return;
        const r = host.getBoundingClientRect();
        if (!r.width || !r.height) return;
        this.pointer.x = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
        this.pointer.y = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
      };
      window.addEventListener('pointermove', this.onPointerMove, { passive: true });
    },


    start() {
      if (this.frame) return;
      const loop = () => {
        this.frame = requestAnimationFrame(loop);
        this.render();
      };
      this.frame = requestAnimationFrame(loop);
    },

    stop() {
      if (this.frame) cancelAnimationFrame(this.frame);
      this.frame = null;
    },

    render() {
      const delta = this.clock.getDelta();
      const t = this.clock.elapsedTime;
      const cfg = this.config;
      if (this.mixer) this.mixer.update(delta);

      if (!this.reducedMotion) {
        // Speaking bobs the head; listening leans in and pulses the ring with
        // the amplitude we are given. These are what separate "I am talking"
        // from "it is your turn" - the distinction the 2D robot lost.
        // Gaze. The head turns a little towards the pointer and the eyes move
        // further, which is how real gaze reads - eyes lead, head follows. When
        // thinking, the robot looks away and up instead, because being stared
        // at while it "thinks" undercuts the whole gesture.
        const p = this.pointer || { x: 0, y: 0 };
        const idleSway = Math.sin(t * 0.7) * 0.06;
        const gazeX = cfg.lookUp ? idleSway : p.x * 0.45 + idleSway * 0.3;
        const gazeY = cfg.lookUp ? -cfg.lookUp : p.y * 0.22;

        if (this.neck) {
          const bob = cfg.bob ? Math.sin(t * 9) * 0.06 * (0.35 + this.audioLevel) : 0;
          this.neck.rotation.x = bob + gazeY * 0.5 + (cfg.lookUp ? Math.sin(t * 1.4) * 0.05 : 0);
          this.neck.rotation.y = gazeX * 0.45;
        }

        if (this.model) {
          const lean = cfg.lean ? cfg.lean : 0;
          this.model.rotation.x = lean;
          this.model.rotation.y =
            this.baseRotation + (cfg.orbit ? Math.sin(t * 0.6) * 0.12 : 0);
        }
        if (this.orbit && cfg.orbit) this.orbit.rotation.y = t * 1.6;
      }

      // Lip sync, through the rig rather than a bolted-on mouth. The head has
      // a 'Surprised' morph target that opens the face, so it is driven by the
      // speech amplitude while talking. audioLevel is analysed from the cached
      // TTS audio element, but speakWithBrowser() - the SpeechSynthesis
      // fallback - has no audio element and leaves it flat at 0, so fall back
      // to a synthetic jabber envelope whenever real amplitude stops arriving.
      if (this.morphMesh) {
        const speaking = this.botState === 'speaking';
        let talk = 0;
        if (speaking) {
          const amp = Math.min(Math.max(this.audioLevel, 0), 1);
          if (amp > 0.02) this.lastAmplitudeAt = t;
          const real =
            this.lastAmplitudeAt !== undefined && t - this.lastAmplitudeAt < 0.4;
          talk = real
            ? amp
            : 0.42 + Math.sin(t * 13) * 0.26 + Math.sin(t * 7.3) * 0.16;
          if (this.reducedMotion) talk = 0.5;
        }
        this.setTalkMorph(Math.max(0, Math.min(1, talk)) * 0.75);
      }

      // Scroll the ground under the walking robot. The model stays at the
      // origin; the floor moving is what reads as travelling. The camera bob is
      // small and off-phase with the step, which is what stops it looking like
      // a model sliding over a texture.
      // No camera bob: a moving camera on top of a walk cycle reads as unsteady
      // rather than lively, and it fought the framing dolly. The ground scroll
      // alone carries the travel, and the camera stays locked.
      if (cfg.walk && !this.reducedMotion && this.groundTexture) {
        this.groundTexture.offset.y -= delta * 0.45;
      }

      // Drift the background numbers upward, wrapping back to the floor. Still
      // under reduced motion - they carry no information, so they simply hang.
      if (this.mathSprites && !this.reducedMotion) {
        this.mathSprites.forEach((sprite) => {
          sprite.position.y += sprite.userData.speed * delta;
          sprite.position.x += Math.sin(t * 0.3 + sprite.userData.sway) * delta * 0.05;
          if (sprite.position.y > this.mathCeiling) {
            sprite.position.y = this.mathFloor;
          }
        });
      }

      // The listening ring on the floor swells with the child's voice. It is
      // only visible while we are actually listening, so the scene stays clean
      // the rest of the time.
      if (this.floorRing) {
        const target = cfg.halo ? 0.75 : 0;
        const current = this.floorRing.material.opacity;
        this.floorRing.material.opacity = current + (target - current) * Math.min(1, delta * 6);

        if (cfg.halo) {
          const amp = Math.min(this.audioLevel, 1);
          const scale = this.reducedMotion ? 1 : 1 + amp * 0.3 + Math.sin(t * 3.2) * 0.04;
          this.floorRing.scale.setScalar(scale);
        }
      }

      // Dolly between the face and full-body framings. Snapped rather than eased
      // under reduced motion, since a moving camera is itself motion.
      if (this.framing && this.lookTarget) {
        const want = this.framing[this.activeView];
        if (this.reducedMotion) {
          this.camera.position.copy(want.pos);
          this.lookTarget.copy(want.target);
        } else {
          const ease = 1 - Math.pow(0.0015, delta);
          this.camera.position.lerp(want.pos, ease);
          this.lookTarget.lerp(want.target, ease);
        }
        this.camera.lookAt(this.lookTarget);
      }

      // Tell the parent where the robot's head is on screen, so the speech
      // bubble can sit just above it instead of being pinned to the top of the
      // page. Only emitted when it actually moves, to avoid a parent re-render
      // on every single frame.
      if (this.headAnchorPoint && this.$refs.host) {
        const p = this.headAnchorPoint.clone();
        this.model.localToWorld(p);
        p.project(this.camera);
        const x = (p.x * 0.5 + 0.5) * 100;
        const y = (-p.y * 0.5 + 0.5) * 100;
        const last = this.lastAnchor;
        if (!last || Math.abs(last.x - x) > 0.3 || Math.abs(last.y - y) > 0.3) {
          this.lastAnchor = { x, y };
          this.$emit('anchor', { x, y });
        }
      }

      this.renderer.render(this.scene, this.camera);
    },

    resize() {
      const host = this.$refs.host;
      if (!host || !this.renderer) return;
      const w = host.clientWidth || 200;
      const h = host.clientHeight || 200;
      this.renderer.setSize(w, h, false);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      // The framing depends on the aspect ratio, so it has to follow a resize -
      // otherwise rotating a phone crops the robot.
      this.computeFraming();
    },

    observeSize() {
      this.ro = new ResizeObserver(() => this.resize());
      this.ro.observe(this.$refs.host);
    },

    // Stop rendering when the robot is off-screen or the tab is hidden, so we
    // are not draining a phone battery behind a modal.
    observeVisibility() {
      this.io = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) this.start();
        else this.stop();
      });
      this.io.observe(this.$refs.host);

      this.onVisibility = () => {
        if (document.hidden) this.stop();
        else this.start();
      };
      document.addEventListener('visibilitychange', this.onVisibility);
    },

    teardown() {
      this.stop();
      clearTimeout(this.settleTimer);
      if (this.motionQuery) this.motionQuery.removeEventListener('change', this.onMotionChange);
      if (this.onVisibility) document.removeEventListener('visibilitychange', this.onVisibility);
      if (this.onPointerMove) window.removeEventListener('pointermove', this.onPointerMove);
      if (this.ro) this.ro.disconnect();
      if (this.io) this.io.disconnect();
      if (this.mixer) this.mixer.stopAllAction();
      if (this.scene) {
        this.scene.traverse((o) => {
          if (o.isMesh) {
            o.geometry?.dispose();
            const mats = Array.isArray(o.material) ? o.material : [o.material];
            mats.forEach((m) => {
              // Canvas textures hold a GPU allocation of their own.
              m?.map?.dispose();
              m?.dispose();
            });
          }
        });
      }
      if (this.renderer) {
        this.renderer.dispose();
        this.renderer.forceContextLoss?.();
      }
      this.scene = this.model = this.mixer = this.renderer = null;
    }
  }
};
</script>

<style scoped>
.robot3d {
  display: block;
  margin: 0 auto;
}

.robot3d-canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
