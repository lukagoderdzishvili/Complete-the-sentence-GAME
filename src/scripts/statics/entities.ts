export interface GameData {
    list: QuestionConfig[]
}

export interface QuestionConfig {
    value: string;
    answers: string[];
    correctAnswer: string
}