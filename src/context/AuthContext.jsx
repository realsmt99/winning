import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const AuthContext = createContext(null);

// Separate hook declaration
function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Function to create admin user
    const createAdminUser = () => {
        const adminUser = {
            id: Date.now(),
            name: 'Admin',
            email: 'admin@example.com',
            password: 'admin123',
            role: 'admin',
            createdAt: new Date().toISOString()
        };

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        // Check if admin already exists
        if (!users.some(user => user.role === 'admin')) {
            users.push(adminUser);
            localStorage.setItem('users', JSON.stringify(users));
            console.log('Admin user created:', adminUser);
        }
    };

    useEffect(() => {
        // Create admin user on initial load
        createAdminUser();

        // Check if user is logged in
        const user = localStorage.getItem('currentUser');
        if (user) {
            setCurrentUser(JSON.parse(user));
        }
        setLoading(false);
    }, []);

    const login = (email, password) => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        console.log('Login attempt:', { email, password });
        console.log('Available users:', users);

        const user = users.find(u =>
            u.email.toLowerCase() === email.toLowerCase() &&
            u.password === password
        );

        if (user) {
            console.log('Login successful:', user);
            setCurrentUser(user);
            localStorage.setItem('currentUser', JSON.stringify(user));
            return true;
        }
        console.log('Login failed: User not found or incorrect password');
        return false;
    };

    const register = (name, email, password) => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');

        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            return false;
        }

        const newUser = {
            id: Date.now(),
            name,
            email: email.toLowerCase(),
            password,
            role: 'user',
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        return true;
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
    };

    const value = {
        currentUser,
        login,
        register,
        logout,
        isAdmin: currentUser?.role === 'admin'
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

// Named exports
export { AuthProvider, useAuth }; 