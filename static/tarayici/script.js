class CloudStreamBrowser {
    constructor() {
        this.repos = [
            { code: 'kraptorcs', name: 'CS-Kraptor', url: 'https://raw.githubusercontent.com/Kraptor123/cs-kraptor/refs/heads/builds/plugins.json', redirectUrl: 'https://kraptor123.github.io/redirect/?r=cloudstreamrepo://raw.githubusercontent.com/Kraptor123/cs-kraptor/refs/heads/master/repo.json' },
            { code: 'cskarma', name: 'CS-Karma', url: 'https://raw.githubusercontent.com/Kraptor123/Cs-Karma/refs/heads/builds/plugins.json', redirectUrl: 'https://kraptor123.github.io/redirect/?r=cloudstreamrepo://raw.githubusercontent.com/Kraptor123/cs-Karma/refs/heads/master/repo.json' },
            { code: 'feroxxcs3', name: 'Feroxx', url: 'https://raw.githubusercontent.com/feroxx/Kekik-cloudstream/builds/plugins.json', redirectUrl: 'https://kraptor123.github.io/redirect/?r=cloudstreamrepo://raw.githubusercontent.com/feroxx/Kekik-cloudstream/refs/heads/builds/repo.json' },
            { code: 'sarapcanagii', name: 'SarapcanAgii', url: 'https://raw.githubusercontent.com/sarapcanagii/Pitipitii/builds/plugins.json', redirectUrl: 'https://kraptor123.github.io/redirect/?r=cloudstreamrepo://raw.githubusercontent.com/sarapcanagii/Pitipitii/refs/heads/builds/repo.json' },
            { code: 'Makoto2', name: 'Makoto2', url: 'https://raw.githubusercontent.com/Sertel392/Makotogecici/main/plugins.json', redirectUrl: 'https://kraptor123.github.io/redirect/?r=cloudstreamrepo://raw.githubusercontent.com/Sertel392/Makotogecici/refs/heads/main/repo.json' },
            { code: 'gizlikeyif', name: 'Gizli-Keyif', url: 'https://raw.githubusercontent.com/Kraptor123/Cs-GizliKeyif/refs/heads/builds/plugins.json', redirectUrl: 'https://kraptor123.github.io/redirect/?r=cloudstreamrepo://raw.githubusercontent.com/Kraptor123/Cs-GizliKeyif/refs/heads/master/repo.json' },
            { code: 'AyzenCS3', name: 'Ayzen-CS3', url: 'https://raw.githubusercontent.com/ByAyzen/AyzenCS3/refs/heads/builds/plugins.json', redirectUrl: 'https://kraptor123.github.io/redirect/?r=cloudstreamrepo://https://raw.githubusercontent.com/ByAyzen/AyzenCS3/refs/heads/builds/repo.json' }
        ];

        this.typeMap = { movie:'Film', tvseries:'Dizi', anime:'Anime', animemovie:'Anime Filmi', asiandrama:'Asya Dizisi', cartoon:'Çizgi Film', documentary:'Belgesel', ova:'OVA', live:'Canlı', nsfw:'Yetişkin' };

        this.allPlugins = [];
        this.filteredPlugins = [];
        this.adultConfirmed = localStorage.getItem('adultConfirmed') === 'true';
        this.darkTheme = localStorage.getItem('darkTheme') !== 'false';
        this.colors = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#3b82f6'];
        this.NEW_DAYS = 10;
        this.LS_SEEN_PREFIX = 'cs_seen_';

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

    canonicalAuthor(raw) {
        if (!raw) return 'bilinmiyor';
        return String(raw).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase().replace(/\d+$/, '');
    }

    async loadAllPlugins() {
        this.showLoading(true);
        const fetches = this.repos.map(repo =>
            fetch(repo.url + '?nocache=' + Date.now(), { signal: AbortSignal.timeout(10000) })
                .then(res => res.ok ? res.json() : [])
                // BURADA redirectUrl bilgisini de veri setine ekliyoruz:
                .then(data => data.map(p => ({
                    ...p,
                    repoName: repo.name,
                    repoCode: repo.code,
                    redirectUrl: repo.redirectUrl // ÖNEMLİ DEĞİŞİKLİK
                })))
                .catch(() => [])
        );

        const results = await Promise.all(fetches);
        const rawPlugins = results.flat();
        const map = new Map();

        rawPlugins.forEach(p => {
            const id = (p.internalName || p.name || '').trim();
            const key = id.toLowerCase();
            if (!key) return;

            const types = this.normalizeArray(p.tvTypes || p.types || p.type);
            const authors = this.normalizeArray(p.authors);
            const authorsCanon = authors.map(a => this.canonicalAuthor(a));

            const perRepoObj = {
                version: p.version,
                description: p.description,
                iconUrl: p.iconUrl,
                authors: authors,
                authorsCanon: authorsCanon,
                language: p.language,
                redirectUrl: p.redirectUrl // ÖNEMLİ DEĞİŞİKLİK: Burada saklıyoruz
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

        this.allPlugins = Array.from(map.values()).map(p => ({ ...p, tvTypes: Array.from(p.allTypes), authors: Array.from(p.allAuthors), authorsCanon: Array.from(p.allAuthorsCanon) }));

        this.updateStats();
        this.populateFilterOptions();
        this.filterPlugins();
        this.showLoading(false);
    }

    normalizeArray(input) {
        if (!input) return [];
        if (Array.isArray(input)) return input.filter(Boolean).map(String);
        return String(input).split(',').map(s => s.trim()).filter(Boolean);
    }

    populateFilterOptions() {
        const fill = (id, items, mapFn) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.innerHTML = '<option value="">Tümü</option>' + items.map(i => {
                const val = mapFn ? mapFn(i).val : i;
                const txt = mapFn ? mapFn(i).txt : i;
                return `<option value="${val}">${txt}</option>`;
            }).join('');
        };

        const langs = new Set();
        const devs = new Map();

        this.allPlugins.forEach(p => {
            if (p.language) langs.add(p.language);
            p.authors.forEach((a, i) => {
                const canon = p.authorsCanon[i] || this.canonicalAuthor(a);
                if (!devs.has(canon)) devs.set(canon, a);
            });
        });

        fill('repoFilter', this.repos.map(r => ({val: r.name, txt: r.name})), x => x);
        const sortedTypes = Object.keys(this.typeMap).sort((a,b) => this.typeMap[a].localeCompare(this.typeMap[b]));
        fill('typeFilter', sortedTypes, t => ({ val: t, txt: this.typeMap[t] }));
        const langMap = { tr:'Türkçe', en:'İngilizce', ar:'Arapça', ru:'Rusça', de:'Almanca', fr:'Fransızca' };
        fill('languageFilter', Array.from(langs).sort(), l => ({ val: l, txt: langMap[l] || l.toUpperCase() }));
        const sortedDevs = Array.from(devs.entries()).sort((a,b) => a[1].localeCompare(b[1]));
        fill('developerFilter', sortedDevs, d => ({ val: d[0], txt: d[1] }));
    }

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

    isNew(p) {
        const defaultRepo = p.repos[0];
        const version = p._perRepo[defaultRepo.code]?.version || '0';

        const seenKey = this.LS_SEEN_PREFIX + p.id + '_' + version;

        const now = Date.now();
        const duration = this.NEW_DAYS * 24 * 60 * 60 * 1000;

        const firstSeen = localStorage.getItem(seenKey);

        if (!firstSeen) {
            localStorage.setItem(seenKey, now.toString());
            return true;
        }

        return (now - parseInt(firstSeen)) < duration;
    }

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
        const isNew = this.isNew(p);
        const initialRedirect = data.redirectUrl || '#'; // Varsayılan URL

        // --- YÖNLENDİRME (LİNK) MANTIĞI BURADA GÜNCELLENDİ ---
        let repoSectionHTML = '';
        if (p.repos.length > 1) {
            const repoOptions = p.repos.map((r, idx) => {
                const safeData = encodeURIComponent(JSON.stringify(p._perRepo[r.code]));
                return `<option value="${r.code}" data-per="${safeData}" ${idx===0?'selected':''}>${r.name}</option>`;
            }).join('');

            // Çoklu depo: Select kutusu + Yanında git butonu
            repoSectionHTML = `
                <div class="repo-select-area">
                    <label>Kaynak Depo</label>
                    <div class="repo-multi-wrapper" style="display:flex; gap:8px;">
                        <select class="card-repo-select" style="flex:1;">${repoOptions}</select>
                        <a href="${initialRedirect}" class="repo-link-btn" target="_blank" title="Depoya Git">
                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                        </a>
                    </div>
                </div>`;
        } else {
            // Tek depo: İsim artık tıklanabilir bir <a> etiketi
            repoSectionHTML = `
                <div class="repo-select-area">
                    <label>Kaynak Depo</label>
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
                    <img src="${data.iconUrl || ''}" class="plugin-icon" loading="lazy" onerror="this.src='https://placehold.co/72/black/white/?text=kraptor'">
                    <div class="plugin-info">
                        <div class="plugin-name-row">
                            <span class="plugin-name">${this.escapeHtml(p.name)}</span>
                            ${isNew ? '<span class="badge-new">YENİ</span>' : ''}
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
        // Repo Select Listener
        document.querySelectorAll('.card-repo-select').forEach(sel => {
            sel.addEventListener('change', (e) => {
                const card = e.target.closest('.plugin-card');
                const opt = e.target.options[e.target.selectedIndex];
                const data = JSON.parse(decodeURIComponent(opt.getAttribute('data-per')));

                card.querySelector('.plugin-version').textContent = `v${data.version||'?'}`;
                card.querySelector('.plugin-description').textContent = data.description || 'Açıklama yok.';
                card.querySelector('.plugin-icon').src = data.iconUrl || 'https://placehold.co/72/black/white/?text=kraptor';
                card.querySelector('.card-lang').textContent = data.language ? data.language.toUpperCase() : '';
                card.querySelector('.plugin-authors').innerHTML = this.createAuthorsHTML(data.authors, data.authorsCanon);

                // --- Link Güncelleme ---
                const linkBtn = card.querySelector('.repo-link-btn');
                if (linkBtn && data.redirectUrl) {
                    linkBtn.href = data.redirectUrl;
                }

                this.attachAuthorClicks(card);
            });
        });

        // Tıklanabilir Türler
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

    hash(str) {
        let h = 0;
        for (let i=0; i<str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0;
        return Math.abs(h);
    }

    escapeHtml(text) {
        if (!text) return '';
        return text.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[m]);
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