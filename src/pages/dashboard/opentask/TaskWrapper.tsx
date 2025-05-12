// PENDING

import React, { useMemo, useEffect, useRef } from "react";
import { SurveyModel } from "survey-core";
import { Survey } from "survey-react-ui";

interface TaskWrapperProps {
  taskData: any;
  t: (key: string) => string;
  isInside: boolean;
  onComplete: (data: any) => void;
}

function TaskWrapper({ taskData, t, isInside, onComplete }: TaskWrapperProps) {
  const surveyModelRef = useRef<SurveyModel | null>(null);

  // Crear el SurveyModel solo una vez
  if (!surveyModelRef.current) {
    surveyModelRef.current = new SurveyModel({
      ...taskData,
      completeText: t("Submit"),
    });
  }

  const surveyModel = surveyModelRef.current;

  // Solo actualiza las clases CSS cuando cambia `isInside`
  useEffect(() => {
    surveyModel.onUpdateQuestionCssClasses = (_, options) => {
      if (options.cssClasses.navigation) {
        options.cssClasses.navigation += isInside
          ? ""
          : " opacity-50 pointer-events-none";
      }
    };
  }, [isInside, surveyModel]);

  return (
    <Survey
      model={surveyModel}
      onComplete={() => {
        onComplete(surveyModel.data);
      }}
      renderCompleted={() => (
        <div className="bg-green-100 text-green-800 p-4 rounded-lg">
          <p>{t("Thank you for completing the task!")}</p>
        </div>
      )}
    />
  );
}

export default React.memo(TaskWrapper);
