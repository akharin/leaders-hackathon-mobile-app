import IUserShort from "./IUserShort";
import IUser from "./IUser";

interface ICompany {
  id: string;
  name: string;
  createdAt?: string;
  createdBy?: IUserShort;
  modifiedAt?: string;
  modifiedBy?: IUserShort;
}

export default ICompany;
