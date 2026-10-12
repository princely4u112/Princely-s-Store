import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Mail, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, lockoutRemaining } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutRemaining > 0) return;

    setError(null);
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error || 'Failed to authenticate.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      {/* Back to store link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 mb-4">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#1E2A44] font-medium">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Public Store</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white border border-[#E2E8F0] py-8 px-6 sm:px-10 rounded-2xl shadow-sm space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-[#1E2A44] rounded-xl flex items-center justify-center text-white mx-auto shadow-sm">
              <Lock className="w-6 h-6 text-[#E8553A]" />
            </div>
            <h1 className="font-heading text-xl sm:text-2xl font-bold text-[#1E2A44]">
              Staff Management Portal
            </h1>
            <p className="text-xs text-[#64748B]">
              Princely's Tech Administration & Order Fulfillment
            </p>
          </div>

          {lockoutRemaining > 0 ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center space-y-2 text-xs text-[#DC2626]">
              <AlertCircle className="w-6 h-6 mx-auto" />
              <p className="font-semibold">Account Temporarily Locked</p>
              <p>
                Too many incorrect attempts. Please wait <strong className="tabular-nums font-mono">{lockoutRemaining}s</strong> before retrying.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-[#DC2626] flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#1E2A44] mb-1">
                  Administrator Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#64748B]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Princely4u112@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#1E2A44] focus:bg-white text-[#1E2A44]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E2A44] mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#64748B]" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#1E2A44] focus:bg-white text-[#1E2A44]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-[#1E2A44] hover:bg-[#1E2A44]/90 text-white font-semibold text-xs sm:text-sm rounded-lg flex items-center justify-center gap-2 transition-colors shadow-xs disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
                </button>
              </div>
            </form>
          )}

          <div className="pt-4 border-t border-[#E2E8F0] text-center text-[11px] text-[#64748B]">
            <p>Protected by Row-Level Security & Encrypted Auth Tokens.</p>
          </div>

        </div>
      </div>

    </div>
  );
};
