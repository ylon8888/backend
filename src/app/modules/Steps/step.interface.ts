export interface IStepOne {
  stepName: string;
  stepDescription: string;
  stepVideo: string;
}

export interface IStepTwo {
  podcastName: string;
  podcastVideo: string[];
}

export interface IStepFive {
  stepName: string;
  stepVideo: string;
  questionAnswer: string[];
}


export interface IStepEight{
    questionType: string;
    questionDescription: string;
}
