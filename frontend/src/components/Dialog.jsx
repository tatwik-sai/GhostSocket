"use client"
import React, { useEffect } from 'react';

export function Dialog({ onClose, children }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="relative bg-white dark:bg-dark-3 p-4 rounded-xl shadow-xl z-10 w-[90%] max-w-md pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            className="absolute top-3 right-3 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 text-2xl"
            onClick={onClose}
          >
            &times;
          </button>

          {children}
        </div>
      </div>
    </div>
  );
}