export const SEMESTER = '2026-1' as const

export const SUBJECTS = [
    'Математика',
    'Физика',
    'Программирование',
    'Ағылшын тілі',
    'История',
] as const

export type Subject = (typeof SUBJECTS)[number]

export const GROUPS = ['IT-21', 'IT-22'] as const
export type Group = (typeof GROUPS)[number]
