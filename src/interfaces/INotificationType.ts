type INotificationMessageSettingType = "intervals";
type INotificationMessageFieldType =
  | "string"
  | "shortDate"
  | "problemsCount"
  | "duration";

interface INotificationType {
  id: string;
  name: string;
  titleTemplate: string;
  messageTemplate: string;
  messageHtmlTemplate: string;
  availableForPages: string[];
  availableParams: string[];
  availableSettings?: Array<{
    key: string;
    name: string;
    type?: INotificationMessageSettingType;
  }>;
  availableFields?: Array<{
    key: string;
    type?: INotificationMessageFieldType;
  }>;
}

export type { INotificationMessageSettingType, INotificationMessageFieldType };
export default INotificationType;
