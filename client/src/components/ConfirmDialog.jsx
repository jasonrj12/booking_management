import React from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in">
            <div className="glass-effect p-6 rounded-xl max-w-md w-full mx-4 animate-slide-up">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-red-600/30 border-2 border-red-500 rounded-full flex items-center justify-center">
                            <FaExclamationTriangle className="text-red-400 text-xl" />
                        </div>
                        <h3 className="text-2xl font-bold text-shadow">
                            {title}
                        </h3>
                    </div>
                    <button
                        onClick={onCancel}
                        className="text-white/60 hover:text-white transition-colors"
                    >
                        <FaTimes className="text-xl" />
                    </button>
                </div>

                <div className="mb-6 text-white/80 text-lg pl-15">
                    {message}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="btn-secondary flex-1"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-6 py-3 bg-red-600/40 hover:bg-red-600/60 border-2 border-red-500 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
