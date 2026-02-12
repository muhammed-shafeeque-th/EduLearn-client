'use client';

import React, { useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { useInstructorRegister } from '../hooks';
import { steps } from '../constants';
import PersonalForm from './personal-form';
import ProfessionalForm from './professional-form';
import AgreementForm from './agreement-form';

type StepsType = typeof steps;

// Extracted for reuse and to keep render clean
function StepIndicator({ steps, currentStep }: { steps: StepsType; currentStep: number }) {
  return (
    <div className="flex justify-between items-center">
      {steps.map((step) => {
        const isActive = step.id === currentStep;
        const isCompleted = step.id < currentStep;
        // const isUpcoming = step.id > currentStep;

        return (
          <div
            key={step.id}
            className={`flex flex-col items-center space-y-1 ${
              isActive || isCompleted ? 'text-primary dark:text-white' : 'text-gray-400'
            }`}
          >
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                ${isCompleted || isActive ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'}
              `}
            >
              {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step.id}
            </div>
            <div className="text-xs text-center">
              <div className="font-medium">{step.title}</div>
              <div className="text-gray-400 hidden sm:block">{step.description}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function InstructorRegistrationForm() {
  const {
    isSubmitting,
    nextStep,
    onSubmit,
    personalForm,
    prevStep,
    professionalForm,
    progress,
    currentStep,
    agreementForm,
  } = useInstructorRegister();

  const renderStepContent = useCallback(() => {
    switch (currentStep) {
      case 1:
        return <PersonalForm personalForm={personalForm} />;
      case 2:
        return <ProfessionalForm professionalForm={professionalForm} />;
      case 3:
        return <AgreementForm agreementForm={agreementForm} />;
      default:
        return null;
    }
  }, [currentStep, personalForm, professionalForm, agreementForm]);

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader className="text-center space-y-4">
        <CardTitle className="text-2xl font-bold">Join as an Instructor</CardTitle>
        <CardDescription>
          Start your teaching journey with EduLearn and inspire students worldwide
        </CardDescription>
        {/* Progress bar */}
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>
              Step {currentStep} of {steps.length}
            </span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </div>
        {/* Step indicators */}
        <StepIndicator steps={steps} currentStep={currentStep} />
      </CardHeader>
      <CardContent className="space-y-6">
        <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
            aria-label="Previous Step"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>
          {currentStep < steps.length ? (
            <Button
              type="button"
              onClick={nextStep}
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-primary/90 hover:bg-primary dark:text-white"
              aria-label="Next Step"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-primary/80 hover:bg-primary"
              aria-label="Complete Registration"
            >
              {isSubmitting ? (
                <>
                  <div
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                    aria-label="Submitting"
                  />
                  Submitting...
                </>
              ) : (
                <>
                  Complete Registration
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
