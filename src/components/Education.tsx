'use client'

import { motion } from 'framer-motion'
import { education } from '@/lib/data'
import { FaGraduationCap, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa'

export default function Education() {
  return (
    <section
      id="education"
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
            Education
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary-600 to-accent-600 mx-auto"></div>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className={`grid gap-8 ${education.length === 1 ? 'md:grid-cols-1 justify-items-center' : 'md:grid-cols-2'}`}>
            {education.map((edu, index) => (
              <motion.div
                key={edu.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${education.length === 1 ? 'max-w-md w-full' : ''}`}
              >
                <div className="flex items-start mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-accent-600 rounded-lg flex items-center justify-center mr-4">
                    <FaGraduationCap className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">
                      {edu.degree}
                    </h3>
                    <p className="text-primary-600 font-semibold mb-2">
                      {edu.field}
                    </p>
                    <p className="text-lg font-medium text-gray-700 mb-3">
                      {edu.institution}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-2 text-primary-600" size={14} />
                    {edu.duration}
                  </div>
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-primary-600" size={14} />
                    {edu.location}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

