/* eslint-disable @typescript-eslint/no-explicit-any */
export const validateStep = async (
  step: string,
  basicForm: any,
  advancedForm: any
): Promise<boolean> => {
  switch (step) {
    case 'basic':
      return await basicForm.trigger();
    case 'advanced':
      return await advancedForm.trigger();
    default:
      return true;
  }
};

export const getNextStep = (currentStep: string): string => {
  const steps = ['basic', 'advanced', 'curriculum', 'publish'];
  const currentIndex = steps.indexOf(currentStep);
  return currentIndex < steps.length - 1 ? steps[currentIndex + 1] : currentStep;
};

export const getPreviousStep = (currentStep: string): string => {
  const steps = ['basic', 'advanced', 'curriculum', 'publish'];
  const currentIndex = steps.indexOf(currentStep);
  return currentIndex > 0 ? steps[currentIndex - 1] : currentStep;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const isValidImageType = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return validTypes.includes(file.type);
};

export const isValidVideoType = (file: File): boolean => {
  const validTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'];
  return validTypes.includes(file.type);
};
