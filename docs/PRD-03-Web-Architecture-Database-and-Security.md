# Product Requirements Document

# Project Quatro — Web Architecture, Database & Security

> **Document Purpose:** Mendefinisikan arsitektur teknis Project Quatro sebagai web game berbasis Next.js, termasuk application architecture, 3D runtime, authentication, database, persistence, authorization, validation, security boundaries, dan deployment.
>
> **Primary Technical Goal:** Membuat fondasi web game yang maintainable, secure-by-default, dan cukup sederhana untuk dikembangkan oleh tim.
>
> **Learning Goal:** Sistem database dan security harus sekaligus menjadi playground untuk mempelajari praktik backend engineering, authorization, database design, dan web security secara proper.

---

# 1. Technical Overview

## Product

**Project Quatro**

## Platform

Primary:

* Desktop Web
* Laptop Web

Secondary:

* Mobile Web jika performa memungkinkan

## Proposed Stack

### Frontend

* Next.js
* React
* TypeScript

### 3D Runtime

* React Three Fiber
* Three.js
* Drei jika dibutuhkan

### Backend / Data

* Supabase
* PostgreSQL
* Supabase Auth

### Hosting

* Vercel atau equivalent Next.js-compatible platform

### Source Control

* Git
* GitHub

---

# 2. Architecture Philosophy

Gunakan prinsip:

> **Client handles experience. Server handles trust. Database enforces authorization.**

Client bertanggung jawab atas:

* rendering,
* input,
* movement,
* local game state,
* animation,
* audio,
* visual feedback.

Server / database bertanggung jawab atas:

* identity,
* persistent progress,
* ownership,
* permissions,
* important state,
* validation,
* data integrity.

Jangan pernah menganggap client sebagai trusted environment.

---

# 3. High-Level Architecture

```text
                    PLAYER
                      │
                      ▼
              ┌───────────────┐
              │    Browser    │
              │               │
              │ Next.js / UI  │
              │ React         │
              │ R3F / Three   │
              │ Game Runtime  │
              └───────┬───────┘
                      │
          ┌───────────┴───────────┐
          │                       │
          ▼                       ▼
   GAME RUNTIME             SERVER BOUNDARY
   Local State              Next.js Server
   Physics                  Server Actions /
   Interaction              Route Handlers
   Rendering                       │
                                   ▼
                              SUPABASE
                         ┌─────────┴─────────┐
                         │                   │
                       AUTH              POSTGRES
                         │                   │
                         └─────────┬─────────┘
                                   │
                                   ▼
                                  RLS
```

---

# 4. Trust Boundary

Security architecture harus jelas membedakan:

## Untrusted

Semua data yang berasal dari:

* browser,
* localStorage,
* URL,
* query parameter,
* client-side state,
* request body,
* game events.

## Trusted

Hanya data yang telah melewati:

* authenticated session,
* server-side validation,
* authorization,
* database constraints,
* RLS policies.

---

# 5. Client Architecture

Recommended structure:

```text
app/
├── page.tsx
├── login/
├── game/
├── garage/
├── profile/
└── settings/

components/
├── ui/
├── game/
├── vehicle/
└── interaction/

game/
├── core/
├── player/
├── vehicle/
├── world/
├── puzzle/
├── interaction/
├── camera/
└── audio/

lib/
├── supabase/
├── validation/
├── auth/
└── utils/

server/
├── actions/
└── services/

types/
└── database.ts
```

Struktur dapat berubah mengikuti kebutuhan implementasi.

Tujuan utama adalah memisahkan:

**presentation → game logic → persistence → infrastructure.**

---

# 6. Game Runtime Separation

Jangan mencampur seluruh game logic ke React components.

React digunakan untuk:

* UI,
* menus,
* overlays,
* game state that needs React rendering.

Game runtime menangani:

* movement,
* vehicle physics,
* collision,
* interaction detection,
* world state,
* animation state.

Contoh:

```text
React
  │
  ├── HUD
  ├── Inventory UI
  ├── Dialogue
  └── Menus
       │
       ▼
Game Runtime
  │
  ├── Player
  ├── Vehicle
  ├── Puzzle
  ├── World
  └── Interaction
       │
       ▼
Persistence Layer
       │
       ▼
Supabase
```

---

# 7. State Classification

Game state harus dikategorikan.

## Ephemeral State

Tidak perlu disimpan ke database.

Contoh:

* current player position,
* camera rotation,
* temporary animation,
* current velocity,
* particles,
* current UI state.

