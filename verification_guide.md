# Verification Guide

Follow these steps to verify that the Freelancer Dashboard is working correctly with Supabase.

## 1. Authentication Flow
- [ ] **Sign Up**:
    - Go to the login page.
    - Click "Sign Up".
    - Enter a valid email and password.
    - Click "Sign Up".
    - **Expected**: You should see a message to check your email (if email confirmation is enabled) or be logged in immediately (if disabled).
- [ ] **Sign In**:
    - Log out if logged in.
    - Enter your credentials.
    - Click "Sign In".
    - **Expected**: You are redirected to the Dashboard.
- [ ] **Sign Out**:
    - Click the "Log Out" button in the header.
    - **Expected**: You are redirected back to the Login page.

## 2. Data Persistence (CRUD)
- [ ] **Create (Add Row)**:
    - Click "New Entry".
    - **Expected**: A new row appears at the top of the table.
    - **Verify**: Refresh the page. The new row should still be there.
- [ ] **Read (Fetch)**:
    - The table should load your projects when you log in.
- [ ] **Update (Edit Cell)**:
    - Click on a cell (e.g., Project Name).
    - Change the text and press Enter or click away.
    - **Verify**: Refresh the page. The change should persist.
- [ ] **Delete**:
    - Hover over a row and click the Trash icon.
    - Confirm the deletion.
    - **Expected**: The row disappears.
    - **Verify**: Refresh the page. The row should be gone.

## 3. Dynamic Columns
- [ ] **Add Column**:
    - Click "Add Column".
    - Enter a name (e.g., "Client").
    - **Expected**: A new column appears.
- [ ] **Edit Dynamic Cell**:
    - Enter data into the new column for a row.
    - **Verify**: Refresh the page. The column and the data should persist.

## 4. Row Level Security (RLS)
- [ ] **Data Isolation**:
    - Create a second account (use a different browser or incognito window).
    - Log in with the second account.
    - **Expected**: You should NOT see the projects created by the first account.
    - Create a project with the second account.
    - Switch back to the first account.
    - **Expected**: You should NOT see the project created by the second account.

## 5. UI/UX
- [ ] **Dark Mode**: Toggle the theme. Ensure all text is readable.
- [ ] **Responsive Design**: Resize the window. Ensure the table scrolls horizontally and the layout adapts.
- [ ] **Date Input**: Check the "Deadline" column. Ensure the date picker works and the full date is visible.
