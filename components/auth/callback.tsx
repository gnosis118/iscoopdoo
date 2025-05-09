// pages/auth/callback.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';

export default function PasswordReset() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Handle the URL params (e.g., recovery token) if necessary
    const { access_token, type } = router.query;

    if (type === 'recovery' && access_token) {
      // You can validate or handle the token if necessary
    }
  }, [router.query]);

  const handleReset = async () => {
    setLoading(true);

    // Assuming Supabase handles token automatically
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (!error) {
      alert('Password updated! Redirecting to login...');
      router.push('/login');
    } else {
      alert(error.message);
    }

    setLoading(false);
  };

  return (
    <div>
      <h1>Reset Your Password</h1>
      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <button onClick={handleReset} disabled={loading}>
        {loading ? 'Resetting...' : 'Reset Password'}
      </button>
    </div>
  );
}
