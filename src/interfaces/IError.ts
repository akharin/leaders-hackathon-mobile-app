import { StatusCode } from "../enums/StatusCode";
import { HttpStatus } from "../enums/HttpStatus";

interface IError {
  /**
   * @deprecated
   */
  code: number;
  statusCode: StatusCode | HttpStatus;
  error: string;
  message: string;
  payload?: { [key: string]: any };
}

export default IError;
