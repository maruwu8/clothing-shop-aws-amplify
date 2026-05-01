import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createItem } from '../utils/apiClient';
import { uploadImage } from '../utils/storageUtils';
import ListingForm, { type ListingFormData } from '../components/ListingForm';

export default function CreateListingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (data: ListingFormData, files: File[]) => {
    if (!user) throw new Error('You must be logged in');

    // Upload images to S3
    const imageKeys: string[] = [];
    for (const file of files) {
      const key = await uploadImage(user.userId, file);
      imageKeys.push(key);
    }

    console.log('Creating listing with imageKeys:', imageKeys);

    // Create the listing
    const result = await createItem({
      title: data.title.trim(),
      description: data.description.trim(),
      price: parseFloat(data.price),
      category: data.category,
      condition: data.condition,
      imageKeys,
    });

    console.log('Listing created:', result);
    navigate('/dashboard');
  };

  return (
    <div className="page-container">
      <ListingForm
        onSubmit={handleSubmit}
        submitLabel="Create Listing"
        title="Create New Listing"
      />
    </div>
  );
}
