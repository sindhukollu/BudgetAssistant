import { RECURRING_OPTIONS } from '../enums';
export const recurringOptions = [
  { id: 1, repeatVal: 1, value: RECURRING_OPTIONS.daily },
  { id: 2, repeatVal: 1, value: RECURRING_OPTIONS.weekly},
  { id: 3, repeatVal: 2, value: RECURRING_OPTIONS.biWeekly},
  { id: 4, repeatVal: 1, value: RECURRING_OPTIONS.monthly},
  { id: 5, repeatVal: 3, value: RECURRING_OPTIONS.quarterly},
  { id: 6, repeatVal: 1, value: RECURRING_OPTIONS.yearly},
  { id: 7, repeatVal: 0, value: 'None'}
];

export const expenseCategories = [
  { id: 1, value: 'Food'},
  { id: 2, value: 'Grocery'},
  { id: 3, value: 'Bills'},
  { id: 4, value: 'Insurance'},
  { id: 5, value: 'Loan'},
  { id: 6, value: 'Car/Motor'},
  { id: 7, value: 'Entertainment'},
  { id: 8, value: 'Clothes'},
  { id: 9, value: 'House Hold'},
  { id: 10, value: 'Vacation'},
  { id: 11, value: 'Education'},
  { id: 12, value: 'Investment'},
  { id: 13, value: 'Health'},
  { id: 14, value: 'Education'},
  { id: 15, value: 'Others'}
]

export const incomeCategories = [
  { id: 1, value: 'Salary'},
  { id: 2, value: 'Investment'},
  { id: 3, value: 'Rents'},
  { id: 4, value: 'Paid Back'},
  { id: 5, value: 'Others'},
]
