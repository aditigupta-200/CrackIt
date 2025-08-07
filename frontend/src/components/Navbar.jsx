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
