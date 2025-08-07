// Notifications.jsx
import React, { useState, useEffect } from "react";
import { getNotifications } from "../services/api";
import { Bell, CheckCircle, AlertCircle } from "lucide-react";
import Navbar from "../components/Navbar";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await getNotifications();
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const getIcon = (status) => {
    return status === "read" ? (
      <CheckCircle size={20} className="text-green-500" />
    ) : (
      <AlertCircle size={20} className="text-blue-500" />
    );
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold mb-6">Notifications</h1>

          {notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`bg-white rounded-lg shadow-md p-4 border-l-4 ${
                    notification.status === "unread"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getIcon(notification.status)}
                      <div>
                        <p className="text-gray-800">{notification.message}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`px-2 py-1 rounded text-xs ${
                        notification.status === "unread"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {notification.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bell size={64} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No notifications</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};


export { Notifications};