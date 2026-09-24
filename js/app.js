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

  // Smooth navigation scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElem = document.querySelector(targetId);
      if (targetElem) {
        e.preventDefault();
        targetElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
          mobileMenu.classList.add('hidden');
        }
      }
    });
  });

  // Initialize Publications Academic List
  initPublicationsSection();
});

/**
 * Render Publications Academic Table
 */
function initPublicationsSection() {
  const container = document.getElementById('publications-list');
  const searchInput = document.getElementById('pub-search-input');
  const scaffoldFilter = document.getElementById('pub-scaffold-filter');

  if (!container || !window.LAB_PUBLICATIONS) return;

  function renderPubs(pubs) {
    if (pubs.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-8 text-slate-500 font-mono text-xs">
            No matching publications found.
          </td>
        </tr>
      `;
      return;
    }

    container.innerHTML = pubs.map((pub, idx) => `
      <tr class="hover:bg-slate-50/80 transition-colors">
        <td class="font-mono text-xs text-slate-400 font-bold">${idx + 1}</td>
        <td>
          <div class="font-bold text-slate-900 text-sm font-serif mb-1">
            <a href="${pub.link}" target="_blank" rel="noopener noreferrer" class="hover:text-sky-800 transition-colors">${pub.title}</a>
          </div>
          <div class="text-xs text-slate-600">${pub.authors}</div>
          <div class="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-100 text-slate-700 border border-slate-200">
            Target / Scaffold: ${pub.scaffold}
          </div>
        </td>
        <td class="text-xs text-slate-700 font-medium">${pub.journal}</td>
        <td class="font-mono text-xs font-bold text-slate-900">${pub.year}</td>
        <td class="text-right">
          <a href="${pub.link}" target="_blank" rel="noopener noreferrer" 
             class="inline-flex items-center gap-1 text-xs font-semibold text-sky-800 hover:text-sky-900 hover:underline">
            View / DOI <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
          </a>
        </td>
      </tr>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  renderPubs(window.LAB_PUBLICATIONS);

  function filterPubs() {
    const query = (searchInput ? searchInput.value : '').toLowerCase();
    const scaffold = (scaffoldFilter ? scaffoldFilter.value : 'all');

    const filtered = window.LAB_PUBLICATIONS.filter(p => {
      const matchQuery = p.title.toLowerCase().includes(query) || p.journal.toLowerCase().includes(query) || p.authors.toLowerCase().includes(query);
      const matchScaffold = scaffold === 'all' || p.scaffold.toLowerCase().includes(scaffold.toLowerCase());
      return matchQuery && matchScaffold;
    });

    renderPubs(filtered);
  }

  if (searchInput) searchInput.addEventListener('input', filterPubs);
  if (scaffoldFilter) scaffoldFilter.addEventListener('change', filterPubs);
}
