import React from 'react';
import { Map, Zap, Bell, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'map' | 'match' | 'alerts' | 'profile';
  onTabChange: (tab: 'map' | 'match' | 'alerts' | 'profile') => void;
  unreadAlerts: number;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, unreadAlerts }) => {
  const navItems = [
    { id: 'map', label: 'Explore', icon: Map },
    { id: 'match', label: 'Match', icon: Zap },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'profile', label: 'Me', icon: User },
  ] as const;

  return (
    <div className="absolute bottom-6 left-4 right-4 z-[3000]">
      <div className="bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl h-16 flex justify-around items-center px-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`relative flex flex-col items-center justify-center w-full h-full transition-all duration-300 ${isActive ? '-translate-y-1' : ''}`}
            >
              <div 
                className={`p-2 rounded-full transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon size={isActive ? 20 : 22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              
              {isActive && (
                <span className="absolute -bottom-2 w-1 h-1 bg-blue-500 rounded-full"></span>
              )}

              {/* Badge for Alerts */}
              {item.id === 'alerts' && unreadAlerts > 0 && (
                <span className="absolute top-2 right-[25%] flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white shadow-sm">
                  {unreadAlerts}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;