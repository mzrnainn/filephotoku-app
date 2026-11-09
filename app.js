const CLOUD_DB_URL = 'https://filephotoku-db-default-rtdb.asia-southeast1.firebasedatabase.app/'
let appState = loadState();
let logoTapCount = 0;
let logoTapTimer = null;

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_STATE));
    const parsed = JSON.parse(raw);
    return Object.assign(JSON.parse(JSON.stringify(DEFAULT_STATE)), parsed);
  } catch (e) {
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  } catch (e) {
    console.error('Gagal menyimpan state:', e);
  }
}

function showToast(title, message) {
  const box = document.getElementById('toast-box');
  document.getElementById('toast-title').textContent = title;
  document.getElementById('toast-message').textContent = message || '';
  box.classList.remove('hidden');
  setTimeout(() => box.classList.add('hidden'), 3500);
}

function formatRupiah(num) {
  return 'Rp ' + Number(num || 0).toLocaleString('id-ID');
}

function copyTextToClipboard(text, successTitle) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successTitle, text);
    }).catch(() => fallbackCopy(text, successTitle));
  } else {
    fallbackCopy(text, successTitle);
  }
}

function fallbackCopy(text, successTitle) {
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    showToast(successTitle, text);
  } catch (e) {
    showToast('Gagal Menyalin', 'Silakan salin secara manual.');
  }
  document.body.removeChild(ta);
}

// ==================== PINTU RAHASIA ADMIN (KETUK LOGO 3 KALI) ====================
function handleSecretLogoTap() {
  if (appState.isUnlocked) {
    switchTab('dashboard');
    return;
  }
  logoTapCount++;
  clearTimeout(logoTapTimer);
  if (logoTapCount >= 3) {
    logoTapCount = 0;
    openAdminLoginModal();
  } else {
    logoTapTimer = setTimeout(() => { logoTapCount = 0; }, 1200);
  }
}

function openAdminLoginModal() {
  document.getElementById('admin-pin-input').value = '';
  document.getElementById('modal-admin-login').classList.remove('hidden');
  setTimeout(() => document.getElementById('admin-pin-input').focus(), 100);
}

function closeAdminLoginModal() {
  document.getElementById('modal-admin-login').classList.add('hidden');
}

function verifyAdminPin() {
  const pin = document.getElementById('admin-pin-input').value.trim();
  const correctPin = appState.adminPin || '2026';
  if (pin === correctPin) {
    appState.isUnlocked = true;
    saveState();
    document.body.classList.remove('public-client-mode');
    document.getElementById('modal-admin-login').classList.add('hidden');
    switchTab('dashboard');
    showToast('Mode Admin Aktif!', 'Selamat bekerja di FILEPHOTOKU.STD Studio OS.');
  } else {
    showToast('PIN Salah', 'Masukkan PIN Owner yang benar.');
  }
}

function lockAdminSession() {
  appState.isUnlocked = false;
  saveState();
  document.body.classList.add('public-client-mode');
  switchTab('website');
  showToast('Tampilan Klien Aktif', 'Menu Admin disembunyikan. Ketuk logo 3x untuk masuk kembali.');
}

