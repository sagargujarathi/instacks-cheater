import { KEY_TYPES } from "@/constants";

export interface IStorageType {
  [KEY_TYPES.GENERATE_KEY]: string;
  [KEY_TYPES.AUTO_SELECT_KEY]: string;
  [KEY_TYPES.SECRET_KEY]: string;
  [KEY_TYPES.AI_PROVIDER]: string;
}

interface IExamDetailsType {
  id: string;
  name: string;
  duration: number;
  exam_type: string;
  cutoff_type: string;
  is_linear: number;
  proctoring: number;
  restrict_tab_switch: number;
  tab_switch_count: number;
  tab_switch_warning: number;
  duration_left: number;
}

interface Option {
  id: string;
  option: string;
}

interface Question {
  id: string;
  type: string;
  positive_mark: number;
  negative_mark: number;
  options: Option[];
  question_type: string;
  student_answer: string | null;
  time_spent: number;
  marked_for_review: boolean | null;
  chapter_id: string;
  paragraph_id: string | null;
  difficulty: string;
  reference: string;
  question: string;
  question_image: string | null;
  num_options: number;
  option_1: string | null;
  option_1_image: string | null;
  option_1_partial: string | null;
  option_2: string | null;
  option_2_image: string | null;
  option_2_partial: string | null;
  option_3: string | null;
  option_3_image: string | null;
  option_3_partial: string | null;
  option_4: string | null;
  option_4_image: string | null;
  option_4_partial: string | null;
  option_5: string | null;
  option_5_image: string | null;
  option_5_partial: string | null;
  explanation: string;
  explanation_image: string | null;
  user_id: string;
  user_role: string;
  verified_by: string | null;
  verify_role: string | null;
  verified: number;
  verified_difficulty: string | null;
  created_at: string;
  updated_at: string;
}

interface IExamModalType {
  id: string;
  model_name: string;
  ques_count: number;
  duration: number;
  questions: Question[];
}

interface IStudentExamType {
  attempt_id: string;
  exam_id: string;
  exam_name: string;
  status: string;
  current_model: string | null;
  current_question: string | null;
  proctoring: number;
  tab_switch: number;
}

export interface IGetExamDetailsAPIResponseType {
  exam_details: IExamDetailsType;
  exam_models: IExamModalType[];
  student_exam: IStudentExamType;
}

export interface IQuestionData {
  question: string;
  questionImage: string;
  options: {
    option: string;
    id: string;
    optionImage: string;
    optionImagePartial: string;
  }[];
  explanation: string;
  explanationImage: string;
}

export interface IPromptDetails {
  isGenerated: boolean;
  isGenerating: boolean;
  questionNumber: number;
  optionId: string;
  section: string;
}
