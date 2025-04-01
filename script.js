// Quiz Application JavaScript

// API Configuration (NOTE: In a production environment, API keys should not be exposed in frontend code)
const API_KEY = "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";
const API_URL = "https://api.groq.com/openai/v1/chat/completions";

// Global Variables
let quiz = [];
let currentQuestionIndex = 0;
let quizResults = [];
let timerInterval;
let timeRemaining;
let retryQuestions = [];
let currentRetryIndex = 0;

// DOM Elements - Setup Form
const setupForm = document.getElementById('setup-form');
const quizSetupSection = document.getElementById('quiz-setup');
const loadingSection = document.getElementById('loading-section');
const quizQuestionsSection = document.getElementById('quiz-questions');
const quizResultsSection = document.getElementById('quiz-results');
const detailedReportSection = document.getElementById('detailed-report');
const retrySection = document.getElementById('retry-section');

// DOM Elements - Quiz Questions
const questionCounter = document.getElementById('question-counter');
const currentQuestionElement = document.getElementById('current-question');
const totalQuestionsElement = document.getElementById('total-questions');
const timeDisplay = document.getElementById('time-display');
const questionText = document.getElementById('question-text');
const optionsContainer = document.querySelector('.options-container');
const hintButton = document.getElementById('hint-button');
const hintText = document.getElementById('hint-text');
const answerFeedback = document.getElementById('answer-feedback');
const feedbackMessage = document.getElementById('feedback-message');
const nextQuestionButton = document.getElementById('next-question');

// DOM Elements - Results
const correctCountElement = document.getElementById('correct-count');
const totalCountElement = document.getElementById('total-count');
const avgTimeElement = document.getElementById('avg-time');
const minTimeElement = document.getElementById('min-time');
const maxTimeElement = document.getElementById('max-time');
const retryIncorrectButton = document.getElementById('retry-incorrect');
const viewReportButton = document.getElementById('view-report');
const newQuizButton = document.getElementById('new-quiz');
const reportContainer = document.getElementById('report-container');
const backToResultsButton = document.getElementById('back-to-results');

// DOM Elements - Retry
const retryQuestionText = document.getElementById('retry-question-text');
const retryOptionsContainer = document.getElementById('retry-options');
const improvedHintElement = document.getElementById('improved-hint');
const retryAnswerFeedback = document.getElementById('retry-answer-feedback');
const retryFeedbackMessage = document.getElementById('retry-feedback-message');
const nextRetryButton = document.getElementById('next-retry');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    setupForm.addEventListener('submit', handleQuizSetup);
    hintButton.addEventListener('click', getHint);
    nextQuestionButton.addEventListener('click', goToNextQuestion);
    retryIncorrectButton.addEventListener('click', startRetry);
    viewReportButton.addEventListener('click', showDetailedReport);
    newQuizButton.addEventListener('click', resetQuiz);
    backToResultsButton.addEventListener('click', goBackToResults);
    nextRetryButton.addEventListener('click', goToNextRetryQuestion);

    // Add event listeners to options (will be selected by clicking anywhere in the option)
    const options = document.querySelectorAll('.option');
    options.forEach(option => {
        option.addEventListener('click', () => selectOption(option));
    });
});

// Quiz Setup Handler
async function handleQuizSetup(event) {
    event.preventDefault();

    // Get form values
    const topic = document.getElementById('topic').value;
    const difficulty = document.querySelector('input[name="difficulty"]:checked').value;
    const numQuestions = parseInt(document.getElementById('num-questions').value);
    const timeLimit = parseFloat(document.getElementById('time-limit').value);

    // Show loading screen
    quizSetupSection.classList.add('hidden');
    loadingSection.classList.remove('hidden');
    document.getElementById('loading-message').textContent = `Fetching questions for topic: ${topic}...`;

    // Get difficulty description
    const difficultyDescription = getDifficultyDescription(parseInt(difficulty));

    try {
        // Fetch questions from API
        const questions = await fetchQuestions(topic, difficulty, difficultyDescription, numQuestions);

        if (questions.length === 0) {
            throw new Error("Failed to generate valid questions");
        }

        // Initialize quiz
        quiz = questions;
        currentQuestionIndex = 0;
        quizResults = [];

        // Set up timer
        timeRemaining = timeLimit * 60; // Convert to seconds

        // Update UI
        totalQuestionsElement.textContent = quiz.length;

        // Start the quiz
        loadingSection.classList.add('hidden');
        quizQuestionsSection.classList.remove('hidden');
        displayQuestion(currentQuestionIndex);
        startTimer();

    } catch (error) {
        console.error("Error setting up quiz:", error);
        document.getElementById('loading-message').textContent = `Error: ${error.message}. Please try again.`;

        // Add a retry button to loading screen
        const retryButton = document.createElement('button');
        retryButton.textContent = 'Try Again';
        retryButton.className = 'btn';
        retryButton.addEventListener('click', () => {
            loadingSection.classList.add('hidden');
            quizSetupSection.classList.remove('hidden');
        });
        loadingSection.appendChild(retryButton);
    }
}

