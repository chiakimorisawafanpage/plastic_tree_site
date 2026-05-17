import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import ProductModal from '../components/ProductModal';
import PageTransition from '../components/PageTransition';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { Product } from '../types';

interface FloatingElement {
  type: 'spider-lily' | 'bamboo-leaf' | 'orchid' | 'feather' | 'petal' | 'bird' | 'circle' | 'lotus' | 'sakura';
  x: string;
  y: string;
  size: number;
  color: string;
  speed: number;
  rotation?: number;
  opacity?: number;
}

interface ThemeConfig {
  bgStyle: React.CSSProperties;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentHover: string;
  border: string;
  label: string;
  subtitle: string;
  cardShadow: string;
  floatingElements: FloatingElement[];
}

const THEMES: Record<string, ThemeConfig> = {
  singles: {
    bgStyle: { background: 'linear-gradient(180deg, #e8f5e9 0%, #f1f8e9 30%, #e0f2e1 60%, #dcedc8 100%)' },
    textPrimary: 'text-emerald-900',
    textSecondary: 'text-emerald-800',
    textMuted: 'text-emerald-600',
    accent: 'bg-emerald-800 text-white',
    accentHover: 'hover:bg-emerald-900',
    border: 'border-emerald-300/50',
    label: '「Plastic Tree Single Collection」',
    subtitle: 'Best Singles · 1997–1998',
    cardShadow: '0 25px 60px rgba(45,90,63,0.3)',
    floatingElements: [
      { type: 'bamboo-leaf', x: '3%', y: '5%', size: 90, color: '#2d5a3f', speed: 0.3, rotation: -15, opacity: 0.5 },
      { type: 'bamboo-leaf', x: '92%', y: '3%', size: 70, color: '#3a7252', speed: 0.45, rotation: 25, opacity: 0.4 },
      { type: 'bamboo-leaf', x: '88%', y: '25%', size: 55, color: '#4a8c65', speed: 0.35, rotation: -35, opacity: 0.35 },
      { type: 'bamboo-leaf', x: '7%', y: '30%', size: 65, color: '#2d5a3f', speed: 0.5, rotation: 40, opacity: 0.3 },
      { type: 'lotus', x: '82%', y: '72%', size: 80, color: '#e8b4bc', speed: 0.2, opacity: 0.45 },
      { type: 'lotus', x: '15%', y: '82%', size: 60, color: '#d4a0a7', speed: 0.3, opacity: 0.35 },
      { type: 'bamboo-leaf', x: '70%', y: '15%', size: 45, color: '#3a7252', speed: 0.55, rotation: -20, opacity: 0.25 },
      { type: 'circle', x: '25%', y: '45%', size: 5, color: '#4a8c65', speed: 0.4, opacity: 0.15 },
      { type: 'circle', x: '55%', y: '60%', size: 4, color: '#2d5a3f', speed: 0.6, opacity: 0.12 },
      { type: 'bamboo-leaf', x: '45%', y: '90%', size: 50, color: '#4a8c65', speed: 0.25, rotation: 60, opacity: 0.3 },
    ],
  },
  hakusei: {
    bgStyle: { background: 'linear-gradient(180deg, #f5f5f5 0%, #e8e8e8 25%, #d5d5d5 50%, #c8c8c8 75%, #e0e0e0 100%)' },
    textPrimary: 'text-gray-800',
    textSecondary: 'text-gray-700',
    textMuted: 'text-gray-500',
    accent: 'bg-gray-700 text-white',
    accentHover: 'hover:bg-gray-800',
    border: 'border-gray-400/40',
    label: '13th アルバム「剥製」【通常盤】',
    subtitle: '13th Album · 2019',
    cardShadow: '0 25px 60px rgba(100,100,100,0.3)',
    floatingElements: [
      { type: 'orchid', x: '87%', y: '5%', size: 100, color: '#f0ece8', speed: 0.25, rotation: -10, opacity: 0.55 },
      { type: 'orchid', x: '5%', y: '68%', size: 110, color: '#e8e4e0', speed: 0.2, rotation: 15, opacity: 0.5 },
      { type: 'orchid', x: '78%', y: '60%', size: 70, color: '#ddd8d3', speed: 0.35, rotation: -25, opacity: 0.3 },
      { type: 'petal', x: '20%', y: '15%', size: 35, color: '#c5bfb9', speed: 0.45, rotation: 30, opacity: 0.2 },
      { type: 'petal', x: '65%', y: '85%', size: 28, color: '#b0aaa4', speed: 0.5, rotation: -45, opacity: 0.18 },
      { type: 'circle', x: '40%', y: '35%', size: 6, color: '#999', speed: 0.3, opacity: 0.1 },
      { type: 'circle', x: '30%', y: '50%', size: 4, color: '#aaa', speed: 0.55, opacity: 0.08 },
    ],
  },
  plastictree: {
    bgStyle: { background: 'linear-gradient(180deg, #fafafa 0%, #f0f0f0 30%, #e8e8e8 60%, #f5f5f5 100%)' },
    textPrimary: 'text-gray-900',
    textSecondary: 'text-gray-700',
    textMuted: 'text-gray-400',
    accent: 'bg-black text-white',
    accentHover: 'hover:bg-gray-900',
    border: 'border-gray-300/50',
    label: 'New Album「Plastic Tree」【通常盤】',
    subtitle: 'New Album · 2024',
    cardShadow: '0 25px 60px rgba(0,0,0,0.25)',
    floatingElements: [
      { type: 'bird', x: '75%', y: '3%', size: 55, color: '#1a1a1a', speed: 0.4, rotation: -15, opacity: 0.4 },
      { type: 'bird', x: '82%', y: '8%', size: 40, color: '#333', speed: 0.45, rotation: 10, opacity: 0.3 },
      { type: 'bird', x: '68%', y: '12%', size: 35, color: '#2a2a2a', speed: 0.35, rotation: -25, opacity: 0.25 },
      { type: 'feather', x: '12%', y: '18%', size: 50, color: '#1a1a1a', speed: 0.3, rotation: 30, opacity: 0.3 },
      { type: 'feather', x: '88%', y: '45%', size: 40, color: '#333', speed: 0.5, rotation: -40, opacity: 0.2 },
      { type: 'feather', x: '20%', y: '70%', size: 35, color: '#2a2a2a', speed: 0.25, rotation: 55, opacity: 0.22 },
      { type: 'sakura', x: '60%', y: '78%', size: 45, color: '#d4d4d4', speed: 0.35, opacity: 0.3 },
      { type: 'sakura', x: '30%', y: '85%', size: 55, color: '#c0c0c0', speed: 0.2, opacity: 0.25 },
      { type: 'sakura', x: '80%', y: '88%', size: 35, color: '#b0b0b0', speed: 0.45, opacity: 0.2 },
      { type: 'bird', x: '50%', y: '6%', size: 30, color: '#444', speed: 0.55, rotation: 5, opacity: 0.2 },
    ],
  },
  parade: {
    bgStyle: { background: 'linear-gradient(180deg, #fdf2f4 0%, #fce4ec 25%, #f8d0d8 50%, #fce4ec 75%, #fdf2f4 100%)' },
    textPrimary: 'text-red-900',
    textSecondary: 'text-red-800',
    textMuted: 'text-red-400',
    accent: 'bg-red-800 text-white',
    accentHover: 'hover:bg-red-900',
    border: 'border-red-300/40',
    label: '3rd「Parade」',
    subtitle: '3rd Album · 2000',
    cardShadow: '0 25px 60px rgba(139,34,50,0.3)',
    floatingElements: [
      { type: 'spider-lily', x: '5%', y: '5%', size: 100, color: '#8b2232', speed: 0.25, rotation: -10, opacity: 0.5 },
      { type: 'spider-lily', x: '88%', y: '65%', size: 90, color: '#a83248', speed: 0.3, rotation: 15, opacity: 0.45 },
      { type: 'spider-lily', x: '80%', y: '10%', size: 60, color: '#7a1e2e', speed: 0.4, rotation: -30, opacity: 0.3 },
      { type: 'petal', x: '20%', y: '75%', size: 40, color: '#c4687a', speed: 0.35, rotation: 25, opacity: 0.3 },
      { type: 'petal', x: '70%', y: '40%', size: 35, color: '#d4a0a7', speed: 0.5, rotation: -50, opacity: 0.2 },
      { type: 'petal', x: '45%', y: '88%', size: 30, color: '#9c2c40', speed: 0.45, rotation: 35, opacity: 0.25 },
      { type: 'circle', x: '35%', y: '25%', size: 6, color: '#c4687a', speed: 0.3, opacity: 0.12 },
      { type: 'petal', x: '10%', y: '50%', size: 25, color: '#8b2232', speed: 0.55, rotation: -15, opacity: 0.18 },
      { type: 'spider-lily', x: '15%', y: '90%', size: 70, color: '#6d1a28', speed: 0.2, rotation: 40, opacity: 0.35 },
    ],
  },
};

