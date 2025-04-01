# AI-Powered Quiz Application

## Overview

This AI-Powered Quiz Application is a web-based platform that generates dynamic quizzes on any topic using the Groq LLM API. The application is a modern web conversion of an original C++ terminal program, preserving all the original functionality while enhancing the user experience with a responsive, interactive interface.

Users can specify a topic, difficulty level, number of questions, and time limit. The application then generates custom quiz questions, provides AI-powered hints, tracks performance metrics, offers detailed explanations for missed questions, and allows users to retry questions they answered incorrectly.

![Quiz Application Screenshot]

## Features

- **Dynamic Quiz Generation**: Create quizzes on any topic with the power of AI
- **Customizable Difficulty Levels**: 5 difficulty levels from basic to expert
- **Flexible Configuration**: Set your preferred number of questions and time limits
- **AI-Powered Hints**: Get contextual hints without revealing the complete answer
- **Comprehensive Statistics**: Track performance metrics including time per question
- **Interactive Quiz Interface**: User-friendly design with immediate visual feedback
- **Detailed Reports**: Get in-depth explanations for incorrect answers
- **Retry System**: Practice with improved hints on questions you missed
- **Mobile-Responsive Design**: Works on devices of all sizes

## Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/ai-quiz-application.git
   cd ai-quiz-application
   ```

2. **Set Up the Files**
   The application consists of three main files:
   - `index.html` - The HTML structure
   - `styles.css` - The CSS styling
   - `script.js` - The JavaScript functionality

3. **API Key Configuration**
   To use the application, you need a Groq API key:
   - Sign up at [Groq's website](https://groq.com)
   - Get your API key from the dashboard
   - Replace the placeholder API key in `script.js`:
     ```javascript
     const API_KEY = "your-groq-api-key-here";
     ```

4. **Launch the Application**
   - Simply open `index.html` in a web browser
   - Alternatively, you can use a local development server:
     ```bash
     python -m http.server 8000
     ```
     Then open `http://localhost:8000` in your browser

## Usage Guide

### Creating a Quiz

1. **Enter Topic**
   - Type any topic you'd like to be quizzed on
   - Examples: "Ancient Rome", "Machine Learning", "World Geography"

2. **Select Difficulty**
   - Choose from five difficulty levels:
     - Level 1: Basic (general knowledge)
     - Level 2: Intermediate (average)
     - Level 3: Just Above Medium
     - Level 4: Advanced
     - Level 5: Expert (in-depth knowledge)

3. **Set Number of Questions**
   - Choose how many questions you want in your quiz (1-20 recommended)

4. **Set Time Limit**
   - Enter the time limit in minutes for completing the entire quiz

5. **Start Quiz**
   - Click "Start Quiz" to begin
   - The application will generate questions while displaying a loading spinner

### Taking the Quiz

1. **Answer Questions**
   - Read the question and select one of the four options (A, B, C, or D)
   - The application will immediately show if your answer is correct or incorrect
   - Timer will display remaining time in the top right

2. **Use Hints**
   - If you're unsure, click "Get a Hint" to receive an AI-generated hint
   - Hints provide guidance without revealing the answer

3. **Navigate Questions**
   - After answering, click "Next Question" to proceed
   - Your progress is tracked at the top of the screen

### Reviewing Results

1. **Score Summary**
   - Once the quiz is complete, you'll see your final score
   - Statistics about your performance will be displayed

2. **Detailed Report**
   - Click "View Detailed Report" to see a breakdown of each question
   - For incorrect answers, you'll see explanations of the correct answer

3. **Retry Incorrect Questions**
   - Click "Retry Incorrect Questions" to practice questions you missed
   - You'll receive improved hints to help you get the correct answer

4. **Start a New Quiz**
   - Click "Start New Quiz" to begin a fresh quiz with new parameters

## File Structure

```
ai-quiz-application/
├── index.html        # Main HTML structure of the application
├── styles.css        # CSS styling for the application
├── script.js         # JavaScript functionality and API integration
└── README.md         # Project documentation
```

### File Descriptions

- **index.html**: Contains the structure for all application sections including quiz setup, questions, results, and reports.
- **styles.css**: Defines the visual appearance with responsive design, color themes, and interactive elements.
- **script.js**: Implements all functionality including API calls, quiz logic, timer, and statistics calculation.

## API Integration

This application uses the Groq API to leverage the Llama 3.3 70B Versatile model for:

1. **Question Generation**: Creating varied, topic-specific quiz questions
2. **Hint Generation**: Providing helpful hints without revealing answers
3. **Explanation Generation**: Creating detailed explanations for incorrect answers

### API Configuration

The application makes HTTP requests to the Groq API endpoint:
```
https://api.groq.com/openai/v1/chat/completions
```

Each request includes:
- Authorization header with API key
- JSON payload specifying the model and prompt
- System message to guide the AI's response format

The application handles API responses by:
- Parsing the JSON content
- Sanitizing the output (removing markdown code fences)
- Converting the response into the required format for questions, hints, or explanations

## Technologies Used

- **HTML5**: Semantic structure and form elements
- **CSS3**: Modern styling with flexbox, grid, animations, and variables
- **JavaScript (ES6+)**: Async/await, fetch API, DOM manipulation
- **Groq API**: AI-powered content generation

## Customization

### Styling Customization

To modify the appearance:
1. Edit the color variables at the top of `styles.css`:
   ```css
   :root {
       --color-primary: #4682B4; /* Change to your preferred color */
       /* Other variables */
   }
   ```

2. Modify component styles in their respective CSS sections

### Functionality Customization

To change quiz behavior:
1. Modify question generation prompts in `fetchQuestions()` function
2. Adjust timer behavior in the timer functions
3. Change hint generation by modifying the hint prompt in `getHint()`

### Adding New Features

The codebase is structured to make adding new features straightforward:
1. Add new HTML sections in `index.html`
2. Style new elements in `styles.css`
3. Implement functionality in `script.js`

## Security Considerations

- **API Key Protection**: In a production environment, the API key should not be exposed in frontend code. Consider:
  - Using a backend proxy for API requests
  - Implementing environment variables with a build process
  - Setting up a serverless function to handle API calls

- **Data Handling**: The application does not store user data persistently. All data is stored in memory during the session only.

## Performance Optimization

For larger quizzes or slower connections:
1. Implement question batching to improve load times
2. Add a caching mechanism for previously generated questions
3. Optimize image resources and minimize CSS/JS files

## Browser Compatibility

This application is compatible with:
- Chrome (version 60+)
- Firefox (version 55+)
- Safari (version 11+)
- Edge (version 79+)

## Troubleshooting

**API Errors**:
- Check that your API key is valid and has sufficient credits
- Verify your internet connection
- Look for error messages in the browser console

**Question Generation Issues**:
- Try more specific or mainstream topics
- Reduce the number of questions if generation is slow
- Ensure the topic is appropriate and within the AI's knowledge base

## Credits

- Original C++ application concept and code
- Groq API for AI-powered content generation
- Icons and design inspiration from modern web design principles

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Future Enhancements

Planned features for future versions:
- User accounts and score tracking
- Social sharing of quiz results
- Additional question formats (matching, ordering, etc.)
- Customizable themes and appearance
- Offline mode with cached questions
- Multiplayer competitive mode

---

*This README was last updated on April 1, 2025*
