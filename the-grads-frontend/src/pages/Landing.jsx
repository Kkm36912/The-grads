import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Flame, PauseCircle, Mic, MessageSquare, Trophy, Sparkles, Code2, Star, Zap, Radio } from 'lucide-react';
import { SiJavascript, SiPython, SiCplusplus } from 'react-icons/si';
import { FaJava } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';


// ================= 1. SCROLL ANIMATION WRAPPER =================
const SmoothScrollEntry = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: false, amount: 0.15 }}
    transition={{ duration: 0.9, ease: "easeOut", delay }}
    className={className}
  >
    {children}
  </motion.div>
);

// ================= 2. BACKGROUND FLUID NETWORK =================
const LiveNodeBackground = ({ isLightMode }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.8; 
        this.vy = (Math.random() - 0.5) * 0.8;
        this.color = Math.random() > 0.5 
          ? (isLightMode ? 'rgba(14, 165, 233, ' : 'rgba(79, 227, 240, ') 
          : (isLightMode ? 'rgba(168, 85, 247, ' : 'rgba(224, 82, 255, ');
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = this.color + '0.8)'; 
        ctx.fill();
      }
    }

    const nodeCount = window.innerWidth > 768 ? 80 : 40;
    for (let i = 0; i < nodeCount; i++) particles.push(new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 120) { 
            ctx.beginPath();
            const opacity = 1 - (distance / 120);
            ctx.strokeStyle = isLightMode ? `rgba(100, 116, 139, ${opacity * 0.25})` : `rgba(79, 227, 240, ${opacity * 0.3})`;
            ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isLightMode]);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-60 pointer-events-none" />;
};

