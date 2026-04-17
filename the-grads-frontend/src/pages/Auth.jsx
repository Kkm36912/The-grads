import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Code2, ArrowRight } from 'lucide-react';

// ================= NATIVE CANVAS LIVE NODE BACKGROUND =================
const LiveNodeBackground = ({ isLightMode }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize);
    resize();
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.8; 
        this.vy = (Math.random() - 0.5) * 0.8;
        this.color = Math.random() > 0.5 ? (isLightMode ? 'rgba(14, 165, 233, ' : 'rgba(79, 227, 240, ') : (isLightMode ? 'rgba(168, 85, 247, ' : 'rgba(224, 82, 255, ');
      }
      update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      draw() {
        ctx.beginPath(); ctx.arc(this.x, this.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = this.color + '0.8)'; ctx.fill();
      }
    }
    const nodeCount = window.innerWidth > 768 ? 60 : 30;
    for (let i = 0; i < nodeCount; i++) particles.push(new Particle());
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update(); particles[i].draw();
        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x; const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 120) { 
            ctx.beginPath(); const opacity = 1 - (distance / 120);
            ctx.strokeStyle = isLightMode ? `rgba(100, 116, 139, ${opacity * 0.25})` : `rgba(79, 227, 240, ${opacity * 0.3})`;
            ctx.lineWidth = 1; ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animationFrameId); };
  }, [isLightMode]);
  return <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-60 pointer-events-none" />;
};

