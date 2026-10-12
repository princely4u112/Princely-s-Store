import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Category, Product } from '../types';
import { getCategories, getProducts, subscribeToStore } from '../services/store';
import { ProductCard } from '../components/ProductCard';

export const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const searchQuery = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || 'all';
  const sortOption = searchParams.get('sort') || 'featured';

  const [visibleCount, setVisibleCount] = useState(12);

  const loadData = async () => {
    try {
      const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
      setProducts(prods);
      setCategories(cats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToStore(loadData);
    return () => unsubscribe();
  }, []);

  const handleSearchChange = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set('search', value);
    else next.delete('search');
    setSearchParams(next);
  };

  const handleCategoryChange = (slug: string) => {
    const next = new URLSearchParams(searchParams);
    if (slug === 'all') next.delete('category');
    else next.set('category', slug);
    setSearchParams(next);
    setVisibleCount(12);
  };

  const handleSortChange = (sort: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('sort', sort);
    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search filter
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchSku = p.sku.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchSku) return false;
        }

        // Category filter
        if (selectedCategory !== 'all') {
          const cat = categories.find((c) => c.slug === selectedCategory);
          if (cat && p.categoryId !== cat.id) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'price-asc') return a.price - b.price;
        if (sortOption === 'price-desc') return b.price - a.price;
        if (sortOption === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        // Default: featured first, then newest
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return 0;
      });
  }, [products, searchQuery, selectedCategory, sortOption, categories]);

  const displayedProducts = filteredProducts.slice(0, visibleCount);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#1E2A44]">
            Store Catalog
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Genuine power banks, fast chargers, cables, phones, and smartphone accessories
          </p>
        </div>
        <div className="text-xs text-[#64748B] tabular-nums">
          Showing <span className="font-semibold text-[#1E2A44]">{filteredProducts.length}</span> verified items
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full lg:max-w-xs">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#64748B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search products, models, specs..."
            className="w-full pl-10 pr-9 py-2 text-sm bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#1E2A44]"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-2.5 text-[#64748B] hover:text-[#1E2A44]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Tabs (Segmented Button Control per Frontend Design guidelines) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 text-xs no-scrollbar">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-[#1E2A44] text-white shadow-xs'
                : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#1E2A44]'
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.slug)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === cat.slug
                  ? 'bg-[#1E2A44] text-white shadow-xs'
                  : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#1E2A44]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
          <SlidersHorizontal className="w-4 h-4 text-[#64748B]" />
          <select
            value={sortOption}
            onChange={(e) => handleSortChange(e.target.value)}
            className="text-xs sm:text-sm bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-[#1E2A44] focus:outline-none focus:border-[#1E2A44]"
          >
            <option value="featured">Sort: Featured First</option>
            <option value="newest">Sort: Newest Arrivals</option>
            <option value="price-asc">Sort: Price (Low to High)</option>
            <option value="price-desc">Sort: Price (High to Low)</option>
          </select>
        </div>
      </div>

      {/* Active Filter Indicators */}
      {(searchQuery || selectedCategory !== 'all') && (
        <div className="flex items-center gap-2 text-xs text-[#64748B] pt-1">
          <span>Active filter:</span>
          {searchQuery && (
            <span className="bg-slate-100 text-[#1E2A44] px-2 py-0.5 rounded flex items-center gap-1">
              Search: "{searchQuery}"
              <button onClick={() => handleSearchChange('')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {selectedCategory !== 'all' && (
            <span className="bg-slate-100 text-[#1E2A44] px-2 py-0.5 rounded flex items-center gap-1">
              Category: {categories.find((c) => c.slug === selectedCategory)?.name}
              <button onClick={() => handleCategoryChange('all')}><X className="w-3 h-3" /></button>
            </span>
          )}
          <button
            onClick={clearFilters}
            className="text-[#E8553A] hover:underline ml-2 font-medium"
          >
            Reset all
          </button>
        </div>
      )}

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="h-72 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : displayedProducts.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center space-y-4 max-w-md mx-auto">
          <p className="text-base font-semibold text-[#1E2A44]">No matching gadgets found</p>
          <p className="text-xs text-[#64748B]">
            We couldn't find any products matching your current filters. Try searching for a different keyword or resetting your filters.
          </p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-[#1E2A44] text-white text-xs font-semibold rounded-lg hover:bg-[#1E2A44]/90"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Load More Button */}
          {visibleCount < filteredProducts.length && (
            <div className="text-center pt-8">
              <button
                onClick={() => setVisibleCount((prev) => prev + 8)}
                className="px-6 py-2.5 bg-white border border-[#E2E8F0] hover:border-[#1E2A44] text-[#1E2A44] text-xs font-semibold rounded-lg transition-colors shadow-xs"
              >
                Load More Products ({filteredProducts.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </>
      )}

    </div>
  );
};
