import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getImageUrl } from '../utils/storageUtils';
import type { ListingItem } from '../utils/apiClient';

interface ListingCardProps {
  item: ListingItem;
}

export default function ListingCard({ item }: ListingCardProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  useEffect(() => {
    if (item.imageKeys && item.imageKeys.length > 0) {
      getImageUrl(item.imageKeys[0])
        .then(setThumbnailUrl)
        .catch(() => setThumbnailUrl(null));
    }
  }, [item.imageKeys]);

  return (
    <Link to={`/items/${item.id}`} className="listing-card">
      {thumbnailUrl ? (
        <img src={thumbnailUrl} alt={item.title} className="listing-card-image" />
      ) : (
        <div className="listing-card-placeholder">No Image</div>
      )}
      <div className="listing-card-body">
        <div className="listing-card-title">{item.title}</div>
        <div className="listing-card-price">${item.price.toFixed(2)}</div>
        <div className="listing-card-category">{item.category}</div>
      </div>
    </Link>
  );
}
