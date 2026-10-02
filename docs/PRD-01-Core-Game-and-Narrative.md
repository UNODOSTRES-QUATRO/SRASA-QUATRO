# Product Requirements Document

# Project Quatro — Core Game & Narrative

> **Document Purpose:** Menjadi sumber kebenaran utama untuk gameplay loop, progression, narrative, world structure, vehicle mechanics, exploration, puzzle, dan player experience.
>
> **Implementation Note:** Dokumen ini tidak menentukan implementasi teknis secara mendalam. UI/UX, visual direction, environment art direction, audio, database, authentication, dan security akan dibahas dalam PRD terpisah.

---

# 1. Game Overview

## Working Title

**Project Quatro**

## Genre

* Narrative Exploration
* Third-Person Driving
* Point-and-Click Exploration
* Environmental Puzzle
* Light Adventure
* Cozy / Low-Cortisol Experience

## Core Experience

Pemain mengikuti kehidupan seorang pekerja yang awalnya menjalani rutinitas biasa: pergi bekerja, menyelesaikan tugas, pulang, dan mengulanginya.

Namun, rutinitas tersebut perlahan mulai berubah.

Perubahan awal sangat kecil dan ambigu. Lingkungan terasa sedikit berbeda. Jalan yang biasanya sama mulai memiliki detail yang tidak seharusnya ada. Struktur dunia perlahan menjadi tidak konsisten.

Sampai akhirnya sebuah portal muncul dan membawa pemain menuju dimensi voxel yang berasal dari akumulasi kode, data, dan memori.

Di dunia tersebut, mobil Quatro milik pemain memiliki kemampuan yang tidak masuk akal: dapat berubah ukuran dari mobil normal menjadi **Pocket Car**.

Pemain kemudian harus menjelajahi dunia baru, memahami apa yang terjadi, memecahkan berbagai puzzle, dan menemukan jalan kembali.

---

# 2. Design Pillars

Semua keputusan gameplay harus mengacu pada lima prinsip berikut.

## 2.1 Exploration Over Pressure

Pemain didorong untuk mengamati dan mengeksplorasi, bukan terburu-buru.

Tidak ada kebutuhan untuk:

* speedrun
* reaction test yang ekstrem
* timer yang memaksa
* musuh yang terus mengejar
* punishment berlebihan

Puzzle harus terasa seperti:

> "Aku menemukan sesuatu."

bukan:

> "Aku gagal karena waktuku habis."

---

## 2.2 Curiosity Over Explanation

Game tidak harus langsung menjelaskan semua hal.

Pemain sebaiknya terlebih dahulu:

1. melihat sesuatu yang aneh,
2. merasa penasaran,
3. mencoba berinteraksi,
4. menemukan hubungan,
5. kemudian memahami konteksnya.

Environmental storytelling menjadi bagian penting dari narrative.

---

## 2.3 Movement Should Feel Good

Mobil bukan hanya alat transportasi.

Mengendarai Quatro harus terasa sebagai aktivitas yang menyenangkan dengan:

* steering yang responsif,
* akselerasi yang terasa,
* braking yang dapat diprediksi,
* weight yang terasa,
* drift yang terkendali,
* collision yang tidak frustratif.

Driving harus memberikan **physical satisfaction** bahkan ketika tidak sedang menyelesaikan objective.

---

## 2.4 Progression Should Feel Earned

Pemain mendapatkan akses baru secara bertahap.

Progression dapat membuka:

* area baru,
* kemampuan baru,
* kendaraan baru,
* upgrade,
* customization,
* puzzle interaction baru,
* shortcut,
* akses terhadap bagian dunia yang sebelumnya tidak dapat dijangkau.

Progression tidak boleh terasa seperti sekadar angka level.

Setiap unlock harus memiliki fungsi atau makna terhadap pengalaman bermain.

---

## 2.5 Mystery Without Horror

Dunia dapat menjadi semakin aneh tanpa berubah menjadi horror game.

