import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function CommitsPage() {
    const { siteConfig } = useDocusaurusContext();
    const [commits, setCommits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // HATA DÜZELTME: Veri yolunu kök dizinden ('/data/...') alacak şekilde güncelledik.
        // baseUrl ekleyerek alt klasörlerde çalışma sorununu kökten çözüyoruz.
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

    const filteredCommits = commits.filter(commit => {
        if (commit.hidden === true) return false;

        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            commit.message.toLowerCase().includes(searchLower) ||
            (commit.description || "").toLowerCase().includes(searchLower) ||
            (commit.note || "").toLowerCase().includes(searchLower) ||
            (commit.tags || []).some(t => t.toLowerCase().includes(searchLower));

        if (!matchesSearch) return false;

        if (filter === 'highlighted') return commit.highlight;
        if (filter === 'tagged') return commit.tags && commit.tags.length > 0;

        return true;
    });

    if (loading) return (
        <Layout title="Yükleniyor...">
            <div style={{ textAlign: 'center', padding: '5rem', fontSize: '1.2rem' }}>Günlük verileri hazırlanıyor...</div>
        </Layout>
    );

    return (
        <Layout title="Geliştirme Günlüğü" description="Proje teknik detayları ve commit notları">
            <div className="container" style={{ padding: '3rem 0', maxWidth: '900px' }}>
                <header style={{ marginBottom: '2.5rem' }}>
                    <h1 style={{ fontSize: '2.8rem', fontWeight: '800', marginBottom: '10px' }}>🚀 Geliştirme Günlüğü</h1>
                    <p style={{ fontSize: '1.1rem', opacity: 0.7 }}>Sistemdeki tüm teknik değişimlerin kronolojik listesi.</p>
                </header>

                {/* Filtreleme Alanı */}
                <div style={{
                    display: 'flex', gap: '15px', marginBottom: '2.5rem', flexWrap: 'wrap',
                    padding: '1.2rem', backgroundColor: 'var(--ifm-color-emphasis-100)', borderRadius: '15px'
                }}>
                    <input
                        type="text"
                        placeholder="🔍 Klasör, başlık veya not ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            flex: '1', minWidth: '250px', padding: '0.8rem 1.2rem',
                            borderRadius: '10px', border: '1px solid var(--ifm-color-emphasis-300)',
                            backgroundColor: 'var(--ifm-background-color)', color: 'var(--ifm-font-color-base)'
                        }}
                    />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        style={{ padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--ifm-color-emphasis-300)', fontWeight: 'bold' }}
                    >
                        <option value="all">Tümü</option>
                        <option value="highlighted">⭐ Öne Çıkanlar</option>
                        <option value="tagged">🏷️ Etiketliler</option>
                    </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {filteredCommits.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>Sonuç bulunamadı.</div>
                    ) : (
                        filteredCommits.map(commit => (
                            <article key={commit.sha} style={{
                                border: '1px solid var(--ifm-color-emphasis-300)',
                                borderRadius: '20px', padding: '1.8rem',
                                backgroundColor: commit.highlight ? 'rgba(230, 126, 34, 0.03)' : 'var(--ifm-card-background-color)',
                                borderLeft: commit.highlight ? '6px solid #e67e22' : '1px solid var(--ifm-color-emphasis-300)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                            }}>
                                {/* Üst Bilgi: Profil ve Tarih */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        {commit.avatar ? (
                                            <img src={commit.avatar} alt={commit.author} style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                                        ) : (
                                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
                                        )}
                                        <div style={{ lineHeight: '1.2' }}>
                                            <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{commit.author}</div>
                                            <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{new Date(commit.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                        </div>
                                    </div>
                                    <code style={{ fontSize: '0.7rem', opacity: 0.5 }}>{commit.sha.substring(0, 7)}</code>
                                </div>

                                {/* Başlık ve İçerik */}
                                <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.3rem', color: 'var(--ifm-color-primary)' }}>
                                    {commit.highlight && '⭐ '}{commit.message}
                                </h2>

                                {commit.description && (
                                    <div style={{
                                        fontSize: '0.95rem', marginBottom: '1.2rem', opacity: 0.8,
                                        whiteSpace: 'pre-wrap', paddingLeft: '1rem', borderLeft: '2px solid var(--ifm-color-emphasis-200)'
                                    }}>
                                        {commit.description}
                                    </div>
                                )}

                                {commit.note && (
                                    <div style={{
                                        margin: '1.5rem 0', padding: '1rem',
                                        backgroundColor: 'var(--ifm-color-info-lightest)',
                                        borderRadius: '12px', borderLeft: '4px solid var(--ifm-color-info)'
                                    }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--ifm-color-info-darker)', marginBottom: '4px' }}>💡 NOT</div>
                                        <div style={{ fontSize: '0.95rem' }}>{commit.note}</div>
                                    </div>
                                )}

                                {/* TAGLER ARTIK EN ALTTA */}
                                {commit.tags && commit.tags.length > 0 && (
                                    <div style={{
                                        marginTop: '1.5rem', pt: '1rem',
                                        display: 'flex', gap: '8px', flexWrap: 'wrap',
                                        borderTop: '1px solid var(--ifm-color-emphasis-200)',
                                        paddingTop: '1rem'
                                    }}>
                                        {commit.tags.map(tag => (
                                            <span key={tag} style={{
                                                fontSize: '0.7rem', padding: '3px 10px', borderRadius: '20px',
                                                backgroundColor: 'var(--ifm-color-emphasis-200)',
                                                color: 'var(--ifm-color-emphasis-700)', fontWeight: '700'
                                            }}>#{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </article>
                        ))
                    )}
                </div>
            </div>
        </Layout>
    );
}