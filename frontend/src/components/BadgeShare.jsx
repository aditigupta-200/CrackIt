import React, { useState, useRef } from "react";
import html2canvas from "html2canvas";
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  WhatsappIcon,
} from "react-share";
import { Download, Share2, X } from "lucide-react";

const BadgeShare = ({ badge, userStats, isOpen, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const badgeRef = useRef(null);

  // Generate shareable image of the badge
  const generateShareImage = async () => {
    setIsGenerating(true);
    try {
      if (badgeRef.current) {
        const canvas = await html2canvas(badgeRef.current, {
          backgroundColor: "#ffffff",
          scale: 2, // Higher quality
          useCORS: true,
          allowTaint: true,
          width: 400,
          height: 400,
          // Force specific styles to avoid unsupported CSS
          ignoreElements: (element) => {
            return element.tagName === "STYLE";
          },
          onclone: (clonedDoc) => {
            // Remove any CSS that might contain unsupported color functions
            const styleSheets = clonedDoc.styleSheets;
            for (let i = 0; i < styleSheets.length; i++) {
              try {
                const sheet = styleSheets[i];
                if (sheet.href && sheet.href.includes("enhanced.css")) {
                  sheet.disabled = true;
                }
              } catch {
                // Ignore cross-origin errors
              }
            }

            // Apply inline styles to ensure compatibility
            const badgeElement = clonedDoc.querySelector("[data-badge-ref]");
            if (badgeElement) {
              badgeElement.style.background =
                "linear-gradient(135deg, #dbeafe, #e0e7ff)";
              badgeElement.style.fontFamily = "Arial, sans-serif";
            }
          },
        });

        const imageDataUrl = canvas.toDataURL("image/png");

        // Download the image
        const link = document.createElement("a");
        link.download = `${badge.name}-badge.png`;
        link.href = imageDataUrl;
        link.click();
      }
    } catch (error) {
      console.error("Error generating share image:", error);
      alert("Failed to generate share image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Share text for social media
  const shareText = `🎉 I just earned the "${badge.name}" badge! 
    
${badge.description}

🏆 Total Points: ${userStats.points}
📚 Problems Solved: ${userStats.solvedQuestionsCount}
🔥 Current Streak: ${userStats.streakDays} days

Check out this amazing coding platform: CrackIt`;

  const shareUrl = `${window.location.origin}/badge-share/${badge._id}`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Share Your Badge!</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Badge Preview for Sharing */}
        <div
          ref={badgeRef}
          data-badge-ref
          className="p-6 rounded-lg text-center mb-6"
          style={{
            width: "400px",
            height: "400px",
            margin: "0 auto",
            background: "linear-gradient(135deg, #dbeafe, #e0e7ff)",
            fontFamily: "Arial, sans-serif",
          }}
        >
          {/* Badge Icon */}
          <div className="mb-4">
            <div
              className="w-24 h-24 mx-auto rounded-full flex items-center justify-center text-4xl mb-4"
              style={{ backgroundColor: badge.color }}
            >
              {badge.icon}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {badge.name}
            </h2>
            <p className="text-gray-600 text-sm mb-4">{badge.description}</p>
          </div>

          {/* Achievement Stats */}
          <div className="bg-white/70 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Achievement Stats
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {userStats.points}
                </div>
                <div className="text-xs text-gray-600">Total Points</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {userStats.solvedQuestionsCount}
                </div>
                <div className="text-xs text-gray-600">Problems Solved</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">
                  {userStats.streakDays}
                </div>
                <div className="text-xs text-gray-600">Day Streak</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {userStats.badges.length}
                </div>
                <div className="text-xs text-gray-600">Total Badges</div>
              </div>
            </div>
          </div>

          {/* Platform Branding */}
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-700">Earned on</div>
            <div
              className="text-xl font-bold"
              style={{
                background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              CrackIt
            </div>
            <div className="text-xs text-gray-500">
              Coding Excellence Platform
            </div>
          </div>
        </div>

        {/* Download Button */}
        <button
          onClick={generateShareImage}
          disabled={isGenerating}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg mb-4 flex items-center justify-center hover:bg-blue-700 disabled:opacity-50"
        >
          <Download size={16} className="mr-2" />
          {isGenerating ? "Generating..." : "Download Badge Image"}
        </button>

        {/* Social Share Buttons */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <Share2 size={16} className="mr-2" />
            Share on Social Media
          </h4>

          <div className="grid grid-cols-4 gap-3">
            <WhatsappShareButton
              url={shareUrl}
              title={shareText}
              className="hover:scale-105 transition-transform"
            >
              <WhatsappIcon size={48} round />
            </WhatsappShareButton>

            <FacebookShareButton
              url={shareUrl}
              quote={shareText}
              className="hover:scale-105 transition-transform"
            >
              <FacebookIcon size={48} round />
            </FacebookShareButton>

            <TwitterShareButton
              url={shareUrl}
              title={shareText}
              className="hover:scale-105 transition-transform"
            >
              <TwitterIcon size={48} round />
            </TwitterShareButton>

            <LinkedinShareButton
              url={shareUrl}
              title={`I earned the ${badge.name} badge!`}
              summary={shareText}
              source="CrackIt"
              className="hover:scale-105 transition-transform"
            >
              <LinkedinIcon size={48} round />
            </LinkedinShareButton>
          </div>
        </div>

        {/* Copy Link Section */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 bg-transparent text-sm text-gray-600 mr-2"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                alert("Link copied to clipboard!");
              }}
              className="text-blue-600 text-sm font-medium hover:text-blue-700"
            >
              Copy Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgeShare;
