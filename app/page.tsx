"use client";

import { motion, Variants } from "framer-motion";
import { Telescope, Map, Target, CheckCircle, TrendingUp, Layers, Fingerprint } from "lucide-react";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { SectionIntro } from "@/components/shared/section-intro";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { TestimonialCard } from "@/components/marketing/testimonial-card";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, y: 0, 
    transition: { type: "spring" as const, stiffness: 100, damping: 20 }
  }
};

const howItWorks = [
  {
    icon: Telescope,
    title: "Discover real pain",
    copy: "Start from sectors, user groups, and market pressure signals instead of generic startup prompts.",
  },
  {
    icon: Target,
    title: "Score the opportunity",
    copy: "Evaluate demand, monetization, difficulty, and competition with a clear Buildynex AI lens.",
  },
  {
    icon: Map,
    title: "Generate execution assets",
    copy: "Turn the best problem into a startup concept, roadmap, and brand direction aligned to your role.",
  },
];

const features = [
  { icon: CheckCircle, text: "Problem-first AI discovery by sector" },
  { icon: Target, text: "Role-aware recommendations for students, founders, and investors" },
  { icon: TrendingUp, text: "Visual scoring and explainable opportunity analysis" },
  { icon: Map, text: "Solution, roadmap, and branding generation from one source problem" },
  { icon: Fingerprint, text: "Supabase-powered auth, saved projects, and profile intelligence" },
  { icon: Layers, text: "Premium dashboard UX with polished, reusable product flows" }
];

const roleCards = [
  {
    title: "Students",
    copy: "Move from curiosity to credible startup exploration with lean ideas, low-cost launch paths, and a clear first step.",
  },
  {
    title: "Founders",
    copy: "Use Buildynex to avoid vanity ideas and focus on painful, monetizable market gaps with stronger GTM logic.",
  },
  {
    title: "Investors",
    copy: "Scan emerging pain points through a repeatable lens and pressure-test opportunity quality before diligence deepens.",
  },
];

