import { Entity } from "./offline/entity"

export interface User extends Entity{
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