## Session State

Dapat disimpan sementara atau dipulihkan.

Contoh:

* current scene,
* active puzzle,
* temporary interaction,
* current vehicle state.

## Persistent State

Harus disimpan.

Contoh:

* player progression,
* unlocked vehicle,
* owned vehicle,
* customization,
* puzzle completion,
* important story flags.

---

# 8. Save Strategy

Jangan menyimpan seluruh game state setiap frame.

Database persistence hanya dilakukan pada meaningful checkpoints/events.

Contoh:

```text
PUZZLE SOLVED
       ↓
SAVE

VEHICLE PURCHASED
       ↓
SAVE

UPGRADE PURCHASED
       ↓
SAVE

STORY CHECKPOINT
       ↓
SAVE
```

Bukan:

```text
60 FPS
 ↓
DATABASE WRITE
 ↓
60 FPS
 ↓
DATABASE WRITE
```

---

# 9. Authentication

Supabase Auth digunakan untuk identity.

Initial authentication options:

* Email/password
* Magic link
* OAuth jika diperlukan

Authentication harus menangani:

* sign up,
* login,
* logout,
* session persistence,
* session refresh,
* protected routes,
* account deletion flow jika dibutuhkan.

---

# 10. Authentication Principle

Authentication menjawab:

> **Who are you?**

Authorization menjawab:

> **What are you allowed to access?**

Keduanya tidak boleh disamakan.

Login yang berhasil tidak berarti user dapat membaca atau mengubah semua database.

---

# 11. Protected Routes

Contoh protected areas:

```text
/game
/garage
/profile
/save
```

Unauthenticated users diarahkan ke authentication flow.

Namun proteksi tidak boleh hanya dilakukan pada UI.

Contoh yang tidak cukup:

```text
if (!user) redirect("/login")
```

Database tetap harus memiliki authorization layer.

---

# 12. Database Design

Gunakan PostgreSQL melalui Supabase.

Initial entities:

```text
profiles
player_progress
vehicles
player_vehicles
vehicle_customizations
puzzle_progress
story_progress
checkpoints
```

---

# 13. profiles

Purpose:

Menyimpan public/non-sensitive player information.

Suggested fields:

```text
id
display_name
created_at
updated_at
```

`id` harus terhubung dengan authenticated user identity.

Jangan menyimpan credential secara manual di table ini.

---

# 14. player_progress

Menyimpan progression utama pemain.

Suggested:

```text
user_id
current_chapter
current_day
current_location
progress_version
created_at
updated_at
```

Contoh:

```text
chapter = 1
day = 2
location = "road"
```

Progression harus memiliki valid state transitions.

---

# 15. vehicles

Catalog kendaraan.

Contoh:

```text
id
name
description
base_stats
unlock_requirement
created_at
```

Data katalog bukan milik individual player.

Contoh:

```text
Quatro
Acceleration: ...
Handling: ...
Weight: ...
```

---

# 16. player_vehicles

Relasi player dengan kendaraan yang dimiliki.

Suggested:

```text
id
user_id
vehicle_id
is_active
condition
created_at
updated_at
```

Constraint:

```text
user_id + vehicle_id
```

dapat dibuat unique jika player hanya dapat memiliki satu instance dari setiap vehicle.

---

# 17. vehicle_customizations

Menyimpan customization kendaraan.

Suggested:

```text
id
player_vehicle_id
spoiler
side_kit
bumper
wheel
updated_at
```

Jangan mengizinkan client memasukkan arbitrary object sebagai customization tanpa validation.

---

# 18. puzzle_progress

Menyimpan puzzle completion.

Suggested:

```text
id
user_id
puzzle_id
status
completed_at
```

Possible status:

```text
locked
available
completed
```

Database constraint harus memastikan state valid.

---

# 19. story_progress

Untuk story flags.

Contoh:

```text
user_id
flag_key
flag_value
updated_at
```

Possible flags:

```text
met_guardian
entered_voxel_world
discovered_library
opened_castle_gate
```

Untuk flag yang kritis, pertimbangkan schema typed daripada arbitrary key-value storage.

---

# 20. checkpoints

Checkpoint menyimpan milestone recovery.

Contoh:

```text
id
user_id
chapter
location
checkpoint_key
created_at
```

Checkpoint digunakan untuk recovery, bukan real-time synchronization.

---

# 21. Database Relationships

Basic relationship:

