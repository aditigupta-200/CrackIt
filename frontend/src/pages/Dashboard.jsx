// // frontend/src/pages/Dashboard.jsx
// import React, { useState, useEffect } from "react";
// import { useAuth } from "../contexts/AuthContext";
// import {
//   getDSAQuestions,
//   getInterviews,
//   getUserBadges,
//   getUserProgress,
// } from "../services/api";
// import {
//   Code,
//   Calendar,
//   Award,
//   TrendingUp,
//   User,
//   Users,
//   Target,
//   Zap,
//   Trophy,
//   Flame,
//   Star,
//   ChevronRight,
//   Activity,
//   BookOpen,
//   Clock,
//   CheckCircle,
// } from "lucide-react";
// import Navbar from "../components/Navbar";
// import { Link } from "react-router-dom";

// // eslint-disable-next-line no-unused-vars
// const StatCard = ({
//   icon: Icon,
//   title,
//   value,
//   subtitle,
//   color,
//   delay = 0,
//   trend,
//   onClick,
// }) => {
//   const [animatedValue, setAnimatedValue] = useState(0);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       let start = 0;
//       const end = parseInt(value) || 0;
//       const duration = 1000;
//       const increment = end / (duration / 16);

//       const counter = setInterval(() => {
//         start += increment;
//         if (start >= end) {
//           setAnimatedValue(end);
//           clearInterval(counter);
//         } else {
//           setAnimatedValue(Math.floor(start));
//         }
//       }, 16);

//       return () => clearInterval(counter);
//     }, delay);

//     return () => clearTimeout(timer);
//   }, [value, delay]);

//   return (
//     <div
//       className="card-3d hover-lift p-6 rounded-2xl cursor-pointer group animate-fade-in"
//       style={{ animationDelay: `${delay}ms` }}
//       onClick={onClick}
//     >
//       <div className="flex items-center justify-between mb-4">
//         <div
//           className={`p-3 rounded-xl bg-gradient-to-r ${color} shadow-lg group-hover:scale-110 transition-transform duration-300`}
//         >
//           <Icon className="text-white" size={24} />
//         </div>
//         {trend && (
//           <div className="flex items-center space-x-1 text-green-400">
//             <TrendingUp size={14} />
//             <span className="text-xs">+{trend}%</span>
//           </div>
//         )}
//       </div>

//       <div>
//         <p className="text-secondary text-sm mb-1">{title}</p>
//         <p className="text-3xl font-bold counter text-gradient mb-1">
//           {animatedValue}
//         </p>
//         {subtitle && <p className="text-xs text-secondary">{subtitle}</p>}
//       </div>

//       <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
//     </div>
//   );
// };

// // eslint-disable-next-line no-unused-vars
// const QuickActionCard = ({
//   icon: Icon,
//   title,
//   description,
//   color,
//   to,
//   delay = 0,
// }) => (
//   <Link
//     to={to}
//     className="block card-3d hover-lift p-6 rounded-2xl group animate-slide-up"
//     style={{ animationDelay: `${delay}ms` }}
//   >
//     <div className="flex items-center justify-between mb-4">
//       <div
//         className={`p-3 rounded-xl bg-gradient-to-r ${color} shadow-lg group-hover:scale-110 transition-transform duration-300`}
//       >
//         <Icon className="text-white" size={20} />
//       </div>
//       <ChevronRight
//         className="text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all duration-300"
//         size={20}
//       />
//     </div>

//     <div>
//       <h4 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
//         {title}
//       </h4>
//       <p className="text-secondary text-sm">{description}</p>
//     </div>

//     <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
//   </Link>
// );

// const ProgressRing = ({ progress, size = 120, strokeWidth = 8, children }) => {
//   const radius = (size - strokeWidth) / 2;
//   const circumference = radius * 2 * Math.PI;
//   const strokeDasharray = `${circumference} ${circumference}`;
//   const strokeDashoffset = circumference - (progress / 100) * circumference;

