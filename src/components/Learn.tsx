'use client'

import { motion } from 'framer-motion'
import { learningModules } from '@/lib/data'
import { FaExternalLinkAlt, FaGraduationCap } from 'react-icons/fa'

export default function Learn() {
  // Group modules by category
  const groupedModules = learningModules.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = []
    }
    acc[module.category].push(module)
    return acc
  }, {} as Record<string, typeof learningModules>)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'
      case 'Advanced':
        return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
      default:
        return 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
    }
  }

  return (
    <section className="min-h-screen py-20 bg-gradient-to-br from-gray-50 to-primary-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            Learning Hub
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-primary-600 to-accent-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            Interactive learning modules for mastering databases, SQL, and data engineering concepts
          </p>
        </motion.div>

        {Object.entries(groupedModules).map(([category, categoryModules], categoryIndex) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 flex items-center gap-3">
              <FaGraduationCap className="text-primary-600" />
              {category}
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryModules.map((module, index) => (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: (categoryIndex * 0.1) + (index * 0.1) }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 dark:border-gray-700"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{module.icon}</span>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                            {module.name}
                          </h3>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${getDifficultyColor(module.difficulty)}`}>
                            {module.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 mb-4 min-h-[60px]">
                      {module.description}
                    </p>

                    {module.topics && module.topics.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Topics covered:</p>
                        <div className="flex flex-wrap gap-2">
                          {module.topics.slice(0, 5).map((topic) => (
                            <span
                              key={topic}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs"
                            >
                              {topic}
                            </span>
                          ))}
                          {module.topics.length > 5 && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                              +{module.topics.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <a
                      href={module.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg hover:from-primary-700 hover:to-accent-700 transition-all duration-300 font-medium w-full justify-center"
                    >
                      <FaExternalLinkAlt size={14} />
                      Start Learning
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}

        {learningModules.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <FaGraduationCap className="text-6xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Learning modules coming soon...
            </p>
          </motion.div>
        )}
      </div>
    </section>
  )
}
