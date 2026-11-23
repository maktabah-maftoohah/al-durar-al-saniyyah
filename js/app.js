/**
 * Maktabah Maftoohah — Al-Durar al-Saniyyah Reader Application
 * Zero-Build Vanilla ES6 Architecture
 */

class DurarReader {
  constructor() {
    this.data = null;
    this.currentLang = 'ms';
    this.currentVolume = 0; // 0 = all
    this.currentView = 'treatises'; // 'treatises' | 'volumes'
    this.searchQuery = '';
    this.arabicFontSize = 1.65; // rem

    // DOM Elements
    this.contentView = document.getElementById('contentView');
    this.volumeScroll = document.getElementById('volumeScroll');
    this.searchInput = document.getElementById('searchInput');
    this.searchClear = document.getElementById('searchClear');
    this.langToggle = document.getElementById('langToggle');
    this.themeToggle = document.getElementById('themeToggle');
    this.viewTreatisesBtn = document.getElementById('viewTreatisesBtn');
    this.viewVolumesBtn = document.getElementById('viewVolumesBtn');
    this.fontDecBtn = document.getElementById('fontDecBtn');
    this.fontResetBtn = document.getElementById('fontResetBtn');
    this.fontIncBtn = document.getElementById('fontIncBtn');
  }

  async init() {
    this.parseUrlParams();
    this.setupTheme();
    this.setupEventListeners();
    this.registerServiceWorker();

    try {
      const response = await fetch('./data/collection.json');
      if (!response.ok) {
        throw new Error(`Failed to load collection data: ${response.status}`);
      }
      this.data = await response.json();
      this.renderVolumeChips();
      this.render();
    } catch (err) {
      console.error('Error loading Al-Durar data:', err);
      if (this.contentView) {
        this.contentView.innerHTML = `
          <div class="empty-state">
            <h3>Ralat Memuatkan Kandungan</h3>
            <p>Tidak dapat memuatkan pangkalan data. Sila muat semula halaman.</p>
          </div>
        `;
      }
    }
  }

  parseUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const lang = params.get('lang');
    if (lang && ['ms', 'en', 'ar'].includes(lang.toLowerCase())) {
      this.currentLang = lang.toLowerCase();
    }
    const vol = parseInt(params.get('vol'), 10);
    if (!isNaN(vol) && vol >= 0 && vol <= 16) {
      this.currentVolume = vol;
    }
    const q = params.get('q');
    if (q) {
      this.searchQuery = q.trim();
      if (this.searchInput) this.searchInput.value = this.searchQuery;
    }
    const view = params.get('view');
    if (view && ['treatises', 'volumes'].includes(view.toLowerCase())) {
      this.currentView = view.toLowerCase();
    }
  }

  updateUrlParams() {
    const params = new URLSearchParams();
    if (this.currentLang !== 'ms') params.set('lang', this.currentLang);
    if (this.currentVolume > 0) params.set('vol', this.currentVolume);
    if (this.searchQuery) params.set('q', this.searchQuery);
    if (this.currentView !== 'treatises') params.set('view', this.currentView);

    const queryString = params.toString();
    const newUrl = window.location.pathname + (queryString ? '?' + queryString : '') + window.location.hash;
    window.history.replaceState({}, '', newUrl);
  }

  setupTheme() {
    const savedTheme = localStorage.getItem('durar_theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;

    document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
    if (this.themeToggle) {
      this.themeToggle.textContent = isDark ? '☀️' : '🌙';
    }

    const savedFontSize = localStorage.getItem('durar_arabic_size');
    if (savedFontSize) {
      this.arabicFontSize = parseFloat(savedFontSize);
      document.documentElement.style.setProperty('--arabic-size', `${this.arabicFontSize}rem`);
    }
  }

  setupEventListeners() {
    // Theme toggle
    if (this.themeToggle) {
      this.themeToggle.addEventListener('click', () => {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        const newTheme = isDark ? 'light' : 'dark';
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('durar_theme', newTheme);
        this.themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
      });
    }

    // Language toggle: cycle ms -> en -> ar -> ms
    if (this.langToggle) {
      this.langToggle.addEventListener('click', () => {
        if (this.currentLang === 'ms') this.currentLang = 'en';
        else if (this.currentLang === 'en') this.currentLang = 'ar';
        else this.currentLang = 'ms';

        this.langToggle.textContent = this.currentLang.toUpperCase();
        this.updateUrlParams();
        this.renderVolumeChips();
        this.render();
      });
    }

    // View mode buttons
    if (this.viewTreatisesBtn) {
      this.viewTreatisesBtn.addEventListener('click', () => {
        this.currentView = 'treatises';
        this.updateUrlParams();
        this.updateViewButtons();
        this.render();
      });
    }
    if (this.viewVolumesBtn) {
      this.viewVolumesBtn.addEventListener('click', () => {
        this.currentView = 'volumes';
        this.updateUrlParams();
        this.updateViewButtons();
        this.render();
      });
    }

    // Font size controls
    if (this.fontIncBtn) {
      this.fontIncBtn.addEventListener('click', () => {
        if (this.arabicFontSize < 2.5) {
          this.arabicFontSize += 0.15;
          this.applyFontSize();
        }
      });
    }
    if (this.fontDecBtn) {
      this.fontDecBtn.addEventListener('click', () => {
        if (this.arabicFontSize > 1.2) {
          this.arabicFontSize -= 0.15;
          this.applyFontSize();
        }
      });
    }
    if (this.fontResetBtn) {
      this.fontResetBtn.addEventListener('click', () => {
        this.arabicFontSize = 1.65;
        this.applyFontSize();
      });
    }

    // Search input
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim();
        if (this.searchClear) {
          this.searchClear.style.display = this.searchQuery ? 'block' : 'none';
        }
        this.updateUrlParams();
        this.render();
      });
    }

    if (this.searchClear) {
      this.searchClear.addEventListener('click', () => {
        this.searchQuery = '';
        if (this.searchInput) this.searchInput.value = '';
        this.searchClear.style.display = 'none';
        this.updateUrlParams();
        this.render();
      });
    }
  }

  applyFontSize() {
    document.documentElement.style.setProperty('--arabic-size', `${this.arabicFontSize.toFixed(2)}rem`);
    localStorage.setItem('durar_arabic_size', this.arabicFontSize.toString());
  }

  updateViewButtons() {
    if (this.viewTreatisesBtn && this.viewVolumesBtn) {
      this.viewTreatisesBtn.classList.toggle('active', this.currentView === 'treatises');
      this.viewVolumesBtn.classList.toggle('active', this.currentView === 'volumes');
    }
  }

  renderVolumeChips() {
    if (!this.volumeScroll || !this.data) return;

    const allLabel = this.currentLang === 'ar' ? 'جميع المجلدات (١٦)' : (this.currentLang === 'en' ? 'All 16 Volumes' : 'Semua 16 Jilid');
    let html = `
      <button class="vol-chip ${this.currentVolume === 0 ? 'active' : ''}" data-vol="0">
        ${allLabel}
      </button>
    `;

    for (let i = 1; i <= 16; i++) {
      const volNumLabel = this.currentLang === 'ar' ? `المجلد ${i}` : (this.currentLang === 'en' ? `Vol ${i}` : `Jilid ${i}`);
      html += `
        <button class="vol-chip ${this.currentVolume === i ? 'active' : ''}" data-vol="${i}">
          ${volNumLabel}
        </button>
      `;
    }

    this.volumeScroll.innerHTML = html;

    this.volumeScroll.querySelectorAll('.vol-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.currentVolume = parseInt(btn.getAttribute('data-vol'), 10);
        this.updateUrlParams();
        this.renderVolumeChips();
        this.render();
      });
    });
  }

  render() {
    this.updateViewButtons();
    if (!this.contentView || !this.data) return;

    if (this.currentView === 'volumes') {
      this.renderVolumesView();
    } else {
      this.renderTreatisesView();
    }
  }

  renderVolumesView() {
    const volumes = this.data.volumes || [];
    const query = this.searchQuery.toLowerCase();

    const filtered = volumes.filter((vol) => {
      if (this.currentVolume > 0 && vol.volume !== this.currentVolume) return false;
      if (!query) return true;
      const hay = [
        vol.title_ar,
        vol.title_ms,
        vol.title_en,
        vol.topics_ar,
        vol.topics_ms,
        vol.topics_en,
        (vol.key_scholars || []).join(' ')
      ].join(' ').toLowerCase();
      return hay.includes(query);
    });

    if (filtered.length === 0) {
      this.contentView.innerHTML = `
        <div class="empty-state">
          <h3>Tiada Jilid Ditemui</h3>
          <p>Tiada padanan bagi carian "${this.escapeHtml(this.searchQuery)}".</p>
        </div>
      `;
      return;
    }

    let html = '<div class="volumes-grid">';
    for (const v of filtered) {
      const titleTrans = this.currentLang === 'en' ? v.title_en : v.title_ms;
      const topicsTrans = this.currentLang === 'en' ? v.topics_en : (this.currentLang === 'ar' ? v.topics_ar : v.topics_ms);
      const scholars = (v.key_scholars || []).map(s => `<span class="badge-tag">${this.escapeHtml(s)}</span>`).join(' ');

      html += `
        <div class="volume-card" data-vol="${v.volume}">
          <div class="vol-header">
            <span class="vol-number">${this.currentLang === 'ar' ? `المجلد ${v.volume}` : `Jilid ${v.volume}`}</span>
          </div>
          <h3 class="vol-card-title-ar" dir="rtl">${v.title_ar}</h3>
          <h4 class="vol-card-title">${this.escapeHtml(titleTrans)}</h4>
          <p class="vol-card-topics">${this.escapeHtml(topicsTrans)}</p>
          <div style="margin-top:0.75rem; display:flex; flex-wrap:wrap; gap:0.35rem;">
            ${scholars}
          </div>
        </div>
      `;
    }
    html += '</div>';

    this.contentView.innerHTML = html;

    // Click volume card to switch to its treatises
    this.contentView.querySelectorAll('.volume-card').forEach((card) => {
      card.addEventListener('click', () => {
        const vol = parseInt(card.getAttribute('data-vol'), 10);
        this.currentVolume = vol;
        this.currentView = 'treatises';
        this.updateUrlParams();
        this.renderVolumeChips();
        this.render();
      });
    });
  }

  renderTreatisesView() {
    const treatises = this.data.treatises || [];
    const query = this.searchQuery.toLowerCase();

    const filtered = treatises.filter((t) => {
      if (this.currentVolume > 0 && t.volume !== this.currentVolume) return false;
      if (!query) return true;
      const sectionText = (t.sections || []).map(s => `${s.heading_ar} ${s.heading_ms} ${s.heading_en} ${s.arabic} ${s.translation_ms} ${s.translation_en}`).join(' ');
      const hay = [
        t.title_ar,
        t.title_ms,
        t.title_en,
        t.author_ar,
        t.author_ms,
        t.author_en,
        t.summary_ms,
        t.summary_en,
        sectionText
      ].join(' ').toLowerCase();
      return hay.includes(query);
    });

    if (filtered.length === 0) {
      const volTitle = this.currentVolume > 0 ? `di dalam Jilid ${this.currentVolume}` : '';
      this.contentView.innerHTML = `
        <div class="empty-state">
          <h3>Tiada Risalah Ditemui ${volTitle}</h3>
          <p>${this.searchQuery ? `Tiada padanan bagi carian "${this.escapeHtml(this.searchQuery)}".` : 'Risalah bagi jilid ini sedang dalam proses kemasukan data komprehensif.'}</p>
          <button class="btn-pill" id="viewAllVolumesBtn" style="margin-top:1rem;">Lihat Katalog 16 Jilid</button>
        </div>
      `;
      const btn = document.getElementById('viewAllVolumesBtn');
      if (btn) {
        btn.addEventListener('click', () => {
          this.currentView = 'volumes';
          this.currentVolume = 0;
          this.updateUrlParams();
          this.renderVolumeChips();
          this.render();
        });
      }
      return;
    }

    let html = '<div class="treatises-list">';
    for (const t of filtered) {
      const titleTrans = this.currentLang === 'en' ? t.title_en : t.title_ms;
      const authorTrans = this.currentLang === 'en' ? t.author_en : (this.currentLang === 'ar' ? t.author_ar : t.author_ms);
      const summaryTrans = this.currentLang === 'en' ? t.summary_en : (this.currentLang === 'ar' ? '' : t.summary_ms);

      html += `
        <article class="treatise-card" id="${t.id}">
          <header class="treatise-header">
            <div class="treatise-meta-top">
              <span class="vol-badge">${this.currentLang === 'ar' ? `المجلد ${t.volume}` : `Jilid ${t.volume}`}</span>
              <span class="author-badge">✍️ ${this.escapeHtml(authorTrans)}</span>
            </div>
            <h2 class="treatise-title-ar" dir="rtl">${t.title_ar}</h2>
            <h3 class="treatise-title-trans">${this.escapeHtml(titleTrans)}</h3>
            ${summaryTrans ? `<p class="treatise-summary">${this.escapeHtml(summaryTrans)}</p>` : ''}
          </header>

          <div class="treatise-sections">
      `;

      for (const s of (t.sections || [])) {
        const secHeadingTrans = this.currentLang === 'en' ? s.heading_en : s.heading_ms;
        const translationText = this.currentLang === 'en' ? s.translation_en : s.translation_ms;

        html += `
          <div class="treatise-section">
            ${s.heading_ar ? `<h4 class="section-heading-ar" dir="rtl">${s.heading_ar}</h4>` : ''}
            ${secHeadingTrans && this.currentLang !== 'ar' ? `<h5 class="section-heading-trans">${this.escapeHtml(secHeadingTrans)}</h5>` : ''}
            <div class="arabic-matn" dir="rtl">${s.arabic}</div>
            ${this.currentLang !== 'ar' && translationText ? `
              <div class="translation-box">${this.escapeHtml(translationText)}</div>
            ` : ''}
          </div>
        `;
      }

      html += `
          </div>
        </article>
      `;
    }
    html += '</div>';

    this.contentView.innerHTML = html;
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then((reg) => {
            console.log('Al-Durar ServiceWorker registered with scope:', reg.scope);
          })
          .catch((err) => {
            console.warn('ServiceWorker registration skipped:', err);
          });
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const reader = new DurarReader();
  reader.init();
});