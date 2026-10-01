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
// halo:  pulse the ring on the FLOOR with audioLevel. Green while listening
//        (we can hear you), blue while speaking (I am talking) - so both sides
//        of the conversation are visible with the volume all the way down.
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
  speaking:  { clip: 'Idle',     color: 0x4cd9ff, speed: 1, bob: true, halo: true },
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
    footroom: { type: Number, default: 0.24 },
    // Hex for the robot's body panels. null keeps the model's own yellow.
    bodyColor: { type: String, default: null },
    // 'auto' runs the cycle; 'day' and 'night' hold, easing there first.
    dayMode: {
      type: String,
      default: 'auto',
      validator: (v) => ['auto', 'day', 'night'].includes(v)
    }
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
    },
    bodyColor() {
      this.applyBodyColor();
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

      // Lit to match the painted sky: a cool sky/ground hemisphere, a warm key
      // coming from where the sun is drawn (back and to the right, low), and a
      // soft fill from the camera so the face never goes black. No shadow maps
      // - this runs on a child's phone.
      this.hemiLight = new THREE.HemisphereLight(0xcfe0ff, 0x3a4668, 2.4);
      this.scene.add(this.hemiLight);

      // Key from the FRONT. The previous version put the only strong light
      // behind the robot to match where the sun is painted, which backlit it
      // and left the whole front in shadow.
      const key = new THREE.DirectionalLight(0xfff1dd, 2.6);
      key.position.set(2.5, 3.5, 4);
      this.scene.add(key);
      this.keyLight = key;

      // Warm rim from the sun's direction, so the sun still shows on the robot
      // without being responsible for lighting it.
      const rim = new THREE.DirectionalLight(0xffc488, 1.5);
      rim.position.set(4, 2.2, -5);
      this.scene.add(rim);
      this.rimLight = rim;

      const fill = new THREE.DirectionalLight(0xbfd4ff, 0.75);
      fill.position.set(-3, 1.5, 3);
      this.scene.add(fill);

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
        // Several meshes share the 'Main' material - torso, head, both arms,
        // shoulders. Keeping only the last one meant a colour change repainted
        // a single limb and left the rest yellow.
        if (o.isMesh && o.material && o.material.name === 'Main') {
          o.material = o.material.clone();
          if (!this.bodyMaterials) this.bodyMaterials = [];
          this.bodyMaterials.push(o.material);
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
      this.applyBodyColor();
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

      if (this.bodyMaterials) {
        this.bodyMaterials.forEach((m) => {
          m.emissive = new THREE.Color(cfg.color);
          m.emissiveIntensity = 0.22;
        });
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

    applyBodyColor() {
      if (!this.bodyMaterials || !this.bodyColor || !this.THREE) return;
      const c = new this.THREE.Color(this.bodyColor);
      this.bodyMaterials.forEach((m) => { m.color = c.clone(); });
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

      // Sky, painted for full DAYLIGHT. The day/night cycle then multiplies a
      // tint over it, and multiply can only darken - so the brightest state has
      // to be the one in the texture.
      const sc = document.createElement('canvas');
      sc.width = 1024;
      sc.height = 512;
      const s = sc.getContext('2d');

      let seed = 20260101;
      const rand = () => {
        seed = (seed * 1103515245 + 12345) % 2147483648;
        return seed / 2147483648;
      };

      const sky = s.createLinearGradient(0, 0, 0, 512);
      sky.addColorStop(0, '#2e6fd0');
      sky.addColorStop(0.35, '#6aa6e8');
      sky.addColorStop(0.62, '#a8cdf2');
      sky.addColorStop(0.82, '#dceaf8');
      sky.addColorStop(1, '#f3f0e4');
      s.fillStyle = sky;
      s.fillRect(0, 0, 1024, 512);

      // Daytime clouds, white and soft.
      const cloud = (cx0, cy0, w0, h0, alpha) => {
        const g2 = s.createRadialGradient(cx0, cy0, 2, cx0, cy0, w0);
        g2.addColorStop(0, `rgba(255,255,255,${alpha})`);
        g2.addColorStop(1, 'rgba(255,255,255,0)');
        s.fillStyle = g2;
        s.save();
        s.translate(cx0, cy0);
        s.scale(1, h0 / w0);
        s.beginPath();
        s.arc(0, 0, w0, 0, Math.PI * 2);
        s.fill();
        s.restore();
      };
      for (let i = 0; i < 11; i++) {
        cloud(rand() * 1024, 170 + rand() * 150, 80 + rand() * 160, 16 + rand() * 24, 0.3 + rand() * 0.4);
      }

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

      // Three ranges, each darker and sharper than the one behind it.
      ridge(396, 34, 72, '#9db6d8');
      const haze = s.createLinearGradient(0, 376, 0, 456);
      haze.addColorStop(0, 'rgba(255,255,255,0)');
      haze.addColorStop(1, 'rgba(255,255,255,0.4)');
      s.fillStyle = haze;
      s.fillRect(0, 376, 1024, 80);
      ridge(414, 26, 56, '#6f87b4');
      ridge(430, 20, 44, '#44588a');

      this.skyTexture = new THREE.CanvasTexture(sc);
      this.skyTexture.colorSpace = THREE.SRGBColorSpace;

      const skyH = sizeVec.y * 6;
      this.sky = new THREE.Mesh(
        new THREE.PlaneGeometry(skyH * 2.2, skyH),
        new THREE.MeshBasicMaterial({ map: this.skyTexture, fog: false, depthWrite: false })
      );
      this.sky.position.set(0, floorY + skyH * 0.35, -sizeVec.y * 7);
      this.scene.add(this.sky);
      this.skyHeight = skyH;

      // Stars on their own layer, so they can fade in at night rather than
      // being baked into a sky that is bright by day.
      const stc = document.createElement('canvas');
      stc.width = 1024;
      stc.height = 512;
      const st = stc.getContext('2d');
      for (let i = 0; i < 320; i++) {
        const sx = rand() * 1024;
        const sy2 = rand() * 300;
        const fade = 1 - sy2 / 300;
        st.fillStyle = `rgba(255,255,255,${(0.25 + rand() * 0.7) * fade})`;
        st.beginPath();
        st.arc(sx, sy2, rand() * 1.6 + 0.4, 0, Math.PI * 2);
        st.fill();
      }
      this.starsTexture = new THREE.CanvasTexture(stc);
      this.stars = new THREE.Mesh(
        new THREE.PlaneGeometry(skyH * 2.2, skyH),
        new THREE.MeshBasicMaterial({
          map: this.starsTexture,
          transparent: true,
          opacity: 0,
          fog: false,
          depthWrite: false
        })
      );
      this.stars.position.copy(this.sky.position);
      this.stars.position.z += 0.01;
      this.scene.add(this.stars);

      // Sun and moon as sprites that actually travel across the sky.
      const disc = (inner, outer, core) => {
        const dc = document.createElement('canvas');
        dc.width = 256;
        dc.height = 256;
        const d = dc.getContext('2d');
        const g3 = d.createRadialGradient(128, 128, 4, 128, 128, 126);
        g3.addColorStop(0, inner);
        g3.addColorStop(0.16, core);
        g3.addColorStop(1, outer);
        d.fillStyle = g3;
        d.fillRect(0, 0, 256, 256);
        const tex = new THREE.CanvasTexture(dc);
        tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
      };

      this.sunTexture = disc('rgba(255,252,235,1)', 'rgba(255,196,120,0)', 'rgba(255,228,160,0.62)');
      this.moonTexture = disc('rgba(245,248,255,1)', 'rgba(170,195,255,0)', 'rgba(205,220,255,0.5)');

      const bodySize = sizeVec.y * 2.6;
      this.sunSprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: this.sunTexture, transparent: true, fog: false, depthWrite: false })
      );
      this.sunSprite.scale.set(bodySize, bodySize, 1);
      this.scene.add(this.sunSprite);

      this.moonSprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: this.moonTexture, transparent: true, fog: false, depthWrite: false })
      );
      this.moonSprite.scale.set(bodySize * 0.95, bodySize * 0.95, 1);
      this.scene.add(this.moonSprite);

      this.skyFloorY = floorY;
      this.orbitRadius = sizeVec.y * 3.1;
      this.orbitZ = -sizeVec.y * 6.4;

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
      this.createBirds(floorY, sizeVec);
    },

    /**
     * Day/night cycle. The sun and moon travel on opposite ends of the same
     * arc; everything else - sky tint, fog, stars, ground, lights - is derived
     * from how high the sun is, so there is one source of truth for the time of
     * day and nothing can drift out of step with anything else.
     *
     * Deliberately a wide swing between bright day and genuinely dark night,
     * rather than a polite shift: the change should be obvious to a child who
     * glances up.
     */
    updateDayNight(t, delta) {
      if (!this.sunSprite || !this.THREE) return;
      const THREE = this.THREE;

      // One full day every three minutes, starting mid-morning. In a held mode
      // the phase eases round to noon or midnight by the shortest route, so
      // tapping the button plays a sunset rather than cutting to black.
      const CYCLE = 180;
      if (this.cyclePhase === undefined) this.cyclePhase = 0.15;

      if (this.dayMode === 'auto') {
        this.cyclePhase = ((t / CYCLE) + 0.15) % 1;
      } else {
        const target = this.dayMode === 'day' ? 0.25 : 0.75;
        let d = target - this.cyclePhase;
        d -= Math.round(d);
        const step = Math.sign(d) * Math.min(Math.abs(d), (delta || 0.016) * 0.28);
        this.cyclePhase = (this.cyclePhase + step + 1) % 1;
      }

      const angle = this.cyclePhase * Math.PI * 2;

      const sunY = Math.sin(angle);
      const sunX = Math.cos(angle);

      this.sunSprite.position.set(
        sunX * this.orbitRadius,
        this.skyFloorY + this.skyHeight * 0.18 + sunY * this.orbitRadius,
        this.orbitZ
      );
      this.moonSprite.position.set(
        -sunX * this.orbitRadius,
        this.skyFloorY + this.skyHeight * 0.18 - sunY * this.orbitRadius,
        this.orbitZ
      );

      // 1 in full daylight, 0 once the sun is below the horizon.
      const day = THREE.MathUtils.smoothstep(sunY, -0.18, 0.3);
      // Peaks while the sun is near the horizon, for the warm band at dawn/dusk.
      const golden = Math.max(0, 1 - Math.abs(sunY) * 3.2);

      this.sunSprite.material.opacity = THREE.MathUtils.smoothstep(sunY, -0.22, 0.02);
      this.moonSprite.material.opacity = THREE.MathUtils.smoothstep(-sunY, -0.22, 0.02);
      this.stars.material.opacity = (1 - day) * 0.95;

      // Sky tint: white by day, warm at the horizon, deep blue at night.
      const DAY = new THREE.Color(0xffffff);
      const DUSK = new THREE.Color(0xffb184);
      const NIGHT = new THREE.Color(0x1b2550);
      const tint = NIGHT.clone().lerp(DAY, day);
      tint.lerp(DUSK, golden * 0.55);
      this.sky.material.color.copy(tint);

      // Ground and fog follow the sky, or the robot ends up standing on a
      // daylit floor at midnight.
      if (this.ground) this.ground.material.color.copy(tint).multiplyScalar(0.9);
      if (this.scene.fog) {
        this.scene.fog.color.copy(tint).multiplyScalar(0.55);
      }
      if (this.contactShadow) {
        this.contactShadow.material.opacity = 0.35 + day * 0.65;
      }

      // Lights. Night is lit coolly and dimly, but never to nothing - the robot
      // still has to be readable, and this is a child's game, not a horror.
      if (this.keyLight) {
        // Floor of 1.25 rather than 0.55: at night the robot was readable but
        // murky, and it is the thing the child is meant to be looking at.
        this.keyLight.intensity = 1.25 + day * 1.6;
        this.keyLight.color.setHex(0xffffff).lerp(new THREE.Color(0xffc48a), golden);
        if (day < 0.25) this.keyLight.color.lerp(new THREE.Color(0x9fb4ff), 1 - day * 4);
      }
      if (this.rimLight) {
        this.rimLight.intensity = 0.7 + day * 1.2;
        this.rimLight.position.set(sunX * 5, Math.max(0.6, sunY * 4), -5);
      }
      if (this.hemiLight) {
        this.hemiLight.intensity = 1.15 + day * 1.5;
        this.hemiLight.color.setHex(0x9fb4ff).lerp(new THREE.Color(0xcfe0ff), day);
      }
    },

    /**
     * A few birds crossing the sky. Drawn as a simple two-stroke silhouette,
     * which is all a bird at this distance ever is, and flapped by squashing
     * the sprite vertically rather than by swapping frames.
     */
    createBirds(floorY, sizeVec) {
      const THREE = this.THREE;

      const c = document.createElement('canvas');
      c.width = 64;
      c.height = 64;
      const x = c.getContext('2d');
      x.strokeStyle = '#1d2740';
      x.lineWidth = 5;
      x.lineCap = 'round';
      x.beginPath();
      x.moveTo(8, 34);
      x.quadraticCurveTo(22, 20, 32, 32);
      x.quadraticCurveTo(42, 20, 56, 34);
      x.stroke();
      this.birdTexture = new THREE.CanvasTexture(c);

      this.birds = [];
      for (let i = 0; i < 5; i++) {
        const sprite = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: this.birdTexture,
            transparent: true,
            opacity: 0.5 + Math.random() * 0.3,
            depthWrite: false,
            fog: false
          })
        );
        const scale = sizeVec.y * (0.1 + Math.random() * 0.1);
        sprite.scale.set(scale, scale, 1);
        sprite.position.set(
          (Math.random() - 0.5) * sizeVec.y * 9,
          floorY + sizeVec.y * (1.9 + Math.random() * 1.3),
          -sizeVec.y * (3 + Math.random() * 3)
        );
        sprite.userData = {
          speed: sizeVec.y * (0.12 + Math.random() * 0.1),
          flap: Math.random() * Math.PI * 2,
          baseScale: scale
        };
        this.scene.add(sprite);
        this.birds.push(sprite);
      }
      this.birdWrapX = sizeVec.y * 5;
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

      // The speech bubble tracks the head BONE's world position, not a fixed
      // point on the model. A model-local point swings sideways whenever the
      // model turns - which it does constantly for gaze tracking - so the
      // bubble slid out from one side of the head and back.
      this.headBone = this.model.getObjectByName('Head') || this.neck;
      this.headAnchorLift = h * 1.3;
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

      // Reduced motion holds the scene at midday rather than cycling.
      this.updateDayNight(this.reducedMotion ? 45 : t, delta);

      if (this.birds && !this.reducedMotion) {
        this.birds.forEach((b) => {
          b.position.x += b.userData.speed * delta;
          b.position.y += Math.sin(t * 0.8 + b.userData.flap) * delta * 0.06;
          // Squash vertically to suggest a wingbeat.
          const flap = 0.72 + Math.abs(Math.sin(t * 5 + b.userData.flap)) * 0.42;
          b.scale.set(b.userData.baseScale, b.userData.baseScale * flap, 1);
          if (b.position.x > this.birdWrapX) b.position.x = -this.birdWrapX;
        });
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
      if (this.headBone && this.$refs.host) {
        if (!this.anchorVec) this.anchorVec = new this.THREE.Vector3();
        this.headBone.getWorldPosition(this.anchorVec);
        this.anchorVec.y += this.headAnchorLift;
        this.anchorVec.project(this.camera);

        const rawX = (this.anchorVec.x * 0.5 + 0.5) * 100;
        const rawY = (-this.anchorVec.y * 0.5 + 0.5) * 100;

        // Low-pass the result. The walk cycle and the head bob move the bone
        // every frame, and an unfiltered anchor made the bubble twitch along
        // with it.
        if (!this.smoothAnchor) {
          this.smoothAnchor = { x: rawX, y: rawY };
        } else {
          const k = Math.min(1, delta * 3.5);
          this.smoothAnchor.x += (rawX - this.smoothAnchor.x) * k;
          this.smoothAnchor.y += (rawY - this.smoothAnchor.y) * k;
        }

        const x = this.smoothAnchor.x;
        const y = this.smoothAnchor.y;
        const last = this.lastAnchor;
        if (!last || Math.abs(last.x - x) > 0.4 || Math.abs(last.y - y) > 0.4) {
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
