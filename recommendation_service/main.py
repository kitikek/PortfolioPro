import numpy as np
import pickle
import tensorflow as tf
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
import re

app = FastAPI(title="Skill Recommendations API")

models = {}
skill_lists = {}
co_occ_matrices = {}
profession_vectors = {}
top_professions = []

# Загружаем модели и данные
for role in ['dev', 'design', 'analytics']:
    model_path = f'models/{role}_autoencoder.h5'
    skills_path = f'models/{role}_skills.pkl'
    coocc_path = f'models/{role}_coocc.npy'
    if os.path.exists(model_path) and os.path.exists(skills_path):
        models[role] = tf.keras.models.load_model(model_path)
        with open(skills_path, 'rb') as f:
            skill_lists[role] = pickle.load(f)
        if os.path.exists(coocc_path):
            co_occ_matrices[role] = np.load(coocc_path)
        else:
            co_occ_matrices[role] = np.eye(len(skill_lists[role]))
    # Загружаем нормализованные векторы профессий (для dev)
    if role == 'dev':
        prof_norm_path = 'models/dev_professions_norm.pkl'
        if os.path.exists(prof_norm_path):
            with open(prof_norm_path, 'rb') as f:
                profession_vectors[role] = pickle.load(f)
            print(f"Loaded {len(profession_vectors[role])} profession vectors")
        else:
            profession_vectors[role] = {}
            print("No profession vectors found")

# Загружаем топ-20 профессий
if os.path.exists('models/top_professions.pkl'):
    with open('models/top_professions.pkl', 'rb') as f:
        top_professions = pickle.load(f)
        print(f"Loaded {len(top_professions)} top professions")

class UserSkillsRequest(BaseModel):
    skills: Dict[str, int]
    category: str = "dev"
    selected_profession: Optional[str] = None

class RecommendationResponse(BaseModel):
    recommended_skills: List[Dict[str, Any]]
    profession_matches: Optional[List[Dict[str, Any]]] = None
    selected_profession_match: Optional[Dict[str, Any]] = None

def get_user_vector(skills_dict, skills_list):
    skills_lower = {k.lower(): v for k, v in skills_dict.items()}
    vec = np.zeros(len(skills_list), dtype=np.float32)
    for i, skill in enumerate(skills_list):
        if skill in skills_lower and skills_lower[skill] > 0:
            vec[i] = 1.0
    return vec

def get_explanation(cand_idx, user_skills_indices, co_occ, skills_list):
    probs = [(skills_list[us_idx], co_occ[us_idx, cand_idx]) for us_idx in user_skills_indices if co_occ[us_idx, cand_idx] > 0]
    if not probs:
        return "Этот навык часто требуется работодателями."
    best_skill, best_prob = max(probs, key=lambda x: x[1])
    percent = int(best_prob * 100)
    if percent < 10:
        return "Этот навык востребован на рынке труда и может дополнить ваш профиль."
    return f"В {percent}% вакансий, где требуется {best_skill}, также нужен {skills_list[cand_idx]}."

def normalize_profession_name(name: str) -> str:
    name = name.lower()
    name = re.split(r'[\(\[\{]|\/|\|', name)[0]
    name = re.sub(r'[^\w\s+#.-]', '', name)
    name = re.sub(r'[-_\s]+', ' ', name).strip()
    trans = {
        'developer': 'разработчик', 'программист': 'разработчик', 'coder': 'разработчик',
        'frontend': 'фронтенд', 'front-end': 'фронтенд', 'backend': 'бэкенд', 'back-end': 'бэкенд',
        'fullstack': 'фулстек', 'full-stack': 'фулстек', 'devops': 'девопс'
    }
    words = name.split()
    translated = [trans.get(w, w) for w in words]
    return ' '.join(translated[:3])

def get_professions_from_data(user_vector, prof_vectors, skills_list, top_n=3):
    if not prof_vectors:
        return [{"title": prof, "relevance": 0.0} for prof in top_professions[:top_n]]
    user_norm = np.linalg.norm(user_vector)
    if user_norm == 0:
        return [{"title": prof, "relevance": 0.0} for prof in top_professions[:top_n]]
    user_vec_norm = user_vector / user_norm
    similarities = []
    for prof, vec in prof_vectors.items():
        # Проверка размерности
        if len(vec) != len(user_vector):
            if len(vec) > len(user_vector):
                vec = vec[:len(user_vector)]
            else:
                vec = np.pad(vec, (0, len(user_vector)-len(vec)), 'constant')
        sim = float(np.dot(user_vec_norm, vec))
        similarities.append((prof, sim))
    similarities.sort(key=lambda x: x[1], reverse=True)
    result = []
    for prof, sim in similarities:
        if prof in top_professions or not top_professions:
            result.append({"title": prof, "relevance": round(sim, 2)})
        if len(result) >= top_n:
            break
    if len(result) < top_n:
        for p in top_professions:
            if p not in [r['title'] for r in result]:
                result.append({"title": p, "relevance": 0.0})
            if len(result) >= top_n:
                break
    return result[:top_n]

