import { useState, useEffect } from 'react';
import { getFlats, registerExit, registerEntry, getVisitorLogs } from '../services/api';
import FlatCard from '../components/FlatCard';
import { QRCodeSVG } from 'qrcode.react';
import { Search, UserPlus, X, LogOut, Clock, User } from 'lucide-react';

const Dashboard = () => {
  const [flats, setFlats] = useState([]);
  const [activeVisitors, setActiveVisitors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal States
  const [selectedFlatQr, setSelectedFlatQr] = useState(null);
  const [selectedFlatEntry, setSelectedFlatEntry] = useState(null);
  
  // Form State for Quick Entry
  const [visitorName, setVisitorName] = useState('');
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('');
  const [entryLoading, setEntryLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const flatsData = await getFlats();
      setFlats(flatsData);
      
      // Fetch all logs to filter active visitors
      const logs = await getVisitorLogs();
      const active = logs.filter(log => log.status === 'inside');
      setActiveVisitors(active);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleExit = async (visitorId) => {
    try {
      await registerExit(visitorId);
      fetchData(); // Refresh
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEntrySubmit = async (e) => {
    e.preventDefault();
    setEntryLoading(true);
    try {
      await registerEntry({
        visitorName,
        phone,
        reason,
        flatId: selectedFlatEntry._id
      });
      // Reset form
      setVisitorName('');
      setPhone('');
      setReason('');
      setSelectedFlatEntry(null);
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setEntryLoading(false);
    }
  };

  const filteredFlats = flats.filter(flat => 
    flat.flatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flat.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Generate QR URL for the visitor entry form
  const getQrValue = (flat) => {
    const origin = 'https://flat360.netlify.app';
    return `${origin}/visitor/entry?qrCodeId=${flat.qrCodeId}`;
  };

  return (
    <div className="space-y-10">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Society Dashboard</h1>
          <p className="text-slate-400 mt-1">Monitor flats and manage visitor access</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by flat or owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-slate-200 text-sm"
          />
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Active Visitors Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-500" />
          Active Visitors ({activeVisitors.length})
        </h2>
        
        {activeVisitors.length === 0 ? (
          <div className="glass-card rounded-2xl p-6 text-center text-slate-400 border border-slate-800">
            No active visitors inside the society.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeVisitors.map(visitor => (
              <div key={visitor._id} className="glass-card rounded-2xl p-4 border border-amber-500/30 bg-amber-500/5 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-slate-100">{visitor.visitorName}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                    <User className="h-3 w-3" /> Flat {visitor.flatId?.flatNumber} ({visitor.flatId?.ownerName})
                  </p>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" /> In: {new Date(visitor.entryTime).toLocaleTimeString()}
                  </p>
                </div>
                <button
                  onClick={() => handleExit(visitor._id)}
                  className="flex items-center space-x-1 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 px-3 py-2 rounded-xl border border-slate-700 hover:border-red-500/30 transition-all duration-300 text-xs font-semibold"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Leave</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Flats Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-200">All Flats</h2>
        {loading && flats.length === 0 ? (
          <div className="text-center py-10 text-slate-400">Loading flats...</div>
        ) : filteredFlats.length === 0 ? (
          <div className="text-center py-10 text-slate-400">No flats found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredFlats.map(flat => (
              <FlatCard
                key={flat._id}
                flat={flat}
                onShowQr={(f) => setSelectedFlatQr(f)}
                onAddVisitor={(f) => setSelectedFlatEntry(f)}
              />
            ))}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {selectedFlatQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="glass-card max-w-md w-full p-6 rounded-3xl border border-slate-800 relative animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setSelectedFlatQr(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold text-slate-100">Flat {selectedFlatQr.flatNumber} QR Code</h3>
              <p className="text-slate-400 text-sm">Scan to register visitor entry</p>
              
              <div className="bg-white p-4 rounded-2xl inline-block mx-auto border border-slate-200">
                <QRCodeSVG value={getQrValue(selectedFlatQr)} size={200} />
              </div>
              
              <p className="text-xs text-slate-500 break-all select-all bg-slate-900/50 p-2 rounded-lg mt-4">
                {getQrValue(selectedFlatQr)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Visitor Modal */}
      {selectedFlatEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="glass-card max-w-md w-full p-6 rounded-3xl border border-slate-800 relative animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setSelectedFlatEntry(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                <UserPlus className="h-6 w-6 text-sky-400" />
                Entry for Flat {selectedFlatEntry.flatNumber}
              </h3>
              
              <form onSubmit={handleEntrySubmit} className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Visitor Name</label>
                  <input
                    type="text"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    className="glass-input w-full px-4 py-2.5 rounded-xl text-slate-200 text-sm"
                    placeholder="Full Name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="glass-input w-full px-4 py-2.5 rounded-xl text-slate-200 text-sm"
                    placeholder="e.g. +919876543210"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Reason for Visit</label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="glass-input w-full px-4 py-2.5 rounded-xl text-slate-200 text-sm"
                    placeholder="e.g. Delivery, Guest, Maintenance"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={entryLoading}
                  className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-sky-500/25 transition-all duration-300 disabled:opacity-50"
                >
                  {entryLoading ? 'Registering...' : 'Register Entry'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
