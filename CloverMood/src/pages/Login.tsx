import React, { useState } from 'react';
import { Eye, EyeOff, Leaf, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (!response.ok || !data.success) {
        let errorMessage = data.message || 'Login failed. Please check your credentials.';

        if (data.error) {
          try {
            const parsedError =
              typeof data.error === 'string' ? JSON.parse(data.error) : data.error;

            if (parsedError.msg) {
              errorMessage = parsedError.msg;
            }
          } catch {
            // keep fallback message
          }
        }

        setError(errorMessage);
        return;
      }

      let parsedAuthData: any = null;

      if (data.data) {
        parsedAuthData =
          typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
      }

      if (parsedAuthData?.access_token) {
        localStorage.setItem('authToken', parsedAuthData.access_token);
      }

      if (parsedAuthData?.refresh_token) {
        localStorage.setItem('refreshToken', parsedAuthData.refresh_token);
      }

      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please check your connection and try again.');
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
          <div style={{ width: '100%', maxWidth: '420px' }} className="fade-in">
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
                <div style={{ position: 'relative' }}>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '92%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid #D1D5DB',
                      backgroundColor: 'white',
                      color: '#111827',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                    className="focus-emerald"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <label
                    htmlFor="password"
                    style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}
                  >
                    Password
                  </label>
                  <a
                    href="#"
                    style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#059669',
                      textDecoration: 'none',
                    }}
                    className="hover-text-emerald"
                  >
                    Forgot password?
                  </a>
                </div>

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
                    }}
                    className="focus-emerald"
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
                      transition: 'color 0.2s',
                    }}
                    className="cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff style={{ width: '20px', height: '20px' }} />
                    ) : (
                      <Eye style={{ width: '20px', height: '20px' }} />
                    )}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', paddingTop: '8px' }}>
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '4px',
                    border: '1px solid #D1D5DB',
                    backgroundColor: '#059669',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  className="cursor-pointer"
                />
                <label
                  htmlFor="remember-me"
                  style={{
                    marginLeft: '12px',
                    fontSize: '14px',
                    color: '#4B5563',
                    userSelect: 'none',
                  }}
                  className="cursor-pointer"
                >
                  Remember me for 30 days
                </label>
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
                className="hover-bg-emerald"
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
                className="hover-text-emerald"
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
            width: '100%',
            maxWidth: '480px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '80px',
              height: '80px',
              borderRadius: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              marginBottom: '32px',
              boxShadow:
                '0 0 0 1px rgba(255, 255, 255, 0.1), 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
          >
            <Leaf style={{ width: '40px', height: '40px', color: '#34D399' }} />
          </div>

          <h2
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              letterSpacing: '-0.025em',
              color: 'white',
              marginBottom: '24px',
            }}
          >
            Cultivate your <br />
            <span
              style={{
                background: 'linear-gradient(to right, #34D399, #14B8A6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              digital mood.
            </span>
          </h2>

          <p
            style={{
              fontSize: '18px',
              color: 'rgba(255, 255, 255, 0.7)',
              lineHeight: '1.5',
              fontWeight: '300',
            }}
          >
            Access your statistics, manage your history, and personalize your
            profile all in one seamlessly designed ecosystem.
          </p>

          <div
            style={{
              marginTop: '48px',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
              textAlign: 'left',
            }}
          >
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '16px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(5, 150, 105, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                }}
              >
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#34D399',
                  }}
                />
              </div>
              <div
                style={{
                  height: '4px',
                  width: '64px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '2px',
                  marginBottom: '4px',
                }}
              />
              <div
                style={{
                  height: '4px',
                  width: '96px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '2px',
                }}
              />
            </div>

            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '16px',
                transform: 'translateY(16px)',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(20, 184, 166, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                }}
              >
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#14B8A6',
                  }}
                />
              </div>
              <div
                style={{
                  height: '4px',
                  width: '80px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '2px',
                  marginBottom: '4px',
                }}
              />
              <div
                style={{
                  height: '4px',
                  width: '48px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '2px',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}