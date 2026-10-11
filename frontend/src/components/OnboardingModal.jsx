import React, { useState, useEffect } from 'react'
import { X, Lock, ArrowRight, ArrowLeft, Check, Sparkles, Compass, RefreshCw } from 'lucide-react'
import { api } from '../services/api'
import { useToast } from './Toast'
import { StyleDimensionChart } from './StyleQuizModal'
import SkinDepthSelector from './SkinDepthSelector'
import SkinUndertoneSelector from './SkinUndertoneSelector'
import FaceShapeSelector from './FaceShapeSelector'
import BodyShapeSelector from './BodyShapeSelector'

const STYLE_OPTIONS = [
  { id: 'minimal', label: 'Minimalist' },
  { id: 'classic', label: 'Classic / Tailored' },
  { id: 'smart_casual', label: 'Smart Casual' },
  { id: 'casual', label: 'Casual Ease' },
  { id: 'streetwear', label: 'Streetwear' },
  { id: 'formal', label: 'Formal / Black Tie' },
  { id: 'preppy', label: 'Preppy / Ivy' },
]

const COLOR_OPTIONS = [
  'navy',
  'white',
  'black',
  'charcoal',
  'beige',
  'camel',
  'cream',
  'olive',
  'burgundy',
  'grey',
  'terracotta',
  'denim',
  'forest-green',
  'tan',
]

