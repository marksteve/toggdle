# Toggdle

Toggdle fetches your Toggl weekly report and prints it out Wordle-style.

```
2022-01-17  ⬜⬜🟨⬜🟩⬜
2022-01-18  ⬜⬜🟩🟩🟩⬜
2022-01-19  ⬜⬜🟩🟩🟩⬜
2022-01-20  ⬜⬜🟩🟩⬜⬜
2022-01-21  ⬜⬜🟨🟨🟩⬜
```

Each square is a 4-hour chunk starting from 00:00 to 23:59. They are colored according to the [52/17 rule](https://en.wikipedia.org/wiki/52/17_rule): ⬜ means no activity, 🟩 means within the 52/17 ratio, and 🟨 means over it.