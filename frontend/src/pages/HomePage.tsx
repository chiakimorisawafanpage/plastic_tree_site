import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import ProductModal from '../components/ProductModal';
import PageTransition from '../components/PageTransition';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { Product } from '../types';

interface SectionConfig {
  label: string;
  conceptImage: string;
  bgColor: string;
  accentColor: string;
  accentHover: string;
  textColor: string;
  mutedColor: string;
}

const SECTIONS: Record<string, SectionConfig> = {
  singles: {
    label: '「Plastic Tree Single Collection」',
    conceptImage: '/images/concept-singles.png',
    bgColor: '#fafcfa',
    accentColor: '#2d5a3f',
    accentHover: '#1e3d2b',
    textColor: '#1a2e1a',
    mutedColor: '#6b8c6b',
  },
  hakusei: {
    label: '13th アルバム「剥製」【通常盤】',
    conceptImage: '/images/concept-hakusei.png',
    bgColor: '#f8f8f8',
    accentColor: '#555555',
    accentHover: '#333333',
    textColor: '#2a2a2a',
    mutedColor: '#888888',
  },
  plastictree: {
    label: 'Plastic Tree New Album「Plastic Tree」【通常盤】',
    conceptImage: '/images/concept-plastictree.png',
    bgColor: '#ffffff',
    accentColor: '#1a1a1a',
    accentHover: '#000000',
    textColor: '#0a0a0a',
    mutedColor: '#666666',
  },
  parade: {
    label: '3rd「Parade」',
    conceptImage: '/images/concept-parade.png',
    bgColor: '#fdf8f8',
    accentColor: '#8b2232',
    accentHover: '#6d1a28',
    textColor: '#3a1015',
    mutedColor: '#b06070',
  },
};

const SECTION_ORDER = ['singles', 'hakusei', 'plastictree', 'parade'];
const PRODUCT_MAP: Record<string, number> = { singles: 0, hakusei: 1, plastictree: 2, parade: 3 };

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 1, title: 'Single Collection', artist: 'Plastic Tree', year: 1998, price: 2800,
    description: 'Сборник синглов Plastic Tree — ключевые треки раннего периода группы, объединённые в одном издании.',
    image_url: '/images/concept-singles.png',
    tracklist: ['1. 割れた窓','2. 本当の嘘','3. 絶望の丘','4. トレモロ','5. Sink','6. ツメタイヒカリ','7. スライド.','8. ロケット','9. プラネタリウム','10. 鳴り響く、鐘','11. アブストラクト マイ ライフ','12. パノラマ','13. 「月世界」','14. ブランコから','15. オルガン.','16. プラネタリウム（98 Version）','17. 液体（98 Version）'],
    genre: 'Alternative Rock', format: 'CD',
  },
  {
    id: 2, title: '剥製', artist: 'Plastic Tree', year: 2019, price: 3200,
    description: '13-й студийный альбом Plastic Tree. Глубокий и атмосферный релиз с тёмным, меланхоличным звучанием.',
    image_url: '/images/concept-hakusei.png',
    tracklist: ['1. ○生物','2. フラスコ','3. マイム','4. ハシエンダ','5. 告白','6. インソムニアブルース','7. float','8. 落花','9. スラッシングパンプキン・デスマーチ','10. スロウ','11. 剥製','12. ●静物'],
    genre: 'Alternative Rock', format: 'CD',
  },
  {
    id: 3, title: 'Plastic Tree', artist: 'Plastic Tree', year: 2024, price: 3500,
    description: 'Новый одноимённый альбом группы. Экспериментальное звучание, сочетающее классический стиль с новыми текстурами.',
    image_url: '/images/concept-plastictree.png',
    tracklist: ['1. ライムライト','2. ざわめき','3. no rest for the wicked','4. ゆうえん','5. シカバネーゼ','6. 宵闇','7. Invisible letter','8. 痣花','9. メルヘン','10. 夢落ち'],
    genre: 'Alternative Rock', format: 'CD',
  },
  {
    id: 4, title: 'Parade', artist: 'Plastic Tree', year: 2000, price: 2500,
    description: '3-й студийный альбом. Один из самых культовых релизов группы с красивым, меланхоличным звучанием.',
    image_url: '/images/concept-parade.png',
    tracklist: ['1. エーテル','2. ロケット','3. スライド.','4. 少女狂想','5. ベランダ.','6. 空白の日','7. 十字路','8. トレモロ','9. 睡眠薬','10. bloom','11. Sink','12. そしてパレードは続く'],
    genre: 'Alternative Rock', format: 'CD',
  },
];

