from flask import Flask, render_template, request, jsonify, redirect, url_for
import json
import os
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import joblib
from datetime import datetime

app = Flask(__name__)

# Chemin vers le fichier de stockage des patients
PATIENTS_FILE = 'patients.json'
MODEL_FILE = 'diagnosis_model.pkl'

# --- Fonctions de gestion des données (simule une base de données) ---
def load_patients():
    if os.path.exists(PATIENTS_FILE):
        with open(PATIENTS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def save_patients(patients):
    with open(PATIENTS_FILE, 'w', encoding='utf-8') as f:
        json.dump(patients, f, indent=4, ensure_ascii=False)

# --- Modèle d'IA (simplifié pour l'exemple) ---
def train_diagnosis_model():
    X = np.array([
        [70, 37.0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], # Sain
        [90, 38.5, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0], # Grippe légère
        [95, 39.2, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0], # Grippe modérée
        [100, 39.8, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0], # Grippe sévère
        [110, 39.5, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0], # Paludisme léger
        [120, 40.5, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1], # Paludisme sévère
        [80, 37.5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], # Sain
        [92, 38.8, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0], # Grippe
        [115, 40.0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0], # Paludisme
        [75, 36.8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], # Sain
        [88, 38.0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0], # Grippe
        [105, 39.0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0], # Paludisme
    ])
    y = np.array([0, 1, 1, 1, 2, 2, 0, 1, 2, 0, 1, 2])

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)
    joblib.dump(model, MODEL_FILE)
    print("Modèle d'IA entraîné et sauvegardé.")
    return model

def load_or_train_model():
    if os.path.exists(MODEL_FILE):
        print("Chargement du modèle d'IA existant.")
        return joblib.load(MODEL_FILE)
    else:
        print("Entraînement d'un nouveau modèle d'IA.")
        return train_diagnosis_model()

diagnosis_model = load_or_train_model()

SYMPTOM_MAP = {
    'Fièvre': 2, 'Toux': 3, 'Fatigue': 4, 'Mal de tête': 5, 'Douleurs musculaires': 6, 'Frissons': 7,
    'Forte fièvre': 8, 'Vomissements': 9, 'Nausées': 10, 'Sueurs abondantes': 11, 'Douleurs abdominales': 12, 'Diarrhée': 13
}

def predict_diagnosis(bpm, temperature, symptoms_list):
    features = [bpm, temperature] + [0] * (len(SYMPTOM_MAP))

    for symptom in symptoms_list:
        if symptom in SYMPTOM_MAP:
            features[SYMPTOM_MAP[symptom]] = 1

    features_array = np.array(features).reshape(1, -1)
    prediction = diagnosis_model.predict(features_array)[0]

    diagnosis_text = "Aucune maladie détectée"
    severity = "Normal"
    is_ill = False

    if prediction == 1: # Grippe
        diagnosis_text = "Grippe"
        is_ill = True
        if temperature > 39 or bpm > 100:
            severity = "Modéré à sévère"
        else:
            severity = "Léger"
    elif prediction == 2: # Paludisme
        diagnosis_text = "Paludisme"
        is_ill = True
        if temperature > 39.5 or bpm > 110:
            severity = "Sévère"
        elif temperature > 38.5 or bpm > 100:
            severity = "Modéré"
        else:
            severity = "Léger"

    return {
        'diagnosis': diagnosis_text,
        'severity': severity,
        'isIll': is_ill
    }


# --- Routes Flask pour les pages HTML ---

@app.route('/')
def home_page():
    return render_template('index.html')

@app.route('/main_menu')
def main_menu_page(): 
    return render_template('main_menu.html')

@app.route('/create_patient')
def create_patient_page():
    return render_template('create_patient.html')

@app.route('/patient_list')
def patient_list_page():
    return render_template('patient_list.html')

@app.route('/diagnosis_entry')
def diagnosis_entry_page():
    return render_template('diagnosis_entry.html')

@app.route('/diagnosis_form/<patient_id>')
def diagnosis_form_page(patient_id):
    patients = load_patients()
    patient = next((p for p in patients if p['id'] == patient_id), None)
    if patient:
        return render_template('diagnosis_form.html', patient=patient)
    return redirect(url_for('diagnosis_entry_page')) # Redirige si patient non trouvé

@app.route('/diagnosis_results')
def diagnosis_results_page():
    # Cette page sera rendue après un POST à /api/diagnose
    # Les données seront passées via la session ou un stockage temporaire si nécessaire,
    # mais pour cet exemple, le JS gère l'affichage direct après l'API.
    return render_template('diagnosis_results.html')

