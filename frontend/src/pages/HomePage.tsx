import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AlbumCard from '../components/AlbumCard';
import ProductModal from '../components/ProductModal';
import PageTransition from '../components/PageTransition';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { Product } from '../types';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { user } = useAuth();
  const api = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    api.getProducts().then(setProducts);
  }, []);

  function handleCardClick(product: Product) {
    setSelectedProduct(product);
    setModalOpen(true);
  }

  async function handleAddToCart(product: Product) {
    if (!user) {
      navigate('/auth');
      return;
    }
    await api.addToCart(product.id);
    setModalOpen(false);
  }

  async function handleBuyNow(product: Product) {
    if (!user) {
      navigate('/auth');
      return;
    }
    await api.addToCart(product.id);
    navigate('/cart');
  }

  const reversedProducts = [...products].reverse();

  return (
    <PageTransition>
      <div className="min-h-screen bg-black">
        {/* Hero Section */}
        <div className="relative h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/50 via-black to-black" />
          
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="relative z-10 text-center px-6"
          >
            <motion.h1
              className="text-6xl md:text-8xl font-extralight text-white tracking-widest uppercase mb-4"
              initial={{ letterSpacing: '0.5em', opacity: 0 }}
              animate={{ letterSpacing: '0.3em', opacity: 1 }}
              transition={{ duration: 1.5, delay: 0.3 }}
            >
              Plastic Tree
            </motion.h1>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '120px' }}
              transition={{ duration: 1, delay: 0.8 }}
              className="h-px bg-white/30 mx-auto mb-6"
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="text-white/40 text-sm tracking-widest uppercase"
            >
              Дискография · Коллекция · Винил и CD
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-white/30 text-xs tracking-widest uppercase"
            >
              ↓ Прокрутите вниз
            </motion.div>
          </motion.div>
        </div>

        {/* Catalog Section */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-4xl font-extralight text-white tracking-widest uppercase mb-4">
              Каталог
            </h2>
            <div className="w-16 h-px bg-white/20 mx-auto" />
          </motion.div>

          {reversedProducts.map((product, index) => (
            <AlbumCard
              key={product.id}
              product={product}
              index={index}
              onClick={handleCardClick}
            />
          ))}
        </div>

        {/* Footer */}
        <footer className="relative z-10 border-t border-white/5 py-12 text-center">
          <p className="text-white/20 text-xs tracking-widest uppercase">
            © 2024 Plastic Tree · Школьный проект
          </p>
        </footer>

        <ProductModal
          product={selectedProduct}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          isLoggedIn={!!user}
        />
      </div>
    </PageTransition>
  );
}