//   return (
//     <div className="relative inline-flex items-center justify-center">
//       <svg className="transform -rotate-90" width={size} height={size}>
//         <circle
//           cx={size / 2}
//           cy={size / 2}
//           r={radius}
//           stroke="rgba(255, 255, 255, 0.1)"
//           strokeWidth={strokeWidth}
//           fill="transparent"
//         />
//         <circle
//           cx={size / 2}
//           cy={size / 2}
//           r={radius}
//           stroke="url(#gradient)"
//           strokeWidth={strokeWidth}
//           fill="transparent"
//           strokeDasharray={strokeDasharray}
//           strokeDashoffset={strokeDashoffset}
//           strokeLinecap="round"
//           className="transition-all duration-1000 ease-out"
//         />
//         <defs>
//           <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
//             <stop offset="0%" stopColor="var(--color-primary)" />
//             <stop offset="100%" stopColor="var(--color-accent)" />
//           </linearGradient>
//         </defs>
//       </svg>
//       <div className="absolute inset-0 flex items-center justify-center">
//         {children}
//       </div>
//     </div>
//   );
// };

// const Dashboard = () => {
//   const { user } = useAuth();
//   const [stats, setStats] = useState({
//     questions: 0,
//     interviews: 0,
//     badges: 0,
//     streak: 0,
//   });
//   const [userProgress, setUserProgress] = useState({
//     points: 0,
//     solvedQuestionsCount: 0,
//     streakDays: 0,
//     badges: [],
//   });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         setLoading(true);
//         const [dsaRes, interviewsRes, badgesRes, progressRes] =
//           await Promise.all([
//             getDSAQuestions(),
//             getInterviews(),
//             getUserBadges(),
//             getUserProgress(),
//           ]);

//         setStats({
//           questions: dsaRes.data.length,
//           interviews: interviewsRes.data.length,
//           badges: badgesRes.data.length,
//           streak: progressRes.data.streakDays || 0,
//         });

//         setUserProgress(progressRes.data);
//       } catch (error) {
//         console.error("Error fetching stats:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchStats();
//   }, []);

//   const earnedBadges = userProgress.badges.filter((badge) => badge.earned);

//   const calculateProgress = () => {
//     const totalQuestions = stats.questions;
//     const solvedQuestions = userProgress.solvedQuestionsCount || 0;

//     if (totalQuestions === 0) return 0;

//     if (userProgress.difficultyBreakdown) {
//       const {
//         easy = 0,
//         medium = 0,
//         hard = 0,
//       } = userProgress.difficultyBreakdown;

//       const weightedScore = easy * 1 + medium * 2 + hard * 3;
//       const maxPossibleScore = totalQuestions * 2;

//       return Math.min(
//         Math.round((weightedScore / maxPossibleScore) * 100),
//         100
//       );
//     }

//     const basicProgress = Math.round((solvedQuestions / totalQuestions) * 100);
//     return Math.min(basicProgress, 100);
//   };

//   const progressPercentage = calculateProgress();

//   const getQuickActions = () => {
//     const baseActions = [
//       {
//         icon: User,
//         title: "View Profile",
//         description: "Check your progress and achievements",
//         color: "from-purple-500 to-pink-500",
//         to: "/profile",
//       },
//     ];

//     if (user?.role === "candidate") {
//       return [
//         {
//           icon: Code,
//           title: "Solve Problems",
//           description: "Practice DSA and earn points",
//           color: "from-blue-500 to-cyan-500",
//           to: "/dsa",
//         },
//         {
//           icon: Calendar,
//           title: "Apply for Interviews",
//           description: "Find new opportunities",
//           color: "from-green-500 to-emerald-500",
//           to: "/interviews",
//         },
//         ...baseActions,
//       ];
//     }

//     if (user?.role === "interviewer") {
//       return [
//         {
//           icon: Calendar,
//           title: "Create Interview",
//           description: "Schedule new interviews",
//           color: "from-indigo-500 to-purple-500",
//           to: "/interviews",
//         },
//         {
//           icon: Code,
//           title: "View Problems",
//           description: "Browse DSA questions",
//           color: "from-blue-500 to-cyan-500",
//           to: "/dsa",
//         },
//         ...baseActions,
//       ];
//     }

//     if (user?.role === "super_admin") {
//       return [
//         {
//           icon: Code,
//           title: "Add DSA Question",
//           description: "Create new challenges",
//           color: "from-red-500 to-pink-500",
//           to: "/dsa",
//         },
//         {
//           icon: Users,
//           title: "Manage Users",
//           description: "Admin panel access",
//           color: "from-orange-500 to-red-500",
//           to: "/admin",
//         },
//         ...baseActions,
//       ];
//     }

//     return baseActions;
//   };

