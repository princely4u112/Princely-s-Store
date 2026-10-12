import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Star, ShoppingBag, ShieldCheck, Truck, MessageCircle, Check, AlertCircle } from 'lucide-react';
import { Product, ProductVariant } from '../types';
import { getProductBySlug, getProducts, subscribeToStore } from '../services/store';
import { formatNaira, generateWhatsAppProductUrl } from '../utils/formatters';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/ProductCard';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Gallery state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Variant & Quantity state
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  const loadData = async () => {
    try {
      if (!slug) return;
      const found = await getProductBySlug(slug);
      setProduct(found);

      if (found) {
        // Select first variant by default if variants exist
        if (found.variants && found.variants.length > 0) {
          setSelectedVariant(found.variants[0]);
        } else {
          setSelectedVariant(undefined);
        }

        // Fetch related products in same category
        const all = await getProducts();
        const related = all
          .filter((p) => p.categoryId === found.categoryId && p.id !== found.id)
          .slice(0, 4);
        setRelatedProducts(related);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setSelectedImageIndex(0);
    setQuantity(1);
    loadData();
    const unsub = subscribeToStore(loadData);
    return () => unsub();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 aspect-4/3 bg-slate-200 rounded-xl animate-pulse" />
          <div className="lg:col-span-5 space-y-4">
            <div className="h-8 bg-slate-200 rounded animate-pulse" />
            <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
            <div className="h-24 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-[#1E2A44]">Product Not Found</h1>
        <p className="text-sm text-[#64748B]">
          The product you are looking for may have been removed or the URL is incorrect.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1E2A44] text-white text-xs font-semibold rounded-lg hover:bg-[#1E2A44]/90"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse All Gadgets</span>
        </Link>
      </div>
    );
  }

  // Active pricing & stock based on selected variant
  const currentPrice = selectedVariant?.priceOverride ?? product.price;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const isOutOfStock = currentStock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, selectedVariant, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
  };

  const images = product.images.length > 0 ? product.images : [
    { id: 'def', url: '', altText: product.name }
  ];
  const activeImage = images[selectedImageIndex] || images[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-[#64748B]">
        <Link to="/" className="hover:text-[#1E2A44]">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/shop" className="hover:text-[#1E2A44]">Shop</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        {product.categoryName && (
          <>
            <span className="text-[#64748B]">{product.categoryName}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </>
        )}
        <span className="text-[#1E2A44] font-medium truncate max-w-[200px] sm:max-w-none">
          {product.name}
        </span>
      </nav>

      {/* Main Contiguous Purchase Module */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left: Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-4/3 bg-white rounded-xl border border-[#E2E8F0] overflow-hidden flex items-center justify-center">
            {activeImage?.url ? (
              <img
                src={activeImage.url}
                alt={activeImage.altText || product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="text-sm text-[#64748B]">No photo available</div>
            )}

            {isOutOfStock && (
              <div className="absolute top-4 left-4 bg-[#1E2A44] text-white text-xs font-semibold px-2.5 py-1 rounded">
                Out of Stock
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-lg border overflow-hidden shrink-0 transition-all ${
                    selectedImageIndex === idx
                      ? 'border-[#1E2A44] ring-2 ring-[#1E2A44]/20'
                      : 'border-[#E2E8F0] opacity-75 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.url}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Contiguous Purchase Column */}
        <div className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
          
          <div>
            <div className="flex items-center gap-2 text-xs text-[#64748B] mb-2">
              <span>SKU: {product.sku}</span>
              <span>·</span>
              <span className="flex items-center gap-1 text-amber-600 font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span className="tabular-nums">{product.rating.toFixed(1)}</span>
                <span className="text-[#64748B] font-normal">({product.reviewsCount} customer reviews)</span>
              </span>
            </div>

            <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-[#1E2A44] leading-tight">
              {product.name}
            </h1>

            {/* Price Row */}
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#1E2A44] tabular-nums">
                {formatNaira(currentPrice)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > currentPrice && (
                <span className="text-sm sm:text-base text-[#64748B] line-through tabular-nums">
                  {formatNaira(product.compareAtPrice)}
                </span>
              )}
            </div>
          </div>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-[#E2E8F0]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#1E2A44]">
                  {product.variants[0].name || 'Option'}:
                </span>
                <span className="text-[#64748B]">
                  {selectedVariant?.optionValue}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setSelectedVariant(v);
                      setQuantity(1);
                    }}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all ${
                      selectedVariant?.id === v.id
                        ? 'border-[#1E2A44] bg-[#1E2A44] text-white shadow-xs'
                        : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#1E2A44] hover:border-[#CBD5E1]'
                    }`}
                  >
                    <span>{v.optionValue}</span>
                    {v.priceOverride && v.priceOverride !== product.price && (
                      <span className="ml-1 opacity-80 tabular-nums">
                        ({formatNaira(v.priceOverride)})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock Indicator */}
          <div className="text-xs flex items-center gap-2">
            {isOutOfStock ? (
              <span className="text-[#DC2626] font-semibold flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                <span>Currently Out of Stock</span>
              </span>
            ) : currentStock <= 5 ? (
              <span className="text-amber-600 font-semibold flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                <span>Only {currentStock} left in stock - order soon</span>
              </span>
            ) : (
              <span className="text-[#16A34A] font-semibold flex items-center gap-1">
                <Check className="w-4 h-4" />
                <span>In Stock ({currentStock} units verified in warehouse)</span>
              </span>
            )}
          </div>

          {/* Quantity Stepper & Add to Cart */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] text-sm">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="px-3 py-2.5 text-[#1E2A44] hover:bg-slate-200 disabled:opacity-40 rounded-l-lg transition-colors font-bold"
                >
                  -
                </button>
                <span className="px-4 py-2 font-semibold text-[#1E2A44] tabular-nums min-w-[40px] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                  disabled={quantity >= currentStock || isOutOfStock}
                  className="px-3 py-2.5 text-[#1E2A44] hover:bg-slate-200 disabled:opacity-40 rounded-r-lg transition-colors font-bold"
                >
                  +
                </button>
              </div>

              {/* Primary Coral CTA Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm ${
                  isOutOfStock
                    ? 'bg-slate-200 text-[#64748B] cursor-not-allowed'
                    : 'bg-[#E8553A] hover:bg-[#D14529] text-white active:scale-98'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
              </button>
            </div>

            {addedNotice && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center justify-between animate-in fade-in">
                <span>Added to cart! Total: {quantity} items.</span>
                <Link to="/cart" className="font-semibold underline ml-2">
                  View Cart & Checkout
                </Link>
              </div>
            )}

            {/* WhatsApp "Ask about this product" Button */}
            <a
              href={generateWhatsAppProductUrl(product.name, product.slug, currentPrice)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 bg-white border border-[#25D366] hover:bg-[#25D366]/5 text-[#1E2A44] font-semibold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span>Ask about this product on WhatsApp</span>
            </a>
          </div>

          {/* Delivery & Warranty Trust Callouts */}
          <div className="pt-4 border-t border-[#E2E8F0] space-y-2.5 text-xs text-[#64748B]">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#1E2A44] shrink-0" />
              <span>Estimated Delivery: <strong>5–7 days nationwide</strong> across Nigeria</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#1E2A44] shrink-0" />
              <span>6 Months Princely's Tech Replacement Warranty</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Specifications Section */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-10 space-y-8">
        <div>
          <h2 className="font-heading text-lg sm:text-xl font-bold text-[#1E2A44] mb-3">
            Product Description
          </h2>
          <p className="text-sm text-[#1E2A44]/90 leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>

        {/* Specifications Table */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="pt-6 border-t border-[#E2E8F0]">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-[#1E2A44] mb-4">
              Verified Specifications
            </h2>
            <div className="border border-[#E2E8F0] rounded-lg overflow-hidden text-xs sm:text-sm">
              {Object.entries(product.specifications).map(([key, val], idx) => (
                <div
                  key={key}
                  className={`grid grid-cols-1 sm:grid-cols-3 p-3 sm:px-4 ${
                    idx % 2 === 0 ? 'bg-[#F8FAFC]' : 'bg-white'
                  }`}
                >
                  <span className="font-semibold text-[#1E2A44]">{key}</span>
                  <span className="sm:col-span-2 text-[#64748B] mt-0.5 sm:mt-0">{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#1E2A44]">
              You May Also Need
            </h2>
            <Link to="/shop" className="text-xs sm:text-sm font-semibold text-[#E8553A] hover:underline">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
