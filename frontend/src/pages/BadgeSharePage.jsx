import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getBadgeById } from "../services/api";
import { Award, Calendar, Target, TrendingUp } from "lucide-react";

const BadgeSharePage = () => {
  const { badgeId } = useParams();
  const [badge, setBadge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBadgeDetails = async () => {
      try {
        setLoading(true);
        const response = await getBadgeById(badgeId);
        setBadge(response.data.data);
      } catch (err) {
        setError("Failed to load badge details");
        console.error("Error fetching badge:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBadgeDetails();
  }, [badgeId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading badge details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Badge Not Found
          </h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!badge) {
    return null;
  }

  const getCriteriaIcon = (type) => {
    switch (type) {
      case "points":
        return <Target className="h-5 w-5" />;
      case "streak":
        return <TrendingUp className="h-5 w-5" />;
      case "total_problems":
        return <Award className="h-5 w-5" />;
      default:
        return <Award className="h-5 w-5" />;
    }
  };

  const getCriteriaDescription = (criteria) => {
    const { type, value, operator } = criteria;
    const operatorText = operator === "greater_equal" ? "at least" : "exactly";

    switch (type) {
      case "points":
        return `Earn ${operatorText} ${value} points`;
      case "streak":
        return `Maintain ${operatorText} ${value} day coding streak`;
      case "total_problems":
        return `Solve ${operatorText} ${value} problems`;
      case "difficulty":
        return `Solve a ${value} difficulty problem`;
      default:
        return `Meet ${type} requirement`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CrackIt
            </h1>
            <p className="text-gray-600 mt-1">Coding Excellence Platform</p>
          </div>
        </div>
      </div>

      {/* Badge Display */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Achievement Header */}
          <div className="mb-8">
            <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Award className="h-4 w-4 mr-2" />
              Badge Earned!
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Congratulations!
            </h2>
            <p className="text-gray-600">
              Someone just earned an amazing badge on CrackIt
            </p>
          </div>

          {/* Badge Icon and Details */}
          <div className="mb-8">
            <div
              className="w-32 h-32 mx-auto rounded-full flex items-center justify-center text-6xl mb-6 shadow-lg"
              style={{ backgroundColor: badge.color }}
            >
              {badge.icon}
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              {badge.name}
            </h3>
            <p className="text-gray-600 text-lg mb-6">{badge.description}</p>

            {/* Badge Criteria */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center justify-center">
                {getCriteriaIcon(badge.criteria.type)}
                <span className="ml-2">Achievement Requirement</span>
              </h4>
              <p className="text-gray-600">
                {getCriteriaDescription(badge.criteria)}
              </p>
              {badge.requiredPoints > 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  Minimum Points: {badge.requiredPoints}
                </p>
              )}
            </div>

            {/* Badge Stats */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-blue-50 rounded-lg p-4">
                <Calendar className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <div className="text-sm text-gray-600">Created</div>
                <div className="font-semibold text-gray-800">
                  {new Date(badge.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <Award className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <div className="text-sm text-gray-600">Category</div>
                <div className="font-semibold text-gray-800 capitalize">
                  {badge.criteria.type.replace("_", " ")}
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="border-t pt-8">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">
              Start Your Coding Journey!
            </h4>
            <p className="text-gray-600 mb-6">
              Join thousands of developers improving their skills on CrackIt
            </p>
            <button
              onClick={() => window.open(window.location.origin, "_blank")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Join CrackIt Now
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Powered by CrackIt - The Ultimate Coding Practice Platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default BadgeSharePage;
