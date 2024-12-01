import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import ServicesList from './components/ServicesList'
import JoinQueue from './components/JoinQueue'
import QueueDisplay from './components/QueueDisplay'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import AdminDashboard from './components/admin/AdminDashboard'
import Navbar from './components/Navbar'
import { AuthProvider, useAuth } from './context/AuthContext'
import ChatBot from './components/ChatBot'
import './App.css'
import { queueService } from './services/QueueService'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth()
  return currentUser ? children : <Navigate to="/login" />
}

const AdminRoute = ({ children }) => {
  const { isAdmin } = useAuth()
  return isAdmin ? children : <Navigate to="/" />
}

const initialServices = [
  {
    id: 1,
    name: 'Customer Service',
    currentNumber: 0,
    lastNumber: 0,
    queue: [],
    icon: '👥',
  },
  {
    id: 2,
    name: 'Technical Support',
    currentNumber: 0,
    lastNumber: 0,
    queue: [],
    icon: '🔧',
  },
  {
    id: 3,
    name: 'Billing',
    currentNumber: 0,
    lastNumber: 0,
    queue: [],
    icon: '💳',
  },
  {
    id: 4,
    name: 'Consultation',
    currentNumber: 0,
    lastNumber: 0,
    queue: [],
    icon: '📋',
  },
]

function AppContent() {
  const { currentUser } = useAuth()
  const [services, setServices] = useState(initialServices)
  const [selectedService, setSelectedService] = useState(null)
  const [clientTicket, setClientTicket] = useState(null)
  const [isChatOpen, setIsChatOpen] = useState(false)

  // Initialize services in localStorage if not exists
  useEffect(() => {
    const storedServices = localStorage.getItem('services')
    if (!storedServices) {
      localStorage.setItem('services', JSON.stringify(initialServices))
    } else {
      setServices(JSON.parse(storedServices))
    }
  }, [])

  // Load client ticket from localStorage
  useEffect(() => {
    const storedTicket = localStorage.getItem('clientTicket')
    if (storedTicket) {
      setClientTicket(JSON.parse(storedTicket))
    }
  }, [])

  // Subscribe to real-time updates
  useEffect(() => {
    const handleServicesUpdate = (updatedServices) => {
      setServices(updatedServices)

      // Update client ticket if needed
      if (clientTicket) {
        const service = updatedServices.find(s => s.id === clientTicket.serviceId)
        if (!service.queue.some(t => t.number === clientTicket.number)) {
          setClientTicket(null)
          localStorage.removeItem('clientTicket')
        }
      }
    }

    queueService.subscribe(handleServicesUpdate)
    return () => queueService.unsubscribe(handleServicesUpdate)
  }, [clientTicket])

  // Auto-progress queue
  useEffect(() => {
    const interval = setInterval(() => {
      if (services.some(service => service.queue.length > 0)) {
        const servicesWithQueue = services.filter(service => service.queue.length > 0)
        const randomService = servicesWithQueue[Math.floor(Math.random() * servicesWithQueue.length)]
        handleNextCustomer(randomService.id)
      }
    }, 15000)

    return () => clearInterval(interval)
  }, [services])

  const handleServiceSelect = (service) => {
    // Check if user is already in any queue
    const isInAnyQueue = services.some(s =>
      s.queue.some(ticket => ticket.userId === currentUser.id)
    )

    if (isInAnyQueue) {
      alert('You are already in a queue. Please wait for your turn or contact admin for assistance.')
      return
    }

    // Check if user is already in this specific queue
    if (service.queue.some(ticket => ticket.userId === currentUser.id)) {
      alert('You are already in this queue!')
      return
    }

    setSelectedService(service)
  }

  const handleJoinQueue = (ticket) => {
    const updatedServices = services.map(service => {
      if (service.id === selectedService.id) {
        const newTicket = {
          ...ticket,
          number: service.lastNumber + 1
        }

        return {
          ...service,
          lastNumber: service.lastNumber + 1,
          queue: [...service.queue, newTicket]
        }
      }
      return service
    })

    queueService.updateServices(updatedServices)

    // Find the updated service to get the correct ticket number
    const updatedService = updatedServices.find(s => s.id === selectedService.id)
    const updatedTicket = updatedService.queue[updatedService.queue.length - 1]

    setClientTicket(updatedTicket)
    localStorage.setItem('clientTicket', JSON.stringify(updatedTicket))
    setSelectedService(null)
  }

  const handleNextCustomer = (serviceId) => {
    const updatedServices = services.map(service => {
      if (service.id === serviceId && service.queue.length > 0) {
        const [nextCustomer, ...remainingQueue] = service.queue

        // Add to history
        const historyEntry = {
          ...nextCustomer,
          serviceId,
          serviceName: service.name,
          status: 'completed',
          actionTime: new Date().toISOString()
        }
        const queueHistory = JSON.parse(localStorage.getItem('queueHistory') || '[]')
        localStorage.setItem('queueHistory', JSON.stringify([...queueHistory, historyEntry]))

        return {
          ...service,
          currentNumber: nextCustomer.number,
          queue: remainingQueue
        }
      }
      return service
    })

    queueService.updateServices(updatedServices)
  }

  return (
    <div className="app">
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <main className="app-main">
                {!clientTicket && (
                  <ServicesList
                    services={services}
                    onServiceSelect={handleServiceSelect}
                  />
                )}

                {selectedService && !clientTicket && (
                  <JoinQueue
                    service={selectedService}
                    onJoinQueue={handleJoinQueue}
                  />
                )}

                {clientTicket && (
                  <QueueDisplay
                    ticket={clientTicket}
                    service={services.find(s => s.id === clientTicket.serviceId)}
                  />
                )}
              </main>
            </ProtectedRoute>
          }
        />
      </Routes>
      <button
        className="chat-toggle-button"
        onClick={() => setIsChatOpen(!isChatOpen)}
      >
        💬
      </button>
      <ChatBot
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}

export default App
