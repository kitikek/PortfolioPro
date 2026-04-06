import numpy as np
import pickle
import tensorflow as tf
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import os
import re

app = FastAPI(title="Skill Recommendations API")

# Глобальные загрузки
models = {}
skill_lists = {}
co_occ_matrices = {}
profession_vectors = {}

for role in ['dev', 'design', 'analytics']:
    model_path = f'models/{role}_autoencoder.h5'
    skills_path = f'models/{role}_skills.pkl'
    coocc_path = f'models/{role}_coocc.npy'
    prof_path = f'models/{role}_professions.pkl'
    if os.path.exists(model_path) and os.path.exists(skills_path):
        models[role] = tf.keras.models.load_model(model_path)
        with open(skills_path, 'rb') as f:
            skill_lists[role] = pickle.load(f)
        if os.path.exists(coocc_path):
            co_occ_matrices[role] = np.load(coocc_path)
        else:
            co_occ_matrices[role] = np.eye(len(skill_lists[role]))
        if os.path.exists(prof_path):
            with open(prof_path, 'rb') as f:
                profession_vectors[role] = pickle.load(f)
        else:
            profession_vectors[role] = {}

class UserSkillsRequest(BaseModel):
    skills: Dict[str, int]   # название навыка -> уровень (1-10)
    category: str = "dev"    # dev, design, analytics

class RecommendationResponse(BaseModel):
    recommended_skills: List[Dict[str, Any]]
    profession_matches: List[Dict[str, Any]]

def get_user_vector(skills_dict, skills_list):
    # Приводим ключи к нижнему регистру
    skills_lower = {k.lower(): v for k, v in skills_dict.items()}
    vec = np.zeros(len(skills_list), dtype=np.float32)
    for i, skill in enumerate(skills_list):
        if skill in skills_lower and skills_lower[skill] > 0:
            vec[i] = 1.0
    return vec

def get_explanation(recommended_skill_idx, user_skills_indices, co_occ, skills_list, top_k=2):
    probs = []
    for us_idx in user_skills_indices:
        prob = co_occ[us_idx, recommended_skill_idx]
        if prob > 0:
            probs.append((skills_list[us_idx], prob))
    if not probs:
        return "Этот навык часто требуется работодателями."
    probs.sort(key=lambda x: x[1], reverse=True)
    top_skills = probs[:top_k]
    if len(top_skills) == 1:
        return f"В {int(top_skills[0][1]*100)}% вакансий {skills_list[recommended_skill_idx]} встречается вместе с {top_skills[0][0]}."
    else:
        skills_str = ", ".join([s for s, _ in top_skills[:-1]]) + f" и {top_skills[-1][0]}"
        avg_prob = sum(p for _, p in top_skills) / len(top_skills)
        return f"В {int(avg_prob*100)}% вакансий {skills_list[recommended_skill_idx]} встречается вместе с {skills_str}."

def normalize_profession_name(name: str) -> str:
    """Приводит название профессии к каноническому виду (на английском)"""
    name = name.lower()
    # Заменяем дефисы, подчёркивания, пробелы на единый разделитель
    name = re.sub(r'[-_\s]+', ' ', name)
    # Удаляем все не-буквенно-цифровые символы, кроме пробелов
    name = re.sub(r'[^\w\s]', '', name)
    # Удаляем содержимое скобок (например, "(react)", "(js)")
    name = re.sub(r'\([^)]*\)', '', name)
    
    # Словарь перевода русских слов в английские (можно расширять)
    translation_map = {
        'разработчик': 'developer',
        'разработка': 'development',
        'фронтенд': 'frontend',
        'бэкенд': 'backend',
        'fullstack': 'fullstack',
        'дизайнер': 'designer',
        'дизайн': 'design',
        'аналитик': 'analyst',
        'аналитика': 'analytics',
        'продуктовый': 'product',
        'инженер': 'engineer',
        'devops': 'devops',
        'data': 'data',
        'ученый': 'scientist',
        'специалист': 'specialist',
        'менеджер': 'manager',
        'тестировщик': 'tester',
        'qa': 'qa',
        'системный': 'system',
        'администратор': 'administrator',
        'архитектор': 'architect',
        'лид': 'lead',
        'senior': 'senior',
        'middle': 'middle',
        'junior': 'junior'
    }
    
    # Разбиваем на слова и переводим каждое, если есть в словаре
    words = name.split()
    translated_words = [translation_map.get(w, w) for w in words]
    name = ' '.join(translated_words)
    
    # Убираем лишние пробелы в начале и конце, а также множественные пробелы
    name = ' '.join(name.split())
    return name

def get_professions_from_data(user_vector, prof_vectors, top_n=3):
    if not prof_vectors:
        return []
    user_norm = np.linalg.norm(user_vector)
    if user_norm == 0:
        return []
    user_vec_norm = user_vector / user_norm
    similarities = []
    for prof, prof_vec in prof_vectors.items():
        sim = np.dot(user_vec_norm, prof_vec)
        similarities.append((prof, float(sim)))
    similarities.sort(key=lambda x: x[1], reverse=True)

    # Дедупликация по нормализованному названию
    normalized_map = {}  # norm_name -> (original_name, score)
    for prof, sim in similarities:
        norm_prof = normalize_profession_name(prof)
        if norm_prof not in normalized_map or sim > normalized_map[norm_prof][1]:
            normalized_map[norm_prof] = (prof, sim)

    unique_similarities = list(normalized_map.values())
    unique_similarities.sort(key=lambda x: x[1], reverse=True)
    return [{"title": title, "relevance": round(sim, 2)} for title, sim in unique_similarities[:top_n]]

@app.post("/recommend", response_model=RecommendationResponse)
async def recommend(req: UserSkillsRequest):
    try:
        cat = req.category if req.category in models else 'dev'
        model = models[cat]
        skills_list = skill_lists[cat]
        user_vec = get_user_vector(req.skills, skills_list)
        existing_indices = [i for i, val in enumerate(user_vec) if val == 1]
        if not existing_indices:
            return RecommendationResponse(recommended_skills=[], profession_matches=[])
        # Рекомендации навыков
        preds = model.predict(user_vec.reshape(1, -1), verbose=0)[0]
        preds[existing_indices] = 0
        top_indices = np.argsort(preds)[-10:][::-1]
        recommended = []
        co_occ = co_occ_matrices.get(cat, np.eye(len(skills_list)))
        for idx in top_indices:
            if preds[idx] > 0.1:
                expl = get_explanation(idx, existing_indices, co_occ, skills_list)
                recommended.append({
                    "skill": skills_list[idx],
                    "score": float(preds[idx]),
                    "explanation": expl
                })
        # Профессии
        prof_vectors = profession_vectors.get(cat, {})
        professions = get_professions_from_data(user_vec, prof_vectors)
        return RecommendationResponse(recommended_skills=recommended, profession_matches=professions)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)