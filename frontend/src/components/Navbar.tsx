import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { user } = useAuth();
  const location = useLocation();

  const isHome = location.pathname === '/';

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isHome ? 'bg-white/80 backdrop-blur-sm' : 'bg-white/90 backdrop-blur-md shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <span className="text-xl font-light tracking-widest text-neutral-800 uppercase group-hover:text-neutral-500 transition-colors">
            Plastic Tree
          </span>
        </Link>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              <Link
                to="/cart"
                className="text-neutral-500 hover:text-neutral-800 transition-colors relative"
              >
                <ShoppingCart size={20} />
              </Link>
              <Link
                to="/profile"
                className="text-neutral-500 hover:text-neutral-800 transition-colors"
              >
                <User size={20} />
              </Link>
            </>
          ) : (
            <Link
              to="/auth"
              className="text-neutral-500 hover:text-neutral-800 transition-colors flex items-center gap-2"
            >
              <LogIn size={18} />
              <span className="text-sm tracking-wider uppercase">Войти</span>
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
