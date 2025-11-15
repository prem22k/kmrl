import React from 'react';
import { Sparkles, Github, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-20 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 text-white">
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 backdrop-blur-sm rounded-xl">
                <Sparkles className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold">KMRL Document Automation</h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Smart document processing powered by AI. Streamline your workflow with intelligent categorization and instant analysis.
            </p>
            <div className="flex gap-3">
              <a
                href="https://github.com/prem22k"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors duration-300"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors duration-300"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="mailto:contact@example.com"
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors duration-300"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="hover:text-white transition-colors cursor-pointer">🤖 AI-Powered Analysis</li>
              <li className="hover:text-white transition-colors cursor-pointer">📊 Smart Categorization</li>
              <li className="hover:text-white transition-colors cursor-pointer">⚡ Instant Processing</li>
              <li className="hover:text-white transition-colors cursor-pointer">🔒 Secure Storage</li>
              <li className="hover:text-white transition-colors cursor-pointer">📱 Responsive Design</li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Built With</h4>
            <div className="flex flex-wrap gap-2">
              {['React', 'Node.js', 'Express', 'MongoDB', 'Gemini AI', 'Tesseract OCR', 'Tailwind CSS'].map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium hover:bg-white/20 transition-colors cursor-default"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>
              © {currentYear} KMRL Document Automation. Built for <span className="text-blue-400 font-semibold">Smart India Hackathon 2025</span>
            </p>
            <p className="flex items-center gap-2">
              Made with <span className="text-red-400 animate-pulse">❤️</span> by{' '}
              <a href="https://github.com/prem22k" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Prem Sai Kota
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
    </footer>
  );
};

export default Footer;
