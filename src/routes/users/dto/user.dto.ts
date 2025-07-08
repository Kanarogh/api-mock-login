export class UserDto {
  id: number;
  email: string;
  nome: string;


  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial);
  }
}
