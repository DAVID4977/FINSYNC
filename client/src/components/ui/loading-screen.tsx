import { motion } from "framer-motion";
import { TrendingUp, BarChart3, Network } from "lucide-react";
import { useState, useEffect } from "react";

export default function LoadingScreen() {
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, size: number, delay: number}>>([]);

  // Generate floating particles for background effect
  useEffect(() => {
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 3,
      delay: Math.random() * 3
    }));
    setParticles(newParticles);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-950 to-cyan-900 overflow-hidden"
      data-testid="loading-screen"
    >
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <motion.div 
          className="absolute inset-0"
          animate={{ 
            backgroundPosition: ["0% 0%", "100% 100%"] 
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          style={{
            backgroundImage: `
              linear-gradient(90deg, transparent 98%, rgba(6, 182, 212, 0.4) 100%),
              linear-gradient(180deg, transparent 98%, rgba(6, 182, 212, 0.4) 100%)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-gradient-to-r from-cyan-400/60 to-blue-500/60 shadow-lg"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              filter: 'blur(1px)'
            }}
            animate={{ 
              opacity: [0.3, 0.8, 0.3],
              scale: [0.8, 1.2, 0.8],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 4,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="text-center relative z-10">
        {/* Enhanced Multi-Ring Spinner */}
        <motion.div className="relative mb-10">
          {/* Outer Ring */}
          <motion.div
            className="relative w-24 h-24 mx-auto mb-2"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute inset-0 w-24 h-24 border-4 border-cyan-500/20 rounded-full"></div>
            <div className="absolute inset-0 w-24 h-24 border-4 border-transparent border-t-cyan-400 border-l-cyan-400 rounded-full shadow-cyan-400/50 shadow-lg"></div>
          </motion.div>

          {/* Middle Ring */}
          <motion.div
            className="absolute top-2 left-1/2 transform -translate-x-1/2 w-16 h-16"
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute inset-0 w-16 h-16 border-3 border-blue-500/30 rounded-full"></div>
            <div className="absolute inset-0 w-16 h-16 border-3 border-transparent border-r-blue-400 border-b-blue-400 rounded-full shadow-blue-400/50 shadow-md"></div>
          </motion.div>

          {/* Inner Ring with Icon */}
          <motion.div
            className="absolute top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            <TrendingUp className="w-6 h-6 text-cyan-300" style={{ filter: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.8))' }} />
          </motion.div>
        </motion.div>
        
        <div>
          {/* Enhanced Logo with Icons */}
          <motion.div
            className="flex items-center justify-center space-x-4 mb-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
              className="p-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20"
            >
              <BarChart3 className="w-8 h-8 text-cyan-300" style={{ filter: 'drop-shadow(0 0 10px rgba(6, 182, 212, 0.8))' }} />
            </motion.div>
            
            <motion.h2 
              className="text-4xl font-bold text-white"
              style={{
                background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #ffffff 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                filter: 'drop-shadow(0 0 15px rgba(6, 182, 212, 0.6))'
              }}
              animate={{
                filter: [
                  'drop-shadow(0 0 15px rgba(6, 182, 212, 0.6))',
                  'drop-shadow(0 0 25px rgba(6, 182, 212, 0.9))',
                  'drop-shadow(0 0 15px rgba(6, 182, 212, 0.6))'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              data-testid="loading-title"
            >
              FINSYNC
            </motion.h2>

            <motion.div
              animate={{ 
                rotate: [360, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 6, repeat: Infinity, ease: "linear" },
                scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
              }}
              className="p-2 rounded-full bg-gradient-to-l from-cyan-500/20 to-blue-500/20"
            >
              <Network className="w-8 h-8 text-blue-300" style={{ filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.8))' }} />
            </motion.div>
          </motion.div>
          
          {/* Enhanced Progress Bar */}
          <motion.div
            className="w-60 h-2 bg-gray-800/50 rounded-full overflow-hidden mx-auto mb-6 shadow-inner"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 rounded-full shadow-cyan-400/50 shadow-lg"
              initial={{ width: "0%" }}
              animate={{ width: ["0%", "100%"] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                repeatType: "reverse"
              }}
              style={{
                filter: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.8))'
              }}
            />
          </motion.div>
          
          {/* Enhanced Loading Message */}
          <motion.p
            className="text-cyan-200 text-lg font-medium"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.4))'
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              scale: [1, 1.02, 1]
            }}
            transition={{ 
              opacity: { delay: 0.8, duration: 0.6 },
              y: { delay: 0.8, duration: 0.6 },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
            data-testid="loading-message"
          >
            Preparing your financial dashboard...
          </motion.p>

          {/* Loading Dots */}
          <motion.div 
            className="flex justify-center space-x-2 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-cyan-400 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
                style={{
                  filter: 'drop-shadow(0 0 4px rgba(6, 182, 212, 0.8))'
                }}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
