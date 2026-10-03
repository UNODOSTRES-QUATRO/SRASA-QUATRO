export type Language = "id" | "en";

export interface TranslationDictionary {
  // Opening & Cinematic
  cinematic_quote: string;
  cinematic_title: string;
  cinematic_subtitle: string;
  cinematic_press_start: string;
  cinematic_skip: string;

  // Character Selection
  char_select_title: string;
  char_select_subtitle: string;
  char_select_choose: string;
  char_select_start: string;
  char_1_name: string;
  char_1_role: string;
  char_1_desc: string;
  char_1_quote: string;
  char_2_name: string;
  char_2_role: string;
  char_2_desc: string;
  char_2_quote: string;
  char_3_name: string;
  char_3_role: string;
  char_3_desc: string;
  char_3_quote: string;
  char_4_name: string;
  char_4_role: string;
  char_4_desc: string;
  char_4_quote: string;
  char_5_name: string;
  char_5_role: string;
  char_5_desc: string;
  char_5_quote: string;
  char_6_name: string;
  char_6_role: string;
  char_6_desc: string;
  char_6_quote: string;

  // Day & Phases
  day_label: string;
  morning: string;
  evening: string;
  at_work: string;
  commute: string;
  void_realm: string;

  // Quests & Objectives
  obj_wake_up: string;
  obj_cook: string;
  obj_eat: string;
  obj_shower: string;
  obj_leave_house: string;
  obj_drive_work: string;
  obj_work_tasks: string;
  obj_leave_work: string;
  obj_drive_home: string;
  obj_shower_evening: string;
  obj_dinner_evening: string;
  obj_sleep_evening: string;
  obj_enter_portal: string;
  obj_speak_sage: string;
  obj_explore_void: string;
  obj_reach_castle: string;
  obj_search_cabinet: string;
  obj_inspect_hearth: string;
  obj_find_loose_stone: string;
  obj_open_safe: string;
  obj_unlock_exit: string;
  obj_escape_keep: string;
  obj_rest_moment: string;

  // Day prompts
  prompt_day1_morning: string;
  prompt_day2_morning: string;
  prompt_day3_morning: string;
  prompt_woken_up: string;
  prompt_cooked: string;
  prompt_eaten: string;
  prompt_showered: string;
  prompt_showered_evening: string;
  prompt_eaten_evening: string;
  prompt_work_done: string;
  prompt_portal_open: string;
  prompt_must_finish_evening: string;

  // Interactions [E]
  action_wake: string;
  action_cook: string;
  action_eat: string;
  action_shower: string;
  action_leave_door: string;
  action_enter_car: string;
  action_exit_car: string;
  action_talk_mechanic: string;
  action_work_station: string;
  action_talk_jeffrey: string;
  action_talk_vespera: string;
  action_talk_barnaby: string;
  action_inspect_fountain: string;
  action_inspect_hay: string;
  action_enter_keep: string;
  action_inspect_cabinet: string;
  action_inspect_hearth: string;
  action_inspect_stone: string;
  action_inspect_exit: string;
  action_talk_sage: string;
  action_sleep: string;
  action_drive: string;

  // Tutorials
  tut_move_title: string;
  tut_move_desc: string;
  tut_move_click: string;
  tut_quest_title: string;
  tut_quest_desc: string;
  tut_follow_title: string;
  tut_follow_desc: string;
  tut_ok: string;

  // UI Buttons & HUD
  hud_follow_quest: string;
  hud_following: string;
  hud_nearby: string;
  hud_menu: string;
  hud_audio_on: string;
  hud_audio_off: string;
  hud_weapons: string;
  hud_speed: string;

  // Pause Menu
  pause_title: string;
  pause_resume: string;
  pause_restart: string;
  pause_controls: string;
  pause_sound: string;
  pause_language: string;

  // Ending
  end_title: string;
  end_subtitle: string;
  end_quote: string;
  end_play_again: string;

  // Mechanic dialogue
  dialogue_mechanic_title: string;
  dialogue_mechanic_role: string;
  dialogue_mechanic_1: string;
  dialogue_mechanic_2: string;
  dialogue_mechanic_3: string;