export default function HomePage() {
  return (
    <MarketingShell>
      <main className="relative z-10 w-full">

        <section className="relative overflow-hidden py-24 sm:py-32 flex items-center min-h-[90vh]">
          <div className="section-shell grid gap-16 lg:grid-cols-[1.05fr,0.95fr] lg:items-center">
            
            {/* Left Content */}
            <motion.div 
              className="space-y-8"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <motion.div variants={itemVariants}>
                <Pill className="border-indigo-500/30 bg-indigo-500/10 text-indigo-300 backdrop-blur-md">
                  Problem-first startup builder
                </Pill>
              </motion.div>
              
              <div className="space-y-6">
                <motion.h1 variants={itemVariants} className="balance-text text-5xl font-semibold leading-tight text-white sm:text-6xl xl:text-7xl">
                  Find Problems Worth Solving. <br/>
                  <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-sky-300 bg-clip-text text-transparent">
                    Build Startups That Matter.
                  </span>
                </motion.h1>
                <motion.p variants={itemVariants} className="max-w-2xl text-lg leading-8 text-slate-300 font-medium">
                  Buildynex AI helps students, founders, and investors discover hidden pain in chosen sectors, score the opportunity with AI, and turn the right problem into a startup plan with clarity.
                </motion.p>
              </div>

              <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
                <Button href="/signup" className="px-6 rounded-full font-medium shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                  Start Building
                </Button>
                <Button href="/login" variant="secondary" className="px-6 rounded-full font-medium">
                  Log in
                </Button>
              </motion.div>

              <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-3 pt-4">
                {[
                  ["18+", "Sector templates"],
                  ["5 signals", "In every AI score"],
                  ["3 roles", "Tailored startup guidance"],
                ].map(([value, label], index) => (
                  <motion.div 
                    key={label}
                    className="premium-card p-5"
                    whileHover={{ y: -4, scale: 1.02 }}
                  >
                    <div className="text-3xl font-semibold text-white drop-shadow-md">{value}</div>
                    <div className="mt-2 text-sm text-cyan-200/70 font-medium tracking-wide uppercase">{label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Content / Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, type: "spring", bounce: 0.3 }}
              className="mesh-panel p-8 sm:p-10"
            >
              <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-[80px]" />
              <div className="absolute -bottom-24 -left-12 h-64 w-64 rounded-full bg-cyan-400/10 blur-[80px]" />
              
              <div className="relative space-y-6 z-10">
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
                  <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-indigo-300 uppercase">
                    <span>Workspace pulse</span>
                    <span className="flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                       Live AI workflow
                    </span>
                  </div>
                  <h3 className="mt-5 text-2xl font-semibold text-white">See where market pain compounds.</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    Explore validated workflow pain, not random startup prompts. Every discovery thread is designed to lead into an execution-ready product path.
                  </p>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { title: "AI Problem Score", copy: "Demand, monetization, difficulty, and competition in one view", icon: Target },
                    { title: "Execution Assets", copy: "Solutions, roadmaps, and branding generated from the same problem", icon: Map },
                  ].map(({title, copy, icon: Icon}) => (
                    <motion.div 
                      key={title} 
                      className="rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors p-5 flex flex-col items-start gap-4"
                    >
                      <div className="p-2 rounded-xl bg-indigo-500/20 ring-1 ring-indigo-500/30">
                        <Icon className="w-5 h-5 text-indigo-300" />
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-white">{title}</div>
                        <div className="mt-2 text-sm leading-7 text-slate-400">{copy}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="section-shell py-24">
          <SectionIntro
            eyebrow="How it works"
            title="A tighter path from insight to startup action"
            copy="The public site explains the value. The actual AI problem discovery, analysis, and scoring live inside the authenticated dashboard experience."
          />
          <motion.div 
            className="mt-14 grid gap-6 lg:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            {howItWorks.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div 
                  key={item.title} 
                  variants={itemVariants}
                  className="premium-card p-8 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-cyan-400/20 transition-all duration-500" />
                  <div className="relative z-10 flex flex-col gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-white">{item.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-slate-400">{item.copy}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        <section className="section-shell py-24">
          <SectionIntro eyebrow="Platform features" title="Built like a real startup operating system" copy="Buildynex AI combines structured problem discovery with execution outputs that help serious builders move faster and with better judgment." />
          <motion.div 
            className="mt-14 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div 
                  key={feature.text} 
                  variants={itemVariants}
                  className="premium-card p-5 flex items-center gap-4 text-sm leading-none text-slate-300"
                >
                  <div className="flex-shrink-0 p-2 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="leading-5">{feature.text}</span>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        <section className="section-shell py-24">
          <SectionIntro eyebrow="Built for roles" title="Different lenses. One premium problem engine." copy="Students, founders, and investors all need different answers after identifying a strong problem. Buildynex adapts the output without diluting the source opportunity." />
          <motion.div 
            className="mt-14 grid gap-6 lg:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            {roleCards.map((item, index) => (
              <motion.div 
                key={item.title} 
                variants={itemVariants}
                className="premium-card p-8 group"
              >
                <h3 className="text-2xl font-semibold text-white group-hover:text-cyan-300 transition-colors duration-300">{item.title}</h3>
                <div className="h-px w-12 bg-indigo-500/50 mt-4 mb-5" />
                <p className="text-sm leading-7 text-slate-400">{item.copy}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <section className="section-shell py-24">
          <SectionIntro eyebrow="Testimonials" title="Used by ambitious builders who want stronger conviction" />
          <motion.div 
            className="mt-14 grid gap-6 lg:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}><TestimonialCard quote="We used Buildynex to shift from vague AI brainstorming to an actual workflow problem our pilot customers already felt." name="Aarya Rao" title="Founder, logistics SaaS studio" /></motion.div>
            <motion.div variants={itemVariants}><TestimonialCard quote="The role-aware output is what sold me. I can evaluate the same problem differently as an investor and still keep the same source truth." name="Noah Blake" title="Angel investor" /></motion.div>
            <motion.div variants={itemVariants}><TestimonialCard quote="It helped me turn student projects into a clearer startup wedge instead of just another hackathon idea." name="Maya Chen" title="Student builder" /></motion.div>
          </motion.div>
        </section>

        <section className="section-shell py-32">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mesh-panel relative overflow-hidden p-10 text-center sm:p-16"
          >
            <div className="absolute inset-x-1/4 top-0 h-40 rounded-full bg-indigo-500/20 blur-[100px]" />
            <div className="relative z-10 mx-auto max-w-3xl">
              <Pill className="border-cyan-500/30 text-cyan-300 bg-cyan-500/10">Ready to build?</Pill>
              <h2 className="mt-8 text-4xl font-semibold text-white sm:text-5xl balance-text">
                Build the startup because the problem deserves it, not because the prompt sounded cool.
              </h2>
              <p className="mt-6 text-sm leading-8 text-slate-300 sm:text-base">
                Create your account, complete onboarding, and enter the Buildynex dashboard to explore AI-generated problems, score them, and generate a plan that actually moves.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Button href="/signup" className="px-6 rounded-full font-medium shadow-[0_0_20px_rgba(99,102,241,0.4)]">Create account</Button>
                <Button href="/login" variant="secondary" className="px-6 rounded-full font-medium">Log in</Button>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
    </MarketingShell>
  );
}
