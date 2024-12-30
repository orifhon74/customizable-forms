import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './components/Home';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Templates from './components/Templates';
import TemplateForm from './components/TemplateForm';
import FormSubmission from './components/FormSubmission';
import EditForm from './components/EditForm';
import AdminDashboard from './components/AdminDashboard';
import AdminUserManagement from './components/AdminUserManagement';
import UserDashboard from './components/UserDashboard';
import SearchResults from './components/SearchResults';

function App() {
    return (
        <Router>
            {/* Some people do a NavBar, but let's rely on the home page as your main "landing" */}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/sign-in" element={<SignIn />} />
                <Route path="/sign-up" element={<SignUp />} />
                <Route path="/templates" element={<Templates />} />
                <Route path="/create-template" element={<TemplateForm />} />
                <Route path="/submit-form/:templateId" element={<FormSubmission />} />
                <Route path="/edit-form/:formId" element={<EditForm />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUserManagement />} />
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/search-results" element={<SearchResults />} />
            </Routes>
        </Router>
    );
}

export default App;