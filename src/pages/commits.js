import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';

export default function CommitsPage() {
    const [commits, setCommits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Cache önlemek için timestamp eklendi
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
        const matchesSearch =
            commit.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (commit.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (commit.note || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (commit.tags || []).some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));

        if (!matchesSearch) return false;
        if (filter === 'highlighted') return commit.highlight;
        if (filter === 'tagged') return commit.tags && commit.tags.length > 0;
        return true;
    });

    return (
        <Layout title="Commit Geçmişi">
            <div className="container" style={{ padding: '2rem 0' }}>
                <h1>📝 Geliştirme Günlüğü</h1>

                {/* Filtreleme Alanı */}
                <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="🔍 Ara (commit, açıklama, tag veya not...)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            flex: '1', minWidth: '250px', padding: '0.7rem 1rem',
                            borderRadius: '10px', border: '1px solid var(--ifm-color-emphasis-300)',
                            backgroundColor: 'var(--ifm-background-color)', color: 'var(--ifm-font-color-base)'
                        }}
                    />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        style={{ padding: '0.7rem', borderRadius: '10px', border: '1px solid var(--ifm-color-emphasis-300)' }}
                    >
                        <option value="all">Tümü</option>
                        <option value="highlighted">⭐ Öne Çıkanlar</option>
                        <option value="tagged">🏷️ Etiketliler</option>
                    </select>
                </div>

                {loading ? <p>Yükleniyor...</p> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {filteredCommits.map(commit => (
                            <div key={commit.sha} style={{
                                border: '1px solid var(--ifm-color-emphasis-300)',
                                borderRadius: '16px', padding: '1.5rem',
                                backgroundColor: commit.highlight ? 'rgba(230, 126, 34, 0.05)' : 'var(--ifm-card-background-color)',
                                borderLeft: commit.highlight ? '6px solid #e67e22' : '1px solid var(--ifm-color-emphasis-300)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                            }}>
                                {/* Üst Bilgi */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div>
                                        <h3 style={{ margin: 0, color: 'var(--ifm-color-primary)' }}>{commit.message}</h3>
                                        <div style={{ fontSize: '0.85rem', marginTop: '0.3rem', opacity: 0.8 }}>
                                            <span>📅 {new Date(commit.date).toLocaleDateString('tr-TR')}</span>
                                            <span style={{ margin: '0 0.8rem' }}>•</span>
                                            <span>👤 {commit.author}</span>
                                        </div>
                                    </div>
                                    <code style={{ fontSize: '0.75rem' }}>{commit.sha.substring(0, 7)}</code>
                                </div>

                                {/* Otomatik ve Manuel Tagler */}
                                {commit.tags && commit.tags.length > 0 && (
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                        {commit.tags.map(tag => (
                                            <span key={tag} style={{
                                                padding: '2px 10px', borderRadius: '20px', fontSize: '0.7rem',
                                                backgroundColor: 'var(--ifm-color-emphasis-200)', fontWeight: 'bold'
                                            }}>#{tag}</span>
                                        ))}
                                    </div>
                                )}

                                {/* Commit Description (VARSA) */}
                                {commit.description && (
                                    <div style={{
                                        fontSize: '0.9rem', marginBottom: '1rem', whiteSpace: 'pre-wrap',
                                        paddingLeft: '1rem', borderLeft: '2px solid var(--ifm-color-emphasis-300)', opacity: 0.9
                                    }}>
                                        {commit.description}
                                    </div>
                                )}

                                {/* Özel Not */}
                                {commit.note && (
                                    <div style={{
                                        padding: '1rem', backgroundColor: 'var(--ifm-color-primary-lighter)',
                                        borderRadius: '10px', fontSize: '0.95rem', color: 'black'
                                    }}>
                                        <strong>💡 Not:</strong> {commit.note}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}