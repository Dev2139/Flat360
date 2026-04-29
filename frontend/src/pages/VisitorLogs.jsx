import { useState, useEffect } from 'react';
import { getVisitorLogs, getFlats } from '../services/api';
import { Search, Calendar, Building2, Download, RefreshCw } from 'lucide-react';

const VisitorLogs = () => {
  const [logs, setLogs] = useState([]);
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [date, setDate] = useState('');
  const [flatId, setFlatId] = useState('');
  const [visitorName, setVisitorName] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const logsData = await getVisitorLogs({ date, flatId, visitorName });
      setLogs(logsData);
      
      const flatsData = await getFlats().catch(() => []);
      setFlats(flatsData);
    } catch (err) {
      setError(err.message || 'Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [date, flatId]); // Refetch on filter change for select/date

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleReset = () => {
    setDate('');
    setFlatId('');
    setVisitorName('');
    // Refetch with empty filters
    const resetLogs = async () => {
      setLoading(true);
      const logsData = await getVisitorLogs({});
      setLogs(logsData);
      setLoading(false);
    };
    resetLogs();
  };

  // Export to CSV
  const exportCSV = () => {
    if (logs.length === 0) return;

    const headers = ['Visitor Name', 'Phone', 'Reason', 'Flat Number', 'Entry Time', 'Exit Time', 'Status'];
    const csvRows = [
      headers.join(','),
      ...logs.map(log => {
        const entry = log.entryTime ? new Date(log.entryTime).toLocaleString() : 'N/A';
        const exit = log.exitTime ? new Date(log.exitTime).toLocaleString() : 'N/A';
        return [
          `"${log.visitorName}"`,
          `"${log.phone}"`,
          `"${log.reason}"`,
          `"${log.flatId?.flatNumber || 'Deleted Flat'}"`,
          `"${entry}"`,
          `"${exit}"`,
          `"${log.status}"`
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `visitor_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Visitor Logs</h1>
          <p className="text-slate-400 mt-1">View and filter visitor history</p>
        </div>
        
        <button
          onClick={exportCSV}
          disabled={logs.length === 0}
          className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-sky-400 px-4 py-2.5 rounded-xl border border-slate-700 hover:border-sky-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
        >
          <Download className="h-5 w-5" />
          <span>Export CSV</span>
        </button>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Filters Panel */}
      <form onSubmit={handleSearch} className="glass-card p-6 rounded-3xl border border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-1">
            <Calendar className="h-4 w-4 text-slate-400" /> Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="glass-input w-full px-4 py-2.5 rounded-xl text-slate-200 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-1">
            <Building2 className="h-4 w-4 text-slate-400" /> Flat
          </label>
          <select
            value={flatId}
            onChange={(e) => setFlatId(e.target.value)}
            className="glass-input w-full px-4 py-2.5 rounded-xl text-slate-200 text-sm"
          >
            <option value="">All Flats</option>
            {flats.map(f => (
              <option key={f._id} value={f._id} className="bg-slate-900">Flat {f.flatNumber}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-1">
            <Search className="h-4 w-4 text-slate-400" /> Visitor Name
          </label>
          <input
            type="text"
            placeholder="Search name..."
            value={visitorName}
            onChange={(e) => setVisitorName(e.target.value)}
            className="glass-input w-full px-4 py-2.5 rounded-xl text-slate-200 text-sm"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2.5 rounded-xl transition-all duration-300 text-sm"
          >
            Search
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors"
            title="Reset Filters"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </form>

      {/* Logs Table */}
      <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="text-center py-10 text-slate-400">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-10 text-slate-400">No logs found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/50 text-slate-300 text-sm border-b border-slate-700">
                  <th className="px-6 py-4 font-semibold">Visitor Name</th>
                  <th className="px-6 py-4 font-semibold">Phone</th>
                  <th className="px-6 py-4 font-semibold">Flat</th>
                  <th className="px-6 py-4 font-semibold">Reason</th>
                  <th className="px-6 py-4 font-semibold">Entry Time</th>
                  <th className="px-6 py-4 font-semibold">Exit Time</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300 text-sm">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-100">{log.visitorName}</td>
                    <td className="px-6 py-4">{log.phone}</td>
                    <td className="px-6 py-4">Flat {log.flatId?.flatNumber || 'Deleted'}</td>
                    <td className="px-6 py-4 max-w-xs truncate">{log.reason}</td>
                    <td className="px-6 py-4">{new Date(log.entryTime).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      {log.exitTime ? new Date(log.exitTime).toLocaleString() : 'Still Inside'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                        log.status === 'inside' 
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {log.status === 'inside' ? 'Inside' : 'Left'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisitorLogs;
