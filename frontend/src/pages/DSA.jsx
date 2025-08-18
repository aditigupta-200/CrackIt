//DSA.jsx
import React, { useState, useEffect } from "react";
import {
  getDSAQuestions,
  addDSAQuestion,
  runCode,
  getUserSubmissionsByQuestion,
} from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import Editor from "@monaco-editor/react";
import {
  Play,
  Plus,
  X,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import Navbar from "../components/Navbar";

const DSA = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [loading, setLoading] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    title: "",
    description: "",
    difficulty: "Easy",
    tags: "",
    constraints: "",
    boilerplates: {
      java: "",
      python: "",
      javascript: "",
      cpp: "",
    },
    testCases: [{ input: "", expectedOutput: "", isHidden: false }],
  });
  const [submissionResult, setSubmissionResult] = useState(null);
  const [activeTab, setActiveTab] = useState("testcases");
  const [userSubmissions, setUserSubmissions] = useState({});

  // Helper function for boilerplate placeholders
  const getBoilerplatePlaceholder = (language) => {
    const placeholders = {
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static int solve(int num1, int num2) {\n        // Your code here\n        return 0;\n    }\n    \n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        int num1 = scanner.nextInt();\n        int num2 = scanner.nextInt();\n        \n        int result = solve(num1, num2);\n        System.out.println(result);\n        \n        scanner.close();\n    }\n}",
      python:
        "def solve(num1: int, num2: int) -> int:\n    # Your code here\n    pass\n    \nif __name__ == '__main__':\n    num1, num2 = map(int, input().split())\n    result = solve(num1, num2)\n    print(result)",
      javascript:
        "const readline = require('readline');\nconst rl = readline.createInterface({\n    input: process.stdin,\n    output: process.stdout\n});\n\nfunction solve(num1, num2) {\n    // Your code here\n    return 0;\n}\n\nrl.on('line', (input) => {\n    const [num1, num2] = input.split(' ').map(Number);\n    const result = solve(num1, num2);\n    console.log(result);\n    rl.close();\n});",
      cpp: "#include <iostream>\nusing namespace std;\n\nint solve(int num1, int num2) {\n    // Your code here\n    return 0;\n}\n\nint main() {\n    int num1, num2;\n    cin >> num1 >> num2;\n    \n    int result = solve(num1, num2);\n    cout << result << endl;\n    \n    return 0;\n}",
    };
    return placeholders[language] || "";
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Load boilerplate code when question or language changes
  useEffect(() => {
    const loadCode = async () => {
      if (selectedQuestion) {
        // First check if user has previous submission for this question
        try {
          // Check if we already have submissions for this question
          let submissions = userSubmissions[selectedQuestion._id];

          if (!submissions) {
            // Fetch user submissions for this question
            const response = await getUserSubmissionsByQuestion(
              selectedQuestion._id
            );
            submissions = response.data;
            setUserSubmissions((prev) => ({
              ...prev,
              [selectedQuestion._id]: submissions,
            }));
          }

          const latestAccepted = submissions.latestAccepted;
          if (latestAccepted && latestAccepted.language === language) {
            setCode(latestAccepted.code);
            return;
          }

          // If no previous submission found, load boilerplate
          if (
            selectedQuestion.boilerplates &&
            selectedQuestion.boilerplates[language]
          ) {
            setCode(selectedQuestion.boilerplates[language]);
          } else {
            // Fallback to default boilerplate if question doesn't have boilerplates
            setCode(getBoilerplatePlaceholder(language));
          }
        } catch (error) {
          console.error("Error loading user submission:", error);
          // Fallback to boilerplate on error
          if (
            selectedQuestion.boilerplates &&
            selectedQuestion.boilerplates[language]
          ) {
            setCode(selectedQuestion.boilerplates[language]);
          } else {
            setCode(getBoilerplatePlaceholder(language));
          }
        }
      }
    };

    loadCode();
  }, [selectedQuestion, language, userSubmissions]);

  const fetchQuestions = async () => {
    try {
      setQuestionsLoading(true);
      console.log("🔍 Fetching DSA questions...");
      const response = await getDSAQuestions();
      console.log("📡 DSA API Response:", response);

      // The API returns { data: { statusCode: 200, data: { questions: [...], pagination: {...} }, message: '...' } }
      const apiData = response.data.data || response.data;
      console.log("🔍 API Data after extraction:", apiData);
      const questionsArray = apiData.questions || apiData || [];
      console.log("📋 Questions array:", questionsArray);
      console.log("📊 Is questions array?", Array.isArray(questionsArray));

      setQuestions(Array.isArray(questionsArray) ? questionsArray : []);
      console.log(
        "✅ Questions set successfully, count:",
        Array.isArray(questionsArray) ? questionsArray.length : 0
      );
    } catch (error) {
      console.error("❌ Error fetching questions:", error);
      console.error("❌ Error details:", error.response?.data);
      setQuestions([]); // Ensure questions is always an array even on error
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleRunCode = async () => {
    if (!selectedQuestion) return;

    setLoading(true);
    setSubmissionResult(null);

    try {
      const response = await runCode({
        sourceCode: code,
        language,
        questionId: selectedQuestion._id,
      });

      console.log("Submission response:", response.data);
      setSubmissionResult(response.data);
      setActiveTab("testcases");
    } catch (error) {
      console.error("Error details:", error);
      setSubmissionResult({
        success: false,
        message: error.response?.data?.message || "Error running code",
        testCaseResults: [],
        submission: {
          status: "Error",
          testCasesPassed: 0,
          testCasesFailed: 0,
          pointsEarned: 0,
        },
      });
    }
    setLoading(false);
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      const questionData = {
        ...newQuestion,
        tags: newQuestion.tags.split(",").map((tag) => tag.trim()),
        // Convert difficulty to lowercase to match backend expectations
        difficulty: newQuestion.difficulty.toLowerCase(),
        // Add required fields that might be missing
        category: "General",
        // Process test cases to convert multi-line inputs to single line format
        testCases: newQuestion.testCases.map((testCase) => ({
          ...testCase,
          // Convert newlines to spaces for execution (trim to remove extra spaces)
          input: testCase.input.replace(/\n/g, " ").trim(),
          // Also process expected output the same way if it has multiple lines
          expectedOutput: testCase.expectedOutput.replace(/\n/g, " ").trim(),
        })),
      };

      console.log("Sending question data:", questionData);

      await addDSAQuestion(questionData);
      setShowAddForm(false);
      setNewQuestion({
        title: "",
        description: "",
        difficulty: "Easy",
        tags: "",
        constraints: "",
        boilerplates: {
          java: "",
          python: "",
          javascript: "",
          cpp: "",
        },
        testCases: [{ input: "", expectedOutput: "", isHidden: false }],
      });
      fetchQuestions();
    } catch (error) {
      console.error("Error adding question:", error);
      console.error("Error response:", error.response?.data);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "text-green-600 bg-green-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "hard":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status, passed) => {
    if (status === "timeout") {
      return <Clock className="w-5 h-5 text-yellow-500" />;
    } else if (status === "error") {
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    } else if (passed) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusText = (testCase) => {
    if (testCase.status === "timeout") return "Time Limit Exceeded";
    if (testCase.status === "error") return "Runtime Error";
    if (testCase.passed) return "Passed";
    return "Wrong Answer";
  };

  const renderTestCaseResults = () => {
    if (!submissionResult || !submissionResult.testCaseResults) return null;

    return (
      <div className="space-y-4">
        {/* Summary */}
        {submissionResult.summary && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">
                {submissionResult.success ? (
                  <span className="text-green-600">
                    ✅ All Test Cases Passed!
                  </span>
                ) : (
                  <span className="text-red-600">
                    ❌ Some Test Cases Failed
                  </span>
                )}
              </h3>
              {submissionResult.submission?.pointsEarned > 0 && (
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  +{submissionResult.submission.pointsEarned} points
                </span>
              )}
            </div>
            <div className="flex space-x-4 text-sm text-gray-600">
              <span>
                {submissionResult.summary.passed}/
                {submissionResult.summary.totalTestCases} test cases passed
              </span>
              <span>({submissionResult.summary.passPercentage}%)</span>
            </div>
          </div>
        )}

        {/* Individual Test Cases */}
        <div className="space-y-3">
          {submissionResult.testCaseResults.map((testCase, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 ${
                testCase.passed
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(testCase.status, testCase.passed)}
                  <span className="font-semibold">
                    Test Case {testCase.testCaseNumber}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      testCase.passed
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {getStatusText(testCase)}
                  </span>
                </div>
                <div className="flex space-x-4 text-sm text-gray-500">
                  {testCase.executionTime && (
                    <span>Time: {testCase.executionTime}s</span>
                  )}
                  {testCase.memory && (
                    <span>Memory: {Math.round(testCase.memory / 1024)}KB</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="font-medium text-gray-700 mb-1">Input:</div>
                  <div className="bg-gray-100 p-2 rounded font-mono text-xs whitespace-pre-wrap">
                    {testCase.input || "No input"}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-700 mb-1">
                    Expected Output:
                  </div>
                  <div className="bg-gray-100 p-2 rounded font-mono text-xs whitespace-pre-wrap">
                    {testCase.expectedOutput}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-700 mb-1">
                    Your Output:
                  </div>
                  <div
                    className={`p-2 rounded font-mono text-xs whitespace-pre-wrap ${
                      testCase.passed ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    {testCase.actualOutput}
                  </div>
                </div>
              </div>

              {testCase.error && (
                <div className="mt-3">
                  <div className="font-medium text-red-700 mb-1">Error:</div>
                  <div className="bg-red-100 p-2 rounded font-mono text-xs text-red-800">
                    {testCase.error}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">DSA Questions</h1>
            {user?.role === "super_admin" && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                <Plus size={16} className="mr-2" />
                Add Question
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Questions List */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-xl font-bold mb-4">Questions</h2>
              <div className="space-y-2">
                {questionsLoading ? (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Loading questions...</p>
                  </div>
                ) : questions.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <p>No questions available</p>
                    <p className="text-sm mt-1">Check console for errors</p>
                  </div>
                ) : (
                  (questions || []).map((question) => {
                    const questionSubmission = userSubmissions[question._id];
                    const isQuestionSolved =
                      questionSubmission && questionSubmission.latestAccepted;

                    return (
                      <div
                        key={question._id}
                        onClick={() => {
                          setSelectedQuestion(question);
                          setSubmissionResult(null); // Reset results when changing questions
                        }}
                        className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                          selectedQuestion?._id === question._id
                            ? "border-blue-500 bg-blue-50"
                            : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-semibold flex items-center">
                            {question.title}
                            {isQuestionSolved && (
                              <CheckCircle
                                size={16}
                                className="text-green-500 ml-2"
                                title="Question solved"
                              />
                            )}
                          </div>
                        </div>
                        <div
                          className={`inline-block px-2 py-1 rounded text-xs ${getDifficultyColor(
                            question.difficulty
                          )}`}
                        >
                          {question.difficulty}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {question.tags?.join(", ") || "No tags"}
                        </div>
                        {isQuestionSolved && (
                          <div className="text-xs text-green-600 mt-1">
                            ✓ Solved in{" "}
                            {questionSubmission.latestAccepted.language}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Code Editor */}
            <div className="lg:col-span-2">
              {selectedQuestion ? (
                <div className="bg-white rounded-lg shadow-md">
                  <div className="p-4 border-b">
                    <h2 className="text-xl font-bold">
                      {selectedQuestion.title}
                    </h2>
                    <div
                      className={`inline-block px-2 py-1 rounded text-xs mt-2 ${getDifficultyColor(
                        selectedQuestion.difficulty
                      )}`}
                    >
                      {selectedQuestion.difficulty}
                    </div>
                    <p className="mt-4 text-gray-700">
                      {selectedQuestion.description}
                    </p>
                    {selectedQuestion.constraints && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <h4 className="font-semibold text-yellow-800 mb-2">
                          Constraints:
                        </h4>
                        <p className="text-sm text-yellow-700 whitespace-pre-line">
                          {selectedQuestion.constraints}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="p-2 border rounded"
                      >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="cpp">C++</option>
                        <option value="java">Java</option>
                      </select>

                      <div className="flex space-x-2">
                        <button
                          onClick={handleRunCode}
                          disabled={loading}
                          className="flex items-center bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
                        >
                          <Play size={16} className="mr-2" />
                          {loading ? "Running..." : "Run Code"}
                        </button>
                        <button
                          onClick={handleRunCode}
                          disabled={loading}
                          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                        >
                          Submit
                        </button>
                      </div>
                    </div>

                    <div className="border rounded mb-4">
                      <Editor
                        height="400px"
                        language={language === "cpp" ? "cpp" : language}
                        value={code}
                        onChange={(value) => setCode(value)}
                        theme="vs-dark"
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                        }}
                      />
                    </div>

                    {/* Results Section */}
                    {submissionResult && (
                      <div className="mt-6">
                        <div className="border-b border-gray-200 mb-4">
                          <nav className="-mb-px flex space-x-8">
                            <button
                              onClick={() => setActiveTab("testcases")}
                              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === "testcases"
                                  ? "border-blue-500 text-blue-600"
                                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                              }`}
                            >
                              Test Cases
                            </button>
                          </nav>
                        </div>

                        {activeTab === "testcases" && renderTestCaseResults()}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <p className="text-gray-500">
                    Select a question to start coding
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Question Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-2xl font-bold">Add New Question</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <form onSubmit={handleAddQuestion}>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      value={newQuestion.title}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
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
                      value={newQuestion.description}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          description: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">
                      Difficulty
                    </label>
                    <select
                      className="w-full p-2 border rounded"
                      value={newQuestion.difficulty}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          difficulty: e.target.value,
                        })
                      }
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      value={newQuestion.tags}
                      onChange={(e) =>
                        setNewQuestion({ ...newQuestion, tags: e.target.value })
                      }
                      placeholder="array, sorting, binary-search"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">
                      Constraints
                    </label>
                    <textarea
                      className="w-full p-2 border rounded h-20"
                      value={newQuestion.constraints}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          constraints: e.target.value,
                        })
                      }
                      placeholder="e.g., 1 ≤ n ≤ 10^5, Time limit: 2s, Memory limit: 256MB"
                    />
                  </div>

                  {/* Boilerplate Code Section */}
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-3 font-semibold">
                      Boilerplate Code
                    </label>
                    <div className="space-y-4">
                      {Object.entries(newQuestion.boilerplates).map(
                        ([lang, code]) => (
                          <div key={lang} className="border rounded-lg p-4">
                            <div className="flex items-center mb-3">
                              <h4 className="text-sm font-medium text-gray-800 capitalize">
                                {lang === "cpp"
                                  ? "C++"
                                  : lang === "javascript"
                                  ? "JavaScript"
                                  : lang.charAt(0).toUpperCase() +
                                    lang.slice(1)}
                              </h4>
                            </div>
                            <textarea
                              className="w-full p-3 border rounded font-mono text-sm"
                              rows="8"
                              value={code}
                              onChange={(e) =>
                                setNewQuestion({
                                  ...newQuestion,
                                  boilerplates: {
                                    ...newQuestion.boilerplates,
                                    [lang]: e.target.value,
                                  },
                                })
                              }
                              placeholder={getBoilerplatePlaceholder(lang)}
                            />
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Test Cases Section */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-gray-700 font-semibold">
                        Test Cases
                      </label>
                      <button
                        type="button"
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        onClick={() => {
                          setNewQuestion({
                            ...newQuestion,
                            testCases: [
                              ...newQuestion.testCases,
                              {
                                input: "",
                                expectedOutput: "",
                                isHidden: false,
                              },
                            ],
                          });
                        }}
                      >
                        Add Test Case
                      </button>
                    </div>
                    {newQuestion.testCases.map((testCase, index) => (
                      <div key={index} className="border rounded-lg p-4 mb-3">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-sm font-medium text-gray-800">
                            Test Case {index + 1}
                          </h4>
                          <div className="flex items-center space-x-3">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={testCase.isHidden}
                                onChange={(e) => {
                                  const updatedTestCases = [
                                    ...newQuestion.testCases,
                                  ];
                                  updatedTestCases[index].isHidden =
                                    e.target.checked;
                                  setNewQuestion({
                                    ...newQuestion,
                                    testCases: updatedTestCases,
                                  });
                                }}
                                className="rounded"
                              />
                              <span className="text-sm text-gray-600">
                                Hidden
                              </span>
                            </label>
                            {newQuestion.testCases.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedTestCases =
                                    newQuestion.testCases.filter(
                                      (_, i) => i !== index
                                    );
                                  setNewQuestion({
                                    ...newQuestion,
                                    testCases: updatedTestCases,
                                  });
                                }}
                                className="text-red-500 hover:text-red-700 text-sm"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">
                              Input
                            </label>
                            <div className="text-xs text-gray-500 mb-2">
                              <div className="mb-1">
                                Enter each input value on a new line:
                              </div>
                              <div className="bg-gray-50 p-2 rounded text-xs font-mono">
                                Example 1 (Two numbers):
                                <br />
                                5<br />
                                3<br />→ Becomes: "5 3"
                              </div>
                              <div className="bg-gray-50 p-2 rounded text-xs font-mono mt-1">
                                Example 2 (Array with spaces):
                                <br />
                                3<br />
                                1 2 3<br />→ Becomes: "3 1 2 3"
                              </div>
                              <div className="text-xs text-blue-600 mt-1">
                                💡 If your input/output naturally contains
                                spaces, just put them on the same line
                              </div>
                            </div>
                            <textarea
                              className="w-full p-2 border rounded font-mono text-sm"
                              rows="4"
                              placeholder="5&#10;3&#10;&#10;(Each value on new line)"
                              value={testCase.input}
                              onChange={(e) => {
                                const updatedTestCases = [
                                  ...newQuestion.testCases,
                                ];
                                updatedTestCases[index].input = e.target.value;
                                setNewQuestion({
                                  ...newQuestion,
                                  testCases: updatedTestCases,
                                });
                              }}
                            />
                            <div className="text-xs text-gray-400 mt-1">
                              Preview: "
                              {testCase.input.replace(/\n/g, " ").trim()}"
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">
                              Expected Output
                            </label>
                            <div className="text-xs text-gray-500 mb-2">
                              <div className="mb-1">
                                Enter the expected result:
                              </div>
                              <div className="bg-gray-50 p-2 rounded text-xs font-mono">
                                Example 1 (Single value):
                                <br />
                                8<br />→ Becomes: "8"
                              </div>
                              <div className="bg-gray-50 p-2 rounded text-xs font-mono mt-1">
                                Example 2 (Multiple values):
                                <br />
                                1 2 3<br />
                                4 5 6<br />→ Becomes: "1 2 3 4 5 6"
                              </div>
                            </div>
                            <textarea
                              className="w-full p-2 border rounded font-mono text-sm"
                              rows="4"
                              placeholder="8&#10;&#10;(Expected result)"
                              value={testCase.expectedOutput}
                              onChange={(e) => {
                                const updatedTestCases = [
                                  ...newQuestion.testCases,
                                ];
                                updatedTestCases[index].expectedOutput =
                                  e.target.value;
                                setNewQuestion({
                                  ...newQuestion,
                                  testCases: updatedTestCases,
                                });
                              }}
                            />
                            <div className="text-xs text-gray-400 mt-1">
                              Preview: "
                              {testCase.expectedOutput
                                .replace(/\n/g, " ")
                                .trim()}
                              "
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end space-x-4 pt-6">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Add Question
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DSA;
