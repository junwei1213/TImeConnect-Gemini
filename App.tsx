import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { User, InterestType, Location, UserProfile, Notification } from './types';
import { generateMockUsers, calculateDistance, DEFAULT_CENTER, getInterestColor } from './utils';
import ProfileModal from './components/ProfileModal';
import EditProfileModal from './components/EditProfileModal';
import AIChatModal from './components/AIChatModal';
import BottomNav from './components/BottomNav';
import { Filter, Radar, Crosshair, Globe, Shield, Sliders, X, Sparkles, CheckCircle, Bell, Search, MapPin, BrainCircuit } from 'lucide-react';

// Fix for default Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// --- Helper Components ---

const UserMarker: React.FC<{ user: User; onClick: (u: User) => void }> = ({ user, onClick }) => {
  const customIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="relative group cursor-pointer transition-all duration-300 hover:scale-110">
        <div class="absolute -inset-3 bg-${user.interest === InterestType.BUSINESS ? 'blue' : user.interest === InterestType.DATING ? 'pink' : 'green'}-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div class="relative w-11 h-11 rounded-full border-2 ${user.isConnected ? 'border-green-400' : 'border-white'} shadow-md overflow-hidden bg-white">
          <img src="${user.avatar}" class="w-full h-full object-cover" alt="${user.name}" />
        </div>
        ${user.isConnected ? '<div class="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full flex items-center justify-center text-white text-[8px] font-bold">✓</div>' : ''}
        
        <div class="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50">
           <div class="bg-slate-900/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md shadow-lg font-medium">
             ${user.name}
           </div>
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });

  return (
    <Marker 
      position={[user.location.lat, user.location.lng]} 
      icon={customIcon}
      eventHandlers={{ click: () => onClick(user) }}
    />
  );
};

const MapUpdater = ({ center }: { center: Location }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([center.lat, center.lng], map.getZoom(), { duration: 1.5 });
  }, [center, map]);
  return null; 
};

// --- Main App Component ---

