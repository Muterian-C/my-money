import { useState } from "react";

export default function Footer() {
  const [currentYear] = useState(new Date().getFullYear());
  
  return (
    <footer className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-800/50 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Column */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">P</span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                Pesa<span className="text-emerald-500">Plan</span>
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Take control of your finances with PesaPlan. Built for African professionals, freelancers, and students.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Quick Links</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-emerald-500 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-emerald-500 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-emerald-500 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-emerald-500 transition-colors">
                  Contact Support
                </a>
              </li>
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Resources</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-emerald-500 transition-colors">
                  Financial Tips
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-emerald-500 transition-colors">
                  Budgeting Guide
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-emerald-500 transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-emerald-500 transition-colors">
                  Blog
                </a>
              </li>
            </ul>
          </div>
          
          {/* Contact & Social */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Connect With Us</h3>
            <div className="flex gap-3 mb-3">
              <a href="#" className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-emerald-500 hover:text-white transition-all">
                <span className="text-sm">🐦</span>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-emerald-500 hover:text-white transition-all">
                <span className="text-sm">📘</span>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-emerald-500 hover:text-white transition-all">
                <span className="text-sm">📷</span>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-emerald-500 hover:text-white transition-all">
                <span className="text-sm">💼</span>
              </a>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              📧 muteriandevs@gmail.com
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              📞 +254 715 055017
            </p>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-800/50 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © {currentYear} PesaPlan. All rights reserved. Made with 💚 for Africa.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Version 2.0.0 | Empowering financial freedom across Kenya, Uganda, Tanzania, Nigeria & beyond
          </p>
          <div className="mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-800/50 text-center">  
          </div>
          <div className="mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-800/50 text-center">  
          </div>
        </div>
      </div>
    </footer>
  );
}
