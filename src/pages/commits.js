import React, { useState, useEffect, useMemo } from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function CommitsPage() {
    const { siteConfig } = useDocusaurusContext();

    // Veri State'leri
    const [commits, setCommits] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filtre State'leri
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAuthor, setSelectedAuthor] = useState('all'); // Geliştirici Filtresi
    const [selectedTag, setSelectedTag] = useState('all');       // Eklenti/Tag Filtresi
    const [onlyHighlighted, setOnlyHighlighted] = useState(false); // Sadece Önemliler

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
    }, []);

    // Verilerden dinamik olarak filtre listelerini oluşturuyoruz (Tekrar tekrar hesaplamamak için useMemo)
    const filterOptions = useMemo(() => {
        const authors = new Set();
        const tags = new Set();

        commits.forEach(commit => {
            if (commit.author) authors.add(commit.author);
            if (commit.tags && Array.isArray(commit.tags)) {
                commit.tags.forEach(tag => tags.add(tag));
            }
        });

        return {
            authors: Array.from(authors).sort(),
            tags: Array.from(tags).sort()
        };
    }, [commits]);

    // Filtreleme Mantığı
    const filteredCommits = commits.filter(commit => {
        if (commit.hidden === true) return false;

        // 1. Öne Çıkanlar Filtresi
        if (onlyHighlighted && !commit.highlight) return false;

        // 2. Geliştirici Filtresi
        if (selectedAuthor !== 'all' && commit.author !== selectedAuthor) return false;

        // 3. Eklenti/Tag Filtresi
        if (selectedTag !== 'all') {
            if (!commit.tags || !commit.tags.includes(selectedTag)) return false;
        }

        // 4. Metin Arama
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            commit.message.toLowerCase().includes(searchLower) ||
            (commit.description || "").toLowerCase().includes(searchLower) ||
            (commit.note || "").toLowerCase().includes(searchLower);

        return matchesSearch;
    });

    // Temizle butonu için fonksiyon
    const clearFilters = () => {
        setSearchTerm('');
        setSelectedAuthor('all');
        setSelectedTag('all');
        setOnlyHighlighted(false);
    };

    if (loading) return (
        <Layout title="Yükleniyor...">
            <div style={{ textAlign: 'center', padding: '5rem', fontSize: '1.2rem' }}>Günlük verileri hazırlanıyor...</div>
        </Layout>
    );

    return (
        <Layout title="Geliştirme Günlüğü" description="Proje teknik detayları ve commit notları">
            <div className="container" style={{ padding: '3rem 0', maxWidth: '1000px' }}>
                <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '10px' }}>🚀 Geliştirme Günlüğü</h1>
                    <p style={{ fontSize: '1.1rem', opacity: 0.7 }}>Sistemdeki tüm teknik değişimlerin kronolojik listesi.</p>
                </header>

                {/* Gelişmiş Filtreleme Alanı */}
                <div style={{
                    marginBottom: '2.5rem',
                    padding: '1.5rem',
                    backgroundColor: 'var(--ifm-color-emphasis-100)',
                    borderRadius: '16px',
                    border: '1px solid var(--ifm-color-emphasis-200)'
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>

                        {/* Arama Kutusu */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', marginLeft: '5px' }}>🔍 Arama</label>
                            <input
                                type="text"
                                placeholder="Başlık veya not ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    padding: '0.6rem 1rem', borderRadius: '8px',
                                    border: '1px solid var(--ifm-color-emphasis-300)',
                                    backgroundColor: 'var(--ifm-background-color)'
                                }}
                            />
                        </div>

                        {/* Geliştirici Seçimi */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', marginLeft: '5px' }}>👤 Geliştirici</label>
                            <select
                                value={selectedAuthor}
                                onChange={(e) => setSelectedAuthor(e.target.value)}
                                style={{
                                    padding: '0.6rem', borderRadius: '8px',
                                    border: '1px solid var(--ifm-color-emphasis-300)',
                                    backgroundColor: 'var(--ifm-background-color)'
                                }}
                            >
                                <option value="all">Tümü</option>
                                {filterOptions.authors.map(author => (
                                    <option key={author} value={author}>{author}</option>
                                ))}
                            </select>
                        </div>

                        {/* Eklenti/Modül Seçimi (Tags) */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', marginLeft: '5px' }}>📦 Eklenti / Modül</label>
                            <select
                                value={selectedTag}
                                onChange={(e) => setSelectedTag(e.target.value)}
                                style={{
                                    padding: '0.6rem', borderRadius: '8px',
                                    border: '1px solid var(--ifm-color-emphasis-300)',
                                    backgroundColor: 'var(--ifm-background-color)'
                                }}
                            >
                                <option value="all">Tümü</option>
                                {filterOptions.tags.map(tag => (
                                    <option key={tag} value={tag}>{tag}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Alt Satır: Checkbox ve Sonuç Sayısı */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingTop: '10px', borderTop: '1px solid var(--ifm-color-emphasis-200)' }}>

                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px', userSelect: 'none' }}>
                            <input
                                type="checkbox"
                                checked={onlyHighlighted}
                                onChange={(e) => setOnlyHighlighted(e.target.checked)}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <span style={{ fontWeight: '600' }}>⭐ Sadece Önemli Güncellemeler</span>
                        </label>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                                <strong>{filteredCommits.length}</strong> kayıt bulundu
                            </span>
                            {(searchTerm || selectedAuthor !== 'all' || selectedTag !== 'all' || onlyHighlighted) && (
                                <button
                                    onClick={clearFilters}
                                    style={{
                                        border: 'none', background: 'none', color: 'var(--ifm-color-danger)',
                                        cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline'
                                    }}
                                >
                                    Filtreleri Temizle
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Liste */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {filteredCommits.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.5, border: '2px dashed var(--ifm-color-emphasis-300)', borderRadius: '15px' }}>
                            <h3>Sonuç bulunamadı 😔</h3>
                            <p>Filtreleri değiştirerek tekrar deneyin.</p>
                        </div>
                    ) : (
                        filteredCommits.map(commit => (
                            <article key={commit.sha} style={{
                                border: '1px solid var(--ifm-color-emphasis-300)',
                                borderRadius: '16px', padding: '1.5rem',
                                backgroundColor: commit.highlight ? 'rgba(230, 126, 34, 0.04)' : 'var(--ifm-card-background-color)',
                                borderLeft: commit.highlight ? '5px solid #e67e22' : '1px solid var(--ifm-color-emphasis-300)',
                                position: 'relative', overflow: 'hidden'
                            }}>
                                {/* Header: Avatar, İsim, Tarih */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        {commit.avatar ? (
                                            <img src={commit.avatar} alt={commit.author} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid var(--ifm-background-color)' }} />
                                        ) : (
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>👤</div>
                                        )}
                                        <div>
                                            <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{commit.author}</div>
                                            <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                                                {new Date(commit.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                {' • '}
                                                <code style={{ fontSize: '0.7rem', opacity: 0.8 }}>{commit.sha.substring(0, 7)}</code>
                                            </div>
                                        </div>
                                    </div>
                                    {commit.highlight && <span style={{ fontSize: '1.5rem' }} title="Önemli Güncelleme">⭐</span>}
                                </div>

                                {/* İçerik */}
                                <div style={{ paddingLeft: '52px' }}>
                                    <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', color: 'var(--ifm-color-primary)' }}>
                                        {commit.message}
                                    </h2>

                                    {commit.description && (
                                        <div style={{ fontSize: '0.95rem', opacity: 0.85, whiteSpace: 'pre-wrap', marginBottom: '1rem', lineHeight: '1.5' }}>
                                            {commit.description}
                                        </div>
                                    )}

                                    {commit.note && (
                                        <div style={{
                                            marginTop: '1rem', padding: '0.8rem 1rem',
                                            backgroundColor: 'var(--ifm-color-info-lightest)',
                                            borderRadius: '8px', borderLeft: '3px solid var(--ifm-color-info)',
                                            fontSize: '0.9rem', color: 'var(--ifm-color-content)'
                                        }}>
                                            <strong>💡 Not:</strong> {commit.note}
                                        </div>
                                    )}

                                    {/* Etiketler */}
                                    {commit.tags && commit.tags.length > 0 && (
                                        <div style={{ marginTop: '1rem', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                            {commit.tags.map(tag => (
                                                <span
                                                    key={tag}
                                                    onClick={() => setSelectedTag(tag)} // Etikete tıklayınca filtrele
                                                    style={{
                                                        fontSize: '0.75rem', padding: '2px 10px', borderRadius: '12px',
                                                        backgroundColor: selectedTag === tag ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-200)',
                                                        color: selectedTag === tag ? '#fff' : 'var(--ifm-color-emphasis-700)',
                                                        fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
                                                    }}
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </article>
                        ))
                    )}
                </div>
            </div>
        </Layout>
    );
}