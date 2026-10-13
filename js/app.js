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

  // Client-side Contact Form handling
  const contactForm = document.getElementById('lab-contact-form');
  const contactSuccess = document.getElementById('contact-success-msg');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const name = document.getElementById('contact-name')?.value || '';
      const email = document.getElementById('contact-email')?.value || '';
      const subject = document.getElementById('contact-subject')?.value || 'Academic Inquiry - DDSL';
      const message = document.getElementById('contact-message')?.value || '';

      // Construct mailto link as fallback/default secure client submission
      const mailtoUrl = `mailto:yogita_pharma@pbi.ac.in?cc=drugdesignsynthesislab@gmail.com&subject=${encodeURIComponent(subject + ' - ' + name)}&body=${encodeURIComponent("Sender: " + name + " (" + email + ")\n\nMessage:\n" + message)}`;
      
      if (contactSuccess) {
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
  const scaffoldFilter = document.getElementById('pub-scaffold-filter');
  const yearFilter = document.getElementById('pub-year-filter');
  const typeFilter = document.getElementById('pub-type-filter');
  const countBadge = document.getElementById('pub-count-badge');

  if (!container || !window.LAB_PUBLICATIONS) return;

  function renderPubs(pubs) {
    if (countBadge) {
      countBadge.textContent = `${pubs.length} of ${window.LAB_PUBLICATIONS.length} papers`;
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
          <div class="text-xs text-slate-600 mb-1.5">${pub.authors}</div>
          <div class="flex flex-wrap items-center gap-1.5">
            <span class="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-100 text-slate-700 border border-slate-200">
              Scaffold: ${pub.scaffold}
            </span>
            <span class="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded bg-teal-50 text-teal-800 border border-teal-200">
              Target: ${pub.target}
            </span>
            <span class="inline-flex items-center px-2 py-0.5 text-[10px] font-mono text-slate-500">
              DOI: ${pub.doi}
            </span>
          </div>
        </td>
        <td class="text-xs text-slate-700 font-medium py-4">
          <div class="font-semibold text-slate-800">${pub.journal}</div>
          <div class="text-[10px] text-slate-500 mt-0.5">${pub.type || 'Research Article'}</div>
        </td>
        <td class="font-mono text-xs font-bold text-slate-900 py-4">${pub.year}</td>
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

  renderPubs(window.LAB_PUBLICATIONS);

  function filterPubs() {
    const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const scaffold = (scaffoldFilter ? scaffoldFilter.value : 'all');
    const year = (yearFilter ? yearFilter.value : 'all');
    const type = (typeFilter ? typeFilter.value : 'all');

    const filtered = window.LAB_PUBLICATIONS.filter(p => {
      const matchQuery = !query || 
        p.title.toLowerCase().includes(query) || 
        p.journal.toLowerCase().includes(query) || 
        p.authors.toLowerCase().includes(query) ||
        p.target.toLowerCase().includes(query) ||
        p.doi.toLowerCase().includes(query);

      const matchScaffold = scaffold === 'all' || p.scaffold.toLowerCase().includes(scaffold.toLowerCase());
      const matchYear = year === 'all' || p.year.toString() === year;
      const matchType = type === 'all' || (p.type && p.type.toLowerCase().includes(type.toLowerCase()));

      return matchQuery && matchScaffold && matchYear && matchType;
    });

    renderPubs(filtered);
  }

  if (searchInput) searchInput.addEventListener('input', filterPubs);
  if (scaffoldFilter) scaffoldFilter.addEventListener('change', filterPubs);
  if (yearFilter) yearFilter.addEventListener('change', filterPubs);
  if (typeFilter) typeFilter.addEventListener('change', filterPubs);
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
