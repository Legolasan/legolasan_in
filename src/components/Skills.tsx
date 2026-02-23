'use client'

import { motion } from 'framer-motion'
import { skills } from '@/lib/data'

const categoryColors: Record<string, string> = {
  'Cloud & Data': 'from-primary-500 to-primary-600',
  'AI & Automation': 'from-accent-500 to-accent-600',
  Operations: 'from-emerald-500 to-emerald-600',
  Leadership: 'from-purple-500 to-purple-600',
}

export default function Skills() {
  const skillsByCategory = {
    Operations: skills.filter((s) => s.category === 'Operations'),
    Leadership: skills.filter((s) => s.category === 'Leadership'),
    'Cloud & Data': skills.filter((s) => s.category === 'Cloud & Data'),
    'AI & Automation': skills.filter((s) => s.category === 'AI & Automation'),
  }

  return (
    <section
      id="skills"
      className="py-20 bg-white dark:bg-gray-900"
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
            Skills & Technologies
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary-600 to-accent-600 mx-auto"></div>
        </motion.div>

        <div className="max-w-6xl mx-auto space-y-12">
          {Object.entries(skillsByCategory).map(([category, categorySkills]) => {
            if (categorySkills.length === 0) return null
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 capitalize">
                  {category}
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {categorySkills.map((skill, index) => (
                    <div key={skill.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                          {skill.name}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {skill.level}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.level}%` }}
                          viewport={{ once: true }}
                          transition={{
                            duration: 1,
                            delay: index * 0.1,
                            ease: 'easeOut',
                          }}
                          className={`h-full bg-gradient-to-r ${categoryColors[skill.category]} rounded-full`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