def get_recommendations_by_profession(profession, skills_list, prof_vectors, existing_indices, user_vec, top_n=10):
    norm = normalize_profession_name(profession)
    if norm in prof_vectors:
        prof_vec = prof_vectors[norm]
    else:
        found = None
        for p in prof_vectors.keys():
            if norm in p or p in norm:
                found = p
                break
        if found is None:
            return [], None
        prof_vec = prof_vectors[found]
        norm = found
    # Приводим размерность
    if len(prof_vec) != len(user_vec):
        if len(prof_vec) > len(user_vec):
            prof_vec = prof_vec[:len(user_vec)]
        else:
            prof_vec = np.pad(prof_vec, (0, len(user_vec)-len(prof_vec)), 'constant')
    user_norm = np.linalg.norm(user_vec)
    if user_norm > 0:
        user_vec_norm = user_vec / user_norm
        relevance = float(np.dot(user_vec_norm, prof_vec))
    else:
        relevance = 0.0
    scores = [(i, weight) for i, weight in enumerate(prof_vec) if i not in existing_indices and weight > 0]
    scores.sort(key=lambda x: x[1], reverse=True)
    recommended = []
    for idx, weight in scores[:top_n]:
        recommended.append({
            "skill": skills_list[idx],
            "score": float(weight),
            "explanation": f"Важен для профессии {norm}."
        })
    return recommended, {"title": norm, "relevance": round(relevance, 2)}

def get_neural_recommendations(user_vec, model, skills_list, co_occ, existing_indices, top_n=10):
    preds = model.predict(user_vec.reshape(1, -1), verbose=0)[0]
    preds[existing_indices] = 0
    top_indices = np.argsort(preds)[-top_n*2:][::-1]
    recommended = []
    for idx in top_indices:
        if preds[idx] < 0.08:
            continue
        expl = get_explanation(idx, existing_indices, co_occ, skills_list)
        recommended.append({
            "skill": skills_list[idx],
            "score": float(preds[idx]),
            "explanation": expl
        })
        if len(recommended) >= top_n:
            break
    return recommended

@app.get("/professions")
async def get_professions():
    return {"professions": top_professions}

@app.post("/recommend", response_model=RecommendationResponse)
async def recommend(req: UserSkillsRequest):
    try:
        cat = req.category if req.category in models else 'dev'
        model = models[cat]
        skills_list = skill_lists[cat]
        co_occ = co_occ_matrices[cat]
        user_vec = get_user_vector(req.skills, skills_list)
        existing_indices = [i for i, val in enumerate(user_vec) if val == 1]

        if req.selected_profession:
            prof_vectors = profession_vectors.get(cat, {})
            rec_skills, prof_match = get_recommendations_by_profession(
                req.selected_profession, skills_list, prof_vectors, existing_indices, user_vec
            )
            return RecommendationResponse(
                recommended_skills=rec_skills,
                profession_matches=None,
                selected_profession_match=prof_match
            )
        else:
            rec_skills = get_neural_recommendations(user_vec, model, skills_list, co_occ, existing_indices)
            if not rec_skills:
                scores = []
                for cand_idx in range(len(skills_list)):
                    if cand_idx in existing_indices:
                        continue
                    prob = np.mean([co_occ[us_idx, cand_idx] for us_idx in existing_indices])
                    scores.append((cand_idx, prob))
                scores.sort(key=lambda x: x[1], reverse=True)
                for idx, prob in scores[:10]:
                    if prob < 0.05:
                        continue
                    expl = get_explanation(idx, existing_indices, co_occ, skills_list)
                    rec_skills.append({
                        "skill": skills_list[idx],
                        "score": round(prob, 3),
                        "explanation": expl
                    })
            prof_vectors = profession_vectors.get(cat, {})
            prof_matches = get_professions_from_data(user_vec, prof_vectors, skills_list)
            return RecommendationResponse(
                recommended_skills=rec_skills,
                profession_matches=prof_matches,
                selected_profession_match=None
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)