  // Castle NPCs dialogue
  dialogue_jeffrey_title: string;
  dialogue_jeffrey_role: string;
  dialogue_jeffrey_1: string;
  dialogue_jeffrey_2: string;
  dialogue_jeffrey_3: string;

  dialogue_vespera_title: string;
  dialogue_vespera_role: string;
  dialogue_vespera_1: string;
  dialogue_vespera_2: string;
  dialogue_vespera_3: string;

  dialogue_barnaby_title: string;
  dialogue_barnaby_role: string;
  dialogue_barnaby_1: string;
  dialogue_barnaby_2: string;
  dialogue_barnaby_3: string;

  // Old Sage dialogue
  dialogue_sage_title: string;
  dialogue_sage_role: string;
  dialogue_sage_1: string;
  dialogue_sage_2: string;
  dialogue_sage_3: string;
  dialogue_sage_summon: string;
  dialogue_sage_opt1: string;
  dialogue_sage_opt2: string;
  dialogue_sage_opt3: string;

  // Escape Room Clues & Texts
  escape_door_trapped: string;
  escape_cabinet_title: string;
  escape_cabinet_text: string;
  escape_hearth_title: string;
  escape_hearth_text: string;
  escape_stone_title: string;
  escape_stone_locked_text: string;
  escape_stone_open_text: string;
  escape_safe_title: string;
  escape_safe_prompt: string;
  escape_safe_submit: string;
  escape_safe_wrong: string;
  escape_safe_correct: string;
  escape_exit_title: string;
  escape_exit_locked: string;
  escape_exit_open: string;
  escape_key_found: string;

