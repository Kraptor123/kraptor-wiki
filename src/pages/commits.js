import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import styles from './commits.module.css';

export default function CommitsPage() {
    const [commits, setCommits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, highlighted, tagged
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetch('/data/commit-notes.json')
            .then(res => res.json())
            .then(data => {
                // Object'i array'e çevir ve tarihe göre sırala
                const commitsArray = Object.values(data).sort((a, b) =>
                    new Date(b.date) - new Date(a.date)
                );
                setCommits(commitsArray);
                setLoading(false);
            })
            .catch(err => {
                console.error('Commit verileri yüklenemedi:', err);
                setLoading(false);
            });
    }, []);

    // Filtreleme
    const filteredCommits = commits.filter(commit => {
        // Arama filtresi
        const matchesSearch = commit.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
            commit.note.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        // Kategori filtresi
        if (filter === 'highlighted') return commit.highlight;
        if (filter === 'tagged') return commit.tags && commit.tags.length > 0;

        return true;
    });

    if (loading) {
        return (
            <Layout title="Commit Geçmişi" description="Proje commit geçmişi ve notlar">
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <p>Yükleniyor...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Commit Geçmişi" description="Proje commit geçmişi ve notlar">
            <div className="container" style={{ padding: '2rem 0' }}>
                <h1>📝 Commit Geçmişi</h1>
                <p style={{ color: 'var(--ifm-color-emphasis-600)', marginBottom: '2rem' }}>
                    Private repo'nun commit geçmişi ve özel notlar
                </p>

                {/* Filtreler */}
                <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="🔍 Commit veya not ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            flex: '1',
                            minWidth: '250px',
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            border: '1px solid var(--ifm-color-emphasis-300)',
                        }}
                    />

                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            border: '1px solid var(--ifm-color-emphasis-300)',
                        }}
                    >
                        <option value="all">Tümü ({commits.length})</option>
                        <option value="highlighted">⭐ Öne Çıkanlar ({commits.filter(c => c.highlight).length})</option>
                        <option value="tagged">🏷️ Etiketliler ({commits.filter(c => c.tags?.length > 0).length})</option>
                    </select>
                </div>

                {/* Commit Listesi */}
                <div>
                    {filteredCommits.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--ifm-color-emphasis-600)' }}>
                            Sonuç bulunamadı
                        </p>
                    ) : (
                        filteredCommits.map(commit => (
                            <div
                                key={commit.sha}
                                style={{
                                    border: '1px solid var(--ifm-color-emphasis-300)',
                                    borderRadius: '12px',
                                    padding: '1.5rem',
                                    marginBottom: '1rem',
                                    backgroundColor: commit.highlight
                                        ? 'var(--ifm-color-warning-contrast-background)'
                                        : 'var(--ifm-card-background-color)',
                                    borderLeft: commit.highlight ? '4px solid var(--ifm-color-warning)' : 'none',
                                }}
                            >
                                {/* Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
                                            {commit.highlight && '⭐ '}
                                            {commit.message}
                                        </h3>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{
                        fontSize: '0.85rem',
                        color: 'var(--ifm-color-emphasis-600)',
                        whiteSpace: 'nowrap'
                    }}>
                      {new Date(commit.date).toLocaleDateString('tr-TR')}
                    </span>
                                    </div>
                                </div>

                                {/* Meta */}
                                <div style={{
                                    fontSize: '0.85rem',
                                    color: 'var(--ifm-color-emphasis-700)',
                                    marginBottom: commit.note || commit.tags?.length > 0 ? '1rem' : '0'
                                }}>
                                    <span>👤 {commit.author}</span>
                                    <span style={{ margin: '0 0.5rem' }}>•</span>
                                    <code style={{
                                        backgroundColor: 'var(--ifm-color-emphasis-200)',
                                        padding: '0.2rem 0.4rem',
                                        borderRadius: '4px',
                                        fontSize: '0.8rem'
                                    }}>
                                        {commit.sha.substring(0, 7)}
                                    </code>
                                </div>

                                {/* Tags */}
                                {commit.tags && commit.tags.length > 0 && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        {commit.tags.map(tag => (
                                            <span
                                                key={tag}
                                                style={{
                                                    display: 'inline-block',
                                                    padding: '0.2rem 0.6rem',
                                                    marginRight: '0.5rem',
                                                    backgroundColor: 'var(--ifm-color-primary)',
                                                    color: 'white',
                                                    borderRadius: '12px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '500',
                                                }}
                                            >
                        {tag}
                      </span>
                                        ))}
                                    </div>
                                )}

                                {/* Note */}
                                {commit.note && (
                                    <div style={{
                                        padding: '1rem',
                                        backgroundColor: 'var(--ifm-color-emphasis-100)',
                                        borderRadius: '8px',
                                        fontSize: '0.95rem',
                                        lineHeight: '1.6',
                                    }}>
                                        <strong style={{ color: 'var(--ifm-color-primary)' }}>💭 Not:</strong>
                                        <p style={{ margin: '0.5rem 0 0 0' }}>{commit.note}</p>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </Layout>
    );
}