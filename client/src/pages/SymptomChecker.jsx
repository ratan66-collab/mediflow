import { useState } from 'react';
import { ChevronRight, ChevronLeft, AlertCircle, Activity, Brain, Heart, Wind, Utensils, Bone, Eye, Hand } from 'lucide-react';

export default function SymptomChecker() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedBodyPart, setSelectedBodyPart] = useState('');
  const [symptoms, setSymptoms] = useState([]);
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState('');
  const [additionalSymptoms, setAdditionalSymptoms] = useState([]);

  const bodyParts = [
    { id: 'head', name: 'Head', icon: Brain, color: 'hover:bg-purple-600' },
    { id: 'chest', name: 'Chest', icon: Heart, color: 'hover:bg-red-600' },
    { id: 'abdomen', name: 'Abdomen', icon: Utensils, color: 'hover:bg-yellow-600' },
    { id: 'back', name: 'Back', icon: Bone, color: 'hover:bg-blue-600' },
    { id: 'arms', name: 'Arms', icon: Activity, color: 'hover:bg-green-600' },
    { id: 'legs', name: 'Legs', icon: Bone, color: 'hover:bg-indigo-600' },
    { id: 'throat', name: 'Throat', icon: Wind, color: 'hover:bg-pink-600' },
    { id: 'skin', name: 'Skin', icon: Hand, color: 'hover:bg-orange-600' }
  ];

  const commonSymptoms = {
    head: ['Headache', 'Dizziness', 'Vision changes', 'Hearing loss', 'Nausea'],
    chest: ['Chest pain', 'Shortness of breath', 'Palpitations', 'Cough', 'Wheezing'],
    abdomen: ['Stomach pain', 'Bloating', 'Nausea', 'Vomiting', 'Diarrhea'],
    back: ['Back pain', 'Stiffness', 'Numbness', 'Tingling', 'Weakness'],
    arms: ['Arm pain', 'Weakness', 'Numbness', 'Swelling', 'Limited movement'],
    legs: ['Leg pain', 'Swelling', 'Numbness', 'Weakness', 'Cramps'],
    throat: ['Sore throat', 'Difficulty swallowing', 'Hoarseness', 'Throat clearing'],
    skin: ['Rash', 'Itching', 'Redness', 'Swelling', 'Dry skin']
  };

  const durations = ['Less than 1 day', '1-3 days', '3-7 days', '1-2 weeks', 'More than 2 weeks'];
  const severities = ['Mild', 'Moderate', 'Severe', 'Very severe'];

  const handleBodyPartSelect = (part) => {
    setSelectedBodyPart(part);
    setCurrentStep(2);
  };

  const handleSymptomSelect = (symptom) => {
    if (!symptoms.includes(symptom)) {
      setSymptoms([...symptoms, symptom]);
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setSelectedBodyPart('');
    setSymptoms([]);
    setDuration('');
    setSeverity('');
    setAdditionalSymptoms([]);
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Where are you experiencing discomfort?';
      case 2:
        return 'What symptoms are you experiencing?';
      case 3:
        return 'How long have you had these symptoms?';
      case 4:
        return 'How severe are your symptoms?';
      default:
        return '';
    }
  };

  const getResults = () => {
    return {
      possibleConditions: [
        { name: 'Common Cold', probability: 'High', description: 'Viral infection of the upper respiratory tract' },
        { name: 'Flu', probability: 'Medium', description: 'Influenza viral infection' },
        { name: 'Allergies', probability: 'Medium', description: 'Immune system reaction to allergens' }
      ],
      recommendations: [
        'Rest and stay hydrated',
        'Over-the-counter pain relievers',
        'Monitor symptoms for 48 hours',
        'Seek medical attention if symptoms worsen'
      ],
      urgency: severity === 'Severe' || severity === 'Very severe' ? 'High' : 'Low'
    };
  };

  return (
    <div className="h-full bg-[#111111] text-gray-200">
      <div className="max-w-4xl pt-2">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2 tracking-widest text-white">SYMPTOM CHECKER</h1>
          <p className="text-gray-500 text-sm">Identify possible conditions based on your symptoms</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center mb-12">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  currentStep >= step ? 'bg-[#ccff00] text-[#111]' : 'bg-[#222] text-gray-500'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-12 h-0.5 ml-4 ${
                    currentStep >= step + 1 ? 'bg-[#ccff00]' : 'bg-[#333]'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Question */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-8 text-white">{getStepTitle()}</h2>

          {/* Step 1: Body Part Selection */}
          {currentStep === 1 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {bodyParts.map((part) => {
                const Icon = part.icon;
                const isSelected = selectedBodyPart === part.id;
                return (
                  <button
                    key={part.id}
                    onClick={() => handleBodyPartSelect(part.id)}
                    className={`flex flex-col items-center justify-center py-8 rounded-2xl border transition-all ${
                         isSelected 
                           ? 'bg-[#1a1a1a] border-[#ccff00] text-white shadow-lg shadow-[#ccff00]/10' 
                           : 'bg-[#1a1a1a] border-[#222] hover:border-[#ccff00]/50 text-gray-400'
                    }`}
                  >
                    <Icon className={`w-8 h-8 mb-4 transition-colors ${isSelected ? 'text-[#ccff00]' : 'text-gray-500'}`} />
                    <p className="font-semibold text-sm tracking-wide">{part.name}</p>
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 2: Symptom Selection */}
          {currentStep === 2 && selectedBodyPart && (
            <div>
              <p className="text-gray-500 mb-6 text-sm">Select all that apply:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {commonSymptoms[selectedBodyPart]?.map((symptom) => (
                  <button
                    key={symptom}
                    onClick={() => handleSymptomSelect(symptom)}
                    className={`p-5 rounded-2xl border text-left transition-all font-semibold tracking-wide ${
                      symptoms.includes(symptom)
                        ? 'bg-[#1a1a1a] border-[#ccff00] text-[#ccff00] shadow-lg shadow-[#ccff00]/10'
                        : 'bg-[#1a1a1a] border-[#222] text-gray-400 hover:border-[#ccff00]/50 hover:text-white'
                    }`}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
              
              {symptoms.length > 0 && (
                <div className="bg-[#1a1a1a] border border-[#333] rounded-2xl p-6">
                  <p className="text-sm text-gray-500 mb-4 font-semibold uppercase tracking-wider">Selected symptoms:</p>
                  <div className="flex flex-wrap gap-3">
                    {symptoms.map((symptom) => (
                      <span key={symptom} className="bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] font-bold px-4 py-1.5 rounded-full text-xs">
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Duration */}
          {currentStep === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {durations.map((dur) => (
                <button
                  key={dur}
                  onClick={() => setDuration(dur)}
                  className={`p-6 rounded-2xl border text-left transition-all font-semibold tracking-wide ${
                    duration === dur
                      ? 'bg-[#1a1a1a] border-[#ccff00] text-[#ccff00] shadow-lg shadow-[#ccff00]/10'
                      : 'bg-[#1a1a1a] border-[#222] text-gray-400 hover:border-[#ccff00]/50 hover:text-white'
                  }`}
                >
                  {dur}
                </button>
              ))}
            </div>
          )}

          {/* Step 4: Severity */}
          {currentStep === 4 && (
            <div className="grid grid-cols-2 gap-4">
              {severities.map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverity(sev)}
                  className={`p-6 rounded-2xl border text-center transition-all font-semibold tracking-wide capitalize ${
                    severity === sev
                      ? 'bg-[#1a1a1a] border-[#ccff00] text-[#ccff00] shadow-lg shadow-[#ccff00]/10'
                      : 'bg-[#1a1a1a] border-[#222] text-gray-400 hover:border-[#ccff00]/50 hover:text-white'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          )}

          {/* Results */}
          {currentStep === 4 && duration && severity && (
            <div className="mt-12 pt-8 border-t border-[#333]">
              <h3 className="text-2xl font-bold mb-6 text-white tracking-wide">Assessment Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {getResults().possibleConditions.map((condition, index) => (
                  <div key={index} className="bg-[#1a1a1a] border border-[#222] hover:border-[#ccff00]/30 transition-colors rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-white text-lg">{condition.name}</h4>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                        condition.probability === 'High' 
                          ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                          : 'bg-[#ccff00]/10 text-[#ccff00] border-[#ccff00]/20'
                      }`}>
                        {condition.probability} Match
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 font-medium">{condition.description}</p>
                  </div>
                ))}
              </div>

              <div className="bg-[#ccff00]/10 rounded-2xl p-6 mb-8 border border-[#ccff00]/20">
                <h4 className="font-bold mb-4 text-[#ccff00] tracking-wide uppercase text-sm">Recommendations:</h4>
                <ul className="space-y-3">
                  {getResults().recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="mt-1 bg-[#ccff00]/20 rounded-full p-0.5">
                        <ChevronRight className="w-3 h-3 text-[#ccff00]" />
                      </div>
                      <span className="text-sm text-gray-200 font-medium">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {getResults().urgency === 'High' && (
                <div className="bg-red-500/10 rounded-2xl p-6 border border-red-500/20 shadow-lg shadow-red-500/5">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-red-500 mt-0.5" />
                    <div>
                      <p className="font-bold text-red-500 text-lg mb-1">Medical Attention Recommended</p>
                      <p className="text-sm text-gray-300 font-medium">Based on your symptoms and severe pain level, we strongly recommend consulting a healthcare professional as soon as possible.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-12 pt-8 border-t border-[#333] pb-12">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all font-bold text-sm tracking-wide uppercase ${
              currentStep === 1
                ? 'bg-transparent text-gray-700 cursor-not-allowed opacity-50'
                : 'bg-[#222] hover:bg-[#333] text-white border border-[#444]'
            }`}
          >
            <ChevronLeft className="w-4 h-4 ml-[-4px]" />
            Back
          </button>

          <button
            onClick={handleReset}
            className="px-6 py-3 rounded-full bg-transparent hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-all font-bold text-sm tracking-wide uppercase"
          >
            Start Over
          </button>

          <button
            onClick={handleNext}
            disabled={
              (currentStep === 1 && !selectedBodyPart) ||
              (currentStep === 2 && symptoms.length === 0) ||
              (currentStep === 3 && !duration) ||
              (currentStep === 4 && !severity)
            }
            className={`flex items-center gap-2 px-8 py-3 rounded-full transition-all font-bold text-sm tracking-widest uppercase ${
              (currentStep === 1 && !selectedBodyPart) ||
              (currentStep === 2 && symptoms.length === 0) ||
              (currentStep === 3 && !duration) ||
              (currentStep === 4 && !severity)
                ? 'bg-[#222] text-gray-600 cursor-not-allowed'
                : 'bg-[#ccff00] hover:bg-[#b3e600] text-[#111] shadow-lg shadow-[#ccff00]/20'
            }`}
          >
            {currentStep === 4 ? 'Complete' : 'Next'}
            {currentStep !== 4 && <ChevronRight className="w-4 h-4 mr-[-4px]" />}
          </button>
        </div>

      </div>
    </div>
  );
}