const DEFAULT_QUIZ_SCENARIOS = [
  {
    id: 'q1',
    scenario: 'A College Day',
    question: 'For a full day of classes, walking between campus blocks, and sitting with friends at the canteen, what outfit feels most natural?',
    options: [
      { id: 'q1_a', label: 'Crisp Tailored Classics', text: 'Crisp collared cotton shirt, straight-fit dark jeans, and clean canvas sneakers.' },
      { id: 'q1_b', label: 'Casual Comfort', text: 'Soft relaxed t-shirt, comfortable cargo pants or chinos, and easy slip-on sandals or chappals.' },
      { id: 'q1_c', label: 'Vibrant Fusion Touch', text: 'Vibrant printed short kurti or bright polo tee, relaxed denim, and colorful sneakers.' },
      { id: 'q1_d', label: 'Contemporary Oversized Cut', text: 'Oversized graphic tee, wide-leg utility trousers, and chunky sneakers.' },
      { id: 'q1_e', label: 'None of these feel like me', text: 'None of these feel like me' },
    ],
  },
  {
    id: 'q2',
    scenario: 'Bus or Metro Ride',
    question: 'Heading out for your morning commute on a crowded bus or metro in warm weather, how do you dress for the trip?',
    options: [
      { id: 'q2_a', label: 'Pressed Neatness', text: 'Breathable cotton linen shirt tucked into tailored trousers with closed leather shoes.' },
      { id: 'q2_b', label: 'Breeze & Ease', text: 'Lightweight cotton tee or tunic with breathable drawstring pants and flat sandals.' },
      { id: 'q2_c', label: 'Pattern Pop', text: 'Contrast patterned shirt or kurti with dark jeans and statement footwear.' },
      { id: 'q2_d', label: 'Layered Streetwear', text: 'Boxy casual shirt layered open over a plain vest, cropped pants, and casual sneakers.' },
      { id: 'q2_e', label: 'None of these feel like me', text: 'None of these feel like me' },
    ],
  },
  {
    id: 'q3',
    scenario: 'First Day at a Job',
    question: 'It is your first day at a new office or workplace. How do you dress to make a confident, authentic impression?',
    options: [
      { id: 'q3_a', label: 'Formal Business Tailoring', text: 'Neatly pressed solid button-down shirt, tailored trousers, and polished derby dress shoes.' },
      { id: 'q3_b', label: 'Smart Casual Balance', text: 'Smart polo shirt or neat mandarin collar shirt, dark chinos, and clean low-top sneakers.' },
      { id: 'q3_c', label: 'Handloom Texture', text: 'Earthy handloom cotton kurta or structured blazer over a solid top with slim trousers.' },
      { id: 'q3_d', label: 'Soft Unstructured Layering', text: 'Relaxed soft blazer layered over a fine crewneck knit, tapered pants, and sleek loafers.' },
      { id: 'q3_e', label: 'None of these feel like me', text: 'None of these feel like me' },
    ],
  },
  {
    id: 'q4',
    scenario: 'Weekend Outing',
    question: 'Joining friends for tea, market browsing, or street food on a Sunday afternoon, what do you reach for?',
    options: [
      { id: 'q4_a', label: 'Classic Polo & Chinos', text: 'Classic polo shirt, regular-fit cotton shorts or trousers, and boat shoes or loafers.' },
      { id: 'q4_b', label: 'Everyday Denim & Tee', text: 'Relaxed cotton t-shirt, washed denim jeans, and comfortable walking shoes.' },
      { id: 'q4_c', label: 'Ethnic Craft Accent', text: 'Embroidered casual tunic or short kurta with cropped pants and leather kolhapuris.' },
      { id: 'q4_d', label: 'Wide-Leg Chill', text: 'Relaxed oversized overshirt, wide-leg trousers, and casual canvas shoes.' },
      { id: 'q4_e', label: 'None of these feel like me', text: 'None of these feel like me' },
    ],
  },
  {
    id: 'q5',
    scenario: "Friend's Birthday",
    question: "Going to a friend's birthday dinner at a cozy neighborhood cafe or restaurant, what is your look?",
    options: [
      { id: 'q5_a', label: 'Smart Dark Tones', text: 'Dark navy shirt, well-fitted chinos, and smart leather loafers.' },
      { id: 'q5_b', label: 'Casual Knit Ease', text: 'Soft knit sweater or clean crewneck t-shirt with straight-leg denim and suede shoes.' },
      { id: 'q5_c', label: 'Statement Print', text: 'Bold printed casual shirt or festive tunic with dark pants and statement watch.' },
      { id: 'q5_d', label: 'Monochrome Layered', text: 'Layered jacket over a minimalist black tee, wide dark trousers, and clean white sneakers.' },
      { id: 'q5_e', label: 'None of these feel like me', text: 'None of these feel like me' },
    ],
  },
  {
    id: 'q6',
    scenario: 'Family Function',
    question: 'For a family dinner gathering or home puja, how do you balance tradition and personal ease?',
    options: [
      { id: 'q6_a', label: 'Classic Traditional Kurta', text: 'Classic solid cotton kurta-pyjama or simple silk saree with subtle gold border.' },
      { id: 'q6_b', label: 'Soft Daily Kurta', text: 'Comfortable short kurta with straight cotton pants or flat sandals.' },
      { id: 'q6_c', label: 'Rich Festive Palette', text: 'Rich jewel-toned floral or patterned kurta with contrasting dupatta or stole.' },
      { id: 'q6_d', label: 'Layered Nehru Set', text: 'Modern layered Nehru jacket over a crisp white linen kurta set.' },
      { id: 'q6_e', label: 'None of these feel like me', text: 'None of these feel like me' },
    ],
  },
  {
    id: 'q7',
    scenario: 'Festival Celebration',
    question: 'During a major festival like Diwali or Eid, what outfit brings out your festive spirit?',
    options: [
      { id: 'q7_a', label: 'Timeless Ivory / Navy Silk', text: 'Traditional silk or fine cotton kurta set in timeless ivory or navy.' },
      { id: 'q7_b', label: 'Breathable Chikankari', text: 'Soft breathable chikankari or handloom cotton kurta with relaxed pyjama.' },
      { id: 'q7_c', label: 'Vivid Embroidered Outfit', text: 'Bright mustard or maroon embroidered festive outfit with rich texture and contrast.' },
      { id: 'q7_d', label: 'Contemporary Asymmetric Drape', text: 'Contemporary draped jacket set with asymmetry or modern collar detail.' },
      { id: 'q7_e', label: 'None of these feel like me', text: 'None of these feel like me' },
    ],
  },
  {
    id: 'q8',
    scenario: "Relative's Wedding",
    question: "Attending a relative's evening wedding reception, how do you dress for the special celebration?",
    options: [
      { id: 'q8_a', label: 'Structured Bandhgala / Suit', text: 'Tailored suit or crisp bandhgala jacket with structured trousers and oxfords.' },
      { id: 'q8_b', label: 'Soft Unlined Jacket', text: 'Elegant unlined blazer over a mandarin collar shirt and dark trousers.' },
      { id: 'q8_c', label: 'Ornate Statement Sherwani / Saree', text: 'Ornate silk saree or embroidered sherwani jacket with rich color accents.' },
      { id: 'q8_d', label: 'Directional Modern Tailoring', text: 'Modern minimalist blazer with fluid wide-leg pants and sleek footwear.' },
      { id: 'q8_e', label: 'None of these feel like me', text: 'None of these feel like me' },
    ],
  },
]

