// script.js (güncellenmiş)
class CloudStreamBrowser {
    constructor() {
        this.allPluginsRaw = [];
        this.allPlugins = [];
        this.filteredPlugins = [];
        this.repos = [
            { code: 'kraptorcs', name: 'CS-Kraptor', url: 'https://raw.githubusercontent.com/Kraptor123/cs-kraptor/refs/heads/builds/plugins.json', redirectUrl: 'https://kraptor123.github.io/redirect/?r=cloudstreamrepo://raw.githubusercontent.com/Kraptor123/cs-kraptor/refs/heads/master/repo.json' },
            { code: 'cskarma', name: 'CS-Karma', url: 'https://raw.githubusercontent.com/Kraptor123/Cs-Karma/refs/heads/builds/plugins.json', redirectUrl: 'https://kraptor123.github.io/redirect/?r=cloudstreamrepo://raw.githubusercontent.com/Kraptor123/cs-Karma/refs/heads/master/repo.json' },
            // { code: 'Latte', name: 'GitLatte', url: 'https://raw.githubusercontent.com/GitLatte/Sinetech/builds/plugins.json', redirectUrl: 'https://kraptor123.github.io/redirect/?r=cloudstreamrepo://raw.githubusercontent.com/GitLatte/Sinetech/refs/heads/main/repo.json' },
            // { code: 'nikstream', name: 'Nikyokki', url: 'https://raw.githubusercontent.com/nikyokki/nik-cloudstream/builds/plugins.json', redirectUrl: 'https://kraptor123.github.io/redirect/?r=cloudstreamrepo://raw.githubusercontent.com/nikyokki/nik-cloudstream/refs/heads/master/repo.json' },
            { code: 'feroxxcs3', name: 'Feroxx', url: 'https://raw.githubusercontent.com/feroxx/Kekik-cloudstream/builds/plugins.json', redirectUrl: 'https://kraptor123.github.io/redirect/?r=cloudstreamrepo://raw.githubusercontent.com/feroxx/Kekik-cloudstream/refs/heads/builds/repo.json' },
            { code: 'sarapcanagii', name: 'SarapcanAgii', url: 'https://raw.githubusercontent.com/sarapcanagii/Pitipitii/builds/plugins.json', redirectUrl: 'https://kraptor123.github.io/redirect/?r=cloudstreamrepo://raw.githubusercontent.com/sarapcanagii/Pitipitii/refs/heads/builds/repo.json' },
            { code: 'Makoto2', name: 'Makoto2', url: 'https://raw.githubusercontent.com/Sertel392/Makotogecici/main/plugins.json', redirectUrl: 'https://kraptor123.github.io/redirect/?r=cloudstreamrepo://raw.githubusercontent.com/Sertel392/Makotogecici/refs/heads/main/repo.json' },
            { code: 'gizlikeyif', name: 'Gizli-Keyif', url: 'https://raw.githubusercontent.com/Kraptor123/Cs-GizliKeyif/refs/heads/builds/plugins.json', redirectUrl: 'https://kraptor123.github.io/redirect/?r=cloudstreamrepo://raw.githubusercontent.com/Kraptor123/Cs-GizliKeyif/refs/heads/master/repo.json' }
        ];

        this.typeMap = { movie:'Film', tvseries:'Dizi', anime:'Anime', animemovie:'Anime Filmi', asiandrama:'Asya Dizisi', cartoon:'Çizgi Film', documentary:'Belgesel', ova:'OVA', live:'Canlı', nsfw:'Yetişkin' };

        this.repoColors = {};
        const _palette = ['#ffd166','#06d6a0','#f94144','#f8961e','#ff7eb6','#9b5de5','#00b4d8','#90be6d','#f9c74f','#43aa8b'];
        this.repos.forEach((r,i)=>{ this.repoColors[r.code] = _palette[i % _palette.length]; });

        this.typeColors = {}; this.typeTextColors = {};

        this.adultConfirmed = localStorage.getItem('adultConfirmed') === 'true';
        this.adultRejected = localStorage.getItem('adultRejected') === 'true';

        const stored = localStorage.getItem('darkTheme');
        this.darkTheme = (stored === null) ? (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) : (stored === 'true');

        this.LS_PREV_COUNT = 'cs_prev_plugin_count';
        this.developerFilterId = 'developerFilter';

        // NEW badge & visit keys
        this.LS_LAST_VISIT = 'cs_last_visit';
        this.LS_PLUGIN_SEEN_PREFIX = 'cs_plugin_seen:'; // + pluginId
        this.NEW_DURATION_DAYS = 3; // 3 gün (isteğe göre değiştirilebilir)

        // debug flag
        this.debug = true;

        this.init();
    }

    // helper: fetch with timeout
    fetchWithTimeout(url, timeout = 8000) {
        const controller = new AbortController();
        const id = setTimeout(()=> controller.abort(), timeout);
        return fetch(url, { signal: controller.signal })
            .finally(()=> clearTimeout(id));
    }

    canonicalAuthor(raw) {
        if (!raw) return '';
        const s = String(raw).normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
        const tokens = s.split(/[\s,;|\/\\()_\-]+/).map(t => t.replace(/[^a-zA-Z0-9]/g,'').toLowerCase()).filter(Boolean);
        if (tokens.length === 0) return s.replace(/[^a-z0-9]/gi,'').toLowerCase();
        for (let t of tokens) {
            const stripped = t.replace(/\d+$/,'');
            if (stripped.length >= 2) return stripped;
        }
        return tokens[0];
    }

