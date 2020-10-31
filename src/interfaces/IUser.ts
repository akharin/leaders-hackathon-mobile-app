import ICompany from "./ICompany";
// import IPermission from './IPermission';
import IUserShort from "./IUserShort";

export const enum UserRoleScopes {
  ALL = "all",
  COMPANY = "company",
  OBJECT = "object",
}

// export interface IUserRole {
// 	roleId: string;
// 	roleName: string;
// 	scopeIds: string[];
// 	scope: UserRoleScopes;
// 	permissions?: IPermission[];
// }

export default interface IUser {
  id: string;
  phone: string;
  name: string;
  surname: string;
  patronymic: string;
  email?: string;
  companies?: ICompany[];
  position?: string;
  createdAt?: Date | string;
  createdBy?: IUserShort;
  modifiedAt?: Date | string;
  modifiedBy?: IUserShort;
  activated?: boolean;
  deleted?: boolean;
}
