// frontend/src/pages/PublicResume.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, CircularProgress, Alert } from '@mui/material';
import DefaultTemplate from '../components/templates/DefaultTemplate';
import ModernTemplate from '../components/templates/ModernTemplate';
import MinimalTemplate from '../components/templates/MinimalTemplate';

const templates = {
  default: DefaultTemplate,
  modern: ModernTemplate,
  minimal: MinimalTemplate
};

const PublicResume = () => {
  const { id } = useParams();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await axios.get(`/api/v1/resumes/public/${id}`);
        if (res.data.success) {
          setResume(res.data.data);
        } else {
          setError('Резюме не найдено или скрыто');
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, [id]);

  if (loading) return <Container sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /></Container>;
  if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;
  if (!resume) return null;

  const TemplateComponent = templates[resume.template] || templates.default;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <TemplateComponent resume={resume} />
    </Container>
  );
};

export default PublicResume;