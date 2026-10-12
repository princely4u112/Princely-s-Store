import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star, Smartphone } from 'lucide-react';
import { Product } from '../types';
import { formatNaira } from '../utils/formatters';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const primaryImg = product.images.find((i) => i.isPrimary)?.url || product.images[0]?.url;
  const isOutOfStock = product.stock <= 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      // If product has variants, add default first variant or product
      addItem(product, product.variants[0], 1);
    }
  };

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-lg border border-[#E2E8F0] dark:border-slate-800 overflow-hidden hover:border-[#CBD5E1] dark:hover:border-slate-700 transition-all duration-200 flex flex-col h-full hover:-translate-y-0.5">
      
      {/* Product Image Slot */}
      <Link to={`/product/${product.slug}`} className="relative aspect-4/3 bg-[#F8FAFC] dark:bg-slate-800 overflow-hidden block">
        {primaryImg ? (
          <img
            src={primaryImg}
            alt={product.name}
            referrerPolicy="no-referrer"
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 text-[#64748B] dark:text-slate-400">
            <Smartphone className="w-10 h-10 mb-2 stroke-1" />
            <span className="text-xs font-medium">Princely's Tech</span>
          </div>
        )}

        {/* Stock / Promotion Status */}
        {isOutOfStock ? (
          <div className="absolute top-2.5 left-2.5 bg-[#1E2A44] dark:bg-slate-950 text-white text-[11px] font-semibold px-2 py-0.5 rounded">
            Out of Stock
          </div>
        ) : product.compareAtPrice && product.compareAtPrice > product.price ? (
          <div className="absolute top-2.5 left-2.5 bg-[#E8553A] text-white text-[11px] font-bold px-2 py-0.5 rounded">
            Save {formatNaira(product.compareAtPrice - product.price)}
          </div>
        ) : null}
      </Link>

      {/* Card Information */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Unboxed Metadata: Category & Rating */}
          <div className="flex items-center gap-1.5 text-xs text-[#64748B] dark:text-slate-400 mb-1.5">
            <span className="truncate">{product.categoryName || 'Mobile Gadget'}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-medium">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500 inline" />
              <span className="tabular-nums">{product.rating.toFixed(1)}</span>
            </span>
          </div>

          {/* Product Name */}
          <Link
            to={`/product/${product.slug}`}
            className="font-semibold text-sm sm:text-base text-[#1E2A44] dark:text-white group-hover:text-[#E8553A] transition-colors line-clamp-2 leading-snug"
          >
            {product.name}
          </Link>
        </div>

        {/* Price & Action Row */}
        <div className="pt-2 border-t border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold text-[#1E2A44] dark:text-white tabular-nums">
              {formatNaira(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs text-[#64748B] dark:text-slate-400 line-through tabular-nums -mt-0.5">
                {formatNaira(product.compareAtPrice)}
              </span>
            )}
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shrink-0 ${
              isOutOfStock
                ? 'bg-slate-100 dark:bg-slate-800 text-[#64748B] dark:text-slate-400 cursor-not-allowed'
                : 'bg-[#E8553A] hover:bg-[#D14529] text-white active:scale-97'
            }`}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
