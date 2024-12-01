import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';

function QueueDisplay({ ticket, service }) {
    const { currentUser } = useAuth();

    // Find only tickets that belong to the current user
    const userPosition = service.queue.findIndex(t =>
        t.number === ticket.number && t.userId === currentUser.id
    ) + 1;

    // Only show info if this ticket belongs to the current user
    if (ticket.userId !== currentUser.id) {
        return (
            <div className="queue-display">
                <p>No active ticket found.</p>
            </div>
        );
    }

    const estimatedTime = userPosition * 5;

    return (
        <div className="queue-display">
            <div className="ticket-info">
                <h2>Your Ticket</h2>
                <div className="ticket-number">{ticket.number}</div>
                <div className="service-name">{service.name}</div>
                <div className="queue-stats">
                    <p>Current Number: {service.currentNumber}</p>
                    <p>Your Position: {userPosition}</p>
                    <p>Estimated Wait: {estimatedTime} minutes</p>
                </div>
            </div>
            <div className="progress-bar">
                <div
                    className="progress"
                    style={{
                        width: `${Math.max(
                            0,
                            100 - (userPosition / service.queue.length) * 100
                        )}%`,
                    }}
                ></div>
            </div>
        </div>
    );
}

QueueDisplay.propTypes = {
    ticket: PropTypes.object.isRequired,
    service: PropTypes.object.isRequired,
};

export default QueueDisplay; 