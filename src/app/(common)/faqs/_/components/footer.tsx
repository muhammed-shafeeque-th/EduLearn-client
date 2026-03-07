'use client';

import { motion } from 'framer-motion';
import { Facebook, Instagram, Linkedin, Twitter, Youtube, Apple, Play } from 'lucide-react';

export function Footer() {
  const footerSections = {
    'TOP 4 CATEGORY': [
      { label: 'Development', href: '/category/development' },
      { label: 'Finance & Accounting', href: '/category/finance' },
      { label: 'Design', href: '/category/design' },
      { label: 'Business', href: '/category/business' },
    ],
    'QUICK LINKS': [
      { label: 'About', href: '/about' },
      { label: 'Become Instructor', href: '/become-instructor' },
      { label: 'Contact', href: '/contact' },
      { label: 'Career', href: '/career' },
    ],
    SUPPORT: [
      { label: 'Help Center', href: '/help' },
      { label: 'FAQs', href: '/faqs' },
      { label: 'Terms & Condition', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
    ],
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo & Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">E</span>
              </div>
              <span className="text-2xl font-bold">EduLearn</span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Aliquam rhoncus ligula est, non pulvinar elit convallis nec. Donec mattis odio at.
            </p>

            {/* Social Links */}
            <div className="flex space-x-4">
              {[
                { icon: Facebook, href: '#' },
                { icon: Instagram, href: '#' },
                { icon: Linkedin, href: '#' },
                { icon: Twitter, href: '#' },
                { icon: Youtube, href: '#' },
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  whileHover={{ scale: 1.1 }}
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors"
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Footer Links */}
          {Object.entries(footerSections).map(([title, links], sectionIndex) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
            >
              <h3 className="text-lg font-semibold mb-4">{title}</h3>
              <ul className="space-y-2">
                {links.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-orange-500 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Download App */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3 className="text-lg font-semibold mb-4">DOWNLOAD OUR APP</h3>
            <div className="space-y-3">
              <motion.a
                href="#"
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-3 bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition-colors"
              >
                <Apple className="w-6 h-6" />
                <div>
                  <div className="text-xs text-gray-400">Download on the</div>
                  <div className="font-semibold">App Store</div>
                </div>
              </motion.a>

              <motion.a
                href="#"
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-3 bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition-colors"
              >
                <Play className="w-6 h-6" />
                <div>
                  <div className="text-xs text-gray-400">Get it on</div>
                  <div className="font-semibold">Play Store</div>
                </div>
              </motion.a>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center"
        >
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2024 . Designed by Templatecookie. All rights reserved
          </div>
          <div className="flex items-center space-x-4">
            <select className="bg-gray-800 text-white px-3 py-1 rounded border border-gray-700">
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
            </select>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
