import { useState, useEffect } from "react";
import SEO from "../components/SEO";

export default function LandingPage({ onGetStarted }) {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const testimonials = [
    {
      name: "Brian M.",
      location: "Nairobi, Kenya",
      role: "Software Developer",
      image: "👨‍💻",
      text: "PesaPlan helped me realize I was wasting 40% of my salary on transport and food. Now I save KES 8,000 every month!",
      savings: "KES 48,000 saved in 6 months",
      rating: 5,
      icon: "💚"
    },
    {
      name: "Sarah W.",
      location: "Kampala, Uganda",
      role: "Teacher",
      image: "👩‍🏫",
      text: "The survival days counter changed my life. I can finally plan my month without anxiety about running out before payday.",
      savings: "Reduced debt by KES 35,000",
      rating: 5,
      icon: "🌟"
    },
    {
      name: "James O.",
      location: "Lagos, Nigeria",
      role: "Freelance Designer",
      image: "🎨",
      text: "Black tax was eating my income until PesaPlan helped me budget for it properly. Now I help family AND save every month.",
      savings: "Saving 25% monthly",
      rating: 5,
      icon: "🎯"
    },
    {
      name: "Mary A.",
      location: "Dar es Salaam, Tanzania",
      role: "Recent Graduate",
      image: "🎓",
      text: "As a fresh grad, managing HELB and rent seemed impossible. PesaPlan made it simple. I've never felt this in control.",
      savings: "Paid off 6 months of HELB early",
      rating: 5,
      icon: "📚"
    },
    {
      name: "Peter K.",
      location: "Accra, Ghana",
      role: "Small Business Owner",
      image: "👔",
      text: "The 'Can I Afford This?' feature stops me from impulse buying. My business profits are up 40% since using PesaPlan.",
      savings: "Increased profits by 40%",
      rating: 5,
      icon: "🚀"
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const elements = document.querySelectorAll('.fade-on-scroll');
      elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight - 100;
        setIsVisible(prev => ({ ...prev, [el.id]: isVisible }));
      });
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Auto-scroll testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const features = [
    {
      icon: "📊",
      bg: "from-blue-500/10 to-blue-600/5",
      border: "border-blue-200 dark:border-blue-800/30",
      title: "Survival Days Counter",
      desc: "Know exactly how many days your money lasts before payday.",
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      icon: "🚨",
      bg: "from-rose-500/10 to-rose-600/5",
      border: "border-rose-200 dark:border-rose-800/30",
      title: "Overspending Alerts",
      desc: "Get warned before you overspend on essentials or obligations.",
      color: "text-rose-600 dark:text-rose-400",
    },
    {
      icon: "🎯",
      bg: "from-emerald-500/10 to-emerald-600/5",
      border: "border-emerald-200 dark:border-emerald-800/30",
      title: "Savings Goals",
      desc: "Track emergency funds, travel, gadgets and more.",
      color: "text-emerald-600 dark:text-emerald-400",
    },
    {
      icon: "💡",
      bg: "from-amber-500/10 to-amber-600/5",
      border: "border-amber-200 dark:border-amber-800/30",
      title: "Can I Afford This?",
      desc: "Instantly see the impact of purchases on your budget.",
      color: "text-amber-600 dark:text-amber-400",
    },
    {
      icon: "📈",
      bg: "from-purple-500/10 to-purple-600/5",
      border: "border-purple-200 dark:border-purple-800/30",
      title: "Financial Health Score",
      desc: "A clear score showing your financial stability this month.",
      color: "text-purple-600 dark:text-purple-400",
    },
  ];

  return (
    <>
      <SEO 
        title="Smart Financial Management for Africa"
        description="Take control of your finances with PesaPlan. Track expenses, manage budgets, pay bills, and achieve savings goals. Used by 4,200+ Africans. 100% free forever!"
        keywords="personal finance, budgeting app, expense tracker, savings goals, African finance, money management, Kenya, Uganda, Tanzania, Nigeria, Ghana, HELB, black tax"
        type="website"
        image="https://my-money-ra6z.onrender.com/og-image.png"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 overflow-x-hidden">
        
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div 
            className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-amber-500/10 to-rose-500/10 rounded-full blur-3xl"
            style={{ transform: `translate(${mousePosition.x * 50}px, ${mousePosition.y * 50}px)` }}
          ></div>
        </div>

        {/* Hero Section */}
        <section className="relative max-w-6xl mx-auto px-4 pt-16 pb-12 text-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-400 rounded-full mb-8 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              🇰🇪 Built for African Professionals
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600 dark:from-white dark:via-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
              Don't run out <br />
              of money <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">again.</span>
            </h1>

            <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              PesaPlan helps interns, grads, freelancers and low-income earners manage
              rent, HELB, black tax and daily spending — so your money lasts the whole month.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <button
                onClick={onGetStarted}
                className="group relative px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95"
              >
                <span className="relative z-10">Start for Free →</span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>

            <p className="mt-4 text-xs text-gray-500 dark:text-gray-500 flex items-center justify-center gap-2">
              <span>✅</span> No credit card <span className="w-1 h-1 bg-gray-400 rounded-full"></span> No nonsense <span className="w-1 h-1 bg-gray-400 rounded-full"></span> Just control
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="relative max-w-4xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="group bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-200/50 dark:border-gray-800/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent mb-2">87%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">of users avoid panic spending</div>
              <div className="mt-3 text-xs text-gray-500">+23% vs last month</div>
            </div>

            <div className="group bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-200/50 dark:border-gray-800/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-2">4.2K+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">active users</div>
              <div className="mt-3 text-xs text-gray-500">Growing rapidly in East Africa</div>
            </div>

            <div className="group bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-200/50 dark:border-gray-800/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-rose-500 bg-clip-text text-transparent mb-2">KES 0</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">completely free</div>
              <div className="mt-3 text-xs text-gray-500">Always free. Forever.</div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need to <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">succeed</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Powerful features designed specifically for African financial realities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="group bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer fade-on-scroll"
                id={`feature-${i}`}
                style={{
                  transform: isVisible[`feature-${i}`] ? 'translateY(0)' : 'translateY(30px)',
                  opacity: isVisible[`feature-${i}`] ? 1 : 0,
                  transition: `all 0.6s ease-out ${i * 0.1}s`
                }}
              >
                <div className={`w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br ${f.bg} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-2xl">{f.icon}</span>
                </div>
                <h3 className={`font-bold text-lg mb-2 ${f.color}`}>{f.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonial Carousel Section */}
        <section className="relative max-w-5xl mx-auto px-4 py-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Loved by <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">thousands</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Join our community of financially empowered Africans
            </p>
          </div>

          <div className="relative">
            {/* Carousel Container */}
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
              >
                {testimonials.map((testimonial, idx) => (
                  <div key={idx} className="w-full flex-shrink-0 px-4">
                    <div className="bg-gradient-to-br from-gray-50/90 to-white/90 dark:from-gray-900/90 dark:to-gray-950/90 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-800/50 shadow-xl">
                      <div className="flex flex-col md:flex-row gap-8 items-center">
                        <div className="flex-1 text-center md:text-left">
                          <div className="text-6xl mb-4">{testimonial.icon}</div>
                          <div className="flex mb-4 justify-center md:justify-start">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <span key={i} className="text-yellow-400 text-lg">★</span>
                            ))}
                          </div>
                          <p className="text-lg italic text-gray-700 dark:text-gray-300 leading-relaxed">
                            "{testimonial.text}"
                          </p>
                          <div className="mt-6">
                            <div className="font-bold text-gray-900 dark:text-white text-lg">
                              {testimonial.name}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {testimonial.role} • {testimonial.location}
                            </div>
                            <div className="mt-2 inline-block px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs rounded-full font-semibold">
                              💰 {testimonial.savings}
                            </div>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="w-28 h-28 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full flex items-center justify-center text-4xl shadow-lg">
                            {testimonial.image}
                          </div>
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm animate-pulse">
                            ✓
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={prevTestimonial}
              className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 md:-ml-6 w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all duration-300 border border-gray-200 dark:border-gray-700"
            >
              <span className="text-xl">←</span>
            </button>
            
            <button
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 -translate-y-1/2 -mr-2 md:-mr-6 w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all duration-300 border border-gray-200 dark:border-gray-700"
            >
              <span className="text-xl">→</span>
            </button>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentTestimonial(idx)}
                  className={`transition-all duration-300 rounded-full ${
                    currentTestimonial === idx
                      ? 'w-8 h-2 bg-gradient-to-r from-emerald-500 to-teal-500'
                      : 'w-2 h-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>

            {/* Auto-scroll indicator */}
            <div className="text-center mt-4">
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Auto-scrolling • {currentTestimonial + 1} of {testimonials.length}
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="relative max-w-4xl mx-auto px-4 py-12 mb-12">
          <div className="relative overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 animate-gradient-x"></div>
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative p-8 md:p-12 text-center text-white">
              <h3 className="text-3xl md:text-4xl font-bold mb-3">
                Your money. Your future.
              </h3>
              <p className="text-lg opacity-95 mb-6 max-w-md mx-auto">
                Join thousands of Africans taking control of their finances today.
              </p>
              
              <button
                onClick={onGetStarted}
                className="group relative px-8 py-3 bg-white text-gray-900 font-semibold rounded-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 active:scale-95 overflow-hidden"
              >
                <span className="relative z-10">Create Free Account →</span>
                <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              
              <p className="text-xs opacity-80 mt-4">
                🚀 Join 4,200+ users • ⭐ Rated 4.9/5 • 💯 100% Free
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative border-t border-gray-200/50 dark:border-gray-800/50 py-8">
          <div className="max-w-6xl mx-auto px-4 text-center text-xs text-gray-500 dark:text-gray-400">
            <p>© 2024 PesaPlan. Empowering African financial freedom.</p>
            <p className="mt-2">Made with 💚 for interns, grads, and hustlers</p>
          </div>
        </footer>

        {/* Custom Animations */}
        <style jsx>{`
          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes gradient-x {
            0%, 100% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
          }
          
          .animate-fade-in-up {
            animation: fade-in-up 0.8s ease-out;
          }
          
          .animate-gradient-x {
            animation: gradient-x 3s ease infinite;
            background-size: 200% 200%;
          }
          
          @keyframes ping {
            75%, 100% {
              transform: scale(2);
              opacity: 0;
            }
          }
          
          .delay-1000 {
            animation-delay: 1s;
          }
        `}</style>
      </div>
    </>
  );
}
