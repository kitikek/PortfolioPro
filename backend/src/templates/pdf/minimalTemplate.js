function minimalTemplate(data) {
  const personal = data.personal || {};
  const bio = data.bio || '';
  const skills = Array.isArray(data.skills) ? data.skills : [];
  const projects = Array.isArray(data.projects) ? data.projects : [];
  const softSkills = Array.isArray(data.softSkills) ? data.softSkills : [];
  const educations = Array.isArray(data.educations) ? data.educations : [];
  const experiences = Array.isArray(data.experiences) ? data.experiences : [];

  const avatarHtml = personal.avatar_url
    ? `<img src="${personal.avatar_url}" alt="avatar" style="width:80px;height:80px;border-radius:50%;object-fit:cover;margin-bottom:10px;">`
    : '';

  const skillsHtml = skills
    .filter(s => s.included !== false)
    .map(skill => `<span class="chip">${escapeHtml(skill.name)}</span>`)
    .join('');

  const softSkillsHtml = softSkills
    .map(skill => `<span class="chip">${escapeHtml(skill.name)}</span>`)
    .join('');

  const educationsHtml = educations
    .map(edu => `
      <div class="item">
        <h3>${escapeHtml(edu.institution)}</h3>
        <p class="subtitle">${escapeHtml(edu.degree || '')} ${escapeHtml(edu.field_of_study || '')}</p>
        <p class="date">${edu.start_date || '?'} — ${edu.end_date || 'настоящее время'}</p>
        ${edu.description ? `<p class="description">${escapeHtml(edu.description)}</p>` : ''}
      </div>
    `).join('');

  const experiencesHtml = experiences
    .map(exp => `
      <div class="item">
        <h3>${escapeHtml(exp.position)} в ${escapeHtml(exp.company)}</h3>
        <p class="date">${exp.start_date || '?'} — ${exp.current ? 'настоящее время' : exp.end_date || '?'}</p>
        ${exp.description ? `<p class="description">${escapeHtml(exp.description)}</p>` : ''}
      </div>
    `).join('');

  const projectsHtml = projects
    .filter(p => p.included !== false)
    .map(proj => `
      <div class="item project-item">
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
        font-family: Arial, sans-serif;
        max-width: 800px;
        margin: 0 auto;
        padding: 30px;
        background: white;
        color: #111;
      }
      .header {
        text-align: center;
        margin-bottom: 30px;
      }
      h1 { margin: 10px 0 5px; font-size: 28px; }
      .section {
        margin-bottom: 25px;
      }
      .section h2 {
        border-bottom: 1px solid #ccc;
        padding-bottom: 5px;
        margin-bottom: 15px;
        font-size: 20px;
      }
      .item {
        margin-bottom: 20px;
      }
      .item h3 {
        font-size: 16px;
        margin-bottom: 5px;
      }
      .subtitle {
        color: #555;
        font-size: 14px;
        margin-bottom: 3px;
      }
      .date {
        color: #777;
        font-size: 12px;
        margin-bottom: 5px;
      }
      .description {
        margin-top: 6px;
        font-size: 14px;
        color: #333;
      }
      .chip {
        display: inline-block;
        background: #f0f0f0;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 12px;
        margin: 0 4px 8px 0;
      }
      .tech-chip {
        display: inline-block;
        background: #e0e0e0;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 11px;
        margin: 0 4px 6px 0;
      }
      .tech-list {
        margin-top: 8px;
      }
      .project-item {
        border-left: 2px solid #1976d2;
        padding-left: 15px;
      }
      @media print {
        @page {
          margin: 0.2in;
        }
        body {
          padding: 0;
        }
        .section, .item, .project-item, .header {
          page-break-inside: avoid;
          page-break-after: avoid;
        }
      }
    </style>
  </head>
  <body>
    <div class="header">
      ${avatarHtml}
      <h1>${escapeHtml(personal.full_name || '')}</h1>
      <p>${escapeHtml(personal.email || '')} | ${escapeHtml(personal.phone || '')}</p>
      ${personal.linkedin ? `<p>🔗 ${escapeHtml(personal.linkedin)}</p>` : ''}
      ${personal.github ? `<p>🐙 ${escapeHtml(personal.github)}</p>` : ''}
    </div>

    <div class="section">
      <h2>О себе</h2>
      <p>${escapeHtml(bio) || 'Нет информации'}</p>
    </div>

    <div class="section">
      <h2>Навыки</h2>
      ${skillsHtml || '<p>Нет навыков</p>'}
    </div>

    ${softSkillsHtml ? `<div class="section"><h2>Софт-скиллы</h2>${softSkillsHtml}</div>` : ''}
    ${educationsHtml ? `<div class="section"><h2>Образование</h2>${educationsHtml}</div>` : ''}
    ${experiencesHtml ? `<div class="section"><h2>Опыт работы</h2>${experiencesHtml}</div>` : ''}
    ${projectsHtml ? `<div class="section"><h2>Проекты</h2>${projectsHtml}</div>` : ''}
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

module.exports = minimalTemplate;