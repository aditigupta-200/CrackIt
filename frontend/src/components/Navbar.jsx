import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { logout } from "../services/api";
import { LogOut, User, Code, Calendar, Award, Bell, Users } from "lucide-react";

const Navbar = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      logoutUser();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (!user) return null;

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/dashboard" className="text-xl font-bold">
          Interview Platform
        </Link>

        <div className="flex space-x-4 items-center">
          <Link to="/dashboard" className="hover:text-blue-200">
            Dashboard
          </Link>
          <Link to="/dsa" className="flex items-center hover:text-blue-200">
            <Code size={16} className="mr-1" />
            DSA
          </Link>
          <Link
            to="/interviews"
            className="flex items-center hover:text-blue-200"
          >
            <Calendar size={16} className="mr-1" />
            Interviews
          </Link>
          <Link to="/badges" className="flex items-center hover:text-blue-200">
            <Award size={16} className="mr-1" />
            Badges
          </Link>
          <Link
            to="/notifications"
            className="flex items-center hover:text-blue-200"
          >
            <Bell size={16} className="mr-1" />
            Notifications
          </Link>

          {user.role === "super_admin" && (
            <Link to="/admin" className="flex items-center hover:text-blue-200">
              <Users size={16} className="mr-1" />
              Admin
            </Link>
          )}

          <div className="flex items-center space-x-2">
            <Link
              to="/profile"
              className="flex items-center hover:text-blue-200"
            >
              <User size={16} className="mr-1" />
              <span>{user.username}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center hover:text-blue-200"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;










// // frontend/src/components/Navbar.jsx
// import React, { useState } from "react";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import { useAuth } from "../contexts/AuthContext";
// import { useTheme } from "../contexts/ThemeContext";
// import { logout } from "../services/api";
// import { 
//   LogOut, 
//   User, 
//   Code, 
//   Calendar, 
//   Award, 
//   Bell, 
//   Users, 
//   Settings,
//   Palette,
//   Sun,
//   Moon,
//   Menu,
//   X,
//   Zap
// } from "lucide-react";

// const Navbar = () => {
//   const { user, logoutUser } = useAuth();
//   const { isDarkMode, currentTheme, themes, toggleDarkMode, changeTheme } = useTheme();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [showMobileMenu, setShowMobileMenu] = useState(false);
//   const [showThemePanel, setShowThemePanel] = useState(false);

//   const handleLogout = async () => {
//     try {
//       await logout();
//       logoutUser();
//       navigate("/login");
//     } catch (error) {
//       console.error("Logout error:", error);
//     }
//   };

//   const navItems = [
//     { to: "/dashboard", label: "Dashboard", icon: User, roles: ["candidate", "interviewer", "super_admin"] },
//     { to: "/dsa", label: "DSA", icon: Code, roles: ["candidate", "interviewer", "super_admin"] },
//     { to: "/interviews", label: "Interviews", icon: Calendar, roles: ["candidate", "interviewer", "super_admin"] },
//     { to: "/badges", label: "Badges", icon: Award, roles: ["candidate", "interviewer", "super_admin"] },
//     { to: "/notifications", label: "Notifications", icon: Bell, roles: ["candidate", "interviewer", "super_admin"] },
//     { to: "/admin", label: "Admin", icon: Users, roles: ["super_admin"] },
//   ];

//   const isActiveRoute = (path) => {
//     return location.pathname === path;
//   };

//   if (!user) return null;

//   return (
//     <>
//       <nav className="navbar-enhanced sticky top-0 z-50 px-4 py-3">
//         <div className="container mx-auto flex justify-between items-center">
//           {/* Logo */}
//           <Link 
//             to="/dashboard" 
//             className="flex items-center space-x-3 group"
//           >
//             <div className="relative">
//               <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
//                 <Code className="text-white" size={20} />
//               </div>
//               <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
//             </div>
//             <div className="hidden md:block">
//               <span className="text-xl font-bold heading-enhanced">
//                 CodeForge
//               </span>
//               <div className="text-xs text-secondary opacity-80">Interview Platform</div>
//             </div>
//           </Link>

//           {/* Desktop Navigation */}
//           <div className="hidden lg:flex items-center space-x-2">
//             {navItems
//               .filter(item => item.roles.includes(user.role))
//               .map((item, index) => (
//                 <Link
//                   key={item.to}
//                   to={item.to}
//                   className={`group relative px-4 py-2 rounded-lg transition-all duration-300 ${
//                     isActiveRoute(item.to)
//                       ? 'bg-primary/20 text-primary'
//                       : 'hover:bg-surface/50 hover:text-primary'
//                   }`}
//                   style={{animationDelay: `${index * 0.1}s`}}
//                 >
//                   <div className="flex items-center space-x-2">
//                     <item.icon size={16} className={`transition-transform group-hover:scale-110 ${isActiveRoute(item.to) ? 'text-primary' : ''}`} />
//                     <span className="font-medium">{item.label}</span>
//                   </div>
//                   {isActiveRoute(item.to) && (
//                     <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-primary to-accent rounded-full"></div>
//                   )}
//                 </Link>
//               ))}
//           </div>

//           {/* Right side controls */}
//           <div className="flex items-center space-x-3">
//             {/* Theme Toggle */}
//             <button
//               onClick={() => setShowThemePanel(!showThemePanel)}
//               className="relative p-2 rounded-lg hover:bg-surface/50 transition-colors group"
//             >
//               <Palette size={20} className="group-hover:text-primary transition-colors" />
//             </button>

