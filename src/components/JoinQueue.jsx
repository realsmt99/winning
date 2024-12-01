import { useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';

function JoinQueue({ service, onJoinQueue }) {
    const [phone, setPhone] = useState('');
    const { currentUser } = useAuth();

    const handleSubmit = (e) => {
        e.preventDefault();
        const ticket = {
            number: service.lastNumber + 1,
            serviceId: service.id,
            userId: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            phone,
            timestamp: new Date().toISOString(),
            status: 'waiting'
        };
        onJoinQueue(ticket);
    };

    return (
        <div className="join-queue-section">
            <h2>Join {service.name} Queue</h2>
            <div className="selected-service-info">
                <div className="service-icon">{service.icon}</div>
                <div className="service-details">
                    <p>Current Number: {service.currentNumber}</p>
                    <p>People Waiting: {service.queue.length}</p>
                    <p>Estimated Wait: {service.queue.length * 5} minutes</p>
                </div>
            </div>
            <form onSubmit={handleSubmit} className="queue-form">
                <div className="user-info">
                    <p>Name: {currentUser.name}</p>
                    <p>Email: {currentUser.email}</p>
                </div>
                <input
                    type="tel"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                />
                <button type="submit" className="join-button">
                    Get Ticket
                </button>
            </form>
        </div>
    );
}

JoinQueue.propTypes = {
    service: PropTypes.object.isRequired,
    onJoinQueue: PropTypes.func.isRequired,
};

export default JoinQueue; 