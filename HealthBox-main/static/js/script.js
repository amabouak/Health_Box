// Stockage des patients (sera rempli par l'API)
let patients = [];
// currentPatient n'est plus nécessaire globalement car l'ID est passé via l'URL ou localStorage

// Pas besoin de showPage() car la navigation est gérée par les routes Flask

// Gestion des patients
async function addPatient() {
    const lastName = document.getElementById('last-name').value;
    const firstName = document.getElementById('first-name').value;
    const age = document.getElementById('age').value;
    const gender = document.querySelector('input[name="gender"]:checked')?.value;
    
    if (!lastName || !firstName || !age || !gender) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }

    const newPatient = {
        id: generatePatientId(), // Généré côté client pour l'exemple, idéalement côté serveur
        lastName: lastName,
        firstName: firstName,
        age: parseInt(age),
        gender: gender,
    };

    try {
        const response = await fetch('/api/patients', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newPatient)
        });

        if (response.ok) {
            const addedPatient = await response.json();
            alert(`Patient ${addedPatient.firstName} ${addedPatient.lastName} enregistré avec succès (ID: ${addedPatient.id})`);
            document.getElementById('patient-form').reset();
            window.location.href = '/main_menu'; // Rediriger vers le menu principal
        } else {
            const errorData = await response.json();
            alert('Erreur lors de l\'enregistrement du patient: ' + (errorData.message || response.statusText));
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur réseau est survenue.');
    }
}

function generatePatientId() {
    return 'P-' + Math.floor(1000 + Math.random() * 9000);
}

async function loadPatientList() {
    const container = document.getElementById('patients-container');
    container.innerHTML = '';
    
    try {
        const response = await fetch('/api/patients');
        if (response.ok) {
            patients = await response.json(); // Mettre à jour la liste locale
            if (patients.length === 0) {
                container.innerHTML = '<div class="col-span-3 text-center py-8 text-gray-500">Aucun patient enregistré</div>';
                return;
            }
            
            patients.forEach(patient => {
                const card = document.createElement('div');
                card.className = 'patient-card bg-white rounded-xl shadow-md overflow-hidden cursor-pointer';
                card.onclick = () => window.location.href = `/patient_details/${patient.id}`; // Lien vers les détails du patient
                
                card.innerHTML = `
                    <div class="p-6">
                        <div class="flex justify-between items-start mb-4">
                            <div>
                                <h3 class="text-lg font-semibold text-blue-800">${patient.firstName} ${patient.lastName}</h3>
                                <p class="text-sm text-gray-500">ID: ${patient.id}</p>
                            </div>
                            <span class="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">${patient.gender}</span>
                        </div>
                        <div class="flex justify-between text-sm text-gray-600">
                            <div>Âge: <span class="font-medium">${patient.age} ans</span></div>
                            <div>Inscrit le: <span class="font-medium">${patient.registrationDate}</span></div>
                        </div>
                    </div>
                `;
                
                container.appendChild(card);
            });
        } else {
            const errorData = await response.json();
            alert('Erreur lors du chargement des patients: ' + (errorData.message || response.statusText));
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur réseau est survenue lors du chargement des patients.');
    }
}

function filterPatientList() {
    const searchTerm = document.getElementById('patient-search').value.toLowerCase();
    const cards = document.querySelectorAll('.patient-card');
    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}


// Diagnostic functions
async function findPatientForDiagnosis() {
    const patientId = document.getElementById('patient-id').value.trim();
    
    if (!patientId) {
        alert('Veuillez entrer un ID patient');
        return;
    }
    
    try {
        const response = await fetch(`/api/patients/${patientId}`);
        if (response.ok) {
            const patient = await response.json();
            // Rediriger vers la page du formulaire de diagnostic avec l'ID du patient
            window.location.href = `/diagnosis_form/${patient.id}`;
        } else {
            const errorData = await response.json();
            alert(`Aucun patient trouvé avec l'ID ${patientId}: ` + (errorData.message || response.statusText));
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur réseau est survenue lors de la recherche du patient.');
    }
}

async function analyzeSymptoms(patientId) {
    const bpm = parseInt(document.getElementById('bpm').value);
    const temperature = parseFloat(document.getElementById('temperature').value);
    
    // Get checked symptoms
    const symptoms = [];
    document.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
        symptoms.push(checkbox.value);
    });
    
    if (isNaN(bpm) || isNaN(temperature)) { // Symptômes ne sont plus obligatoires
        alert('Veuillez remplir les champs BPM et Température.');
        return;
    }

    try {
        const response = await fetch('/api/diagnose', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                patientId: patientId,
                bpm: bpm,
                temperature: temperature,
                symptoms: symptoms // Peut être vide
            })
        });

        if (response.ok) {
            const result = await response.json();
            // Stocker le résultat temporairement et rediriger
            localStorage.setItem('lastDiagnosisResult', JSON.stringify(result));
            window.location.href = '/diagnosis_results';
        } else {
            const errorData = await response.json();
            alert('Erreur lors de l\'analyse des symptômes: ' + (errorData.message || response.statusText));
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur réseau est survenue lors de l\'analyse des symptômes.');
    }
}

