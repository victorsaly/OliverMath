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
// halo:  pulse a ring with audioLevel (used to show we are hearing the child)
// mouth: which mouth shape to show. The model has no jaw or mouth of its own,
//        so one is built procedurally - see createMouth(). This is the signal a
//        child reads first, so talking and listening get different shapes as
//        well as different colours.
const STATES = {
  neutral:   { clip: 'Idle',     color: 0x4ce6ff, speed: 1, mouth: 'line' },
  sleepy:    { clip: 'Sitting',  color: 0x5980b2, speed: 0.5, mouth: 'line' },
  listening: { clip: 'Idle',     color: 0x33e666, speed: 1, halo: true, lean: 0.12, mouth: 'smile' },
  speaking:  { clip: 'Idle',     color: 0x4cd9ff, speed: 1, bob: true, mouth: 'talk' },
  thinking:  { clip: 'Idle',     color: 0xffb432, speed: 0.6, lookUp: 0.18, orbit: true, mouth: 'pursed' },
  computing: { clip: 'Idle',     color: 0xffb432, speed: 0.6, lookUp: 0.18, orbit: true, mouth: 'pursed' },
  happy:     { clip: 'Yes',      color: 0x33e666, speed: 1, once: true, mouth: 'smile' },
  proud:     { clip: 'ThumbsUp', color: 0xffd700, speed: 1, once: true, mouth: 'smile' },
  excited:   { clip: 'Dance',    color: 0xffd700, speed: 1.2, mouth: 'smile' },
  laughing:  { clip: 'Jump',     color: 0xffd700, speed: 1, once: true, mouth: 'open' },
  // Deliberately NOT a celebration: 'surprised' fires before a question is
  // asked, so a reward animation here would teach the child the star is noise.
  surprised: { clip: 'Idle',     color: 0xffffff, speed: 1, morph: 'Surprised', mouth: 'open' },
  sad:       { clip: 'No',       color: 0x5980b2, speed: 1, once: true, morph: 'Sad', mouth: 'frown' },
  // 'confused' means "I did not hear you" - a head shake, not the thinking pose,
  // so it never reads as "you were wrong".
  confused:  { clip: 'No',       color: 0xffb432, speed: 0.7, once: true, morph: 'Surprised', mouth: 'pursed' },
  // 'broken' is a system failure, visually distinct from a wrong answer.
  broken:    { clip: 'Death',    color: 0xeb445a, speed: 1, once: true, morph: 'Sad', mouth: 'frown' }
};

const MODEL_URL = `${import.meta.env.BASE_URL}models/RobotExpressive.glb`;

