/**
 * Main Application Controller for Drug Design & Synthesis Lab Website
 * Department of Pharmaceutical Sciences and Drug Research, Punjabi University Patiala
 */

document.addEventListener('DOMContentLoaded', function () {
  // Initialize Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Mobile navigation drawer toggle
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // Desktop QSAR Tools Dropdown Toggle on Click
  const qsarDropdownBtn = document.getElementById('qsar-dropdown-btn');
  const qsarDropdownMenu = document.getElementById('qsar-dropdown-menu');
  const qsarChevron = document.getElementById('qsar-dropdown-chevron');

  if (qsarDropdownBtn && qsarDropdownMenu) {
    qsarDropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = qsarDropdownMenu.classList.contains('hidden');
      if (isHidden) {
        qsarDropdownMenu.classList.remove('hidden');
        if (qsarChevron) qsarChevron.classList.add('rotate-180');
      } else {
        qsarDropdownMenu.classList.add('hidden');
        if (qsarChevron) qsarChevron.classList.remove('rotate-180');
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      const container = document.getElementById('qsar-dropdown-container');
      if (container && !container.contains(e.target)) {
        qsarDropdownMenu.classList.add('hidden');
        if (qsarChevron) qsarChevron.classList.remove('rotate-180');
      }
    });
  }

  // Mobile QSAR Tools Accordion Toggle
  const mobileQsarToggle = document.getElementById('mobile-qsar-toggle');
  const mobileQsarSubmenu = document.getElementById('mobile-qsar-submenu');
  const mobileQsarChevron = document.getElementById('mobile-qsar-chevron');

  if (mobileQsarToggle && mobileQsarSubmenu) {
    mobileQsarToggle.addEventListener('click', () => {
      mobileQsarSubmenu.classList.toggle('hidden');
      if (mobileQsarChevron) {
        mobileQsarChevron.classList.toggle('rotate-180');
      }
    });
  }

  // Smooth navigation scrolling for in-page anchors
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElem = document.querySelector(targetId);
      if (targetElem) {
        e.preventDefault();
        targetElem.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Close desktop dropdown if open
        if (qsarDropdownMenu) {
          qsarDropdownMenu.classList.add('hidden');
          if (qsarChevron) qsarChevron.classList.remove('rotate-180');
        }

        // Close mobile drawer if open
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
          mobileMenu.classList.add('hidden');
        }
      }
    });
  });

  // Dynamic Anti-Scraper Email Decoding
  document.querySelectorAll('.email-protect').forEach(el => {
    const user = el.getAttribute('data-user');
    const domain = el.getAttribute('data-domain');
    if (user && domain) {
      const address = `${user}@${domain}`;
      el.href = `mailto:${address}`;
      el.textContent = address;
    }
  });

  // Client-side Contact Form handling with Anti-Bot Security Protections
  const pageLoadedAt = Date.now();
  const contactForm = document.getElementById('lab-contact-form');
  const contactSuccess = document.getElementById('contact-success-msg');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // 1. Anti-Bot Honeypot Trap Check (bots auto-fill all form fields)
      const honeypot = document.getElementById('contact-hp-check')?.value;
      if (honeypot && honeypot.trim() !== '') {
        console.warn('Automated bot submission trapped via honeypot.');
        if (contactSuccess) {
          contactSuccess.textContent = 'Inquiry received.';
          contactSuccess.classList.remove('hidden');
        }
        return;
      }

      // 2. Anti-Bot Rapid Automated Submission Check (bots submit under 1.5 seconds)
      const elapsedMs = Date.now() - pageLoadedAt;
      if (elapsedMs < 1500) {
        console.warn('Rapid automated submission intercepted.');
        alert('Please take a moment to review your message details before submitting.');
        return;
      }

      const name = document.getElementById('contact-name')?.value || '';
      const email = document.getElementById('contact-email')?.value || '';
      const subject = document.getElementById('contact-subject')?.value || 'Academic Inquiry - DDSL';
      const message = document.getElementById('contact-message')?.value || '';

      // Construct mailto link as fallback/default secure client submission
      const mailtoUrl = `mailto:yogita_pharma@pbi.ac.in?cc=drugdesignsynthesislab@gmail.com&subject=${encodeURIComponent(subject + ' - ' + name)}&body=${encodeURIComponent("Sender: " + name + " (" + email + ")\n\nMessage:\n" + message)}`;
      
      if (contactSuccess) {
        contactSuccess.textContent = 'Preparing message for dispatch via your email client...';
        contactSuccess.classList.remove('hidden');
      }
      
      setTimeout(() => {
        window.location.href = mailtoUrl;
      }, 600);
    });
  }

  // Initialize Publications Academic List
  initPublicationsSection();

  // Initialize Google Scholar live bibliometrics
  initScholarMetrics();
});