//   if (loading) {
//     return (
//       <>
//         <Navbar />
//         <div
//           className="min-h-screen bg-pattern"
//           style={{ background: "var(--color-background)" }}
//         >
//           <div className="container mx-auto p-6">
//             <div className="space-y-6">
//               {/* Loading skeleton */}
//               <div className="skeleton h-20 rounded-2xl"></div>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                 {[...Array(4)].map((_, i) => (
//                   <div key={i} className="skeleton h-32 rounded-2xl"></div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </>
//     );
//   }

//   return (
//     <>
//       <Navbar />
//       <div
//         className="min-h-screen bg-pattern"
//         style={{ background: "var(--color-background)" }}
//       >
//         <div className="container mx-auto p-6">
//           {/* Welcome Section */}
//           <div className="mb-12 text-center animate-fade-in">
//             <div className="relative inline-block">
//               <h1 className="text-5xl md:text-6xl font-bold heading-enhanced mb-4">
//                 Welcome back, {user?.username}!
//               </h1>
//               <div className="absolute -top-4 -right-8 float">
//                 <Zap className="text-primary" size={32} />
//               </div>
//             </div>
//             <p className="text-xl text-secondary mb-6">
//               Ready to code something amazing today?
//             </p>
//             <div className="inline-flex items-center space-x-2 px-4 py-2 glass rounded-full">
//               <div className="w-3 h-3 bg-gradient-to-r from-primary to-accent rounded-full animate-pulse"></div>
//               <span className="text-sm font-medium capitalize">
//                 {user?.role}
//               </span>
//             </div>
//           </div>

//           {/* Main Stats Grid */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
//             <StatCard
//               icon={Target}
//               title="Problems Solved"
//               value={userProgress.solvedQuestionsCount || 0}
//               subtitle={`of ${stats.questions} total`}
//               color="from-blue-500 to-cyan-500"
//               delay={100}
//               trend={12}
//             />

//             <StatCard
//               icon={Trophy}
//               title="Total Points"
//               value={userProgress.points || 0}
//               subtitle="Keep grinding!"
//               color="from-yellow-500 to-orange-500"
//               delay={200}
//               trend={8}
//             />

//             <StatCard
//               icon={Flame}
//               title="Current Streak"
//               value={userProgress.streakDays || 0}
//               subtitle="days in a row"
//               color="from-red-500 to-pink-500"
//               delay={300}
//               trend={userProgress.streakDays > 0 ? 5 : 0}
//             />

//             <StatCard
//               icon={Award}
//               title="Badges Earned"
//               value={earnedBadges.length}
//               subtitle={`of ${userProgress.badges.length} available`}
//               color="from-purple-500 to-indigo-500"
//               delay={400}
//             />
//           </div>

//           {/* Progress Section */}
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
//             {/* Overall Progress */}
//             <div className="card-3d hover-lift p-8 rounded-2xl text-center animate-slide-up">
//               <h3 className="text-xl font-bold mb-6">Overall Progress</h3>
//               <ProgressRing progress={progressPercentage}>
//                 <div className="text-center">
//                   <div className="text-3xl font-bold text-gradient">
//                     {progressPercentage}%
//                   </div>
//                   <div className="text-xs text-secondary">Complete</div>
//                 </div>
//               </ProgressRing>
//               <p className="text-secondary text-sm mt-4">
//                 {userProgress.solvedQuestionsCount} / {stats.questions} problems
//                 solved
//               </p>
//             </div>

//             {/* Recent Activity */}
//             <div
//               className="card-3d hover-lift p-6 rounded-2xl animate-slide-up"
//               style={{ animationDelay: "100ms" }}
//             >
//               <div className="flex items-center space-x-2 mb-4">
//                 <Activity className="text-primary" size={20} />
//                 <h3 className="text-xl font-bold">Recent Activity</h3>
//               </div>
//               <div className="space-y-3">
//                 <div className="flex items-center space-x-3 p-3 bg-surface/50 rounded-lg">
//                   <CheckCircle className="text-green-400" size={16} />
//                   <div className="flex-1">
//                     <p className="text-sm font-medium">Two Sum solved</p>
//                     <p className="text-xs text-secondary">2 hours ago</p>
//                   </div>
//                 </div>
//                 <div className="flex items-center space-x-3 p-3 bg-surface/50 rounded-lg">
//                   <Award className="text-yellow-400" size={16} />
//                   <div className="flex-1">
//                     <p className="text-sm font-medium">Badge earned</p>
//                     <p className="text-xs text-secondary">1 day ago</p>
//                   </div>
//                 </div>
//                 <div className="flex items-center space-x-3 p-3 bg-surface/50 rounded-lg">
//                   <Flame className="text-red-400" size={16} />
//                   <div className="flex-1">
//                     <p className="text-sm font-medium">7-day streak!</p>
//                     <p className="text-xs text-secondary">3 days ago</p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Next Goal */}
//             {userProgress.nextBadge && (
//               <div
//                 className="card-3d hover-lift p-6 rounded-2xl animate-slide-up"
//                 style={{ animationDelay: "200ms" }}
//               >
//                 <div className="flex items-center space-x-2 mb-4">
//                   <Target className="text-primary" size={20} />
//                   <h3 className="text-xl font-bold">Next Goal</h3>
//                 </div>

