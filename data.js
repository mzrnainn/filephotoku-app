const STORAGE_KEY = 'FILEPHOTOKU_STD_OS_MODULAR_V1';

const DEFAULT_STATE = {
  activeTab: 'dashboard',
  setupSubTab: 'pricelist',
  bookingView: 'list',
  bookingFilter: 'Semua',
  photoSortFilter: 'all',
  selectedInvoiceClientId: 'FP-JOB-01',
  selectedCrewJobId: 'FP-JOB-01',
  selectedPublicService: 'Wedding',
  adminPin: '2026',
  isUnlocked: false,
  studioProfile: {
    brandName: 'FILEPHOTOKU.STD',
    city: 'Banyuwangi',
    tagline: 'Capture Your Story — Wedding, Engagement, Graduation & Maternity Photography in Banyuwangi.',
    adminWa: '085708001457',
    bankInfo: 'Transfer Bank / E-Wallet Resmi FILEPHOTOKU.STD (Konfirmasi WA: 085708001457)'
  },
  serviceCategories: [
    'Wedding',
    'Engagement',
    'Graduation',
    'Maternity',
    'Add-On Wedding',
    'Add-On Graduation'
  ],
  pricelist: [
    { id: 'WED-01', category: 'Wedding', name: 'WEDDING - SILVER 01', price: 1490000, desc: 'Full time acara, File unlimited, Cetak 4R 80 foto, Album MBT Magnetik, Cetak 14RS + pigora, Cetak 10RS + laminating + pigora, Cetak 10RS + laminating, File save G Drive' },
    { id: 'WED-02', category: 'Wedding', name: 'WEDDING - SILVER 02', price: 1750000, desc: 'Full time acara, File unlimited, Cetak 4R 120 foto, Album Jumbo Magnetik, Cetak 14RS + pigora, Cetak 14RS, Cetak 10RS + laminating + pigora, File save Flashdisk' },
    { id: 'WED-03', category: 'Wedding', name: 'WEDDING - MAGAZINE BOOK 01', price: 2300000, desc: 'File unlimited, Full time acara, Cetak kolase, Album magazine book 20x30, Cetak 14RS + pigora, Cetak 14RS, Cetak 10RS + laminating, Data save flashdisk' },
    { id: 'WED-04', category: 'Wedding', name: 'WEDDING - MAGAZINE BOOK 02', price: 2600000, desc: 'File unlimited, Full time acara, Cetak kolase, Album magazine book 20x30, Cetak 4R 40 lembar, Album Magnetik, Cetak 14RS + pigora, Cetak 14RS, Data save flashdisk' },
    { id: 'ENG-01', category: 'Engagement', name: 'ENGAGEMENT 01', price: 500000, desc: 'Full time acara, File unlimited, Edit 20 foto, File save G Drive / DVD' },
    { id: 'ENG-02', category: 'Engagement', name: 'ENGAGEMENT 02', price: 650000, desc: 'Full time acara, File unlimited, Cetak 4R 40 lembar, Album biasa, Cetak 10RS, File save G Drive / DVD' },
    { id: 'ENG-03', category: 'Engagement', name: 'ENGAGEMENT 03', price: 750000, desc: 'Full time acara, File unlimited, Cetak 4R 40 lembar, Album magnetik, Cetak 10RS + laminating (2 pcs), File save G Drive / DVD' },
    { id: 'GRAD-01', category: 'Graduation', name: 'GRADUATION - BASIC', price: 299000, desc: '1 Graduate with Family, 45 Minutes Duration, 1 Location, Unlimited Shoot, 15 Edited Photos, Free hapus simple objek bocor, All File on GDrive' },
    { id: 'GRAD-02', category: 'Graduation', name: 'GRADUATION - STANDARD', price: 350000, desc: '1 Graduate with Family & Friend, 60 Minutes Duration, 1 Location, Unlimited Shoot, 20 Edited Photos, Free hapus simple objek bocor, All File on GDrive' },
    { id: 'GRAD-03', category: 'Graduation', name: 'GRADUATION - PREMIUM', price: 500000, desc: '1 Graduate with Family & Friend, 90 Minutes Duration, 1 Location, Unlimited Shoot, 30 Edited Photos, Free hapus simple objek bocor, All File on GDrive, 30-60 Sec Cinematic' },
    { id: 'GRAD-04', category: 'Graduation', name: 'GRADUATION - VIDEO ONLY', price: 350000, desc: '1 Graduate with Family & Friend, 60 Minutes Duration, 1 Location, 30-60 Sec Cinematic Video' },
    { id: 'MAT-01', category: 'Maternity', name: 'MATERNITY - BASIC (Draft PL)', price: 350000, desc: '60 Menit Sesi Foto Maternity bersama Suami, 1 Lokasi, Unlimited Shoot, 20 Edited Photos, All File on GDrive' },
    { id: 'MAT-02', category: 'Maternity', name: 'MATERNITY - EXCLUSIVE (Draft PL)', price: 550000, desc: '90 Menit Sesi Foto Maternity, Unlimited Shoot, 30 Edited Photos, Cetak 10RS + Pigora, Video Reels 30-60 Sec, All File on GDrive' },
    { id: 'ADD-W1', category: 'Add-On Wedding', name: 'Add-On: Tambah Fotografer', price: 300000, desc: 'Tambahan 1 fotografer kru FILEPHOTOKU.STD' },
    { id: 'ADD-W2', category: 'Add-On Wedding', name: 'Add-On: Tambah Durasi 1 Jam (Wedding)', price: 150000, desc: 'Perpanjangan waktu liputan acara 1 jam' },
    { id: 'ADD-W3', category: 'Add-On Wedding', name: 'Add-On: Cetak 4R Tambahan (20 lembar)', price: 50000, desc: 'Tambahan cetak foto ukuran 4R sebanyak 20 lembar' },
    { id: 'ADD-W4', category: 'Add-On Wedding', name: 'Add-On: Cetak 14RS + Pigora', price: 300000, desc: 'Tambahan cetak pembesaran 14RS lengkap dengan pigora' },
    { id: 'ADD-W5', category: 'Add-On Wedding', name: 'Add-On: Album Magnetik Tambahan', price: 450000, desc: 'Tambahan 1 unit album magnetik' },
    { id: 'ADD-W6', category: 'Add-On Wedding', name: 'Add-On: Flashdisk Eksklusif', price: 75000, desc: 'Flashdisk eksklusif penyimpanan seluruh file' },
    { id: 'ADD-W7', category: 'Add-On Wedding', name: 'Add-On: Video Cinematic 30-60 detik', price: 250000, desc: 'Video teaser cinematic durasi 30-60 detik' },
    { id: 'ADD-W8', category: 'Add-On Wedding', name: 'Add-On: Video Highlight 1-3 menit', price: 500000, desc: 'Video highlight dokumentasi acara durasi 1-3 menit' },
    { id: 'ADD-G1', category: 'Add-On Graduation', name: 'Add-On Grad: Tambah Durasi 30 Menit', price: 100000, desc: 'Perpanjangan sesi foto wisuda 30 menit' },
    { id: 'ADD-G2', category: 'Add-On Graduation', name: 'Add-On Grad: Extra Edit 10 Foto', price: 50000, desc: 'Tambahan editing 10 foto pilihan' },
    { id: 'ADD-G3', category: 'Add-On Graduation', name: 'Add-On Grad: Graduation Typography Design', price: 50000, desc: 'Desain tipografi estetik edisi wisuda' },
    { id: 'ADD-G4', category: 'Add-On Graduation', name: 'Add-On Grad: Cetak 10R', price: 25000, desc: 'Cetak foto wisuda ukuran 10R' },
    { id: 'ADD-G5', category: 'Add-On Graduation', name: 'Add-On Grad: Cetak 12R + Frame', price: 125000, desc: 'Cetak foto ukuran 12R lengkap dengan frame' },
    { id: 'ADD-G6', category: 'Add-On Graduation', name: 'Add-On Grad: Cetak 16R + Frame', price: 250000, desc: 'Cetak foto ukuran 16R lengkap dengan frame' }
  ],
  crewMaster: [
    { id: 'CR-1', name: 'Kamu (Owner FILEPHOTOKU.STD)', role: 'Fotografer Utama', defaultFee: 0, phone: '085708001457' },
    { id: 'CR-2', name: 'Second Shooter (Partner FG)', role: 'Second Shooter', defaultFee: 300000, phone: '081355667788' },
    { id: 'CR-3', name: 'Videografer Cinematic', role: 'Videografer', defaultFee: 300000, phone: '081299887766' },
    { id: 'CR-4', name: 'Asisten & Lighting Kru', role: 'Asisten Lighting & File', defaultFee: 150000, phone: '081944556677' },
    { id: 'CR-5', name: 'Editor Foto & Kolase Album', role: 'Editor Foto / Video', defaultFee: 150000, phone: '081388990011' }
  ],
  bookedOctoberDates: [
    { day: 1, cat: 'Wedding' }, { day: 3, cat: 'Graduation' }, { day: 4, cat: 'Wedding' },
    { day: 5, cat: 'Engagement' }, { day: 6, cat: 'Graduation' }, { day: 8, cat: 'Maternity' },
    { day: 10, cat: 'Wedding' }, { day: 11, cat: 'Wedding' }, { day: 12, cat: 'Graduation' },
    { day: 13, cat: 'Graduation' }, { day: 15, cat: 'Engagement' }, { day: 17, cat: 'Wedding' },
    { day: 18, cat: 'Wedding' }, { day: 19, cat: 'Maternity' }, { day: 20, cat: 'Graduation' },
    { day: 24, cat: 'Wedding' }, { day: 25, cat: 'Engagement' }, { day: 26, cat: 'Engagement' },
    { day: 27, cat: 'Graduation' }, { day: 29, cat: 'Wedding' }
  ],
  bookings: [
    {
      id: 'FP-JOB-01',
      couple: 'Diajeng & Firza',
      day: 24,
      month: 'Okt 2026',
      dueDate: '24 Okt 2026 (Selesai Acara)',
      category: 'Wedding',
      serviceType: 'WEDDING - MAGAZINE BOOK 02 + Video Highlight',
      venue: 'Banyuwangi (Kediaman Mempelai)',
      mapsUrl: 'https://maps.google.com/?q=Banyuwangi',
      gatherTime: '06.00 WIB',
      driveUrl: 'https://drive.google.com/drive/folders/filephotoku-diajeng-firza',
      stage: 3,
      fileStage: 3,
      memoryCardCode: 'Card #A1 & Flashdisk',
      totalPrice: 3100000,
      dpPaid: 1000000,
      isOverdue: true,
      items: [
        { name: 'WEDDING - MAGAZINE BOOK 02', price: 2600000, checked: true },
        { name: 'Add-On: Video Highlight 1-3 menit', price: 500000, checked: true },
        { name: 'Add-On: Tambah Fotografer', price: 300000, checked: false }
      ],
      crew: [
        { role: 'Fotografer Utama (FILEPHOTOKU.STD)', assignee: 'Kamu (Owner FILEPHOTOKU.STD)', fee: 0 },
        { role: 'Second Shooter', assignee: 'Kosong', fee: 300000 },
        { role: 'Videografer', assignee: 'Videografer Cinematic', fee: 300000 },
        { role: 'Asisten Lighting & File', assignee: 'Asisten & Lighting Kru', fee: 150000 },
        { role: 'Editor Foto & Tone', assignee: 'Kamu (Owner FILEPHOTOKU.STD)', fee: 0 }
      ]
    },
    {
      id: 'FP-JOB-02',
      couple: 'Elsa & Midad',
      day: 15,
      month: 'Okt 2026',
      dueDate: '15 Okt 2026 (Selesai Acara)',
      category: 'Engagement',
      serviceType: 'ENGAGEMENT 03 (Album Magnetik + 10RS)',
      venue: 'Banyuwangi',
      mapsUrl: 'https://maps.google.com/?q=Banyuwangi',
      gatherTime: '08.00 WIB',
      driveUrl: 'https://drive.google.com/drive/folders/filephotoku-elsa-midad',
      stage: 4,
      fileStage: 4,
      memoryCardCode: 'Card #B1 (GDrive / DVD)',
      totalPrice: 750000,
      dpPaid: 300000,
      isOverdue: false,
      items: [
        { name: 'ENGAGEMENT 03', price: 750000, checked: true }
      ],
      crew: [
        { role: 'Fotografer Utama (FILEPHOTOKU.STD)', assignee: 'Kamu (Owner FILEPHOTOKU.STD)', fee: 0 },
        { role: 'Asisten Lighting & File', assignee: 'Asisten & Lighting Kru', fee: 100000 }
      ]
    },
    {
      id: 'FP-JOB-03',
      couple: 'Iko Sugiarto Adi W, S.Pd',
      day: 12,
      month: 'Okt 2026',
      dueDate: '12 Okt 2026 (Lunas)',
      category: 'Graduation',
      serviceType: 'GRADUATION - PREMIUM (UNIBA Banyuwangi)',
      venue: 'Kampus UNIBA Banyuwangi',
      mapsUrl: 'https://maps.google.com/?q=Universitas+PGRI+Banyuwangi',
      gatherTime: '07.30 WIB',
      driveUrl: 'https://drive.google.com/drive/folders/filephotoku-iko-wisuda',
      stage: 4,
      fileStage: 5,
      memoryCardCode: 'Card #C1 (All File GDrive)',
      totalPrice: 550000,
      dpPaid: 550000,
      isOverdue: false,
      items: [
        { name: 'GRADUATION - PREMIUM', price: 500000, checked: true },
        { name: 'Add-On Grad: Graduation Typography Design', price: 50000, checked: true }
      ],
      crew: [
        { role: 'Fotografer Utama (FILEPHOTOKU.STD)', assignee: 'Kamu (Owner FILEPHOTOKU.STD)', fee: 0 }
      ]
    },
    {
      id: 'FP-JOB-04',
      couple: 'Miftahur Rizqi, S.H',
      day: 20,
      month: 'Okt 2026',
      dueDate: '20 Okt 2026 (Selesai Sesi)',
      category: 'Graduation',
      serviceType: 'GRADUATION - STANDARD + Typography Design',
      venue: 'Banyuwangi',
      mapsUrl: 'https://maps.google.com/?q=Banyuwangi',
      gatherTime: '09.00 WIB',
      driveUrl: 'https://drive.google.com/drive/folders/filephotoku-rizqi-sh',
      stage: 2,
      fileStage: 2,
      memoryCardCode: 'Card #A2',
      totalPrice: 400000,
      dpPaid: 150000,
      isOverdue: true,
      items: [
        { name: 'GRADUATION - STANDARD', price: 350000, checked: true },
        { name: 'Add-On Grad: Graduation Typography Design', price: 50000, checked: true }
      ],
      crew: [
        { role: 'Fotografer Utama (FILEPHOTOKU.STD)', assignee: 'Kamu (Owner FILEPHOTOKU.STD)', fee: 0 }
      ]
    }
  ],
  memoryCards: [
    { id: 'MC-1', code: 'Card #A1 & #A2 (SDXC 128GB)', jobName: 'Wedding Diajeng & Firza (24 Okt)', hddLocation: 'PC Utama FILEPHOTOKU.STD & Flashdisk', status: 'Sudah Backup ke HDD FILEPHOTOKU.STD' },
    { id: 'MC-2', code: 'Card #B1 (SanDisk Extreme 128GB)', jobName: 'Engagement Elsa & Midad (15 Okt)', hddLocation: 'Sedang proses upload ke GDrive', status: 'Belum Backup - JANGAN FORMAT!' },
    { id: 'MC-3', code: 'Card #C1 (Lexar Pro 64GB)', jobName: 'Graduation Iko Sugiarto, S.Pd', hddLocation: 'All File on GDrive Selesai', status: 'Aman - Siap Format Ulang' }
  ],
  gearList: [
    { id: 'G1', name: 'Lensa 35mm f/1.4 GM', icon: 'ph-aperture', holder: 'Tas Utama FILEPHOTOKU.STD', status: 'Tersedia di Studio' },
    { id: 'G2', name: 'Flash Godox V1 Pro + Trigger', icon: 'ph-lightning', holder: 'Asisten & Lighting Kru', status: 'Dibawa Liputan' },
    { id: 'G3', name: 'Baterai Cadangan Kamera (6 Unit)', icon: 'ph-battery-charging', holder: 'Charger Dock Studio', status: 'Perlu Cek' },
    { id: 'G4', name: 'Memory Card Case (8 Slot SD/CF)', icon: 'ph-memory', holder: 'Pouch Anti-Air FILEPHOTOKU.STD', status: 'Tersedia di Studio' },
    { id: 'G5', name: 'Tripod & Gimbal Stabilizer', icon: 'ph-film-slate', holder: 'Videografer Cinematic', status: 'Dibawa Liputan' },
    { id: 'G6', name: 'Reflektor 5-in-1 + Lightstand', icon: 'ph-sun', holder: 'Bagasi Tim', status: 'Tersedia di Studio' },
    { id: 'G7', name: 'Kamera Utama Body #1 (FILEPHOTOKU.STD)', icon: 'ph-camera', holder: 'Drybox Studio Rak A', status: 'Tersedia di Studio' },
    { id: 'G8', name: 'SSD Eksternal & Stok Flashdisk', icon: 'ph-hard-drives', holder: 'Meja Kerja Editor', status: 'Tersedia di Studio' }
  ],
  photos: [
    { code: 'FP_012.JPG', title: 'Potret Pengantin Diajeng & Firza', note: 'Tone hangat khas FILEPHOTOKU.STD', selected: true, img: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=500&q=80' },
    { code: 'FP_027.JPG', title: 'Detail Cincin Engagement Elsa & Midad', note: 'Close up cincin tunangan', selected: false, img: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=500&q=80' },
    { code: 'FP_048.JPG', title: 'Potret Pengantin Adat Banyuwangi', note: 'Halaman pembuka Magazine Book 20x30', selected: true, img: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=500&q=80' },
    { code: 'FP_064.JPG', title: 'Prosesi Sungkeman Haru', note: 'Cetak 14RS + Pigora', selected: false, img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=500&q=80' },
    { code: 'FP_089.JPG', title: 'Foto Wisuda Iko Sugiarto, S.Pd', note: 'Hapus simple objek bocor', selected: false, img: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=500&q=80' },
    { code: 'FP_105.JPG', title: 'Wisuda Miftahur Rizqi, S.H', note: 'Desain Typography Wisuda', selected: true, img: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=500&q=80' },
    { code: 'FP_142.JPG', title: 'Candid Bahagia Bersama Sahabat', note: 'Masuk kolase album', selected: false, img: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=500&q=80' },
    { code: 'FP_198.JPG', title: 'Foto Keluarga Besar di Pelaminan', note: 'Cetak 10RS + Laminating', selected: false, img: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=500&q=80' }
  ],
  vendors: [
    { name: 'MUA Partner Banyuwangi', role: 'MUA', fee: 3500000, rating: '4.9', city: 'Rekanan FILEPHOTOKU.STD', checkedInBundle: true },
    { name: 'Paket Magazine Book 02 — FILEPHOTOKU.STD', role: 'Fotografi & Album', fee: 2600000, rating: '5.0', city: 'Banyuwangi', checkedInBundle: true },
    { name: 'Add-On Video Highlight 1-3 Menit', role: 'Videografer', fee: 500000, rating: '4.9', city: 'Tim FILEPHOTOKU.STD', checkedInBundle: true },
    { name: 'Mitra Wedding Organizer Banyuwangi', role: 'Wedding Organizer', fee: 3500000, rating: '5.0', city: 'Banyuwangi', checkedInBundle: false },
    { name: 'Mitra Mahar & Seserahan Banyuwangi', role: 'Mahar & Seserahan', fee: 1200000, rating: '4.9', city: 'Banyuwangi', checkedInBundle: false },
    { name: 'Mitra Dekorasi Pelaminan', role: 'Dekorasi', fee: 6500000, rating: '4.8', city: 'Banyuwangi', checkedInBundle: false }
  ]
};