import { useState, useEffect } from 'react';
import { getFlats, createFlat, updateFlat, deleteFlat } from '../services/api';
import { Plus, Edit2, Trash2, X, AlertCircle, Smartphone } from 'lucide-react';

const FlatManagement = () => {
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal/Form State
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  
  const [flatNumber, setFlatNumber] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchFlats = async () => {
    try {
      setLoading(true);
      const data = await getFlats();
      setFlats(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch flats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlats();
  }, []);

  const handleOpenModal = (flat = null) => {
    if (flat) {
      setIsEdit(true);
      setCurrentId(flat._id);
      setFlatNumber(flat.flatNumber);
      setOwnerName(flat.ownerName);
      setOwnerPhone(flat.ownerPhone);
    } else {
      setIsEdit(false);
      setCurrentId(null);
      setFlatNumber('');
      setOwnerName('');
      setOwnerPhone('');
    }
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    try {
      if (isEdit) {
        await updateFlat(currentId, { flatNumber, ownerName, ownerPhone });
      } else {
        await createFlat({ flatNumber, ownerName, ownerPhone });
      }
      setIsOpen(false);
      fetchFlats();
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this flat?')) {
      try {
        await deleteFlat(id);
        fetchFlats();
      } catch (err) {
        setError(err.message || 'Failed to delete');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Flat Management</h1>
          <p className="text-slate-400 mt-1">Add and manage society flats</p>
        </div>
        
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-sky-500/25 transition-all duration-300"
        >
          <Plus className="h-5 w-5" />
          <span>Add Flat</span>
        </button>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl flex items-center space-x-2 text-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Flats Table */}
      <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="text-center py-10 text-slate-400">Loading flats...</div>
        ) : flats.length === 0 ? (
          <div className="text-center py-10 text-slate-400">No flats registered yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/50 text-slate-300 text-sm border-b border-slate-700">
                  <th className="px-6 py-4 font-semibold">Flat Number</th>
                  <th className="px-6 py-4 font-semibold">Owner Name</th>
                  <th className="px-6 py-4 font-semibold">WhatsApp Number</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300 text-sm">
                {flats.map((flat) => (
                  <tr key={flat._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-100">{flat.flatNumber}</td>
                    <td className="px-6 py-4">{flat.ownerName}</td>
                    <td className="px-6 py-4 flex items-center gap-1">
                      <Smartphone className="h-4 w-4 text-slate-500" />
                      {flat.ownerPhone}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenModal(flat)}
                        className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-sky-400 hover:bg-slate-700 border border-slate-700 transition-colors inline-block"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(flat._id)}
                        className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-700 border border-slate-700 transition-colors inline-block"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="glass-card max-w-md w-full p-6 rounded-3xl border border-slate-800 relative animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-slate-100">
                {isEdit ? 'Edit Flat' : 'Add New Flat'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Flat Number</label>
                  <input
                    type="text"
                    value={flatNumber}
                    onChange={(e) => setFlatNumber(e.target.value)}
                    className="glass-input w-full px-4 py-2.5 rounded-xl text-slate-200 text-sm"
                    placeholder="e.g. A-101, 302"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Owner Name</label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="glass-input w-full px-4 py-2.5 rounded-xl text-slate-200 text-sm"
                    placeholder="Full Name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Owner WhatsApp (Include country code)</label>
                  <input
                    type="tel"
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    className="glass-input w-full px-4 py-2.5 rounded-xl text-slate-200 text-sm"
                    placeholder="e.g. +919876543210"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-sky-500/25 transition-all duration-300 disabled:opacity-50"
                >
                  {formLoading ? 'Saving...' : isEdit ? 'Update Flat' : 'Create Flat'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlatManagement;