@app.route('/dashboard')
def dashboard_page():
    return render_template('dashboard.html')

@app.route('/patient_details/<patient_id>')
def patient_details_page(patient_id):
    patients = load_patients()
    patient = next((p for p in patients if p['id'] == patient_id), None)
    if patient:
        return render_template('patient_details.html', patient=patient)
    return redirect(url_for('patient_list_page'))

@app.route('/video_consultation')
def video_consultation_page():
    return render_template('video_consultation.html')


# --- Routes API ---

@app.route('/api/patients', methods=['GET'])
def get_patients_api():
    patients = load_patients()
    return jsonify(patients)

@app.route('/api/patients', methods=['POST'])
def add_patient_api():
    patients = load_patients()
    data = request.json
    new_patient = {
        'id': data.get('id'),
        'lastName': data.get('lastName'),
        'firstName': data.get('firstName'),
        'age': data.get('age'),
        'gender': data.get('gender'),
        'registrationDate': datetime.now().strftime('%d/%m/%Y'),
        'diagnoses': [] # Ajout de l'historique des diagnostics
    }
    patients.append(new_patient)
    save_patients(patients)
    return jsonify(new_patient), 201

@app.route('/api/patients/<patient_id>', methods=['GET'])
def get_patient_api(patient_id):
    patients = load_patients()
    patient = next((p for p in patients if p['id'] == patient_id), None)
    if patient:
        return jsonify(patient)
    return jsonify({'message': 'Patient not found'}), 404

@app.route('/api/diagnose', methods=['POST'])
def diagnose_patient_api():
    data = request.json
    patient_id = data.get('patientId')
    bpm = data.get('bpm')
    temperature = data.get('temperature')
    symptoms = data.get('symptoms', []) # Peut être vide

    patients = load_patients()
    patient = next((p for p in patients if p['id'] == patient_id), None)

    if not patient:
        return jsonify({'message': 'Patient not found'}), 404

    # Effectuer la prédiction avec le modèle d'IA
    diagnosis_info = predict_diagnosis(bpm, temperature, symptoms)

    # Enregistrer le diagnostic dans l'historique du patient
    new_diagnosis_record = {
        'date': datetime.now().strftime('%d/%m/%Y %H:%M'),
        'bpm': bpm,
        'temperature': temperature,
        'symptoms': symptoms,
        'diagnosis': diagnosis_info['diagnosis'],
        'severity': diagnosis_info['severity']
    }
    if 'diagnoses' not in patient:
        patient['diagnoses'] = []
    patient['diagnoses'].append(new_diagnosis_record)
    save_patients(patients) # Sauvegarder les patients mis à jour

    return jsonify({
        'patient': patient,
        'diagnosisInfo': diagnosis_info,
        'vitals': {'bpm': bpm, 'temperature': temperature},
        'reportedSymptoms': symptoms
    })

@app.route('/api/dashboard_data', methods=['GET'])
def get_dashboard_data():
    patients = load_patients()

    total_patients = len(patients)
    gender_distribution = {'Homme': 0, 'Femme': 0, 'Autre': 0}
    age_groups = {'0-18': 0, '19-45': 0, '46-65': 0, '65+': 0}
    diagnosis_counts = {'Grippe': 0, 'Paludisme': 0, 'Aucune maladie détectée': 0, 'Total Diagnoses': 0}

    for patient in patients:
        gender_distribution[patient.get('gender', 'Autre')] += 1
        age = patient.get('age')
        if age is not None:
            if age <= 18:
                age_groups['0-18'] += 1
            elif 19 <= age <= 45:
                age_groups['19-45'] += 1
            elif 46 <= age <= 65:
                age_groups['46-65'] += 1
            else:
                age_groups['65+'] += 1
        
        for diagnosis_record in patient.get('diagnoses', []):
            diagnosis_counts['Total Diagnoses'] += 1
            diag_name = diagnosis_record.get('diagnosis')
            if diag_name in diagnosis_counts:
                diagnosis_counts[diag_name] += 1
            elif diag_name: # Pour les diagnostics non prévus
                diagnosis_counts[diag_name] = diagnosis_counts.get(diag_name, 0) + 1

    return jsonify({
        'totalPatients': total_patients,
        'genderDistribution': gender_distribution,
        'ageGroups': age_groups,
        'diagnosisCounts': diagnosis_counts
    })


if __name__ == '__main__':
    # Assurez-vous que les dossiers statiques existent
    os.makedirs('static/js', exist_ok=True)
    os.makedirs('static/css', exist_ok=True)
    os.makedirs('static/images', exist_ok=True)
    os.makedirs('templates', exist_ok=True)
    app.run(debug=True)
