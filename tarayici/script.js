class CloudStreamBrowser {
    constructor() {
        // --- Yapılandırma ---
        this.repos = [
            { code: 'kraptorcs', name: 'CS-Kraptor', url: 'https://raw.githubusercontent.com/Kraptor123/cs-kraptor/refs/heads/builds/plugins.json', redirectUrl: 'https://kraptor123.github.io/redirect/?r=cloudstreamrepo://raw.githubusercontent.com/Kraptor123/cs-kraptor/refs/heads/master/repo.json' },
            { code: 'cskarma', name: 'CS-Karma', url: 'https://raw.githubusercontent.com/Kraptor123/Cs-Karma/refs/heads/builds/plugins.json', redirectUrl: 'https://kraptor123.github.io/redirect/?r=cloudstreamrepo://raw.githubusercontent.com/Kraptor123/cs-Karma/refs/heads/master/repo.json' },
            { code: 'feroxxcs3', name: 'Feroxx', url: 'https://raw.githubusercontent.com/feroxx/Kekik-cloudstream/builds/plugins.json', redirectUrl: 'https://kraptor123.github.io/redirect/?r=cloudstreamrepo://raw.githubusercontent.com/feroxx/Kekik-cloudstream/refs/heads/builds/repo.json' },
            { code: 'sarapcanagii', name: 'SarapcanAgii', url: 'https://raw.githubusercontent.com/sarapcanagii/Pitipitii/builds/plugins.json', redirectUrl: 'https://kraptor123.github.io/redirect/?r=cloudstreamrepo://raw.githubusercontent.com/sarapcanagii/Pitipitii/refs/heads/builds/repo.json' },
            { code: 'Makoto2', name: 'Makoto2', url: 'https://raw.githubusercontent.com/Sertel392/Makotogecici/main/plugins.json', redirectUrl: 'https://kraptor123.github.io/redirect/?r=cloudstreamrepo://raw.githubusercontent.com/Sertel392/Makotogecici/refs/heads/main/repo.json' },
            { code: 'gizlikeyif', name: 'Gizli-Keyif', url: 'https://raw.githubusercontent.com/Kraptor123/Cs-GizliKeyif/refs/heads/builds/plugins.json', redirectUrl: 'https://kraptor123.github.io/redirect/?r=cloudstreamrepo://raw.githubusercontent.com/Kraptor123/Cs-GizliKeyif/refs/heads/master/repo.json' },
            { code: 'AyzenCS3', name: 'Ayzen-CS3', url: 'https://raw.githubusercontent.com/ByAyzen/AyzenCS3/refs/heads/builds/plugins.json', redirectUrl: 'https://kraptor123.github.io/redirect/?r=cloudstreamrepo://raw.githubusercontent.com/ByAyzen/AyzenCS3/refs/heads/builds/repo.json' }
        ];

        this.typeMap = { movie:'Film', tvseries:'Dizi', anime:'Anime', animemovie:'Anime Filmi', asiandrama:'Asya Dizisi', cartoon:'Çizgi Film', documentary:'Belgesel', ova:'OVA', live:'Canlı', nsfw:'Yetişkin' };

        // --- Durum Değişkenleri ---
        this.allPlugins = [];
        this.filteredPlugins = [];

        // Envanter Yapısı: { meta: { initTimestamp: 123... }, items: { 'pluginId': { v:'1.0', fs:123, lu:123 } } }
        this.inventoryData = { meta: null, items: {} };

        this.adultConfirmed = localStorage.getItem('adultConfirmed') === 'true';
        this.darkTheme = localStorage.getItem('darkTheme') !== 'false';

        // --- Sabitler ---
        this.colors = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#3b82f6'];

        this.DAYS_NEW = 10;      // Yeni etiketi süresi
        this.DAYS_UPDATED = 3;   // Güncellendi etiketi süresi
        this.LS_INVENTORY_KEY = 'cs_plugin_inventory_v2'; // Key'i değiştirdim ki eski hatalı veri karışmasın

        this.moonSVG = `<svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
        this.sunSVG = `<svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;

        this.init();
    }

    async init() {
        this.setupTheme();
        this.bindEvents();
        this.setupAdultOverlay();
        await this.loadAllPlugins();
    }

    // --- Tema ve Olaylar ---
    setupTheme() {
        const icon = document.querySelector('.theme-icon');
        if (!this.darkTheme) {
            document.body.classList.add('light-theme');
            if (icon) icon.innerHTML = this.sunSVG;
        } else {
            document.body.classList.remove('light-theme');
            if (icon) icon.innerHTML = this.moonSVG;
        }
    }

    bindEvents() {
        const get = id => document.getElementById(id);
        get('themeToggle')?.addEventListener('click', () => { this.darkTheme = !this.darkTheme; localStorage.setItem('darkTheme', this.darkTheme); this.setupTheme(); });
        get('backButton')?.addEventListener('click', () => window.location.href = '/kraptor-wiki/docs/hosgeldin');
        ['repoFilter', 'typeFilter', 'languageFilter', 'developerFilter'].forEach(id => { get(id)?.addEventListener('change', (e) => this.handleFilterChange(e)); });
        get('searchInput')?.addEventListener('input', () => this.filterPlugins());
    }

    handleFilterChange(e) {
        const val = e.target.value;
        if ((val === 'nsfw' || val === 'Gizli-Keyif') && !this.adultConfirmed) {
            document.getElementById('adultOverlay').style.display = 'flex';
            e.target.value = '';
            return;
        }
        this.filterPlugins();
    }

    setupAdultOverlay() {
        const ov = document.getElementById('adultOverlay');
        document.getElementById('adultYes')?.addEventListener('click', () => { this.adultConfirmed = true; localStorage.setItem('adultConfirmed', 'true'); ov.style.display = 'none'; this.filterPlugins(); });
        document.getElementById('adultNo')?.addEventListener('click', () => ov.style.display = 'none');
    }

    // --- Yardımcı Fonksiyonlar ---
    canonicalAuthor(raw) {
        if (!raw) return 'bilinmiyor';
        return String(raw).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase().replace(/\d+$/, '');
    }

    normalizeArray(input) {
        if (!input) return [];
        if (Array.isArray(input)) return input.filter(Boolean).map(String);
        return String(input).split(',').map(s => s.trim()).filter(Boolean);
    }

    escapeHtml(text) {
        if (!text) return '';
        return text.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[m]);
    }

    hash(str) {
        let h = 0;
        for (let i=0; i<str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0;
        return Math.abs(h);
    }

    // --- Veri Yükleme ---
    async loadAllPlugins() {
        this.showLoading(true);

        const fetches = this.repos.map(repo =>
            fetch(repo.url + '?nocache=' + Date.now(), { signal: AbortSignal.timeout(10000) })
                .then(res => res.ok ? res.json() : [])
                .then(data => data.map(p => ({
                    ...p,
                    repoName: repo.name,
                    repoCode: repo.code,
                    redirectUrl: repo.redirectUrl
                })))
                .catch(() => [])
        );

        const results = await Promise.all(fetches);
        const rawPlugins = results.flat();
        const map = new Map();

        // Eklentileri Birleştir
        rawPlugins.forEach(p => {
            const id = (p.internalName || p.name || '').trim();
            const key = id.toLowerCase();
            if (!key) return;

            const types = this.normalizeArray(p.tvTypes || p.types || p.type);
            const authors = this.normalizeArray(p.authors);
            const authorsCanon = authors.map(a => this.canonicalAuthor(a));

            const perRepoObj = {
                version: String(p.version || '0'),
                description: p.description,
                iconUrl: p.iconUrl,
                authors: authors,
                authorsCanon: authorsCanon,
                language: p.language,
                redirectUrl: p.redirectUrl
            };

            if (!map.has(key)) {
                map.set(key, {
                    id: id,
                    name: p.name,
                    repos: [{ name: p.repoName, code: p.repoCode }],
                    allTypes: new Set(types),
                    allAuthors: new Set(authors),
                    allAuthorsCanon: new Set(authorsCanon),
                    language: p.language,
                    _perRepo: { [p.repoCode]: perRepoObj }
                });
            } else {
                const existing = map.get(key);
                if (!existing.repos.find(r => r.code === p.repoCode)) existing.repos.push({ name: p.repoName, code: p.repoCode });
                types.forEach(t => existing.allTypes.add(t));
                authors.forEach(a => existing.allAuthors.add(a));
                authorsCanon.forEach(ac => existing.allAuthorsCanon.add(ac));
                existing._perRepo[p.repoCode] = perRepoObj;
            }
        });

        this.allPlugins = Array.from(map.values()).map(p => ({
            ...p,
            tvTypes: Array.from(p.allTypes),
            authors: Array.from(p.allAuthors),
            authorsCanon: Array.from(p.allAuthorsCanon)
        }));

        // 1. Durumları İşle
        this.processPluginStatuses();

        // 2. İstatistikleri ve Filtreleri Hazırla
        this.updateStats();
        this.populateFilterOptions();

        // 3. Ekrana Bas
        this.filterPlugins();
        this.showLoading(false);
    }

    // --- YENİ / GÜNCELLENDİ MANTIĞI (Düzeltilmiş) ---
    processPluginStatuses() {
        const rawLS = localStorage.getItem(this.LS_INVENTORY_KEY);
        const now = Date.now();
        let changed = false;

        // 1. LS'den Veriyi Yükle veya İlk Kez Oluştur
        if (rawLS) {
            try {
                this.inventoryData = JSON.parse(rawLS);
                // Eski format koruması (eğer yapı bozuksa sıfırla)
                if (!this.inventoryData.meta || !this.inventoryData.items) throw new Error();
            } catch (e) {
                this.inventoryData = { meta: { initTimestamp: now }, items: {} };
                changed = true;
            }
        } else {
            // İLK ZİYARET: "initTimestamp" şu anki zaman olur.
            this.inventoryData = { meta: { initTimestamp: now }, items: {} };
            changed = true;
        }

        // 2. Mevcut Eklentileri Envanterle Karşılaştır
        this.allPlugins.forEach(p => {
            const currentVer = this.getMainVersion(p);
            const record = this.inventoryData.items[p.id];

            if (!record) {
                // HİÇ BİLİNMEYEN EKLENTİ (Veritabanına ekle)
                // fs (first seen) = now
                // lu (last updated) = now
                this.inventoryData.items[p.id] = { v: currentVer, fs: now, lu: now };
                changed = true;
            } else {
                // ZATEN BİLİNEN EKLENTİ
                if (record.v !== currentVer) {
                    // Versiyon değişmiş -> Güncelle
                    record.v = currentVer;
                    record.lu = now; // Son güncellenme tarihini şimdi yap
                    changed = true;
                }
            }
        });

        if (changed) {
            localStorage.setItem(this.LS_INVENTORY_KEY, JSON.stringify(this.inventoryData));
        }
    }

    getMainVersion(p) {
        const defRepo = p.repos[0];
        return p._perRepo[defRepo.code]?.version || '0';
    }

    getPluginStatus(p) {
        const record = this.inventoryData.items[p.id];
        const initTime = this.inventoryData.meta.initTimestamp;

        if (!record) return null;

        const now = Date.now();
        const newDuration = this.DAYS_NEW * 24 * 60 * 60 * 1000;
        const updateDuration = this.DAYS_UPDATED * 24 * 60 * 60 * 1000;

        // 1. YENİ Mİ?
        // Kural: Eklentinin ilk görülme tarihi (fs), sistemin kuruluş tarihinden (initTime) BÜYÜK olmalı.
        // Eşitse (veya çok yakınsa), bu eklenti "kurucu parti"dendir, yeni değildir.
        // Ayrıca 10 gün geçmemiş olmalı.

        // Güvenlik marjı (1 saniye): Kod çalışırken milisaniye farkları olabilir.
        const isPartOfInitialBatch = (record.fs - initTime) < 1000;

        if (!isPartOfInitialBatch && (now - record.fs) < newDuration) {
            return 'new';
        }

        // 2. GÜNCELLENDİ Mİ?
        // Kural: Son güncelleme tarihi (lu), ilk görülme tarihinden (fs) büyük olmalı.
        // (Yani eklendiği anda güncellenmiş sayılmaz).
        // Ve güncelleme üzerinden 3 gün geçmemiş olmalı.
        if (record.lu > record.fs && (now - record.lu) < updateDuration) {
            return 'updated';
        }

        return null;
    }

    // --- Filtre Doldurma ---
    populateFilterOptions() {
        const fill = (id, items) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.innerHTML = '<option value="">Tümü</option>' + items.map(i => {
                return `<option value="${i.val}">${i.txt}</option>`;
            }).join('');
        };

        // Repo Sıralaması
        const repoCounts = {};
        this.allPlugins.forEach(p => {
            p.repos.forEach(r => {
                repoCounts[r.name] = (repoCounts[r.name] || 0) + 1;
            });
        });
        const sortedRepos = Object.entries(repoCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([name, count]) => ({ val: name, txt: `${name} (${count})` }));
        fill('repoFilter', sortedRepos);

        // Geliştirici Sıralaması
        const devStats = new Map();
        this.allPlugins.forEach(p => {
            p.authors.forEach((originalName, i) => {
                const canon = p.authorsCanon[i] || this.canonicalAuthor(originalName);
                if (!devStats.has(canon)) devStats.set(canon, { name: originalName, count: 0 });
                devStats.get(canon).count++;
            });
        });

        const sortedDevs = Array.from(devStats.entries())
            .sort((a, b) => b[1].count - a[1].count)
            .map(([canon, data]) => ({ val: canon, txt: `${data.name} (${data.count})` }));
        fill('developerFilter', sortedDevs);

        // Diğerleri
        const langs = new Set();
        this.allPlugins.forEach(p => { if (p.language) langs.add(p.language); });

        const sortedTypes = Object.keys(this.typeMap).sort((a,b) => this.typeMap[a].localeCompare(this.typeMap[b]));
        fill('typeFilter', sortedTypes.map(t => ({ val: t, txt: this.typeMap[t] })));

        const langMap = { tr:'Türkçe', en:'İngilizce', ar:'Arapça', ru:'Rusça', de:'Almanca', fr:'Fransızca' };
        fill('languageFilter', Array.from(langs).sort().map(l => ({ val: l, txt: langMap[l] || l.toUpperCase() })));
    }

    // --- Filtreleme ---
    filterPlugins() {
        const filters = {
            repo: document.getElementById('repoFilter').value,
            type: document.getElementById('typeFilter').value,
            lang: document.getElementById('languageFilter').value,
            dev: document.getElementById('developerFilter').value,
            query: document.getElementById('searchInput').value.toLowerCase()
        };

        this.filteredPlugins = this.allPlugins.filter(p => {
            const pTypes = p.tvTypes.map(t => t.toLowerCase());
            if (pTypes.includes('nsfw') && !this.adultConfirmed) return false;

            if (filters.repo && !p.repos.some(r => r.name === filters.repo)) return false;
            if (filters.type && !pTypes.includes(filters.type)) return false;
            if (filters.lang && p.language !== filters.lang) return false;
            if (filters.dev && !p.authorsCanon.includes(filters.dev)) return false;
            if (filters.query) {
                const text = `${p.name} ${Object.values(p._perRepo).map(x=>x.description).join(' ')}`.toLowerCase();
                if (!text.includes(filters.query)) return false;
            }
            return true;
        });

        this.render();
    }

    // --- Render ---
    render() {
        const grid = document.getElementById('pluginsGrid');
        const noRes = document.getElementById('noResults');
        if (this.filteredPlugins.length === 0) {
            grid.innerHTML = '';
            noRes.style.display = 'block';
            return;
        }
        noRes.style.display = 'none';
        grid.innerHTML = this.filteredPlugins.map(p => this.createCardHTML(p)).join('');
        this.attachCardEvents();
    }

    createCardHTML(p) {
        const defaultRepo = p.repos[0];
        const data = p._perRepo[defaultRepo.code];
        const status = this.getPluginStatus(p);
        const initialRedirect = data.redirectUrl || '#';

        // Badge HTML
        let statusBadge = '';
        if (status === 'new') {
            statusBadge = '<span class="badge-new">YENİ</span>';
        } else if (status === 'updated') {
            statusBadge = '<span class="badge-updated">GÜNCELLENDİ</span>';
        }

        const headerHTML = `
            <div class="repo-header-info">
                <label>KAYNAK DEPO</label>
                <span class="repo-shortcode" title="Repo Kısa Kodu">${defaultRepo.code}</span>
            </div>
        `;

        let repoSectionHTML = '';
        if (p.repos.length > 1) {
            const repoOptions = p.repos.map((r, idx) => {
                const safeData = encodeURIComponent(JSON.stringify(p._perRepo[r.code]));
                return `<option value="${r.code}" data-per="${safeData}" ${idx===0?'selected':''}>${r.name}</option>`;
            }).join('');

            repoSectionHTML = `
                <div class="repo-select-area">
                    ${headerHTML}
                    <div class="repo-multi-wrapper" style="display:flex; gap:8px;">
                        <select class="card-repo-select" style="flex:1;">${repoOptions}</select>
                        <a href="${initialRedirect}" class="repo-link-btn" target="_blank" title="Depoya Git">
                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                        </a>
                    </div>
                </div>`;
        } else {
            repoSectionHTML = `
                <div class="repo-select-area">
                    ${headerHTML}
                    <div class="single-repo-display">
                        <span>Mevcut:</span>
                        <a href="${initialRedirect}" class="single-repo-link" target="_blank">${defaultRepo.name}</a>
                    </div>
                </div>`;
        }

        const typesHTML = p.tvTypes.slice(0,3).map(t => {
            const color = this.colors[this.hash(t) % this.colors.length];
            return `<span class="type-badge clickable-type" style="background:${color}" data-type="${t.toLowerCase()}">${this.typeMap[t.toLowerCase()] || t}</span>`;
        }).join('');

        const authorsHTML = this.createAuthorsHTML(data.authors, data.authorsCanon);

        return `
        <div class="plugin-card" data-id="${p.id}">
            <div class="plugin-header">
                <div class="header-left">
                    <img src="${data.iconUrl || ''}" class="plugin-icon" loading="lazy" onerror="this.src='https://placehold.co/72/black/white/?text=CS'">
                    <div class="plugin-info">
                        <div class="plugin-name-row">
                            <span class="plugin-name">${this.escapeHtml(p.name)}</span>
                            ${statusBadge}
                        </div>
                        <div class="plugin-version">v${data.version || '1.0'}</div>
                    </div>
                </div>
                <div class="card-lang">${data.language ? data.language.toUpperCase() : ''}</div>
            </div>

            <div class="plugin-description">${this.escapeHtml(data.description || 'Açıklama bulunmuyor.')}</div>
            
            <div class="card-footer">
                <div class="plugin-types">${typesHTML}</div>
                ${repoSectionHTML}
                <div class="plugin-authors-container">
                    <div class="plugin-authors">${authorsHTML}</div>
                </div>
            </div>
        </div>`;
    }

    createAuthorsHTML(names, canons) {
        if (!names || !names.length) return `<span class="author-badge" style="background:#475569">Bilinmiyor</span>`;
        return names.map((name, i) => {
            const canon = canons[i] || this.canonicalAuthor(name);
            const color = this.colors[this.hash(canon) % this.colors.length];
            return `<span class="author-badge" style="background:${color}" data-canon="${canon}">${this.escapeHtml(name)}</span>`;
        }).join('');
    }

    attachCardEvents() {
        document.querySelectorAll('.card-repo-select').forEach(sel => {
            sel.addEventListener('change', (e) => {
                const card = e.target.closest('.plugin-card');
                const opt = e.target.options[e.target.selectedIndex];
                const data = JSON.parse(decodeURIComponent(opt.getAttribute('data-per')));

                const shortcodeEl = card.querySelector('.repo-shortcode');
                if (shortcodeEl) shortcodeEl.textContent = e.target.value;

                card.querySelector('.plugin-version').textContent = `v${data.version||'?'}`;
                card.querySelector('.plugin-description').textContent = data.description || 'Açıklama yok.';
                card.querySelector('.plugin-icon').src = data.iconUrl || 'https://placehold.co/72/black/white/?text=Kraptor\\nWiki';
                card.querySelector('.card-lang').textContent = data.language ? data.language.toUpperCase() : '';
                card.querySelector('.plugin-authors').innerHTML = this.createAuthorsHTML(data.authors, data.authorsCanon);
                const linkBtn = card.querySelector('.repo-link-btn');
                if (linkBtn && data.redirectUrl) linkBtn.href = data.redirectUrl;
                this.attachAuthorClicks(card);
            });
        });

        document.querySelectorAll('.clickable-type').forEach(badge => {
            badge.addEventListener('click', (e) => {
                const type = e.target.getAttribute('data-type');
                const select = document.getElementById('typeFilter');
                if (select && type) {
                    select.value = type;
                    if (type === 'nsfw' && !this.adultConfirmed) {
                        document.getElementById('adultOverlay').style.display = 'flex';
                        select.value = '';
                    } else {
                        this.filterPlugins();
                        document.querySelector('.controls').scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });

        this.attachAuthorClicks(document);
    }

    attachAuthorClicks(root) {
        root.querySelectorAll('.author-badge').forEach(badge => {
            badge.addEventListener('click', () => {
                const canon = badge.getAttribute('data-canon');
                const select = document.getElementById('developerFilter');
                if (select && canon) {
                    select.value = canon;
                    this.filterPlugins();
                    document.querySelector('.controls').scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    updateStats() {
        document.getElementById('totalPlugins').textContent = this.allPlugins.length;
        document.getElementById('totalRepos').textContent = this.repos.length;
        const types = new Set();
        this.allPlugins.forEach(p => p.tvTypes.forEach(t => types.add(t)));
        document.getElementById('totalTypes').textContent = types.size;
    }

    showLoading(show) { document.getElementById('loadingIndicator').style.display = show ? 'flex' : 'none'; }
}

document.addEventListener('DOMContentLoaded', () => new CloudStreamBrowser());