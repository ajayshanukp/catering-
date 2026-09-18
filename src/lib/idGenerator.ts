import { BoyCategory } from '../types';

export function generateOfficialBoyId(sequenceNumber: number, category: BoyCategory): string {
  return `BOY-${sequenceNumber.toString().padStart(4, '0')}-${category}`;
}

export function updateBoyIdCategory(currentOfficialId: string, newCategory: BoyCategory): string {
  if (currentOfficialId.startsWith('BOY-')) {
    const parts = currentOfficialId.split('-');
    if (parts.length >= 2) {
      return `${parts[0]}-${parts[1]}-${newCategory}`;
    }
  }
  return currentOfficialId;
}

export function generateOfficialCaptainId(sequenceNumber: number): string {
  return `CPT-${sequenceNumber.toString().padStart(3, '0')}`;
}
