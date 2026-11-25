/* ---------- EDIT THIS FILE to change books and rankings ----------
   Each category lists its Top 10 in order: [title, author].
   Cover photo goes in images/books/ named after the title, e.g.
   "Chemmeen" -> images/books/chemmeen.jpg (spaces and symbols become a dash).
   No photo? A colored cover with the title is shown. */
const TOP_BOOKS = {
  "Indian languages": [
    ["Chemmeen", "Thakazhi Sivasankara Pillai"], ["Randamoozham", "M.T. Vasudevan Nair"],
    ["Khasakkinte Itihasam", "O.V. Vijayan"], ["Aarachar", "K.R. Meera"], ["Godaan", "Premchand"],
    ["Gitanjali", "Rabindranath Tagore"], ["Samskara", "U.R. Ananthamurthy"],
    ["Ponniyin Selvan", "Kalki Krishnamurthy"], ["Mrityunjay", "Shivaji Sawant"], ["Yayati", "V.S. Khandekar"]
  ],
  "Global literature": [
    ["One Hundred Years of Solitude", "Gabriel Garcia Marquez"], ["The Remains of the Day", "Kazuo Ishiguro"],
    ["Midnight's Children", "Salman Rushdie"], ["Beloved", "Toni Morrison"], ["The God of Small Things", "Arundhati Roy"],
    ["Life of Pi", "Yann Martel"], ["Wolf Hall", "Hilary Mantel"], ["Disgrace", "J.M. Coetzee"],
    ["The Old Man and the Sea", "Ernest Hemingway"], ["The Sympathizer", "Viet Thanh Nguyen"]
  ],
  "Science fiction": [
    ["Dune", "Frank Herbert"], ["Foundation", "Isaac Asimov"], ["Neuromancer", "William Gibson"],
    ["The Left Hand of Darkness", "Ursula K. Le Guin"], ["Ender's Game", "Orson Scott Card"], ["The Martian", "Andy Weir"],
    ["Hyperion", "Dan Simmons"], ["Brave New World", "Aldous Huxley"], ["Nineteen Eighty-Four", "George Orwell"],
    ["Fahrenheit 451", "Ray Bradbury"]
  ],
  "Fiction": [
    ["To Kill a Mockingbird", "Harper Lee"], ["The Alchemist", "Paulo Coelho"],
    ["Harry Potter and the Cursed Child", "J.K. Rowling"], ["The Kite Runner", "Khaled Hosseini"],
    ["A Game of Thrones", "George R.R. Martin"], ["The Hobbit", "J.R.R. Tolkien"], ["Pride and Prejudice", "Jane Austen"],
    ["The Book Thief", "Markus Zusak"], ["Gone Girl", "Gillian Flynn"], ["The Da Vinci Code", "Dan Brown"]
  ]
};

/* Builds the full book list. You normally don't need to touch this. */
const BOOKS = [];
Object.keys(TOP_BOOKS).forEach(function (category) {
  TOP_BOOKS[category].forEach(function (b, i) {
    BOOKS.push({
      id: b[0].toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      title: b[0], author: b[1], category: category, rank: i + 1
    });
  });
});