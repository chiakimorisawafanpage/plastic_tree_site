import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import ProductModal from '../components/ProductModal';
import PageTransition from '../components/PageTransition';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { Product } from '../types';

interface FloatingElement {
  type: 'circle' | 'petal' | 'leaf' | 'feather' | 'orchid' | 'lotus';
  x: string;
  y: string;
  size: number;
  color: string;
  speed: number;
  rotation?: number;
}

interface ThemeConfig {
  bg: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  border: string;
  label: string;
  subtitle: string;
  floatingElements: FloatingElement[];
}

const THEMES: Record<string, ThemeConfig> = {
  singles: {
    bg: 'from-emerald-50 via-green-50 to-emerald-100',
    textPrimary: 'text-emerald-900',
    textSecondary: 'text-emerald-700',
    textMuted: 'text-emerald-500',
    accent: 'bg-emerald-800 hover:bg-emerald-900 text-white',
    border: 'border-emerald-200',
    label: '\u300cPlastic Tree Single Collection\u300d',
    subtitle: 'Best Singles \u00b7 1997-1998',
    floatingElements: [
      { type: 'leaf', x: '5%', y: '10%', size: 60, color: '#2d5a3f', speed: 0.3 },
      { type: 'leaf', x: '88%', y: '5%', size: 45, color: '#3a7252', speed: 0.5 },
      { type: 'lotus', x: '80%', y: '70%', size: 55, color: '#d4a0a7', speed: 0.25 },
      { type: 'leaf', x: '12%', y: '75%', size: 50, color: '#4a8c65', speed: 0.4 },
      { type: 'lotus', x: '50%', y: '85%', size: 40, color: '#c9959d', speed: 0.35 },
      { type: 'leaf', x: '70%', y: '30%', size: 35, color: '#2d5a3f', speed: 0.45 },
      { type: 'circle', x: '30%', y: '20%', size: 8, color: '#4a8c65', speed: 0.2 },
      { type: 'circle', x: '60%', y: '50%', size: 6, color: '#3a7252', speed: 0.55 },
    ],
  },
  hakusei: {
    bg: 'from-gray-100 via-gray-200 to-gray-300',
    textPrimary: 'text-gray-800',
    textSecondary: 'text-gray-600',
    textMuted: 'text-gray-500',
    accent: 'bg-gray-700 hover:bg-gray-800 text-white',
    border: 'border-gray-300',
    label: '13th \u30a2\u30eb\u30d0\u30e0\u300c\u5265\u88fd\u300d\u3010\u901a\u5e38\u76e4\u3011',
    subtitle: '13th Album \u00b7 2019',
    floatingElements: [
      { type: 'orchid', x: '85%', y: '8%', size: 65, color: '#e8e4e0', speed: 0.3 },
      { type: 'orchid', x: '8%', y: '70%', size: 70, color: '#ddd8d3', speed: 0.25 },
      { type: 'circle', x: '20%', y: '15%', size: 12, color: '#b0aaa4', speed: 0.4 },
      { type: 'circle', x: '75%', y: '55%', size: 8, color: '#c5bfb9', speed: 0.35 },
      { type: 'petal', x: '40%', y: '80%', size: 30, color: '#d0cbc5', speed: 0.5 },
      { type: 'petal', x: '65%', y: '20%', size: 25, color: '#bab4ae', speed: 0.45 },
    ],
  },
  plastictree: {
    bg: 'from-white via-gray-50 to-gray-100',
    textPrimary: 'text-gray-900',
    textSecondary: 'text-gray-700',
    textMuted: 'text-gray-400',
    accent: 'bg-black hover:bg-gray-900 text-white',
    border: 'border-gray-200',
    label: 'New Album\u300cPlastic Tree\u300d\u3010\u901a\u5e38\u76e4\u3011',
    subtitle: 'New Album \u00b7 2024',
    floatingElements: [
      { type: 'feather', x: '80%', y: '5%', size: 40, color: '#1a1a1a', speed: 0.4, rotation: 30 },
      { type: 'feather', x: '15%', y: '15%', size: 35, color: '#333', speed: 0.3, rotation: -20 },
      { type: 'feather', x: '70%', y: '40%', size: 30, color: '#2a2a2a', speed: 0.5, rotation: 45 },
      { type: 'petal', x: '25%', y: '80%', size: 45, color: '#d4d4d4', speed: 0.25 },
      { type: 'petal', x: '60%', y: '75%', size: 35, color: '#c0c0c0', speed: 0.35 },
      { type: 'circle', x: '90%', y: '60%', size: 6, color: '#666', speed: 0.45 },
      { type: 'feather', x: '45%', y: '10%', size: 25, color: '#1a1a1a', speed: 0.55, rotation: -40 },
    ],
  },
  parade: {
    bg: 'from-red-50 via-rose-100 to-red-200',
    textPrimary: 'text-red-900',
    textSecondary: 'text-red-700',
    textMuted: 'text-red-400',
    accent: 'bg-red-800 hover:bg-red-900 text-white',
    border: 'border-red-200',
    label: '3rd\u300cParade\u300d',
    subtitle: '3rd Album \u00b7 2000',
    floatingElements: [
      { type: 'petal', x: '10%', y: '10%', size: 50, color: '#8b2232', speed: 0.3 },
      { type: 'petal', x: '85%', y: '15%', size: 40, color: '#a83248', speed: 0.4 },
      { type: 'petal', x: '75%', y: '65%', size: 55, color: '#7a1e2e', speed: 0.25 },
      { type: 'petal', x: '15%', y: '80%', size: 35, color: '#9c2c40', speed: 0.5 },
      { type: 'circle', x: '50%', y: '30%', size: 10, color: '#c4687a', speed: 0.35 },
      { type: 'petal', x: '40%', y: '70%', size: 30, color: '#8b2232', speed: 0.45 },
      { type: 'circle', x: '30%', y: '45%', size: 7, color: '#d4a0a7', speed: 0.2 },
      { type: 'petal', x: '60%', y: '90%', size: 45, color: '#6d1a28', speed: 0.55 },
    ],
  },
};

