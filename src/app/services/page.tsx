'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { FaGlobe, FaTools, FaDatabase, FaArrowLeft, FaRocket, FaCheck } from 'react-icons/fa'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ServiceInquiryModal from '@/components/ServiceInquiryModal'

export type ServiceType = 'website' | 'tool' | 'etl'

interface Service {
  id: ServiceType
  title: string
  subtitle: string
  description: string
  icon: React.ReactNode
  features: string[]
  gradient: string
}

const services: Service[] = [
  {
    id: 'website',
    title: 'Website Building',
    subtitle: 'Custom Web Solutions',
    description: 'From sleek portfolios to full-featured web applications. I build responsive, performant websites that make an impact.',
    icon: <FaGlobe size={32} />,
    features: [
      'Custom Design & Development',
      'Responsive & Mobile-First',
      'SEO Optimized',
      'CMS Integration',
      'E-commerce Solutions',
      'Performance Optimization',
    ],
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'tool',
    title: 'Tool Building',
    subtitle: 'Custom Applications',
    description: 'Automation tools, internal dashboards, and custom applications tailored to your specific workflow needs.',
    icon: <FaTools size={32} />,
    features: [
      'Process Automation',
      'Internal Dashboards',
      'API Development',
      'Desktop & Mobile Apps',
      'Third-party Integrations',
      'Data Visualization',
    ],
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    id: 'etl',
    title: 'ETL Integration',
    subtitle: 'Data Pipeline Solutions',
    description: 'Seamless data integration between your systems. Custom connectors for enterprise tools and real-time sync solutions.',
    icon: <FaDatabase size={32} />,
    features: [
      'Custom Connectors',
      'Enterprise Tool Integration',
      'Real-time Data Sync',
      'Data Transformation',
      'Error Handling & Recovery',
      'Compliance & Security',
    ],
    gradient: 'from-orange-500 to-red-500',
  },
]

export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Check if services feature is enabled
  const isServicesEnabled = process.env.NEXT_PUBLIC_ENABLE_SERVICES === 'true'

  const handleGetStarted = (serviceId: ServiceType) => {
    setSelectedService(serviceId)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedService(null)
  }

  // Show message if services are disabled
  if (!isServicesEnabled) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Header />
        <div className="flex items-center justify-center min-h-screen px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl text-center"
          >
            <div className="text-6xl mb-6">🚧</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary-600 via-accent-600 to-secondary-600 bg-clip-text text-transparent">
              Services Currently Unavailable
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              I'm not accepting new service inquiries at the moment. Please check back later or reach out via the contact form for general inquiries.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-semibold"
            >
              <FaArrowLeft className="mr-2" />
              Back to Portfolio
            </Link>
          </motion.div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-4"
          >
            <Link
              href="/"
              className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-6 transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              Back to Portfolio
            </Link>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary-600 via-accent-600 to-secondary-600 bg-clip-text text-transparent">
              Services
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
              Transforming ideas into reality with custom-built solutions. 
              Whether you need a stunning website, powerful tools, or seamless data integrations.
            </p>
            <div className="flex items-center justify-center space-x-2 text-primary-600 dark:text-primary-400">
              <FaRocket />
              <span className="font-medium">Let's build something amazing together</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                className="group"
              >
                <div className="h-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700">
                  {/* Service Header */}
                  <div className={`p-6 bg-gradient-to-r ${service.gradient} text-white`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                        {service.icon}
                      </div>
                      <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                        Contact for pricing
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold mb-1">{service.title}</h3>
                    <p className="text-white/80 text-sm">{service.subtitle}</p>
                  </div>

                  {/* Service Content */}
                  <div className="p-6">
                    <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                      {service.description}
                    </p>

                    {/* Features List */}
                    <div className="space-y-3 mb-6">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center text-gray-700 dark:text-gray-300">
                          <FaCheck className={`mr-3 text-sm bg-gradient-to-r ${service.gradient} bg-clip-text text-transparent`} style={{ color: service.gradient.includes('blue') ? '#3b82f6' : service.gradient.includes('purple') ? '#a855f7' : '#f97316' }} />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={() => handleGetStarted(service.id)}
                      className={`w-full py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r ${service.gradient} hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]`}
                    >
                      Get Started
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Me Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-800 dark:text-white">
              Why Work With Me?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">10+ Years Experience</h3>
                <p className="text-gray-600 dark:text-gray-400">Deep expertise in data platforms and enterprise solutions</p>
              </div>
              <div className="p-6">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Fast Delivery</h3>
                <p className="text-gray-600 dark:text-gray-400">Efficient development process with clear milestones</p>
              </div>
              <div className="p-6">
                <div className="text-4xl mb-4">🤝</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Ongoing Support</h3>
                <p className="text-gray-600 dark:text-gray-400">Continued assistance even after project completion</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />

      {/* Service Inquiry Modal */}
      <ServiceInquiryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        serviceType={selectedService}
      />
    </main>
  )
}

