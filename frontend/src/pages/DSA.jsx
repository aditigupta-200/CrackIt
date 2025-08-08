import React, { useState, useEffect } from "react";
import { getDSAQuestions, addDSAQuestion, runCode } from "../services/api";
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
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    title: "",
    description: "",
    difficulty: "easy",
    tags: "",
    testCases: [{ input: "", expectedOutput: "" }],
  });
  const [submissionResult, setSubmissionResult] = useState(null);
  const [activeTab, setActiveTab] = useState("testcases");

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await getDSAQuestions();
      setQuestions(response.data);
    } catch (error) {
      console.error("Error fetching questions:", error);
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
      };
      await addDSAQuestion(questionData);
      setShowAddForm(false);
      setNewQuestion({
        title: "",
        description: "",
        difficulty: "easy",
        tags: "",
        testCases: [{ input: "", expectedOutput: "" }],
      });
      fetchQuestions();
    } catch (error) {
      console.error("Error adding question:", error);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
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
                {questions.map((question) => (
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
                    <div className="font-semibold">{question.title}</div>
                    <div
                      className={`inline-block px-2 py-1 rounded text-xs ${getDifficultyColor(
                        question.difficulty
                      )}`}
                    >
                      {question.difficulty}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {question.tags.join(", ")}
                    </div>
                  </div>
                ))}
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Add New Question</h2>
                <button onClick={() => setShowAddForm(false)}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddQuestion}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={newQuestion.title}
                    onChange={(e) =>
                      setNewQuestion({ ...newQuestion, title: e.target.value })
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
                  <label className="block text-gray-700 mb-2">Difficulty</label>
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
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
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
                  <label className="block text-gray-700 mb-2">Test Cases</label>
                  {newQuestion.testCases.map((testCase, index) => (
                    <div key={index} className="mb-2">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          className="w-1/2 p-2 border rounded"
                          placeholder="Input"
                          value={testCase.input}
                          onChange={(e) => {
                            const updatedTestCases = [...newQuestion.testCases];
                            updatedTestCases[index].input = e.target.value;
                            setNewQuestion({
                              ...newQuestion,
                              testCases: updatedTestCases,
                            });
                          }}
                        />
                        <input
                          type="text"
                          className="w-1/2 p-2 border rounded"
                          placeholder="Expected Output"
                          value={testCase.expectedOutput}
                          onChange={(e) => {
                            const updatedTestCases = [...newQuestion.testCases];
                            updatedTestCases[index].expectedOutput =
                              e.target.value;
                            setNewQuestion({
                              ...newQuestion,
                              testCases: updatedTestCases,
                            });
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        className="text-red-500 mt-1"
                        onClick={() => {
                          const updatedTestCases = newQuestion.testCases.filter(
                            (_, i) => i !== index
                          );
                          setNewQuestion({
                            ...newQuestion,
                            testCases: updatedTestCases,
                          });
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="text-blue-500 mt-2"
                    onClick={() => {
                      setNewQuestion({
                        ...newQuestion,
                        testCases: [
                          ...newQuestion.testCases,
                          { input: "", expectedOutput: "" },
                        ],
                      });
                    }}
                  >
                    Add Test Case
                  </button>
                </div>

                <div className="flex justify-end space-x-4">
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
        )}
      </div>
    </>
  );
};

export default DSA;