const SECTION_ORDER = ['singles', 'hakusei', 'plastictree', 'parade'];
const PRODUCT_MAP: Record<string, number> = { singles: 0, hakusei: 1, plastictree: 2, parade: 3 };

const FALLBACK_PRODUCTS: Product[] = [
  { id: 1, title: 'Single Collection', artist: 'Plastic Tree', year: 1998, price: 2800, description: 'Сборник синглов Plastic Tree — ключевые треки раннего периода группы, объединённые в одном издании.', image_url: 'https://placehold.co/400x400/2d5a3f/e0e0e0?text=Single+Collection', tracklist: ['1. 割れた窓','2. 本当の嘘','3. 絶望の丘','4. トレモロ','5. Sink','6. ツメタイヒカリ','7. スライド.','8. ロケット','9. プラネタリウム','10. 鳴り響く、鐘','11. アブストラクト マイ ライフ','12. パノラマ','13. 「月世界」','14. ブランコから','15. オルガン.','16. プラネタリウム（98 Version）','17. 液体（98 Version）'], genre: 'Alternative Rock', format: 'CD' },
  { id: 2, title: '剥製', artist: 'Plastic Tree', year: 2019, price: 3200, description: '13-й студийный альбом Plastic Tree. Глубокий и атмосферный релиз с тёмным, меланхоличным звучанием.', image_url: 'https://placehold.co/400x400/808080/e0e0e0?text=剥製', tracklist: ['1. ○生物','2. フラスコ','3. マイム','4. ハシエンダ','5. 告白','6. インソムニアブルース','7. float','8. 落花','9. スラッシングパンプキン・デスマーチ','10. スロウ','11. 剥製','12. ●静物'], genre: 'Alternative Rock', format: 'CD' },
  { id: 3, title: 'Plastic Tree', artist: 'Plastic Tree', year: 2024, price: 3500, description: 'Новый одноимённый альбом группы. Экспериментальное звучание, сочетающее классический стиль с новыми текстурами.', image_url: 'https://placehold.co/400x400/1a1a1a/e0e0e0?text=Plastic+Tree', tracklist: ['1. ライムライト','2. ざわめき','3. no rest for the wicked','4. ゆうえん','5. シカバネーゼ','6. 宵闇','7. Invisible letter','8. 痣花','9. メルヘン','10. 夢落ち'], genre: 'Alternative Rock', format: 'CD' },
  { id: 4, title: 'Parade', artist: 'Plastic Tree', year: 2000, price: 2500, description: '3-й студийный альбом. Один из самых культовых релизов группы с красивым, меланхоличным звучанием.', image_url: 'https://placehold.co/400x400/8b2232/e0e0e0?text=Parade', tracklist: ['1. エーテル','2. ロケット','3. スライド.','4. 少女狂想','5. ベランダ.','6. 空白の日','7. 十字路','8. トレモロ','9. 睡眠薬','10. bloom','11. Sink','12. そしてパレードは続く'], genre: 'Alternative Rock', format: 'CD' },
];