// Get difficulty description
function getDifficultyDescription(difficulty) {
    switch(difficulty) {
        case 1: return "basic general knowledge";
        case 2: return "intermediate (average)";
        case 3: return "just above medium difficulty";
        case 4: return "advanced";
        case 5: return "expert-level and in-depth";
        default: return "intermediate";
    }
}

// API Call to Fetch Questions
async function fetchQuestions(topic, difficulty, difficultyDescription, numQuestions) {
    const prompt = `Generate ${numQuestions} multiple-choice questions about ${topic} in JSON format. Include a mix of question types such as standard MCQs, true/false questions, and fill-in-the-blank questions, all formatted as multiple choice with 4 options. Each question must be an object with keys: "question" (string), "options" (array of 4 strings), and "correctAnswer" (letter A/B/C/D). Design the questions for difficulty level ${difficulty} (${difficultyDescription}). Output only valid JSON.`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    {
                        "role": "system",
                        "content": "Provide concise and helpful responses."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed with status: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        // Extract and parse JSON
        const sanitizedContent = sanitizeResponse(content);
        const questionsJson = JSON.parse(sanitizedContent);

        // Validate and format questions
        return questionsJson.map(item => ({
            question: item.question,
            options: item.options,
            correctAnswer: item.correctAnswer.toUpperCase().charAt(0)
        }));

    } catch (error) {
        console.error("Error fetching questions:", error);
        throw new Error("Failed to generate questions. Please try again.");
    }
}

// Sanitize API Response
function sanitizeResponse(response) {
    let sanitized = response;
    const codeBlockStart = sanitized.indexOf("```");

    if (codeBlockStart !== -1) {
        const codeBlockEnd = sanitized.lastIndexOf("```");
        if (codeBlockEnd !== -1 && codeBlockEnd > codeBlockStart) {
            sanitized = sanitized.substring(codeBlockStart + 3, codeBlockEnd).trim();

            // Remove language identifier if present
            const firstNewline = sanitized.indexOf("\n");
            if (firstNewline !== -1 && firstNewline < 20) { // Assume language identifier is short
                if (sanitized.substring(0, firstNewline).match(/^(json|javascript|js)$/i)) {
                    sanitized = sanitized.substring(firstNewline + 1);
                }
            }
        }
    }

    return sanitized.trim();
}

// Display Current Question
function displayQuestion(index) {
    const question = quiz[index];

    // Update question counter
    currentQuestionElement.textContent = index + 1;

    // Set question text
    questionText.textContent = question.question;

    // Set options
    const optionElements = document.querySelectorAll('.option');

    for (let i = 0; i < 4; i++) {
        const optionLetter = String.fromCharCode(65 + i); // A, B, C, D
        const optionElement = optionElements[i];

        // Reset classes
        optionElement.className = 'option';
        optionElement.dataset.option = optionLetter;

        // Set option text
        optionElement.querySelector('.option-letter').textContent = optionLetter;
        optionElement.querySelector('.option-text').textContent = question.options[i];
    }

    // Reset UI elements
    hintText.classList.add('hidden');
    answerFeedback.classList.add('hidden');
    nextQuestionButton.classList.add('hidden');

    // Track question start time
    question.startTime = Date.now();
}

