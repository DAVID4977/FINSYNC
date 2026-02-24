import { useEffect, useRef } from "react";

interface InteractiveBackgroundProps {
  className?: string;
}

export function InteractiveBackground({ className = "" }: InteractiveBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationIdRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const mouse = { x: null as number | null, y: null as number | null, radius: 120 };

    // Track mouse/touch
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.touches[0].clientX - rect.left;
      mouse.y = e.touches[0].clientY - rect.top;
    };

    const handleTouchEnd = () => {
      mouse.x = null;
      mouse.y = null;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("touchmove", handleTouchMove);
    canvas.addEventListener("touchend", handleTouchEnd);

    // Node network
    const nodes: Array<{
      x: number;
      y: number;
      dx: number;
      dy: number;
      pulse: number;
    }> = [];

    for (let i = 0; i < 90; i++) {
      nodes.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        dx: (Math.random() - 0.5) * 0.7,
        dy: (Math.random() - 0.5) * 0.7,
        pulse: Math.random() * Math.PI * 2
      });
    }

    // Financial + Crypto symbols
    const symbols = ["₹", "$", "€", "¥", "₿", "Ξ", "₩", "₺"];
    const particles = Array.from({ length: 35 }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      speed: 0.5 + Math.random() * 1,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      size: 14 + Math.random() * 8
    }));

    const animate = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      // Background
      ctx.fillStyle = "rgba(0, 10, 25, 0.9)";
      ctx.fillRect(0, 0, width, height);

      // Faint glowing grid
      ctx.strokeStyle = "rgba(0,150,255,0.08)";
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 80) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 80) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Node network with interaction
      nodes.forEach(node => {
        node.x += node.dx;
        node.y += node.dy;
        node.pulse += 0.05;

        // Bounce from edges
        if (node.x < 0 || node.x > width) node.dx *= -1;
        if (node.y < 0 || node.y > height) node.dy *= -1;

        // Cursor repulsion
        if (mouse.x !== null && mouse.y !== null) {
          const dx = node.x - mouse.x;
          const dy = node.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius) {
            const angle = Math.atan2(dy, dx);
            const force = (mouse.radius - dist) / mouse.radius;
            node.x += Math.cos(angle) * force * 6;
            node.y += Math.sin(angle) * force * 6;
          }
        }

        // Pulse glow
        const radius = 2.5 + Math.sin(node.pulse) * 1.2;
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 12);
        gradient.addColorStop(0, "#00CFFF");
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius * 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = "#0077FF";
        ctx.fill();
      });

      // Connecting lines
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 150) {
            const opacity = 1 - distance / 150;
            ctx.strokeStyle = `rgba(0,180,255,${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Floating financial symbols
      particles.forEach(p => {
        ctx.font = `${p.size}px Arial`;
        ctx.fillStyle = "rgba(0, 200, 255, 0.8)";
        ctx.fillText(p.symbol, p.x, p.y);
        p.y -= p.speed;
        if (p.y < -20) {
          p.x = Math.random() * width;
          p.y = height + 20;
        }
      });

      // FinSync Title - positioned left of center
      ctx.font = "bold 72px Arial";
      ctx.fillStyle = "rgba(0,180,255,0.95)";
      ctx.textAlign = "center";
      ctx.fillText("FinSync", width * 0.35, height / 2 - 30);

      // Slogan - positioned left of center
      ctx.font = "22px Arial";
      ctx.fillStyle = "rgba(200,230,255,0.8)";
      ctx.fillText("Synchronizing Finance with Innovation", width * 0.35, height / 2 + 25);

      animationIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{
        background: "linear-gradient(135deg, #001530, #001f4d, #002a66)"
      }}
    />
  );
}