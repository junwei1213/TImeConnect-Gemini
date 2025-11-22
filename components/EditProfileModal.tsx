import React, { useState, useRef } from 'react';
import { UserProfile, InterestType } from '../types';
import { X, Save, Upload, Camera } from 'lucide-react';

interface EditProfileModalProps {
  profile: UserProfile;
  onClose: () => void;
  onSave: (profile: UserProfile) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ profile, onClose, onSave }) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white z-10">
            <h2 className="text-lg font-bold text-slate-800">Edit Profile</h2>
            <button onClick={onClose} className="bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full p-2 transition-colors">
                <X size={18} />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
            
            {/* Image Upload */}
            <div className="flex flex-col items-center">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-slate-50 shadow-lg">
                        <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="text-white" size={28} />
                    </div>
                    <div className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full border-4 border-white shadow-md transition-transform hover:scale-110">
                        <Upload size={14} />
                    </div>
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                />
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Display Name</label>
                    <input 
                        type="text" 
                        name="name"
                        value={formData.name} 
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:bg-white outline-none text-slate-800 font-medium transition-colors"
                        placeholder="e.g. John Doe"
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status</label>
                    <input 
                        type="text" 
                        name="status"
                        value={formData.status} 
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:bg-white outline-none text-slate-800 font-medium transition-colors"
                        placeholder="What's happening?"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Interest Tag</label>
                    <div className="relative">
                        <select 
                            name="interest"
                            value={formData.interest}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:bg-white outline-none text-slate-800 font-medium appearance-none transition-colors"
                        >
                            {Object.values(InterestType).filter(t => t !== 'All').map(i => (
                                <option key={i} value={i}>{i}</option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Bio</label>
                    <textarea 
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:bg-white outline-none text-slate-800 text-sm leading-relaxed resize-none transition-colors"
                        placeholder="Tell others about yourself..."
                    />
                </div>
            </div>

            <div className="pt-2 pb-2">
                <button 
                    type="submit" 
                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-[0.98]"
                >
                    <Save size={18} /> Save Changes
                </button>
            </div>
        </form>

      </div>
    </div>
  );
};

export default EditProfileModal;