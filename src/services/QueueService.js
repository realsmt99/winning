class QueueService {
    constructor() {
        this.listeners = new Set();
        this.interval = null;
    }

    // Start listening for updates
    startListening() {
        if (this.interval) return;

        this.interval = setInterval(() => {
            const services = JSON.parse(localStorage.getItem('services') || '[]');
            this.notifyListeners(services);
        }, 1000); // Check for updates every second
    }

    // Stop listening for updates
    stopListening() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    // Add a listener
    subscribe(callback) {
        this.listeners.add(callback);
        if (this.listeners.size === 1) {
            this.startListening();
        }
    }

    // Remove a listener
    unsubscribe(callback) {
        this.listeners.delete(callback);
        if (this.listeners.size === 0) {
            this.stopListening();
        }
    }

    // Notify all listeners
    notifyListeners(services) {
        this.listeners.forEach(callback => callback(services));
    }

    // Update services
    updateServices(services) {
        localStorage.setItem('services', JSON.stringify(services));
        this.notifyListeners(services);
    }
}

export const queueService = new QueueService(); 