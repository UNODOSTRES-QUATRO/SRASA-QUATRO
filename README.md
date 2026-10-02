# Project Quatro ;

> **Sebuah game eksplorasi naratif low-cortisol yang memadukan kenyamanan berkendara mobil Quatro dengan teka-teki point-and-click di dimensi voxel yang hangat. Pemain diajak mengamati pergeseran realitas secara perlahan, menyusutkan mobil menjadi ukuran saku untuk memecahkan misteri kastil kuno tanpa tekanan waktu. Sentuhan visual bergaya Animal Crossing dan soundscape akustik yang menenangkan menghadirkan ruang hening dan pemulihan bagi pikiran.**
> 
> *A low-cortisol narrative driving and environmental puzzle experience inspired by The Semicolon philosophy (`ACTION → PAUSE → NOTICE → FEEL → CONTINUE`).*

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React Three Fiber](https://img.shields.io/badge/R3F-Three.js-orange?style=flat&logo=three.js)](https://docs.pmnd.rs/react-three-fiber)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Realtime-emerald?style=flat&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

---

## 🌟 The Philosophy

Project Quatro is built upon the gentle principle that games should feel like a breathing space rather than an endless demand for attention.

- **The Semicolon (`;`)**: In literature and code, a semicolon is neither an abrupt halt nor an unending rush—it is a conscious choice to pause, take in the atmosphere, and resume with clarity.
- **Companion**: Semicolon Cat purrs in the passenger seat, responding to your driving rhythm and environmental anomalies.
- **Dual-Scale Mechanic**: When a massive castle gate bars your way, brute force won't prevail. Press **`[Q]`** to transform into **Pocket Car Mode**, entering miniature passages to unlock ancient mechanisms.

---

## 🚀 Key Features

### 1. Retro Rally Driving & Smooth Camera
- **Audi Quattro Rally Heritage**: Detailed procedural 3D model featuring iconic blister box flares, quad rectangular headlights with amber indicators, hood vents, ducktail rear wing, twin polished exhausts, and deep-dish wheels with negative camber and visible red calipers.
- **FR Legends-Inspired Dynamic Camera**: Damped chase camera with shortest-angle yaw unwrapping, dynamic drift-angle swinging, lookahead tracking, and speed-adaptive FOV.

### 2. Story Progression & Dual-Scale Puzzles
- **Day 1 — The Routine**: Peaceful commute along warm, tree-lined asphalt with analog engine audio.
- **Day 2 — The Shift**: Environmental anomalies begin to appear along the road; Semicolon Cat senses subtle distortions.
- **Day 3 — The Voxel Dimension**: Reality folds at the portal threshold (`z: 105`), leading into the ancient Voxel Castle Courtyard.
- **The Guardian NPC**: Voxel elder sage sitting near the portcullis with a flickering lantern, guiding drivers on the wisdom of smallness.
- **Dual-Scale Castle Puzzle**: Slip through a low drainage conduit in Pocket Car mode to activate a hidden pressure plate and raise the grand castle gate.

### 3. Full-Stack Architecture & Supabase Backend
- **Supabase PostgreSQL Database**: Schemas for `profiles`, `player_progress`, `vehicles`, `player_vehicles`, `puzzle_progress`, `story_progress`, and `checkpoints`.
- **Row Level Security (RLS)**: Strict tenant isolation (`auth.uid() = user_id`) on all player-owned data.
- **Realtime Multiplayer Sync**: Broadcasts and tracks driver positions (`[x, y, z]`, heading, scale mode, status) via Supabase Realtime channel `room:quatro-world`.
- **Web Audio Synthesizer**: Pure Web Audio API engine oscillator, tape hiss noise, and companion cat audio without heavy external asset dependencies.

---

## 🛠️ Tech Stack

- **Frontend**: [Next.js 14 App Router](https://nextjs.org/), React 18, TypeScript
- **3D Graphics**: [Three.js](https://threejs.org/), [@react-three/fiber](https://github.com/pmndrs/react-three-fiber), [@react-three/drei](https://github.com/pmndrs/drei)
- **Styling**: Vanilla CSS tokens & Tailwind CSS with warm vintage palette
- **Backend / Database**: [Supabase](https://supabase.com/) (PostgreSQL 17, Row Level Security, Realtime)
- **Testing**: Vitest unit test suite

---

## 🏁 Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm

### 1. Clone & Install
```bash
git clone git@github.com:UNODOSTRES-QUATRO/SRASA-QUATRO.git
cd SRASA-QUATRO
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your Supabase project credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://nitzcrjczjzuqpbwfgge.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
NEXT_PUBLIC_SUPABASE_PROJECT_ID=nitzcrjczjzuqpbwfgge
NEXT_PUBLIC_SUPABASE_PROJECT_NAME=SRASA-QUATRO
```

### 3. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Test Suite
```bash
npm test
```

---

## 🎮 Controls

| Action | Key / Control |
|---|---|
| **Accelerate** | `W` or `↑` |
| **Brake / Reverse** | `S` or `↓` |
| **Steer & Drift** | `A` / `D` or `←` / `→` |
| **Handbrake Drift** | `Space` while turning at speed |
| **Pocket Car Transformation** | `Q` or Click HUD Toggle |
| **Interact / Dialogue** | `E` or `Space` or Click Prompt |
| **Pause & Notebook** | `ESC` |

---

## 📄 License

MIT © [UNODOSTRES-QUATRO](https://github.com/UNODOSTRES-QUATRO)