Anomali harus terasa:

* mysterious,
* surreal,
* curious,
* beautiful,
* sedikit uncanny,

tetapi tidak:

* gore,
* jumpscare,
* psychological horror,
* chase horror,
* oppressive darkness.

Target emosional:

> "Ada sesuatu yang salah dengan dunia ini."

bukan:

> "Aku takut berada di sini."

---

# 3. Target Player Experience

Setelah bermain, pemain diharapkan merasa:

* tenang,
* penasaran,
* nyaman mengeksplorasi,
* puas ketika menemukan solusi,
* attached terhadap mobil dan dunia,
* tertarik terhadap misteri,
* memiliki rasa progression.

Game seharusnya dapat dimainkan dalam keadaan santai.

Tidak semua sesi bermain harus menghasilkan progress besar.

Bahkan sekadar:

> mengendarai mobil → melihat lingkungan → menemukan sesuatu → kembali

harus tetap terasa valid.

---

# 4. Core Gameplay Loop

Core loop:

```text
EXPLORE
   ↓
OBSERVE
   ↓
INTERACT
   ↓
SOLVE
   ↓
UNLOCK
   ↓
PROGRESS
   ↓
EXPLORE FURTHER
```

Untuk driving:

```text
ENTER CAR
   ↓
DRIVE
   ↓
DISCOVER LOCATION / ANOMALY
   ↓
PARK / EXIT
   ↓
EXPLORE
```

Untuk progression:

```text
PLAY
   ↓
EARN / DISCOVER
   ↓
UNLOCK
   ↓
UPGRADE / CUSTOMIZE
   ↓
ACCESS NEW POSSIBILITY
```

---

# 5. Chapter Structure

# Chapter 1 — The Routine

## Duration

Day 1–Day 3.

## Purpose

Chapter pertama memperkenalkan:

* player character,
* Quatro,
* driving,
* workplace,
* basic interaction,
* daily routine,
* dunia normal.

Pada awal game, semuanya harus terasa normal.

Keanehan diperkenalkan secara gradual.

---

# 6. Day 1 — The Routine

## Narrative

Hari pertama merupakan hari normal.

Pemain bangun, bersiap, mengambil mobil, dan pergi bekerja.

Jalan yang dilewati terasa familiar.

Tidak ada sesuatu yang supernatural.

## Gameplay

Pemain:

1. mengambil / memasuki Quatro,
2. berkendara menuju tempat kerja,
3. parkir,
4. masuk ke kantor,
5. menyelesaikan pekerjaan,
6. keluar,
7. kembali ke rumah,
8. tidur.

## Workplace Mini-Game

Pekerjaan menggunakan mekanik interaksi sederhana seperti:

* logical arrangement,
* code completion,
* point-and-click,
* pattern recognition,
* debugging sederhana.

Tujuan mini-game bukan menguji kemampuan programming secara serius.

Tujuannya adalah memberikan representasi gameplay dari pekerjaan karakter.

## End State

Setelah pekerjaan selesai:

```text
WORK → DRIVE HOME → REST → NEXT DAY
```

---

# 7. Day 2 — The Shift

Hari kedua masih mengikuti rutinitas yang sama.

Namun dunia mulai berubah.

Perubahan harus sangat subtle.

Contoh:

* posisi pohon berubah,
* jumlah kendaraan berbeda,
* bangunan memiliki detail berbeda,
* warna langit berubah,
* objek tertentu muncul atau menghilang,
* jalan terasa sedikit berbeda,
* signage memiliki perubahan kecil,
* objek familiar berada di lokasi yang salah.

Tidak semua perubahan harus disadari pemain.

Game tidak mengatakan:

> "Something has changed."

Biarkan pemain menyadarinya sendiri.

## Gameplay Principle

Driving pada Day 2 harus memberikan cukup waktu kepada pemain untuk memperhatikan lingkungan.

Tidak ada urgency.

---

# 8. Day 3 — The Anomalies

