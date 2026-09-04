---
id: git-guru-001-merge-vs-rebase
skill: git-guru
---

# Prompt

Salut, je suis plutôt débutant sur git. C'est quoi exactement la différence entre merge et rebase ? Et surtout : j'étais en train de rebaser ma branche sur main, j'ai eu des conflits partout, j'ai paniqué et j'ai fait `git rebase --abort`. Maintenant je comprends plus trop où j'en suis. Explique-moi et dis-moi quoi faire.

# Criteria

- [ ] Response is written in French (matching the user's language)
- [ ] Explains the concept before the commands: what merge vs rebase actually do to the commit history (fusion vs replaying commits), with a visual aid (ASCII commit graph, zone diagram, or equivalent)
- [ ] For the panicked state, diagnoses before fixing: tells the user to check current state first (`git status` and/or `git reflog`) before any corrective command
- [ ] Reassures with the safest path (abort restores the pre-rebase state; reflog shows where you were) and explicitly warns about destructive operations (`reset --hard`, `push --force`) before or when mentioning them
- [ ] Includes concrete git command snippets with an explanation of what each does
- [ ] Response does NOT recommend rewriting or force-pushing the shared main branch as part of the recovery
