const API = 'https://api.github.com';

export async function getPullRequestFiles(owner, repo, number) {
  if (!process.env.GITHUB_TOKEN) throw new Error('GITHUB_TOKEN is not configured on the server');
  const response = await fetch(`${API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls/${number}/files?per_page=100`, {
    headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' }
  });
  if (!response.ok) throw new Error(`GitHub API error (${response.status}): ${await response.text()}`);
  return response.json();
}
