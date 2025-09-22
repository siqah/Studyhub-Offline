import React from 'react'

export type Question = {
    id: string
    title: string
}

export type QuestionsListProps = {
    questions: Question[]
    onSelect: (question: Question) => void
    selectedId?: string | null
    className?: string
}

const QuestionsListComponent: React.FC<QuestionsListProps> = ({ questions, onSelect, selectedId, className }) => {
    if (!questions || questions.length === 0) {
        return <div className={className}>No questions available.</div>
    }

    return (
        <ul className={className} style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {questions.map((q, i) => {
                const isSelected = q.id === selectedId
                return (
                    <li key={q.id} style={{ marginBottom: 8 }}>
                        <button
                            type="button"
                            onClick={() => onSelect(q)}
                            data-testid={`question-${q.id}`}
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                padding: '8px 12px',
                                borderRadius: 6,
                                border: `1px solid ${isSelected ? '#2563eb' : '#ddd'}`,
                                background: isSelected ? '#eff6ff' : '#fff',
                                cursor: 'pointer',
                            }}
                            aria-pressed={isSelected}
                        >
                            {i + 1}. {q.title}
                        </button>
                    </li>
                )
            })}
        </ul>
    )
}

const QuestionsList = React.memo(QuestionsListComponent)
export default QuestionsList
