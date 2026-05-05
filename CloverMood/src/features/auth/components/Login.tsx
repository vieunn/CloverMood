import React, { useState } from 'react';
import { Eye, EyeOff, Leaf, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { LoginCredentials } from '../types';
import { API_CONFIG } from '../../../config/api';

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const validateForm = (): boolean => {
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!password) {
      setError('Password is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Call backend login
      const credentials: LoginCredentials = { email, password };
      const loginResponse = await fetch(API_CONFIG.AUTH.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const loginData = await loginResponse.json();
      console.log('Login response:', loginData);

      if (!loginResponse.ok || !loginData.success) {
        setError(loginData.message || 'Login failed. Please try again.');
        return;
      }

      // 2. Extract token and userId from response
      const token = loginData.token || loginData.access_token;
      const userId = loginData.userId || loginData.id;

      if (!token) {
        throw new Error('No token in login response - backend login endpoint not returning token');
      }

      // 3. Store in localStorage for later use
      localStorage.setItem('authToken', token);
      localStorage.setItem('userId', userId || email);
      localStorage.setItem('userEmail', email);

      console.log('Login successful - token and userId stored');
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        fontFamily: 'system-ui, sans-serif',
        color: '#111827',
        backgroundColor: 'white',
      }}
    >
      <div
        style={{
          width: '50%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        <header
          style={{
            padding: '24px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#059669',
              fontWeight: 'bold',
              fontSize: '20px',
              letterSpacing: '-0.025em',
            }}
          >
            <Leaf style={{ width: '24px', height: '24px' }} />
            <span>CLOVERMOOD</span>
          </div>
        </header>

        <main
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 24px',
            width: '100%',
          }}
        >
          <div style={{ width: '100%', maxWidth: '420px' }}>
            <div style={{ marginBottom: '32px' }}>
              <h1
                style={{
                  fontSize: '30px',
                  fontWeight: 'bold',
                  letterSpacing: '-0.025em',
                  color: '#111827',
                  marginBottom: '8px',
                }}
              >
                Sign in to your account
              </h1>
              <p style={{ color: '#6B7280' }}>
                Welcome back! Please enter your details to continue.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              {error && (
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    backgroundColor: '#FEE2E2',
                    border: '1px solid #FECACA',
                    color: '#DC2626',
                    fontSize: '14px',
                  }}
                >
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label
                  htmlFor="email"
                  style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid #D1D5DB',
                    backgroundColor: 'white',
                    color: '#111827',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#059669';
                    e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#D1D5DB';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Enter your email address"
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label
                  htmlFor="password"
                  style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}
                >
                  Password
                </label>

                <div style={{ position: 'relative' }}>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      paddingRight: '48px',
                      borderRadius: '12px',
                      border: '1px solid #D1D5DB',
                      backgroundColor: 'white',
                      color: '#111827',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#059669';
                      e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#D1D5DB';
                      e.target.style.boxShadow = 'none';
                    }}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      padding: '4px',
                      color: '#9CA3AF',
                      background: 'none',
                      border: 'none',
                      outline: 'none',
                      cursor: 'pointer',
                      transition: 'color 0.2s',
                    }}
                  >
                    {showPassword ? (
                      <EyeOff style={{ width: '20px', height: '20px' }} />
                    ) : (
                      <Eye style={{ width: '20px', height: '20px' }} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: loading ? '#9CA3AF' : '#059669',
                  color: 'white',
                  fontWeight: '500',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 1px 2px rgba(5, 150, 105, 0.2)',
                  marginTop: '24px',
                  opacity: loading ? 0.7 : 1,
                }}
                onMouseOver={(e) => {
                  if (!loading) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#047857';
                  }
                }}
                onMouseOut={(e) => {
                  if (!loading) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#059669';
                  }
                }}
              >
                {loading ? 'Signing in...' : 'Sign in'}
                {!loading && <ChevronRight style={{ width: '16px', height: '16px', opacity: 0.7 }} />}
              </button>
            </form>

            <p
              style={{
                marginTop: '32px',
                textAlign: 'center',
                fontSize: '14px',
                color: '#6B7280',
              }}
            >
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                style={{
                  fontWeight: '600',
                  color: '#059669',
                  textDecoration: 'none',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Create Account
              </button>
            </p>
          </div>
        </main>
      </div>

      <div
        style={{
          width: '50%',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#09090B',
          padding: '48px',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.8 }}>
          <div
            style={{
              position: 'absolute',
              top: '-20%',
              left: '-10%',
              width: '70%',
              height: '70%',
              borderRadius: '50%',
              backgroundColor: 'rgba(5, 150, 105, 0.4)',
              filter: 'blur(100px)',
              mixBlendMode: 'screen',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '20%',
              right: '-20%',
              width: '80%',
              height: '80%',
              borderRadius: '50%',
              backgroundColor: 'rgba(20, 184, 166, 0.3)',
              filter: 'blur(120px)',
              mixBlendMode: 'screen',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-20%',
              left: '20%',
              width: '60%',
              height: '60%',
              borderRadius: '50%',
              backgroundColor: 'rgba(5, 150, 105, 0.5)',
              filter: 'blur(100px)',
              mixBlendMode: 'screen',
            }}
          />
        </div>

        <div
          style={{
            position: 'relative',
            zIndex: 10,
            textAlign: 'center',
            maxWidth: '400px',
          }}
        >
          <h2
            style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '16px',
            }}
          >
            Welcome to CloverMood
          </h2>
          <p
            style={{
              fontSize: '16px',
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: '1.6',
            }}
          >
            Track your mood, understand your emotions, and find balance in your daily life.
          </p>
        </div>
      </div>
    </div>
  );
}
