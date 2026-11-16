import Execution from '../models/Execution.js';

export async function listExecutions(req, res, next) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const filter = { user: req.user._id };
    if (req.query.status) filter.status = req.query.status;
    const [executions, total] = await Promise.all([
      Execution.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Execution.countDocuments(filter)
    ]);
    res.json({ executions, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
}

export async function getStats(req, res, next) {
  try {
    const [total, successful, failed, recent] = await Promise.all([
      Execution.countDocuments({ user: req.user._id }),
      Execution.countDocuments({ user: req.user._id, status: 'success' }),
      Execution.countDocuments({ user: req.user._id, status: 'failed' }),
      Execution.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(5)
    ]);
    res.json({ stats: { total, successful, failed, successRate: total ? Math.round(successful / total * 100) : 0 }, recent });
  } catch (error) { next(error); }
}
