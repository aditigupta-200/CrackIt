import mongoose from "mongoose";
import DSAQuestion from "./models/DSAQuestion.js";
import User from "./models/User.js";
import { config } from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config();

const seedDSAQuestions = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing DSA questions
    await DSAQuestion.deleteMany({});
    console.log("Cleared existing DSA questions");

    // Get or create a system user for seeding
    let systemUser = await User.findOne({ email: "system@crackit.com" });
    if (!systemUser) {
      systemUser = await User.create({
        email: "system@crackit.com",
        username: "system",
        fullName: "System User",
        password: "temp123", // This will be hashed
        role: "super_admin",
      });
    }

    // Read sample question from JSON file
    const sampleQuestionPath = path.join(__dirname, "../sampleQuestion.json");
    const sampleQuestionData = JSON.parse(
      fs.readFileSync(sampleQuestionPath, "utf8")
    );

    // Create boilerplates Map
    const boilerplateMap = new Map();
    Object.entries(sampleQuestionData.boilerplates).forEach(([lang, code]) => {
      boilerplateMap.set(lang.toLowerCase(), code);
    });

    // Create the sample question
    const sampleQuestion = await DSAQuestion.create({
      title: sampleQuestionData.title,
      description: sampleQuestionData.description,
      difficulty: sampleQuestionData.difficulty, // Keep original capitalization
      tags: sampleQuestionData.tags,
      constraints: sampleQuestionData.constraints,
      boilerplates: boilerplateMap,
      createdBy: systemUser._id,
      testCases: sampleQuestionData.testCases.map((tc) => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isHidden: tc.isHidden || false, // Use isHidden as per model
      })),
    });

    console.log("✅ Sample DSA question created:", sampleQuestion.title);

    // Add more questions for variety
    const additionalQuestions = [
      {
        title: "Reverse a String",
        description:
          "Given a string s, reverse it and return the reversed string.\n\nExample 1:\nInput: s = 'hello'\nOutput: 'olleh'\n\nExample 2:\nInput: s = 'world'\nOutput: 'dlrow'",
        difficulty: "Easy",
        tags: ["String", "Two Pointers"],
        constraints: "1 <= s.length <= 10^4",
        createdBy: systemUser._id,
        testCases: [
          {
            input: "hello",
            expectedOutput: "olleh",
            isHidden: false,
          },
          {
            input: "world",
            expectedOutput: "dlrow",
            isHidden: false,
          },
          { input: "a", expectedOutput: "a", isHidden: true },
        ],
        boilerplates: new Map([
          [
            "javascript",
            "function reverseString(s) {\n    // USER_CODE_HERE\n}\n\nconst readline = require('readline');\nconst rl = readline.createInterface({\n    input: process.stdin,\n    output: process.stdout\n});\n\nrl.on('line', (input) => {\n    const result = reverseString(input.trim());\n    console.log(result);\n    rl.close();\n});",
          ],
          [
            "python",
            "def reverse_string(s: str) -> str:\n    # USER_CODE_HERE\n    pass\n\nif __name__ == '__main__':\n    s = input().strip()\n    result = reverse_string(s)\n    print(result)",
          ],
          [
            "cpp",
            "#include <iostream>\n#include <string>\nusing namespace std;\n\nstring reverseString(string s) {\n    // USER_CODE_HERE\n}\n\nint main() {\n    string s;\n    getline(cin, s);\n    \n    string result = reverseString(s);\n    cout << result << endl;\n    \n    return 0;\n}",
          ],
          [
            "java",
            'import java.util.Scanner;\n\npublic class Main {\n    public static String reverseString(String s) {\n        // USER_CODE_HERE\n        return "";\n    }\n    \n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        String s = scanner.nextLine();\n        \n        String result = reverseString(s);\n        System.out.println(result);\n        \n        scanner.close();\n    }\n}',
          ],
        ]),
      },
      {
        title: "Find Maximum in Array",
        description:
          "Given an array of integers, find and return the maximum element.\n\nExample 1:\nInput: [3, 1, 4, 1, 5]\nOutput: 5\n\nExample 2:\nInput: [-1, -3, -2]\nOutput: -1",
        difficulty: "Easy",
        tags: ["Array", "Math"],
        constraints: "1 <= array.length <= 10^4",
        createdBy: systemUser._id,
        testCases: [
          {
            input: "5\n3 1 4 1 5",
            expectedOutput: "5",
            isHidden: false,
          },
          {
            input: "3\n-1 -3 -2",
            expectedOutput: "-1",
            isHidden: false,
          },
          {
            input: "1\n42",
            expectedOutput: "42",
            isHidden: true,
          },
        ],
        boilerplates: new Map([
          [
            "javascript",
            "function findMax(arr) {\n    // USER_CODE_HERE\n}\n\nconst readline = require('readline');\nconst rl = readline.createInterface({\n    input: process.stdin,\n    output: process.stdout\n});\n\nlet input = [];\nrl.on('line', (line) => {\n    input.push(line);\n    if (input.length === 2) {\n        const n = parseInt(input[0]);\n        const arr = input[1].split(' ').map(Number);\n        const result = findMax(arr);\n        console.log(result);\n        rl.close();\n    }\n});",
          ],
          [
            "python",
            "def find_max(arr: list) -> int:\n    # USER_CODE_HERE\n    pass\n\nif __name__ == '__main__':\n    n = int(input())\n    arr = list(map(int, input().split()))\n    result = find_max(arr)\n    print(result)",
          ],
          [
            "cpp",
            "#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint findMax(vector<int>& arr) {\n    // USER_CODE_HERE\n}\n\nint main() {\n    int n;\n    cin >> n;\n    \n    vector<int> arr(n);\n    for (int i = 0; i < n; i++) {\n        cin >> arr[i];\n    }\n    \n    int result = findMax(arr);\n    cout << result << endl;\n    \n    return 0;\n}",
          ],
          [
            "java",
            "import java.util.Scanner;\n\npublic class Main {\n    public static int findMax(int[] arr) {\n        // USER_CODE_HERE\n        return 0;\n    }\n    \n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        int n = scanner.nextInt();\n        int[] arr = new int[n];\n        \n        for (int i = 0; i < n; i++) {\n            arr[i] = scanner.nextInt();\n        }\n        \n        int result = findMax(arr);\n        System.out.println(result);\n        \n        scanner.close();\n    }\n}",
          ],
        ]),
      },
      {
        title: "Two Sum",
        description:
          "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nExample 1:\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].\n\nExample 2:\nInput: nums = [3,2,4], target = 6\nOutput: [1,2]",
        difficulty: "Medium",
        tags: ["Array", "Hash Table"],
        constraints: "2 <= nums.length <= 10^4",
        createdBy: systemUser._id,
        testCases: [
          {
            input: "4\n2 7 11 15\n9",
            expectedOutput: "0 1",
            isHidden: false,
          },
          {
            input: "3\n3 2 4\n6",
            expectedOutput: "1 2",
            isHidden: false,
          },
          {
            input: "2\n3 3\n6",
            expectedOutput: "0 1",
            isHidden: true,
          },
        ],
        boilerplates: new Map([
          [
            "javascript",
            "function twoSum(nums, target) {\n    // USER_CODE_HERE\n    // Return an array of two indices\n}\n\nconst readline = require('readline');\nconst rl = readline.createInterface({\n    input: process.stdin,\n    output: process.stdout\n});\n\nlet input = [];\nrl.on('line', (line) => {\n    input.push(line);\n    if (input.length === 3) {\n        const n = parseInt(input[0]);\n        const nums = input[1].split(' ').map(Number);\n        const target = parseInt(input[2]);\n        const result = twoSum(nums, target);\n        console.log(result.join(' '));\n        rl.close();\n    }\n});",
          ],
          [
            "python",
            "def two_sum(nums: list, target: int) -> list:\n    # USER_CODE_HERE\n    # Return a list of two indices\n    pass\n\nif __name__ == '__main__':\n    n = int(input())\n    nums = list(map(int, input().split()))\n    target = int(input())\n    result = two_sum(nums, target)\n    print(' '.join(map(str, result)))",
          ],
          [
            "cpp",
            '#include <iostream>\n#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    // USER_CODE_HERE\n    // Return a vector of two indices\n}\n\nint main() {\n    int n;\n    cin >> n;\n    \n    vector<int> nums(n);\n    for (int i = 0; i < n; i++) {\n        cin >> nums[i];\n    }\n    \n    int target;\n    cin >> target;\n    \n    vector<int> result = twoSum(nums, target);\n    cout << result[0] << " " << result[1] << endl;\n    \n    return 0;\n}',
          ],
          [
            "java",
            'import java.util.*;\n\npublic class Main {\n    public static int[] twoSum(int[] nums, int target) {\n        // USER_CODE_HERE\n        // Return an array of two indices\n        return new int[2];\n    }\n    \n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        int n = scanner.nextInt();\n        int[] nums = new int[n];\n        \n        for (int i = 0; i < n; i++) {\n            nums[i] = scanner.nextInt();\n        }\n        \n        int target = scanner.nextInt();\n        int[] result = twoSum(nums, target);\n        System.out.println(result[0] + " " + result[1]);\n        \n        scanner.close();\n    }\n}',
          ],
        ]),
      },
    ];

    // Create additional questions
    for (const questionData of additionalQuestions) {
      const question = await DSAQuestion.create(questionData);
      console.log("✅ Additional DSA question created:", question.title);
    }

    console.log("🎉 DSA questions seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding DSA questions:", error);
    process.exit(1);
  }
};

seedDSAQuestions();
