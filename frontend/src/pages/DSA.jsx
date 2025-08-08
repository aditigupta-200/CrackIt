import React, { useState, useEffect } from "react";
import { getDSAQuestions, addDSAQuestion, runCode } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import Editor from "@monaco-editor/react";
import { Play, Plus, X } from "lucide-react";
import Navbar from "../components/Navbar";

const DSA = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    title: "",
    description: "",
    difficulty: "easy",
    tags: "",
    testCases: [{ input: "", expectedOutput: "" }],
  });
  const [testCaseResults, setTestCaseResults] = useState({
    passed: 0,
    failed: 0,
  });
  const [pointsEarned, setPointsEarned] = useState(0);

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
    try {
      const response = await runCode({
        sourceCode: code,
        language,
        questionId: selectedQuestion._id,
        input: "",
      });

      const result = response.data.result;
      console.log("Judge0 Result:", result);
      if (result.status.toLowerCase() === "accepted") {
        setOutput(result.stdout.trim());
        setTestCaseResults({
          passed: response.data.submission.testCasesPassed || 0,
          failed: response.data.submission.testCasesFailed || 0,
        });
        setPointsEarned(response.data.submission.pointsEarned || 0);
      } else {
        setOutput(result.stderr || "Error occurred");
        setTestCaseResults({ passed: 0, failed: 0 });
        setPointsEarned(0);
      }
    } catch (error) {
      console.error("Error details:", error);
      setOutput(error.response?.data?.message || "Error running code");
      setTestCaseResults({ passed: 0, failed: 0 });
      setPointsEarned(0);
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
                    onClick={() => setSelectedQuestion(question)}
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

                      <button
                        onClick={handleRunCode}
                        disabled={loading}
                        className="flex items-center bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
                      >
                        <Play size={16} className="mr-2" />
                        {loading ? "Running..." : "Run Code"}
                      </button>
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

                    {output && (
                      <div className="bg-gray-900 text-white p-4 rounded">
                        <h3 className="font-bold mb-2">Output:</h3>
                        <pre className="whitespace-pre-wrap">{output}</pre>
                        <div className="mt-4">
                          <p className="text-green-400">
                            Test Cases Passed: {testCaseResults.passed}
                          </p>
                          <p className="text-red-400">
                            Test Cases Failed: {testCaseResults.failed}
                          </p>
                          <p className="text-blue-400">
                            Points Earned: {pointsEarned}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end mt-4">
                      <button
                        onClick={handleRunCode}
                        disabled={loading}
                        className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                      >
                        Submit Code
                      </button>
                    </div>
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
