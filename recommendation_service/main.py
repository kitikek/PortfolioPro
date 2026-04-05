import numpy as np
import pickle
import tensorflow as tf
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import os

app = FastAPI(title="Skill Recommendations API")

# Глобальные загрузки
models = {}
skill_lists = {}
co_occ_matrices = {}

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

class UserSkillsRequest(BaseModel):
    skills: Dict[str, int]   # название навыка -> уровень (1-10)
    category: str = "dev"    # dev, design, analytics

class RecommendationResponse(BaseModel):
    recommended_skills: List[Dict[str, Any]]
    profession_matches: List[Dict[str, Any]]

def get_user_vector(skills_dict, skills_list):
    vec = np.zeros(len(skills_list), dtype=np.float32)
    for i, skill in enumerate(skills_list):
        if skill in skills_dict and skills_dict[skill] > 0:
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

def get_professions_by_category(skills_dict, category):
    # Простая эвристика на основе ключевых слов
    dev_profs = {
        "Frontend Developer": ["javascript", "react", "vue", "angular", "html", "css"],
        "Backend Developer": ["python", "java", "node.js", "go", "c#", "php", "sql"],
        "Fullstack Developer": ["javascript", "react", "node.js", "python", "html", "css"],
        "DevOps Engineer": ["docker", "kubernetes", "ci/cd", "aws", "linux"],
        "Mobile Developer": ["swift", "kotlin", "flutter", "react native"]
    }
    design_profs = {
        "UI/UX Designer": ["figma", "sketch", "adobe xd", "prototyping", "user research"],
        "Graphic Designer": ["photoshop", "illustrator", "indesign", "after effects"],
        "Product Designer": ["figma", "prototyping", "user research", "product design"]
    }
    analytics_profs = {
        "Data Analyst": ["sql", "excel", "python", "tableau", "statistics"],
        "Product Analyst": ["sql", "excel", "python", "a/b testing", "product metrics"],
        "Business Analyst": ["bpmn", "uml", "jira", "sql", "requirements"]
    }
    if category == 'design':
        prof_dict = design_profs
    elif category == 'analytics':
        prof_dict = analytics_profs
    else:
        prof_dict = dev_profs

    scores = []
    for title, keywords in prof_dict.items():
        score = 0.0
        for kw in keywords:
            if kw in skills_dict:
                level = skills_dict[kw]
                score += level / 10.0
        if keywords:
            score = score / len(keywords)
        scores.append((title, score))
    scores.sort(key=lambda x: x[1], reverse=True)
    return [{"title": p, "relevance": round(s, 2)} for p, s in scores[:3]]

@app.post("/recommend", response_model=RecommendationResponse)
async def recommend(req: UserSkillsRequest):
    try:
        cat = req.category if req.category in models else 'dev'
        model = models[cat]
        skills_list = skill_lists[cat]
        user_vec = get_user_vector(req.skills, skills_list)
        existing_indices = [i for i, val in enumerate(user_vec) if val == 1]
        if not existing_indices:
            # Нет навыков – возвращаем пустые рекомендации
            return RecommendationResponse(recommended_skills=[], profession_matches=[])
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
        professions = get_professions_by_category(req.skills, cat)
        return RecommendationResponse(recommended_skills=recommended, profession_matches=professions)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)