import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowRight,
  Play,
  Lock,
  Zap,
  Database,
  Scale,
  Cpu,
  Timer
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { RobotCanvas } from '../components/proctoring/RobotCanvas';
import { GhostFibers } from '../components/common/GhostFibers';
import TiltedCard from '../components/common/TiltedCard';
import MagneticButton from '../components/common/MagneticButton';
import PixelCard from '../components/common/PixelCard';
import { PipelineCard } from '../components/common/PipelineCard';
import { Footer } from '../components/layout/Footer';

export const LandingPage = () => {
  const pipelineSteps = [
    {
      step: '01',
      badge: 'Step 01',
      category: 'Permissions & Init',
      title: 'Consent & Model Warmup',
      description:
        'Student grants camera access after transparent disclosure. MediaPipe and COCO-SSD models initialize in RAM in under 2 seconds without external cloud calls.',
      icon: <ShieldCheck className="w-6 h-6 text-purple-300 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]" strokeWidth={1.85} />,
      footerIcon: <Lock className="w-3.5 h-3.5" />,
      footerText: 'Client-side init',
      statusTag: 'RAM ISOLATED',
      accent: 'purple',
    },
    {
      step: '02',
      badge: 'Step 02',
      category: 'Edge Neural Inference',
      title: 'On-Device Telemetry',
      description:
        'Real-time checks detect multi-face, head pose angle, smartphone visibility, and tab switching using the Page Visibility API at pure 60 FPS.',
      icon: <Cpu className="w-6 h-6 text-violet-300 drop-shadow-[0_0_10px_rgba(139,92,246,0.8)]" strokeWidth={1.85} />,
      footerIcon: <Zap className="w-3.5 h-3.5" />,
      footerText: '60 FPS in-browser',
      statusTag: '~14ms Latency',
      accent: 'violet',
    },
    {
      step: '03',
      badge: 'Step 03',
      category: 'Differential Logging',
      title: 'Micro-Snapshot Logging',
      description:
        'If a violation sustains over threshold, a compressed micro-snapshot and timestamped log are uploaded to the teacher queue with automated TTL expiry.',
      icon: <Database className="w-6 h-6 text-fuchsia-300 drop-shadow-[0_0_10px_rgba(217,70,239,0.8)]" strokeWidth={1.85} />,
      footerIcon: <Database className="w-3.5 h-3.5" />,
      footerText: 'Zero full video',
      statusTag: 'TTL Guaranteed',
      accent: 'fuchsia',
    },
    {
      step: '04',
      badge: 'Step 04',
      category: 'Supervised Review',
      title: 'Human Veto & Tuning',
      description:
        'The teacher reviews flagged moments on an interactive timeline with "Valid" or "False Alarm" actions. AI never autonomously fails students.',
      icon: <Scale className="w-6 h-6 text-indigo-300 drop-shadow-[0_0_10px_rgba(99,102,241,0.8)]" strokeWidth={1.85} />,
      footerIcon: <Scale className="w-3.5 h-3.5" />,
      footerText: 'Human-in-the-loop',
      statusTag: 'Teacher Veto',
      accent: 'indigo',
    },
  ];

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 selection:bg-purple-500 selection:text-white relative overflow-hidden">
      {/* Interactive WebGL2 GhostFibers Particle Canvas */}
      <div className="absolute top-0 left-0 right-0 h-[920px] z-0 opacity-70 pointer-events-none overflow-hidden [mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)]">
        <GhostFibers
          glowColor="#a855f7"
          secondaryColor="#8b5cf6"
          lineColor="#d8b4fe"
          speed={0.35}
          scale={1.1}
          density={0.75}
          threads={56}
          volume={0.65}
          spread={1.2}
          mouseInteraction={false}
          brightness={1.1}
          glow={0.75}
        />
      </div>

      {/* Background Cyber Ambient Lights */}
      <div className="absolute top-[-10rem] left-1/2 -translate-x-1/2 w-[45rem] h-[30rem] bg-gradient-to-b from-purple-500/20 via-violet-500/15 to-transparent blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute top-[28rem] -left-32 w-96 h-96 bg-purple-600/15 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-[35rem] -right-32 w-96 h-96 bg-violet-600/15 blur-[140px] pointer-events-none rounded-full" />

      {/* Modern Floating Glassmorphism Navbar */}
      <Navbar />

      {/* ===================== HERO SECTION ===================== */}
      <section className="relative pt-32 sm:pt-40 lg:pt-44 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* Left Column: Headlines & Call to Actions */}
          <div className="lg:col-span-7 flex flex-col items-start text-left z-10">

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-[-0.035em] text-white leading-[1.08] font-heading">
              In-Browser AI <br />
              <span className="text-purple-400">
                Exam Proctoring.
              </span>
              <br />
              <span className="text-slate-200 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                Decided by Humans.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-base sm:text-lg text-slate-300/90 leading-relaxed max-w-2xl font-normal tracking-normal">
              No intrusive 24/7 video streaming to corporate servers. ProctorVision runs lightweight
              <span className="text-purple-400 font-medium"> MediaPipe Face Mesh</span> and
              <span className="text-violet-400 font-medium"> COCO-SSD Phone Detection</span> right on the student’s laptop.
              Teachers review <span className="text-white font-medium">short snapshot timelines</span> with full false-alarm tuning.
            </p>

            {/* CTAs with Magnetic Effect & Liquid Fill */}
            <div className="mt-8 flex flex-wrap items-center gap-6 sm:gap-7 w-full sm:w-auto">
              <MagneticButton className="w-full sm:w-auto">
                <Link
                  to="/student"
                  className="relative group/btn overflow-hidden w-full sm:w-auto px-7 py-3.5 rounded-full border border-purple-400/90 bg-purple-950/40 text-purple-300 font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(168,85,247,0.35)] hover:shadow-[0_0_40px_rgba(168,85,247,0.7)] active:scale-[0.98] transition-all duration-300 cursor-pointer select-none"
                >
                  {/* Liquid Fill Layer: Slides up on hover */}
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-400 via-violet-300 to-fuchsia-400 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out pointer-events-none" />

                  {/* Content Layer */}
                  <span className="relative z-10 flex items-center gap-2.5 text-purple-300 group-hover/btn:text-slate-950 transition-colors duration-300 font-bold">
                    <Play className="w-4 h-4 fill-current transition-transform duration-300 group-hover/btn:scale-110" />
                    <span>Launch Student Demo</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                  </span>
                </Link>
              </MagneticButton>

              <MagneticButton className="w-full sm:w-auto">
                <Link
                  to="/teacher"
                  className="relative group/btn overflow-hidden w-full sm:w-auto px-7 py-3.5 rounded-full border border-white/15 hover:border-purple-400/60 bg-slate-900/70 text-slate-200 font-semibold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg hover:shadow-[0_0_25px_rgba(168,85,247,0.25)] active:scale-[0.98] transition-all duration-300 cursor-pointer select-none backdrop-blur-md"
                >
                  {/* Liquid Fill Layer: Slides up on hover */}
                  <span className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-800/90 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out pointer-events-none" />

                  {/* Content Layer */}
                  <span className="relative z-10 flex items-center justify-center text-slate-200 group-hover/btn:text-white transition-colors duration-300 font-semibold">
                    <span>Teacher Dashboard</span>
                  </span>
                </Link>
              </MagneticButton>
            </div>

          </div>

          {/* Right Column: 3D Robot in Interactive TiltedCard */}
          <div id="demo" className="lg:col-span-5 relative flex items-center justify-center">
            {/* Ambient Purple Glow behind Card */}
            <div className="absolute -inset-2 bg-gradient-to-tr from-purple-500/25 via-violet-500/15 to-fuchsia-500/20 rounded-3xl blur-2xl opacity-80 pointer-events-none" />

            <TiltedCard
              containerWidth="100%"
              containerHeight="480px"
              imageWidth="100%"
              imageHeight="100%"
              rotateAmplitude={12}
              scaleOnHover={1.03}
              glare={0.4}
              glareColor="#c084fc"
              shadow={0.65}
              radius={24}
              perspective={900}
              showTooltip={false}
              className="w-full max-w-md shadow-[0_25px_60px_rgba(0,0,0,0.8)]"
              backContent={
                <div className="w-full h-full bg-slate-950/95 backdrop-blur-2xl border border-purple-500/30 p-6 flex flex-col justify-between text-left select-none">
                  {/* Back Header */}
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-purple-500/20 text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                        <span className="text-purple-300 font-semibold tracking-wider uppercase">AI Sentinel Telemetry</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-[10px] text-purple-300 font-mono">
                        ONLINE
                      </span>
                    </div>

                    {/* Telemetry Metrics */}
                    <div className="mt-5 space-y-2.5 font-mono text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-between">
                        <span className="text-slate-400">Vision Model</span>
                        <span className="text-purple-400 font-bold">MediaPipe FaceMesh (468 pts)</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-between">
                        <span className="text-slate-400">Head Pose</span>
                        <span className="text-violet-400 font-bold">Pitch / Yaw / Roll Tracking</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-between">
                        <span className="text-slate-400">Hardware Detector</span>
                        <span className="text-fuchsia-400 font-bold">COCO-SSD Phone In-Browser</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-between">
                        <span className="text-slate-400">Latency & Frame</span>
                        <span className="text-purple-300 font-bold">~14ms • 60 FPS WebGL</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-between">
                        <span className="text-slate-400">Privacy Guarantee</span>
                        <span className="text-purple-400 font-bold">0 KB Streamed to Cloud</span>
                      </div>
                    </div>
                  </div>

                  {/* Back Footer */}
                  <div className="pt-3 border-t border-purple-500/20 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="text-purple-400 flex items-center gap-1.5 font-mono">
                      <span>🔄</span> Click to flip back
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">v2.4-edge</span>
                  </div>
                </div>
              }
            >
              {/* Card Face Content - Pure 3D Robot Viewport */}
              <div className="relative w-full h-full bg-slate-950/90 backdrop-blur-2xl border border-white/15 p-4 flex items-center justify-center overflow-hidden">
                <RobotCanvas />
              </div>
            </TiltedCard>
          </div>

        </div>
      </section>

      {/* ===================== CORE ADVANTAGE SECTION ===================== */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-heading">
            How ProctorVision Replaces Invasive Video Streaming
          </h2>
          <p className="mt-4 text-base text-slate-400">
            Traditional proctoring services force students to upload hours of video to corporate cloud servers, risking leaks and false bans. Here is why our on-device edge approach wins:
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 sm:gap-8 items-stretch">

          {/* Card 1: On-Device Edge Vision */}
          <PixelCard
            colors={['#a855f7', '#c084fc', '#e9d5ff', '#ffffff']}
            glowColor="#a855f7"
            gap={6}
            speed={40}
            pixelSize={2.5}
            spotlight={0.75}
            glow={0.6}
            opacity={0.65}
            fade={0.3}
            radius={24}
            className="w-full h-full text-center group border border-purple-500/30 hover:border-purple-400/80 shadow-[0_0_30px_rgba(168,85,247,0.12)] hover:shadow-[0_0_45px_rgba(168,85,247,0.35)] transition-all duration-300"
          >
            <div className="w-full h-full p-6 sm:p-8 flex flex-col items-center justify-center text-center relative z-10">
              {/* Subtle cyber laser line */}
              <div className="absolute top-0 inset-x-8 h-[1.5px] bg-gradient-to-r from-transparent via-purple-400/60 to-transparent pointer-events-none" />

              {/* Luminous Icon Badge */}
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/25 via-slate-900/90 to-slate-950 border border-purple-400/50 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-purple-400/90 transition-all duration-300 shadow-[0_0_25px_rgba(168,85,247,0.4)] group-hover:shadow-[0_0_35px_rgba(168,85,247,0.7)]">
                <div className="absolute inset-0 rounded-2xl bg-purple-400/15 blur-sm pointer-events-none" />
                <Cpu className="w-7 h-7 text-purple-300 relative z-10 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]" strokeWidth={1.85} />
              </div>

              {/* Category Pill */}
              <span className="px-3 py-1 rounded-full text-[11px] font-mono font-semibold tracking-wider uppercase bg-purple-500/10 text-purple-300 border border-purple-500/30 mb-3 shadow-[0_0_12px_rgba(168,85,247,0.15)]">
                Client-Side AI
              </span>

              {/* Text area with hover backdrop-blur for clear readability */}
              <div className="rounded-xl p-3 transition-all duration-300 group-hover:bg-slate-950/85 group-hover:backdrop-blur-md">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 font-heading tracking-tight drop-shadow-md">
                  On-Device Edge Vision
                </h3>
                <p className="text-sm text-slate-300/90 leading-relaxed font-normal max-w-sm">
                  Google MediaPipe & TensorFlow.js execute right inside WebAssembly and WebGL. Detects face count, head pose yaw/pitch, and smartphones without sending camera feeds to a server.
                </p>
              </div>
            </div>
          </PixelCard>

          {/* Card 2: Micro-Snapshots with TTL */}
          <PixelCard
            colors={['#8b5cf6', '#a78bfa', '#c4b5fd', '#ffffff']}
            glowColor="#8b5cf6"
            gap={6}
            speed={40}
            pixelSize={2.5}
            spotlight={0.75}
            glow={0.6}
            opacity={0.65}
            fade={0.3}
            radius={24}
            className="w-full h-full text-center group border border-violet-500/30 hover:border-violet-400/80 shadow-[0_0_30px_rgba(139,92,246,0.12)] hover:shadow-[0_0_45px_rgba(139,92,246,0.35)] transition-all duration-300"
          >
            <div className="w-full h-full p-6 sm:p-8 flex flex-col items-center justify-center text-center relative z-10">
              {/* Subtle cyber laser line */}
              <div className="absolute top-0 inset-x-8 h-[1.5px] bg-gradient-to-r from-transparent via-violet-400/60 to-transparent pointer-events-none" />

              {/* Luminous Icon Badge */}
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/25 via-slate-900/90 to-slate-950 border border-violet-400/50 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-violet-400/90 transition-all duration-300 shadow-[0_0_25px_rgba(139,92,246,0.4)] group-hover:shadow-[0_0_35px_rgba(139,92,246,0.7)]">
                <div className="absolute inset-0 rounded-2xl bg-violet-400/15 blur-sm pointer-events-none" />
                <Timer className="w-7 h-7 text-violet-300 relative z-10 drop-shadow-[0_0_10px_rgba(139,92,246,0.8)]" strokeWidth={1.85} />
              </div>

              {/* Category Pill */}
              <span className="px-3 py-1 rounded-full text-[11px] font-mono font-semibold tracking-wider uppercase bg-violet-500/10 text-violet-300 border border-violet-500/30 mb-3 shadow-[0_0_12px_rgba(139,92,246,0.15)]">
                Encrypted & Expiring
              </span>

              {/* Text area with hover backdrop-blur for clear readability */}
              <div className="rounded-xl p-3 transition-all duration-300 group-hover:bg-slate-950/85 group-hover:backdrop-blur-md">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 font-heading tracking-tight drop-shadow-md">
                  Micro-Snapshots with TTL
                </h3>
                <p className="text-sm text-slate-300/90 leading-relaxed font-normal max-w-sm">
                  When an alarm triggers, only a short timestamped event record and a small snapshot are sent via Multer. MongoDB TTL indexes guarantee automatic deletion once review closes.
                </p>
              </div>
            </div>
          </PixelCard>

          {/* Card 3: Human-in-the-Loop Review */}
          <PixelCard
            colors={['#d946ef', '#e879f9', '#f0abfc', '#ffffff']}
            glowColor="#d946ef"
            gap={6}
            speed={40}
            pixelSize={2.5}
            spotlight={0.75}
            glow={0.6}
            opacity={0.65}
            fade={0.3}
            radius={24}
            className="w-full h-full text-center group border border-fuchsia-500/30 hover:border-fuchsia-400/80 shadow-[0_0_30px_rgba(217,70,239,0.12)] hover:shadow-[0_0_45px_rgba(217,70,239,0.35)] transition-all duration-300"
          >
            <div className="w-full h-full p-6 sm:p-8 flex flex-col items-center justify-center text-center relative z-10">
              {/* Subtle cyber laser line */}
              <div className="absolute top-0 inset-x-8 h-[1.5px] bg-gradient-to-r from-transparent via-fuchsia-400/60 to-transparent pointer-events-none" />

              {/* Luminous Icon Badge */}
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-fuchsia-500/25 via-slate-900/90 to-slate-950 border border-fuchsia-400/50 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-fuchsia-400/90 transition-all duration-300 shadow-[0_0_25px_rgba(217,70,239,0.4)] group-hover:shadow-[0_0_35px_rgba(217,70,239,0.7)]">
                <div className="absolute inset-0 rounded-2xl bg-fuchsia-400/15 blur-sm pointer-events-none" />
                <Scale className="w-7 h-7 text-fuchsia-300 relative z-10 drop-shadow-[0_0_10px_rgba(217,70,239,0.8)]" strokeWidth={1.85} />
              </div>

              {/* Category Pill */}
              <span className="px-3 py-1 rounded-full text-[11px] font-mono font-semibold tracking-wider uppercase bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/30 mb-3 shadow-[0_0_12px_rgba(217,70,239,0.15)]">
                Teacher Decision
              </span>

              {/* Text area with hover backdrop-blur for clear readability */}
              <div className="rounded-xl p-3 transition-all duration-300 group-hover:bg-slate-950/85 group-hover:backdrop-blur-md">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 font-heading tracking-tight drop-shadow-md">
                  Human-in-the-Loop Review
                </h3>
                <p className="text-sm text-slate-300/90 leading-relaxed font-normal max-w-sm">
                  Software never automatically fails a student. Teachers get an event timeline with "Valid" or "False Alarm" buttons, plus a tuning screen to dampen overactive rules (e.g., looking down at keys).
                </p>
              </div>
            </div>
          </PixelCard>

        </div>
      </section>

      {/* ===================== HOW IT WORKS SECTION ===================== */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20 relative">
        {/* Subtle Ambient Section Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[20rem] bg-purple-500/10 blur-[140px] pointer-events-none rounded-full" />

        <div className="text-center max-w-3xl mx-auto mb-14 relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white font-heading">
            Simple for Students.{' '}
            <span className="text-purple-400">
              Transparent for Teachers.
            </span>
          </h2>
          <p className="mt-4 text-base text-slate-300/80 max-w-2xl mx-auto leading-relaxed">
            A seamless workflow engineered from the ground up to eliminate invasive surveillance while ensuring 100% academic integrity.
          </p>
        </div>

        {/* Desktop Synchronized Pipeline Sequence Rail (4 columns aligned with cards) */}
        <div className="hidden lg:grid grid-cols-4 gap-6 mb-8 relative z-10">
          {[
            { num: '01', label: 'Consent & Warmup', color: 'text-purple-400 border-purple-400/40 bg-purple-950/60' },
            { num: '02', label: '60 FPS Telemetry', color: 'text-violet-400 border-violet-400/40 bg-violet-950/60' },
            { num: '03', label: 'Micro-Snapshots', color: 'text-fuchsia-400 border-fuchsia-400/40 bg-fuchsia-950/60' },
            { num: '04', label: 'Human Review', color: 'text-indigo-400 border-indigo-400/40 bg-indigo-950/60' },
          ].map((s, idx) => (
            <div key={idx} className="relative flex items-center">
              {/* Connector line between steps */}
              {idx < 3 && (
                <div className="absolute left-1/2 right-[-50%] top-1/2 -translate-y-1/2 h-[2px] bg-slate-800 z-0">
                  <div className="h-full bg-gradient-to-r from-purple-400/40 via-violet-400/40 to-slate-800 w-full" />
                </div>
              )}
              <div className="relative z-10 w-full px-4 py-2.5 rounded-xl bg-slate-950/90 border border-white/10 backdrop-blur-md flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2.5">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10.5px] font-mono font-bold border ${s.color}`}>
                    {s.num}
                  </span>
                  <span className="text-xs font-mono font-medium text-slate-200">
                    {s.label}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">
                  STEP {s.num}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 4 Pipeline Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {pipelineSteps.map((stepItem, index) => (
            <PipelineCard
              key={stepItem.step}
              item={stepItem}
              index={index}
              total={pipelineSteps.length}
            />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
