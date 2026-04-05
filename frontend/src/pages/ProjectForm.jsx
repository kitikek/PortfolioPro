import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, TextField, Button, Typography, Box, Grid, Paper, IconButton, 
  FormControl, InputLabel, Select, MenuItem, Chip, Switch, FormControlLabel,
  List, ListItem, ListItemText
} from '@mui/material';
import { Add, Delete, CloudUpload, VideoLibrary, AttachFile } from '@mui/icons-material';

const ProjectForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  
  // Основные поля
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [role, setRole] = useState('');
  const [team, setTeam] = useState('');
  const [organization, setOrganization] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [demoLink, setDemoLink] = useState('');
  const [otherLinks, setOtherLinks] = useState([]);
  const [newOtherLink, setNewOtherLink] = useState({ name: '', url: '' });
  const [technologies, setTechnologies] = useState([]);
  const [newTech, setNewTech] = useState('');
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  
  // Видео и файлы
  const [videos, setVideos] = useState([]);
  const [files, setFiles] = useState([]);
  const [newVideoLink, setNewVideoLink] = useState({ url: '', title: '' });
  const [newVideoFileTitle, setNewVideoFileTitle] = useState('');
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Загрузка проекта при редактировании
  useEffect(() => {
    if (id) {
      const fetchProject = async () => {
        try {
          const res = await axios.get(`/api/v1/projects/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data && res.data.success) {
            const proj = res.data.data;
            setTitle(proj.title || '');
            setDescription(proj.description || '');
            setRole(proj.role || '');
            setTeam(proj.team || '');
            setOrganization(proj.organization || '');
            setStartDate(proj.start_date || '');
            setEndDate(proj.end_date || '');
            setGithubLink(proj.links?.github || '');
            setDemoLink(proj.links?.demo || '');
            setOtherLinks(proj.links?.other || []);
            setTechnologies(proj.technologies || []);
            setImages(proj.images || []);
            setIsPublished(proj.is_published || false);
            setVideos(proj.videos || []);
            setFiles(proj.files || []);
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchProject();
    }
  }, [id, token]);

  // Обработчики для ссылок и технологий
  const handleAddOtherLink = () => {
    if (newOtherLink.name && newOtherLink.url) {
      setOtherLinks([...otherLinks, { name: newOtherLink.name, url: newOtherLink.url }]);
      setNewOtherLink({ name: '', url: '' });
    }
  };
  const handleRemoveOtherLink = (index) => {
    setOtherLinks(otherLinks.filter((_, i) => i !== index));
  };
  const handleAddTech = () => {
    if (newTech.trim()) {
      setTechnologies([...technologies, newTech.trim()]);
      setNewTech('');
    }
  };
  const handleRemoveTech = (index) => {
    setTechnologies(technologies.filter((_, i) => i !== index));
  };

  // Изображения
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await axios.post(`/api/v1/projects/${id}/images`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setImages([...images, res.data.data.imageUrl]);
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка загрузки');
    } finally {
      setUploading(false);
    }
  };
  const handleRemoveImage = async (index) => {
    if (!id) return;
    try {
      await axios.delete(`/api/v1/projects/${id}/images/${index}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setImages(images.filter((_, i) => i !== index));
    } catch (err) {
      console.error(err);
    }
  };

  // Видео — загрузка файла (рабочая версия)
  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingVideo(true);
    const formData = new FormData();
    formData.append('video', file);
    if (newVideoFileTitle.trim()) {
      formData.append('title', newVideoFileTitle.trim());
    }
    try {
      const res = await axios.post(`/api/v1/projects/${id}/videos`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        const newVideo = {
          type: 'upload',
          url: res.data.data.videoUrl,
          title: newVideoFileTitle.trim() || null,
          mimeType: file.type
        };
        setVideos(prev => [...prev, newVideo]);
        setNewVideoFileTitle('');
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка загрузки видео');
    } finally {
      setUploadingVideo(false);
    }
  };

  // Видео — добавление ссылки (рабочая версия)
  const handleAddVideoLink = async () => {
    if (!newVideoLink.url) {
      alert('Введите ссылку на видео');
      return;
    }
    try {
      const res = await axios.post(`/api/v1/projects/${id}/video-links`, newVideoLink, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        const newVideo = {
          type: 'link',
          url: newVideoLink.url,
          title: newVideoLink.title || null
        };
        setVideos(prev => [...prev, newVideo]);
        setNewVideoLink({ url: '', title: '' });
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка добавления ссылки');
    }
  };

  // Удаление видео
  const handleDeleteVideo = async (index) => {
    if (!window.confirm('Удалить видео?')) return;
    try {
      await axios.delete(`/api/v1/projects/${id}/videos/${index}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVideos(videos.filter((_, i) => i !== index));
    } catch (err) {
      console.error(err);
    }
  };

  // Файлы (рабочая версия)
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingFile(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', file.name);
    try {
      const res = await axios.post(`/api/v1/projects/${id}/files`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        const newFile = {
          name: file.name,
          url: res.data.data.fileUrl,
          size: file.size,
          mimeType: file.type
        };
        setFiles(prev => [...prev, newFile]);
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка загрузки файла');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDeleteFile = async (index) => {
    if (!window.confirm('Удалить файл?')) return;
    try {
      await axios.delete(`/api/v1/projects/${id}/files/${index}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFiles(files.filter((_, i) => i !== index));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title,
        description,
        role,
        team,
        organization,
        start_date: startDate || null,
        end_date: endDate || null,
        links: { github: githubLink, demo: demoLink, other: otherLinks },
        technologies,
        images,
        videos,
        files,
        is_published: isPublished,
      };
      if (id) {
        await axios.put(`/api/v1/projects/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        let portfolioId = null;
        const portfoliosRes = await axios.get('/api/v1/portfolios', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (portfoliosRes.data.success && portfoliosRes.data.data.length > 0) {
          portfolioId = portfoliosRes.data.data[0].id;
        } else {
          const newPortfolio = await axios.post('/api/v1/portfolios', { title: 'Моё портфолио' }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          portfolioId = newPortfolio.data.data.id;
        }
        await axios.post('/api/v1/projects', { ...payload, portfolioId }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      navigate('/projects');
    } catch (err) {
      console.error(err);
      alert('Ошибка сохранения');
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {id ? 'Редактировать проект' : 'Новый проект'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Основные поля */}
            <Grid item xs={12}>
              <TextField fullWidth label="Название" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Описание" value={description} onChange={(e) => setDescription(e.target.value)} multiline rows={4} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Роль в проекте" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Например: Frontend Lead" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Команда / участники" value={team} onChange={(e) => setTeam(e.target.value)} placeholder="Имена или название команды" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Организация / заказчик" value={organization} onChange={(e) => setOrganization(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Дата начала" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Дата окончания" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} color="primary" />}
                label="Опубликовать проект (доступен по ссылке)"
              />
            </Grid>

            {/* Ссылки */}
            <Grid item xs={12}>
              <Typography variant="h6">Ссылки</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="GitHub" value={githubLink} onChange={(e) => setGithubLink(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Demo / Сайт" value={demoLink} onChange={(e) => setDemoLink(e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">Другие ссылки</Typography>
              {otherLinks.map((link, idx) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Chip label={`${link.name}: ${link.url}`} onDelete={() => handleRemoveOtherLink(idx)} sx={{ mr: 1 }} />
                </Box>
              ))}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField size="small" label="Название" value={newOtherLink.name} onChange={(e) => setNewOtherLink({ ...newOtherLink, name: e.target.value })} />
                <TextField size="small" label="URL" value={newOtherLink.url} onChange={(e) => setNewOtherLink({ ...newOtherLink, url: e.target.value })} />
                <Button variant="outlined" onClick={handleAddOtherLink} startIcon={<Add />}>Добавить</Button>
              </Box>
            </Grid>

            {/* Технологии */}
            <Grid item xs={12}>
              <Typography variant="h6">Технологии</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                {technologies.map((tech, idx) => (
                  <Chip key={idx} label={tech} onDelete={() => handleRemoveTech(idx)} />
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField size="small" label="Новая технология" value={newTech} onChange={(e) => setNewTech(e.target.value)} />
                <Button variant="outlined" onClick={handleAddTech} startIcon={<Add />}>Добавить</Button>
              </Box>
            </Grid>

            {/* Изображения */}
            <Grid item xs={12}>
              <Typography variant="h6">Изображения</Typography>
              <Button variant="contained" component="label" startIcon={<CloudUpload />} disabled={uploading || !id}>
                Загрузить изображение
                <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
              </Button>
              {!id && <Typography variant="caption" display="block" color="textSecondary">Сначала сохраните проект, затем добавляйте изображения</Typography>}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                {images.map((img, idx) => (
                  <Box key={idx} sx={{ position: 'relative', width: 100, height: 100 }}>
                    <img src={img} alt={`preview ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                    <IconButton size="small" sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'rgba(0,0,0,0.5)' }} onClick={() => handleRemoveImage(idx)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Grid>

            {/* Видео — новый порядок кнопок */}
            <Grid item xs={12}>
              <Typography variant="h6">Видео</Typography>
              {!id && <Typography variant="caption" color="textSecondary">Сначала сохраните проект, затем добавляйте видео</Typography>}
              {id && (
                <>
                  {/* Добавление по ссылке */}
                  <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Добавить видео по ссылке (YouTube/Vimeo)</Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                      <TextField
                        size="small"
                        label="Название ссылки (опционально)"
                        value={newVideoLink.title}
                        onChange={(e) => setNewVideoLink({ ...newVideoLink, title: e.target.value })}
                        sx={{ width: 200 }}
                      />
                      <TextField
                        size="small"
                        label="Ссылка на YouTube/Vimeo"
                        value={newVideoLink.url}
                        onChange={(e) => setNewVideoLink({ ...newVideoLink, url: e.target.value })}
                        sx={{ width: 300 }}
                      />
                      <Button variant="contained" onClick={handleAddVideoLink} startIcon={<Add />}>
                        Добавить ссылку
                      </Button>
                    </Box>
                  </Paper>

                  {/* Загрузка видеофайла */}
                  <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Загрузить видеофайл</Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                      <TextField
                        size="small"
                        label="Название видео (опционально)"
                        value={newVideoFileTitle}
                        onChange={(e) => setNewVideoFileTitle(e.target.value)}
                        sx={{ width: 200 }}
                      />
                      <Button
                        variant="contained"
                        component="label"
                        disabled={uploadingVideo}
                        startIcon={<VideoLibrary />}
                      >
                        Загрузить видео (mp4/webm/ogg)
                        <input type="file" hidden accept="video/*" onChange={handleVideoUpload} />
                      </Button>
                    </Box>
                  </Paper>

                  {/* Список видео */}
                  {videos.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2">Загруженные видео:</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                        {videos.map((video, idx) => (
                          <Box key={idx} sx={{ position: 'relative', width: 250 }}>
                            {video.type === 'upload' ? (
                              <video src={video.url} controls style={{ width: '100%' }} />
                            ) : (
                              <iframe
                                src={video.url.replace('watch?v=', 'embed/')}
                                width="100%"
                                height="140"
                                frameBorder="0"
                                allowFullScreen
                                title={video.title || 'video'}
                              />
                            )}
                            <IconButton
                              size="small"
                              sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'rgba(0,0,0,0.5)' }}
                              onClick={() => handleDeleteVideo(idx)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                            {video.title && <Typography variant="caption">{video.title}</Typography>}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </>
              )}
            </Grid>

            {/* Файлы */}
            <Grid item xs={12}>
              <Typography variant="h6">Файлы</Typography>
              {!id && <Typography variant="caption" color="textSecondary">Сначала сохраните проект, затем добавляйте файлы</Typography>}
              {id && (
                <>
                  <Button variant="contained" component="label" disabled={uploadingFile} startIcon={<AttachFile />}>
                    Загрузить файл (PDF, ZIP, DOC и др.)
                    <input type="file" hidden onChange={handleFileUpload} />
                  </Button>
                  <List sx={{ mt: 2 }}>
                    {files.map((file, idx) => (
                      <ListItem key={idx} secondaryAction={
                        <IconButton edge="end" onClick={() => handleDeleteFile(idx)}><Delete /></IconButton>
                      }>
                        <ListItemText primary={file.name} secondary={`${(file.size / 1024).toFixed(1)} KB • ${file.mimeType}`} />
                        <Button component="a" href={file.url} target="_blank" size="small">Скачать</Button>
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </Grid>

            {/* Кнопки */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="outlined" onClick={() => navigate('/projects')}>Отмена</Button>
                <Button type="submit" variant="contained" color="primary">Сохранить</Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Container>
  );
};

export default ProjectForm;