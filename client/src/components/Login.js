import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [userid, setUserid] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userid, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Store partner info in both localStorage and sessionStorage
        const partnerData = {
          userid: data.userid,
          partnerType: data.partnerType,
          id: data.id,
          partner_name: data.partner_name,
          email: data.email,
          phone: data.phone
        };

        localStorage.setItem('partner', JSON.stringify(partnerData));
        sessionStorage.setItem('partner', JSON.stringify(partnerData));

        // Navigate based on partner type
        if (data.partnerType === 'admin') {
          navigate('/admin-dashboard');
        } else {
          navigate('/partner/home');
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="userid">User ID</label>
            <input
              type="text"
              id="userid"
              value={userid}
              onChange={(e) => setUserid(e.target.value)}
              required
              placeholder="Enter your user ID"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