const App: React.FC = () => {
  // --- State ---
  const [activeTab, setActiveTab] = useState<'map' | 'match' | 'alerts' | 'profile'>('map');
  const [mode, setMode] = useState<'Demo' | 'Real'>('Demo');
  const [center, setCenter] = useState<Location>(DEFAULT_CENTER);
  const [users, setUsers] = useState<User[]>([]);
  const [radius, setRadius] = useState<number>(5);
  const [interestFilter, setInterestFilter] = useState<InterestType | 'All'>('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Random Match State
  const [isMatching, setIsMatching] = useState(false);
  const [matchStatus, setMatchStatus] = useState<'idle' | 'searching' | 'pending'>('idle');

  // My Profile
  const [myProfile, setMyProfile] = useState<UserProfile>({
    name: "Guest User",
    interest: InterestType.TECH,
    bio: "I'm new here! Exploring the area.",
    status: "Exploring...",
    avatar: "https://ui-avatars.com/api/?name=Guest+User&background=0F172A&color=fff&font-size=0.33"
  });

  // --- Effects ---

  // Geolocation
  useEffect(() => {
    if (mode === 'Real') {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
          },
          (error) => {
            console.error(error);
            alert("Location error. Switching to Demo.");
            setMode('Demo');
          }
        );
      } else {
        setMode('Demo');
      }
    } else {
      setCenter(DEFAULT_CENTER);
    }
  }, [mode]);

  // Generate Users
  useEffect(() => {
    const initialUsers = generateMockUsers(center, 20);
    setUsers(initialUsers);
  }, [center]);

  // Request Notification Permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  // --- Filtering ---
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const distance = calculateDistance(center, user.location);
      return distance <= radius && (interestFilter === 'All' || user.interest === interestFilter);
    });
  }, [users, radius, interestFilter, center]);

  // --- Handlers ---

  const handleConnect = (userId: string) => {
    setUsers(current => current.map(u => u.id === userId ? { ...u, isConnected: true } : u));
    setSelectedUser(prev => prev && prev.id === userId ? { ...prev, isConnected: true } : prev);
  };

  const handleSaveProfile = (updatedProfile: UserProfile) => {
    setMyProfile(updatedProfile);
  };

  const triggerBrowserNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    }
  };

  const startRandomMatch = () => {
    setMatchStatus('searching');
    setIsMatching(true);

    // 1. Simulate Search
    setTimeout(() => {
      const availableUsers = users.filter(u => !u.isConnected);
      if (availableUsers.length === 0) {
        alert("Everyone is already connected!");
        setMatchStatus('idle');
        setIsMatching(false);
        return;
      }
      
      const randomUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];
      setMatchStatus('pending');

      // 2. Simulate User Acceptance after delay
      setTimeout(() => {
        handleConnect(randomUser.id);
        
        // Add Notification
        const newNotif: Notification = {
          id: Date.now().toString(),
          type: 'match_accepted',
          title: 'Match Accepted!',
          message: `${randomUser.name} accepted your request.`,
          timestamp: Date.now(),
          read: false,
          data: randomUser
        };
        
        setNotifications(prev => [newNotif, ...prev]);
        triggerBrowserNotification("Match Accepted!", `${randomUser.name} is now connected with you.`);
        
        setMatchStatus('idle');
        setIsMatching(false);
        setActiveTab('alerts'); // Switch to alerts to show result
      }, 3500); 

    }, 2000); 
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // --- Render Views ---

  const renderMapView = () => (
    <div className="relative w-full h-full bg-slate-100">
      {/* Map Layer */}
      <MapContainer 
        center={[center.lat, center.lng]} 
        zoom={14} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <MapUpdater center={center} />
        <Circle 
          center={[center.lat, center.lng]}
          radius={radius * 1000} 
          pathOptions={{ color: '#6366f1', fillColor: '#6366f1', fillOpacity: 0.04, weight: 1.5, dashArray: '10 10' }} 
        />
        {/* Me Marker */}
        <Marker 
          position={[center.lat, center.lng]}
          icon={L.divIcon({
            html: `
              <div class="relative flex items-center justify-center w-14 h-14">
                 <div class="absolute w-full h-full bg-indigo-500/20 rounded-full animate-ping"></div>
                 <div class="absolute w-3/4 h-3/4 bg-indigo-500/40 rounded-full animate-pulse"></div>
                 <div class="relative w-10 h-10 rounded-full border-2 border-white shadow-xl overflow-hidden bg-white z-10">
                    <img src="${myProfile.avatar}" class="w-full h-full object-cover" />
                 </div>
              </div>
            `,
            iconSize: [56, 56],
            iconAnchor: [28, 28]
          })}
          zIndexOffset={1000} 
        />
        {filteredUsers.map((user) => (
          <UserMarker key={user.id} user={user} onClick={setSelectedUser} />
        ))}
      </MapContainer>

      {/* Floating Header Controls */}
      <div className="absolute top-0 left-0 right-0 p-4 z-[1000] flex justify-between items-start pointer-events-none">
         
         <div className="flex flex-col gap-2 pointer-events-auto">
            {/* Filter Toggle */}
            <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center justify-center w-12 h-12 rounded-full shadow-lg backdrop-blur-md transition-all duration-300 ${isFilterOpen ? 'bg-slate-900 text-white' : 'bg-white/90 text-slate-700 hover:bg-white'}`}
            >
                {isFilterOpen ? <X size={22} /> : <Sliders size={22} />}
            </button>

            {/* AI Toggle */}
            <button 
                onClick={() => setIsAIChatOpen(true)}
                className="flex items-center justify-center w-12 h-12 rounded-full shadow-lg backdrop-blur-md transition-all duration-300 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white hover:scale-110 active:scale-95 border-2 border-white/20"
                title="AI Concierge"
            >
                <BrainCircuit size={22} />
            </button>
         </div>

         {/* Mode Toggle */}
         <button 
              onClick={() => setMode(m => m === 'Demo' ? 'Real' : 'Demo')}
              className={`pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-full text-xs font-bold transition-all shadow-lg backdrop-blur-md ${mode === 'Real' ? 'bg-green-500/90 text-white' : 'bg-white/90 text-slate-600'}`}
          >
              {mode === 'Real' ? <Globe size={14} /> : <Shield size={14} />}
              {mode === 'Real' ? 'LIVE MODE' : 'DEMO MODE'}
          </button>
      </div>

      {/* Filter Panel (Slide Down) */}
      <div className={`absolute top-20 left-16 right-4 z-[999] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform origin-top-left ${isFilterOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-4 pointer-events-none'}`}>
          <div className="bg-white/90 backdrop-blur-xl p-5 rounded-3xl shadow-2xl border border-white/40 space-y-4">
             {/* Radius */}
             <div>
               <div className="flex justify-between items-center mb-3">
                 <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                   <Crosshair size={14} className="text-indigo-500" /> Search Radius
                 </label>
                 <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{radius} km</span>
               </div>
               <input
                 type="range" min="1" max="20" step="1" value={radius}
                 onChange={(e) => setRadius(Number(e.target.value))}
                 className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-500 transition-all"
               />
               <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
                   <span>1km</span>
                   <span>20km</span>
               </div>
             </div>

             {/* Interest Chips */}
             <div>
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    <Filter size={14} className="text-pink-500" /> Filter Interest
                </label>
                <div className="flex flex-wrap gap-2">
                    <button 
                        onClick={() => setInterestFilter('All')}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${interestFilter === 'All' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                    >
                        All
                    </button>
                    {Object.values(InterestType).filter(t => t !== 'All').map((type) => (
                        <button
                            key={type}
                            onClick={() => setInterestFilter(type)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${interestFilter === type ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
             </div>
          </div>
      </div>
    </div>
  );

  const renderMatchView = () => (
    <div className="h-full w-full bg-slate-50 relative overflow-hidden flex flex-col items-center justify-center">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 animate-gradient"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-200 via-transparent to-transparent"></div>

        <div className="relative z-10 w-full max-w-sm px-6">
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[40px] shadow-2xl border border-white/50 flex flex-col items-center text-center min-h-[450px] justify-center relative overflow-hidden">
                
                {matchStatus === 'idle' && (
                    <div className="animate-in fade-in zoom-in duration-500 flex flex-col items-center">
                        <div className="relative mb-8">
                             <div className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                             <div className="w-28 h-28 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-xl relative z-10">
                                <Sparkles size={48} />
                             </div>
                        </div>
                        
                        <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Discover</h2>
                        <p className="text-slate-500 mb-10 leading-relaxed text-sm max-w-[240px]">
                            Connect with random people nearby. Expand your circle with one tap.
                        </p>
                        
                        <button 
                            onClick={startRandomMatch}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group"
                        >
                            <Radar size={20} className="group-hover:rotate-12 transition-transform" /> 
                            <span>Start Searching</span>
                        </button>
                    </div>
                )}

                {matchStatus === 'searching' && (
                    <div className="flex flex-col items-center w-full">
                        {/* Radar Animation */}
                        <div className="relative w-64 h-64 flex items-center justify-center mb-8">
                             <div className="absolute w-full h-full border border-indigo-100 rounded-full"></div>
                             <div className="absolute w-2/3 h-2/3 border border-indigo-200 rounded-full"></div>
                             <div className="absolute w-1/3 h-1/3 border border-indigo-300 rounded-full"></div>
                             
                             <div className="absolute w-full h-full bg-indigo-500/5 rounded-full animate-radar"></div>
                             <div className="absolute w-full h-full bg-indigo-500/5 rounded-full animate-radar animation-delay-500"></div>
                             
                             <div className="absolute w-full h-1/2 bg-gradient-to-t from-transparent to-indigo-500/10 origin-bottom animate-spin duration-[3s] rounded-t-full mask-image-gradient"></div>

                             <div className="relative z-20 w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden">
                                 <img src={myProfile.avatar} className="w-full h-full object-cover" />
                             </div>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Scanning...</h3>
                        <p className="text-slate-400 text-xs mt-2 uppercase tracking-widest font-semibold">Finding matches nearby</p>
                    </div>
                )}

                {matchStatus === 'pending' && (
                    <div className="flex flex-col items-center animate-in zoom-in-95 duration-500">
                         <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-6 text-amber-600 relative">
                             <Bell size={40} className="animate-bounce" />
                         </div>
                         <h3 className="text-2xl font-bold text-slate-800">Request Sent</h3>
                         <p className="text-slate-500 text-sm mt-3 px-4">
                             We've found a match! Waiting for them to accept your connection request...
                         </p>
                         <div className="mt-8 flex gap-2">
                             <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></span>
                             <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce animation-delay-500"></span>
                             <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce animation-delay-1000"></span>
                         </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );

  const renderAlertsView = () => (
    <div className="h-full w-full bg-slate-50 pt-10 px-4 pb-24 overflow-y-auto">
        <div className="flex items-center justify-between mb-8 px-2">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Activity</h2>
            <div className="bg-white p-2 rounded-full shadow-sm border border-slate-100">
                <Bell size={20} className="text-slate-400" />
            </div>
        </div>
        
        <div className="space-y-4 max-w-md mx-auto">
            {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <Bell size={32} />
                    </div>
                    <p className="font-medium">No notifications yet</p>
                    <p className="text-xs mt-1 text-slate-400">Activity will show up here</p>
                </div>
            ) : (
                notifications.map(notif => (
                    <div 
                        key={notif.id} 
                        className={`bg-white p-5 rounded-2xl shadow-sm border flex gap-4 transition-all duration-200 active:scale-[0.98] ${!notif.read ? 'border-blue-100 shadow-blue-100/50' : 'border-slate-100'}`}
                        onClick={() => {
                            setNotifications(ns => ns.map(n => n.id === notif.id ? { ...n, read: true } : n));
                            if (notif.data) {
                                setSelectedUser(notif.data);
                                setActiveTab('map');
                            }
                        }}
                    >
                        <div className="shrink-0 pt-1">
                            {notif.type === 'match_accepted' ? (
                                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-inner">
                                    <CheckCircle size={24} />
                                </div>
                            ) : (
                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shadow-inner">
                                    <Bell size={24} />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h3 className={`font-bold text-base ${!notif.read ? 'text-slate-900' : 'text-slate-600'}`}>{notif.title}</h3>
                                {!notif.read && <span className="w-2 h-2 bg-blue-500 rounded-full mt-2"></span>}
                            </div>
                            <p className="text-sm text-slate-500 leading-snug mt-1">{notif.message}</p>
                            <span className="text-[10px] text-slate-400 mt-3 block font-medium uppercase tracking-wider">
                                {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  );

  // --- Main Render ---

  return (
    <div className="flex flex-col h-dvh w-full bg-slate-50 overflow-hidden font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Content Area */}
      <div className="flex-1 relative overflow-hidden">
         {activeTab === 'map' && renderMapView()}
         {activeTab === 'match' && renderMatchView()}
         {activeTab === 'alerts' && renderAlertsView()}
         {activeTab === 'profile' && (
             <div className="h-full overflow-y-auto pt-4 pb-24 px-4 bg-slate-50 flex items-center justify-center">
                 <div className="w-full max-w-md">
                    <EditProfileModal 
                        profile={myProfile} 
                        onClose={() => setActiveTab('map')} 
                        onSave={handleSaveProfile} 
                    />
                 </div>
             </div>
         )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        unreadAlerts={unreadCount}
      />

      {/* Modals */}
      <ProfileModal 
        user={selectedUser} 
        onClose={() => setSelectedUser(null)}
        onConnect={handleConnect}
        myLocation={center}
      />

      {isAIChatOpen && (
          <AIChatModal 
              users={filteredUsers} 
              myProfile={myProfile} 
              onClose={() => setIsAIChatOpen(false)} 
          />
      )}

    </div>
  );
};

export default App;