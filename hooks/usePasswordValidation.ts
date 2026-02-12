import { useCallback } from 'react';

interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export const usePasswordValidation = (t: (key: string) => string) => {
  const validatePassword = useCallback(
    (
      password: string,
      confirmPassword?: string
    ): PasswordValidationResult => {
      const errors: string[] = [];

      // Check password length
      if (password.length < 8) {
        errors.push(t('passwordMustBeAtLeast8Characters'));
      }

      // Check for uppercase or number
      if (!/[A-Z]/.test(password) && !/[0-9]/.test(password)) {
        errors.push(t('passwordMustIncludeNumberOrUppercase'));
      }

      // Check password confirmation match
      if (confirmPassword !== undefined && password !== confirmPassword) {
        errors.push(t('passwordsDontMatch'));
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    },
    [t]
  );

  return { validatePassword };
};