```text
auth.users
    │
    └── profiles
           │
           ├── player_progress
           │
           ├── player_vehicles
           │       │
           │       └── vehicle_customizations
           │
           ├── puzzle_progress
           │
           ├── story_progress
           │
           └── checkpoints

vehicles
    │
    └── player_vehicles
```

---

# 22. Row Level Security

RLS adalah mandatory.

Core rule:

> A player can only access their own player-owned data.

Conceptually:

```text
user_id == authenticated_user_id
```

Policies harus diterapkan terhadap:

* profiles,
* player_progress,
* player_vehicles,
* vehicle_customizations,
* puzzle_progress,
* story_progress,
* checkpoints.

---

# 23. Public Catalog Data

Data seperti:

* vehicle catalog,
* static game configuration,
* public content,

dapat memiliki read access yang lebih luas jika memang dibutuhkan.

Namun:

> Read access ≠ write access.

Client tidak boleh mengubah catalog kendaraan.

---

# 24. Ownership Model

Setiap player-owned record harus memiliki ownership yang jelas.

Contoh:

```text
player_vehicles.user_id
```

harus merujuk kepada pemilik.

Jangan mempercayai:

```json
{
  "user_id": "someone-else"
}
```

yang dikirim client.

Identity harus berasal dari authenticated session.

---

# 25. Input Validation

Semua input dari client harus divalidasi.

Contoh:

```text
vehicle customization
puzzle completion
checkpoint update
progress update
```

Validation harus mencakup:

* type,
* range,
* enum,
* required fields,
* ownership,
* state transition.

Gunakan schema validation library seperti Zod jika sesuai.

---

# 26. State Transition Validation

Jangan menerima progression arbitrary.

Tidak boleh:

```text
client:
current_chapter = 99
```

lalu database langsung menyimpannya.

Gunakan valid transition:

```text
Chapter 1
   ↓
Chapter 2
   ↓
Chapter 3
```

Jika player masih berada pada Chapter 1, request untuk langsung menjadi Chapter 10 harus ditolak.

---

# 27. Client-Side Tampering

Asumsikan player dapat memodifikasi:

* JavaScript,
* network requests,
* localStorage,
* game state,
* request payload.

Karena itu:

> Client-side validation adalah UX validation, bukan security boundary.

Validation penting harus dilakukan server/database-side.

---

# 28. Economy Security

Jika currency atau resource digunakan:

Jangan lakukan:

```text
client:
balance = balance + 1000
```

Database harus menentukan perubahan yang valid.

Contoh:

```text
CURRENT BALANCE
      ↓
VALIDATE COST
      ↓
VALIDATE OWNERSHIP
      ↓
TRANSACTION
      ↓
NEW BALANCE
```

Gunakan database transaction/RPC atau server-side operation jika diperlukan.

---

# 29. Purchase Security

Purchase kendaraan:

```text
REQUEST
 ↓
AUTHENTICATE
 ↓
VALIDATE VEHICLE
 ↓
CHECK UNLOCK
 ↓
CHECK BALANCE
 ↓
TRANSACTION
 ↓
CREATE OWNERSHIP
```

Client tidak boleh menentukan hasil transaksi.

---

# 30. Upgrade Security

Upgrade:

```text
REQUEST UPGRADE
      ↓
AUTH
      ↓
OWNERSHIP CHECK
      ↓
VALIDATE UPGRADE
      ↓
CHECK REQUIREMENT
      ↓
CHECK RESOURCE
      ↓
COMMIT
```

Jika salah satu gagal:

```text
ROLLBACK
```

---

# 31. Puzzle Security

Puzzle completion merupakan progression state.

Client boleh mengatakan:

> "Aku menyelesaikan puzzle X."

Tetapi server harus menentukan apakah perubahan state tersebut valid.

Untuk MVP sederhana, gunakan event validation dan progression constraints.

Untuk puzzle yang benar-benar membutuhkan anti-cheat, jangan bergantung pada secret answer yang dikirim langsung ke client.

---

# 32. Secret Management

Environment variables:

```text
NEXT_PUBLIC_*
```

hanya untuk values yang memang aman diketahui browser.

Server secrets tidak boleh dikirim ke client.

Supabase server credentials/service-role credentials:

**NEVER expose them in browser code.**

---

# 33. Supabase Client Separation

Gunakan pemisahan:

```text
Browser Supabase Client
        ↓
public operations
        ↓
RLS

Server Supabase Client
        ↓
trusted server operations
        ↓
server authorization
```

