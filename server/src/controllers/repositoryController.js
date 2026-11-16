import Repository from '../models/Repository.js';

export async function listRepositories(req, res, next) {
  try { res.json({ repositories: await Repository.find({ owner: req.user._id }).sort({ createdAt: -1 }) }); }
  catch (error) { next(error); }
}

export async function addRepository(req, res, next) {
  try {
    const fullName = String(req.body.fullName || '').trim();
    if (!/^[\w.-]+\/[\w.-]+$/.test(fullName)) return res.status(400).json({ message: 'Use owner/repository format' });
    const repository = await Repository.create({ owner: req.user._id, fullName, htmlUrl: `https://github.com/${fullName}` });
    res.status(201).json({ repository });
  } catch (error) { next(error); }
}

export async function removeRepository(req, res, next) {
  try {
    const deleted = await Repository.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!deleted) return res.status(404).json({ message: 'Repository not found' });
    res.json({ message: 'Repository removed' });
  } catch (error) { next(error); }
}