function AlbumSection({
  product,
  themeKey,
  onCardClick,
}: {
  product: Product;
  themeKey: string;
  onCardClick: (p: Product) => void;
}) {
  const config = SECTIONS[themeKey];
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ['-5%', '5%']);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{ backgroundColor: config.bgColor }}
    >
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative cursor-pointer group"
          onClick={() => onCardClick(product)}
        >
          <div className="relative overflow-hidden rounded-sm">
            <motion.img
              src={config.conceptImage}
              alt={config.label}
              className="w-full h-auto"
              style={{ y: imgY }}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <h2
              className="text-lg md:text-xl font-light tracking-wide"
              style={{ color: config.textColor }}
            >
              {config.label}
            </h2>
            <p
              className="text-sm mt-1 font-light"
              style={{ color: config.mutedColor }}
            >
              {product.artist} · {product.year} · {product.format}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span
              className="text-xl font-light"
              style={{ color: config.textColor }}
            >
              ¥{product.price.toLocaleString()}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCardClick(product);
              }}
              className="px-6 py-2 rounded-full text-sm tracking-wider text-white transition-colors duration-300"
              style={{ backgroundColor: config.accentColor }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = config.accentHover)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = config.accentColor)}
            >
              Подробнее
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { user } = useAuth();
  const api = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    api.getProducts()
      .then((data) => setProducts(data.length > 0 ? data : FALLBACK_PRODUCTS))
      .catch(() => setProducts(FALLBACK_PRODUCTS));
  }, []);

  function handleCardClick(product: Product) {
    setSelectedProduct(product);
    setModalOpen(true);
  }

  async function handleAddToCart(product: Product) {
    if (!user) { navigate('/auth'); return; }
    await api.addToCart(product.id);
    setModalOpen(false);
  }

  async function handleBuyNow(product: Product) {
    if (!user) { navigate('/auth'); return; }
    await api.addToCart(product.id);
    navigate('/cart');
  }

  return (
    <PageTransition>
      <div className="bg-white">
        {/* Hero */}
        <div className="relative h-screen flex items-center justify-center bg-white">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="text-center px-6"
          >
            <motion.h1
              className="text-4xl md:text-6xl font-extralight text-neutral-900 tracking-widest uppercase"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              Plastic Tree
            </motion.h1>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '80px' }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="h-px bg-neutral-300 mx-auto mt-6 mb-4"
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.1 }}
              className="text-neutral-400 text-xs tracking-widest uppercase"
            >
              Дискография · Коллекция · CD
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="text-neutral-300 text-xs tracking-widest"
            >
              ↓
            </motion.div>
          </motion.div>
        </div>

        {/* Album sections */}
        {products.length > 0 && SECTION_ORDER.map((themeKey) => {
          const product = products[PRODUCT_MAP[themeKey]];
          if (!product) return null;
          return (
            <AlbumSection
              key={themeKey}
              product={product}
              themeKey={themeKey}
              onCardClick={handleCardClick}
            />
          );
        })}

        {/* Footer */}
        <footer className="bg-white border-t border-neutral-100 py-12 text-center">
          <p className="text-neutral-300 text-xs tracking-widest uppercase">
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