Service-role access harus sangat terbatas.

---

# 34. Database Constraints

Security tidak hanya bergantung pada application code.

Gunakan PostgreSQL constraints:

* NOT NULL
* UNIQUE
* FOREIGN KEY
* CHECK
* appropriate indexes

Contoh:

```text
condition >= 0
```

atau:

```text
status IN ('locked', 'available', 'completed')
```

Database harus menjadi final line of defense untuk data integrity.

---

# 35. Indexing

Index digunakan pada query yang sering dilakukan.

Candidate:

```text
player_progress.user_id
player_vehicles.user_id
puzzle_progress.user_id
story_progress.user_id
checkpoints.user_id
```

Jangan menambahkan index secara membabi buta.

Measure query patterns terlebih dahulu saat data mulai bertambah.

---

# 36. Save Versioning

Game save harus memiliki:

```text
progress_version
```

Tujuan:

Jika schema progression berubah:

```text
Version 1
   ↓ migration
Version 2
```

Game tidak langsung rusak ketika structure berubah.

---

# 37. Local Save

Local state dapat digunakan untuk:

* temporary state,
* settings,
* performance optimization,
* offline-friendly behavior jika diperlukan.

Namun localStorage tidak dianggap authoritative.

Contoh:

```text
localStorage:
last_position = ...
```

Database:

```text
authoritative_progress = ...
```

Jika conflict terjadi, server state harus memiliki authority sesuai desain.

---

# 38. Network Failure

Game harus menangani:

* connection lost,
* timeout,
* request failure,
* session expiration.

Jangan membuat UI freeze permanen.

Contoh:

```text
SAVE
 ↓
REQUEST
 ↓
SUCCESS → continue

FAIL
 ↓
retain local state
 ↓
retry / notify
```

Retry harus memiliki batas yang wajar.

---

# 39. Error Handling

Error kepada user harus manusiawi.

Jangan:

```text
POSTGRES ERROR 23505
```

User-facing message:

> "Progress belum berhasil disimpan. Coba lagi sebentar."

Developer logs tetap menyimpan detail teknis yang diperlukan.

---

# 40. Logging

Log event penting:

* authentication failures,
* unexpected server errors,
* invalid state transitions,
* database failures,
* suspicious repeated requests.

Jangan log:

* passwords,
* access tokens,
* sensitive credentials,
* unnecessary personal information.

---

# 41. Rate Limiting

Endpoint yang dapat disalahgunakan harus memiliki rate limiting apabila diperlukan.

Candidate:

* authentication attempts,
* purchase operations,
* progression updates,
* expensive server operations.

Jangan menerapkan rate limit yang membuat gameplay normal terasa lambat.

---

# 42. Server Actions / Route Handlers

Gunakan server-side boundary untuk operation yang membutuhkan trust.

Contoh:

```text
purchaseVehicle()
completePuzzle()
applyUpgrade()
saveProgress()
```

Server layer:

```text
authenticate
→ validate
→ authorize
→ execute
→ return result
```

---

# 43. API Contract

Request dan response harus typed.

Contoh konsep:

```text
PurchaseVehicleInput
PurchaseVehicleResult
CompletePuzzleInput
CompletePuzzleResult
```

Hindari function yang menerima arbitrary object:

```text
doAnything(data)
```

---

# 44. Database Migration

Schema database harus version-controlled.

Gunakan migration workflow.

Contoh:

```text
migration_001_initial_schema
migration_002_vehicle_system
migration_003_puzzle_progress
migration_004_security_policies
```

Jangan menjadikan production database sebagai tempat eksperimen manual tanpa migration history.

---

# 45. Development Environments

Pisahkan:

```text
LOCAL
STAGING
PRODUCTION
```

Minimal:

### Local

Development dan testing.

### Production

Real player data.

Jangan menggunakan production database untuk eksperimen schema yang berisiko.

---

# 46. Security Testing

Security testing awal:

## Authentication

* unauthorized access,
* expired session,
* logout behavior.

## Authorization

* user A attempting user B data,
* direct API manipulation,
* altered IDs.

## Database

* RLS bypass attempts,
* invalid foreign keys,
* invalid states,
* duplicate ownership.

## Input

* malformed JSON,
* unexpected enum,
* negative values,
* extreme values,
* missing values.

---

# 47. Game-Specific Security Threat Model

Potential threats:

