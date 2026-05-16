import { motion, useScroll, useTransform } from 'framer-motion';

const FLOATING_ITEMS = [
  { emoji: '🌸', size: 40, x: '10%', y: '20%', speed: 0.3 },
  { emoji: '🍃', size: 35, x: '85%', y: '15%', speed: 0.5 },
  { emoji: '💿', size: 50, x: '75%', y: '45%', speed: 0.2 },
  { emoji: '🎸', size: 45, x: '15%', y: '60%', speed: 0.4 },
  { emoji: '🌙', size: 38, x: '90%', y: '70%', speed: 0.35 },
  { emoji: '🎵', size: 30, x: '5%', y: '80%', speed: 0.45 },
  { emoji: '🌸', size: 28, x: '50%', y: '30%', speed: 0.25 },
  { emoji: '💿', size: 42, x: '30%', y: '85%', speed: 0.55 },
  { emoji: '🍃', size: 32, x: '65%', y: '55%', speed: 0.3 },
  { emoji: '🎵', size: 36, x: '40%', y: '10%', speed: 0.4 },
  { emoji: '🌙', size: 44, x: '20%', y: '40%', speed: 0.5 },
  { emoji: '🎸', size: 38, x: '55%', y: '75%', speed: 0.35 },
];

function FloatingItem({ emoji, size, x, y, speed }: {
  emoji: string; size: number; x: string; y: string; speed: number;
}) {
  const { scrollY } = useScroll();
  const yOffset = useTransform(scrollY, [0, 3000], [0, -300 * speed]);
  const xOffset = useTransform(scrollY, [0, 3000], [0, 50 * speed * (Math.random() > 0.5 ? 1 : -1)]);

  return (
    <motion.div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        fontSize: size,
        y: yOffset,
        x: xOffset,
        opacity: 0.15,
        pointerEvents: 'none',
        userSelect: 'none',
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 0.15, scale: 1 }}
      transition={{ duration: 1.5, delay: Math.random() * 0.8 }}
    >
      {emoji}
    </motion.div>
  );
}

export default function ParallaxBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {FLOATING_ITEMS.map((item, i) => (
        <FloatingItem key={i} {...item} />
      ))}
    </div>
  );
}