export default function OnboardingModal({ isOpen, onClose, onComplete }) {
  const { addToast } = useToast()
  const [step, setStep] = useState(1) // 1: Profile & Colors & Fit, 2: Style Quiz, 3: Complexion, 4: Measurements
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Step 1: Identity, Style & Colors
  const [name, setName] = useState('')
  const [preferredStyles, setPreferredStyles] = useState(['minimal', 'casual'])
  const [favoriteColors, setFavoriteColors] = useState(['navy', 'white', 'charcoal'])
  const [avoidedColors, setAvoidedColors] = useState([])
  const [fitPreference, setFitPreference] = useState('regular')
  const [formalityPreference, setFormalityPreference] = useState(3)

  // Step 2: Style Archetype Quiz
  const [quizQuestions, setQuizQuestions] = useState(DEFAULT_QUIZ_SCENARIOS)
  const [quizIndex, setQuizIndex] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizResult, setQuizResult] = useState(null)
  const [isScoringQuiz, setIsScoringQuiz] = useState(false)

  // Step 3 (Skippable): Complexion & Face
  const [skinUndertone, setSkinUndertone] = useState('neutral')
  const [skinDepth, setSkinDepth] = useState('medium')
  const [faceShape, setFaceShape] = useState('oval')
  const [skipComplexion, setSkipComplexion] = useState(false)

  // Step 4 (Skippable): Body Silhouette & Dimensions
  const [bodyShape, setBodyShape] = useState('rectangle')
  const [unit, setUnit] = useState('cm')
  const [measurements, setMeasurements] = useState({
    height: '172',
    shoulder: '44',
    chest: '96',
    waist: '78',
    hips: '98',
  })
  const [skipMeasurements, setSkipMeasurements] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadQuizQuestions()
    }
  }, [isOpen])

  const loadQuizQuestions = async () => {
    try {
      const data = await api.getQuizQuestions()
      if (data?.questions && data.questions.length > 0) {
        setQuizQuestions(data.questions)
      }
    } catch {
      // default questions in state
    }
  }

  if (!isOpen) return null

  const toggleArrayItem = (list, setList, item) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item))
    } else {
      setList([...list, item])
    }
  }

  const handleQuizAnswerSelect = (optionId) => {
    const currentQ = quizQuestions[quizIndex]
    setQuizAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionId,
    }))
  }

  const handleQuizNext = async () => {
    const currentQ = quizQuestions[quizIndex]
    if (!quizAnswers[currentQ.id]) {
      addToast('Please select a response to continue.', 'error')
      return
    }

    if (quizIndex < quizQuestions.length - 1) {
      setQuizIndex((prev) => prev + 1)
    } else {
      // Score quiz
      setIsScoringQuiz(true)
      try {
        const result = await api.submitQuizAnswers(quizAnswers)
        setQuizResult(result)
        addToast('Style archetype successfully calibrated.', 'success')
      } catch (err) {
        addToast(err.message || 'Could not record quiz answers.', 'error')
      } finally {
        setIsScoringQuiz(false)
      }
    }
  }

  const handleFinish = async (measurementsSkipped = false) => {
    setIsSubmitting(true)
    try {
      // 1. Save style profile (do not send extra fields like name)
      const profilePayload = {
        preferred_styles: preferredStyles,
        favorite_colors: favoriteColors,
        avoided_colors: avoidedColors,
        fit_preference: fitPreference,
        formality_preference: Number(formalityPreference),
      }

      if (name.trim()) {
        try {
          localStorage.setItem('veyra_user_name', name.trim())
        } catch {
          // ignore
        }
      }

      if (!skipComplexion) {
        profilePayload.skin_undertone = skinUndertone
        profilePayload.skin_depth = skinDepth
        profilePayload.face_shape = faceShape
      }

      if (bodyShape) {
        profilePayload.body_shape_override = bodyShape
      }

      await api.updateProfile(profilePayload)

      // 2. Save measurements if provided and not skipped
      if (!measurementsSkipped && !skipMeasurements) {
        const isInch = unit === 'in'
        const toCm = (val) => (isInch ? parseFloat(val) * 2.54 : parseFloat(val))
        try {
          await api.saveMeasurements({
            height: parseFloat(measurements.height),
            shoulder: parseFloat(measurements.shoulder),
            chest_bust: parseFloat(measurements.chest),
            waist: parseFloat(measurements.waist),
            hips: parseFloat(measurements.hips),
            unit: unit,
          })
        } catch (mErr) {
          console.warn('Measurement save optional warning:', mErr)
        }
      }

      try {
        localStorage.setItem('veyra_onboarding_completed', 'true')
      } catch {
        // ignore
      }

      addToast('Welcome to Veyra Atelier. Your style blueprint is now calibrated.', 'success')
      if (onComplete) onComplete()
      onClose()
    } catch (err) {
      addToast(err.message || 'Failed to complete onboarding.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentScenario = quizQuestions[quizIndex] || quizQuestions[0]
  const quizProgressPct = Math.round(((quizIndex + 1) / quizQuestions.length) * 100)

  return (
    <div className="modal-backdrop animate-fade-in-up" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <div className="modal-container editorial-modal" style={{ maxWidth: '820px' }}>
        {/* Onboarding Header */}
        <div className="modal-header">
          <div>
            <span className="eyebrow">WELCOME TO VEYRA &bull; STEP {step} OF 4</span>
            <h2 id="onboarding-title" className="modal-title">
              {step === 1 && 'Establish Your Style Foundations'}
              {step === 2 && 'Calibrate Your Style Archetype'}
              {step === 3 && 'Complexion & Facial Harmony'}
              {step === 4 && 'Proportions & Silhouette Balance'}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="modal-close-btn" aria-label="Close onboarding">
            <X size={20} />
          </button>
        </div>

        {/* Step 1: Name, Styles, Colors, Fit, Formality */}
        {step === 1 && (
          <div className="onboarding-step-content animate-fade-in-up">
            <p className="onboarding-step-intro">
              Configure your atelier alias, aesthetic leanings, core palette affinities, and base tailoring balance.
            </p>

            <div className="form-field" style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="onboarding-name" className="input-label">Your Name / Atelier Alias</label>
              <input
                id="onboarding-name"
                type="text"
                className="editorial-input"
                placeholder="e.g. Alexandra / Julian"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-field" style={{ marginBottom: '1.25rem' }}>
              <span className="input-label">Aesthetic Vocabularies</span>
              <div className="chip-group" style={{ marginTop: '0.4rem' }}>
                {STYLE_OPTIONS.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    className={`chip-editorial ${preferredStyles.includes(style.id) ? 'active' : ''}`}
                    onClick={() => toggleArrayItem(preferredStyles, setPreferredStyles, style.id)}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors: Favorite & Avoided */}
            <div className="form-field" style={{ marginBottom: '1.25rem' }}>
              <span className="input-label">Favorite Core Colors</span>
              <div className="chip-group" style={{ marginTop: '0.4rem' }}>
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`chip-editorial ${favoriteColors.includes(c) ? 'active' : ''}`}
                    onClick={() => toggleArrayItem(favoriteColors, setFavoriteColors, c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-field" style={{ marginBottom: '1.25rem' }}>
              <span className="input-label" style={{ color: 'var(--accent-terracotta)' }}>
                Avoided / Deprioritized Colors
              </span>
              <div className="chip-group" style={{ marginTop: '0.4rem' }}>
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`chip-editorial ${avoidedColors.includes(c) ? 'active' : ''}`}
                    onClick={() => toggleArrayItem(avoidedColors, setAvoidedColors, c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Fit & Formality */}
            <div className="form-row-2" style={{ marginBottom: '1.5rem' }}>
              <div className="form-field">
                <label htmlFor="onboarding-fit" className="input-label">Preferred Fit</label>
                <select
                  id="onboarding-fit"
                  className="editorial-select"
                  value={fitPreference}
                  onChange={(e) => setFitPreference(e.target.value)}
                >
                  <option value="slim">Slim / Structured</option>
                  <option value="regular">Regular / Balanced</option>
                  <option value="relaxed">Relaxed / Fluid</option>
                  <option value="oversized">Oversized / Avant-Garde</option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="onboarding-formality" className="input-label">Base Formality (1–5)</label>
                <select
                  id="onboarding-formality"
                  className="editorial-select"
                  value={formalityPreference}
                  onChange={(e) => setFormalityPreference(parseInt(e.target.value, 10))}
                >
                  <option value={1}>1 — Ultra Casual</option>
                  <option value={2}>2 — Casual Weekend</option>
                  <option value={3}>3 — Smart Casual / Studio</option>
                  <option value={4}>4 — Sartorial / Evening</option>
                  <option value={5}>5 — Black Tie</option>
                </select>
              </div>
            </div>

            <div className="modal-actions-footer">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-editorial-primary"
              >
                <span>Continue to Style Quiz</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Style Archetype Quiz */}
        {step === 2 && (
          <div className="onboarding-step-content animate-fade-in-up">
            {quizResult ? (
              <div className="quiz-result-view animate-fade-in-up">
                <div className="archetype-hero-card">
                  <div className="archetype-badge-pill">
                    <Compass size={14} />
                    <span>Calibrated Archetype</span>
                  </div>
                  <h3 className="archetype-name">{quizResult.archetype}</h3>
                  <p className="archetype-description">{quizResult.archetype_description}</p>
                </div>

                <div className="dimension-section" style={{ marginTop: '1.5rem' }}>
                  <span className="eyebrow">FIVE-DIMENSION STYLE VECTOR</span>
                  <StyleDimensionChart vector={quizResult.vector} />
                </div>

                <div className="modal-actions-footer" style={{ justifyContent: 'space-between', marginTop: '2rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setQuizResult(null)
                      setQuizAnswers({})
                      setQuizIndex(0)
                    }}
                    className="btn-editorial-ghost"
                  >
                    <RefreshCw size={14} />
                    <span>Retake Quiz</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="btn-editorial-primary"
                  >
                    <span>Next: Complexion & Features</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="quiz-in-progress animate-fade-in-up">
                <div className="quiz-scenario-header">
                  <span className="eyebrow" style={{ color: 'var(--accent-olive)' }}>
                    SCENARIO {String(quizIndex + 1).padStart(2, '0')} OF {String(quizQuestions.length).padStart(2, '0')}: {currentScenario.scenario}
                  </span>
                  <div className="quiz-progress-track" style={{ marginTop: '6px', marginBottom: '1rem' }}>
                    <div className="quiz-progress-bar" style={{ width: `${quizProgressPct}%` }} />
                  </div>
                  <p className="quiz-question-prompt" style={{ fontSize: '1rem', fontWeight: 500 }}>
                    {currentScenario.question}
                  </p>
                </div>

                <div className="quiz-options-list">
                  {currentScenario.options.map((opt) => {
                    const isSelected = quizAnswers[currentScenario.id] === opt.id
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        className={`quiz-option-card ${isSelected ? 'is-selected' : ''}`}
                        onClick={() => handleQuizAnswerSelect(opt.id)}
                      >
                        <div className="option-radio-dot">
                          {isSelected && <div className="dot-inner" />}
                        </div>
                        <div className="option-text-block">
                          <strong className="option-label">{opt.label}</strong>
                          <span className="option-desc">{opt.text}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>

                <div className="modal-actions-footer" style={{ justifyContent: 'space-between', marginTop: '1.75rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (quizIndex > 0) setQuizIndex((prev) => prev - 1)
                      else setStep(1)
                    }}
                    className="btn-editorial-ghost"
                  >
                    <ArrowLeft size={15} />
                    <span>Back</span>
                  </button>

                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="btn-editorial-secondary"
                    >
                      Skip Quiz
                    </button>

                    <button
                      type="button"
                      onClick={handleQuizNext}
                      disabled={!quizAnswers[currentScenario.id] || isScoringQuiz}
                      className="btn-editorial-primary"
                    >
                      <span>
                        {quizIndex === quizQuestions.length - 1
                          ? isScoringQuiz
                            ? 'Scoring Archetype...'
                            : 'Discover Archetype'
                          : 'Next Scenario'}
                      </span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3 (Skippable): Skin Undertone, Depth, Face Shape */}
        {step === 3 && (
          <div className="onboarding-step-content animate-fade-in-up">
            <div className="step-optional-banner" style={{ marginBottom: '1.25rem' }}>
              <span className="eyebrow" style={{ color: 'var(--accent-olive)' }}>OPTIONAL ENHANCEMENT</span>
              <p style={{ fontSize: '0.86rem', marginTop: '4px' }}>
                Informs neckline framing and metal temperature harmony. You can skip this step at any time.
              </p>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label className="input-label" style={{ marginBottom: '0.4rem', display: 'block' }}>Skin Depth</label>
              <SkinDepthSelector
                value={skinDepth}
                onChange={(val) => setSkinDepth(val)}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label className="input-label" style={{ marginBottom: '0.4rem', display: 'block' }}>Skin Undertone</label>
              <SkinUndertoneSelector
                value={skinUndertone}
                onChange={(val) => setSkinUndertone(val)}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="input-label" style={{ marginBottom: '0.4rem', display: 'block' }}>Face Shape</label>
              <FaceShapeSelector
                value={faceShape}
                onChange={(val) => setFaceShape(val)}
              />
            </div>

            <div className="modal-actions-footer" style={{ justifyContent: 'space-between' }}>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-editorial-ghost"
              >
                <ArrowLeft size={15} />
                <span>Back</span>
              </button>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setSkipComplexion(true)
                    setStep(4)
                  }}
                  className="btn-editorial-secondary"
                >
                  Skip Step
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSkipComplexion(false)
                    setStep(4)
                  }}
                  className="btn-editorial-primary"
                >
                  <span>Next: Proportions</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4 (Skippable): Body Silhouette & Dimensions with Strict Privacy Wording */}
        {step === 4 && (
          <div className="onboarding-step-content animate-fade-in-up">
            {/* Privacy Assurance Callout */}
            <div className="privacy-pill-banner" style={{ marginBottom: '1.25rem' }}>
              <Lock size={15} className="privacy-icon" />
              <span>
                <strong>Zero photo uploads.</strong> Data is stored locally in your private studio database and evaluated purely via deterministic ratios or fit choices. You can skip this or delete it at any time.
              </span>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <BodyShapeSelector
                value={bodyShape}
                onChange={(val) => setBodyShape(val)}
              />
            </div>

            <div className="unit-toggle-row">
              <span className="unit-label">Tape Measurements (Optional)</span>
              <div className="unit-switcher">
                <button
                  type="button"
                  className={`unit-btn ${unit === 'cm' ? 'active' : ''}`}
                  onClick={() => setUnit('cm')}
                >
                  Centimeters (cm)
                </button>
                <button
                  type="button"
                  className={`unit-btn ${unit === 'in' ? 'active' : ''}`}
                  onClick={() => setUnit('in')}
                >
                  Inches (in)
                </button>
              </div>
            </div>

            <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
              <div className="form-field">
                <label htmlFor="ob-height" className="input-label">Height ({unit})</label>
                <input
                  id="ob-height"
                  type="number"
                  step="0.5"
                  className="editorial-input"
                  value={measurements.height}
                  onChange={(e) => setMeasurements({ ...measurements, height: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label htmlFor="ob-shoulder" className="input-label">Shoulder Breadth ({unit})</label>
                <input
                  id="ob-shoulder"
                  type="number"
                  step="0.5"
                  className="editorial-input"
                  value={measurements.shoulder}
                  onChange={(e) => setMeasurements({ ...measurements, shoulder: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label htmlFor="ob-chest" className="input-label">Chest / Bust ({unit})</label>
                <input
                  id="ob-chest"
                  type="number"
                  step="0.5"
                  className="editorial-input"
                  value={measurements.chest}
                  onChange={(e) => setMeasurements({ ...measurements, chest: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label htmlFor="ob-waist" className="input-label">Natural Waist ({unit})</label>
                <input
                  id="ob-waist"
                  type="number"
                  step="0.5"
                  className="editorial-input"
                  value={measurements.waist}
                  onChange={(e) => setMeasurements({ ...measurements, waist: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label htmlFor="ob-hips" className="input-label">Hips ({unit})</label>
                <input
                  id="ob-hips"
                  type="number"
                  step="0.5"
                  className="editorial-input"
                  value={measurements.hips}
                  onChange={(e) => setMeasurements({ ...measurements, hips: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-actions-footer" style={{ justifyContent: 'space-between' }}>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="btn-editorial-ghost"
              >
                <ArrowLeft size={15} />
                <span>Back</span>
              </button>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleFinish(true)}
                  className="btn-editorial-secondary"
                >
                  Skip Measurements & Finish
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleFinish(false)}
                  className="btn-editorial-primary"
                >
                  <Sparkles size={15} />
                  <span>{isSubmitting ? 'Calibrating...' : 'Complete Studio Calibration'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
