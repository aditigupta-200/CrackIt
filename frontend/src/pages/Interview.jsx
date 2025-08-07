import React, { useState, useEffect } from "react";
import {
  getInterviews,
  createInterview,
  applyForInterview,
} from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { Calendar, Clock, User, Plus, X, MapPin } from "lucide-react";
import Navbar from "../components/Navbar";

const Interviews = () => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newInterview, setNewInterview] = useState({
    title: "",
    description: "",
    criteria: "",
    scheduledTime: "",
    videoSession: { link: "", accessCode: "" },
  });

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const response = await getInterviews();
      setInterviews(response.data);
    } catch (error) {
      console.error("Error fetching interviews:", error);
    }
  };

  const handleCreateInterview = async (e) => {
    e.preventDefault();
    try {
      await createInterview(newInterview);
      setShowCreateForm(false);
      setNewInterview({
        title: "",
        description: "",
        criteria: "",
        scheduledTime: "",
        videoSession: { link: "", accessCode: "" },
      });
      fetchInterviews();
    } catch (error) {
      console.error("Error creating interview:", error);
    }
  };

  const handleApply = async (interviewId) => {
    try {
      await applyForInterview({ interviewId });
      alert("Applied successfully!");
      fetchInterviews();
    } catch (error) {
      alert(error.response?.data?.message || "Error applying");
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const getStatusColor = (status) => {
    return status === "completed"
      ? "text-gray-600 bg-gray-100"
      : "text-green-600 bg-green-100";
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Interviews</h1>
            {user?.role === "interviewer" && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                <Plus size={16} className="mr-2" />
                Create Interview
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interviews.map((interview) => (
              <div
                key={interview._id}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold">{interview.title}</h3>
                  <div
                    className={`px-2 py-1 rounded text-xs ${getStatusColor(
                      interview.status
                    )}`}
                  >
                    {interview.status}
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{interview.description}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-2 text-blue-500" />
                    <span>{formatDate(interview.scheduledTime)}</span>
                  </div>

                  <div className="flex items-center">
                    <User size={16} className="mr-2 text-green-500" />
                    <span>{interview.interviewer?.username}</span>
                  </div>

                  {interview.criteria && (
                    <div className="flex items-start">
                      <MapPin size={16} className="mr-2 mt-1 text-purple-500" />
                      <span>{interview.criteria}</span>
                    </div>
                  )}
                </div>

                {interview.videoSession?.link && (
                  <div className="mt-4 p-3 bg-blue-50 rounded">
                    <p className="text-sm font-semibold">Video Session:</p>
                    <p className="text-sm text-blue-600 break-all">
                      {interview.videoSession.link}
                    </p>
                    {interview.videoSession.accessCode && (
                      <p className="text-sm">
                        Code: {interview.videoSession.accessCode}
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {interview.candidatesApplied?.length || 0} applicants
                  </span>

                  {user?.role === "candidate" &&
                    interview.status === "upcoming" && (
                      <button
                        onClick={() => handleApply(interview._id)}
                        className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
                      >
                        Apply
                      </button>
                    )}
                </div>
              </div>
            ))}
          </div>

          {interviews.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No interviews available</p>
            </div>
          )}
        </div>

        {/* Create Interview Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Create Interview</h2>
                <button onClick={() => setShowCreateForm(false)}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateInterview}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={newInterview.title}
                    onChange={(e) =>
                      setNewInterview({
                        ...newInterview,
                        title: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    className="w-full p-2 border rounded h-32"
                    value={newInterview.description}
                    onChange={(e) =>
                      setNewInterview({
                        ...newInterview,
                        description: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Criteria</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={newInterview.criteria}
                    onChange={(e) =>
                      setNewInterview({
                        ...newInterview,
                        criteria: e.target.value,
                      })
                    }
                    placeholder="e.g., 3+ years experience in React"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    Scheduled Time
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full p-2 border rounded"
                    value={newInterview.scheduledTime}
                    onChange={(e) =>
                      setNewInterview({
                        ...newInterview,
                        scheduledTime: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    Video Session Link
                  </label>
                  <input
                    type="url"
                    className="w-full p-2 border rounded"
                    value={newInterview.videoSession.link}
                    onChange={(e) =>
                      setNewInterview({
                        ...newInterview,
                        videoSession: {
                          ...newInterview.videoSession,
                          link: e.target.value,
                        },
                      })
                    }
                    placeholder="https://meet.google.com/abc-defg-hij"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">
                    Access Code (Optional)
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={newInterview.videoSession.accessCode}
                    onChange={(e) =>
                      setNewInterview({
                        ...newInterview,
                        videoSession: {
                          ...newInterview.videoSession,
                          accessCode: e.target.value,
                        },
                      })
                    }
                    placeholder="Meeting access code"
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Create Interview
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Interviews;
