import Execution from '../models/Execution.js';
import Repository from '../models/Repository.js';
import { getPullRequestFiles } from '../services/githubService.js';
import { reviewPullRequest } from '../services/aiReviewService.js';

export async function processPullRequest(req, res, next) {
  let execution;
  try {
    const suppliedToken = req.headers['x-internal-token'];
    if (!process.env.INTERNAL_AUTOMATION_TOKEN || suppliedToken !== process.env.INTERNAL_AUTOMATION_TOKEN) {
      return res.status(401).json({ message: 'Invalid automation token' });
    }
    const { action, repository, number, title, body, html_url: htmlUrl } = req.body;
    if (!repository?.full_name || !Number.isInteger(Number(number))) return res.status(400).json({ message: 'Expected GitHub pull_request webhook payload' });
    if (!['opened', 'synchronize', 'reopened', 'ready_for_review'].includes(action)) {
      return res.json({ message: `Skipped pull request action: ${action || 'unknown'}`, skipped: true });
    }
    const connectedRepository = await Repository.findOne({ fullName: repository.full_name, isActive: true });
    if (!connectedRepository) return res.status(404).json({ message: 'Repository is not connected to a DevOpsPilot workspace' });
    execution = await Execution.create({ user: connectedRepository.owner, repository: repository.full_name, pullRequestNumber: Number(number), pullRequestTitle: title, pullRequestUrl: htmlUrl, status: 'running', startedAt: new Date(), source: 'n8n' });
    const [owner, repo] = repository.full_name.split('/');
    const files = await getPullRequestFiles(owner, repo, number);
    const result = await reviewPullRequest({ title, body, files });
    execution.status = 'success';
    execution.changedFiles = files.length;
    execution.summary = result.summary;
    execution.review = result.review;
    execution.completedAt = new Date();
    await execution.save();
    res.json({ message: 'Pull request review processed', execution });
  } catch (error) {
    if (execution) {
      execution.status = 'failed'; execution.error = error.message; execution.completedAt = new Date();
      await execution.save().catch(() => {});
    }
    next(error);
  }
}
