import { User, Shield, ShieldAlert, ShieldCheck, QrCode } from 'lucide-react';

const FlatCard = ({ flat, onShowQr, onAddVisitor }) => {
  const getStatusStyles = (color) => {
    switch (color) {
      case 'green':
        return {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          text: 'text-emerald-400',
          icon: ShieldCheck,
          label: 'No Visitors'
        };
      case 'orange':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          text: 'text-amber-400',
          icon: Shield,
          label: '1 Visitor Inside'
        };
      case 'red':
        return {
          bg: 'bg-rose-500/10',
          border: 'border-rose-500/30',
          text: 'text-rose-400',
          icon: ShieldAlert,
          label: `${flat.activeVisitors} Visitors Inside`
        };
      default:
        return {
          bg: 'bg-slate-500/10',
          border: 'border-slate-500/30',
          text: 'text-slate-400',
          icon: Shield,
          label: 'Unknown'
        };
    }
  };

  const status = getStatusStyles(flat.statusColor);
  const StatusIcon = status.icon;

  return (
    <div className={`glass-card rounded-2xl p-6 border transition-all duration-300 hover:scale-[1.02] ${status.border} ${status.bg}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-100">Flat {flat.flatNumber}</h3>
          <div className="flex items-center text-slate-400 mt-1">
            <User className="h-4 w-4 mr-1" />
            <span className="text-sm">{flat.ownerName}</span>
          </div>
        </div>
        
        <button 
          onClick={() => onShowQr(flat)}
          className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-sky-400 hover:bg-slate-700/80 border border-slate-700 transition-colors"
          title="View QR Code"
        >
          <QrCode className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center space-x-2 mt-6">
        <StatusIcon className={`h-5 w-5 ${status.text}`} />
        <span className={`font-medium text-sm ${status.text}`}>{status.label}</span>
      </div>

      <div className="mt-6 flex gap-2">
        <button
          onClick={() => onAddVisitor(flat)}
          className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-sky-400 font-medium py-2.5 px-4 rounded-xl border border-slate-700 hover:border-sky-500/30 transition-all duration-300 text-sm text-center"
        >
          Log Entry
        </button>
      </div>
    </div>
  );
};

export default FlatCard;
