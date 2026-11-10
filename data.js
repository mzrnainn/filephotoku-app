/* ============================================================================
   DATABASE MASTER: DATA.JS (FILEPHOTOKU.STD)
   ============================================================================ */

const STORAGE_KEY = 'filephotoku_std_db_v1';

const DEFAULT_STATE = {
  adminPin: '998877', // Ganti PIN rahasia Anda di sini
  isUnlocked: false,
  activeTab: 'website',
  setupSubTab: 'pricelist',
  bookingView: 'list',
  bookingFilter: 'All',
  
  // Pengaturan Profil Studio
  studioInfo: {
    name: 'FILEPHOTOKU.STD',
    tagline: 'CAPTURE YOUR STORY',
    location: 'Banyuwangi',
    phone: '6285708001457',
    instagram: '@filephotoku',
    dpPercentage: 30
  },

  // Daftar Pricelist Resmi Studio
  pricelist: [
    // Wedding
    { id: 'W-01', category: 'Wedding', name: 'WEDDING - SILVER 01', price: 1490000, desc: 'Dokumentasi akad/resepsi lengkap, 1 fotografer, file Google Drive.' },
    { id: 'W-02', category: 'Wedding', name: 'WEDDING - SILVER 02', price: 1750000, desc: 'Dokumentasi akad & resepsi, 2 fotografer, cetak foto + album.' },
    { id: 'W-03', category: 'Wedding', name: 'WEDDING - MAGAZINE BOOK 01', price: 2300000, desc: 'Full day coverage, album majalah eksklusif, cinematic video.' },
    { id: 'W-04', category: 'Wedding', name: 'WEDDING - MAGAZINE BOOK 02', price: 2600000, desc: 'Paket lengkap premium wedding, 2 fotografer, 1 videografer, album eksklusif & video highlight.' },
    
    // Engagement
    { id: 'E-01', category: 'Engagement', name: 'ENGAGEMENT 01', price: 500000, desc: 'Sesi foto lamaran standar, 1 fotografer, semua file master.' },
    { id: 'E-02', category: 'Engagement', name: 'ENGAGEMENT 02', price: 650000, desc: 'Sesi foto lamaran + cetak album mini.' },
    { id: 'E-03', category: 'Engagement', name: 'ENGAGEMENT 03', price: 750000, desc: 'Paket lengkap engagement dengan bonus cetak pigora.' },

    // Graduation
    { id: 'G-01', category: 'Graduation', name: 'GRADUATION - BASIC', price: 299000, desc: 'Sesi foto wisuda individual / couple, durasi 45 menit.' },
    { id: 'G-02', category: 'Graduation', name: 'GRADUATION - STANDARD', price: 350000, desc: 'Sesi foto wisuda outdoor/studio, bonus cetak 10R + frame.' },
    { id: 'G-03', category: 'Graduation', name: 'GRADUATION - PREMIUM', price: 500000, desc: 'Paket wisuda lengkap keluarga & teman, semua file edited.' },
    { id: 'G-04', category: 'Graduation', name: 'GRADUATION - VIDEO ONLY', price: 350000, desc: 'Dokumentasi video cinematic wisuda.' },

    // Maternity
    { id: 'M-01', category: 'Maternity', name: 'MATERNITY - BASIC', price: 350000, desc: '60 Menit sesi foto maternity bersama suami, 20 edited photos.' },
    { id: 'M-02', category: 'Maternity', name: 'MATERNITY - EXCLUSIVE', price: 550000, desc: '90 Menit sesi foto maternity, cetak 10RS + pigora, video reels.' }
  ],

  // Daftar Kru Studio
  crewList: [
    { id: 'C-1', role: 'Fotografer Utama', name: 'Kamu (Owner FILEPHOTOKU.STD)', defaultFee: 0 },
    { id: 'C-2', role: 'Second Shooter', name: 'Freelance Partner', defaultFee: 300000 },
    { id: 'C-3', role: 'Videografer', name: 'Tim Videografi', defaultFee: 350000 }
  ],

  // Daftar Gear & Memory Card
  gearList: [
    { id: 'GR-1', name: 'Kamera Utama (Sony/Canon)', status: 'Tersedia' },
    { id: 'GR-2', name: 'Lensa 35mm / 50mm', status: 'Tersedia' },
    { id: 'GR-3', name: 'Memory Card #A1', status: 'Standby' }
  ],

  // Daftar Booking Awal
  bookings: [
    {
      id: 'BK-1760000001',
      createdAt: 1760000001000,
      updatedAt: 1760000001000,
      client: 'Nain & Nisa',
      clientName: 'Nain & Nisa',
      phone: '08123456789',
      day: 13,
      date: '13 Okt 2026',
      category: 'Wedding',
      packageId: 'W-01',
      packageName: 'WEDDING - SILVER 01',
      price: 1490000,
      transport: 0,
      dp: 447000,
      targetDp: 447000,
      status: 'DP Masuk',
      stage: 'Booking',
      venue: 'Labanasem, Banyuwangi',
      location: 'Labanasem, Banyuwangi',
      driveLink: '',
      selectedPhotos: [],
      crew: [
        { role: 'Fotografer Utama', name: 'Kamu (Owner FILEPHOTOKU.STD)', fee: 0 }
      ]
    }
  ]
};