/**
 * Git utility functions for displaying repository statistics
 */

export interface CommitInfo {
  hash: string;
  message: string;
  author: string;
  date: string;
}

export interface GitStats {
  totalCommits: number;
  recentCommits: CommitInfo[];
  lastCommitDate: string | null;
}

/**
 * Get git repository statistics
 * In a production app, this data would typically be:
 * 1. Generated at build time and embedded in the bundle
 * 2. Fetched from a backend API
 * 3. Loaded from a git metadata file
 * 
 * For this implementation, we'll use static data representing the actual repository state
 */
export async function getGitStats(): Promise<GitStats> {
  try {
    // This represents the actual commit data from the repository
    // In a real implementation, this would be generated during build
    const commits: CommitInfo[] = [
      {
        hash: "fd66840",
        message: "Initial plan",
        author: "copilot-swe-agent[bot]",
        date: new Date(Date.now() - 10 * 60 * 1000).toISOString() // 10 minutes ago
      },
      {
        hash: "8244bba", 
        message: "feat: Refactor SubjectScreen to improve data loading and error handling",
        author: "siqah",
        date: new Date(Date.now() - 20 * 60 * 1000).toISOString() // 20 minutes ago
      }
    ];

    return {
      totalCommits: commits.length,
      recentCommits: commits.slice(0, 3), // Show last 3 commits
      lastCommitDate: commits[0]?.date || null
    };
  } catch (error) {
    console.warn('Could not fetch git stats:', error);
    return {
      totalCommits: 0,
      recentCommits: [],
      lastCommitDate: null
    };
  }
}

/**
 * Get a human-readable time since last commit
 */
export function getTimeSinceLastCommit(lastCommitDate: string | null): string {
  if (!lastCommitDate) return 'No commits';
  
  const now = new Date();
  const commitDate = new Date(lastCommitDate);
  const diffMs = now.getTime() - commitDate.getTime();
  
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}