let currentChart = null; // Pour stocker l'instance du graphique et la détruire avant d'en créer une nouvelle

function displayDiagnosisResults(patient, diagnosisInfo, bpm, temperature, symptoms) {
    // Update patient info
    document.getElementById('patient-info-result').innerHTML = `
        <p>Patient: <span class="font-medium">${patient.firstName} ${patient.lastName}</span></p>
        <p>Âge: <span class="font-medium">${patient.age} ans</span>, Sexe: <span class="font-medium">${patient.gender}</span></p>
    `;
    
    // Update diagnosis status
    const statusElement = document.getElementById('diagnosis-status');
    if (diagnosisInfo.isIll) {
        statusElement.innerHTML = `
            <div class="flex items-center">
                <div class="flex-shrink-0 ${diagnosisInfo.severity.includes('Sévère') ? 'text-red-500' : diagnosisInfo.severity.includes('Modéré') ? 'text-orange-500' : 'text-yellow-500'}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <div class="ml-4">
                    <h3 class="text-lg font-medium ${diagnosisInfo.severity.includes('Sévère') ? 'text-red-700' : diagnosisInfo.severity.includes('Modéré') ? 'text-orange-700' : 'text-yellow-700'}">
                        ${diagnosisInfo.diagnosis} (${diagnosisInfo.severity})
                    </h3>
                    <p class="text-sm ${diagnosisInfo.severity.includes('Sévère') 
                            ? 'Condition sérieuse nécessitant une attention médicale immédiate' 
                            : diagnosisInfo.severity.includes('Modéré') 
                                ? 'Condition nécessitant un traitement et une surveillance' 
                                : 'Condition légère qui peut être gérée à domicile'}
                    </p>
                </div>
            </div>
        `;
    } else {
        statusElement.innerHTML = `
            <div class="flex items-center">
                <div class="flex-shrink-0 text-green-500">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div class="ml-4">
                    <h3 class="text-lg font-medium text-green-700">${diagnosisInfo.diagnosis}</h3>
                    <p class="text-sm text-green-600">Aucun signe de grippe ou de paludisme détecté</p>
                </div>
            </div>
        `;
    }
    
    // Update vital stats
    document.getElementById('vital-stats').innerHTML = `
        <div class="flex justify-between">
            <span class="text-gray-600">BPM:</span>
            <span class="font-medium ${bpm < 60 || bpm > 100 ? 'text-red-600' : 'text-green-600'}">${bpm} ${bpm < 60 || bpm > 100 ? '(Anormal)' : '(Normal)'}</span>
        </div>
        <div class="flex justify-between">
            <span class="text-gray-600">Température:</span>
            <span class="font-medium ${temperature < 36.5 || temperature > 37.5 ? 'text-red-600' : 'text-green-600'}">${temperature}°C ${temperature < 36.5 || temperature > 37.5 ? '(Anormal)' : '(Normal)'}</span>
        </div>
        <div class="flex justify-between">
            <span class="text-gray-600">Âge:</span>
            <span class="font-medium">${patient.age} ans</span>
        </div>
        <div class="flex justify-between">
            <span class="text-gray-600">Sexe:</span>
            <span class="font-medium">${patient.gender}</span>
        </div>
    `;
    
    // Update symptoms
    const symptomsElement = document.getElementById('reported-symptoms');
    symptomsElement.innerHTML = '';
    if (symptoms.length > 0) {
        symptoms.forEach(symptom => {
            const badge = document.createElement('span');
            badge.className = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800';
            badge.textContent = symptom;
            symptomsElement.appendChild(badge);
        });
    } else {
        symptomsElement.innerHTML = '<span class="text-gray-500 italic">Aucun symptôme rapporté.</span>';
    }
    
    // Generate progression chart
    generateProgressionChart(diagnosisInfo, patient);
    
    // Generate recommendations
    generateRecommendations(diagnosisInfo, patient);
}

