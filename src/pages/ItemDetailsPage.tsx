import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getItem, type ListingItem } from '../utils/apiClient';
import { getImageUrl } from '../utils/storageUtils';

export default function ItemDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<ListingItem | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchItem = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getItem(id);
        setItem(data);
        // Load image URLs
        if (data.imageKeys && data.imageKeys.length > 0) {
          const urls = await Promise.all(
            data.imageKeys.map((key) => getImageUrl(key).catch(() => ''))
          );
          setImageUrls(urls.filter(Boolean));
        }
      } catch (err: unknown) {
        const status = (err as { response?: { statusCode?: number } })?.response?.statusCode;
        if (status === 404) {
          setNotFound(true);
        } else {
          setError('Failed to load listing details.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  if (loading) {
    return <div className="page-container loading">Loading...</div>;
  }

  if (notFound) {
    return (
      <div className="page-container empty-state">
        <h2>Listing not found</h2>
        <p>This item may have been removed.</p>
        <Link to="/home" className="btn btn-primary">Back to Home</Link>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="page-container">
        <div className="alert alert-error">{error || 'Something went wrong'}</div>
        <Link to="/home" className="btn btn-secondary">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="page-container item-details">
      {imageUrls.length > 0 && (
        <div className="item-details-images">
          {imageUrls.map((url, i) => (
            <img key={i} src={url} alt={`${item.title} - image ${i + 1}`} />
          ))}
        </div>
      )}
      <h1>{item.title}</h1>
      <div className="item-details-price">${item.price.toFixed(2)}</div>
      <div className="item-details-meta">
        <span>{item.category}</span>
        <span>{item.condition}</span>
      </div>
      <div className="item-details-description">{item.description}</div>
      <div className="item-details-timestamps">
        <p>Listed: {new Date(item.createdAt).toLocaleDateString()}</p>
        <p>Updated: {new Date(item.updatedAt).toLocaleDateString()}</p>
      </div>
      <div style={{ marginTop: 24 }}>
        <Link to="/home" className="btn btn-secondary">← Back to Listings</Link>
      </div>
    </div>
  );
}
