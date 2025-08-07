import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getDSAQuestions, getInterviews, getUserBadges } from "../services/api";
import { Code, Calendar, Award, TrendingUp, User } from "lucide-react";
import Navbar from "../components/Navbar";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    questions: 0,
    interviews: 0,
    badges: 0,
    streak: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dsaRes, interviewsRes, badgesRes] = await Promise.all([
          getDSAQuestions(),
          getInterviews(),
          getUserBadges(),
        ]);

        setStats({
          questions: dsaRes.data.length,
          interviews: interviewsRes.data.length,
          badges: badgesRes.data.length,
          streak: user?.streak?.daily || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, [user]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="container mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome back, {user?.username}!
            </h1>
            <p className="text-gray-600 mt-2">
              Role:{" "}
              <span className="capitalize font-semibold">{user?.role}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">DSA Questions</p>
                  <p className="text-2xl font-bold">{stats.questions}</p>
                </div>
                <Code className="text-blue-500" size={32} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Interviews</p>
                  <p className="text-2xl font-bold">{stats.interviews}</p>
                </div>
                <Calendar className="text-green-500" size={32} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Badges</p>
                  <p className="text-2xl font-bold">{stats.badges}</p>
                </div>
                <Award className="text-yellow-500" size={32} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Streak</p>
                  <p className="text-2xl font-bold">{stats.streak}</p>
                </div>
                <TrendingUp className="text-red-500" size={32} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {user?.role === "candidate" && (
                  <>
                    <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded">
                      Solve DSA Problems
                    </button>
                    <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded">
                      Apply for Interviews
                    </button>
                  </>
                )}
                {user?.role === "interviewer" && (
                  <button className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded">
                    Create Interview
                  </button>
                )}
                {user?.role === "super_admin" && (
                  <>
                    <button className="w-full text-left p-3 bg-red-50 hover:bg-red-100 rounded">
                      Add DSA Question
                    </button>
                    <button className="w-full text-left p-3 bg-orange-50 hover:bg-orange-100 rounded">
                      Manage Users
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
              <div className="text-gray-500">
                <p>No recent activity</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