/**
 * Render Publications Academic Table with Multi-Filter (Search, Year, Scaffold, Type)
 */
function initPublicationsSection() {
  const container = document.getElementById('publications-list');
  const searchInput = document.getElementById('pub-search-input');
  const yearFilter = document.getElementById('pub-year-filter');
  const countBadge = document.getElementById('pub-count-badge');

  if (!container || !window.LAB_PUBLICATIONS) return;

  function renderPubs(pubs) {
    if (countBadge) {
      countBadge.textContent = `${pubs.length} papers`;
    }

    if (pubs.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-12 text-slate-500 font-mono text-xs">
            <div class="space-y-1">
              <i data-lucide="search-x" class="w-8 h-8 mx-auto text-slate-400"></i>
              <div class="font-bold text-slate-700">No matching publications found</div>
              <div class="text-[11px] text-slate-500">Try adjusting your search terms or filter criteria.</div>
            </div>
          </td>
        </tr>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    container.innerHTML = pubs.map((pub, idx) => `
      <tr class="hover:bg-teal-50/40 transition-colors">
        <td class="font-mono text-xs text-slate-400 font-bold py-4">${idx + 1}</td>
        <td class="py-4">
          <div class="font-bold text-slate-900 text-sm font-serif mb-1 leading-snug">
            <a href="${pub.link}" target="_blank" rel="noopener noreferrer" class="hover:text-teal-700 transition-colors">${pub.title}</a>
          </div>
          <div class="text-xs text-slate-600">${pub.authors}</div>
        </td>
        <td class="text-xs text-slate-700 font-medium py-4">
          <div class="font-semibold text-slate-800">${pub.journal || 'Journal Publication'}</div>
        </td>
        <td class="font-mono text-xs font-bold text-slate-900 py-4">${pub.year || 'N/A'}</td>
        <td class="text-right py-4">
          <a href="${pub.link}" target="_blank" rel="noopener noreferrer" 
             class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-teal-100 hover:text-teal-900 text-xs font-semibold text-slate-700 transition-colors">
            <span>Official Link</span>
            <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
          </a>
        </td>
      </tr>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  // Dynamically populate Year Filter options from data
  if (yearFilter && Array.isArray(window.LAB_PUBLICATIONS)) {
    const years = Array.from(new Set(window.LAB_PUBLICATIONS.map(p => p.year).filter(y => y > 0))).sort((a, b) => b - a);
    const prevVal = yearFilter.value;
    yearFilter.innerHTML = '<option value="all">All Years</option>' + years.map(y => `<option value="${y}">${y}</option>`).join('');
    if (prevVal && years.includes(parseInt(prevVal))) {
      yearFilter.value = prevVal;
    }
  }

  renderPubs(window.LAB_PUBLICATIONS);

  function filterPubs() {
    const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const year = (yearFilter ? yearFilter.value : 'all');

    const filtered = window.LAB_PUBLICATIONS.filter(p => {
      const matchQuery = !query || 
        p.title.toLowerCase().includes(query) || 
        (p.journal && p.journal.toLowerCase().includes(query)) || 
        (p.authors && p.authors.toLowerCase().includes(query)) ||
        (p.doi && p.doi.toLowerCase().includes(query));

      const matchYear = year === 'all' || p.year.toString() === year;

      return matchQuery && matchYear;
    });

    renderPubs(filtered);
  }

  if (searchInput) searchInput.addEventListener('input', filterPubs);
  if (yearFilter) yearFilter.addEventListener('change', filterPubs);
}

/**
 * Dynamic Google Scholar Bibliometric Metrics & Yearly Citation Chart Loader
 */
function initScholarMetrics() {
  const statCites = document.getElementById('stat-cites-all');
  if (!statCites) return;

  fetch('data/scholar-metrics.json')
    .then(res => {
      if (!res.ok) throw new Error('Data file unavailable');
      return res.json();
    })
    .then(data => {
      if (!data) return;

      // Update stat highlight cards
      if (data.table) {
        const cAll = document.getElementById('stat-cites-all');
        const cRec = document.getElementById('stat-cites-recent');
        const hAll = document.getElementById('stat-h-all');
        const hRec = document.getElementById('stat-h-recent');
        const iAll = document.getElementById('stat-i10-all');
        const iRec = document.getElementById('stat-i10-recent');

        if (cAll && data.table.citations?.all) cAll.textContent = data.table.citations.all.toLocaleString();
        if (cRec && data.table.citations?.since_recent) cRec.textContent = data.table.citations.since_recent.toLocaleString();
        if (hAll && data.table.h_index?.all) hAll.textContent = data.table.h_index.all;
        if (hRec && data.table.h_index?.since_recent) hRec.textContent = data.table.h_index.since_recent;
        if (iAll && data.table.i10_index?.all) iAll.textContent = data.table.i10_index.all;
        if (iRec && data.table.i10_index?.since_recent) iRec.textContent = data.table.i10_index.since_recent;
      }

      const syncNote = document.getElementById('scholar-sync-note');
      if (syncNote && data.last_updated) {
        syncNote.textContent = `Live synced: ${data.last_updated.split(' ')[0]}`;
      }
    })
    .catch(() => {
      // Quiet fallback: pre-rendered static content remains intact
    });
}

/**
 * ==============================================================================
 * p38α/β-Predict Pre-Publication Academic Access Verification Logic
 * ==============================================================================
 */
function ensureP38ModalExists() {
  if (document.getElementById('p38-access-modal')) return;
  const modalHtml = `
  <div id="p38-access-modal" class="fixed inset-0 z-50 hidden bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="academic-card bg-white max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 border-amber-300 animate-in fade-in duration-200">
      <div class="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <i data-lucide="lock" class="w-5 h-5"></i>
          </div>
          <div>
            <span class="inline-block text-[10px] font-bold font-mono tracking-wider uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 mb-1">
              Pre-Publication Restricted Access
            </span>
            <h3 class="text-lg font-bold text-slate-900 font-serif leading-tight">p38α/β-Predict Standalone (.exe)</h3>
          </div>
        </div>
        <button type="button" onclick="closeP38AccessModal()" class="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>
      <div class="text-xs text-slate-600 space-y-2 leading-relaxed">
        <p>
          This computational model and software (p38-Predict) is currently under peer review and pre-publication embargo. In accordance with university research governance, open public downloads are not available until publication.
        </p>
        <div class="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px] font-medium">
          <strong class="block mb-0.5">Academic Evaluation PIN:</strong>
          Scholars and researchers can obtain an authorized Access PIN by emailing <span class="font-mono font-bold text-amber-950">drugdesignsynthesislab@gmail.com</span> to evaluate this standalone Windows application.
        </div>
      </div>
      <div class="pt-1">
        <a href="mailto:drugdesignsynthesislab@gmail.com?cc=yogita_pharma@pbi.ac.in&subject=Request%20for%20p38-Predict%20Academic%20Access%20PIN&body=Respected%20Prof.%20Yogita%20Bansal%20%2F%20Research%20Group%2C%0A%0AI%20would%20like%20to%20request%20an%20authorized%20Access%20PIN%20to%20download%20and%20evaluate%20the%20p38-Predict%20standalone%20desktop%20executable%20for%20academic%20research%20purposes.%0A%0AName%3A%20%0ADesignation%2FInstitution%3A%20%0AResearch%20Objective%3A%20%0A%0AThank%20you." 
           class="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-slate-200">
          <i data-lucide="mail" class="w-4 h-4 text-teal-700"></i>
          <span>Request Access PIN via Email (drugdesignsynthesislab@gmail.com) &rarr;</span>
        </a>
      </div>
      <form id="p38-pin-form" onsubmit="handleP38PinSubmit(event)" class="space-y-3 pt-2 border-t border-slate-100">
        <label for="p38-pin-input" class="block text-xs font-bold text-slate-800">
          Already have an authorized Access PIN?
        </label>
        <div class="flex gap-2">
          <input type="password" id="p38-pin-input" required placeholder="Enter Access PIN" 
                 class="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-amber-600 focus:bg-white" />
          <button type="submit" id="p38-pin-submit-btn" 
                  class="px-5 py-2 bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors shrink-0">
            <i data-lucide="key" class="w-3.5 h-3.5"></i>
            <span>Unlock &amp; Download</span>
          </button>
        </div>
        <div id="p38-pin-status" class="hidden text-xs font-medium py-2 px-3 rounded-lg"></div>
      </form>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

window.openP38AccessModal = function () {
  ensureP38ModalExists();
  const modal = document.getElementById('p38-access-modal');
  if (modal) {
    modal.classList.remove('hidden');
    const input = document.getElementById('p38-pin-input');
    if (input) {
      input.value = '';
      input.focus();
    }
    const status = document.getElementById('p38-pin-status');
    if (status) {
      status.classList.add('hidden');
      status.textContent = '';
    }
    if (window.lucide) lucide.createIcons();
  }
};

window.closeP38AccessModal = function () {
  const modal = document.getElementById('p38-access-modal');
  if (modal) modal.classList.add('hidden');
};

// Global escape key and backdrop click listener
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    closeP38AccessModal();
    if (window.closePaperStatusModal) closePaperStatusModal();
  }
});

document.addEventListener('click', function (e) {
  const p38Modal = document.getElementById('p38-access-modal');
  if (p38Modal && e.target === p38Modal) {
    closeP38AccessModal();
  }
  const paperModal = document.getElementById('paper-status-modal');
  if (paperModal && e.target === paperModal) {
    if (window.closePaperStatusModal) closePaperStatusModal();
  }
});

function ensurePaperStatusModalExists() {
  if (document.getElementById('paper-status-modal')) return;
  const modalHtml = `
  <div id="paper-status-modal" class="fixed inset-0 z-50 hidden flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-200">
    <div class="academic-card max-w-md w-full bg-white p-6 sm:p-7 rounded-2xl shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <i data-lucide="clock" class="w-5 h-5 text-amber-700"></i>
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900 font-serif">Article Status</h3>
            <span class="text-xs font-mono font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Under Review / In Press</span>
          </div>
        </div>
        <button type="button" onclick="closePaperStatusModal()" class="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <div class="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed border-t border-b border-slate-100 py-3">
        <p class="font-medium text-slate-900">
          The research paper describing the development and validation of NIK-Predict is currently in preparation / under peer review.
        </p>
        <p class="text-xs text-slate-500">
          The official DOI link and direct article access will be updated here as soon as the manuscript is published.
        </p>
      </div>

      <div class="flex items-center justify-end gap-3 pt-1">
        <button type="button" onclick="closePaperStatusModal()" class="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors">
          Understood
        </button>
      </div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

window.openPaperStatusModal = function () {
  ensurePaperStatusModalExists();
  const modal = document.getElementById('paper-status-modal');
  if (modal) {
    modal.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  }
};

window.closePaperStatusModal = function () {
  const modal = document.getElementById('paper-status-modal');
  if (modal) modal.classList.add('hidden');
};

window.handleP38PinSubmit = async function (e) {
  e.preventDefault();
  const pinInput = document.getElementById('p38-pin-input')?.value || '';
  const statusEl = document.getElementById('p38-pin-status');
  const submitBtn = document.getElementById('p38-pin-submit-btn');

  if (!statusEl) return;

  statusEl.className = 'text-xs font-medium py-2 px-3 rounded-lg';

  try {
    const enc = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', enc.encode(pinInput.trim()));
    const key = new Uint8Array(hashBuffer);

    // Encrypted download URL payload (Symmetric stream cipher keyed with SHA-256 of authorized PIN)
    const cipherHex = '01fbc5c9fd3f713dcc6523643e69a5acc54a07954f643d63f19d27cfaefb32431ae6d6d7fd7c3066c36924653867eaad85554da068287a35bb9d27d2acf23a4908eb9ecfbf2b6e3c9b23273f7326dbbdcf4341af79676c28ad';
    const cipherBytes = new Uint8Array(cipherHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    const decrypted = new Uint8Array(cipherBytes.length);

    for (let i = 0; i < cipherBytes.length; i++) {
      decrypted[i] = cipherBytes[i] ^ key[i % key.length];
    }

    const decryptedUrl = new TextDecoder().decode(decrypted);

    if (decryptedUrl.startsWith('https://github.com/YB-439/drugdesignsynthesislab/releases/download/')) {
      statusEl.textContent = '✓ Access PIN Verified! Initiating secure download...';
      statusEl.classList.add('bg-teal-50', 'text-teal-800', 'border', 'border-teal-300');
      statusEl.classList.remove('hidden');

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Downloading...';
      }

      setTimeout(() => {
        window.location.href = decryptedUrl;
        setTimeout(() => {
          closeP38AccessModal();
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i data-lucide="key" class="w-3.5 h-3.5"></i> <span>Unlock &amp; Download</span>';
            if (window.lucide) lucide.createIcons();
          }
        }, 2000);
      }, 600);
    } else {
      statusEl.textContent = '✕ Invalid Access PIN. Please request the authorized code from Prof. Yogita Bansal or Mr. Saurabh Gupta.';
      statusEl.classList.add('bg-rose-50', 'text-rose-800', 'border', 'border-rose-300');
      statusEl.classList.remove('hidden');
    }
  } catch (err) {
    statusEl.textContent = 'Verification error. Please ensure JavaScript is enabled and try again.';
    statusEl.classList.add('bg-rose-50', 'text-rose-800', 'border', 'border-rose-300');
    statusEl.classList.remove('hidden');
  }
};