```text
Client Tampering
      │
      ├── Fake Progress
      ├── Fake Currency
      ├── Fake Purchase
      ├── Fake Puzzle Completion
      └── Unauthorized Data Access
```

Countermeasures:

```text
Authentication
+
Authorization
+
RLS
+
Server Validation
+
Database Constraints
+
Transactions
+
Rate Limiting
+
Logging
```

---

# 48. Performance Architecture

3D web games are performance-sensitive.

Prioritize:

* asset compression,
* lazy loading,
* scene splitting,
* texture optimization,
* model optimization,
* instancing,
* frustum culling,
* avoiding unnecessary React re-renders.

Do not load the entire game world immediately if unnecessary.

---

# 49. Asset Loading

Use staged loading.

Example:

```text
BOOT
 ↓
CORE ASSETS
 ↓
MAIN MENU
 ↓
CURRENT SCENE
 ↓
OPTIONAL ASSETS
```

Only load what is needed.

---

# 50. 3D Performance

Monitor:

* FPS,
* frame time,
* draw calls,
* memory,
* GPU load,
* texture memory.

Target smooth interaction rather than maximum visual complexity.

---

# 51. Responsive Quality

Create quality tiers where practical.

### High

* higher resolution textures,
* additional effects,
* higher shadow quality.

### Medium

* balanced effects,
* moderate shadows.

### Low

* reduced effects,
* lower resolution,
* simplified environment.

Gameplay should remain consistent.

---

# 52. Progressive Loading

The player should not stare at a blank screen unnecessarily.

Use:

* loading scene,
* progress indication,
* asset transitions,
* meaningful background.

Loading screen should belong to the game's visual language.

---

# 53. Deployment

Recommended flow:

```text
LOCAL
 ↓
GIT
 ↓
PULL REQUEST
 ↓
TEST
 ↓
STAGING / PREVIEW
 ↓
PRODUCTION
```

Every meaningful database change should have corresponding migration.

---

# 54. Environment Variables

Example categories:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SERVER_ONLY_SECRET
```

Never expose server-only credentials through:

* client bundles,
* public environment variables,
* logs,
* Git repository.

---

# 55. Git Workflow

Recommended:

```text
main
│
├── feature/ui
├── feature/vehicle
├── feature/puzzle
├── feature/database
└── feature/auth
```

Use small commits.

Example:

```text
feat: add vehicle ownership schema
feat: add garage interaction
fix: prevent invalid progress transition
refactor: separate vehicle state
```

---

# 56. Ownership Between Team Members

Suggested division:

## Gameplay Team

* vehicle physics,
* player movement,
* puzzle logic,
* game progression.

## UI / Environment / Audio

* visual system,
* HUD,
* interaction presentation,
* environment,
* lighting,
* audio.

## Backend / Security

* Supabase,
* schema,
* migrations,
* authentication,
* RLS,
* validation,
* persistence.

Interfaces between teams must be defined clearly.

---

# 57. Contract Between Game Runtime and Backend

Game runtime should not directly manipulate arbitrary database tables everywhere.

Prefer:

```text
Game Event
   ↓
Persistence Service
   ↓
Validated Operation
   ↓
Supabase
```

Example:

```text
PuzzleCompleted
        ↓
savePuzzleCompletion()
        ↓
validatePuzzleState()
        ↓
