import { Plus } from 'lucide-react';

export default function FAB({ onClick, icon }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-5 lg:bottom-10 lg:right-10 w-14 h-14 bg-primary text-white rounded-full shadow-xl flex items-center justify-center z-30 active:scale-95 transition-transform hover:scale-105"
    >
      {icon || <Plus size={24} />}
    </button>
  );
}
