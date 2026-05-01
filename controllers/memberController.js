const Member = require('../models/Member');
const User   = require('../models/User');
const Loan   = require('../models/Loan');

exports.index = async (req, res) => {
  try {
    const members = await Member.find().populate('user', 'name email role').sort({ createdAt: -1 });
    res.render('members/index', { title: 'Members', members });
  } catch (err) {
    res.render('error', { title: 'Error', message: err.message, currentUser: req.user });
  }
};

exports.newForm = async (req, res) => {
  const users = await User.find({ role: 'member' }).sort({ name: 1 });
  res.render('members/new', { title: 'Add Member', users, error: null });
};

exports.create = async (req, res) => {
  try {
    const { user, phone, address, membershipType } = req.body;
    const member = await new Member({ user, phone, address, membershipType }).save();
    res.redirect(`/members/${member._id}`);
  } catch (err) {
    const users = await User.find({ role: 'member' }).sort({ name: 1 });
    res.render('members/new', { title: 'Add Member', users, error: err.message });
  }
};

exports.show = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id).populate('user', 'name email');
    if (!member) return res.status(404).render('error', { title: '404', message: 'Member not found', currentUser: req.user });
    const loans = await Loan.find({ member: member._id }).populate('book', 'title genre').sort({ loanDate: -1 });
    res.render('members/show', { title: member.membershipId, member, loans, error: null });
  } catch (err) {
    res.render('error', { title: 'Error', message: err.message, currentUser: req.user });
  }
};

exports.editForm = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id).populate('user');
    if (!member) return res.status(404).render('error', { title: '404', message: 'Member not found', currentUser: req.user });
    res.render('members/edit', { title: 'Edit Member', member, error: null });
  } catch (err) {
    res.render('error', { title: 'Error', message: err.message, currentUser: req.user });
  }
};

exports.update = async (req, res) => {
  try {
    const { phone, address, membershipType, isActive } = req.body;
    await Member.findByIdAndUpdate(req.params.id,
      { phone, address, membershipType, isActive: isActive === 'on' },
      { runValidators: true }
    );
    res.redirect(`/members/${req.params.id}`);
  } catch (err) {
    const member = await Member.findById(req.params.id).populate('user');
    res.render('members/edit', { title: 'Edit Member', member, error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const activeLoans = await Loan.countDocuments({ member: req.params.id, status: { $in: ['active', 'overdue'] } });
    if (activeLoans > 0) {
      const member = await Member.findById(req.params.id).populate('user');
      const loans  = await Loan.find({ member: req.params.id }).populate('book', 'title');
      return res.render('members/show', {
        title: member.membershipId, member, loans,
        error: 'Cannot delete member with active or overdue loans.'
      });
    }
    await Member.findByIdAndDelete(req.params.id);
    res.redirect('/members');
  } catch (err) {
    res.render('error', { title: 'Error', message: err.message, currentUser: req.user });
  }
};
