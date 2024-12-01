import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ServicesList({ services, onServiceSelect }) {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleJoinQueue = (e, service) => {
        e.stopPropagation(); // Prevent card click event
        onServiceSelect(service);
    };

    return (
        <div className="services-section">
            <h2>Available Services</h2>
            {isAdmin && (
                <button
                    onClick={() => navigate('/admin')}
                    className="admin-panel-button"
                >
                    Open Admin Panel
                </button>
            )}
            <div className="services-grid">
                {services.map((service) => (
                    <div
                        key={service.id}
                        className="service-card"
                    >
                        <div className="service-header">
                            <span className="service-icon">{service.icon}</span>
                            <h3>{service.name}</h3>
                        </div>
                        <div className="service-stats">
                            <p>Current Number: {service.currentNumber}</p>
                            <p>Waiting: {service.queue.length}</p>
                        </div>
                        <div className="estimated-time">
                            <p>Estimated Wait: {service.queue.length * 5} mins</p>
                        </div>
                        <button
                            className="join-queue-button"
                            onClick={(e) => handleJoinQueue(e, service)}
                        >
                            Join Queue
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

ServicesList.propTypes = {
    services: PropTypes.array.isRequired,
    onServiceSelect: PropTypes.func.isRequired,
};

export default ServicesList; 