const SECTION_ORDER = ['singles', 'hakusei', 'plastictree', 'parade'];
const PRODUCT_MAP: Record<string, number> = { singles: 0, hakusei: 1, plastictree: 2, parade: 3 };

const FALLBACK_PRODUCTS: Product[] = [
  { id: 1, title: 'Single Collection', artist: 'Plastic Tree', year: 1998, price: 2800, description: 'Сборник синглов Plastic Tree — ключевые треки раннего периода группы, объединённые в одном издании.', image_url: '/images/concept-singles.png', tracklist: ['1. 割れた窓','2. 本当の嘘','3. 絶望の丘','4. トレモロ','5. Sink','6. ツメタイヒカリ','7. スライド.','8. ロケット','9. プラネタリウム','10. 鳴り響く、鐘','11. アブストラクト マイ ライフ','12. パノラマ','13. 「月世界」','14. ブランコから','15. オルガン.','16. プラネタリウム（98 Version）','17. 液体（98 Version）'], genre: 'Alternative Rock', format: 'CD' },
  { id: 2, title: '剥製', artist: 'Plastic Tree', year: 2019, price: 3200, description: '13-й студийный альбом Plastic Tree. Глубокий и атмосферный релиз с тёмным, меланхоличным звучанием.', image_url: '/images/concept-hakusei.png', tracklist: ['1. ○生物','2. フラスコ','3. マイム','4. ハシエンダ','5. 告白','6. インソムニアブルース','7. float','8. 落花','9. スラッシングパンプキン・デスマーチ','10. スロウ','11. 剥製','12. ●静物'], genre: 'Alternative Rock', format: 'CD' },
  { id: 3, title: 'Plastic Tree', artist: 'Plastic Tree', year: 2024, price: 3500, description: 'Новый одноимённый альбом группы. Экспериментальное звучание, сочетающее классический стиль с новыми текстурами.', image_url: '/images/concept-plastictree.png', tracklist: ['1. ライムライト','2. ざわめき','3. no rest for the wicked','4. ゆうえん','5. シカバネーゼ','6. 宵闇','7. Invisible letter','8. 痣花','9. メルヘン','10. 夢落ち'], genre: 'Alternative Rock', format: 'CD' },
  { id: 4, title: 'Parade', artist: 'Plastic Tree', year: 2000, price: 2500, description: '3-й студийный альбом. Один из самых культовых релизов группы с красивым, меланхоличным звучанием.', image_url: '/images/concept-parade.png', tracklist: ['1. エーテル','2. ロケット','3. スライド.','4. 少女狂想','5. ベランダ.','6. 空白の日','7. 十字路','8. トレモロ','9. 睡眠薬','10. bloom','11. Sink','12. そしてパレードは続く'], genre: 'Alternative Rock', format: 'CD' },
];

