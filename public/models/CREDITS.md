# 3D model credits

## RobotExpressive.glb

Model by [Tomás Laulhé](https://www.patreon.com/quaternius). Licensed **CC0 1.0**
(public domain dedication) — no attribution is legally required, but the creator
asks that projects using it consider supporting their Patreon.

Modifications by [Don McCurdy](https://donmccurdy.com/):

- Added three facial expression morph targets (`Angry`, `Surprised`, `Sad`)
- Converted with FBX2GLTF
- Removed duplicate materials and reduced material metalness

Obtained from the [three.js](https://github.com/mrdoob/three.js) examples
(`examples/models/gltf/RobotExpressive/`).

### Animation clips available

`Dance`, `Death`, `Idle`, `Jump`, `No`, `Punch`, `Running`, `Sitting`,
`Standing`, `ThumbsUp`, `Walking`, `WalkJump`, `Yes`, `Wave`

The mapping from the app's bot states onto these clips lives in
`src/components/Robot3D.vue` (`STATES`).
