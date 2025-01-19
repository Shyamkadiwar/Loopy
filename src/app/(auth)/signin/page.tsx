'use client';

import { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const SignInPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/profile'
      });

      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
      } else {
        router.push('/profile');
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred during sign in');
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = (provider: 'github' | 'google') => {
    signIn(provider, {
      callbackUrl: '/profile'
    });
  };

  return (
    <div className="container">
      <div className="form-wrapper">
        <h1>Sign In</h1>
        <p>Choose your preferred sign in method</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-field"
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-field"
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="submit-button"
          >
            {isLoading ? 'Signing in...' : 'Sign in with Email'}
          </button>
        </form>

        <div className="divider">
          <span>Or continue with</span>
        </div>

        <div className="oauth-buttons">
          <button
            onClick={() => handleOAuthSignIn('github')}
            disabled={isLoading}
            className="oauth-button"
          >
            GitHub
          </button>
          <button
            onClick={() => handleOAuthSignIn('google')}
            disabled={isLoading}
            className="oauth-button"
          >
            Google
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>

      <style jsx>{`
        /* ... (styles remain the same) ... */
      `}</style>
    </div>
  );
};

export default SignInPage;