function FloatingDecor({ element, scrollY }: { element: FloatingElement; scrollY: ReturnType<typeof useScroll>['scrollY'] }) {
  const yOffset = useTransform(scrollY, [0, 6000], [0, -500 * element.speed]);
  const xOffset = useTransform(scrollY, [0, 6000], [0, 40 * element.speed * (parseFloat(element.x) > 50 ? -1 : 1)]);
  const rotate = useTransform(scrollY, [0, 6000], [0, 15 * element.speed * (element.rotation && element.rotation > 0 ? 1 : -1)]);
  const baseOpacity = element.opacity ?? 0.3;

  const renderShape = () => {
    switch (element.type) {
      case 'spider-lily':
        return (
          <svg width={element.size} height={element.size} viewBox="0 0 100 100" fill="none" style={{ transform: `rotate(${element.rotation || 0}deg)` }}>
            {[0, 30, 60, 90, 120, 150].map((angle) => (
              <g key={angle} transform={`rotate(${angle} 50 50)`}>
                <path d="M50 50 Q48 30, 50 5 Q52 30, 50 50" stroke={element.color} strokeWidth="1.2" fill="none" opacity={baseOpacity} />
                <path d="M50 5 Q45 0, 42 8" stroke={element.color} strokeWidth="0.8" fill="none" opacity={baseOpacity * 0.8} />
                <path d="M50 5 Q55 0, 58 8" stroke={element.color} strokeWidth="0.8" fill="none" opacity={baseOpacity * 0.8} />
              </g>
            ))}
            <circle cx="50" cy="50" r="4" fill={element.color} opacity={baseOpacity * 0.6} />
          </svg>
        );
      case 'bamboo-leaf':
        return (
          <svg width={element.size} height={element.size * 0.4} viewBox="0 0 100 40" fill="none" style={{ transform: `rotate(${element.rotation || 0}deg)` }}>
            <path d="M5 20 Q25 5, 50 8 Q75 5, 95 20 Q75 35, 50 32 Q25 35, 5 20Z" fill={element.color} opacity={baseOpacity} />
            <path d="M10 20 L90 20" stroke={element.color} strokeWidth="0.5" opacity={baseOpacity * 0.5} />
            <path d="M30 12 L30 28" stroke={element.color} strokeWidth="0.3" opacity={baseOpacity * 0.3} />
            <path d="M50 10 L50 30" stroke={element.color} strokeWidth="0.3" opacity={baseOpacity * 0.3} />
            <path d="M70 12 L70 28" stroke={element.color} strokeWidth="0.3" opacity={baseOpacity * 0.3} />
          </svg>
        );
      case 'orchid':
        return (
          <svg width={element.size} height={element.size} viewBox="0 0 100 100" fill="none" style={{ transform: `rotate(${element.rotation || 0}deg)` }}>
            <ellipse cx="50" cy="35" rx="14" ry="28" fill={element.color} opacity={baseOpacity} transform="rotate(-20 50 35)" />
            <ellipse cx="50" cy="35" rx="14" ry="28" fill={element.color} opacity={baseOpacity} transform="rotate(20 50 35)" />
            <ellipse cx="50" cy="40" rx="10" ry="22" fill={element.color} opacity={baseOpacity * 0.8} />
            <ellipse cx="38" cy="50" rx="12" ry="20" fill={element.color} opacity={baseOpacity * 0.7} transform="rotate(-35 38 50)" />
            <ellipse cx="62" cy="50" rx="12" ry="20" fill={element.color} opacity={baseOpacity * 0.7} transform="rotate(35 62 50)" />
            <circle cx="50" cy="38" r="5" fill={element.color} opacity={baseOpacity * 0.5} />
            <circle cx="50" cy="38" r="2.5" fill="#d4a76a" opacity={baseOpacity * 0.6} />
          </svg>
        );
      case 'feather':
        return (
          <svg width={element.size * 0.5} height={element.size} viewBox="0 0 30 80" fill="none" style={{ transform: `rotate(${element.rotation || 0}deg)` }}>
            <path d="M15 0 C18 20, 28 35, 15 80 C2 35, 12 20, 15 0Z" fill={element.color} opacity={baseOpacity} />
            <path d="M15 5 L15 75" stroke={element.color} strokeWidth="0.6" opacity={baseOpacity * 0.7} />
            {[15, 25, 35, 45, 55, 65].map((yVal) => (
              <g key={yVal}>
                <path d={`M15 ${yVal} Q10 ${yVal - 3}, 8 ${yVal + 2}`} stroke={element.color} strokeWidth="0.3" fill="none" opacity={baseOpacity * 0.4} />
                <path d={`M15 ${yVal} Q20 ${yVal - 3}, 22 ${yVal + 2}`} stroke={element.color} strokeWidth="0.3" fill="none" opacity={baseOpacity * 0.4} />
              </g>
            ))}
          </svg>
        );
      case 'bird':
        return (
          <svg width={element.size} height={element.size * 0.5} viewBox="0 0 60 30" fill="none" style={{ transform: `rotate(${element.rotation || 0}deg)` }}>
            <path d="M0 15 Q10 5, 20 10 Q25 5, 30 8 Q35 5, 40 10 Q50 5, 60 15" stroke={element.color} strokeWidth="1.8" fill="none" opacity={baseOpacity} />
            <path d="M25 10 Q28 12, 30 14 Q32 12, 35 10" fill={element.color} opacity={baseOpacity * 0.5} />
          </svg>
        );
      case 'sakura':
        return (
          <svg width={element.size} height={element.size} viewBox="0 0 60 60" fill="none">
            {[0, 72, 144, 216, 288].map((angle) => (
              <ellipse key={angle} cx="30" cy="15" rx="7" ry="14" fill={element.color} opacity={baseOpacity}
                transform={`rotate(${angle} 30 30)`} />
            ))}
            <circle cx="30" cy="30" r="5" fill={element.color} opacity={baseOpacity * 0.5} />
          </svg>
        );
      case 'lotus':
        return (
          <svg width={element.size} height={element.size * 0.7} viewBox="0 0 80 56" fill="none">
            <ellipse cx="40" cy="30" rx="10" ry="22" fill={element.color} opacity={baseOpacity} />
            <ellipse cx="40" cy="30" rx="10" ry="22" fill={element.color} opacity={baseOpacity * 0.9} transform="rotate(-25 40 30)" />
            <ellipse cx="40" cy="30" rx="10" ry="22" fill={element.color} opacity={baseOpacity * 0.9} transform="rotate(25 40 30)" />
            <ellipse cx="40" cy="32" rx="8" ry="18" fill={element.color} opacity={baseOpacity * 0.7} transform="rotate(-50 40 32)" />
            <ellipse cx="40" cy="32" rx="8" ry="18" fill={element.color} opacity={baseOpacity * 0.7} transform="rotate(50 40 32)" />
          </svg>
        );
      case 'petal':
        return (
          <svg width={element.size} height={element.size * 1.3} viewBox="0 0 30 40" fill="none" style={{ transform: `rotate(${element.rotation || 0}deg)` }}>
            <path d="M15 0 Q25 10, 22 25 Q18 38, 15 40 Q12 38, 8 25 Q5 10, 15 0Z" fill={element.color} opacity={baseOpacity} />
          </svg>
        );
      case 'circle':
        return (
          <svg width={element.size * 2} height={element.size * 2} viewBox="0 0 10 10">
            <circle cx="5" cy="5" r="4" fill={element.color} opacity={baseOpacity} />
          </svg>
        );
    }
  };

  return (
    <motion.div
      style={{ position: 'absolute', left: element.x, top: element.y, y: yOffset, x: xOffset, rotate, pointerEvents: 'none', zIndex: 1 }}
      initial={{ opacity: 0, scale: 0.6 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 2, delay: Math.random() * 0.8, ease: 'easeOut' }}
    >
      {renderShape()}
    </motion.div>
  );
}

