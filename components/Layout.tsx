
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, LogOut, Building2, Languages, Database, 
  Plus, Minus, Folder, File, Search, RefreshCw, HardDrive, User as UserIcon
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/apiService';
import { MenuItem } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string, sheet?: string, param?: string) => void;
  onLogout: () => void;
  username: string;
  connectedServer?: string;
  connectedDatabase?: string; 
}

const NavItem: React.FC<any> = ({ page, sheet, label, activePage, isSidebarOpen, onNavigate }) => (
  <button
    onClick={() => onNavigate(page, sheet)}
    className={`w-full flex items-center space-x-2 py-1 px-2 rounded-md transition-all duration-150 group
      ${activePage === page 
        ? 'text-white font-bold bg-primary-700/80 shadow-sm' 
        : 'text-primary-200 hover:text-white hover:bg-white/5'}`}
  >
    <div className="w-4 flex justify-center shrink-0">
      <File size={12} className={activePage === page ? "text-white" : "text-primary-500 group-hover:text-primary-300"} />
    </div>
    {isSidebarOpen && (
      <div className="text-[12px] tracking-tight text-left flex-1 truncate flex items-center gap-1.5 overflow-hidden">
        <span className="truncate">{label}</span>
      </div>
    )}
    {isSidebarOpen && activePage === page && <div className="w-1 h-1 rounded-full bg-emerald-400 mr-1 animate-pulse"></div>}
  </button>
);

const MenuGroup: React.FC<any> = ({ groupKey, label, children, expandedGroups, toggleGroup, isSidebarOpen }) => {
  const isExpanded = expandedGroups[groupKey];
  if (!isSidebarOpen) return <div className="py-2 flex justify-center opacity-60 hover:opacity-100 cursor-pointer"><Folder size={16} className="text-primary-300" /></div>;
  return (
    <div className="mb-0.5">
      <button onClick={() => toggleGroup(groupKey)} className="w-full flex items-center space-x-2 py-1 px-1 rounded hover:bg-white/5 transition-all group">
        <div className="text-primary-400 group-hover:text-white">{isExpanded ? <Minus size={12} strokeWidth={3} /> : <Plus size={12} strokeWidth={3} />}</div>
        <div className="flex items-center space-x-2 flex-1 overflow-hidden">
          <Folder size={13} className={isExpanded ? "text-amber-400" : "text-primary-400"} />
          <span className={`text-[12px] font-semibold truncate text-left ${isExpanded ? 'text-white' : 'text-primary-200'}`}>{label}</span>
        </div>
      </button>
      {isExpanded && <div className="ml-2.5 pl-3 border-l border-primary-800/60 space-y-0.5 mt-0.5">{children}</div>}
    </div>
  );
};