  // Workplace mini-game
  work_title: string;
  work_tab_code: string;
  work_tab_bugs: string;
  work_tab_deploy: string;
  work_code_hint: string;
  work_bugs_hint: string;
  work_push_btn: string;
  work_complete_btn: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  id: {
    cinematic_quote: "Tidak semua akhir harus menjadi titik; kadang kita hanya perlu berhenti sebentar sebelum melanjutkan.",
    cinematic_title: "PROJECT QUATRO",
    cinematic_subtitle: "DUNIA DI ANTARA JEDA",
    cinematic_press_start: "Tekan Layar atau [Spasi] untuk Memulai",
    cinematic_skip: "Lewati [Esc]",

    char_select_title: "PILIH KARAKTER",
    char_select_subtitle: "Siapa yang akan melangkah menelusuri jeda realitas ini?",
    char_select_choose: "PILIH",
    char_select_start: "MULAI PETUALANGAN",

    char_1_name: "The Original",
    char_1_role: "Karyawan Biasa",
    char_1_desc: "Pria pekerja kantor dengan gaya sederhana dan mata sedikit lelah. Praktis, bersahaja, dan terkadang sarkastik.",
    char_1_quote: "Pagi yang sama. Kopi dingin. Kuharap hari ini kode berjalan lancar.",

    char_2_name: "The Cool Glasses Guy",
    char_2_role: "Analis Data",
    char_2_desc: "Pria berkacamata rapi dengan jaket abu-abu biru. Analitis, tenang, berhumor kering dan sangat teliti.",
    char_2_quote: "Entah gedungnya yang bergeser beberapa derajat, atau memoriku yang keliru.",

    char_3_name: "The Long-Haired Girl",
    char_3_role: "Desainer Grafis",
    char_3_desc: "Gadis berambut panjang dengan busana hangat bernuansa seni. Intuitif, peka terhadap perubahan atmosfer.",
    char_3_quote: "Tidak ada yang tampak rusak... tapi rasanya ada sesuatu yang hilang dari dunia ini.",

    char_4_name: "The Muslimah Girl",
    char_4_role: "Software Engineer",
    char_4_desc: "Gadis berhijab modis dengan pakaian santun dan sepatu praktis. Cerdas, sabar, teliti, dan bersahaja.",
    char_4_quote: "Mari kita periksa sekali lagi dengan tenang. Kadang jawabannya ada di hal yang paling hening.",

    char_5_name: "The Short-Haired Girl",
    char_5_role: "Problem Solver",
    char_5_desc: "Wanita berambut pendek dengan pakaian profesional aksen terakota. Mandiri, lugas, dan berani mengambil keputusan.",
    char_5_quote: "Baiklah. Kita belum tahu apa ini. Jadi mari kita cari tahu bersama sekarang.",

    char_6_name: "The Quiet Hoodie Guy",
    char_6_role: "Sound Designer",
    char_6_desc: "Pria ber-hoodie gelap dengan headphone di leher dan rambut sedikit berantakan. Introvert, imajinatif, dan peka frekuensi.",
    char_6_quote: "Aku yakin pernah mendengar nada dan simbol itu sebelumnya di suatu tempat.",

    day_label: "Hari",
    morning: "Pagi",
    evening: "Malam",
    at_work: "Kantor",
    commute: "Perjalanan",
    void_realm: "Alam Astral",

    obj_wake_up: "Bangun dari tempat tidur",
    obj_cook: "Masak sarapan di dapur",
    obj_eat: "Makan sarapan di meja",
    obj_shower: "Mandi pagi di kamar mandi",
    obj_leave_house: "Keluar rumah menuju mobil",
    obj_drive_work: "Kendarai Quatro menuju kantor",
    obj_work_tasks: "Selesaikan tugas di workstation PC",
    obj_leave_work: "Keluar kantor menuju kendaraan",
    obj_drive_home: "Kendarai Quatro pulang ke rumah",
    obj_shower_evening: "Mandi malam setelah pulang kerja",
    obj_dinner_evening: "Makan malam di meja makan",
    obj_sleep_evening: "Tidur di ranjang untuk istirahat",
    obj_enter_portal: "Masuki portal Semicolon yang muncul",
    obj_speak_sage: "Bicara dengan Tetua di Alam Hampa",
    obj_explore_void: "Kendarai Quatro melintasi Void Highway",
    obj_reach_castle: "Masuki Kompleks Kastil Kuno",
    obj_search_cabinet: "Periksa lemari kayu tua",
    obj_inspect_hearth: "Periksa perapian batu",
    obj_find_loose_stone: "Temukan batu rahasia di dinding",
    obj_open_safe: "Masukkan 4 angka sandi brankas",
    obj_unlock_exit: "Buka pintu keluar dengan Kunci Master",
    obj_escape_keep: "Lolos dari aula kastil",
    obj_rest_moment: "Berhenti sejenak dan renungkan",

    prompt_day1_morning: "Hari 1 — Pagi yang cerah. Bangun dari ranjang lalu siapkan sarapan.",
    prompt_day2_morning: "Hari 2 — Bangun pagi. Ada rasa asing di udara. Selesaikan rutinitas.",
    prompt_day3_morning: "Hari 3 — Getaran aneh terasa di dinding. Berangkat ke kantor untuk tugas terakhir.",
    prompt_woken_up: "Sudah bangun. Siapkan sarapan di dapur.",
    prompt_cooked: "Sarapan telah matang. Santap di meja makan.",
    prompt_eaten: "Selesai makan. Mandi bersih sebelum berangkat kerja.",
    prompt_showered: "Segar. Quatro sudah siap di halaman depan.",
    prompt_showered_evening: "Mandi malam selesai. Siapkan makan malam.",
    prompt_eaten_evening: "Makan malam selesai. Waktunya tidur di ranjang.",
    prompt_work_done: "Tugas hari ini tuntas. Keluar kantor dan kembali ke mobil untuk pulang.",
    prompt_portal_open: "✦ Sebuah portal aneh bermotif titik-koma terbuka di ambang pintu!",
    prompt_must_finish_evening: "Kamu harus mandi dan makan malam terlebih dahulu sebelum tidur!",

    action_wake: "Bangun",
    action_cook: "Masak Sarapan",
    action_eat: "Makan",
    action_shower: "Mandi",
    action_leave_door: "Keluar Rumah",
    action_enter_car: "Masuk Quatro",
    action_exit_car: "Turun Mobil",
    action_talk_mechanic: "Bicara · Pak Montir",
    action_work_station: "Workstation PC",
    action_talk_jeffrey: "Bicara · Sir Jeffrey",
    action_talk_vespera: "Bicara · Lady Vespera",
    action_talk_barnaby: "Bicara · Barnaby",
    action_inspect_fountain: "Periksa · Air Mancur",
    action_inspect_hay: "Periksa · Jerami",
    action_enter_keep: "Masuk Aula Kastil",
    action_inspect_cabinet: "Periksa Lemari",
    action_inspect_hearth: "Periksa Perapian",
    action_inspect_stone: "Periksa Dinding Rahasia",
    action_inspect_exit: "Periksa Pintu Keluar",
    action_talk_sage: "Bicara · Tetua Hampa",
    action_sleep: "Tidur",
    action_drive: "Mengemudi",

    tut_move_title: "NAVIGASI KARAKTER",
    tut_move_desc: "Gunakan tombol [W, A, S, D] atau Tombol Panah untuk bergerak. Tekan [Shift] atau [Space] untuk interaksi cepat.",
    tut_move_click: "Klik Kiri pada lantai untuk fitur Click-to-Move (jalan otomatis ke titik klik).",
    tut_quest_title: "TAB OBJEKTIF & PETUNJUK",
    tut_quest_desc: "Tujuan saat ini selalu ditampilkan di bilah atas. Fokus pada satu langkah dalam satu waktu.",
    tut_follow_title: "PANDUAN JALUR OBJEKTIF",
    tut_follow_desc: "Garis panduan bercahaya di lantai akan menunjukkan arah menuju tujuan aktif.",
    tut_ok: "MENGERTI [Lanjut]",

    hud_follow_quest: "PANDU JALUR",
    hud_following: "MEMANDU",
    hud_nearby: "pemain terdekat",
    hud_menu: "Menu [Esc]",
    hud_audio_on: "Audio Lo-fi Aktif",
    hud_audio_off: "Audio Mati",
    hud_weapons: "Senjata [Q/F]",
    hud_speed: "KM/J",

    pause_title: "MENU JEDA",
    pause_resume: "Lanjutkan Game",
    pause_restart: "Mulai Ulang dari Awal",
    pause_controls: "Kontrol: [WASD] Gerak, [E] Interaksi, [C] Kamera, Drag Mouse Putar Sudut",
    pause_sound: "Suara & Musik",
    pause_language: "Pilihan Bahasa",

    end_title: "BERSAMBUNG",
    end_subtitle: "BABAK 1: DI ANTARA DUA TITIK",
    end_quote: "Sebagian kisah menemui titik akhir. Sebagian lagi hanya perlu sebuah titik-koma untuk bernapas sejenak sebelum melangkah lebih jauh.",
    end_play_again: "MAIN LAGI DARI AWAL",

    dialogue_mechanic_title: "PAK MONTIR",
    dialogue_mechanic_role: "Kepala Bengkel Srasa",
    dialogue_mechanic_1: "Halo, Bung! Quatro-mu sudah kucek total. Oli baru, suspensi empuk, dan sistem elektriknya mulus.",
    dialogue_mechanic_2: "Kalau mau jalan-jalan, pastikan jaga kecepatan di tikungan jalan tol. Aspal di luar terasa agak aneh belakangan ini.",
    dialogue_mechanic_3: "Hati-hati di jalan ya. Mobil ini punya ikatan khusus dengan pemiliknya.",

    dialogue_jeffrey_title: "SIR JEFFREY",
    dialogue_jeffrey_role: "Penjaga Gerbang Kastil",
    dialogue_jeffrey_1: "Berhenti! Kau datang menembus kabut kehampaan. Benteng ini berdiri sejak kompilasi pertama dunia kita.",
    dialogue_jeffrey_2: "Tak seorang pun dapat keluar dari Aula Utama melalui pintu tempat mereka masuk. Begitulah hukum ruang ini dibangun.",
    dialogue_jeffrey_3: "Jika kau ingin mencari jalan keluar, perhatikan urutan petunjuk: Lemari tua menyimpan awal rahasia.",

    dialogue_vespera_title: "LADY VESPERA",
    dialogue_vespera_role: "Penyihir Cendekia Kastil",
    dialogue_vespera_1: "Aura Semicolon melingkupi tempat ini. Angka-angka sandi tersembunyi di tempat yang hangat dan terlupakan.",
    dialogue_vespera_2: "Setelah lemari dibuka, perapian batu menyimpan bagian sandi berikutnya di balik abunya.",
    dialogue_vespera_3: "Jangan terburu-buru memasukkan angka. Tiga petunjuk harus tersambung menjadi satu kesatuan logis.",

    dialogue_barnaby_title: "BARNABY",
    dialogue_barnaby_role: "Pengelana Pustaka",
    dialogue_barnaby_1: "Buku harianku mencatat mekanisme aula ini: Lemari (7), Perapian (4), dan Batu Tersembunyi (21).",
    dialogue_barnaby_2: "Gabungkan mereka: Lemari memberi angka 7, Perapian memberi angka 4, dan rongga dinding membisikkan 21.",
    dialogue_barnaby_3: "Kunci Master ada di dalam brankas besi itu. Bawa kunci itu ke pintu keluar di sisi seberang.",

    dialogue_sage_title: "TETUA SEMICOLON",
    dialogue_sage_role: "Penjaga Ruang Antara",
    dialogue_sage_1: "Selamat datang di ruang di antara jeda, Pengembara. Realitas aslimu tidak hancur; ia hanya sedang berhenti sebentar.",
    dialogue_sage_2: "Dunia ini dulunya bergerak seperti sebuah kalimat yang indah. Lalu sesuatu membuatnya lupa kapan harus berhenti dan kapan harus melanjutkan.",
    dialogue_sage_3: "Mobilmu memiliki resonansi yang kuat dengan jiwamu. Biarkan aku memanggilnya kemari untuk membantumu melintasi Void Highway.",
    dialogue_sage_summon: "✦ Memanggil Quatro ke Void Highway...",
    dialogue_sage_opt1: "Bagaimana cara aku kembali ke rumah?",
    dialogue_sage_opt2: "Tempat apa sebenarnya ini?",
    dialogue_sage_opt3: "Bisa panggilkan mobil Quatro-ku?",

    escape_door_trapped: "Pintu terbanting menutup keras di belakangmu! Pintu terkunci dari luar. Cari petunjuk di dalam ruangan.",
    escape_cabinet_title: "LEMARI KAYU TUA",
    escape_cabinet_text: "Di dalam laci lemari terdapat secarik kertas lapuk bertuliskan: 'Awal sandi adalah angka keberuntungan penjaga: 7. Periksa tempat yang menghangatkan ruangan.'",
    escape_hearth_title: "PERAPIAN BATU BARA",
    escape_hearth_text: "Di balik tumpukan abu dingin terukir jelas angka: '4'. 'Carilah batu yang menonjol di sebelah rak buku rahasia.'",
    escape_stone_title: "DINDING BATU RAHASIA",
    escape_stone_locked_text: "Dinding ini tampak aneh, tetapi mekanisme belum merespons. Periksa lemari dan perapian terlebih dahulu.",
    escape_stone_open_text: "Batu tertekan ke dalam dengan suara klik! Dinding bergeser memperlihatkan brankas besi kuno dengan angka terukir: '21'.",
    escape_safe_title: "BRANKAS BESI KUNO",
    escape_safe_prompt: "Masukkan 4 angka sandi brankas (Gabungkan petunjuk: Lemari + Perapian + Dinding):",
    escape_safe_submit: "BUKA BRANKAS",
    escape_safe_wrong: "Kode salah! Jarum bergetar tanpa reaksi. Periksa kembali urutan petunjuk.",
    escape_safe_correct: "KLIK! Mekanisme berputar mulus. Pintu brankas terbuka dan Kunci Master jatuh ke tanganmu!",
    escape_exit_title: "PINTU KELUAR AULA",
    escape_exit_locked: "Pintu kayu kokoh dengan gembok tembaga besar. Membutuhkan Kunci Master untuk dibuka.",
    escape_exit_open: "Kunci Master masuk sempurna ke dalam lubang kunci! Gerendel terangkat dan pintu berayun terbuka perlahan.",
    escape_key_found: "KUNCI MASTER DIPEROLEH",

    work_title: "WORKSTATION KANTOR",
    work_tab_code: "Mengetik Kode",
    work_tab_bugs: "Basmi Bug",
    work_tab_deploy: "Deploy & Push",
    work_code_hint: "Tekan tombol apa saja untuk mengetik baris kode realitas.",
    work_bugs_hint: "Klik bug laba-laba yang muncul di layar sebelum waktu habis.",
    work_push_btn: "PUSH KE REPOSITORY",
    work_complete_btn: "SELESAIKAN HARI KERJA",
  },

