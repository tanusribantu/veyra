import React, { useState, useEffect } from 'react'
import { X, ArrowRight, ArrowLeft, Check, Sparkles, RefreshCw, Compass } from 'lucide-react'
import { api } from '../services/api'
import { useToast } from './Toast'

/**
 * Fallback questions if backend is initializing or offline.
 * Matches backend backend/app/recommendation/quiz_config.py exactly.
 */
const FALLBACK_QUESTIONS = [
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

/**
 * 5-Dimension Continuous Style Vector Chart
 */
export function StyleDimensionChart({ vector = {} }) {
  const dimensions = [
    {
      key: 'classic_expressive',
      left: 'Classic / Heritage',
      right: 'Expressive / Avant-Garde',
      val: vector.classic_expressive ?? 0.5,
    },
    {
      key: 'comfort_polish',
      left: 'Comfort / Ease',
      right: 'Polish / Tailored',
      val: vector.comfort_polish ?? 0.5,
    },
    {
      key: 'subtle_bold',
      left: 'Subtle / Tonal',
      right: 'Bold / High-Contrast',
      val: vector.subtle_bold ?? 0.5,
    },
    {
      key: 'timeless_trend',
      left: 'Timeless / Capsule',
      right: 'Trend / Contemporary',
      val: vector.timeless_trend ?? 0.5,
    },
    {
      key: 'structured_relaxed',
      left: 'Structured / Crisp',
      right: 'Relaxed / Fluid Drape',
      val: vector.structured_relaxed ?? 0.5,
    },
  ]

  return (
    <div className="dimension-chart-grid">
      {dimensions.map((dim) => {
        const pct = Math.round((dim.val ?? 0.5) * 100)
        return (
          <div key={dim.key} className="dimension-row">
            <div className="dimension-labels">
              <span className={`dim-pole ${pct < 45 ? 'is-dominant' : ''}`}>{dim.left}</span>
              <span className="dim-pct">{pct}%</span>
              <span className={`dim-pole ${pct > 55 ? 'is-dominant' : ''}`}>{dim.right}</span>
            </div>
            <div className="dimension-track">
              <div
                className="dimension-fill"
                style={{ width: `${pct}%` }}
              />
              <div
                className="dimension-marker"
                style={{ left: `calc(${pct}% - 6px)` }}
                title={`${pct}%`}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function StyleQuizModal({
  isOpen,
  onClose,
  onComplete,
  initialResult = null,
}) {
  const { addToast } = useToast()
  const [questions, setQuestions] = useState(FALLBACK_QUESTIONS)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [quizResult, setQuizResult] = useState(initialResult)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (initialResult) {
        setQuizResult(initialResult)
      } else {
        loadQuestions()
      }
    }
  }, [isOpen, initialResult])

  const loadQuestions = async () => {
    setIsLoadingQuestions(true)
    try {
      const data = await api.getQuizQuestions()
      if (data && data.questions && data.questions.length > 0) {
        setQuestions(data.questions)
      }
    } catch {
      // Fallback questions already in state
    } finally {
      setIsLoadingQuestions(false)
    }
  }

  if (!isOpen) return null

  const currentQ = questions[currentIndex] || questions[0]
  const totalQuestions = questions.length
  const progressPct = Math.round(((currentIndex + 1) / totalQuestions) * 100)

  const handleSelectOption = (optionId) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionId,
    }))
  }

  const handleNext = async () => {
    if (!answers[currentQ.id]) {
      addToast('Please select a response to continue.', 'error')
      return
    }

    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      // Final question: submit answers
      await handleSubmit()
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const result = await api.submitQuizAnswers(answers)
      setQuizResult(result)
      addToast('Your style archetype has been calibrated.', 'success')
      if (onComplete) onComplete(result)
    } catch (err) {
      addToast(err.message || 'Could not score quiz answers.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRetake = () => {
    setQuizResult(null)
    setAnswers({})
    setCurrentIndex(0)
  }

  return (
    <div className="modal-backdrop animate-fade-in-up" role="dialog" aria-modal="true" aria-labelledby="quiz-modal-title">
      <div className="modal-container editorial-modal quiz-modal-container" style={{ maxWidth: '780px' }}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <span className="eyebrow">
              {quizResult ? 'STYLE ARCHETYPE PROFILE' : `STYLE ARCHETYPE QUIZ &bull; SCENARIO ${String(currentIndex + 1).padStart(2, '0')} OF ${String(totalQuestions).padStart(2, '0')}`}
            </span>
            <h2 id="quiz-modal-title" className="modal-title">
              {quizResult ? 'Your Sartorial Archetype' : currentQ.scenario}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="modal-close-btn" aria-label="Close quiz">
            <X size={20} />
          </button>
        </div>

        {/* Content: Quiz In-Progress OR Result View */}
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

            <div className="dimension-section">
              <div className="dimension-section-header">
                <span className="eyebrow">FIVE-DIMENSION STYLE VECTOR</span>
                <h4>Continuous Aesthetic Blueprint</h4>
                <p className="section-desc" style={{ marginBottom: '1.25rem' }}>
                  Veyra weights outfit compatibility against these 5 spectrum poles, balancing heritage formality with expressive tactile ease.
                </p>
              </div>

              <StyleDimensionChart vector={quizResult.vector} />
            </div>

            <div className="modal-actions-footer" style={{ justifyContent: 'space-between', marginTop: '2rem' }}>
              <button
                type="button"
                onClick={handleRetake}
                className="btn-editorial-ghost"
              >
                <RefreshCw size={14} />
                <span>Retake Quiz</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="btn-editorial-primary"
              >
                <Check size={15} />
                <span>Apply to Studio Profile</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="quiz-in-progress animate-fade-in-up">
            {/* Elegant Progress Bar */}
            <div className="quiz-progress-track">
              <div className="quiz-progress-bar" style={{ width: `${progressPct}%` }} />
            </div>

            <p className="quiz-question-prompt">{currentQ.question}</p>

            {/* Option Cards */}
            <div className="quiz-options-list">
              {currentQ.options.map((opt) => {
                const isSelected = answers[currentQ.id] === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    className={`quiz-option-card ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => handleSelectOption(opt.id)}
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

            {/* Footer Navigation */}
            <div className="modal-actions-footer" style={{ justifyContent: 'space-between', marginTop: '1.75rem' }}>
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0 || isSubmitting}
                className="btn-editorial-ghost"
              >
                <ArrowLeft size={15} />
                <span>Previous</span>
              </button>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <span className="quiz-step-indicator">
                  {currentIndex + 1} / {totalQuestions}
                </span>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!answers[currentQ.id] || isSubmitting}
                  className="btn-editorial-primary"
                >
                  <span>
                    {currentIndex === totalQuestions - 1
                      ? isSubmitting
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
    </div>
  )
}
