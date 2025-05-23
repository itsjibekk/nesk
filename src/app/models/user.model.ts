export interface Role {
  id: number;
  name?: string;
}

export interface User {
  id?: number;
  login?: string;
  firstName?: string;
  lastName?: string;
  status?: string;
  password?: string; // Add this
  roles?: Role[];
  createdOn?: undefined,

}