function FloatingDecor({ element, scrollY }: { element: FloatingElement; scrollY: ReturnType<typeof useScroll>['scrollY'] }) {
  const yOffset = useTransform(scrollY, [0, 5000], [0, -400 * element.speed]);
  const xOffset = useTransform(scrollY, [0, 5000], [0, 30 * element.speed * (parseFloat(element.x) > 50 ? -1 : 1)]);

  const renderShape = () => {
    switch (element.type) {
      case 'leaf':
        return (
          <svg width={element.size} height={element.size} viewBox="0 0 60 60" fill="none">
            <path d="M30 5 C45 15, 55 30, 30 55 C5 30, 15 15, 30 5Z" fill={element.color} opacity="0.4" />
            <path d="M30 10 L30 50" stroke={element.color} strokeWidth="0.5" opacity="0.3" />
          </svg>
        );
      case 'petal':
        return (
          <svg width={element.size} height={element.size} viewBox="0 0 50 50" fill="none">
            <ellipse cx="25" cy="25" rx="12" ry="22" fill={element.color} opacity="0.3" transform={`rotate(${element.rotation || 0} 25 25)`} />
          </svg>
        );
      case 'feather':
        return (
          <svg width={element.size} height={element.size * 1.5} viewBox="0 0 40 60" fill="none" style={{ transform: `rotate(${element.rotation || 0}deg)` }}>
            <path d="M20 0 C25 15, 35 25, 20 60 C5 25, 15 15, 20 0Z" fill={element.color} opacity="0.25" />
            <path d="M20 5 L20 55" stroke={element.color} strokeWidth="0.5" opacity="0.2" />
          </svg>
        );
      case 'orchid':
        return (
          <svg width={element.size} height={element.size} viewBox="0 0 60 60" fill="none">
            <ellipse cx="30" cy="20" rx="8" ry="15" fill={element.color} opacity="0.35" transform="rotate(-15 30 20)" />
            <ellipse cx="30" cy="20" rx="8" ry="15" fill={element.color} opacity="0.35" transform="rotate(15 30 20)" />
            <ellipse cx="30" cy="25" rx="6" ry="12" fill={element.color} opacity="0.25" />
            <circle cx="30" cy="18" r="3" fill={element.color} opacity="0.4" />
          </svg>
        );
      case 'lotus':
        return (
          <svg width={element.size} height={element.size} viewBox="0 0 60 60" fill="none">
            <ellipse cx="30" cy="30" rx="8" ry="18" fill={element.color} opacity="0.3" transform="rotate(-30 30 30)" />
            <ellipse cx="30" cy="30" rx="8" ry="18" fill={element.color} opacity="0.3" />
            <ellipse cx="30" cy="30" rx="8" ry="18" fill={element.color} opacity="0.3" transform="rotate(30 30 30)" />
          </svg>
        );
      case 'circle':
        return (
          <svg width={element.size} height={element.size} viewBox="0 0 10 10">
            <circle cx="5" cy="5" r="4" fill={element.color} opacity="0.2" />
          </svg>
        );
    }
  };

  return (
    <motion.div
      style={{ position: 'absolute', left: element.x, top: element.y, y: yOffset, x: xOffset, pointerEvents: 'none', zIndex: 1 }}
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.5, delay: Math.random() * 0.5 }}
    >
      {renderShape()}
    </motion.div>
  );
}

