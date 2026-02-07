export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 flex items-center justify-center">
      <div className="text-center">
        {/* Logo */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center animate-pulse">
          <span className="text-white font-black text-3xl">S</span>
        </div>
        
        {/* Loading text */}
        <div className="text-white text-xl font-semibold mb-4">
          Loading SmartBook...
        </div>
        
        {/* Loading spinner */}
        <div className="w-12 h-12 mx-auto border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    </div>
  );
}