function generateProgressionChart(diagnosisInfo, patient) {
    const ctx = document.getElementById('progression-chart').getContext('2d');
    
    // Détruire l'ancien graphique s'il existe
    if (currentChart) {
        currentChart.destroy();
    }

    // Data based on diagnosis
    let labels, data, colors;
    if (diagnosisInfo.diagnosis === 'Paludisme') {
        labels = ['Jour 1', 'Jour 2', 'Jour 3', 'Jour 4', 'Jour 5', 'Jour 6', 'Jour 7'];
        
        if (diagnosisInfo.severity === 'Sévère') {
            data = [38.5, 39.5, 39.8, 40, 39.2, 38.5, 37.8];
            colors = ['#EF4444'];
        } else if (diagnosisInfo.severity === 'Modéré') {
            data = [38, 38.8, 39, 38.6, 38, 37.5, 37];
            colors = ['#F59E0B'];
        } else {
            data = [37.5, 37.8, 37.9, 37.7, 37.5, 37.3, 37];
            colors = ['#10B981'];
        }
    } else if (diagnosisInfo.diagnosis === 'Grippe') {
        labels = ['Jour 1', 'Jour 2', 'Jour 3', 'Jour 4', 'Jour 5', 'Jour 6', 'Jour 7'];
        
        if (diagnosisInfo.severity === 'Modéré à sévère') {
            data = [38.5, 39, 38.8, 38.3, 37.9, 37.5, 37];
            colors = ['#F59E0B'];
        } else {
            data = [37.5, 38, 37.8, 37.6, 37.3, 37.1, 37];
            colors = ['#3B82F6'];
        }
    } else {
        labels = ['Jour 1', 'Jour 2', 'Jour 3', 'Jour 4', 'Jour 5', 'Jour 6', 'Jour 7'];
        data = [37, 37, 37, 37, 37, 37, 37];
        colors = ['#10B981'];
    }
    
    // Create chart
    currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Température °C',
                data: data,
                borderColor: colors[0],
                backgroundColor: colors[0] + '20',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Température: ${context.raw}°C`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 35,
                    max: 41,
                    ticks: {
                        callback: function(value) {
                            return value + '°C';
                        }
                    }
                }
            }
        }
    });
}

function generateRecommendations(diagnosisInfo, patient) {
    const adviceList = document.getElementById('advice-list');
    const treatmentList = document.getElementById('treatment-list');
    
    // Clear previous content
    adviceList.innerHTML = '';
    treatmentList.innerHTML = '';
    
    // Common advice
    const commonAdvice = [
        'Boire beaucoup de liquides (eau, tisanes, bouillons)',
        'Se reposer suffisamment',
        'Surveiller la température toutes les 4-6 heures'
    ];
    
    // Common treatment
    const commonTreatment = [
        'Paracétamol pour la fièvre (500-1000mg toutes les 6h)'
    ];
    
    // Condition-specific recommendations
    if (diagnosisInfo.diagnosis === 'Paludisme') {
        commonAdvice.push(
            'Éviter les piqures de moustiques (moustiquaire, répulsifs)',
            'Surveiller les signes de déshydratation'
        );
        
        if (diagnosisInfo.severity === 'Sévère') {
            commonAdvice.push(
                'Hospitalisation recommandée',
                'Surveillance médicale constante nécessaire'
            );
            
            commonTreatment.push(
                'Artéméther-luméfantrine (Coartem) ou Quinine + Doxycycline',
                'Traitement intraveineux si nécessaire'
            );
        } else {
            commonTreatment.push(
                'Artéméther-luméfantrine (Coartem) pendant 3 jours',
                'Doxycycline pendant 7 jours (contre les rechutes)'
            );
        }
    } else if (diagnosisInfo.diagnosis === 'Grippe') {
        commonAdvice.push(
            'Éviter les contacts avec les personnes vulnérables',
            'Se couvrir la bouche quand on tousse'
        );
        
        if (diagnosisInfo.severity === 'Modéré à sévère' || patient.age > 65) {
            commonAdvice.push(
                'Consulter un médecin si pas d\'amélioration sous 48h'
            );
            
            commonTreatment.push(
                'Oseltamivir (Tamiflu) si pris dans les 48h après apparition des symptômes'
            );
        }
    }
    
    if (!diagnosisInfo.isIll) {
        adviceList.innerHTML = `
            <li class="flex items-start">
                <svg class="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Aucun symptôme grave détecté. Poursuivez les mesures d'hygiène de base.</span>
            </li>
        `;
        
        treatmentList.innerHTML = `
            <li class="flex items-start">
                <svg class="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Aucun traitement spécifique recommandé pour le moment.</span>
            </li>
        `;
    } else {
        commonAdvice.forEach(advice => {
            const li = document.createElement('li');
            li.className = 'flex items-start';
            li.innerHTML = `
                <svg class="h-5 w-5 ${diagnosisInfo.severity.includes('Sévère') ? 'text-red-500' : diagnosisInfo.severity.includes('Modéré') ? 'text-orange-500' : 'text-yellow-500'} mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>${advice}</span>
            `;
            adviceList.appendChild(li);
        });
        
        commonTreatment.forEach(treatment => {
            const li = document.createElement('li');
            li.className = 'flex items-start';
            li.innerHTML = `
                <svg class="h-5 w-5 ${diagnosisInfo.severity.includes('Sévère') ? 'text-red-500' : diagnosisInfo.severity.includes('Modéré') ? 'text-orange-500' : 'text-yellow-500'} mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>${treatment}</span>
            `;
            treatmentList.appendChild(li);
        });
    }
}

// Dashboard functions
let genderChartInstance = null;
let ageChartInstance = null;
let diagnosisChartInstance = null;

async function loadDashboardData() {
    console.log("loadDashboardData called");
    try {
        const response = await fetch('/api/dashboard_data');
        if (response.ok) {
            const data = await response.json();
            console.log("Dashboard data received:", data);
            
            document.getElementById('total-patients').textContent = data.totalPatients;
            document.getElementById('total-diagnoses').textContent = data.diagnosisCounts.TotalDiagnoses;
            
            // Calculer le nombre de maladies détectées (non saines)
            let detectedDiseasesCount = 0;
            for (const diag in data.diagnosisCounts) {
                if (diag !== 'Aucune maladie détectée' && diag !== 'Total Diagnoses') {
                    detectedDiseasesCount += data.diagnosisCounts[diag];
                }
            }
            document.getElementById('detected-diseases').textContent = detectedDiseasesCount;

            // Charts
            drawGenderChart(data.genderDistribution);
            drawAgeChart(data.ageGroups);
            drawDiagnosisChart(data.diagnosisCounts);

        } else {
            const errorData = await response.json();
            alert('Erreur lors du chargement du tableau de bord: ' + (errorData.message || response.statusText));
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur réseau est survenue lors du chargement du tableau de bord.');
    }
}

function drawGenderChart(genderData) {
    const ctx = document.getElementById('gender-chart').getContext('2d');
    if (genderChartInstance) genderChartInstance.destroy();
    genderChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(genderData),
            datasets: [{
                data: Object.values(genderData),
                backgroundColor: ['#3B82F6', '#EC4899', '#6B7280'], // Blue, Pink, Gray
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: false,
                }
            }
        }
    });
}

function drawAgeChart(ageData) {
    const ctx = document.getElementById('age-chart').getContext('2d');
    if (ageChartInstance) ageChartInstance.destroy();
    ageChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(ageData),
            datasets: [{
                label: 'Nombre de patients',
                data: Object.values(ageData),
                backgroundColor: '#10B981', // Green
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                },
                title: {
                    display: false,
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function drawDiagnosisChart(diagnosisData) {
    const ctx = document.getElementById('diagnosis-chart').getContext('2d');
    if (diagnosisChartInstance) diagnosisChartInstance.destroy();

    const labels = [];
    const data = [];
    const backgroundColors = [];

    // Exclure 'Total Diagnoses' pour le graphique
    for (const diag in diagnosisData) {
        if (diag !== 'Total Diagnoses') {
            labels.push(diag);
            data.push(diagnosisData[diag]);
            // Couleurs basées sur le diagnostic
            if (diag === 'Grippe') backgroundColors.push('#F59E0B'); // Orange
            else if (diag === 'Paludisme') backgroundColors.push('#EF4444'); // Red
            else if (diag === 'Aucune maladie détectée') backgroundColors.push('#22C55E'); // Green
            else backgroundColors.push('#6B7280'); // Gray for others
        }
    }

    diagnosisChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: false,
                }
            }
        }
    });
}
