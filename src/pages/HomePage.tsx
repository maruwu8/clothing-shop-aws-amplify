import { useEffect, useState } from 'react';
import { getItems, type ListingItem } from '../utils/apiClient';
import ListingCard from '../components/ListingCard';

export default function HomePage() {
  const [items, setItems] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getItems();
      setItems(data);
    } catch {
      setError('Failed to load listings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading listings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="alert alert-error">{error}</div>
        <button className="btn btn-primary" onClick={fetchItems}>Retry</button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <h2>No listings available</h2>
          <p>Check back later for new items!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 style={{ fontSize: '2rem', marginBottom: 32, fontFamily: 'var(--font-heading)', fontWeight: 500 }}>discover your next favourite piece</h1>
      <div className="listings-grid">
        {items.map((item) => (
          <ListingCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