//             {/* Dark Mode Toggle */}
//             <button
//               onClick={toggleDarkMode}
//               className="relative p-2 rounded-lg hover:bg-surface/50 transition-colors group"
//             >
//               {isDarkMode ? (
//                 <Sun size={20} className="group-hover:text-yellow-400 transition-colors group-hover:rotate-180 duration-500" />
//               ) : (
//                 <Moon size={20} className="group-hover:text-blue-400 transition-colors group-hover:-rotate-12 duration-500" />
//               )}
//             </button>

//             {/* User Menu */}
//             <div className="flex items-center space-x-3">
//               <Link
//                 to="/profile"
//                 className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-surface/50 transition-colors group"
//               >
//                 <div className="relative">
//                   <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
//                     <User size={14} className="text-white" />
//                   </div>
//                   <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full animate-pulse opacity-30"></div>
//                 </div>
//                 <span className="hidden md:block font-medium group-hover:text-primary transition-colors">
//                   {user.username}
//                 </span>
//               </Link>

//               <button
//                 onClick={handleLogout}
//                 className="p-2 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-colors group"
//                 title="Logout"
//               >
//                 <LogOut size={18} className="group-hover:scale-110 transition-transform" />
//               </button>
//             </div>

//             {/* Mobile Menu Toggle */}
//             <button
//               onClick={() => setShowMobileMenu(!showMobileMenu)}
//               className="lg:hidden p-2 rounded-lg hover:bg-surface/50 transition-colors"
//             >
//               {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
//             </button>
//           </div>
//         </div>

//         {/* Mobile Menu */}
//         {showMobileMenu && (
//           <div className="lg:hidden absolute top-full left-0 right-0 glass rounded-b-2xl border-t border-white/10 p-4 animate-slide-up">
//             <div className="space-y-2">
//               {navItems
//                 .filter(item => item.roles.includes(user.role))
//                 .map((item, index) => (
//                   <Link
//                     key={item.to}
//                     to={item.to}
//                     onClick={() => setShowMobileMenu(false)}
//                     className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
//                       isActiveRoute(item.to)
//                         ? 'bg-primary/20 text-primary'
//                         : 'hover:bg-surface/50 hover:text-primary'
//                     }`}
//                     style={{animationDelay: `${index * 0.05}s`}}
//                   >
//                     <item.icon size={18} />
//                     <span className="font-medium">{item.label}</span>
//                   </Link>
//                 ))}
//             </div>
//           </div>
//         )}

//         {/* Theme Selection Panel */}
//         {showThemePanel && (
//           <div className="absolute top-full right-4 mt-2 glass rounded-2xl p-6 min-w-80 animate-slide-up z-50">
//             <div className="mb-4">
//               <h3 className="text-lg font-bold mb-2">Choose Theme</h3>
//               <p className="text-sm text-secondary">Customize your coding experience</p>
//             </div>
            
//             <div className="grid grid-cols-1 gap-3 mb-6">
//               {Object.entries(themes).map(([key, theme]) => (
//                 <button
//                   key={key}
//                   onClick={() => {
//                     changeTheme(key);
//                     setShowThemePanel(false);
//                   }}
//                   className={`relative p-4 rounded-xl border-2 transition-all duration-300 group ${
//                     currentTheme === key 
//                       ? 'border-primary bg-primary/10' 
//                       : 'border-white/10 hover:border-primary/50'
//                   }`}
//                 >
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center space-x-3">
//                       <div 
//                         className="w-6 h-6 rounded-full"
//                         style={{ background: theme.gradient }}
//                       ></div>
//                       <div className="text-left">
//                         <div className="font-semibold">{theme.name}</div>
//                         <div className="text-xs text-secondary">
//                           {key === 'light' ? 'Clean & minimal' : 'Dark & modern'}
//                         </div>
//                       </div>
//                     </div>
//                     {currentTheme === key && (
//                       <Zap size={16} className="text-primary" />
//                     )}
//                   </div>
                  
//                   {/* Theme preview */}
//                   <div className="mt-3 flex space-x-1">
//                     <div 
//                       className="h-2 w-8 rounded-full" 
//                       style={{ backgroundColor: theme.primary }}
//                     ></div>
//                     <div 
//                       className="h-2 w-6 rounded-full" 
//                       style={{ backgroundColor: theme.secondary }}
//                     ></div>
//                     <div 
//                       className="h-2 w-4 rounded-full" 
//                       style={{ backgroundColor: theme.accent }}
//                     ></div>
//                   </div>
//                 </button>
//               ))}
//             </div>

//             <div className="border-t border-white/10 pt-4">
//               <div className="flex items-center justify-between">
//                 <span className="font-medium">Dark Mode</span>
//                 <button
//                   onClick={toggleDarkMode}
//                   className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
//                     isDarkMode ? 'bg-primary' : 'bg-gray-300'
//                   }`}
//                 >
//                   <div
//                     className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
//                       isDarkMode ? 'translate-x-7' : 'translate-x-1'
//                     }`}
//                   ></div>
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </nav>

//       {/* Overlay to close theme panel */}
//       {showThemePanel && (
//         <div 
//           className="fixed inset-0 z-40" 
//           onClick={() => setShowThemePanel(false)}
//         ></div>
//       )}
//     </>
//   );
// };

// export default Navbar;