function AlbumSection({ product, themeKey, onCardClick }: { product: Product; themeKey: string; onCardClick: (p: Product) => void }) {
  const theme = THEMES[themeKey];
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  return (
    <section ref={sectionRef} className={`relative min-h-screen overflow-hidden bg-gradient-to-b ${theme.bg}`}>
      {theme.floatingElements.map((el, i) => (
        <FloatingDecor key={i} element={el} scrollY={scrollY} />
      ))}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl w-full flex flex-col md:flex-row items-center gap-10 md:gap-16"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onClick={() => onCardClick(product)}
            className="w-64 h-64 md:w-80 md:h-80 flex-shrink-0 cursor-pointer group relative overflow-hidden rounded-lg shadow-2xl"
          >
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://placehold.co/400x400/1a1a2e/e0e0e0?text=${encodeURIComponent(product.title)}`;
              }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500 flex items-center justify-center">
              <span className="text-white/0 group-hover:text-white text-sm tracking-widest uppercase transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 font-light">
                {'\u041f\u043e\u0434\u0440\u043e\u0431\u043d\u0435\u0435'}
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex-1 text-center md:text-left"
          >
            <p className={`text-xs tracking-widest uppercase mb-3 ${theme.textMuted}`}>{theme.subtitle}</p>
            <h2 className={`text-2xl md:text-3xl font-light tracking-wide mb-2 ${theme.textPrimary}`}>{theme.label}</h2>
            <p className={`text-sm leading-relaxed max-w-md mb-6 ${theme.textSecondary}`}>{product.description}</p>

            <div className={`mb-6 border-t ${theme.border} pt-4`}>
              <p className={`text-xs tracking-widest uppercase mb-3 ${theme.textMuted}`}>{'\u0422\u0440\u0435\u043a-\u043b\u0438\u0441\u0442'}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                {product.tracklist.slice(0, 12).map((track, i) => (
                  <p key={i} className={`text-xs font-light ${theme.textSecondary}`}>{track}</p>
                ))}
                {product.tracklist.length > 12 && (
                  <p className={`text-xs font-light italic ${theme.textMuted}`}>+{product.tracklist.length - 12} {'\u0442\u0440\u0435\u043a\u043e\u0432'}...</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center md:justify-start">
              <span className={`text-2xl font-light ${theme.textPrimary}`}>{'\u00a5'}{product.price.toLocaleString()}</span>
              <button onClick={() => onCardClick(product)} className={`px-6 py-2.5 rounded-full text-sm tracking-wider transition-all ${theme.accent}`}>
                {'\u041a\u0443\u043f\u0438\u0442\u044c'}
              </button>
            </div>
          </motion.div>
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
      <div className="bg-black">
        <div className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-zinc-900 via-black to-zinc-900">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="relative z-10 text-center px-6"
          >
            <motion.h1
              className="text-5xl md:text-7xl font-extralight text-white tracking-widest uppercase mb-4"
              initial={{ letterSpacing: '0.5em', opacity: 0 }}
              animate={{ letterSpacing: '0.3em', opacity: 1 }}
              transition={{ duration: 1.5, delay: 0.3 }}
            >
              Plastic Tree
            </motion.h1>
            <motion.div initial={{ width: 0 }} animate={{ width: '120px' }} transition={{ duration: 1, delay: 0.8 }} className="h-px bg-white/30 mx-auto mb-6" />
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1 }} className="text-white/40 text-sm tracking-widest uppercase">
              {'\u0414\u0438\u0441\u043a\u043e\u0433\u0440\u0430\u0444\u0438\u044f \u00b7 \u041a\u043e\u043b\u043b\u0435\u043a\u0446\u0438\u044f \u00b7 CD'}
            </motion.p>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1 }} className="absolute bottom-10 left-1/2 -translate-x-1/2">
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-white/30 text-xs tracking-widest uppercase">
              {'\u2193'} Scroll
            </motion.div>
          </motion.div>
        </div>

        {products.length > 0 && SECTION_ORDER.map((themeKey) => {
          const product = products[PRODUCT_MAP[themeKey]];
          if (!product) return null;
          return <AlbumSection key={themeKey} product={product} themeKey={themeKey} onCardClick={handleCardClick} />;
        })}

        <footer className="relative z-10 bg-black border-t border-white/5 py-12 text-center">
          <p className="text-white/20 text-xs tracking-widest uppercase">{'\u00a9'} 2024 Plastic Tree {'\u00b7'} {'\u0428\u043a\u043e\u043b\u044c\u043d\u044b\u0439 \u043f\u0440\u043e\u0435\u043a\u0442'}</p>
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
