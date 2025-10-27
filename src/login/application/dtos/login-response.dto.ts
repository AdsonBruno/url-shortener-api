export class LoginResponseDto {
  success: boolean;
  user: {
    id: string;
    email: string;
  };
  message?: string;
}
