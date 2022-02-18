# Toggdle

Toggdle fetches your Toggl weekly report and prints it out Wordle-style.

```
⬜⬜⬜⬜🟨🟩  2022-02-07
⬜⬜⬜🟩🟩🟩  2022-02-08
⬜⬜⬜🟩⬜🟨  2022-02-09
⬜⬜⬜🟨🟩🟨  2022-02-10
⬜⬜🟨🟩⬜⬜  2022-02-11
```

Each square is a 4-hour chunk starting from 00:00 to 23:59. They are colored according to the [52/17 rule](https://en.wikipedia.org/wiki/52/17_rule): ⬜ means no activity, 🟩 means within the 52/17 ratio, and 🟨 means over it.