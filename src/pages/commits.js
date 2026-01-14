import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';

export default function CommitsPage() {
    const [commits, setCommits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Cache (önbellek) sorununu önlemek için timestamp ile fetch
        fetch(`./data/commit-notes.json?t=${new Date().getTime()}`)
            .then(res => res.json())
            .then(data => {
                const commitsArray = Object.values(data).sort((a, b) =>
                    new Date(b.date) - new Date(a.date)
                );
                setCommits(commitsArray);
                setLoading(false);
            })
            .catch(err => {
                console.error('Veri yüklenemedi:', err);
                setLoading(false);
            });
    }, []);

    const filteredCommits = commits.filter(commit => {
        // 1. SİLİNENLERİ (HIDDEN) FİLTRELE
        if (commit.hidden === true) return false;

        // 2. ARAMA FİLTRESİ
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            commit.message.toLowerCase().includes(searchLower) ||
            (commit.description || "").toLowerCase().includes(searchLower) ||
            (commit.note || "").toLowerCase().includes(searchLower) ||
            (commit.tags || []).some(t => t.toLowerCase().includes(searchLower));

        if (!matchesSearch) return false;

        // 3. KATEGORİ FİLTRESİ
        if (filter === 'highlighted') return commit.highlight;
        if (filter === 'tagged') return commit.tags && commit.tags.length > 0;

        return true;
    });

    if (loading) return (
        <Layout title="Yükleniyor...">
            <div style={{ textAlign: 'center', padding: '5rem', fontSize: '1.2rem' }}>Günlük yükleniyor...</div>
        </Layout>
    );

    return (
        <Layout title="Commit Geçmişi" description="Proje geliştirme detayları ve teknik notlar">
            <div className="container" style={{ padding: '3rem 0', maxWidth: '1000px' }}>
                <header style={{ marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '2.8rem', fontWeight: '800' }}>🚀 Geliştirme Günlüğü</h1>
                    <p style={{ fontSize: '1.1rem', opacity: 0.6 }}>Sistem üzerindeki tüm teknik değişimler ve editör notları.</p>
                </header>

                {/* Filtreleme Paneli */}
                <div style={{
                    display: 'flex', gap: '15px', marginBottom: '2.5rem', flexWrap: 'wrap',
                    padding: '1.2rem', backgroundColor: 'var(--ifm-color-emphasis-100)', borderRadius: '15px'
                }}>
                    <input
                        type="text"
                        placeholder="🔍 Klasör, başlık veya açıklama ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            flex: '1', minWidth: '250px', padding: '0.8rem 1.2rem',
                            borderRadius: '10px', border: '1px solid var(--ifm-color-emphasis-300)',
                            backgroundColor: 'var(--ifm-background-color)', color: 'var(--ifm-font-color-base)',
                            fontSize: '1rem'
                        }}
                    />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        style={{
                            padding: '0.8rem', borderRadius: '10px', fontWeight: '600',
                            border: '1px solid var(--ifm-color-emphasis-300)', cursor: 'pointer'
                        }}
                    >
                        <option value="all">Tümü ({commits.filter(c => !c.hidden).length})</option>
                        <option value="highlighted">⭐ Öne Çıkanlar</option>
                        <option value="tagged">🏷️ Etiketliler</option>
                    </select>
                </div>

                {/* Commit Listesi */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {filteredCommits.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.5, border: '2px dashed var(--ifm-color-emphasis-300)', borderRadius: '20px' }}>
                            Eşleşen commit bulunamadı.
                        </div>
                    ) : (
                        filteredCommits.map(commit => (
                            <article key={commit.sha} style={{
                                border: '1px solid var(--ifm-color-emphasis-300)',
                                borderRadius: '18px', padding: '1.8rem',
                                position: 'relative',
                                backgroundColor: commit.highlight ? 'var(--ifm-color-warning-lightest)' : 'var(--ifm-card-background-color)',
                                borderLeft: commit.highlight ? '6px solid var(--ifm-color-warning)' : '1px solid var(--ifm-color-emphasis-300)',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                                transition: 'transform 0.2s ease'
                            }}>
                                {/* Header: Profil + İsim + Tarih */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        {commit.avatar ? (
                                            <img src={commit.avatar} alt={commit.author} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid var(--ifm-color-primary)' }} />
                                        ) : (
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--ifm-color-emphasis-300)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
                                        )}
                                        <div>
                                            <div style={{ fontWeight: '700', fontSize: '1rem' }}>{commit.author}</div>
                                            <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{new Date(commit.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                        </div>
                                    </div>
                                    <code style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '6px' }}>{commit.sha.substring(0, 7)}</code>
                                </div>

                                {/* Başlık */}
                                <h2 style={{ margin: '0 0 0.8rem 0', fontSize: '1.4rem', color: 'var(--ifm-color-primary)', lineHeight: '1.3' }}>
                                    {commit.highlight && '⭐ '}{commit.message}
                                </h2>

                                {/* Klasör Tagleri */}
                                {commit.tags && commit.tags.length > 0 && (
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
                                        {commit.tags.map(tag => (
                                            <span key={tag} style={{
                                                fontSize: '0.75rem', padding: '3px 10px', borderRadius: '6px',
                                                backgroundColor: 'var(--ifm-color-emphasis-200)', color: 'var(--ifm-color-emphasis-800)',
                                                fontWeight: 'bold', border: '1px solid var(--ifm-color-emphasis-300)'
                                            }}>#{tag}</span>
                                        ))}
                                    </div>
                                )}

                                {/* Açıklama (Body) */}
                                {commit.description && (
                                    <div style={{
                                        fontSize: '0.95rem', marginBottom: '1.5rem', opacity: 0.85,
                                        whiteSpace: 'pre-wrap', lineHeight: '1.6',
                                        padding: '1rem', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: '10px'
                                    }}>
                                        {commit.description}
                                    </div>
                                )}

                                {/* Özel Editör Notu */}
                                {commit.note && (
                                    <div style={{
                                        marginTop: '1rem', padding: '1.2rem',
                                        backgroundColor: 'var(--ifm-color-info-lightest)',
                                        borderRadius: '12px', borderLeft: '4px solid var(--ifm-color-info)',
                                        color: 'var(--ifm-color-info-darkest)'
                                    }}>
                                        <div style={{ fontSize: '0.8rem', fontWeight: '900', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>📝 SİSTEM NOTU</div>
                                        <div style={{ fontSize: '1rem', lineHeight: '1.5' }}>{commit.note}</div>
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