export const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate, onLogout, username, connectedServer, connectedDatabase }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedSystems, setExpandedSystems] = useState<Record<string, boolean>>({});
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [userMenus, setUserMenus] = useState<MenuItem[]>([]);
  const [loadingMenus, setLoadingMenus] = useState(true);
  const { t, language, setLanguage } = useLanguage();

  const loadMenus = async () => {
      if (!username) return;
      setLoadingMenus(true);
      try {
          const menus = await api.getUserMenus(username);
          if (menus && menus.length > 0) {
              setUserMenus(menus);
              const initialSysExpand: Record<string, boolean> = {};
              const initialGrpExpand: Record<string, boolean> = {};
              menus.forEach(m => { 
                if (m.sid) initialSysExpand[String(m.sid)] = true; 
                if (m.pgid) initialGrpExpand[String(m.pgid)] = true;
              });
              setExpandedSystems(initialSysExpand);
              setExpandedGroups(initialGrpExpand);
          } else {
              setUserMenus([]);
          }
      } catch(e) { 
          console.error("Menu Fetch Error:", e); 
          setUserMenus([]);
      }
      finally { setLoadingMenus(false); }
  };

  useEffect(() => {
     loadMenus();
  }, [username]);

  const groupedMenus = useMemo(() => {
      const systems: Record<string, any> = {};
      const order: string[] = [];
      userMenus.forEach(m => {
          const sId = String(m.sid);
          const gId = String(m.pgid);
          if (!systems[sId]) { systems[sId] = { sid: sId, sname: m.sname, sname_2: m.sname_2, groups: [] }; order.push(sId); }
          let g = systems[sId].groups.find((x: any) => x.pgid === gId);
          if (!g) { g = { pgid: gId, pgname: m.pgname, pgname_2: m.pgname_2, items: [] }; systems[sId].groups.push(g); }
          g.items.push(m);
      });
      return order.map(id => systems[id]);
  }, [userMenus]);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-16'} bg-[#0a1622] text-white transition-all duration-300 flex flex-col fixed h-full z-20 shadow-xl border-r border-white/5`}>
        <div className="p-4 flex items-center justify-between border-b border-white/5 h-16 shrink-0 bg-[#08111a]">
          {isSidebarOpen ? <div className="flex items-center space-x-2 overflow-hidden"><div className="text-primary-400 shrink-0"><Building2 size={20} /></div><div className="truncate"><h1 className="font-black text-xs tracking-tighter text-white uppercase leading-none">SENA CORE</h1></div></div> : <div className="mx-auto text-primary-400"><Building2 size={20} /></div>}
        </div>
        <div className="flex-1 overflow-y-auto py-4 px-2 custom-scrollbar space-y-1">
           <button onClick={() => onNavigate('dashboard', 'Dashboard')} className={`w-full flex items-center space-x-2 py-1.5 px-2 rounded hover:bg-white/5 mb-2 transition-all ${activePage === 'dashboard' ? 'text-emerald-400' : 'text-primary-200'}`}>
             <LayoutDashboard size={14} />{isSidebarOpen && <span className="text-[12px] font-bold">{t('menu.dashboard')}</span>}
           </button>
           
           {loadingMenus ? (
               <div className="py-10 text-center opacity-40">
                   <RefreshCw className="animate-spin mx-auto mb-2" size={16} />
                   {isSidebarOpen && <span className="text-[10px] font-bold uppercase tracking-widest">Loading...</span>}
               </div>
           ) : groupedMenus.length === 0 ? (
               <div className="py-10 px-4 text-center opacity-40">
                   <p className="text-[10px] font-bold uppercase leading-relaxed">{isSidebarOpen ? 'No Menu Permissions Found' : 'N/A'}</p>
                   <button onClick={loadMenus} className="mt-2 p-2 hover:bg-white/10 rounded-full transition-colors"><RefreshCw size={14}/></button>
               </div>
           ) : groupedMenus.map(sys => (
               <div key={sys.sid} className="mb-2">
                   {isSidebarOpen && <button onClick={() => setExpandedSystems(p => ({...p, [sys.sid]: !p[sys.sid]}))} className="w-full flex items-center space-x-2 px-1 py-1 group hover:bg-white/5 rounded"><div className="text-primary-600 group-hover:text-primary-400">{expandedSystems[sys.sid] ? <Minus size={10} strokeWidth={4} /> : <Plus size={10} strokeWidth={4} />}</div><span className="text-[10px] font-black text-primary-500 uppercase tracking-widest truncate">{language === 'en' ? (sys.sname_2 || sys.sname) : sys.sname}</span></button>}
                   {(expandedSystems[sys.sid] || !isSidebarOpen) && (
                     <div className={isSidebarOpen ? "mt-1 space-y-0.5" : ""}>
                        {sys.groups.map((g: any) => (
                            <MenuGroup key={g.pgid} groupKey={g.pgid} label={language === 'en' ? (g.pgname_2 || g.pgname) : g.pgname} expandedGroups={expandedGroups} toggleGroup={(key: string) => setExpandedGroups(p => ({...p, [key]: !p[key]}))} isSidebarOpen={isSidebarOpen}>
                                {g.items.map((p: any) => <NavItem key={p.pid} page={p.pid} sheet={p.sheet} label={language === 'en' ? (p.pname_2 || p.pname) : p.pname} activePage={activePage} isSidebarOpen={isSidebarOpen} onNavigate={onNavigate} />)}
                            </MenuGroup>
                        ))}
                     </div>
                   )}
               </div>
           ))}
        </div>
        <div className="p-2 border-t border-white/5 bg-black/20 shrink-0">
           <div className={`flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
              {isSidebarOpen && <div className="flex items-center space-x-2 px-1 py-1 overflow-hidden"><div className="w-6 h-6 rounded bg-primary-700 flex items-center justify-center font-black text-[10px] shrink-0">{username.charAt(0).toUpperCase()}</div><span className="text-[11px] font-medium truncate text-primary-300">{username}</span></div>}
              <button onClick={onLogout} title="Logout" className="text-primary-500 hover:text-rose-400 p-1.5 transition-colors"><LogOut size={14} /></button>
           </div>
        </div>
      </aside>

      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-16'} flex flex-col h-screen overflow-hidden`}>
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm shrink-0 z-10">
           <div className="flex items-center gap-4">
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-400 hover:text-primary-600 transition-colors"><Search size={18} /></button>
             <h2 className="text-sm font-black text-slate-700 tracking-tight uppercase">{t('app.title')}</h2>
           </div>
           
           <div className="flex items-center space-x-4">
              {/* User Identity at Header (TOP) */}
              <div className="flex items-center gap-2 pl-4 border-l border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-primary-800 flex items-center justify-center text-white font-black text-[10px] border border-primary-900 shadow-md transform transition-transform hover:scale-110">
                     {username.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:flex flex-col">
                     <span className="text-[11px] font-black text-slate-800 leading-none">{username}</span>
                     <div className="flex items-center gap-1 mt-0.5">
                        <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">Authorized Access</span>
                     </div>
                  </div>
              </div>

              <div className="hidden lg:flex items-center gap-2">
                {connectedServer && (
                  <div className="flex items-center px-3 py-1 bg-primary-50 text-primary-700 rounded-full border border-primary-100 text-[10px] font-bold gap-2">
                      <Database size={12}/>
                      <span>{connectedServer}</span>
                  </div>
                )}
                {connectedDatabase && (
                  <div className="flex items-center px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 text-[10px] font-bold gap-2">
                      <HardDrive size={12}/>
                      <span>{connectedDatabase}</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  </div>
                )}
              </div>
              <button onClick={() => setLanguage(language === 'en' ? 'th' : 'en')} className="px-2 py-1 bg-white hover:bg-slate-50 rounded border border-slate-200 text-[10px] font-black text-slate-700">{language === 'en' ? 'EN' : 'TH'}</button>
           </div>
        </header>
        <div className="flex-1 overflow-auto p-6 bg-[#f8fafc] custom-scrollbar">
          <div className="max-w-[1600px] mx-auto h-full">{children}</div>
        </div>
      </main>
    </div>
  );
};
