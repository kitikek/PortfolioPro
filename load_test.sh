#!/bin/bash
# ПОЛНОЕ нагрузочное тестирование всех эндпоинтов PortfolioPro
# Результаты сохраняются в full_load_test_complete_all.txt

BASE_URL="http://localhost:5000"
OUTPUT_FILE="full_load_test_complete_all.txt"
> "$OUTPUT_FILE"

# Функция логирования
log() {
    echo "$1" | tee -a "$OUTPUT_FILE"
}

# Получение токена
get_token() {
    TOKEN=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"test@example.com","password":"password123"}' \
        | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
    if [ -z "$TOKEN" ]; then
        log "ОШИБКА: не удалось получить токен. Запустите бэкенд и проверьте пользователя test@example.com."
        exit 1
    fi
    log "Токен получен"
}

# Функция выполнения нагрузочного теста
run_test() {
    local name="$1"
    local cmd="$2"
    log "=== $name ==="
    eval "$cmd" 2>&1 | tee -a "$OUTPUT_FILE"
}

# Создание временных файлов для загрузки
create_temp_files() {
    # Создаём маленькое изображение (1x1 PNG в base64)
    echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==" | base64 -d > /tmp/test_image.png
    # Создаём небольшой видео-файл (пустой, но с расширением mp4)
    dd if=/dev/zero of=/tmp/test_video.mp4 bs=1024 count=10 2>/dev/null
    # Создаём текстовый файл для документа
    echo "test content" > /tmp/test_file.txt
    log "Временные файлы для загрузки созданы"
}

# Удаление временных файлов
clean_temp_files() {
    rm -f /tmp/test_image.png /tmp/test_video.mp4 /tmp/test_file.txt 2>/dev/null
}

