import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

function Navbar() {
    const { currentUser, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="nav-brand">
                <Link to="/">
                    <Logo />
                </Link>
            </div>
            <div className="nav-links">
                {currentUser ? (
                    <>
                        <span className="welcome-text">Welcome, {currentUser.name}</span>
                        {isAdmin && <Link to="/admin">Admin Dashboard</Link>}
                        <button onClick={handleLogout} className="nav-button">Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar; 