// ==================== NAVIGASI TAB ====================
function switchTab(tabId) {
  const adminOnlyTabs = ['setup', 'dashboard', 'booking', 'invoice', 'crew', 'gear', 'photosort'];
  if (adminOnlyTabs.includes(tabId) && !appState.isUnlocked) {
    tabId = 'website';
  }

  appState.activeTab = tabId;
  saveState();

  document.querySelectorAll('.tab-section').forEach(sec => sec.classList.remove('active'));
  const target = document.getElementById('tab-' + tabId);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-btn').forEach(btn => {
    if (btn.dataset.tab === tabId) {
      btn.className = 'nav-btn w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-terracotta text-white shadow-sm transition';
    } else {
      btn.className = 'nav-btn w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-espresso hover:bg-beige transition';
    }
  });

  document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
    if (btn.dataset.tab === tabId) {
      btn.classList.remove('text-espressoMuted');
      btn.classList.add('text-terracotta');
    } else {
      btn.classList.remove('text-terracotta');
      btn.classList.add('text-espressoMuted');
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function switchSetupSubTab(subId) {
  appState.setupSubTab = subId;
  saveState();
  ['pricelist', 'crew', 'gear', 'profile'].forEach(id => {
    const panel = document.getElementById('setup-panel-' + id);
    const btn = document.getElementById('subtab-btn-' + id);
    if (panel) panel.classList.toggle('active', id === subId);
    if (btn) {
      btn.className = id === subId
        ? 'py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-espresso text-white shadow transition'
        : 'py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 text-espresso hover:bg-white/60 transition';
    }
  });
}

// ==================== MENU 0: MASTER DATA & PRICELIST ====================
function renderSetupMaster() {
  const catList = document.getElementById('setup-service-categories-list');
  if (catList) {
    catList.innerHTML = appState.serviceCategories.map((cat, idx) => `
      <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cream border border-[#DEC9B5] text-xs font-bold text-espresso">
        <span>${cat}</span>
        <button onclick="deleteServiceCategory(${idx})" class="text-espressoMuted hover:text-danger"><i class="ph-bold ph-x"></i></button>
      </div>
    `).join('');
  }

  const plCatSelect = document.getElementById('pl-new-category');
  if (plCatSelect) {
    plCatSelect.innerHTML = appState.serviceCategories.map(c => `<option value="${c}">${c}</option>`).join('');
  }

  const plBadge = document.getElementById('pricelist-count-badge');
  if (plBadge) plBadge.textContent = `${appState.pricelist.length} Paket Aktif`;

  const plContainer = document.getElementById('setup-pricelist-container');
  if (plContainer) {
    plContainer.innerHTML = appState.pricelist.map((item, idx) => `
      <div class="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center p-3 rounded-2xl bg-cream/60 border border-[#E6D5C3]">
        <div class="sm:col-span-2">
          <select onchange="updatePricelistField(${idx}, 'category', this.value)" class="w-full px-2.5 py-2 rounded-xl bg-white border border-[#DEC9B5] text-xs font-bold text-terracotta">
            ${appState.serviceCategories.map(c => `<option value="${c}" ${c === item.category ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </div>
        <div class="sm:col-span-3">
          <input type="text" value="${item.name}" oninput="updatePricelistField(${idx}, 'name', this.value)" class="w-full px-3 py-2 rounded-xl bg-white border border-[#DEC9B5] text-xs font-bold text-espresso" />
        </div>
        <div class="sm:col-span-2">
          <input type="number" step="25000" value="${item.price}" oninput="updatePricelistField(${idx}, 'price', this.value)" class="w-full px-3 py-2 rounded-xl bg-white border border-[#DEC9B5] font-mono text-xs font-bold text-espresso" />
        </div>
        <div class="sm:col-span-4">
          <input type="text" value="${item.desc || ''}" oninput="updatePricelistField(${idx}, 'desc', this.value)" class="w-full px-3 py-2 rounded-xl bg-white border border-[#DEC9B5] text-xs text-espressoMuted" />
        </div>
        <div class="sm:col-span-1 flex justify-end">
          <button onclick="deletePricelistItem(${idx})" class="p-2 rounded-xl bg-dangerLight text-danger hover:bg-danger hover:text-white transition"><i class="ph-bold ph-trash"></i></button>
        </div>
      </div>
    `).join('');
  }

  const crewBadge = document.getElementById('crew-master-count-badge');
  if (crewBadge) crewBadge.textContent = `${appState.crewMaster.length} Kru Terdaftar`;

  const crewList = document.getElementById('setup-crew-master-list');
  if (crewList) {
    crewList.innerHTML = appState.crewMaster.map((cr, idx) => `
      <div class="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center p-3 rounded-2xl bg-cream/60 border border-[#E6D5C3]">
        <div class="sm:col-span-4">
          <input type="text" value="${cr.name}" oninput="updateCrewMasterField(${idx}, 'name', this.value)" class="w-full px-3 py-2 rounded-xl bg-white border border-[#DEC9B5] text-xs font-bold text-espresso" />
        </div>
        <div class="sm:col-span-3">
          <input type="text" value="${cr.role}" oninput="updateCrewMasterField(${idx}, 'role', this.value)" class="w-full px-3 py-2 rounded-xl bg-white border border-[#DEC9B5] text-xs font-semibold text-terracotta" />
        </div>
        <div class="sm:col-span-2">
          <input type="number" step="25000" value="${cr.defaultFee}" oninput="updateCrewMasterField(${idx}, 'defaultFee', this.value)" class="w-full px-3 py-2 rounded-xl bg-white border border-[#DEC9B5] font-mono text-xs font-bold text-espresso" />
        </div>
        <div class="sm:col-span-2">
          <input type="text" value="${cr.phone || ''}" oninput="updateCrewMasterField(${idx}, 'phone', this.value)" class="w-full px-3 py-2 rounded-xl bg-white border border-[#DEC9B5] font-mono text-xs text-espressoMuted" />
        </div>
        <div class="sm:col-span-1 flex justify-end">
          <button onclick="deleteCrewMasterItem(${idx})" class="p-2 rounded-xl bg-dangerLight text-danger"><i class="ph-bold ph-trash"></i></button>
        </div>
      </div>
    `).join('');
  }

  const gearListEl = document.getElementById('setup-gear-list');
  if (gearListEl) {
    gearListEl.innerHTML = appState.gearList.map((g, idx) => `
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-cream/70 border border-[#E6D5C3]">
        <input type="text" value="${g.name}" oninput="updateGearSetupField(${idx}, 'name', this.value)" class="flex-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#DEC9B5] text-xs font-bold text-espresso" />
        <div class="flex items-center gap-2">
          <input type="text" value="${g.holder}" oninput="updateGearSetupField(${idx}, 'holder', this.value)" class="flex-1 sm:w-40 px-2.5 py-1.5 rounded-lg bg-white border border-[#DEC9B5] text-xs text-espressoMuted" />
          <button onclick="deleteGearItem(${idx})" class="p-1.5 rounded-lg bg-dangerLight text-danger"><i class="ph-bold ph-trash"></i></button>
        </div>
      </div>
    `).join('');
  }

  const mcListEl = document.getElementById('setup-mc-list');
  if (mcListEl) {
    mcListEl.innerHTML = appState.memoryCards.map((mc, idx) => `
      <div class="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-cream/70 border border-[#E6D5C3]">
        <input type="text" value="${mc.code}" oninput="updateMcSetupField(${idx}, 'code', this.value)" class="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg bg-white border border-[#DEC9B5] font-mono text-xs font-bold text-espresso" />
        <button onclick="deleteMcItem(${idx})" class="p-1.5 rounded-lg bg-dangerLight text-danger shrink-0"><i class="ph-bold ph-trash"></i></button>
      </div>
    `).join('');
  }

  const prof = appState.studioProfile;
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el && document.activeElement !== el) el.value = val;
  };
  setVal('prof-brand-name', prof.brandName);
  setVal('prof-city', prof.city);
  setVal('prof-wa', prof.adminWa);
  setVal('prof-bank', prof.bankInfo);
  setVal('prof-tagline', prof.tagline);
  setVal('invoice-bank-input', prof.bankInfo);
}

function addServiceCategory() {
  const input = document.getElementById('new-service-cat-input');
  const val = input.value.trim();
  if (!val) return;
  if (!appState.serviceCategories.includes(val)) {
    appState.serviceCategories.push(val);
    input.value = '';
    saveState();
    renderAll();
    showToast('Kategori Ditambahkan', val);
  }
}

function deleteServiceCategory(idx) {
  appState.serviceCategories.splice(idx, 1);
  saveState();
  renderAll();
}

function addPricelistItem() {
  const cat = document.getElementById('pl-new-category').value;
  const name = document.getElementById('pl-new-name').value.trim();
  const price = Number(document.getElementById('pl-new-price').value) || 0;
  const desc = document.getElementById('pl-new-desc').value.trim();
  if (!name || price <= 0) {
    showToast('Data Belum Lengkap', 'Isi nama paket dan harga.');
    return;
  }
  appState.pricelist.push({ id: 'PL-' + Date.now(), category: cat, name, price, desc });
  document.getElementById('pl-new-name').value = '';
  document.getElementById('pl-new-price').value = '';
  document.getElementById('pl-new-desc').value = '';
  saveState();
  renderAll();
  showToast('Paket Tersimpan', name);
}

function updatePricelistField(idx, field, value) {
  if (!appState.pricelist[idx]) return;
  appState.pricelist[idx][field] = field === 'price' ? (Number(value) || 0) : value;
  saveState();
  renderInvoiceSection();
  renderWebsiteAndVendors();
}

function deletePricelistItem(idx) {
  appState.pricelist.splice(idx, 1);
  saveState();
  renderAll();
}

function addCrewMasterItem() {
  const name = document.getElementById('crew-new-name').value.trim();
  const role = document.getElementById('crew-new-role').value;
  const defaultFee = Number(document.getElementById('crew-new-fee').value) || 0;
  const phone = document.getElementById('crew-new-wa').value.trim();
  if (!name) return;
  appState.crewMaster.push({ id: 'CR-' + Date.now(), name, role, defaultFee, phone });
  document.getElementById('crew-new-name').value = '';
  document.getElementById('crew-new-fee').value = '';
  document.getElementById('crew-new-wa').value = '';
  saveState();
  renderAll();
}

function updateCrewMasterField(idx, field, value) {
  if (!appState.crewMaster[idx]) return;
  appState.crewMaster[idx][field] = field === 'defaultFee' ? (Number(value) || 0) : value;
  saveState();
  renderCrewSection();
}

function deleteCrewMasterItem(idx) {
  appState.crewMaster.splice(idx, 1);
  saveState();
  renderAll();
}

function addGearFromSetup() {
  const name = document.getElementById('setup-gear-name').value.trim();
  const holder = document.getElementById('setup-gear-holder').value.trim() || 'Drybox Studio';
  if (!name) return;
  appState.gearList.push({ id: 'G-' + Date.now(), name, icon: 'ph-camera', holder, status: 'Tersedia di Studio' });
  document.getElementById('setup-gear-name').value = '';
  document.getElementById('setup-gear-holder').value = '';
  saveState();
  renderAll();
}

function updateGearSetupField(idx, field, value) {
  if (!appState.gearList[idx]) return;
  appState.gearList[idx][field] = value;
  saveState();
  renderGearSection();
}

function deleteGearItem(idx) {
  appState.gearList.splice(idx, 1);
  saveState();
  renderAll();
}

function addMemoryCardFromSetup() {
  const code = document.getElementById('setup-mc-code').value.trim();
  const jobName = document.getElementById('setup-mc-job').value.trim() || 'Siap Pakai';
  if (!code) return;
  appState.memoryCards.push({ id: 'MC-' + Date.now(), code, jobName, hddLocation: 'Studio FILEPHOTOKU.STD', status: 'Aman - Siap Format Ulang' });
  document.getElementById('setup-mc-code').value = '';
  document.getElementById('setup-mc-job').value = '';
  saveState();
  renderAll();
}

function updateMcSetupField(idx, field, value) {
  if (!appState.memoryCards[idx]) return;
  appState.memoryCards[idx][field] = value;
  saveState();
  renderGearSection();
}

function deleteMcItem(idx) {
  appState.memoryCards.splice(idx, 1);
  saveState();
  renderAll();
}

function saveStudioProfile() {
  appState.studioProfile.brandName = document.getElementById('prof-brand-name').value.trim() || 'FILEPHOTOKU.STD';
  appState.studioProfile.city = document.getElementById('prof-city').value.trim() || 'Banyuwangi';
  appState.studioProfile.adminWa = document.getElementById('prof-wa').value.trim() || '085708001457';
  appState.studioProfile.bankInfo = document.getElementById('prof-bank').value.trim();
  appState.studioProfile.tagline = document.getElementById('prof-tagline').value.trim();
  saveState();
  renderInvoiceSection();
  renderWebsiteAndVendors();
}

function exportStudioData() {
  const dataStr = JSON.stringify(appState, null, 2);
  copyTextToClipboard(dataStr, 'Backup JSON Disalin & Diunduh!');
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `FILEPHOTOKU_BACKUP_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function openImportModal() {
  document.getElementById('import-json-textarea').value = '';
  document.getElementById('modal-import-json').classList.remove('hidden');
}

function closeImportModal() {
  document.getElementById('modal-import-json').classList.add('hidden');
}

function handleJsonFileUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => { document.getElementById('import-json-textarea').value = e.target.result; };
  reader.readAsText(file);
}

function confirmImportStudioData() {
  try {
    const parsed = JSON.parse(document.getElementById('import-json-textarea').value.trim());
    if (!parsed.pricelist || !parsed.bookings) throw new Error('Invalid');
    appState = Object.assign(JSON.parse(JSON.stringify(DEFAULT_STATE)), parsed);
    saveState();
    renderAll();
    closeImportModal();
    showToast('Restore Berhasil!', 'Seluruh data studio telah diperbarui.');
  } catch (err) {
    showToast('Format JSON Tidak Valid', 'Pastikan teks JSON utuh.');
  }
}

// ==================== MENU 1: DASHBOARD & KAS ====================
function calculateFinancialSummary() {
  let totalGross = 0, totalDP = 0, totalUnpaid = 0, overdueCount = 0, totalCrewFeeAll = 0;

  appState.bookings.forEach(b => {
    const activeItemsSum = b.items.filter(i => i.checked).reduce((acc, cur) => acc + Number(cur.price || 0), 0);
    b.totalPrice = activeItemsSum > 0 ? activeItemsSum : b.totalPrice;
    const remaining = Math.max(0, b.totalPrice - b.dpPaid);
    totalGross += b.totalPrice;
    totalDP += Number(b.dpPaid || 0);
    totalUnpaid += remaining;
    if (remaining > 0 && b.isOverdue) overdueCount += 1;
    totalCrewFeeAll += b.crew.reduce((acc, c) => acc + Number(c.fee || 0), 0);
  });

  const netProfit = Math.max(0, totalGross - totalCrewFeeAll);
  const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  setTxt('dash-total-unpaid', formatRupiah(totalUnpaid));
  setTxt('dash-overdue-count', `${overdueCount} Perlu Ditagih`);
  setTxt('nav-overdue-pill', `${overdueCount} Lewat`);
  setTxt('nav-booking-badge', `${appState.bookings.length} Job`);
  setTxt('stat-unpaid', formatRupiah(totalUnpaid));
  setTxt('stat-unpaid-sub', `Dari ${appState.bookings.length} proyek aktif`);
  setTxt('stat-dp', formatRupiah(totalDP));
  setTxt('stat-gross', formatRupiah(totalGross));
  setTxt('stat-profit', formatRupiah(netProfit));

  const hasEmptyCrew = appState.bookings.some(b => b.crew.some(c => c.assignee === 'Kosong'));
  const warningDot = document.getElementById('crew-warning-dot');
  if (warningDot) warningDot.style.display = hasEmptyCrew ? 'inline-block' : 'none';
}

function renderDashboardFileTracker() {
  const container = document.getElementById('dashboard-file-tracker');
  if (!container) return;
  const steps = ['1. Backup', '2. Preview', '3. Sortir', '4. Edit', '5. Selesai'];
  container.innerHTML = appState.bookings.map(b => `
    <div class="p-3.5 rounded-2xl bg-cream border border-[#E6D5C3] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
      <div>
        <div class="flex flex-wrap items-center gap-1.5">
          <span class="px-2 py-0.5 rounded-full bg-terracotta text-white text-[10px] font-bold">${b.category}</span>
          <span class="font-bold text-xs sm:text-sm text-espresso">${b.couple}</span>
          <span class="font-mono text-[11px] text-espressoMuted">(${b.day} ${b.month})</span>
        </div>
        <p class="text-[11px] text-driveBlue font-semibold mt-1">${b.serviceType}</p>
      </div>
      <div class="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
        ${steps.map((lbl, idx) => {
          const stepNum = idx + 1;
          const done = stepNum <= (b.fileStage || 1);
          return `<button onclick="updateClientFileStage('${b.id}', ${stepNum})" class="px-2 py-1.5 rounded-xl text-[10px] font-bold transition ${done ? 'bg-driveBlue text-white' : 'bg-white text-espressoMuted border border-[#DEC9B5]'}">${done ? '✓ ' : ''}${lbl}</button>`;
        }).join('')}
      </div>
    </div>
  `).join('');
}

function updateClientFileStage(bookingId, stepNum) {
  const b = appState.bookings.find(x => x.id === bookingId);
  if (!b) return;
  b.fileStage = stepNum;
  saveState();
  renderDashboardFileTracker();
}

function renderMiniOctoberCalendar() {
  const grid = document.getElementById('mini-october-grid');
  if (!grid) return;
  grid.innerHTML = '';
  for (let i = 0; i < 3; i++) grid.innerHTML += `<div class="py-1.5 text-transparent">.</div>`;
  const bookedDays = appState.bookedOctoberDates.map(d => d.day);
  document.getElementById('october-booked-badge').textContent = `${bookedDays.length} Terisi`;
  for (let day = 1; day <= 31; day++) {
    const isBooked = bookedDays.includes(day);
    grid.innerHTML += `<button onclick="switchTab('booking'); setBookingView('calendar');" class="py-1.5 rounded-xl font-mono text-xs ${isBooked ? 'bg-terracotta text-white font-bold' : 'bg-cream text-espressoMuted'}">${day}</button>`;
  }
}

function remindAllOverdueClients() {
  const overdues = appState.bookings.filter(b => (b.totalPrice - b.dpPaid) > 0);
  if (!overdues.length) return showToast('Semua Lunas!', 'Tidak ada tagihan tertunda.');
  const lines = overdues.map(b => `• ${b.couple}: Sisa ${formatRupiah(b.totalPrice - b.dpPaid)}`).join('\n');
  copyTextToClipboard(`Halo Kak, pengingat sisa pelunasan *${appState.studioProfile.brandName}*:\n\n${lines}\n\nRekening: ${appState.studioProfile.bankInfo}`, 'Pengingat WA Disalin!');
}

// ==================== MENU 2: BOOKING & KALENDER ====================
function setBookingView(view) {
  appState.bookingView = view;
  saveState();
  document.getElementById('booking-list-container').classList.toggle('hidden', view !== 'list');
  document.getElementById('booking-calendar-container').classList.toggle('hidden', view === 'list');
}

function renderBookingCategoryChips() {
  const container = document.getElementById('booking-category-chips');
  if (!container) return;
  const cats = ['Semua', ...appState.serviceCategories.filter(c => !c.startsWith('Add-On'))];
  container.innerHTML = cats.map(cat => `
    <button onclick="filterBookingCategory('${cat}')" class="px-3 py-1.5 rounded-full text-xs font-semibold transition ${appState.bookingFilter === cat ? 'bg-espresso text-white' : 'bg-white border border-[#DEC9B5] text-espresso'}">${cat}</button>
  `).join('');
}

function filterBookingCategory(cat) {
  appState.bookingFilter = cat;
  saveState();
  renderBookingCategoryChips();
  renderBookingsList();
}

function renderBookingsList() {
  const container = document.getElementById('booking-list-container');
  if (!container) return;
  const filtered = appState.bookingFilter === 'Semua' ? appState.bookings : appState.bookings.filter(b => b.category === appState.bookingFilter);
  const stageNames = ['1. DP 30%', '2. Persiapan', '3. Liputan', '4. Serah File'];

  container.innerHTML = filtered.map(b => {
    const remaining = Math.max(0, b.totalPrice - b.dpPaid);
    return `
      <div class="bg-white rounded-3xl border border-[#E6D5C3] p-4 sm:p-6 shadow-warm space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div class="flex flex-wrap items-center gap-1.5">
              <span class="px-2 py-0.5 rounded-lg bg-beige text-terracotta font-mono text-xs font-bold">${b.day} ${b.month}</span>
              <span class="px-2 py-0.5 rounded-lg bg-cream border border-[#DEC9B5] text-xs font-semibold">${b.category}</span>
            </div>
            <h3 class="font-editorial text-lg sm:text-xl font-bold text-espresso mt-1">${b.couple}</h3>
            <p class="text-xs text-espressoMuted">📍 ${b.venue} (${b.gatherTime}) • ${b.serviceType}</p>
          </div>
          <div class="sm:text-right">
            <span class="inline-block px-3 py-1 rounded-full text-xs font-bold ${remaining === 0 ? 'bg-sageLight text-sage' : 'bg-amberLight text-amberWarn'}">${remaining === 0 ? 'LUNAS' : 'Sisa ' + formatRupiah(remaining)}</span>
            <p class="font-mono text-xs text-espressoMuted mt-1">Total: <strong>${formatRupiah(b.totalPrice)}</strong> • DP: <strong>${formatRupiah(b.dpPaid)}</strong></p>
          </div>
        </div>

        <div class="p-3 rounded-2xl bg-driveLight/60 border border-[#C6DAFC] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          <input type="text" value="${b.driveUrl || ''}" onchange="updateBookingDriveUrl('${b.id}', this.value)" class="flex-1 min-w-0 bg-white px-3 py-1.5 rounded-xl border border-[#B2CCF7] font-mono text-xs text-driveBlue" />
          <button onclick="copyClientDriveLink('${b.id}')" class="px-3 py-1.5 rounded-xl bg-driveBlue text-white text-xs font-semibold shrink-0">Salin Link GDrive</button>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          ${stageNames.map((lbl, idx) => {
            const step = idx + 1;
            const done = step <= b.stage;
            return `<button onclick="advanceBookingStage('${b.id}', ${step})" class="py-2 px-2 rounded-xl text-[11px] font-bold border ${done ? 'bg-terracotta text-white border-terracotta' : 'bg-cream text-espressoMuted border-[#DEC9B5]'}">${done ? '✓ ' : ''}${lbl}</button>`;
          }).join('')}
        </div>

        <div class="pt-2 border-t border-[#F2E6D8] flex flex-wrap items-center justify-between gap-2">
          <span class="text-[11px] font-mono text-espressoMuted">Media: <strong>${b.memoryCardCode}</strong></span>
          <div class="flex gap-2">
            <button onclick="jumpToInvoice('${b.id}')" class="px-3 py-1.5 rounded-xl bg-beige text-espresso text-xs font-semibold">Invoice</button>
            <button onclick="jumpToCrew('${b.id}')" class="px-3 py-1.5 rounded-xl bg-beige text-espresso text-xs font-semibold">Kru & Shareloc</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function updateBookingDriveUrl(id, url) {
  const b = appState.bookings.find(x => x.id === id);
  if (b) { b.driveUrl = url.trim(); saveState(); showToast('Link GDrive Disimpan'); }
}

function copyClientDriveLink(id) {
  const b = appState.bookings.find(x => x.id === id);
  if (b) copyTextToClipboard(`Halo Kak *${b.couple}*, berikut link Google Drive dokumentasi *${appState.studioProfile.brandName}*:\n📂 ${b.driveUrl}`, 'Link Drive Disalin!');
}

function advanceBookingStage(id, stage) {
  const b = appState.bookings.find(x => x.id === id);
  if (b) { b.stage = stage; saveState(); renderBookingsList(); }
}

function jumpToInvoice(id) {
  appState.selectedInvoiceClientId = id;
  saveState();
  renderInvoiceSection();
  switchTab('invoice');
}

function jumpToCrew(id) {
  appState.selectedCrewJobId = id;
  saveState();
  renderCrewSection();
  switchTab('crew');
}

function renderFullOctoberCalendar() {
  const grid = document.getElementById('full-calendar-grid');
  if (!grid) return;
  grid.innerHTML = '';
  for (let i = 0; i < 3; i++) grid.innerHTML += `<div class="min-h-[60px] rounded-xl bg-cream/40"></div>`;
  for (let day = 1; day <= 31; day++) {
    const b = appState.bookings.find(x => Number(x.day) === day);
    if (b) {
      grid.innerHTML += `<div onclick="setBookingView('list')" class="min-h-[60px] p-2 rounded-xl bg-terracotta text-white cursor-pointer"><div class="font-mono text-xs font-bold">${day}</div><div class="text-[10px] font-semibold truncate mt-1">${b.couple}</div></div>`;
    } else {
      grid.innerHTML += `<div onclick="openNewBookingModal(${day})" class="min-h-[60px] p-2 rounded-xl bg-cream border border-[#E6D5C3] cursor-pointer"><div class="font-mono text-xs font-bold">${day}</div><div class="text-[9px] text-sage font-bold mt-1">+ Slot</div></div>`;
    }
  }
}

// ==================== MENU 3: INVOICE OTOMATIS ====================
function renderInvoiceSection() {
  const select = document.getElementById('invoice-client-select');
  if (!select) return;
  select.innerHTML = appState.bookings.map(b => `<option value="${b.id}" ${b.id === appState.selectedInvoiceClientId ? 'selected' : ''}>${b.couple} (${b.day} ${b.month})</option>`).join('');

  const plPicker = document.getElementById('invoice-pricelist-picker');
  if (plPicker) {
    plPicker.innerHTML = appState.pricelist.map(p => `<option value="${p.id}">[${p.category}] ${p.name} — ${formatRupiah(p.price)}</option>`).join('');
  }

  const client = appState.bookings.find(b => b.id === appState.selectedInvoiceClientId) || appState.bookings[0];
  if (!client) return;

  document.getElementById('invoice-dp-input').value = client.dpPaid;
  document.getElementById('invoice-items-editor').innerHTML = client.items.map((item, idx) => `
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-cream border border-[#DEC9B5]">
      <label class="flex items-center gap-2 text-xs font-semibold text-espresso cursor-pointer flex-1 min-w-0">
        <input type="checkbox" ${item.checked ? 'checked' : ''} onchange="toggleInvoiceItem(${idx})" class="w-4 h-4 accent-[#9E5231] rounded shrink-0" />
        <span class="truncate">${item.name}</span>
      </label>
      <input type="number" step="25000" value="${item.price}" oninput="updateInvoiceItemPrice(${idx}, this.value)" class="w-full sm:w-32 px-3 py-1.5 rounded-xl bg-white border border-[#DEC9B5] font-mono text-xs font-bold text-right text-espresso" />
    </div>
  `).join('');

  const activeItems = client.items.filter(i => i.checked);
  const subtotal = activeItems.reduce((sum, i) => sum + Number(i.price || 0), 0);
  client.totalPrice = subtotal;
  const remaining = Math.max(0, subtotal - Number(client.dpPaid || 0));

  document.getElementById('inv-preview-brand').textContent = appState.studioProfile.brandName;
  document.getElementById('inv-preview-city').textContent = `${appState.studioProfile.city} • WA: ${appState.studioProfile.adminWa}`;
  document.getElementById('inv-number-display').textContent = `INV/FP/2026/${client.id.split('-').pop()}`;
  document.getElementById('inv-client-name').textContent = client.couple;
  document.getElementById('inv-client-date').textContent = `${client.day} ${client.month}`;
  document.getElementById('inv-client-venue').textContent = client.venue;
  document.getElementById('inv-client-drive').textContent = client.serviceType;

  const badge = document.getElementById('inv-status-badge');
  badge.className = remaining === 0 ? 'px-2.5 py-0.5 rounded-full bg-sageLight text-sage text-[10px] font-bold' : 'px-2.5 py-0.5 rounded-full bg-amberLight text-amberWarn text-[10px] font-bold';
  badge.textContent = remaining === 0 ? 'LUNAS ✓' : 'BELUM LUNAS';

  document.getElementById('inv-preview-lines').innerHTML = activeItems.map(i => `
    <div class="flex justify-between gap-2 text-xs">
      <span class="text-espresso font-medium">${i.name}</span>
      <span class="font-mono font-semibold text-espresso shrink-0">${formatRupiah(i.price)}</span>
    </div>
  `).join('');

  document.getElementById('inv-subtotal').textContent = formatRupiah(subtotal);
  document.getElementById('inv-dp-display').textContent = '- ' + formatRupiah(client.dpPaid);
  document.getElementById('inv-remaining').textContent = formatRupiah(remaining);
  document.getElementById('inv-bank-display').textContent = appState.studioProfile.bankInfo;

  calculateFinancialSummary();
}

function selectInvoiceClient(id) { appState.selectedInvoiceClientId = id; saveState(); renderInvoiceSection(); }
function toggleInvoiceItem(idx) {
  const c = appState.bookings.find(b => b.id === appState.selectedInvoiceClientId);
  if (c) { c.items[idx].checked = !c.items[idx].checked; saveState(); renderInvoiceSection(); }
}
function updateInvoiceItemPrice(idx, val) {
  const c = appState.bookings.find(b => b.id === appState.selectedInvoiceClientId);
  if (c) { c.items[idx].price = Number(val) || 0; saveState(); renderInvoiceSection(); }
}
function addPricelistToCurrentInvoice() {
  const chosen = appState.pricelist.find(p => p.id === document.getElementById('invoice-pricelist-picker').value);
  const c = appState.bookings.find(b => b.id === appState.selectedInvoiceClientId);
  if (chosen && c) { c.items.push({ name: chosen.name, price: chosen.price, checked: true }); saveState(); renderInvoiceSection(); }
}
function addCustomInvoiceItem() {
  const name = document.getElementById('custom-item-name').value.trim();
  const price = Number(document.getElementById('custom-item-price').value) || 0;
  const c = appState.bookings.find(b => b.id === appState.selectedInvoiceClientId);
  if (name && price > 0 && c) {
    c.items.push({ name, price, checked: true });
    document.getElementById('custom-item-name').value = '';
    document.getElementById('custom-item-price').value = '';
    saveState();
    renderInvoiceSection();
  }
}
function setThirtyPercentDP() {
  const c = appState.bookings.find(b => b.id === appState.selectedInvoiceClientId);
  if (c) { c.dpPaid = Math.round((c.totalPrice * 0.3) / 1000) * 1000; saveState(); renderInvoiceSection(); }
}
function updateInvoiceDP(val) {
  const c = appState.bookings.find(b => b.id === appState.selectedInvoiceClientId);
  if (c) { c.dpPaid = Number(val) || 0; saveState(); renderInvoiceSection(); }
}
function updateInvoiceBank(val) {
  appState.studioProfile.bankInfo = val;
  saveState();
  document.getElementById('inv-bank-display').textContent = val;
}
function copyInvoiceWhatsApp() {
  const c = appState.bookings.find(b => b.id === appState.selectedInvoiceClientId);
  if (!c) return;
  const rem = Math.max(0, c.totalPrice - c.dpPaid);
  const lines = c.items.filter(i => i.checked).map(i => `• ${i.name}: ${formatRupiah(i.price)}`).join('\n');
  copyTextToClipboard(`*INVOICE RESMI — ${appState.studioProfile.brandName}*\nKlien: *${c.couple}*\nJadwal: ${c.day} ${c.month} (${c.venue})\n\n${lines}\n\nTotal: *${formatRupiah(c.totalPrice)}*\nDP: *${formatRupiah(c.dpPaid)}*\n*Sisa Pelunasan: ${formatRupiah(rem)}*\n\n📂 Link GDrive: ${c.driveUrl}\nInfo WA: ${appState.studioProfile.adminWa}`, 'Invoice WA Disalin!');
}

// ==================== MENU 4: JADWAL KRU, FEE & SHARELOC (RAPI 100% DI IPHONE) ====================
function renderCrewSection() {
  const select = document.getElementById('crew-job-select');
  if (!select) return;
  select.innerHTML = appState.bookings.map(b => `<option value="${b.id}" ${b.id === appState.selectedCrewJobId ? 'selected' : ''}>${b.couple} (${b.day} ${b.month})</option>`).join('');

  const job = appState.bookings.find(b => b.id === appState.selectedCrewJobId) || appState.bookings[0];
  if (!job) return;

  document.getElementById('crew-panel-title').textContent = `Tim Liputan • ${job.couple} (${job.day} ${job.month})`;
  document.getElementById('crew-venue-input').value = job.venue;
  document.getElementById('crew-time-input').value = job.gatherTime;
  document.getElementById('crew-card-input').value = job.memoryCardCode || 'Card #A1';

  const emptyCount = job.crew.filter(c => c.assignee === 'Kosong').length;
  const badge = document.getElementById('crew-shortage-badge');
  badge.className = emptyCount > 0 ? 'px-3 py-1 rounded-full bg-dangerLight text-danger text-xs font-bold inline-flex items-center gap-1' : 'px-3 py-1 rounded-full bg-sageLight text-sage text-xs font-bold inline-flex items-center gap-1';
  badge.innerHTML = emptyCount > 0 ? `⚠️ ${emptyCount} Posisi Kosong` : `✓ Tim Lengkap`;

  const masterNames = ['Kosong', ...appState.crewMaster.map(cm => cm.name)];

  document.getElementById('crew-roles-list').innerHTML = job.crew.map((c, idx) => {
    const isEmpty = c.assignee === 'Kosong';
    return `
      <div class="p-3.5 rounded-2xl border ${isEmpty ? 'bg-dangerLight/40 border-danger' : 'bg-cream border-[#DEC9B5]'} space-y-2.5 w-full">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl ${isEmpty ? 'bg-danger text-white' : 'bg-terracotta text-white'} flex items-center justify-center font-bold text-xs shrink-0">
            ${isEmpty ? '?' : c.assignee.charAt(0)}
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-bold text-espresso truncate">${c.role}</p>
            <p class="text-[11px] truncate ${isEmpty ? 'text-danger font-semibold' : 'text-espressoMuted'}">
              ${isEmpty ? 'Belum ada kru ditugaskan!' : 'Personel: ' + c.assignee}
            </p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
          <select onchange="assignCrewMember(${idx}, this.value)" class="w-full sm:flex-1 min-w-0 px-3 py-2 rounded-xl bg-white border border-[#DEC9B5] text-xs font-semibold text-espresso">
            ${masterNames.map(opt => `<option value="${opt}" ${opt === c.assignee ? 'selected' : ''}>${opt}</option>`).join('')}
          </select>
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <input type="number" step="25000" value="${c.fee}" oninput="updateCrewFee(${idx}, this.value)" class="flex-1 sm:w-28 min-w-0 px-3 py-2 rounded-xl bg-white border border-[#DEC9B5] font-mono text-xs font-bold text-right text-espresso" />
            <button onclick="removeCrewRoleFromJob(${idx})" class="w-8 h-8 rounded-xl bg-white border border-[#DEC9B5] text-espressoMuted hover:text-danger flex items-center justify-center shrink-0" title="Hapus posisi">✕</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  const totalFee = job.crew.reduce((acc, c) => acc + Number(c.fee || 0), 0);
  document.getElementById('crew-total-fee').textContent = formatRupiah(totalFee);
  document.getElementById('crew-net-profit').textContent = formatRupiah(Math.max(0, job.totalPrice - totalFee));

  updateSharelocPreviewText(job);
  calculateFinancialSummary();
}

function selectCrewJob(id) { appState.selectedCrewJobId = id; saveState(); renderCrewSection(); }

function assignCrewMember(roleIdx, personName) {
  const job = appState.bookings.find(b => b.id === appState.selectedCrewJobId);
  if (!job) return;
  job.crew[roleIdx].assignee = personName;
  const foundMaster = appState.crewMaster.find(cm => cm.name === personName);
  if (foundMaster && foundMaster.defaultFee >= 0) job.crew[roleIdx].fee = foundMaster.defaultFee;
  saveState();
  renderCrewSection();
}

function updateCrewFee(roleIdx, val) {
  const job = appState.bookings.find(b => b.id === appState.selectedCrewJobId);
  if (job) { job.crew[roleIdx].fee = Number(val) || 0; saveState(); renderCrewSection(); }
}

function addExtraRoleToCurrentJob() {
  const input = document.getElementById('job-extra-role-input');
  const roleName = input.value.trim();
  const job = appState.bookings.find(b => b.id === appState.selectedCrewJobId);
  if (roleName && job) {
    job.crew.push({ role: roleName, assignee: 'Kosong', fee: 300000 });
    input.value = '';
    saveState();
    renderCrewSection();
  }
}

function removeCrewRoleFromJob(idx) {
  const job = appState.bookings.find(b => b.id === appState.selectedCrewJobId);
  if (job) { job.crew.splice(idx, 1); saveState(); renderCrewSection(); }
}

function updateCrewVenue(val) {
  const job = appState.bookings.find(b => b.id === appState.selectedCrewJobId);
  if (job) { job.venue = val; saveState(); updateSharelocPreviewText(job); }
}

function updateCrewTime(val) {
  const job = appState.bookings.find(b => b.id === appState.selectedCrewJobId);
  if (job) { job.gatherTime = val; saveState(); updateSharelocPreviewText(job); }
}

function updateCrewCardCode(val) {
  const job = appState.bookings.find(b => b.id === appState.selectedCrewJobId);
  if (job) { job.memoryCardCode = val; saveState(); updateSharelocPreviewText(job); }
}

function updateSharelocPreviewText(job) {
  const crewLines = job.crew.map(c => `• ${c.role}: ${c.assignee}`).join('\n');
  document.getElementById('shareloc-preview-text').textContent =
    `📍 Lokasi: ${job.venue}\n⏰ Standby: ${job.gatherTime} (${job.day} ${job.month})\n📦 Paket: ${job.serviceType}\n💾 Media: ${job.memoryCardCode}\n🔗 Maps: ${job.mapsUrl}\n\nTim Bertugas:\n${crewLines}`;
}

function sendSharelocToAllCrew() {
  const job = appState.bookings.find(b => b.id === appState.selectedCrewJobId);
  if (!job) return;
  const crewLines = job.crew.map(c => `• ${c.role}: *${c.assignee}* (${formatRupiah(c.fee)})`).join('\n');
  copyTextToClipboard(`*BRIEFING & SHARELOC KRU — ${appState.studioProfile.brandName}*\nKlien: *${job.couple}*\nPaket: ${job.serviceType}\nJadwal: ${job.day} ${job.month} (Standby ${job.gatherTime})\nLokasi: *${job.venue}*\nMaps: ${job.mapsUrl}\nMedia: *${job.memoryCardCode}*\n\n*Tim Bertugas:*\n${crewLines}`, 'Shareloc Kru Disalin!');
}

// ==================== MENU 5: GEAR & MEMORY CARD ====================
function renderGearSection() {
  const mcGrid = document.getElementById('memory-card-grid');
  if (mcGrid) {
    mcGrid.innerHTML = appState.memoryCards.map((mc, idx) => {
      const warn = mc.status.includes('Belum');
      return `
        <div onclick="cycleMemoryCardStatus(${idx})" class="cursor-pointer bg-cream rounded-2xl border border-[#DEC9B5] p-4 space-y-2">
          <div class="flex items-center justify-between gap-2">
            <span class="font-mono text-xs font-bold text-espresso">${mc.code}</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${warn ? 'bg-dangerLight text-danger' : 'bg-sageLight text-sage'}">${mc.status}</span>
          </div>
          <p class="text-xs font-bold text-espresso">${mc.jobName}</p>
          <p class="text-[11px] text-espressoMuted font-mono">${mc.hddLocation}</p>
        </div>
      `;
    }).join('');
  }

  const grid = document.getElementById('gear-grid');
  if (grid) {
    grid.innerHTML = appState.gearList.map((g, idx) => `
      <div onclick="cycleGearStatus(${idx})" class="cursor-pointer bg-white rounded-2xl border border-[#E6D5C3] p-4 shadow-warm flex items-center justify-between gap-3">
        <div>
          <h4 class="font-bold text-xs sm:text-sm text-espresso">${g.name}</h4>
          <p class="text-[11px] text-espressoMuted">Lokasi: ${g.holder}</p>
          <span class="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${g.status === 'Tersedia di Studio' ? 'bg-sageLight text-sage' : 'bg-amberLight text-amberWarn'}">${g.status}</span>
        </div>
        <i class="ph-bold ph-arrows-clockwise text-espressoMuted"></i>
      </div>
    `).join('');
  }
}

function cycleMemoryCardStatus(idx) {
  const order = ['Belum Backup - JANGAN FORMAT!', 'Sudah Backup ke HDD FILEPHOTOKU.STD', 'Aman - Siap Format Ulang'];
  appState.memoryCards[idx].status = order[(order.indexOf(appState.memoryCards[idx].status) + 1) % order.length];
  saveState();
  renderGearSection();
}

function cycleGearStatus(idx) {
  const order = ['Tersedia di Studio', 'Dibawa Liputan', 'Perlu Cek'];
  appState.gearList[idx].status = order[(order.indexOf(appState.gearList[idx].status) + 1) % order.length];
  saveState();
  renderGearSection();
}

function returnAllGear() {
  appState.gearList.forEach(g => { g.status = 'Tersedia di Studio'; });
  saveState();
  renderGearSection();
  showToast('Semua Alat Kembali ke Studio!');
}

// ==================== MENU 6: SORTIR FOTO ====================
function renderPhotoSortSection() {
  const selectedPhotos = appState.photos.filter(p => p.selected);
  document.getElementById('selected-photo-count').textContent = selectedPhotos.length;
  document.getElementById('selected-photo-pills').textContent = selectedPhotos.length ? selectedPhotos.map(p => p.code).join(', ') : 'Belum ada file dipilih';

  const list = appState.photoSortFilter === 'selected' ? selectedPhotos : appState.photos;
  const grid = document.getElementById('photo-sort-grid');
  if (!grid) return;

  grid.innerHTML = list.map(p => `
    <div class="rounded-2xl overflow-hidden border-2 ${p.selected ? 'border-terracotta bg-[#FDF8F3]' : 'border-[#E6D5C3] bg-white'}">
      <div onclick="togglePhotoSelection('${p.code}')" class="relative h-40 bg-beige cursor-pointer">
        <img src="${p.img}" alt="${p.title}" class="w-full h-full object-cover" />
        <span class="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 text-white font-mono text-xs font-bold">${p.code}</span>
      </div>
      <div class="p-3 space-y-1.5">
        <p class="text-xs font-bold text-espresso truncate">${p.title}</p>
        <input type="text" value="${p.note || ''}" onchange="updatePhotoNote('${p.code}', this.value)" class="w-full px-2 py-1 rounded bg-cream border border-[#DEC9B5] text-[11px]" />
      </div>
    </div>
  `).join('');
}

function togglePhotoSelection(code) {
  const p = appState.photos.find(x => x.code === code);
  if (p) { p.selected = !p.selected; saveState(); renderPhotoSortSection(); }
}

function updatePhotoNote(code, val) {
  const p = appState.photos.find(x => x.code === code);
  if (p) { p.note = val; saveState(); }
}

function setPhotoSortFilter(mode) {
  appState.photoSortFilter = mode;
  saveState();
  renderPhotoSortSection();
}

function copySelectedPhotoCodes() {
  const selected = appState.photos.filter(p => p.selected);
  copyTextToClipboard(selected.map(p => p.code).join(', '), 'Kode File Disalin ke Lightroom!');
}

// ==================== MENU 7: HALAMAN KLIEN, KATALOG PRICELIST & BOOKING ====================
function renderWebsiteAndVendors() {
  const prof = appState.studioProfile;
  const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setTxt('pub-mockup-city', `⭐ 4.9 • ${prof.city}`);
  setTxt('pub-mockup-tagline', prof.tagline);

  const mainServices = appState.serviceCategories.filter(c => !c.startsWith('Add-On'));
  const btnContainer = document.getElementById('pub-service-buttons');
  if (btnContainer) {
    btnContainer.innerHTML = mainServices.map(srv => {
      const active = appState.selectedPublicService === srv;
      return `<button onclick="selectPublicService('${srv}')" class="p-2.5 rounded-xl border-2 text-xs ${active ? 'border-terracotta bg-cream text-espresso font-bold' : 'border-[#E6D5C3] text-espressoMuted font-semibold'}">📸 ${srv}</button>`;
    }).join('');
  }

  const matchingPkgs = appState.pricelist.filter(p => p.category === appState.selectedPublicService);
  const listToShow = matchingPkgs.length > 0 ? matchingPkgs : appState.pricelist;

  const pkgSelect = document.getElementById('pub-package-select');
  if (pkgSelect) {
    pkgSelect.innerHTML = listToShow.map(p => `<option value="${p.id}">${p.name} — ${formatRupiah(p.price)}</option>`).join('');
  }

  // Render Katalog Pricelist Lengkap untuk Konsumen
  const catalogEl = document.getElementById('public-catalog-cards');
  if (catalogEl) {
    catalogEl.innerHTML = listToShow.map(p => `
      <div class="p-4 rounded-2xl bg-cream border border-[#DEC9B5] flex flex-col justify-between gap-3">
        <div>
          <div class="flex items-center justify-between gap-2">
            <span class="px-2.5 py-0.5 rounded-full bg-beige text-terracotta text-[10px] font-bold uppercase">${p.category}</span>
            <span class="font-mono text-sm font-bold text-terracotta">${formatRupiah(p.price)}</span>
          </div>
          <h4 class="font-bold text-sm text-espresso mt-2">${p.name}</h4>
          <p class="text-xs text-espressoMuted mt-1 leading-relaxed">${p.desc || ''}</p>
        </div>
        <button onclick="chooseCatalogPackage('${p.id}')" class="w-full py-2 rounded-xl bg-white hover:bg-terracotta hover:text-white border border-[#DEC9B5] text-espresso text-xs font-bold transition">
          Pilih Paket Ini →
        </button>
      </div>
    `).join('');
  }

  const vendorEl = document.getElementById('vendor-ecosystem-list');
  if (vendorEl) {
    vendorEl.innerHTML = appState.vendors.map((v, idx) => `
      <label class="cursor-pointer p-3.5 rounded-2xl border-2 ${v.checkedInBundle ? 'border-terracotta bg-cream' : 'border-[#E6D5C3] bg-white'} flex items-center justify-between gap-2">
        <div class="flex items-center gap-2.5 min-w-0">
          <input type="checkbox" ${v.checkedInBundle ? 'checked' : ''} onchange="toggleVendorBundle(${idx})" class="w-4 h-4 accent-[#9E5231] rounded shrink-0" />
          <div class="min-w-0">
            <span class="text-[10px] font-bold uppercase text-terracotta">${v.role}</span>
            <h4 class="font-bold text-xs text-espresso truncate">${v.name}</h4>
          </div>
        </div>
        <span class="font-mono text-xs font-bold text-espresso shrink-0">${formatRupiah(v.fee)}</span>
      </label>
    `).join('');
  }

  const activeVendors = appState.vendors.filter(v => v.checkedInBundle);
  const bundleSum = activeVendors.reduce((acc, v) => acc + Number(v.fee || 0), 0);
  setTxt('bundle-total-price', formatRupiah(bundleSum));
  setTxt('bundle-selected-count', `${activeVendors.length} Layanan Tergabung`);
}

function selectPublicService(srvName) {
  appState.selectedPublicService = srvName;
  saveState();
  renderWebsiteAndVendors();
}

function chooseCatalogPackage(pkgId) {
  const pkgSelect = document.getElementById('pub-package-select');
  if (pkgSelect) pkgSelect.value = pkgId;
  document.getElementById('pub-client-name').focus();
  showToast('Paket Dipilih', 'Silakan lengkapi nama dan tanggal acara pada formulir booking.');
}

function submitPublicBooking() {
  const name = document.getElementById('pub-client-name').value.trim();
  const day = Number(document.getElementById('pub-client-day').value) || 28;
  const venue = document.getElementById('pub-client-venue').value.trim() || 'Banyuwangi';
  const pkgId = document.getElementById('pub-package-select').value;
  const chosenPkg = appState.pricelist.find(p => p.id === pkgId) || appState.pricelist[0];

  if (!name) return showToast('Nama Belum Diisi', 'Mohon isi nama Anda terlebih dahulu.');

  const price = chosenPkg ? chosenPkg.price : 1490000;
  const dp30 = Math.round((price * 0.3) / 1000) * 1000;
  const pkgName = chosenPkg ? chosenPkg.name : appState.selectedPublicService;

  const newId = `FP-JOB-0${appState.bookings.length + 1}`;
  appState.bookings.unshift({
    id: newId,
    couple: name,
    day: Math.min(31, Math.max(1, day)),
    month: 'Okt 2026',
    dueDate: `${day} Okt 2026`,
    category: appState.selectedPublicService,
    serviceType: pkgName,
    venue,
    mapsUrl: 'https://maps.google.com/?q=' + encodeURIComponent(venue),
    gatherTime: '07.00 WIB',
    driveUrl: `https://drive.google.com/drive/folders/filephotoku-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    stage: 1,
    fileStage: 1,
    memoryCardCode: 'Card #A1',
    totalPrice: price,
    dpPaid: dp30,
    isOverdue: false,
    items: [{ name: pkgName, price, checked: true }],
    crew: [{ role: 'Fotografer Utama (FILEPHOTOKU.STD)', assignee: 'Kamu (Owner FILEPHOTOKU.STD)', fee: 0 }]
  });

  document.getElementById('pub-client-name').value = '';
  document.getElementById('pub-client-day').value = '';
  document.getElementById('pub-client-venue').value = '';
  saveState();
  renderAll();

  const waText = encodeURIComponent(`Halo Admin *FILEPHOTOKU.STD*, saya ingin booking dokumentasi:\n\n• Nama: *${name}*\n• Paket: *${pkgName}* (${formatRupiah(price)})\n• Tanggal: *${day} Oktober 2026*\n• Lokasi: *${venue}*\n• Estimasi DP 30%: *${formatRupiah(dp30)}*\n\nMohon info ketersediaan slotnya Kak, terima kasih!`);
  window.open(`https://wa.me/6285708001457?text=${waText}`, '_blank');
}

function toggleVendorBundle(idx) {
  appState.vendors[idx].checkedInBundle = !appState.vendors[idx].checkedInBundle;
  saveState();
  renderWebsiteAndVendors();
}

function copyBundleProposal() {
  const selected = appState.vendors.filter(v => v.checkedInBundle);
  const total = selected.reduce((acc, v) => acc + v.fee, 0);
  const list = selected.map(v => `• ${v.role} (${v.name}): ${formatRupiah(v.fee)}`).join('\n');
  copyTextToClipboard(`*SIMULASI PAKET BUNDLING — ${appState.studioProfile.brandName}*\n\n${list}\n\n*Total: ${formatRupiah(total)}*`, 'Simulasi Bundling Disalin!');
}

// ==================== PENCARIAN & MODAL BOOKING BARU ====================
function handleGlobalSearch(query) {
  const box = document.getElementById('global-search-results');
  const q = (query || '').trim().toLowerCase();
  if (!q) { box.classList.add('hidden'); return; }

  const matched = appState.bookings.filter(b => b.couple.toLowerCase().includes(q) || b.serviceType.toLowerCase().includes(q));
  if (!matched.length) {
    box.innerHTML = `<p class="text-xs text-espressoMuted p-2">Tidak ditemukan hasil untuk "${query}".</p>`;
  } else {
    box.innerHTML = matched.map(b => `
      <div onclick="jumpToInvoice('${b.id}'); document.getElementById('global-search-results').classList.add('hidden');" class="p-2.5 rounded-xl hover:bg-cream cursor-pointer flex justify-between items-center text-xs">
        <div><strong>${b.couple}</strong> (${b.day} ${b.month})<div class="text-[10px] text-espressoMuted">${b.serviceType}</div></div>
        <span class="font-mono font-bold text-terracotta">${formatRupiah(b.totalPrice)}</span>
      </div>
    `).join('');
  }
  box.classList.remove('hidden');
}

function quickSearchDemo() {
  const input = document.getElementById('global-search');
  input.value = 'Diajeng';
  handleGlobalSearch('Diajeng');
}

function openNewBookingModal(prefillDay = 28) {
  document.getElementById('modal-day-input').value = prefillDay;
  const catSel = document.getElementById('modal-category-input');
  catSel.innerHTML = appState.serviceCategories.filter(c => !c.startsWith('Add-On')).map(c => `<option value="${c}">${c}</option>`).join('');
  filterModalPackagesByCategory();
  document.getElementById('modal-new-booking').classList.remove('hidden');
}

function filterModalPackagesByCategory() {
  const chosenCat = document.getElementById('modal-category-input').value;
  const pkgSel = document.getElementById('modal-package-select');
  const filtered = appState.pricelist.filter(p => p.category === chosenCat);
  pkgSel.innerHTML = (filtered.length ? filtered : appState.pricelist).map(p => `<option value="${p.id}">${p.name} — ${formatRupiah(p.price)}</option>`).join('');
  applySelectedPackageToModal();
}

function applySelectedPackageToModal() {
  const found = appState.pricelist.find(p => p.id === document.getElementById('modal-package-select').value);
  if (found) {
    document.getElementById('modal-price-input').value = found.price;
    document.getElementById('modal-dp-input').value = Math.round((found.price * 0.3) / 1000) * 1000;
  }
}

function autoCalcModalDP() {
  const price = Number(document.getElementById('modal-price-input').value) || 0;
  document.getElementById('modal-dp-input').value = Math.round((price * 0.3) / 1000) * 1000;
}

function closeNewBookingModal() { document.getElementById('modal-new-booking').classList.add('hidden'); }

function saveNewBooking() {
  const couple = document.getElementById('modal-couple-input').value.trim();
  if (!couple) return showToast('Nama Klien Kosong');
  const day = Number(document.getElementById('modal-day-input').value) || 28;
  const category = document.getElementById('modal-category-input').value;
  const chosenPkg = appState.pricelist.find(p => p.id === document.getElementById('modal-package-select').value);
  const serviceName = chosenPkg ? chosenPkg.name : category;
  const venue = document.getElementById('modal-venue-input').value.trim() || 'Banyuwangi';
  const price = Number(document.getElementById('modal-price-input').value) || 1490000;
  const dp = Number(document.getElementById('modal-dp-input').value) || 450000;

  appState.bookings.unshift({
    id: `FP-JOB-0${appState.bookings.length + 1}`,
    couple,
    day,
    month: 'Okt 2026',
    dueDate: `${day} Okt 2026`,
    category,
    serviceType: serviceName,
    venue,
    mapsUrl: 'https://maps.google.com/?q=' + encodeURIComponent(venue),
    gatherTime: '06.30 WIB',
    driveUrl: document.getElementById('modal-drive-input').value.trim() || `https://drive.google.com/drive/folders/filephotoku-${couple.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    stage: 1,
    fileStage: 1,
    memoryCardCode: 'Card #A1',
    totalPrice: price,
    dpPaid: dp,
    isOverdue: false,
    items: [{ name: serviceName, price, checked: true }],
    crew: [{ role: 'Fotografer Utama (FILEPHOTOKU.STD)', assignee: 'Kamu (Owner FILEPHOTOKU.STD)', fee: 0 }]
  });

  closeNewBookingModal();
  saveState();
  renderAll();
  switchTab('booking');
  showToast('Booking Tersimpan!', couple);
}

function openResetModal() { document.getElementById('modal-reset').classList.remove('hidden'); }
function closeResetModal() { document.getElementById('modal-reset').classList.add('hidden'); }
function confirmResetAllData() {
  localStorage.removeItem(STORAGE_KEY);
  appState = JSON.parse(JSON.stringify(DEFAULT_STATE));
  appState.isUnlocked = true;
  saveState();
  closeResetModal();
  renderAll();
  showToast('Data Direset ke Default!');
}

function renderAll() {
  renderSetupMaster();
  calculateFinancialSummary();
  renderDashboardFileTracker();
  renderMiniOctoberCalendar();
  renderBookingCategoryChips();
  renderBookingsList();
  renderFullOctoberCalendar();
  renderInvoiceSection();
  renderCrewSection();
  renderGearSection();
  renderPhotoSortSection();
  renderWebsiteAndVendors();
}

window.onload = function () {
  renderAll();
  syncFromCloud();
  setInterval(syncFromCloud, 15000);
  // Otomatis tarik booking terbaru dari Cloud saat dibuka!
  // Jika Owner sudah pernah login di iPhone ini, langsung buka Dashboard Admin.
  // Jika Konsumen yang membuka link, langsung tampilkan Katalog & Booking tanpa pop-up login!
  if (appState.isUnlocked) {
    document.body.classList.remove('public-client-mode');
    switchTab(appState.activeTab || 'dashboard');
  } else {
    document.body.classList.add('public-client-mode');
    switchTab('website');
  }
  switchSetupSubTab(appState.setupSubTab || 'pricelist');
  setBookingView(appState.bookingView || 'list');
};