import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getItems, deleteItem, type ListingItem } from '../utils/apiClient';
import { getImageUrl } from '../utils/storageUtils';

export default function DashboardPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<ListingItem[]>([]);
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ListingItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchItems = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getItems(user.userId);
      setItems(data);
      // Load thumbnails
      const thumbMap: Record<string, string> = {};
      await Promise.all(
        data.map(async (item) => {
          if (item.imageKeys && item.imageKeys.length > 0) {
            try {
              thumbMap[item.id] = await getImageUrl(item.imageKeys[0]);
            } catch {
              // ignore thumbnail errors
            }
          }
        })
      );
      setThumbnails(thumbMap);
    } catch {
      setError('Failed to load your listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [user]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteItem(deleteTarget.id);
      setDeleteTarget(null);
      await fetchItems();
    } catch (err: unknown) {
      const status = (err as { response?: { statusCode?: number } })?.response?.statusCode;
      if (status === 403) {
        setError('You do not have permission to delete this listing.');
      } else if (status === 404) {
        setError('Listing not found. It may have already been deleted.');
      } else {
        setError('Failed to delete listing.');
      }
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="page-container loading">Loading your listings...</div>;
  }

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <h1>My Listings</h1>
        <Link to="/listings/new" className="btn btn-primary">+ New Listing</Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {items.length === 0 ? (
        <div className="empty-state">
          <h2>No listings yet</h2>
          <p>Create your first listing to start selling!</p>
          <Link to="/listings/new" className="btn btn-primary">Create Your First Listing</Link>
        </div>
      ) : (
        items.map((item) => (
          <div key={item.id} className="dashboard-item">
            {thumbnails[item.id] ? (
              <img src={thumbnails[item.id]} alt={item.title} className="dashboard-item-image" />
            ) : (
              <div className="dashboard-item-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '0.7rem' }}>
                No img
              </div>
            )}
            <div className="dashboard-item-info">
              <h3>{item.title}</h3>
              <p>${item.price.toFixed(2)} · {item.category} · {item.condition}</p>
            </div>
            <div className="dashboard-item-actions">
              <Link to={`/listings/${item.id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
              <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(item)}>Delete</button>
            </div>
          </div>
        ))
      )}

      {/* Delete confirmation dialog */}
      {deleteTarget && (
        <div className="dialog-overlay" onClick={() => !deleting && setDeleteTarget(null)}>
          <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
            <h2>Delete Listing</h2>
            <p>Are you sure you want to delete "{deleteTarget.title}"? This action cannot be undone.</p>
            <div className="dialog-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
