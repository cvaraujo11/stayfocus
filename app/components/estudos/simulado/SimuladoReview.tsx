'use client';

import React from 'react';
import { useSimuladoStore } from '@/app/stores/simuladoStore';
import { Button } from '@/app/components/ui/Button';
import { Card } from '@/app/components/ui/Card';
import { LoadingSpinner } from '@/app/components/common/LoadingSpinner';
import { ErrorMessage } from '@/app/components/common/ErrorMessage';
import { cn } from '@/app/lib/utils';

const SimuladoReview: React.FC = () => {
  const {
    simuladoData,
    currentQuestionIndex,
    userAnswers,
    selectAnswer,
    nextQuestion,
    prevQuestion,
    finishReview,
    loading,
    error,
  } = useSimuladoStore();

  // Show loading state
  if (loading) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <Card className="mb-4" title="Carregando...">
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <Card className="mb-4" title="Erro">
          <ErrorMessage message={error} />
        </Card>
      </div>
    );
  }

  if (!simuladoData) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <Card className="mb-4" title="Erro">
          <ErrorMessage message="Nenhum simulado carregado." />
        </Card>
      </div>
    );
  }

  const currentQuestion = simuladoData.questoes[currentQuestionIndex];
  const totalQuestoes = simuladoData.questoes.length;
  const isLastQuestion = currentQuestionIndex === totalQuestoes - 1;
  const userAnswer = userAnswers[currentQuestion.id];

  const handleSelectAnswer = (alternativeKey: string) => {
    selectAnswer(currentQuestion.id, alternativeKey);
  };

  const cardTitle = `Questão ${currentQuestionIndex + 1} de ${totalQuestoes}`;

  // Reconstruindo a estrutura JSX para garantir a correção
  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Card para exibir a questão */}
      <Card className="mb-4" title={cardTitle}>
        <p className="mb-6 whitespace-pre-wrap">{currentQuestion.enunciado}</p>
        <div className="space-y-3">
          {Object.entries(currentQuestion.alternativas).map(([key, text]) => (
            <Button
              key={key}
              variant={userAnswer === key ? 'default' : 'outline'}
              onClick={() => handleSelectAnswer(key)}
              className={cn(
                'w-full justify-start text-left h-auto py-3',
                userAnswer === key ? 'ring-2 ring-primary ring-offset-2' : ''
              )}
            >
              <span className="font-bold mr-2">{key.toUpperCase()})</span>
              <span className="whitespace-pre-wrap">{text}</span>
            </Button>
          ))}
        </div>
      </Card>

      {/* Div para os botões de navegação */}
      <div className="flex justify-between mt-4">
        <Button
          onClick={prevQuestion}
          disabled={currentQuestionIndex === 0}
          variant="outline"
        >
          Anterior
        </Button>
        {isLastQuestion ? (
          <Button onClick={finishReview} disabled={!userAnswer}>
            Finalizar Conferência
          </Button>
        ) : (
          <Button onClick={nextQuestion} disabled={!userAnswer}>
            Próxima
          </Button>
        )}
      </div>
    </div>
  );
};

export default SimuladoReview;
