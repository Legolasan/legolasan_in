import Header from '@/components/Header'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Skills from '@/components/Skills'
import Experience from '@/components/Experience'
import Education from '@/components/Education'
import GitHubStats from '@/components/GitHubStats'
import BookingSection from '@/components/BookingSection'
import Contact from '@/components/Contact'
import BlogSection from '@/components/BlogSection'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <About />
      <Skills />
      <Experience />
      <Education />
      <GitHubStats />
      <BookingSection />
      <BlogSection />
      <Contact />
      <Footer />
    </main>
  )
}

