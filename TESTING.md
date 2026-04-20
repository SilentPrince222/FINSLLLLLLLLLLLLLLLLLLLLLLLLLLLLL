# 🧪 Testing Checklist

Simple manual testing steps for hackathon demos. Run this list before every presentation.

---

## 🔐 Authentication Testing

✅ **Login flow**
- [ ]  Open homepage, not logged in → redirects to login page
- [ ]  Try wrong password → shows error message
- [ ]  Login with student account → lands on student dashboard
- [ ]  Login with teacher account → lands on teacher dashboard
- [ ]  Login with admin account → lands on admin dashboard
- [ ]  Click logout → returns to login page
- [ ]  Try to open `/admin` as student → blocked & redirected

✅ **Session behaviour**
- [ ]  Refresh page while logged in → stays logged in
- [ ]  Close browser tab & re-open → stays logged in

---

## 📊 Grades System Testing

✅ **Teacher workflows**
- [ ]  Login as teacher
- [ ]  Open grades page
- [ ]  Enter grade for a student → saves correctly
- [ ]  Edit existing grade → updates correctly
- [ ]  Delete grade → removes correctly
- [ ]  Can not see / edit grades for classes you don't teach

✅ **Student workflows**
- [ ]  Login as student
- [ ]  Can see your own grades
- [ ]  Can NOT edit grades
- [ ]  Can NOT see other student's grades

---

## 🤖 AI Grade Analyzer Testing

✅ **Basic functionality**
- [ ]  Login as student with existing grades
- [ ]  Click `Analyze Grades` button
- [ ]  Loading state appears
- [ ]  Analysis loads within 3 seconds
- [ ]  Shows overview summary
- [ ]  Shows weak subjects correctly
- [ ]  Shows actual actionable recommendations

✅ **Edge cases**
- [ ]  Student with no grades → shows friendly message
- [ ]  Student with all perfect grades → shows positive feedback
- [ ]  Student with all failing grades → shows helpful guidance
- [ ]  Click `Analyze` multiple times fast → no duplicate requests

✅ **Permissions**
- [ ]  Teacher can run analysis for their students
- [ ]  Student can only run analysis for themselves
- [ ]  Admin can run analysis for anyone

---

## ✅ Final Pre-Demo Check

Run this 5 minutes before presenting:
- [ ]  Development server is running
- [ ]  All 3 user accounts work
- [ ]  Database is populated with test data
- [ ]  OpenAI API key is working
- [ ]  No console errors in browser

---

> **Hackathon Tip:** Have test accounts pre-logged in separate browser tabs before your demo.