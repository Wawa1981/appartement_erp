import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

const icons = {
  up: ChevronUp,
  down: ChevronDown,
  left: ChevronLeft,
  right: ChevronRight,
};

export default function DpadBtn({ dir, moveBtns }) {
  const Icon = icons[dir];
  const setVal = (val) => {
    moveBtns.current[dir] = val;
  };
  return (
    <button
      type="button"
      className="w-11 h-11 flex items-center justify-center rounded-lg bg-black/60 backdrop-blur-sm border border-white/25 text-white/80 active:bg-[#c9a84c] active:text-black transition-colors"
      onPointerDown={(e) => {
        e.preventDefault();
        setVal(true);
      }}
      onPointerUp={() => setVal(false)}
      onPointerLeave={() => setVal(false)}
      onPointerCancel={() => setVal(false)}
    >
      <Icon size={18} />
    </button>
  );
}
