import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import Skills from './pages/Skills'
import Resume from './pages/Resume'
import Navbar from './components/Navbar'
import ProjectForm from './pages/ProjectForm'
import SkillForm from './pages/SkillForm'
import ResumeForm from './pages/ResumeForm'
import PublicResume from './pages/PublicResume';
import ProjectPage from './pages/ProjectPage';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/resume" element={<Resume />} />
        <Route path="/projects/new" element={<ProjectForm />} />
        <Route path="/projects/edit/:id" element={<ProjectForm />} />
        <Route path="/skills/new" element={<SkillForm />} />
        <Route path="/skills/edit/:id" element={<SkillForm />} />
        <Route path="/resume/new" element={<ResumeForm />} />
        <Route path="/resume/edit/:id" element={<ResumeForm />} />
        <Route path="/resume/public/:id" element={<PublicResume />} />
        <Route path="/projects/:id" element={<ProjectPage />} />
      </Routes>
    </>
  )
}

export default App