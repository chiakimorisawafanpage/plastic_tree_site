import { motion } from 'framer-motion';
import { Product } from '../types';

interface Props {
  product: Product;
  index: number;
  onClick: (product: Product) => void;
}

export default function AlbumCard({ product, index, onClick }: Props) {
  const isEven = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: isEven ? -60 : 60 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
      className={`flex items-center gap-8 md:gap-16 ${isEven ? 'flex-row' : 'flex-row-reverse'} mb-24 md:mb-32`}
    >
      <motion.div
        whileHover={{ scale: 1.08 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        onClick={() => onClick(product)}
        className="w-64 h-64 md:w-80 md:h-80 flex-shrink-0 cursor-pointer group relative overflow-hidden rounded-lg"
      >
        <img
          src={product.image_url}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://placehold.co/400x400/1a1a2e/e0e0e0?text=${encodeURIComponent(product.title)}`;
          }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
          <span className="text-white/0 group-hover:text-white/90 text-sm tracking-widest uppercase transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
            Подробнее
          </span>
        </div>
      </motion.div>

      <div className={`flex-1 ${isEven ? 'text-left' : 'text-right'}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-white/30 text-xs tracking-widest uppercase mb-2">{product.year} · {product.genre}</p>
          <h3 className="text-3xl md:text-4xl font-light text-white tracking-wide mb-3">{product.title}</h3>
          <p className="text-white/50 text-sm leading-relaxed max-w-md mb-4 line-clamp-3">
            {product.description}
          </p>
          <p className="text-white/70 text-lg font-light">¥{product.price.toLocaleString()}</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