// Select an Option
function selectOption(optionElement) {
    // Prevent selection after answer is revealed
    if (nextQuestionButton.classList.contains('hidden') === false) {
        return;
    }

    // Remove selected class from all options
    const options = document.querySelectorAll('.option');
    options.forEach(opt => opt.classList.remove('selected'));

    // Add selected class to clicked option
    optionElement.classList.add('selected');

    // Get selected option letter
    const selectedOption = optionElement.dataset.option;

    // Get current question
    const question = quiz[currentQuestionIndex];

    // Calculate time taken
    const timeTaken = (Date.now() - question.startTime) / 1000; // Convert to seconds

    // Check if answer is correct
    const isCorrect = selectedOption === question.correctAnswer;

    // Record result
    const result = {
        question: question,
        initialAnswer: selectedOption,
        correctInitial: isCorrect,
        retried: false,
        retryAnswer: null,
        correctRetry: false,
        explanation: null,
        initialTimeTaken: timeTaken,
        retryTimeTaken: 0
    };

    quizResults.push(result);

    // Show feedback
    showAnswerFeedback(isCorrect);

    // Highlight correct and incorrect answers
    highlightAnswers(selectedOption, question.correctAnswer);

    // Show next question button
    nextQuestionButton.classList.remove('hidden');
}

// Show Answer Feedback
function showAnswerFeedback(isCorrect) {
    answerFeedback.classList.remove('hidden');

    if (isCorrect) {
        answerFeedback.className = 'correct';
        feedbackMessage.textContent = '✅ Correct!';
    } else {
        answerFeedback.className = 'incorrect';
        feedbackMessage.textContent = '❌ Incorrect!';
    }
}

// Highlight Correct and Incorrect Answers
function highlightAnswers(selectedOption, correctOption) {
    const options = document.querySelectorAll('.option');

    options.forEach(option => {
        const optionLetter = option.dataset.option;

        if (optionLetter === correctOption) {
            option.classList.add('correct');
        } else if (optionLetter === selectedOption && selectedOption !== correctOption) {
            option.classList.add('incorrect');
        }
    });
}

// Get Hint
async function getHint() {
    const question = quiz[currentQuestionIndex];

    // Show loading state
    hintButton.disabled = true;
    hintButton.textContent = 'Loading hint...';

    try {
        const hintPrompt = `Provide a factual hint for the following question without revealing the complete answer: ${question.question}`;
        const hint = await getAIResponse(hintPrompt);

        // Display hint
        hintText.textContent = hint;
        hintText.classList.remove('hidden');

    } catch (error) {
        console.error("Error getting hint:", error);
        hintText.textContent = "Sorry, couldn't generate a hint at this time.";
        hintText.classList.remove('hidden');
    } finally {
        // Reset button state
        hintButton.disabled = false;
        hintButton.textContent = 'Get a Hint';
    }
}

// Get AI Response for Hints and Explanations
async function getAIResponse(prompt) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    {
                        "role": "system",
                        "content": "Provide concise and helpful responses."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed with status: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;

    } catch (error) {
        console.error("Error getting AI response:", error);
        throw new Error("Failed to get AI response");
    }
}

// Go to Next Question
function goToNextQuestion() {
    currentQuestionIndex++;

    // Check if quiz is complete
    if (currentQuestionIndex >= quiz.length) {
        endQuiz();
        return;
    }

    // Check if time is up
    if (timeRemaining <= 0) {
        endQuiz();
        return;
    }

    // Display next question
    displayQuestion(currentQuestionIndex);
}

// Timer Functions
function startTimer() {
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();

        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            endQuiz();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    // Add warning color when time is running low (less than 1 minute)
    if (timeRemaining < 60) {
        timeDisplay.style.color = 'red';
        timeDisplay.style.fontWeight = 'bold';
    }
}

// End Quiz
function endQuiz() {
    // Stop timer
    clearInterval(timerInterval);

    // Calculate statistics
    calculateStatistics();

    // Hide questions section
    quizQuestionsSection.classList.add('hidden');

    // Show results section
    quizResultsSection.classList.remove('hidden');
}

