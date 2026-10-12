import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
  Check,
  Camera,
  Star,
  AlertCircle,
} from 'lucide-react';
import { Category, Product, ProductImage, ProductVariant } from '../../types';
import { getCategories, getProductById, saveProduct, uploadProductImage } from '../../services/store';

export const AdminProductForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [compareAtPrice, setCompareAtPrice] = useState<string>('');
  const [stock, setStock] = useState<number>(10);
  const [description, setDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(true);

  // Images & Variants & Specs
  const [images, setImages] = useState<ProductImage[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [specList, setSpecList] = useState<{ key: string; val: string }[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        const cats = await getCategories();
        setCategories(cats);

        if (isEditing && id) {
          const prod = await getProductById(id);
          if (prod) {
            setName(prod.name);
            setSlug(prod.slug);
            setCategoryId(prod.categoryId);
            setSku(prod.sku);
            setPrice(prod.price);
            setCompareAtPrice(prod.compareAtPrice ? String(prod.compareAtPrice) : '');
            setStock(prod.stock);
            setDescription(prod.description);
            setIsFeatured(prod.isFeatured);
            setIsPublished(prod.isPublished);
            setImages(prod.images || []);
            setVariants(prod.variants || []);

            const specs = Object.entries(prod.specifications || {}).map(([key, val]) => ({
              key,
              val,
            }));
            setSpecList(specs);
          }
        } else if (cats.length > 0) {
          setCategoryId(cats[0].id);
          setSku('PT-' + Math.floor(1000 + Math.random() * 9000));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [id, isEditing]);

  // Handle image upload from file or device camera
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setError(null);

    try {
      const newImgs: ProductImage[] = [...images];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploadedUrl = await uploadProductImage(file);
        newImgs.push({
          id: 'img-' + Date.now() + '-' + i,
          url: uploadedUrl,
          altText: name || 'Product Photo',
          isPrimary: newImgs.length === 0,
        });
      }

      setImages(newImgs);
    } catch (err: any) {
      setError(err.message || 'Failed to upload photo.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSetPrimaryImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, idx) => ({
        ...img,
        isPrimary: idx === index,
      }))
    );
  };

  const handleDeleteImage = (index: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, idx) => idx !== index);
      if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
        updated[0].isPrimary = true;
      }
      return updated;
    });
  };

  // Variants management
  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        id: 'var-' + Date.now(),
        name: 'Color',
        optionValue: 'Matte Black',
        stock: 10,
        sku: `${sku || 'PT'}-${prev.length + 1}`,
      },
    ]);
  };

  const handleUpdateVariant = (index: number, field: keyof ProductVariant, val: any) => {
    setVariants((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const handleDeleteVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Specs management
  const handleAddSpec = () => {
    setSpecList((prev) => [...prev, { key: '', val: '' }]);
  };

  const handleUpdateSpec = (index: number, field: 'key' | 'val', val: string) => {
    setSpecList((prev) => {
      const next = [...prev];
      next[index][field] = val;
      return next;
    });
  };

  const handleDeleteSpec = (index: number) => {
    setSpecList((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || price <= 0 || !categoryId) {
      setError('Please provide product name, valid price, and category.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Build specs map
      const specifications: Record<string, string> = {};
      specList.forEach((s) => {
        if (s.key.trim() && s.val.trim()) {
          specifications[s.key.trim()] = s.val.trim();
        }
      });

      const payload: Partial<Product> & { name: string; price: number; categoryId: string } = {
        id: id || undefined,
        name: name.trim(),
        slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        categoryId,
        sku: sku.trim() || 'PT-' + Math.floor(1000 + Math.random() * 9000),
        price: Number(price),
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
        stock: Number(stock),
        description: description.trim(),
        specifications,
        isFeatured,
        isPublished,
        images,
        variants,
      };

      await saveProduct(payload);
      navigate('/admin/products');
    } catch (err: any) {
      setError(err.message || 'Failed to save product.');
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-[#64748B]">Loading product form...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="p-2 text-[#64748B] hover:text-[#1E2A44] hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-heading text-xl sm:text-2xl font-bold text-[#1E2A44]">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-xs text-[#64748B]">Fill in the gadget specifications and upload clear photos</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-[#DC2626] text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Basic Info */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 sm:p-6 space-y-4 shadow-xs">
          <h2 className="font-heading font-bold text-sm text-[#1E2A44] pb-2 border-b border-[#E2E8F0]">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#1E2A44] mb-1">
                Product Title <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!isEditing && !slug) {
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                  }
                }}
                placeholder="e.g. 65W GaN Dual USB-C Fast Charger"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#1E2A44] focus:bg-white text-[#1E2A44]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E2A44] mb-1">
                URL Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. 65w-gan-dual-charger"
                className="w-full px-3.5 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#1E2A44] font-mono text-[#1E2A44]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E2A44] mb-1">
                Category <span className="text-[#DC2626]">*</span>
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#1E2A44] text-[#1E2A44]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E2A44] mb-1">
                SKU (Stock Keeping Unit)
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="PT-CH-002"
                className="w-full px-3.5 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#1E2A44] font-mono text-[#1E2A44]"
              />
            </div>

            <div className="flex items-center gap-6 pt-3">
              <label className="flex items-center gap-2 text-xs font-medium text-[#1E2A44] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="rounded text-[#1E2A44] focus:ring-0 w-4 h-4"
                />
                <span>Published in Store</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-[#1E2A44] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded text-[#E8553A] focus:ring-0 w-4 h-4"
                />
                <span>Featured on Homepage</span>
              </label>
            </div>
          </div>
        </div>

        {/* Section 2: Pricing & Stock */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 sm:p-6 space-y-4 shadow-xs">
          <h2 className="font-heading font-bold text-sm text-[#1E2A44] pb-2 border-b border-[#E2E8F0]">
            Pricing & Inventory
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1E2A44] mb-1">
                Selling Price (₦) <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="number"
                required
                min={0}
                value={price || ''}
                onChange={(e) => setPrice(Number(e.target.value))}
                placeholder="25000"
                className="w-full px-3.5 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#1E2A44] font-mono tabular-nums text-[#1E2A44]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E2A44] mb-1">
                Compare-At Price (₦) (Optional)
              </label>
              <input
                type="number"
                min={0}
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                placeholder="30000"
                className="w-full px-3.5 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#1E2A44] font-mono tabular-nums text-[#1E2A44]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E2A44] mb-1">
                Warehouse Stock Count <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="number"
                required
                min={0}
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                placeholder="20"
                className="w-full px-3.5 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#1E2A44] font-mono tabular-nums text-[#1E2A44]"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Photo Upload from Phone / Laptop */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
            <div>
              <h2 className="font-heading font-bold text-sm text-[#1E2A44]">
                Product Photos
              </h2>
              <p className="text-[11px] text-[#64748B]">Upload photos directly from laptop or phone camera (max 5MB, JPG/PNG/WebP)</p>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="px-3.5 py-1.5 bg-[#1E2A44] hover:bg-[#1E2A44]/90 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{uploadingImage ? 'Compressing...' : 'Upload Photo'}</span>
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/jpeg,image/png,image/webp,image/jpg"
            capture="environment"
            multiple
            className="hidden"
          />

          {images.length === 0 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#E2E8F0] hover:border-[#1E2A44] rounded-xl p-8 text-center cursor-pointer space-y-2 bg-[#F8FAFC] transition-colors"
            >
              <Upload className="w-8 h-8 text-[#64748B] mx-auto" />
              <p className="text-xs font-semibold text-[#1E2A44]">Click to upload or take a photo with your device camera</p>
              <p className="text-[11px] text-[#64748B]">Auto-resized and optimized for fast mobile loading</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {images.map((img, idx) => (
                <div key={img.id || idx} className="relative aspect-square border border-[#E2E8F0] rounded-lg overflow-hidden group bg-slate-50">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  
                  {img.isPrimary && (
                    <span className="absolute top-1.5 left-1.5 bg-[#1E2A44] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                      Main Photo
                    </span>
                  )}

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!img.isPrimary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryImage(idx)}
                        className="p-1.5 bg-white text-[#1E2A44] rounded-md text-[10px] font-semibold hover:bg-slate-100"
                        title="Set as Main Image"
                      >
                        Make Main
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(idx)}
                      className="p-1.5 bg-red-600 text-white rounded-md hover:bg-red-700"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 4: Product Variants (Color, Capacity, Model) */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
            <div>
              <h2 className="font-heading font-bold text-sm text-[#1E2A44]">
                Product Variations
              </h2>
              <p className="text-[11px] text-[#64748B]">Options like Color, Storage capacity, or Phone compatibility</p>
            </div>

            <button
              type="button"
              onClick={handleAddVariant}
              className="px-3 py-1.5 bg-white border border-[#E2E8F0] hover:border-[#1E2A44] text-[#1E2A44] font-semibold text-xs rounded-lg flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Variant</span>
            </button>
          </div>

          {variants.length === 0 ? (
            <p className="text-xs text-[#64748B] italic">No variations added. Product will sell as a single base model.</p>
          ) : (
            <div className="space-y-3">
              {variants.map((v, idx) => (
                <div key={v.id || idx} className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg grid grid-cols-1 sm:grid-cols-4 gap-3 items-center text-xs">
                  <div>
                    <label className="block text-[10px] text-[#64748B] mb-0.5">Option Name</label>
                    <input
                      type="text"
                      value={v.name}
                      onChange={(e) => handleUpdateVariant(idx, 'name', e.target.value)}
                      placeholder="e.g. Color"
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8F0] rounded text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#64748B] mb-0.5">Value</label>
                    <input
                      type="text"
                      value={v.optionValue}
                      onChange={(e) => handleUpdateVariant(idx, 'optionValue', e.target.value)}
                      placeholder="e.g. Matte Black"
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8F0] rounded text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#64748B] mb-0.5">Variant Stock</label>
                    <input
                      type="number"
                      min={0}
                      value={v.stock}
                      onChange={(e) => handleUpdateVariant(idx, 'stock', Number(e.target.value))}
                      placeholder="10"
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8F0] rounded text-xs font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-3 sm:pt-0">
                    <div className="flex-1">
                      <label className="block text-[10px] text-[#64748B] mb-0.5">Price Override (₦)</label>
                      <input
                        type="number"
                        min={0}
                        value={v.priceOverride || ''}
                        onChange={(e) => handleUpdateVariant(idx, 'priceOverride', e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="Optional"
                        className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8F0] rounded text-xs font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteVariant(idx)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded mt-3"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 5: Description & Specifications */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 sm:p-6 space-y-4 shadow-xs">
          <h2 className="font-heading font-bold text-sm text-[#1E2A44] pb-2 border-b border-[#E2E8F0]">
            Description & Technical Specs
          </h2>

          <div>
            <label className="block text-xs font-semibold text-[#1E2A44] mb-1">
              Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of features, materials, and battery life..."
              className="w-full px-3.5 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#1E2A44] text-[#1E2A44]"
            />
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-[#1E2A44]">
                Specifications Key-Value Pairs
              </label>
              <button
                type="button"
                onClick={handleAddSpec}
                className="text-xs font-semibold text-[#E8553A] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Row</span>
              </button>
            </div>

            <div className="space-y-2">
              {specList.map((spec, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={spec.key}
                    onChange={(e) => handleUpdateSpec(idx, 'key', e.target.value)}
                    placeholder="e.g. Battery Capacity"
                    className="w-1/3 px-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#1E2A44]"
                  />
                  <input
                    type="text"
                    value={spec.val}
                    onChange={(e) => handleUpdateSpec(idx, 'val', e.target.value)}
                    placeholder="e.g. 20,000mAh (74Wh)"
                    className="flex-1 px-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#1E2A44]"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteSpec(idx)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            to="/admin/products"
            className="px-5 py-2.5 bg-white border border-[#E2E8F0] hover:bg-slate-50 text-[#1E2A44] font-semibold text-xs rounded-lg transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#E8553A] hover:bg-[#D14529] text-white font-semibold text-xs rounded-lg flex items-center gap-2 transition-colors shadow-xs disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{saving ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};
