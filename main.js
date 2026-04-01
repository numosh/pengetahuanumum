import { hoaxData } from './data.js';

const escapeHtml = (str) => String(str)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const safeUrl = (url) => {
  try {
    const parsed = new URL(url);
    return (parsed.protocol === 'https:' || parsed.protocol === 'http:') ? url : '#';
  } catch {
    return '#';
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const hoaxFeed = document.getElementById('hoax-feed');
  const searchInput = document.getElementById('hoax-search');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const modal = document.getElementById('hoax-modal');
  const modalBody = document.getElementById('modal-body');
  const closeModal = document.getElementById('close-modal');

  let activeCategory = 'all';
  let searchTerm = '';

  const renderHoaxItems = () => {
    const filteredData = hoaxData
      .filter(item => {
        const matchesCategory = activeCategory === 'all' || item.topic === activeCategory;
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              item.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (filteredData.length === 0) {
      hoaxFeed.innerHTML = '<div class="no-results">Tidak ada hasil ditemukan untuk pencarian Anda.</div>';
      return;
    }

    hoaxFeed.innerHTML = filteredData.map(item => `
      <article class="hoax-card" data-id="${escapeHtml(item.id)}">
        <div class="card-meta">
          <span class="category-tag">${escapeHtml(item.topic)}</span>
          <span class="status-badge status-${escapeHtml(item.status)}">${escapeHtml(item.status.toUpperCase())}</span>
        </div>
        <h3 class="card-title">${escapeHtml(item.title)}</h3>
        <p class="card-excerpt">${escapeHtml(item.excerpt)}</p>
        <div class="card-footer">
          <span class="date">${escapeHtml(formatDate(item.date))}</span>
          <span class="source">Sumber: ${escapeHtml(item.source)}</span>
        </div>
      </article>
    `).join('');

    // Add click events to cards
    document.querySelectorAll('.hoax-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = parseInt(card.dataset.id);
        const item = hoaxData.find(h => h.id === id);
        showModal(item);
      });
    });
  };

  const formatDate = (dateStr) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('id-ID', options);
  };

  const showModal = (item) => {
    modalBody.innerHTML = `
      <div class="modal-header-info">
        <span class="category-tag">${escapeHtml(item.topic)}</span>
        <span class="status-badge status-${escapeHtml(item.status)}">${escapeHtml(item.status.toUpperCase())}</span>
      </div>
      <h2 class="modal-title">${escapeHtml(item.title)}</h2>
      <div class="modal-meta-info">
        <p><strong>Tanggal Verifikasi:</strong> ${escapeHtml(formatDate(item.date))}</p>
        <p><strong>Otoritas Sumber:</strong> ${escapeHtml(item.source)}</p>
      </div>
      <div class="modal-long-content">
        <p>${escapeHtml(item.fullContent)}</p>
      </div>
      <a href="${safeUrl(item.sourceUrl)}" target="_blank" rel="noopener noreferrer" class="source-link">Lihat Bukti Verifikasi &rarr;</a>
    `;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent scroll
  };

  const hideModal = () => {
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
  };

  // Event Listeners
  searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value;
    renderHoaxItems();
  });

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.category;
      renderHoaxItems();
    });
  });

  closeModal.addEventListener('click', hideModal);
  window.addEventListener('click', (e) => {
    if (e.target === modal) hideModal();
  });

  // Page Modals (Tentang Kami & Kontak)
  const openTentang = document.getElementById('open-tentang');
  const openKontak = document.getElementById('open-kontak');
  const tentangModal = document.getElementById('tentang-modal');
  const kontakModal = document.getElementById('kontak-modal');

  const openPageModal = (overlay) => {
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  };

  const closePageModal = (overlay) => {
    overlay.classList.add('hidden');
    document.body.style.overflow = 'auto';
  };

  openTentang.addEventListener('click', (e) => { e.preventDefault(); openPageModal(tentangModal); });
  openKontak.addEventListener('click', (e) => { e.preventDefault(); openPageModal(kontakModal); });

  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.close;
      closePageModal(document.getElementById(targetId));
    });
  });

  [tentangModal, kontakModal].forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closePageModal(overlay);
    });
  });

  // Inject ClaimReview structured data for Google Fact Check indexing
  const injectClaimReviewSchema = (data) => {
    const existing = document.getElementById('claim-review-schema');
    if (existing) existing.remove();
    const schema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Daftar Klarifikasi Hoaks Indonesia — Pengetahuan Umum",
      "description": "Kurasi hoaks harian Indonesia dari sumber terverifikasi: pemerintah, pejabat, kebijakan, kesehatan, sosial, dan pendidikan.",
      "itemListElement": data.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "ClaimReview",
          "url": `https://pengetahuanumum.com/#hoaks-${item.id}`,
          "datePublished": item.date,
          "author": {
            "@type": "Organization",
            "name": "Pengetahuan Umum",
            "url": "https://pengetahuanumum.com"
          },
          "claimReviewed": item.title,
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": "1",
            "bestRating": "5",
            "worstRating": "1",
            "alternateName": item.status === "hoax" ? "Hoaks" : "Valid"
          },
          "itemReviewed": {
            "@type": "Claim",
            "name": item.excerpt,
            "datePublished": item.date,
            "author": { "@type": "Thing", "name": "Tidak diketahui" }
          }
        }
      }))
    };
    const script = document.createElement('script');
    script.id = 'claim-review-schema';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  };

  // Initial Render
  renderHoaxItems();
  injectClaimReviewSchema(hoaxData);

  // Set Last Updated
  const lastUpdatedEl = document.getElementById('last-updated');
  if (lastUpdatedEl) {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    lastUpdatedEl.textContent = `Pembaruan Terakhir: ${now.toLocaleDateString('id-ID', options)} WIB`;
  }
});
