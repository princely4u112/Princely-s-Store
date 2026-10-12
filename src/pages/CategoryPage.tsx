import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { Category, Product } from '../types';
import { getCategories, getProducts, subscribeToStore } from '../services/store';
import { ProductCard } from '../components/ProductCard';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [cats, allProds] = await Promise.all([getCategories(), getProducts()]);
      const matched = cats.find((c) => c.slug === slug);
      setCategory(matched || null);

      if (matched) {
        setProducts(allProds.filter((p) => p.categoryId === matched.id));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeToStore(loadData);
    return () => unsub();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-72 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-[#1E2A44]">Category Not Found</h1>
        <p className="text-sm text-[#64748B]">
          The category you are looking for does not exist or may have been renamed.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1E2A44] text-white text-xs font-semibold rounded-lg hover:bg-[#1E2A44]/90"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Shop</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-[#64748B]">
        <Link to="/" className="hover:text-[#1E2A44]">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/shop" className="hover:text-[#1E2A44]">Shop</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#1E2A44] font-medium">{category.name}</span>
      </nav>

      {/* Category Header */}
      <div className="border-b border-[#E2E8F0] pb-6 space-y-2">
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#1E2A44]">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-xs sm:text-sm text-[#64748B] max-w-2xl leading-relaxed">
            {category.description}
          </p>
        )}
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center space-y-3">
          <p className="font-semibold text-sm text-[#1E2A44]">No items currently listed in this category.</p>
          <p className="text-xs text-[#64748B]">Check back soon or message our support team on WhatsApp for custom requests.</p>
          <Link to="/shop" className="text-xs font-semibold text-[#E8553A] hover:underline">
            Browse other gadgets
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
