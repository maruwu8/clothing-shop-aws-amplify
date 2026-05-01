import { useState, type FormEvent } from 'react';
import ImageUploader from './ImageUploader';

const CATEGORIES = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories', 'Other'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

export interface ListingFormData {
  title: string;
  description: string;
  price: string;
  category: string;
  condition: string;
}

interface ListingFormProps {
  initialData?: ListingFormData;
  existingImageUrls?: string[];
  onSubmit: (data: ListingFormData, newFiles: File[]) => Promise<void>;
  submitLabel: string;
  title: string;
}

export default function ListingForm({
  initialData,
  existingImageUrls = [],
  onSubmit,
  submitLabel,
  title,
}: ListingFormProps) {
  const [formData, setFormData] = useState<ListingFormData>(
    initialData || {
      title: '',
      description: '',
      price: '',
      category: CATEGORIES[0],
      condition: CONDITIONS[0],
    }
  );
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    const price = parseFloat(formData.price);
    if (!formData.price || isNaN(price) || price <= 0) newErrors.price = 'Price must be a positive number';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.condition) newErrors.condition = 'Condition is required';
    if (files.length === 0 && existingImageUrls.length === 0) {
      newErrors.images = 'At least one image is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit(formData, files);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: keyof ListingFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <div className="listing-form">
      <h1>{title}</h1>
      {submitError && <div className="alert alert-error">{submitError}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
          />
          {errors.title && <div className="form-error">{errors.title}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
          {errors.description && <div className="form-error">{errors.description}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="price">Price ($)</label>
          <input
            id="price"
            type="number"
            step="0.01"
            min="0.01"
            value={formData.price}
            onChange={(e) => handleChange('price', e.target.value)}
          />
          {errors.price && <div className="form-error">{errors.price}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {errors.category && <div className="form-error">{errors.category}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="condition">Condition</label>
          <select
            id="condition"
            value={formData.condition}
            onChange={(e) => handleChange('condition', e.target.value)}
          >
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {errors.condition && <div className="form-error">{errors.condition}</div>}
        </div>

        <div className="form-group">
          <label>Images</label>
          <ImageUploader
            files={files}
            onChange={setFiles}
            existingImageUrls={existingImageUrls}
          />
          {errors.images && <div className="form-error">{errors.images}</div>}
        </div>

        <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%' }}>
          {submitting ? 'Saving...' : submitLabel}
        </button>
      </form>
    </div>
  );
}