database
```

This prevents database logic from leaking throughout the game code.

---

# 58. Observability

MVP should track enough information to diagnose:

* save failures,
* authentication problems,
* unexpected progression states,
* performance problems,
* database errors.

Avoid collecting unnecessary player data.

---

# 59. Testing Strategy

## Unit Tests

Test:

* progression rules,
* vehicle calculations,
* validation schemas,
* state transitions.

## Integration Tests

Test:

* authentication,
* database operations,
* RLS,
* purchase flow,
* save/load.

## E2E Tests

Test critical flows:

```text
REGISTER
→ LOGIN
→ START GAME
→ PLAY
→ SAVE
→ LOGOUT
→ LOGIN
→ LOAD PROGRESS
```

And:

```text
UNAUTHORIZED USER
→ attempt protected operation
→ denied
```

---

# 60. Acceptance Criteria

## Authentication

* Users can authenticate.
* Sessions persist correctly.
* Protected operations reject unauthenticated requests.
* Logout invalidates the expected session state.

## Database

* Player data is isolated by ownership.
* RLS is enabled on player-owned tables.
* Invalid foreign keys are rejected.
* Invalid progression states are rejected.

## Gameplay Persistence

* Important progression survives refresh.
* Important progression survives logout/login.
* Failed saves do not silently destroy local gameplay state.

## Security

* Client cannot directly modify another player's data.
* Client cannot arbitrarily unlock progression.
* Client cannot purchase unavailable vehicles.
* Server/database validates important state changes.
* Secrets are never exposed to the client.

## Performance

* Initial scene loads acceptably.
* Gameplay remains responsive.
* Assets are loaded progressively.
* Database writes are event-based rather than frame-based.

---

# 61. MVP Technical Scope

## Must Have

* Next.js application
* TypeScript
* R3F / Three.js scene
* Player movement
* Basic vehicle
* Basic game state
* Supabase project
* Authentication
* PostgreSQL schema
* RLS
* Save/load
* Player progression
* Vehicle ownership
* Basic puzzle persistence
* Validation
* Error handling

## Should Have

* Server-side operations
* Database migrations
* Automated tests
* Rate limiting for sensitive operations
* Logging
* Save versioning

## Could Have

* Offline support
* Advanced analytics
* Multiplayer infrastructure
* Cloud sync conflict resolution
* Advanced anti-cheat

---

# 62. Implementation Order

Build in this order:

```text
1. Next.js Foundation
        ↓
2. Three.js / R3F Runtime
        ↓
3. Player + Vehicle Prototype
        ↓
4. Game State Architecture
        ↓
5. Supabase Project
        ↓
6. Auth
        ↓
7. Database Schema
        ↓
8. RLS
        ↓
9. Persistence Layer
        ↓
10. Progression
        ↓
11. Vehicle Ownership
        ↓
12. Puzzle Persistence
        ↓
13. Validation
        ↓
14. Security Testing
        ↓
15. Performance Optimization
        ↓
16. Production Deployment
```

---

# 63. Security Learning Track

Security should be implemented progressively.

## Level 1 — Fundamentals

Understand:

* authentication,
* authorization,
* sessions,
* cookies,
* JWT concepts,
* RLS.

## Level 2 — Database Security

Understand:

* ownership,
* policies,
* constraints,
* transactions,
* SQL injection concepts,
* least privilege.

## Level 3 — Application Security

Understand:

* input validation,
* server/client boundaries,
* CSRF concepts,
* XSS prevention,
* secure headers,
* rate limiting.

## Level 4 — Game Security

Understand:

* client tampering,
* progression manipulation,
* economy manipulation,
* replayed requests,
* state validation.

The goal is not to make a small game unnecessarily complicated.

The goal is:

> **learn where trust belongs.**

---

# 64. Core Architecture Principle

Project Quatro should follow this rule:

```text
THE CLIENT CAN ASK.
THE SERVER CAN DECIDE.
THE DATABASE CAN ENFORCE.
```

Client:

> "I solved this puzzle."

Server:

> "Is this player allowed to complete it?"

Database:

> "Does this state satisfy the constraints?"

Only after all relevant checks:

> Progress is committed.

---

# 65. Final Technical Vision

Project Quatro should demonstrate that a web game does not need to choose between:

**beautiful frontend**

and

**proper engineering.**

The project should simultaneously become:

* a playable game,
* a 3D web application,
* a database project,
* a security learning project,
* and a practical software engineering exercise.

The architecture should remain understandable enough for a student team to maintain.

Avoid premature enterprise complexity.

Avoid blindly copying production architectures from massive games.

Build only what the game actually needs.

---

# 66. Definition of Done

The technical foundation is considered successful when:

* The game can run reliably in the browser.
* Player identity is handled through Supabase Auth.
* Player-owned data is protected by RLS.
* Important state changes are validated.
* Database integrity is enforced with PostgreSQL constraints.
* Client-side state is never treated as inherently trustworthy.
* Save/load works across sessions.
* Vehicle ownership and progression persist correctly.
* Critical operations have clear server-side boundaries.
* Secrets remain server-side.
* Database changes are version-controlled.
* The team can understand and extend the architecture without excessive complexity.

---

# Final Principle

> **Build the game as if the browser is honest.**
>
> **Secure the backend as if it isn't.**

The player should experience a seamless, warm, low-friction world.

Behind that experience, the system should have clear boundaries:

```text
EXPERIENCE
    ↓
GAME RUNTIME
    ↓
SERVER BOUNDARY
    ↓
AUTHORIZATION
    ↓
DATABASE
    ↓
INTEGRITY
```

The complexity should live underneath the experience—not in front of it.
