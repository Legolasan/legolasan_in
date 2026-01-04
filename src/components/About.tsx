'use client'

import { motion } from 'framer-motion'
import { personalInfo } from '@/lib/data'

export default function About() {
  return (
    <section
      id="about"
      className="py-20 bg-white"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            About Me
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary-600 to-accent-600 mx-auto"></div>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative w-full aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-accent-400 rounded-3xl transform rotate-6"></div>
                <div className="relative bg-gray-200 rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src="/images/profile.jpeg"
                    alt={personalInfo.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                  <div className="hidden w-full h-full bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center text-6xl font-bold text-gray-400">
                    {personalInfo.name.charAt(0)}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <p className="text-lg text-gray-700 leading-relaxed">
                {personalInfo.bio}
              </p>
              {personalInfo.bioExtended?.map((paragraph, index) => (
                <p key={index} className="text-lg text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600">10+</div>
                  <div className="text-gray-600">Years Experience</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-accent-50 to-accent-100 rounded-lg">
                  <div className="text-2xl font-bold text-accent-600">50+</div>
                  <div className="text-gray-600">Connectors Shipped</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-lg">
                  <div className="text-2xl font-bold text-secondary-600">95%+</div>
                  <div className="text-gray-600">SLA Coverage</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-primary-50 to-accent-50 rounded-lg">
                  <div className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                    90%+
                  </div>
                  <div className="text-gray-600">CSAT Score</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

