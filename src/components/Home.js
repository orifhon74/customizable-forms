import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Welcome to Customizable Forms</h1>
            <p>Please login or register to continue.</p>
            <div style={{ marginTop: '20px' }}>
                <Link to="/login" className="btn btn-primary" style={{ marginRight: '10px' }}>
                    Login
                </Link>
                <Link to="/register" className="btn btn-secondary">
                    Register
                </Link>
            </div>
        </div>
    );
}

export default Home;