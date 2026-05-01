import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getItem, updateItem } from '../utils/apiClient';
import { uploadImage, getImageUrl } from '../utils/storageUtils';
import ListingForm, { type ListingFormData } from '../components/ListingForm';

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<ListingFormData | null>(null);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [existingImageKeys, setExistingImageKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchListing = async () => {
      try {
        const item = await getItem(id);
        setInitialData({
          title: item.title,
          description: item.description,
          price: item.price.toString(),
          category: item.category,
          condition: item.condition,
        });
        setExistingImageKeys(item.imageKeys || []);
        if (item.imageKeys && item.imageKeys.length > 0) {
          const urls = await Promise.all(
            item.imageKeys.map((key) => getImageUrl(key).catch(() => ''))
          );
          setExistingImageUrls(urls.filter(Boolean));
        }
      } catch (err: unknown) {
        const status = (err as { response?: { statusCode?: number } })?.response?.statusCode;
        if (status === 404) {
          setError('Listing not found.');
        } else if (status === 403) {
          setError('You do not have permission to edit this listing.');
        } else {
          setError('Failed to load listing.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  const handleSubmit = async (data: ListingFormData, newFiles: File[]) => {
    if (!user || !id) throw new Error('Missing user or listing ID');

    // Upload new images
    const newImageKeys: string[] = [];
    for (const file of newFiles) {
      const key = await uploadImage(user.userId, file);
      newImageKeys.push(key);
    }

    const allImageKeys = [...existingImageKeys, ...newImageKeys];

    try {
      await updateItem(id, {
        title: data.title.trim(),
        description: data.description.trim(),
        price: parseFloat(data.price),
        category: data.category,
        condition: data.condition,
        imageKeys: allImageKeys,
      });
      navigate('/dashboard');
    } catch (err: unknown) {
      const status = (err as { response?: { statusCode?: number } })?.response?.statusCode;
      if (status === 403) {
        throw new Error('You do not have permission to edit this listing.');
      } else if (status === 404) {
        throw new Error('Listing not found.');
      }
      throw err;
    }
  };

  if (loading) {
    return <div className="page-container loading">Loading...</div>;
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="alert alert-error">{error}</div>
        <Link to="/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
      </div>
    );
  }

  if (!initialData) {
    return <div className="page-container loading">Loading...</div>;
  }

  return (
    <div className="page-container">
      <ListingForm
        initialData={initialData}
        existingImageUrls={existingImageUrls}
        onSubmit={handleSubmit}
        submitLabel="Update Listing"
        title="Edit Listing"
      />
    </div>
  );
}
