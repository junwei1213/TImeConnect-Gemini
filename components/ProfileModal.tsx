import React from 'react';
import { User } from '../types';
import { getInterestColor } from '../utils';
import { X, Navigation, MapPin, ExternalLink, MessageCircle, Lock, UserCheck } from 'lucide-react';

interface ProfileModalProps {
  user: User | null;
  onClose: () => void;
  onConnect: (userId: string) => void;
  myLocation: { lat: number; lng: number };
}

const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose, onConnect, myLocation }) => {
  if (!user) return null;

  const openMap = (platform: 'google' | 'apple' | 'waze') => {
    if (!user.isConnected) return; // Security check

    const { lat, lng } = user.location;
    let url = '';
    
    switch (platform) {
      case 'google':
        url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        break;
      case 'apple':
        url = `http://maps.apple.com/?daddr=${lat},${lng}`;
        break;
      case 'waze':
        url = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
        break;
    }
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[4000] flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-white w-full sm:max-w-sm sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden relative animate-in slide-in-from-bottom-10 duration-300 z-10">
        
        {/* Header Image Background */}
        <div className={`h-36 w-full ${getInterestColor(user.interest)} relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent"></div>
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 transition-colors backdrop-blur-md border border-white/20"
            >
                <X size={20} />
            </button>
        </div>

        {/* Avatar & Main Info */}
        <div className="px-6 relative -mt-16 pb-6 bg-white">
             {/* Avatar Container */}
            <div className="relative inline-block">
                <div className="p-1 bg-white rounded-full">
                    <img src={user.avatar} alt={user.name} className="w-28 h-28 rounded-full object-cover border-4 border-slate-50" />
                </div>
                {user.isConnected && (
                    <div className="absolute bottom-2 right-2 bg-green-500 text-white p-1.5 rounded-full border-4 border-white shadow-sm" title="Connected">
                        <UserCheck size={14} />
                    </div>
                )}
            </div>

            <div className="flex justify-between items-start mt-3">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{user.name}</h2>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-white mt-1 ${getInterestColor(user.interest)} shadow-sm`}>
                        {user.interest}
                    </span>
                </div>
                
                {/* Action Button */}
                <div className="mt-1">
                   {!user.isConnected ? (
                       <button 
                         onClick={() => onConnect(user.id)}
                         className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 font-medium text-sm active:scale-95"
                        >
                           <MessageCircle size={16} /> Connect
                       </button>
                   ) : (
                       <div className="px-4 py-2 bg-green-50 text-green-700 rounded-full border border-green-200 text-sm font-semibold flex items-center gap-2">
                           <MessageCircle size={16} /> Chatting
                       </div>
                   )}
                </div>
            </div>
            
            {/* Bio & Status */}
            <div className="mt-6 space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-slate-600 italic text-sm text-center">"{user.status}"</p>
                </div>
                
                <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">About</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{user.bio}</p>
                </div>
            </div>

            {/* Location Section */}
            <div className="mt-8 mb-4">
                <div className="flex justify-between items-center mb-4">
                     <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <MapPin size={12} /> Location
                    </h3>
                    {!user.isConnected && (
                        <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded-full font-bold flex items-center gap-1 border border-amber-100">
                            <Lock size={10} /> Hidden
                        </span>
                    )}
                </div>
               
               {!user.isConnected ? (
                   <div className="bg-slate-50 rounded-2xl p-6 text-center border-2 border-slate-100 border-dashed">
                       <Lock className="mx-auto text-slate-300 mb-2" size={24} />
                       <p className="text-xs text-slate-500 font-medium">Connect to unlock live location & directions.</p>
                   </div>
               ) : (
                    <div className="grid grid-cols-3 gap-3">
                        <button onClick={() => openMap('google')} className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white hover:bg-blue-50 transition-all border border-slate-200 hover:border-blue-200 shadow-sm active:scale-95">
                            <ExternalLink size={20} className="mb-2 text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-700">Google</span>
                        </button>
                        <button onClick={() => openMap('apple')} className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white hover:bg-slate-50 transition-all border border-slate-200 hover:border-slate-300 shadow-sm active:scale-95">
                            <Navigation size={20} className="mb-2 text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-700">Apple</span>
                        </button>
                        <button onClick={() => openMap('waze')} className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white hover:bg-cyan-50 transition-all border border-slate-200 hover:border-cyan-200 shadow-sm active:scale-95">
                            <Navigation size={20} className="mb-2 text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-700">Waze</span>
                        </button>
                    </div>
               )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;