  en: {
    cinematic_quote: "Not every ending has to be a period; sometimes we just need to pause for a moment before moving on.",
    cinematic_title: "PROJECT QUATRO",
    cinematic_subtitle: "THE WORLD BETWEEN PAUSES",
    cinematic_press_start: "Click Screen or Press [Space] to Begin",
    cinematic_skip: "Skip [Esc]",

    char_select_title: "SELECT CHARACTER",
    char_select_subtitle: "Who will walk through this pause in reality?",
    char_select_choose: "SELECT",
    char_select_start: "BEGIN JOURNEY",

    char_1_name: "The Original",
    char_1_role: "Ordinary Employee",
    char_1_desc: "Office worker in unassuming dark clothes with slightly tired eyes. Grounded, practical, occasionally sarcastic.",
    char_1_quote: "Same morning. Lukewarm coffee. Hopefully the codebase compiles without drama today.",

    char_2_name: "The Cool Glasses Guy",
    char_2_role: "Data Analyst",
    char_2_desc: "Sharp haircut with neat glasses and a blue-gray layered jacket. Analytical, calm, with dry humor and sharp observation.",
    char_2_quote: "Either the architecture shifted slightly overnight, or my memory did.",

    char_3_name: "The Long-Haired Girl",
    char_3_role: "Visual Artist",
    char_3_desc: "Long flowing hair with soft artistic clothing and warm tones. Intuitive, perceptive of quiet emotional shifts.",
    char_3_quote: "Nothing looks physically broken... but it feels as though something subtle is missing.",

    char_4_name: "The Muslimah Girl",
    char_4_role: "Software Engineer",
    char_4_desc: "Wearing a modest hijab, thoughtful attire, and comfortable practical footwear. Intelligent, patient, observant, and kind.",
    char_4_quote: "Let's inspect it again calmly. Often the truest answers reveal themselves in quiet moments.",

    char_5_name: "The Short-Haired Girl",
    char_5_role: "Problem Solver",
    char_5_desc: "Short hair with sharp professional tailoring and muted warm accents. Direct, independent, decisive.",
    char_5_quote: "Fine. We don't understand what this is yet. So let's step forward and find out.",

    char_6_name: "The Quiet Hoodie Guy",
    char_6_role: "Sound Designer",
    char_6_desc: "Dark comfortable hoodie with headphones resting around his collar and messy hair. Introverted, imaginative, and attentive.",
    char_6_quote: "I could swear I heard that strange harmonic frequency somewhere before.",

    day_label: "Day",
    morning: "Morning",
    evening: "Evening",
    at_work: "Office",
    commute: "Commute",
    void_realm: "Void Realm",

    obj_wake_up: "Wake up from bed",
    obj_cook: "Cook breakfast at the stove",
    obj_eat: "Eat breakfast at dining table",
    obj_shower: "Take a morning shower",
    obj_leave_house: "Leave the house to your car",
    obj_drive_work: "Drive Quatro to the office",
    obj_work_tasks: "Complete tasks at PC workstation",
    obj_leave_work: "Exit office building to vehicle",
    obj_drive_home: "Drive Quatro back home",
    obj_shower_evening: "Take an evening shower",
    obj_dinner_evening: "Have dinner at dining table",
    obj_sleep_evening: "Sleep in bed to rest",
    obj_enter_portal: "Enter the mysterious Semicolon portal",
    obj_speak_sage: "Speak with the Old Sage in the Void",
    obj_explore_void: "Drive Quatro along Void Highway",
    obj_reach_castle: "Enter the Ancient Castle Grounds",
    obj_search_cabinet: "Search the antique wooden cabinet",
    obj_inspect_hearth: "Inspect the stone hearth",
    obj_find_loose_stone: "Find the secret loose stone on wall",
    obj_open_safe: "Enter the 4-digit safe cipher",
    obj_unlock_exit: "Unlock exit door with Master Key",
    obj_escape_keep: "Escape from the castle keep",
    obj_rest_moment: "Pause and take a breath",

    prompt_day1_morning: "Day 1 — A crisp morning. Wake from bed and prepare breakfast.",
    prompt_day2_morning: "Day 2 — Morning routine. A strange stillness hangs in the air.",
    prompt_day3_morning: "Day 3 — Subtle vibrations ripple through the walls. Head to work for the final task.",
    prompt_woken_up: "Awake now. Prepare breakfast at the stove.",
    prompt_cooked: "Breakfast is ready. Sit down at the dining table.",
    prompt_eaten: "Finished eating. Take a refreshing shower before heading out.",
    prompt_showered: "Refreshed. The Quatro is waiting in the driveway.",
    prompt_showered_evening: "Evening shower done. Have a warm dinner.",
    prompt_eaten_evening: "Dinner finished. Time to sleep and recharge.",
    prompt_work_done: "Workday finished. Exit the office and return to your vehicle.",
    prompt_portal_open: "✦ A mysterious semicolon portal pulses at the office doorway!",
    prompt_must_finish_evening: "You need to shower and have dinner before sleeping!",

    action_wake: "Wake Up",
    action_cook: "Cook Breakfast",
    action_eat: "Eat",
    action_shower: "Shower",
    action_leave_door: "Leave House",
    action_enter_car: "Enter Quatro",
    action_exit_car: "Exit Vehicle",
    action_talk_mechanic: "Talk · Mechanic",
    action_work_station: "PC Workstation",
    action_talk_jeffrey: "Talk · Sir Jeffrey",
    action_talk_vespera: "Talk · Lady Vespera",
    action_talk_barnaby: "Talk · Barnaby",
    action_inspect_fountain: "Inspect · Fountain",
    action_inspect_hay: "Inspect · Hay Bales",
    action_enter_keep: "Enter Castle Keep",
    action_inspect_cabinet: "Inspect Cabinet",
    action_inspect_hearth: "Inspect Hearth",
    action_inspect_stone: "Inspect Secret Wall",
    action_inspect_exit: "Inspect Exit Door",
    action_talk_sage: "Talk · Void Sage",
    action_sleep: "Sleep",
    action_drive: "Drive",

    tut_move_title: "MOVEMENT & CONTROLS",
    tut_move_desc: "Use [W, A, S, D] or Arrow Keys to move. Press [Shift] or [Space] for quick context actions.",
    tut_move_click: "Left-Click on the ground for smooth Click-to-Move navigation.",
    tut_quest_title: "QUEST OBJECTIVES",
    tut_quest_desc: "Your current active objective is always displayed at the top. Take things one calm step at a time.",
    tut_follow_title: "GUIDE ROUTE",
    tut_follow_desc: "The glowing ground trail shows you the exact path to your next active objective.",
    tut_ok: "UNDERSTOOD [Continue]",

    hud_follow_quest: "ROUTE GUIDE",
    hud_following: "GUIDING",
    hud_nearby: "travelers nearby",
    hud_menu: "Menu [Esc]",
    hud_audio_on: "Synth Lo-fi On",
    hud_audio_off: "Audio Muted",
    hud_weapons: "Weapons [Q/F]",
    hud_speed: "KM/H",

    pause_title: "PAUSE MENU",
    pause_resume: "Resume Game",
    pause_restart: "Restart from Day 1",
    pause_controls: "Controls: [WASD] Move, [E] Interact, [C] Camera Mode, Mouse Drag Orbit",
    pause_sound: "Sound & Ambience",
    pause_language: "Language",

    end_title: "TO BE CONTINUED",
    end_subtitle: "CHAPTER 1: BETWEEN TWO PAUSES",
    end_quote: "Some stories conclude with a final period. Others simply require a semicolon to breathe before moving forward.",
    end_play_again: "PLAY AGAIN FROM START",

    dialogue_mechanic_title: "MECHANIC",
    dialogue_mechanic_role: "Srasa Garage Master",
    dialogue_mechanic_1: "Hey there! The Quatro is running like a charm. Fresh fluids, aligned wheels, and the motor purrs smoothly.",
    dialogue_mechanic_2: "If you're taking the highway, watch your drift around the curves. The asphalt has felt strangely buoyant lately.",
    dialogue_mechanic_3: "Safe travels. This car has a deep connection with whoever sits behind its wheel.",

    dialogue_jeffrey_title: "SIR JEFFREY",
    dialogue_jeffrey_role: "Castle Gatekeeper",
    dialogue_jeffrey_1: "Halt! You have crossed the ethereal mist. This fortress has stood firm since the realm's first compilation.",
    dialogue_jeffrey_2: "Nobody leaves the inner hall through the door they entered. That is the foundational architecture of this chamber.",
    dialogue_jeffrey_3: "If you wish to find a way out, heed the sequence: The antique cabinet holds the first clue.",

    dialogue_vespera_title: "LADY VESPERA",
    dialogue_vespera_role: "Castle Scholar",
    dialogue_vespera_1: "The resonance of the Semicolon pulses through these stone walls. Ciphers are tucked away in quiet, warm places.",
    dialogue_vespera_2: "Once the cabinet is searched, seek the stone fireplace. Its ash conceals the second number.",
    dialogue_vespera_3: "Do not rush. The three clues connect together into a singular, logical sequence.",

    dialogue_barnaby_title: "BARNABY",
    dialogue_barnaby_role: "Wandering Chronicler",
    dialogue_barnaby_1: "My travel journal notes the mechanism of this hall: Cabinet (7), Hearth (4), and Secret Stone (21).",
    dialogue_barnaby_2: "Combine them in that order: The cabinet yields 7, the hearth reveals 4, and the loose stone alcove whispers 21.",
    dialogue_barnaby_3: "The Master Key rests inside that iron safe. Carry it to the heavy exit door across the room.",

    dialogue_sage_title: "SEMICOLON SAGE",
    dialogue_sage_role: "Keeper of the In-Between",
    dialogue_sage_1: "Welcome to the space between pauses, Traveler. Your original reality is not broken; it has merely taken a breath.",
    dialogue_sage_2: "This world once moved like a flowing sentence. Then something made it forget when to pause and when to continue.",
    dialogue_sage_3: "Your vehicle resonates with your purpose. Allow me to summon it here so you may traverse the Void Highway.",
    dialogue_sage_summon: "✦ Summoning the Quatro onto the Void Highway...",
    dialogue_sage_opt1: "How do I get back home?",
    dialogue_sage_opt2: "What is this place?",
    dialogue_sage_opt3: "Can you summon my Quatro car?",

    escape_door_trapped: "The heavy door slams shut behind you! It is locked from the outside. Search the room for clues.",
    escape_cabinet_title: "ANTIQUE CABINET",
    escape_cabinet_text: "Inside a small cedar drawer is an old note: 'The cipher begins with the guardian's fortunate number: 7. Next, seek warmth where flames once danced.'",
    escape_hearth_title: "STONE HEARTH",
    escape_hearth_text: "Behind the cool soot, an inscribed digit stands clear: '4'. 'Now find the loose stone beside the ancient bookshelves.'",
    escape_stone_title: "SECRET WALL RECESS",
    escape_stone_locked_text: "This stone masonry looks slightly out of place, but the latch won't budge yet. Inspect the cabinet and hearth first.",
    escape_stone_open_text: "The stone pushes inward with a mechanical click! A compartment opens to reveal an iron safe with etched numbers: '21'.",
    escape_safe_title: "ANTIQUE IRON SAFE",
    escape_safe_prompt: "Enter the 4-digit safe cipher (Combine: Cabinet + Hearth + Wall):",
    escape_safe_submit: "UNLOCK SAFE",
    escape_safe_wrong: "Wrong code! The dial rattles without releasing. Review your clues carefully.",
    escape_safe_correct: "CLICK! The tumblers align smoothly. The safe swings open and reveals the gleaming Master Key!",
    escape_exit_title: "KEEP EXIT DOOR",
    escape_exit_locked: "A heavy reinforced oak door secured by an ancient copper lock. Requires the Master Key.",
    escape_exit_open: "The Master Key slides into the keyhole. The heavy iron bolts slide back and the door swings open to the open world.",
    escape_key_found: "MASTER KEY ACQUIRED",

    work_title: "OFFICE WORKSTATION",
    work_tab_code: "Write Code",
    work_tab_bugs: "Squash Bugs",
    work_tab_deploy: "Deploy & Push",
    work_code_hint: "Press any keys on your keyboard to type out code lines.",
    work_bugs_hint: "Click the bug icons on the monitor before they disappear.",
    work_push_btn: "PUSH TO REPO",
    work_complete_btn: "COMPLETE WORKDAY",
  },
};
