#!/bin/bash
cd D:/PortfolioPro/PortfolioPro/recommendation_service

# Активировать виртуальное окружение, если используется
# source venv/bin/activate

export HH_AREA=113
python data_collector.py
python train_model.py

# Перезапуск сервиса (пример через systemd)
sudo systemctl restart rec_service