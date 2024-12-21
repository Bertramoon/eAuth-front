
export interface PageQuery {
    page?: number,
    per_page?: number
}

export interface IdList {
    ids: Array<number>
}

export interface Option {
    prop: string,
    label: string,
    minWidth: number,
    sortable: boolean,
    showOverflowTooltip: boolean
}

export interface ServiceItem {
    value: string
}