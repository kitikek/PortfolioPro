import requests
import time
import numpy as np
import pickle
from collections import Counter, defaultdict
from datetime import datetime, timedelta
import os
import sys

# Настройки
KEYWORDS = ['разработчик', 'программист', 'developer', 'программист-разработчик']  # можно комбинировать
PAGES_PER_DAY = 20          # страниц в день (20 * 100 = 2000 вакансий максимум)
PER_PAGE = 100
AREA = 113                  # Россия
TOP_N = 500                 # количество навыков в модели (увеличили)
MIN_VACANCIES_FOR_PROF = 5

# Диапазон дат для сбора (последние N дней)
DAYS_BACK = 30              # соберём вакансии за последние 30 дней
END_DATE = datetime.now()
START_DATE = END_DATE - timedelta(days=DAYS_BACK)

def fetch_vacancies_by_keyword(keyword, date_from, date_to, pages=PAGES_PER_DAY):
    """Собирает вакансии по ключевому слову за указанный период"""
    result = []
    base_url = 'https://api.hh.ru/vacancies'
    for page in range(pages):
        params = {
            'area': AREA,
            'per_page': PER_PAGE,
            'page': page,
            'text': keyword,
            'date_from': date_from.strftime('%Y-%m-%d'),
            'date_to': date_to.strftime('%Y-%m-%d'),
            'order_by': 'publication_time',
        }
        try:
            resp = requests.get(base_url, params=params, timeout=30)
            data = resp.json()
            items = data.get('items', [])
            if not items:
                break  # вакансии закончились
            for item in items:
                title = item.get('name', '').lower().strip()
                vac_url = item['url']
                # Добавляем задержку, чтобы не банили
                time.sleep(0.2)
                vac_resp = requests.get(vac_url, timeout=30)
                vac_data = vac_resp.json()
                key_skills = vac_data.get('key_skills', [])
                skills = [skill['name'].lower().strip() for skill in key_skills if skill.get('name')]
                if skills and title:
                    result.append((title, skills))
            sys.stdout.write(f"\rСобрано {len(result)} вакансий для keyword='{keyword}' период {date_from.date()}...")
            sys.stdout.flush()
            time.sleep(0.5)  # пауза между страницами
        except Exception as e:
            print(f"\nОшибка на странице {page} для {keyword}: {e}")
            continue
    return result

def collect_all_vacancies():
    """Собирает вакансии за каждый день в диапазоне, объединяет результаты"""
    all_vacancies = []
    current_date = START_DATE
    while current_date <= END_DATE:
        next_date = current_date + timedelta(days=1)
        print(f"\nОбработка периода: {current_date.date()} - {next_date.date()}")
        for keyword in KEYWORDS:
            daily_vacancies = fetch_vacancies_by_keyword(keyword, current_date, next_date)
            all_vacancies.extend(daily_vacancies)
            print(f"  Для keyword '{keyword}' добавлено {len(daily_vacancies)} вакансий, всего {len(all_vacancies)}")
        current_date = next_date
    return all_vacancies

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
    co_occ = matrix.T @ matrix
    row_sums = co_occ.sum(axis=1, keepdims=True)
    row_sums[row_sums == 0] = 1
    cond_probs = co_occ / row_sums
    return matrix, top_skills, freq, cond_probs

def build_profession_profiles(vacancies_with_titles, top_skills):
    prof_skills_counter = defaultdict(lambda: defaultdict(int))
    prof_vacancy_count = defaultdict(int)
    for title, skills in vacancies_with_titles:
        prof_vacancy_count[title] += 1
        for skill in skills:
            prof_skills_counter[title][skill] += 1
    valid_profs = {p for p, cnt in prof_vacancy_count.items() if cnt >= MIN_VACANCIES_FOR_PROF}
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
    print("Начинаем сбор вакансий по ключевым словам за последние 30 дней...")
    data = collect_all_vacancies()
    if not data:
        print("Не удалось собрать ни одной вакансии. Проверьте ключевые слова и интернет.")
        return
    print(f"\nВсего собрано вакансий: {len(data)}")
    all_skills_vacancies = [skills for _, skills in data]
    matrix, top_skills, freq, co_occ = build_skill_matrix(all_skills_vacancies)
    prof_vectors = build_profession_profiles(data, top_skills)
    # Сохраняем
    np.save(f'data/dev_matrix_{timestamp}.npy', matrix)
    with open(f'data/dev_skills_{timestamp}.pkl', 'wb') as f:
        pickle.dump(top_skills, f)
    np.save(f'data/dev_freq_{timestamp}.npy', freq)
    np.save(f'data/dev_coocc_{timestamp}.npy', co_occ)
    with open(f'data/dev_professions_{timestamp}.pkl', 'wb') as f:
        pickle.dump(prof_vectors, f)
    print(f"Сохранено {matrix.shape[0]} вакансий, {len(top_skills)} навыков, {len(prof_vectors)} профессий")
    with open('data/last_update.txt', 'w') as f:
        f.write(timestamp)
    print("\n✅ Сбор данных завершён!")

if __name__ == "__main__":
    collect_and_save()