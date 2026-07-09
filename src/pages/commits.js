import React, { useState, useEffect, useMemo } from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './commits.module.css';

export default function CommitsPage() {
    const { siteConfig } = useDocusaurusContext();

    const [commits, setCommits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAuthor, setSelectedAuthor] = useState('all');
    const [selectedTag, setSelectedTag] = useState('all');
    const [onlyHighlighted, setOnlyHighlighted] = useState(false);

    const getAuthorColor = (author) => {
        const authorLower = author?.toLowerCase();
        if (authorLower?.includes('byayzen')) return 'var(--author-color-byayzen)';
        if (authorLower?.includes('kraptor')) return 'var(--author-color-kraptor)';
        if (authorLower?.includes('trup40') || authorLower?.includes('eagle')) return 'var(--author-color-trup40)';
        if (authorLower?.includes('github-actions') || authorLower?.includes('bot')) return 'var(--author-color-bot)';
        return 'inherit';
    };

    const formatAuthorName = (author) => {
        if (author?.toLowerCase().includes('github-actions[bot]')) {
            return 'Github Botu';
        }
        return author;
    };

    useEffect(() => {
        const dataPath = `${siteConfig.baseUrl}data/commit-notes.json`.replace(/\/+/g, '/');

        fetch(`${dataPath}?t=${new Date().getTime()}`)
            .then(res => {
                if (!res.ok) throw new Error('Veri dosyası bulunamadı');
                return res.json();
            })
            .then(data => {
                const commitsArray = Object.values(data).sort((a, b) =>
                    new Date(b.date) - new Date(a.date)
                );
                setCommits(commitsArray);
                setLoading(false);
            })
            .catch(err => {
                console.error('Veri yükleme hatası:', err);
                setLoading(false);
            });
    }, [siteConfig.baseUrl]);

    const filterOptions = useMemo(() => {
        const authors = new Set();
        const tags = new Set();
        const excludedTags = ['gradle', 'gradlew', '__temel', '__playertest'];

        commits.forEach(commit => {
            const formatted = formatAuthorName(commit.author);
            if (commit.author && formatted !== 'Github Botu') {
                authors.add(formatted);
            }
            if (commit.tags && Array.isArray(commit.tags)) {
                commit.tags.forEach(tag => {
                    const tagLower = tag.toLowerCase();
                    if (!excludedTags.includes(tagLower)) {
                        tags.add(tag);
                    }
                });
            }
        });

        return {
            authors: Array.from(authors).sort(),
            tags: Array.from(tags).sort()
        };
    }, [commits]);

    const filteredCommits = commits.filter(commit => {
        if (commit.hidden === true) return false;

        if (formatAuthorName(commit.author) === 'Github Botu') return false;

        const commitTags = (commit.tags || []).map(t => t.toLowerCase());
        if (commitTags.includes('__temel') || commitTags.includes('__playertest')) return false;

        if (onlyHighlighted && !commit.highlight) return false;
        if (selectedAuthor !== 'all') {
            const formattedAuthor = formatAuthorName(commit.author);
            if (formattedAuthor !== selectedAuthor) return false;
        }
        if (selectedTag !== 'all') {
            if (!commit.tags || !commit.tags.includes(selectedTag)) return false;
        }
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            commit.message.toLowerCase().includes(searchLower) ||
            (commit.description || "").toLowerCase().includes(searchLower) ||
            (commit.note || "").toLowerCase().includes(searchLower);
        return matchesSearch;
    });

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedAuthor('all');
        setSelectedTag('all');
        setOnlyHighlighted(false);
    };

    if (loading) return (
        <Layout title="Yükleniyor...">
            <div className={styles.commitsPage} style={{ textAlign: 'center', padding: '10rem 0' }}>
                <div className={styles.header}>
                    <h1>Yükleniyor</h1>
                    <p>Günlük verileri hazırlanıyor...</p>
                </div>
            </div>
        </Layout>
    );

    return (
        <Layout title="Geliştirme Günlüğü" description="Proje teknik detayları ve commit notları">
            <div className={styles.commitsPage}>
                <header className={styles.header}>
                    <h1>🚀 Geliştirme Günlüğü</h1>
                    <p>Sistemdeki tüm teknik değişimlerin kronolojik listesi.</p>
                </header>

                <section className={styles.filterSection}>
                    <div className={styles.filterGrid}>
                        <div className={styles.inputGroup}>
                            <label>🔍 Keşfet</label>
                            <input
                                type="text"
                                placeholder="Başlık veya not ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label>👤 Geliştirici</label>
                            <select
                                value={selectedAuthor}
                                onChange={(e) => setSelectedAuthor(e.target.value)}
                            >
                                <option value="all">Tümü</option>
                                {filterOptions.authors.map(author => (
                                    <option key={author} value={author}>{author}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.inputGroup}>
                            <label>📦 Eklenti</label>
                            <select
                                value={selectedTag}
                                onChange={(e) => setSelectedTag(e.target.value)}
                            >
                                <option value="all">Tümü</option>
                                {filterOptions.tags.map(tag => (
                                    <option key={tag} value={tag}>{tag}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className={styles.filterActions}>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={onlyHighlighted}
                                onChange={(e) => setOnlyHighlighted(e.target.checked)}
                            />
                            <span>⭐ Sadece Kritik Güncellemeler</span>
                        </label>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <span style={{ fontWeight: '700', opacity: 0.8 }}>
                                {filteredCommits.length} Kayıt
                            </span>
                            {(searchTerm || selectedAuthor !== 'all' || selectedTag !== 'all' || onlyHighlighted) && (
                                <button
                                    onClick={clearFilters}
                                    style={{
                                        border: 'none',
                                        background: 'var(--md-sys-color-error)',
                                        color: 'white',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '50px',
                                        cursor: 'pointer',
                                        fontWeight: '700'
                                    }}
                                >
                                    Sıfırla
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                <div className={styles.commitList}>
                    {filteredCommits.length === 0 ? (
                        <div className={styles.emptyState}>
                            <h2>Sonuç bulunamadı</h2>
                            <p>Farklı bir şeyler aramayı deneyin.</p>
                        </div>
                    ) : (
                        filteredCommits.map(commit => {
                            const formattedAuthorName = formatAuthorName(commit.author);
                            const authorColor = getAuthorColor(commit.author);

                            return (
                                <article
                                    key={commit.sha}
                                    className={`${styles.commitCard} ${commit.highlight ? styles.highlighted : ''}`}
                                >
                                    <div className={styles.cardHeader}>
                                        <div className={styles.authorBox}>
                                            {commit.avatar ? (
                                                <img
                                                    src={commit.avatar}
                                                    alt={formattedAuthorName}
                                                    className={styles.avatar}
                                                />
                                            ) : (
                                                <div className={styles.avatar} style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '1.5rem',
                                                    background: 'var(--md-sys-color-primary-container)'
                                                }}>
                                                    👤
                                                </div>
                                            )}
                                            <div className={styles.authorMeta}>
                                                <span className={styles.authorName} style={{ color: authorColor }}>
                                                    {formattedAuthorName}
                                                </span>
                                                <span className={styles.dateSha}>
                                                    {new Date(commit.date).toLocaleDateString('tr-TR', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                    <code className={styles.shaCode}>
                                                        {commit.sha.substring(0, 7)}
                                                    </code>
                                                </span>
                                            </div>
                                        </div>
                                        {commit.highlight && (
                                            <span style={{ fontSize: '1.8rem' }}>✨</span>
                                        )}
                                    </div>

                                    <div className={styles.cardBody}>
                                        <h2 className={styles.messageTitle}>
                                            {commit.message}
                                        </h2>

                                        {commit.description && (
                                            <div className={styles.description}>
                                                {commit.description}
                                            </div>
                                        )}

                                        {commit.note && (
                                            <div className={styles.note}>
                                                <span style={{ fontSize: '1.5rem' }}>💡</span>
                                                <div>
                                                    <strong>İpucu:</strong> {commit.note}
                                                </div>
                                            </div>
                                        )}

                                        {commit.tags && commit.tags.length > 0 && (
                                            <div className={styles.tags}>
                                                {commit.tags
                                                    .filter(tag => !['gradle', 'gradlew', '__temel', '__playertest'].includes(tag.toLowerCase()))
                                                    .map(tag => (
                                                        <span
                                                            key={tag}
                                                            onClick={() => setSelectedTag(tag)}
                                                            className={`${styles.tag} ${selectedTag === tag ? styles.tagActive : ''}`}
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                </article>
                            );
                        })
                    )}
                </div>
            </div>
        </Layout>
    );
}
