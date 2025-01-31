# Track Your Damn Time

**A poem:**

I need to track time.
I never remember to track my time.
I tried things that tracked every minute of my day,
but that just made more data.
All I need to know is, roughly
What the heck did I do each day,
And for roughly how long?

If I could remember to go to freshbooks,
And write those things down every day,
I would have no worries,
But I don't.
And I then have to try and remember what I did,
A month ago.

So I needed something that,
Would ask me every day,
"Yo, what the heck did you do yesterday?",
And save it somewhere.

So that when I need to update freshbooks,
I don't have to get creative.

This is that thing.

## What?

Every time I open my terminal, if there is missing time in my time tracking, track-your-damn-time asks me what I did:

![](https://i.cloudup.com/gyb_fTR0Ep-3000x3000.png)

It starts 3 days ago, ignores weekends, and will only ask you what you did _today_ after 4pm.

It stores the information in simple text files, and I can see the full list with `track-your-damn-time log`.

## Installation

```
npm install -g track-your-damn-time
```

Then add this to your .bashrc/.zshrc

```
track-your-damn-time
```

The first time it will ask you for a path to store the files in.

## Commands

### Add Tasks
Add new tasks for today. If tasks already exist for today, you'll be prompted to confirm overwrite:
```
track-your-damn-time add
```

### Append Tasks
Append new tasks to today's existing tasks:
```
track-your-damn-time append
```

### View Log
Output your time tracking log:
```
track-your-damn-time log
```

## License

MIT