Perubahan menjadi semakin jelas.

Contoh:

* bentuk bangunan mulai tidak konsisten,
* beberapa objek memiliki bentuk terlalu geometris,
* jalan terlihat seperti tersusun dari grid,
* tekstur mulai mengalami perubahan,
* objek dunia nyata mulai memiliki karakteristik voxel.

Kemudian sebuah portal muncul di tengah perjalanan.

Portal merupakan titik transisi besar antara dua dunia.

## Portal Sequence

```text
NORMAL ROAD
     ↓
ENVIRONMENTAL ANOMALY
     ↓
VOXEL ELEMENTS APPEAR
     ↓
PORTAL
     ↓
REALITY DISTORTION
     ↓
TRANSITION
     ↓
VOXEL WORLD
```

Ketika Quatro melewati portal, realitas berubah.

---

# 9. Chapter 2 — The Voxel Dimension

Pemain tiba di dimensi baru.

Dunia memiliki struktur voxel yang jelas berbeda dari dunia sebelumnya.

Namun dunia tersebut bukan sekadar "Minecraft world".

Ia harus terasa seperti sebuah dimensi yang dibentuk oleh:

* kode,
* data,
* memory,
* struktur digital,
* fragments of the previous world.

---

# 10. Pocket Car Transformation

Saat memasuki dimensi voxel, Quatro mengalami perubahan ukuran.

Mobil normal berubah menjadi **Pocket Car**.

## Normal State

Ukuran kendaraan:

```text
PLAYER ≈ HUMAN SCALE
CAR ≈ NORMAL VEHICLE
```

## Pocket State

```text
PLAYER ≈ HUMAN SCALE
CAR ≈ HAND-SIZED
```

Pocket Car dapat:

* dibawa,
* diletakkan,
* dilempar,
* digunakan sebagai puzzle object,
* dikembalikan ke ukuran normal pada lokasi tertentu.

Transformasi ini menjadi salah satu identitas utama game.

---

# 11. The Guardian

Di gerbang kastil, pemain bertemu dengan seorang kakek tua.

## Role

**The Guardian**

Ia merupakan karakter yang mengetahui sejarah dimensi voxel.

Namun exposition tidak boleh terasa seperti lore dump panjang.

Informasi diberikan secara bertahap melalui percakapan dan eksplorasi.

## Core Lore

Dimensi tersebut tercipta dari akumulasi:

* kode,
* data,
* program lama,
* memory,
* dan fragments dari dunia luar.

Anomali yang muncul di dunia nyata merupakan indikasi bahwa batas antara kedua dunia mulai rusak.

Dimensi voxel tidak hanya muncul.

Ia mulai **bocor ke realitas**.

---

# 12. Chapter 3 — The Castle

Pemain mencapai sebuah kastil voxel.

Gerbang utama terkunci.

Tujuan utama:

> menemukan cara untuk membuka kastil dan menemukan jalan kembali ke dunia nyata.

Kastil menjadi hub utama untuk exploration dan puzzle.

Area awal yang dapat digunakan:

* Main Hall
* Kitchen
* Library
* Basement
* Workshop
* Courtyard
* Secret Rooms

---

# 13. Exploration System

Pemain dapat berjalan kaki dan berinteraksi dengan objek.

Interaksi utama:

```text
APPROACH
   ↓
INSPECT
   ↓
INTERACT
   ↓
DISCOVER
```

Contoh:

### Desk

Pemain memeriksa meja.

Menemukan:

* drawer,
* note,
* key,
* strange symbol.

### Kitchen

Pemain memeriksa:

* cabinet,
* pot,
* bottles,
* mechanisms,
* hidden switch.

### Library

Pemain dapat menemukan:

* books,
* diagrams,
* lore fragments,
* keys,
* clues.

---

# 14. Point-and-Click Puzzle Philosophy

Puzzle harus berorientasi pada:

**observation → connection → solution**

bukan:

**trial → error → punishment**

Contoh:

