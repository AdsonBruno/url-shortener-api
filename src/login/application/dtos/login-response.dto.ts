export class LoginResponseDto {
  success: boolean;
  user: {
    id: string;
    email: string;
  };
  accessToken: string;
  message?: string;
}
