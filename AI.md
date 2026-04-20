# 🤖 AI Grade Analyzer Documentation

## What this does
This feature automatically reviews student grades and gives **personal, actionable feedback** that no teacher has time to write for every student.

It doesn't just show numbers - it tells you **what's wrong, what's working, and exactly what to do next**.

---

## ✅ How it works

### Input (what we send to AI)
Just raw student grades:
```json
{
  "student_name": "Sarah Johnson",
  "semester": "Fall 2026",
  "grades": {
    "Mathematics": 62,
    "Physics": 58,
    "Chemistry": 71,
    "Computer Science": 89,
    "English": 76
  }
}
```

That's it. No extra data needed.

### Output (what you get back)
✅ **3 simple things every time:**
1.  Overall performance summary
2.  Weak subjects + hidden patterns
3.  Specific actionable recommendations

---

## 📝 Example

### Input
```
Grades:
Math: 62
Physics: 58
Chemistry: 71
CS: 89
English: 76
```

### AI Output
> ### 📊 Performance Overview
> You are doing really well in practical subjects, but struggling with theory-heavy science courses.
>
> ### ⚠️ Areas To Improve
> **Weak subjects: Physics & Mathematics**
> Notice the pattern: These two subjects are closely related. Your low physics score is very likely being pulled down by gaps in math fundamentals.
>
> ### 💡 Recommendations
> 1.  Spend 2 extra hours/week on algebra basics before continuing physics topics
> 2.  Use your strong CS skills to build small calculation scripts for physics problems
> 3.  Pair with a classmate who is strong in math for 30min daily study sessions
> 4.  Chemistry is solid - keep doing what you're doing there!

---

## ❓ Why this matters

| Before AI | After AI |
|---|---|
| Student sees `58/100` | Student sees **why** they got 58 and exactly how to improve |
| Only marks on paper | Actual guidance that changes outcomes |
| 1000 students get same generic report | Every student gets unique personal feedback |

This doesn't replace teachers. It gives every student the individual attention that is impossible to provide at scale.

---

## 🎯 Hackathon Notes
- **No ML experience required** - we use standard LLM prompts
- Works with existing grade data, zero extra training needed
- Can be extended to attendance, assignment submissions, behaviour logs
- Runs in real time - results appear in < 2 seconds
- Works for individual students, entire classes or whole departments

> This is the feature that will make people go "wow" when they use it.