export interface Role {
  id: number;
  name?: string;
}

export interface User {
  id?: undefined;
  login?: string;
  firstName?: string;
  lastName?: string;
  status?: string;
  password?: string; // Add this
  roles?: Role[];
  createdOn?: undefined,

}
