import pickle
import re
from collections import Counter
import os
import numpy as np

# Размерность модели – 500
TOP_N = 500

translation_map = {
    'developer': 'разработчик', 'программист': 'разработчик', 'coder': 'разработчик',
    'engineer': 'инженер', 'designer': 'дизайнер', 'analyst': 'аналитик',
    'frontend': 'фронтенд', 'front-end': 'фронтенд', 'backend': 'бэкенд', 'back-end': 'бэкенд',
    'fullstack': 'фулстек', 'full-stack': 'фулстек', 'devops': 'девопс', 'data': 'данные',
    'scientist': 'ученый', 'python': 'python', 'java': 'java', 'javascript': 'javascript',
    'php': 'php', 'ruby': 'ruby', 'swift': 'swift', 'kotlin': 'kotlin', 'go': 'go',
    'rust': 'rust', 'c++': 'c++', 'c#': 'c#', '.net': '.net',
}

def translate_word(word):
    return translation_map.get(word, word)

def normalize_profession_name(name: str) -> str:
    name = name.lower()
    name = re.split(r'[\(\[\{]|\/|\|', name)[0]
    name = re.sub(r'[^\w\s+#.-]', '', name)
    name = re.sub(r'[-_\s]+', ' ', name).strip()
    words = name.split()
    translated_words = []
    for w in words:
        if re.search('[а-яА-Я]', w):
            translated_words.append(w)
        else:
            translated_words.append(translate_word(w))
    name = ' '.join(translated_words)
    stop_words = {'вакансия', 'сотрудник', 'специалист', 'инженер', 'ведущий', 'главный',
                  'менеджер', 'team lead', 'teamlead', 'senior', 'middle', 'junior'}
    words = name.split()
    words = [w for w in words if w not in stop_words]
    return ' '.join(words[:4])

def is_it_profession(name: str) -> bool:
    it_keywords = {
        'программист', 'разработчик', 'dev', 'системный', 'аналитик', 'инженер', 'архитектор', 'администратор',
        'тестировщик', 'qa', 'devops', 'data', 'битрикс', '1с', 'web', 'фронтенд', 'бэкенд', 'фулстек',
        'мобильный', 'android', 'ios', 'java', 'python', 'c++', 'c#', 'javascript', 'go', 'rust', 'kotlin',
        'swift', 'php', 'ruby', 'sql', 'oracle', 'postgresql', 'mongodb', 'docker', 'kubernetes', 'linux',
        'windows', 'server', 'network', 'security', 'support', 'helpdesk', 'it', 'computer', 'software',
        'algorithm', 'machine learning', 'ai', 'ui', 'ux', 'game', 'unity', 'unreal', 'embedded', 'firmware',
        'hardware', 'robotics', 'automation', 'scada', 'plc', 'erp', 'crm', 'wms', 'bi', 'etl', 'dwh',
        'big data', 'cloud', 'aws', 'azure', 'devsecops', 'sre', 'технический', 'системный аналитик',
        'бизнес аналитик', 'аналитик данных', 'дата аналитик', 'sql разработчик', 'баз данных', 'web разработчик',
        'frontend разработчик', 'backend разработчик', 'fullstack разработчик', 'мобильный разработчик',
        'flutter', 'react native', 'unity разработчик', 'unreal engine', 'vr', 'ar', 'ml', 'ai разработчик'
    }
    name_lower = name.lower()
    non_it = {'фармацевт', 'конструктор', 'бухгалтер', 'повар', 'водитель', 'уборщик', 'продавец',
              'менеджер по продажам', 'маркетолог', 'юрист', 'директор', 'шеф', 'агроном', 'врач',
              'учитель', 'педагог', 'механик', 'электрик', 'сантехник', 'сварщик', 'грузчик', 'кладовщик',
              'комплектовщик', 'кондитер', 'ветеринар', 'зоотехник', 'химик', 'биолог', 'эколог',
              'психолог', 'логопед', 'дизайнер', 'архитектор', 'инженер-строитель', 'строитель',
              'электромонтер', 'слесарь', 'токарь', 'фрезеровщик', 'машинист', 'тракторист', 'оператор станка'}
    for word in non_it:
        if word in name_lower:
            it_hit = any(kw in name_lower for kw in it_keywords)
            if not it_hit:
                return False
    for kw in it_keywords:
        if kw in name_lower:
            return True
    return False

def load_latest_skills(role_name='dev'):
    data_dir = 'data'
    skills_files = [f for f in os.listdir(data_dir) if f.startswith(f'{role_name}_skills_') and f.endswith('.pkl')]
    if not skills_files:
        raise FileNotFoundError(f"No skills file for {role_name}")
    latest = sorted(skills_files)[-1]
    with open(os.path.join(data_dir, latest), 'rb') as f:
        skills = pickle.load(f)
    return skills

def load_latest_professions(role_name='dev'):
    data_dir = 'data'
    prof_files = [f for f in os.listdir(data_dir) if f.startswith(f'{role_name}_professions_') and f.endswith('.pkl')]
    if not prof_files:
        raise FileNotFoundError(f"No professions file for {role_name}")
    latest = sorted(prof_files)[-1]
    with open(os.path.join(data_dir, latest), 'rb') as f:
        prof_vectors = pickle.load(f)
    return prof_vectors

def process_professions(prof_vectors, skills, min_count=5):
    skill_to_idx = {skill: i for i, skill in enumerate(skills)}
    n_skills = len(skills)  # должно быть 500
    print(f"Размерность навыков: {n_skills}")

    norm_prof_counter = Counter()
    for prof in prof_vectors.keys():
        norm = normalize_profession_name(prof)
        if norm and is_it_profession(norm):
            norm_prof_counter[norm] += 1
    print("\n=== Все IT-профессии (с частотами) ===")
    for p, cnt in sorted(norm_prof_counter.items(), key=lambda x: x[1], reverse=True):
        print(f"{p}: {cnt}")
    filtered = {p: cnt for p, cnt in norm_prof_counter.items() if cnt >= min_count}
    print(f"\n=== IT-профессий с частотой >= {min_count}: {len(filtered)} ===")
    top_profs = []
    for p, cnt in sorted(filtered.items(), key=lambda x: x[1], reverse=True)[:20]:
        top_profs.append(p)
        print(f"{p} (частота: {cnt})")

    combined_vectors = {}
    for orig_prof, vec in prof_vectors.items():
        norm = normalize_profession_name(orig_prof)
        if norm in filtered:
            # Приводим размерность к n_skills
            if len(vec) >= n_skills:
                truncated_vec = vec[:n_skills]
            else:
                truncated_vec = np.pad(vec, (0, n_skills - len(vec)), 'constant')
            if norm not in combined_vectors:
                combined_vectors[norm] = []
            combined_vectors[norm].append(truncated_vec)
    final_vectors = {}
    for norm, vec_list in combined_vectors.items():
        final_vectors[norm] = np.mean(vec_list, axis=0)
    os.makedirs('models', exist_ok=True)
    with open('models/dev_professions_norm.pkl', 'wb') as f:
        pickle.dump(final_vectors, f)
    with open('models/top_professions.pkl', 'wb') as f:
        pickle.dump(top_profs, f)
    print(f"\n✅ Топ-20 IT-профессий сохранены в models/top_professions.pkl")
    print(f"✅ Нормализованные векторы профессий (размерность {n_skills}) сохранены в models/dev_professions_norm.pkl")
    return top_profs

if __name__ == "__main__":
    skills = load_latest_skills('dev')
    prof_vectors = load_latest_professions('dev')
    top_profs = process_professions(prof_vectors, skills, min_count=5)