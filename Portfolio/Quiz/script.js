(function () {
  function buildQuiz() {
    // variable to store the HTML output
    const output = [];

    // for each question...
    myQuestions.forEach((currentQuestion, questionNumber) => {
      // variable to store the list of possible answers
      const answers = [];

      // and for each available answer...
      for (letter in currentQuestion.answers) {
        // ...add an HTML radio button
        answers.push(
          `<button class="unclicked" data-checked="false" data-question="${currentQuestion}" value="${letter}">
          ${currentQuestion.answers[letter]}
            </button>`
        );
      }

      // add this question and its answers to the output
      output.push(
        `<div class="question"> ${currentQuestion.question} </div>
          <div class="answers"> ${answers.join("")} </div>`
      );
    });

    // finally combine our output list into one string of HTML and put it on the page
    quizContainer.innerHTML = output.join("");
  }

  function showResults() {
    // gather answer containers from our quiz
    const answerContainers = quizContainer.querySelectorAll(".answers");

    // keep track of user's answers
    let numCorrect = 0;

    // for each question...
    myQuestions.forEach((currentQuestion, questionNumber) => {
      // find selected answer
      const answerContainer = answerContainers[questionNumber];
      const selector = `button[data-question="${currentQuestion}"][data-checked="true"]`;
      const userAnswer = (answerContainer.querySelector(selector) || {}).value;

      // if answer is correct
      if (userAnswer === currentQuestion.correctAnswer) {
        // add to the number of correct answers
        numCorrect++;

        // color the answers green
        answerContainers[questionNumber].style.color = "lightgreen";
      }
      // if answer is wrong or blank
      else {
        // color the answers red
        answerContainers[questionNumber].style.color = "red";
      }
    });

    // show number of correct answers out of total
    resultsContainer.innerHTML = `${numCorrect} out of ${myQuestions.length}`;
  }

  const quizContainer = document.getElementById("quiz");
  const resultsContainer = document.getElementById("results");
  const submitButton = document.getElementById("submit");
  const myQuestions = [
    {
      question: "What color is a mirror?",
      answers: {
        a: "White",
        b: "Green",
        c: "Silver",
        d: "No color"
      },
      correctAnswer: "b"
    },
    {
      question: "Which answer makes you uncomfortable?",
      answers: {
        a: "Manual Breathing Activated",
        b: "Feeling itchy?",
        c: "You just blinked, you just blinked again",
        d: "All of them"
      },
      correctAnswer: "d"
    },
    {
      question: "What is a coconut?",
      answers: {
        a: "A fruit",
        b: "A nut",
        c: "A vegetable",
        d: "The friends we made along the way"
      },
      correctAnswer: "a"
    }
  ];

  // Kick things off
  buildQuiz();

  // Event listeners
  submitButton.addEventListener("click", showResults);

  document.querySelectorAll('button').forEach(function(button) {
    button.onclick = function() {
        this.classList.toggle('clicked');
        this.classList.toggle('unclicked');
        this.setAttribute('data-checked', this.getAttribute('data-checked') === 'true' ? 'false' : 'true');
      }
    }
    );

})();