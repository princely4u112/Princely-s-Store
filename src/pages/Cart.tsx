import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShieldCheck, Truck, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatNaira } from '../utils/formatters';

export const Cart: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    itemCount,
    subtotal,
    deliveryFee,
    freeDeliveryThreshold,
    freeDeliveryRemaining,
    total,
    updateQuantity,
    removeItem,
    revalidateCart,
  } = useCart();

  useEffect(() => {
    revalidateCart();
  }, []);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-md mx-auto bg-white border border-[#E2E8F0] rounded-2xl p-8 sm:p-12 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full flex items-center justify-center mx-auto text-[#64748B]">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-[#1E2A44]">
            Your Shopping Cart is Empty
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
            You haven't added any gadgets or accessories yet. Explore our verified power banks, chargers, and mobile accessories.
          </p>
          <div className="pt-2">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#E8553A] hover:bg-[#D14529] text-white font-semibold text-sm rounded-lg transition-colors shadow-xs"
            >
              <span>Explore Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Page Title */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#1E2A44]">
            Shopping Bag
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} ready for checkout
          </p>
        </div>
        <Link to="/shop" className="text-xs sm:text-sm font-semibold text-[#1E2A44] hover:text-[#E8553A] transition-colors">
          Continue Shopping
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Free Shipping Progress Callout */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 text-xs space-y-2">
            {freeDeliveryRemaining > 0 ? (
              <p className="text-[#1E2A44]">
                Add <span className="font-bold text-[#E8553A]">{formatNaira(freeDeliveryRemaining)}</span> more to qualify for <strong>FREE nationwide shipping</strong>!
              </p>
            ) : (
              <p className="text-emerald-700 font-semibold flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>Congratulations! Your order qualifies for FREE nationwide delivery.</span>
              </p>
            )}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#E8553A] h-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100))}%`,
                }}
              />
            </div>
          </div>

          {/* Cart Table / Cards */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden divide-y divide-[#E2E8F0]">
            {items.map((item) => {
              const primaryImg = item.product.images[0]?.url;
              const maxStock = item.variant ? item.variant.stock : item.product.stock;

              return (
                <div
                  key={`${item.productId}-${item.variantId || 'base'}`}
                  className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <Link
                      to={`/product/${item.product.slug}`}
                      className="w-18 h-18 sm:w-20 sm:h-20 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg overflow-hidden shrink-0"
                    >
                      {primaryImg && (
                        <img
                          src={primaryImg}
                          alt={item.product.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </Link>

                    <div className="space-y-1">
                      <Link
                        to={`/product/${item.product.slug}`}
                        className="font-semibold text-sm sm:text-base text-[#1E2A44] hover:text-[#E8553A] transition-colors line-clamp-1"
                      >
                        {item.product.name}
                      </Link>

                      {item.variant && (
                        <p className="text-xs text-[#64748B]">
                          {item.variant.name}: <span className="font-medium text-[#1E2A44]">{item.variant.optionValue}</span>
                        </p>
                      )}

                      <p className="text-xs sm:text-sm font-bold text-[#1E2A44] tabular-nums">
                        {formatNaira(item.unitPrice)}
                      </p>
                    </div>
                  </div>

                  {/* Quantity Stepper & Subtotal */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="flex items-center border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] text-xs">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                        className="px-2.5 py-1.5 text-[#1E2A44] hover:bg-slate-200 transition-colors font-bold"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 font-semibold text-[#1E2A44] tabular-nums min-w-[28px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                        disabled={item.quantity >= maxStock}
                        className="px-2.5 py-1.5 text-[#1E2A44] hover:bg-slate-200 disabled:opacity-40 transition-colors font-bold"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right min-w-[90px]">
                      <span className="text-sm sm:text-base font-extrabold text-[#1E2A44] tabular-nums">
                        {formatNaira(item.unitPrice * item.quantity)}
                      </span>
                    </div>

                    <button
                      onClick={() => removeItem(item.productId, item.variantId)}
                      className="p-1.5 text-[#64748B] hover:text-[#DC2626] transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-4 bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 space-y-6 shadow-xs sticky top-24">
          <h2 className="font-heading text-lg font-bold text-[#1E2A44] pb-3 border-b border-[#E2E8F0]">
            Order Summary
          </h2>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex items-center justify-between text-[#64748B]">
              <span>Items Subtotal</span>
              <span className="font-medium text-[#1E2A44] tabular-nums">{formatNaira(subtotal)}</span>
            </div>

            <div className="flex items-center justify-between text-[#64748B]">
              <span>Nationwide Shipping</span>
              <span className="font-medium text-[#1E2A44] tabular-nums">
                {deliveryFee === 0 ? (
                  <span className="text-emerald-600 font-semibold uppercase text-xs">FREE</span>
                ) : (
                  formatNaira(deliveryFee)
                )}
              </span>
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-base font-bold text-[#1E2A44]">
              <span>Estimated Total</span>
              <span className="text-xl font-extrabold text-[#1E2A44] tabular-nums">{formatNaira(total)}</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 px-6 bg-[#E8553A] hover:bg-[#D14529] text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-4 border-t border-[#E2E8F0] space-y-2 text-xs text-[#64748B]">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#1E2A44] shrink-0" />
              <span>Estimated delivery: <strong>5–7 days nationwide</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#1E2A44] shrink-0" />
              <span>Secured payments processed via Paystack</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
