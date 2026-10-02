"use client";

interface PortalTransitionOverlayProps {
  isOpen: boolean;
  onEnterVoxelWorld: () => void;
}

export function PortalTransitionOverlay({
  isOpen,
  onEnterVoxelWorld,
}: PortalTransitionOverlayProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-quatro-navy/90 backdrop-blur-lg flex items-center justify-center p-6 animate-fade-in font-mono">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-block p-4 rounded-full bg-quatro-amber/10 border border-quatro-amber/40 shadow-2xl">
          <span className="text-4xl">✧</span>
        </div>

        <div>
          <span className="text-xs uppercase tracking-widest text-quatro-amber font-bold">
            BOUNDARY COLLAPSE
          </span>
          <h2 className="text-3xl font-serif font-bold text-quatro-cream mt-2">
            The Voxel Dimension
          </h2>
          <p className="text-xs text-quatro-cream/70 mt-2 leading-relaxed italic">
            "A dimension formed from accumulated code, memory, and digital fragments.
            Quatro compresses into the palm of your hand: Pocket Car."
          </p>
        </div>

        <div className="pt-4">
          <button
            onClick={onEnterVoxelWorld}
            className="w-full py-3.5 bg-quatro-amber hover:bg-quatro-warmOrange text-quatro-navy font-bold rounded-lg tracking-widest text-sm transition-all shadow-xl cursor-pointer"
          >
            STEP INTO VOXEL DIMENSION →
          </button>
        </div>
      </div>
    </div>
  );
}