//                 <div className="text-center mb-4">
//                   <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-3 float">
//                     <Award className="text-white" size={24} />
//                   </div>
//                   <h4 className="font-bold text-lg">
//                     {userProgress.nextBadge.name}
//                   </h4>
//                   <p className="text-sm text-secondary">
//                     {userProgress.nextBadge.description}
//                   </p>
//                 </div>

//                 <div className="relative">
//                   <div className="progress-bar h-3 mb-2">
//                     <div
//                       className="progress-fill h-full"
//                       style={{
//                         width: `${Math.min(
//                           (userProgress.points /
//                             userProgress.nextBadge.requiredPoints) *
//                             100,
//                           100
//                         )}%`,
//                       }}
//                     ></div>
//                   </div>
//                   <div className="flex justify-between text-xs text-secondary">
//                     <span>{userProgress.points} points</span>
//                     <span>{userProgress.nextBadge.requiredPoints} points</span>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Quick Actions */}
//           <div className="mb-12">
//             <h2 className="text-3xl font-bold heading-enhanced mb-8 text-center">
//               Quick Actions
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {getQuickActions().map((action, index) => (
//                 <QuickActionCard
//                   key={action.to}
//                   {...action}
//                   delay={index * 100}
//                 />
//               ))}
//             </div>
//           </div>

//           {/* Recent Achievements */}
//           <div className="card-3d p-8 rounded-2xl animate-slide-up">
//             <div className="flex items-center justify-between mb-6">
//               <div className="flex items-center space-x-3">
//                 <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
//                   <Trophy className="text-white" size={24} />
//                 </div>
//                 <div>
//                   <h2 className="text-3xl font-bold heading-enhanced">
//                     Recent Achievements
//                   </h2>
//                   <p className="text-secondary">Your latest accomplishments</p>
//                 </div>
//               </div>
//               <Link
//                 to="/badges"
//                 className="text-primary hover:text-accent transition-colors text-sm font-medium flex items-center space-x-1"
//               >
//                 <span>View All</span>
//                 <ChevronRight size={16} />
//               </Link>
//             </div>

//             {earnedBadges.length > 0 ? (
//               <div className="space-y-4">
//                 {earnedBadges.slice(0, 5).map((badge, index) => (
//                   <div
//                     key={badge._id || index}
//                     className="flex items-center p-4 glass rounded-xl hover:bg-surface/10 transition-all duration-300 group"
//                   >
//                     <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300">
//                       <Award className="text-white" size={20} />
//                     </div>
//                     <div className="flex-1">
//                       <div className="font-semibold text-lg group-hover:text-primary transition-colors">
//                         {badge.name}
//                       </div>
//                       <div className="text-sm text-secondary">
//                         {badge.description}
//                       </div>
//                     </div>
//                     <div className="text-xs text-secondary">
//                       <Star className="text-yellow-400 inline mr-1" size={14} />
//                       Earned
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-12">
//                 <div className="relative inline-block mb-6">
//                   <div className="w-24 h-24 bg-gradient-to-r from-gray-400/20 to-gray-600/20 rounded-full flex items-center justify-center float">
//                     <Award className="text-secondary/50" size={36} />
//                   </div>
//                 </div>
//                 <h4 className="text-xl font-bold mb-2">No badges earned yet</h4>
//                 <p className="text-secondary mb-6">
//                   Start solving problems to earn your first badge!
//                 </p>
//                 <Link
//                   to="/dsa"
//                   className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl hover:scale-105 transition-transform duration-300 font-medium"
//                 >
//                   <Code size={18} />
//                   <span>Start Solving</span>
//                 </Link>
//               </div>
//             )}
//           </div>

//           {/* Available Resources Stats */}
//           <div
//             className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 animate-slide-up"
//             style={{ animationDelay: "300ms" }}
//           >
//             <StatCard
//               icon={Code}
//               title="Available Questions"
//               value={stats.questions}
//               subtitle="Practice problems"
//               color="from-blue-500 to-cyan-500"
//               delay={500}
//             />

//             <StatCard
//               icon={Calendar}
//               title="Open Interviews"
//               value={stats.interviews}
//               subtitle="Apply now"
//               color="from-green-500 to-emerald-500"
//               delay={600}
//             />

//             <StatCard
//               icon={Award}
//               title="Total Badges"
//               value={userProgress.badges.length}
//               subtitle="Available to earn"
//               color="from-yellow-500 to-orange-500"
//               delay={700}
//             />

//             <StatCard
//               icon={TrendingUp}
//               title="Overall Progress"
//               value={`${progressPercentage}%`}
//               subtitle={`${userProgress.solvedQuestionsCount} / ${stats.questions} problems`}
//               color="from-indigo-500 to-purple-500"
//               delay={800}
//             />
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Dashboard;

import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  getDSAQuestions,
  getInterviews,
  getUserBadges,
  getUserProgress,
} from "../services/api";
import {
  Code,
  Calendar,
  Award,
  TrendingUp,
  User,
  Target,
  Zap,
  Trophy,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    questions: 0,
    interviews: 0,
    badges: 0,
    streak: 0,
  });
  const [userProgress, setUserProgress] = useState({
    points: 0,
    solvedQuestionsCount: 0,
    streakDays: 0,
    badges: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [dsaRes, interviewsRes, badgesRes, progressRes] =
          await Promise.all([
            getDSAQuestions(),
            getInterviews(),
            getUserBadges(),
            getUserProgress(),
          ]);

        setStats({
          questions:
            dsaRes.data?.data?.questions?.length ||
            dsaRes.data?.questions?.length ||
            dsaRes.data?.length ||
            0,
          interviews: interviewsRes.data?.length || 0,
          badges: badgesRes.data?.length || 0,
          streak: progressRes.data?.streakDays || 0,
        });

        setUserProgress(progressRes.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const earnedBadges = userProgress.badges.filter((badge) => badge.earned);

  // Calculate progress based on questions solved and difficulty
  const calculateProgress = () => {
    const totalQuestions = stats.questions;
    const solvedQuestions = userProgress.solvedQuestionsCount || 0;

    if (totalQuestions === 0) return 0;

    // If we have difficulty breakdown, use weighted calculation
    if (userProgress.difficultyBreakdown) {
      const {
        easy = 0,
        medium = 0,
        hard = 0,
      } = userProgress.difficultyBreakdown;

      // Weight: Easy = 1, Medium = 2, Hard = 3
      const weightedScore = easy * 1 + medium * 2 + hard * 3;
      const maxPossibleScore = totalQuestions * 2; // Assuming average difficulty is medium

      return Math.min(
        Math.round((weightedScore / maxPossibleScore) * 100),
        100
      );
    }

    // Basic progress percentage (fallback when no difficulty breakdown available)
    const basicProgress = Math.round((solvedQuestions / totalQuestions) * 100);
    return Math.min(basicProgress, 100);
  };

  const progressPercentage = calculateProgress();

  // Calculate displayed solved questions count
  const getDisplayedSolvedCount = () => {
    return userProgress.solvedQuestionsCount || 0;
  };

  const displayedSolvedCount = getDisplayedSolvedCount();

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

          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Problems Solved</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {loading ? "..." : userProgress.solvedQuestionsCount || 0}
                  </p>
                </div>
                <Target className="text-blue-500" size={32} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Total Points</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {loading ? "..." : userProgress.points || 0}
                  </p>
                </div>
                <Trophy className="text-yellow-500" size={32} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Current Streak</p>
                  <p className="text-2xl font-bold text-green-600">
                    {loading ? "..." : userProgress.streakDays || 0}
                  </p>
                  <p className="text-xs text-gray-500">days</p>
                </div>
                <Zap className="text-green-500" size={32} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Badges Earned</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {loading ? "..." : earnedBadges.length}
                  </p>
                </div>
                <Award className="text-purple-500" size={32} />
              </div>
            </div>
          </div>

          {/* Available Resources */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Available Questions</p>
                  <p className="text-2xl font-bold">{stats.questions}</p>
                </div>
                <Code className="text-blue-500" size={32} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Open Interviews</p>
                  <p className="text-2xl font-bold">{stats.interviews}</p>
                </div>
                <Calendar className="text-green-500" size={32} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Total Badges</p>
                  <p className="text-2xl font-bold">
                    {userProgress.badges.length}
                  </p>
                </div>
                <Award className="text-yellow-500" size={32} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">Overall Progress</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {progressPercentage}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {displayedSolvedCount} / {stats.questions} problems
                  </p>
                </div>
                <TrendingUp className="text-indigo-500" size={32} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {user?.role === "candidate" && (
                  <>
                    <Link
                      to="/dsa"
                      className="block w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                    >
                      <div className="flex items-center">
                        <Code size={20} className="text-blue-600 mr-3" />
                        <div>
                          <div className="font-semibold">
                            Solve DSA Problems
                          </div>
                          <div className="text-sm text-gray-600">
                            Practice and earn points
                          </div>
                        </div>
                      </div>
                    </Link>
                    <Link
                      to="/interviews"
                      className="block w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded transition-colors"
                    >
                      <div className="flex items-center">
                        <Calendar size={20} className="text-green-600 mr-3" />
                        <div>
                          <div className="font-semibold">
                            Apply for Interviews
                          </div>
                          <div className="text-sm text-gray-600">
                            Find opportunities
                          </div>
                        </div>
                      </div>
                    </Link>
                  </>
                )}
                {user?.role === "interviewer" && (
                  <Link
                    to="/interviews"
                    className="block w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded transition-colors"
                  >
                    <div className="flex items-center">
                      <Calendar size={20} className="text-purple-600 mr-3" />
                      <div>
                        <div className="font-semibold">Create Interview</div>
                        <div className="text-sm text-gray-600">
                          Schedule new interviews
                        </div>
                      </div>
                    </div>
                  </Link>
                )}
                {user?.role === "super_admin" && (
                  <>
                    <Link
                      to="/dsa"
                      className="block w-full text-left p-3 bg-red-50 hover:bg-red-100 rounded transition-colors"
                    >
                      <div className="flex items-center">
                        <Code size={20} className="text-red-600 mr-3" />
                        <div>
                          <div className="font-semibold">Add DSA Question</div>
                          <div className="text-sm text-gray-600">
                            Create new challenges
                          </div>
                        </div>
                      </div>
                    </Link>
                    <Link
                      to="/admin"
                      className="block w-full text-left p-3 bg-orange-50 hover:bg-orange-100 rounded transition-colors"
                    >
                      <div className="flex items-center">
                        <User size={20} className="text-orange-600 mr-3" />
                        <div>
                          <div className="font-semibold">Manage Users</div>
                          <div className="text-sm text-gray-600">
                            Admin panel
                          </div>
                        </div>
                      </div>
                    </Link>
                  </>
                )}
                <Link
                  to="/profile"
                  className="block w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded transition-colors"
                >
                  <div className="flex items-center">
                    <User size={20} className="text-gray-600 mr-3" />
                    <div>
                      <div className="font-semibold">View Profile</div>
                      <div className="text-sm text-gray-600">
                        Check your progress
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Recent Badges */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">Recent Achievements</h3>
              {earnedBadges.length > 0 ? (
                <div className="space-y-3">
                  {earnedBadges.slice(0, 5).map((badge, index) => (
                    <div
                      key={badge._id || index}
                      className="flex items-center p-3 bg-yellow-50 rounded"
                    >
                      <Award className="text-yellow-600 mr-3" size={20} />
                      <div>
                        <div className="font-semibold text-sm">
                          {badge.name}
                        </div>
                        <div className="text-xs text-gray-600">
                          {badge.description}
                        </div>
                      </div>
                    </div>
                  ))}
                  {earnedBadges.length > 5 && (
                    <Link
                      to="/badges"
                      className="block text-center text-sm text-blue-600 hover:text-blue-800"
                    >
                      View all badges →
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Award size={48} className="mx-auto mb-3 opacity-50" />
                  <p>No badges earned yet</p>
                  <p className="text-sm">
                    Start solving problems to earn your first badge!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Progress to Next Badge */}
          {userProgress.nextBadge && (
            <div className="mt-6 bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">Next Goal</h3>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">
                      {userProgress.nextBadge.name}
                    </span>
                    <span className="text-sm text-gray-600">
                      {userProgress.points} /{" "}
                      {userProgress.nextBadge.requiredPoints} points
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          (userProgress.points /
                            userProgress.nextBadge.requiredPoints) *
                            100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {userProgress.nextBadge.description}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
