function defaultTemplate(data) {
  const personal = data.personal || {};
  const bio = data.bio || '';
  const skills = Array.isArray(data.skills) ? data.skills : [];
  const projects = Array.isArray(data.projects) ? data.projects : [];
  const softSkills = Array.isArray(data.softSkills) ? data.softSkills : [];
  const educations = Array.isArray(data.educations) ? data.educations : [];
  const experiences = Array.isArray(data.experiences) ? data.experiences : [];

  const avatarHtml = personal.avatar_url
    ? `<img src="${personal.avatar_url}" alt="avatar" style="width:100px;height:100px;border-radius:50%;object-fit:cover;margin-bottom:10px;">`
    : '';

  const skillsHtml = skills
    .filter(s => s.included !== false)
    .map(skill => `
      <div class="skill-item">
        <span style="font-size:14px;">${escapeHtml(skill.name)}</span>
        <div style="background:#e5e7eb; height:6px; border-radius:4px; margin-top:4px;">
          <div style="background:#F3701E; width:${(skill.level / 10) * 100}%; height:6px; border-radius:4px;"></div>
        </div>
      </div>
    `).join('');

  const softSkillsHtml = softSkills
    .map(skill => `<span class="chip">${escapeHtml(skill.name)}</span>`)
    .join('');

  const educationsHtml = educations
    .map(edu => `
      <div class="section-item">
        <h3>${escapeHtml(edu.institution)}</h3>
        <p class="subtitle">${escapeHtml(edu.degree || '')} ${escapeHtml(edu.field_of_study || '')}</p>
        <p class="date">${edu.start_date || '?'} — ${edu.end_date || 'настоящее время'}</p>
        ${edu.description ? `<p class="description">${escapeHtml(edu.description)}</p>` : ''}
      </div>
    `).join('');

  const experiencesHtml = experiences
    .map(exp => `
      <div class="section-item">
        <h3>${escapeHtml(exp.position)} в ${escapeHtml(exp.company)}</h3>
        <p class="date">${exp.start_date || '?'} — ${exp.current ? 'настоящее время' : exp.end_date || '?'}</p>
        ${exp.description ? `<p class="description">${escapeHtml(exp.description)}</p>` : ''}
      </div>
    `).join('');

  const projectsHtml = projects
    .filter(p => p.included !== false)
    .map(proj => `
      <div class="project-item">
        <h3>${escapeHtml(proj.title)}</h3>
        ${proj.description ? `<p class="description">${escapeHtml(proj.description)}</p>` : ''}
        <div class="tech-list">
          ${(proj.technologies || []).map(tech => `<span class="tech-chip">${escapeHtml(tech)}</span>`).join('')}
        </div>
      </div>
    `).join('');

  return `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>${escapeHtml(personal.full_name || 'Резюме')}</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: 'Segoe UI', Roboto, Arial, sans-serif;
        background: #f0f2f5;
        padding: 20px;
      }
      .container {
        max-width: 1000px;
        margin: 0 auto;
        background: white;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        border-radius: 16px;
        overflow: hidden;
      }
      .header {
        background: #111827;
        color: white;
        padding: 30px;
        text-align: center;
      }
      .header h1 { margin: 15px 0 5px; font-size: 28px; }
      .header p { color: #9CA3AF; margin: 5px 0; }
      .content { display: flex; flex-wrap: wrap; }
      .sidebar {
        width: 30%;
        background: #f9fafb;
        padding: 25px;
        border-right: 1px solid #e5e7eb;
      }
      .main {
        width: 70%;
        padding: 25px;
      }
      .section { margin-bottom: 25px; }
      .section h2 {
        font-size: 18px;
        border-bottom: 2px solid #4B607F;
        padding-bottom: 6px;
        margin-bottom: 15px;
        color: #111827;
      }
      .section-item { margin-bottom: 20px; }
      .section-item h3 { font-size: 16px; margin-bottom: 5px; }
      .subtitle { color: #4B5563; font-size: 14px; margin-bottom: 3px; }
      .date { color: #6B7280; font-size: 12px; margin-bottom: 5px; }
      .description { color: #4B5563; font-size: 14px; margin-top: 6px; }
      .skill-item { margin-bottom: 12px; }
      .chip {
        display: inline-block;
        background: #e5e7eb;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 12px;
        margin: 0 4px 8px 0;
      }
      .tech-chip {
        display: inline-block;
        background: #e5e7eb;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 11px;
        margin: 0 4px 6px 0;
      }
      .project-item {
        margin-bottom: 20px;
        border-left: 2px solid #4B607F;
        padding-left: 15px;
      }
      .tech-list { margin-top: 8px; }
      @media (max-width: 700px) {
        .sidebar, .main { width: 100%; }
        .sidebar { border-right: none; border-bottom: 1px solid #e5e7eb; }
      }
      @media print {
        @page {
          margin: 0.2in;
        }
        body {
          background: white;
          padding: 0;
        }
        .container {
          box-shadow: none;
          border-radius: 0;
        }
        .section, .section-item, .project-item, .skill-item, .header, .sidebar, .main {
          page-break-inside: avoid;
          page-break-after: avoid;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        ${avatarHtml}
        <h1>${escapeHtml(personal.full_name || '')}</h1>
        <p>${escapeHtml(personal.email || '')} | ${escapeHtml(personal.phone || '')}</p>
        ${personal.linkedin ? `<p>🔗 ${escapeHtml(personal.linkedin)}</p>` : ''}
        ${personal.github ? `<p>🐙 ${escapeHtml(personal.github)}</p>` : ''}
      </div>
      <div class="content">
        <div class="sidebar">
          <div class="section">
            <h2>О себе</h2>
            <p>${escapeHtml(bio) || 'Нет информации'}</p>
          </div>
          <div class="section">
            <h2>Технические навыки</h2>
            ${skillsHtml || '<p>Нет навыков</p>'}
          </div>
          ${softSkillsHtml ? `<div class="section"><h2>Софт-скиллы</h2><div>${softSkillsHtml}</div></div>` : ''}
        </div>
        <div class="main">
          ${educationsHtml ? `<div class="section"><h2>Образование</h2>${educationsHtml}</div>` : ''}
          ${experiencesHtml ? `<div class="section"><h2>Опыт работы</h2>${experiencesHtml}</div>` : ''}
          ${projectsHtml ? `<div class="section"><h2>Проекты</h2>${projectsHtml}</div>` : ''}
        </div>
      </div>
    </div>
  </body>
  </html>`;
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

module.exports = defaultTemplate;