'use client'

import { motion } from 'framer-motion'
import { skills } from '@/lib/data'

const categoryColors: Record<string, string> = {
  Languages: 'from-primary-500 to-primary-600',
  Frameworks: 'from-accent-500 to-accent-600',
  Tools: 'from-secondary-500 to-secondary-600',
  Other: 'from-gray-500 to-gray-600',
  'Support Engineering': 'from-emerald-500 to-emerald-600',
  'Support Manager': 'from-blue-500 to-blue-600',
  'Product Manager': 'from-purple-500 to-purple-600',
}

export default function Skills() {
  const skillsByCategory = {
    'Product Manager': skills.filter((s) => s.category === 'Product Manager'),
    'Support Manager': skills.filter((s) => s.category === 'Support Manager'),
    'Support Engineering': skills.filter((s) => s.category === 'Support Engineering'),
    Languages: skills.filter((s) => s.category === 'Languages'),
    Frameworks: skills.filter((s) => s.category === 'Frameworks'),
    Tools: skills.filter((s) => s.category === 'Tools'),
  }

  return (
    <section
      id="skills"
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
                <h3 className="text-2xl font-bold text-gray-800 mb-6 capitalize">
                  {category}
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {categorySkills.map((skill, index) => (
                    <div key={skill.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-700">
                          {skill.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {skill.level}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
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

