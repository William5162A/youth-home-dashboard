import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // التوجيه يتم تلقائياً عبر مراقب الحالة في App.jsx
    } catch (err) {
      setError('بيانات الدخول غير صحيحة. يرجى المحاولة مجدداً.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-xl bg-surface p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 translate="no" className="text-3xl font-bold text-brand-blue">بيت الشباب</h1>
          <p translate="no" className="mt-2 text-sm text-slate-500">لوحة التحكم الإدارية</p>
        </div>

        {error && (
          <div className="mb-4 rounded bg-absent-bg p-3 text-sm text-absent-text text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label translate="no" className="block text-sm font-medium text-slate-700 mb-1">البريد الإلكتروني</label>
            <input
              type="email"
              dir="ltr"
              required
              className="w-full rounded-md border border-slate-300 px-4 py-2 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label translate="no" className="block text-sm font-medium text-slate-700 mb-1">كلمة المرور</label>
            <input
              type="password"
              dir="ltr"
              required
              className="w-full rounded-md border border-slate-300 px-4 py-2 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-brand-blue py-2.5 text-white font-semibold hover:bg-brand-blue-dark transition-colors disabled:opacity-50"
          >
            {isLoading ? 'جاري التحقق...' : 'تسجيل الدخول'}
          </button>
        </form>
      </div>
    </div>
  );
}