    init() {
        this.setupTheme();
        this.ensureDeveloperSelect(); // <- burayı bindEvents'ten önce taşıdık
        this.bindEvents();
        this.loadAllPlugins();
        this.setupAdultOverlay();
    }

    ensureDeveloperSelect() {
        if (!document.getElementById(this.developerFilterId)) {
            const wrapper = document.createElement('div');
            wrapper.className = 'control-group';
            wrapper.innerHTML = `<label>Geliştirici</label><select id="${this.developerFilterId}"><option value="">Tüm Geliştiriciler</option></select>`;
            const controlsRow = document.querySelector('.controls .controls-row') || document.querySelector('.controls');
            if (controlsRow) controlsRow.appendChild(wrapper);
        }
    }

    setupTheme() {
        const themeIcon = document.querySelector('.theme-icon');
        if (this.darkTheme) {
            document.body.classList.add('dark-theme');
            if (themeIcon) themeIcon.textContent = '🌙';
        } else {
            document.body.classList.remove('dark-theme');
            if (themeIcon) themeIcon.textContent = '☀️';
        }
    }

    bindEvents() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) themeToggle.addEventListener('click', () => this.toggleTheme());

        const backBtn = document.getElementById('backButton');
        if (backBtn) backBtn.addEventListener('click', () => {
            window.location.href = '/kraptor-wiki/docs/category/eklenti-tarayıcı';
        });

        const headerLogo = document.querySelector('.header-logo');
        if (headerLogo) headerLogo.addEventListener('click', () => { window.location.href = 'https://github.com/Kraptor123/cs-kraptor'; });

       const repoFilter = document.getElementById('repoFilter');
        if (repoFilter) {
            repoFilter.addEventListener('change', (e) => this.onRepoFilterChange(e));
        }
        const typeFilter = document.getElementById('typeFilter');
        if (typeFilter) typeFilter.addEventListener('change', (e) => this.onTypeFilterChange(e));

        const languageFilter = document.getElementById('languageFilter');
        if (languageFilter) languageFilter.addEventListener('change', () => this.filterPlugins());

        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.addEventListener('input', () => this.filterPlugins());

        // developer select (muhtemelen ensureDeveloperSelect() ile yaratıldı)
        const devFilter = document.getElementById(this.developerFilterId);
        if (devFilter) {
            devFilter.addEventListener('change', () => this.filterPlugins());
        } else {
            // fallback: eğer element henüz yoksa, kısa süre sonra tekrar dene (örn. başka kod oluşturuyorsa)
            setTimeout(() => {
                const df = document.getElementById(this.developerFilterId);
                if (df) df.addEventListener('change', () => this.filterPlugins());
            }, 250);
        }
    }

    toggleTheme() {
        this.darkTheme = !this.darkTheme;
        localStorage.setItem('darkTheme', this.darkTheme.toString());
        const themeIcon = document.querySelector('.theme-icon');
        if (this.darkTheme) { document.body.classList.add('dark-theme'); if (themeIcon) themeIcon.textContent = '🌙'; }
        else { document.body.classList.remove('dark-theme'); if (themeIcon) themeIcon.textContent = '☀️'; }
        // theme change => re-color authors
        this.applyAuthorColors();
    }

    setupAdultOverlay() {
        const overlay = document.getElementById('adultOverlay');
        const yes = document.getElementById('adultYes');
        const no = document.getElementById('adultNo');
        if (!overlay || !yes || !no) return;
        yes.addEventListener('click', () => { this.adultConfirmed = true; localStorage.setItem('adultConfirmed','true'); overlay.style.display='none'; this.updateFilters(); this.filterPlugins(); });
        no.addEventListener('click', () => { this.adultRejected = true; localStorage.setItem('adultRejected','true'); overlay.style.display='none'; this.updateFilters(); this.filterPlugins(); });
    }

    onTypeFilterChange(e) {
        const val = e.target.value;
        if (val === 'nsfw' && !this.adultConfirmed) {
            const overlay = document.getElementById('adultOverlay'); if (overlay) overlay.style.display = 'flex';
            e.target.value = ''; return;
        }
        this.filterPlugins();
    }

    onRepoFilterChange(e) {
    const val = e.target.value;

    // Gizli-Keyif repo seçildiyse ve adult onayı yoksa
    if (val === 'Gizli-Keyif' && !this.adultConfirmed) {
        const overlay = document.getElementById('adultOverlay');
        if (overlay) overlay.style.display = 'flex';

        // seçimi geri al
        e.target.value = '';
        return;
        }
    
        this.filterPlugins();
    }

    async loadAllPlugins() {
        this.showLoading(true);
        this.allPluginsRaw = [];
        const failedRepos = [];

        // paralel fetchler
        const fetchPromises = this.repos.map(repo => {
            return this.fetchWithTimeout(repo.url, 9000)
                .then(res => ({ res, repo }))
                .catch(err => ({ err, repo }));
        });

        const settled = await Promise.allSettled(fetchPromises);

        for (const s of settled) {
            if (s.status === 'fulfilled') {
                const payload = s.value;
                const repo = payload.repo;
                if (payload.err) {
                    failedRepos.push({repo: repo.name, reason: payload.err.message || payload.err});
                    if (this.debug) console.warn('Fetch failed for', repo.name, payload.err);
                    continue;
                }
                const res = payload.res;
                if (!res) {
                    failedRepos.push({repo: repo.name, reason: 'No response object'});
                    if (this.debug) console.warn('No response object for', repo.name);
                    continue;
                }
                if (!res.ok) {
                    failedRepos.push({repo: repo.name, reason: `HTTP ${res.status}`});
                    if (this.debug) console.warn(`Repo ${repo.name} returned status ${res.status}`);
                    continue;
                }
                try {
                    const plugins = await res.json();
                    if (!Array.isArray(plugins)) {
                        if (this.debug) console.warn(`Repo ${repo.name} JSON is not an array`);
                        failedRepos.push({repo: repo.name, reason: 'JSON not array'});
                        continue;
                    }
                    plugins.forEach(plugin => {
                        plugin.repoName = repo.name;
                        plugin.repoCode = repo.code;
                        this.allPluginsRaw.push(plugin);
                    });
                    if (this.debug) console.debug(`Loaded ${plugins.length} plugins from ${repo.name}`);
                } catch (err) {
                    failedRepos.push({repo: repo.name, reason: 'JSON parse error'});
                    if (this.debug) console.warn(`JSON parse error for ${repo.name}`, err);
                }
            } else {
                if (this.debug) console.warn('Unexpected rejection in fetchPromises', s.reason);
            }
        }

        if (this.allPluginsRaw.length === 0) {
            const reasons = failedRepos.map(f => `${f.repo}: ${f.reason}`).join('; ');
            this.showError('Hiçbir depodan eklenti yüklenemedi. Sebepler konsolda (F12) listelenmiştir. ' + reasons);
            if (this.debug) console.error('All repo fetches failed:', failedRepos);
            this.showLoading(false);
            return;
        }

        // merge logic (kendi eski mantığını bozmadan)
        const cleanStr = (s) => (s || '').toString().replace(/\u00A0/g,' ').replace(/[\u0000-\u001F\u007F]/g,'').trim().replace(/\s+/g,' ');
        const extractTypes = (raw) => {
            if (raw == null) return [];
            let arr = [];
            if (Array.isArray(raw)) {
                raw.forEach(item => { if (item==null) return; const s = cleanStr(item.toString()); if (!s) return; const parts = s.split(/\s*[,;|\/]\s*/); parts.forEach(p=>{ const cp = cleanStr(p); if(cp) arr.push(cp); }); });
            } else {
                const s = cleanStr(raw.toString());
                if (s) { const parts = s.split(/\s*[,;|\/]\s*/); parts.forEach(p=>{ const cp = cleanStr(p); if(cp) arr.push(cp); }); }
            }
            if (arr.length === 0) return [];
            const seen = new Map(); arr.forEach(x=>{const k=x.toLowerCase(); if(!seen.has(k)) seen.set(k,x);}); return Array.from(seen.values());
        };
        const normalizeKey = (s) => { if (s==null) return ''; return s.toString().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/\u00A0/g,' ').replace(/[\u0000-\u001F\u007F]/g,'').replace(/\s+/g,' ').trim().toLowerCase(); };

        const map = {};
        this.allPluginsRaw.forEach(p => {
            const nameKey = cleanStr((p.name || p.id || '').toString()).toLowerCase();
            if (!nameKey) return;

            // prefer tvTypes, else types
            const tvTypesRaw = (p.tvTypes && p.tvTypes.length) ? p.tvTypes : (p.types && p.types.length ? p.types : p.type || []);
            const tvTypes = extractTypes(tvTypesRaw);

            let authors = [];
            if (p.authors) {
                if (Array.isArray(p.authors)) authors = p.authors.map(a => cleanStr(a)).filter(Boolean);
                else { const cleaned = cleanStr(p.authors); if (cleaned) authors = [cleaned]; }
            }

            const authorsCanonical = authors.map(a => this.canonicalAuthor(a));

            // per-repo data object
            const perRepoObj = {
                version: p.version || '',
                authors: authors,
                authorsCanonical: authorsCanonical,
                iconUrl: p.iconUrl || '',
                description: p.description || '',
                language: p.language || '',
                created_at: p.created_at || ''
            };

            if (!map[nameKey]) {
                map[nameKey] = Object.assign({}, p);
                map[nameKey].repos = [{ name: p.repoName, code: p.repoCode }];
                map[nameKey].tvTypes = tvTypes;
                map[nameKey].authors = authors;
                map[nameKey].authorsCanonical = authorsCanonical;
                map[nameKey]._perRepoData = {};
                map[nameKey]._perRepoData[p.repoCode] = perRepoObj;
            } else {
                const repoKey = `${cleanStr(p.repoName)}||${cleanStr(p.repoCode)}`;
                if (!map[nameKey]._repoSet) map[nameKey]._repoSet = new Set(map[nameKey].repos.map(r => `${cleanStr(r.name)}||${cleanStr(r.code)}`));
                if (!map[nameKey]._repoSet.has(repoKey)) { map[nameKey].repos.push({ name: p.repoName, code: p.repoCode }); map[nameKey]._repoSet.add(repoKey); }

                // merge tvTypes
                const seen = new Map();
                (map[nameKey].tvTypes || []).forEach(t=>{ const k=cleanStr(t).toLowerCase(); if(!k) return; if(!seen.has(k)) seen.set(k,t); });
                tvTypes.forEach(t=>{ const k=cleanStr(t).toLowerCase(); if(!k) return; if(!seen.has(k)) seen.set(k,t); });
                map[nameKey].tvTypes = Array.from(seen.values());

                // merge authors (global)
                const authorSet = new Map();
                (map[nameKey].authors || []).forEach(a=>{ const key = cleanStr(a).toLowerCase(); if(key && !authorSet.has(key)) authorSet.set(key,a); });
                authors.forEach(a=>{ const key = cleanStr(a).toLowerCase(); if(key && !authorSet.has(key)) authorSet.set(key,a); });
                map[nameKey].authors = Array.from(authorSet.values());
                map[nameKey].authorsCanonical = map[nameKey].authors.map(a => this.canonicalAuthor(a));

                map[nameKey].version = map[nameKey].version || p.version;
                map[nameKey].description = map[nameKey].description || p.description;
                map[nameKey].iconUrl = map[nameKey].iconUrl || p.iconUrl;
                map[nameKey].language = map[nameKey].language || p.language;

                // store per-repo data (this gives us repo-specific authors/version etc.)
                if (!map[nameKey]._perRepoData) map[nameKey]._perRepoData = {};
                map[nameKey]._perRepoData[p.repoCode] = perRepoObj;
            }
        });

        this.allPlugins = Object.values(map);

        // normalize tv types
        this.allPlugins.forEach(plugin => {
            const tvs = plugin.tvTypes || [];
            plugin._tvTypeDisplays = tvs.slice();
            plugin._tvTypeKeys = tvs.map(t => normalizeKey(t)).filter(k => k);
            plugin.authorsCanonical = plugin.authorsCanonical || (plugin.authors || []).map(a => this.canonicalAuthor(a));
            // ensure there is at least a perRepoData for the first repo (fallback)
            if (!plugin._perRepoData) plugin._perRepoData = {};
            (plugin.repos || []).forEach(r => {
                if (!plugin._perRepoData[r.code]) {
                    plugin._perRepoData[r.code] = {
                        version: plugin.version || '',
                        authors: plugin.authors || [],
                        authorsCanonical: plugin.authorsCanonical || [],
                        iconUrl: plugin.iconUrl || '',
                        description: plugin.description || '',
                        language: plugin.language || '',
                        created_at: plugin.created_at || ''
                    };
                }
            });
        });

        this.markNewPluginsAndSaveCount();
        this.generateTypeColors();

        this.showLoading(false);
        this.updateStats();
        this.updateFilters();
        this.filterPlugins();

        // show failed repos message in UI (kibar)
        if (failedRepos.length > 0) {
            const warnings = failedRepos.map(f => `${f.repo}: ${f.reason}`).join(' | ');
            const errEl = document.getElementById('errorMessage');
            if (errEl) { errEl.style.display = 'block'; errEl.textContent = `Bazı depolar yüklenemedi: ${warnings}`; }
            if (this.debug) console.warn('Some repos failed:', failedRepos);
        }
    }

    markNewPluginsAndSaveCount() {
        const prev = parseInt(localStorage.getItem(this.LS_PREV_COUNT) || '0', 10);
        const current = this.allPlugins.length;
        const newlyMarkedIds = new Set();
        if (current > prev) {
            const diff = current - prev;
            const withDates = this.allPlugins.filter(p => p.created_at).slice();
            if (withDates.length >= diff) {
                withDates.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
                withDates.slice(0,diff).forEach(p => newlyMarkedIds.add(p.id || p.name));
            } else {
                this.allPlugins.slice(0,diff).forEach(p => newlyMarkedIds.add(p.id || p.name));
            }
        }
        localStorage.setItem(this.LS_PREV_COUNT, String(current));
        this.allPlugins = this.allPlugins.map(p => ({...p, _isNew: newlyMarkedIds.has(p.id || p.name)}));
    }

    showLoading(show) {
        const el = document.getElementById('loadingIndicator');
        if (el) el.style.display = show ? 'flex' : 'none';
    }

    showError(message) {
        const el = document.getElementById('errorMessage');
        if (el) { el.textContent = message; el.style.display = 'block'; }
        this.showLoading(false);
    }

    updateStats() {
        const totalPlugins = this.allPlugins.length;
        const repoSet = new Set();
        this.allPlugins.forEach(p => (p.repos || []).forEach(r => repoSet.add(r.name)));
        const uniqueRepos = repoSet.size;
        const typesSet = new Set();
        this.allPlugins.forEach(p => (p.tvTypes || []).forEach(t => { if (t.toLowerCase() === 'nsfw' && !this.adultConfirmed) return; typesSet.add(t); }));
        const elTotal = document.getElementById('totalPlugins');
        const elRepos = document.getElementById('totalRepos');
        const elTypes = document.getElementById('totalTypes');
        if (elTotal) elTotal.textContent = totalPlugins;
        if (elRepos) elRepos.textContent = uniqueRepos;
        if (elTypes) elTypes.textContent = typesSet.size;
    }

    updateFilters() {
        this.updateRepoFilter();
        this.updateTypeFilter();
        this.updateLanguageFilter();
        this.updateDeveloperFilter();
    }

    updateRepoFilter() {
        const repoMap = new Map();
        this.allPlugins.forEach(p => (p.repos || []).forEach(r => { repoMap.set(r.name, (repoMap.get(r.name) || 0) + 1); }));
        const repos = Array.from(repoMap.entries()).sort((a,b) => b[1]-a[1]);
        const select = document.getElementById('repoFilter');
        if (!select) return;
        select.innerHTML = '<option value="">Tüm Depolar</option>';
        repos.forEach(([name,count]) => { const opt = document.createElement('option'); opt.value = name; opt.textContent = `${name} (${count})`; select.appendChild(opt); });
    }

    updateTypeFilter() {
        const canonical = new Map(); const counts = new Map();
        this.allPlugins.forEach(p => { (p._tvTypeKeys || []).forEach((k, idx) => { if (!k) return; const mapped = this.typeMap[k] || (p._tvTypeDisplays && p._tvTypeDisplays[idx]) || k; if (!canonical.has(k)) canonical.set(k,mapped); counts.set(k,(counts.get(k)||0)+1); }); });
        const entries = Array.from(canonical.entries()).sort((a,b) => a[1].localeCompare(b[1],'tr'));
        const select = document.getElementById('typeFilter'); if (!select) return;
        select.innerHTML = '<option value="">Tüm Türler</option>';
        entries.forEach(([key,display]) => { const count = counts.get(key) || 0; const option = document.createElement('option'); option.value = key; option.textContent = `${display} (${count})`; select.appendChild(option); });
    }

    updateLanguageFilter() {
        const languages = [...new Set(this.allPlugins.map(p => p.language).filter(Boolean))].sort();
        const select = document.getElementById('languageFilter'); if (!select) return;
        select.innerHTML = '<option value="">Tüm Diller</option>';
        languages.forEach(lang => { const count = this.allPlugins.filter(p => p.language === lang).length; const displayName = lang === 'tr' ? 'Türkçe' : lang === 'en' ? 'İngilizce' : lang === 'ar' ? 'Arapça' : lang === 'az' ? 'Azerbaycan Türkçesi' : lang === 'de' ? 'Almanca' : lang === 'es' ? 'İspanyolca' : lang === 'hi' ? 'Hintçe' : lang === 'id' ? 'Endonezce' : lang === 'jp' ? 'Japonca' : lang === 'ru' ? 'Rusça' :  (lang || '').toUpperCase(); const opt = document.createElement('option'); opt.value = lang; opt.textContent = `${displayName} (${count})`; select.appendChild(opt); });
    }

    updateDeveloperFilter() {
        // build map: canon -> display name
        const devMap = new Map();
        this.allPlugins.forEach(p => { (p.authors || []).forEach((a, idx) => {
            const canon = (p.authorsCanonical && p.authorsCanonical[idx]) ? p.authorsCanonical[idx] : this.canonicalAuthor(a);
            if (!devMap.has(canon)) devMap.set(canon, a);
        }); });

        // build counts: canon -> number of plugins that include that canon
        const counts = new Map();
        this.allPlugins.forEach(p => {
            (p.authorsCanonical || []).forEach(canon => {
                counts.set(canon, (counts.get(canon) || 0) + 1);
            });
        });

        const select = document.getElementById(this.developerFilterId);
        if (!select) return;
        select.innerHTML = '<option value="">Tüm Geliştiriciler</option>';

        // create array of [canon, display, count] and sort by count desc, then by name (tr)
        const items = Array.from(devMap.entries()).map(([canon, display]) => {
            return { canon, display, count: counts.get(canon) || 0 };
        });

        items.sort((a, b) => {
            if (b.count !== a.count) return b.count - a.count; // çok -> az
            return a.display.localeCompare(b.display, 'tr'); // eşitse isim sıralaması
        });

        items.forEach(it => {
            const opt = document.createElement('option');
            opt.value = it.canon;
            opt.textContent = `${it.display} (${it.count})`;
            select.appendChild(opt);
        });
    }

    filterPlugins() {
        const repoFilter = (document.getElementById('repoFilter') || {value:''}).value;
        const typeFilter = (document.getElementById('typeFilter') || {value:''}).value;
        const languageFilter = (document.getElementById('languageFilter') || {value:''}).value;
        const searchQuery = ((document.getElementById('searchInput') || {value:''}).value || '').toLowerCase();
        const devFilter = (document.getElementById(this.developerFilterId) || {value:''}).value;

        this.filteredPlugins = this.allPlugins.filter(plugin => {
            const hasNsfw = ((plugin.tvTypes || []).map(t=>t.toLowerCase()).includes('nsfw'));
            if (hasNsfw && !this.adultConfirmed) return false;
            if (repoFilter) { const repoNames = (plugin.repos || []).map(r=>r.name); if (!repoNames.includes(repoFilter)) return false; }
            if (typeFilter) { if (!((plugin._tvTypeKeys || []).includes(typeFilter))) return false; }
            if (languageFilter && plugin.language !== languageFilter) return false;
            if (devFilter) { if (!((plugin.authorsCanonical || []).includes(devFilter))) return false; }
            if (searchQuery) { const searchText = `${plugin.name} ${plugin.description || ''} ${(plugin.repos || []).map(r=>r.name+' '+r.code).join(' ')}`.toLowerCase(); if (!searchText.includes(searchQuery)) return false; }
            return true;
        });

        this.renderPlugins();
    }

    randomColorHsl() { const h = Math.floor(Math.random() * 360); const s = 65; const l = 55; return `hsl(${h} ${s}% ${l}%)`; }
    textColorForHsl(hsl) { const m = hsl.match(/hsl\(\s*\d+\s+\d+%?\s+(\d+)%?\s*\)/); let l=50; if(m&&m[1]) l=parseInt(m[1],10); return l>60?'#333':'#fff'; }

    generateTypeColors() {
        const allTypes = new Set(); this.allPlugins.forEach(p => (p._tvTypeKeys || []).forEach(k => allTypes.add(k)));
        allTypes.forEach(t => { if (!t) return; if (t === 'nsfw') { this.typeColors[t]='#feca57'; this.typeTextColors[t]='#333'; } else { const c = this.randomColorHsl(); this.typeColors[t]=c; this.typeTextColors[t]=this.textColorForHsl(c); }});
    }

    colorForCode(code) { const hash = Array.from(code || '').reduce((a,c)=>a + c.charCodeAt(0), 0); const h = hash % 360; return `hsl(${h} 70% 80%)`; }

    // ----------------------------
    // Yeni eklenen: author renkleri & YENİ badge mantığı uygulama
    // ----------------------------
    hashToHue(str) {
        let hash = 0;
        if (!str) return 200;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
            hash = hash & hash;
        }
        return Math.abs(hash) % 360;
    }

    applyAuthorColors(root = document) {
        const isDark = document.body.classList.contains('dark-theme');
        const elems = (root.querySelectorAll) ? root.querySelectorAll('.author-badge') : [];
        elems.forEach(el => {
            const nameCanon = el.getAttribute('data-author-canon') || el.dataset.authorCanon || this.canonicalAuthor(el.textContent || '');
            const hue = this.hashToHue(nameCanon || 'anon');
            const s = 62;
            const l = isDark ? 44 : 52;
            const bg = `hsl(${hue} ${s}% ${l}%)`;
            el.style.background = bg;
            el.style.color = (l < 55) ? '#fff' : '#111';
            el.style.border = '1px solid rgba(0,0,0,0.06)';
            el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
            el.style.padding = el.style.padding || '4px 10px';
            el.style.borderRadius = el.style.borderRadius || '12px';
            // ensure canonical stored for later clicks
            el.setAttribute('data-author-canon', nameCanon);
        });
    }

    getLastVisitMs() {
        const val = localStorage.getItem(this.LS_LAST_VISIT);
        return val ? Number(val) : null;
    }
    setLastVisitMs(ms) {
        localStorage.setItem(this.LS_LAST_VISIT, String(ms));
    }
    markPluginSeen(pid, nowMs) {
        localStorage.setItem(this.LS_PLUGIN_SEEN_PREFIX + pid, String(nowMs));
    }
    getPluginSeenMs(pid) {
        const v = localStorage.getItem(this.LS_PLUGIN_SEEN_PREFIX + pid);
        return v ? Number(v) : null;
    }

    applyNewBadges(root = document) {
        const lastVisit = this.getLastVisitMs();
        const now = Date.now();

        // If first visit (no lastVisit) -> do not show any NEW badges
        if (!lastVisit) return;

        // iterate plugin cards inside root
        const cards = (root.querySelectorAll) ? Array.from(root.querySelectorAll('.plugin-card')) : [];
        cards.forEach(card => {
            const pid = card.getAttribute('data-plugin-id') || (card.querySelector('.plugin-name')?.textContent || '').trim();
            const created = card.getAttribute('data-created-at') || card.dataset.createdAt || '';
            const createdMs = created ? Date.parse(created) : null;
            if (!createdMs) {
                // fallback: if plugin object had _isNew from markNewPluginsAndSaveCount, we keep that as initial marker
                const shouldBasic = card.getAttribute('data-is-new') === 'true';
                if (shouldBasic) {
                    // treat as newly added during merge (mark seen now)
                    const seen = this.getPluginSeenMs(pid);
                    if (!seen) { this.markPluginSeen(pid, now); this._appendNewBadge(card); }
                } else {
                    this._removeNewBadge(card);
                }
                return;
            }

            // if created after last visit -> candidate for NEW
            if (createdMs > lastVisit) {
                const seenMs = this.getPluginSeenMs(pid);
                if (!seenMs) {
                    // first time showing to this user => stamp seen time and show
                    this.markPluginSeen(pid, now);
                    this._appendNewBadge(card);
                } else {
                    const ageDays = (now - seenMs) / (1000*60*60*24);
                    if (ageDays <= this.NEW_DURATION_DAYS) this._appendNewBadge(card);
                    else this._removeNewBadge(card);
                }
            } else {
                // not newer than last visit -> ensure removed
                this._removeNewBadge(card);
            }
        });
    }

    _appendNewBadge(card) {
        if (!card || !card.querySelector) return;
        if (card.querySelector('.badge-new')) return;
        // find plugin-name-row to append next to title
        const row = card.querySelector('.plugin-name-row') || card.querySelector('.plugin-name') || card;
        const span = document.createElement('span');
        span.className = 'badge-new';
        span.textContent = 'YENİ';
        // prefer small inline style (class in CSS should style it; fallback here)
        span.style.marginLeft = '6px';
        span.style.padding = '4px 8px';
        span.style.background = 'linear-gradient(90deg,#ff7a59,#ffca59)';
        span.style.color = '#111';
        span.style.fontWeight = '800';
        span.style.borderRadius = '999px';
        span.style.fontSize = '0.75rem';
        span.style.boxShadow = '0 3px 10px rgba(0,0,0,0.12)';
        row.appendChild(span);
    }

    _removeNewBadge(card) {
        if (!card) return;
        const n = card.querySelector('.badge-new');
        if (n) n.remove();
    }

    renderPlugins() {
        const grid = document.getElementById('pluginsGrid');
        const noResults = document.getElementById('noResults');
        if (!grid) return;
        if (this.filteredPlugins.length === 0) { grid.innerHTML = ''; if (noResults) noResults.style.display = 'block'; return; }
        if (noResults) noResults.style.display = 'none';

        // include data-plugin-id and data-created-at attributes in card HTML
        grid.innerHTML = this.filteredPlugins.map(plugin => this.createPluginCard(plugin)).join('');
        // after injecting HTML -> apply colors & NEW badges & attach listeners
        this.applyAuthorColors(grid);
        // set data-is-new on cards for fallback (markNewPluginsAndSaveCount)
        document.querySelectorAll('.plugin-card').forEach((card, idx) => {
            // find plugin by name to check _isNew flag
            const title = (card.querySelector('.plugin-name')?.textContent || '').trim();
            const matched = this.filteredPlugins.find(p => (p.name||'').trim() === title);
            if (matched && matched._isNew) card.setAttribute('data-is-new', 'true');
            else card.removeAttribute('data-is-new');
        });

        // initialize each card to show the first repo's data (per-repo view)
        this.initializeCardsRepoView();

        // apply NEW badge logic (based on last visit & per-plugin seen timestamps)
        this.applyNewBadges(grid);

        this.attachCardListeners();
    }

    attachCardListeners() {
        document.querySelectorAll('.author-badge').forEach(b => {
            if (b._bound) return; b._bound = true;
            b.addEventListener('click', (ev) => {
                const canon = b.dataset.authorCanon || b.getAttribute('data-author-canon') || this.canonicalAuthor(b.textContent || '');
                const devSelect = document.getElementById(this.developerFilterId);
                if (devSelect) { devSelect.value = canon; this.filterPlugins(); }
                b.classList.add('author-selected'); setTimeout(()=> b.classList.remove('author-selected'), 900);
            });
        });

        // tiklayinca filtreleme yerine kisakod kullanmaya cevirdim acarsam geri gelecek
        // document.querySelectorAll('.repo-badge').forEach(r => {
            // if (r._bound) return; r._bound = true;
            // r.addEventListener('click', (ev) => {
                // const repoNameSpan = r.querySelector('.repo-name');
                // if (repoNameSpan) {
                    // const name = repoNameSpan.textContent || '';
                    // const repoSelect = document.getElementById('repoFilter');
                    // if (repoSelect) { repoSelect.value = name; this.filterPlugins(); }
                // }
                // if (ev && ev.preventDefault) ev.preventDefault();
                // r.classList.add('repo-selected'); setTimeout(()=> r.classList.remove('repo-selected'), 800);
            // });
        // });

        // card-level repo select (switch per-repo view inside card)
        document.querySelectorAll('.card-repo-select').forEach(sel => {
            if (sel._bound) return;
            sel._bound = true;
            sel.addEventListener('change', (ev) => {
                const option = sel.options[sel.selectedIndex];
                const per = option ? option.getAttribute('data-per') : null;
                const card = sel.closest('.plugin-card');
                if (!card) return;
                if (!per) return;
                try {
                    const perObj = JSON.parse(decodeURIComponent(per));
                    this.updateCardFromPerRepoData(card, perObj);
                } catch (err) {
                    if (this.debug) console.warn('failed to parse per-repo data', err);
                }
            });
        });
    }

    // initialize each card's displayed data to the first repo's per-repo data
    initializeCardsRepoView() {
        document.querySelectorAll('.plugin-card').forEach(card => {
            const sel = card.querySelector('.card-repo-select');
            if (!sel) return;
            const option = sel.options[sel.selectedIndex] || sel.options[0];
            if (!option) return;
            const per = option.getAttribute('data-per');
            if (!per) return;
            try {
                const perObj = JSON.parse(decodeURIComponent(per));
                this.updateCardFromPerRepoData(card, perObj);
            } catch (err) {
                if (this.debug) console.warn('init per-repo parse failed', err);
            }
        });
    }

    updateCardFromPerRepoData(card, perObj) {
        if (!card || !perObj) return;
        // update version
        const verEl = card.querySelector('.plugin-version');
        if (verEl) verEl.textContent = perObj.version ? `v${this.escapeHtml(perObj.version)}` : verEl.textContent;

        // update icon
        const iconEl = card.querySelector('.plugin-icon');
        if (iconEl && perObj.iconUrl) iconEl.src = perObj.iconUrl.replace('%size%','48');

        // update description
        const descEl = card.querySelector('.plugin-description');
        if (descEl) descEl.textContent = perObj.description || '';

        // update language
        const langEl = card.querySelector('.plugin-language');
        if (langEl) {
            const lang = perObj.language === 'tr' ? 'Türkçe' : perObj.language === 'en' ? 'İngilizce' : (perObj.language || 'Bilinmiyor').toUpperCase();
            langEl.textContent = lang;
        }

        // update created-at attribute (for NEW badge logic)
        if (perObj.created_at) card.setAttribute('data-created-at', perObj.created_at);
        else card.removeAttribute('data-created-at');

        // update authors block (replace with per-repo authors)
        const authorsBlock = card.querySelector('.plugin-authors');
        if (authorsBlock) {
            // keep label element if exists
            const label = authorsBlock.querySelector('.author-label');
            let inner = '';
            if (perObj.authors && perObj.authors.length > 0) {
                inner = perObj.authors.map(a => {
                    const canon = this.canonicalAuthor(a || '');
                    return `<span class="author-badge" data-author-canon="${this.escapeHtml(canon)}">${this.escapeHtml(a)}</span>`;
                }).join('');
            } else {
                inner = `<span class="author-badge">${this.escapeHtml(card.querySelector('.plugin-name')?.textContent || 'Bilinmiyor')}</span>`;
            }
            // rebuild authorsBlock content
            authorsBlock.innerHTML = (label ? label.outerHTML : '') + inner;
            // re-apply colors for new badges
            this.applyAuthorColors(authorsBlock);
            // re-attach author click listeners (so they work after replacement)
            authorsBlock.querySelectorAll('.author-badge').forEach(b => { b._bound = false; });
        }
    }

    createPluginCard(plugin) {
        const iconUrl = plugin.iconUrl ? plugin.iconUrl.replace('%size%','48') : 'https://via.placeholder.com/48?text=?';
        const typesArr = (plugin.tvTypes || []).filter(t => (t.toLowerCase() !== 'nsfw' || this.adultConfirmed));
        const types = typesArr.map(type => {
            const tkey = type.toLowerCase();
            const displayName = this.typeMap[tkey] || type;
            const bg = this.typeColors[tkey] || this.randomColorHsl();
            const txt = this.typeTextColors[tkey] || this.textColorForHsl(bg);
            return `<span class="type-badge" style="background:${bg}; color:${txt}">${displayName}</span>`;
        }).join('');
        const language = plugin.language === 'tr' ? 'Türkçe' : plugin.language === 'en' ? 'İngilizce'  : plugin.language === 'jp' ? 'Japonca' :  plugin.language === 'es' ? 'İspanyolca' :  plugin.language === 'az' ? 'Azerbaycan Türkçesi' :  plugin.language === 'id' ? 'Endonezce' :  plugin.language === 'hi' ? 'Hintçe' :  plugin.language === 'ru' ? 'Rusça' :  plugin.language === 'ar' ? 'Arapça' : (plugin.language || 'Bilinmiyor').toUpperCase();

        // build repo badges (links) and prepare per-repo option data
        const reposHtml = (plugin.repos || []).map(r => {
            const repo = this.repos.find(repo => repo.code === r.code);
            const redirectUrl = repo ? repo.redirectUrl : `https://kraptor123.github.io/redirect/?r=cloudstreamrepo://${r.code}`;
            const color = (this.repoColors && this.repoColors[r.code]) ? this.repoColors[r.code] : this.colorForCode(r.code);
            return `<a href="${redirectUrl}" class="repo-badge" style="background:${color}; color:#000"><span class="repo-name">${this.escapeHtml(r.name)}</span><span class="repo-code">${this.escapeHtml(r.code)}</span></a>`;
        }).join('');

        // build card-level repo select (if multiple repos)
        let repoSelectHtml = '';
        if ((plugin.repos || []).length > 1) {
            const options = (plugin.repos || []).map((r, idx) => {
                const perObj = plugin._perRepoData && plugin._perRepoData[r.code] ? plugin._perRepoData[r.code] : {
                    version: plugin.version || '',
                    authors: plugin.authors || [],
                    authorsCanonical: plugin.authorsCanonical || [],
                    iconUrl: plugin.iconUrl || '',
                    description: plugin.description || '',
                    language: plugin.language || '',
                    created_at: plugin.created_at || ''
                };
                const encoded = encodeURIComponent(JSON.stringify(perObj));
                const selected = idx === 0 ? ' selected' : '';
                return `<option value="${this.escapeHtml(r.code)}" data-per="${encoded}"${selected}>${this.escapeHtml(r.name)}</option>`;
            }).join('');
            repoSelectHtml = `<div class="repo-sec" style="margin-bottom:8px"><label style="font-size:0.8rem;margin-bottom:4px;display:block;color:inherit">Repo seç</label><select class="card-repo-select">${options}</select></div>`;
        }

        // prepare authorsHtml: default global authors (will be replaced by per-repo selection if user chooses)
        let authorsHtml = '';
        const authorsDisplay = (plugin.authors && plugin.authors.length > 0) ? plugin.authors.map((author, idx) => {
            const canon = (plugin.authorsCanonical && plugin.authorsCanonical[idx]) ? plugin.authorsCanonical[idx] : this.canonicalAuthor(author);
            return `<span class="author-badge" data-author-canon="${this.escapeHtml(canon)}">${this.escapeHtml(author)}</span>`;
        }).join('') : '';

         if (authorsDisplay) {
            authorsHtml = `<div class="plugin-authors"><span class="author-label"></span>${authorsDisplay}</div>`;
        } else {
            // if no global authors, but per-repo data exists, plugin_authors container still rendered so we can populate
            authorsHtml = `<div class="plugin-authors"><span class="author-label"></span></div>`;
        }


        // new badge handled after render (applyNewBadges), but keep the plugin._isNew as data-if present
        const dataCreated = plugin.created_at ? this.escapeHtml(plugin.created_at) : '';
        const pid = this.escapeHtml(plugin.id || plugin.name || (Math.random().toString(36).slice(2,9)));
        const createdAttr = dataCreated ? ` data-created-at="${dataCreated}"` : '';
        const isNewAttr = plugin._isNew ? ` data-is-new="true"` : '';

        // build initial version display: use plugin.version but it will be updated by per-repo init
        const verText = plugin.version ? this.escapeHtml(plugin.version) : '1';

        return `<div class="plugin-card" data-plugin-id="${pid}"${createdAttr}${isNewAttr}>
            <div class="plugin-language">${this.escapeHtml(language)}</div>
            <div class="plugin-header">
                <img class="plugin-icon" src="${this.escapeHtml(iconUrl)}" alt="${this.escapeHtml(plugin.name)}" loading="lazy" onerror="this.src='https://via.placeholder.com/48?text=?'">
                <div class="plugin-info">
                    <div class="plugin-name-row" style="display:flex;gap:8px;align-items:center">
                        <div class="plugin-name" title="${this.escapeHtml(plugin.name||'İsimsiz')}">${this.escapeHtml(plugin.name||'İsimsiz')}</div>
                        <div class="plugin-version">v${verText}</div>
                    </div>
                    
                    <div class="plugin-repos">${reposHtml}</div>
                </div>
            </div>
            <div class="plugin-description">${this.escapeHtml(plugin.description||'Açıklama bulunmuyor.')}</div>
            <div class="plugin-meta"><div class="plugin-types">${types}</div></div>
            ${repoSelectHtml}
            ${authorsHtml}
        </div>`;
    }

    escapeHtml(s) { if (!s && s !== 0) return ''; return String(s).replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; }); }
}

document.addEventListener('DOMContentLoaded', () => { new CloudStreamBrowser(); });