function AlbumSection({ product, themeKey, onCardClick }: { product: Product; themeKey: string; onCardClick: (p: Product) => void }) {
  const theme = THEMES[themeKey];
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const imgParallax = useTransform(scrollY, [0, 5000], [0, -60]);

  return (
    <section ref={sectionRef} className="relative min-h-screen overflow-hidden" style={theme.bgStyle}>
      {theme.floatingElements.map((el, i) => (
        <FloatingDecor key={i} element={el} scrollY={scrollY} />
      ))}

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="max-w-5xl w-full"
        >
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            <motion.div
              style={{ y: imgParallax }}
              whileHover={{ scale: 1.04 }}
              transition={{ type: 'spring', stiffness: 250, damping: 25 }}
              onClick={() => onCardClick(product)}
              className="w-60 h-60 sm:w-72 sm:h-72 lg:w-80 lg:h-80 flex-shrink-0 cursor-pointer group relative overflow-hidden rounded-sm"
            >
              <div className="absolute inset-0" style={{ boxShadow: theme.cardShadow }} />
              <img
                src={product.image_url}
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://placehold.co/400x400/1a1a2e/e0e0e0?text=${encodeURIComponent(product.title)}`;
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-all duration-700 flex items-center justify-center">
                <span className="text-white/0 group-hover:text-white/90 text-xs tracking-widest uppercase transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 font-light">
                  Подробнее
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
              className="flex-1 text-center lg:text-left max-w-lg"
            >
              <p className={`text-xs tracking-widest uppercase mb-3 font-light ${theme.textMuted}`}>{theme.subtitle}</p>
              <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-extralight tracking-wide mb-3 ${theme.textPrimary}`}>{theme.label}</h2>
              <p className={`text-sm leading-relaxed mb-6 font-light ${theme.textSecondary}`}>{product.description}</p>

              <div className={`mb-6 border-t ${theme.border} pt-4`}>
                <p className={`text-xs tracking-widest uppercase mb-3 font-light ${theme.textMuted}`}>Трек-лист</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-0.5">
                  {product.tracklist.slice(0, 12).map((track, i) => (
                    <p key={i} className={`text-xs font-light leading-relaxed ${theme.textSecondary}`}>{track}</p>
                  ))}
                  {product.tracklist.length > 12 && (
                    <p className={`text-xs font-light italic ${theme.textMuted}`}>+{product.tracklist.length - 12} треков...</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-5 justify-center lg:justify-start">
                <span className={`text-2xl font-extralight tracking-wide ${theme.textPrimary}`}>¥{product.price.toLocaleString()}</span>
                <button
                  onClick={() => onCardClick(product)}
                  className={`px-7 py-2.5 rounded-full text-xs tracking-widest uppercase transition-all duration-300 ${theme.accent} ${theme.accentHover}`}
                >
                  Купить
                </button>
              </div>
            </motion.div>
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
      <div className="bg-black">
        <div className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-zinc-900 via-black to-zinc-900">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.03) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.02) 0%, transparent 50%)'
            }} />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="relative z-10 text-center px-6"
          >
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="text-white/20 text-xs tracking-widest uppercase mb-8 font-light"
            >
              Official Store
            </motion.p>
            <motion.h1
              className="text-5xl sm:text-6xl md:text-8xl font-extralight text-white tracking-widest uppercase mb-6"
              initial={{ letterSpacing: '0.6em', opacity: 0 }}
              animate={{ letterSpacing: '0.25em', opacity: 1 }}
              transition={{ duration: 2, delay: 0.3, ease: 'easeOut' }}
            >
              Plastic Tree
            </motion.h1>
            <motion.div initial={{ width: 0 }} animate={{ width: '100px' }} transition={{ duration: 1.2, delay: 1 }} className="h-px bg-white/20 mx-auto mb-8" />
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.3 }} className="text-white/30 text-xs tracking-widest uppercase font-light">
              Дискография · Коллекция · CD
            </motion.p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1 }} className="absolute bottom-12 left-1/2 -translate-x-1/2">
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }} className="flex flex-col items-center gap-2">
              <span className="text-white/20 text-xs tracking-widest uppercase font-light">Scroll</span>
              <svg width="16" height="24" viewBox="0 0 16 24" fill="none" className="text-white/20">
                <path d="M8 4 L8 18 M3 14 L8 19 L13 14" stroke="currentColor" strokeWidth="1" />
              </svg>
            </motion.div>
          </motion.div>
        </div>

        {products.length > 0 && SECTION_ORDER.map((themeKey) => {
          const product = products[PRODUCT_MAP[themeKey]];
          if (!product) return null;
          return <AlbumSection key={themeKey} product={product} themeKey={themeKey} onCardClick={handleCardClick} />;
        })}

        <footer className="relative z-10 bg-black border-t border-white/5 py-16 text-center">
          <p className="text-white/15 text-xs tracking-widest uppercase font-light">© 2024 Plastic Tree · Школьный проект</p>
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
