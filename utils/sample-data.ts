import { createDeck, createFlashcard } from "./flashcard-utils"
import type { Deck, Flashcard } from "../types/flashcard"

export function generateSampleData(): { decks: Deck[]; flashcards: Flashcard[] } {
  // Create sample decks
  const jsDecks = createDeck("JavaScript Basics", "Essential JavaScript concepts and syntax")
  const pythonDeck = createDeck("Python Fundamentals", "Core Python programming concepts")
  const mathDeck = createDeck("Mathematics", "Basic math formulas and concepts")
  const htmlDeck = createDeck("HTML & CSS", "Web development fundamentals")

  const decks = [jsDecks, pythonDeck, mathDeck, htmlDeck]

  // Create sample flashcards
  const flashcards: Flashcard[] = [
    // JavaScript cards
    createFlashcard(
      "What is a closure in JavaScript?",
      "A closure is a function that has access to variables in its outer (enclosing) scope even after the outer function has returned.",
      jsDecks.id,
    ),
    createFlashcard(
      "How do you declare a variable in JavaScript?",
      "<code>let variableName = value;</code><br><code>const constantName = value;</code><br><code>var oldStyle = value;</code>",
      jsDecks.id,
    ),
    createFlashcard(
      "What does this JavaScript code do?",
      "This code creates an array of numbers from 1 to 5 using the Array constructor and map method.",
      jsDecks.id,
      "javascript",
      "javascript",
    ),
    createFlashcard(
      "JavaScript Array Methods",
      "// Common array methods\nconst arr = [1, 2, 3, 4, 5];\n\n// map - transform elements\nconst doubled = arr.map(x => x * 2);\n\n// filter - select elements\nconst evens = arr.filter(x => x % 2 === 0);\n\n// reduce - accumulate\nconst sum = arr.reduce((acc, x) => acc + x, 0);",
      jsDecks.id,
      undefined,
      "javascript",
    ),

    // Python cards
    createFlashcard(
      "How do you create a list in Python?",
      "my_list = [1, 2, 3, 4, 5]",
      pythonDeck.id,
      undefined,
      "python",
    ),
    createFlashcard(
      "What is a Python dictionary?",
      "A dictionary is a collection of key-value pairs, similar to a hash map or object in other languages.<br><br><strong>Example:</strong><br><code>person = {'name': 'John', 'age': 30}</code>",
      pythonDeck.id,
    ),
    createFlashcard(
      "Python List Comprehension",
      "# List comprehension syntax\nsquares = [x**2 for x in range(10)]\n\n# With condition\nevens = [x for x in range(20) if x % 2 == 0]\n\n# Nested comprehension\nmatrix = [[i*j for j in range(3)] for i in range(3)]",
      pythonDeck.id,
      undefined,
      "python",
    ),

    // Math cards
    createFlashcard(
      "What is the Pythagorean theorem?",
      "a² + b² = c²<br><br>Where <em>c</em> is the hypotenuse and <em>a</em> and <em>b</em> are the other two sides of a right triangle.",
      mathDeck.id,
    ),
    createFlashcard(
      "What is the quadratic formula?",
      "x = (-b ± √(b² - 4ac)) / 2a<br><br>Used to solve quadratic equations of the form ax² + bx + c = 0",
      mathDeck.id,
    ),
    createFlashcard(
      "Derivative Rules",
      "<strong>Power Rule:</strong> d/dx[x^n] = nx^(n-1)<br><br><strong>Product Rule:</strong> d/dx[f(x)g(x)] = f'(x)g(x) + f(x)g'(x)<br><br><strong>Chain Rule:</strong> d/dx[f(g(x))] = f'(g(x)) × g'(x)",
      mathDeck.id,
    ),

    // HTML & CSS cards
    createFlashcard(
      "Basic HTML Structure",
      '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Document</title>\n</head>\n<body>\n    <h1>Hello World!</h1>\n</body>\n</html>',
      htmlDeck.id,
      undefined,
      "html",
    ),
    createFlashcard(
      "CSS Flexbox Properties",
      "/* Container properties */\n.container {\n    display: flex;\n    justify-content: center; /* horizontal alignment */\n    align-items: center; /* vertical alignment */\n    flex-direction: row; /* or column */\n    flex-wrap: wrap; /* or nowrap */\n}\n\n/* Item properties */\n.item {\n    flex: 1; /* grow, shrink, basis */\n    align-self: flex-start; /* individual alignment */\n}",
      htmlDeck.id,
      undefined,
      "css",
    ),
    createFlashcard(
      "What is semantic HTML?",
      "Semantic HTML uses HTML elements that have meaning and describe the content structure, not just appearance.<br><br><strong>Examples:</strong><br><code>&lt;header&gt;</code>, <code>&lt;nav&gt;</code>, <code>&lt;main&gt;</code>, <code>&lt;article&gt;</code>, <code>&lt;section&gt;</code>, <code>&lt;aside&gt;</code>, <code>&lt;footer&gt;</code><br><br><strong>Benefits:</strong> Better accessibility, SEO, and code maintainability.",
      htmlDeck.id,
    ),
  ]

  return { decks, flashcards }
}

export function createSampleExportFile(): string {
  const { decks, flashcards } = generateSampleData()

  const exportData = {
    version: "1.0",
    exportDate: new Date().toISOString(),
    decks,
    flashcards,
  }

  return JSON.stringify(exportData, null, 2)
}
