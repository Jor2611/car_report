import { Roles } from "../src/account/roles.enum";

export const mockAccount = {
  id: 1,
  fakeId: 123456789, 
  email:'test@test.com',
  updatedEmail: 'updated@test.com', 
  password: 'asd123', 
  updatedPassword: 'updated123',
  role:Roles.Admin,
  updatedRole: Roles.User,
  token: 'thisistoken'
};

export const mockReport = {
  id: 1,
  approved:false,
  make: 'Audi',
  model: 'E-tron',
  year: 2020,
  mileage: 2500,
  lng: 30.986039,
  lat: -10.568199,
  price: 120000
};