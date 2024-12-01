import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isAdminLogin, setIsAdminLogin] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        try {
            const success = login(email.toLowerCase(), password);
            if (success) {
                navigate('/');
            } else {
                setError(isAdminLogin ?
                    'Invalid admin credentials. Please try again.' :
                    'Invalid email or password'
                );
            }
        } catch (err) {
            setError('Login error: ' + err.message);
            console.error('Login error:', err);
        }
    };

    const handleAdminLogin = () => {
        setEmail('admin@example.com');
        setPassword('admin123');
        setIsAdminLogin(true);
        setError('');
    };

    const handleUserLogin = () => {
        setEmail('');
        setPassword('');
        setIsAdminLogin(false);
        setError('');
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>{isAdminLogin ? 'Admin Login' : 'User Login'}</h2>
                <div className="login-type-buttons">
                    <button
                        type="button"
                        className={`login-type-button ${!isAdminLogin ? 'active' : ''}`}
                        onClick={handleUserLogin}
                    >
                        User Login
                    </button>
                    <button
                        type="button"
                        className={`login-type-button ${isAdminLogin ? 'active' : ''}`}
                        onClick={handleAdminLogin}
                    >
                        Admin Login
                    </button>
                </div>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit} className="auth-form">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="auth-button">
                        {isAdminLogin ? 'Login as Admin' : 'Login as User'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login; 