import requests
import time
import numpy as np
import pickle
from collections import Counter
from datetime import datetime
import os

PROF_ROLES = {
    'dev': 96,        # разработка
    'design': 33,     # дизайн
    'analytics': 78   # аналитика
}
PAGES = 20           # страниц по 100 вакансий = 2000 вакансий на роль
PER_PAGE = 100
AREA = int(os.environ.get('HH_AREA', 113))

def fetch_vacancies_skills(role_id, pages=PAGES):
    """Возвращает список списков навыков для всех вакансий указанной профобласти"""
    all_skills = []
    base_url = 'https://api.hh.ru/vacancies'
    for page in range(pages):
        params = {
            'area': AREA,
            'per_page': PER_PAGE,
            'page': page,
            'professional_role': role_id
        }
        try:
            resp = requests.get(base_url, params=params, timeout=10)
            data = resp.json()
            for item in data.get('items', []):
                vac_url = item['url']
                vac_resp = requests.get(vac_url, timeout=10)
                vac_data = vac_resp.json()
                key_skills = vac_data.get('key_skills', [])
                skills = [skill['name'].lower().strip() for skill in key_skills if skill.get('name')]
                if skills:
                    all_skills.append(skills)
            time.sleep(0.5)
        except Exception as e:
            print(f"Ошибка на странице {page}: {e}")
    return all_skills

def build_skill_matrix(vacancies_skills, top_n=150):
    """Строит бинарную матрицу вакансия x навык, список навыков, частоты, матрицу co-occurrence"""
    counter = Counter()
    for skills in vacancies_skills:
        counter.update(skills)
    top_skills = [skill for skill, _ in counter.most_common(top_n)]
    skill_to_idx = {skill: i for i, skill in enumerate(top_skills)}
    matrix = []
    for skills in vacancies_skills:
        row = [0]*top_n
        for skill in skills:
            if skill in skill_to_idx:
                row[skill_to_idx[skill]] = 1
        matrix.append(row)
    matrix = np.array(matrix, dtype=np.float32)
    # Частоты нормализованные
    freq = np.array([counter.get(s, 0) for s in top_skills], dtype=np.float32)
    freq = freq / freq.max()
    # Матрица совместной встречаемости (навык x навык) и условные вероятности
    co_occ = matrix.T @ matrix   # симметричная
    row_sums = co_occ.sum(axis=1, keepdims=True)
    row_sums[row_sums == 0] = 1
    cond_probs = co_occ / row_sums   # P(навык_j | навык_i)
    return matrix, top_skills, freq, cond_probs

def collect_and_save():
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    os.makedirs('data', exist_ok=True)
    for role_name, role_id in PROF_ROLES.items():
        print(f"Сбор для {role_name}...")
        vacancies_skills = fetch_vacancies_skills(role_id)
        matrix, top_skills, freq, cond_probs = build_skill_matrix(vacancies_skills)
        np.save(f'data/{role_name}_matrix_{timestamp}.npy', matrix)
        with open(f'data/{role_name}_skills_{timestamp}.pkl', 'wb') as f:
            pickle.dump(top_skills, f)
        np.save(f'data/{role_name}_freq_{timestamp}.npy', freq)
        np.save(f'data/{role_name}_coocc_{timestamp}.npy', cond_probs)
        print(f"Сохранено {matrix.shape[0]} вакансий, {len(top_skills)} навыков")
    with open('data/last_update.txt', 'w') as f:
        f.write(timestamp)

if __name__ == "__main__":
    collect_and_save()