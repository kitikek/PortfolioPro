import numpy as np
import pickle
import tensorflow as tf
from tensorflow.keras.layers import Input, Dense, Dropout, BatchNormalization
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
import os
from datetime import datetime

def load_latest_data(role_name):
    data_dir = 'data'
    files = [f for f in os.listdir(data_dir) if f.startswith(f'{role_name}_matrix_') and f.endswith('.npy')]
    if not files:
        raise FileNotFoundError(f"No matrix file for {role_name}")
    latest = sorted(files)[-1]
    matrix = np.load(os.path.join(data_dir, latest))
    skills_file = latest.replace('matrix', 'skills').replace('.npy', '.pkl')
    with open(os.path.join(data_dir, skills_file), 'rb') as f:
        skills = pickle.load(f)
    return matrix, skills

def build_autoencoder(input_dim, encoding_dim=64):
    input_layer = Input(shape=(input_dim,), name='input')
    encoded = Dense(256, activation='relu')(input_layer)
    encoded = BatchNormalization()(encoded)
    encoded = Dropout(0.3)(encoded)
    encoded = Dense(128, activation='relu')(encoded)
    encoded = BatchNormalization()(encoded)
    encoded = Dense(encoding_dim, activation='relu', name='bottleneck')(encoded)
    decoded = Dense(128, activation='relu')(encoded)
    decoded = BatchNormalization()(decoded)
    decoded = Dropout(0.3)(decoded)
    decoded = Dense(256, activation='relu')(decoded)
    output_layer = Dense(input_dim, activation='sigmoid', name='output')(decoded)
    autoencoder = Model(input_layer, output_layer)
    autoencoder.compile(optimizer=Adam(0.001), loss='binary_crossentropy', metrics=['accuracy'])
    return autoencoder

def train_and_save():
    os.makedirs('models', exist_ok=True)
    for role_name in ['dev', 'design', 'analytics']:
        print(f"Training autoencoder for {role_name}...")
        X, skills = load_latest_data(role_name)
        input_dim = X.shape[1]
        model = build_autoencoder(input_dim, encoding_dim=64)
        early_stop = EarlyStopping(monitor='loss', patience=5, restore_best_weights=True)
        reduce_lr = ReduceLROnPlateau(monitor='loss', factor=0.5, patience=3)
        model.fit(X, X, epochs=50, batch_size=256, validation_split=0.1,
                  callbacks=[early_stop, reduce_lr], verbose=1)
        model.save(f'models/{role_name}_autoencoder.h5')
        with open(f'models/{role_name}_skills.pkl', 'wb') as f:
            pickle.dump(skills, f)
        # Также копируем последнюю co-occurrence матрицу для объяснений
        coocc_files = [f for f in os.listdir('data') if f.startswith(f'{role_name}_coocc_') and f.endswith('.npy')]
        if coocc_files:
            latest_coocc = sorted(coocc_files)[-1]
            np.save(f'models/{role_name}_coocc.npy', np.load(os.path.join('data', latest_coocc)))
        print(f"Model for {role_name} saved")

if __name__ == "__main__":
    train_and_save()