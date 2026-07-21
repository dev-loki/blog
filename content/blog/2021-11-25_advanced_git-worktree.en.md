+++
title = "Advanced GIT: Git Worktree"
date = "2021-11-25"
description = "git worktree is a fantastic tool for working with multiple branches in parallel"
draft = false

[taxonomies]
tags = ["git", "tooling"]
+++

One of the coolest features in Git. And simultaneously one of the least used.

**The classic situation:**

You're in the middle of working on `feature/blubb_feature` and then a colleague sends an MR asking you to quickly review `hotfix/make_that_users_dont_die_immediately` so it can go live ASAP. Unfortunately the branch is too complex to review entirely in GitLab.

So you actually need to check it out and dive deep into the code...

### The classic approach

1. `git stash` your changes
2. `git checkout hotfix/...` to look at the branch and go through everything
3. Approve or reject

### A much better approach

You've set up `git worktree` (it's built into git) and have a folder structure like this:

```
project_name/
 - main/
 - develop/
 - feature/
   - blubb_feature/
 - hotfix/
   - make_that_users_dont_die_immediately/
```

Each folder acts like its own Git repository, but they all share the same Git metadata. Instead of leaving your current state and switching entirely, a `git worktree add BRANCH_NAME` creates a folder pointing to that branch for you.

## So how does it work?

Super simple, really :).

1. `mkdir my_project` (create project directory) and navigate into it: `cd my_project`
2. Clone the repository (note the first special step): `git clone --bare GIT_URL .bare`
   - We only clone the bare repository without checking out a branch
   - These metadata are stored in the `.bare` folder (the leading `.` hides it on macOS/Linux)
3. Create a file `my_project/.git` with the following line:
   ```
   gitdir: ./.bare
   ```
   This tells Git where to find the repository metadata
4. From here, worktree works perfectly:
   - `git worktree add main` adds our main branch
   - `git worktree add feature/ABC_new_stuff_to_play feature/ABC_new_stuff_to_play` to check out or create branches with `/` in the name
   - You can also freely choose the folder location in the filesystem. The format is:
     `git worktree add PATH BRANCHNAME`

## More useful commands

- Delete a branch:
  - Option 1: `rm -r BRANCH_NAME` then `git worktree prune`
  - Option 2: `git worktree list` lists all worktree branches
- Move a branch: `git worktree move SOURCE DESTINATION`
