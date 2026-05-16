import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, Package, Edit3, Save, ArrowLeft, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { Order } from '../types';
import PageTransition from '../components/PageTransition';

export default function ProfilePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loadingOrders, setLoadingOrders] = useState(true);
  const { user, logout, updateProfile } = useAuth();
  const api = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setUsername(user.username || '');
    setPhone(user.phone || '');
    setAddress(user.address || '');
    loadOrders();
  }, [user]);

  async function loadOrders() {
    setLoadingOrders(true);
    const data = await api.getOrders();
    setOrders(data);
    setLoadingOrders(false);
  }

  async function handleSaveProfile() {
    await updateProfile({ username, phone, address });
    setEditing(false);
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  if (!user) return null;

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
              Профиль
            </h1>
            <div className="w-12 h-px bg-white/20 mx-auto" />
          </div>

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 mb-12"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white/60 text-2xl font-light">
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h2 className="text-white text-xl font-light">{user.username}</h2>
                  <p className="text-white/40 text-sm">{user.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {editing ? (
                  <>
                    <button
                      onClick={handleSaveProfile}
                      className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm transition-all"
                    >
                      <Save size={14} />
                      Сохранить
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 text-white/60 rounded-full text-sm transition-all"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm transition-all"
                  >
                    <Edit3 size={14} />
                    Изменить
                  </button>
                )}
              </div>
            </div>

            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-white/40 text-xs tracking-widest uppercase block mb-2">Имя</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-white/40 text-xs tracking-widest uppercase block mb-2">Телефон</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30 transition-colors"
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>
                <div>
                  <label className="text-white/40 text-xs tracking-widest uppercase block mb-2">Адрес</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30 transition-colors"
                    placeholder="Ваш адрес доставки"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {user.phone && (
                  <div className="flex justify-between">
                    <span className="text-white/40 text-sm">Телефон</span>
                    <span className="text-white/70 text-sm">{user.phone}</span>
                  </div>
                )}
                {user.address && (
                  <div className="flex justify-between">
                    <span className="text-white/40 text-sm">Адрес</span>
                    <span className="text-white/70 text-sm">{user.address}</span>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleLogout}
              className="mt-6 flex items-center gap-2 text-white/30 hover:text-red-400 transition-colors text-sm"
            >
              <LogOut size={14} />
              Выйти
            </button>
          </motion.div>

          {/* Orders */}
          <div className="mb-12">
            <h2 className="text-xl font-extralight text-white tracking-widest uppercase mb-6 flex items-center gap-3">
              <Package size={20} className="text-white/40" />
              Мои заказы
            </h2>

            {loadingOrders ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border border-white/20 border-t-white/60 rounded-full animate-spin mx-auto" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-xl border border-white/5">
                <Package className="mx-auto mb-3 text-white/15" size={40} />
                <p className="text-white/30 font-light">Заказов пока нет</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 border border-white/10 rounded-xl p-5"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-white/40 text-xs tracking-wider">Заказ #{order.id}</p>
                        <p className="text-white/30 text-xs mt-0.5">
                          {new Date(order.created_at).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-green-400/70 text-xs tracking-wider uppercase">{order.status}</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-white/60">{item.title} × {item.quantity}</span>
                          <span className="text-white/40">¥{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/5 flex justify-between">
                      <span className="text-white/40 text-sm">Итого</span>
                      <span className="text-white font-light">¥{order.total.toLocaleString()}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
