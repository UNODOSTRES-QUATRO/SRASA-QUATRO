# PRD & Implementation Plan: SRASA-QUATRO Deep Rework

## Objective
Transform SRASA-QUATRO from disconnected mini-scenes into an open seamless continuous exploration world with buttery smooth camera/movement (low-cortisol), visceral driving, seamless vehicle mount/dismount, immersive procedural ambient soundscapes, satisfying low-cortisol mystical monsters, and non-janky weapon animations.

## Core Pillars & Milestones

### Phase 1: Camera & Motion Physics Overhaul (Smooth, Low Cortisol, No Stutter)
- Replace snapping/rigid camera dampening with frame-rate independent spherical lerp (slerp) & exponential smoothing (`1 - exp(-lambda * dt)`).
- Eliminate micro-stutters: decouple render tick from physics step with sub-frame interpolation.
- Orbit / Chase / Cockpit / Foot transitions: Seamless blend with zero abrupt position resets.
- Add subtle camera FOV dynamics based on speed (breathing/fluid sensation, no nausea).

### Phase 2: Unified Seamless World & Exploration Map (No Menu-Teleport)
- Merge `HighwayDriveScene`, `MechanicShopScene`, and `CyberAlleyScene` into a single continuous world.
- Continuous map:
  - Central Road / Highway loop with smooth asphalt, curves, aesthetic lighting (sunset/twilight low-cortisol vibe).
  - Physical Mechanic Shop / Office Garage located directly along the roadside (seamless driveway).
  - Cyber alleyway / mystical outskirts connected by traversable paths.
- Seamless Vehicle Entry/Exit:
  - Press [E] when near car: smooth door open + enter animation/camera transition.
  - Press [E] while driving: vehicle slows, player dismounts smoothly next to the driver door.
  - Can walk into the office/shop directly on foot without scene loading screen.

### Phase 3: Vehicle Aesthetic & Driving Feel (FR Legends / Wangan Flow)
- Refined vehicle model: sleek low-poly sports silhouette, working neon tail lights with bloom streaks, exhaust pops, proper wheel camber, realistic suspension bounce.
- Smooth drift mechanics: easy to initiate, satisfying counter-steer slip angle, low penalty, smooth recovery.

### Phase 4: Low-Cortisol Satisfying Monsters & Combat
- Spawn wandering ethereal/astral shadow entities along outskirts and back alleys.
- Creature design: soft luminescent particles, graceful float movements, reactive to player presence (not jumpscare/stressful, but meditative and rhythmic).
- Combat & Weapons:
  - Attach weapons properly to player model / hands with realistic IK/socket anchoring (no floating in mid-air).
  - Hit response: satisfying resonance, slow-motion impact shudder, harmonic chime/crystallization on defeat rather than bloody gore.
  - Weapons: Blue Shard Katana (fluid combos), Ethereal Bow (satisfying release), Void Pen (calligraphy arc strikes).

### Phase 5: Rich Ambient Soundscape & High-Fidelity Audio System (Web Audio API)
- Master Volume & Dynamic Soundstage: Rich bass-boosted lofi engine hum, road tire friction, wind rush scaled by speed.
- Dynamic Low-Cortisol Synth/Ambient Music: procedural ambient pads with generative chord progressions (pentatonic/ambient drones) that adapt between driving, walking, and combat.
- Impact, sword whoosh, bow release, and engine rev synthesized with rich harmonized frequencies (no harsh clipped volume).

---
## Autonomous Execution Loop Protocol
Hermes acts as the persistent Supervisor.
Each milestone is executed iteratively via code & verified against runtime builds until fully finished, committing and pushing automatically.
