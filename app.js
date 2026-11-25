/* ============================================================================
   LOGIKA UTAMA ANTI-CRASH, ANTI-MANTUL, INVOICE FULL A4 + FASILITAS PAKET
   FILEPHOTOKU.STD Studio OS v7
   ============================================================================ */

let appState = null;
let proofUploadBase64 = '';
let logoTapCount = 0;
let logoTapTimer = null;
let isSyncing = false;
let searchKeyword = '';
let localMutationVersion = 0;

const nowInit = new Date();
let calYear = nowInit.getFullYear();
let calMonth = nowInit.getMonth();

const BULAN_ID = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const BULAN_SINGKAT = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
const STAGES = ['Booking', 'Liputan', 'Preview (1-3 Hr)', 'Editing (3-7 Hr)', 'Selesai'];

// --- HELPER FORMAT ---
function rp(n) {
  return 'Rp ' + Math.round(Number(n) || 0).toLocaleString('id-ID');
}

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function normalizeDateISO(b) {
  if (b && typeof b.dateISO === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(b.dateISO)) {
    return b.dateISO;
  }
  if (b && typeof b.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(b.date)) {
    return b.date;
  }
  const dayNum = Math.min(31, Math.max(1, parseInt(b && b.day, 10) || new Date().getDate()));
  const y = new Date().getFullYear();
  const m = String(new Date().getMonth() + 1).padStart(2, '0');
  return `${y}-${m}-${String(dayNum).padStart(2, '0')}`;
}

function formatTanggalIndo(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return '-';
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${BULAN_SINGKAT[m - 1] || ''} ${y}`;
}

function findPackageDesc(itemName, fallbackPkgId = '') {
  const sourceList = (appState && Array.isArray(appState.pricelist) && appState.pricelist.length)
    ? appState.pricelist
    : (typeof DEFAULT_STATE !== 'undefined' ? DEFAULT_STATE.pricelist : []);
  const norm = String(itemName || '').trim().toLowerCase();
  let found = sourceList.find(p => String(p.name || '').trim().toLowerCase() === norm);
  if (!found && fallbackPkgId) {
    found = sourceList.find(p => String(p.id) === String(fallbackPkgId));
  }
  return found && found.desc ? String(found.desc).trim() : '';
}

function showToast(title, msg) {
  const box = document.getElementById('toast-box');
  if (!box) return;
  document.getElementById('toast-title').textContent = title;
  document.getElementById('toast-message').textContent = msg || '';
  box.classList.remove('hidden');
  clearTimeout(window._toastT);
  window._toastT = setTimeout(() => box.classList.add('hidden'), 3200);
}

// --- NORMALISASI / SANITIZER DATA ---
function sanitizeBooking(b, idx = 0) {
  const item = (b && typeof b === 'object') ? b : {};
  const client = String(item.client || item.clientName || `Klien #${idx + 1}`).trim();
  const price = Number(item.price) || 0;
  const dp = Number(item.dp) || 0;
  const dateISO = normalizeDateISO(item);
  const pkgId = item.packageId || 'W-01';
  const pkgName = item.packageName || 'WEDDING - SILVER 01';

  let photos = [];
  if (Array.isArray(item.selectedPhotos)) {
    photos = item.selectedPhotos.filter(Boolean).map(String);
  } else if (typeof item.selectedPhotos === 'string' && item.selectedPhotos.trim()) {
    photos = item.selectedPhotos.split(/[,\s]+/).filter(Boolean);
  }

  let crew = Array.isArray(item.crew) && item.crew.length > 0
    ? item.crew.map(c => ({
        role: (c && c.role) || 'Kru',
        name: (c && c.name) || 'Kamu (Owner FILEPHOTOKU.STD)',
        fee: Number(c && c.fee) || 0
      }))
    : [{ role: 'Fotografer Utama', name: 'Kamu (Owner FILEPHOTOKU.STD)', fee: 0 }];

  let invoiceItems = Array.isArray(item.invoiceItems) && item.invoiceItems.length > 0
    ? item.invoiceItems.map(it => {
        const nm = String(it.name || 'Item');
        const desc = (it.desc !== undefined && String(it.desc).trim() !== '')
          ? String(it.desc).trim()
          : findPackageDesc(nm, pkgId);
        return { name: nm, price: Number(it.price) || 0, desc };
      })
    : [{ name: pkgName, price, desc: findPackageDesc(pkgName, pkgId) }];

  return {
    id: String(item.id || ('BK-' + (Date.now() + idx))),
    invoiceCode: item.invoiceCode || ('INV-' + String(item.id || idx).slice(-6)),
    createdAt: Number(item.createdAt) || Date.now(),
    updatedAt: Number(item.updatedAt) || Date.now(),
    client,
    phone: String(item.phone || '-'),
    dateISO,
    day: parseInt(dateISO.split('-')[2], 10) || 1,
    date: formatTanggalIndo(dateISO),
    category: item.category || 'Wedding',
    packageId: pkgId,
    packageName: pkgName,
    price,
    dp,
    paymentMethod: item.paymentMethod || 'QRIS',
    paymentTerm: item.paymentTerm || 'DP 30%',
    status: dp >= price && price > 0 ? 'Lunas' : (dp > 0 ? 'DP Masuk' : 'Booking Baru'),
    stage: STAGES.includes(item.stage) ? item.stage : 'Booking',
    venue: item.venue || item.location || 'Banyuwangi',
    mapsLink: item.mapsLink || '',
    standbyTime: item.standbyTime || '07:00 WIB',
    memoryCard: item.memoryCard || 'Memory Card #A1',
    driveLink: item.driveLink || '',
    proofImage: item.proofImage || '',
    selectedPhotos: photos,
    invoiceItems,
    crew
  };
}

function sanitizeState(raw) {
  const base = JSON.parse(JSON.stringify(DEFAULT_STATE));
  const src = (raw && typeof raw === 'object') ? raw : {};

  const merged = Object.assign({}, base, src);
  merged.studioInfo = Object.assign({}, base.studioInfo, src.studioInfo || {});
  merged.paymentConfig = Object.assign({}, base.paymentConfig, src.paymentConfig || {});
  merged.categories = (Array.isArray(src.categories) && src.categories.length > 0) ? src.categories : base.categories;
  merged.pricelist = (Array.isArray(src.pricelist) && src.pricelist.length >= 4) ? src.pricelist : base.pricelist;
  merged.crewList = (Array.isArray(src.crewList) && src.crewList.length > 0) ? src.crewList : base.crewList;
  merged.gearList = (Array.isArray(src.gearList) && src.gearList.length > 0) ? src.gearList : base.gearList;
  merged.deletedBookingIds = Array.isArray(src.deletedBookingIds) ? src.deletedBookingIds : [];

  const rawBookings = Array.isArray(src.bookings) && src.bookings.length > 0 ? src.bookings : base.bookings;
  merged.bookings = rawBookings
    .filter(b => b && !merged.deletedBookingIds.includes(String(b.id)))
    .map((b, i) => sanitizeBooking(b, i))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  return merged;
}

function loadLocalState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    appState = sanitizeState(saved ? JSON.parse(saved) : null);
  } catch (e) {
    appState = sanitizeState(null);
  }
}

