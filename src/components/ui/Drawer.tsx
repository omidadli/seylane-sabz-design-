import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type DrawerSide = 'right' | 'left';
export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  side?: DrawerSide;
  size?: DrawerSize;
  className?: string;
  showCloseButton?: boolean;
}

const sizeClasses: Record<DrawerSize, string> = {
  sm: 'max-w-xs',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-full',
};

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  side = 'right',
  size = 'md',
  className = '',
  showCloseButton = true,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const slideInitial = side === 'right' ? { x: '100%' } : { x: '-100%' };
  const slideExit = side === 'right' ? { x: '100%' } : { x: '-100%' };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
          />

          {/* Drawer Container */}
          <div
            className={`fixed inset-y-0 ${
              side === 'right' ? 'right-0' : 'left-0'
            } flex max-w-full`}
          >
            <motion.div
              initial={slideInitial}
              animate={{ x: 0 }}
              exit={slideExit}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className={`w-screen ${sizeClasses[size]} bg-surface-1 border-${
                side === 'right' ? 'l' : 'r'
              } border-border-default shadow-2xl flex flex-col h-full overflow-hidden ${className}`}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="px-5 py-4 border-b border-border-default flex items-center justify-between gap-3 shrink-0">
                  <div className="text-right">
                    {typeof title === 'string' ? (
                      <h3 className="text-base font-extrabold text-text-1 tracking-tight">
                        {title}
                      </h3>
                    ) : (
                      title
                    )}
                    {description && (
                      <p className="text-xs text-text-3 mt-0.5 font-medium">
                        {description}
                      </p>
                    )}
                  </div>

                  {showCloseButton && (
                    <button
                      type="button"
                      onClick={onClose}
                      className="p-1.5 rounded-[10px] text-text-3 hover:text-text-1 hover:bg-surface-2 transition-colors cursor-pointer"
                      aria-label="بستن پنل"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}

              {/* Body */}
              <div className="p-5 overflow-y-auto flex-1 touch-scroll text-right">
                {children}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
