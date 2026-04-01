"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Bot, Zap, Shield, BarChart3, Users, FolderKanban,
  ChevronRight, Star, Check, Globe, Menu, X,
  ArrowRight, Play, Sparkles, Building2, Layers,
  TrendingUp, Clock, Award,
} from "lucide-react";

// ─── Content ──────────────────────────────────────────────────────────────────

const CONTENT = {
  en: {
    dir: "ltr",
    nav: {
      features: "Features",
      howItWorks: "How It Works",
      pricing: "Pricing",
      login: "Login",
      getStarted: "Get Started Free",
    },
    hero: {
      badge: "Now in Beta — Free to Start",
      title: "Your Company,",
      titleAccent: "Managed by AI",
      subtitle:
        "The first company management system where AI employees work alongside your team — handling tasks, generating reports, and driving results automatically.",
      cta: "Start Free Today",
      ctaSub: "No credit card required",
      demo: "Watch Demo",
      stats: [
        { value: "10x", label: "Faster task execution" },
        { value: "AI", label: "Employees that actually work" },
        { value: "100%", label: "Multi-tenant & secure" },
      ],
    },
    features: {
      badge: "Everything You Need",
      title: "Built for modern companies",
      subtitle: "One platform to manage your entire company — departments, employees, projects, tasks, and AI agents.",
      items: [
        {
          icon: Bot,
          title: "AI Employees",
          desc: "Create AI agents for any role — HR, Sales, Finance, Support. They execute real tasks and deliver structured results.",
          color: "from-violet-500 to-purple-600",
          bg: "bg-violet-50",
          accent: "text-violet-600",
        },
        {
          icon: FolderKanban,
          title: "Project Management",
          desc: "Organize projects by department, assign tasks, track progress, and monitor health across your entire company.",
          color: "from-blue-500 to-indigo-600",
          bg: "bg-blue-50",
          accent: "text-blue-600",
        },
        {
          icon: Users,
          title: "Team Management",
          desc: "Invite team members via email, assign roles, and manage your entire workforce from one dashboard.",
          color: "from-emerald-500 to-teal-600",
          bg: "bg-emerald-50",
          accent: "text-emerald-600",
        },
        {
          icon: BarChart3,
          title: "Reports & Analytics",
          desc: "Real-time productivity scores, completion rates, project health, and exportable CSV reports.",
          color: "from-orange-500 to-amber-600",
          bg: "bg-orange-50",
          accent: "text-orange-600",
        },
        {
          icon: Shield,
          title: "Role-Based Security",
          desc: "Super Admin, Admin, Manager, Employee — each role sees and does exactly what they should. Nothing more.",
          color: "from-red-500 to-rose-600",
          bg: "bg-red-50",
          accent: "text-red-600",
        },
        {
          icon: Zap,
          title: "AI Marketplace",
          desc: "Browse and install pre-built AI agent templates. One click to add an HR Manager, Sales Executive, or Data Analyst.",
          color: "from-yellow-500 to-orange-500",
          bg: "bg-yellow-50",
          accent: "text-yellow-600",
        },
      ],
    },
    howItWorks: {
      badge: "Simple Setup",
      title: "From signup to running in minutes",
      steps: [
        {
          num: "01",
          title: "Register Your Company",
          desc: "Create your company workspace in 30 seconds. One form, instant access.",
        },
        {
          num: "02",
          title: "Invite Your Team",
          desc: "Send email invitations with one click. Team members set their own passwords.",
        },
        {
          num: "03",
          title: "Install AI Employees",
          desc: "Browse the marketplace and install AI agents for your roles with one click.",
        },
        {
          num: "04",
          title: "Assign & Execute",
          desc: "Assign tasks to humans or AI. AI employees execute and deliver structured results immediately.",
        },
      ],
    },
    pricing: {
      badge: "Pricing",
      title: "Start free, scale when ready",
      subtitle: "No hidden fees. No credit card required to start.",
      plans: [
        {
          name: "Free Beta",
          price: "$0",
          period: "forever",
          desc: "Perfect for small teams getting started",
          features: [
            "Up to 5 team members",
            "3 projects",
            "10 AI tasks per month",
            "Basic analytics",
            "Email support",
          ],
          cta: "Start Free",
          highlighted: false,
        },
        {
          name: "Growth",
          price: "$29",
          period: "per month",
          desc: "For growing teams that need more power",
          features: [
            "Up to 20 team members",
            "Unlimited projects",
            "100 AI tasks per month",
            "Full analytics & reports",
            "Priority support",
            "CSV exports",
          ],
          cta: "Start Free Trial",
          highlighted: true,
          badge: "Most Popular",
        },
        {
          name: "Business",
          price: "$79",
          period: "per month",
          desc: "For companies that run on AI",
          features: [
            "Unlimited team members",
            "Unlimited everything",
            "500 AI tasks per month",
            "Custom AI agents",
            "Dedicated support",
            "White-label option",
          ],
          cta: "Contact Us",
          highlighted: false,
        },
      ],
    },
    testimonials: {
      badge: "Early Users",
      title: "Teams love working with AI employees",
      items: [
        {
          name: "Ahmed Al-Rashid",
          role: "CEO, TechStart Arabia",
          text: "Our AI HR Manager handles all the hiring paperwork automatically. It saved us 15 hours a week.",
          avatar: "A",
          color: "bg-blue-500",
        },
        {
          name: "Sara Khalil",
          role: "Operations Manager",
          text: "Finally a management tool that actually understands how Arabic businesses work. The bilingual support is perfect.",
          avatar: "S",
          color: "bg-purple-500",
        },
        {
          name: "Mohammed Hassan",
          role: "Founder, ConsultCo",
          text: "The AI Sales Executive generates client proposals in seconds. Our conversion rate went up 40%.",
          avatar: "M",
          color: "bg-emerald-500",
        },
      ],
    },
    cta: {
      title: "Ready to build your AI-powered company?",
      subtitle: "Join hundreds of companies already using AI employees to work smarter.",
      button: "Get Started Free",
      sub: "Setup takes less than 2 minutes",
    },
    footer: {
      tagline: "The future of company management is here.",
      links: ["Features", "Pricing", "Login", "Register"],
      copy: "© 2025 CMS Platform. All rights reserved.",
    },
  },

  ar: {
    dir: "rtl",
    nav: {
      features: "المميزات",
      howItWorks: "كيف يعمل",
      pricing: "الأسعار",
      login: "تسجيل الدخول",
      getStarted: "ابدأ مجاناً",
    },
    hero: {
      badge: "الآن في النسخة التجريبية — مجاني للبدء",
      title: "شركتك،",
      titleAccent: "يديرها الذكاء الاصطناعي",
      subtitle:
        "أول نظام لإدارة الشركات حيث يعمل موظفو الذكاء الاصطناعي جنباً إلى جنب مع فريقك — يتولون المهام ويولدون التقارير ويحققون النتائج تلقائياً.",
      cta: "ابدأ مجاناً اليوم",
      ctaSub: "لا يلزم بطاقة ائتمانية",
      demo: "شاهد العرض",
      stats: [
        { value: "10x", label: "تنفيذ أسرع للمهام" },
        { value: "AI", label: "موظفون يعملون فعلاً" },
        { value: "100%", label: "آمن ومتعدد المستأجرين" },
      ],
    },
    features: {
      badge: "كل ما تحتاجه",
      title: "مبني للشركات الحديثة",
      subtitle: "منصة واحدة لإدارة شركتك بالكامل — الأقسام والموظفون والمشاريع والمهام وعملاء الذكاء الاصطناعي.",
      items: [
        {
          icon: Bot,
          title: "موظفو الذكاء الاصطناعي",
          desc: "أنشئ وكلاء ذكاء اصطناعي لأي دور — موارد بشرية، مبيعات، مالية، دعم. ينفذون المهام الحقيقية ويقدمون نتائج منظمة.",
          color: "from-violet-500 to-purple-600",
          bg: "bg-violet-50",
          accent: "text-violet-600",
        },
        {
          icon: FolderKanban,
          title: "إدارة المشاريع",
          desc: "نظم المشاريع حسب القسم وعيّن المهام وتتبع التقدم وراقب الصحة في جميع أنحاء شركتك.",
          color: "from-blue-500 to-indigo-600",
          bg: "bg-blue-50",
          accent: "text-blue-600",
        },
        {
          icon: Users,
          title: "إدارة الفريق",
          desc: "ادعُ أعضاء الفريق عبر البريد الإلكتروني وخصص الأدوار وأدر القوى العاملة بأكملها من لوحة تحكم واحدة.",
          color: "from-emerald-500 to-teal-600",
          bg: "bg-emerald-50",
          accent: "text-emerald-600",
        },
        {
          icon: BarChart3,
          title: "التقارير والتحليلات",
          desc: "درجات الإنتاجية في الوقت الفعلي ومعدلات الإنجاز وصحة المشروع وتقارير CSV قابلة للتصدير.",
          color: "from-orange-500 to-amber-600",
          bg: "bg-orange-50",
          accent: "text-orange-600",
        },
        {
          icon: Shield,
          title: "الأمان المبني على الأدوار",
          desc: "مدير عام، مدير، مشرف، موظف — كل دور يرى ويفعل بالضبط ما ينبغي له. لا أكثر.",
          color: "from-red-500 to-rose-600",
          bg: "bg-red-50",
          accent: "text-red-600",
        },
        {
          icon: Zap,
          title: "سوق الذكاء الاصطناعي",
          desc: "تصفح وثبّت قوالب وكيل الذكاء الاصطناعي الجاهزة. نقرة واحدة لإضافة مدير موارد بشرية أو مدير مبيعات.",
          color: "from-yellow-500 to-orange-500",
          bg: "bg-yellow-50",
          accent: "text-yellow-600",
        },
      ],
    },
    howItWorks: {
      badge: "إعداد بسيط",
      title: "من التسجيل إلى التشغيل في دقائق",
      steps: [
        { num: "01", title: "سجّل شركتك", desc: "أنشئ مساحة عمل شركتك في 30 ثانية. نموذج واحد، وصول فوري." },
        { num: "02", title: "ادعُ فريقك", desc: "أرسل دعوات بريد إلكتروني بنقرة واحدة. يحدد أعضاء الفريق كلمات المرور الخاصة بهم." },
        { num: "03", title: "ثبّت موظفي الذكاء الاصطناعي", desc: "تصفح السوق وثبّت وكلاء الذكاء الاصطناعي لأدوارك بنقرة واحدة." },
        { num: "04", title: "عيّن ونفّذ", desc: "عيّن المهام للبشر أو الذكاء الاصطناعي. ينفذ موظفو الذكاء الاصطناعي ويقدمون نتائج منظمة فوراً." },
      ],
    },
    pricing: {
      badge: "الأسعار",
      title: "ابدأ مجاناً، وسّع عند الاستعداد",
      subtitle: "لا رسوم مخفية. لا يلزم بطاقة ائتمانية للبدء.",
      plans: [
        {
          name: "النسخة التجريبية المجانية",
          price: "$0",
          period: "للأبد",
          desc: "مثالي للفرق الصغيرة للبدء",
          features: ["حتى 5 أعضاء فريق", "3 مشاريع", "10 مهام ذكاء اصطناعي شهرياً", "تحليلات أساسية", "دعم بالبريد الإلكتروني"],
          cta: "ابدأ مجاناً",
          highlighted: false,
        },
        {
          name: "النمو",
          price: "$29",
          period: "شهرياً",
          desc: "للفرق المتنامية التي تحتاج مزيداً من القوة",
          features: ["حتى 20 عضواً", "مشاريع غير محدودة", "100 مهمة ذكاء اصطناعي شهرياً", "تقارير وتحليلات كاملة", "دعم أولوي", "تصدير CSV"],
          cta: "ابدأ تجربة مجانية",
          highlighted: true,
          badge: "الأكثر شيوعاً",
        },
        {
          name: "الأعمال",
          price: "$79",
          period: "شهرياً",
          desc: "للشركات التي تعمل بالذكاء الاصطناعي",
          features: ["أعضاء فريق غير محدودين", "كل شيء غير محدود", "500 مهمة ذكاء اصطناعي شهرياً", "وكلاء ذكاء اصطناعي مخصصون", "دعم مخصص", "خيار العلامة البيضاء"],
          cta: "تواصل معنا",
          highlighted: false,
        },
      ],
    },
    testimonials: {
      badge: "المستخدمون الأوائل",
      title: "الفرق تحب العمل مع موظفي الذكاء الاصطناعي",
      items: [
        { name: "أحمد الراشد", role: "الرئيس التنفيذي، تك ستارت العربية", text: "مدير الموارد البشرية بالذكاء الاصطناعي يتعامل مع جميع أوراق التوظيف تلقائياً. وفّر لنا 15 ساعة أسبوعياً.", avatar: "أ", color: "bg-blue-500" },
        { name: "سارة خليل", role: "مدير العمليات", text: "أخيراً أداة إدارة تفهم كيفية عمل الشركات العربية. دعم اللغتين مثالي.", avatar: "س", color: "bg-purple-500" },
        { name: "محمد حسن", role: "المؤسس، كونسلت كو", text: "مدير المبيعات بالذكاء الاصطناعي يولد مقترحات العملاء في ثوانٍ. ارتفع معدل التحويل لدينا بنسبة 40٪.", avatar: "م", color: "bg-emerald-500" },
      ],
    },
    cta: {
      title: "هل أنت مستعد لبناء شركتك المدعومة بالذكاء الاصطناعي؟",
      subtitle: "انضم إلى مئات الشركات التي تستخدم موظفي الذكاء الاصطناعي للعمل بشكل أذكى.",
      button: "ابدأ مجاناً",
      sub: "الإعداد يستغرق أقل من دقيقتين",
    },
    footer: {
      tagline: "مستقبل إدارة الشركات هنا.",
      links: ["المميزات", "الأسعار", "تسجيل الدخول", "التسجيل"],
      copy: "© 2025 منصة CMS. جميع الحقوق محفوظة.",
    },
  },
};

