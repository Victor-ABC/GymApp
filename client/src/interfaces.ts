export interface User {
    name: string,
    email: string,
    isTrainer: boolean,
    avatar: string,
    id: string
}  

export interface Exercise {
    name: string,
    description: string,
    prictures: string[]
}