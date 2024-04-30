export interface GameData {
    list: QuestionConfig[]
}

export interface QuestionConfig {
    value: string;
    answers: string[];
    correctAnswer: string
}

export interface AnswerConfig{
    size: {
        width: number,
        height: number
    };
    value: string;
    position: {
        x: number,
        y: number
    }
}