// ─── Animated counter ─────────────────────────────────────────────────────────
function useInView(ref: React.RefObject<HTMLElement>) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref]);
  return inView;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LandingPage() {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const t = CONTENT[lang];

  const featuresRef = useRef<HTMLElement>(null);
  const howRef = useRef<HTMLElement>(null);
  const pricingRef = useRef<HTMLElement>(null);
  const featuresInView = useInView(featuresRef as React.RefObject<HTMLElement>);
  const howInView = useInView(howRef as React.RefObject<HTMLElement>);
  const pricingInView = useInView(pricingRef as React.RefObject<HTMLElement>);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div
      dir={t.dir}
      className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden"
      style={{ fontFamily: lang === "ar" ? "'Cairo', 'Tajawal', sans-serif" : "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Cairo:wght@400;600;700;800&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes glow { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }
        .fade-up { animation: fadeUp 0.7s ease forwards; opacity: 0; }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        .delay-4 { animation-delay: 0.4s; }
        .float { animation: float 4s ease-in-out infinite; }
        .glow { animation: glow 2s ease-in-out infinite; }
        .glass { background: rgba(255,255,255,0.04); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.08); }
        .gradient-text { background: linear-gradient(135deg, #818cf8, #c084fc, #f472b6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .hero-glow { background: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.3), transparent); }
        .card-hover { transition: all 0.3s ease; }
        .card-hover:hover { transform: translateY(-4px); background: rgba(255,255,255,0.07); }
        .in-view { animation: fadeUp 0.6s ease forwards; opacity: 0; }
      `}</style>

      {/* ── Navbar ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass shadow-xl shadow-black/20" : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">CMS Platform</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: t.nav.features, href: "#features" },
              { label: t.nav.howItWorks, href: "#how" },
              { label: t.nav.pricing, href: "#pricing" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-gray-400 hover:text-white transition-colors font-medium"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Lang toggle */}
            <button
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg glass transition-all"
            >
              <Globe className="h-3.5 w-3.5" />
              {lang === "en" ? "العربية" : "English"}
            </button>

            <Link
              href="/login"
              className="text-sm text-gray-400 hover:text-white transition-colors font-medium px-4"
            >
              {t.nav.login}
            </Link>

            <Link
              href="/register-company"
              className="flex items-center gap-1.5 text-sm font-semibold px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white transition-all shadow-lg shadow-indigo-900/40"
            >
              {t.nav.getStarted}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden glass border-t border-white/5 px-6 py-4 space-y-3">
            {[t.nav.features, t.nav.howItWorks, t.nav.pricing].map((item) => (
              <a
                key={item}
                href="#"
                className="block text-sm text-gray-300 hover:text-white py-2"
                onClick={() => setMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setLang(lang === "en" ? "ar" : "en")}
                className="text-xs text-gray-400 glass px-3 py-1.5 rounded-lg"
              >
                {lang === "en" ? "العربية" : "English"}
              </button>
              <Link href="/login" className="text-sm text-gray-300">
                {t.nav.login}
              </Link>
            </div>
            <Link
              href="/register-company"
              className="block text-center text-sm font-semibold px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
            >
              {t.nav.getStarted}
            </Link>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Background effects */}
        <div className="hero-glow absolute inset-0 pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-indigo-400/40 rounded-full glow"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 20}%`,
              animationDelay: `${i * 0.7}s`,
            }}
          />
        ))}

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="fade-up inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-indigo-300 mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            {t.hero.badge}
          </div>

          {/* Headline */}
          <h1 className="fade-up delay-1 text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6">
            <span className="text-white">{t.hero.title}</span>
            <br />
            <span className="gradient-text">{t.hero.titleAccent}</span>
          </h1>

          {/* Subtitle */}
          <p className="fade-up delay-2 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
            {t.hero.subtitle}
          </p>

          {/* CTAs */}
          <div className="fade-up delay-3 flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/register-company"
              className="group flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-lg shadow-xl shadow-indigo-900/40 transition-all hover:scale-105"
            >
              {t.hero.cta}
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Check className="h-4 w-4 text-green-400" />
              {t.hero.ctaSub}
            </div>
          </div>

          {/* Stats */}
          <div className="fade-up delay-4 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {t.hero.stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-extrabold gradient-text">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1 leading-tight">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Dashboard preview */}
          <div className="mt-20 relative float">
            <div className="glass rounded-2xl p-1 shadow-2xl shadow-indigo-900/30 max-w-3xl mx-auto">
              <div className="bg-gray-900 rounded-xl overflow-hidden">
                {/* Fake browser bar */}
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-800/80 border-b border-white/5">
                  <span className="w-3 h-3 rounded-full bg-red-500/70" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <span className="w-3 h-3 rounded-full bg-green-500/70" />
                  <div className="flex-1 mx-4 bg-gray-700/50 rounded-md px-3 py-1 text-xs text-gray-500 text-left">
                    app.cmsplatform.com/dashboard
                  </div>
                </div>

                {/* Fake dashboard */}
                <div className="p-6 grid grid-cols-4 gap-3">
                  {[
                    { label: "Departments", value: "8", color: "bg-purple-500/20 border-purple-500/30" },
                    { label: "Employees", value: "47", color: "bg-blue-500/20 border-blue-500/30" },
                    { label: "AI Agents", value: "12", color: "bg-violet-500/20 border-violet-500/30" },
                    { label: "Tasks Done", value: "234", color: "bg-green-500/20 border-green-500/30" },
                  ].map((card) => (
                    <div key={card.label} className={`rounded-xl border p-3 ${card.color}`}>
                      <p className="text-2xl font-bold text-white">{card.value}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{card.label}</p>
                    </div>
                  ))}
                </div>

                <div className="px-6 pb-6">
                  <div className="bg-gray-800/60 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/30 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-violet-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-300 font-medium">Sara (AI HR Manager)</p>
                      <p className="text-[10px] text-gray-500">Just completed: Generate Q2 hiring plan...</p>
                    </div>
                    <span className="text-[10px] text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                      Done ✓
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section
        id="features"
        ref={featuresRef as React.RefObject<HTMLElement>}
        className="py-28 relative"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className={`text-center mb-16 ${featuresInView ? "in-view" : "opacity-0"}`}>
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-indigo-300 mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              {t.features.badge}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{t.features.title}</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">{t.features.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {t.features.items.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={`glass card-hover rounded-2xl p-6 ${featuresInView ? "in-view" : "opacity-0"}`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how" ref={howRef as React.RefObject<HTMLElement>} className="py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/10 to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6">
          <div className={`text-center mb-16 ${howInView ? "in-view" : "opacity-0"}`}>
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-indigo-300 mb-4">
              <Clock className="h-3.5 w-3.5" />
              {t.howItWorks.badge}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white">{t.howItWorks.title}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {t.howItWorks.steps.map((step, i) => (
              <div
                key={step.num}
                className={`glass card-hover rounded-2xl p-6 flex items-start gap-5 ${howInView ? "in-view" : "opacity-0"}`}
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center">
                  <span className="text-2xl font-black text-white/80">{step.num}</span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg mb-1">{step.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" ref={pricingRef as React.RefObject<HTMLElement>} className="py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className={`text-center mb-16 ${pricingInView ? "in-view" : "opacity-0"}`}>
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-indigo-300 mb-4">
              <Award className="h-3.5 w-3.5" />
              {t.pricing.badge}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{t.pricing.title}</h2>
            <p className="text-gray-400 text-lg">{t.pricing.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {t.pricing.plans.map((plan, i) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-6 flex flex-col ${pricingInView ? "in-view" : "opacity-0"}
                  ${plan.highlighted
                    ? "bg-gradient-to-b from-indigo-600/30 to-violet-600/20 border-2 border-indigo-500/50 shadow-xl shadow-indigo-900/30"
                    : "glass"
                  }`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {"badge" in plan && plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="font-bold text-white text-lg mb-1">{plan.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{plan.desc}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">{plan.price}</span>
                    <span className="text-gray-400 text-sm">/{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-gray-300">
                      <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register-company"
                  className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all
                    ${plan.highlighted
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-900/40"
                      : "glass hover:bg-white/10 text-white"
                    }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-indigo-300 mb-4">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              {t.testimonials.badge}
            </div>
            <h2 className="text-4xl font-bold text-white">{t.testimonials.title}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {t.testimonials.items.map((item) => (
              <div key={item.name} className="glass card-hover rounded-2xl p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-5">&quot;{item.text}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${item.color} flex items-center justify-center text-white font-bold text-sm`}>
                    {item.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{item.name}</p>
                    <p className="text-gray-500 text-xs">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-28">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="glass rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-violet-600/20 pointer-events-none" />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-900/40">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t.cta.title}</h2>
              <p className="text-gray-400 text-lg mb-8">{t.cta.subtitle}</p>
              <Link
                href="/register-company"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-lg shadow-xl shadow-indigo-900/40 transition-all hover:scale-105"
              >
                {t.cta.button}
                <ArrowRight className="h-5 w-5" />
              </Link>
              <p className="text-gray-500 text-sm mt-4">{t.cta.sub}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-white">CMS Platform</span>
            <span className="text-gray-600 text-sm mx-2">·</span>
            <span className="text-gray-500 text-sm">{t.footer.tagline}</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm text-gray-500 hover:text-white transition-colors">
              {t.nav.login}
            </Link>
            <Link href="/register-company" className="text-sm text-gray-500 hover:text-white transition-colors">
              {t.nav.getStarted}
            </Link>
            <button
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className="text-sm text-gray-500 hover:text-white transition-colors flex items-center gap-1"
            >
              <Globe className="h-3.5 w-3.5" />
              {lang === "en" ? "العربية" : "English"}
            </button>
          </div>
        </div>
        <div className="text-center mt-6">
          <p className="text-gray-600 text-xs">{t.footer.copy}</p>
        </div>
      </footer>
    </div>
  );
}