Pemain melihat tiga simbol pada pintu.

Di ruangan lain terdapat tiga buku dengan simbol yang sama.

Pemain menyadari hubungan tersebut dan memasukkan urutan yang benar.

Tidak ada timer.

Tidak ada punishment berat.

---

# 15. Pocket Car Mechanics

Pocket Car menjadi extension dari pemain.

## Mode 1 — Carry

Pemain membawa mobil.

## Mode 2 — Place

Mobil dapat diletakkan pada object atau surface tertentu.

## Mode 3 — Throw

Mobil dapat dilempar ke lokasi tertentu jika desain puzzle membutuhkannya.

## Mode 4 — Trigger

Pocket Car dapat:

* menekan button,
* masuk ke celah,
* mengaktifkan mechanism,
* mengambil jalur kecil,
* mencapai area yang tidak dapat dicapai player.

---

# 16. Big Car Mode

Pada area yang cukup luas, Pocket Car dapat dikembalikan ke ukuran normal.

Pemain masuk ke dalam kendaraan.

Big Car Mode memungkinkan:

* driving,
* acceleration,
* controlled drifting,
* breaking weak structures,
* crossing gaps,
* activating heavy pressure plates,
* pushing objects,
* accessing large areas.

Perubahan ukuran harus terasa sebagai gameplay mechanic, bukan sekadar visual effect.

---

# 17. Dual-Scale Puzzle Design

Puzzle dapat menggunakan perbedaan skala sebagai mekanik utama.

Contoh:

```text
PLAYER SCALE
     ↓
cannot reach button
     ↓
POCKET CAR
     ↓
car enters small passage
     ↓
activates mechanism
     ↓
large door opens
     ↓
BIG CAR
     ↓
drives through newly opened area
```

Puzzle yang baik dapat mengharuskan pemain berpindah antara:

**Human → Pocket Car → Human → Big Car**

---

# 18. Vehicle Progression

Game juga memiliki sistem progression kendaraan.

Progression awal sengaja dibuat terbatas.

Pemain tidak langsung mendapatkan kendaraan terbaik.

## Progression Concept

```text
START
 ↓
SLOW / LIMITED MOBILITY
 ↓
GET VEHICLE
 ↓
ACCESS WORK
 ↓
ACCESS GARAGE
 ↓
UPGRADE VEHICLE
 ↓
UNLOCK BETTER VEHICLES
 ↓
MAX VEHICLE LEVEL
```

Kendaraan menjadi bagian dari progression dunia.

---

# 19. Vehicle Unlocks

Setiap progression level dapat membuka kendaraan yang memiliki karakteristik berbeda.

Contoh atribut:

* acceleration,
* top speed,
* handling,
* braking,
* weight,
* turning,
* stability.

Perbedaan kendaraan harus terasa dalam gameplay, bukan hanya angka statistik.

---

# 20. Vehicle Customization

Pemain dapat melakukan customization.

Initial customization:

* spoiler,
* side skirt / side card,
* bumper,
* wheels,
* visual accessories.

Customization dapat memiliki dua kategori:

### Cosmetic

Mengubah appearance.

### Functional

Mengubah karakteristik kendaraan apabila dibutuhkan oleh gameplay.

Functional upgrades harus tetap balanced.

---

# 21. Garage

Garage menjadi tempat utama untuk:

* melihat kendaraan,
* memperbaiki kendaraan,
* upgrade,
* customization,
* mengganti kendaraan.

Garage juga dapat menjadi recurring location yang memberi rasa progression.

---

# 22. Work System

Pemain dapat mengunjungi tempat kerja.

Work memiliki fungsi:

* progression,
* narrative,
* resource acquisition,
* gameplay variety.

Contoh aktivitas:

* coding puzzle,
* logic puzzle,
* debugging,
* arrangement,
* data interaction.

Work harus tetap ringan dan tidak berubah menjadi programming simulator penuh.

---

# 23. Economy & Progression

Jika resource system digunakan, prioritaskan simplicity.

