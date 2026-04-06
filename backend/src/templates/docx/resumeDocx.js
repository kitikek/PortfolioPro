const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, BorderStyle, WidthType, ShadingType } = require('docx');

function generateDocx(resumeData) {
  const { personal, bio, skills, projects, softSkills, educations, experiences } = resumeData;

  // Вспомогательная функция для экранирования (docx сам обрабатывает)
  const text = (str) => str || '';

  // Начинаем собирать документ
  const sections = [];

  // Заголовок: ФИО
  sections.push(new Paragraph({
    text: text(personal.full_name),
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
  }));

  // Контакты
  const contactsLine = `${text(personal.email)} | ${text(personal.phone)}`;
  sections.push(new Paragraph({
    text: contactsLine,
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
  }));

  // Ссылки на LinkedIn/GitHub, если есть
  if (personal.linkedin || personal.github) {
    const links = [];
    if (personal.linkedin) links.push(`🔗 ${personal.linkedin}`);
    if (personal.github) links.push(`🐙 ${personal.github}`);
    sections.push(new Paragraph({
      text: links.join(' | '),
      alignment: AlignmentType.CENTER,
    }));
  }

  // Раздел "О себе"
  if (bio) {
    sections.push(new Paragraph({ text: 'О себе', heading: HeadingLevel.HEADING_2, spacing: { before: 200 } }));
    sections.push(new Paragraph({ text: text(bio), spacing: { after: 200 } }));
  }

  // Образование
  if (educations && educations.length > 0) {
    sections.push(new Paragraph({ text: 'Образование', heading: HeadingLevel.HEADING_2, spacing: { before: 200 } }));
    for (const edu of educations) {
      sections.push(new Paragraph({ text: text(edu.institution), heading: HeadingLevel.HEADING_3 }));
      sections.push(new Paragraph({ text: `${text(edu.degree)} ${text(edu.field_of_study)}`.trim() }));
      sections.push(new Paragraph({ text: `${edu.start_date || '?'} — ${edu.end_date || 'настоящее время'}`, style: 'small' }));
      if (edu.description) sections.push(new Paragraph({ text: text(edu.description), spacing: { after: 200 } }));
      else sections.push(new Paragraph({ text: '', spacing: { after: 100 } }));
    }
  }

  // Опыт работы
  if (experiences && experiences.length > 0) {
    sections.push(new Paragraph({ text: 'Опыт работы', heading: HeadingLevel.HEADING_2, spacing: { before: 200 } }));
    for (const exp of experiences) {
      sections.push(new Paragraph({ text: `${text(exp.position)} в ${text(exp.company)}`, heading: HeadingLevel.HEADING_3 }));
      sections.push(new Paragraph({ text: `${exp.start_date || '?'} — ${exp.current ? 'настоящее время' : exp.end_date || '?'}`, style: 'small' }));
      if (exp.description) sections.push(new Paragraph({ text: text(exp.description), spacing: { after: 200 } }));
      else sections.push(new Paragraph({ text: '', spacing: { after: 100 } }));
    }
  }

  // Технические навыки (список с уровнями)
  if (skills && skills.length > 0) {
    sections.push(new Paragraph({ text: 'Технические навыки', heading: HeadingLevel.HEADING_2, spacing: { before: 200 } }));
    for (const skill of skills.filter(s => s.included !== false)) {
      sections.push(new Paragraph({ text: `${skill.name} — уровень ${skill.level}/10`, bullet: { level: 0 } }));
    }
    sections.push(new Paragraph({ text: '', spacing: { after: 100 } }));
  }

  // Софт-скиллы (простой список)
  if (softSkills && softSkills.length > 0) {
    sections.push(new Paragraph({ text: 'Софт-скиллы', heading: HeadingLevel.HEADING_2, spacing: { before: 200 } }));
    for (const ss of softSkills) {
      sections.push(new Paragraph({ text: ss.name, bullet: { level: 0 } }));
    }
    sections.push(new Paragraph({ text: '', spacing: { after: 100 } }));
  }

  // Проекты
  if (projects && projects.length > 0) {
    sections.push(new Paragraph({ text: 'Проекты', heading: HeadingLevel.HEADING_2, spacing: { before: 200 } }));
    for (const proj of projects.filter(p => p.included !== false)) {
      sections.push(new Paragraph({ text: text(proj.title), heading: HeadingLevel.HEADING_3 }));
      if (proj.description) sections.push(new Paragraph({ text: text(proj.description) }));
      if (proj.technologies && proj.technologies.length) {
        sections.push(new Paragraph({ text: `Технологии: ${proj.technologies.join(', ')}`, style: 'small' }));
      }
      if (proj.links && (proj.links.github || proj.links.demo)) {
        const linksText = [];
        if (proj.links.github) linksText.push(`GitHub: ${proj.links.github}`);
        if (proj.links.demo) linksText.push(`Demo: ${proj.links.demo}`);
        sections.push(new Paragraph({ text: linksText.join(' | '), style: 'small' }));
      }
      sections.push(new Paragraph({ text: '', spacing: { after: 150 } }));
    }
  }

  // Создаём документ
  const doc = new Document({
    styles: {
      paragraphStyles: [
        { id: 'small', name: 'small', basedOn: 'Normal', run: { size: 20 } },
      ],
    },
    sections: [{ children: sections }],
  });

  return doc;
}

module.exports = generateDocx;