import requests
import time
import numpy as np
import pickle
from collections import Counter, defaultdict
from datetime import datetime
import os
import sys

PROF_ROLES = {
    'dev': 96,
    'design': 33,
    'analytics': 78
}
PAGES = 100           # 100 страниц * 100 вакансий = 10 000 вакансий на роль
PER_PAGE = 100
AREA = 113            # Россия
TOP_N = 300           # количество навыков в модели
MIN_VACANCIES_FOR_PROF = 5   # минимальное число вакансий для профессии

def fetch_vacancies_with_titles(role_id, pages=PAGES):
    result = []
    base_url = 'https://api.hh.ru/vacancies'
    for page in range(pages):
        params = {
            'area': AREA,
            'per_page': PER_PAGE,
            'page': page,
            'professional_role': role_id
        }
        for attempt in range(3):  # повторяем при ошибке
            try:
                resp = requests.get(base_url, params=params, timeout=15)
                data = resp.json()
                for item in data.get('items', []):
                    title = item.get('name', '').lower().strip()
                    vac_url = item['url']
                    vac_resp = requests.get(vac_url, timeout=15)
                    vac_data = vac_resp.json()
                    key_skills = vac_data.get('key_skills', [])
                    skills = [skill['name'].lower().strip() for skill in key_skills if skill.get('name')]
                    if skills and title:
                        result.append((title, skills))
                time.sleep(0.5)
                break  # успех, выходим из цикла попыток
            except Exception as e:
                print(f"Ошибка на странице {page} (попытка {attempt+1}): {e}")
                time.sleep(5)
        else:
            print(f"Не удалось обработать страницу {page} после 3 попыток")
        # прогресс
        sys.stdout.write(f"\rСобрано {len(result)} вакансий для роли {role_id}...")
        sys.stdout.flush()
    print()
    return result

def build_skill_matrix(vacancies_skills, top_n=TOP_N):
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
    freq = np.array([counter.get(s, 0) for s in top_skills], dtype=np.float32)
    freq = freq / freq.max() if freq.max() > 0 else freq
    # co‑occurrence
    co_occ = matrix.T @ matrix
    row_sums = co_occ.sum(axis=1, keepdims=True)
    row_sums[row_sums == 0] = 1
    cond_probs = co_occ / row_sums
    return matrix, top_skills, freq, cond_probs

def build_profession_profiles(vacancies_with_titles, top_skills, min_vacancies=MIN_VACANCIES_FOR_PROF):
    prof_skills_counter = defaultdict(lambda: defaultdict(int))
    prof_vacancy_count = defaultdict(int)
    for title, skills in vacancies_with_titles:
        prof_vacancy_count[title] += 1
        for skill in skills:
            prof_skills_counter[title][skill] += 1
    valid_profs = {p for p, cnt in prof_vacancy_count.items() if cnt >= min_vacancies}
    skill_to_idx = {skill: i for i, skill in enumerate(top_skills)}
    prof_vectors = {}
    for prof in valid_profs:
        vec = np.zeros(len(top_skills), dtype=np.float32)
        for skill, count in prof_skills_counter[prof].items():
            if skill in skill_to_idx:
                vec[skill_to_idx[skill]] = count
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        prof_vectors[prof] = vec
    return prof_vectors

def collect_and_save():
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    os.makedirs('data', exist_ok=True)
    for role_name, role_id in PROF_ROLES.items():
        print(f"\nСбор для {role_name} (ID {role_id})...")
        data = fetch_vacancies_with_titles(role_id)
        all_skills_vacancies = [skills for _, skills in data]
        matrix, top_skills, freq, co_occ = build_skill_matrix(all_skills_vacancies)
        prof_vectors = build_profession_profiles(data, top_skills)
        # Сохраняем
        np.save(f'data/{role_name}_matrix_{timestamp}.npy', matrix)
        with open(f'data/{role_name}_skills_{timestamp}.pkl', 'wb') as f:
            pickle.dump(top_skills, f)
        np.save(f'data/{role_name}_freq_{timestamp}.npy', freq)
        np.save(f'data/{role_name}_coocc_{timestamp}.npy', co_occ)
        with open(f'data/{role_name}_professions_{timestamp}.pkl', 'wb') as f:
            pickle.dump(prof_vectors, f)
        print(f"Сохранено {matrix.shape[0]} вакансий, {len(top_skills)} навыков, {len(prof_vectors)} профессий")
    with open('data/last_update.txt', 'w') as f:
        f.write(timestamp)
    print("\n✅ Сбор данных завершён!")

if __name__ == "__main__":
    collect_and_save()