function mergeBookings(localArr, cloudArr, deletedIds) {
  const delSet = new Set(deletedIds || []);
  const map = new Map();
  (cloudArr || []).forEach((b, i) => {
    const sb = sanitizeBooking(b, i);
    if (!delSet.has(sb.id)) map.set(sb.id, sb);
  });
  (localArr || []).forEach((b, i) => {
    const sb = sanitizeBooking(b, i);
    if (delSet.has(sb.id)) return;
    if (!map.has(sb.id) || sb.updatedAt >= map.get(sb.id).updatedAt) {
      map.set(sb.id, sb);
    }
  });
  return Array.from(map.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

function sedangMengisiForm() {
  const aktif = document.activeElement;
  if (aktif && ['INPUT', 'TEXTAREA', 'SELECT'].includes(aktif.tagName)) return true;

  const modalIds = ['modal-booking', 'modal-admin-login'];
  if (modalIds.some(id => {
    const m = document.getElementById(id);
    return m && !m.classList.contains('hidden');
  })) return true;

  const draftIds = [
    'new-pl-name', 'new-pl-price', 'new-pl-desc', 'new-cat-name',
    'mc-name', 'mc-role', 'mc-fee', 'mg-name',
    'inv-custom-name', 'inv-custom-desc', 'inv-custom-price', 'crew-new-role',
    'pub-client-name', 'pub-client-venue', 'pub-client-phone'
  ];
  return draftIds.some(id => {
    const el = document.getElementById(id);
    return el && el.value.trim() !== '';
  });
}

async function saveState(pushCloud = true) {
  localMutationVersion++;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  if (!pushCloud || !FP_CLOUD_URL) return;
  try {
    const res = await fetch(`${FP_CLOUD_URL}/studioData.json?t=${Date.now()}`);
    const cloud = res.ok ? await res.json() : null;
    if (cloud && Array.isArray(cloud.bookings)) {
      const allDel = [...new Set([...(appState.deletedBookingIds || []), ...(cloud.deletedBookingIds || [])])];
      appState.deletedBookingIds = allDel;
      appState.bookings = mergeBookings(appState.bookings, cloud.bookings, allDel);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    }
    const payload = JSON.parse(JSON.stringify(appState));
    delete payload.isUnlocked;
    delete payload.activeTab;
    await fetch(`${FP_CLOUD_URL}/studioData.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    console.warn('Simpan cloud tertunda:', e);
  }
}

window.syncFromCloud = async function(showNotif = false) {
  if (isSyncing || !FP_CLOUD_URL) return;
  if (!showNotif && sedangMengisiForm()) return;

  const startVer = localMutationVersion;
  try {
    isSyncing = true;
    const res = await fetch(`${FP_CLOUD_URL}/studioData.json?t=${Date.now()}`);
    if (!res.ok) return;
    const cloud = await res.json();
    if (localMutationVersion !== startVer) return;

    if (cloud && typeof cloud === 'object') {
      const keepUnlock = appState.isUnlocked;
      const keepTab = appState.activeTab;
      const keepSubTab = appState.setupSubTab;

      const beforeHash = JSON.stringify({
        b: appState.bookings, p: appState.pricelist, c: appState.categories,
        cr: appState.crewList, g: appState.gearList, s: appState.studioInfo,
        pay: appState.paymentConfig, pin: appState.adminPin
      });

      const allDel = [...new Set([...(appState.deletedBookingIds || []), ...(cloud.deletedBookingIds || [])])];
      const mergedBookings = mergeBookings(appState.bookings, cloud.bookings || [], allDel);

      const nextState = sanitizeState(Object.assign({}, appState, cloud, {
        bookings: mergedBookings,
        deletedBookingIds: allDel
      }));
      nextState.isUnlocked = keepUnlock;
      nextState.activeTab = keepTab;
      nextState.setupSubTab = keepSubTab;

      const afterHash = JSON.stringify({
        b: nextState.bookings, p: nextState.pricelist, c: nextState.categories,
        cr: nextState.crewList, g: nextState.gearList, s: nextState.studioInfo,
        pay: nextState.paymentConfig, pin: nextState.adminPin
      });

      appState = nextState;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));

      if (showNotif || (beforeHash !== afterHash && !sedangMengisiForm())) {
        renderAll();
      }
      if (showNotif) showToast('Server Tersinkronisasi', `${appState.bookings.length} jadwal booking aktif.`);
    }
  } catch (e) {
    console.warn('Sync cloud gagal:', e);
  } finally {
    isSyncing = false;
  }
};

// --- NAVIGASI & MODE ADMIN / KLIEN ---
window.handleSecretLogoTap = function() {
  if (appState.isUnlocked) { switchTab('dashboard'); return; }
  logoTapCount++;
  clearTimeout(logoTapTimer);
  logoTapTimer = setTimeout(() => { logoTapCount = 0; }, 1200);
  if (logoTapCount >= 3) {
    logoTapCount = 0;
    openAdminLoginModal();
  }
};

window.openAdminLoginModal = function() {
  const m = document.getElementById('modal-admin-login');
  const inp = document.getElementById('admin-pin-input');
  if (m) m.classList.remove('hidden');
  if (inp) { inp.value = ''; setTimeout(() => inp.focus(), 100); }
};

window.closeAdminLoginModal = function() {
  document.getElementById('modal-admin-login').classList.add('hidden');
};

window.verifyAdminPin = function() {
  const val = (document.getElementById('admin-pin-input').value || '').trim();
  const pinResmi = String(appState.adminPin || '998877');
  if (val === pinResmi) {
    appState.isUnlocked = true;
    appState.activeTab = 'dashboard';
    document.body.classList.remove('public-client-mode');
    closeAdminLoginModal();
    saveState(false);
    switchTab('dashboard');
    renderAll();
    showToast('Mode Admin Aktif!', 'Selamat bekerja di FILEPHOTOKU.STD Studio OS.');
  } else {
    alert('PIN salah. Akses ditolak.');
  }
};

window.lockAdminSession = function() {
  appState.isUnlocked = false;
  appState.activeTab = 'website';
  document.body.classList.add('public-client-mode');
  saveState(false);
  switchTab('website');
  renderPublicWebsite();
};

window.switchTab = function(tab) {
  if (!appState.isUnlocked && tab !== 'website') {
    tab = 'website';
  }
  appState.activeTab = tab;
  document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
  const target = document.getElementById('tab-' + tab);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-btn, .mob-nav').forEach(btn => {
    const isAct = btn.dataset.tab === tab;
    btn.classList.toggle('bg-terracotta', isAct && btn.classList.contains('nav-btn'));
    btn.classList.toggle('text-white', isAct && btn.classList.contains('nav-btn'));
    btn.classList.toggle('text-terracotta', isAct && btn.classList.contains('mob-nav'));
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
  renderAll();
};

window.doAdminSearch = function(goToBooking = false) {
  searchKeyword = (document.getElementById('admin-search-input').value || '').trim().toLowerCase();
  if (goToBooking && appState.activeTab !== 'booking') {
    switchTab('booking');
  } else {
    renderBookings();
  }
};

// --- RENDER MASTER ---
function renderAll() {
  const tasks = [
    renderPublicWebsite,
    renderDashboard,
    renderBookings,
    renderInvoice,
    renderCrew,
    renderPhotoSort,
    renderSetup
  ];
  tasks.forEach(fn => {
    try { fn(); } catch (err) { console.error('Render error pada', fn.name, err); }
  });
}

// ============================================================================
// 1. HALAMAN KLIEN (KATALOG, FORM TANGGAL LENGKAP, QRIS/BSI, BUNDLING)
// ============================================================================
function renderPublicWebsite() {
  const mainCats = appState.categories.filter(c => !c.toLowerCase().includes('add-on'));
  if (!mainCats.includes(appState.publicCategory)) {
    appState.publicCategory = mainCats[0] || 'Wedding';
  }

  const btnWrap = document.getElementById('pub-service-buttons');
  if (btnWrap) {
    btnWrap.innerHTML = mainCats.map(cat => {
      const act = cat === appState.publicCategory;
      return `<button type="button" onclick="selectPublicCategory('${cat}')" class="px-3 py-2 rounded-xl text-xs font-bold transition border ${act ? 'bg-terracotta text-white border-terracotta shadow' : 'bg-cream text-espresso border-[#DEC9B5]'}">${cat}</button>`;
    }).join('');
  }

  const cardWrap = document.getElementById('public-catalog-cards');
  if (cardWrap) {
    const pkgs = appState.pricelist.filter(p => p.category === appState.publicCategory);
    cardWrap.innerHTML = pkgs.length ? pkgs.map(p => `
      <div class="p-4 rounded-2xl bg-[#FAF3EB] border border-[#DEC9B5] flex flex-col justify-between gap-3">
        <div>
          <span class="text-[10px] font-bold uppercase text-terracotta">${p.category}</span>
          <h4 class="font-bold text-sm text-espresso mt-0.5">${p.name}</h4>
          <div class="font-mono text-base font-extrabold text-terracotta mt-1">${rp(p.price)}</div>
          <p class="text-[11px] text-espressoMuted mt-1.5 leading-relaxed">${p.desc || ''}</p>
        </div>
        <button type="button" onclick="choosePublicPackage('${p.id}')" class="w-full py-2 rounded-xl bg-white hover:bg-terracotta hover:text-white border border-[#DEC9B5] text-espresso text-xs font-bold transition">
          Pilih Paket Ini →
        </button>
      </div>
    `).join('') : '<p class="text-xs text-espressoMuted">Belum ada paket pada kategori ini.</p>';
  }

  const pkgSelect = document.getElementById('pub-package-select');
  if (pkgSelect) {
    const prevVal = pkgSelect.value;
    const cats = mainCats.length ? mainCats : appState.categories;
    pkgSelect.innerHTML = cats.map(kat => {
      const list = appState.pricelist.filter(p => p.category === kat);
      if (!list.length) return '';
      return `<optgroup label="${kat.toUpperCase()}">${list.map(p =>
        `<option value="${p.id}">${p.name} — ${rp(p.price)}</option>`
      ).join('')}</optgroup>`;
    }).join('');
    if (prevVal && appState.pricelist.some(p => p.id === prevVal)) {
      pkgSelect.value = prevVal;
    }
  }

  const dateInp = document.getElementById('pub-client-date');
  if (dateInp && !dateInp.value) dateInp.value = todayISO();

  updatePublicPaymentUI(false);
  renderBundlingSection();
}

window.selectPublicCategory = function(cat) {
  appState.publicCategory = cat;
  renderPublicWebsite();
};

window.choosePublicPackage = function(pkgId) {
  const sel = document.getElementById('pub-package-select');
  if (sel) sel.value = pkgId;
  updatePublicPaymentUI(false);
  const formCard = document.getElementById('booking-form-card');
  if (formCard) formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

window.updatePublicPaymentUI = function(forceRebuild = false) {
  const box = document.getElementById('pub-payment-instruction');
  const sel = document.getElementById('pub-package-select');
  if (!box || !sel) return;

  const pkg = appState.pricelist.find(p => p.id === sel.value) || appState.pricelist[0] || { price: 0 };
  const total = Number(pkg.price) || 0;
  const dpPct = Number(appState.studioInfo.dpPercent) || 30;
  const term = document.getElementById('pub-payment-term').value;
  const method = document.getElementById('pub-payment-method').value;
  const nominal = term === 'Lunas 100%' ? total : Math.round(total * dpPct / 100);
  const cfg = appState.paymentConfig;

  if (forceRebuild || box.dataset.method !== method) {
    box.dataset.method = method;
    if (method === 'QRIS') {
      const fbQr = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(cfg.merchantQris + ' ' + cfg.nmid)}`;
      box.innerHTML = `
        <div class="flex items-center justify-between border-b border-[#E6D5C3] pb-2">
          <span id="pub-pay-label" class="text-espressoMuted font-semibold">Tagihan ${term}</span>
          <span id="pub-pay-amount" class="font-mono text-sm font-extrabold text-terracotta">${rp(nominal)}</span>
        </div>
        <div class="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <div class="bg-white p-2 rounded-2xl border border-[#E6D5C3] shrink-0">
            <img src="${cfg.fileQris}" alt="QRIS" class="w-36 h-36 object-contain rounded-lg" onerror="if(!this.dataset.f){this.dataset.f='1';this.src='${fbQr}';}" />
          </div>
          <div class="text-center sm:text-left space-y-1">
            <span class="inline-block px-2 py-0.5 rounded bg-orange-100 text-terracotta text-[10px] font-extrabold">QRIS GPN RESMI</span>
            <div class="text-xs font-extrabold text-espresso">${cfg.merchantQris}</div>
            <div class="text-[10px] font-mono text-espressoMuted">NMID: ${cfg.nmid}</div>
            <p class="text-[10px] text-espressoMuted">Scan via M-Banking (BSI, BCA, BRI, Mandiri) atau DANA, GoPay, ShopeePay.</p>
          </div>
        </div>`;
    } else {
      box.innerHTML = `
        <div class="flex items-center justify-between border-b border-[#E6D5C3] pb-2">
          <span id="pub-pay-label" class="text-espressoMuted font-semibold">Tagihan ${term}</span>
          <span id="pub-pay-amount" class="font-mono text-sm font-extrabold text-terracotta">${rp(nominal)}</span>
        </div>
        <div class="pt-1 space-y-1.5">
          <div class="text-[11px] font-bold text-espresso uppercase">${cfg.bank}</div>
          <div class="flex items-center justify-between bg-white px-3 py-2.5 rounded-xl border border-[#DEC9B5]">
            <div>
              <div class="font-mono text-sm font-extrabold text-espresso">${cfg.accountNumber}</div>
              <div class="text-[10px] font-bold text-espressoMuted">A.N. ${cfg.accountHolder}</div>
            </div>
            <button type="button" onclick="navigator.clipboard.writeText('${cfg.accountNumber}'); showToast('Disalin!', 'No. Rekening ${cfg.accountNumber} disalin.');" class="px-3 py-1.5 rounded-lg bg-beige text-espresso text-[11px] font-bold">Salin Rek</button>
          </div>
        </div>`;
    }
  } else {
    const lbl = document.getElementById('pub-pay-label');
    const amt = document.getElementById('pub-pay-amount');
    if (lbl) lbl.textContent = 'Tagihan ' + term;
    if (amt) amt.textContent = rp(nominal);
  }
};

window.handleProofUpload = function(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      const max = 480;
      let w = img.width, h = img.height;
      if (w > h && w > max) { h = Math.round(h * max / w); w = max; }
      else if (h > max) { w = Math.round(w * max / h); h = max; }
      c.width = w; c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      proofUploadBase64 = c.toDataURL('image/jpeg', 0.72);
      document.getElementById('pub-proof-img').src = proofUploadBase64;
      document.getElementById('pub-proof-preview').classList.remove('hidden');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

window.clearProofUpload = function() {
  proofUploadBase64 = '';
  document.getElementById('pub-payment-proof').value = '';
  document.getElementById('pub-proof-preview').classList.add('hidden');
};

window.submitPublicBooking = async function() {
  const client = (document.getElementById('pub-client-name').value || '').trim();
  const dateISO = document.getElementById('pub-client-date').value;
  const venue = (document.getElementById('pub-client-venue').value || '').trim() || 'Banyuwangi';
  const phone = (document.getElementById('pub-client-phone').value || '').trim() || '-';
  const pkgId = document.getElementById('pub-package-select').value;
  const term = document.getElementById('pub-payment-term').value;
  const method = document.getElementById('pub-payment-method').value;
  const payStatus = document.getElementById('pub-payment-status').value;

  if (!client || !dateISO) {
    alert('Mohon isi Nama Pasangan/Wisudawan dan Tanggal Acara lengkap terlebih dahulu.');
    return;
  }

  const pkg = appState.pricelist.find(p => p.id === pkgId) || appState.pricelist[0];
  const price = Number(pkg.price) || 0;
  const nominal = term === 'Lunas 100%' ? price : Math.round(price * 0.3);
  const paid = payStatus === 'Sudah Bayar' ? nominal : 0;
  const invCode = 'INV-' + String(Date.now()).slice(-6);

  const newBk = sanitizeBooking({
    id: 'BK-' + Date.now(),
    invoiceCode: invCode,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    client, phone, dateISO,
    category: pkg.category,
    packageId: pkg.id,
    packageName: pkg.name,
    price, dp: paid,
    paymentMethod: method,
    paymentTerm: term,
    venue,
    proofImage: proofUploadBase64,
    invoiceItems: [{ name: pkg.name, price, desc: pkg.desc || '' }]
  });

  const btn = document.getElementById('btn-submit-public');
  btn.disabled = true;
  btn.textContent = '⏳ Menyimpan ke Server Admin...';

  appState.bookings.unshift(newBk);
  await saveState(true);
  renderAll();

  const tglText = formatTanggalIndo(dateISO);
  const waMsg =
    `Halo Admin *FILEPHOTOKU.STD*, saya sudah mengisi Booking di Website:\n\n` +
    `• *Kode Tiket:* #${invCode}\n` +
    `• *Nama:* ${client}\n` +
    `• *No. WA:* ${phone}\n` +
    `• *Paket:* [${pkg.category}] ${pkg.name}\n` +
    `• *Tanggal Acara:* ${tglText}\n` +
    `• *Lokasi:* ${venue}\n` +
    `• *Harga Paket:* ${rp(price)}\n` +
    `• *Pembayaran:* ${term} (${rp(nominal)}) via *${method}*\n` +
    `• *Status:* ${payStatus}\n` +
    `• *Bukti di Web:* ${proofUploadBase64 ? 'Sudah diupload ✅' : 'Menyusul via WA'}\n\n` +
    `Mohon dicek di Dashboard Admin. Terima kasih!`;

  const waUrl = `https://api.whatsapp.com/send?phone=${appState.studioInfo.phone}&text=${encodeURIComponent(waMsg)}`;
  const ticket = document.getElementById('pub-ticket-result');
  ticket.classList.remove('hidden');
  ticket.innerHTML = `
    <div class="flex justify-between font-bold text-sage border-b border-sage/30 pb-1">
      <span>✅ TERCATAT DI SERVER ADMIN</span>
      <span class="font-mono">#${invCode}</span>
    </div>
    <div><strong>${client}</strong> — ${tglText} (${venue})</div>
    <div>${pkg.name} • ${term} (${rp(nominal)}) via ${method}</div>
    <a href="${waUrl}" target="_blank" class="block w-full text-center py-2.5 rounded-xl bg-sage text-white font-bold mt-2">
      📲 Kirim Konfirmasi ke WhatsApp Admin →
    </a>`;

  btn.disabled = false;
  btn.textContent = '✅ Tersimpan! Kirim Booking Baru →';
  clearProofUpload();
  window.open(waUrl, '_blank');
};

function renderBundlingSection() {
  const sel = document.getElementById('bundling-pkg-select');
  const wrap = document.getElementById('bundling-addons-list');
  if (!sel || !wrap) return;
  const mainPkgs = appState.pricelist.filter(p => !p.category.toLowerCase().includes('add-on'));
  const addons = appState.pricelist.filter(p => p.category.toLowerCase().includes('add-on'));

  if (!sel.options.length) {
    sel.innerHTML = mainPkgs.map(p => `<option value="${p.id}">[${p.category}] ${p.name} — ${rp(p.price)}</option>`).join('');
  }
  if (!wrap.children.length) {
    wrap.innerHTML = addons.map(a => `
      <label class="flex items-center justify-between gap-2 p-2 rounded-xl bg-cream border border-[#E6D5C3] cursor-pointer">
        <span class="flex items-center gap-1.5 min-w-0">
          <input type="checkbox" class="bundling-cb accent-[#9E5231]" data-name="${a.name}" value="${a.price}" onchange="updateBundlingSim()" />
          <span class="truncate">${a.name}</span>
        </span>
        <span class="font-mono font-bold text-espresso shrink-0">${rp(a.price)}</span>
      </label>`).join('');
  }
  updateBundlingSim();
}

window.updateBundlingSim = function() {
  const sel = document.getElementById('bundling-pkg-select');
  const pkg = appState.pricelist.find(p => p.id === (sel && sel.value)) || { price: 0 };
  let total = Number(pkg.price) || 0;
  document.querySelectorAll('.bundling-cb:checked').forEach(cb => total += Number(cb.value) || 0);
  const el = document.getElementById('bundling-total');
  if (el) el.textContent = rp(total);
};

window.copyBundlingSimulation = function() {
  const sel = document.getElementById('bundling-pkg-select');
  const pkg = appState.pricelist.find(p => p.id === sel.value);
  const checked = Array.from(document.querySelectorAll('.bundling-cb:checked'));
  let total = Number(pkg ? pkg.price : 0);
  const lines = [
    `*SIMULASI PAKET FILEPHOTOKU.STD*`,
    `• Paket Utama: ${pkg ? pkg.name : '-'} (${rp(total)})`
  ];
  checked.forEach(cb => {
    total += Number(cb.value) || 0;
    lines.push(`• Add-On: ${cb.dataset.name} (${rp(cb.value)})`);
  });
  lines.push(`\n*Estimasi Total:* ${rp(total)}`);
  lines.push(`*DP 30%:* ${rp(Math.round(total * 0.3))}`);
  navigator.clipboard.writeText(lines.join('\n')).then(() => {
    showToast('Simulasi Disalin!', 'Rincian bundling siap ditempel ke WhatsApp.');
  });
};

// ============================================================================
// 2. DASHBOARD & KALENDER DINAMIS
// ============================================================================
function renderDashboard() {
  let totalOmzet = 0, totalDp = 0, totalUnpaid = 0, totalFee = 0;
  appState.bookings.forEach(b => {
    totalOmzet += b.price;
    totalDp += b.dp;
    totalUnpaid += Math.max(0, b.price - b.dp);
    totalFee += (b.crew || []).reduce((s, c) => s + (Number(c.fee) || 0), 0);
  });

  document.getElementById('dash-unpaid-hero').textContent = rp(totalUnpaid);
  document.getElementById('dash-unpaid').textContent = rp(totalUnpaid);
  document.getElementById('dash-dp').textContent = rp(totalDp);
  document.getElementById('dash-omzet').textContent = rp(totalOmzet);
  document.getElementById('dash-profit').textContent = rp(totalOmzet - totalFee);

  const progEl = document.getElementById('dash-progress-list');
  progEl.innerHTML = appState.bookings.length ? appState.bookings.slice(0, 8).map(b => `
    <div class="p-3 rounded-2xl bg-cream border border-[#E6D5C3] flex items-center justify-between gap-2 text-xs">
      <div class="min-w-0">
        <div class="font-bold text-espresso truncate">${b.client} <span class="font-normal text-espressoMuted">• ${formatTanggalIndo(b.dateISO)}</span></div>
        <div class="text-[11px] text-espressoMuted truncate">${b.packageName}</div>
      </div>
      <button type="button" onclick="advanceBookingStage('${b.id}')" class="px-2.5 py-1.5 rounded-xl bg-white border border-[#DEC9B5] font-bold text-[11px] text-terracotta shrink-0">
        ${b.stage} →
      </button>
    </div>
  `).join('') : '<p class="text-xs text-espressoMuted">Belum ada jadwal booking.</p>';

  renderDynamicCalendar();
}

window.advanceBookingStage = function(id) {
  const bk = appState.bookings.find(b => b.id === id);
  if (!bk) return;
  const idx = STAGES.indexOf(bk.stage);
  bk.stage = STAGES[(idx + 1) % STAGES.length];
  bk.updatedAt = Date.now();
  saveState(true);
  renderDashboard();
  showToast('Progres Diperbarui', `${bk.client} → ${bk.stage}`);
};

window.remindUnpaidWA = function() {
  const unpaid = appState.bookings.filter(b => b.price > b.dp);
  if (!unpaid.length) {
    showToast('Semua Lunas!', 'Tidak ada klien dengan sisa pelunasan.');
    return;
  }
  const bk = unpaid[0];
  const sisa = bk.price - bk.dp;
  const phone = (bk.phone || '').replace(/[^0-9]/g, '').replace(/^0/, '62');
  const msg = `Halo Kak *${bk.client}*,\n\nPengingat jadwal *${bk.packageName}* pada *${formatTanggalIndo(bk.dateISO)}* bersama *FILEPHOTOKU.STD*.\n• Total: ${rp(bk.price)}\n• DP Masuk: ${rp(bk.dp)}\n• Sisa Pelunasan: *${rp(sisa)}*\n\nPembayaran dapat melalui BSI ${appState.paymentConfig.accountNumber} a.n. ${appState.paymentConfig.accountHolder} atau QRIS. Terima kasih!`;
  window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg)}`, '_blank');
};

function renderDynamicCalendar() {
  document.getElementById('cal-month-label').textContent = `Kalender ${BULAN_ID[calMonth]} ${calYear}`;
  const grid = document.getElementById('dash-calendar-grid');
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const ymPrefix = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-`;

  let html = '';
  for (let i = 0; i < offset; i++) html += '<div></div>';

  for (let d = 1; d <= daysInMonth; d++) {
    const iso = ymPrefix + String(d).padStart(2, '0');
    const jobs = appState.bookings.filter(b => b.dateISO === iso);
    const isToday = iso === todayISO();
    const cls = jobs.length
      ? 'bg-terracotta text-white font-extrabold shadow-sm'
      : (isToday ? 'bg-sageLight text-sage font-bold border border-sage' : 'bg-cream text-espresso');
    html += `<button type="button" onclick="selectCalDate('${iso}')" class="py-2 rounded-xl text-xs transition ${cls}">
      ${d}${jobs.length ? `<div class="text-[9px] leading-none mt-0.5">${jobs.length} job</div>` : ''}
    </button>`;
  }
  grid.innerHTML = html;

  const monthJobs = appState.bookings.filter(b => b.dateISO.startsWith(ymPrefix));
  document.getElementById('dash-calendar-detail').innerHTML = monthJobs.length
    ? `<strong>${monthJobs.length} jadwal di ${BULAN_ID[calMonth]} ${calYear}:</strong> ` +
      monthJobs.map(j => `${j.client} (${formatTanggalIndo(j.dateISO)})`).join(' • ')
    : `Belum ada jadwal di ${BULAN_ID[calMonth]} ${calYear}. Klik tanggal atau tombol + Booking untuk menambah.`;
}

window.changeCalMonth = function(delta) {
  if (delta === 0) {
    const n = new Date(); calYear = n.getFullYear(); calMonth = n.getMonth();
  } else {
    calMonth += delta;
    if (calMonth < 0) { calMonth = 11; calYear--; }
    if (calMonth > 11) { calMonth = 0; calYear++; }
  }
  renderDynamicCalendar();
};

window.selectCalDate = function(iso) {
  const jobs = appState.bookings.filter(b => b.dateISO === iso);
  const box = document.getElementById('dash-calendar-detail');
  if (jobs.length) {
    box.innerHTML = `<div class="font-bold text-espresso mb-1">Jadwal ${formatTanggalIndo(iso)}:</div>` +
      jobs.map(j => `<div>• <strong>${j.client}</strong> — ${j.packageName} (${j.venue})</div>`).join('');
  } else {
    box.innerHTML = `Tanggal <strong>${formatTanggalIndo(iso)}</strong> masih kosong. <button type="button" onclick="openNewBookingModal('', '${iso}')" class="text-terracotta font-bold underline ml-1">+ Tambah Job di tanggal ini</button>`;
  }
};

// ============================================================================
// 3. BOOKING & MODAL TAMBAH/EDIT BOOKING
// ============================================================================
function renderBookings() {
  const mainCats = ['All', ...appState.categories.filter(c => !c.toLowerCase().includes('add-on'))];
  document.getElementById('booking-filter-pills').innerHTML = mainCats.map(c => {
    const act = appState.bookingFilter === c;
    return `<button type="button" onclick="setBookingFilter('${c}')" class="px-3 py-1.5 rounded-full text-xs font-bold border ${act ? 'bg-espresso text-white border-espresso' : 'bg-white text-espresso border-[#DEC9B5]'}">${c === 'All' ? 'Semua' : c}</button>`;
  }).join('');

  const list = appState.bookings.filter(b => {
    const matchCat = appState.bookingFilter === 'All' || b.category === appState.bookingFilter;
    const kw = searchKeyword;
    const matchKw = !kw || [b.client, b.packageName, b.venue, b.category, b.date].join(' ').toLowerCase().includes(kw);
    return matchCat && matchKw;
  });

  const wrap = document.getElementById('booking-list-container');
  if (!list.length) {
    wrap.innerHTML = '<div class="bg-white rounded-3xl p-6 text-center text-xs text-espressoMuted border border-[#E6D5C3]">Tidak ada data booking yang cocok. Klik <b>+ Job Baru</b> untuk menambah.</div>';
    return;
  }

  wrap.innerHTML = list.map(b => {
    const sisa = Math.max(0, b.price - b.dp);
    const lunas = sisa === 0 && b.price > 0;
    return `
    <div class="bg-white rounded-3xl p-4 sm:p-5 border border-[#E6D5C3] shadow-sm space-y-3 text-xs">
      <div class="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div class="flex flex-wrap items-center gap-1.5">
            <span class="px-2 py-0.5 rounded-md bg-beige text-espresso text-[10px] font-bold">${b.category}</span>
            <span class="px-2 py-0.5 rounded-md ${lunas ? 'bg-sageLight text-sage' : 'bg-amberLight text-amberWarn'} text-[10px] font-bold">${b.status}</span>
            <span class="text-[11px] font-mono font-bold text-terracotta">📅 ${formatTanggalIndo(b.dateISO)}</span>
          </div>
          <h3 class="font-editorial text-lg font-bold text-espresso mt-1">${b.client}</h3>
          <p class="text-espressoMuted">${b.packageName} • 📍 ${b.venue} • 📞 ${b.phone}</p>
        </div>
        <div class="text-left sm:text-right font-mono">
          <div class="font-extrabold text-sm text-espresso">${rp(b.price)}</div>
          <div class="text-[11px] text-sage">DP: ${rp(b.dp)}</div>
          <div class="text-[11px] ${sisa > 0 ? 'text-danger font-bold' : 'text-sage'}">Sisa: ${rp(sisa)}</div>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-2">
        <input type="url" value="${b.driveLink || ''}" onchange="updateBookingDrive('${b.id}', this.value)" placeholder="Tempel Link Google Drive klien di sini..." class="flex-1 px-3 py-2 rounded-xl bg-cream border border-[#DEC9B5] text-xs" />
        ${b.driveLink ? `<a href="${b.driveLink}" target="_blank" class="px-3 py-2 rounded-xl bg-blue-50 text-blue-700 font-bold text-center shrink-0">Buka Drive ↗</a>` : ''}
      </div>

      <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#EFE2D3]">
        <div class="flex flex-wrap items-center gap-1.5">
          <span class="px-2.5 py-1 rounded-lg bg-[#FAF3EB] border border-[#DEC9B5] text-[11px] font-bold">💳 ${b.paymentMethod} (${b.paymentTerm})</span>
          ${b.proofImage ? `<button type="button" onclick="openProofModal('${b.id}')" class="px-2.5 py-1 rounded-lg bg-sage text-white text-[11px] font-bold">👁️ Lihat Bukti Bayar</button>` : ''}
        </div>
        <div class="flex flex-wrap gap-1.5">
          <button type="button" onclick="toggleBookingPaid('${b.id}')" class="px-2.5 py-1.5 rounded-lg bg-sageLight text-sage font-bold">${lunas ? '↩ Batal Lunas' : '✓ Tandai Lunas'}</button>
          <button type="button" onclick="openBookingInTab('${b.id}','invoice')" class="px-2.5 py-1.5 rounded-lg bg-beige text-espresso font-bold">Invoice</button>
          <button type="button" onclick="openBookingInTab('${b.id}','crew')" class="px-2.5 py-1.5 rounded-lg bg-beige text-espresso font-bold">Kru</button>
          <button type="button" onclick="openNewBookingModal('${b.id}')" class="px-2.5 py-1.5 rounded-lg bg-cream border border-[#DEC9B5] font-bold">Edit</button>
          <button type="button" onclick="deleteBooking('${b.id}')" class="px-2.5 py-1.5 rounded-lg bg-dangerLight text-danger font-bold">Hapus</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

window.setBookingFilter = function(cat) { appState.bookingFilter = cat; renderBookings(); };
window.setBookingView = function(v) {
  if (v === 'calendar') { switchTab('dashboard'); return; }
  appState.bookingView = v; renderBookings();
};

window.openNewBookingModal = function(editId = '', presetDate = '') {
  const modal = document.getElementById('modal-booking');
  const mainCats = appState.categories.filter(c => !c.toLowerCase().includes('add-on'));
  const catSel = document.getElementById('bk-category');
  catSel.innerHTML = mainCats.map(c => `<option value="${c}">${c}</option>`).join('');

  const existing = editId ? appState.bookings.find(b => b.id === editId) : null;
  document.getElementById('modal-booking-title').textContent = existing ? 'Edit Booking Klien' : 'Tambah Booking Klien';
  document.getElementById('bk-edit-id').value = existing ? existing.id : '';
  document.getElementById('bk-client').value = existing ? existing.client : '';
  document.getElementById('bk-date').value = existing ? existing.dateISO : (presetDate || todayISO());
  catSel.value = existing ? existing.category : (mainCats[0] || 'Wedding');
  onModalCategoryChange(existing ? existing.packageId : '');

  document.getElementById('bk-venue').value = existing ? existing.venue : '';
  document.getElementById('bk-phone').value = existing ? existing.phone : '';
  document.getElementById('bk-drive').value = existing ? existing.driveLink : '';
  if (existing) {
    document.getElementById('bk-price').value = existing.price;
    document.getElementById('bk-dp').value = existing.dp;
  }
  modal.classList.remove('hidden');
};

window.closeBookingModal = function() {
  document.getElementById('modal-booking').classList.add('hidden');
};

window.onModalCategoryChange = function(selectedPkgId = '') {
  const cat = document.getElementById('bk-category').value;
  const pkgs = appState.pricelist.filter(p => p.category === cat);
  const pkgSel = document.getElementById('bk-package');
  pkgSel.innerHTML = pkgs.map(p => `<option value="${p.id}">${p.name} — ${rp(p.price)}</option>`).join('');
  if (selectedPkgId) pkgSel.value = selectedPkgId;
  onModalPackageChange();
};

window.onModalPackageChange = function() {
  const pkgId = document.getElementById('bk-package').value;
  const pkg = appState.pricelist.find(p => p.id === pkgId);
  if (pkg) {
    document.getElementById('bk-price').value = pkg.price;
    document.getElementById('bk-dp').value = Math.round(pkg.price * 0.3);
  }
};

window.saveAdminBooking = async function() {
  const editId = document.getElementById('bk-edit-id').value;
  const client = (document.getElementById('bk-client').value || '').trim();
  const dateISO = document.getElementById('bk-date').value;
  const category = document.getElementById('bk-category').value;
  const pkgId = document.getElementById('bk-package').value;
  const pkg = appState.pricelist.find(p => p.id === pkgId) || { id: pkgId, name: category, price: 0, desc: '' };
  const venue = (document.getElementById('bk-venue').value || '').trim() || 'Banyuwangi';
  const phone = (document.getElementById('bk-phone').value || '').trim() || '-';
  const driveLink = (document.getElementById('bk-drive').value || '').trim();
  const price = Number(document.getElementById('bk-price').value) || Number(pkg.price) || 0;
  const dp = Number(document.getElementById('bk-dp').value) || 0;

  if (!client || !dateISO) {
    alert('Nama Klien dan Tanggal Lengkap wajib diisi!');
    return;
  }

  if (editId) {
    const idx = appState.bookings.findIndex(b => b.id === editId);
    if (idx !== -1) {
      const old = appState.bookings[idx];
      const pkgChanged = old.packageId !== pkg.id;
      appState.bookings[idx] = sanitizeBooking(Object.assign({}, old, {
        client, dateISO, category, packageId: pkg.id, packageName: pkg.name,
        venue, phone, driveLink, price, dp, updatedAt: Date.now(),
        invoiceItems: pkgChanged ? [{ name: pkg.name, price, desc: pkg.desc || '' }] : old.invoiceItems
      }));
    }
  } else {
    appState.bookings.unshift(sanitizeBooking({
      id: 'BK-' + Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      client, dateISO, category, packageId: pkg.id, packageName: pkg.name,
      venue, phone, driveLink, price, dp,
      invoiceItems: [{ name: pkg.name, price, desc: pkg.desc || '' }]
    }));
  }

  appState.bookingFilter = 'All';
  closeBookingModal();
  await saveState(true);
  switchTab('booking');
  showToast('Booking Tersimpan!', `${client} (${formatTanggalIndo(dateISO)}) berhasil masuk daftar.`);
};

window.updateBookingDrive = function(id, url) {
  const bk = appState.bookings.find(b => b.id === id);
  if (!bk) return;
  bk.driveLink = url.trim(); bk.updatedAt = Date.now();
  saveState(true); renderBookings();
  showToast('Link Drive Disimpan', bk.client);
};

window.toggleBookingPaid = function(id) {
  const bk = appState.bookings.find(b => b.id === id);
  if (!bk) return;
  bk.dp = bk.dp >= bk.price ? Math.round(bk.price * 0.3) : bk.price;
  bk.status = bk.dp >= bk.price ? 'Lunas' : 'DP Masuk';
  bk.updatedAt = Date.now();
  saveState(true); renderAll();
};

window.deleteBooking = function(id) {
  if (!confirm('Hapus data booking ini secara permanen?')) return;
  appState.deletedBookingIds = [...new Set([...(appState.deletedBookingIds || []), id])];
  appState.bookings = appState.bookings.filter(b => b.id !== id);
  saveState(true); renderAll();
  showToast('Terhapus', 'Data booking berhasil dihapus.');
};

window.openBookingInTab = function(id, tab) {
  if (tab === 'invoice') appState.selectedInvoiceBookingId = id;
  if (tab === 'crew') appState.selectedCrewBookingId = id;
  switchTab(tab);
};

window.openProofModal = function(id) {
  const bk = appState.bookings.find(b => b.id === id);
  if (!bk || !bk.proofImage) return;
  document.getElementById('proof-modal-title').textContent = `Bukti Bayar — ${bk.client}`;
  document.getElementById('proof-modal-sub').textContent = `${bk.packageName} • ${bk.paymentMethod} (${bk.paymentTerm})`;
  document.getElementById('proof-modal-img').src = bk.proofImage;
  document.getElementById('modal-proof').classList.remove('hidden');
};

window.closeProofModal = function() {
  document.getElementById('modal-proof').classList.add('hidden');
};

// ============================================================================
// 4. GENERATOR INVOICE RESMI (FULL A4 + FASILITAS PAKET OTOMATIS)
// ============================================================================
function getActiveInvoiceBooking() {
  if (!appState.bookings.length) return null;
  let bk = appState.bookings.find(b => b.id === appState.selectedInvoiceBookingId);
  if (!bk) { bk = appState.bookings[0]; appState.selectedInvoiceBookingId = bk.id; }
  return bk;
}

function renderInvoice() {
  const bkSel = document.getElementById('inv-booking-select');
  const pkgSel = document.getElementById('inv-pkg-select');
  if (!bkSel || !pkgSel) return;

  bkSel.innerHTML = appState.bookings.map(b =>
    `<option value="${b.id}">${b.client} — ${formatTanggalIndo(b.dateISO)} (${b.packageName})</option>`
  ).join('');
  pkgSel.innerHTML = appState.pricelist.map(p =>
    `<option value="${p.id}">[${p.category}] ${p.name} — ${rp(p.price)}</option>`
  ).join('');

  const bk = getActiveInvoiceBooking();
  if (!bk) return;
  bkSel.value = bk.id;

  const total = bk.invoiceItems.reduce((s, it) => s + (Number(it.price) || 0), 0);
  bk.price = total;
  const sisa = Math.max(0, total - bk.dp);
  const isLunas = sisa === 0 && total > 0;
  const isDp = !isLunas && bk.dp > 0;

  document.getElementById('inv-dp-input').value = bk.dp;
  document.getElementById('inv-preview-no').textContent = '#' + bk.invoiceCode;
  document.getElementById('inv-preview-issued').textContent = `Terbit: ${formatTanggalIndo(todayISO())}`;

  const statusBadge = document.getElementById('inv-preview-status');
  if (statusBadge) {
    if (isLunas) {
      statusBadge.textContent = 'LUNAS';
      statusBadge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/40';
    } else if (isDp) {
      statusBadge.textContent = 'DP MASUK';
      statusBadge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/40';
    } else {
      statusBadge.textContent = 'MENUNGGU DP';
      statusBadge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-400/40';
    }
  }

  document.getElementById('inv-preview-client').textContent = bk.client;
  document.getElementById('inv-preview-phone').textContent = `WhatsApp: ${bk.phone || '-'}`;
  document.getElementById('inv-preview-date').textContent = `Acara: ${formatTanggalIndo(bk.dateISO)}`;
  document.getElementById('inv-preview-venue').textContent = `Lokasi: ${bk.venue || 'Banyuwangi'}`;
  document.getElementById('inv-preview-category').textContent = `Kategori: ${bk.category}`;

  document.getElementById('inv-preview-items').innerHTML = bk.invoiceItems.map((it, idx) => {
    const descText = (it.desc && String(it.desc).trim()) ? String(it.desc).trim() : findPackageDesc(it.name, bk.packageId);
    const fasilitasList = descText
      ? descText.split(/[,•;\n]+/).map(s => s.trim().replace(/\.$/, '')).filter(Boolean)
      : [];
    const fasilitasHtml = fasilitasList.length
      ? `<div class="mt-2 flex flex-wrap gap-1.5">
          ${fasilitasList.map(f => `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FAF3EB] border border-[#E6D5C3] text-[10.5px] text-espresso"><span class="text-[#FF6B00] font-bold">✓</span> ${f}</span>`).join('')}
        </div>`
      : '';

    return `
      <div class="px-4 py-3.5 flex items-start justify-between gap-3">
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <span class="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-beige text-espresso">${String(idx + 1).padStart(2, '0')}</span>
            <span class="font-bold text-xs sm:text-sm text-espresso">${it.name}</span>
          </div>
          ${fasilitasHtml}
        </div>
        <div class="flex items-center gap-2 shrink-0 pt-0.5">
          <span class="font-mono font-bold text-xs sm:text-sm text-espresso">${rp(it.price)}</span>
          <button type="button" title="Ubah keterangan fasilitas" onclick="editInvoiceItemDesc(${idx})" class="no-print px-1.5 py-0.5 rounded bg-cream border border-[#DEC9B5] text-[11px]">✏️</button>
          <button type="button" title="Hapus item" onclick="removeInvoiceItem(${idx})" class="no-print text-danger font-bold px-1">✕</button>
        </div>
      </div>`;
  }).join('');

  document.getElementById('inv-preview-total').textContent = rp(total);
  document.getElementById('inv-preview-dp').textContent = rp(bk.dp);
  document.getElementById('inv-preview-sisa').textContent = rp(sisa);

  const cfg = appState.paymentConfig;
  document.getElementById('inv-preview-bank').innerHTML =
    `<strong>${cfg.bank}</strong><br/><span class="font-mono text-xs font-extrabold text-espresso">${cfg.accountNumber}</span> — a.n. <strong>${cfg.accountHolder}</strong>`;
  document.getElementById('inv-preview-qris').innerHTML =
    `QRIS Resmi: <strong>${cfg.merchantQris}</strong> (NMID: ${cfg.nmid})`;
}

window.selectInvoiceBooking = function() {
  appState.selectedInvoiceBookingId = document.getElementById('inv-booking-select').value;
  renderInvoice();
};

window.addInvoicePackageItem = function() {
  const bk = getActiveInvoiceBooking();
  const pkg = appState.pricelist.find(p => p.id === document.getElementById('inv-pkg-select').value);
  if (!bk || !pkg) return;
  bk.invoiceItems.push({ name: pkg.name, price: pkg.price, desc: pkg.desc || '' });
  bk.updatedAt = Date.now();
  saveState(true); renderAll();
};

window.addInvoiceCustomItem = function() {
  const bk = getActiveInvoiceBooking();
  const name = (document.getElementById('inv-custom-name').value || '').trim();
  const desc = (document.getElementById('inv-custom-desc').value || '').trim();
  const price = Number(document.getElementById('inv-custom-price').value) || 0;
  if (!bk || !name) return;
  bk.invoiceItems.push({ name, price, desc });
  document.getElementById('inv-custom-name').value = '';
  document.getElementById('inv-custom-desc').value = '';
  document.getElementById('inv-custom-price').value = '';
  bk.updatedAt = Date.now();
  saveState(true); renderAll();
};

window.editInvoiceItemDesc = function(idx) {
  const bk = getActiveInvoiceBooking();
  if (!bk || !bk.invoiceItems[idx]) return;
  const it = bk.invoiceItems[idx];
  const cur = it.desc || findPackageDesc(it.name, bk.packageId);
  const next = prompt(`Ubah rincian fasilitas yang didapat untuk "${it.name}" (pisahkan tiap fasilitas dengan koma):`, cur);
  if (next === null) return;
  it.desc = next.trim();
  bk.updatedAt = Date.now();
  saveState(true);
  renderInvoice();
  showToast('Fasilitas Diperbarui', it.name);
};

window.removeInvoiceItem = function(idx) {
  const bk = getActiveInvoiceBooking();
  if (!bk || bk.invoiceItems.length <= 1) return;
  bk.invoiceItems.splice(idx, 1);
  bk.updatedAt = Date.now();
  saveState(true); renderAll();
};

window.updateInvoiceDp = function(val) {
  const bk = getActiveInvoiceBooking();
  if (!bk) return;
  bk.dp = Number(val) || 0;
  bk.status = bk.dp >= bk.price ? 'Lunas' : (bk.dp > 0 ? 'DP Masuk' : 'Booking Baru');
  bk.updatedAt = Date.now();
  saveState(true); renderDashboard(); renderInvoice();
};

window.setInvoiceDpPercent = function(pct) {
  const bk = getActiveInvoiceBooking();
  if (!bk) return;
  const total = bk.invoiceItems.reduce((s, it) => s + (Number(it.price) || 0), 0);
  updateInvoiceDp(Math.round(total * pct / 100));
};

window.sendInvoiceWA = function() {
  const bk = getActiveInvoiceBooking();
  if (!bk) return;
  const total = bk.invoiceItems.reduce((s, it) => s + (Number(it.price) || 0), 0);
  const sisa = Math.max(0, total - bk.dp);
  const cfg = appState.paymentConfig;
  const itemsTxt = bk.invoiceItems.map(i => {
    const d = i.desc || findPackageDesc(i.name, bk.packageId);
    return `• *${i.name}*: ${rp(i.price)}` + (d ? `\n   _(Fasilitas: ${d})_` : '');
  }).join('\n');

  const msg =
    `*INVOICE RESMI FILEPHOTOKU (#${bk.invoiceCode})*\n\n` +
    `Klien: *${bk.client}*\n` +
    `Tanggal Acara: *${formatTanggalIndo(bk.dateISO)}*\n` +
    `Lokasi: ${bk.venue}\n\n` +
    `*Rincian Paket & Fasilitas:*\n${itemsTxt}\n\n` +
    `• Total Tagihan: *${rp(total)}*\n` +
    `• DP Masuk: ${rp(bk.dp)}\n` +
    `• *Sisa Pelunasan: ${rp(sisa)}*\n` +
    (bk.driveLink ? `• Link Google Drive: ${bk.driveLink}\n` : '') +
    `\nPembayaran: *${cfg.bank} ${cfg.accountNumber}* a.n. ${cfg.accountHolder} / QRIS ${cfg.merchantQris}.\nTerima kasih!`;
  const phone = (bk.phone || '').replace(/[^0-9]/g, '').replace(/^0/, '62');
  window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg)}`, '_blank');
};

// ============================================================================
// 5. KRU, FEE & SHARELOC OTOMATIS
// ============================================================================
function getActiveCrewBooking() {
  if (!appState.bookings.length) return null;
  let bk = appState.bookings.find(b => b.id === appState.selectedCrewBookingId);
  if (!bk) { bk = appState.bookings[0]; appState.selectedCrewBookingId = bk.id; }
  return bk;
}

function renderCrew() {
  const sel = document.getElementById('crew-booking-select');
  if (!sel) return;
  sel.innerHTML = appState.bookings.map(b =>
    `<option value="${b.id}">${b.client} — ${formatTanggalIndo(b.dateISO)} (${b.venue})</option>`
  ).join('');
  const bk = getActiveCrewBooking();
  if (!bk) return;
  sel.value = bk.id;

  const listEl = document.getElementById('crew-assigned-list');
  listEl.innerHTML = bk.crew.map((c, idx) => `
    <div class="p-3 rounded-2xl bg-cream border border-[#DEC9B5] space-y-2 text-xs">
      <div class="flex items-center justify-between">
        <strong class="text-espresso">${c.role}</strong>
        <button type="button" onclick="removeCrewRow(${idx})" class="text-danger font-bold px-2">✕</button>
      </div>
      <select onchange="updateCrewRow(${idx},'name',this.value)" class="w-full px-3 py-2 rounded-xl bg-white border border-[#DEC9B5]">
        ${appState.crewList.map(m => `<option value="${m.name}" ${m.name === c.name ? 'selected' : ''}>${m.name} (${m.role})</option>`).join('')}
      </select>
      <div class="flex items-center gap-2">
        <span class="text-espressoMuted shrink-0">Fee Kru (Rp):</span>
        <input type="number" value="${c.fee}" oninput="updateCrewRow(${idx},'fee',this.value)" class="flex-1 px-3 py-2 rounded-xl bg-white border border-[#DEC9B5] font-mono text-right font-bold" />
      </div>
    </div>`).join('');

  const totalFee = bk.crew.reduce((s, c) => s + (Number(c.fee) || 0), 0);
  document.getElementById('crew-total-fee').textContent = rp(totalFee);
  document.getElementById('crew-net-profit').textContent = rp(bk.price - totalFee);

  document.getElementById('brief-venue').value = bk.venue || '';
  document.getElementById('brief-maps').value = bk.mapsLink || '';
  document.getElementById('brief-time').value = bk.standbyTime || '07:00 WIB';
  document.getElementById('brief-card').value = bk.memoryCard || 'Memory Card #A1';
  renderBriefingPreview(bk);
}

function renderBriefingPreview(bk) {
  const timTxt = bk.crew.map(c => `- ${c.role}: ${c.name}`).join('\n');
  const txt =
    `*BRIEFING & SHARELOC TIM FILEPHOTOKU.STD*\n\n` +
    `📅 Tanggal: *${formatTanggalIndo(bk.dateISO)}*\n` +
    `👤 Klien: *${bk.client}* (${bk.packageName})\n` +
    `⏰ Standby: *${bk.standbyTime || '07:00 WIB'}*\n` +
    `📍 Lokasi: ${bk.venue}\n` +
    `🗺️ Maps: ${bk.mapsLink || '(Belum diisi)'}\n` +
    `💾 Memory Card: ${bk.memoryCard || '-'}\n\n` +
    `*Tim Bertugas:*\n${timTxt}\n\nMohon hadir 15 menit lebih awal & cek baterai/memory. Semangat tim!`;
  document.getElementById('brief-preview').textContent = txt;
}

window.addCrewRow = function() {
  const bk = getActiveCrewBooking();
  if (!bk) return;
  const role = (document.getElementById('crew-new-role').value || '').trim() || 'Second Shooter';
  const def = appState.crewList.find(m => m.role.toLowerCase().includes(role.toLowerCase())) || appState.crewList[0];
  bk.crew.push({ role, name: def.name, fee: def.defaultFee || 0 });
  document.getElementById('crew-new-role').value = '';
  bk.updatedAt = Date.now();
  saveState(true); renderAll();
};

window.updateCrewRow = function(idx, field, val) {
  const bk = getActiveCrewBooking();
  if (!bk || !bk.crew[idx]) return;
  bk.crew[idx][field] = field === 'fee' ? (Number(val) || 0) : val;
  bk.updatedAt = Date.now();
  saveState(true); renderCrew(); renderDashboard();
};

window.removeCrewRow = function(idx) {
  const bk = getActiveCrewBooking();
  if (!bk) return;
  bk.crew.splice(idx, 1);
  bk.updatedAt = Date.now();
  saveState(true); renderAll();
};

window.updateBriefingField = function(field, val) {
  const bk = getActiveCrewBooking();
  if (!bk) return;
  bk[field] = val; bk.updatedAt = Date.now();
  saveState(true); renderBriefingPreview(bk);
};

window.sendCrewBriefingWA = function() {
  const txt = document.getElementById('brief-preview').textContent;
  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(txt)}`, '_blank');
};

// ============================================================================
// 6. SORTIR FOTO (LIGHTROOM)
// ============================================================================
function getActiveSortBooking() {
  if (!appState.bookings.length) return null;
  let bk = appState.bookings.find(b => b.id === appState.selectedSortBookingId);
  if (!bk) { bk = appState.bookings[0]; appState.selectedSortBookingId = bk.id; }
  return bk;
}

function renderPhotoSort() {
  const sel = document.getElementById('sort-booking-select');
  if (!sel) return;
  sel.innerHTML = appState.bookings.map(b =>
    `<option value="${b.id}">${b.client} — ${formatTanggalIndo(b.dateISO)}</option>`
  ).join('');
  const bk = getActiveSortBooking();
  if (!bk) return;
  sel.value = bk.id;
  document.getElementById('sort-drive-input').value = bk.driveLink || '';
  document.getElementById('sort-codes-input').value = (bk.selectedPhotos || []).join(', ');
  document.getElementById('sort-preview-chips').innerHTML = (bk.selectedPhotos || []).map(c =>
    `<span class="px-2.5 py-1 rounded-lg bg-beige font-mono text-[11px] font-bold text-espresso">${c}</span>`
  ).join('');
}

window.saveSortDriveLink = function() {
  const bk = getActiveSortBooking();
  if (!bk) return;
  bk.driveLink = document.getElementById('sort-drive-input').value.trim();
  bk.updatedAt = Date.now();
  saveState(true); renderAll();
  showToast('Link Drive Disimpan', bk.client);
};

window.saveSortCodes = function() {
  const bk = getActiveSortBooking();
  if (!bk) return;
  const raw = document.getElementById('sort-codes-input').value;
  bk.selectedPhotos = raw.split(/[,\n\s]+/).map(s => s.trim()).filter(Boolean);
  bk.updatedAt = Date.now();
  saveState(true); renderPhotoSort();
  showToast('Kode Foto Disimpan', `${bk.selectedPhotos.length} file dipilih.`);
};

window.copyLightroomCodes = function() {
  const bk = getActiveSortBooking();
  if (!bk || !bk.selectedPhotos.length) { alert('Belum ada kode foto!'); return; }
  const clean = bk.selectedPhotos.join(', ');
  navigator.clipboard.writeText(clean).then(() => {
    showToast('Kode Lightroom Disalin!', clean);
  });
};

window.sendDriveToClientWA = function() {
  const bk = getActiveSortBooking();
  if (!bk) return;
  const msg = `Halo Kak *${bk.client}*,\nBerikut link Google Drive foto preview *${bk.packageName}* dari *FILEPHOTOKU.STD*:\n${bk.driveLink || '(Link menyusul)'}\n\nSilakan kirimkan nomor/kode file foto yang ingin diedit ya Kak. Terima kasih!`;
  const phone = (bk.phone || '').replace(/[^0-9]/g, '').replace(/^0/, '62');
  window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg)}`, '_blank');
};

// ============================================================================
// 7. ATUR PL / MASTER DATA
// ============================================================================
window.setSetupSubTab = function(sub) {
  appState.setupSubTab = sub;
  document.querySelectorAll('.setup-sub-btn').forEach(b => {
    const act = b.dataset.sub === sub;
    b.classList.toggle('bg-espresso', act);
    b.classList.toggle('text-white', act);
    b.classList.toggle('bg-beige', !act);
    b.classList.toggle('text-espresso', !act);
  });
  renderSetup();
};

function renderSetup() {
  const wrap = document.getElementById('setup-content');
  if (!wrap) return;
  const sub = appState.setupSubTab || 'pricelist';

  if (sub === 'pricelist') {
    wrap.innerHTML = `
      <div class="bg-white rounded-3xl p-4 sm:p-5 border border-[#E6D5C3] space-y-3 text-xs">
        <h2 class="font-editorial text-lg font-bold">Kategori Layanan</h2>
        <div class="flex gap-2">
          <input id="new-cat-name" type="text" placeholder="Kategori baru..." class="flex-1 px-3 py-2 rounded-xl bg-cream border border-[#DEC9B5]" />
          <button type="button" onclick="addCategory()" class="px-4 py-2 rounded-xl bg-terracotta text-white font-bold">＋ Jasa</button>
        </div>
        <div class="flex flex-wrap gap-1.5">
          ${appState.categories.map(c => `<span class="px-3 py-1 rounded-full bg-cream border border-[#DEC9B5] font-semibold flex items-center gap-1.5">${c} <button type="button" onclick="deleteCategory('${c}')" class="text-danger">✕</button></span>`).join('')}
        </div>
      </div>

      <div class="bg-white rounded-3xl p-4 sm:p-5 border border-[#E6D5C3] space-y-3 text-xs">
        <div class="flex items-center justify-between">
          <h2 class="font-editorial text-lg font-bold">Daftar Paket Pricelist</h2>
          <span class="px-2.5 py-1 rounded-full bg-sageLight text-sage font-bold">${appState.pricelist.length} Paket Aktif</span>
        </div>
        <div class="p-3 rounded-2xl bg-[#FAF3EB] border border-[#DEC9B5] space-y-2">
          <select id="new-pl-cat" class="w-full px-3 py-2 rounded-xl bg-white border border-[#DEC9B5] font-semibold">
            ${appState.categories.map(c => `<option value="${c}">${c}</option>`).join('')}
          </select>
          <input id="new-pl-name" type="text" placeholder="Nama Paket" class="w-full px-3 py-2 rounded-xl bg-white border border-[#DEC9B5]" />
          <input id="new-pl-price" type="number" placeholder="Harga (Rp)" class="w-full px-3 py-2 rounded-xl bg-white border border-[#DEC9B5] font-mono" />
          <input id="new-pl-desc" type="text" placeholder="Rincian fasilitas (pisahkan koma, mis: Cetak 10RS, Album, Google Drive)..." class="w-full px-3 py-2 rounded-xl bg-white border border-[#DEC9B5]" />
          <button type="button" onclick="addPricelistItem()" class="w-full py-2.5 rounded-xl bg-espresso text-white font-bold">Simpan Paket Baru</button>
        </div>
        <div class="space-y-2">
          ${appState.pricelist.map(p => `
            <div class="p-3 rounded-2xl bg-cream border border-[#E6D5C3] space-y-2">
              <div class="flex items-center justify-between gap-2">
                <span class="text-[10px] font-bold uppercase text-terracotta">${p.category}</span>
                <button type="button" onclick="deletePricelistItem('${p.id}')" class="text-danger font-bold">🗑️</button>
              </div>
              <input value="${p.name}" onchange="updatePricelistField('${p.id}','name',this.value)" class="w-full px-3 py-1.5 rounded-lg bg-white border border-[#DEC9B5] font-bold" />
              <input type="number" value="${p.price}" onchange="updatePricelistField('${p.id}','price',this.value)" class="w-full px-3 py-1.5 rounded-lg bg-white border border-[#DEC9B5] font-mono" />
              <input value="${p.desc || ''}" onchange="updatePricelistField('${p.id}','desc',this.value)" class="w-full px-3 py-1.5 rounded-lg bg-white border border-[#DEC9B5]" />
            </div>`).join('')}
        </div>
      </div>`;
  } else if (sub === 'crew') {
    wrap.innerHTML = `
      <div class="bg-white rounded-3xl p-4 sm:p-5 border border-[#E6D5C3] space-y-3 text-xs">
        <h2 class="font-editorial text-lg font-bold">Master Kru & Fee Standar</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input id="mc-name" placeholder="Nama Kru" class="px-3 py-2 rounded-xl bg-cream border border-[#DEC9B5]" />
          <input id="mc-role" placeholder="Posisi (Second Shooter)" class="px-3 py-2 rounded-xl bg-cream border border-[#DEC9B5]" />
          <input id="mc-fee" type="number" placeholder="Fee Default (Rp)" class="px-3 py-2 rounded-xl bg-cream border border-[#DEC9B5] font-mono" />
        </div>
        <button type="button" onclick="addMasterCrew()" class="w-full py-2.5 rounded-xl bg-terracotta text-white font-bold">＋ Tambah Kru</button>
        <div class="space-y-2">
          ${appState.crewList.map(c => `
            <div class="flex items-center justify-between p-3 rounded-xl bg-cream border border-[#E6D5C3]">
              <div><strong>${c.name}</strong> <span class="text-espressoMuted">(${c.role})</span> • <span class="font-mono font-bold text-terracotta">${rp(c.defaultFee)}</span></div>
              <button type="button" onclick="deleteMasterCrew('${c.id}')" class="text-danger font-bold">✕</button>
            </div>`).join('')}
        </div>
      </div>`;
  } else if (sub === 'gear') {
    wrap.innerHTML = `
      <div class="bg-white rounded-3xl p-4 sm:p-5 border border-[#E6D5C3] space-y-3 text-xs">
        <h2 class="font-editorial text-lg font-bold">Inventaris Kamera, Lensa & Memory Card</h2>
        <div class="flex gap-2">
          <input id="mg-name" placeholder="Nama Gear / Memory Card..." class="flex-1 px-3 py-2 rounded-xl bg-cream border border-[#DEC9B5]" />
          <button type="button" onclick="addMasterGear()" class="px-4 py-2 rounded-xl bg-terracotta text-white font-bold">＋ Tambah</button>
        </div>
        <div class="space-y-2">
          ${appState.gearList.map(g => `
            <div class="flex items-center justify-between p-3 rounded-xl bg-cream border border-[#E6D5C3]">
              <strong>${g.name}</strong>
              <div class="flex items-center gap-2">
                <button type="button" onclick="toggleGearStatus('${g.id}')" class="px-2.5 py-1 rounded-lg bg-sageLight text-sage font-bold">${g.status}</button>
                <button type="button" onclick="deleteMasterGear('${g.id}')" class="text-danger font-bold">✕</button>
              </div>
            </div>`).join('')}
        </div>
      </div>`;
  } else {
    const p = appState.paymentConfig;
    const s = appState.studioInfo;
    wrap.innerHTML = `
      <div class="bg-white rounded-3xl p-4 sm:p-5 border border-[#E6D5C3] space-y-3 text-xs">
        <h2 class="font-editorial text-lg font-bold">Profil Studio, Rekening & PIN Admin</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div><label class="font-bold block mb-1">No. WA Admin (628...)</label><input id="pf-wa" value="${s.phone}" class="w-full px-3 py-2 rounded-xl bg-cream border border-[#DEC9B5]" /></div>
          <div><label class="font-bold block mb-1">PIN Login Admin</label><input id="pf-pin" value="${appState.adminPin}" class="w-full px-3 py-2 rounded-xl bg-cream border border-[#DEC9B5] font-mono font-bold" /></div>
          <div><label class="font-bold block mb-1">Nama Bank</label><input id="pf-bank" value="${p.bank}" class="w-full px-3 py-2 rounded-xl bg-cream border border-[#DEC9B5]" /></div>
          <div><label class="font-bold block mb-1">Nomor Rekening</label><input id="pf-norek" value="${p.accountNumber}" class="w-full px-3 py-2 rounded-xl bg-cream border border-[#DEC9B5] font-mono" /></div>
          <div><label class="font-bold block mb-1">Atas Nama Rekening</label><input id="pf-an" value="${p.accountHolder}" class="w-full px-3 py-2 rounded-xl bg-cream border border-[#DEC9B5]" /></div>
          <div><label class="font-bold block mb-1">Nama Merchant QRIS</label><input id="pf-qris" value="${p.merchantQris}" class="w-full px-3 py-2 rounded-xl bg-cream border border-[#DEC9B5]" /></div>
        </div>
        <button type="button" onclick="saveStudioProfile()" class="w-full py-3 rounded-xl bg-sage text-white font-bold">Simpan Profil & Bank</button>
        <button type="button" onclick="resetAllData()" class="w-full py-2.5 rounded-xl bg-dangerLight text-danger font-bold">⚠️ Reset ke Data Awal Bersih</button>
      </div>`;
  }
}

window.addCategory = function() {
  const val = (document.getElementById('new-cat-name').value || '').trim();
  if (!val || appState.categories.includes(val)) return;
  appState.categories.push(val); saveState(true); renderAll();
};
window.deleteCategory = function(cat) {
  appState.categories = appState.categories.filter(c => c !== cat); saveState(true); renderAll();
};
window.addPricelistItem = function() {
  const category = document.getElementById('new-pl-cat').value;
  const name = (document.getElementById('new-pl-name').value || '').trim();
  const price = Number(document.getElementById('new-pl-price').value) || 0;
  const desc = (document.getElementById('new-pl-desc').value || '').trim();
  if (!name) return;
  appState.pricelist.push({ id: 'PL-' + Date.now(), category, name, price, desc });
  saveState(true); renderAll(); showToast('Paket Ditambahkan', name);
};
window.updatePricelistField = function(id, field, val) {
  const p = appState.pricelist.find(x => x.id === id);
  if (!p) return;
  p[field] = field === 'price' ? (Number(val) || 0) : val;
  saveState(true); renderPublicWebsite(); renderInvoice();
};
window.deletePricelistItem = function(id) {
  if (!confirm('Hapus paket ini?')) return;
  appState.pricelist = appState.pricelist.filter(x => x.id !== id);
  saveState(true); renderAll();
};
window.addMasterCrew = function() {
  const name = document.getElementById('mc-name').value.trim();
  const role = document.getElementById('mc-role').value.trim() || 'Kru';
  const defaultFee = Number(document.getElementById('mc-fee').value) || 0;
  if (!name) return;
  appState.crewList.push({ id: 'C-' + Date.now(), name, role, defaultFee });
  saveState(true); renderAll();
};
window.deleteMasterCrew = function(id) {
  appState.crewList = appState.crewList.filter(c => c.id !== id); saveState(true); renderAll();
};
window.addMasterGear = function() {
  const name = document.getElementById('mg-name').value.trim();
  if (!name) return;
  appState.gearList.push({ id: 'GR-' + Date.now(), name, status: 'Tersedia' });
  saveState(true); renderAll();
};
window.toggleGearStatus = function(id) {
  const g = appState.gearList.find(x => x.id === id);
  if (!g) return;
  const seq = ['Tersedia', 'Dipakai', 'Standby'];
  g.status = seq[(seq.indexOf(g.status) + 1) % seq.length];
  saveState(true); renderSetup();
};
window.deleteMasterGear = function(id) {
  appState.gearList = appState.gearList.filter(g => g.id !== id); saveState(true); renderSetup();
};
window.saveStudioProfile = function() {
  appState.studioInfo.phone = document.getElementById('pf-wa').value.trim() || '6285708001457';
  appState.adminPin = document.getElementById('pf-pin').value.trim() || appState.adminPin || '998877';
  appState.paymentConfig.bank = document.getElementById('pf-bank').value.trim();
  appState.paymentConfig.accountNumber = document.getElementById('pf-norek').value.trim();
  appState.paymentConfig.accountHolder = document.getElementById('pf-an').value.trim();
  appState.paymentConfig.merchantQris = document.getElementById('pf-qris').value.trim();
  saveState(true); renderAll(); showToast('Tersimpan!', 'Profil studio & bank diperbarui.');
};
window.resetAllData = async function() {
  if (!confirm('Reset semua data ke pengaturan awal bersih?')) return;
  localStorage.removeItem(STORAGE_KEY);
  appState = sanitizeState(null);
  appState.isUnlocked = true;
  appState.activeTab = 'dashboard';
  await saveState(true);
  renderAll();
  showToast('Data Direset', 'Database lokal & server sudah bersih.');
};
window.exportBackupJSON = function() {
  const blob = new Blob([JSON.stringify(appState, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `backup-filephotoku-${todayISO()}.json`;
  a.click();
};
window.importBackupJSON = function(inp) {
  const f = inp.files && inp.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = e => {
    try {
      appState = sanitizeState(JSON.parse(e.target.result));
      appState.isUnlocked = true;
      saveState(true); renderAll();
      showToast('Import Berhasil!', 'Data backup berhasil dipulihkan.');
    } catch (err) { alert('File JSON tidak valid.'); }
  };
  r.readAsText(f);
};

// --- INISIALISASI SAAT HALAMAN DIBUKA ---
document.addEventListener('DOMContentLoaded', () => {
  loadLocalState();
  appState.isUnlocked = false;
  appState.activeTab = 'website';
  document.body.classList.add('public-client-mode');
  renderAll();
  syncFromCloud(false);
  setInterval(() => syncFromCloud(false), 12000);
});