// States whose animation is carried by the body rather than the face, so the
// camera pulls back for them. Everything else is about expression, where a
// close framing reads far better on a phone.
const BODY_VIEW_STATES = new Set(['excited', 'laughing', 'proud', 'broken', 'sleepy']);

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
    }
  },
  emits: ['unsupported', 'ready'],
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

      // The state light: a ring behind the robot, always facing the camera.
      this.halo = new THREE.Mesh(
        new THREE.TorusGeometry(0.95, 0.07, 12, 48),
        new THREE.MeshBasicMaterial({ color: 0x4ce6ff, transparent: true, opacity: 0.55 })
      );
      this.scene.add(this.halo);

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
      const halfFov = (this.camera.fov * Math.PI) / 180 / 2;
      const fitFor = (height) => (height / 2) / Math.tan(halfFov);

      // Measure the head itself instead of guessing a fraction of the body.
      // Guessing put the camera at the jaw, showing chest and no face.
      const headBox = this.morphMesh
        ? new THREE.Box3().setFromObject(this.morphMesh)
        : null;
      const headSize = headBox ? headBox.getSize(new THREE.Vector3()) : null;
      const headCenter = headBox ? headBox.getCenter(new THREE.Vector3()) : null;

      // Head plus a margin either side, so the face is the subject but the
      // shoulders still anchor it.
      const faceHeight = headSize ? headSize.y * 2.1 : sizeVec.y * 0.45;
      const faceY = headCenter ? headCenter.y : box.max.y - sizeVec.y * 0.18;

      this.framing = {
        full: {
          pos: new THREE.Vector3(0, center.y + sizeVec.y * 0.06, fitFor(sizeVec.y) * 1.18),
          target: new THREE.Vector3(0, center.y, 0)
        },
        face: {
          pos: new THREE.Vector3(0, faceY, fitFor(faceHeight) * 1.05),
          target: new THREE.Vector3(0, faceY, 0)
        }
      };

      const start = this.framing[this.activeView];
      this.lookTarget = start.target.clone();
      this.camera.position.copy(start.pos);
      this.camera.lookAt(this.lookTarget);

      // Ring sits behind the robot, scaled to whatever it is framing.
      this.halo.scale.setScalar((sizeVec.y * 0.55) / 0.95);
      this.halo.position.set(0, center.y + sizeVec.y * 0.1, -sizeVec.y * 0.5);
      this.orbit.position.set(0, box.max.y + sizeVec.y * 0.1, 0);
      this.baseRotation = this.model.rotation.y;
      this.createMouth();

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

      if (this.halo) this.halo.material.color.setHex(cfg.color);
      if (this.bodyMaterial) {
        this.bodyMaterial.emissive = new THREE.Color(cfg.color);
        this.bodyMaterial.emissiveIntensity = 0.22;
      }
      if (this.orbit) this.orbit.visible = !!cfg.orbit;
      this.applyMorph(cfg.morph);
      this.setMouth(cfg.mouth);
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
      const mesh = this.morphMesh;
      if (!mesh || !mesh.morphTargetDictionary) return;
      const dict = mesh.morphTargetDictionary;
      Object.keys(dict).forEach((key) => {
        mesh.morphTargetInfluences[dict[key]] = key === name ? 1 : 0;
      });
    },

    /**
     * The model ships no mouth or jaw, so build one and parent it to the head
     * mesh - that way it follows every head rotation and bob for free.
     * Positioned from the head's own bounding box rather than magic numbers.
     */
    createMouth() {
      const THREE = this.THREE;
      const face = this.morphMesh;
      if (!face || !face.geometry) return;

      face.geometry.computeBoundingBox();
      const box = face.geometry.boundingBox;
      const w = box.max.x - box.min.x;
      const h = box.max.y - box.min.y;

      this.mouthGroup = new THREE.Group();
      this.mouthGroup.position.set(
        (box.min.x + box.max.x) / 2,
        box.min.y + h * 0.3,
        box.max.z + h * 0.015
      );
      face.add(this.mouthGroup);

      const mat = new THREE.MeshBasicMaterial({
        color: 0x14223a,
        side: THREE.DoubleSide
      });
      this.mouthMaterial = mat;

      const line = new THREE.Mesh(new THREE.BoxGeometry(w * 0.4, w * 0.05, w * 0.01), mat);

      const pursed = new THREE.Mesh(new THREE.BoxGeometry(w * 0.2, w * 0.05, w * 0.01), mat);
      pursed.position.x = w * 0.07;

      const open = new THREE.Mesh(new THREE.CircleGeometry(w * 0.15, 24), mat);

      // A half-torus is a mouth curve. The upper semicircle reads as a frown;
      // rotating it by PI flips it into a smile.
      const arcGeo = new THREE.TorusGeometry(w * 0.19, w * 0.032, 8, 24, Math.PI);
      const smile = new THREE.Mesh(arcGeo, mat);
      smile.rotation.z = Math.PI;
      const frown = new THREE.Mesh(arcGeo, mat);

      this.mouthParts = { line, pursed, open, talk: open, smile, frown };
      [line, pursed, open, smile, frown].forEach((m) => {
        m.visible = false;
        this.mouthGroup.add(m);
      });
    },

    setMouth(shape) {
      if (!this.mouthParts) return;
      const active = this.mouthParts[shape] || this.mouthParts.line;
      Object.values(this.mouthParts).forEach((m) => { m.visible = false; });
      active.visible = true;
      // 'talk' reuses the open circle, so reset its scale when we leave talking.
      if (shape !== 'talk') this.mouthParts.open.scale.set(1, 1, 1);
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
        if (this.neck) {
          const bob = cfg.bob ? Math.sin(t * 9) * 0.06 * (0.35 + this.audioLevel) : 0;
          const lookUp = cfg.lookUp ? Math.sin(t * 1.4) * 0.05 - cfg.lookUp : 0;
          this.neck.rotation.x = bob + lookUp;
        }
        if (this.model) {
          const lean = cfg.lean ? cfg.lean : 0;
          this.model.rotation.x = lean;
          this.model.rotation.y =
            this.baseRotation + (cfg.orbit ? Math.sin(t * 0.6) * 0.12 : 0);
        }
        if (this.orbit && cfg.orbit) this.orbit.rotation.y = t * 1.6;
      }

      // Lip sync: the mouth opens with the speech amplitude, so "I am talking"
      // is legible without reading the status text.
      if (this.mouthParts && cfg.mouth === 'talk') {
        const amp = Math.min(Math.max(this.audioLevel, 0), 1);
        const openY = this.reducedMotion
          ? 0.7
          : 0.25 + amp * 1.25 + Math.sin(t * 11) * 0.08;
        this.mouthParts.open.scale.set(1, Math.max(0.15, openY), 1);
      }

      if (this.halo) {
        const pulse = cfg.halo
          ? 0.45 + Math.min(this.audioLevel, 1) * 0.55 + Math.sin(t * 4) * 0.08
          : 0.4;
        this.halo.material.opacity = this.reducedMotion ? 0.5 : Math.max(0.2, pulse);
        const scale = cfg.halo && !this.reducedMotion
          ? 1 + Math.min(this.audioLevel, 1) * 0.12
          : 1;
        this.halo.scale.setScalar(scale);
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
        // Keep the state ring centred behind whatever is framed, so the
        // listening pulse stays visible in the close face view too.
        if (this.halo) this.halo.position.y = this.lookTarget.y;
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
      if (this.ro) this.ro.disconnect();
      if (this.io) this.io.disconnect();
      if (this.mixer) this.mixer.stopAllAction();
      if (this.scene) {
        this.scene.traverse((o) => {
          if (o.isMesh) {
            o.geometry?.dispose();
            const mats = Array.isArray(o.material) ? o.material : [o.material];
            mats.forEach((m) => m?.dispose());
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
