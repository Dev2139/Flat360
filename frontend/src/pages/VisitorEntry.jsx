import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getFlatByQr, registerEntry, getFlats } from '../services/api';
import confetti from 'canvas-confetti';
import { ShieldCheck, User, Phone, MessageSquare, Building2, CheckCircle } from 'lucide-react';

const VisitorEntry = () => {
  const [searchParams] = useSearchParams();
  const qrCodeId = searchParams.get('qrCodeId');
  const navigate = useNavigate();

  // State
  const [flat, setFlat] = useState(null);
  const [flats, setFlats] = useState([]); // For manual selection if no QR
  const [selectedFlatId, setSelectedFlatId] = useState('');
  
  const [visitorName, setVisitorName] = useState('');
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        if (qrCodeId) {
          const flatData = await getFlatByQr(qrCodeId);
          setFlat(flatData);
        } else {
          // Fetch all flats for manual selection
          const flatsData = await getFlats().catch(() => []);
          setFlats(flatsData);
        }
      } catch (err) {
        setError('Invalid QR Code or Flat not found.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [qrCodeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        visitorName,
        phone,
        reason,
        flatId: flat ? flat._id : selectedFlatId,
        qrCodeId: flat ? qrCodeId : undefined
      };

      await registerEntry(payload);
      
      // Success Animation
      setSuccess(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      setError(err.message || 'Failed to register entry');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-slate-400">
        Loading entry details...
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="glass-card w-full max-w-md p-8 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 text-center space-y-6">
          <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 inline-block mx-auto">
            <CheckCircle className="h-16 w-16 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold text-slate-100">Entry Registered!</h2>
          <p className="text-slate-300">
            Welcome to our society. The owner of Flat <span className="font-bold text-sky-400">{flat ? flat.flatNumber : flats.find(f => f._id === selectedFlatId)?.flatNumber}</span> has been notified of your arrival.
          </p>
          <p className="text-sm text-slate-400">Have a great time!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-8 rounded-3xl border border-slate-800">
        <div className="flex flex-col items-center mb-6">
          <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 mb-4">
            <ShieldCheck className="h-12 w-12 text-sky-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100">Visitor Check-In</h2>
          {flat ? (
            <p className="text-slate-400 mt-1 flex items-center gap-1">
              <Building2 className="h-4 w-4" /> Flat <span className="text-sky-400 font-semibold">{flat.flatNumber}</span>
            </p>
          ) : (
            <p className="text-slate-400 mt-1">Please enter your details</p>
          )}
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl text-sm mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!flat && flats.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Select Flat</label>
              <select
                value={selectedFlatId}
                onChange={(e) => setSelectedFlatId(e.target.value)}
                className="glass-input w-full px-4 py-3 rounded-xl text-slate-200 text-sm"
                required
              >
                <option value="" disabled>-- Choose a Flat --</option>
                {flats.map(f => (
                  <option key={f._id} value={f._id} className="bg-slate-900">Flat {f.flatNumber} ({f.ownerName})</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Your Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="text"
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-slate-200 text-sm"
                placeholder="Full Name"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-slate-200 text-sm"
                placeholder="e.g. +919876543210"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Reason for Visit</label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-slate-200 text-sm"
                placeholder="e.g. Delivery, Guest, Maintenance"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || (!flat && !selectedFlatId)}
            className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-sky-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Entry'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VisitorEntry;
