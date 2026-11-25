/* ============================================================================
   DATABASE MASTER & KONFIGURASI — FILEPHOTOKU.STD
   ============================================================================ */

const STORAGE_KEY = 'filephotoku_std_v5_clean';
const FP_CLOUD_URL = 'https://filephotoku-db-default-rtdb.asia-southeast1.firebasedatabase.app';

const DEFAULT_STATE = {
  adminPin: '2026',
  isUnlocked: false,
  activeTab: 'website',
  setupSubTab: 'pricelist',
  bookingView: 'list',
  bookingFilter: 'All',
  publicCategory: 'Wedding',
  selectedInvoiceBookingId: '',
  selectedCrewBookingId: '',
  selectedSortBookingId: '',
  deletedBookingIds: [],

  studioInfo: {
    name: 'FILEPHOTOKU.STD',
    tagline: 'Capture Your Story — Wedding, Engagement, Graduation & Maternity Photography in Banyuwangi.',
    city: 'Banyuwangi',
    phone: '6285708001457',
    instagram: '@filephotoku',
    dpPercent: 30
  },

  paymentConfig: {
    bank: 'BSI (Bank Syariah Indonesia)',
    accountNumber: '7306276721',
    accountHolder: 'MOH ZULQORNAIN ROFIQI',
    merchantQris: 'MZRNAIN STORE, DIGITAL & KREATIF',
    nmid: 'ID1026470533344',
    fileQris: 'qris.jpg'
  },

  categories: [
    'Wedding',
    'Engagement',
    'Graduation',
    'Maternity',
    'Add-On Wedding',
    'Add-On Graduation'
  ],

  pricelist: [
    // WEDDING (4)
    { id: 'W-01', category: 'Wedding', name: 'WEDDING - SILVER 01', price: 1490000, desc: 'Full time acara, file unlimited, cetak 4R 80 foto, 1 fotografer, Google Drive.' },
    { id: 'W-02', category: 'Wedding', name: 'WEDDING - SILVER 02', price: 1750000, desc: 'Dokumentasi akad & resepsi, 2 fotografer, cetak foto + album magnetik.' },
    { id: 'W-03', category: 'Wedding', name: 'WEDDING - MAGAZINE BOOK 01', price: 2300000, desc: 'Full day coverage, album magazine eksklusif, semua file master & edit.' },
    { id: 'W-04', category: 'Wedding', name: 'WEDDING - MAGAZINE BOOK 02', price: 2600000, desc: '2 fotografer + 1 videografer, album magazine eksklusif & video highlight.' },

    // ENGAGEMENT (3)
    { id: 'E-01', category: 'Engagement', name: 'ENGAGEMENT 01', price: 500000, desc: 'Sesi foto lamaran standar, 1 fotografer, semua file master & edit via Drive.' },
    { id: 'E-02', category: 'Engagement', name: 'ENGAGEMENT 02', price: 650000, desc: 'Sesi foto lamaran + cetak foto 4R & album mini.' },
    { id: 'E-03', category: 'Engagement', name: 'ENGAGEMENT 03', price: 750000, desc: 'Paket lengkap engagement + cetak album & bonus cetak 12R + pigora.' },

    // GRADUATION (4)
    { id: 'G-01', category: 'Graduation', name: 'GRADUATION - BASIC', price: 299000, desc: 'Sesi foto wisuda individual/couple, durasi 45 menit, semua file Google Drive.' },
    { id: 'G-02', category: 'Graduation', name: 'GRADUATION - STANDARD', price: 350000, desc: 'Sesi foto wisuda outdoor/studio, durasi 60 menit, bonus cetak 10R + frame.' },
    { id: 'G-03', category: 'Graduation', name: 'GRADUATION - PREMIUM', price: 500000, desc: 'Wisuda lengkap keluarga & teman, 90 menit, semua file edit + cetak 12R frame.' },
    { id: 'G-04', category: 'Graduation', name: 'GRADUATION - VIDEO ONLY', price: 350000, desc: 'Dokumentasi video cinematic & reels wisuda (durasi 1–2 menit).' },

    // MATERNITY (2)
    { id: 'M-01', category: 'Maternity', name: 'MATERNITY - BASIC', price: 350000, desc: '60 menit sesi foto maternity bersama pasangan, 20 foto edit pilihan.' },
    { id: 'M-02', category: 'Maternity', name: 'MATERNITY - EXCLUSIVE', price: 550000, desc: '90 menit sesi foto maternity, cetak 12R + pigora, dan video reels singkat.' },

    // ADD-ON WEDDING (8)
    { id: 'AW-01', category: 'Add-On Wedding', name: 'Tambah Fotografer', price: 300000, desc: 'Tambahan 1 fotografer pendamping acara wedding.' },
    { id: 'AW-02', category: 'Add-On Wedding', name: 'Tambah Durasi 1 Jam', price: 150000, desc: 'Perpanjangan jam liputan acara wedding.' },
    { id: 'AW-03', category: 'Add-On Wedding', name: 'Cetak 4R (20 Lembar)', price: 50000, desc: 'Tambahan cetak foto ukuran 4R kualitas lab.' },
    { id: 'AW-04', category: 'Add-On Wedding', name: 'Cetak 14RS + Pigora', price: 300000, desc: 'Cetak foto besar 14RS lengkap dengan bingkai pigora.' },
    { id: 'AW-05', category: 'Add-On Wedding', name: 'Album Magnetik', price: 450000, desc: 'Tambahan album foto magnetik premium.' },
    { id: 'AW-06', category: 'Add-On Wedding', name: 'Flashdisk Eksklusif', price: 75000, desc: 'Pengiriman file master menggunakan flashdisk kayu/box studio.' },
    { id: 'AW-07', category: 'Add-On Wedding', name: 'Video Cinematic', price: 250000, desc: 'Video reels cinematic 1 menit untuk media sosial.' },
    { id: 'AW-08', category: 'Add-On Wedding', name: 'Video Highlight', price: 500000, desc: 'Video highlight full acara 3–5 menit kualitas HD.' },

    // ADD-ON GRADUATION (7 -> Total 28 Paket Aktif)
    { id: 'AG-01', category: 'Add-On Graduation', name: 'Tambah Durasi 30 Menit', price: 100000, desc: 'Tambahan waktu sesi foto wisuda.' },
    { id: 'AG-02', category: 'Add-On Graduation', name: 'Extra Edit 10 Foto', price: 50000, desc: 'Tambahan retouching & color grading 10 foto pilihan.' },
    { id: 'AG-03', category: 'Add-On Graduation', name: 'Graduation Typography Design', price: 50000, desc: 'Desain poster tipografi nama & gelar wisudawan.' },
    { id: 'AG-04', category: 'Add-On Graduation', name: 'Cetak 10R', price: 25000, desc: 'Cetak foto ukuran 10R tanpa bingkai.' },
    { id: 'AG-05', category: 'Add-On Graduation', name: 'Cetak 12R + Frame', price: 125000, desc: 'Cetak foto 12R lengkap dengan frame minimalis.' },
    { id: 'AG-06', category: 'Add-On Graduation', name: 'Cetak 16R + Frame', price: 250000, desc: 'Cetak foto besar 16R lengkap dengan frame.' },
    { id: 'AG-07', category: 'Add-On Graduation', name: 'Video Reels Wisuda', price: 150000, desc: 'Tambahan video pendek 30–60 detik siap upload IG/TikTok.' }
  ],

  crewList: [
    { id: 'C-1', role: 'Fotografer Utama', name: 'Kamu (Owner FILEPHOTOKU.STD)', defaultFee: 0 },
    { id: 'C-2', role: 'Second Shooter', name: 'Freelance Partner', defaultFee: 300000 },
    { id: 'C-3', role: 'Videografer', name: 'Tim Videografi', defaultFee: 350000 },
    { id: 'C-4', role: 'Asisten / Lighting', name: 'Asisten Studio', defaultFee: 150000 }
  ],

  gearList: [
    { id: 'GR-1', name: 'Kamera Utama (Mirrorless)', status: 'Tersedia' },
    { id: 'GR-2', name: 'Lensa 35mm / 50mm Fix', status: 'Tersedia' },
    { id: 'GR-3', name: 'Flash External + Trigger', status: 'Tersedia' },
    { id: 'GR-4', name: 'Memory Card #A1 (128GB)', status: 'Standby' },
    { id: 'GR-5', name: 'Memory Card #A2 (128GB)', status: 'Standby' }
  ],

  bookings: [
    {
      id: 'BK-SAMPLE-1',
      invoiceCode: 'INV-261101',
      createdAt: 1763500000000,
      updatedAt: 1763500000000,
      client: 'Sakinah & Mufti',
      phone: '085708001457',
      dateISO: '2026-11-28',
      category: 'Wedding',
      packageId: 'W-01',
      packageName: 'WEDDING - SILVER 01',
      price: 1490000,
      dp: 447000,
      paymentMethod: 'QRIS',
      paymentTerm: 'DP 30%',
      status: 'DP Masuk',
      stage: 'Booking',
      venue: 'Labanasem, Banyuwangi',
      mapsLink: 'https://maps.google.com/?q=Labanasem+Banyuwangi',
      standbyTime: '07:00 WIB',
      memoryCard: 'Memory Card #A1',
      driveLink: '',
      proofImage: '',
      selectedPhotos: ['FP_012.JPG', 'FP_048.JPG', 'FP_105.JPG'],
      invoiceItems: [{ name: 'WEDDING - SILVER 01', price: 1490000 }],
      crew: [{ role: 'Fotografer Utama', name: 'Kamu (Owner FILEPHOTOKU.STD)', fee: 0 }]
    }
  ]
};