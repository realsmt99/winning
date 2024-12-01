import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { queueService } from '../../services/QueueService';

function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [services, setServices] = useState([]);
    const [activeTab, setActiveTab] = useState('users'); // 'users' or 'queues'
    const [queueHistory, setQueueHistory] = useState([]);
    const { isAdmin } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
            return;
        }

        const handleServicesUpdate = (updatedServices) => {
            setServices(updatedServices);
        };

        queueService.subscribe(handleServicesUpdate);

        const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const storedHistory = JSON.parse(localStorage.getItem('queueHistory') || '[]');
        setUsers(storedUsers);
        setQueueHistory(storedHistory);

        return () => queueService.unsubscribe(handleServicesUpdate);
    }, [isAdmin, navigate]);

    const deleteUser = (userId) => {
        const updatedUsers = users.filter(user => user.id !== userId);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        setUsers(updatedUsers);
    };

    const skipUser = (serviceId, ticket) => {
        const updatedServices = services.map(service => {
            if (service.id === serviceId) {
                return {
                    ...service,
                    currentNumber: ticket.number,
                    queue: service.queue.filter(t => t.number !== ticket.number)
                };
            }
            return service;
        });

        // Add to history
        const historyEntry = {
            ...ticket,
            serviceId,
            serviceName: services.find(s => s.id === serviceId).name,
            status: 'skipped',
            actionTime: new Date().toISOString()
        };

        const updatedHistory = [...queueHistory, historyEntry];
        localStorage.setItem('queueHistory', JSON.stringify(updatedHistory));
        setQueueHistory(updatedHistory);

        queueService.updateServices(updatedServices);
    };

    const getUserQueueHistory = (userId) => {
        return queueHistory.filter(entry => entry.userId === userId);
    };

    return (
        <div className="admin-dashboard">
            <div className="admin-tabs">
                <button
                    className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    Manage Users
                </button>
                <button
                    className={`tab-button ${activeTab === 'queues' ? 'active' : ''}`}
                    onClick={() => setActiveTab('queues')}
                >
                    Manage Queues
                </button>
            </div>

            {activeTab === 'users' ? (
                <div className="users-section">
                    <h2>User Management</h2>
                    <div className="users-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Queue History</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => {
                                    const userHistory = getUserQueueHistory(user.id);
                                    return (
                                        <tr key={user.id}>
                                            <td>{user.name}</td>
                                            <td>{user.email}</td>
                                            <td>{user.role}</td>
                                            <td>
                                                {userHistory.length > 0 ? (
                                                    <div className="queue-history">
                                                        <span>Total visits: {userHistory.length}</span>
                                                        <button
                                                            onClick={() => alert(
                                                                userHistory
                                                                    .map(h => `${h.serviceName} - ${new Date(h.timestamp).toLocaleString()} (${h.status})`)
                                                                    .join('\n')
                                                            )}
                                                            className="history-button"
                                                        >
                                                            View History
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span>No queue history</span>
                                                )}
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() => deleteUser(user.id)}
                                                    className="delete-button"
                                                    disabled={user.role === 'admin'}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="queues-section">
                    <h2>Queue Management</h2>
                    <div className="services-queues">
                        {services.map(service => (
                            <div key={service.id} className="service-queue-card">
                                <h3>{service.name}</h3>
                                <div className="queue-stats">
                                    <p>Current Number: {service.currentNumber}</p>
                                    <p>Waiting: {service.queue.length}</p>
                                </div>
                                {service.queue.length > 0 ? (
                                    <div className="queue-list">
                                        <h4>Queue List</h4>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Ticket #</th>
                                                    <th>User</th>
                                                    <th>Contact</th>
                                                    <th>Time</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {service.queue.map(ticket => (
                                                    <tr key={ticket.number}>
                                                        <td>{ticket.number}</td>
                                                        <td>
                                                            <div className="user-info">
                                                                <span>{ticket.name}</span>
                                                                <small>{ticket.email}</small>
                                                            </div>
                                                        </td>
                                                        <td>{ticket.phone}</td>
                                                        <td>{new Date(ticket.timestamp).toLocaleTimeString()}</td>
                                                        <td>
                                                            <button
                                                                onClick={() => skipUser(service.id, ticket)}
                                                                className="skip-button"
                                                            >
                                                                Skip
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="no-queue">No customers in queue</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard; 