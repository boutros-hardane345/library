const Book   = require('../models/Book');
const Author = require('../models/Author');
const Member = require('../models/Member');
const Loan   = require('../models/Loan');

exports.getDashboard = async (req, res) => {
  try {
    const [totalBooks, totalAuthors, totalMembers, activeLoans, overdueLoans, recentLoans] =
      await Promise.all([
        Book.countDocuments(),
        Author.countDocuments(),
        Member.countDocuments(),
        Loan.countDocuments({ status: 'active' }),
        Loan.countDocuments({ status: 'overdue' }),
        Loan.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .populate({ path: 'member', populate: { path: 'user', select: 'name' } })
          .populate('book', 'title')
      ]);

    res.render('dashboard/index', {
      title: 'Dashboard',
      stats: { totalBooks, totalAuthors, totalMembers, activeLoans, overdueLoans },
      recentLoans
    });
  } catch (err) {
    res.render('error', { title: 'Error', message: err.message, currentUser: req.user });
  }
};
