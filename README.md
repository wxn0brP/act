# ACT

A tool to fetch and export your public GitHub activity to a CSV file.

## Description

This project fetches your public GitHub events (like commits, pull requests, issues, etc.) and exports them to a CSV file called `results.csv`. It uses the GitHub API to retrieve your activity data and formats it for easy analysis.

## Features

- Fetches your public GitHub events
- Formats the data into a structured CSV format
- Supports various event types:
  - Push events (commits)
  - Pull requests
  - Issues
  - Issue comments
  - Pull request review comments

## Prerequisites

- Node.js (v22 or higher)
- A GitHub personal access token
- Git configured with your username

## Setup

1. Install via `ingr` 
   (See [My dotfiles](https://github.com/wxn0brP/dotfiles)):
   ```bash
   ingr act
   ```
   or
   ```bash
   bun add -g github:wxn0brP/act
   ```

2. Set up your GitHub personal access token (for api access):
     ```bash
     export GITHUB_TOKEN=your_token_here
     ```

3. Make sure your Git username is configured:
   ```bash
   git config --global user.name "your_github_username"
   ```

## Usage

```bash
gh-get-act
```

After running, you'll find a `results.csv` file in the project directory with your GitHub activity.

## Output Format

The `results.csv` file contains the following columns:
1. Timestamp - When the event occurred
2. Event Type - Type of GitHub event (PushEvent, PullRequestEvent, etc.)
3. Repository - The repository where the event occurred
4. Details - Event-specific details (commit messages, PR titles, etc.)

## How It Works

1. The tool retrieves your GitHub username from your Git configuration
2. It uses your personal access token to authenticate with the GitHub API
3. It fetches your public events across multiple pages (up to 10 pages)
4. It processes and formats the events into a readable structure
5. It writes the formatted data to a CSV file

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.