// Calculate Statistics
function calculateStatistics() {
    let totalQuestions = quizResults.length;
    let correctCount = 0;
    let totalTime = 0;
    let minTime = Infinity;
    let maxTime = 0;

    for (const result of quizResults) {
        if (result.correctInitial) {
            correctCount++;
        }

        totalTime += result.initialTimeTaken;

        if (result.initialTimeTaken < minTime) {
            minTime = result.initialTimeTaken;
        }

        if (result.initialTimeTaken > maxTime) {
            maxTime = result.initialTimeTaken;
        }
    }

    // Update UI
    correctCountElement.textContent = correctCount;
    totalCountElement.textContent = totalQuestions;
    avgTimeElement.textContent = (totalTime / totalQuestions).toFixed(1);
    minTimeElement.textContent = minTime.toFixed(1);
    maxTimeElement.textContent = maxTime.toFixed(1);
}

// Show Detailed Report
function showDetailedReport() {
    // Hide results section
    quizResultsSection.classList.add('hidden');

    // Generate report HTML
    reportContainer.innerHTML = '';

    for (let i = 0; i < quizResults.length; i++) {
        const result = quizResults[i];
        const isCorrect = result.correctInitial || (result.retried && result.correctRetry);

        const reportHtml = `
            <div class="question-report ${isCorrect ? 'correct' : 'incorrect'}">
                <h4>Question ${i + 1}: ${result.question.question}</h4>
                <div class="report-options">
                    <div class="report-option">A. ${result.question.options[0]}</div>
                    <div class="report-option">B. ${result.question.options[1]}</div>
                    <div class="report-option">C. ${result.question.options[2]}</div>
                    <div class="report-option">D. ${result.question.options[3]}</div>
                </div>
                <div class="correct-answer">Correct Answer: ${result.question.correctAnswer}</div>
                <div class="user-answer ${result.correctInitial ? 'correct' : 'incorrect'}">
                    Your Initial Answer: ${result.initialAnswer}
                    ${result.correctInitial ? '(Correct)' : '(Incorrect)'}
                </div>
                ${result.retried ? `
                    <div class="user-answer ${result.correctRetry ? 'correct' : 'incorrect'}">
                        Your Retry Answer: ${result.retryAnswer}
                        ${result.correctRetry ? '(Correct)' : '(Incorrect)'}
                    </div>
                    <div class="timing-info">Time taken (retry): ${result.retryTimeTaken.toFixed(1)} seconds</div>
                ` : ''}
                ${!isCorrect && result.explanation ? `
                    <div class="explanation">
                        <strong>Explanation:</strong> ${result.explanation}
                    </div>
                ` : ''}
                <div class="timing-info">Time taken (initial attempt): ${result.initialTimeTaken.toFixed(1)} seconds</div>
            </div>
        `;

        reportContainer.innerHTML += reportHtml;
    }

    // Show report section
    detailedReportSection.classList.remove('hidden');
}

// Start Retry Quiz
function startRetry() {
    // Find incorrect questions
    retryQuestions = quizResults.filter(result => !result.correctInitial);

    // If no incorrect questions, show message
    if (retryQuestions.length === 0) {
        alert("Great job! You didn't get any questions wrong, so there's nothing to retry.");
        return;
    }

    // Reset retry index
    currentRetryIndex = 0;

    // Hide results section
    quizResultsSection.classList.add('hidden');

    // Show retry section
    retrySection.classList.remove('hidden');

    // Start first retry question
    displayRetryQuestion(currentRetryIndex);
}

// Display Retry Question
async function displayRetryQuestion(index) {
    const result = retryQuestions[index];
    const question = result.question;

    // Set question text
    retryQuestionText.textContent = question.question;

    // Generate improved hint
    const hintPrompt = `Provide an improved factual hint for the following question without revealing the complete answer: ${question.question}`;
    const improvedHint = await getAIResponse(hintPrompt);
    improvedHintElement.textContent = improvedHint;

    // Create options
    retryOptionsContainer.innerHTML = '';

    for (let i = 0; i < 4; i++) {
        const optionLetter = String.fromCharCode(65 + i); // A, B, C, D
        const optionHtml = `
            <div class="option" data-option="${optionLetter}">
                <span class="option-letter">${optionLetter}</span>
                <span class="option-text">${question.options[i]}</span>
            </div>
        `;
        retryOptionsContainer.innerHTML += optionHtml;
    }

    // Add event listeners to options
    const options = retryOptionsContainer.querySelectorAll('.option');
    options.forEach(option => {
        option.addEventListener('click', () => selectRetryOption(option));
    });

    // Reset UI elements
    retryAnswerFeedback.classList.add('hidden');
    nextRetryButton.classList.add('hidden');

    // Track retry start time
    question.retryStartTime = Date.now();
}

