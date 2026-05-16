import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, CreditCard } from 'lucide-react';
import { Product } from '../types';

interface Props {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  isLoggedIn: boolean;
}

export default function ProductModal({ product, isOpen, onClose, onAddToCart, onBuyNow, isLoggedIn }: Props) {
  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-zinc-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto border border-white/10 shadow-2xl">
              <div className="relative">
                <div className="aspect-square w-full max-h-80 overflow-hidden rounded-t-2xl bg-zinc-800">
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://placehold.co/400x400/1a1a2e/e0e0e0?text=${encodeURIComponent(product.title)}`;
                    }}
                  />
                </div>
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full p-2 text-white/70 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h2 className="text-2xl font-light text-white tracking-wide">{product.title}</h2>
                  <p className="text-white/50 text-sm mt-1">{product.artist} · {product.year} · {product.format}</p>
                </div>

                <p className="text-white/70 text-sm leading-relaxed">{product.description}</p>

                <div>
                  <h3 className="text-white/40 text-xs uppercase tracking-widest mb-2">Трек-лист</h3>
                  <div className="space-y-1">
                    {product.tracklist.map((track, i) => (
                      <p key={i} className="text-white/60 text-sm font-light">{track}</p>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <span className="text-2xl text-white font-light">¥{product.price.toLocaleString()}</span>
                  {isLoggedIn ? (
                    <div className="flex gap-3">
                      <button
                        onClick={() => onAddToCart(product)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm transition-all"
                      >
                        <ShoppingCart size={16} />
                        В корзину
                      </button>
                      <button
                        onClick={() => onBuyNow(product)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-200 text-black rounded-full text-sm transition-all"
                      >
                        <CreditCard size={16} />
                        Купить
                      </button>
                    </div>
                  ) : (
                    <p className="text-white/40 text-sm">Войдите, чтобы купить</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