// ================= 3. THE RESPONSIVE SEQUENTIAL ENGINE =================
const LogoPhysicsEngine = ({ isLightMode }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; 
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    const startTime = Date.now();

    const resize = () => {
      const container = canvas.parentElement;
      if (!container) return;
      canvas.width = container.clientWidth || window.innerWidth * 0.9;
      // Give a bit more default height on mobile for the stacked layout
      canvas.height = container.clientHeight || (window.innerWidth < 768 ? 350 : 350);
    };
    resize();
    window.addEventListener('resize', resize);

    const colorCyan = isLightMode ? '#0284c7' : '#00FFFF';
    const colorMagenta = isLightMode ? '#c026d3' : '#FF00FF';

    // --- RESPONSIVE TEXT SAMPLING ---
    const getTextCoordinates = () => {
      const offCanvas = document.createElement('canvas');
      offCanvas.width = canvas.width || 800;
      offCanvas.height = canvas.height || 350;
      const offCtx = offCanvas.getContext('2d');

      const isMobile = window.innerWidth < 768;
      
      offCtx.fillStyle = 'white';
      const fontSize = isMobile ? 65 : 105; 
      offCtx.font = `900 ${fontSize}px "Arial Black", Impact, sans-serif`;
      offCtx.letterSpacing = isMobile ? "4px" : "6px";
      offCtx.textBaseline = 'middle';
      
      let thresholdX, thresholdY;

      if (isMobile) {
        // MOBILE: Vertical Stack Layout
        const verticalOffset = fontSize * 0.45;
        const centerY = offCanvas.height / 2;
        
        offCtx.textAlign = 'center';
        offCtx.fillText('THE', offCanvas.width / 2, centerY - verticalOffset);
        offCtx.fillText('GRADS', offCanvas.width / 2, centerY + verticalOffset);
        
        // Color split threshold is horizontal line between words
        thresholdY = centerY; 
      } else {
        // DESKTOP: Horizontal Side-by-Side Layout
        const theWidth = offCtx.measureText('THE').width;
        const gradsWidth = offCtx.measureText('GRADS').width;
        const spaceWidth = 45; 
        const totalWidth = theWidth + spaceWidth + gradsWidth;
        
        const startX = (offCanvas.width - totalWidth) / 2;
        const centerY = offCanvas.height / 2;
        
        offCtx.textAlign = 'left';
        offCtx.fillText('THE', startX, centerY);
        offCtx.fillText('GRADS', startX + theWidth + spaceWidth, centerY);
        
        // Color split threshold is vertical line between words
        thresholdX = startX + theWidth + spaceWidth / 2;
      }

      const textData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height).data;
      const coordinates = [];
      const step = isMobile ? 4 : 6; 

      for (let y = 0; y < offCanvas.height; y += step) {
        for (let x = 0; x < offCanvas.width; x += step) {
          if (textData[(y * offCanvas.width + x) * 4 + 3] > 128) {
            
            // Determine word identity dynamically based on layout
            const isTheWord = isMobile ? (y < thresholdY) : (x < thresholdX);
            
            coordinates.push({ 
              x: x + (Math.random() - 0.5) * (step * 0.6), 
              y: y + (Math.random() - 0.5) * (step * 0.6),
              isTheWord: isTheWord,
              // Calculate relative X position for the left-to-right assembly timing
              rawX: x 
            });
          }
        }
      }
      return coordinates;
    };

    let targetCoords = getTextCoordinates();
    
    let initialCanvasWidth = canvas.width;
    let initialCanvasHeight = canvas.height;

    // --- TIMING MATH ---
    let topMinX = Infinity, topMaxX = -Infinity;
    let botMinX = Infinity, botMaxX = -Infinity;

    targetCoords.forEach(c => {
      if (c.isTheWord) {
        if (c.rawX < topMinX) topMinX = c.rawX;
        if (c.rawX > topMaxX) topMaxX = c.rawX;
      } else {
        if (c.rawX < botMinX) botMinX = c.rawX;
        if (c.rawX > botMaxX) botMaxX = c.rawX;
      }
    });

    const topWidth = Math.max(topMaxX - topMinX, 1);
    const botWidth = Math.max(botMaxX - botMinX, 1);

    targetCoords = targetCoords.map(c => {
      let progress, delay;
      if (c.isTheWord) {
        progress = (c.rawX - topMinX) / topWidth;
        delay = 6 + progress * 3; // "THE" forms 6s to 9s
      } else {
        progress = (c.rawX - botMinX) / botWidth;
        delay = 9 + progress * 5; // "GRADS" forms 9s to 14s
      }
      return { ...c, activationDelay: delay, color: c.isTheWord ? colorMagenta : colorCyan };
    });

    targetCoords.sort(() => 0.5 - Math.random());

    // --- NODE INITIALIZATION ---
    const architects = Array.from({ length: 10 }).map((_, i) => ({
      isArchitect: true,
      x: Math.random() > 0.5 ? -100 : canvas.width + 100,
      y: Math.random() > 0.5 ? -100 : canvas.height + 100,
      color: i % 2 === 0 ? colorCyan : colorMagenta,
      size: Math.random() * 2 + 3,
      wanderAngle: Math.random() * Math.PI * 2,
      wanderSpeed: 0.01 + Math.random() * 0.015,
      wanderRadius: 100 + Math.random() * 200,
      vx: 0, vy: 0, opacity: 0, isActive: true
    }));

    const meshNodes = targetCoords.map((target, index) => ({
      isArchitect: false,
      baseX: target.x,
      baseY: target.y,
      x: target.x, 
      y: target.y - 25, 
      color: target.color,
      size: window.innerWidth > 768 ? 1.5 : 1.0, 
      activationDelay: target.activationDelay,
      vx: 0, vy: 0, opacity: 0, isActive: false,
      id: index
    }));

    const nodes = [...architects, ...meshNodes];

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const elapsedSeconds = (Date.now() - startTime) / 1000;

      const resizeOffsetX = (canvas.width - initialCanvasWidth) / 2;
      const resizeOffsetY = (canvas.height - initialCanvasHeight) / 2;

      ctx.globalCompositeOperation = isLightMode ? 'source-over' : 'lighter';

      nodes.forEach((n) => {
        if (!n.isArchitect && elapsedSeconds >= n.activationDelay) {
           n.isActive = true;
        }

        if (!n.isActive) return; 

        if (n.isArchitect) {
           n.opacity = elapsedSeconds < 6 
             ? Math.min(elapsedSeconds * 1.5, 1) 
             : Math.max(1 - (elapsedSeconds - 6) / 3, 0.1); 
           
           n.wanderAngle += n.wanderSpeed;
           const targetX = (canvas.width / 2) + Math.cos(n.wanderAngle) * n.wanderRadius;
           const targetY = (canvas.height / 2) + Math.sin(n.wanderAngle * 0.8) * n.wanderRadius; 

           n.vx += (targetX - n.x) * 0.01;
           n.vy += (targetY - n.y) * 0.01;
           n.vx *= 0.95; n.vy *= 0.95;
           n.x += n.vx; n.y += n.vy;

           ctx.beginPath();
           ctx.globalAlpha = Math.max(0, Math.min(1, n.opacity));
           ctx.shadowBlur = isLightMode ? 5 : 20; 
           ctx.shadowColor = n.color;
           ctx.fillStyle = n.color;
           ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
           ctx.fill();
           ctx.shadowBlur = 0;

        } else {
           n.opacity = Math.min(n.opacity + 0.05, 1); 
           
           const currentTargetX = n.baseX + resizeOffsetX;
           const currentTargetY = n.baseY + resizeOffsetY;

           n.vx += (currentTargetX - n.x) * 0.15;
           n.vy += (currentTargetY - n.y) * 0.15;
           n.vx *= 0.70; n.vy *= 0.70;
           
           const breatheX = Math.cos(elapsedSeconds * 2 + n.id * 0.1) * 0.3;
           const breatheY = Math.sin(elapsedSeconds * 2 + n.id * 0.1) * 0.3;

           n.x += n.vx + breatheX;
           n.y += n.vy + breatheY;

           ctx.beginPath();
           ctx.globalAlpha = Math.max(0, Math.min(1, n.opacity * 0.9));
           ctx.fillStyle = n.color;
           ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
           ctx.fill();
        }
      });

      ctx.lineWidth = window.innerWidth > 768 ? 1.5 : 1.0;
      ctx.lineJoin = 'round'; 

      const activeMesh = nodes.filter(n => n.isActive && !n.isArchitect);
      
      for (let i = 0; i < activeMesh.length; i++) {
        const limit = Math.min(i + 35, activeMesh.length); 
        for (let j = i + 1; j < limit; j++) {
          const p1 = activeMesh[i];
          const p2 = activeMesh[j];
          
          if (p1.color !== p2.color) continue; 

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distSq = dx * dx + dy * dy;

          const maxDist = window.innerWidth > 768 ? 16 : 10;
          const connectRadiusSq = maxDist * maxDist;

          if (distSq < connectRadiusSq) {
            ctx.beginPath();
            ctx.strokeStyle = p1.color; 
            
            const rawAlpha = p1.opacity * p2.opacity * (1 - Math.sqrt(distSq) / maxDist);
            ctx.globalAlpha = Math.max(0, Math.min(1, rawAlpha));
            
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = 'source-over';
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [isLightMode]);

  // Notice the mobile height is now h-[280px] to easily fit the stacked text
  return (
    <div className="w-full h-[280px] md:h-[220px] mb-4 md:mb-8 z-10 relative flex justify-center items-center pointer-events-none">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};

// ================= 4. CYBER NETWORK X-RAY CARD =================
const CyberNetworkCard = ({ children, className, isLightMode, accent = "cyan" }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const getPattern = () => {
    const strokeColor = accent === "magenta" ? (isLightMode ? '%23a855f7' : '%23E052FF') : (isLightMode ? '%230ea5e9' : '%234FE3F0');
    const strokeOpacity = isLightMode ? '0.15' : '0.25'; 
    return `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L0 0L0 30' fill='none' stroke='${strokeColor}' stroke-opacity='${strokeOpacity}' stroke-width='1.5' /%3E%3C/svg%3E")`;
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`relative overflow-hidden transition-all duration-500 border rounded-lg md:hover:-translate-y-1 md:hover:shadow-2xl ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 z-0 hidden md:block"
        style={{
          opacity: isHovering ? 1 : 0,
          backgroundImage: getPattern(),
          WebkitMaskImage: `radial-gradient(200px circle at ${mousePosition.x}px ${mousePosition.y}px, black 15%, transparent 100%)`,
          maskImage: `radial-gradient(200px circle at ${mousePosition.x}px ${mousePosition.y}px, black 15%, transparent 100%)`,
        }}
      />
      <div className="pointer-events-none absolute inset-0 z-0 block md:hidden opacity-[0.15]" style={{ backgroundImage: getPattern() }} />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
};
// ===================================================================

function Landing() {
  const [isLightMode, setIsLightMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springConfig = { damping: 28, stiffness: 500, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);
  
  const [isHovering, setIsHovering] = useState(false);
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    if (isMobile) return;
    const moveCursor = (e) => {
      cursorX.set(e.clientX - 8); 
      cursorY.set(e.clientY - 8);
      const target = e.target;
      const isClickable = target.closest('button') || target.closest('a');
      setIsHovering(prev => {
        const next = !!isClickable;
        return prev === next ? prev : next;
      });
    };
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, [cursorX, cursorY, isMobile]);

  useEffect(() => {
    const bootTimer = setTimeout(() => setIsBooting(false), 1500);
    return () => clearTimeout(bootTimer);
  }, []);

  const sentenceVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.3, delayChildren: 1.2 } } };
  const wordVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } };

  const glassPanelDark = "bg-[#040a0f]/50 backdrop-blur-md border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_8px_32px_rgba(0,0,0,0.4)]";
  const glassPanelLight = "bg-white/40 backdrop-blur-md border-slate-200/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_8px_32px_rgba(0,0,0,0.05)]";

  const achievers = [
    { name: "ALEX CHEN", exp: "12,450 EXP", img: "https://i.pravatar.cc/150?u=1" },
    { name: "SARAH JENKINS", exp: "11,200 EXP", img: "https://i.pravatar.cc/150?u=2" },
    { name: "MICHAEL T.", exp: "10,840 EXP", img: "https://i.pravatar.cc/150?u=3" },
    { name: "ELENA R.", exp: "9,950 EXP", img: "https://i.pravatar.cc/150?u=4" },
    { name: "DAVID KIM", exp: "9,120 EXP", img: "https://i.pravatar.cc/150?u=5" },
    { name: "CHLOE W.", exp: "8,700 EXP", img: "https://i.pravatar.cc/150?u=6" },
  ];

 return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-4 h-4 rounded-full pointer-events-none hidden md:block"
        style={{ x: cursorXSpring, y: cursorYSpring, zIndex: 999999 }}
        animate={{
          scale: isHovering ? 2.5 : 1,
          backgroundColor: ['#0ea5e9', '#a855f7', '#0ea5e9'],
          boxShadow: ['0 0 15px 2px #0ea5e9', '0 0 15px 2px #a855f7', '0 0 15px 2px #0ea5e9']
        }}
        transition={{ scale: { duration: 0.2 }, backgroundColor: { duration: 3, repeat: Infinity, ease: "linear" }, boxShadow: { duration: 3, repeat: Infinity, ease: "linear" } }}
      />

      <AnimatePresence>
        {isBooting && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className={`fixed inset-0 z- flex items-center justify-center backdrop-blur-xl ${isLightMode ? 'bg-slate-50/90' : 'bg-[#03070b]/90'}`}
          >
            <motion.div animate={{ scale: [0.9, 1.1, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} className="flex flex-col items-center gap-4">
               <Code2 size={48} className={isLightMode ? 'text-grads-tealDeep' : 'text-grads-cyan'} />
               <p className={`font-mono text-sm tracking-[0.3em] uppercase ${isLightMode ? 'text-slate-600' : 'text-grads-textSoft'}`}>Initializing</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* md:cursor-none hides the default arrow ONLY on this specific App.jsx page */}
      <div className={`min-h-screen relative overflow-x-hidden font-sans flex flex-col transition-colors duration-1000 ${isLightMode ? 'bg-slate-100 text-slate-900' : 'bg-[#03070b] text-grads-text'} md:cursor-none`}>
        
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className={`absolute inset-0 transition-colors duration-1000 ${isLightMode ? 'bg-slate-100' : 'bg-[#03070b]'}`}></div>
          <div 
            className={`absolute inset-0 transition-opacity duration-1000 ${isLightMode ? 'opacity-100' : 'opacity-0'}`} 
            style={{ backgroundImage: 'radial-gradient(circle at 0 0, rgba(14,165,233,0.25) 1.5px, transparent 1.5px), radial-gradient(circle at 12px 12px, rgba(168,85,247,0.25) 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}
          ></div>
          <LiveNodeBackground isLightMode={isLightMode} />
          <motion.div animate={{ x: ["-10%", "10%", "-10%"], y: ["-5%", "5%", "-5%"] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} className={`absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[160px] ${isLightMode ? 'bg-grads-teal/10 opacity-40' : 'bg-grads-teal opacity-20'}`}></motion.div>
          <motion.div animate={{ x: ["10%", "-10%", "10%"], y: ["5%", "-5%", "5%"] }} transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }} className={`absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[180px] ${isLightMode ? 'bg-grads-magenta/10 opacity-30' : 'bg-grads-magenta opacity-10'}`}></motion.div>
        </div>

        <div className="min-h-screen flex flex-col relative z-20">
          <nav className={`w-full px-6 md:px-10 py-6 flex justify-between items-center transition-colors duration-1000 ${isLightMode ? 'border-b border-slate-200/50 backdrop-blur-md' : 'border-b border-transparent'}`}>
            <div className="w-10"></div> 
            <div className="flex items-center gap-6 md:gap-10">
              <div className={`hidden md:flex gap-8 text-base font-semibold tracking-wide transition-colors duration-1000 ${isLightMode ? 'text-slate-700' : 'text-grads-textSoft'}`}>
                <a href="#vision" className={`hover:${isLightMode ? 'text-grads-tealDeep' : 'text-grads-cyan'} transition-colors`}>Vision</a>
                <a href="#ecosystem" className={`hover:${isLightMode ? 'text-grads-tealDeep' : 'text-grads-cyan'} transition-colors`}>Ecosystem</a>
                <a href="#arsenal" className={`hover:${isLightMode ? 'text-grads-tealDeep' : 'text-grads-cyan'} transition-colors`}>Arsenal</a>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => setIsLightMode(!isLightMode)} className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${isLightMode ? 'text-slate-700 hover:text-grads-teal bg-white/50 backdrop-blur-md border border-slate-200' : 'text-grads-textSoft hover:text-grads-teal bg-grads-panel/50'}`}>
                  {isLightMode ? <Moon size={18} /> : <Sun size={18} />}
                </button>
                <button 
                  onClick={() => navigate('/auth')} 
                  className="px-6 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-grads-teal to-grads-cyan text-white shadow-sm hover:shadow-md transition-all transform hover:-translate-y-0.5"
                >
                  Login
                </button>
              </div>
            </div>
          </nav>

          <main className="flex-grow flex flex-col items-center justify-center px-6 pb-20 text-center relative w-full">
            
            <LogoPhysicsEngine isLightMode={isLightMode} />

            <motion.h2 variants={sentenceVariants} initial="hidden" animate="show" className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-10 z-20">
              <motion.span variants={wordVariants} className={`inline-block mr-3 transition-colors duration-1000 ${isLightMode ? 'text-slate-800' : 'text-transparent bg-clip-text bg-gradient-to-r from-grads-text to-grads-textSoft'}`}>Learn,</motion.span>
              <motion.span variants={wordVariants} className={`inline-block mr-3 transition-colors duration-1000 ${isLightMode ? 'text-slate-800' : 'text-transparent bg-clip-text bg-gradient-to-r from-grads-text to-grads-textSoft'}`}>Code,</motion.span>
              <motion.span variants={wordVariants} className={`inline-block transition-colors duration-1000 ${isLightMode ? 'text-grads-tealDeep' : 'text-grads-cyan'}`}>Get Hired.</motion.span>
            </motion.h2>

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 2.2, ease: "easeOut" }} className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto z-20">
              <button className={`relative group overflow-hidden w-full sm:w-auto px-10 py-3.5 rounded-xl border font-bold text-lg tracking-wide transition-all duration-300 md:hover:-translate-y-1 md:hover:scale-105 ${isLightMode ? 'bg-white/60 backdrop-blur-md border-slate-300 text-slate-800 md:hover:border-grads-teal' : 'bg-[#0a1219] border-grads-teal/30 text-grads-text md:hover:border-grads-cyan/80'}`}>
                <div className={`absolute inset-0 w-full h-full opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 ease-out ${isLightMode ? 'bg-white/80' : 'bg-gradient-to-r from-grads-teal/20 to-grads-cyan/20'}`}></div>
                <span className="relative z-10 transition-colors">Start Coding</span>
              </button>
              <button onClick={() => document.getElementById('vision').scrollIntoView({ behavior: 'smooth' })} className={`relative group overflow-hidden w-full sm:w-auto px-10 py-3.5 rounded-xl border transition-all duration-300 md:hover:-translate-y-1 md:hover:scale-105 font-semibold text-lg flex items-center justify-center gap-2 ${isLightMode ? 'bg-white/30 backdrop-blur-md border-slate-300 text-slate-800 md:hover:border-grads-magenta' : 'bg-gradient-to-r from-[#0a1219] to-[#120c17] border-grads-magenta/30 text-grads-text md:hover:border-grads-magenta/80'}`}>
                <div className={`absolute inset-0 w-full h-full opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 ease-out ${isLightMode ? 'bg-white/80' : 'bg-gradient-to-r from-grads-magenta/10 to-purple-900/20'}`}></div>
                <span className={`w-2 h-2 rounded-full bg-grads-magenta animate-pulse relative z-10 ${isLightMode ? '' : 'shadow-[0_0_8px_rgba(224,82,255,0.6)]'}`}></span>
                <span className="relative z-10 transition-colors">Explore Platform</span>
              </button>
            </motion.div>
          </main>
        </div>

        <section id="vision" className="relative z-20 w-full py-20 md:py-32">
          <SmoothScrollEntry>
            <div className={`w-full border-y transition-all duration-1000 ${isLightMode ? 'bg-white/40 backdrop-blur-2xl border-slate-200/50 shadow-[0_8px_32px_rgba(0,0,0,0.05)]' : 'bg-[#0a1219]/60 backdrop-blur-2xl border-grads-teal/20 shadow-[0_0_50px_rgba(20,184,196,0.02)]'}`}>
              <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className={`text-4xl md:text-6xl font-display font-extrabold tracking-tight leading-[1.1] ${isLightMode ? 'text-slate-800' : 'text-transparent bg-clip-text bg-gradient-to-br from-white to-grads-textSoft'}`}>
                    The Grads is a Student's <motion.span 
                    animate={{ backgroundPosition: ["0% center", "200% center"] }} 
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }} 
                    className="bg-[length:200%_auto] text-transparent bg-clip-text bg-gradient-to-r from-grads-teal via-grads-magenta to-grads-teal"
                  >
                    Habit and Learning
                  </motion.span> Building System.
                  </h3>
                </div>
                <div className="flex flex-col gap-8">
                  <div className="flex gap-4 items-start group">
                    <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-all ${isLightMode ? 'bg-white/80 border-slate-200 text-grads-teal shadow-sm group-hover:shadow-[0_0_20px_rgba(14,165,233,0.4)] group-hover:border-grads-teal' : 'bg-[#0a1219] border-grads-teal/30 text-grads-cyan group-hover:shadow-glow-teal group-hover:border-grads-cyan'}`}>
                      <Sparkles size={16} />
                    </div>
                    <p className={`text-xl md:text-2xl font-light leading-relaxed ${isLightMode ? 'text-slate-700' : 'text-grads-textSoft'}`}>
                      <strong className={isLightMode ? 'text-slate-900' : 'text-white'}>Structured Learning.</strong> The Platform is designed to help students grow step-by-step through a meticulously structured skill-building system.
                    </p>
                  </div>
                  <div className="flex gap-4 items-start group">
                    <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-all ${isLightMode ? 'bg-white/80 border-slate-200 text-grads-magenta shadow-sm group-hover:shadow-[0_0_20px_rgba(224,82,255,0.4)] group-hover:border-grads-magenta' : 'bg-[#0a1219] border-grads-magenta/30 text-grads-magenta group-hover:shadow-glow-purple group-hover:border-grads-magenta'}`}>
                      <Trophy size={16} />
                    </div>
                    <p className={`text-xl md:text-2xl font-light leading-relaxed ${isLightMode ? 'text-slate-700' : 'text-grads-textSoft'}`}>
                      <strong className={isLightMode ? 'text-slate-900' : 'text-white'}>Gamified Growth Model.</strong> The Platform focuses on coding, consistency, and collaboration to forge industry-ready developers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </SmoothScrollEntry>
        </section>

        <section id="ecosystem" className="relative z-20 w-full max-w-7xl mx-auto px-6 py-10 md:py-32">
          <SmoothScrollEntry>
            <div className="text-center mb-10 md:mb-20 relative z-10">
              <h3 className="font-display text-3xl md:text-5xl font-bold mb-4 tracking-tight">
                The <span className={`text-transparent bg-clip-text ${isLightMode ? 'bg-gradient-to-r from-teal-700 to-cyan-700 font-black drop-shadow-sm' : 'bg-gradient-to-r from-grads-teal to-grads-cyan'}`}>Coding Ground.</span>
              </h3>
              <p className={`max-w-2xl mx-auto text-lg ${isLightMode ? 'text-slate-600' : 'text-grads-textSoft'}`}>
                A zero-distraction execution arena powering multiple architectures seamlessly.
              </p>
            </div>
          </SmoothScrollEntry>

          <div className="relative w-full max-w-5xl mx-auto h-[400px] md:h-[600px] flex items-center justify-center mt-10">
            <SmoothScrollEntry delay={0.2} className="relative z-10 flex flex-col items-center justify-center">
              <div className={`w-32 h-32 md:w-56 md:h-56 rounded-[2rem] flex items-center justify-center border-2 transition-all duration-1000 ${isLightMode ? 'bg-white/50 backdrop-blur-xl border-slate-200 shadow-xl text-grads-tealDeep' : 'bg-[#0a1219]/80 backdrop-blur-md border-grads-teal/50 shadow-[0_0_80px_rgba(20,184,196,0.3)] text-grads-cyan'}`}>
                <Code2 className="w-16 h-16 md:w-24 md:h-24" strokeWidth={1.5} />
              </div>
              <div className={`mt-6 md:mt-8 px-6 py-2 md:px-8 md:py-3 rounded-full border text-xs md:text-base font-mono tracking-widest uppercase transition-all duration-1000 ${isLightMode ? 'bg-white/60 border-slate-300 text-slate-700' : 'bg-grads-panel border-grads-teal/20 text-grads-teal'}`}>
                System Active
              </div>
            </SmoothScrollEntry>

            <SmoothScrollEntry delay={0.3} className="absolute top-[5%] left-[0%] md:top-[10%] md:left-[10%] z-20">
              <motion.div animate={{ y: [-10, 10, -10] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className={`w-16 h-16 md:w-32 md:h-32 rounded-lg flex items-center justify-center border transition-all duration-1000 shadow-[0_0_20px_rgba(247,223,30,0.15)] ${isLightMode ? 'bg-white/70 backdrop-blur-xl border-white shadow-[0_0_25px_rgba(247,223,30,0.4)]' : 'bg-[#1a1423]/70 backdrop-blur-xl border-[#F7DF1E]/30'}`}>
                <SiJavascript className="w-8 h-8 md:w-16 md:h-16 text-[#F7DF1E]" />
              </motion.div>
            </SmoothScrollEntry>

            <SmoothScrollEntry delay={0.4} className="absolute bottom-[5%] right-[0%] md:bottom-[10%] md:right-[10%] z-20">
              <motion.div animate={{ y: [10, -10, 10] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }} className={`w-16 h-16 md:w-32 md:h-32 rounded-lg flex items-center justify-center border transition-all duration-1000 shadow-[0_0_20px_rgba(55,118,171,0.15)] ${isLightMode ? 'bg-white/70 backdrop-blur-xl border-white shadow-[0_0_25px_rgba(55,118,171,0.4)]' : 'bg-[#1a1423]/70 backdrop-blur-xl border-[#3776AB]/30'}`}>
                <SiPython className="w-8 h-8 md:w-16 md:h-16 text-[#3776AB]" />
              </motion.div>
            </SmoothScrollEntry>

            <SmoothScrollEntry delay={0.5} className="absolute top-[10%] right-[-5%] md:top-[15%] md:right-[5%] z-0">
              <motion.div animate={{ y: [-10, 10, -10] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className={`w-12 h-12 md:w-28 md:h-28 rounded-lg flex items-center justify-center border transition-all duration-1000 shadow-[0_0_20px_rgba(0,89,156,0.15)] ${isLightMode ? 'bg-white/70 backdrop-blur-xl border-white shadow-[0_0_25px_rgba(0,89,156,0.4)]' : 'bg-[#1a1423]/70 backdrop-blur-xl border-[#00599C]/30'}`}>
                <SiCplusplus className="w-6 h-6 md:w-14 md:h-14 text-[#00599C]" />
              </motion.div>
            </SmoothScrollEntry>

            <SmoothScrollEntry delay={0.6} className="absolute bottom-[10%] left-[-5%] md:bottom-[15%] md:left-[5%] z-0">
              <motion.div animate={{ y: [10, -10, 10] }} transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }} className={`w-12 h-12 md:w-28 md:h-28 rounded-lg flex items-center justify-center border transition-all duration-1000 shadow-[0_0_20px_rgba(231,111,0,0.15)] ${isLightMode ? 'bg-white/70 backdrop-blur-xl border-white shadow-[0_0_25px_rgba(231,111,0,0.4)]' : 'bg-[#1a1423]/70 backdrop-blur-xl border-[#E76F00]/30'}`}>
                 <FaJava className="w-6 h-6 md:w-14 md:h-14 text-[#E76F00]" />
              </motion.div>
            </SmoothScrollEntry>
          </div>
        </section>

        <section id="arsenal" className="relative z-20 w-full max-w-7xl mx-auto px-6 py-10 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            <SmoothScrollEntry delay={0.1} className="md:col-span-8">
              <CyberNetworkCard isLightMode={isLightMode} accent="cyan" className={`h-full p-8 md:p-10 ${isLightMode ? glassPanelLight : glassPanelDark}`}>
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center ${isLightMode ? 'bg-white/80 shadow-sm text-grads-teal border border-slate-200' : 'bg-[#0a1219]/50 border border-grads-teal/30 text-grads-cyan'}`}>
                    <Trophy size={24} className="md:w-7 md:h-7" />
                  </div>
                  <div className={`px-4 py-2 rounded-full border text-[10px] md:text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${isLightMode ? 'bg-white/80 border-slate-200 text-grads-teal' : 'bg-[#0a1219]/50 border-grads-teal/30 text-grads-teal'}`}>
                    <span className="w-2 h-2 rounded-full bg-grads-cyan animate-pulse"></span>
                    Rank #1
                  </div>
                </div>
                <h4 className="font-display text-2xl md:text-3xl font-bold mb-4">The Leaderboard</h4>
                <p className={`text-sm md:text-base md:w-2/3 ${isLightMode ? 'text-slate-700' : 'text-grads-textSoft'}`}>
                  Compete to graduate. Protect your ranking and prove your logic against the compiler to secure top positions.
                </p>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className={`absolute -right-20 -bottom-20 z-0 pointer-events-none ${isLightMode ? 'text-grads-teal/10' : 'text-grads-cyan/5'}`}>
                   <Star size={250} className="md:w-[350px] md:h-[350px]" strokeWidth={0.5} />
                </motion.div>
              </CyberNetworkCard>
            </SmoothScrollEntry>

            <SmoothScrollEntry delay={0.3} className="md:col-span-4">
              <CyberNetworkCard isLightMode={isLightMode} accent="magenta" className={`h-full p-8 md:p-10 ${isLightMode ? glassPanelLight : glassPanelDark}`}>
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center mb-6 ${isLightMode ? 'bg-white/80 shadow-sm text-fuchsia-600 border border-slate-200' : 'bg-[#0a1219]/50 border border-grads-magenta/40 text-grads-magenta'}`}>
                  <Mic size={24} className="md:w-7 md:h-7" />
                </div>
                <h4 className="font-display text-xl md:text-2xl font-bold mb-4">Audio Rooms</h4>
                <p className={`text-sm ${isLightMode ? 'text-slate-700' : 'text-grads-textSoft'}`}>
                  Drop into live voice channels. Discuss logic and debug in real-time.
                </p>
                <motion.div animate={{ rotate: -360 }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }} className={`absolute -right-16 -top-16 z-0 pointer-events-none ${isLightMode ? 'text-fuchsia-500/10' : 'text-grads-magenta/5'}`}>
                   <Radio size={200} className="md:w-[300px] md:h-[300px]" strokeWidth={0.5} />
                </motion.div>
              </CyberNetworkCard>
            </SmoothScrollEntry>

            <SmoothScrollEntry delay={0.2} className="md:col-span-4">
              <CyberNetworkCard isLightMode={isLightMode} accent="cyan" className={`h-full p-8 md:p-10 ${isLightMode ? glassPanelLight : glassPanelDark}`}>
                <div className="flex gap-4 mb-6">
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center ${isLightMode ? 'bg-white/80 shadow-sm text-orange-500 border border-slate-200' : 'bg-[#2A1508] border border-orange-500/50 text-orange-400 shadow-[0_0_25px_rgba(249,115,22,0.6)]'}`}>
                    <Flame size={24} className="md:w-7 md:h-7 animate-pulse" />
                  </div>
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center ${isLightMode ? 'bg-white/80 shadow-sm text-blue-500 border border-slate-200' : 'bg-[#0a1219]/50 border border-blue-500/30 text-blue-400'}`}>
                    <PauseCircle size={24} className="md:w-7 md:h-7" />
                  </div>
                </div>
                <h4 className="font-display text-xl md:text-2xl font-bold mb-4">Streak & Pause</h4>
                <p className={`text-sm ${isLightMode ? 'text-slate-700' : 'text-grads-textSoft'}`}>
                  Build momentum. Feeling burnt out? Freeze your streak to protect mental health.
                </p>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 55, repeat: Infinity, ease: "linear" }} className={`absolute -right-10 -bottom-10 z-0 pointer-events-none ${isLightMode ? 'text-orange-500/10' : 'text-orange-500/5'}`}>
                   <Zap size={200} className="md:w-[280px] md:h-[280px]" strokeWidth={0.5} />
                </motion.div>
              </CyberNetworkCard>
            </SmoothScrollEntry>

            <SmoothScrollEntry delay={0.4} className="md:col-span-8">
              <CyberNetworkCard isLightMode={isLightMode} accent="magenta" className={`h-full p-8 md:p-10 ${isLightMode ? glassPanelLight : glassPanelDark}`}>
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center mb-6 ${isLightMode ? 'bg-white/80 shadow-sm text-fuchsia-600 border border-slate-200' : 'bg-[#0a1219]/50 border border-grads-magenta/40 text-grads-magenta'}`}>
                  <MessageSquare size={24} className="md:w-7 md:h-7" />
                </div>
                <h4 className="font-display text-2xl md:text-3xl font-bold mb-4">Query Forums</h4>
                <p className={`text-sm md:text-base md:w-2/3 ${isLightMode ? 'text-slate-700' : 'text-grads-textSoft'}`}>
                  Stuck on an edge case? Post your approach, debate time complexities, and get unblocked by the community.
                </p>
                <motion.div animate={{ rotate: -360 }} transition={{ duration: 70, repeat: Infinity, ease: "linear" }} className={`absolute -right-10 -bottom-20 z-0 pointer-events-none ${isLightMode ? 'text-fuchsia-500/10' : 'text-grads-magenta/5'}`}>
                   <MessageSquare size={250} className="md:w-[380px] md:h-[380px]" strokeWidth={0.5} />
                </motion.div>
              </CyberNetworkCard>
            </SmoothScrollEntry>

          </div>
        </section>

        <section id="achievers" className="relative z-20 w-full py-10 md:py-20 overflow-hidden">
          <SmoothScrollEntry>
            <div className={`w-full border-y transition-all duration-1000 ${isLightMode ? 'bg-white/70 backdrop-blur-3xl border-slate-200/60 shadow-[0_20px_40px_rgba(0,0,0,0.05)]' : 'bg-[#0a1219]/40 backdrop-blur-2xl border-grads-teal/20 shadow-[0_0_50px_rgba(20,184,196,0.02)]'}`}>
              <div className="py-12 md:py-16">
                <div className="text-center mb-16 md:mb-24 relative z-20">
                  <motion.h3 
                    animate={{ backgroundPosition: ["0% center", "200% center"] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    className={`font-display text-3xl md:text-5xl font-extrabold tracking-widest uppercase bg-[length:200%_auto] text-transparent bg-clip-text ${isLightMode ? 'bg-gradient-to-r from-teal-600 via-slate-800 to-cyan-600' : 'bg-gradient-to-r from-grads-teal via-white to-grads-cyan'}`}
                  >
                    Top Achievers
                  </motion.h3>
                </div>
                
                <div className="relative w-full h-[200px] md:h-[300px] flex items-center justify-center" style={{ perspective: isMobile ? '800px' : '1200px' }}>
                  <motion.div 
                    className="relative w-[140px] h-[180px] md:w-[180px] md:h-[250px]"
                    style={{ transformStyle: 'preserve-3d' }}
                    animate={{ rotateY: [0, -360] }} 
                    transition={{ duration: 25, ease: "linear", repeat: Infinity }}
                  >
                    {achievers.map((user, idx) => {
                      const angle = idx * 60;
                      const radius = isMobile ? 160 : 340;
                      return (
                        <div 
                          key={idx} 
                          style={{ transform: `rotateY(${angle}deg) translateZ(${radius}px)` }}
                          className={`absolute top-0 left-0 w-full h-full p-4 md:p-6 rounded-2xl flex flex-col items-center justify-center gap-2 md:gap-4 transition-colors border ${isLightMode ? 'bg-white border-slate-300 shadow-2xl' : 'bg-[#040a0f] border-grads-teal/50 shadow-[0_0_30px_rgba(20,184,196,0.2)]'}`}
                        >
                          <div className={`w-16 h-16 md:w-24 md:h-24 rounded-full overflow-hidden border-2 ${isLightMode ? 'border-grads-teal shadow-lg ring-4 ring-slate-100' : 'border-grads-cyan/50 shadow-[0_0_15px_rgba(79,227,240,0.5)]'}`}>
                            <img src={user.img} alt={user.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="text-center">
                            <h5 className={`font-bold tracking-wider text-[10px] md:text-sm ${isLightMode ? 'text-slate-800' : 'text-white'}`}>{user.name}</h5>
                            <p className={`text-[9px] md:text-xs font-mono mt-1 ${isLightMode ? 'text-grads-tealDeep' : 'text-grads-cyan'}`}>{user.exp}</p>
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                </div>
              </div>
            </div>
          </SmoothScrollEntry>
        </section>

        <footer className={`relative z-20 w-full py-12 text-center transition-colors duration-1000 ${isLightMode ? 'bg-slate-100 text-slate-500 border-t border-slate-200' : 'bg-[#040a0f] text-grads-textSoft border-t border-grads-teal/10'}`}>
          <div className="max-w-7xl mx-auto px-6 flex flex-col items-center justify-center gap-4">
            <p className="text-[10px] md:text-sm font-mono uppercase tracking-widest mt-4">Powered By Logic.</p>
            <div className="flex gap-4 md:gap-6 mt-2 text-[10px] md:text-xs">
              <a href="#" className="hover:text-grads-teal transition-colors">Privacy</a>
              <a href="#" className="hover:text-grads-teal transition-colors">Terms</a>
              <a href="#" className="hover:text-grads-teal transition-colors">Contact</a>
            </div>
            <p className="text-[10px] md:text-xs opacity-40 mt-6">© 2026 The Grads. All rights reserved.</p>
          </div>
        </footer>

      </div>
    </>
  );
}

export default Landing;