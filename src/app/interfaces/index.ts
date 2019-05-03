export interface IDateRange{
    startDate: any;
    endDate: any;
    timeFrameIndex: number;
}

export interface IIdValue{
    id: number;
    value: string;
}
export interface ICashItem {
    id: string;
    description: string;
    category: string;
    amount: number;
    customRepeatVal: number;
    repeats: string;
    notes: string;
    date: any;
    type: number;
    displayDate: string;
    isPast: boolean;
}

export interface ICategoryBudgetItem {
    category: string;
    timespan: string;
    budget: number;
  }
  export interface IBudgetSettings {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
    categoryBudgetItems : Array<ICategoryBudgetItem>;
  }