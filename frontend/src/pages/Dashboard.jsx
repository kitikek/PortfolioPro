// frontend/src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Grid, Card, CardContent, Button,
  Avatar, Divider, Paper, List, ListItem, ListItemIcon, ListItemText,
  TextField, IconButton, Link as MuiLink
} from '@mui/material';
import {
  Work, School, Code, Description, Share, Security, Speed,
  GitHub, LinkedIn, Email, Phone, Telegram
} from '@mui/icons-material';
import axios from 'axios';
import { useToast } from '../contexts/ToastContext';

// ========== Компонент формы обратной связи (изолированный) ==========
const ContactForm = () => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      showToast('Пожалуйста, заполните все поля', 'error');
      return;
    }
    setSending(true);
    try {
      const response = await axios.post('/api/v1/contact', formData);
      if (response.data.success) {
        showToast('Сообщение отправлено! Мы свяжемся с вами в ближайшее время.', 'success');
        setFormData({ name: '', email: '', message: '' });
      } else {
        showToast(response.data.error || 'Ошибка отправки', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Не удалось отправить сообщение. Попробуйте позже.', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Ваше имя"
          name="name"
          value={formData.name}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Ваш email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Сообщение"
          name="message"
          multiline
          rows={4}
          value={formData.message}
          onChange={handleChange}
          margin="normal"
          required
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          disabled={sending}
        >
          {sending ? 'Отправка...' : 'Отправить'}
        </Button>
      </form>
    </Paper>
  );
};

// ========== Основной компонент Dashboard ==========
const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ projects: 0, resumes: 0, skills: 0 });
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      axios.get('/api/v1/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          const userData = res.data.success ? res.data.data : res.data;
          setUser(userData);
        })
        .catch(() => setUser(null));

      Promise.all([
        axios.get('/api/v1/projects', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/v1/resumes', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/v1/skills', { headers: { Authorization: `Bearer ${token}` } })
      ])
        .then(([projectsRes, resumesRes, skillsRes]) => {
          setStats({
            projects: projectsRes.data.success ? projectsRes.data.data.length : 0,
            resumes: resumesRes.data.success ? resumesRes.data.data.length : 0,
            skills: skillsRes.data.success ? skillsRes.data.data.length : 0,
          });
        })
        .catch(err => console.error(err));
    }
  }, [token]);

  // FAQ данные
  const faqItems = [
    { question: 'Что такое PortfolioPro?', answer: 'PortfolioPro — это сервис для создания цифрового портфолио и резюме. Вы можете добавлять проекты, навыки, образование, опыт работы и публиковать их в виде красивых шаблонов.' },
    { question: 'Бесплатно ли это?', answer: 'Да, на данный момент сервис полностью бесплатный. В будущем возможны дополнительные платные функции.' },
    { question: 'Могу ли я поделиться своим портфолио?', answer: 'Да, каждый проект и резюме можно опубликовать и получить публичную ссылку для отправки работодателям или друзьям.' },
    { question: 'Какие форматы файлов поддерживаются?', answer: 'Изображения (jpg, png), видео (mp4, webm, ogg), документы (pdf, docx, txt, md, ipynb, pptx и др.).' },
    { question: 'Нужно ли платить за хранение файлов?', answer: 'Нет, все файлы хранятся на нашем сервере бесплатно в разумных пределах (до 100 MB на проект).' },
  ];

  // Hero-блок
  const HeroSection = () => (
    <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8, borderRadius: 2, mb: 6, textAlign: 'center' }}>
      <Container maxWidth="md">
        <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
          PortfolioPro
        </Typography>
        <Typography variant="h5" gutterBottom>
          Создайте профессиональное портфолио и резюме за несколько минут
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
          Добавляйте проекты, навыки, образование, опыт работы. Публикуйте и делитесь ссылкой с работодателями.
        </Typography>
        {!token && (
          <Button variant="contained" color="secondary" size="large" onClick={() => navigate('/register')}>
            Начать бесплатно
          </Button>
        )}
      </Container>
    </Box>
  );

  // Секция возможностей
  const FeaturesSection = () => {
    const features = [
      { icon: <Work fontSize="large" />, title: 'Проекты', desc: 'Добавляйте изображения, видео, файлы, ссылки и технологии.' },
      { icon: <Description fontSize="large" />, title: 'Резюме', desc: 'Создавайте резюме с выбором шаблона и публичной ссылкой.' },
      { icon: <School fontSize="large" />, title: 'Образование', desc: 'Укажите учебные заведения, степени и даты.' },
      { icon: <Code fontSize="large" />, title: 'Навыки', desc: 'Оценивайте свои hard и soft навыки, визуализируйте их.' },
      { icon: <Share fontSize="large" />, title: 'Публикация', desc: 'Один клик — и ваше портфолио доступно по ссылке.' },
      { icon: <Security fontSize="large" />, title: 'Приватность', desc: 'Вы сами решаете, что показывать публично.' },
    ];
    return (
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Что вы можете делать?
        </Typography>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {features.map((feat, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                <Box sx={{ color: 'primary.main', mb: 1 }}>{feat.icon}</Box>
                <Typography variant="h6">{feat.title}</Typography>
                <Typography variant="body2" color="textSecondary">{feat.desc}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  // Преимущества
  const AdvantagesSection = () => (
    <Box sx={{ bgcolor: '#111827', py: 6, borderRadius: 2, mb: 6 }}>
      <Container>
        <Typography variant="h4" align="center" gutterBottom>
          Почему PortfolioPro?
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4} textAlign="center">
            <Speed fontSize="large" sx={{ color: '#F3701E' }} />
            <Typography variant="h6" sx={{ color: 'white' }}>Быстро</Typography>
            <Typography sx={{ color: '#cbd5e1' }}>Интуитивно понятный интерфейс, всё готово за пару кликов.</Typography>
          </Grid>
          <Grid item xs={12} md={4} textAlign="center">
            <Security fontSize="large" sx={{ color: '#F3701E' }} />
            <Typography variant="h6" sx={{ color: 'white' }}>Безопасно</Typography>
            <Typography sx={{ color: '#cbd5e1' }}>Ваши данные хранятся надёжно, доступ только по токену.</Typography>
          </Grid>
          <Grid item xs={12} md={4} textAlign="center">
            <Share fontSize="large" sx={{ color: '#F3701E' }} />
            <Typography variant="h6" sx={{ color: 'white' }}>Публичность</Typography>
            <Typography sx={{ color: '#cbd5e1' }}>Контролируйте, кто видит ваше портфолио.</Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );

  // FAQ
  const FaqSection = () => (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Часто задаваемые вопросы
      </Typography>
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {faqItems.map((item, idx) => (
          <Grid item xs={12} key={idx}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">{item.question}</Typography>
              <Typography variant="body2" color="textSecondary">{item.answer}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  // Форма обратной связи
  const ContactFormSection = () => (
    <Box sx={{ my: 6 }}>
      <Typography variant="h4" align="center" gutterBottom>Напишите нам</Typography>
      <Typography variant="body1" align="center" paragraph sx={{ mb: 3 }}>
        Если у вас есть вопросы, предложения или нужна помощь, заполните форму. Мы ответим в ближайшее время.
      </Typography>
      <ContactForm />
    </Box>
  );

  // Контакты и соцсети
  const ContactsSection = () => (
    <Box sx={{ bgcolor: '#111827', color: 'white', py: 6, borderRadius: 2 }}>
      <Container>
        <Typography variant="h4" align="center" gutterBottom color="white">
          Свяжитесь с нами
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={4} textAlign="center">
            <Email />
            <Typography>support@portfoliopro.com</Typography>
          </Grid>
          <Grid item xs={12} md={4} textAlign="center">
            <Phone />
            <Typography>+7 (999) 123-45-67</Typography>
          </Grid>
          <Grid item xs={12} md={4} textAlign="center">
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <IconButton component="a" href="https://github.com" target="_blank" sx={{ color: 'white' }}>
                <GitHub />
              </IconButton>
              <IconButton component="a" href="https://linkedin.com" target="_blank" sx={{ color: 'white' }}>
                <LinkedIn />
              </IconButton>
              <IconButton component="a" href="https://t.me" target="_blank" sx={{ color: 'white' }}>
                <Telegram />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );

  // Персональная статистика для авторизованных
  const PersonalStats = () => {
    if (!user) return null;
    return (
      <Paper sx={{ p: 3, mb: 4, bgcolor: '#111827', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Avatar src={user.avatar_url} sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}>
            {user.full_name?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h5">Добро пожаловать, {user.full_name}!</Typography>
            <Typography variant="body1">Email: {user.email}</Typography>
          </Box>
          <Box sx={{ ml: 'auto', display: 'flex', gap: 3 }}>
            <Box textAlign="center">
              <Typography variant="h4">{stats.projects}</Typography>
              <Typography>Проектов</Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h4">{stats.resumes}</Typography>
              <Typography>Резюме</Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h4">{stats.skills}</Typography>
              <Typography>Навыков</Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {user && <PersonalStats />}
      <HeroSection />
      <FeaturesSection />
      <AdvantagesSection />
      <FaqSection />
      <ContactFormSection />
      <ContactsSection />
    </Container>
  );
};

export default Dashboard;