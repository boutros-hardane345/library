require('dotenv').config();
const mongoose = require('mongoose');
const User   = require('./models/User');
const Author = require('./models/Author');
const Book   = require('./models/Book');
const Member = require('./models/Member');
const Loan   = require('./models/Loan');
const connectDB = require('./config/db');

const seed = async () => {
  await connectDB();
  // Wait for connection
  await new Promise(r => setTimeout(r, 1500));
  console.log('🌱 Seeding database...');

  await Promise.all([
    User.deleteMany(),
    Author.deleteMany(),
    Book.deleteMany(),
    Member.deleteMany(),
    Loan.deleteMany()
  ]);
  console.log('🗑  Cleared existing data');

  // Users
  const users = await User.create([
    { name: 'Admin User',      email: 'admin@library.com',     password: 'admin123',  role: 'admin'     },
    { name: 'Sarah Librarian', email: 'librarian@library.com', password: 'lib123',    role: 'librarian' },
    { name: 'John Member',     email: 'john@example.com',      password: 'member123', role: 'member'    },
    { name: 'Alice Reader',    email: 'alice@example.com',     password: 'member123', role: 'member'    },
    { name: 'Bob Scholar',     email: 'bob@example.com',       password: 'member123', role: 'member'    }
  ]);
  console.log(`✅ Created ${users.length} users`);

  // Authors
  const authors = await Author.create([
    { name: 'George Orwell',     nationality: 'British',  birthYear: 1903, bio: 'English novelist and essayist.' },
    { name: 'Yuval Noah Harari', nationality: 'Israeli',  birthYear: 1976, bio: 'Historian and professor.' },
    { name: 'Frank Herbert',     nationality: 'American', birthYear: 1920, bio: 'Author of Dune.' },
    { name: 'Agatha Christie',   nationality: 'British',  birthYear: 1890, bio: 'Queen of mystery novels.' },
    { name: 'Carl Sagan',        nationality: 'American', birthYear: 1934, bio: 'Planetary scientist and author.' }
  ]);
  console.log(`✅ Created ${authors.length} authors`);

  // Books
  const books = await Book.create([
    { title: 'Nineteen Eighty-Four',        author: authors[0]._id, genre: 'Fiction',     publishedYear: 1949, totalCopies: 5, availableCopies: 5, coverColor: '#e74c3c' },
    { title: 'Animal Farm',                 author: authors[0]._id, genre: 'Fiction',     publishedYear: 1945, totalCopies: 4, availableCopies: 4, coverColor: '#e67e22' },
    { title: 'Sapiens',                     author: authors[1]._id, genre: 'History',     publishedYear: 2011, totalCopies: 6, availableCopies: 6, coverColor: '#2980b9' },
    { title: 'Homo Deus',                   author: authors[1]._id, genre: 'Non-Fiction', publishedYear: 2015, totalCopies: 3, availableCopies: 3, coverColor: '#8e44ad' },
    { title: 'Dune',                        author: authors[2]._id, genre: 'Fiction',     publishedYear: 1965, totalCopies: 4, availableCopies: 4, coverColor: '#d4ac0d' },
    { title: 'Murder on the Orient Express',author: authors[3]._id, genre: 'Mystery',     publishedYear: 1934, totalCopies: 5, availableCopies: 5, coverColor: '#1abc9c' },
    { title: 'Cosmos',                      author: authors[4]._id, genre: 'Science',     publishedYear: 1980, totalCopies: 3, availableCopies: 3, coverColor: '#2c3e50' }
  ]);
  console.log(`✅ Created ${books.length} books`);

  // Members — created ONE BY ONE to avoid duplicate membershipId race condition
  const members = [];
  members.push(await new Member({ user: users[2]._id, membershipType: 'standard', phone: '+1-555-0101', address: '123 Main St, Springfield' }).save());
  members.push(await new Member({ user: users[3]._id, membershipType: 'premium',  phone: '+1-555-0202', address: '456 Oak Ave, Shelbyville' }).save());
  members.push(await new Member({ user: users[4]._id, membershipType: 'student',  phone: '+1-555-0303', address: '789 Elm Rd, Capital City' }).save());
  console.log(`✅ Created ${members.length} members`);

  // Loans
  const pastDate   = (d) => { const x = new Date(); x.setDate(x.getDate() - d); return x; };
  const futureDate = (d) => { const x = new Date(); x.setDate(x.getDate() + d); return x; };

  await Loan.create([
    { member: members[0]._id, book: books[0]._id, loanDate: pastDate(5),  dueDate: futureDate(9),  status: 'active' },
    { member: members[1]._id, book: books[2]._id, loanDate: pastDate(20), dueDate: pastDate(6),    status: 'overdue' },
    { member: members[2]._id, book: books[4]._id, loanDate: pastDate(14), dueDate: pastDate(1),    status: 'returned', returnDate: pastDate(2) },
    { member: members[0]._id, book: books[5]._id, loanDate: pastDate(2),  dueDate: futureDate(12), status: 'active' }
  ]);

  await Book.findByIdAndUpdate(books[0]._id, { $inc: { availableCopies: -1 } });
  await Book.findByIdAndUpdate(books[2]._id, { $inc: { availableCopies: -1 } });
  await Book.findByIdAndUpdate(books[5]._id, { $inc: { availableCopies: -1 } });
  console.log('✅ Created 4 loans');

  console.log('\n🎉 Seed complete! Login credentials:');
  console.log('   Admin:     admin@library.com     / admin123');
  console.log('   Librarian: librarian@library.com / lib123');
  console.log('   Member:    john@example.com      / member123');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(err => {
  console.error('❌ Seed error:', err.message);
  process.exit(1);
});
