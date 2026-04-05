// src/components/agent/AgentSidebar.jsx
import { HiCog, HiMenu, HiChevronLeft } from "react-icons/hi";

export default function AgentSidebar({ NAV, active, setActive, collapsed, setCollapsed, user, onLogout }) {
  return (
    <aside className={`hidden md:flex ${collapsed ? "w-20" : "w-64"} bg-white border-r border-gray-200 flex-col fixed top-0 left-0 h-full z-30 transition-all duration-300`}>

      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100 flex items-center justify-between relative">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <HiCog className="text-white text-lg"/>
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-black text-gray-900 uppercase">InzuTrust</p>
              <p className="text-[10px] text-gray-400 font-bold">Agent Portal</p>
            </div>
          )}
        </div>
        <button onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-7 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-600 shadow-sm z-40">
          {collapsed ? <HiMenu size={12}/> : <HiChevronLeft size={12}/>}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {NAV.map(item => {
          const on = active === item.id;
          return (
            <button key={item.id} onClick={() => setActive(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center ${collapsed ? "justify-center" : "gap-3"} px-4 py-3 rounded-xl text-xs font-black transition ${on ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:bg-gray-50"}`}>
              <item.icon className={`text-xl shrink-0 ${on ? "text-blue-600" : "text-gray-400"}`}/>
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-4 py-5 border-t border-gray-100">
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
          <img
            src={`https://ui-avatars.com/api/?name=${user.firstName||"A"}+${user.lastName||"G"}&background=dbeafe&color=2563eb&bold=true`}
            alt="avatar" className="w-8 h-8 rounded-full shrink-0 border border-gray-100"/>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-black text-gray-900 truncate">{user.firstName} {user.lastName}</p>
              <button onClick={onLogout} className="text-[10px] text-red-500 font-bold hover:underline uppercase">Logout</button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}