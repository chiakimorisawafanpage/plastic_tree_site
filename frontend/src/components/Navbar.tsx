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
        isHome ? 'bg-transparent' : 'bg-black/80 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <span className="text-2xl font-light tracking-widest text-white uppercase group-hover:text-gray-300 transition-colors">
            Plastic Tree
          </span>
        </Link>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              <Link
                to="/cart"
                className="text-white/70 hover:text-white transition-colors relative"
              >
                <ShoppingCart size={20} />
              </Link>
              <Link
                to="/profile"
                className="text-white/70 hover:text-white transition-colors"
              >
                <User size={20} />
              </Link>
            </>
          ) : (
            <Link
              to="/auth"
              className="text-white/70 hover:text-white transition-colors flex items-center gap-2"
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
