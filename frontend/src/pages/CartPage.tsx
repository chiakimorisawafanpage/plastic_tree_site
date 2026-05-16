import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { CartItem } from '../types';
import PageTransition from '../components/PageTransition';

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const { user } = useAuth();
  const api = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadCart();
  }, [user]);

  async function loadCart() {
    setLoading(true);
    const data = await api.getCart();
    setItems(data);
    setLoading(false);
  }

  async function handleUpdateQuantity(item: CartItem, delta: number) {
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      await api.removeFromCart(item.id);
    } else {
      await api.updateCartItem(item.id, item.product_id, newQty);
    }
    await loadCart();
  }

  async function handleRemove(itemId: number) {
    await api.removeFromCart(itemId);
    await loadCart();
  }

  async function handleCheckout() {
    setCheckingOut(true);
    try {
      await api.checkout('card');
      setOrderSuccess(true);
      setItems([]);
    } catch {
      // ignore
    } finally {
      setCheckingOut(false);
    }
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <PageTransition>
      <div className="min-h-screen bg-black pt-24 px-6">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors mb-8 text-sm"
          >
            <ArrowLeft size={16} />
            <span className="tracking-wider uppercase">Назад</span>
          </button>

          <div className="text-center mb-12">
            <h1 className="text-3xl font-extralight text-white tracking-widest uppercase mb-2">
              Корзина
            </h1>
            <div className="w-12 h-px bg-white/20 mx-auto" />
          </div>

          {orderSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 text-center mb-8"
            >
              <ShoppingBag className="mx-auto mb-3 text-green-400" size={32} />
              <p className="text-green-400 text-lg font-light">Заказ успешно оформлен!</p>
              <p className="text-green-400/60 text-sm mt-1">Спасибо за покупку</p>
              <button
                onClick={() => navigate('/profile')}
                className="mt-4 text-white/50 hover:text-white text-sm underline underline-offset-4 transition-colors"
              >
                Посмотреть заказы
              </button>
            </motion.div>
          )}

          {loading ? (
            <div className="text-center py-20">
              <div className="w-8 h-8 border border-white/20 border-t-white/60 rounded-full animate-spin mx-auto" />
            </div>
          ) : items.length === 0 && !orderSuccess ? (
            <div className="text-center py-20">
              <ShoppingBag className="mx-auto mb-4 text-white/20" size={48} />
              <p className="text-white/30 text-lg font-light">Корзина пуста</p>
              <button
                onClick={() => navigate('/')}
                className="mt-6 px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm transition-all tracking-wider"
              >
                К каталогу
              </button>
            </div>
          ) : (
            <>
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="flex items-center gap-4 md:gap-6 py-6 border-b border-white/5"
                  >
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-20 h-20 rounded-lg object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://placehold.co/80x80/1a1a2e/e0e0e0?text=${encodeURIComponent(item.title)}`;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-light text-lg truncate">{item.title}</h3>
                      <p className="text-white/40 text-sm">{item.artist} · {item.year}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleUpdateQuantity(item, -1)}
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/60 flex items-center justify-center transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-white w-6 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item, 1)}
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/60 flex items-center justify-center transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <p className="text-white font-light w-24 text-right">¥{(item.price * item.quantity).toLocaleString()}</p>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-white/20 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {items.length > 0 && (
                <div className="mt-8 pt-6 border-t border-white/10">
                  <div className="flex justify-between items-center mb-8">
                    <span className="text-white/50 text-sm tracking-wider uppercase">Итого</span>
                    <span className="text-white text-2xl font-light">¥{total.toLocaleString()}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={checkingOut}
                    className="w-full bg-white hover:bg-gray-200 text-black py-4 rounded-lg text-sm tracking-wider uppercase transition-colors disabled:opacity-50"
                  >
                    {checkingOut ? 'Обработка...' : 'Оформить заказ'}
                  </button>
                  <p className="text-center text-white/20 text-xs mt-3">
                    Это демо-оплата (школьный проект)
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