Resource dapat digunakan untuk:

* repair,
* vehicle upgrades,
* customization,
* unlocking vehicles.

Hindari ekonomi yang terlalu kompleks.

Game bukan economic simulator.

---

# 24. Failure Philosophy

Failure harus low-cost.

Contoh:

Jika kendaraan menabrak sesuatu:

* kendaraan tidak langsung hancur,
* pemain tidak kehilangan progress besar,
* dapat melakukan reset / reposition,
* dapat memperbaiki kendaraan di garage.

Tujuan failure adalah memberikan feedback, bukan menghukum pemain.

---

# 25. No Game Over Philosophy

Game sebaiknya menghindari conventional game over selama exploration.

Jika pemain melakukan kesalahan:

```text
ERROR
 ↓
RECOVER
 ↓
TRY AGAIN
```

bukan:

```text
ERROR
 ↓
GAME OVER
 ↓
RESTART
```

---

# 26. Chapter Progression Summary

```text
CHAPTER 1
THE ROUTINE
│
├── Day 1
│   └── Normal Life
│
├── Day 2
│   └── Subtle Changes
│
└── Day 3
    └── Anomalies
        ↓
      PORTAL
        ↓
CHAPTER 2
THE VOXEL DIMENSION
│
├── Arrival
├── Pocket Car
└── The Guardian
        ↓
CHAPTER 3
THE CASTLE
│
├── Exploration
├── Point-and-Click
├── Pocket Car Puzzles
├── Big Car Puzzles
└── Castle Progression
        ↓
FUTURE CHAPTERS
│
├── More Areas
├── More Vehicles
├── Deeper Lore
└── Return to Reality
```

---

# 27. MVP Scope

MVP harus membuktikan core fantasy game.

## Required

* Third-person player movement
* Functional Quatro
* Basic driving
* One normal-world road
* One workplace
* Basic work mini-game
* Day progression
* Environmental changes
* Portal
* Voxel world
* Pocket Car transformation
* Guardian NPC
* One castle area
* Basic point-and-click interaction
* One Pocket Car puzzle
* One Big Car puzzle

## Optional

* Vehicle customization
* Multiple vehicles
* Advanced economy
* Large castle
* Multiple chapters
* Complex lore
* Advanced vehicle physics

---

# 28. MVP Success Criteria

MVP berhasil jika pemain dapat mengalami sequence berikut tanpa kebingungan:

```text
NORMAL LIFE
→
DRIVE
→
WORK
→
RETURN
→
WORLD CHANGES
→
PORTAL
→
VOXEL WORLD
→
POCKET CAR
→
GUARDIAN
→
CASTLE
→
PUZZLE
→
DISCOVERY
```

Pemain harus memahami tiga hal secara intuitif:

1. **Mobil adalah bagian penting dari gameplay.**
2. **Dunia ini memiliki misteri yang perlu dieksplorasi.**
3. **Perubahan ukuran mobil membuka kemungkinan puzzle baru.**

---

# 29. Future Expansion

Setelah MVP stabil, game dapat diperluas dengan:

* lebih banyak kendaraan,
* garage progression,
* vehicle customization,
* area voxel baru,
* dunia di luar kastil,
* environmental puzzles,
* NPC tambahan,
* lore fragments,
* alternate routes,
* secret areas,
* advanced Pocket Car mechanics,
* return-to-reality storyline.

---

# 30. Core Statement

> **Project Quatro is a game about moving through a familiar life until reality quietly becomes something else.**

Mobil bukan hanya kendaraan.

Kastil bukan hanya dungeon.

Puzzle bukan hanya obstacle.

Dunia voxel bukan hanya tempat baru.

Semuanya merupakan bagian dari perjalanan pemain untuk memahami **mengapa realitas mulai berubah**, dan apa hubungan dirinya dengan dunia tersebut.

Gameplay harus selalu menjaga keseimbangan antara:

**movement, curiosity, discovery, progression, and calm.**