// Select Retry Option
async function selectRetryOption(optionElement) {
    // Prevent selection after answer is revealed
    if (nextRetryButton.classList.contains('hidden') === false) {
        return;
    }

    // Remove selected class from all options
    const options = retryOptionsContainer.querySelectorAll('.option');
    options.forEach(opt => opt.classList.remove('selected'));

    // Add selected class to clicked option
    optionElement.classList.add('selected');

    // Get selected option letter
    const selectedOption = optionElement.dataset.option;

    // Get current retry question
    const result = retryQuestions[currentRetryIndex];
    const question = result.question;

    // Calculate time taken
    const timeTaken = (Date.now() - question.retryStartTime) / 1000; // Convert to seconds

    // Check if answer is correct
    const isCorrect = selectedOption === question.correctAnswer;

    // Update result
    result.retried = true;
    result.retryAnswer = selectedOption;
    result.correctRetry = isCorrect;
    result.retryTimeTaken = timeTaken;

    // Show feedback
    retryAnswerFeedback.classList.remove('hidden');

    if (isCorrect) {
        retryAnswerFeedback.className = 'correct';
        retryFeedbackMessage.textContent = '✅ Correct on retry!';
    } else {
        retryAnswerFeedback.className = 'incorrect';
        retryFeedbackMessage.textContent = `❌ Incorrect on retry. The correct answer was ${question.correctAnswer}.`;

        // Get explanation if incorrect
        if (!result.explanation) {
            const explanationPrompt = `Provide a brief and precise explanation for why the correct answer is ${question.correctAnswer} for the question: ${question.question}. Include concise resource references if applicable.`;
            result.explanation = await getAIResponse(explanationPrompt);
        }
    }

    // Highlight correct and incorrect answers
    highlightRetryAnswers(selectedOption, question.correctAnswer);

    // Show next retry button
    nextRetryButton.classList.remove('hidden');
}

// Highlight Correct and Incorrect Retry Answers
function highlightRetryAnswers(selectedOption, correctOption) {
    const options = retryOptionsContainer.querySelectorAll('.option');

    options.forEach(option => {
        const optionLetter = option.dataset.option;

        if (optionLetter === correctOption) {
            option.classList.add('correct');
        } else if (optionLetter === selectedOption && selectedOption !== correctOption) {
            option.classList.add('incorrect');
        }
    });
}

// Go to Next Retry Question
function goToNextRetryQuestion() {
    currentRetryIndex++;

    // Check if retry is complete
    if (currentRetryIndex >= retryQuestions.length) {
        endRetry();
        return;
    }

    // Display next retry question
    displayRetryQuestion(currentRetryIndex);
}

// End Retry
function endRetry() {
    // Hide retry section
    retrySection.classList.add('hidden');

    // Recalculate statistics
    calculateStatistics();

    // Show results section
    quizResultsSection.classList.remove('hidden');
}

// Go Back to Results
function goBackToResults() {
    // Hide report section
    detailedReportSection.classList.add('hidden');

    // Show results section
    quizResultsSection.classList.remove('hidden');
}

// Reset Quiz
function resetQuiz() {
    // Reset all quiz state
    quiz = [];
    currentQuestionIndex = 0;
    quizResults = [];
    retryQuestions = [];
    currentRetryIndex = 0;

    // Clear timer if running
    if (timerInterval) {
        clearInterval(timerInterval);
    }

    // Hide all sections except setup
    quizResultsSection.classList.add('hidden');
    quizQuestionsSection.classList.add('hidden');
    detailedReportSection.classList.add('hidden');
    retrySection.classList.add('hidden');

    // Show setup section
    quizSetupSection.classList.remove('hidden');
}
