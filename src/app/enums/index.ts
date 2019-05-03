export enum TIMEFRAME {
    today,
    week,
    month,
    year,
    day
}

export enum ITEM_TYPE {
    expense,
    income
}

export enum RECURRING_OPTIONS {
    daily = 'Day',
    weekly = 'Week',
    biWeekly = "2 Weeks",
    monthly = 'Month',
    quarterly = '3 Months',
    yearly = 'Year'
}

export enum EventBusListeners {
    DateFormatChanged = <any>'date-format:changed',
    CurrencyChanged = <any>'currency:changed',
    BudgetSettingsChanged = <any>'budget-settings:changed'
}