export default function Auth({ onAuthSuccess }) {
  const isLightMode = false; 
  const [isLogin, setIsLogin] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { login, register, loading } = useContext(AuthContext);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // ================= RADIATING PRECISION CURSOR =================
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const springConfig = { damping: 28, stiffness: 500, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);
  
  const [isHovering, setIsHovering] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Cursor tracking
  useEffect(() => {
    if (isMobile) return; 
    const moveCursor = (e) => {
      cursorX.set(e.clientX - 8); 
      cursorY.set(e.clientY - 8);
      const target = e.target;
      const isClickable = target.closest('button') || target.closest('a') || target.closest('input');
      setIsHovering(!!isClickable);
    };
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, [cursorX, cursorY, isMobile]);

  // ================= FORM STATE =================
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    let result;
    if (isLogin) {
      result = await login(formData.email, formData.password);
    } else {
      result = await register(formData.fullName, formData.email, formData.password);
    }

    if (result.success) {
      // 🔥 THE SMART BOUNCER FIX
      // If the context passed back an ADMIN role, send them to the Command Center
      if (result.user?.role === 'ADMIN') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard'); // Standard student redirect
      }
    } else {
      setError(result.message);
    }
  };

  // UPDATED: Sharper corners (rounded-lg), slightly more transparent background for glass effect
  const inputClasses = `w-full bg-[#0a1219]/30 backdrop-blur-md border border-grads-teal/20 rounded-lg px-12 py-3.5 text-grads-text placeholder:text-grads-textSoft/50 focus:outline-none focus:border-grads-cyan focus:ring-1 focus:ring-grads-cyan transition-all`;
  const iconClasses = `absolute left-4 top-1/2 -translate-y-1/2 text-grads-teal/70 w-5 h-5`;

  return (
    <>
      {/* ================= RADIATING PRECISION CURSOR ================= */}
      <motion.div
        className="fixed top-0 left-0 w-4 h-4 rounded-full pointer-events-none hidden md:block"
        style={{ x: cursorXSpring, y: cursorYSpring, zIndex: 999999 }}
        animate={{
          scale: isHovering ? 1.5 : 1,
          backgroundColor: ['#0ea5e9', '#a855f7', '#0ea5e9'],
          boxShadow: ['0 0 15px 2px #0ea5e9', '0 0 15px 2px #a855f7', '0 0 15px 2px #0ea5e9']
        }}
        transition={{
          scale: { duration: 0.2 },
          backgroundColor: { duration: 3, repeat: Infinity, ease: "linear" },
          boxShadow: { duration: 3, repeat: Infinity, ease: "linear" }
        }}
      />

      <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#03070b] overflow-hidden font-sans cursor-none md:cursor-auto">
        
        {/* BACKGROUND ELEMENTS */}
        <div className="absolute inset-0 transition-opacity duration-1000 opacity-100" style={{ backgroundImage: 'radial-gradient(circle at 0 0, rgba(14,165,233,0.25) 1.5px, transparent 1.5px), radial-gradient(circle at 12px 12px, rgba(168,85,247,0.25) 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}></div>
        <LiveNodeBackground isLightMode={isLightMode} />
        <motion.div animate={{ x: ["-10%", "10%", "-10%"], y: ["-5%", "5%", "-5%"] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[160px] bg-grads-teal opacity-20 pointer-events-none"></motion.div>
        <motion.div animate={{ x: ["10%", "-10%", "10%"], y: ["5%", "-5%", "5%"] }} transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[180px] bg-grads-magenta opacity-10 pointer-events-none"></motion.div>

        {/* UPDATED GLASSMORPHIC AUTH CARD: More blur, multi-layered shadows to pop out, top/left border highlight, sharper corners */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 w-full max-w-md bg-[#040a0f]/40 backdrop-blur-3xl border-t border-l  border-b border-r border-grads-teal/20 rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8),0_0_40px_rgba(20,184,196,0.15)] p-8 md:p-10"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-[#0a1219] border border-grads-teal/30 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(20,184,196,0.2)]">
              <Code2 className="text-grads-cyan w-8 h-8" />
            </div>
            <h2 className="text-3xl font-display font-bold text-white tracking-tight">
              {isLogin ? 'Welcome Back.' : 'Join The Grads.'}
            </h2>
            <p className="text-grads-textSoft mt-2 text-sm text-center">
              {isLogin ? 'Initialize your session to continue building.' : 'Create an account to start your gamified growth.'}
            </p>
          </div>
          {error && <div className="text-red-400 text-sm text-center mb-4 bg-red-500/10 py-2 rounded-lg border border-red-500/20">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div 
                  key="fullName"
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative"
                >
                  <User className={iconClasses} />
                  <input 
                    type="text" 
                    name="fullName"
                    placeholder="Full Name" 
                    value={formData.fullName}
                    onChange={handleChange}
                    required={!isLogin}
                    className={inputClasses}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Mail className={iconClasses} />
              <input 
                type="email" 
                name="email"
                placeholder="Email Address" 
                value={formData.email}
                onChange={handleChange}
                required 
                className={inputClasses}
              />
            </div>

            <div className="relative">
              <Lock className={iconClasses} />
              <input 
                type="password" 
                name="password"
                placeholder="Password" 
                value={formData.password}
                onChange={handleChange}
                required 
                className={inputClasses}
              />
            </div>

            {isLogin && (
              <div className="flex justify-end pt-1">
                <a href="#" className="text-xs text-grads-teal hover:text-grads-cyan transition-colors">Forgot Password?</a>
              </div>
            )}

            <button 
              type="submit"
              className="relative group overflow-hidden w-full mt-6 px-10 py-3.5 rounded-lg border font-bold text-lg tracking-wide transition-all duration-300 md:hover:-translate-y-1 md:hover:scale-[1.02] bg-[#0a1219] border-grads-teal/30 text-grads-text md:hover:border-grads-cyan/80 shadow-lg"
            >
              <div className="absolute inset-0 w-full h-full opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 ease-out bg-gradient-to-r from-grads-teal/20 to-grads-cyan/20"></div>
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? 'Processing...' : (isLogin ? 'Initialize Session' : 'Create Account')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-grads-textSoft">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-grads-cyan font-semibold hover:underline decoration-grads-cyan/50 underline-offset-4 ml-1"
              >
                {isLogin ? 'Register now.' : 'Login here.'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}

