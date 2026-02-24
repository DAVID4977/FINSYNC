import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { LogoText } from "@/components/ui/logo";
import { BarChart3, TrendingUp, Network } from "lucide-react";

interface IntroAnimationProps {
  onComplete: () => void;
}

export default function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const [currentScene, setCurrentScene] = useState(0);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, size: number, delay: number}>>([]);

  // Generate digital particles
  useEffect(() => {
    const newParticles = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 4,
      delay: Math.random() * 2
    }));
    setParticles(newParticles);
  }, []);

  // 5-second animation sequence controller (starting with icons)
  useEffect(() => {
    const timeline = [
      { scene: 0, duration: 1500 }, // 3 Icons Animation (BarChart3, TrendingUp, Network)
      { scene: 1, duration: 2000 }, // Logo Reveal
      { scene: 2, duration: 1500 }, // Final Tagline
    ];

    let currentTimeout: NodeJS.Timeout;
    
    const runScene = (sceneIndex: number) => {
      if (sceneIndex < timeline.length) {
        setCurrentScene(sceneIndex);
        currentTimeout = setTimeout(() => {
          runScene(sceneIndex + 1);
        }, timeline[sceneIndex].duration);
      } else {
        setTimeout(() => {
          onComplete();
        }, 500);
      }
    };

    runScene(0);

    return () => {
      if (currentTimeout) clearTimeout(currentTimeout);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 bg-gradient-to-br from-gray-900 via-blue-950 to-cyan-900 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      data-testid="intro-animation"
    >
      {/* Animated Network Grid Background */}
      <div className="absolute inset-0 opacity-30">
        <motion.div 
          className="absolute inset-0"
          animate={{ 
            backgroundPosition: ["0% 0%", "100% 100%"] 
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          style={{
            backgroundImage: `
              linear-gradient(90deg, transparent 98%, rgba(6, 182, 212, 0.3) 100%),
              linear-gradient(180deg, transparent 98%, rgba(6, 182, 212, 0.3) 100%)
            `,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Enhanced Floating Particles */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-gradient-to-r from-cyan-400/70 to-blue-500/70 shadow-cyan-400/50 shadow-lg"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 0.8, 0],
              scale: [0, 1, 0],
              x: [0, Math.random() * 200 - 100],
              y: [0, Math.random() * 200 - 100],
            }}
            transition={{
              duration: 6,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Scene 0: 3 Icons Animation (0-1.5s) */}
      <AnimatePresence>
        {currentScene === 0 && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex space-x-12">
              {[BarChart3, TrendingUp, Network].map((Icon, i) => (
                <motion.div
                  key={i}
                  className="w-16 h-16 flex items-center justify-center"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ 
                    scale: [0, 1.2, 1],
                    rotate: [-180, 0, 0],
                  }}
                  transition={{ 
                    duration: 1,
                    delay: i * 0.2,
                    ease: "easeOut"
                  }}
                >
                  <Icon 
                    className="w-full h-full text-cyan-300"
                    style={{
                      filter: "drop-shadow(0 0 12px rgba(6, 182, 212, 0.8))"
                    }}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scene 1: Logo Reveal (1.5-3.5s) */}
      <AnimatePresence>
        {currentScene === 1 && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Enhanced Convergence Effect */}
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.4 }}
              transition={{ duration: 1 }}
            >
              <div className="absolute inset-0 bg-gradient-radial from-cyan-500/30 via-blue-600/20 to-transparent" />
            </motion.div>

            {/* Enhanced FINSYNC Logo */}
            <motion.div
              className="relative text-center"
              initial={{ scale: 0.5, opacity: 0, rotateY: 180 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            >
              <motion.div
                style={{
                  background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #ffffff 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  fontSize: '4.5rem',
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                }}
                animate={{
                  filter: [
                    'drop-shadow(0 0 20px rgba(6, 182, 212, 0.8))',
                    'drop-shadow(0 0 40px rgba(6, 182, 212, 1))',
                    'drop-shadow(0 0 20px rgba(6, 182, 212, 0.8))'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                FINSYNC
              </motion.div>

              {/* Enhanced Cyan shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent -skew-x-12"
                style={{
                  filter: 'blur(1px)'
                }}
                initial={{ x: "-100%" }}
                animate={{ x: "200%" }}
                transition={{
                  duration: 2,
                  delay: 0.5,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scene 2: Final Tagline (3.5-5s) */}
      <AnimatePresence>
        {currentScene === 2 && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* FINSYNC (smaller) */}
            <motion.div
              className="text-4xl font-bold text-white mb-8"
              style={{
                background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #ffffff 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                letterSpacing: '0.05em',
                filter: 'drop-shadow(0 0 15px rgba(6, 182, 212, 0.6))'
              }}
              initial={{ y: -20, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              FINSYNC
            </motion.div>

            {/* Enhanced Tagline */}
            <motion.p
              className="text-xl text-cyan-200 font-medium tracking-wide"
              style={{
                filter: 'drop-shadow(0 0 10px rgba(6, 182, 212, 0.4))'
              }}
              initial={{ y: 20, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            >
              Empowering Finance. Enabling Growth.
            </motion.p>

            {/* Enhanced Underline Animation */}
            <motion.div
              className="h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mt-6 rounded-full"
              style={{
                boxShadow: '0 0 20px rgba(6, 182, 212, 0.6)'
              }}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "350px", opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}