# Предварительное создание ресурсов (проект, навык, образование, опыт, резюме)
create_test_resources() {
    log "Создание тестовых ресурсов..."
    # Проект
    PROJ_RESP=$(curl -s -X POST "$BASE_URL/api/v1/projects" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"portfolioId":1,"title":"Нагрузочный тест","description":"Для тестирования","technologies":["Test"]}')
    TEST_PROJECT_ID=$(echo "$PROJ_RESP" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
    # Навык
    SKILL_RESP=$(curl -s -X POST "$BASE_URL/api/v1/skills" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"name":"Тестовый навык","level":5,"category":"Тест"}')
    TEST_SKILL_ID=$(echo "$SKILL_RESP" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
    # Образование
    EDU_RESP=$(curl -s -X POST "$BASE_URL/api/v1/educations" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"institution":"Тестовый институт","degree":"Бакалавр","field_of_study":"Тест","start_date":"2020-01-01","end_date":"2024-01-01"}')
    TEST_EDU_ID=$(echo "$EDU_RESP" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
    # Опыт работы
    EXP_RESP=$(curl -s -X POST "$BASE_URL/api/v1/experiences" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"company":"Тестовая компания","position":"Тестовая должность","start_date":"2020-01-01","current":true,"description":"Тестовое описание"}')
    TEST_EXP_ID=$(echo "$EXP_RESP" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
    # Soft-скилл
    SOFT_RESP=$(curl -s -X POST "$BASE_URL/api/v1/soft-skills" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"name":"Коммуникабельность"}')
    TEST_SOFT_ID=$(echo "$SOFT_RESP" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
    # Резюме (простое)
    RES_RESP=$(curl -s -X POST "$BASE_URL/api/v1/resumes" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"title":"Тестовое резюме","template":"default","data":{"personal":{"full_name":"Тест"}},"is_public":false}')
    TEST_RES_ID=$(echo "$RES_RESP" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
    log "Созданы: проект id=$TEST_PROJECT_ID, навык id=$TEST_SKILL_ID, образование id=$TEST_EDU_ID, опыт id=$TEST_EXP_ID, soft id=$TEST_SOFT_ID, резюме id=$TEST_RES_ID"
    export TEST_PROJECT_ID TEST_SKILL_ID TEST_EDU_ID TEST_EXP_ID TEST_SOFT_ID TEST_RES_ID
}

# Удаление тестовых ресурсов (после тестов)
delete_test_resources() {
    log "Удаление тестовых ресурсов..."
    curl -s -X DELETE "$BASE_URL/api/v1/projects/$TEST_PROJECT_ID" -H "Authorization: Bearer $TOKEN" > /dev/null
    curl -s -X DELETE "$BASE_URL/api/v1/skills/$TEST_SKILL_ID" -H "Authorization: Bearer $TOKEN" > /dev/null
    curl -s -X DELETE "$BASE_URL/api/v1/educations/$TEST_EDU_ID" -H "Authorization: Bearer $TOKEN" > /dev/null
    curl -s -X DELETE "$BASE_URL/api/v1/experiences/$TEST_EXP_ID" -H "Authorization: Bearer $TOKEN" > /dev/null
    curl -s -X DELETE "$BASE_URL/api/v1/soft-skills/$TEST_SOFT_ID" -H "Authorization: Bearer $TOKEN" > /dev/null
    curl -s -X DELETE "$BASE_URL/api/v1/resumes/$TEST_RES_ID" -H "Authorization: Bearer $TOKEN" > /dev/null
    log "Тестовые ресурсы удалены"
}

# Функция для GET-запросов (длительный и ramp-up)
test_get_endpoint() {
    local endpoint=$1
    local description=$2
    run_test "Длительный тест: $description (c=20, d=60)" "autocannon -c 20 -d 60 -H \"Authorization: Bearer $TOKEN\" \"$BASE_URL$endpoint\""
    for c in 1 5 10 20 30 50; do
        run_test "Ramp-up: $description (c=$c, d=10)" "autocannon -c $c -d 10 -H \"Authorization: Bearer $TOKEN\" \"$BASE_URL$endpoint\""
    done
}

# ============================================================================
# 1. Аутентификация и пользователь
# ============================================================================
get_token
run_test "POST /auth/login (c=10, d=10)" "autocannon -c 10 -d 10 -m POST -H \"Content-Type: application/json\" -b '{\"email\":\"test@example.com\",\"password\":\"password123\"}' \"$BASE_URL/api/v1/auth/login\""
test_get_endpoint "/api/v1/auth/me" "GET /auth/me"
test_get_endpoint "/api/v1/projects" "GET /projects"
test_get_endpoint "/api/v1/resumes" "GET /resumes"
test_get_endpoint "/api/v1/skills" "GET /skills"
test_get_endpoint "/api/v1/portfolios" "GET /portfolios"
test_get_endpoint "/api/v1/educations" "GET /educations"
test_get_endpoint "/api/v1/experiences" "GET /experiences"
test_get_endpoint "/api/v1/soft-skills" "GET /soft-skills"

# ============================================================================
# 2. POST (создание) – небольшие тесты, чтобы не захламлять БД (c=5, d=10)
# ============================================================================
run_test "POST /projects (create, c=5, d=10)" "autocannon -c 5 -d 10 -m POST -H \"Content-Type: application/json\" -H \"Authorization: Bearer $TOKEN\" -b '{\"portfolioId\":1,\"title\":\"Нагрузочный тест\",\"description\":\"Проверка\",\"technologies\":[\"Node.js\"]}' \"$BASE_URL/api/v1/projects\""
run_test "POST /skills (c=5, d=10)" "autocannon -c 5 -d 10 -m POST -H \"Content-Type: application/json\" -H \"Authorization: Bearer $TOKEN\" -b '{\"name\":\"Навык тест\",\"level\":3,\"category\":\"Тест\"}' \"$BASE_URL/api/v1/skills\""
run_test "POST /educations (c=5, d=10)" "autocannon -c 5 -d 10 -m POST -H \"Content-Type: application/json\" -H \"Authorization: Bearer $TOKEN\" -b '{\"institution\":\"Университет тест\",\"degree\":\"Магистр\",\"field_of_study\":\"Тест\",\"start_date\":\"2020-01-01\"}' \"$BASE_URL/api/v1/educations\""
run_test "POST /experiences (c=5, d=10)" "autocannon -c 5 -d 10 -m POST -H \"Content-Type: application/json\" -H \"Authorization: Bearer $TOKEN\" -b '{\"company\":\"Компания тест\",\"position\":\"Должность тест\",\"start_date\":\"2020-01-01\"}' \"$BASE_URL/api/v1/experiences\""
run_test "POST /soft-skills (c=5, d=10)" "autocannon -c 5 -d 10 -m POST -H \"Content-Type: application/json\" -H \"Authorization: Bearer $TOKEN\" -b '{\"name\":\"Soft тест\"}' \"$BASE_URL/api/v1/soft-skills\""
run_test "POST /resumes (c=5, d=10)" "autocannon -c 5 -d 10 -m POST -H \"Content-Type: application/json\" -H \"Authorization: Bearer $TOKEN\" -b '{\"title\":\"Тестовое резюме\",\"template\":\"default\",\"data\":{\"personal\":{\"full_name\":\"Тест\"}},\"is_public\":false}' \"$BASE_URL/api/v1/resumes\""

# ============================================================================
# 3. PUT и DELETE – для этого предварительно создадим ресурсы (один раз)
#    Тесты делаем короткими (c=3, d=5), чтобы не перегружать
# ============================================================================
create_test_resources
# PUT
run_test "PUT /projects/:id (обновление, c=3, d=5)" "autocannon -c 3 -d 5 -m PUT -H \"Content-Type: application/json\" -H \"Authorization: Bearer $TOKEN\" -b '{\"title\":\"Обновлённый проект\"}' \"$BASE_URL/api/v1/projects/$TEST_PROJECT_ID\""
run_test "PUT /skills/:id (c=3, d=5)" "autocannon -c 3 -d 5 -m PUT -H \"Content-Type: application/json\" -H \"Authorization: Bearer $TOKEN\" -b '{\"level\":7}' \"$BASE_URL/api/v1/skills/$TEST_SKILL_ID\""
run_test "PUT /educations/:id (c=3, d=5)" "autocannon -c 3 -d 5 -m PUT -H \"Content-Type: application/json\" -H \"Authorization: Bearer $TOKEN\" -b '{\"degree\":\"Обновлённая степень\"}' \"$BASE_URL/api/v1/educations/$TEST_EDU_ID\""
run_test "PUT /experiences/:id (c=3, d=5)" "autocannon -c 3 -d 5 -m PUT -H \"Content-Type: application/json\" -H \"Authorization: Bearer $TOKEN\" -b '{\"position\":\"Старший тест\"}' \"$BASE_URL/api/v1/experiences/$TEST_EXP_ID\""
run_test "PUT /soft-skills/:id (c=3, d=5)" "autocannon -c 3 -d 5 -m PUT -H \"Content-Type: application/json\" -H \"Authorization: Bearer $TOKEN\" -b '{\"name\":\"Обновлённый софт\"}' \"$BASE_URL/api/v1/soft-skills/$TEST_SOFT_ID\""
run_test "PUT /resumes/:id (c=3, d=5)" "autocannon -c 3 -d 5 -m PUT -H \"Content-Type: application/json\" -H \"Authorization: Bearer $TOKEN\" -b '{\"title\":\"Обновлённое резюме\"}' \"$BASE_URL/api/v1/resumes/$TEST_RES_ID\""
# DELETE
run_test "DELETE /projects/:id (c=3, d=5)" "autocannon -c 3 -d 5 -m DELETE -H \"Authorization: Bearer $TOKEN\" \"$BASE_URL/api/v1/projects/$TEST_PROJECT_ID\""
run_test "DELETE /skills/:id (c=3, d=5)" "autocannon -c 3 -d 5 -m DELETE -H \"Authorization: Bearer $TOKEN\" \"$BASE_URL/api/v1/skills/$TEST_SKILL_ID\""
run_test "DELETE /educations/:id (c=3, d=5)" "autocannon -c 3 -d 5 -m DELETE -H \"Authorization: Bearer $TOKEN\" \"$BASE_URL/api/v1/educations/$TEST_EDU_ID\""
run_test "DELETE /experiences/:id (c=3, d=5)" "autocannon -c 3 -d 5 -m DELETE -H \"Authorization: Bearer $TOKEN\" \"$BASE_URL/api/v1/experiences/$TEST_EXP_ID\""
run_test "DELETE /soft-skills/:id (c=3, d=5)" "autocannon -c 3 -d 5 -m DELETE -H \"Authorization: Bearer $TOKEN\" \"$BASE_URL/api/v1/soft-skills/$TEST_SOFT_ID\""
run_test "DELETE /resumes/:id (c=3, d=5)" "autocannon -c 3 -d 5 -m DELETE -H \"Authorization: Bearer $TOKEN\" \"$BASE_URL/api/v1/resumes/$TEST_RES_ID\""
delete_test_resources

# ============================================================================
# 4. Загрузка файлов (изображения, видео, документы)
#    Требуют наличия проекта с id (используем ранее созданный, но он был удалён, создадим новый временный)
# ============================================================================
create_temp_files
# Создадим проект, к которому будем прикреплять файлы
TEMP_PROJ_RESP=$(curl -s -X POST "$BASE_URL/api/v1/projects" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"portfolioId":1,"title":"Проект для файлов"}')
TEMP_PROJ_ID=$(echo "$TEMP_PROJ_RESP" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
if [ -n "$TEMP_PROJ_ID" ]; then
    run_test "POST /projects/:id/images (загрузка изображения, c=2, d=10)" "autocannon -c 2 -d 10 -m POST -H \"Authorization: Bearer $TOKEN\" -F \"image=@/tmp/test_image.png\" \"$BASE_URL/api/v1/projects/$TEMP_PROJ_ID/images\""
    run_test "POST /projects/:id/videos (загрузка видео, c=2, d=10)" "autocannon -c 2 -d 10 -m POST -H \"Authorization: Bearer $TOKEN\" -F \"video=@/tmp/test_video.mp4\" \"$BASE_URL/api/v1/projects/$TEMP_PROJ_ID/videos\""
    run_test "POST /projects/:id/files (загрузка файла, c=2, d=10)" "autocannon -c 2 -d 10 -m POST -H \"Authorization: Bearer $TOKEN\" -F \"file=@/tmp/test_file.txt\" \"$BASE_URL/api/v1/projects/$TEMP_PROJ_ID/files\""
    # Удаляем временный проект
    curl -s -X DELETE "$BASE_URL/api/v1/projects/$TEMP_PROJ_ID" -H "Authorization: Bearer $TOKEN" > /dev/null
fi
clean_temp_files

# ============================================================================
# 5. Публичные эндпоинты (без токена)
#    Для публичного проекта нужно иметь опубликованный проект. Создадим временный опубликованный проект.
# ============================================================================
# Создаём опубликованный проект
PUB_PROJ_RESP=$(curl -s -X POST "$BASE_URL/api/v1/projects" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"portfolioId":1,"title":"Публичный проект","is_published":true}')
PUB_PROJ_ID=$(echo "$PUB_PROJ_RESP" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
if [ -n "$PUB_PROJ_ID" ]; then
    run_test "GET /project/public/:id (публичный проект, c=10, d=10)" "autocannon -c 10 -d 10 \"$BASE_URL/api/v1/project/public/$PUB_PROJ_ID\""
    curl -s -X DELETE "$BASE_URL/api/v1/projects/$PUB_PROJ_ID" -H "Authorization: Bearer $TOKEN" > /dev/null
fi
# Создаём опубликованное резюме
PUB_RES_RESP=$(curl -s -X POST "$BASE_URL/api/v1/resumes" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"title":"Публичное резюме","template":"default","data":{"personal":{"full_name":"Тест"}},"is_public":true}')
PUB_RES_ID=$(echo "$PUB_RES_RESP" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
if [ -n "$PUB_RES_ID" ]; then
    run_test "GET /resume/public/:id (публичное резюме, c=10, d=10)" "autocannon -c 10 -d 10 \"$BASE_URL/api/v1/resumes/public/$PUB_RES_ID\""
    curl -s -X DELETE "$BASE_URL/api/v1/resumes/$PUB_RES_ID" -H "Authorization: Bearer $TOKEN" > /dev/null
fi

# ============================================================================
# 6. Восстановление пароля (только forgot-password, так как reset-password требует токена из письма)
#    Этот тест не должен блокировать реальную отправку писем, но логгирует.
# ============================================================================
run_test "POST /auth/forgot-password (c=5, d=10)" "autocannon -c 5 -d 10 -m POST -H \"Content-Type: application/json\" -b '{\"email\":\"test@example.com\"}' \"$BASE_URL/api/v1/auth/forgot-password\""

# ============================================================================
# 7. Аналитический эндпоинт (уже был, но добавим длительный тест для 10 навыков)
# ============================================================================
run_test "Длительный тест: POST /analytics/recommend (10 навыков, c=10, d=60)" "autocannon -c 10 -d 60 -m POST -H \"Content-Type: application/json\" -H \"Authorization: Bearer $TOKEN\" -b '{\"skills\":{\"python\":5,\"sql\":4,\"javascript\":3,\"html\":2,\"css\":2,\"react\":4,\"node.js\":3,\"git\":4,\"docker\":3,\"postgresql\":3},\"category\":\"dev\"}' \"$BASE_URL/api/v1/analytics/recommend\""

# ============================================================================
# 8. Смешанная нагрузка (уже есть, но повторим для надёжности)
# ============================================================================
run_test "Смешанная нагрузка: GET /projects (c=5) + POST /analytics (c=5)" "autocannon -c 5 -d 10 -H \"Authorization: Bearer $TOKEN\" \"$BASE_URL/api/v1/projects\" > /tmp/ac_mix1.out 2>&1 & autocannon -c 5 -d 10 -m POST -H \"Content-Type: application/json\" -H \"Authorization: Bearer $TOKEN\" -b '{\"skills\":{\"python\":5,\"sql\":4,\"javascript\":3},\"category\":\"dev\"}' \"$BASE_URL/api/v1/analytics/recommend\" > /tmp/ac_mix2.out 2>&1 & wait; cat /tmp/ac_mix1.out /tmp/ac_mix2.out; rm -f /tmp/ac_mix*.out"

log "============================================="
log "Полное нагрузочное тестирование завершено."
log "Результаты сохранены в файл $OUTPUT_FILE"